"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";

export function ProposalTags({
  tags,
  editable = false,
  onChange,
}: {
  tags: string[];
  editable?: boolean;
  onChange?: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    const next = tags.includes(t) ? tags : [...tags, t];
    onChange?.(next);
    setDraft("");
  }
  function remove(t: string) {
    onChange?.(tags.filter((x) => x !== t));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => {
        const [label, ...rest] = t.split(":");
        const value = rest.join(":").trim();
        return (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200"
          >
            {value ? (
              <>
                <span className="text-violet-400">{label}:</span> {value}
              </>
            ) : (
              t
            )}
            {editable && (
              <button type="button" onClick={() => remove(t)} className="text-violet-400 hover:text-violet-700">
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}
      {editable && (
        <span className="inline-flex items-center gap-1 rounded-full ring-1 ring-inset ring-gray-200 px-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="add tag"
            className="w-20 bg-transparent py-1 text-xs outline-none placeholder:text-gray-400"
          />
          <button type="button" onClick={add} className="text-gray-400 hover:text-gray-700">
            <Plus className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}
