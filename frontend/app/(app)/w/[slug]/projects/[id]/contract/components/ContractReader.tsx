"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Pencil, History, FileSignature } from "lucide-react";
import { ContractEditorClient } from "./ContractEditorClient";
import { ContractSigningPanel } from "./ContractSigningPanel";
import { ContractVersionsPanel } from "./ContractVersionsPanel";

type Props = {
  slug: string;
  projectId: string;
  orgId: string;
  blocks: unknown[];
  agencySig: string | null;
  clientSig: string | null;
  status: string;
  contractId: string;
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border border-gray-200",
  agency_signed: "bg-amber-50 text-amber-600 border border-amber-200",
  client_signed: "bg-blue-50 text-blue-600 border border-blue-200",
  complete: "bg-emerald-50 text-emerald-600 border border-emerald-200",
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
  orgId,
  blocks,
  agencySig,
  clientSig,
  status,
  contractId,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const editor = useCreateBlockNote({
    initialContent: (blocks?.length ? blocks : undefined) as never,
  });

  if (editing) {
    return (
      <ContractEditorClient
        slug={slug}
        projectId={projectId}
        orgId={orgId}
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7c3aed]/10">
            <FileSignature className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Contract</h1>
            <p className="text-xs text-gray-500">Review and sign the project contract</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}>
            {STATUS_LABEL[status] ?? status}
          </span>
          <button
            onClick={() => setShowVersions(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <History className="h-4 w-4" /> Versions
          </button>
          {status === "draft" && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView editor={editor} editable={false} theme="light" />
      </div>

      <ContractSigningPanel
        projectId={projectId}
        orgId={orgId}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onSigned={() => router.refresh()}
      />

      {showVersions && (
        <ContractVersionsPanel
          projectId={projectId}
          orgId={orgId}
          contractId={contractId}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}
