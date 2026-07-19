"use client";

import { Mail, Phone, Send } from "lucide-react";
import type { ClientRow } from "./types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientContactCard({ client }: { client: ClientRow }) {
  if (!client) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Client Contact
        </h3>
        <p className="text-sm text-gray-400">No client assigned.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Client Contact
      </h3>
      <div className="flex items-center gap-3 mb-4">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-sm font-medium text-[#7c3aed]">
            {getInitials(client.name)}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">
            {client.name}
          </div>
          {client.company && (
            <div className="text-xs text-gray-500">{client.company}</div>
          )}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            {client.email}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            {client.phone}
          </div>
        )}
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
    </div>
  );
}
