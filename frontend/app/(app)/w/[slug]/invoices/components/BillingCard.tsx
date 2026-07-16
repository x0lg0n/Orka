"use client";

import { User } from "lucide-react";
import type { ClientInfo } from "./mockData";

interface BillingCardProps {
  client: ClientInfo;
}

export default function BillingCard({ client }: BillingCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Billed To
      </h4>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{client.name}</h3>
          <p className="text-sm text-gray-600">{client.contactPerson}</p>
          <p className="text-sm text-gray-500">{client.email}</p>
          <p className="text-sm text-gray-500">{client.phone}</p>
        </div>
      </div>
    </div>
  );
}
