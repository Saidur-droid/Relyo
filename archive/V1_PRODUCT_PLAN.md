# ARCHIVED — Relyo V1 Product & Company Plan

> **Historical document only. DO NOT EXECUTE.**
>
> This file preserves the original Relyo V1 plan for decision history. V1 was superseded after a hostile red-team review because a founder-facing production-fixer/control-plane product was too vulnerable to bundling by builders, cloud platforms, security vendors, and observability vendors.
>
> The only executable company direction is **Relyo V2**. Start with `/V2_MASTER_PLAN.md` and `/AGENTS.md`.

---

# Relyo — Master Product & Company Plan (V1 historical text)

> **AI builds it. Relyo makes sure reality agrees.**

## 0. Executive Summary

Relyo is an **autonomous production control plane for AI-built software**.

AI coding tools increasingly make software creation abundant, but production trust remains scarce. An application can look complete while authentication is misconfigured, secrets are exposed, database policies are unsafe, payment webhooks are broken, emails never arrive, backups cannot restore, API costs exceed revenue, or real customer journeys fail after deployment.

Relyo exists to close that gap.

It discovers the complete production system around an application, repairs what can be repaired safely, requests explicit approval for sensitive actions, independently verifies real outcomes in production, and continuously proves the software remains secure, recoverable, cost-aware, and operational.

Relyo is **not** a generic coding agent, repo scanner, hosting company, observability dashboard, or desktop automation agent. It is the **independent control and verification layer between AI-generated software and the real world**.

The long-term category thesis is:

> **Machine-generated software needs an independent operating and trust layer. Relyo becomes that layer.**

---

# 1. Why This Company Should Exist

The software creation stack is changing rapidly:

```text
Human writes software
        ↓
AI assists
        ↓
AI writes large portions
        ↓
Agents build complete applications
        ↓
Agents deploy and operate software
```

The bottleneck therefore moves downstream.

Creating code becomes easier while verifying that the resulting business is safe, correctly configured, economically viable, recoverable, and actually working becomes harder.

The central product question is no longer only:

> Can AI build the app?

It becomes:

> Who independently proves the software, infrastructure, integrations, data, identity, payments, recovery paths, and business journeys actually work?

Relyo answers that question.

---

# 2. The Problem Is Much Larger Than Deployment

A typical AI-built application may depend on GitHub, Vercel, Supabase, OAuth providers, Stripe, Resend, Cloudflare, Nimiq, model APIs, queues, cron, object storage, analytics, billing, DNS, external APIs, and mobile stores.

Those are connectors. The actual production journey spans code, infrastructure, security, identity, database, payments, communications, DNS, deployment, real user flows, observability, backups, cost control, compliance, incident response, updates, scaling, and long-term survival.

---

# 3. Product Category

V1 defined Relyo as an **Autonomous Production Control Plane for AI-built software** that discovered systems, mapped dependencies, found blockers, repaired safe issues, asked for approvals, independently verified results, and continuously watched for breakage.

V1 explicitly rejected becoming another IDE, builder, desktop agent, scanner, deployment service, uptime monitor, security scanner, or DevOps dashboard.

---

# 4. Core Promise

```text
Connect Repository
+
Connect Accounts
+
Tell Relyo what the product is supposed to do
```

Then discover, repair, approve, deploy, verify, and continuously prove the business still works.

---

# 5. Production Graph

V1 introduced a live Production Graph connecting source, compute, database, identity, payments, AI, DNS, communications, critical journeys, environments, secrets, webhooks, storage, queues, cron, APIs, billing, recovery, rollback, and verification evidence.

---

# 6–10. V1 WOW Moments

V1 proposed four major experiences:

1. **Discover the Business** — reveal invisible dependencies and critical journeys.
2. **Repair, Not Just Report** — safely remediate production blockers with approval gates.
3. **Independent Verification** — fixing agents cannot grade their own work.
4. **Real Customer Simulation** — create disposable synthetic users and exercise end-to-end business journeys.

It also expanded verification beyond technical deployment into business behavior such as payment lifecycle, email deliverability, password reset, OAuth callbacks, analytics, cancellation, tax logic, support paths, restore readiness, cost viability, domain expiry, and external API drift.

---

# 11. Twelve Production Layers

V1 organized the product around:

- Code
- Security
- Identity
- Data
- Infrastructure
- Integrations
- Payments
- Communications
- Network
- Reliability
- Economics
- Business journeys

This conceptual coverage remains useful in V2, but the company category changed from production fixer to neutral proof infrastructure.

---

# 12–17. Cost, Recovery, Continuous Proof, Evidence

V1 treated variable-cost economics, tested recovery, continuous production contracts, a software-immune-system mental model, production confidence, and an Evidence Ledger as first-class features.

These ideas were retained and strengthened in V2 through explicit assurance levels and portable Production Passports.

---

# 18–20. Contracts, Moat, Network Learning

V1 already recognized that the moat must be deterministic Production/Verification Contracts, a Production Knowledge Graph, repair playbooks, evidence, and privacy-preserving operational failure patterns rather than prompts or any single LLM.

This became the foundation for V2's Proof Contract, Production Passport, Verified Failure Graph, and Trust Network.

---

# 21–24. Customer, Wedge, Providers, Competition

V1 targeted nontechnical/lightly technical founders first, with GitHub + Vercel + Supabase + Google/GitHub OAuth + Stripe + Resend + Cloudflare as the initial stack. It envisioned provider-neutral expansion and coexistence with builders, coding agents, clouds, databases, scanners, security, observability, and DevOps automation.

The red-team concluded coexistence was not enough. V2 makes upstream builders and model agents explicit customers/partners through a headless proof layer.

---

# 25–31. Market, Timing, Durability, Funding, Demo, Brand

V1 argued that software creation volume is exploding while trust/stability remain bottlenecks; that the durable question is who verifies autonomous software before and while it operates; that adjacent AI/developer infrastructure categories attract substantial venture capital; and that the investor demo should show discovery, repair, approvals, a synthetic customer journey, then a controlled failure and verified recovery.

The key brand idea was: **AI builds it. Relyo makes sure reality agrees.**

V2 keeps the spirit but sharpens the category line to: **AI builds it. Relyo proves it.**

---

# 32–45. UX, Safety, Architecture, Agents, MVP, Roadmap, Metrics, Business Model, Distribution, Principles, End State

V1 established important implementation principles that remain inherited by V2:

- outcome language over infrastructure jargon;
- one-click safe remediation;
- explicit sensitive approvals;
- evidence over confidence theater;
- founders should not become DevOps engineers;
- least privilege, scoped credentials, secret isolation, audit logs, rollback, deterministic contracts, tenant isolation, blast-radius controls;
- logical separation of discovery, planning, fixing, verification, recovery, cost, and policy;
- a narrow magical MVP before broad integrations;
- optimize for verified outcomes, not integration count;
- continuous proof and recovery matter after launch;
- never build our own IDE/model/cloud/browser merely to look complete.

The historical end-state vision was an independent production control and verification layer. V2 upgrades this into independent proof infrastructure that builders, coding agents, enterprises, procurement systems, marketplaces, and potentially insurers/auditors can consume.

---

# Why V1 Was Superseded

The hostile red-team found that a founder-facing production fixer can be bundled by Replit/Lovable/Cursor/Vercel, attacked by security and observability incumbents, and suffer dangerous privilege, liability, integration-maintenance, and unit-economics problems.

V2 therefore moves one layer deeper:

> **Relyo is the independent proof layer for machine-built software.**

Do not resume V1 implementation. The useful concepts above are inherited into V2 where they support proof, evidence, assurance, policy, remediation, or trust.
