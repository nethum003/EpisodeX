export const SCHEMA = `
CREATE TABLE IF NOT EXISTS titles (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  genre TEXT,
  description TEXT,
  duration_min INTEGER,
  poster TEXT
);

CREATE TABLE IF NOT EXISTS seasons (
  id INTEGER PRIMARY KEY,
  title_id INTEGER NOT NULL REFERENCES titles(id),
  season_number INTEGER NOT NULL,
  episode_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY,
  season_id INTEGER NOT NULL REFERENCES seasons(id),
  episode_number INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS library (
  title_id INTEGER PRIMARY KEY REFERENCES titles(id),
  status TEXT NOT NULL,
  is_favourite INTEGER DEFAULT 0,
  rating INTEGER,
  review TEXT,
  added_at TEXT
);

CREATE TABLE IF NOT EXISTS episode_progress (
  episode_id INTEGER PRIMARY KEY REFERENCES episodes(id),
  watched INTEGER DEFAULT 0,
  watched_at TEXT
);
`;