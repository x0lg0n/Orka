"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";

interface DocsMegaMenuProps {
  item: DocItem;
  onClose: () => void;
}

export default function DocsMegaMenu({ item, onClose }: DocsMegaMenuProps) {
  const pathname = usePathname();

  if (!item.children || item.children.length === 0) return null;

  const cols =
    item.children.length <= 3
      ? "grid-cols-1"
      : item.children.length <= 6
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
      <div
        className="animate-in fade-in slide-in-from-top-1 w-[640px] rounded-2xl border border-night/10 bg-white p-6 shadow-xl backdrop-blur-xl"
        style={{ animationDuration: "150ms" }}
        onMouseEnter={() => {}}
        onMouseLeave={onClose}
      >
        <div className="mb-4">
          <p className="text-sm font-black text-night">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 text-[13px] font-bold text-night/50">
              {item.description}
            </p>
          )}
        </div>

        <div className={`grid ${cols} gap-1`}>
          {item.children.map((child) => {
            const href = `/docs/${item.slug}/${child.slug}`;
            const isChildActive = pathname === href;

            return (
              <Link
                key={child.slug}
                href={href}
                onClick={onClose}
                className={`rounded-xl px-3 py-2.5 transition-colors ${
                  isChildActive
                    ? "bg-violet/10 text-violet"
                    : "text-night hover:bg-night/5"
                }`}
              >
                <p className="text-[13px] font-bold">{child.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
