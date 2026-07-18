"use client";

import { MoreHorizontal, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Invoice } from "./listMockData";
import { statusColors } from "./listMockData";

interface InvoiceTableProps {
  invoices: Invoice[];
  slug: string;
}

export default function InvoiceTable({ invoices, slug }: InvoiceTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Invoice
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Client
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Project
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Issue Date
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Due Date
              </th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => {
              const colors = statusColors[inv.status];
              return (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{inv.number}</p>
                      <p className="text-xs text-gray-400">{inv.poNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${inv.clientColor}`}
                      >
                        {inv.clientInitial}
                      </div>
                      <span className="font-medium text-gray-900">{inv.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{inv.project}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{inv.amount} XLM</p>
                      <p className="text-xs text-gray-400">≈ ${inv.amountUsd.toFixed(2)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                    >
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{inv.issueDate}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-600">{inv.dueDate}</p>
                      {inv.paidDate && (
                        <p className="text-xs text-emerald-600">{inv.paidDate}</p>
                      )}
                      {inv.status === "overdue" && inv.dueDate !== "—" && (
                        <p className="text-xs text-rose-600">6 days overdue</p>
                      )}
                      {inv.status === "sent" && (
                        <p className="text-xs text-amber-600">5 days left</p>
                      )}
                      {inv.status === "partial" && (
                        <p className="text-xs text-amber-600">2 days left</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/w/${slug}/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                      <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
        <p className="text-sm text-gray-500">
          Showing 1 to {invoices.length} of {invoices.length} invoices
        </p>
        <div className="flex items-center gap-1">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-xs font-medium text-white">
            1
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">
            2
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">
            3
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
