import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  CredentialCipher,
  MemoryCredentialStore,
  bindProviderProject,
  createProviderConnection,
} from "../src/index.js";

describe("Supabase provider credential boundary", () => {
  it("encrypts, stores, and binds Supabase credentials without changing provider identity", async () => {
    const cipher = new CredentialCipher(randomBytes(32).toString("base64url"));
    const store = new MemoryCredentialStore();
    const credential = cipher.encrypt({
      accessToken: "supabase-access-secret",
      refreshToken: "supabase-refresh-secret",
      tokenType: "bearer",
      scope: ["management-api"],
    });
    const connection = createProviderConnection({
      provider: "supabase",
      scopes: ["management-api"],
      credential,
    });
    const bound = bindProviderProject(connection, { projectId: "ref_123", projectName: "prod" });
    await store.save(bound);

    const restored = await store.get(connection.id);
    expect(restored?.provider).toBe("supabase");
    expect(restored?.boundProjectId).toBe("ref_123");
    expect(JSON.stringify(restored)).not.toContain("supabase-access-secret");
    expect(cipher.decrypt(restored!.credential).accessToken).toBe("supabase-access-secret");
  });
});
