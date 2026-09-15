# ADR 0001 — Initial Technical Foundation

- Status: Accepted
- Date: 2026-09-15

## Context

Relyo needs a typed, auditable foundation for Proof Contracts, evidence, provider adapters, web/API surfaces, and isolated runners. The repository previously contained strategy only.

## Decision

Use a TypeScript-first pnpm monorepo for the initial product.

Initial structure:

- `packages/kernel` — deterministic trust domain;
- future `packages/contracts` — versioned Proof Contracts;
- future `packages/adapters` — provider integrations;
- future `apps/web` — public/product UI and control plane;
- future `apps/runner` — isolated proof execution;
- future SDK/CLI/MCP packages.

Use Node.js 22-compatible runtime targets.

The Trust Kernel must not require an LLM to decide final verification state.

## Why

- one language across web/API/SDK/CLI accelerates early execution;
- strong type system improves contract/evidence correctness;
- mature ecosystem for Next.js, Playwright, GitHub, Vercel, Stripe, and provider APIs;
- easier early hiring and open-source distribution;
- the architecture can later introduce Rust/Go/specialized runtimes for runner/security-sensitive workloads without changing proof semantics.

## Consequences

Positive:

- faster MVP;
- shared types;
- easier headless distribution;
- simpler monorepo.

Risks:

- Node/TypeScript may not be the final runtime for all isolated runner workloads;
- security boundaries must not rely solely on language-level safety;
- package boundaries must remain strict to avoid a monolith.

## Revisit triggers

Revisit when:

- runner isolation/performance requires another runtime;
- enterprise self-hosted deployment makes Go/Rust operationally superior;
- measured build/tooling complexity becomes a drag;
- security threat model identifies runtime-specific requirements.
