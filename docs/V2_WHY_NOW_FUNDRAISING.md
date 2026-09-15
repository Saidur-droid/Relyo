# Relyo V2 — Why Now, Billion-Dollar Path, Fundraising Strategy

> **Status:** Active V2 reference document.
>
> Future developers and AI agents must treat this as supporting strategy for `V2_MASTER_PLAN.md` and `V2_EXECUTION_PLAN.md`.

---

## 1. Why Now

Relyo exists because the software industry is moving from human-written software to machine-produced software.

The important shift is not only that AI writes code. The deeper shift is that **the number of applications, releases, integrations, and autonomous changes is increasing faster than human verification capacity**.

Current market signals:

- GitHub reported more than **180M developers**, more than **36M new developers in one year**, and nearly **80% of new developers using Copilot in their first week**.
- Vercel reported that in early 2026 more than **30% of deployments were initiated by coding agents**, and later updated that share to **more than 50% as of September 2026**.
- Lovable reported **60M+ projects** created and roughly **900M monthly visits** to apps built on its platform.
- AI builders, coding agents, model providers, deployment platforms, MCP runtimes, agent authorization layers, and developer infrastructure companies are raising large rounds.

The strategic meaning:

```text
More AI builders
        ↓
More AI-built apps
        ↓
More deployments
        ↓
More third-party integrations
        ↓
More autonomous changes
        ↓
More silent production failures
        ↓
More need for independent proof
```

Relyo is timed for the moment when creation becomes abundant and trust becomes scarce.

---

## 2. The Hard User Problem

The hardest user problem is not simply missing environment variables, OAuth callbacks, or Stripe webhooks.

The hard problem is:

> **The founder, team, buyer, or platform does not know which parts of machine-built software can actually be trusted.**

A product can look complete while hidden failures remain:

```text
Can a new user actually register?
Can Google OAuth work in production?
Can a paid customer access the paid feature?
Does a cancelled customer lose access?
Can another user read private data?
Does email arrive in inbox?
Can the database restore?
Can the release roll back?
Is a secret exposed?
Is one customer costing more than they pay?
Did an AI agent fix one flow while breaking another?
```

Traditional tools see slices of this:

- GitHub sees code.
- Vercel sees deployments.
- Supabase sees database state.
- Stripe sees payments.
- Sentry sees runtime errors.
- Snyk sees vulnerabilities.

Relyo's opportunity is to answer the whole-system question:

> **Can this exact release, in this exact environment, perform the business outcomes it claims to perform, with inspectable evidence?**

---

## 3. Why This Can Become a Billion-Dollar Company

Relyo should not be valued only as a founder SaaS tool.

If Relyo remains a $49/month dashboard for founders, it can become a good business but probably not a category-defining company.

The billion-dollar path comes from becoming **independent proof infrastructure**.

### 3.1 Usage-based proof infrastructure

Every AI-generated release, agent change, deployment, recovery drill, critical user journey, and production contract can trigger a proof run.

The usage unit is not a seat.

The usage unit is:

```text
software change → proof requirement → verified outcome
```

As AI builders create more software, proof demand scales with them.

### 3.2 Enterprise release governance

Enterprises will use multiple producers:

```text
Cursor
Codex
Claude Code
GitHub Copilot
Internal coding agents
Human teams
Contractors
External vendors
```

They will not want a separate trust system for every creator.

A simple policy can become valuable:

```text
Production requires Relyo R3.
```

That turns Relyo into a neutral release gate across all software producers.

### 3.3 Builder/platform distribution

Lovable, Replit, Cursor, Codex, Claude Code and future builders should not be treated as enemies.

They can be customers and distribution partners:

```text
Builder creates release
        ↓
Relyo Proof API
        ↓
Production Passport
        ↓
Builder displays independent verification
```

A builder gains fewer failed launches, lower support burden, stronger enterprise trust, and independent quality evidence.

Relyo gains proof volume and distribution.

### 3.4 Trust network

The largest outcome is a network where buyers, enterprises, marketplaces, agencies, auditors, insurers, and infrastructure providers can consume Production Passports.

If a software release without portable proof starts to feel incomplete, Relyo becomes more than SaaS. It becomes trust infrastructure.

---

## 4. Illustrative Revenue Paths

These are not forecasts. They show how a large outcome can be mathematically possible.

### Enterprise governance path

```text
1,000 enterprise customers
× $100,000/year
= $100M ARR
```

### Usage-based proof path

```text
50M proof runs/year
× $1 average net revenue per proof run
= $50M revenue
```

### Platform contract path

```text
50 builders/platforms
× $500,000/year average
= $25M revenue
```

Combined illustrative mature scale:

```text
$100M + $50M + $25M = $175M annual revenue
```

At that scale, a billion-dollar valuation can be possible depending on growth, retention, gross margin, market conditions, and strategic importance.

---

## 5. The Real Moat

The LLM is not the moat.

The dashboard is not the moat.

The first integrations are not the moat.

The moat must become a stack:

| Moat | Why it matters |
|---|---|
| Proof Contracts | Standardized definitions of what must be true |
| Production Passports | Portable signed proof attached to releases |
| Relyo Runner | Trusted execution near customer infrastructure |
| Verified Failure Graph | Real failure → root cause → repair → verified outcome data |
| Platform Distribution | Builders call Relyo inside their own workflows |
| Enterprise Policy | Relyo becomes the release gate across multiple agents |
| Trust Reputation | "Relyo Verified" becomes meaningful |
| Network Effects | More proof issuers and consumers increase value |

The most important AI-specific moat is the **Verified Failure Graph**:

```text
producer type
+ stack fingerprint
+ release change
+ failure signature
+ root cause
+ repair class
+ verification result
```

Over time Relyo can learn patterns such as:

```text
Vercel + Supabase + Google OAuth + Next.js
→ recurring callback/env/RLS failures
→ proven repair playbooks
→ probability of success
→ contracts that catch regressions before production
```

A new competitor cannot copy this with prompts alone.

---

## 6. Fundraising Order

Funding should follow proof, not just vision.

Recommended immediate order:

```text
V2 MVP build
→ killer live demo
→ 10 design partners
→ PearX / Bangladesh Angels / Antler / YC applications
→ $1M–$2M pre-seed target
```

### Best first funding routes

| Priority | Source | Why |
|---|---|---|
| 1 | Bangladesh Angels Network | local access, early credibility, founder-friendly first conversations |
| 2 | PearX | strong fit for AI infrastructure / developer infrastructure, can invest $500K–$2M |
| 3 | Antler Singapore | regional proximity, global network, pre-seed path |
| 4 | YC | strongest accelerator brand, founder network, devtools credibility |
| 5 | Conviction / AI-native funds | best after a sharp demo and early usage |
| 6 | AI Grant | strong fit when open, technical AI infrastructure angle |
| 7 | OpenVC + operator angels | useful for systematic investor outreach |

Do not rely on random wealthy angels. Prioritize operators from developer infrastructure, security, AI infrastructure, identity, payments, observability, databases, and cloud platforms.

---

## 7. What Must Exist Before a Serious Round

A strong fundraising attempt needs more than strategy.

Target minimum evidence:

1. Working Relyo V2 MVP.
2. GitHub + Vercel + Supabase stack support.
3. One complete Proof Contract flow.
4. A signed Production Passport.
5. A synthetic customer journey.
6. Safe remediation for selected blockers.
7. Evidence ledger.
8. 10–20 real AI-built apps tested.
9. At least 5 design partners.
10. One killer metric.

Example killer metrics to prove with real data:

```text
Relyo caught production blockers in 72% of connected AI-built apps.
```

or:

```text
Relyo reduced connect-to-verified-production from 2 days to 11 minutes.
```

These examples are hypotheses until real product data proves them.

---

## 8. Investor Story

Do not pitch:

> AI apps have bugs and we fix them.

Pitch:

> The world is moving from human-written software to machine-produced software. Creation is becoming effectively unlimited. Trust is not. Relyo is building the independent proof infrastructure every machine-generated release can pass through before the real world trusts it.

The five-slide logic:

1. AI made software creation abundant.
2. Trust, safety, configuration, recovery, and business verification did not scale.
3. Relyo is the independent proof layer.
4. Every builder and agent can call Relyo instead of competing with it.
5. Production Passports can become the trust artifact for machine-built software.

---

## 9. The Killer Demo Required for Funding

The fundraising demo should show three things live.

### Demo A — Broken AI-built app

```text
Relyo discovers dependencies
→ finds launch blockers
→ safely repairs supported blockers
→ asks for approvals
→ verifies real user journeys
→ issues Production Passport
```

### Demo B — External agent calls Relyo

```text
Codex/Cursor/Claude finishes change
→ calls Relyo API/MCP
→ Relyo rejects with evidence
→ agent fixes issue
→ Relyo verifies
→ production authorization issued
```

### Demo C — Trust break and recovery

```text
Production contract breaks
→ Relyo degrades Passport
→ isolates root cause
→ rollback or repair
→ re-verifies
→ Passport restored
```

The demo should make investors feel they are seeing not another tool, but a new layer of software trust.

---

## 10. Positioning From Bangladesh

Relyo should not be positioned as a local-market startup.

Correct positioning:

> Built by a founder from Bangladesh. Built for the global software ecosystem.

Target customers are global builders, founders, agencies, engineering teams, and enterprises.

Local angels can help with early credibility, but the company must be architected and narrated as a global developer infrastructure company from day one.

---

## 11. Execution Rule

Do not chase fundraising before the product produces proof.

The correct order is:

```text
V2 Trust Kernel
→ Proof Contract
→ Relyo Runner v0
→ Evidence Ledger
→ Production Passport
→ one magical founder flow
→ 10 design partners
→ fundraising
```

The product must make the strategy undeniable.
