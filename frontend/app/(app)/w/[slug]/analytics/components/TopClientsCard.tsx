"use client";

import Link from "next/link";
import { topClients } from "./mockData";

interface TopClientsCardProps {
  slug: string;
}

export default function TopClientsCard({ slug }: TopClientsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Top Clients by Revenue
      </h3>
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-gray-400">
        <span>Client</span>
        <span>Revenue (XLM)</span>
      </div>
      <div className="space-y-3">
        {topClients.map((client) => (
          <div
            key={client.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {client.logo}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {client.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {client.revenue} XLM
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <Link
          href={`/w/${slug}/clients`}
          className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]"
        >
          View all clients →
        </Link>
      </div>
    </div>
  );
}
