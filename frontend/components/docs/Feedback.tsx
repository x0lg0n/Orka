"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackProps {
  slug: string;
}

export default function Feedback({ slug }: FeedbackProps) {
  const [submitted, setSubmitted] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`docs-feedback-${slug}`);
    return stored ? stored === "yes" : null;
  });

  function handleFeedback(helpful: boolean) {
    localStorage.setItem(`docs-feedback-${slug}`, helpful ? "yes" : "no");
    setSubmitted(helpful);
  }

  if (submitted !== null) {
    return (
      <div className="mt-12 rounded-xl border border-night/10 bg-white p-6 text-center">
        <p className="text-sm font-bold text-night/60">
          Thanks for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-xl border border-night/10 bg-white p-6 text-center">
      <p className="text-sm font-black text-night">Was this page helpful?</p>
      <p className="mt-1 text-[13px] font-bold text-night/50">
        Your feedback helps us improve.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center gap-2 rounded-lg border border-night/10 px-4 py-2 text-sm font-bold text-night/60 transition-all hover:border-violet hover:text-violet"
        >
          Yes <ThumbsUp size={14} />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center gap-2 rounded-lg border border-night/10 px-4 py-2 text-sm font-bold text-night/60 transition-all hover:border-violet hover:text-violet"
        >
          No <ThumbsDown size={14} />
        </button>
      </div>
    </div>
  );
}
