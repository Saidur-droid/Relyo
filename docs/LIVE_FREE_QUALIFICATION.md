# Live free qualification fixture

This fixture exists only to qualify Relyo's proof machinery on a real public HTTPS target without spending money or mutating a customer production system.

It provides:

- a complete synthetic SaaS customer flow for R2;
- an isolated per-session failure/recovery state machine for R3;
- a health endpoint that exposes only non-secret release metadata.

The fixture is intentionally dependency-free and stores all state in memory. It is not a customer-facing Relyo service and carries no production secrets.

The GitHub Actions workflow `.github/workflows/live-free-qualification.yml` runs a real Chromium browser against the public target and then performs a safe isolated R3 failure/recovery/reverification sequence. The workflow must not be treated as proof that an unrelated customer app passes R2/R3; it is system qualification evidence for Relyo itself.
