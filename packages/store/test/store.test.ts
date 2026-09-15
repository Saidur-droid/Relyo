import { describe, expect, it } from "vitest";
import { MemoryProofStore, type StoredProofRecord } from "../src/index.js";

function record(): StoredProofRecord {
  return {
    run: {
      id: "run_1",
      subject: { id: "app_1", displayName: "Example", kind: "application" },
      state: "PARTIAL",
      targetAssurance: "R1",
      startedAt: "2026-09-15T00:00:00.000Z",
      completedAt: "2026-09-15T00:00:01.000Z",
    },
    passport: {
      passportVersion: "0.2",
      id: "pass_1",
      subject: { id: "app_1", displayName: "Example", kind: "application" },
      release: { kind: "git", repository: "owner/repo", commitSha: "abc123" },
      environment: { provider: "public-web", projectId: "example.com", environment: "production" },
      targetAssurance: "R1",
      assurance: "R0",
      issuedAt: "2026-09-15T00:00:01.000Z",
      results: [],
      evidence: [],
      exclusions: ["provider evidence missing"],
      verifier: { name: "test", version: "0.1.0" },
    },
    evidence: [],
    createdAt: "2026-09-15T00:00:01.000Z",
  };
}

describe("ProofStore", () => {
  it("stores and reloads a proof record", async () => {
    const store = new MemoryProofStore();
    await store.save(record());
    const loaded = await store.get("run_1");
    expect(loaded?.passport.id).toBe("pass_1");
  });

  it("does not allow the same proof run to be overwritten", async () => {
    const store = new MemoryProofStore();
    await store.save(record());
    await expect(store.save(record())).rejects.toThrow(/immutable/i);
  });

  it("returns defensive copies", async () => {
    const store = new MemoryProofStore();
    await store.save(record());
    const loaded = await store.get("run_1");
    if (!loaded) throw new Error("fixture not stored");
    loaded.passport.environment.projectId = "tampered";
    expect((await store.get("run_1"))?.passport.environment.projectId).toBe("example.com");
  });
});
