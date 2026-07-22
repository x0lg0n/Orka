import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy · ORKA",
  description:
    "ORKA's privacy policy, covering how we collect, use, and protect your information.",
};

const sections = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <p>
          We collect information you provide when creating an account, setting up
          a workspace, or using ORKA features. This includes your name, email
          address, organisation name, workspace content, project information, and
          payment details.
        </p>
        <p>
          We also collect information automatically, such as browser type, device
          information, IP address, pages visited, and how you interact with the
          service. This helps us improve ORKA and keep it secure.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    content: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-teal">
          <li>Provide, operate, and maintain the ORKA service and workspace features.</li>
          <li>Process payments, escrow transactions, and related financial operations.</li>
          <li>Send service-related communications, such as payment confirmations, project updates, and security alerts.</li>
          <li>Respond to your support requests and questions.</li>
          <li>Improve and develop the product through analytics and usage patterns.</li>
          <li>Detect and prevent fraud, abuse, or unauthorised access.</li>
        </ul>
      </>
    ),
  },
  {
    id: "data-sharing",
    title: "Data sharing and third parties",
    content: (
      <>
        <p>
          We do not sell your personal information to third parties. We may share
          your data with:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-teal">
          <li>Service providers who help us operate ORKA (hosting, payments, email, analytics).</li>
          <li>Workspace collaborators and clients you invite, as necessary for project operations.</li>
          <li>Legal or regulatory authorities when required by applicable law or to protect rights.</li>
        </ul>
        <p>
          ORKA may connect with third-party services including payment providers,
          AI tools, and blockchain networks. Those services have their own privacy
          practices that you should review separately.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data security and retention",
    content: (
      <>
        <p>
          We implement reasonable technical and organisational measures to protect
          your data against unauthorised access, loss, or alteration. This includes
          encryption in transit and at rest, access controls, and regular security
          reviews.
        </p>
        <p>
          We retain your information for as long as your account is active or as
          needed to provide the service. When you delete your account, we will
          remove or anonymise your data within a reasonable period, unless legal
          obligations require us to keep certain records.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: (
      <>
        <p>
          Depending on your jurisdiction, you may have the right to access,
          correct, delete, or port your personal data. You may also have the right
          to restrict or object to certain processing activities.
        </p>
        <p>
          To exercise these rights, please contact us through our{" "}
          <Link
            href="/contact"
            className="font-semibold text-night underline decoration-orange decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
          >
            contact page
          </Link>{" "}
          with &ldquo;Privacy Request&rdquo; in your message. We will respond
          within the timeframe required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <>
        <p>
          ORKA uses cookies and similar technologies to authenticate sessions,
          remember preferences, and understand how the service is used. You can
          control cookie settings through your browser preferences.
        </p>
        <p>
          Blocking certain cookies may affect the functionality of the service,
          particularly authentication and workspace features.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <>
        <p>
          We may update this privacy policy as ORKA evolves or as legal
          requirements change. If a change is material, we will provide notice
          through the service or by another appropriate method.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <p>
        Questions about this privacy policy or how we handle your data? Visit our{" "}
        <Link
          href="/contact"
          className="font-semibold text-night underline decoration-orange decoration-2 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
        >
          contact page
        </Link>{" "}
        and include &ldquo;Privacy&rdquo; in your message so it reaches the right team.
      </p>
    ),
  },
] as const;

export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-night px-4 pb-12 pt-12 text-white md:px-8 md:pb-16 md:pt-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">Legal</p>
          <h1 className="display mt-5 text-5xl uppercase sm:text-6xl md:text-7xl">Privacy policy</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            How ORKA collects, uses, and protects your personal information.
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
            product privacy template and should be reviewed by qualified legal counsel
            before ORKA&apos;s production launch. It is not jurisdiction-specific legal advice.
          </aside>

          <div className="mt-12 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
            <nav aria-label="Privacy policy contents" className="border-b border-night/15 pb-6 lg:border-b-0 lg:pb-0">
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
