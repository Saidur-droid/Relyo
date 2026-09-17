# Issue #5 implementation notes

Implemented on `issue-5-supabase-r1`:

- Supabase added as an encrypted provider connection type.
- Provider DB constraint migration allows `supabase`.
- Provider-native Supabase OAuth with PKCE/state and server-side Basic-auth code exchange.
- Project list and explicit server-side project binding routes.
- Read-only Supabase Management API adapter for project health, Auth config, backups, and RLS metadata.
- RLS inspection uses only `/database/query/read-only` with a hard-coded catalog SELECT.
- Deterministic Supabase R1 contracts for project health, Auth origin, RLS, backup observability, and browser-prefixed secret declarations.
- Combined Vercel + Supabase Production Passport path persisted through the existing immutable ProofStore and signed by the existing Passport key.
- User-facing Supabase connect/select/bind workflow.
- Redaction, fail, pass, and UNKNOWN semantics tests.

Production activation additionally requires a Supabase OAuth app with callback `https://relyo-two.vercel.app/api/supabase/callback`, production `SUPABASE_APP_CLIENT_ID` and `SUPABASE_APP_CLIENT_SECRET`, and migration `003_provider_supabase.sql` applied before combined proof is enabled.
