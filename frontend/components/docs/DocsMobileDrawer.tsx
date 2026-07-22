"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import DocsSidebar from "./DocsSidebar";

interface DocsMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsMobileDrawer({ isOpen, onClose }: DocsMobileDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(onClose, 250);
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-night/40 transition-opacity duration-250 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`absolute left-0 top-0 h-full w-[280px] bg-white shadow-xl transition-transform duration-250 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-night/10 p-4">
          <p className="text-sm font-black text-night">Documentation</p>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-night/60 hover:bg-night/5 hover:text-night"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-[calc(100%-60px)] overflow-y-auto">
          <DocsSidebar />
        </div>
      </div>
    </div>
  );
}