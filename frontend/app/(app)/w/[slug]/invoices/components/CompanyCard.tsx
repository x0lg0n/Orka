"use client";

import { Building2 } from "lucide-react";
import type { CompanyInfo } from "./mockData";

interface CompanyCardProps {
  company: CompanyInfo;
  amount: number;
  amountUsd: number;
  currency: string;
}

export default function CompanyCard({ company, amount, amountUsd, currency }: CompanyCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#7c3aed]/10">
            <Building2 className="h-7 w-7 text-[#7c3aed]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
            <p className="text-sm text-gray-500">{company.address}</p>
            <p className="text-sm text-gray-500">{company.city}</p>
            <p className="mt-1 text-sm text-gray-500">GSTIN: {company.gstNumber}</p>
            <p className="text-sm text-gray-500">{company.email} | {company.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Amount Due</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{amount} {currency}</p>
          <p className="text-sm text-gray-500">≈ ${amountUsd.toFixed(2)} USD</p>
        </div>
      </div>
    </div>
  );
}
