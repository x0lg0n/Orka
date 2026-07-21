"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveProposal } from "../../actions";
import { ProposalTags } from "./ProposalTags";
import { PROPOSAL_TEMPLATE } from "@/lib/contractTemplates";

export function ProposalCreate({ projectId }: { projectId: string }) {
  const router = useRouter();
  const editor = useCreateBlockNote({
    initialContent: PROPOSAL_TEMPLATE as never,
  });
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    setBusy(true);
    setError(null);
    const res = await saveProposal({
      orgId: "",
      projectId,
      title: title.trim() || "Untitled proposal",
      blocks: editor.document as unknown[],
      tags,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled proposal"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
        />
        <button onClick={onCreate} disabled={busy} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
          {busy ? "Creating…" : "Create proposal"}
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProposalTags tags={tags} editable onChange={setTags} />
        <div className="mt-4">
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
