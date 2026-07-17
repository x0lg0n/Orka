"use client";

import { Search, Download, Calendar } from "lucide-react";
import type { InvoiceStatus } from "./listMockData";

interface InvoiceFiltersProps {
  activeTab: InvoiceStatus | "all";
  onTabChange: (tab: InvoiceStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabs: { id: InvoiceStatus | "all"; label: string }[] = [
  { id: "all", label: "All Invoices" },
  { id: "draft", label: "Draft" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "partial", label: "Partially Paid" },
  { id: "overdue", label: "Overdue" },
];

export default function InvoiceFilters({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: InvoiceFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#7c3aed] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number, client..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>
        <select className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]">
          <option>All Clients</option>
        </select>
        <select className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]">
          <option>All Projects</option>
        </select>
        <select className="h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]">
          <option>All Status</option>
          <option>Paid</option>
          <option>Partial</option>
          <option>Sent</option>
          <option>Draft</option>
          <option>Overdue</option>
        </select>
        <button className="inline-flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50">
          <Calendar className="h-4 w-4" />
          May 1 – May 31, 2025
        </button>
        <button className="inline-flex h-12 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}
