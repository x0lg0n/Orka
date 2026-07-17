import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import type { ClientSummary, ClientStatus } from "./client-types";

function colorFromString(s: string): string {
  const palette = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function statusBadge(status: ClientStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "inactive":
      return "bg-gray-100 text-gray-500 border border-gray-200";
    case "lead":
      return "bg-blue-50 text-blue-600 border border-blue-200";
    case "archived":
      return "bg-gray-100 text-gray-400 border border-gray-200";
  }
}

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
  archived: "Archived",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function ClientsTable({
  clients,
  slug,
}: {
  clients: ClientSummary[];
  slug: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Client
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Contact
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Active Projects
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Billed
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Escrow in Hold
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Last Activity
              </th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-16 text-center text-gray-400"
                >
                  No clients found.
                </td>
              </tr>
            ) : (
              clients.map((c) => {
                const meta = c.metadata ?? {};
                const contactName =
                  (meta.contactName as string | undefined) ?? "—";
                const contactEmail =
                  (meta.contactEmail as string | undefined) ?? c.email ?? "—";
                const website = (meta.website as string | undefined) ?? "—";
                return (
                  <tr
                    key={c.id}
                    className="border-b border-gray-50 transition hover:bg-gray-50/50"
                  >
                    {/* Client */}
                    <td className="min-w-0 px-3 py-3">
                      <Link
                        href={`/w/${slug}/clients/${c.id}`}
                        className="flex items-center gap-2.5"
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: colorFromString(c.name) }}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {website}
                          </p>
                        </div>
                      </Link>
                    </td>

                    {/* Contact */}
                    <td className="min-w-0 px-3 py-3">
                      <p className="truncate text-gray-700">{contactName}</p>
                      <p className="truncate text-xs text-gray-400">
                        {contactEmail}
                      </p>
                    </td>

                    {/* Active Projects — not yet stored */}
                    <td className="whitespace-nowrap px-3 py-3 text-center text-gray-400">
                      —
                    </td>

                    {/* Total Billed — not yet stored */}
                    <td className="whitespace-nowrap px-3 py-3 text-center text-gray-400">
                      —
                    </td>

                    {/* Escrow in Hold — not yet stored */}
                    <td className="whitespace-nowrap px-3 py-3 text-center text-gray-400">
                      —
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(c.status)}`}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>

                    {/* Last Activity */}
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-500">
                      {timeAgo(c.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="text-gray-300 transition hover:text-gray-500"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {clients.length > 0 && (
        <div className="border-t border-gray-100 px-3 py-3 text-center">
          <button
            type="button"
            className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]"
          >
            View all clients →
          </button>
        </div>
      )}
    </div>
  );
}
