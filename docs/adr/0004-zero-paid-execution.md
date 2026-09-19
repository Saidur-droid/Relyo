# ADR 0004 — Zero-paid execution path

Status: Accepted

## Context

Relyo must remain usable on a zero-paid infrastructure path. Vercel Hobby can temporarily reject deployment builds when its build-rate allocation is exhausted. Vercel Sandbox and some rollback features can also require billable or higher-plan capabilities.

The repository is public, and GitHub documents standard GitHub-hosted runners for public repositories as free. Each standard hosted job also receives a fresh VM.

## Decision

1. **Vercel remains the production web host on Hobby**, but automatic builds are filtered with a repository-owned `ignoreCommand`.
   - A deployment is built only when `apps/web`, Vercel/root build configuration, the lockfile, or a transitive workspace dependency of `@relyo/web` changes.
   - Internal V2 packages that are not imported by the web app no longer consume Vercel Hobby builds.
   - If the affected-file calculation is uncertain, the safe default is to build.

2. **GitHub standard hosted Ubuntu runners are the zero-paid ephemeral execution backend** for development and CI evidence.
   - No larger runner is used.
   - No paid Vercel Sandbox allocation is required for the free path.
   - The existing Vercel Sandbox adapter remains available as an optional managed backend when a deployment is explicitly allowed to spend.

3. **R2/R3 live production assurance is not faked.**
   - Fresh-VM runner and real-browser runtime smokes prove the execution substrate.
   - A customer R2 Passport still requires a real journey specification against a target app.
   - A production/provider R3 Passport still requires a safe supported recovery target; deterministic adapter tests alone do not claim R3.

## Security

The free CI evidence workflow:
- has read-only repository contents permission;
- receives no production provider secrets;
- allocates no external sandbox;
- mutates no production provider state;
- uploads no billable artifacts.

## Why

This preserves the trust model while preventing free-tier users from being forced into a paid compute dependency merely to exercise the Runner/browser substrate.
