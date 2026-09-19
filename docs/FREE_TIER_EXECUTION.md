# Free-tier execution

Relyo's development and verification path must not require a paid plan.

## Vercel Hobby build conservation

The root Vercel configuration runs `scripts/vercel-ignore-build.mjs` before allocating a build. The script computes the transitive workspace dependency closure of `@relyo/web` and asks Vercel to skip a build when a commit changes only unrelated internal packages or documentation.

The script exits conservatively:
- exit 0: ignore the deployment because no web-relevant path changed;
- exit 1: build because a relevant path changed or the diff could not be trusted.

A file named `.vercel-deploy-trigger` is intentionally considered relevant and can be changed when a fresh production deployment must be requested after a temporary Hobby rate-limit window clears.

## Free ephemeral execution

`.github/workflows/free-tier-evidence.yml` runs on a standard GitHub-hosted `ubuntu-latest` runner. For this public repository, this is the zero-paid Runner substrate.

It verifies:
- signed Runner execution on a fresh VM;
- Vercel Sandbox adapter safety without allocating a sandbox;
- browser journey driver behavior;
- a real headless Chrome runtime;
- R3 driver safety without production mutation.

This workflow is substrate evidence, not a substitute for an R2 customer journey or a live provider R3 recovery drill.
