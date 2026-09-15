# Relyo — Master Product & Company Plan

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

A typical AI-built application may depend on:

```text
GitHub
Vercel
Supabase
GitHub OAuth
Google OAuth
Stripe
Resend
Cloudflare
Nimiq
OpenAI / Anthropic / Gemini
Queues
Cron
Object storage
Analytics
Billing
DNS
External APIs
Mobile stores
```

But those are only connectors. The actual production journey is broader:

```text
IDEA
 ↓
AI BUILD
 ↓
CODE
 ↓
INFRASTRUCTURE
 ↓
SECURITY
 ↓
IDENTITY
 ↓
DATABASE
 ↓
PAYMENTS
 ↓
EMAIL / SMS
 ↓
DOMAIN / DNS
 ↓
DEPLOYMENT
 ↓
REAL USER FLOWS
 ↓
OBSERVABILITY
 ↓
BACKUPS
 ↓
COST CONTROL
 ↓
COMPLIANCE
 ↓
INCIDENT RESPONSE
 ↓
UPDATES
 ↓
SCALING
 ↓
STILL WORKING MONTHS LATER?
```

Relyo must be designed around this complete lifecycle, not around one cloud provider or one framework.

---

# 3. Product Category

## 3.1 What Relyo Is

**Autonomous Production Control Plane for AI-built software.**

Relyo:

1. Discovers how the production system actually works.
2. Maps all external dependencies and critical journeys.
3. Finds launch blockers and hidden operational risks.
4. Fixes safe issues automatically.
5. Requests approval for sensitive or irreversible operations.
6. Independently verifies the result.
7. Continuously watches for production contract breakage.
8. Repairs, rolls back, or escalates when needed.

## 3.2 What Relyo Is Not

Relyo should not become:

- another Cursor / Claude Code / Codex competitor;
- another Lovable / Replit app builder;
- a generic desktop agent like Hermes or Manus;
- only a repo scanner;
- only a deployment service;
- only an uptime monitor;
- only a security scanner;
- only a DevOps dashboard.

Those products may become upstream tools or connectors for Relyo.

---

# 4. Core Promise

The user experience should be as simple as:

```text
Connect Repository
+
Connect Accounts
+
Tell Relyo what the product is supposed to do
```

Relyo then produces and maintains a verified model of the business.

The desired end state is:

> **Connect your AI-built app → Relyo discovers the production system → repairs what is safe to repair → asks for approval where required → deploys and verifies real customer journeys → continuously proves the business still works.**

---

# 5. The Production Graph

The **Production Graph** is the heart of the system.

It is not just a list of integrations. It is a live dependency graph connecting code, infrastructure, credentials, data, business actions, and verification evidence.

Example:

```text
Application
│
├── Source
│   └── GitHub
│
├── Compute
│   └── Vercel
│
├── Database
│   └── Supabase
│
├── Identity
│   ├── GitHub OAuth
│   ├── Google OAuth
│   └── Session encryption
│
├── Payments
│   ├── Stripe
│   └── Nimiq
│
├── AI
│   └── Gemini
│
├── DNS
│   └── Cloudflare
│
├── Communications
│   └── Resend
│
└── Critical Journeys
    ├── Sign up
    ├── Login
    ├── Create resource
    ├── Pay
    ├── Receive callback/webhook
    ├── Use paid feature
    ├── Cancel/refund
    └── Delete account
```

The graph should capture:

- repositories and branches;
- environments;
- deployment targets;
- databases and roles;
- environment variables;
- secret references;
- authentication providers;
- payment providers;
- webhooks;
- domains and DNS;
- email/SMS providers;
- storage;
- queues and cron jobs;
- external APIs;
- AI providers/models;
- billing dependencies;
- critical business journeys;
- recovery and rollback dependencies;
- evidence of the latest verified state.

---

# 6. The First WOW Moment — Discover the Business

Relyo should reveal what the founder does not know about their own application.

A first-run experience should produce something like:

```text
We discovered your business.

17 external dependencies
43 environment variables
3 authentication flows
6 database roles
2 payment webhooks
4 scheduled jobs
1 email domain
2 public APIs
11 critical user journeys

Production confidence: 37%
```

This is not only a repository scan.

Relyo should combine:

- source code;
- manifests and lockfiles;
- cloud accounts;
- database metadata;
- DNS;
- deployment configuration;
- browser-observed behavior;
- network requests;
- third-party provider state;
- real production verification.

The result is a **living production model**, not a static code report.

---

# 7. The Second WOW Moment — Repair, Not Just Report

A scanner creates work for the founder.

Relyo should remove work.

Example:

```text
17 blockers found

✓ Fixed production environment mismatch
✓ Added missing OAuth redirect
✓ Enabled missing database policy
✓ Rotated exposed credential
✓ Created missing webhook
✓ Reconfigured email DNS
✓ Added health endpoint
✓ Generated rollback point
✓ Enabled backup policy

3 approvals needed
```

Every action must be classified by risk.

### Safe automatic action

Relyo can execute immediately when the operation is low-risk, reversible, and verified.

### Approval-gated action

Sensitive operations must require explicit founder approval, for example:

- activating production payments;
- changing billing plans;
- destructive database operations;
- changing primary domains;
- deleting resources;
- rotating credentials with downstream impact;
- account ownership changes;
- production data migration;
- transfers or payouts.

### Human-only action

Some actions may require CAPTCHA, identity verification, regulated consent, hardware wallet signing, MFA, or legal acknowledgment. Relyo should make the smallest possible request to the human and immediately continue after completion.

---

# 8. The Third WOW Moment — Independent Verification

The fixing agent must never be the final authority on whether its own work succeeded.

Relyo should have a separate verification system.

```text
Fix Agent
    ↓
changes production state
    ↓
Independent Verifier
    ↓
observes actual behavior
    ↓
issues evidence
```

If a Fix Agent says:

```text
OAuth fixed
```

Relyo should not accept that claim.

The verifier should actually execute:

```text
fresh browser
→ sign up
→ OAuth redirect
→ provider authorization
→ callback
→ session creation
→ protected route
→ logout
→ login again
```

Only after successful verification:

```text
Authentication
VERIFIED ✓
Evidence ID: RP-94827
```

### Principle

> **Nothing is complete because an agent says it is complete. It is complete when Relyo can independently reproduce the desired production outcome.**

---

# 9. The Fourth WOW Moment — Real Customer Simulation

Relyo should create disposable synthetic customers and execute real business journeys.

For a SaaS application:

```text
Create account
    ↓
Verify email
    ↓
OAuth login
    ↓
Create organization
    ↓
Invite teammate
    ↓
Start test checkout
    ↓
Webhook received
    ↓
Subscription activated
    ↓
Use paid feature
    ↓
Cancel
    ↓
Account deletion
```

Then Relyo can say something meaningfully stronger than "build succeeded":

> **Your business works end to end.**

This should eventually support industry-specific journey packs for SaaS, marketplaces, ecommerce, fintech-like workflows, communities, developer tools, content products, and internal business applications.

---

# 10. Business Verification

Production quality includes problems traditional code scanners do not see:

```text
Payment webhook misconfigured
Email lands in spam
Password reset broken
OAuth callback wrong
Analytics missing
Cookie consent absent
Cancellation impossible
Tax logic wrong
Support email missing
Backup never restored
API costs exceed subscription revenue
Domain expiry approaching
Secret expires next week
External API contract changed
```

Relyo should verify business behavior, not only software syntax.

---

# 11. The 12 Core Production Layers

| Layer | What Relyo must verify |
|---|---|
| Code | Build, runtime behavior, dependency health, configuration assumptions |
| Security | Secrets, access control, RLS/policies, common AppSec failures, vulnerable dependencies |
| Identity | Login, OAuth, sessions, password flows, roles, authorization boundaries |
| Data | Schema, migrations, policies, backup, restore, data lifecycle |
| Infrastructure | Compute, functions, queues, cron, storage, environment separation |
| Integrations | APIs, webhooks, credentials, callbacks, quotas, contract changes |
| Payments | Checkout, subscription, webhook state, refund/cancel, payouts where relevant |
| Communications | Email/SMS delivery, DNS authentication, templates, unsubscribe flows |
| Network | DNS, SSL/TLS, domains, redirects, callbacks, expiry |
| Reliability | Logs, health, incidents, rollback, recovery, failover |
| Economics | API spend, LLM spend, cloud spend, runaway loops, quotas, unit economics |
| Business | Critical user journeys, permissions, lifecycle flows, real customer outcomes |

GitHub, Vercel, Supabase, Stripe, and other providers are connectors underneath these layers.

The product must remain provider-neutral.

---

# 12. Cost Intelligence — Prevent Economically Broken Software

AI-generated software may function technically while being economically impossible.

Example:

```text
1 customer action
→ 20 database calls
→ 7 LLM calls
→ 3 image generations
→ 2 external API calls
```

A founder may charge $29/month while variable infrastructure cost is $37.80/customer.

Relyo should calculate and explain this automatically:

```text
Customer Economics

Revenue/customer:            $29.00
Estimated variable cost:     $37.80
Gross contribution:          -$8.80

⚠ NEGATIVE UNIT ECONOMICS
```

The system should identify the exact expensive call chain and propose safer alternatives.

Long term this can become one of the strongest economic-control features because AI software increasingly depends on metered APIs and model inference.

---

# 13. Recovery Verification

A backup existing does not prove the application is recoverable.

Relyo must test recovery.

Questions include:

```text
Can the database actually restore?
Can the previous deployment roll back?
Can failed payment webhooks be replayed?
What happens when the primary AI provider fails?
What if a secret expires?
What if DNS changes incorrectly?
What if an external API becomes unavailable?
```

Example:

```text
Disaster Recovery Score

Database backup       ✓
Restore test          ✓
Deployment rollback   ✓
Payment replay        ✓
AI provider fallback  ✗
```

The goal is not a checklist. The goal is tested survival.

---

# 14. Continuous Proof

Relyo must remain useful after launch.

A one-time "Production Ready" badge is insufficient.

The system continuously evaluates production contracts when any of these change:

```text
New deployment
Dependency update
Domain expiry
Certificate
OAuth credential
Database policy
API quota
Billing webhook
Cloud cost
New vulnerability
Schema migration
Backup status
Performance
Provider outage
External API behavior
```

Example:

```text
Production confidence:
97% → 71%

Google Login failed after latest deployment.

Root cause isolated.
Automatic rollback available.

[Rollback]
[Fix automatically]
```

Long-term product value comes from remaining present throughout the life of the software.

---

# 15. Software Immune System

The strongest mental model for Relyo is eventually:

> **A continuously operating immune system for software.**

It should:

1. understand expected healthy state;
2. detect deviation;
3. identify root cause;
4. contain damage;
5. repair when permitted;
6. roll back when safer;
7. re-verify the system;
8. preserve evidence.

This is much larger than deployment automation.

---

# 16. Production Confidence

Every application receives a continuously recalculated confidence score.

It must not be a vanity metric. It should be derived from weighted verified evidence across the production layers.

Example:

```text
Production Confidence: 98%

Code             VERIFIED
Security         VERIFIED
Auth             VERIFIED
Data             VERIFIED
Payment          VERIFIED
Email            VERIFIED
Recovery         VERIFIED
Cost             VERIFIED
Business flows   VERIFIED

Evidence: 138 checks
Last verified: 14 seconds ago
```

The exact scoring model should evolve, but the evidence underlying the score must remain inspectable.

---

# 17. Evidence Ledger

Every meaningful claim must have supporting evidence.

Evidence can include:

- HTTP responses;
- browser screenshots/state;
- provider API state;
- deployment identifiers;
- commit SHAs;
- database policy state;
- synthetic transaction results;
- webhook delivery results;
- restore tests;
- cost traces;
- timestamps;
- environment identity;
- test customer identity;
- rollback verification.

This creates a durable audit trail for founders and, later, enterprises and compliance teams.

---

# 18. Relyo Contracts

The product moat should be built around deterministic **Production Contracts** and **Verification Contracts**, not around prompts.

Example — OAuth contract:

```text
application exists
→ callback is correct
→ client ID stored
→ secret available securely
→ production environment configured
→ deployment sees variables
→ authorization begins
→ callback succeeds
→ session established
→ protected route accessible
→ logout works
→ repeat login works
```

Example — Supabase contract:

```text
project reachable
→ schema expected
→ migrations applied
→ public/private roles correct
→ RLS enabled where needed
→ service-role secret not exposed client-side
→ authenticated access validated
→ unauthorized access rejected
→ backup available
→ restore proven
```

Example — Vercel contract:

```text
correct repo
→ correct branch
→ production environment
→ environment variables complete
→ build succeeds
→ deployment reaches READY
→ domain resolves
→ health check passes
→ critical journeys pass
→ rollback point exists
```

Example — Stripe contract:

```text
test mode configured
→ product/price exists
→ checkout succeeds
→ webhook verifies signature
→ subscription state updates
→ failed payment behavior works
→ cancellation works
→ refund works
→ production activation approval gated
```

Contracts must be versioned, testable, composable, and provider-specific underneath a provider-neutral product model.

---

# 19. The Moat

The LLM is not the moat.

OpenAI, Anthropic, Google, and future model providers can all be swapped or combined.

The moat should become:

## 19.1 Production Knowledge Graph

A normalized representation of how software behaves across providers and business journeys.

## 19.2 Verification Contracts

Thousands of deterministic definitions of what "working" means.

## 19.3 Repair Playbooks

Known safe remediation patterns with rollback and validation logic.

## 19.4 Evidence Dataset

Anonymized operational patterns such as:

```text
provider combination
configuration fingerprint
failure pattern
repair attempted
verification result
regression behavior
```

Over time, one customer's verified failure can improve future diagnosis without exposing private source code.

The long-term ambition:

> **Relyo becomes the production memory of the internet.**

---

# 20. Network Effects

The platform should improve from aggregate operational learning.

Example future internal knowledge:

```text
Vercel + Supabase + GitHub OAuth
→ 14,328 verified launches
→ 476 unique failure signatures
→ 392 verified repairs
```

Or:

```text
Lovable + Stripe + Resend
→ 28,000 production systems
→ known callback failures
→ DNS patterns
→ webhook edge cases
→ deliverability failures
```

Each verified outcome improves diagnosis and repair confidence for future applications.

Privacy must be foundational: learn from normalized operational fingerprints, not by leaking customer code or secrets.

---

# 21. Initial Customer

The first customer is not a large enterprise DevOps team.

The first customer is:

> **A nontechnical or lightly technical founder who built an app using Lovable, Replit, Bolt, Cursor, Claude Code, Codex, or another AI builder and is now blocked by production setup and reliability.**

Their emotional problem:

> "The app looks finished, but I do not know whether it is actually safe or live."

Their practical problems include:

- environment variables;
- OAuth;
- callback URLs;
- DNS;
- payments;
- webhooks;
- database security;
- secrets;
- email deliverability;
- production deployment;
- backups;
- monitoring;
- cost surprises;
- broken flows after updates.

Relyo should translate all of this into plain language.

Instead of:

```text
GITHUB_CLIENT_SECRET missing
```

show:

```text
GitHub Login isn't connected yet.

[Fix automatically]
```

---

# 22. Initial Wedge

The first production-grade release should support a narrow but common stack:

```text
GitHub
Vercel
Supabase
Google OAuth
GitHub OAuth
Stripe
Resend
Cloudflare
```

The initial product must be exceptional on this stack rather than mediocre across hundreds of integrations.

### Required first-release jobs

1. Inspect repo and infer architecture.
2. Discover production dependencies.
3. Build the Production Graph.
4. Detect missing or inconsistent configuration.
5. Configure supported providers.
6. Implement approval gates.
7. Deploy/redeploy safely.
8. Execute independent end-to-end verification.
9. Produce evidence.
10. Re-check after every meaningful deployment.

---

# 23. Provider Expansion

The architecture must support future connectors including:

```text
AWS
GCP
Azure
Firebase
Neon
Railway
Render
Netlify
Clerk
Auth0
WorkOS
Twilio
SendGrid
Postmark
Paddle
Lemon Squeezy
Shopify
OpenAI
Anthropic
Gemini
S3
R2
Queues
Cron providers
Mobile app stores
Analytics providers
Observability tools
Enterprise identity
```

But integration count is not the north-star metric.

The north-star is verified outcome coverage.

---

# 24. Competitive Positioning

Relyo should coexist with existing categories rather than compete with all of them.

| Category | Example role | Relyo relationship |
|---|---|---|
| AI builders | Build software | Upstream source of applications |
| Coding agents | Modify code | Upstream or execution partner |
| Desktop agents | Operate UI/computer | Execution substrate when APIs unavailable |
| Cloud hosts | Deploy compute | Provider connector |
| Databases | Store data | Provider connector |
| Repo scanners | Find code issues | Signal source / partial competitor |
| Security scanners | Find vulnerabilities | Signal source / integrated layer |
| Observability | Monitor runtime | Signal source / integrated layer |
| DevOps automation | Deploy infrastructure | Execution substrate / adjacent |
| Relyo | Prove whole business works | Independent control plane |

Relyo wins by connecting code, provider state, real behavior, business journeys, and independent evidence.

---

# 25. Market Thesis

The category is forming at the intersection of several large existing spend pools:

- DevOps;
- application security;
- cloud operations;
- low-code / AI software creation;
- identity and authorization;
- observability;
- agent infrastructure;
- production reliability.

The markets overlap and must not simply be added together, but they demonstrate that Relyo is not targeting a tiny niche.

The strongest bottom-up thesis is:

1. The number of software creators is increasing.
2. AI lowers the cost of creating applications.
3. Therefore application volume increases.
4. Production complexity does not disappear.
5. More applications create more verification, security, reliability, and operating work.
6. Autonomous software ultimately requires autonomous assurance.

A plausible long-term serviceable software opportunity can reach the multi-billion-dollar annual range if Relyo becomes the cross-provider control layer rather than a single-purpose tool.

---

# 26. Why Timing Is Strong

Current ecosystem evidence shows:

- developer populations continue to grow rapidly;
- AI builders have created tens of millions of projects;
- infrastructure providers report growing shares of agent-created applications and deployments;
- AI coding improves throughput while downstream stability and trust remain persistent concerns;
- substantial venture capital is flowing into AI coding, infrastructure, identity, agent authorization, cloud developer platforms, and production reliability.

The strategic observation is:

> **Software creation volume is exploding; verification workload grows with it.**

Relyo should position itself as the beneficiary of every upstream AI builder rather than as another builder competing for the same user action.

---

# 27. 20-Year Durability

"Vibe coding" may not remain a useful term for 20 years.

The durable problem is:

> **Who verifies autonomous software before and while it operates?**

Long-term evolution:

```text
Vibe-coder production assistant
        ↓
Startup production control plane
        ↓
Agency portfolio guardian
        ↓
Enterprise AI-software governance
        ↓
Autonomous software certification layer
        ↓
Independent trust layer for machine-generated software
```

The long-term thesis therefore must not be:

> We help vibe coders.

It must be:

> **We make machine-generated software safe to operate.**

---

# 28. Fundability Thesis

The market has demonstrated strong investor appetite for adjacent categories:

- AI application builders;
- coding agents;
- developer cloud platforms;
- database infrastructure;
- agent authorization infrastructure;
- integration/action infrastructure;
- enterprise identity;
- developer operations.

Relyo should not assume funding based on idea quality alone.

Capital must follow evidence.

A reasonable milestone framing:

| Stage | Evidence expected | Illustrative capital target |
|---|---|---:|
| Pre-seed | Working product + first real users | $0.5M–$2M |
| Strong pre-seed | Exceptional demo + fast adoption | $2M–$4M |
| Seed | Hundreds/thousands of active apps + revenue | $3M–$10M |
| Series A | Strong ARR, retention, verified moat | $15M–$50M+ |
| Breakout | Category leadership | $50M–$150M+ rounds |

These are directional targets, not promises. Geography, founder profile, growth, ARR, retention, margins, technical defensibility, and capital markets will determine actual financing.

---

# 29. Investor WOW Demo

The investor demo must be live and outcome-driven.

Start with an intentionally broken AI-built application.

The founder says:

> **Launch this.**

Relyo responds:

```text
Scanning business...

28 systems detected.
11 production blockers.

Repairing...
```

Live progress:

```text
Database security            FIXED ✓
Google OAuth                 FIXED ✓
Production environment       FIXED ✓
Payment webhook              FIXED ✓
Email domain authentication  FIXED ✓
Database backup              ENABLED ✓
Exposed API secret           ROTATED ✓
Rollback point               CREATED ✓
```

Then a sensitive action:

```text
Production payment activation requires founder approval.

[Approve]
```

After approval:

```text
Creating real test customer...
```

The browser visibly executes:

```text
Sign up ✓
Email received ✓
Google login ✓
Checkout ✓
Webhook ✓
Paid feature ✓
Data stored correctly ✓
Cancellation ✓
Account deletion ✓
```

Final screen:

```text
YOUR BUSINESS IS LIVE

Production Confidence: 98%

Code             VERIFIED
Security         VERIFIED
Auth             VERIFIED
Data             VERIFIED
Payment          VERIFIED
Email            VERIFIED
Recovery         VERIFIED
Cost             VERIFIED
Business flows   VERIFIED

Evidence: 138 checks
Last verified: seconds ago
```

This is the first investor WOW moment.

---

# 30. Investor WOW Demo — Failure and Recovery

After the successful launch, intentionally break one production contract, for example by removing a required environment value in a controlled demo environment.

Relyo immediately detects:

```text
Production contract broken.

Payment callback is failing.
Detected: 3 seconds ago.
Root cause found.
Safe repair available.

Automatically restored previous value.
Re-verifying...
```

Then:

```text
Production Confidence: 98%
VERIFIED AGAIN ✓
```

This demonstrates that Relyo is not a deployment tool.

It is a **continuous software immune system**.

---

# 31. Brand Narrative

Primary tagline:

> **AI builds it. Relyo makes sure reality agrees.**

Supporting lines:

> **AI made software creation abundant. Relyo makes it trustworthy.**

> **Today anyone can build an app. Relyo proves the whole thing is safe, configured, recoverable, and actually working.**

> **The independent control plane between AI-generated software and the real world.**

> **From AI-built to production-proven.**

The brand should feel premium, simple, and confident rather than overly technical.

---

# 32. UX Principles

## 32.1 Outcome language over infrastructure language

Say:

```text
Google Login is not connected yet.
```

not:

```text
GOOGLE_CLIENT_SECRET missing in production environment
```

Technical detail remains available under "Why?" or evidence views.

## 32.2 One-click safe remediation

Default action:

```text
[Fix automatically]
```

## 32.3 Explicit sensitive approvals

Never hide consequential operations.

```text
[Approve & continue]
```

## 32.4 Evidence over confidence theater

Every VERIFIED state should be inspectable.

## 32.5 Founder should not become DevOps engineer

Relyo must eliminate configuration work rather than teach every user to perform it manually.

---

# 33. Safety & Trust Architecture

Relyo will often have privileged production access, so trust architecture is product-critical.

Requirements:

- least-privilege provider permissions;
- scoped OAuth integrations;
- encrypted credential storage;
- secret isolation from model prompts where possible;
- explicit approval gates;
- immutable audit log;
- rollback before mutation where feasible;
- dry-run support;
- deterministic contract validation;
- independent verifier;
- environment separation;
- tenant isolation;
- action risk classification;
- rate limits and blast-radius controls;
- emergency kill switch;
- transparent evidence.

Security must become part of the product moat, not an afterthought.

---

# 34. High-Level Technical Architecture

```text
                    ┌──────────────────────┐
                    │      Relyo UI        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Control Plane API  │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                       │
┌───────▼────────┐   ┌─────────▼────────┐   ┌────────▼─────────┐
│ Discovery      │   │ Remediation      │   │ Verification     │
│ Engine         │   │ Orchestrator     │   │ Engine           │
└───────┬────────┘   └─────────┬────────┘   └────────┬─────────┘
        │                      │                       │
        └──────────────┬───────┴──────────────┬────────┘
                       │                      │
              ┌────────▼────────┐    ┌────────▼─────────┐
              │ Production      │    │ Evidence Ledger  │
              │ Knowledge Graph│    │ + Audit Trail    │
              └────────┬────────┘    └──────────────────┘
                       │
              ┌────────▼─────────┐
              │ Provider Adapter │
              │ Layer            │
              └────────┬─────────┘
                       │
   ┌───────────────────┼─────────────────────────────────┐
   │                   │                │                │
 GitHub             Vercel          Supabase          Stripe ...
```

The Remediation Orchestrator may use APIs, CLIs, browser automation, or local execution depending on provider capability. However, business logic should live in contracts and typed adapters rather than free-form prompts.

---

# 35. Agent Model

Recommended logical separation:

### Discovery Agent
Builds and updates the Production Graph.

### Planner
Converts missing/failed contracts into an ordered remediation plan.

### Fix Agent
Executes low-risk or approved changes.

### Verification Agent
Independently tests outcomes.

### Recovery Agent
Handles rollback, restore, replay, and incident containment.

### Cost Agent
Profiles metered infrastructure and unit economics.

### Policy Engine
Determines which actions may run automatically, require approval, or must remain human-only.

These may share underlying models initially but must be separated logically and in permissions.

---

# 36. MVP Scope

The MVP should prove one magical workflow rather than a giant feature checklist.

### MVP story

> A founder connects an AI-built app using GitHub + Vercel + Supabase. Relyo discovers the stack, identifies broken production configuration, fixes supported issues, requests approvals where needed, deploys safely, creates a synthetic customer, validates authentication and one core business flow, and produces independent evidence.

### MVP integrations

- GitHub
- Vercel
- Supabase
- Google OAuth
- GitHub OAuth
- Stripe test mode
- Resend
- Cloudflare DNS

### MVP verification domains

- build/deploy;
- environment configuration;
- authentication;
- database access policies;
- one payment flow;
- one email flow;
- DNS/HTTPS;
- one backup check;
- one rollback path;
- basic variable cost tracing;
- critical browser journey.

---

# 37. Product Roadmap

## Phase 0 — Foundation

- Repository source-of-truth docs
- Architecture decisions
- Security model
- Provider adapter interface
- Contract schema
- Evidence schema
- Risk/approval classification

## Phase 1 — Discovery

- GitHub ingestion
- Framework detection
- dependency discovery
- environment variable inference
- Vercel project mapping
- Supabase project mapping
- OAuth detection
- Production Graph v1

## Phase 2 — Production Readiness

- contract evaluation
- confidence model v1
- human-readable issue explanations
- remediation planner
- evidence collection

## Phase 3 — Safe Remediation

- Vercel environment updates
- supported OAuth config
- Supabase safe configuration
- Resend/Cloudflare configuration
- rollback snapshots
- approval UI

## Phase 4 — Independent Verification

- synthetic browser sessions
- auth verification
- API verification
- database authorization tests
- evidence ledger

## Phase 5 — Business Journeys

- Stripe test customer
- subscription lifecycle
- email delivery verification
- journey designer/inference

## Phase 6 — Continuous Proof

- deployment-triggered verification
- scheduled contract checks
- drift detection
- incident detection
- automatic safe repair

## Phase 7 — Recovery + Economics

- restore testing
- webhook replay
- provider fallback
- variable cost graph
- negative unit-economics alerts

## Phase 8 — Platform Expansion

- additional cloud/database/auth/payment/email providers
- agency portfolios
- team collaboration
- API/SDK
- enterprise governance

---

# 38. Success Metrics

Avoid optimizing primarily for number of scans or integrations.

Important product metrics:

- Time to first Production Graph
- Time to first verified fix
- Percentage of blockers automatically repaired
- Percentage of fixes independently verified
- Time from connect → verified production
- Critical journey pass rate
- Production-confidence retention over 30/90 days
- Incidents detected before user report
- Mean time to verified recovery
- False positive rate
- User approvals per successful launch
- Cost savings identified
- Number of applications continuously protected

Key business metric:

> **Verified production applications under management.**

---

# 39. Business Model

Potential model:

### Free / Developer

- one app;
- limited scans;
- basic production graph;
- manual fixes.

### Founder / Pro

- continuous proof;
- automatic remediation;
- critical journeys;
- backup/recovery checks;
- cost intelligence.

### Agency

- multi-client portfolio;
- white-label reports;
- bulk policy;
- team access.

### Business / Enterprise

- governance;
- policy engine;
- audit evidence;
- SSO;
- approval workflows;
- custom contracts;
- private runners;
- compliance reporting;
- SLA.

### Usage

Optional metering for:

- synthetic journeys;
- browser minutes;
- deep verification;
- recovery drills;
- private compute.

Pricing must align with production value and risk avoided, not token usage.

---

# 40. Distribution Strategy

Relyo benefits from AI builders instead of competing with them.

Potential acquisition surfaces:

- GitHub app;
- Vercel integration;
- Supabase integration;
- AI builder marketplace integrations;
- "Verify with Relyo" button after deployment;
- CLI;
- CI action;
- agency workflow;
- AI coding assistant integrations;
- launch checklist import;
- security/production score share card.

The ideal distribution flywheel:

```text
More AI-built apps
      ↓
More production failures
      ↓
More need for Relyo
      ↓
More verified failure/repair patterns
      ↓
Better Relyo outcomes
      ↓
More partner integrations
```

---

# 41. Category Strategy

Do not market Relyo forever as a "vibe coding helper."

Initial message:

> Make your AI-built app actually live.

Next:

> Production control plane for AI software.

Long-term:

> Independent trust layer for autonomous software.

Relyo should own the transition from **generated** to **trusted**.

---

# 42. Non-Negotiable Product Principles

1. **Provider-neutral architecture.**
2. **Outcome verification over agent claims.**
3. **Safe automation over reckless autonomy.**
4. **Human approval for consequential actions.**
5. **Rollback before risky mutation where possible.**
6. **Plain-language UX for founders.**
7. **Evidence behind every VERIFIED claim.**
8. **Continuous proof, not one-time certification.**
9. **Privacy-preserving learning.**
10. **Business journeys matter as much as infrastructure.**
11. **Cost viability is part of production readiness.**
12. **Recovery must be tested, not assumed.**

---

# 43. What We Explicitly Do Not Build First

Do not waste the early company building:

- our own IDE;
- our own general-purpose coding model;
- our own cloud hosting platform;
- a generic AI browser;
- a generic desktop-control agent;
- hundreds of shallow provider integrations;
- enterprise compliance bureaucracy before core product magic;
- a static dashboard with no remediation.

Use existing infrastructure where possible and focus Relyo engineering on the unique control, contract, verification, and evidence layers.

---

# 44. The Ultimate Product Experience

A founder should eventually be able to say:

> **Relyo, make this business production-safe.**

Relyo understands the application, asks only for the minimum required approvals, repairs the system, launches it, proves the real journeys work, and keeps guarding it afterward.

The founder should not need to become a DevOps, security, DNS, OAuth, payment-webhook, or database-policy expert.

---

# 45. End-State Vision

Future autonomous development may look like:

```text
AI writes software
    ↓
Relyo validates it
    ↓
Relyo authorizes safe deployment
    ↓
Relyo proves real customer journeys
    ↓
Relyo monitors production contracts
    ↓
Relyo repairs or rolls back failures
    ↓
Relyo continuously proves integrity
```

The company succeeds if "Relyo verified" becomes a meaningful statement of operational trust.

The final ambition:

> **Whatever AI built, Relyo makes sure reality agrees.**

---

# 46. Current Source of Truth

This document is the canonical company and product plan until intentionally superseded by a reviewed decision.

Future agents and contributors must preserve the core thesis unless a deliberate strategic decision is documented:

> **Relyo is the independent production control and verification layer for AI-built and eventually autonomous software.**

Implementation details may evolve. Providers may change. Models may change. The core problem — proving that machine-generated software is safe and actually works in the real world — is the durable foundation of the company.
