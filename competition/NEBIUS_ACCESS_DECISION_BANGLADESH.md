# Nebius Access Status — 2026-10-06

**Status:** RESOLVED — live Nebius Token Factory access is now working.

The earlier 2026-10-05 country-onboarding concern is superseded by a successful live runtime test using the founder-controlled Nebius Token Factory account and a repository-scoped `NEBIUS_API_KEY` secret.

## Verified live state

On 2026-10-06, GitHub Actions workflow `Competition Live Sponsor Smoke` completed successfully and executed a real NVIDIA Nemotron inference through Nebius Token Factory.

Evidence:

- branch: `competition/relyo-2026`
- successful workflow run: `37445344928`
- provider: Nebius Token Factory
- model: `nvidia/Nemotron-3_5-Lightning`
- live smoke test: `apps/web/test/nebius-live.test.ts`
- adapter: `apps/web/lib/competition/nebius.ts`
- evidence note: `competition/NEBIUS_LIVE_RUNTIME_PROOF_2026-10-06.md`

Run URL:

https://github.com/Saidur-droid/Relyo/actions/runs/37445344928

## Security boundary

- The API key remains server-side in GitHub Actions repository secrets.
- The value is not committed to Git.
- Workflow logs mask the secret.
- Nemotron remains reasoning-only and cannot decide PASS or VERIFIED.

> **AI reasons. Evidence decides.**

## Current decision

No teammate-credential fallback is needed for the current Nebius submission path.

Continue Nebius competition hardening using the verified live Token Factory integration.
