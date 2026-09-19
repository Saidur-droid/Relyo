import { describe, expect, it } from "vitest";
import { parseCli } from "../src/index.js";

describe("Relyo CLI", () => {
  it("parses proof requests", () => {
    expect(parseCli(["prove", "--url", "https://example.com", "--repo", "o/r"], {})).toMatchObject({
      command: "prove", url: "https://example.com", repo: "o/r",
    });
  });

  it("refuses command-line API keys to avoid shell-history exposure", () => {
    expect(() => parseCli(["prove", "--repo", "o/r", "--api-key", "secret"], {})).toThrow("Do not pass API keys");
  });

  it("parses get by run id", () => {
    expect(parseCli(["get", "run_123"], {})).toMatchObject({ command: "get", runId: "run_123" });
  });
});
