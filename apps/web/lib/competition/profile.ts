export type CompetitionProfileName = "nebius" | "paypal";

export interface CompetitionProfile {
  name: CompetitionProfileName;
  eyebrow: string;
  headline: string;
  description: string;
  proofFocus: string;
}

const PROFILES: Record<CompetitionProfileName, CompetitionProfile> = {
  nebius: {
    name: "nebius",
    eyebrow: "Nebius x NVIDIA competition mode",
    headline: "Nemotron reasons. Relyo independently proves.",
    description:
      "NVIDIA Nemotron runs through Nebius Token Factory to prioritize proof, diagnose failures and propose remediation. Deterministic Relyo contracts still decide PASS, FAIL, PARTIAL or UNKNOWN.",
    proofFocus: "Reasoning -> deterministic proof -> evidence -> re-verification",
  },
  paypal: {
    name: "paypal",
    eyebrow: "PayPal AI competition mode",
    headline: "Payment success is not the same as business success.",
    description:
      "Relyo follows the PayPal sandbox order through verified webhook handling, application state, entitlement and the customer-visible outcome before it calls the payment journey verified.",
    proofFocus: "PayPal order -> webhook -> app state -> entitlement -> customer outcome",
  },
};

export function getCompetitionProfile(
  value = process.env.COMPETITION_PROFILE,
): CompetitionProfile | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "nebius" || normalized === "paypal") {
    return PROFILES[normalized];
  }
  return null;
}
