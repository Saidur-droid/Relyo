# Relyo — Next Workflow

Last updated: 2026-09-17

This file is the short handoff for the next work session. The current production flow is functioning through signed Passport generation, but the latest proof is still **R0 — Launch proof blocked** because two deterministic R1 requirements remain unfinished.

## Current verified production state

- Production app: `https://relyo-two.vercel.app`
- Vercel OAuth connection works.
- The `relyo` Vercel project can be discovered and bound.
- Provider-backed production observation works.
- Production deployment/domain/rollback evidence is being read successfully from Vercel.
- Production proof persistence and Passport signing now execute successfully.
- A **Signed Production Passport** is returned and the proof run is stored through the immutable ProofStore.
- The latest result is **R0**, not R1, because of the two blockers below.

## Deferred blockers — do these next

### 1. Add a supported dependency lockfile

Current blocker:

`No supported lockfile was observed.`

Expected next action:

- Generate and commit the repository's pnpm lockfile at the workspace root (`pnpm-lock.yaml`).
- Do not hand-write or fake a lockfile.
- Run the normal repository verification/build checks after generating it.

Expected contract outcome after the fix:

- `launch.repo-readiness` should no longer be blocked by the missing lockfile.

### 2. Declare the expected production environment-key contract

Current blocker:

`No expected environment-key contract is declared. Relyo will not treat an arbitrary set of provider variables as complete.`

Expected next action:

- Find the existing R1 launch-contract/configuration mechanism in the repository and declare the production environment keys that Relyo should expect for this application.
- Verify key **names/presence only** through provider metadata. Never expose or persist environment-variable values.
- Keep secret values out of GitHub, logs, evidence, Passport output, and browser responses.
- Include only keys that are genuinely required by the production Relyo application; do not weaken the contract just to obtain R1.

Current production configuration includes these relevant key names and should be reconciled with the actual code requirements before declaring the contract:

- `DATABASE_URL`
- `RELYO_CREDENTIAL_ENCRYPTION_KEY`
- `RELYO_CREDENTIAL_ENCRYPTION_KEY_ID`
- `RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64`
- `VERCEL_APP_CLIENT_ID`
- `VERCEL_APP_CLIENT_SECRET`
- `VERCEL_OAUTH_SCOPE`
- `VERCEL_READ_TOKEN`

Expected contract outcome after the fix:

- `launch.production-environment` should become evidence-backed rather than `UNKNOWN`.

## Then verify R1

After both blockers are fixed:

1. Deploy `main` to Production and wait for the deployment to become Ready.
2. Open `https://relyo-two.vercel.app`.
3. Confirm the Vercel connection still exists and `relyo` remains bound.
4. Run **Verify my launch** with:
   - Production URL: `https://relyo-two.vercel.app`
   - Public GitHub repo: `Saidur-droid/Relyo`
5. Expected final state: **R1 — Launch Verified** with a Signed Production Passport.
6. Confirm the new proof/evidence rows exist in production Postgres without reading or exposing secret credential material.
7. Record the successful evidence in the durable project state/issue.

## Do not redo solved setup by default

Unless new evidence proves it is necessary, do not restart the previous troubleshooting loops:

- no PowerShell/CLI OAuth installation loop;
- no Vercel reconnect as the default fix;
- no DB password/key rotation;
- no replacement of the working OAuth app configuration;
- no secret values committed to the repository.

The production Vercel read-token fallback is intentionally server-side. Treat `VERCEL_READ_TOKEN` as sensitive and never expose its value.

## Work after R1

Only after the production Vercel R1 result is evidence-backed complete, continue the deferred Supabase/combined-provider work associated with Issue #5. Before changing that branch, inspect its existing implementation and reconcile it with current `main` rather than redoing work blindly.
