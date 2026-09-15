# Public URL / Repo Scan Threat Model

> Scope: `Check My App Free` alpha (`apps/web`, `@relyo/discovery`, R1 contract pack).

## Security objective

Give a useful public launch-readiness signal without turning Relyo into an SSRF proxy, secret collector, arbitrary port scanner, or evidence-overclaiming system.

## Trust boundaries

1. Browser/user input is untrusted.
2. Public URL destinations are untrusted.
3. Redirect destinations are untrusted and must be revalidated.
4. GitHub repository content is untrusted data, never executable during discovery.
5. GitHub API responses are external evidence, not authority over production state.
6. Production-provider state is unavailable in the free scan and must remain UNKNOWN.
7. Evidence summaries are shareable only after redaction; raw secrets/source are not analytics payloads.

## Main threats and controls

### SSRF / internal-network access

Threat: attacker submits localhost, RFC1918, metadata-service, link-local, loopback, ULA, reserved, or DNS-rebinding-style targets.

Controls:

- only `http` and `https`;
- only ports 80/443 in free check;
- embedded URL credentials rejected;
- localhost/internal hostname suffixes rejected;
- literal IPs classified with `ipaddr.js`;
- hostname DNS answers are resolved before each request and every answer must be public unicast;
- redirects are manual and every new redirect target is revalidated;
- redirect count capped;
- request timeout enforced;
- response bodies are not parsed in v0 and are cancelled after header/status observation.

Residual risk:

- DNS can change between validation and connection. Production hardening should add a fetch implementation that pins the validated address or runs scans in a network sandbox with explicit egress rules.

### Open proxy / resource exhaustion

Threat: public endpoint is abused for repeated outbound requests.

Controls:

- short timeout;
- max five redirects;
- per-process request bucket in alpha;
- narrow HTTP method (`GET`) and no arbitrary headers/body;
- response content not downloaded intentionally beyond transport implementation behavior.

Required before broad public launch:

- durable distributed rate limiting;
- bot/abuse controls;
- queue/budget limits;
- request-cost telemetry;
- scan concurrency controls.

### Secret exposure

Threat: repository/environment data leaks secrets.

Controls:

- GitHub v0 only reads public repo metadata, root file list, package manifest and environment template names;
- environment template values are not persisted or returned;
- no `.env` secret files are fetched;
- public scan never requests production credentials;
- growth telemetry records counts/classes, not URL, repository contents, secret values, or source code.

### Untrusted repository code execution

Threat: malicious package scripts execute on Relyo infrastructure.

Control: repository readiness discovery is static. It does not clone/install/build/test the user's repository. Future execution must use the isolated Runner and explicit capability policy.

### Verification overclaim / false VERIFIED

Threat: public reachability or static repository signals are presented as launch verification.

Controls:

- R1 requires release identity, public HTTPS/health, repo readiness, production configuration evidence and rollback evidence;
- unavailable provider evidence is `UNKNOWN`, never inferred as PASS;
- public scan normally remains R0 until missing R1 requirements are independently observed;
- Passport exposes target assurance, achieved assurance, exact contracts, evidence hashes, exclusions and unknowns;
- LLMs do not decide final status.

### Evidence tampering / ambiguity

Current controls:

- canonical JSON SHA-256 hashes for evidence payloads;
- evidence source + collection timestamp + redaction flag;
- release identity bound to Git commit when public GitHub repo is supplied;
- URL-only observation uses explicit URL-observation identity rather than pretending it is a release SHA.

Next hardening:

- signed evidence envelopes;
- verifier signing identity;
- immutable proof-run storage;
- explicit evidence expiry/freshness policy.

### Analytics privacy

Controls:

- structured events follow `docs/GROWTH_ANALYTICS_SPEC.md` names;
- current server events store booleans/counts/durations/classes only;
- raw source code and production secret values are excluded;
- the free-scan implementation does not emit submitted URL/repository strings into growth-event properties.

## Current risk classification

All public-scan operations are `OBSERVE`.

There are no production mutations in Issue #1.

## Required follow-up before public internet scale

- distributed rate limiter;
- network-isolated scanner with deny-by-default egress policy;
- DNS pinning / connect-to-validated-IP protection;
- signed evidence and Passport signing;
- persistence with retention/deletion policy;
- authenticated GitHub App path for private repositories;
- abuse monitoring and kill switch;
- external security review before privileged provider connections.
