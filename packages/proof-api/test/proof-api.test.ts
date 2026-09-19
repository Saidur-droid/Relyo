import { describe, expect, it } from "vitest";
import { generateProofApiKey, hasScope, parseBearerToken, signWebhookBody, validateWebhookUrl, verifyWebhookSignature } from "../src/index.js";

describe("Proof API primitives", () => {
  it("generates opaque API keys but persists only SHA-256", () => {
    const generated = generateProofApiKey({ label: "CI", vercelConnectionId: "conn_v" });
    expect(generated.token).toMatch(/^rly_live_/);
    expect(generated.record.keySha256).toHaveLength(64);
    expect(JSON.stringify(generated.record)).not.toContain(generated.token);
    expect(hasScope(generated.record, "proof:run")).toBe(true);
  });

  it("strictly parses bearer tokens", () => {
    const generated = generateProofApiKey({ label: "CI", vercelConnectionId: "conn_v" });
    expect(parseBearerToken(`Bearer ${generated.token}`)).toBe(generated.token);
    expect(parseBearerToken("Basic nope")).toBeNull();
  });

  it("signs timestamp-bound webhooks and rejects replay outside tolerance", () => {
    const secret = "1234567890abcdef";
    const body = JSON.stringify({ runId: "run" });
    const timestamp = "2026-09-19T00:00:00.000Z";
    const signature = signWebhookBody(secret, body, timestamp);
    expect(verifyWebhookSignature({ secret, body, timestamp, signature, now: new Date("2026-09-19T00:01:00Z") })).toBe(true);
    expect(verifyWebhookSignature({ secret, body, timestamp, signature, now: new Date("2026-09-19T00:10:00Z") })).toBe(false);
  });

  it("requires HTTPS non-local webhook targets", () => {
    expect(validateWebhookUrl("https://hooks.example.com/relyo").hostname).toBe("hooks.example.com");
    expect(() => validateWebhookUrl("http://hooks.example.com/relyo")).toThrow();
    expect(() => validateWebhookUrl("https://localhost/hook")).toThrow();
  });
});
