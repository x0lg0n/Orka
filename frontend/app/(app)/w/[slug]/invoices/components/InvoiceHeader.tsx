"use client";

import { ChevronRight, MoreHorizontal, Download, Send } from "lucide-react";
import Link from "next/link";
import type { InvoiceStatus } from "./mockData";

interface InvoiceHeaderProps {
  slug: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
}

const statusStyles: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  overdue: "bg-rose-50 text-rose-700",
  draft: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function InvoiceHeader({
  slug,
  invoiceNumber,
  status,
  createdAt,
  dueDate,
}: InvoiceHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={`/w/${slug}/invoices`} className="hover:text-gray-700">
          Invoices
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">{invoiceNumber}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoiceNumber}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Created on {createdAt} • Due on {dueDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-700 hover:bg-gray-50">
            <MoreHorizontal className="h-5 w-5" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9]">
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
