# R1 work checkpoint

Updated: 2026-09-18. Branch: `fix/r1-launch-readiness`.

## Completed
- Read AGENTS.md, NEXT_WORKFLOW.md, CURRENT_STATE.md and Issue #5.
- Confirmed main baseline `721a5ffef5700827a0356fb9d95994347e18b711`.
- Traced environment declaration mechanism: root `.env.example` → GitHub discovery at commit SHA → `envTemplateVariables` → Vercel R1 presence assertions. No new runtime override is needed.
- Rechecked Vercel connector access: `relyo` still returns 404 for the recorded team. This is an access limitation, not evidence that production is broken.

## Initial plan (superseded by checkpoints below)
- Generate a real pnpm 10.15.1 lockfile.
- Declare only production-required environment key names with blank values.
- Add regression coverage for key discovery and missing/unknown configuration.

## Initial remaining list (superseded below)
- Frozen install, typecheck, test and production build.
- Publish code, inspect CI and production deployment status.
- Run authenticated production Verify My Launch; verify signed R1 and matching persisted proof/evidence without exposing secrets.
- Reconcile NEXT_WORKFLOW.md and CURRENT_STATE.md with observed results.
- Issue #5 stays deferred until production R1 is evidence-backed.

## Continuity rule
Update this file after each meaningful milestone. Distinguish implemented, locally tested, deployed and production verified. Never mark R1 complete from build success alone. If interrupted, resume from this branch and these remaining items.

## Checkpoint 2 — code prepared
- Generated `pnpm-lock.yaml` with pnpm 10.15.1 (not handwritten).
- Added root `.env.example` with six blank production-required keys; encryption key ID and OAuth scope remain optional defaults. The read token is required for this deployment's documented identity-only OAuth setup.
- CI now requires a frozen lockfile.
- Environment assertions independently reject preview-only keys.
- Added discovery tests for exact-release reads, declaration names, optional-key exclusion, value redaction and inaccessible templates; added contract UNKNOWN/preview regression tests.
- Node 22.23.2 / pnpm 10.15.1 frozen install is running; tests/build not yet claimed.
- Production homepage loaded in the browser. This browser has no Relyo Vercel connection, so authenticated R1 remains pending.

## Checkpoint 3 — local verification passed
- PR #8: https://github.com/Saidur-droid/Relyo/pull/8.
- Main readiness code saved in `05f91f8518207b4f71d12c338124aca860495554`; its CI run `35300720285` and Vercel preview succeeded.
- Node 22.23.2 / pnpm 10.15.1: frozen install, typecheck, 46 tests in 13 files, production build passed.
- Additional verified hardening: no raw proof errors in logs/browser, non-object JSON body returns 400, temporary public DB diagnostic handlers removed.
- AGENTS.md now requires periodic saved checkpoints and founder updates, rather than waiting until a session ends.
- Remaining: save hardening/docs, verify complete PR CI, publish production changes, authenticated R1 and matching Postgres proof/evidence, then Issue #5.

## Checkpoint 4 — ready; merge approval blocked

### Completed and saved
- Implementation head: `4e0b5e9068e0685b5b1e0a63521ba0416a175678` on `fix/r1-launch-readiness`.
- PR #8 is ready for review (no longer a draft), not merged.
- Full implementation CI run `35300986829` succeeded; Vercel preview `CRtMT6Y8BsfRyXcgxwp531n6ybVw` succeeded.
- Local frozen install, typecheck, 46 tests / 13 files and production build passed.
- Read-only production DB verification found the prior run `run_89fc0874-af07-4809-bf16-915a07f4c66c`, created `2026-09-17T07:42:14.771Z`: PARTIAL, target R1, achieved R0, Ed25519 signed, release `8ed6309739f0c31f24e115658eb087170f79e08b`, three referenced evidence records matching stored IDs and hashes. This is historical persistence evidence only.
- Production homepage is reachable. Normal Connect Vercel reaches the Vercel login page; this browser has no usable signed-in session.

### Concrete blockers / exact next actions
1. Automatic approval review rejected merging PR #8 into default `main`: repository fixes were authorized, but it requires explicit user authorization for this exact merge. Do not retry or bypass the rejection with a direct main ref update/push. Ask the founder to authorize **merge PR #8 into main and deploy the resulting production release**.
2. After authorization, verify the current PR head/checks, merge, and confirm the resulting main CI and production Vercel deployment. All work so far is on the branch/preview; production code has not changed.
3. Complete Vercel sign-in through secure browser authentication if needed, bind `relyo`, run Verify My Launch using `https://relyo-two.vercel.app` and `Saidur-droid/Relyo`, then verify signed R1 and matching persisted evidence for that exact release.
4. Update this file / current state with actual production results. Only then resume Issue #5 after inspecting its existing branch.

No credential values were requested or retrieved; no database mutation, key rotation, or production configuration change was performed.

## Checkpoint 5 — post-merge verification and Issue #5 reconciliation

- PR #8 is merged on `main` at `aa6feede3de0f8748c31c4520133d3c6b18be59d`; GitHub CI and Vercel status for that release are green.
- Production homepage is reachable; unauthenticated provider APIs continue to reject access safely.
- Production Postgres still contains the historical signed R0 run only; a new authenticated R1 run for the current release remains pending.
- Issue #5 Supabase work has been reconciled onto current main on branch `fix/issue-5-supabase-r1-reconcile` while preserving the newer Vercel token fallback and error-redaction hardening.
- The previous Turbopack `.js` source-import build blocker is addressed through package self-exports, and the pnpm lockfile importer graph includes the new Supabase workspace package.
- Next automated gate: frozen install, typecheck, tests, build, and Vercel preview on the reconciliation PR.
- Human/account gate still pending: authenticated production Vercel proof for the current release, then Supabase OAuth application credentials for production combined proof. No secret values are committed or requested here.


## Checkpoint 6 — Supabase R1 code merged; production account gates isolated

- PR #9 merged to `main` as `a10b297b1858dafc51939bd7153a4e7dcc29ff4d`.
- Fresh PR CI and post-merge main CI both passed frozen install, typecheck, tests and production build; Vercel preview and production deployment statuses are green.
- Production UI now exposes the Vercel + Supabase read-only launch-proof flow.
- Production migration `allow_supabase_provider` was applied successfully; `provider_connections.provider` now permits both `vercel` and `supabase`.
- Stale PR #7 was closed as superseded by PR #9.
- Production Supabase OAuth is not configured yet: `/api/supabase/connect` returns 503 because the required Supabase OAuth client credentials are absent.
- Production Postgres still has only the historical signed R0 run for release `8ed6309739f0c31f24e115658eb087170f79e08b`; no current-release R1 proof exists yet.
- Remaining human/account gates only:
  1. authenticate/connect Vercel in the production Relyo browser session, bind `relyo`, and run **Verify My Launch** for `https://relyo-two.vercel.app` + `Saidur-droid/Relyo`;
  2. create/configure the Supabase OAuth application with callback `https://relyo-two.vercel.app/api/supabase/callback`, then add `SUPABASE_APP_CLIENT_ID` and `SUPABASE_APP_CLIENT_SECRET` to Vercel Production;
  3. connect/bind `relyo-prod` in Relyo and run the combined proof;
  4. confirm new signed R1 proof/evidence rows for the exact deployed release.
- No secret values were requested, read, printed or committed.
