/* Portfolio Thomas Häder – Interaktion
   Alles funktioniert auch ohne JavaScript; dieses Skript ergänzt nur.
   1. Die Stimme schreibt den Satz (GSAP SplitText + gsap.ticker an audio.currentTime)
   2. Arbeiten: stummer Clip bei Hover (Handy: wenn die Karte im Bild ist)
   3. Seitenwechsel: native View Transitions (nur CSS)                        */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Kopfzeile: Linie erst nach dem Scrollen ---------- */
  const head = document.querySelector('.site-head');
  if (head) {
    const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Einblenden: nur Elemente unterhalb des Sichtbereichs, nur einmal ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove('pending'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach((el, i) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('pending');
        el.style.transitionDelay = `${(i % 3) * 70}ms`;
        io.observe(el);
      }
    });
  }

  /* ---------- 1. Die Stimme schreibt den Satz ---------- */
  const hero = document.getElementById('stimme');
  if (hero) initVoice(hero);

  function initVoice(root) {
    const audio = root.querySelector('#stimme-audio');
    const btn = root.querySelector('.play');
    const seek = root.querySelector('.seek');
    const timeEl = root.querySelector('.voice-time');
    const labelEl = root.querySelector('.voice-label');
    const hasGsap = !!(window.gsap && window.SplitText);

    let words = [];            // [{el, t, end}]
    let duration = 10;
    let readAlong = false;     // ohne Aufnahme: der Satz läuft im selben Takt mit
    let clock = 0;             // Zeit im Mitlese-Modus
    let playing = false;
    let endTimer = 0;

    const fmt = (s) => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

    function noRecording() {
      if (readAlong) return;
      readAlong = true;
      labelEl.textContent = 'Mitlesen · Aufnahme folgt';
    }
    // Die Datei fehlt (noch)? Dann Mitlese-Modus.
    audio.addEventListener('error', noRecording);
    if (audio.error || audio.networkState === 3) noRecording();
    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration) && audio.duration > 0) { duration = audio.duration; seek.max = duration.toFixed(1); render(0); }
    });
    audio.addEventListener('ended', finish);

    function now() { return readAlong ? clock : audio.currentTime; }

    function render(t) {
      for (const w of words) {
        const done = t >= w.end;
        const cur = t >= w.t && !done;
        if (w.done !== done) { w.el.classList.toggle('is-done', done); w.done = done; }
        if (w.cur !== cur) { w.el.classList.toggle('is-now', cur); w.cur = cur; }
      }
      seek.value = t;
      seek.style.setProperty('--p', `${(t / duration) * 100}%`);
      seek.setAttribute('aria-valuetext', `${fmt(t)} von ${fmt(duration)}`);
      timeEl.textContent = `${fmt(t)} / ${fmt(duration)}`;
    }

    function tick(_, deltaMs) {
      if (!playing) return;
      if (readAlong) clock = Math.min(duration, clock + deltaMs / 1000);
      const t = now();
      render(t);
      if (readAlong && t >= duration) finish();
    }

    async function play() {
      clearTimeout(endTimer);
      root.classList.add('is-voiced', 'is-playing');
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Stimme anhalten');
      if (!readAlong) {
        try { await audio.play(); } catch (_) { noRecording(); }
      }
      if (readAlong && clock >= duration) clock = 0;
      playing = true;
    }
    function pause() {
      playing = false;
      if (!readAlong) audio.pause();
      root.classList.remove('is-playing');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Stimme abspielen');
    }
    function finish() {
      pause();
      render(duration);
      // Kurz stehen lassen, dann zurück in den Ruhezustand
      endTimer = setTimeout(() => {
        root.classList.remove('is-voiced');
        clock = 0;
        if (!readAlong) audio.currentTime = 0;
        render(0);
      }, 1400);
    }
    function seekTo(t, autoplay) {
      t = Math.max(0, Math.min(duration, t));
      clearTimeout(endTimer);
      root.classList.add('is-voiced');
      if (readAlong) clock = t; else if (audio.readyState > 0) audio.currentTime = t;
      render(t);
      if (autoplay && !playing) play();
    }

    btn.addEventListener('click', () => (playing ? pause() : play()));
    seek.addEventListener('input', () => seekTo(parseFloat(seek.value), false));

    // Wörter erst zerlegen, wenn die Schrift geladen ist (sonst falsche Breiten)
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(async () => {
      if (!hasGsap) { render(0); return; }
      gsap.registerPlugin(SplitText);
      const groups = [...root.querySelectorAll('[data-times]')];
      groups.forEach((el) => {
        const times = el.dataset.times.trim().split(/\s+/).map(Number);
        // aria: "auto" – Screenreader lesen den ganzen Satz, nicht einzelne Wörter
        const split = SplitText.create(el, { type: 'words', wordsClass: 'w', aria: 'auto' });
        split.words.forEach((w, i) => words.push({ el: w, t: times[i] ?? 0 }));
        if (el.matches('h1') && !reduceMotion) {
          gsap.from(split.words, { yPercent: 35, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.07, delay: 0.1 });
        }
      });

      // Wortgenaue Zeitmarken aus der WebVTT-Datei (z. B. mit WhisperX erzeugt) übernehmen
      try {
        const res = await fetch('assets/audio/stimme.vtt');
        if (res.ok) {
          const cues = parseVtt(await res.text());
          if (cues.length === words.length) cues.forEach((c, i) => { words[i].t = c.start; words[i].stop = c.end; });
        }
      } catch (_) { /* Zeitmarken aus dem HTML bleiben */ }

      words.sort((a, b) => a.t - b.t);
      words.forEach((w, i) => { w.end = words[i + 1] ? words[i + 1].t : (w.stop || w.t + 0.9); });

      // Klick auf ein Wort springt dorthin
      words.forEach((w) => w.el.addEventListener('click', () => seekTo(w.t, true)));
      gsap.ticker.add(tick);
      render(0);
    });

    // Fallback ohne GSAP: Fortschritt trotzdem anzeigen
    if (!hasGsap) {
      const loop = (ts) => { tick(null, 16); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  function parseVtt(text) {
    const toSec = (s) => s.split(':').reverse().reduce((acc, part, i) => acc + parseFloat(part.replace(',', '.')) * 60 ** i, 0);
    const cues = [];
    const re = /([\d:.,]+)\s+-->\s+([\d:.,]+)[^\n]*\n([^\n]+)/g;
    let m;
    while ((m = re.exec(text))) cues.push({ start: toSec(m[1]), end: toSec(m[2]), text: m[3].trim() });
    return cues;
  }

  /* ---------- 2. Arbeiten: stummer Clip statt Standbild ---------- */
  // Eine Karte mit data-clip="assets/clips/name.mp4" zeigt bei Hover einen stummen Clip.
  if (!reduceMotion) {
    const cards = [...document.querySelectorAll('.work[data-clip]')];
    const canHover = window.matchMedia('(hover: hover)').matches;
    const ensureVideo = (card) => {
      let v = card.querySelector('video');
      if (v) return v;
      v = document.createElement('video');
      Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'none', src: card.dataset.clip });
      v.setAttribute('aria-hidden', 'true');
      v.addEventListener('timeupdate', () => card.querySelector('.work-media').style.setProperty('--clip', `${(v.currentTime / v.duration) * 100 || 0}%`));
      card.querySelector('.work-media').prepend(v);
      return v;
    };
    const on = (card) => { const v = ensureVideo(card); v.play().then(() => card.classList.add('is-clip')).catch(() => {}); };
    const off = (card) => { const v = card.querySelector('video'); if (v) v.pause(); card.classList.remove('is-clip'); };
    if (canHover) {
      cards.forEach((c) => {
        c.addEventListener('mouseenter', () => on(c));
        c.addEventListener('mouseleave', () => off(c));
        c.addEventListener('focusin', () => on(c));
        c.addEventListener('focusout', () => off(c));
      });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => (e.intersectionRatio > 0.6 ? on(e.target) : off(e.target))), { threshold: [0, 0.6] });
      cards.forEach((c) => io.observe(c));
    }
  }

  /* ---------- Fotos: Lightbox mit Tastatur und Wischen ---------- */
  const lb = document.querySelector('.lightbox');
  if (lb && typeof lb.showModal === 'function') {
    const items = [...document.querySelectorAll('.photo-open')];
    const big = lb.querySelector('img');
    const cap = lb.querySelector('figcaption');
    const count = lb.querySelector('.lb-count');
    let idx = 0;
    const vt = (fn) => (!reduceMotion && document.startViewTransition ? document.startViewTransition(fn) : fn());
    const show = (i) => {
      idx = (i + items.length) % items.length;
      const img = items[idx].querySelector('img');
      big.src = img.dataset.full || img.currentSrc || img.src;
      big.alt = img.alt;
      cap.textContent = items[idx].parentElement.querySelector('.mono')?.textContent || '';
      count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };
    items.forEach((btn, i) => btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      img.style.viewTransitionName = 'foto';           // Bild «fliegt» aus dem Raster in die Grossansicht
      vt(() => { img.style.viewTransitionName = ''; show(i); lb.showModal(); });
    }));
    const close = () => {
      const img = items[idx].querySelector('img');
      vt(() => { lb.close(); img.style.viewTransitionName = 'foto'; });
      setTimeout(() => { img.style.viewTransitionName = ''; items[idx].focus(); }, 450);
    };
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
    let x0 = null;
    lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- Kontaktformular: prüfen und ohne Neuladen senden ---------- */
  const form = document.querySelector('.form');
  if (form) {
    const status = form.querySelector('.form-status');
    const send = form.querySelector('.send');
    const rules = {
      'f-name': (v) => v.trim().length >= 2 || 'Bitte geben Sie Ihren Namen an.',
      'f-email': (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Bitte prüfen Sie die E-Mail-Adresse.',
      'f-body': (v) => v.trim().length >= 10 || 'Erzählen Sie mir in ein paar Worten vom Anlass.',
    };
    const check = (id) => {
      const el = document.getElementById(id);
      const res = rules[id](el.value);
      const msg = res === true ? '' : res;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      el.setAttribute('aria-describedby', id + '-err');
      document.getElementById(id + '-err').textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach((id) => document.getElementById(id).addEventListener('blur', () => check(id)));

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const ok = Object.keys(rules).map(check).every(Boolean);
      if (!ok) { status.className = 'form-status bad'; status.textContent = 'Bitte ergänzen Sie die markierten Felder.'; return; }
      send.disabled = true; status.className = 'form-status'; status.textContent = 'Wird gesendet …';
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'Die Anfrage konnte nicht gesendet werden.');
        form.reset();
        status.className = 'form-status ok';
        status.textContent = 'Danke! Ihre Anfrage ist angekommen. Ich melde mich innert zwei Arbeitstagen.';
      } catch (err) {
        status.className = 'form-status bad';
        status.textContent = err.message + ' Bitte versuchen Sie es später nochmals.';
      } finally {
        send.disabled = false;
      }
    });
  }
})();
