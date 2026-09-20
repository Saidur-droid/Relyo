# FINAL NEXT WORKFLOW — remaining technical 1% — 2026-09-19

No new coding or founder secret setup is currently required.

1. Wait for the Vercel Hobby daily free deployment quota to reopen. Latest definitive failure: Actions run `35435808696`, upload error `api-deployments-free-per-day` / `try again in 24 hours`.
2. Do not probe repeatedly, pay, upgrade, or start a trial.
3. When the free gate is available, trigger the existing GitHub-hosted prebuilt production path through `.vercel-prebuilt-deploy-trigger` using normal branch -> PR -> CI -> merge.
4. Require install, project-read validation, explicit Vercel link, production pull, prebuilt build, upload and stable URL verification all to pass.
5. Verify `https://relyo-two.vercel.app` is serving the exact then-current main SHA.
6. Run combined Vercel + Supabase R1 using the existing bound providers: Vercel `relyo` and Supabase `relyo-prod`.
7. Independently verify production `proof_runs` and `evidence_envelopes`: `VERIFIED`, target R1, achieved R1, exact SHA, correct Vercel+Supabase binding, matching evidence IDs/hashes.
8. Update Issue #5 + canonical docs and close Issue #5 only after that proof is real.
9. Leave Issue #39 open. Real design partners are a later external phase, not part of this technical-finalization task.

If a future chat starts from only the repository link, read `CHAT_HANDOFF_2026-09-19.md` and continue from this sequence without making the founder restate history.

---

# Immediate next workflow — 2026-09-19 late handoff

1. Start from current main `4ce1224ee09676014fd239f3aa2c34bf6605b5f5`; PR #42 is already merged.
2. Inspect failed `Vercel Free Prebuilt Production Deploy` run `35432619820`. It reached `vercel pull` and failed with `Could not retrieve Project Settings`.
3. Fix the Vercel CLI project/repo-linking path for the monorepo via branch/PR/CI, preserving the existing project-scoped `VERCEL_TOKEN` and zero-paid policy.
4. Once production deploy succeeds, verify the exact deployed main SHA.
5. Run combined Vercel + Supabase R1 for `https://relyo-two.vercel.app` + `Saidur-droid/Relyo`, bound to Vercel `relyo` and Supabase `relyo-prod`.
6. Independently verify `proof_runs` + `evidence_envelopes`: VERIFIED, target R1, achieved R1, exact SHA, correct provider binding, matching evidence IDs/hashes.
7. Close Issue #5 only after that evidence exists.
8. Keep Issue #39 open until 5–20 real independent design partners use Relyo; synthetic/internal evidence does not count.
9. See `CHAT_HANDOFF_2026-09-19.md` for all exact IDs, runs, security rules and already-completed work.

No further manual secret setup is currently expected from the founder unless a future provider error proves the stored token is invalid/revoked.

---

# Next execution gate — 2026-09-19

No manual setup is currently required from the founder.

1. Wait for the Vercel Hobby build-rate gate to clear. The automated condition-watch checks hourly without creating probe deployments.
2. When clearly open, change only `.vercel-deploy-trigger` through normal branch/PR/CI/merge and request the fresh production deployment.
3. Verify the deployed commit SHA exactly matches current main.
4. Re-run combined Vercel+Supabase R1 against the exact production release and independently verify the signed Passport plus persisted ProofStore evidence/hashes.
5. Close Issue #5 only after combined `VERIFIED/R1` exists.
6. Run the real R2 customer journey using the Playwright-compatible driver with an explicit target journey spec and safe synthetic data.
7. Run R3 only in an isolated/staging-safe recovery target. Never inject a destructive production failure.
8. Prefer free GitHub-hosted ephemeral execution and included/free provider capacity. Never upgrade Vercel or use paid compute to satisfy an evidence gate.
9. Reconcile production evidence into `WORK_PROGRESS.md`, `CURRENT_STATE.md`, issue state, and final Passport documentation.

Current main `57964864481f07db45deb52b68bda9b0769a68ba` has green main CI and green Free-Tier Execution Evidence. Vercel production deployment remains blocked by the Hobby build-rate status.

---

# Relyo — Next Workflow

Last updated: 2026-09-18

Latest recheck: `WORK_PROGRESS.md` checkpoint 7 confirms the main CI/deployment baseline is green, Vercel requires interactive sign-in, Supabase connect still returns 503, and no new R1 run exists. Start with secure Vercel browser authentication; do not repeat completed implementation work. After any configuration redeploy, use the actual deployed SHA for proof and database verification.

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
