import { describe, expect, it } from "vitest";
import { isPublicIpAddress, normalizeUserUrl } from "../src/index.js";

describe("public scan input security", () => {
  it("normalizes hostnames to https by default", () => {
    expect(normalizeUserUrl("example.com").toString()).toBe("https://example.com/");
  });

  it("rejects embedded credentials", () => {
    expect(() => normalizeUserUrl("https://user:pass@example.com")).toThrow(/credentials/i);
  });

  it("recognizes public and private IP ranges", () => {
    expect(isPublicIpAddress("8.8.8.8")).toBe(true);
    expect(isPublicIpAddress("10.0.0.1")).toBe(false);
    expect(isPublicIpAddress("127.0.0.1")).toBe(false);
    expect(isPublicIpAddress("169.254.169.254")).toBe(false);
    expect(isPublicIpAddress("::1")).toBe(false);
    expect(isPublicIpAddress("2001:4860:4860::8888")).toBe(true);
  });
});
