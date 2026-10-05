"use client";

import { useState, type FormEvent } from "react";

const prices = [29, 49, 79] as const;

export function PricingIntent() {
  const [price, setPrice] = useState<number>(49);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Founder / CTO");
  const [launchWindow, setLaunchWindow] = useState("Within 7 days");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    try {
      const response = await fetch("/api/pricing-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ priceUsd: price, email, role, launchWindow, source: "homepage-wtp-v1" }),
      });
      if (!response.ok) throw new Error("save-failed");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="intentCard" onSubmit={submit}>
      <fieldset>
        <legend>At which one-time price would you seriously consider Launch Proof?</legend>
        <div className="priceChoices">
          {prices.map((candidate) => (
            <label key={candidate} className={candidate === price ? "priceChoice selected" : "priceChoice"}>
              <input
                type="radio"
                name="price"
                value={candidate}
                checked={candidate === price}
                onChange={() => setPrice(candidate)}
              />
              <strong>${candidate}</strong>
              <span>one-time</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="intentFields">
        <label>
          Your role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option>Founder / CTO</option>
            <option>Engineering lead</option>
            <option>Agency / studio</option>
            <option>Developer</option>
            <option>Other</option>
          </select>
        </label>
        <label>
          Launch timing
          <select value={launchWindow} onChange={(event) => setLaunchWindow(event.target.value)}>
            <option>Within 48 hours</option>
            <option>Within 7 days</option>
            <option>Within 30 days</option>
            <option>Later / exploring</option>
          </select>
        </label>
      </div>

      <label>
        Email for beta access
        <input
          required
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <button type="submit" disabled={status === "saving" || status === "saved"}>
        {status === "saving" ? "Saving..." : status === "saved" ? "Intent recorded" : `Reserve beta at $${price}`}
      </button>
      <p className="formNote">
        No payment and no card. This is a measurable purchase-intent signal, not a completed sale.
      </p>
      {status === "error" && <p className="intentError">Could not record the signal. Please try again.</p>}
      {status === "saved" && <p className="intentSuccess">Recorded. We will use this cohort to test real paid conversion before changing pricing.</p>}
    </form>
  );
}
