-- Portfolio Thomas Häder – Datenbankschema
-- Im Hostpoint-Control-Panel via phpMyAdmin importieren

SET NAMES utf8mb4;

-- Kategorien: Film, Audio, Branding, Podcast, Moderation
CREATE TABLE categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(60)  NOT NULL,
  slug  VARCHAR(60)  NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Projekte im Portfolio
CREATE TABLE projects (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  category_id  INT NOT NULL,
  title        VARCHAR(150) NOT NULL,
  slug         VARCHAR(150) NOT NULL UNIQUE,
  client       VARCHAR(150),
  year         YEAR,
  summary      VARCHAR(300),
  description  TEXT,
  cover_image  VARCHAR(255),
  media_url    VARCHAR(255),           -- YouTube/Vimeo/Spotify-Link (API/oEmbed)
  featured     TINYINT(1) DEFAULT 0,
  published    TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kontaktanfragen aus dem Formular
CREATE TABLE messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(180) NOT NULL,
  subject     VARCHAR(180),
  body        TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin-Login (Passwort nur als Hash speichern: password_hash())
CREATE TABLE users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(60) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (name, slug) VALUES
  ('Film', 'film'),
  ('Audio', 'audio'),
  ('Branding', 'branding'),
  ('Podcast', 'podcast'),
  ('Moderation', 'moderation');
