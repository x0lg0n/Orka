"use client";

import type { InvoiceItem } from "./mockData";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  taxRate: number;
  currency: string;
}

export default function InvoiceItemsTable({ items, taxRate, currency }: InvoiceItemsTableProps) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                QTY
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Rate ({currency})
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Amount ({currency})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.description}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {item.qty}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {item.rate.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200 bg-gray-50/30">
              <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">
                Subtotal
              </td>
              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                {subtotal.toFixed(2)} {currency}
              </td>
            </tr>
            <tr className="bg-gray-50/30">
              <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-500">
                Tax ({taxRate}%)
              </td>
              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                {tax.toFixed(2)} {currency}
              </td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50/50">
              <td colSpan={3} className="px-6 py-4 text-right text-base font-bold text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-lg font-bold text-gray-900">
                  {total.toFixed(2)} {currency}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
