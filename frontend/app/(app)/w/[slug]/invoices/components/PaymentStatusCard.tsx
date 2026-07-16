"use client";

import { CheckCircle, ExternalLink } from "lucide-react";
import type { InvoiceDetail } from "./mockData";

interface PaymentStatusCardProps {
  invoice: InvoiceDetail;
}

export default function PaymentStatusCard({ invoice }: PaymentStatusCardProps) {
  const isPaid = invoice.status === "paid";
  const txHash = invoice.transactionHash;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-gray-900">Payment Status</h4>
      <div className="flex items-center gap-2">
        <CheckCircle className={`h-5 w-5 ${isPaid ? "text-emerald-500" : "text-gray-400"}`} />
        <span className={`text-lg font-semibold ${isPaid ? "text-emerald-600" : "text-gray-600"}`}>
          {isPaid ? "Paid" : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </div>
      {isPaid && (
        <p className="mt-1 text-sm text-gray-500">This invoice has been paid in full.</p>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Paid Amount</span>
          <span className="text-sm font-semibold text-gray-900">
            {invoice.amount} {invoice.currency}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Paid On</span>
          <span className="text-sm font-medium text-gray-900">May 30, 2025, 10:24 AM</span>
        </div>
        {txHash && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Transaction Hash</span>
            <span className="font-mono text-sm text-[#7c3aed]">{txHash}</span>
          </div>
        )}
      </div>

      {txHash && (
        <a
          href={`https://stellar.expert/explorer/public/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          View on Stellar Explorer
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
