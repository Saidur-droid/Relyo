# AGENTS.md — Relyo V2 Operating Instructions

This repository is the permanent source of truth for Relyo. Future AI agents and contributors must use repository documentation rather than relying on prior chat history.

## ACTIVE VERSION — MANDATORY

**Relyo V2 is the only executable strategy and product plan. V1 is historical and must not be implemented.**

If any older document, issue, branch, comment, prompt, or stale plan conflicts with V2, V2 wins unless the founder explicitly creates a new written strategic decision that supersedes it.

## Read First — exact order

Before making product, architecture, roadmap, positioning, partnership, fundraising, pricing, growth, or go-to-market decisions, read:

1. `README.md`
2. `V2_MASTER_PLAN.md`
3. `V2_EXECUTION_PLAN.md`
4. `RED_TEAM.md`
5. `STRATEGY_V2.md`
6. this file

`PRODUCT_PLAN.md` is deprecated and exists only as a pointer. `archive/V1_PRODUCT_PLAN.md` is historical context only.

## Core Mission

Relyo is the **independent proof layer for machine-built software**.

> **AI builds it. Relyo proves it.**

The long-term goal is not to beat Lovable, Replit, Cursor, Codex, Claude Code, model labs, clouds, or specialist security/observability vendors.

The strategic goal is to become neutral proof infrastructure those systems can consume.

## Constitutional Product Constraints

Do not silently turn Relyo into:

- a primary coding IDE;
- an app builder;
- a frontier-model company;
- a hosting platform;
- a generic desktop agent;
- a generic browser agent;
- only a repo scanner;
- only a deployment service;
- only an uptime/observability product;
- only a security scanner;
- a proprietary dashboard that cannot be consumed headlessly.

Prefer capabilities that strengthen:

- Production Graph;
- Proof Contracts;
- Relyo Runner;
- independent verification;
- signed evidence;
- Production Passports;
- Proof API / SDK / MCP / CI;
- policy and approvals;
- safe remediation;
- Continuous Proof;
- enterprise release governance;
- Verified Failure Graph intelligence;
- builder/platform distribution;
- third-party consumption of proof.

## Platform Relationship Rule

Lovable, Replit, Cursor, Codex, Claude Code and future builders should be treated as potential:

- customers;
- upstream software producers;
- distribution partners;
- integration surfaces;
- benchmark subjects;
- remediation consumers.

Do not create unnecessary strategic conflict by trying to own their primary IDE/app-building user relationship.

Design major Relyo capabilities so they can be consumed through APIs, SDKs, CI, GitHub checks, webhooks, MCP, or white-label surfaces.

## Product Principles

Every major implementation decision must preserve:

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
- interoperability with established provenance, telemetry, signing, and policy standards;
- deterministic pass/fail logic outside free-form model judgment.

## Assurance Model

Use explicit assurance levels:

- `R0` — Discovered
- `R1` — Launch Verified
- `R2` — Business Verified
- `R3` — Resilience Verified
- `R4` — Continuous Proof

Every proof state must expose what was tested, against which release/environment, evidence references, verifier version, validity/expiry, and exclusions/unknowns.

Never claim that Relyo proves absence of all defects or that software is “100% safe.”

## Risk Classification

Every production action must be assigned one of:

- `OBSERVE`
- `SAFE_REVERSIBLE`
- `APPROVAL_REQUIRED`
- `HUMAN_ONLY`
- `FORBIDDEN`

High-risk mutation should follow:

```text
observe
→ calculate blast radius
→ create rollback/restore point
→ stage/shadow test where possible
→ obtain approval when required
→ apply smallest change
→ independently verify
→ revert if proof fails
```

## Definition of Done

A task is not complete because code compiles, a PR merges, a deployment reports READY, or an agent says success.

For production-facing capabilities, completion should include as applicable:

1. implementation;
2. automated tests;
3. security/threat review;
4. failure-path handling;
5. explicit risk classification;
6. evidence collection;
7. independent verification;
8. rollback/recovery path;
9. metrics/observability;
10. documentation;
11. API/headless surface when strategically relevant;
12. a clear Proof Contract or contract impact;
13. continuity update for the next developer/agent.

## Execution Strategy

Execute `V2_EXECUTION_PLAN.md` in sequence unless evidence justifies reprioritization.

The first production-grade vertical slice remains intentionally narrow:

- GitHub
- Vercel
- Supabase
- Google OAuth
- GitHub OAuth
- Stripe test mode
- Resend
- Cloudflare

Do not expand integrations merely to increase connector count. New providers should be added only when they materially increase proof coverage, distribution, customer value, or platform partnerships.

The first magical outcome is:

```text
AI-built SaaS
→ connect repo
→ discover system
→ find hidden production failures
→ safely repair a small supported set
→ independently run a synthetic customer journey
→ issue signed Production Passport
```

## Architecture Guidance

Business truth must live primarily in:

- typed Proof Contracts;
- provider adapters;
- policy rules;
- deterministic verification steps;
- evidence envelopes;
- release/environment identity;
- signed Production Passports.

Models may assist with discovery, planning, classification, explanation, remediation generation, and ambiguous diagnosis. Models must not unilaterally decide final VERIFIED status.

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
- passport issuance.

## Runner & Credential Security

Relyo may influence privileged production systems. Security is part of the product itself.

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

## Open Standard Strategy

Relyo should be willing to open interoperability layers when doing so increases adoption and trust.

Potential open artifacts:

- Proof Contract specification;
- Production Passport schema;
- adapter SDK;
- local verifier;
- evidence envelope format;
- conformance tests.

Commercial differentiation should come from:

- hosted control plane;
- trust network;
- verifier infrastructure;
- enterprise governance;
- cross-provider orchestration;
- Verified Failure Graph;
- premium contract packs;
- fleet analytics;
- distribution and external passport acceptance.

## Product Language

Default user-facing copy to outcomes rather than infrastructure jargon.

Prefer:

> GitHub Login isn't connected yet.

Over:

> `GITHUB_CLIENT_SECRET` is missing from the production environment.

Technical detail must remain available for advanced users and evidence/audit views.

## Metrics Discipline

Do not optimize primarily for scans, integrations, or dashboard MAU.

Important metrics include:

- Verified Production Outcomes;
- verified releases;
- verified critical journeys;
- external builder/API-initiated proof percentage;
- Production Passport consumers;
- time to R1/R2;
- false VERIFIED rate;
- auto-remediation success;
- rollback success;
- cost per verified contract/release;
- apps under Continuous Proof;
- releases gated by Relyo policy.

The sacred quality metric is the false VERIFIED rate. Drive it toward zero.

## Roadmap Discipline

Before creating a large feature, answer:

1. Does this improve independent proof?
2. Does this improve evidence portability?
3. Does this make a builder/platform more likely to integrate Relyo?
4. Does this increase trust/governance across producers/providers?
5. Does this create Verified Failure Graph intelligence?
6. Does this improve proof economics?
7. Could an existing specialist product supply this better than Relyo rebuilding it?

Avoid generic capabilities better supplied by coding agents, browser tools, clouds, security vendors, observability platforms, testing tools, or infrastructure providers.

## Red-Team Requirement

Read `RED_TEAM.md` before any strategy that changes Relyo's category, privilege model, remediation autonomy, standards strategy, or platform relationship.

The V1 founder-facing production-fixer thesis was rejected because builders can bundle it, production privilege is dangerous, connector breadth can destroy economics, and self-reported verification is weak. Do not accidentally recreate V1 under a new feature name.

## Continuity Rule

At the end of meaningful work, update repository documentation, issues, roadmap state, ADRs, or execution status so the next developer/agent can continue without prior conversation context.

If strategy changes, update at minimum:

- `V2_MASTER_PLAN.md`
- `V2_EXECUTION_PLAN.md`
- `README.md`
- this `AGENTS.md`

The repository, not any chat, is the project memory.
