"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "orka:sidebar-collapsed";

/**
 * Sidebar collapse (rail) state.
 * - Defaults to COLLAPSED per design.
 * - Initialized deterministically (collapsed) so server and client render
 *   identical HTML; the persisted manual preference is read after mount to
 *   avoid a hydration mismatch.
 * - The rail expands on hover (preview) and collapses back when the pointer
 *   leaves, UNLESS a group is pinned open or the user manually expanded it.
 * - Clicking a group pins the rail open (pinnedId) so its accordion stays
 *   visible regardless of hover — this decouples hover-preview from the
 *   committed click, preventing the rail from collapsing on a group click.
 */
export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    // Read the persisted manual preference after mount. The initial render is
    // always collapsed so server and client HTML match; this updates it post-mount.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setCollapsed(stored === "1");
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      if (next) setPinnedId(null);
      return next;
    });
  };

  const togglePin = (id: string) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  const expanded = hovered || pinnedId !== null || !collapsed;

  return { collapsed, expanded, hovered, pinnedId, setHovered, toggle, togglePin };
}
