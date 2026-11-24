-- Cloudflare D1 (SQLite). One row per submission.
-- The newest 10 rows per kind keep ts (time) and place; older rows lose them, so only ip_hash + item remain.
CREATE TABLE IF NOT EXISTS submissions (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  kind    TEXT NOT NULL,          -- 'lang' or 'word'
  item    TEXT NOT NULL,          -- node id (e.g. 'fren1241') or word id (e.g. 'animals/cat')
  ip_hash TEXT NOT NULL,          -- salted SHA-256 of the visitor's IP (the raw IP is never stored)
  ts      INTEGER,                -- UTC milliseconds, only for the newest 10 per kind
  place   TEXT                    -- 'RO|Iași County' (country code | region), only for the newest 10 per kind
);
CREATE INDEX IF NOT EXISTS idx_kind_item ON submissions(kind, item);
CREATE INDEX IF NOT EXISTS idx_kind_ip   ON submissions(kind, ip_hash);
