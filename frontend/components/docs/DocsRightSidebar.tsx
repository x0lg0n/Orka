"use client";

import DocsToc, { TocItem } from "./DocsToc";

interface DocsRightSidebarProps {
  headings: TocItem[];
}

export default function DocsRightSidebar({ headings }: DocsRightSidebarProps) {
  return (
    <div className="hidden w-[320px] shrink-0 self-start lg:block">
      <div className="sticky top-[96px]">
        <DocsToc headings={headings} />
      </div>
    </div>
  );
}
