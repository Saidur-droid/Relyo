import { describe, expect, it } from "vitest";
import { analyzeCosts, dominantCostContributors } from "../src/index.js";

describe("Cost Intelligence", () => {
  it("calculates journey cost and orders dominant contributors", () => {
    const report = analyzeCosts({
      scope: "journey",
      source: "test",
      budget: { maxJourneyCostUsd: 1, maxOperationCostUsd: 0.5 },
      events: [
        { id: "1", provider: "openai", resourceKind: "llm", operation: "reason", quantity: 2, unit: "call", unitPriceUsd: 0.3, occurredAt: "2026-09-19T00:00:00Z" },
        { id: "2", provider: "supabase", resourceKind: "database", operation: "query", quantity: 100, unit: "query", unitPriceUsd: 0.001, occurredAt: "2026-09-19T00:00:00Z" },
      ],
    });
    expect(report.knownCostUsd).toBeCloseTo(0.7);
    expect(dominantCostContributors(report)[0]?.provider).toBe("openai");
    expect(report.warnings.some((warning) => warning.includes("operation budget"))).toBe(true);
  });

  it("does not silently assume a price for unknown events", () => {
    const report = analyzeCosts({
      scope: "release",
      source: "test",
      events: [{ id: "1", provider: "unknown", resourceKind: "external-api", operation: "call", quantity: 3, unit: "call", occurredAt: "2026-09-19T00:00:00Z" }],
    });
    expect(report.knownCostUsd).toBe(0);
    expect(report.unknownEventCount).toBe(1);
    expect(report.warnings[0]).toContain("lower bound");
  });

  it("rejects negative or non-finite metering", () => {
    expect(() => analyzeCosts({
      scope: "journey",
      source: "test",
      events: [{ id: "1", provider: "x", resourceKind: "other", operation: "x", quantity: -1, unit: "x", occurredAt: "2026-09-19T00:00:00Z" }],
    })).toThrow();
  });
});
