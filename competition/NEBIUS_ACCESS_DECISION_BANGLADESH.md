# Nebius Access Decision — Bangladesh

**Date:** 2026-10-05  
**Status:** Personal Token Factory onboarding blocked by country availability. Do not use false billing information.

## Verified situation

The hackathon rules allow team entries and require the project, as a working system, to make a runtime call to Nebius Token Factory or run on Nebius AI Cloud. The public Token Factory onboarding UI currently does not offer Bangladesh in the Country of residence field for this account.

Public hackathon discussions show the same class of country-onboarding block for other countries. A participant relayed Nebius Support guidance that unsupported-country self-service billing registration has no individual/manual bypass, Builder Program approval does not bypass it, promotional credits cannot be redeemed while registration is blocked, and Nebius AI Cloud is not a separate registration workaround.

## Decision

Do not spend more project time trying to bypass the country selector.

Do not:
- select a false country;
- use a fake address;
- misrepresent billing residence;
- commit or share another person's Nebius API key.

### Competition fallback

Keep the Nebius/NVIDIA code path implemented and tested, but treat live Nebius access as a **team-level credential dependency**.

If Relyo enters the Nebius x NVIDIA hackathon, the clean fallback is:

1. Add a genuine eligible teammate who can legitimately access Nebius Token Factory in their own supported jurisdiction.
2. The teammate joins the actual Devpost team and contributes to the project.
3. The team uses that legitimate Nebius account to provide the runtime Token Factory access for the shared Relyo project.
4. The API key remains server-side only; it is never committed.
5. The final submission clearly discloses the team-operated Nebius runtime path.
6. Relyo still uses deterministic evidence for truth; Nemotron remains reasoning only.

The hackathon rules allow teams of eligible individuals, and organizers have stated there is no maximum team size.

## Current engineering state

The Relyo competition branch already contains:

- Nebius Token Factory / NVIDIA Nemotron reasoning client;
- deterministic trust boundary;
- gated live Nemotron smoke test;
- PayPal payment-integrity proof;
- PayPal FAIL -> VERIFIED E2E.

Therefore personal Nebius onboarding is **not a blocker for continuing Relyo development**.

## Execution priority

1. Continue PayPal AI work and competition hardening now.
2. Keep Nebius integration code ready.
3. Do not ask the founder to repeat Token Factory billing/onboarding attempts.
4. Activate the live Nebius smoke only when a legitimate team-level Nebius credential becomes available.
5. If no legitimate Nebius access exists before submission freeze, do not submit Relyo to Nebius rather than faking access.
