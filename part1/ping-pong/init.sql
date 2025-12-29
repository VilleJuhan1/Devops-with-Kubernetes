CREATE TABLE IF NOT EXISTS api_calls (
  id SERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  remote_addr TEXT
);
