BEGIN;

CREATE TABLE IF NOT EXISTS provider_connections (
  id text PRIMARY KEY,
  provider text NOT NULL CHECK (provider IN ('vercel')),
  provider_account_id text,
  provider_team_id text,
  scopes jsonb NOT NULL,
  credential_envelope jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS provider_connections_provider_idx
  ON provider_connections (provider, updated_at DESC);

-- credential_envelope stores AES-256-GCM ciphertext metadata only.
-- Application logs, analytics, evidence, and Passports must never contain decrypted provider tokens.

COMMIT;
