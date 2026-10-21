# Aufnahme «Hören, wer ich bin»

Ziel: ca. 20 Sekunden, ruhig gesprochen. Die Datei kommt als `public/assets/audio/stimme.mp3` ins Repo.
Die Wellenform auf der Startseite wird automatisch aus der Aufnahme berechnet.

## Skript

> Grüezi, ich bin Thomas.
> Lange habe ich Gäste empfangen, als Butler und als Sommelier.
> Heute mache ich dasselbe mit Mikrofon und Kamera.
> Ich moderiere, produziere Podcasts und schneide Filme.
> Und frage mich jedes Mal: Wie fühlt sich dieser Moment für die Menschen an, die ihn erleben?

## Technik

- Mono, 44,1 kHz, MP3 mit 128 kbit/s (unter 400 KB)
- Kurze Stille am Anfang und Ende wegschneiden, Lautheit etwa −16 LUFS
- Nach der Aufnahme die Startzeiten der Sätze notieren und in `public/index.html` bei `data-t` eintragen, damit das Transkript im Takt mitläuft
