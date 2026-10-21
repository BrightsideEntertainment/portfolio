# Portfolio Thomas Häder

> IM5 Ateliersemester · FHGR Multimedia Production · HS26
> Live: **https://DEINE-SUBDOMAIN.ch** <!-- anpassen -->

## Projektidee

Eine persönliche Portfolio-Website, die meine Arbeit mit Brightside Entertainment zeigt: Film, Audio, Branding, Podcast und Moderation. Die Projekte werden nicht fix ins HTML geschrieben, sondern aus einer Datenbank geladen und über einen eigenen, geschützten Admin-Bereich gepflegt.

**Fragestellung:** Wie präsentiere ich ein breites, medienübergreifendes Portfolio so, dass Besuchende schnell finden, was sie interessiert – und ich die Inhalte selbst einfach aktuell halten kann?

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
| Frontend  | HTML, CSS, JavaScript (fetch API)   |
| Backend   | PHP 8 (PDO, Sessions)               |
| Datenbank | MySQL/MariaDB (Hostpoint)           |
| API       | oEmbed (YouTube / Vimeo / Spotify)  |
| Deploy    | GitHub Actions → FTPS → Hostpoint   |

## Struktur

```
.github/workflows/deploy.yml   Automatischer Deploy bei Push auf main
db/schema.sql                  Datenbankschema
docs/                          Projektplan, Screenshots, Reflexion
public/                        Alles, was auf den Server kommt
  ├─ index.html
  ├─ assets/ (css, js, img)
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
6. Push auf `main` → Seite wird automatisch deployed

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
