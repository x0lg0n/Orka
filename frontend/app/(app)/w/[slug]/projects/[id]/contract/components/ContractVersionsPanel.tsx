"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, RotateCcw, GitCompare } from "lucide-react";
import { restoreContractVersion } from "../../actions";
import { ProposalDiff } from "../../proposals/components/ProposalDiff";

type Version = {
  id: string;
  version_no: number;
  blocks: unknown[];
  markdown: string;
  created_at: string;
};

export function ContractVersionsPanel({
  projectId,
  orgId,
  contractId,
  onClose,
}: {
  projectId: string;
  orgId: string;
  contractId: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selected, setSelected] = useState<[string, string] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("contract_versions")
        .select("id, version_no, blocks, markdown, created_at")
        .eq("contract_id", contractId)
        .order("version_no", { ascending: false });
      if (data) setVersions(data as Version[]);
    })();
  }, [contractId]);

  function toggleSelect(id: string) {
    setSelected((cur) => {
      if (!cur) return [id, id];
      if (cur[0] === id) return null;
      return [cur[0], id];
    });
  }

  async function onRestore(id: string) {
    setBusy(true);
    await restoreContractVersion({ projectId, orgId, versionId: id });
    setBusy(false);
    location.reload();
  }

  const mdOf = (id: string) => versions.find((v) => v.id === id)?.markdown ?? "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Contract versions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {selected && selected[0] !== selected[1] && (
          <ProposalDiff before={mdOf(selected[0])} after={mdOf(selected[1])} />
        )}

        <ul className="mt-3 space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">v{v.version_no}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(v.id)} className="text-xs text-violet-600 hover:underline">
                    <GitCompare className="inline h-3 w-3" /> Compare
                  </button>
                  <button onClick={() => onRestore(v.id)} disabled={busy} className="text-xs text-gray-600 hover:underline disabled:opacity-50">
                    <RotateCcw className="inline h-3 w-3" /> Restore
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
