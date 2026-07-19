import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

export function ClientInfoCard({
  slug,
  client,
  projectClientId,
}: {
  slug: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    status: string;
    metadata: Record<string, unknown> | null;
  } | null;
  projectClientId: string | null;
}) {
  const clientId = client?.id ?? projectClientId;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Client Information</h3>

      {client ? (
        <>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {client.name}
              </p>
              {client.email && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </div>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                client.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>

          {clientId && (
            <Link
              href={`/w/${slug}/clients/${clientId}`}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              View Client Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      ) : (
        <div className="mt-3 text-center text-sm text-gray-400">
          No client assigned
        </div>
      )}
    </div>
  );
}
