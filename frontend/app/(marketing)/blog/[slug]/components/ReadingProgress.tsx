"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min(Math.round((scrollTop / docHeight) * 100), 100));
      }
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="sticky top-0 z-50 border-b border-night/8 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 py-2">
          <span className="hidden text-[10px] font-black uppercase tracking-wider text-night/40 sm:inline">
            Reading Progress
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night/8">
            <div
              className="h-full rounded-full bg-violet transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] font-bold text-violet">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
