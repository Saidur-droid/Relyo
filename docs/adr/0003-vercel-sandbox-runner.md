# ADR 0003 — Managed Runner on Vercel Sandbox

Status: Accepted for managed Runner v0 integration

## Decision

Relyo's managed Runner uses Vercel Sandbox as the first real ephemeral remote execution backend.

The adapter:

- verifies Relyo's signed Runner task envelope before allocating remote compute;
- creates a non-persistent Node 24 sandbox;
- defaults to deny-all egress unless the task declares `network:outbound`;
- converts the explicit task host allowlist into Vercel Sandbox network policy;
- executes the command without introducing a shell wrapper;
- passes only task-scoped environment variables;
- requests bounded command timeout and log capture;
- redacts declared and environment secret values from retained logs;
- records provider session/command identity, region, runtime, allowlist and log digest as evidence;
- signs the result with an independent runner Ed25519 key;
- always requests sandbox stop in a finally block.

## Authentication

Production should use a short-lived project-scoped Vercel OIDC token where available. A long-lived access token is an operational fallback only and must remain server-side.

## Cost boundary

Sandbox allocation may be billable. Relyo must not allocate a production sandbox merely to prove configuration readiness or during unit/CI tests. Live evidence runs are an explicit execution event.

## Exit criterion

The managed Runner milestone is complete only after:

1. adapter CI is green;
2. a real sandbox session executes a signed task;
3. the result signature verifies independently;
4. remote evidence is persisted;
5. the sandbox is observed stopped after execution.

Until a live provider session is captured, the adapter is production-code-complete but the managed Runner production evidence gate remains open.
