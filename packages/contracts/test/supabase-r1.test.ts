import { describe, expect, it } from "vitest";
import type { SupabaseProductionObservation } from "@relyo/adapter-supabase";
import type { DiscoveryResult } from "@relyo/discovery";
import { evaluateContract } from "@relyo/kernel";
import { buildSupabaseR1Contracts } from "../src/supabase-r1.js";

const discovery = {
  repo: {
    repository: "owner/repo",
    commitSha: "a".repeat(40),
    defaultBranch: "main",
    rootFiles: ["package.json", ".env.example"],
    packageScripts: {},
    envTemplateVariables: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
    evidence: [{ id: "ev_repo", kind: "repo", sha256: "a".repeat(64), collectedAt: "2026-09-17T00:00:00Z", source: "github", redacted: true }],
  },
  url: {
    requestedUrl: "https://app.example.com",
    finalUrl: "https://app.example.com/",
    status: 200,
    host: "app.example.com",
    headers: {},
    evidence: [],
  },
  graph: { nodes: [], edges: [], unknowns: [] },
  evidence: [],
} as unknown as DiscoveryResult;

function provider(overrides: Partial<SupabaseProductionObservation> = {}): SupabaseProductionObservation {
  return {
    provider: "supabase",
    project: { id: "ref", ref: "ref", name: "prod", organizationId: "org", region: "ap-southeast-1", status: "ACTIVE_HEALTHY" },
    auth: {
      siteUrl: "https://app.example.com",
      redirectUrls: ["https://app.example.com/auth/callback"],
      disableSignup: false,
      emailSignupEnabled: true,
      phoneSignupEnabled: false,
      captchaEnabled: true,
    },
    backups: { observed: true, backupCount: 1, latestStatus: "COMPLETED" },
    rls: {
      observed: true,
      tables: [{ schema: "public", table: "profiles", rlsEnabled: true, policyCount: 2 }],
      exposedTableCount: 1,
      tablesWithoutRls: 0,
    },
    evidence: [{ id: "ev_supabase", kind: "supabase", sha256: "b".repeat(64), collectedAt: "2026-09-17T00:00:00Z", source: "supabase", redacted: true }],
    ...overrides,
  };
}

describe("Supabase R1 contracts", () => {
  it("passes the observed healthy baseline without treating public publishable config as a secret", () => {
    const results = buildSupabaseR1Contracts({ discovery, provider: provider() }).map(evaluateContract);
    expect(results.every((result) => result.status === "PASS")).toBe(true);
  });

  it("fails when an observed table lacks RLS", () => {
    const results = buildSupabaseR1Contracts({
      discovery,
      provider: provider({
        rls: {
          observed: true,
          tables: [{ schema: "public", table: "unsafe", rlsEnabled: false, policyCount: 0 }],
          exposedTableCount: 1,
          tablesWithoutRls: 1,
        },
      }),
    }).map(evaluateContract);
    expect(results.find((result) => result.contractId === "supabase.rls-policy")?.status).toBe("FAIL");
  });

  it("keeps inaccessible RLS evidence unknown", () => {
    const results = buildSupabaseR1Contracts({
      discovery,
      provider: provider({ rls: { observed: false, tables: [], exposedTableCount: null, tablesWithoutRls: null } }),
    }).map(evaluateContract);
    expect(results.find((result) => result.contractId === "supabase.rls-policy")?.status).toBe("UNKNOWN");
  });

  it("keeps backup evidence visible without making provider-managed backups an R1/R2 requirement", () => {
    const contracts = buildSupabaseR1Contracts({
      discovery,
      provider: provider({ backups: { observed: true, backupCount: 0, latestStatus: null } }),
    });
    const backup = contracts.find((contract) => contract.id === "supabase.backup-readiness");
    expect(backup?.requiredFor).toEqual(["R3", "R4"]);
    expect(backup ? evaluateContract(backup).status : undefined).toBe("FAIL");
  });
});
