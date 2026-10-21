/* Portfolio Thomas Häder – Interaktion
   Alles funktioniert auch ohne JavaScript; dieses Skript ergänzt nur. */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Kopfzeile: Linie erst nach dem Scrollen ---------- */
  const head = document.getElementById('kopf');
  const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Einblenden: nur Elemente unterhalb des Sichtbereichs, nur einmal ---------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.remove('pending'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('pending');
        io.observe(el);
      }
    });
    // Sicherheitsnetz bei sehr schnellem Scrollen: alles oberhalb des unteren Rands zeigen
    const sweep = () => {
      document.querySelectorAll('.reveal.pending').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.remove('pending'); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
  }

  /* ---------- Filter: Kategorien aus den Projekten selbst ableiten ---------- */
  const list = document.querySelector('.projects');
  const filterBox = document.querySelector('.filters');
  const empty = document.querySelector('.empty');
  if (list && filterBox) {
    const items = [...list.querySelectorAll('.project')];
    const counts = items.reduce((acc, li) => {
      const c = li.dataset.cat; acc[c] = (acc[c] || 0) + 1; return acc;
    }, {});
    const cats = ['Alle', ...Object.keys(counts)];
    cats.forEach((cat, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.cat = cat;
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      const n = cat === 'Alle' ? items.length : counts[cat];
      b.innerHTML = `${cat}<span class="count">${n}</span>`;
      filterBox.appendChild(b);
    });
    filterBox.hidden = false;
    filterBox.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.chip');
      if (!btn) return;
      const cat = btn.dataset.cat;
      filterBox.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
      let shown = 0;
      items.forEach((li) => {
        const on = cat === 'Alle' || li.dataset.cat === cat;
        li.hidden = !on;
        if (on) { shown++; li.classList.remove('pending'); }
      });
      empty.hidden = shown > 0;
    });
  }

  /* ---------- Stimme: Wellenform + Transkript im Takt ---------- */
  const voice = document.getElementById('stimme');
  if (voice) {
    const btn = voice.querySelector('.play');
    const label = voice.querySelector('.play-label');
    const canvas = voice.querySelector('.wave');
    const timeEl = voice.querySelector('.voice-time');
    const audio = document.getElementById('stimme-audio');
    const lines = [...voice.querySelectorAll('.transcript span')];
    const ctx = canvas.getContext('2d');
    const BARS = 96;
    let duration = 20;
    let peaks = fallbackPeaks(BARS);
    let playing = false;
    let readAlong = false;   // Mitlesen ohne Aufnahme, falls noch keine Datei existiert
    let readStart = 0;
    let readOffset = 0;
    let raf = 0;

    // Gleichmässige Ersatz-Wellenform, bis die echte Aufnahme geladen ist
    function fallbackPeaks(n) {
      const out = [];
      for (let i = 0; i < n; i++) {
        const v = Math.abs(Math.sin(i * 0.37) * 0.55 + Math.sin(i * 0.11 + 1) * 0.35 + Math.sin(i * 1.7) * 0.1);
        out.push(0.18 + v * 0.75);
      }
      return out;
    }

    // Echte Spitzenwerte aus der Audiodatei berechnen (Web Audio API)
    async function loadRealPeaks() {
      try {
        const res = await fetch(audio.getAttribute('src'));
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = new AC();
        const decoded = await ac.decodeAudioData(buf);
        const data = decoded.getChannelData(0);
        const block = Math.floor(data.length / BARS);
        const raw = [];
        for (let i = 0; i < BARS; i++) {
          let sum = 0;
          for (let j = 0; j < block; j++) sum += Math.abs(data[i * block + j]);
          raw.push(sum / block);
        }
        const max = Math.max(...raw) || 1;
        peaks = raw.map((v) => 0.08 + (v / max) * 0.92);
        duration = decoded.duration;
        ac.close && ac.close();
        draw(0);
        setTime(0);
      } catch (_) { /* keine Aufnahme vorhanden: Ersatz-Wellenform bleibt */ }
    }

    function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

    function draw(progress) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const gap = 2;
      const bw = Math.max(1, (w - gap * (BARS - 1)) / BARS);
      const played = css('--wine'), rest = css('--line');
      peaks.forEach((p, i) => {
        const x = i * (bw + gap);
        const bh = Math.max(2, p * h);
        ctx.fillStyle = (i / BARS) < progress ? played : rest;
        ctx.fillRect(x, (h - bh) / 2, bw, bh);
      });
    }

    function fmt(s) { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
    function setTime(t) { timeEl.textContent = `${fmt(t)} / ${fmt(duration)}`; }

    function current() {
      return readAlong ? readOffset + (performance.now() - readStart) / 1000 : audio.currentTime;
    }

    function highlight(t) {
      lines.forEach((l, i) => {
        const start = parseFloat(l.dataset.t);
        const next = lines[i + 1] ? parseFloat(lines[i + 1].dataset.t) : duration;
        l.classList.toggle('is-now', t >= start && t < next);
        l.classList.toggle('is-done', t >= next);
      });
    }

    function tick() {
      const t = Math.min(current(), duration);
      draw(t / duration); setTime(t); highlight(t);
      if (t >= duration) { stop(true); return; }
      raf = requestAnimationFrame(tick);
    }

    function start() {
      playing = true;
      btn.setAttribute('aria-pressed', 'true');
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }
    function stop(ended) {
      playing = false;
      btn.setAttribute('aria-pressed', 'false');
      cancelAnimationFrame(raf);
      if (readAlong) readOffset = ended ? 0 : current();
      if (ended) { if (!readAlong) audio.currentTime = 0; draw(1); highlight(duration); }
    }

    btn.addEventListener('click', async () => {
      if (playing) { readAlong ? stop(false) : audio.pause(); return; }
      if (readAlong) { readStart = performance.now(); start(); return; }
      try {
        await audio.play();
      } catch (_) {
        // Noch keine Aufnahme: Transkript im gleichen Takt mitlesen
        readAlong = true;
        label.textContent = 'Mitlesen (Aufnahme folgt)';
        readStart = performance.now(); readOffset = 0;
        start();
      }
    });
    audio.addEventListener('play', start);
    audio.addEventListener('pause', () => stop(false));
    audio.addEventListener('ended', () => stop(true));
    audio.addEventListener('loadedmetadata', () => { if (isFinite(audio.duration)) duration = audio.duration; });

    // In der Wellenform springen
    canvas.addEventListener('click', (ev) => {
      const r = canvas.getBoundingClientRect();
      const t = ((ev.clientX - r.left) / r.width) * duration;
      if (readAlong) { readOffset = t; readStart = performance.now(); }
      else if (audio.readyState > 0) audio.currentTime = t;
      draw(t / duration); setTime(t); highlight(t);
    });

    window.addEventListener('resize', () => draw(current() / duration));
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => draw(current() / duration));
    draw(0); setTime(0);
    // Echte Wellenform erst laden, wenn die Stimme sichtbar wird
    if ('IntersectionObserver' in window) {
      const vo = new IntersectionObserver((e) => { if (e[0].isIntersecting) { loadRealPeaks(); vo.disconnect(); } });
      vo.observe(voice);
    } else { loadRealPeaks(); }
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
