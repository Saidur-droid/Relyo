# Relyo V2 — Marketing & Distribution P0

> **STATUS: MANDATORY — TOP PRIORITY, EXECUTE IN PARALLEL WITH CORE PRODUCT**
>
> Founder directive: marketing, distribution, product-led acquisition, ecosystem partnerships, community, open-source reach, and shareable proof are part of the product architecture from day one. They are not a post-product phase.

## P0 operating model

Relyo has two simultaneous P0 tracks:

### P0-A — Trust & Product Correctness

- deterministic Proof Contracts;
- evidence integrity;
- secure Runner;
- independent verification;
- Production Passport integrity;
- safe remediation;
- false-VERIFIED rate driven toward zero.

### P0-B — Market Capture & Distribution

- own the highest-intent launch moments;
- instant free value;
- shareable proof;
- focused-stack domination;
- open-source distribution;
- GitHub distribution;
- builder/agency/VC partnerships;
- community programs;
- Proof API/MCP distribution;
- evidence-led education.

P0-A may block P0-B whenever trust/security is at risk. P0-B must not be postponed merely because the engineering team prefers to finish infrastructure first.

---

# 1. MAIN EVENT — Own the Launch Moment

This is the highest-priority go-to-market idea in Relyo V2.

Users do not wake up wanting “software proof infrastructure.” They feel urgency at specific moments when failure becomes expensive, embarrassing, or irreversible.

Relyo must own those moments.

## Primary product modes

### **Verify Before Launch**

The default founder mode.

Use when:

- a new SaaS is about to go public;
- a production domain is being activated;
- the founder thinks the app is ready;
- beta is becoming real production.

Relyo verifies the critical release and business flows, then issues a scoped Launch Passport.

### **Verify Before Charging Customers**

A high-intent monetization moment.

Use when:

- Stripe/Paddle/etc. is being enabled;
- a founder is about to accept the first payment;
- subscription entitlements are going live.

Relyo verifies:

- checkout;
- success/failure paths;
- webhook signature/state;
- entitlement activation;
- cancellation;
- refund where supported;
- entitlement revocation;
- selected email/receipt flows.

### **Verify Before Investor Demo**

A clear one-time purchase and viral founder use case.

Relyo verifies the exact flows that must not fail during a demo:

- signup/login;
- core product action;
- selected payment/demo path;
- critical API availability;
- public-domain health;
- rollback checkpoint;
- obvious production errors.

Output: time-bounded Investor Demo Passport / evidence package.

### **Verify Client Delivery**

The agency/studio wedge.

Before client handoff, Relyo verifies agreed delivery outcomes and produces a scoped Passport.

Benefits:

- agency differentiation;
- less handoff ambiguity;
- recurring fleet use;
- client exposure to Relyo;
- clear proof of what was actually tested.

### **Verify Latest Release**

The recurring habit.

When a deployment changes production, Relyo re-evaluates the contracts affected by that change.

This becomes the bridge from one-time Launch Proof to Continuous Proof.

---

# 2. Why Moment-Based Positioning Wins

“Independent software proof infrastructure” is strategically correct but too abstract for first-time buyers.

Moment language is immediately understandable:

```text
I am launching tomorrow.
I am taking my first payment.
I have an investor demo.
I am handing this app to a client.
I just deployed a risky change.
```

Each moment already has urgency and willingness to pay.

Therefore the acquisition architecture is:

```text
HIGH-INTENT MOMENT
      ↓
Relyo mode
      ↓
app-specific discovery
      ↓
verification
      ↓
scoped Production Passport
      ↓
continuous proof / referral / partner expansion
```

This makes the category understandable without requiring the user to learn assurance terminology first.

---

# 3. Homepage / Product Navigation

The primary homepage CTA should not be “Start software assurance.”

It should lead with the user's moment.

Suggested hero:

> **About to launch? Verify the critical flows before customers depend on them.**

Primary CTA:

> **Verify My Launch**

Secondary CTA:

> **Check My App Free**

Quick modes below the hero:

- Verify Before Launch
- Verify Before Charging Customers
- Verify Before Investor Demo
- Verify Client Delivery
- Verify Latest Release

Long-term category explanation can appear after the first-value story.

---

# 4. Moment → Contract Pack Mapping

Each user-facing moment maps to deterministic contract packs underneath.

## Launch Pack

- production domain/HTTPS;
- deployment identity;
- required environment configuration;
- signup/login;
- authorization baseline;
- critical user journey;
- public error behavior;
- rollback readiness.

## First Revenue Pack

Everything in Launch plus:

- checkout;
- webhook;
- entitlement state;
- cancellation;
- failure/retry path;
- notification/email where relevant.

## Investor Demo Pack

- exact demo journey;
- seeded demo state;
- auth/session reliability;
- API/dependency reachability;
- deterministic smoke proof;
- rollback point;
- time-bounded evidence.

## Client Delivery Pack

- agreed acceptance journeys;
- role/permission checks;
- deployment identity;
- critical integrations;
- handoff evidence;
- exclusions explicitly listed.

## Latest Release Pack

- impact analysis from release diff;
- only affected contracts when possible;
- targeted re-verification;
- Passport freshness update;
- degradation if a critical contract fails.

---

# 5. Moment-Based Pricing Hypotheses

Pricing is an experiment, not a fixed truth.

Potential entry products:

```text
Free App Check
→ Launch Proof $29–$49 one-time
→ First Revenue Proof $49–$99 one-time
→ Investor Demo Proof $49–$149 one-time
→ Client Delivery Proof per app / agency plan
→ Continuous Proof $29–$79+/month
```

Actual pricing must be validated against proof cost, conversion, target user economics, and willingness to pay.

The strategic idea is more important than exact price:

> monetize a moment with clear value, then expand to recurring proof.

---

# 6. Mandatory Lovable-Style Growth Pillars

These are mandatory V2 marketing requirements.

## Open-source layer

- Proof Contract specification;
- selected contract packs;
- CLI/local verifier;
- GitHub Action;
- evidence format examples;
- adapter/conformance tooling later.

Commercial bridge:

```text
use locally/free
→ need hosted history/passport/continuous verification
→ connect Relyo
```

## Instant magic

URL/repo connect must produce an app-specific finding quickly.

## Shareable outcome

Production Passport is a distribution artifact, not only a report.

## Focused stack

First ecosystem:

```text
Next.js + GitHub + Vercel + Supabase + OAuth + Stripe + Resend + Cloudflare
```

Contract density > integration count.

## Partnership

Treat builders and infrastructure providers as collaborators. Co-market checklists, launch kits, and verification guidance that makes their users more successful.

## Community

Run:

- **100 Apps Verified**;
- monthly **Proof Day**;
- Relyo Launch Club;
- Verified Expert / agency community;
- contract contributor program;
- builder integration office hours.

---

# 7. Additional High-Leverage Growth Programs

## 100 Apps Verified

Hand-onboard 100 founders across Lovable, Replit, Cursor, Bolt, v0, Claude Code, Codex, and traditional engineering.

Do not rank which builder is “bad.” Publish aggregate lessons and case studies.

## VC / Accelerator Proof Days

Offer portfolio launch-readiness sessions to accelerators and VCs. This can bring 10–50 qualified startups in a single channel relationship.

## Relyo Verified Expert

Train agencies/consultants to use Relyo correctly. Certification must require demonstrated competence, not payment.

## Stack Launch Kits

Create partner-friendly resources such as:

- Next.js + Vercel + Supabase Launch Kit
- Stripe SaaS Revenue Verification Kit
- Google OAuth Production Verification Kit
- Resend Email Launch Kit

Each should lead from free checklist → automated check → paid proof.

## Proof Week

Recurring public event where founders verify upcoming launches. Produces content, case studies, community, and product feedback.

## “Verified With” Widget

For partners/agencies:

```text
Built with <Partner>
Production proof by Relyo
```

This reinforces complementarity rather than competition.

---

# 8. Marketing Flywheel

```text
high-intent moment
→ free/app-specific check
→ paid verification
→ Production Passport
→ share / client / investor / partner exposure
→ new users
→ more proof data
→ Verified Failure Graph improves
→ faster/better verification
→ stronger public research + partnerships
→ more users
```

Marketing, product, and AI moat reinforce one another.

---

# 9. Growth Definition of Done

A user-facing feature is not fully complete from a company-building perspective unless, where appropriate, it includes:

- clear entry/acquisition surface;
- first-value event;
- analytics taxonomy;
- paid conversion path;
- shareable output;
- referral/partner path;
- privacy-safe learning event for the Verified Failure Graph;
- supporting content/checklist;
- explicit experiment metric.

A technically complete feature with no discovery, activation, retention, distribution, or network-learning path should be questioned.

---

# 10. P0 Growth Metrics

- time to first app-specific finding;
- meaningful finding rate;
- free check → proof start;
- proof start → paid;
- paid retention;
- Passport share rate;
- Passport visitor → new check conversion;
- agency apps per account;
- partner-sourced verified apps;
- external API/MCP-initiated proof percentage;
- gross margin per proof;
- false VERIFIED rate.

The false VERIFIED rate remains sacred. Growth never overrides trust quality.

---

# 11. Resource Rule

Before repeatable growth exists, avoid:

- expensive broad paid ads;
- celebrity-CMO hiring for prestige;
- giant sales teams;
- dozens of shallow integrations;
- custom enterprise work that consumes the entire roadmap;
- brand campaigns with no product loop.

A practical early planning heuristic, not a rigid allocation:

```text
60–75% trust/core product
25–40% activation/distribution/growth surfaces
```

This can change based on evidence, but marketing cannot be allocated zero engineering capacity.

---

# 12. Founder-Led Marketing Cadence

Until a repeatable channel is proven, founder owns the story.

Every week target:

- 1 live verification/demo;
- 1 evidence-backed deep post;
- 3–5 short educational clips/posts;
- 5–10 customer/design-partner conversations;
- 5 partner/agency/accelerator conversations;
- 1 case study or proof-pattern writeup;
- funnel + proof-quality review;
- 1 growth experiment.

Founder messaging:

> **Build fast. Verify before customers depend on it.**

---

# 13. Mandatory Guardrails

Never:

- attack Lovable/Replit/Cursor or other builders;
- claim all AI-built apps fail;
- publish weak builder rankings;
- fabricate traction or incidents;
- sell an evidence-free “Verified” badge;
- make absolute safety promises;
- sacrifice verification quality for conversion.

Always:

- cite public statistics with source/date/methodology;
- distinguish industry evidence from Relyo data;
- make the builder/founder the hero;
- keep Relyo complementary;
- explain exactly what a Passport proves and excludes.

---

# 14. Priority Instruction for Future Agents

When roadmap tradeoffs are needed, protect these first:

1. trust/security correctness;
2. **launch-moment UX**;
3. instant free app-specific value;
4. Production Passport shareability;
5. focused-stack depth;
6. Proof API/MCP distribution;
7. open-source/community distribution;
8. partner/agency channels;
9. Verified Failure Graph compounding;
10. integration breadth.

**The launch moment is Relyo's first market beachhead. Own it before trying to own all software operations.**
