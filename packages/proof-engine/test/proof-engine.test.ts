import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { VercelProductionObservation } from "@relyo/adapter-vercel";
import type { DiscoveryResult } from "@relyo/discovery";
import { verifySignedPassport } from "@relyo/kernel/signing";
import { MemoryProofStore } from "@relyo/store";
import { executePublicR1Proof, executeVercelR1Proof } from "../src/index.js";

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
      latencyMs: 90,
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
      envTemplateVariables: ["DATABASE_URL"],
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
    graph: { nodes: [], edges: [], unknowns: [] },
    findings: [],
    evidence: [
      {
        id: "ev_url",
        kind: "public-http-observation",
        sha256: "a".repeat(64),
        collectedAt: "2026-09-15T00:00:00.000Z",
        source: "https://app.example.com",
        redacted: true,
      },
      {
        id: "ev_repo",
        kind: "github-repository-observation",
        sha256: "b".repeat(64),
        collectedAt: "2026-09-15T00:00:00.000Z",
        source: "https://github.com/owner/repo",
        redacted: true,
      },
    ],
  };
}

function provider(): VercelProductionObservation {
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
    environmentKeys: [{ key: "DATABASE_URL", targets: ["production"], type: "encrypted" }],
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
  };
}

describe("proof engine", () => {
  it("creates and stores a signed provider-neutral proof without a deployment provider", async () => {
    const keys = generateKeyPairSync("ed25519");
    const store = new MemoryProofStore();

    const executed = await executePublicR1Proof({
      discovery: discovery(),
      store,
      signingPrivateKey: keys.privateKey,
      runId: "run_public",
      startedAt: "2026-09-15T00:00:00.000Z",
      completedAt: "2026-09-15T00:00:01.000Z",
    });

    expect(executed.run.state).toBe("PARTIAL");
    expect(executed.signedPassport.passport.assurance).toBe("R0");
    expect(verifySignedPassport({ envelope: executed.signedPassport, publicKey: keys.publicKey })).toBe(true);
    expect(executed.blockers.some((item) => /deployment-provider evidence/i.test(item))).toBe(true);

    const stored = await store.get("run_public");
    expect(stored?.evidence.map((item) => item.id).sort()).toEqual(["ev_repo", "ev_url"]);
  });

  it("creates, signs and durably stores a VERIFIED R1 proof", async () => {
    const keys = generateKeyPairSync("ed25519");
    const store = new MemoryProofStore();

    const executed = await executeVercelR1Proof({
      discovery: discovery(),
      provider: provider(),
      store,
      signingPrivateKey: keys.privateKey,
      runId: "run_verified",
      startedAt: "2026-09-15T00:00:00.000Z",
      completedAt: "2026-09-15T00:00:01.000Z",
    });

    expect(executed.run.state).toBe("VERIFIED");
    expect(executed.signedPassport.passport.assurance).toBe("R1");
    expect(verifySignedPassport({ envelope: executed.signedPassport, publicKey: keys.publicKey })).toBe(true);

    const stored = await store.get("run_verified");
    expect(stored?.signedPassport?.passportSha256).toBe(executed.signedPassport.passportSha256);
    expect(stored?.evidence.map((item) => item.id).sort()).toEqual(["ev_repo", "ev_url", "ev_vercel"]);
  });

  it("stores a FAILED run instead of issuing R1 when required config is missing", async () => {
    const keys = generateKeyPairSync("ed25519");
    const store = new MemoryProofStore();
    const brokenProvider = provider();
    brokenProvider.environmentKeys = [];

    const executed = await executeVercelR1Proof({
      discovery: discovery(),
      provider: brokenProvider,
      store,
      signingPrivateKey: keys.privateKey,
      runId: "run_failed",
    });

    expect(executed.run.state).toBe("FAILED");
    expect(executed.signedPassport.passport.assurance).toBe("R0");
    expect(executed.blockers.some((item) => item.includes("DATABASE_URL"))).toBe(true);
  });
});
