import { describe, expect, it } from "vitest";
import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import type { DiscoveryResult } from "@relyo/discovery";
import { buildVercelR1Report } from "../src/vercel-r1.js";

function discovery(): DiscoveryResult {
  return {
    url: {
      inputUrl: "https://app.example.com/",
      finalUrl: "https://app.example.com/",
      host: "app.example.com",
      status: 200,
      reachable: true,
      https: true,
      redirectCount: 0,
      latencyMs: 120,
      headers: {
        strictTransportSecurity: true,
        contentSecurityPolicy: true,
        xContentTypeOptions: true,
        referrerPolicy: true,
        permissionsPolicy: true,
      },
      evidence: [{
        id: "ev_url",
        kind: "public-http-observation",
        sha256: "a".repeat(64),
        collectedAt: "2026-09-15T00:00:00.000Z",
        source: "https://app.example.com",
        redacted: true,
      }],
      findings: [],
    },
    repo: {
      repository: "owner/repo",
      htmlUrl: "https://github.com/owner/repo",
      defaultBranch: "main",
      commitSha: "0123456789abcdef0123456789abcdef01234567",
      private: false,
      archived: false,
      packageManager: "pnpm",
      scripts: ["build", "test"],
      technologies: [{ key: "nextjs", label: "Next.js", category: "framework" }],
      rootFiles: [".env.example", "package.json", "pnpm-lock.yaml"],
      envTemplateVariables: ["DATABASE_URL", "APP_SECRET"],
      evidence: [{
        id: "ev_repo",
        kind: "github-repository-observation",
        sha256: "b".repeat(64),
        collectedAt: "2026-09-15T00:00:00.000Z",
        source: "https://github.com/owner/repo",
        redacted: true,
      }],
      findings: [],
    },
    graph: {
      nodes: [],
      edges: [],
      unknowns: [
        "Production environment variable presence requires provider connection.",
        "Rollback readiness requires deployment-provider evidence.",
      ],
    },
    findings: [],
    evidence: [],
  };
}

function provider(overrides: Partial<VercelProductionObservation> = {}): VercelProductionObservation {
  return {
    provider: "vercel",
    projectId: "prj_1",
    projectName: "demo",
    productionDeployment: {
      id: "dpl_new",
      url: "demo.vercel.app",
      state: "READY",
      target: "production",
      createdAt: 20,
      readyAt: 21,
      gitCommitSha: "0123456789abcdef0123456789abcdef01234567",
    },
    previousReadyProductionDeployments: [{
      id: "dpl_old",
      url: "demo-old.vercel.app",
      state: "READY",
      target: "production",
      createdAt: 10,
      readyAt: 11,
      gitCommitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    }],
    domains: [{ name: "app.example.com", verified: true }],
    environmentKeys: [
      { key: "APP_SECRET", targets: ["production"], type: "encrypted" },
      { key: "DATABASE_URL", targets: ["production"], type: "encrypted" },
    ],
    rollback: {
      promoteApiSupported: true,
      eligiblePreviousDeploymentCount: 1,
      ready: true,
    },
    evidence: [{
      id: "ev_vercel",
      kind: "vercel-production-observation",
      sha256: "c".repeat(64),
      collectedAt: "2026-09-15T00:00:00.000Z",
      source: "vercel:project:prj_1",
      redacted: true,
    }],
    ...overrides,
  };
}

function resultStatus(report: ReturnType<typeof buildVercelR1Report>, contractId: string) {
  return report.passport.results.find((result) => result.contractId === contractId)?.status;
}

describe("provider-backed Vercel R1", () => {
  it("promotes to R1 only when every launch contract has independent PASS evidence", () => {
    const report = buildVercelR1Report({ discovery: discovery(), provider: provider() });
    expect(report.achievedAssurance).toBe("R1");
    expect(report.blockers).toEqual([]);
    expect(report.passport.environment.provider).toBe("vercel");
    expect(report.passport.release.kind).toBe("git");
    if (report.passport.release.kind === "git") {
      expect(report.passport.release.buildId).toBe("dpl_new");
    }
  });

  it("refuses R1 when deployed commit does not match repository release", () => {
    const current = provider();
    const report = buildVercelR1Report({
      discovery: discovery(),
      provider: provider({
        productionDeployment: current.productionDeployment
          ? { ...current.productionDeployment, gitCommitSha: "ffffffffffffffffffffffffffffffffffffffff" }
          : null,
      }),
    });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.release-identity")).toBe("FAIL");
  });

  it("refuses R1 when a required production environment key is missing", () => {
    const report = buildVercelR1Report({
      discovery: discovery(),
      provider: provider({
        environmentKeys: [{ key: "DATABASE_URL", targets: ["production"], type: "encrypted" }],
      }),
    });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.production-environment")).toBe("FAIL");
  });

  it("keeps undeclared environment requirements UNKNOWN even if provider keys exist", () => {
    const discovered = discovery();
    discovered.repo!.envTemplateVariables = [];
    const report = buildVercelR1Report({ discovery: discovered, provider: provider() });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.production-environment")).toBe("UNKNOWN");
  });

  it("does not count preview-only keys as production configuration", () => {
    const report = buildVercelR1Report({
      discovery: discovery(),
      provider: provider({ environmentKeys: [
        { key: "APP_SECRET", targets: ["preview"], type: "encrypted" },
        { key: "DATABASE_URL", targets: ["production"], type: "encrypted" },
      ] }),
    });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.production-environment")).toBe("FAIL");
    expect(report.blockers).toContain("APP_SECRET was not observed in Vercel production environment metadata.");
  });

  it("refuses R1 when rollback readiness is not independently observed", () => {
    const report = buildVercelR1Report({
      discovery: discovery(),
      provider: provider({
        previousReadyProductionDeployments: [],
        rollback: {
          promoteApiSupported: true,
          eligiblePreviousDeploymentCount: 0,
          ready: false,
        },
      }),
    });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.rollback-readiness")).toBe("FAIL");
  });

  it("refuses R1 when the checked host is not a verified Vercel domain", () => {
    const report = buildVercelR1Report({
      discovery: discovery(),
      provider: provider({ domains: [{ name: "other.example.com", verified: true }] }),
    });
    expect(report.achievedAssurance).toBe("R0");
    expect(resultStatus(report, "launch.provider-production")).toBe("FAIL");
  });
});
