# Relyo

> **AI builds it. Relyo proves it.**

Relyo is the **independent proof layer for machine-built software**.

It discovers how a software product actually works across code, infrastructure, identity, data, payments, communications, domains, third-party APIs, cost, recovery, and real user journeys; evaluates versioned Proof Contracts; safely remediates selected failures; independently verifies outcomes; and issues portable evidence-backed Production Passports.

Relyo is designed so AI builders, coding agents, model providers, clouds, enterprises, founders, agencies, marketplaces, auditors, and future autonomous software systems can all consume the same neutral verification layer.

## Strategic position

Relyo is **not** trying to become another Lovable, Replit, Cursor, Codex, Claude Code, hosting platform, generic DevOps agent, repo scanner, or monitoring dashboard.

Those systems are upstream producers, downstream providers, signal sources, distribution partners, and potential customers.

The company goal is simple:

> **Do not build a company that must beat every AI builder. Build infrastructure every AI builder is better off using.**

## Core product primitives

- **Proof Contracts** — versioned definitions of what must be true.
- **Production Graph** — a live model of the software and its dependencies.
- **Relyo Runner** — isolated execution close to customer infrastructure.
- **Independent Verifier** — reproduces outcomes instead of trusting self-reported agent success.
- **Production Passport** — signed, portable evidence for a release.
- **Proof API / SDK / MCP** — lets builders and agents call Relyo headlessly.
- **Policy & Approval Engine** — separates safe automation from consequential actions.
- **Continuous Proof** — degrades or restores trust as production reality changes.

## Canonical strategy

Read these before product or architecture work:

1. [`STRATEGY_V2.md`](./STRATEGY_V2.md) — canonical company strategy and endgame.
2. [`RED_TEAM.md`](./RED_TEAM.md) — hostile analysis of how the company can die and the defenses required.
3. [`PRODUCT_PLAN.md`](./PRODUCT_PLAN.md) — detailed baseline product plan and operating model.
4. [`AGENTS.md`](./AGENTS.md) — mandatory instructions for future AI agents and contributors.

If an older document conflicts with `STRATEGY_V2.md`, the newer strategy takes precedence unless the founder explicitly changes it.

## Initial wedge

The first founder-facing release can support a narrow production stack:

- GitHub
- Vercel
- Supabase
- Google OAuth / GitHub OAuth
- Stripe
- Resend
- Cloudflare

But the architecture must be provider-neutral from day one.

The founder product is the wedge. The long-term company is infrastructure.

## North-star outcome

A capability is not complete because code compiles, deployment succeeds, or an agent says “done.”

It is complete only when Relyo can independently reproduce the desired outcome and attach inspectable evidence to that exact release and environment.

> **The winning end state is not “Relyo built this app.” It is “This software can be trusted because Relyo independently proved it.”**
