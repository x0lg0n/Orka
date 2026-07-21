"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveContract } from "../../actions";
import { ContractSigningPanel } from "./ContractSigningPanel";

type Props = {
  slug: string;
  projectId: string;
  initialBlocks: unknown[];
  agencySig: string | null;
  clientSig: string | null;
  status: string;
  onDone: () => void;
};

export function ContractEditor({
  slug,
  projectId,
  initialBlocks,
  agencySig,
  clientSig,
  status,
  onDone,
}: Props) {
  const router = useRouter();
  const editor = useCreateBlockNote({
    initialContent: (initialBlocks?.length ? initialBlocks : undefined) as never,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setBusy(true);
    setError(null);
    const res = await saveContract({
      projectId,
      blocks: editor.document as unknown[],
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Contract</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={busy}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView editor={editor} theme="light" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ContractSigningPanel
        projectId={projectId}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onSigned={() => router.refresh()}
      />
    </div>
  );
}
