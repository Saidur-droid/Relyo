# Relyo — Next Workflow

Last updated: 2026-09-18

Read `WORK_PROGRESS.md` first. The repository and deployment work that can be completed without human account authentication is now merged and green.

## Completed

- PR #8 R1 readiness fixes are merged: generated pnpm lockfile, frozen CI install, production environment-key contract, preview-key rejection, diagnostic removal and proof-error redaction.
- PR #9 / Issue #5 implementation is merged on current main as `a10b297b1858dafc51939bd7153a4e7dcc29ff4d`.
- Supabase read-only OAuth/provider adapter, project binding, deterministic R1 contracts, combined Vercel+Supabase Passport path, UI and threat-model/tests are in main.
- The prior Turbopack source-import failure is fixed.
- Fresh PR CI and main CI pass frozen install, typecheck, tests and production build.
- Vercel preview and production deployment statuses are green.
- Production database migration allows both `vercel` and `supabase` provider connections.
- Stale PR #7 is closed as superseded.

## Remaining human/account gates

### 1. Current-release Vercel R1 proof

In a browser session that is authenticated to the user's Vercel account:

1. Open `https://relyo-two.vercel.app`.
2. Connect Vercel if the Relyo session is not already connected.
3. Bind the `relyo` project.
4. Run **Verify My Launch** with:
   - production URL: `https://relyo-two.vercel.app`
   - GitHub repository: `Saidur-droid/Relyo`
5. Require `R1 — Launch Verified`, zero blockers, exact deployed release binding and a signed Production Passport.
6. Verify matching new `proof_runs` and `evidence_envelopes` rows in production Postgres without reading credential envelopes or secret values.

### 2. Production Supabase OAuth activation

The code and database migration are ready, but the live endpoint currently returns 503 because real OAuth credentials are not configured.

The founder needs to create/configure a Supabase OAuth application with callback:

`https://relyo-two.vercel.app/api/supabase/callback`

Then add these to the Vercel `relyo` **Production** environment:

- `SUPABASE_APP_CLIENT_ID`
- `SUPABASE_APP_CLIENT_SECRET`

Do not send either secret value in chat or commit it to GitHub.

After that:

1. Redeploy Production if Vercel does not automatically redeploy after env changes.
2. Connect Supabase from Relyo.
3. Bind `relyo-prod`.
4. Run the combined Vercel + Supabase proof.
5. Require evidence-backed R1 and matching persisted evidence for the exact deployed release.
6. Update `WORK_PROGRESS.md` and `CURRENT_STATE.md` with the exact run/release/evidence IDs.

## Current evidence baseline

Production Postgres currently contains only the historical signed R0 run for release `8ed6309739f0c31f24e115658eb087170f79e08b`. Passing CI or a Ready deployment is not a substitute for the new authenticated proof.

## Continuity

Keep `WORK_PROGRESS.md` updated after every meaningful milestone. Distinguish code merged, CI tested, deployed, account configured and production-verified states. Never expose provider secrets or credential envelopes.
