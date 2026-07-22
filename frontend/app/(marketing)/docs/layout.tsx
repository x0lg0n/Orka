"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsMobileDrawer from "@/components/docs/DocsMobileDrawer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <DocsSidebar />
      <div className="flex-1 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden mb-4 p-2 rounded-lg hover:bg-night/5 text-night/70"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        
        {children}
      </div>
      
      {/* Mobile drawer */}
      <DocsMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
