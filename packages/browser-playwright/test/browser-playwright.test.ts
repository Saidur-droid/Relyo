import { describe, expect, it, vi } from "vitest";
import { PlaywrightJourneyDriver, type PlaywrightBrowserLike, type PlaywrightContextLike, type PlaywrightLocatorLike, type PlaywrightPageLike } from "../src/index.js";

function fakeBrowser() {
  const calls: string[] = [];
  const locator = {
    fill: vi.fn(async () => { calls.push("fill"); }),
    click: vi.fn(async () => { calls.push("click"); }),
    waitFor: vi.fn(async () => { calls.push("visible"); }),
    textContent: vi.fn(async () => "Dashboard ready"),
  } as unknown as PlaywrightLocatorLike;
  const page = {
    goto: vi.fn(async () => { calls.push("goto"); return null; }),
    locator: vi.fn(() => locator),
    waitForURL: vi.fn(async () => { calls.push("waitForURL"); }),
    screenshot: vi.fn(async () => Buffer.from("png")),
  } as unknown as PlaywrightPageLike;
  const context = {
    newPage: vi.fn(async () => page),
    close: vi.fn(async () => { calls.push("close"); }),
  } as unknown as PlaywrightContextLike;
  const browser = {
    newContext: vi.fn(async () => context),
  } as unknown as PlaywrightBrowserLike;
  return { browser, calls };
}

const spec = {
  baseUrl: "https://app.example",
  steps: {
    signup: {
      title: "Sign up",
      actions: [
        { kind: "goto" as const, url: "/signup" },
        { kind: "fill" as const, selector: "[name=email]", value: "synthetic@example.com" },
        { kind: "click" as const, selector: "button[type=submit]" },
        { kind: "waitForUrl" as const, url: "/dashboard" },
        { kind: "expectText" as const, selector: "main", text: "Dashboard" },
        { kind: "screenshot" as const, name: "signup-success" },
      ],
    },
    verifyIdentity: { title: "Verify", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    assertAuthenticated: { title: "Auth", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    createPrimaryResource: { title: "Create", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    executeCoreAction: { title: "Core", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    logout: { title: "Logout", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    loginAgain: { title: "Login again", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
    cleanup: { title: "Cleanup", actions: [{ kind: "expectVisible" as const, selector: "main" }] },
  },
};

describe("Playwright browser journey driver", () => {
  it("uses one isolated context and emits screenshot artifact refs", async () => {
    const { browser, calls } = fakeBrowser();
    const saveScreenshot = vi.fn(async () => "artifact://shot");
    const driver = new PlaywrightJourneyDriver({
      browser,
      spec,
      artifacts: { saveScreenshot },
      now: () => new Date("2026-09-19T00:00:00Z"),
    });
    const result = await driver.signup();
    expect(result.status).toBe("PASS");
    expect(result.artifactRefs).toEqual(["artifact://shot"]);
    expect(calls).toEqual(["goto", "fill", "click", "waitForURL", "visible"]);
    await driver.dispose();
    expect(calls.at(-1)).toBe("close");
  });

  it("fails navigation that escapes the configured app origin before browser use", () => {
    const { browser } = fakeBrowser();
    expect(() => new PlaywrightJourneyDriver({
      browser,
      spec: {
        ...spec,
        steps: { ...spec.steps, signup: { title: "bad", actions: [{ kind: "goto", url: "https://evil.example" }] } },
      },
      artifacts: { saveScreenshot: async () => "x" },
    })).toThrow("escapes application origin");
  });

  it("records browser assertion failure as FAIL instead of throwing away journey state", async () => {
    const { browser } = fakeBrowser();
    const driver = new PlaywrightJourneyDriver({
      browser,
      spec: { ...spec, steps: { ...spec.steps, signup: { title: "Mismatch", actions: [{ kind: "expectText", selector: "main", text: "Missing" }] } } },
      artifacts: { saveScreenshot: async () => "x" },
    });
    const result = await driver.signup();
    expect(result.status).toBe("FAIL");
    expect(result.detail).toContain("Expected text");
    await driver.dispose();
  });
});
