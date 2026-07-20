"use client";
import { useState } from "react";
import { Pencil, History, Send } from "lucide-react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { ProposalTags } from "./ProposalTags";
import { ProposalEditor } from "./ProposalEditor";
import { ProposalVersionsPanel } from "./ProposalVersionsPanel";
import { sendProposal } from "../../actions";

type Proposal = {
  id: string;
  title: string;
  blocks: unknown[];
  tags: string[];
  status: string;
  markdown: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function ProposalReader({
  slug,
  projectId,
  proposal,
}: {
  slug: string;
  projectId: string;
  proposal: Proposal;
}) {
  const [editing, setEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [busy, setBusy] = useState(false);

  const editor = useCreateBlockNote({
    initialContent: (proposal.blocks?.length ? proposal.blocks : undefined) as never,
  });

  if (editing) {
    return (
      <ProposalEditor
        slug={slug}
        projectId={projectId}
        initialTitle={proposal.title}
        initialBlocks={proposal.blocks}
        initialTags={proposal.tags}
        onDone={() => setEditing(false)}
      />
    );
  }

  async function onSend() {
    setBusy(true);
    await sendProposal({ orgId: "", projectId });
    setBusy(false);
    location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{proposal.title}</h1>
          <div className="mt-2">
            <ProposalTags tags={proposal.tags} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {STATUS_LABEL[proposal.status] ?? proposal.status}
          </span>
          <button onClick={() => setShowVersions(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
            <History className="h-4 w-4" /> Versions
          </button>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
            <Pencil className="h-4 w-4" /> Edit
          </button>
          {proposal.status === "draft" && (
            <button onClick={onSend} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
              <Send className="h-4 w-4" /> Send to client
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView
          editor={editor}
          editable={false}
          theme="light"
        />
      </div>

      {showVersions && (
        <ProposalVersionsPanel
          slug={slug}
          projectId={projectId}
          proposalId={proposal.id}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}
