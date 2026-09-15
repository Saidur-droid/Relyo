# Vercel Provider Credential Threat Model

> Scope: Issues #2 and #3 — read-only Vercel evidence plus the OAuth/PKCE connection and user-facing `Verify My Launch` path.

## Security objective

Observe enough Vercel production state to independently verify release identity, deployment readiness, production-domain binding, required configuration-key presence, and a provider-observed rollback candidate without exposing credentials or secret values and without mutating production.

## Risk classification

All Vercel operations in the current product are `OBSERVE`.

No deployment promotion, rollback, environment mutation, domain mutation, redeploy, project mutation, or secret mutation is exposed by this adapter or UI.

## OAuth and browser trust boundary

The normal product flow never asks a founder to paste a provider token.

Current controls:

1. `/api/vercel/connect` creates unpredictable OAuth `state`, OIDC `nonce`, and a PKCE verifier/challenge.
2. State, nonce, and verifier are kept only in short-lived `HttpOnly`, `SameSite=Lax` cookies.
3. The callback rejects missing/mismatched state and validates the OIDC ID token issuer, audience, signature and nonce.
4. Authorization-code exchange happens server-side and includes the PKCE verifier.
5. Provider access/refresh tokens are encrypted before persistence with AES-256-GCM authenticated encryption.
6. The long-lived browser cookie contains only an opaque Relyo connection ID; it never contains provider credentials.
7. Project-list, project-bind and proof responses expose only normalized project/proof data, never the credential envelope or decrypted token.
8. State-changing product POSTs reject an explicit cross-origin `Origin` header.
9. Missing Vercel App, database, signing-key, or encryption-key configuration fails closed rather than falling back to browser tokens or plaintext storage.

## Credential storage boundary

Provider credentials are capabilities, not proof data.

Required controls:

- credentials remain server-side;
- credentials are encrypted at rest using an authenticated envelope;
- credentials are never committed to Git;
- credentials are never placed in model context;
- credentials are never included in evidence envelopes or Production Passports;
- credentials are never emitted in analytics/log fields;
- use the narrowest practical Vercel read permissions and project/team scope;
- support credential revocation/rotation without invalidating historical evidence;
- production deployment actions require a separate higher-risk capability in future work.

The credential-encryption key and Passport signing key are deployment secrets. Production should move these to KMS/HSM-backed key management as the system matures.

## Explicit project binding

The user must select a project returned through the authenticated read-only Vercel project API. Relyo then stores only that provider project ID/name alongside the encrypted connection record.

The proof API does not accept an arbitrary project ID from the browser. It reads the stored project binding, uses that binding for provider observation, and rejects provider identity mismatch. This limits cross-project confusion and prevents a later browser request from silently switching the evidence target.

## Environment variables

Vercel's environment-variable API may return value-like fields. Relyo must not treat those values as normal proof payloads.

Current adapter behavior:

1. fetch provider response server-side;
2. immediately normalize each variable to only `key`, `target`, and `type`;
3. discard value-like fields before the normalized provider observation is created;
4. retain only production-target key metadata for R1 configuration-presence checks;
5. compare observed key names against an explicit expected-key contract (or repository environment-template key names);
6. never infer correctness of a value from presence alone.

If no expected environment-key set is declared, configuration completeness remains `UNKNOWN`.

## Release identity

A READY deployment is not enough to prove the intended release is live.

R1 requires:

- exact GitHub repository commit identity from discovery;
- Vercel production deployment commit metadata;
- deterministic equality between those commit SHAs.

Missing deployment commit metadata => `UNKNOWN`.
Mismatch => `FAIL`.

## Production domain

R1 requires a verified Vercel domain that matches the checked public host. A random verified domain in the project is insufficient.

## Rollback readiness

The Vercel API supports promoting an existing deployment to production. Relyo uses that capability only as observed capability metadata in R1; it does not call the mutation endpoint.

Current R1 rollback readiness requires a current production deployment plus at least one previous `READY` production deployment for the same project. This is deliberately weaker than R3 resilience proof; R3 must exercise recovery rather than only observe an eligible prior deployment.

## Evidence and Passport integrity

Provider observations are converted to redacted evidence envelopes containing normalized provider/project identity, deployment metadata, Git commit metadata, verified domains, environment key names/targets/types, rollback metadata, collection time, and SHA-256 evidence hashes.

The Verify My Launch path executes deterministic R1 contracts, signs the resulting Production Passport with Ed25519, and stores the run/evidence through the immutable ProofStore. The browser receives the signed proof envelope, blockers, and safe project identity only.

## Main threats and controls

### OAuth CSRF / authorization response substitution

Controls: high-entropy state, timing-safe equality, short-lived HttpOnly transaction cookies, PKCE, OIDC nonce validation, issuer/audience/signature verification.

### Token exfiltration

Controls: server-side code exchange, AES-256-GCM at rest, opaque HttpOnly connection cookie, no token fields in browser responses/evidence/analytics/model context, narrow read-only capabilities.

### Secret-value leakage from environment API

Control: value-like response fields are discarded during normalization; adapter tests assert supplied secret values do not survive serialization.

### Cross-project confusion

Controls: user can bind only a project returned by the authenticated Vercel API; binding is persisted server-side; verification uses only the stored binding and checks observed provider project identity.

### Release confusion / stale deployment

Control: compare exact production deployment commit metadata to repository release SHA; READY alone cannot satisfy release identity.

### False rollback confidence

Control: no previous READY production deployment means rollback contract fails. Current R1 remains provider-observed readiness only.

### Credential misuse for mutation

Control: current adapter uses GET-only provider calls. Mutation APIs are not exposed.

## Residual risks / required hardening before broad production use

- rotate/refresh OAuth credentials without exposing refresh tokens and handle provider revocation explicitly;
- bind opaque connection IDs to an authenticated Relyo user/account before multi-user production launch;
- add server-side session invalidation/revocation and connection disconnect flows;
- add credential-access audit events containing no secret material;
- move encryption/signing keys to KMS/HSM-backed storage and maintain a key registry/rotation path;
- review exact Vercel App scopes against provider changes and deny unexpected privilege expansion;
- add distributed runner/job isolation, provider retry budgets and rate-limit handling;
- define evidence freshness/expiry and provider-connection freshness policies;
- add enterprise private-runner/data-residency options;
- commission external security review before broad production credential handling.

Relyo must never interpret this connection flow as proof of total application safety. The Passport remains scoped to the exact contracts, release, environment, evidence, timestamp and exclusions shown to the user.
