BEGIN;

CREATE TABLE IF NOT EXISTS evidence_envelopes (
  id text PRIMARY KEY,
  sha256 text NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  kind text NOT NULL,
  source text NOT NULL,
  collected_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS proof_runs (
  id text PRIMARY KEY,
  subject_id text NOT NULL,
  state text NOT NULL CHECK (state IN ('DISCOVERING', 'VERIFYING', 'VERIFIED', 'FAILED', 'PARTIAL')),
  target_assurance text NOT NULL CHECK (target_assurance IN ('R0', 'R1', 'R2', 'R3', 'R4')),
  created_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  inserted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proof_runs_subject_created_idx
  ON proof_runs (subject_id, created_at DESC);

-- Evidence and proof runs are append-only at the application layer.
-- Database roles used by Relyo runners/verifiers should not receive UPDATE/DELETE.

COMMIT;
