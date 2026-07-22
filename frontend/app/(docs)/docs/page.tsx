"use client";

import Link from "next/link";
import {
  Rocket,
  Folder,
  Receipt,
  Shield,
  Wallet,
  FileText,
  Code,
  Users,
  HelpCircle,
  Milestone,
  FileCheck,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Activity,
  LayoutGrid,
  Headphones,
  BookOpen,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

const popularGuides = [
  {
    title: "Generate Your First Proposal",
    description: "Create and send a professional proposal in minutes using AI.",
    icon: FileText,
    href: "/docs/proposals",
    color: "text-[#9474ff]",
  },
  {
    title: "Create Your First Contract",
    description: "Generate contracts with AI and get them signed.",
    icon: FileCheck,
    href: "/docs/contracts",
    color: "text-[#22bd93]",
  },
  {
    title: "Fund Escrow & Get Paid",
    description: "Secure payments with escrow and release on milestones.",
    icon: Shield,
    href: "/docs/escrow",
    color: "text-[#ff8a22]",
  },
  {
    title: "Connect Freighter Wallet",
    description: "Connect your Stellar wallet to send and receive payments.",
    icon: Wallet,
    href: "/docs/freighter",
    color: "text-[#3b82f6]",
  },
];

const features = [
  {
    title: "AI Proposal Generator",
    description: "Create proposals in seconds with AI.",
    icon: FileText,
    color: "bg-[#9474ff]/10 text-[#9474ff]",
  },
  {
    title: "Escrow Payments",
    description: "Secure milestone-based escrow on Stellar.",
    icon: Shield,
    color: "bg-[#ff8a22]/10 text-[#ff8a22]",
  },
  {
    title: "Milestone Tracking",
    description: "Track progress and approve deliverables.",
    icon: Milestone,
    color: "bg-[#22bd93]/10 text-[#22bd93]",
  },
  {
    title: "Client Portal",
    description: "Shared view for clients to track projects.",
    icon: Users,
    color: "bg-[#3b82f6]/10 text-[#3b82f6]",
  },
  {
    title: "Invoices",
    description: "Auto-generated invoices on milestone release.",
    icon: Receipt,
    color: "bg-[#ff4f42]/10 text-[#ff4f42]",
  },
  {
    title: "Payments",
    description: "Track releases and client payments.",
    icon: Wallet,
    color: "bg-[#ff8a22]/10 text-[#ff8a22]",
  },
  {
    title: "Analytics",
    description: "Real-time dashboards for project health.",
    icon: BarChart3,
    color: "bg-[#9474ff]/10 text-[#9474ff]",
  },
  {
    title: "Activity Feed",
    description: "Complete audit trail of all project activity.",
    icon: Activity,
    color: "bg-[#22bd93]/10 text-[#22bd93]",
  },
];

const categoryIcons: Record<string, typeof Folder> = {
  projects: Folder,
  clients: Users,
  proposals: FileText,
  contracts: FileCheck,
  milestones: Milestone,
  escrow: Shield,
  invoices: Receipt,
  payments: Wallet,
  freighter: Wallet,
  api: Code,
  security: Shield,
  faq: HelpCircle,
  "getting-started": Rocket,
  workspaces: LayoutGrid,
};

const categoryDescriptions: Record<string, string> = {
  projects: "Manage projects, timeline, files and activity.",
  clients: "Manage clients and client portal access.",
  proposals: "Create, send and track proposals.",
  contracts: "AI contracts, signatures and versions.",
  milestones: "Create milestones and track progress.",
  escrow: "Secure payments with automated releases.",
  invoices: "Generate invoices and get paid faster.",
  payments: "Track payments and transaction history.",
  freighter: "Connect wallets and manage transactions.",
  api: "Developer resources and API reference.",
  security: "Encryption, permissions and best practices.",
  faq: "Frequently asked questions.",
  "getting-started": "Learn ORKA from scratch.",
  workspaces: "Set up and manage your workspace.",
};

export default function DocsPage() {
  const allItems = docsNavigation.flatMap((s) => s.items);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-5xl pt-16 pb-4 text-center">
          <span className="text-[15px] font-medium text-white sm:text-[18px]">
            Documentation
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6rem]">
            Documentation
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Everything you need to run your service business with ORKA.
          </p>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Popular Guides
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group cut-corner rounded-[14px] border-2 border-night bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.12)]"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${guide.color} bg-current/10`}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 display text-lg uppercase text-night">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-[13px] font-bold leading-5 text-night/60">
                    {guide.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-black text-violet">
                    Read Guide{" "}
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse Documentation */}
      <section className="px-4 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Browse Documentation
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {allItems.map((item) => {
              const Icon = categoryIcons[item.slug] || Folder;
              const desc =
                categoryDescriptions[item.slug] || "Documentation for this topic.";
              return (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-night/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_20px_rgba(148,116,255,0.08)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-violet/10 text-violet">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-night">
                      {item.title}
                    </p>
                    <p className="text-[12px] font-bold text-night/50">
                      {desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-night/20 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Platform Features
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-night/10 bg-white p-5"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-night">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[12px] font-bold text-night/50">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:p-12">
          <div className="text-center">
            <h2 className="display text-4xl uppercase sm:text-5xl">
              Still need help?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-normal text-white/70">
              Our support team is here to help you succeed with Orka.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20"
              >
                <MessageSquare size={16} /> Join Discord
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-black text-white transition hover:bg-violet/90"
              >
                <Headphones size={16} /> Contact Support
              </Link>
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20"
              >
                <BookOpen size={16} /> Book Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 pb-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Start building with ORKA
          </h2>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 text-sm font-black uppercase text-night transition-all hover:-translate-y-0.5 hover:bg-orange hover:text-white"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
