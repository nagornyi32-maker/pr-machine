CREATE TABLE IF NOT EXISTS players (
 session_hash TEXT PRIMARY KEY,
 id TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 season TEXT NOT NULL,
 score INTEGER NOT NULL DEFAULT 0,
 created INTEGER NOT NULL,
 state TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS players_leaderboard ON players (season, score DESC, created ASC);
