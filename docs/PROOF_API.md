# Relyo Proof API

The Proof API is the headless distribution surface for agents, CI, SDKs and MCP.

## Authentication

API keys are created from an authenticated Relyo browser session that already has a bound Vercel project and, optionally, a bound Supabase project.

The raw token is returned exactly once. Relyo stores only SHA-256 of the token.

Use:

```text
Authorization: Bearer rly_live_...
```

Never put the API key in a query string, repository file, command-line flag, log, Passport, or evidence envelope.

## Endpoints

- `POST /api/api-keys` — same-origin browser endpoint to mint an API key for the currently bound providers.
- `POST /api/v1/proof-runs` — submit `url`, `githubRepo`, or both.
- `GET /api/v1/proof-runs/:runId` — read a run created by the same API identity.
- `POST /api/mcp` — stateless MCP 2026-07-28 tools for create/get proof.

API keys are scoped to the provider connection identities captured when the key is created. Run reads are additionally authorized through an API-key-to-run mapping, so knowing a run UUID is not sufficient to read another key's result.

## Webhooks

A proof submission may include a one-shot webhook URL and secret. Relyo:

1. requires HTTPS;
2. applies the same public-network SSRF guard used by discovery before delivery;
3. signs `<timestamp>.<raw-body>` with HMAC-SHA256;
4. sends `x-relyo-signature-sha256`, `x-relyo-timestamp`, `x-relyo-event`, and `x-relyo-run-id`;
5. treats webhook delivery as notification only — a failed callback does not rewrite proof truth.

Consumers should reject stale timestamps and compare signatures in constant time.

## CLI

Set `RELYO_API_KEY`; the CLI intentionally rejects `--api-key` to reduce shell-history leakage.

```text
relyo prove --url https://app.example --repo owner/repo
relyo get run_...
```

## GitHub Action

Use `.github/actions/relyo-proof` and pass `api-key` from GitHub Actions secrets.

## MCP

The HTTP MCP endpoint implements the current stateless `2026-07-28` request model and validates `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` routing consistency.

Tools:

- `relyo_proof_run_create`
- `relyo_proof_run_get`

The MCP identity does not grant extra authority; the same Relyo API key and run-level authorization rules apply.
