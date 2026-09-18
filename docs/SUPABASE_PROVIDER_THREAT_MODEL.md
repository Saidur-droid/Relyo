# Supabase Provider Trust Boundary

Relyo's Supabase integration is provider-native OAuth only. The browser never accepts or stores a Supabase personal access token, database password, service-role key, secret API key, OAuth client secret, or Management API access token.

## Credential boundary

- OAuth state and PKCE verifier live only in short-lived HttpOnly cookies.
- OAuth code exchange happens server-side.
- Management API access/refresh tokens are encrypted before persistence in `provider_connections`.
- Browser responses expose only normalized project metadata and proof results.
- Provider secret values are never copied into evidence, Production Passports, analytics, logs, or model context.

## Read-only observation

The provider adapter uses GET endpoints for project, Auth, and backup metadata. Database policy inspection uses Supabase's dedicated `POST /v1/projects/{ref}/database/query/read-only` endpoint with one hard-coded catalog-only SELECT. It never accepts user SQL and never reads application rows.

The RLS query is restricted to `pg_catalog` metadata for `public` and `storage` relations. Inaccessible facts remain `UNKNOWN`; lack of evidence never becomes `PASS`.

## Project confusion controls

A user explicitly selects a project returned by the connected Supabase account. Relyo stores the project ref/name with the encrypted provider connection. Proof execution re-observes the project and rejects identity mismatch before signing or persisting a Passport.

## Browser/service-role exposure baseline

Relyo inspects public repository environment declarations for browser-prefixed variables whose names indicate service-role or secret Supabase credentials. It never reads or stores secret values. A risky public declaration is a deterministic blocker; absence of repository evidence is `UNKNOWN`.

## No mutation capability

This integration does not call project-update, Auth-update, migration, normal SQL query, restore, secret, key-reveal, or backup-restore APIs. Future mutation capability requires a separate risk class, approval flow, and threat-model review.
