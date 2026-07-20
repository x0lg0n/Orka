"use client";
import { diffLines } from "diff";

export function ProposalDiff({ before, after }: { before: string; after: string }) {
  const parts = diffLines(before ?? "", after ?? "");
  return (
    <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed">
      {parts.map((part, i) => (
        <span
          key={i}
          className={
            part.added
              ? "bg-green-100 text-green-800"
              : part.removed
              ? "bg-red-100 text-red-800"
              : "text-gray-700"
          }
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}
