"use client";

import Link from "next/link";
import { Headphones, MessageSquare } from "lucide-react";

const tocItems = [
  { label: "Popular Guides", href: "#popular-guides" },
  { label: "Browse Documentation", href: "#browse-docs" },
  { label: "What's New", href: "#whats-new" },
  { label: "Need Help?", href: "#help" },
];

export default function DocsLandingRightSidebar() {
  return (
    <aside className="sticky top-8 hidden w-[220px] shrink-0 self-start lg:block">
      {/* On this page */}
      <p className="mb-3 text-xs font-black uppercase text-night/50">
        On this page
      </p>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block border-l-[3px] border-transparent py-1 pl-3 text-[13px] font-bold text-night/50 transition-colors hover:text-night/80"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* What's New */}
      <div className="mt-6 rounded-xl border border-night/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase text-night/50">
            What&apos;s New
          </p>
          <Link
            href="/blog"
            className="text-[11px] font-black text-violet hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-violet/10 px-2 py-0.5 text-[10px] font-black text-violet">
            v0.4.0
          </span>
          <span className="text-[10px] font-bold text-night/40">
            May 12, 2025
          </span>
        </div>
        <ul className="mt-2 space-y-1 text-[11px] font-bold text-night/60">
          <li>• AI Proposal Generator</li>
          <li>• Escrow Improvements</li>
          <li>• Workspace Roles</li>
          <li>• Client Portal Updates</li>
        </ul>
      </div>

      {/* Still stuck? */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-violet/10">
            <Headphones size={14} className="text-violet" />
          </span>
          <div>
            <p className="text-[11px] font-black text-night">Still stuck?</p>
            <p className="text-[10px] font-bold text-night/50">
              Our support team is here to help you succeed with Orka.
            </p>
          </div>
        </div>
        <a
          href="/contact"
          className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-violet px-3 py-2 text-[11px] font-black text-white transition hover:bg-violet/90"
        >
          Contact Support →
        </a>
      </div>

      {/* Was this helpful? */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-4 text-center">
        <p className="text-[11px] font-black text-night">Was this helpful?</p>
        <p className="text-[10px] font-bold text-night/50">
          Your feedback helps us improve.
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button className="rounded-lg border border-night/10 px-4 py-1.5 text-[11px] font-bold text-night/60 transition hover:border-violet hover:text-violet">
            Yes 👍
          </button>
          <button className="rounded-lg border border-night/10 px-4 py-1.5 text-[11px] font-bold text-night/60 transition hover:border-violet hover:text-violet">
            No 👎
          </button>
        </div>
      </div>

      {/* Join Community */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-[#5865f2]/10">
            <MessageSquare size={14} className="text-[#5865f2]" />
          </span>
          <div>
            <p className="text-[11px] font-black text-night">
              Join Orka Community
            </p>
            <p className="text-[10px] font-bold text-night/50">
              Connect with founders, freelancers, and agencies.
            </p>
          </div>
        </div>
        <a
          href="#"
          className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black text-[#5865f2] hover:underline"
        >
          Join on Discord →
        </a>
      </div>
    </aside>
  );
}
