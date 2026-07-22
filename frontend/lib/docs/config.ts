export interface DocSection {
  title: string;
  items: DocItem[];
}

export interface DocItem {
  title: string;
  slug: string;
  icon?: string;
  description?: string;
  children?: DocItem[];
}

export interface DocMeta {
  title: string;
  description: string;
  category: string;
  order: number;
  icon?: string;
}

export const docsNavigation: DocSection[] = [
  {
    title: "GETTING STARTED",
    items: [
      {
        title: "Getting Started",
        slug: "getting-started",
        icon: "rocket",
        description: "Set up your account and learn the basics.",
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
        description: "Create and manage your team workspace.",
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
        description: "Manage client work, milestones, files, and payments.",
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
        description: "Create, send, and track proposals with AI.",
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
        description: "Generate contracts and collect signatures.",
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
        description: "Break projects into trackable milestones.",
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
        description: "Secure payments with automated releases.",
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
        description: "Track transactions and Stellar payments.",
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
        description: "Generate invoices and get paid faster.",
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
        description: "Manage clients and the client portal.",
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
        description: "Connect your Stellar wallet with Freighter.",
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
        description: "Developer resources and API reference.",
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
        description: "Encryption, permissions, and best practices.",
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
        description: "Frequently asked questions.",
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
