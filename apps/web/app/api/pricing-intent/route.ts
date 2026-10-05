import { NextResponse } from "next/server";
import { databasePool } from "../../lib/server-services";

const allowedPrices = new Set([29, 49, 79]);
const allowedRoles = new Set(["Founder / CTO", "Engineering lead", "Agency / studio", "Developer", "Other"]);
const allowedWindows = new Set(["Within 48 hours", "Within 7 days", "Within 30 days", "Later / exploring"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const priceUsd = Number(body?.priceUsd);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = typeof body?.role === "string" ? body.role : "";
    const launchWindow = typeof body?.launchWindow === "string" ? body.launchWindow : "";
    const source = typeof body?.source === "string" ? body.source.slice(0, 80) : "unknown";

    if (!allowedPrices.has(priceUsd) || !allowedRoles.has(role) || !allowedWindows.has(launchWindow)) {
      return NextResponse.json({ error: "invalid-intent" }, { status: 400 });
    }
    if (!email || email.length > 254 || !email.includes("@")) {
      return NextResponse.json({ error: "invalid-email" }, { status: 400 });
    }

    const pool = databasePool();
    await pool.query(
      `CREATE TABLE IF NOT EXISTS pricing_intents (
        id bigserial PRIMARY KEY,
        email text NOT NULL,
        role text NOT NULL,
        launch_window text NOT NULL,
        price_usd integer NOT NULL CHECK (price_usd IN (29, 49, 79)),
        source text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`,
    );

    await pool.query(
      `INSERT INTO pricing_intents (email, role, launch_window, price_usd, source)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, role, launchWindow, priceUsd, source],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("pricing-intent-error", error);
    return NextResponse.json({ error: "intent-save-failed" }, { status: 500 });
  }
}
