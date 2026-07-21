"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveProposal } from "../../actions";
import { ProposalTags } from "./ProposalTags";

export function ProposalEditor({
  slug,
  projectId,
  initialTitle,
  initialBlocks,
  initialTags,
  onDone,
}: {
  slug: string;
  projectId: string;
  initialTitle: string;
  initialBlocks: unknown[];
  initialTags: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const editor = useCreateBlockNote({
    initialContent: (initialBlocks?.length ? initialBlocks : undefined) as never,
  });
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave() {
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
    onDone();
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
        <div className="flex items-center gap-2">
          <button onClick={onDone} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={busy} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
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
