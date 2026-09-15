CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT,
  media_url TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_trails_expires ON trails(expires_at);
CREATE INDEX IF NOT EXISTS idx_trails_user ON trails(user_id);
