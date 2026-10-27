# Aufnahme «Hören, wer ich bin»

Ziel: ca. 10 Sekunden, ruhig gesprochen. Die Datei kommt als `public/assets/audio/stimme.mp3` ins Repo.
Auf der Startseite leuchtet jedes Wort auf, während es gesprochen wird. Deshalb muss der Text genau so gesprochen werden, wie er auf der Seite steht.

## Skript (wörtlich)

> Ich gebe Momenten eine Stimme.
> *(kurze Pause)*
> Ich bin Thomas Häder, Moderator, Podcaster und Filmer in Chur.

## Technik

- Mono, 44,1 kHz, MP3 mit 128 kbit/s (unter 200 KB)
- Kurze Stille am Anfang und Ende wegschneiden, Lautheit etwa −16 LUFS

## Wortgenaue Zeitmarken

1. WhisperX installieren: `pip install whisperx`
2. `whisperx stimme.mp3 --language de --output_format json`
3. Aus der JSON-Datei pro Wort einen Cue in `public/assets/audio/stimme.vtt` schreiben (Start --> Ende, darunter das Wort).
   Es müssen genau 15 Cues sein, in derselben Reihenfolge wie die Wörter auf der Seite.
4. Stimmt die Anzahl nicht, nimmt die Seite automatisch die Zeiten aus `data-times` im HTML.
