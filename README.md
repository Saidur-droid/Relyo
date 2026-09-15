# Relyo

> **AI builds it. Relyo proves it.**

Relyo is the **independent proof layer for machine-built software**.

It discovers how a software product actually works across code, infrastructure, identity, data, payments, communications, domains, third-party APIs, cost, recovery, and real user journeys; evaluates versioned Proof Contracts; safely remediates selected failures; independently verifies outcomes; and issues portable evidence-backed Production Passports.

Relyo is designed so AI builders, coding agents, model providers, clouds, enterprises, founders, agencies, marketplaces, auditors, and future autonomous software systems can all consume the same neutral verification layer.

## ACTIVE VERSION

**Relyo V2 is the only executable company/product plan. V1 is historical and must not be implemented.**

If you are a developer or AI agent arriving here months or years later, read these files in this exact order before doing meaningful work:

1. [`AGENTS.md`](./AGENTS.md) — mandatory operating rules.
2. [`V2_MASTER_PLAN.md`](./V2_MASTER_PLAN.md) — canonical company/product/market/moat/funding plan.
3. [`V2_EXECUTION_PLAN.md`](./V2_EXECUTION_PLAN.md) — ordered implementation roadmap and definition of done.
4. [`RED_TEAM.md`](./RED_TEAM.md) — ways the company can die and the defenses V2 must preserve.
5. [`STRATEGY_V2.md`](./STRATEGY_V2.md) — strategic design detail supporting the master plan.

`PRODUCT_PLAN.md` is a deprecation pointer. The original V1 plan is preserved only for history in `archive/V1_PRODUCT_PLAN.md`.

## Strategic position

Relyo is **not** trying to become another Lovable, Replit, Cursor, Codex, Claude Code, hosting platform, generic DevOps agent, repo scanner, or monitoring dashboard.

Those systems are upstream producers, downstream providers, signal sources, distribution partners, and potential customers.

> **Do not build a company that must beat every AI builder. Build infrastructure every AI builder is better off using.**

## Core V2 primitives

- **Production Graph** — living model of the application and dependencies.
- **Proof Contracts** — deterministic definitions of what must be true.
- **Relyo Runner** — isolated execution close to customer infrastructure.
- **Independent Verifier** — reproduces outcomes instead of trusting agent claims.
- **Production Passport** — signed portable evidence for an exact release/environment.
- **Proof API / SDK / MCP** — lets builders and agents call Relyo headlessly.
- **Policy & Approval Engine** — separates safe automation from consequential actions.
- **Continuous Proof** — degrades or restores assurance as production reality changes.
- **Verified Failure Graph** — privacy-safe intelligence learned from verified failures and repairs.

## Initial wedge

The first production-grade vertical slice stays deliberately narrow:

- GitHub
- Vercel
- Supabase
- Google OAuth / GitHub OAuth
- Stripe test mode
- Resend
- Cloudflare

The goal is not connector count. The goal is a magical flow:

```text
AI-built SaaS
→ connect repo
→ discover system
→ find hidden production failures
→ safely repair supported failures
→ independently run a real synthetic customer journey
→ issue signed Production Passport
```

## North-star outcome

A capability is not complete because code compiles, deployment succeeds, or an agent says “done.”

It is complete only when Relyo can independently reproduce the desired outcome and attach inspectable evidence to that exact release and environment.

> **The winning end state is not “Relyo built this app.” It is “This software can be trusted because Relyo independently proved the claims that matter.”**
