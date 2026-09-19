import { describe, expect, it } from "vitest";
import { GitHubCheckClient, githubCheckConclusion } from "../src/index.js";
import type { Passport } from "@relyo/kernel";

function passport(assurance: Passport["assurance"], target: Passport["targetAssurance"], status: "PASS" | "FAIL" | "UNKNOWN"): Passport {
  return {
    passportVersion: "0.2",
    id: "pass_test",
    subject: { id: "app", displayName: "App", kind: "application" },
    release: { kind: "git", repository: "owner/repo", commitSha: "a".repeat(40) },
    environment: { provider: "test", projectId: "p", environment: "production" },
    targetAssurance: target,
    assurance,
    issuedAt: "2026-09-19T00:00:00.000Z",
    results: [{ contractId: "c", contractVersion: "1", status, assertions: [], unknowns: [], evidenceRefs: [] }],
    evidence: [],
    exclusions: [],
    verifier: { name: "Relyo", version: "test" },
  };
}

describe("GitHub Check", () => {
  it("maps exact target assurance to success", () => {
    expect(githubCheckConclusion(passport("R2", "R2", "PASS"))).toBe("success");
  });

  it("maps failed proof to failure and unknown proof to neutral", () => {
    expect(githubCheckConclusion(passport("R0", "R1", "FAIL"))).toBe("failure");
    expect(githubCheckConclusion(passport("R0", "R1", "UNKNOWN"))).toBe("neutral");
  });

  it("publishes a completed check without leaking token into body", async () => {
    let request: RequestInit | undefined;
    const fetchImpl: typeof fetch = async (_input, init) => {
      request = init;
      return new Response(JSON.stringify({ id: 42, html_url: "https://github.test/check/42" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      });
    };
    const client = new GitHubCheckClient({ token: "secret-token", fetchImpl, apiBaseUrl: "https://github.test" });
    const result = await client.publish({ owner: "o", repo: "r", headSha: "a".repeat(40), passport: passport("R1", "R1", "PASS") });
    expect(result.conclusion).toBe("success");
    expect(String(request?.body)).not.toContain("secret-token");
    expect((request?.headers as Record<string, string>).Authorization).toContain("secret-token");
  });
});
