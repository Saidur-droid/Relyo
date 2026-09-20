# Relyo Smart Provider UX Handoff — 2026-09-20

This file is the durable continuation point for the next implementation session. Do not ask the founder to restate this direction.

## Product direction

Relyo must remain provider-neutral and should not make Vercel or Supabase look mandatory.

The desired launch flow is:

1. **GitHub repository first**
   - Treat the repository as the primary application/release identity.
   - Inspect repository/discovery signals to infer likely hosting, backend/database, auth, payments, email, DNS/CDN, and other relevant providers.
   - Never claim a provider is present unless evidence supports it.

2. **Ask only for relevant production evidence**
   - Ask for the production URL for the actual app so Relyo can verify real runtime behavior.
   - If repository/discovery evidence indicates Vercel, offer/ask for Vercel connection or production project evidence.
   - If evidence indicates Supabase, offer/ask for Supabase connection/project evidence.
   - If another supported provider is detected, ask for that provider's relevant connection/evidence instead.
   - Do not force Vercel or Supabase on users whose app does not use them.
   - If a provider is unsupported or uncertain, keep the fact explicit as UNKNOWN and continue with the evidence that is available.

3. **Provider connections are evidence upgrades, not onboarding requirements**
   - Public URL + GitHub repo should be enough to begin a signed provider-neutral proof.
   - Connected providers should deepen proof and reduce UNKNOWNs.
   - Existing Vercel-only and Vercel+Supabase deep R1 behavior must remain available for apps that actually use those providers.
   - Do not inflate assurance when deployment/provider facts are not independently observed.

4. **High-value result experience**
   The result must go beyond PASS/FAIL. For every important finding, explain:
   - where the problem is;
   - which component/provider is involved;
   - what was observed;
   - why it matters;
   - likely production impact;
   - concrete fix guidance;
   - what evidence supports the finding;
   - what remains UNKNOWN or unverified.

   The user should feel that Relyo understood the app and gave actionable production guidance, not merely issued a badge.

5. **Value-for-money standard**
   The output should help a founder/developer answer:
   - What is broken?
   - Where is it broken?
   - What should I fix first?
   - How do I fix it?
   - What is already safe/healthy?
   - What still needs provider access or runtime evidence?
   - Can I trust this exact release enough to launch?

## Current implementation state

Open PR: **#52 — feat: make launch verification provider-neutral**

Branch: `feat/provider-neutral-launch-onboarding`

PR #52 already changes the baseline flow so:
- GitHub repo + production URL are primary inputs;
- Vercel is optional;
- Supabase is optional;
- public/repository-only signed proof can be persisted;
- Supabase-only evidence can augment proof without pretending it proves deployment identity;
- missing provider facts remain UNKNOWN/R0 rather than guessed;
- existing deep Vercel + Supabase path remains available.

Latest CI on the implementation branch passed typecheck, tests, and build after fixing package import compatibility.

The PR is intentionally not merged/deployed yet because Vercel preview/build quota was reporting a free build-rate limit. Do not create release-identity drift by merging when production cannot be updated.

## Next implementation work

Continue from PR #52 and implement the smarter provider-aware experience:

1. Extend discovery/provider inference from repository signals.
2. Add a normalized provider-detection result suitable for UI decisions.
3. Render only relevant provider prompts/cards based on detected evidence.
4. Keep an explicit "Other / not detected" path that does not block verification.
5. Ask for the actual production URL and make clear why it is needed.
6. Improve the signed proof/result UI with a structured remediation report:
   - severity/priority;
   - component/provider;
   - observed evidence;
   - impact;
   - fix steps;
   - verification status;
   - UNKNOWN/exclusion reason.
7. Preserve deterministic contract decisions; free-form model output must never decide VERIFIED status.
8. Add tests for:
   - Vercel detected -> Vercel prompt shown;
   - Supabase detected -> Supabase prompt shown;
   - neither detected -> no forced Vercel/Supabase;
   - mixed stack -> only relevant provider prompts;
   - unsupported provider -> proof continues with UNKNOWN provider facts;
   - result guidance does not turn UNKNOWN into PASS.
9. Use normal branch -> PR -> CI -> merge discipline.
10. Merge/deploy only when the free production path is available; after deployment, run fresh exact-release verification before calling the new UX production-complete.

## Security / trust constraints

- Never request or expose provider secrets in chat, browser-readable storage, proof evidence, logs, or documentation.
- Prefer OAuth/read-only provider access.
- Keep least privilege.
- Keep unsupported or inaccessible facts UNKNOWN.
- Evidence decides assurance; AI may explain but must not promote assurance.
- Do not fabricate provider detection, production results, users, partners, or proof.
- Do not pay/upgrade/start trials to bypass free provider limits.

## Founder intent

The founder should not need to repeat any of this in the next session. Read this file, inspect PR #52 and current CI/deployment state, then continue implementation directly.
