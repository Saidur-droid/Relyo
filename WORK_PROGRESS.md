# Checkpoint 11 — final zero-paid production deploy succeeded, 2026-09-20

- PR #49 merged as main commit `d4f14f77d7b10f56a0cf27b9b6383cbe97fa07c7`.
- GitHub Vercel status for that exact main commit is `success`; deployment target: `54UaefwtegVZHc7muqDMezoaxvo9`.
- Public production URL `https://relyo-two.vercel.app` is reachable and serving the Relyo launch-verification UI.
- Production provider bindings remain present for Vercel `relyo` and Supabase `relyo-prod`.
- The deployment/quota blocker is therefore closed without any paid upgrade or paid compute.
- The only remaining truth gate is to create a fresh exact-release combined Vercel+Supabase `VERIFIED/R1` proof using an authenticated browser session (the endpoint requires the existing provider-connection cookies), then independently verify `proof_runs` / `evidence_envelopes` and close Issue #5.
- The current database still has no newer combined VERIFIED/R1 row; the latest combined run remains the historical FAILED/R0 run. Do not fabricate or manually insert proof.
- Issue #39 remains intentionally open for real independent design partners and is outside the final technical proof gate.

---

# Checkpoint 10 — final technical 1% isolated, 2026-09-19

- Current main before this documentation checkpoint: `d8a7bc2203484e190c9e038387926a2c84aaf3e6`.
- PR #45 merged explicit Vercel project validation/linking.
- Founder replaced `VERCEL_TOKEN` with a team-scoped token; value remains secret and must never be requested or exposed.
- PR #46 merged the pnpm install correction for Vercel builds.
- PR #47 merged the intentional free-prebuilt retry trigger.
- Main production prebuilt workflow run `35435808696`:
  - token/project read PASS;
  - explicit project link PASS;
  - production `vercel pull` PASS;
  - locked pnpm install PASS;
  - GitHub-hosted `vercel build --prod` PASS;
  - upload reached `vercel deploy --prebuilt --prod` and failed only with Vercel Hobby free daily deployment quota `api-deployments-free-per-day` / `try again in 24 hours`.
- This confirms the remaining production gate is external quota, not a repository/code/config/token bug.
- Provider bindings already exist for Vercel `relyo` and Supabase `relyo-prod`.
- Current contract code correctly places Supabase backup observability at R3/R4 only; it is not an R1 requirement.
- Final required technical sequence after quota reset: fresh production deploy -> exact main SHA verification -> combined Vercel+Supabase VERIFIED/R1 -> independent evidence ID/hash verification -> Issue #5 close.
- Issue #39 remains intentionally open for later 5–20 real independent design partners and does not block calling the technical implementation/evidence path complete once Issue #5 is truthfully closed.
- Practical technical completion at this checkpoint: approximately **99%**.

---

# Checkpoint 9 — free prebuilt deploy fallback + live R2/R3/R4 evidence, 2026-09-19

- Current main at this checkpoint: `4ce1224ee09676014fd239f3aa2c34bf6605b5f5`.
- Founder has created the project-scoped Vercel token and saved it only as GitHub Actions secret `VERCEL_TOKEN`. Never request or reveal its value.
- PR #40 added the free prebuilt production deployment workflow; PR #41 adjusted scoped-token behavior; PR #42 is merged and removed the stale `VERCEL_SCOPE` arguments.
- Post-#42 workflow run `35432619820` progressed to Vercel CLI `pull` and failed with `Could not retrieve Project Settings`. The GitHub secret was present. Current continuation is explicit Vercel CI/monorepo linking, not token recreation.
- Real zero-paid R2/R3 live qualification PASS on Render free target `https://relyo-qualification-free.onrender.com`, Actions run `35428835006`.
- Real zero-paid Continuous Proof qualification PASS, Actions run `35428993526`.
- Technical next gate: successful current-main prebuilt Vercel production deploy -> exact SHA verification -> fresh combined Vercel+Supabase VERIFIED/R1 -> independent ProofStore hash verification.
- External non-coding gate: Issue #39 requires 5–20 real independent design partners; current minimum count is 0/5 and must not be fabricated.
- See `CHAT_HANDOFF_2026-09-19.md` for exact continuation context.

---

# Checkpoint 8 — zero-paid execution path and current production gate, 2026-09-19

- Current main at this checkpoint: `57964864481f07db45deb52b68bda9b0769a68ba`.
- PR #34 merged a strict zero-paid execution path:
  - Vercel `ignoreCommand` computes the transitive workspace dependency closure of `@relyo/web` and skips unrelated builds to preserve Hobby quota.
  - `.vercel-deploy-trigger` is the intentional one-file production retry trigger after the free deployment gate clears.
  - GitHub standard hosted `ubuntu-latest` is the zero-paid ephemeral execution substrate for Runner/browser/R3 development evidence.
- Main CI run `35427451747` completed successfully.
- Free-Tier Execution Evidence run `35427451756` completed successfully on a fresh GitHub-hosted VM:
  - signed Runner suite PASS;
  - Vercel Sandbox adapter safety suite PASS without allocating remote provider compute;
  - browser journey driver suite PASS;
  - real headless Chrome runtime smoke PASS;
  - R3 recovery driver suite PASS without production mutation.
- GitHub still reports the Vercel check for main as `failure` with target `upgradeToPro=build-rate-limit`. No paid upgrade/trial is permitted.
- Vercel's current public pricing lists Hobby Sandbox included usage (5 active CPU hours/month, 420 GB-hours memory/month, 5K creations/month), but a live provider Sandbox run is not claimed because the available connected Vercel authorization does not expose sandbox creation for this project. Do not request a paid plan merely for this evidence.
- Production ProofStore still lacks a post-fix combined Vercel+Supabase VERIFIED/R1 run on the current deployed release. The latest known combined run remains pre-fix FAILED/R0; the independently verified Vercel-only R1 remains historical evidence.
- A condition-watch now checks the free deployment gate hourly and will only request a new production deployment when the free gate is clearly open. It must not probe by creating deployments, purchase capacity, expose secrets, or rotate credentials.

## Progress estimate

These percentages are engineering estimates, not assurance claims:

- repository/code implementation: about **90%**;
- live production/evidence completion: about **65%**;
- full V2 roadmap including Founder Go-Live beta/design-partner exit criteria: about **75% overall**.

The remaining work is dominated by fresh production deployment/evidence, real R2 journey configuration/evidence, isolated live R3 evidence, and beta/design-partner validation rather than a large core coding backlog.

---

# R1 work checkpoint

## Checkpoint 7 — fresh production verification, 2026-09-18

- Resumed from the current remote repository and Issue #5, not the older local checkouts. Baseline main: `478fdf7bc2bfc92ca08796d7d82b7d0c4d5b9fa7`.
- Independently verified main CI run `35304846452`: completed/success. Vercel reports success for the same commit, deployment `2Nyeh8EEzeTBHrfEZS5Dx4qgR1Rc`.
- Opened the production UI and confirmed both provider connection flows and the combined-proof form are present.
- Normal Connect Vercel reaches the Vercel sign-in page. The user selected GitHub through secure browser authentication and submitted the requested GitHub sign-in form. GitHub then rendered `500 Error / Looks like something went wrong!`. Authentication success is unknown; no bound-project or R1 success was observed. Stop automated sign-in retries after this generic failure; resume only through an appropriate user-directed authentication recovery.
- This checkpoint is saved on branch `docs/production-verification-20260918`, PR #10. Automatic approval review rejected directly updating main because it would bypass the merge/review path; main remains unchanged. Use the PR for continuation and review.
- Rechecked `/api/supabase/connect`: HTTP 503, with the safe response `Supabase connection is not configured on this Relyo deployment.` OAuth activation remains outstanding.
- Read-only Supabase inspection confirms `relyo-prod` is ACTIVE_HEALTHY and the provider constraint permits `vercel` and `supabase`.
- Production still has only `run_89fc0874-af07-4809-bf16-915a07f4c66c`: PARTIAL, achieved R0, target R1, release `8ed6309739f0c31f24e115658eb087170f79e08b`, with an Ed25519 signature envelope. All 3 referenced evidence IDs/hashes match stored evidence rows. This checks persistence and envelope metadata, not a fresh cryptographic signature verification.
- No application code, provider configuration, credentials, or database rows were changed in this checkpoint. Risk: OBSERVE for verification; SAFE_REVERSIBLE for these documentation updates.
- Remaining: authenticated Vercel bind/proof; Supabase OAuth application setup and production environment configuration; combined proof; verify exact release, signature, and persisted evidence before closing Issue #5.
- Preserve the verified release SHA above separately from subsequent documentation commits. Never promise a final message after a hard session cutoff; use these saved checkpoints to resume.

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
