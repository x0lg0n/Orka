"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Globe, Copy, Check } from "lucide-react";
import { PROJECT_TABS } from "./projectTabs.config";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    completed: "bg-blue-50 text-blue-600 border border-blue-200",
    draft: "bg-gray-100 text-gray-600 border border-gray-200",
    archived: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return map[status] ?? map.draft;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: "In Progress",
    completed: "Completed",
    draft: "Draft",
    archived: "Archived",
  };
  return map[status] ?? status;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fmtDate(iso);
}

export function ProjectHeader({
  slug,
  projectId,
  title,
  status,
  clientName,
  createdAt,
  updatedAt,
  sharedToken,
}: {
  slug: string;
  projectId: string;
  title: string;
  status: string;
  clientName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  sharedToken: string | null;
}) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [portalCopied, setPortalCopied] = useState(false);

  const base = `/w/${slug}/projects/${projectId}`;
  const activeTab = pathname.replace(base, "").split("/").filter(Boolean)[0] as string | undefined;
  const tabLabel = PROJECT_TABS.find((t) => t.href === activeTab)?.label;

  const timeAgoLabel = timeAgo(updatedAt);

  async function copyProjectId() {
    try {
      await navigator.clipboard.writeText(projectId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  async function copyPortalLink() {
    if (!sharedToken) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${sharedToken}`);
      setPortalCopied(true);
      setTimeout(() => setPortalCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link
            href={`/w/${slug}/projects`}
            className="transition hover:text-gray-700"
          >
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={base}
            className="transition hover:text-gray-700"
          >
            {title}
          </Link>
          {tabLabel ? (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-gray-700">{tabLabel}</span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel(status)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {clientName || "No client assigned"}
          </span>
          {createdAt ? (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Created {fmtDate(createdAt)}
              {timeAgoLabel ? <span>&nbsp;&middot;&nbsp;Updated {timeAgoLabel}</span> : null}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            ID: {projectId.slice(0, 8)}&hellip;
            <button
              type="button"
              onClick={copyProjectId}
              className="text-gray-400 hover:text-gray-600"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {sharedToken ? (
          <button
            type="button"
            onClick={copyPortalLink}
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            {portalCopied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Globe className="h-4 w-4" />
                Share
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
