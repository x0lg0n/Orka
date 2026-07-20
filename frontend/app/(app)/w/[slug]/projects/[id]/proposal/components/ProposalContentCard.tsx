"use client";

import { useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { PROPOSAL_SECTIONS, type ProposalRow, type ProposalSection, type ProposalPricingItem } from "./types";

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

export function ProposalContentCard({
  proposal,
  sections,
  pricing,
}: {
  proposal: ProposalRow;
  sections: ProposalSection[];
  pricing: ProposalPricingItem[];
}) {
  const [activeSection, setActiveSection] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const subtotal = pricing.reduce((sum, p) => sum + Number(p.amount), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    const sectionId = `proposal-section-${index}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Proposal Content
        </h3>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Maximize2 className="h-4 w-4" />
          Expand
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left navigation */}
        <nav className="w-40 shrink-0 space-y-1">
          {PROPOSAL_SECTIONS.map((section, i) => (
            <button
              key={section}
              type="button"
              onClick={() => handleSectionClick(i)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                activeSection === i
                  ? "bg-purple-50 font-medium text-[#7c3aed]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {i + 1}. {section}
            </button>
          ))}
        </nav>

        {/* Content body + pricing sidebar */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-6">
            {/* Main content */}
            <div ref={contentRef} className="flex-1 min-w-0 space-y-6">
              {sections.length > 0 ? (
                sections.map((section, i) => (
                  <div key={section.id} id={`proposal-section-${i}`}>
                    <h4 className="mb-2 text-base font-semibold text-gray-900">
                      {i + 1}. {section.title}
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {section.content?.split("\n").map((para, j) => (
                        <p key={j} className="mb-2">{para}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-6">
                  {PROPOSAL_SECTIONS.map((title, i) => (
                    <div key={title} id={`proposal-section-${i}`}>
                      <h4 className="mb-2 text-base font-semibold text-gray-900">
                        {i + 1}. {title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        No content added for this section.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing summary */}
            <div className="w-52 shrink-0">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">
                Pricing Summary
              </h4>
              <div className="space-y-2">
                {pricing.length > 0 ? (
                  pricing.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900 tabular-nums">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No pricing items.</p>
                )}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(subtotal, proposal.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax (0%)</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(tax, proposal.currency)}
                  </span>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-500">Total Proposal Amount</div>
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatCurrency(total, proposal.currency)}
                </div>
                {proposal.usd_equivalent != null && (
                  <div className="text-sm text-gray-400">
                    ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
