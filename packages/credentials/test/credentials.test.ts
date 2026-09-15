import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  CredentialCipher,
  MemoryCredentialStore,
  bindProviderProject,
  createPkceTransaction,
  createProviderConnection,
  secureEqual,
} from "../src/index.js";

describe("provider credential boundary", () => {
  it("creates PKCE state/nonce/verifier/challenge without reusing values", () => {
    const first = createPkceTransaction();
    const second = createPkceTransaction();
    expect(first.state).not.toBe(second.state);
    expect(first.nonce).not.toBe(first.state);
    expect(first.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(first.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("compares OAuth state without accepting missing or different values", () => {
    expect(secureEqual("same", "same")).toBe(true);
    expect(secureEqual("same", "different")).toBe(false);
    expect(secureEqual(null, "same")).toBe(false);
  });

  it("encrypts provider tokens and detects ciphertext tampering", () => {
    const key = randomBytes(32).toString("base64url");
    const cipher = new CredentialCipher(key, "test-key");
    const encrypted = cipher.encrypt({
      accessToken: "secret-access-token",
      refreshToken: "secret-refresh-token",
      tokenType: "Bearer",
      scope: ["read:project", "read:deployment"],
    });

    expect(JSON.stringify(encrypted)).not.toContain("secret-access-token");
    expect(cipher.decrypt(encrypted).accessToken).toBe("secret-access-token");

    const first = encrypted.ciphertextBase64Url[0];
    const tampered = {
      ...encrypted,
      ciphertextBase64Url:
        (first === "A" ? "B" : "A") + encrypted.ciphertextBase64Url.slice(1),
    };
    expect(() => cipher.decrypt(tampered)).toThrow();
  });

  it("stores only encrypted credential envelopes", async () => {
    const cipher = new CredentialCipher(randomBytes(32).toString("base64url"), "test-key");
    const connection = createProviderConnection({
      provider: "vercel",
      scopes: ["read:project"],
      credential: cipher.encrypt({
        accessToken: "never-store-plaintext",
        tokenType: "Bearer",
        scope: ["read:project"],
      }),
      now: "2026-09-15T00:00:00.000Z",
    });
    const store = new MemoryCredentialStore();
    await store.save(connection);
    const loaded = await store.get(connection.id);

    expect(loaded?.id).toBe(connection.id);
    expect(JSON.stringify(loaded)).not.toContain("never-store-plaintext");
  });

  it("persists an explicit provider project binding without changing the encrypted credential", async () => {
    const cipher = new CredentialCipher(randomBytes(32).toString("base64url"), "test-key");
    const connection = createProviderConnection({
      provider: "vercel",
      scopes: ["read:project"],
      credential: cipher.encrypt({
        accessToken: "bound-project-secret",
        tokenType: "Bearer",
        scope: ["read:project"],
      }),
      now: "2026-09-15T00:00:00.000Z",
    });
    const bound = bindProviderProject(connection, {
      projectId: "prj_123",
      projectName: "relyo-demo",
      now: "2026-09-15T01:00:00.000Z",
    });
    const store = new MemoryCredentialStore();
    await store.save(bound);
    const loaded = await store.get(connection.id);

    expect(loaded).toMatchObject({
      boundProjectId: "prj_123",
      boundProjectName: "relyo-demo",
      updatedAt: "2026-09-15T01:00:00.000Z",
    });
    expect(loaded?.credential).toEqual(connection.credential);
    expect(JSON.stringify(loaded)).not.toContain("bound-project-secret");
  });
});
