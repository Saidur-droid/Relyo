import { describe, expect, it } from "vitest";
import { buildLaunchCheckReport } from "../src/index.js";
import type { DiscoveryResult } from "@relyo/discovery";

const discovery: DiscoveryResult = {
  url: {
    inputUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    host: "example.com",
    status: 200,
    reachable: true,
    https: true,
    redirectCount: 0,
    latencyMs: 100,
    headers: {
      strictTransportSecurity: true,
      contentSecurityPolicy: true,
      xContentTypeOptions: true,
      referrerPolicy: true,
      permissionsPolicy: true,
    },
    evidence: [{
      id: "ev_url",
      kind: "http",
      sha256: "abc",
      collectedAt: "2026-09-15T00:00:00.000Z",
      source: "https://example.com",
      redacted: true,
    }],
    findings: [],
  },
  repo: {
    repository: "owner/repo",
    htmlUrl: "https://github.com/owner/repo",
    defaultBranch: "main",
    commitSha: "0123456789abcdef",
    private: false,
    archived: false,
    packageManager: "pnpm",
    scripts: ["build", "test"],
    technologies: [{ key: "nextjs", label: "Next.js", category: "framework" }],
    rootFiles: ["package.json", "pnpm-lock.yaml"],
    envTemplateVariables: [],
    evidence: [{
      id: "ev_repo",
      kind: "github",
      sha256: "def",
      collectedAt: "2026-09-15T00:00:00.000Z",
      source: "https://github.com/owner/repo",
      redacted: true,
    }],
    findings: [],
  },
  graph: {
    nodes: [],
    edges: [],
    unknowns: ["Production environment variable presence requires provider connection."],
  },
  findings: [],
  evidence: [],
};

describe("R1 launch contract pack", () => {
  it("refuses to award R1 while provider evidence is unknown", () => {
    const report = buildLaunchCheckReport(discovery);
    expect(report.achievedAssurance).toBe("R0");
    expect(report.blockers.some((item) => /deployment provider/i.test(item))).toBe(true);
  });

  it("binds the passport to the exact repository commit", () => {
    const report = buildLaunchCheckReport(discovery);
    expect(report.passport.release.kind).toBe("git");
    if (report.passport.release.kind === "git") {
      expect(report.passport.release.commitSha).toBe("0123456789abcdef");
    }
  });
});
