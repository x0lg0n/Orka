"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { generateContract } from "../../actions";

export function ContractEmpty({
  slug,
  projectId,
  orgId,
}: {
  slug: string;
  projectId: string;
  orgId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    const res = await generateContract({ projectId, orgId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
      <div className="mb-4 rounded-full bg-violet-50 p-4">
        <FileText className="h-8 w-8 text-violet-500" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        No contract yet
      </h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Generate a professional contract pre-filled with your project and
        proposal details. You can edit every clause before signing.
      </p>
      <button
        onClick={handleGenerate}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        {busy ? "Generating…" : "Generate contract"}
      </button>
      {error && (
        <p className="mt-3 max-w-sm text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
