import { describe, expect, it, vi } from "vitest";
import { createRemediationAction, createRemediationPlan, executeRemediation } from "@relyo/remediation";
import { SupabaseAuthRemediationAdapter } from "../src/index.js";

function action() {
  return createRemediationAction({
    id: "act_auth",
    kind: "supabase.auth.redirect.update",
    requiredCapabilities: ["auth-config:write"],
    blastRadius: "Supabase Auth redirect configuration",
    rollbackMethod: "Restore captured Auth configuration",
    verificationContracts: ["supabase.auth-config"],
    target: "proj",
    desiredState: {
      site_url: "https://app.example",
      uri_allow_list: "https://app.example/**",
    },
  });
}

describe("Supabase Auth remediation adapter", () => {
  it("requires explicit approval and independently verifies written config", async () => {
    let getCount = 0;
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      if (!init?.method) {
        getCount++;
        return Response.json(getCount === 1
          ? { site_url: "https://old.example", uri_allow_list: "https://old.example/**" }
          : { site_url: "https://app.example", uri_allow_list: "https://app.example/**" });
      }
      return Response.json({});
    });
    const adapter = new SupabaseAuthRemediationAdapter({ token: "token", projectRef: "abc123", fetchImpl });
    const a = action();
    const result = await executeRemediation({
      plan: createRemediationPlan({ failedContractId: "supabase.auth-config", actions: [a] }),
      action: a,
      adapter,
      approval: { actionId: a.id, approved: true, approvedBy: "human", approvedAt: "2026-09-19T00:00:00Z" },
    });
    expect(result.status).toBe("VERIFIED");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("restores captured config when verification fails", async () => {
    let getCount = 0;
    const bodies: unknown[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      if (!init?.method) {
        getCount++;
        return Response.json({ site_url: "https://old.example", uri_allow_list: "https://old.example/**" });
      }
      bodies.push(JSON.parse(String(init.body)));
      return Response.json({});
    });
    const adapter = new SupabaseAuthRemediationAdapter({ token: "token", projectRef: "abc123", fetchImpl });
    const a = action();
    const result = await executeRemediation({
      plan: createRemediationPlan({ failedContractId: "supabase.auth-config", actions: [a] }),
      action: a,
      adapter,
      approval: { actionId: a.id, approved: true },
    });
    expect(getCount).toBe(2);
    expect(result.status).toBe("ROLLED_BACK");
    expect(bodies.at(-1)).toEqual({
      site_url: "https://old.example",
      uri_allow_list: "https://old.example/**",
    });
  });
});
