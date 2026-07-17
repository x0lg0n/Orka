import { ExternalLink } from "lucide-react";

export function ClientCard({
  clientName,
  website,
}: {
  clientName: string;
  website: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Client</h3>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          {clientName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{clientName}</p>
          <p className="text-xs text-gray-400">{website}</p>
        </div>
      </div>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#7c3aed] transition hover:bg-gray-50"
      >
        View Client
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
