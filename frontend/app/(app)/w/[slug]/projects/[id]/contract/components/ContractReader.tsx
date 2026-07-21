"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Pencil } from "lucide-react";
import { ContractEditorClient } from "./ContractEditorClient";
import { ContractSigningPanel } from "./ContractSigningPanel";

type Props = {
  slug: string;
  projectId: string;
  blocks: unknown[];
  agencySig: string | null;
  clientSig: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  agency_signed: "Agency Signed",
  client_signed: "Client Signed",
  complete: "Complete",
};

export function ContractReader({
  slug,
  projectId,
  blocks,
  agencySig,
  clientSig,
  status,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const editor = useCreateBlockNote({
    initialContent: (blocks?.length ? blocks : undefined) as never,
  });

  if (editing) {
    return (
      <ContractEditorClient
        slug={slug}
        projectId={projectId}
        initialBlocks={blocks}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onDone={() => { setEditing(false); router.refresh(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Contract</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
        {status === "draft" && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView editor={editor} editable={false} theme="light" />
      </div>

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
