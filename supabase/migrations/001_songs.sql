CREATE TABLE songs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id   VARCHAR(255) UNIQUE NOT NULL,  -- stores iTunes trackId
  title        VARCHAR(255) NOT NULL,
  artist       VARCHAR(255) NOT NULL,
  album        VARCHAR(255),
  album_art    TEXT,
  preview_url  TEXT NOT NULL,
  genre        VARCHAR(20)  NOT NULL,
  decade       VARCHAR(10)  NOT NULL,
  release_year INT,
  popularity   INT
);

CREATE INDEX idx_genre_decade ON songs(genre, decade);
