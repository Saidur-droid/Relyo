import { describe, expect, it } from "vitest";
import { assertFleetIsolation, evaluateFleetQueue, providerIncidentBlastRadius, scheduleBulkProofs, type FleetApp } from "../src/index.js";

const app = (id: string, org = "org"): FleetApp => ({
  id, organizationId: org, name: id, providerKeys: ["vercel:team"], currentAssurance: "R1", targetAssurance: "R2", degraded: false,
});

describe("Agency/Fleet", () => {
  it("strictly rejects cross-tenant app access", () => {
    expect(() => assertFleetIsolation("org", app("a", "other"))).toThrow("Cross-organization");
  });

  it("prioritizes provider incident and degraded/expired proof queues", () => {
    const a = app("a"); a.degraded = true;
    const b = app("b"); b.passportExpiresAt = "2026-09-18T00:00:00Z";
    const queue = evaluateFleetQueue({
      organization: { id: "org", name: "Agency", appLimit: 20 },
      apps: [a, b],
      policy: { organizationId: "org", minimumAssurance: "R2", maxPassportAgeMs: 1000 },
      incidentProviderKeys: ["vercel:team"],
      now: new Date("2026-09-19T00:00:00Z"),
    });
    expect(queue[0]?.reason).toBe("PROVIDER_INCIDENT");
    expect(queue.some((item) => item.reason === "DEGRADED")).toBe(true);
    expect(queue.some((item) => item.reason === "EXPIRED")).toBe(true);
  });

  it("computes provider blast radius and bounded bulk batches", () => {
    expect(providerIncidentBlastRadius([app("b"), app("a")], "vercel:team")).toEqual(["a", "b"]);
    expect(scheduleBulkProofs({ organization: { id: "org", name: "Agency", appLimit: 20 }, apps: [app("a"), app("b"), app("c")], maxBatchSize: 2 })).toEqual([["a", "b"], ["c"]]);
  });
});
