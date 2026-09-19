# Relyo — Next Workflow

Last updated: 2026-09-19

Latest recheck: `WORK_PROGRESS.md` checkpoint 8 confirms authenticated production Vercel R1 is complete and persisted for exact release `1cc7a07fe80ab4351c2e7ec4aeb1943e4f5a38fb` as run `run_3d045c4a-161e-4c73-b58b-3ebf2ae68aee`. Do not repeat the Vercel connection gate. The only remaining Issue #5 production gate is Supabase OAuth activation plus a combined Vercel + Supabase proof.

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

## Remaining human/account gate

### Production Supabase OAuth activation and combined R1

The Vercel-only production R1 gate is complete. Production Supabase OAuth still needs the real Management API OAuth application credentials.

1. Create/configure the Supabase OAuth application with callback `https://relyo-two.vercel.app/api/supabase/callback`.
2. Add `SUPABASE_APP_CLIENT_ID` and `SUPABASE_APP_CLIENT_SECRET` to the Vercel `relyo` **Production** environment. Never place the secret in chat, GitHub, logs or browser-readable client code.
3. Redeploy Production if the environment change does not automatically produce a fresh deployment.
4. Confirm `/api/supabase/connect` no longer returns 503.
5. Connect Supabase in Relyo and bind `relyo-prod`.
6. Run **Verify My Launch** again for `https://relyo-two.vercel.app` + `Saidur-droid/Relyo`.
7. Require a combined evidence-backed signed R1 for the exact deployed release and verify matching new `proof_runs` / `evidence_envelopes` rows read-only.
8. Update the continuity docs and close Issue #5 only after that combined production evidence exists.

## Current evidence baseline

Production Postgres now contains current-release Vercel R1 run `run_3d045c4a-161e-4c73-b58b-3ebf2ae68aee` for release `1cc7a07fe80ab4351c2e7ec4aeb1943e4f5a38fb`, state `VERIFIED`, achieved assurance `R1`, with three evidence rows whose IDs/hashes independently match the run references. This is Vercel-only launch proof; Supabase evidence is not yet part of this Passport.

## Continuity

Keep `WORK_PROGRESS.md` updated after every meaningful milestone. Distinguish code merged, CI tested, deployed, account configured and production-verified states. Never expose provider secrets or credential envelopes.
