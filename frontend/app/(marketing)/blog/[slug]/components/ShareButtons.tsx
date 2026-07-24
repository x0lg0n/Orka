"use client";

import { useState, useEffect } from "react";
import { Link2, Bookmark, Share2, Check } from "lucide-react";

export default function ShareButtons() {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const key = `saved-article-${window.location.pathname}`;
    setSaved(localStorage.getItem(key) === "true");
  }, []);

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

  function handleSave() {
    const key = `saved-article-${window.location.pathname}`;
    const next = !saved;
    setSaved(next);
    localStorage.setItem(key, String(next));
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  }

  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        onClick={handleCopyLink}
        aria-label="Copy article link"
        className="inline-flex items-center gap-1.5 rounded-lg border border-night/10 px-3 py-1.5 text-xs font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        {copied ? <Check size={12} className="text-teal" /> : <Link2 size={12} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        onClick={handleSave}
        aria-label={saved ? "Remove from saved" : "Save article"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-night/5 hover:text-night ${
          saved
            ? "border-violet/30 bg-violet/5 text-violet"
            : "border-night/10 text-night/60"
        }`}
      >
        <Bookmark size={12} />
        {saved ? "Saved" : "Save"}
      </button>
      <button
        onClick={handleShare}
        aria-label="Share article"
        className="inline-flex items-center gap-1.5 rounded-lg border border-night/10 px-3 py-1.5 text-xs font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        <Share2 size={12} />
        Share
      </button>
    </div>
  );
}
