# Portfolio Thomas Häder

> IM5 Ateliersemester · FHGR Multimedia Production · HS26
> Live: **https://thomas.haeder.asolucim.myhostpoint.ch**

## Projektidee

Eine persönliche Portfolio-Website für meine Arbeit als Moderator, Podcast-Produzent und Filmer. Die Projekte werden nicht fix ins HTML geschrieben, sondern aus einer Datenbank geladen und über einen eigenen, geschützten Admin-Bereich gepflegt.

**Fragestellung:** Wie präsentiere ich ein breites, medienübergreifendes Portfolio so, dass Besuchende schnell finden, was sie interessiert – und ich die Inhalte selbst einfach aktuell halten kann?

## Gestaltungskonzept: «Der Gastgeber, hörbar»

Ich habe lange als Butler und Sommelier gearbeitet, heute moderiere und produziere ich. Der rote Faden ist das Empfangen und Führen von Menschen. Die Seite übersetzt das so:

- **Die Stimme schreibt den Satz (Signatur):** Im Hero liest meine Stimme «Ich gebe Momenten eine Stimme.» vor. Jedes Wort wird beim Sprechen dunkel, das aktuelle steht kursiv in Messing. Ein Klick auf ein Wort springt an diese Stelle. Technik: GSAP SplitText zerlegt den Satz, `gsap.ticker` koppelt ihn an `audio.currentTime`, wortgenaue Zeitmarken kommen aus `assets/audio/stimme.vtt` (WebVTT, mit WhisperX erzeugt). Ohne Aufnahme läuft der Satz im selben Takt zum Mitlesen.
- **Arbeiten:** Karten mit Standbild; bei Hover (Handy: wenn die Karte im Bild ist) läuft ein stummer Clip (`data-clip`).
- **Seitenwechsel:** native Cross-Document View Transitions, ohne Bibliothek.
- **Scrollen:** Lenis für weiches Scrollen am Desktop, GSAP ScrollTrigger für Parallax (Bilder, Plakat-Schrift, Porträt) und das Zurücktreten des Hero. Überschriften steigen mit SplitText Zeile für Zeile aus einer Maske. SplitText ersetzt SplitType, weil es zu GSAP gehört und Screenreader berücksichtigt.
- **Typografie:** Instrument Serif mit Kursive für die Stimme, Geist für Text, Geist Mono für Timecodes. Alle Schriften lokal (nDSG).
- **Farbe:** Leinen `#f3efe9`, Tinte `#151311`, Akzent Messing `#8a5a1c` (Kontrast 5:1), Champagner `#e2c290` auf dunklem Grund.
- **Ruhig für alle:** `prefers-reduced-motion` schaltet Bewegung ab, das Wort-Highlight bleibt als Farbe. Player komplett per Tastatur (Button, Schieberegler), Screenreader lesen den ganzen Satz (`aria`-Option von SplitText).

Design in Figma: Seite «Startseite» (Desktop 1440, Handy 390, Interaktionen & Regeln).

## Features (geplant)

- [ ] Startseite mit Hero und ausgewählten Projekten
- [ ] Projektübersicht mit Filter nach Kategorie (JS, ohne Neuladen)
- [ ] Projekt-Detailseiten mit eingebetteten Medien (YouTube/Vimeo/Spotify via oEmbed-API)
- [ ] Kontaktformular mit Validierung, Speicherung in DB und Mail-Benachrichtigung
- [ ] Admin-Bereich mit Login: Projekte erstellen, bearbeiten, löschen (CRUD)
- [ ] Responsive Design, Barrierefreiheit (Kontraste, Tastaturbedienung)

## Technologien

| Bereich   | Technologie                         |
|-----------|-------------------------------------|
| Frontend  | HTML, CSS, JavaScript (fetch API), GSAP 3.13 + ScrollTrigger + SplitText, Lenis 1.3 (alles lokal) |
| Backend   | PHP 8 (PDO, Sessions)               |
| Datenbank | MySQL/MariaDB (Hostpoint)           |
| API       | oEmbed (YouTube / Vimeo / Spotify)  |
| Deploy    | GitHub Actions → FTPS → Hostpoint (main = live, staging = /staging/) |

## Struktur

```
.github/workflows/deploy.yml   Deploy der Live-Seite bei Push auf main
.github/workflows/deploy-staging.yml  Vorschau unter /staging/ bei Push auf staging
db/schema.sql                  Datenbankschema
docs/                          Projektplan, Screenshots, Reflexion
public/                        Alles, was auf den Server kommt
  ├─ index.html
  ├─ assets/ (css, js, img, fonts, lib, audio)
  ├─ includes/                 config.example.php, db.php
  ├─ admin/                    Geschützter Admin-Bereich
  ├─ api/                      JSON-Endpunkte für JS
  └─ uploads/                  Bilder (nicht im Repo)
```

## Setup

1. Repo klonen
2. `public/includes/config.example.php` kopieren → `config.php`, Zugangsdaten eintragen
3. `db/schema.sql` in phpMyAdmin (Hostpoint) importieren
4. `config.php` einmalig per FTP hochladen (wird vom Deploy ausgeschlossen)
5. GitHub Secrets setzen: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`
6. Arbeiten auf `staging` → Vorschau unter `/staging/`; Merge auf `main` → Live-Seite

## Screenshots

_Folgen im Laufe des Projekts (`docs/screenshots/`)._

## Learnings

_Wird laufend ergänzt._

## Schwierigkeiten

_Wird laufend ergänzt._

## Ressourcen

- [PHP PDO Dokumentation](https://www.php.net/manual/de/book.pdo.php)
- [MDN Web Docs](https://developer.mozilla.org/de/)
- [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [oEmbed](https://oembed.com/)
