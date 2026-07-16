"use client";

import { useState, useMemo } from "react";
import { use } from "react";
import { Search, Filter, Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import InvoiceStats from "./components/InvoiceStats";
import InvoiceFilters from "./components/InvoiceFilters";
import InvoiceTable from "./components/InvoiceTable";
import InvoiceSummaryCard from "./components/InvoiceSummaryCard";
import InvoiceActivityCard from "./components/InvoiceActivityCard";
import InvoiceAICard from "./components/InvoiceAICard";
import { mockInvoices, type InvoiceStatus } from "./components/listMockData";

export default function InvoicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<InvoiceStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter((inv) => {
      if (activeTab !== "all" && inv.status !== activeTab) return false;
      if (
        searchQuery &&
        !inv.number.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.client.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.project.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, manage and track all your invoices in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="h-10 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-medium text-white hover:bg-[#6d28d9]">
            <Plus className="h-4 w-4" />
            New Invoice
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <InvoiceStats />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <InvoiceFilters
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <InvoiceTable invoices={filteredInvoices} slug={slug} />
        </div>
        <div className="space-y-6">
          <InvoiceSummaryCard />
          <InvoiceActivityCard />
          <InvoiceAICard slug={slug} />
        </div>
      </div>
    </div>
  );
}
