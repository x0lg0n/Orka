"use client";

import { useState, useEffect } from "react";

function calc(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function TimeAgo({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    setLabel(calc(iso));
    const interval = setInterval(() => setLabel(calc(iso)), 60_000);
    return () => clearInterval(interval);
  }, [iso]);

  return <>{label || <>&nbsp;</>}</>;
}
