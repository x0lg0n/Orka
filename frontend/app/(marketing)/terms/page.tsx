import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · ORKA",
  description:
    "ORKA's plain-language product terms, covering accounts, workspaces, payments, third-party services, and acceptable use.",
};

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    content: (
      <>
        <p>
          By creating an ORKA account, creating or joining a workspace, or using
          our services, you agree to these Terms of Service and any policies
          referenced here. If you use ORKA on behalf of an organisation, you
          confirm that you have authority to accept these terms for that
          organisation.
        </p>
        <p>
          If you do not agree, please do not use the service. These terms apply
          to the ORKA website, workspace, client portal, and related features.
        </p>
      </>
    ),
  },
  {
    id: "accounts-workspaces",
    title: "Accounts and workspaces",
    content: (
      <>
        <p>
          Keep your account details accurate and your sign-in method secure. You
          are responsible for activity under your account and for the people you
          invite to a workspace.
        </p>
        <p>
          Workspace owners control access and should only grant permissions that
          are appropriate for the project. You must tell us promptly if you
          believe your account has been accessed without permission.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>Use ORKA lawfully and in a way that respects other people and systems.</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-orange">
          <li>Do not upload unlawful, deceptive, infringing, or harmful content.</li>
          <li>Do not attempt to bypass security, access another account, or disrupt the service.</li>
          <li>Do not use ORKA to facilitate fraud, money laundering, sanctions evasion, or other prohibited financial activity.</li>
          <li>Do not misrepresent project status, delivery evidence, payment status, or your authority to act for another party.</li>
        </ul>
      </>
    ),
  },
  {
    id: "clients-payments",
    title: "Client and payment responsibilities",
    content: (
      <>
        <p>
          Clients and service providers are responsible for the scope, pricing,
          deliverables, approvals, and disputes in their own projects. ORKA
          provides tools to record and manage those workflows; it does not become
          a party to the agreement between a client and a provider.
        </p>
        <p>
          Payment, escrow, currency conversion, or payout features may be subject
          to additional disclosures, verification requirements, limits, fees, and
          the terms of the providers that enable them. Only approve a payment or
          release when you have reviewed the relevant project information.
        </p>
      </>
    ),
  },
  {
    id: "third-parties-wallets",
    title: "Third-party services and wallets",
    content: (
      <>
        <p>
          ORKA may connect with third-party services, including payment providers,
          email providers, AI tools, and blockchain or wallet software. Those
          services are governed by their own terms and privacy practices.
        </p>
        <p>
          If you choose a self-custody wallet, you are responsible for your wallet,
          private keys, recovery phrase, network selections, and every transaction
          you approve. ORKA cannot recover a lost wallet or reverse an irreversible
          blockchain transaction.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: (
      <>
        <p>
          ORKA and its software, branding, and service materials are owned by
          ORKA or its licensors. We grant you a limited, non-exclusive,
          non-transferable right to use the service in accordance with these terms.
        </p>
        <p>
          You retain rights in the content you submit to ORKA. You give us the
          permission needed to host, process, and display that content only to
          provide, secure, and improve the service.
        </p>
      </>
    ),
  },
  {
    id: "availability-disclaimers",
    title: "Availability and disclaimers",
    content: (
      <>
        <p>
          We work to keep ORKA reliable, but the service may change, be interrupted,
          or contain errors. Features may be added, changed, paused, or removed as
          we develop the product.
        </p>
        <p>
          ORKA is provided on an “as is” and “as available” basis to the extent
          permitted by applicable law. AI-generated suggestions are assistance,
          not professional, financial, legal, tax, or investment advice. Review
          important work, agreements, and payment decisions independently.
        </p>
      </>
    ),
  },
  {
    id: "limitation-liability",
    title: "Limitation of liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by applicable law, ORKA will not be
          liable for indirect, incidental, special, consequential, or punitive
          damages, or for lost profits, data, business opportunity, or goodwill
          arising from use of the service.
        </p>
        <p>
          Where liability cannot be excluded, it will be limited to the amount you
          paid to ORKA for the service during the twelve months before the event
          giving rise to the claim.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <>
        <p>
          You may stop using ORKA at any time. We may suspend or end access if we
          reasonably believe these terms have been violated, the service is being
          used unlawfully, or doing so is necessary to protect users, the service,
          or third parties.
        </p>
        <p>
          After termination, provisions that should reasonably continue—such as
          intellectual property, disclaimers, and limits of liability—will remain
          in effect.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    content: (
      <>
        <p>
          We may update these terms as ORKA evolves. If a change is material, we
          will take reasonable steps to provide notice through the service or by
          another appropriate method. Continued use after the updated effective
          date means you accept the revised terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about these terms? Visit our{" "}
        <Link
          href="/contact"
          className="font-semibold text-night underline decoration-orange decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          contact page
        </Link>{" "}
        and include “Terms” in your message so it reaches the right team.
      </p>
    ),
  },
] as const;

export default function TermsPage() {
  return (
    <div>
      <section className="bg-night px-4 pb-12 pt-12 text-white md:px-8 md:pb-16 md:pt-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Legal</p>
          <h1 className="display mt-5 text-5xl uppercase sm:text-6xl md:text-7xl">Terms of service</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            These terms explain the ground rules for using ORKA&apos;s workspace,
            project, and payment-related services.
          </p>
          <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.12em] text-orange">
            Effective: July 22, 2026
          </p>
        </div>
      </section>

      <main className="px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <aside className="border-l-4 border-orange bg-bone px-5 py-4 text-sm leading-6 text-night/80" aria-label="Important legal notice">
            <span className="font-bold text-night">Important:</span> This is a clear
            product terms template and should be reviewed by qualified legal counsel
            before ORKA&apos;s production launch. It is not jurisdiction-specific legal advice.
          </aside>

          <div className="mt-12 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Terms contents" className="border-b border-night/15 pb-6 lg:border-b-0 lg:pb-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">On this page</p>
              <ol className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-2 lg:block lg:space-y-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex items-baseline gap-2 py-1 text-sm leading-5 text-night/70 transition-colors hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                    >
                      <span className="font-mono text-xs text-violet">{String(index + 1).padStart(2, "0")}</span>
                      <span className="group-hover:underline group-hover:decoration-orange group-hover:decoration-2 group-hover:underline-offset-4">{section.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="max-w-[70ch]">
              {sections.map((section, index) => (
                <section
                  id={section.id}
                  key={section.id}
                  className="scroll-mt-8 border-b border-night/15 py-9 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-sm font-bold text-violet">{String(index + 1).padStart(2, "0")}</span>
                    <h2 className="display text-3xl uppercase sm:text-4xl">{section.title}</h2>
                  </div>
                  <div className="mt-5 space-y-4 text-base leading-8 text-night/78">
                    {section.content}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
