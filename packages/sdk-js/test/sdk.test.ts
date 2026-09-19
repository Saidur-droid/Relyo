import { describe, expect, it } from "vitest";
import { RelyoClient } from "../src/index.js";

describe("Relyo TypeScript SDK", () => {
  it("authenticates API requests without placing the key in URL/body", async () => {
    let seenUrl = "";
    let seenInit: RequestInit | undefined;
    const client = new RelyoClient({
      baseUrl: "https://relyo.example/",
      apiKey: "rly_live_abcdefghijklmnopqrstuvwxyz",
      fetchImpl: async (input, init) => {
        seenUrl = String(input);
        seenInit = init;
        return Response.json({ run: { id: "run_x", state: "VERIFIED", targetAssurance: "R1", startedAt: "x" } });
      },
    });
    await client.createProofRun({ githubRepo: "owner/repo" });
    expect(seenUrl).toBe("https://relyo.example/api/v1/proof-runs");
    expect(seenUrl).not.toContain("rly_live_");
    expect(String(seenInit?.body)).not.toContain("rly_live_");
    expect((seenInit?.headers as Record<string, string>).authorization).toContain("rly_live_");
  });

  it("validates required proof input", async () => {
    const client = new RelyoClient({ baseUrl: "https://relyo.example", apiKey: "rly_live_abcdefghijklmnopqrstuvwxyz" });
    await expect(client.createProofRun({})).rejects.toThrow("Provide");
  });
});
