import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relyo — Verify before customers depend on it",
  description:
    "Independent production proof for modern software. Check launch-critical outcomes, preserve unknowns, and issue evidence-backed Production Passports.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
