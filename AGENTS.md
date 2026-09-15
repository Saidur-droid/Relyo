# AGENTS.md — Relyo Operating Instructions

This repository is the permanent source of truth for Relyo. Future AI agents and contributors must use repository documentation rather than relying on prior chat history.

## Read First

Before making product, architecture, roadmap, positioning, partnership, or go-to-market decisions, read in this order:

1. `README.md`
2. `STRATEGY_V2.md`
3. `RED_TEAM.md`
4. `PRODUCT_PLAN.md`
5. this file

If older documents conflict with `STRATEGY_V2.md`, the newer strategy takes precedence unless the founder explicitly changes it.

## Core Mission

Relyo is the **independent proof layer for machine-built software**.

The core promise is:

> **AI builds it. Relyo proves it.**

The long-term goal is not to beat Lovable, Replit, Cursor, Codex, Claude Code, model labs, clouds, or specialist security/observability vendors.

The strategic goal is to become neutral infrastructure those systems can consume.

## Constitutional Product Constraints

Do not silently turn Relyo into:

- a primary coding IDE;
- an app builder;
- a frontier-model company;
- a hosting platform;
- a generic desktop agent;
- only a repo scanner;
- only a deployment service;
- only an uptime/observability product;
- only a security scanner;
- a proprietary dashboard that cannot be consumed headlessly.

Prefer building capabilities that strengthen:

- Proof Contracts;
- Production Graph;
- Relyo Runner;
- independent verification;
- signed evidence;
- Production Passports;
- Proof API / SDK / MCP;
- policy and approvals;
- safe remediation;
- Continuous Proof;
- enterprise release governance;
- verified failure intelligence;
- builder/platform distribution.

## Platform Relationship Rule

Lovable, Replit, Cursor, Codex, Claude Code and future builders should be treated as potential:

- customers;
- upstream producers;
- distribution partners;
- integration surfaces;
- benchmark subjects;
- remediation consumers.

Do not create unnecessary strategic conflict by trying to own their core IDE/app-building user relationship.

Design major Relyo capabilities so they can be consumed through headless APIs, SDKs, CI, GitHub checks, webhooks, MCP, or white-label surfaces.

## Product Principles

Every major implementation decision should preserve these principles:

- provider-neutral architecture;
- independent verification of outcomes;
- evidence-backed verified states;
- scoped attestations rather than absolute safety claims;
- safe automation with explicit approval gates;
- rollback before risky changes where feasible;
- least-privilege access;
- plain-language UX for nontechnical founders;
- business journey verification, not just infrastructure checks;
- continuous proof after launch;
- cost and recovery as first-class production concerns;
- privacy-preserving operational learning;
- creator/fixer/verifier separation where practical;
- API-first control and browser automation only when necessary;
- interoperability with established provenance, telemetry, signing, and policy standards rather than reinventing them.

## Assurance Model

Prefer explicit assurance levels over opaque confidence marketing:

- `R0` — Discovered
- `R1` — Launch Verified
- `R2` — Business Verified
- `R3` — Resilience Verified
- `R4` — Continuous Proof

Every proof state must expose what was tested, against which release/environment, evidence references, verifier version, validity/expiry, and exclusions or unknowns.

## Definition of Done

A task is not complete because code compiles or an agent reports success.

For production-facing capabilities, completion should include as applicable:

1. implementation;
2. automated tests;
3. security review;
4. failure-path handling;
5. evidence collection;
6. independent verification;
7. rollback/recovery path;
8. documentation;
9. API/headless surface when strategically relevant;
10. a clear Proof Contract or contract impact.

## Execution Strategy

Prefer the smallest production-grade vertical slice that proves a complete outcome.

The first founder-facing stack can remain intentionally narrow:

- GitHub
- Vercel
- Supabase
- Google OAuth
- GitHub OAuth
- Stripe
- Resend
- Cloudflare

Do not expand integrations merely to increase connector count. New providers should be added when they materially increase proof coverage, distribution, customer value, or platform partnerships.

## Architecture Guidance

Business logic must live primarily in typed contracts, provider adapters, policy rules, deterministic verification steps, evidence envelopes, and signed release identity rather than free-form LLM prompts.

Models may assist with discovery, planning, classification, explanation, remediation generation, and ambiguous diagnosis, but deterministic systems should decide whether Proof Contracts pass.

Maintain logical separation between:

- discovery;
- planning;
- remediation;
- policy/approval;
- execution;
- verification;
- recovery;
- cost analysis;
- evidence/audit;
- attestation/passport issuance.

## Runner & Credential Security

Relyo may influence privileged production systems. Security is therefore part of the product itself.

Prefer:

- isolated runners;
- outbound-only connectivity where feasible;
- provider-native OAuth/app installations;
- short-lived credentials;
- scoped capability tokens;
- customer KMS/private-runner options;
- secrets referenced rather than injected into model context;
- signed task/evidence envelopes;
- immutable/tamper-evident audit events;
- automatic rollback checkpoint before high-risk changes.

Never commit real credentials, API keys, OAuth secrets, seed phrases, private keys, or customer production secrets to this repository.

Consequential actions must be classified as automatic, approval-gated, human-only, or forbidden.

## Open Standard Strategy

Relyo should be willing to open the interoperability layer when doing so increases adoption and trust.

Potential open artifacts include:

- Proof Contract specification;
- Production Passport schema;
- adapter SDK;
- local verifier;
- evidence envelope format;
- conformance tests.

Commercial differentiation should come from the hosted control plane, trust network, signed verifier infrastructure, enterprise governance, cross-provider orchestration, historical verified failure data, premium contract packs, fleet analytics, and distribution.

## Product Language

Default user-facing copy to outcomes rather than infrastructure jargon.

Prefer:

> GitHub Login isn't connected yet.

Over:

> `GITHUB_CLIENT_SECRET` is missing from the production environment.

Technical detail must remain available for advanced users and evidence/audit views.

## Roadmap Discipline

Before creating a large feature, answer:

1. Does this improve independent proof?
2. Does this improve portability of evidence?
3. Does this make a builder/platform more likely to integrate Relyo?
4. Does this increase trust or governance across multiple producers/providers?
5. Does this create verified failure intelligence?
6. Could this be supplied better by an existing tool that Relyo should integrate instead of rebuild?

Avoid generic capabilities better supplied by coding agents, browser tools, clouds, security vendors, observability platforms, or infrastructure providers.

## Continuity Rule

At the end of meaningful work, update repository documentation, issues, roadmap state, or decision records so the next agent can continue without prior conversation context.

The repository, not any chat, is the project memory.
