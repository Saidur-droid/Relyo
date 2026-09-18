# Relyo — Next Workflow

Last updated: 2026-09-18

Read `WORK_PROGRESS.md` first for the latest saved checkpoint. Never infer production R1 from passing CI or deployment alone.

## Implemented in PR #8

- Real pnpm 10.15.1 `pnpm-lock.yaml` at workspace root; CI frozen installs.
- Existing environment contract populated through root `.env.example` with blank assignments only:
  - `DATABASE_URL`
  - `RELYO_CREDENTIAL_ENCRYPTION_KEY`
  - `RELYO_PASSPORT_SIGNING_PRIVATE_KEY_B64`
  - `VERCEL_APP_CLIENT_ID`
  - `VERCEL_APP_CLIENT_SECRET`
  - `VERCEL_READ_TOKEN`
- The read-token key is required by this production installation's documented identity-only OAuth setup. It remains server-side. `RELYO_CREDENTIAL_ENCRYPTION_KEY_ID` and `VERCEL_OAUTH_SCOPE` have code defaults and are optional comments, not required assertions.
- Preview-only keys cannot pass production assertions; missing declarations remain UNKNOWN.
- Temporary public persistence diagnostic handlers removed; raw provider/database errors excluded from proof logs and browser responses; malformed proof JSON bodies rejected.
- Local frozen install, typecheck, 46 tests / 13 files, and production build passed. Existing Vercel Bun install configuration is preserved.

## Merge approval required

PR #8 is ready and its implementation commit `4e0b5e9068e0685b5b1e0a63521ba0416a175678` passed CI run `35300986829` and Vercel preview. It is **not merged**. Automatic approval review rejected default-branch merge because the founder has not explicitly authorized this exact merge. Ask for authorization to merge PR #8 into main and deploy; do not bypass via direct push/ref update.

Production code is unchanged. Read-only database inspection confirmed only the prior signed R0 run with three matching stored evidence records. Vercel login is needed in this session's browser for the later end-to-end proof.

## After merge authorization: authenticated production R1

1. Confirm the complete PR #8 changes are merged/deployed to Production and the matching GitHub CI/Vercel statuses are successful.
2. Open `https://relyo-two.vercel.app` and use an existing Vercel connection, or complete normal OAuth if the browser has no connection. Do not change OAuth app settings or rotate keys.
3. Bind the `relyo` project; run **Verify my launch** with production URL `https://relyo-two.vercel.app` and repository `Saidur-droid/Relyo`.
4. Require `R1 — Launch Verified`, no blockers, exact deployed commit match, and a signed Production Passport. Presence of key names does not prove value correctness.
5. Verify the matching run/evidence exist in production Postgres using safe IDs/counts only. Never select credential envelopes or environment values.
6. Record exact release/run/evidence references in `WORK_PROGRESS.md` and `CURRENT_STATE.md`. Preserve the release SHA a proof attests to, even if later documentation commits advance main.

## Current access limits

Production homepage loads, but this session's browser has no authenticated Relyo Vercel connection. The Vercel connector still returns 404 for `relyo` under the recorded team. Do not label this an app outage or repeat reconnect/configuration troubleshooting without new evidence. If authentication is required, finish and save all available work first, then request only the needed sign-in step through secure browser authentication.

## Work after R1

Issue #5 (Supabase and combined-provider proof) remains gated on evidence-backed production R1. Inspect its existing branch and reconcile with current main before implementing. Do not reopen solved setup loops or claim the entire V2 roadmap is complete.

## Continuity

Update `WORK_PROGRESS.md` after each meaningful milestone and save working changes regularly. Each checkpoint must show completed fixes, verification results, remaining tasks and blockers, so a token/session interruption does not erase the handoff.
