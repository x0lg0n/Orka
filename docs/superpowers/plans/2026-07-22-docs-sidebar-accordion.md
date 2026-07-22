# ORKA Docs — Expandable Sidebar Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the left documentation sidebar from a flat list to a professional accordion/tree navigation with nested routes, inline search, and mobile drawer.

**Architecture:** Config-driven catch-all route with nested `children` in navigation config. Single `[...slug]/page.tsx` resolves nested paths. Sidebar auto-generates from config with accordion expand/collapse.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, localStorage

## Global Constraints

- Only modify documentation pages under `app/(marketing)/docs/`
- Do NOT modify authentication, dashboard, API routes, or database schema
- Preserve existing ORKA visual identity (colors, fonts, design tokens)
- Existing flat routes must still work (e.g., `/docs/projects` shows overview)
- `pnpm build` must pass clean after each task
- `pnpm lint` must pass with 0 new errors after each task

---

## File Structure

### New Files
- `frontend/components/docs/DocsSidebarAccordion.tsx` — accordion item component
- `frontend/components/docs/DocsSidebarSearch.tsx` — inline search component  
- `frontend/components/docs/DocsMobileDrawer.tsx` — mobile drawer wrapper
- `frontend/app/(marketing)/docs/[...slug]/page.tsx` — catch-all route
- `frontend/content/docs/getting-started/*.mdx` — 4 nested content files
- `frontend/content/docs/projects/*.mdx` — 5 nested content files
- `frontend/content/docs/proposals/*.mdx` — 6 nested content files
- `frontend/content/docs/contracts/*.mdx` — 5 nested content files
- `frontend/content/docs/milestones/*.mdx` — 5 nested content files
- `frontend/content/docs/escrow/*.mdx` — 6 nested content files
- `frontend/content/docs/payments/*.mdx` — 5 nested content files
- `frontend/content/docs/invoices/*.mdx` — 5 nested content files
- `frontend/content/docs/clients/*.mdx` — 5 nested content files
- `frontend/content/docs/freighter/*.mdx` — 5 nested content files
- `frontend/content/docs/api/*.mdx` — 6 nested content files
- `frontend/content/docs/security/*.mdx` — 5 nested content files
- `frontend/content/docs/faq/*.mdx` — 5 nested content files

### Modified Files
- `frontend/lib/docs/config.ts` — add `children` to `DocItem`, update navigation config
- `frontend/components/docs/DocsSidebar.tsx` — complete rewrite with accordion, search, mobile
- `frontend/app/(marketing)/docs/layout.tsx` — add mobile drawer support
- `frontend/public/search-index.json` — regenerate with nested routes

### Deleted Files
- `frontend/app/(marketing)/docs/[slug]/page.tsx` — replaced by `[...slug]`

---

## Task 1: Update Navigation Config with Nested Children

**Files:**
- Modify: `frontend/lib/docs/config.ts`

**Interfaces:**
- Produces: `DocItem` with `children?: DocItem[]`, updated `docsNavigation` array

- [ ] **Step 1: Update DocItem interface**

```typescript
export interface DocItem {
  title: string;
  slug: string;
  icon?: string;
  children?: DocItem[];
}
```

- [ ] **Step 2: Update docsNavigation with nested children**

```typescript
export const docsNavigation: DocSection[] = [
  {
    title: "GETTING STARTED",
    items: [
      {
        title: "Getting Started",
        slug: "getting-started",
        icon: "rocket",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Create Account", slug: "create-account" },
          { title: "Create Workspace", slug: "create-workspace" },
          { title: "Invite Members", slug: "invite-members" },
          { title: "Connect Freighter", slug: "connect-freighter" },
        ],
      },
      {
        title: "Workspaces",
        slug: "workspaces",
        icon: "layout-grid",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Create Workspace", slug: "create" },
          { title: "Invite Members", slug: "invite-members" },
          { title: "Member Roles", slug: "member-roles" },
          { title: "Workspace Settings", slug: "settings" },
        ],
      },
    ],
  },
  {
    title: "PRODUCT GUIDE",
    items: [
      {
        title: "Projects",
        slug: "projects",
        icon: "folder",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Creating Projects", slug: "creating" },
          { title: "Timeline", slug: "timeline" },
          { title: "Files", slug: "files" },
          { title: "Client Portal", slug: "client-portal" },
          { title: "Settings", slug: "settings" },
        ],
      },
      {
        title: "Proposals",
        slug: "proposals",
        icon: "file-text",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "AI Generator", slug: "ai-generator" },
          { title: "Edit Proposal", slug: "edit" },
          { title: "Send Proposal", slug: "send" },
          { title: "Proposal Status", slug: "status" },
          { title: "Versions", slug: "versions" },
        ],
      },
      {
        title: "Contracts",
        slug: "contracts",
        icon: "file-check",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Generate Contract", slug: "generate" },
          { title: "Contract Template", slug: "template" },
          { title: "Signatures", slug: "signatures" },
          { title: "Contract Status", slug: "status" },
        ],
      },
      {
        title: "Milestones",
        slug: "milestones",
        icon: "milestone",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Create Milestone", slug: "create" },
          { title: "Edit Milestone", slug: "edit" },
          { title: "Approval Flow", slug: "approval" },
          { title: "Release Payment", slug: "release-payment" },
        ],
      },
      {
        title: "Escrow",
        slug: "escrow",
        icon: "shield",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Fund Escrow", slug: "fund" },
          { title: "Release Funds", slug: "release" },
          { title: "Partial Release", slug: "partial-release" },
          { title: "Refund", slug: "refund" },
          { title: "Escrow Security", slug: "security" },
        ],
      },
      {
        title: "Payments",
        slug: "payments",
        icon: "wallet",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Transaction History", slug: "transaction-history" },
          { title: "Stellar Payments", slug: "stellar" },
          { title: "Currency Conversion", slug: "currency-conversion" },
          { title: "Failed Payments", slug: "failed-payments" },
        ],
      },
      {
        title: "Invoices",
        slug: "invoices",
        icon: "receipt",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Create Invoice", slug: "create" },
          { title: "Invoice Status", slug: "status" },
          { title: "Payment Tracking", slug: "payment-tracking" },
          { title: "Export Invoice", slug: "export" },
        ],
      },
      {
        title: "Clients",
        slug: "clients",
        icon: "users",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Client Portal", slug: "portal" },
          { title: "Invite Client", slug: "invite" },
          { title: "Shared Files", slug: "shared-files" },
          { title: "Communication", slug: "communication" },
        ],
      },
      {
        title: "Freighter",
        slug: "freighter",
        icon: "wallet",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Install Wallet", slug: "install" },
          { title: "Connect Wallet", slug: "connect" },
          { title: "Sign Transaction", slug: "sign-transaction" },
          { title: "Troubleshooting", slug: "troubleshooting" },
        ],
      },
    ],
  },
  {
    title: "DEVELOPERS",
    items: [
      {
        title: "API",
        slug: "api",
        icon: "code",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Authentication", slug: "authentication" },
          { title: "Endpoints", slug: "endpoints" },
          { title: "SDK", slug: "sdk" },
          { title: "Webhooks", slug: "webhooks" },
          { title: "Examples", slug: "examples" },
        ],
      },
      {
        title: "Security",
        slug: "security",
        icon: "shield-check",
        children: [
          { title: "Overview", slug: "overview" },
          { title: "Encryption", slug: "encryption" },
          { title: "Wallet Security", slug: "wallet-security" },
          { title: "Permissions", slug: "permissions" },
          { title: "Best Practices", slug: "best-practices" },
        ],
      },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      {
        title: "FAQ",
        slug: "faq",
        icon: "help-circle",
        children: [
          { title: "General", slug: "general" },
          { title: "Billing", slug: "billing" },
          { title: "Escrow", slug: "escrow" },
          { title: "Payments", slug: "payments" },
          { title: "Wallet", slug: "wallet" },
        ],
      },
    ],
  },
];
```

- [ ] **Step 3: Update helper functions for nested navigation**

```typescript
export function getAllDocSlugs(): string[] {
  const slugs: string[] = [];
  for (const section of docsNavigation) {
    for (const item of section.items) {
      slugs.push(item.slug);
      if (item.children) {
        for (const child of item.children) {
          slugs.push(`${item.slug}/${child.slug}`);
        }
      }
    }
  }
  return slugs;
}

export function getDocBySlug(slug: string): DocItem | undefined {
  const parts = slug.split("/");
  const parentSlug = parts[0];
  const childSlug = parts[1];

  for (const section of docsNavigation) {
    for (const item of section.items) {
      if (item.slug === parentSlug) {
        if (!childSlug) return item;
        return item.children?.find((c) => c.slug === childSlug);
      }
    }
  }
  return undefined;
}

export function getParentSlug(slug: string): string | undefined {
  const parts = slug.split("/");
  if (parts.length === 2) return parts[0];
  return undefined;
}

export function getAdjacentDocs(slug: string): {
  prev: DocItem | null;
  next: DocItem | null;
} {
  const allItems = docsNavigation.flatMap((section) =>
    section.items.flatMap((item) => {
      const withParent = [item];
      if (item.children) {
        for (const child of item.children) {
          withParent.push({ ...child, slug: `${item.slug}/${child.slug}` });
        }
      }
      return withParent;
    })
  );
  const index = allItems.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? allItems[index - 1] : null,
    next: index < allItems.length - 1 ? allItems[index + 1] : null,
  };
}

export function getSectionForDoc(slug: string): DocSection | undefined {
  const parentSlug = slug.split("/")[0];
  return docsNavigation.find((section) =>
    section.items.some((item) => item.slug === parentSlug)
  );
}
```

- [ ] **Step 4: Run build to verify config changes**

Run: `cd frontend && pnpm build`
Expected: Build passes (existing routes still work)

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/docs/config.ts
git commit -m "feat(docs): add nested children to navigation config"
```

---

## Task 2: Create Nested Content Files

**Files:**
- Create: `frontend/content/docs/getting-started/overview.mdx`
- Create: `frontend/content/docs/getting-started/create-account.mdx`
- Create: `frontend/content/docs/getting-started/create-workspace.mdx`
- Create: `frontend/content/docs/getting-started/invite-members.mdx`
- Create: `frontend/content/docs/getting-started/connect-freighter.mdx`
- Create: `frontend/content/docs/projects/overview.mdx`
- Create: `frontend/content/docs/projects/creating.mdx`
- Create: `frontend/content/docs/projects/timeline.mdx`
- Create: `frontend/content/docs/projects/files.mdx`
- Create: `frontend/content/docs/projects/client-portal.mdx`
- Create: `frontend/content/docs/projects/settings.mdx`
- Create: similar for proposals, contracts, milestones, escrow, payments, invoices, clients, freighter, api, security, faq

**Interfaces:**
- Produces: MDX content files for all nested routes

- [ ] **Step 1: Create getting-started nested files**

```bash
mkdir -p frontend/content/docs/getting-started
```

Create `frontend/content/docs/getting-started/overview.mdx`:
```mdx
---
title: Getting Started with ORKA
description: Learn the basics of ORKA and get up and running in minutes.
---

# Getting Started

Welcome to ORKA! This guide will help you get started with our platform.

## What is ORKA?

ORKA is a complete business management platform for freelancers and agencies. It handles proposals, contracts, milestones, escrow payments, invoicing, and client management.

## Quick Start

1. **Create your account** - Sign up with your email
2. **Set up your workspace** - Configure your business details
3. **Connect Freighter** - Link your Stellar wallet
4. **Create your first project** - Start managing clients

## Next Steps

- [Create Account](/docs/getting-started/create-account)
- [Create Workspace](/docs/getting-started/create-workspace)
- [Invite Members](/docs/getting-started/invite-members)
```

Create `frontend/content/docs/getting-started/create-account.mdx`:
```mdx
---
title: Create Account
description: How to create your ORKA account and get started.
---

# Create Account

Follow these steps to create your ORKA account.

## Step 1: Visit the Signup Page

Go to [orka.co/signup](https://orka.co/signup) and click "Join Waitlist".

## Step 2: Fill in Your Details

Enter your:
- Full name
- Email address
- Password

## Step 3: Verify Your Email

Check your inbox for a verification email and click the link.

## Step 4: Complete Your Profile

Add your business details:
- Company name
- Role
- Timezone

## Next Steps

After creating your account, [create your workspace](/docs/getting-started/create-workspace).
```

Create `frontend/content/docs/getting-started/create-workspace.mdx`:
```mdx
---
title: Create Workspace
description: Set up your first workspace to start managing projects.
---

# Create Workspace

Workspaces are where you manage projects, team members, and clients.

## Creating a Workspace

1. Click "Workspaces" in the sidebar
2. Click "New Workspace"
3. Enter your workspace name
4. Choose your plan
5. Click "Create"

## Workspace Settings

After creation, configure:
- **Team members** - Invite your team
- **Billing** - Set up payment methods
- **Integrations** - Connect third-party tools

## Next Steps

- [Invite Members](/docs/getting-started/invite-members)
- [Connect Freighter](/docs/getting-started/connect-freighter)
```

Create `frontend/content/docs/getting-started/invite-members.mdx`:
```mdx
---
title: Invite Members
description: Add team members to your workspace.
---

# Invite Members

Collaborate with your team by inviting them to your workspace.

## How to Invite

1. Go to **Workspace Settings**
2. Click **Team Members**
3. Click **Invite Member**
4. Enter their email address
5. Choose their role
6. Click **Send Invite**

## Roles

- **Owner** - Full access, billing management
- **Admin** - Manage projects, team members
- **Member** - View and edit assigned projects
- **Viewer** - Read-only access

## Accepting Invites

Invited members will receive an email with a link to join your workspace.
```

Create `frontend/content/docs/getting-started/connect-freighter.mdx`:
```mdx
---
title: Connect Freighter
description: Connect your Stellar wallet to ORKA.
---

# Connect Freighter

Freighter is a Stellar wallet browser extension. Connect it to ORKA for escrow and payments.

## Installation

1. Visit [freighter.app](https://freighter.app)
2. Click "Install for Chrome"
3. Add the extension to your browser
4. Create or import a Stellar wallet

## Connecting to ORKA

1. Go to **Settings** > **Wallets**
2. Click **Connect Freighter**
3. Approve the connection in the Freighter popup
4. Your wallet address will appear in ORKA

## Why Connect?

- Fund escrow for projects
- Release payments to freelancers
- Receive payments from clients
- Track all transactions

## Security

Freighter never shares your private keys with ORKA. All transactions require your approval in the extension.
```

- [ ] **Step 2: Create projects nested files**

```bash
mkdir -p frontend/content/docs/projects
```

Create `frontend/content/docs/projects/overview.mdx`:
```mdx
---
title: Projects Overview
description: Manage projects, timeline, files and activity.
---

# Projects

Projects are the core of ORKA. Each project tracks proposals, contracts, milestones, payments, and files.

## Project Features

- **Timeline** - Track project progress
- **Milestones** - Break work into deliverables
- **Escrow** - Secure milestone-based payments
- **Files** - Share documents with clients
- **Activity** - Complete audit trail

## Creating a Project

1. Click **Projects** in the sidebar
2. Click **New Project**
3. Fill in project details
4. Add team members
5. Click **Create**

## Next Steps

- [Creating Projects](/docs/projects/creating)
- [Timeline](/docs/projects/timeline)
- [Files](/docs/projects/files)
```

Create `frontend/content/docs/projects/creating.mdx`:
```mdx
---
title: Creating Projects
description: How to create and configure new projects.
---

# Creating Projects

Learn how to create and configure projects in ORKA.

## Project Types

- **Fixed Price** - Set total budget upfront
- **Time & Materials** - Track hours and expenses
- **Retainer** - Recurring monthly projects

## Project Setup

1. **Name** - Clear, descriptive project name
2. **Client** - Select existing or create new
3. **Budget** - Set total project budget
4. **Timeline** - Start and end dates
5. **Team** - Assign team members

## Project Settings

After creation, configure:
- **Notifications** - Email and in-app alerts
- **Permissions** - Who can edit/view
- **Integrations** - Connect external tools
```

Create `frontend/content/docs/projects/timeline.mdx`:
```mdx
---
title: Timeline
description: Track project progress and milestones.
---

# Timeline

The timeline view shows your project's progress over time.

## Timeline Features

- **Milestone markers** - See key deliverables
- **Progress bar** - Visual completion status
- **Activity feed** - Recent project events
- **Deadline alerts** - Upcoming due dates

## Using the Timeline

1. Navigate to your project
2. Click **Timeline** tab
3. View milestones and progress
4. Click any milestone for details

## Updating Progress

- Mark milestones as complete
- Add activity entries
- Update status notes
- Attach files to milestones
```

Create `frontend/content/docs/projects/files.mdx`:
```mdx
---
title: Files
description: Share files and documents with your team and clients.
---

# Files

The Files section lets you manage project documents.

## File Features

- **Upload** - Drag and drop or browse
- **Preview** - View files in-browser
- **Share** - Control access permissions
- **Versioning** - Track file changes

## Uploading Files

1. Go to **Project** > **Files**
2. Click **Upload** or drag files
3. Choose visibility (team/client/both)
4. Add description (optional)
5. Click **Save**

## File Types Supported

- Documents (PDF, DOCX, TXT)
- Images (PNG, JPG, GIF)
- Spreadsheets (XLSX, CSV)
- Presentations (PPTX)
- Code files (any text format)

## Sharing with Clients

Toggle **Client Access** to let clients view/download files.
```

Create `frontend/content/docs/projects/client-portal.mdx`:
```mdx
---
title: Client Portal
description: Give clients a shared view of project progress.
---

# Client Portal

The Client Portal gives your clients a read-only view of project progress.

## What Clients See

- Project timeline and milestones
- Shared files and documents
- Invoice and payment status
- Activity feed

## Enabling Client Portal

1. Go to **Project Settings**
2. Click **Client Portal**
3. Toggle **Enable Portal**
4. Set access permissions
5. Share the portal link with your client

## Client Portal Features

- **Branded experience** - Your logo and colors
- **Real-time updates** - Instant sync with project
- **Secure access** - Token-based authentication
- **Mobile friendly** - Works on all devices
```

Create `frontend/content/docs/projects/settings.mdx`:
```mdx
---
title: Project Settings
description: Configure project options and permissions.
---

# Project Settings

Configure your project's settings and permissions.

## General Settings

- **Project name** - Edit project title
- **Description** - Project summary
- **Budget** - Total project budget
- **Timeline** - Start and end dates

## Team Permissions

- **Owner** - Full access
- **Admin** - Edit settings, manage team
- **Member** - Edit assigned tasks
- **Viewer** - Read-only access

## Notifications

Configure alerts for:
- Milestone completions
- Payment events
- File uploads
- Team mentions

## Danger Zone

- **Archive Project** - Hide from active list
- **Delete Project** - Permanently remove (requires confirmation)
```

- [ ] **Step 3: Create remaining nested files (proposals through faq)**

Create similar MDX files for each category following the same pattern:
- proposals/overview.mdx, ai-generator.mdx, edit.mdx, send.mdx, status.mdx, versions.mdx
- contracts/overview.mdx, generate.mdx, template.mdx, signatures.mdx, status.mdx
- milestones/overview.mdx, create.mdx, edit.mdx, approval.mdx, release-payment.mdx
- escrow/overview.mdx, fund.mdx, release.mdx, partial-release.mdx, refund.mdx, security.mdx
- payments/overview.mdx, transaction-history.mdx, stellar.mdx, currency-conversion.mdx, failed-payments.mdx
- invoices/overview.mdx, create.mdx, status.mdx, payment-tracking.mdx, export.mdx
- clients/overview.mdx, portal.mdx, invite.mdx, shared-files.mdx, communication.mdx
- freighter/overview.mdx, install.mdx, connect.mdx, sign-transaction.mdx, troubleshooting.mdx
- api/overview.mdx, authentication.mdx, endpoints.mdx, sdk.mdx, webhooks.mdx, examples.mdx
- security/overview.mdx, encryption.mdx, wallet-security.mdx, permissions.mdx, best-practices.mdx
- faq/general.mdx, billing.mdx, escrow.mdx, payments.mdx, wallet.mdx

Each file should have:
- Frontmatter with title and description
- H1 heading
- Brief introduction
- 2-3 sections with H2 headings
- Next steps or related links

- [ ] **Step 4: Run build to verify content files**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 5: Commit**

```bash
git add frontend/content/docs/
git commit -m "feat(docs): add nested content files for all categories"
```

---

## Task 3: Create Catch-All Route

**Files:**
- Create: `frontend/app/(marketing)/docs/[...slug]/page.tsx`
- Delete: `frontend/app/(marketing)/docs/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getDocBySlug`, `getParentSlug`, `getAllDocSlugs`, `renderMDX`
- Produces: Renders nested doc pages

- [ ] **Step 1: Create catch-all route**

```typescript
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDocSlugs, getDocBySlug, getParentSlug } from "@/lib/docs/config";
import { renderMDX } from "@/lib/docs/mdx";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import DocsToc from "@/components/docs/DocsToc";
import PrevNextNav from "@/components/docs/PrevNextNav";
import Feedback from "@/components/docs/Feedback";
import RelatedArticles from "@/components/docs/RelatedArticles";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug: slug.split("/") }));
}

function extractHeadings(source: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

export default async function DocPage({ params }: Props) {
  const slugArray = await params;
  const slug = slugArray.slug.join("/");
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const docsDir = path.join(process.cwd(), "content/docs");
  
  // Try nested path first, then flat path
  let filePath = path.join(docsDir, `${slug}.mdx`);
  
  // For parent routes with children, try overview.mdx
  const parentSlug = getParentSlug(slug);
  if (!fs.existsSync(filePath) && parentSlug) {
    filePath = path.join(docsDir, `${slug}/overview.mdx`);
  }
  
  // Fallback to parent's root file
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, `${parentSlug || slug}.mdx`);
  }

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const headings = extractHeadings(content);
  const mdxContent = await renderMDX(content);

  return (
    <div className="flex gap-10">
      <article className="flex-1 min-w-0 max-w-[720px]">
        <Breadcrumbs slug={slug} />

        <h1 className="display text-4xl uppercase sm:text-5xl text-night">
          {data.title || doc.title}
        </h1>

        {data.description && (
          <p className="mt-3 text-base font-normal leading-7 text-night/60 sm:text-[18px]">
            {data.description}
          </p>
        )}

        <div className="mt-8">{mdxContent}</div>

        <PrevNextNav slug={slug} />
        <Feedback slug={slug} />
        <RelatedArticles slug={slug} />
      </article>

      <DocsToc headings={headings} />
    </div>
  );
}
```

- [ ] **Step 2: Delete old slug route**

```bash
rm frontend/app/\(marketing\)/docs/\[slug\]/page.tsx
rmdir frontend/app/\(marketing\)/docs/\[slug\]
```

- [ ] **Step 3: Run build to verify catch-all route**

Run: `cd frontend && pnpm build`
Expected: Build passes, all nested routes generate

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(marketing\)/docs/
git commit -m "feat(docs): add catch-all route for nested pages"
```

---

## Task 4: Create DocsSidebarAccordion Component

**Files:**
- Create: `frontend/components/docs/DocsSidebarAccordion.tsx`

**Interfaces:**
- Consumes: `DocItem` from config, `usePathname` from Next.js
- Produces: Accordion UI with expand/collapse

- [ ] **Step 1: Create accordion component**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DocItem } from "@/lib/docs/config";

interface DocsSidebarAccordionProps {
  item: DocItem;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function DocsSidebarAccordion({
  item,
  icon,
  isExpanded,
  onToggle,
}: DocsSidebarAccordionProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const isActive = pathname === `/docs/${item.slug}` || 
    pathname.startsWith(`/docs/${item.slug}/`);

  const isChildActive = item.children?.some(
    (child) => pathname === `/docs/${item.slug}/${child.slug}`
  );

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all ${
          isActive && !isChildActive
            ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
            : "text-night/70 hover:bg-night/5 hover:text-night"
        }`}
        aria-expanded={isExpanded}
        aria-controls={`submenu-${item.slug}`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 text-left">{item.title}</span>
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      <div
        id={`submenu-${item.slug}`}
        role="region"
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="ml-4 mt-1 space-y-0.5 border-l border-night/10 pl-2">
          {item.children?.map((child) => {
            const childPath = `/docs/${item.slug}/${child.slug}`;
            const isChildCurrent = pathname === childPath;
            
            return (
              <Link
                key={child.slug}
                href={childPath}
                className={`block rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors ${
                  isChildCurrent
                    ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
                    : "text-night/60 hover:bg-night/5 hover:text-night"
                }`}
              >
                {child.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify component**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsSidebarAccordion.tsx
git commit -m "feat(docs): add accordion component for sidebar"
```

---

## Task 5: Create DocsSidebarSearch Component

**Files:**
- Create: `frontend/components/docs/DocsSidebarSearch.tsx`

**Interfaces:**
- Consumes: `docsNavigation` from config
- Produces: Search input with filter functionality

- [ ] **Step 1: Create search component**

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

interface DocsSidebarSearchProps {
  onFilter: (query: string) => void;
}

export default function DocsSidebarSearch({ onFilter }: DocsSidebarSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onFilter(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onFilter]);

  const handleClear = () => {
    setQuery("");
    onFilter("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative mb-4">
      <div className="flex items-center gap-2 rounded-lg border border-night/10 bg-white px-3 py-2 text-sm text-night/50 focus-within:border-violet focus-within:ring-1 focus-within:ring-violet/20">
        <Search size={14} className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-night outline-none placeholder:text-night/40"
          aria-label="Search documentation"
        />
        {query && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded p-0.5 text-night/40 hover:text-night"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify component**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsSidebarSearch.tsx
git commit -m "feat(docs): add inline search component for sidebar"
```

---

## Task 6: Rewrite DocsSidebar with Accordion and Search

**Files:**
- Modify: `frontend/components/docs/DocsSidebar.tsx`

**Interfaces:**
- Consumes: `DocsSidebarAccordion`, `DocsSidebarSearch`, `docsNavigation`
- Produces: Full sidebar with accordion, search, mobile support

- [ ] **Step 1: Rewrite sidebar component**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutGrid,
  Folder,
  FileText,
  FileCheck,
  Milestone,
  Shield,
  Wallet,
  Receipt,
  Users,
  Code,
  ShieldCheck,
  HelpCircle,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";
import DocsSidebarAccordion from "./DocsSidebarAccordion";
import DocsSidebarSearch from "./DocsSidebarSearch";

const iconMap: Record<string, typeof Rocket> = {
  rocket: Rocket,
  "layout-grid": LayoutGrid,
  folder: Folder,
  "file-text": FileText,
  "file-check": FileCheck,
  milestone: Milestone,
  shield: Shield,
  wallet: Wallet,
  receipt: Receipt,
  users: Users,
  code: Code,
  "shield-check": ShieldCheck,
  "help-circle": HelpCircle,
};

const STORAGE_KEY = "docs_sidebar_expanded";

export default function DocsSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [filterQuery, setFilterQuery] = useState("");

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setExpandedItems(JSON.parse(saved));
      } catch {
        setExpandedItems([]);
      }
    }
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedItems));
  }, [expandedItems]);

  // Auto-expand based on current path
  useEffect(() => {
    const parts = pathname.split("/");
    if (parts[2]) {
      const parentSlug = parts[2];
      if (!expandedItems.includes(parentSlug)) {
        setExpandedItems((prev) => [...prev, parentSlug]);
      }
    }
  }, [pathname]);

  const toggleExpanded = useCallback((slug: string) => {
    setExpandedItems((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const handleFilter = useCallback((query: string) => {
    setFilterQuery(query.toLowerCase());
  }, []);

  // Filter items based on search query
  const filteredNavigation = docsNavigation.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!filterQuery) return true;
      
      const matchesParent = item.title.toLowerCase().includes(filterQuery);
      const matchesChild = item.children?.some((child) =>
        child.title.toLowerCase().includes(filterQuery)
      );
      
      return matchesParent || matchesChild;
    }),
  }));

  // Auto-expand matching categories during search
  useEffect(() => {
    if (filterQuery) {
      const matchingSlugs = docsNavigation
        .flatMap((section) => section.items)
        .filter(
          (item) =>
            item.title.toLowerCase().includes(filterQuery) ||
            item.children?.some((child) =>
              child.title.toLowerCase().includes(filterQuery)
            )
        )
        .map((item) => item.slug);
      
      setExpandedItems((prev) => [...new Set([...prev, ...matchingSlugs])]);
    }
  }, [filterQuery]);

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 overflow-y-auto border-r border-night/10 bg-white/60 p-4 lg:block hidden">
      <DocsSidebarSearch onFilter={handleFilter} />

      <nav className="space-y-6">
        {filteredNavigation.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-night/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : Folder;
                const isExpanded = expandedItems.includes(item.slug);
                const hasChildren = item.children && item.children.length > 0;
                const isFiltered = filterQuery && !item.title.toLowerCase().includes(filterQuery);

                return (
                  <li
                    key={item.slug}
                    className={isFiltered ? "opacity-50" : ""}
                  >
                    {hasChildren ? (
                      <DocsSidebarAccordion
                        item={item}
                        icon={<Icon size={15} />}
                        isExpanded={isExpanded}
                        onToggle={() => toggleExpanded(item.slug)}
                      />
                    ) : (
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                          pathname === `/docs/${item.slug}`
                            ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
                            : "text-night/70 hover:bg-night/5 hover:text-night"
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        {item.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 space-y-3">
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <p className="text-xs font-black uppercase text-night/50">New to Orka?</p>
          <p className="mt-1 text-xs font-bold text-night/60">
            Follow our interactive setup guide.
          </p>
          <Link
            href="/docs/getting-started"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Start Tutorial <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-violet" />
            <p className="text-xs font-black text-night">Need Help?</p>
          </div>
          <p className="mt-1 text-xs font-bold text-night/60">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Contact Support <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Run build to verify sidebar**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsSidebar.tsx
git commit -m "feat(docs): rewrite sidebar with accordion, search, and localStorage"
```

---

## Task 7: Create DocsMobileDrawer Component

**Files:**
- Create: `frontend/components/docs/DocsMobileDrawer.tsx`

**Interfaces:**
- Consumes: Same sidebar content
- Produces: Mobile drawer with slide animation

- [ ] **Step 1: Create mobile drawer component**

```typescript
"use client";

import { useState, useEffect } from "react";
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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 250);
  };

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
```

- [ ] **Step 2: Run build to verify component**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsMobileDrawer.tsx
git commit -m "feat(docs): add mobile drawer component for sidebar"
```

---

## Task 8: Update Layout for Mobile Support

**Files:**
- Modify: `frontend/app/(marketing)/docs/layout.tsx`

**Interfaces:**
- Consumes: `DocsMobileDrawer`
- Produces: Layout with mobile drawer trigger

- [ ] **Step 1: Update layout component**

```typescript
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
      {/* Mobile menu trigger */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full bg-violet p-3 text-white shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <DocsMobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Desktop sidebar */}
      <DocsSidebar />

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify layout**

Run: `cd frontend && pnpm build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/docs/layout.tsx
git commit -m "feat(docs): add mobile drawer support to docs layout"
```

---

## Task 9: Regenerate Search Index

**Files:**
- Modify: `frontend/public/search-index.json`

**Interfaces:**
- Consumes: Updated config with nested routes
- Produces: Search index with all nested pages

- [ ] **Step 1: Update search generator for nested routes**

```typescript
// frontend/lib/docs/search.ts - update generateSearchIndex function
export function generateSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  const docsDir = path.join(process.cwd(), "content/docs");

  function processDir(dir: string, parentSlug: string = "") {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        processDir(itemPath, item);
      } else if (item.endsWith(".mdx")) {
        const slug = item.replace(".mdx", "");
        const fullSlug = parentSlug ? `${parentSlug}/${slug}` : slug;
        
        const raw = fs.readFileSync(itemPath, "utf-8");
        const { data, content } = matter(raw);
        
        const plainContent = content
          .replace(/<[^>]+>/g, "")
          .replace(/[#*_`~\[\]]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        
        entries.push({
          id: fullSlug,
          title: data.title || fullSlug,
          content: plainContent,
          category: parentSlug || slug,
        });
      }
    }
  }

  processDir(docsDir);
  return entries;
}
```

- [ ] **Step 2: Regenerate search index**

```bash
cd frontend && npx tsx -e "const { writeSearchIndex } = require('./lib/docs/search.ts'); writeSearchIndex();"
```

- [ ] **Step 3: Verify search index**

Run: `cat frontend/public/search-index.json | head -20`
Expected: JSON with nested routes like `projects/overview`, `projects/timeline`

- [ ] **Step 4: Commit**

```bash
git add frontend/public/search-index.json frontend/lib/docs/search.ts
git commit -m "feat(docs): regenerate search index for nested routes"
```

---

## Task 10: Final Build and Verification

**Files:**
- None (verification only)

**Interfaces:**
- None

- [ ] **Step 1: Run full build**

Run: `cd frontend && pnpm build`
Expected: Build passes with all routes generated

- [ ] **Step 2: Run lint**

Run: `cd frontend && pnpm lint`
Expected: 0 new errors

- [ ] **Step 3: Manual verification checklist**

1. `/docs` landing page renders correctly
2. `/docs/projects` shows overview (backward compatible)
3. `/docs/projects/timeline` shows nested page
4. Sidebar accordion expands/collapses smoothly
5. Auto-expansion works on nested routes
6. Inline search filters and highlights correctly
7. Mobile drawer opens/closes and preserves state
8. localStorage persistence works across refreshes
9. Keyboard navigation works (Tab, Enter, Arrow keys)
10. All nested routes generate correctly

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(docs): complete expandable sidebar navigation"
```

---

## Summary

**Total Tasks:** 10
**Estimated Time:** 45-60 minutes

**Task Breakdown:**
1. Config update (5 min)
2. Content files (15 min)
3. Catch-all route (5 min)
4. Accordion component (5 min)
5. Search component (5 min)
6. Sidebar rewrite (10 min)
7. Mobile drawer (5 min)
8. Layout update (5 min)
9. Search index (5 min)
10. Final verification (5 min)

**Dependencies:**
- Task 1 → Task 2, Task 3, Task 4, Task 5
- Task 4, Task 5 → Task 6
- Task 6 → Task 7, Task 8
- Task 7, Task 8 → Task 9
- Task 9 → Task 10
