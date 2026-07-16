"use client";

import { Crown, ArrowRight } from "lucide-react";

export default function WorkspacePlanCard() {
  const features = [
    "Unlimited projects",
    "Advanced analytics",
    "Custom invoices",
    "Priority support",
    "AI Copilot access",
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Workspace Plan</h4>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/10">
          <Crown className="h-5 w-5 text-[#7c3aed]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Pro Plan</p>
          <p className="text-xs text-gray-500">Renews on Jul 28, 2025</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-2.5 w-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-gray-600">{feature}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Manage Subscription
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
