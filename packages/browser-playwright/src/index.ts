import type { JourneyDriver, JourneyStepResult } from "@relyo/journey";

export interface PlaywrightLocatorLike {
  fill(value: string, options?: { timeout?: number }): Promise<void>;
  click(options?: { timeout?: number }): Promise<void>;
  waitFor(options?: { state?: "visible"; timeout?: number }): Promise<void>;
  textContent(options?: { timeout?: number }): Promise<string | null>;
}

export interface PlaywrightPageLike {
  goto(url: string, options?: { waitUntil?: "domcontentloaded"; timeout?: number }): Promise<unknown>;
  locator(selector: string): PlaywrightLocatorLike;
  waitForURL(url: string | RegExp, options?: { timeout?: number }): Promise<void>;
  screenshot(options?: { fullPage?: boolean; type?: "png" }): Promise<Uint8Array>;
}

export interface PlaywrightContextLike {
  newPage(): Promise<PlaywrightPageLike>;
  close(): Promise<void>;
}

export interface PlaywrightBrowserLike {
  newContext(options?: { serviceWorkers?: "block"; [key: string]: unknown }): Promise<PlaywrightContextLike>;
}

export type BrowserAction =
  | { kind: "goto"; url: string }
  | { kind: "fill"; selector: string; value: string; sensitive?: boolean }
  | { kind: "click"; selector: string }
  | { kind: "waitForUrl"; url: string | RegExp }
  | { kind: "expectVisible"; selector: string }
  | { kind: "expectText"; selector: string; text: string | RegExp }
  | { kind: "screenshot"; name: string; fullPage?: boolean };

export interface BrowserJourneyStepSpec {
  title: string;
  actions: BrowserAction[];
  timeoutMs?: number;
}

export interface BrowserJourneySpec {
  baseUrl: string;
  steps: {
    signup: BrowserJourneyStepSpec;
    verifyIdentity: BrowserJourneyStepSpec;
    assertAuthenticated: BrowserJourneyStepSpec;
    createPrimaryResource: BrowserJourneyStepSpec;
    executeCoreAction: BrowserJourneyStepSpec;
    logout: BrowserJourneyStepSpec;
    loginAgain: BrowserJourneyStepSpec;
    cleanup: BrowserJourneyStepSpec;
    checkout?: BrowserJourneyStepSpec;
    awaitWebhook?: BrowserJourneyStepSpec;
    assertEntitlementActive?: BrowserJourneyStepSpec;
    cancelSubscription?: BrowserJourneyStepSpec;
    assertEntitlementRevoked?: BrowserJourneyStepSpec;
  };
}

export interface BrowserArtifactSink {
  saveScreenshot(input: {
    name: string;
    bytes: Buffer;
    step: string;
  }): Promise<string>;
}

export interface PlaywrightJourneyDriverOptions {
  browser: PlaywrightBrowserLike;
  spec: BrowserJourneySpec;
  artifacts: BrowserArtifactSink;
  now?: () => Date;
  contextOptions?: { serviceWorkers?: "block"; [key: string]: unknown };
}

function validateSpec(spec: BrowserJourneySpec): void {
  const base = new URL(spec.baseUrl);
  if (base.protocol !== "https:" && base.hostname !== "localhost" && base.hostname !== "127.0.0.1") {
    throw new Error("Browser journey base URL must use HTTPS outside local development.");
  }
  for (const [stepName, step] of Object.entries(spec.steps)) {
    if (!step || step.actions.length === 0) continue;
    const timeout = step.timeoutMs ?? 30_000;
    if (!Number.isInteger(timeout) || timeout < 1_000 || timeout > 120_000) {
      throw new Error(`Invalid timeout for browser journey step ${stepName}.`);
    }
    for (const action of step.actions) {
      if (action.kind === "goto") {
        const target = new URL(action.url, base);
        if (target.origin !== base.origin) {
          throw new Error(`Browser journey navigation escapes application origin in step ${stepName}.`);
        }
      }
      if (action.kind === "screenshot" && !/^[A-Za-z0-9_-]{1,80}$/.test(action.name)) {
        throw new Error("Screenshot artifact names must be safe identifiers.");
      }
    }
  }
}

function resolveAppUrl(baseUrl: string, value: string): string {
  const base = new URL(baseUrl);
  const target = new URL(value, base);
  if (target.origin !== base.origin) throw new Error("Browser action escaped the configured application origin.");
  return target.toString();
}

export class PlaywrightJourneyDriver implements JourneyDriver {
  private context: PlaywrightContextLike | null = null;
  private page: PlaywrightPageLike | null = null;
  private readonly now: () => Date;

  constructor(private readonly options: PlaywrightJourneyDriverOptions) {
    validateSpec(options.spec);
    this.now = options.now ?? (() => new Date());
  }

  private async ensurePage(): Promise<PlaywrightPageLike> {
    if (this.page) return this.page;
    this.context = await this.options.browser.newContext({
      serviceWorkers: "block",
      ...(this.options.contextOptions ?? {}),
    });
    this.page = await this.context.newPage();
    return this.page;
  }

  private async runStep(key: keyof BrowserJourneySpec["steps"], spec: BrowserJourneyStepSpec | undefined): Promise<JourneyStepResult> {
    const startedAt = this.now().toISOString();
    if (!spec) {
      return {
        id: `browser.${String(key)}`,
        title: String(key),
        status: "UNKNOWN",
        startedAt,
        completedAt: this.now().toISOString(),
        detail: "No browser journey step is configured.",
      };
    }

    const page = await this.ensurePage();
    const artifactRefs: string[] = [];
    const timeout = spec.timeoutMs ?? 30_000;

    try {
      for (const action of spec.actions) {
        switch (action.kind) {
          case "goto":
            await page.goto(resolveAppUrl(this.options.spec.baseUrl, action.url), {
              waitUntil: "domcontentloaded",
              timeout,
            });
            break;
          case "fill":
            await page.locator(action.selector).fill(action.value, { timeout });
            break;
          case "click":
            await page.locator(action.selector).click({ timeout });
            break;
          case "waitForUrl":
            await page.waitForURL(
              typeof action.url === "string"
                ? resolveAppUrl(this.options.spec.baseUrl, action.url)
                : action.url,
              { timeout },
            );
            break;
          case "expectVisible":
            await page.locator(action.selector).waitFor({ state: "visible", timeout });
            break;
          case "expectText": {
            const locator = page.locator(action.selector);
            await locator.waitFor({ state: "visible", timeout });
            const observed = await locator.textContent({ timeout });
            const matched = typeof action.text === "string"
              ? observed?.includes(action.text) === true
              : action.text.test(observed ?? "");
            if (!matched) throw new Error(`Expected text was not observed at ${action.selector}.`);
            break;
          }
          case "screenshot": {
            const bytes = await page.screenshot({ fullPage: action.fullPage ?? false, type: "png" });
            const ref = await this.options.artifacts.saveScreenshot({
              name: action.name,
              bytes: Buffer.from(bytes),
              step: String(key),
            });
            artifactRefs.push(ref);
            break;
          }
        }
      }

      return {
        id: `browser.${String(key)}`,
        title: spec.title,
        status: "PASS",
        startedAt,
        completedAt: this.now().toISOString(),
        ...(artifactRefs.length ? { artifactRefs } : {}),
      };
    } catch (error) {
      return {
        id: `browser.${String(key)}`,
        title: spec.title,
        status: "FAIL",
        startedAt,
        completedAt: this.now().toISOString(),
        detail: error instanceof Error ? error.message : "Browser journey step failed.",
        ...(artifactRefs.length ? { artifactRefs } : {}),
      };
    }
  }

  async signup() { return await this.runStep("signup", this.options.spec.steps.signup); }
  async verifyIdentity() { return await this.runStep("verifyIdentity", this.options.spec.steps.verifyIdentity); }
  async assertAuthenticated() { return await this.runStep("assertAuthenticated", this.options.spec.steps.assertAuthenticated); }
  async createPrimaryResource() { return await this.runStep("createPrimaryResource", this.options.spec.steps.createPrimaryResource); }
  async executeCoreAction() { return await this.runStep("executeCoreAction", this.options.spec.steps.executeCoreAction); }
  async logout() { return await this.runStep("logout", this.options.spec.steps.logout); }
  async loginAgain() { return await this.runStep("loginAgain", this.options.spec.steps.loginAgain); }
  async cleanup() { return await this.runStep("cleanup", this.options.spec.steps.cleanup); }
  async checkout() { return await this.runStep("checkout", this.options.spec.steps.checkout); }
  async awaitWebhook() { return await this.runStep("awaitWebhook", this.options.spec.steps.awaitWebhook); }
  async assertEntitlementActive() { return await this.runStep("assertEntitlementActive", this.options.spec.steps.assertEntitlementActive); }
  async cancelSubscription() { return await this.runStep("cancelSubscription", this.options.spec.steps.cancelSubscription); }
  async assertEntitlementRevoked() { return await this.runStep("assertEntitlementRevoked", this.options.spec.steps.assertEntitlementRevoked); }

  async dispose(): Promise<void> {
    try {
      await this.context?.close();
    } finally {
      this.page = null;
      this.context = null;
    }
  }
}
