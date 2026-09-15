# AGENTS.md — Relyo Operating Instructions

This repository is the permanent source of truth for Relyo. Future AI agents and contributors must use the repository documentation rather than relying on prior chat history.

## Read First

Before making product, architecture, roadmap, or positioning decisions, read:

1. `README.md`
2. `PRODUCT_PLAN.md`
3. this file

## Core Mission

Relyo is the independent production control and verification layer for AI-built and eventually autonomous software.

The core promise is:

> **AI builds it. Relyo makes sure reality agrees.**

Do not silently reduce Relyo into a repo scanner, deployment tool, monitoring dashboard, generic coding agent, or generic desktop agent.

## Product Principles

Every major implementation decision should preserve these principles:

- provider-neutral architecture;
- independent verification of outcomes;
- evidence-backed `VERIFIED` states;
- safe automation with explicit approval gates;
- rollback before risky changes where feasible;
- least-privilege access;
- plain-language UX for nontechnical founders;
- business journey verification, not just infrastructure checks;
- continuous proof after launch;
- cost and recovery as first-class production concerns;
- privacy-preserving operational learning.

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
8. documentation.

## Execution Strategy

Prefer the smallest production-grade vertical slice that proves a complete outcome.

The first supported production stack is intentionally narrow:

- GitHub
- Vercel
- Supabase
- Google OAuth
- GitHub OAuth
- Stripe
- Resend
- Cloudflare

Do not expand integrations merely to increase connector count. New providers should be added when they materially increase verified outcome coverage.

## Architecture Guidance

Business logic must live primarily in typed contracts, provider adapters, policy rules, and deterministic verification steps rather than free-form LLM prompts.

Models may assist with discovery, planning, classification, explanation, and remediation generation, but deterministic systems should decide whether production contracts pass.

Maintain logical separation between:

- discovery;
- planning;
- remediation;
- policy/approval;
- verification;
- recovery;
- cost analysis;
- evidence/audit.

## Security

Relyo will handle privileged production access. Security is therefore a core product feature.

Never commit real credentials, API keys, OAuth secrets, seed phrases, private keys, or customer production secrets to this repository.

Prefer scoped OAuth and provider-issued integrations over raw long-lived credentials. Secrets should be encrypted, isolated, auditable, rotatable, and kept out of model context when possible.

Consequential actions must be classified as automatic, approval-gated, or human-only.

## Product Language

Default user-facing copy to outcomes rather than infrastructure jargon.

Prefer:

> GitHub Login isn't connected yet.

Over:

> `GITHUB_CLIENT_SECRET` is missing from the production environment.

Technical detail should remain available for advanced users and audit evidence.

## Roadmap Discipline

Before creating large new features, verify that they strengthen one of Relyo's unique advantages:

- Production Graph;
- Production/Verification Contracts;
- automated safe remediation;
- independent evidence;
- real-customer simulation;
- continuous proof;
- recovery;
- cost intelligence;
- operational knowledge graph.

Avoid building generic capabilities that are better supplied by existing coding agents, browsers, clouds, or infrastructure platforms.

## Continuity Rule

At the end of meaningful work, update repository documentation, issues, or roadmap state so the next agent can continue without needing prior conversation context.

The repository, not any chat, is the project memory.
