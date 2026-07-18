"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

interface InvoiceAICardProps {
  slug: string;
}

export default function InvoiceAICard({ slug }: InvoiceAICardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] p-6 text-white shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Create Invoice Faster</h3>
          <p className="mt-1 text-xs text-white/70">
            Use AI Copilot to generate invoices in seconds.
          </p>
        </div>
      </div>
      <Link
        href={`/w/${slug}/ai`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white hover:text-white/90"
      >
        Try now →
      </Link>
    </div>
  );
}
