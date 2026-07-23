"use client";

import { useState } from "react";
import { Link2, Bookmark, Share2, Check } from "lucide-react";

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement("input");
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-night/10 px-3 py-1.5 text-[11px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        {copied ? <Check size={12} className="text-teal" /> : <Link2 size={12} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-night/10 px-3 py-1.5 text-[11px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night">
        <Bookmark size={12} />
        Save
      </button>
      <button className="inline-flex items-center gap-1.5 rounded-lg border border-night/10 px-3 py-1.5 text-[11px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night">
        <Share2 size={12} />
        Share
      </button>
    </div>
  );
}
