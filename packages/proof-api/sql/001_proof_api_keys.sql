BEGIN;

CREATE TABLE IF NOT EXISTS proof_api_keys (
  id text PRIMARY KEY,
  key_sha256 text NOT NULL UNIQUE CHECK (key_sha256 ~ '^[0-9a-f]{64}$'),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 120),
  scopes jsonb NOT NULL,
  vercel_connection_id text NOT NULL,
  supabase_connection_id text,
  created_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE TABLE IF NOT EXISTS proof_api_run_access (
  api_key_id text NOT NULL REFERENCES proof_api_keys(id) ON DELETE CASCADE,
  run_id text NOT NULL REFERENCES proof_runs(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (api_key_id, run_id)
);

CREATE INDEX IF NOT EXISTS proof_api_keys_vercel_connection_idx ON proof_api_keys(vercel_connection_id);
CREATE INDEX IF NOT EXISTS proof_api_run_access_run_idx ON proof_api_run_access(run_id);

ALTER TABLE proof_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_api_run_access ENABLE ROW LEVEL SECURITY;

-- These tables are server-control-plane only. No Data API policies are created.
-- Relyo's server database role must be trusted separately; browser roles receive no policy path.

COMMIT;
