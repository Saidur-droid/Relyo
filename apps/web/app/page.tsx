import { PricingIntent } from "./pricing-intent";
import { ScanWorkspace } from "./scan-workspace";
import { VerifyLaunchPanel } from "./verify-launch-panel";

const moments = [
  "Verify before launch",
  "Verify before charging customers",
  "Verify before investor demo",
  "Verify client delivery",
  "Verify latest release",
];

const primaryIcp = [
  "Founder-led SaaS teams",
  "1–10 person engineering/product teams",
  "Shipping on Next.js + GitHub + Vercel + Supabase",
  "Within days of launch, first revenue, or a critical demo",
];

export default function Home() {
  return (
    <main>
      <header className="shell nav">
        <a className="brand" href="#top" aria-label="Relyo home">
          <span className="brandMark">R</span>
          <span>Relyo</span>
        </a>
        <div className="navMeta">Independent verification for AI-built SaaS</div>
      </header>

      <section id="top" className="shell hero">
        <div className="eyebrow">Your builder says done. Relyo proves what is true.</div>
        <h1>Independently verify the release before customers depend on it.</h1>
        <p className="heroCopy">
          Relyo sits after AI builders, GitHub, deployment platforms, databases and payment systems.
          It does not replace them. It verifies the production outcomes they claim happened and binds the evidence to the exact release.
        </p>
        <div className="positioningNote">
          <strong>Not another automation platform.</strong>
          <span>Execution happens upstream. Relyo is the independent proof layer after execution.</span>
        </div>
        <div className="heroActions">
          <a className="primaryLink" href="#verify-launch">Verify My Launch</a>
          <a className="textLink" href="#check-free">Check My App Free</a>
        </div>
        <div className="momentRail" aria-label="Launch moments">
          {moments.map((moment) => (
            <span key={moment}>{moment}</span>
          ))}
        </div>
      </section>

      <section className="shell icpSection" aria-labelledby="who-relyo-is-for">
        <div>
          <span className="sectionKicker">Initial customer</span>
          <h2 id="who-relyo-is-for">Built first for technical founders shipping SaaS into real customer risk.</h2>
          <p>
            The first buyer is the founder, CTO, or engineering lead who owns a launch and cannot afford a silent auth,
            payment, data-isolation, deployment, or recovery failure.
          </p>
        </div>
        <div className="icpGrid">
          {primaryIcp.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="icpSecondary">
          <strong>Secondary wedge:</strong> agencies and studios handing verified SaaS products to clients.
        </div>
      </section>

      <section id="check-free" className="shell productStage">
        <ScanWorkspace />
      </section>

      <section className="shell verifyStage">
        <VerifyLaunchPanel />
      </section>

      <section className="shell pricingExperiment" aria-labelledby="pricing-test-title">
        <div>
          <span className="sectionKicker">Willingness-to-pay experiment</span>
          <h2 id="pricing-test-title">Would a verified launch be worth paying for?</h2>
          <p>
            This beta test records declared price intent only. No card is charged. We use the signal to decide whether Launch Proof
            should become a paid product and at what entry price.
          </p>
        </div>
        <PricingIntent />
      </section>

      <section className="shell proofPrinciples">
        <div>
          <span className="sectionKicker">Trust boundary</span>
          <h2>Useful proof without pretending to know what Relyo cannot see.</h2>
        </div>
        <div className="principleGrid">
          <article>
            <strong>Observe</strong>
            <p>Public runtime, repository release identity, and read-only Vercel deployment, domain and configuration metadata.</p>
          </article>
          <article>
            <strong>Verify</strong>
            <p>Deterministic contracts bind the Git SHA to production evidence. An LLM never decides the final R1 state.</p>
          </article>
          <article>
            <strong>Do not overclaim</strong>
            <p>Auth, payments, business journeys and exercised recovery remain later proof levels until independent evidence exists.</p>
          </article>
        </div>
      </section>

      <footer className="shell footer">
        <span>Relyo V2 alpha</span>
        <span>AI reasons. Evidence decides.</span>
      </footer>
    </main>
  );
}
