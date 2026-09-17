import { describe, expect, it, vi } from "vitest";
import { SupabaseReadClient } from "../src/index.js";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("SupabaseReadClient", () => {
  it("normalizes project/auth/backup metadata without retaining secret fields", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/v1/projects")) {
        return jsonResponse([{ id: "ref_1", ref: "ref_1", name: "prod", organization_id: "org_1", region: "ap-southeast-1", status: "ACTIVE_HEALTHY" }]);
      }
      if (url.includes("/config/auth")) {
        return jsonResponse({
          site_url: "https://app.example.com",
          uri_allow_list: "https://app.example.com/auth/callback,https://preview.example.com/auth/callback",
          disable_signup: false,
          external_email_enabled: true,
          external_phone_enabled: false,
          security_captcha_enabled: true,
          smtp_pass: "must-not-survive",
          hook_secret: "must-not-survive-either",
        });
      }
      if (url.includes("/database/backups")) {
        return jsonResponse({ backups: [{ status: "COMPLETED", created_at: "2026-09-17T00:00:00Z", backup_key: "secret-value" }] });
      }
      return new Response("not found", { status: 404 });
    });

    const observation = await new SupabaseReadClient({ token: "management-oauth-token", fetchImpl: fakeFetch })
      .inspectProduction({ projectRef: "ref_1" });

    expect(observation.project.name).toBe("prod");
    expect(observation.auth?.redirectUrls).toHaveLength(2);
    expect(observation.backups).toEqual({ observed: true, backupCount: 1, latestStatus: "COMPLETED" });
    expect(observation.schemaPolicyInspection).toBe("UNAVAILABLE_WITH_MANAGEMENT_API_OAUTH");
    expect(JSON.stringify(observation)).not.toContain("must-not-survive");
    expect(JSON.stringify(observation)).not.toContain("secret-value");
  });

  it("preserves inaccessible optional provider facts as unknown instead of pass", async () => {
    const fakeFetch = vi.fn<typeof fetch>(async (input) => {
      const url = String(input);
      if (url.endsWith("/v1/projects")) {
        return jsonResponse([{ id: "ref_1", ref: "ref_1", name: "prod", status: "ACTIVE_HEALTHY" }]);
      }
      return new Response("forbidden", { status: 403 });
    });

    const observation = await new SupabaseReadClient({ token: "management-oauth-token", fetchImpl: fakeFetch })
      .inspectProduction({ projectRef: "ref_1" });

    expect(observation.auth).toBeNull();
    expect(observation.backups.observed).toBe(false);
    expect(observation.backups.backupCount).toBeNull();
  });
});
