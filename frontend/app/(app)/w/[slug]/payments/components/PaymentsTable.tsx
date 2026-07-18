"use client";

import { MoreHorizontal } from "lucide-react";
import type { Payment, PaymentType, PaymentStatus } from "./mockData";

interface PaymentsTableProps {
  payments: Payment[];
}

const typeColors: Record<PaymentType, string> = {
  Escrow: "bg-violet-100 text-violet-700",
  Milestone: "bg-blue-100 text-blue-700",
  Invoice: "bg-emerald-100 text-emerald-700",
  Refund: "bg-rose-100 text-rose-700",
};

const statusColors: Record<PaymentStatus, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-rose-100 text-rose-700",
  Released: "bg-blue-100 text-blue-700",
  Processing: "bg-gray-100 text-gray-700",
};

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 font-medium text-gray-500">Payment</th>
            <th className="px-4 py-3 font-medium text-gray-500">Project</th>
            <th className="px-4 py-3 font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 font-medium text-gray-500">Amount</th>
            <th className="px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 font-medium text-gray-500">Date</th>
            <th className="px-4 py-3 font-medium text-gray-500">Tx Hash</th>
            <th className="px-4 py-3 font-medium text-gray-500"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900">
                  {payment.description}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{payment.project}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[payment.type]}`}
                >
                  {payment.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900">
                    {payment.amount} XLM
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    (${payment.amountUsd})
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[payment.status]}`}
                >
                  {payment.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600">{payment.date}</td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-gray-500">
                  {payment.txHash}
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No payments match your filters.
        </div>
      )}
    </div>
  );
}
