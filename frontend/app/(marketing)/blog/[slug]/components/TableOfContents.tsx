"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/blog-data";

export default function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav>
      <h3 className="text-2xs font-black uppercase tracking-wider text-night/40">
        On This Page
      </h3>
      <ul className="mt-3 space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block border-l-2 py-1 text-sm font-bold transition-all duration-200 ${
                h.level === 3 ? "pl-6" : "pl-3"
              } ${
                activeId === h.id
                  ? "border-violet text-violet"
                  : "border-transparent text-night/50 hover:text-night/80"
              }`}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
