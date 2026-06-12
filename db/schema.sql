-- 1. Table untuk Autentikasi (Auth.js / NextAuth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified DATETIME,
  image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expires DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- 2. Table untuk Analytics Pengunjung
CREATE TABLE IF NOT EXISTS web_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  country TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
