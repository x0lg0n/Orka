"use client";

import { Search, Plus } from "lucide-react";
import Link from "next/link";

interface PaymentsHeaderProps {
  slug: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function PaymentsHeader({
  slug,
  searchQuery,
  onSearchChange,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track and manage all your project payments
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <Link
          href={`/w/${slug}/payments/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Payment
        </Link>
      </div>
    </div>
  );
}
