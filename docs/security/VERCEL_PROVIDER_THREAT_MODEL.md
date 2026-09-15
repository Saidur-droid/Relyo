# Vercel Provider Credential Threat Model

> Scope: Issue #2 read-only provider evidence used to move a release from public discovery toward `R1 Launch Verified`.

## Security objective

Observe enough Vercel production state to independently verify release identity, deployment readiness, production-domain binding, required configuration-key presence, and a provider-observed rollback candidate without exposing credentials or secret values and without mutating production.

## Risk classification

All operations in this issue are `OBSERVE`.

No deployment promotion, rollback, environment mutation, domain mutation, redeploy, or project change is permitted in this adapter.

## Credential boundary

Provider credentials are capabilities, not proof data.

Required controls:

- credentials are injected at runtime through a server-side credential boundary;
- credentials are never accepted in browser-visible form for normal product UX;
- credentials are never committed to Git;
- credentials are never placed in model context;
- credentials are never included in evidence envelopes or Production Passports;
- credentials are never emitted in analytics/log fields;
- use the narrowest practical Vercel read permissions and project/team scope;
- support credential revocation/rotation without invalidating historical evidence;
- production deployment actions require a separate, higher-risk capability in future work.

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

The Vercel API supports promoting an existing deployment to production. Relyo uses that capability only as observed capability metadata in this issue; it does not call the mutation endpoint.

For the current R1 contract, rollback readiness requires:

- a current production deployment;
- at least one previous `READY` production deployment observed for the same project;
- provider capability to promote an existing deployment.

This is deliberately weaker than R3 resilience proof. R3 should require a stronger exercised recovery/restore contract rather than merely observing an eligible prior deployment.

## Evidence integrity

Provider observations are converted to redacted evidence envelopes containing:

- provider/project identity;
- normalized deployment identity and state;
- deployment Git commit metadata when available;
- verified domain metadata;
- environment key names/targets/types only;
- rollback candidate counts/capability;
- SHA-256 evidence hash;
- collection timestamp.

Production Passports can be wrapped in Ed25519 signatures. Signature keys must be held independently from ordinary application data, ideally through KMS/HSM-backed signing in production.

## Main threats

### Token exfiltration

Controls: server-only credential boundary, no token persistence in Passport/evidence, log redaction, least privilege, rotation/revocation.

### Secret-value leakage from env API

Control: value-like response fields are discarded during normalization and are covered by adapter tests that assert a supplied secret test value does not survive serialization.

### Cross-project confusion

Control: all observations bind to provider project ID/name and the resulting Passport environment binds to that project ID.

### Release confusion / stale deployment

Control: compare exact production deployment commit metadata to repository release SHA; READY alone cannot satisfy release identity.

### False rollback confidence

Control: no previous READY production deployment means rollback contract fails. Current R1 is provider-observed readiness only; stronger recovery claims remain out of scope.

### Credential misuse for mutation

Control: adapter implements GET-only calls. Mutation APIs are not exposed by this package.

## Required hardening before broad production use

- OAuth/App-based credential acquisition rather than manually managed broad tokens;
- encrypted credential vault/KMS with auditable access;
- per-project capability tokens where possible;
- explicit credential-access audit events without token contents;
- distributed job isolation for provider calls;
- retry budgets and provider rate-limit handling;
- signed evidence by a verifier-specific key;
- key rotation and signature key registry;
- evidence freshness/expiry policy;
- security review of provider scopes;
- private-runner option for enterprise customers.
