BEGIN;

ALTER TABLE provider_connections
  ADD COLUMN IF NOT EXISTS bound_project_id text;

ALTER TABLE provider_connections
  ADD COLUMN IF NOT EXISTS bound_project_name text;

CREATE INDEX IF NOT EXISTS provider_connections_bound_project_idx
  ON provider_connections (provider, bound_project_id)
  WHERE bound_project_id IS NOT NULL;

COMMIT;
