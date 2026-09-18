# R1 work checkpoint

Updated: 2026-09-18. Branch: `fix/r1-launch-readiness`.

## Completed
- Read AGENTS.md, NEXT_WORKFLOW.md, CURRENT_STATE.md and Issue #5.
- Confirmed main baseline `721a5ffef5700827a0356fb9d95994347e18b711`.
- Traced environment declaration mechanism: root `.env.example` → GitHub discovery at commit SHA → `envTemplateVariables` → Vercel R1 presence assertions. No new runtime override is needed.
- Rechecked Vercel connector access: `relyo` still returns 404 for the recorded team. This is an access limitation, not evidence that production is broken.

## In progress
- Generate a real pnpm 10.15.1 lockfile.
- Declare only production-required environment key names with blank values.
- Add regression coverage for key discovery and missing/unknown configuration.

## Remaining
- Frozen install, typecheck, test and production build.
- Publish code, inspect CI and production deployment status.
- Run authenticated production Verify My Launch; verify signed R1 and matching persisted proof/evidence without exposing secrets.
- Reconcile NEXT_WORKFLOW.md and CURRENT_STATE.md with observed results.
- Issue #5 stays deferred until production R1 is evidence-backed.

## Continuity rule
Update this file after each meaningful milestone. Distinguish implemented, locally tested, deployed and production verified. Never mark R1 complete from build success alone. If interrupted, resume from this branch and these remaining items.
