import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Globe,
  Building2,
  Phone,
  MapPin,
  Tag,
  Pencil,
  Briefcase,
  Clock,
} from "lucide-react";
import type { ClientDetail, ProjectSummary, ClientStatus } from "@/lib/orka";

function colorFromString(s: string): string {
  const palette = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function statusBadge(status: ClientStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "inactive":
      return "bg-gray-100 text-gray-500 border border-gray-200";
    case "lead":
      return "bg-blue-50 text-blue-600 border border-blue-200";
    case "archived":
      return "bg-gray-100 text-gray-400 border border-gray-200";
  }
}

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
  archived: "Archived",
};

function dateFmt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return dateFmt(iso);
}

const PROJECT_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

function projectStatusBadge(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "completed":
      return "bg-indigo-50 text-indigo-600 border border-indigo-200";
    case "archived":
      return "bg-gray-100 text-gray-400 border border-gray-200";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-200";
  }
}

export function ClientDetail({
  slug,
  client,
  projects,
}: {
  slug: string;
  client: ClientDetail;
  projects: ProjectSummary[];
}) {
  const meta = client.metadata ?? {};
  const contactName = (meta.contactName as string | undefined) ?? null;
  const phone = (meta.phone as string | undefined) ?? null;
  const jobTitle = (meta.jobTitle as string | undefined) ?? null;
  const website = (meta.website as string | undefined) ?? null;
  const industry = (meta.industry as string | undefined) ?? null;
  const companySize = (meta.companySize as string | undefined) ?? null;
  const description = (meta.description as string | undefined) ?? null;
  const address = [
    meta.addressLine1,
    meta.addressLine2,
    [meta.city, meta.state, meta.postalCode].filter(Boolean).join(", "),
    meta.country,
  ]
    .filter(Boolean)
    .join(", ");
  const tags = (meta.tags as string | undefined)
    ? String(meta.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link
          href={`/w/${slug}/clients`}
          className="font-medium text-gray-600 hover:text-gray-900"
        >
          Clients
        </Link>
        <span className="text-gray-300">&gt;</span>
        <span className="font-medium text-gray-900">{client.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
            style={{ backgroundColor: colorFromString(client.name) }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(client.status)}`}
              >
                {STATUS_LABEL[client.status]}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </span>
              )}
              {contactName && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {contactName}
                  {jobTitle ? ` · ${jobTitle}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`/w/${slug}/clients/${client.id}/edit`}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Pencil className="h-4 w-4" />
          Edit Client
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-6">
          {/* About */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">About</h2>
            {description ? (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {description}
              </p>
            ) : (
              <p className="mt-3 text-sm text-gray-400">No description provided.</p>
            )}

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {contactName && (
                <Detail icon={Building2} label="Primary Contact" value={contactName} />
              )}
              {phone && <Detail icon={Phone} label="Phone" value={phone} />}
              {website && (
                <Detail
                  icon={Globe}
                  label="Website"
                  value={website}
                  href={
                    website.startsWith("http")
                      ? website
                      : `https://${website}`
                  }
                />
              )}
              {industry && <Detail icon={Briefcase} label="Industry" value={industry} />}
              {companySize && (
                <Detail icon={Building2} label="Company Size" value={companySize} />
              )}
              {address && (
                <div className="sm:col-span-2">
                  <Detail icon={MapPin} label="Address" value={address} />
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Projects
              </h2>
              <span className="text-sm text-gray-400">
                {projects.length} total
              </span>
            </div>
            {projects.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
                <Briefcase className="mx-auto h-7 w-7 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  No projects linked to this client yet.
                </p>
                <Link
                  href={`/w/${slug}/projects/new`}
                  className="mt-3 inline-flex h-9 items-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  New Project
                </Link>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-3 py-2.5">Project</th>
                      <th className="px-3 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-gray-50 transition hover:bg-gray-50/50"
                      >
                        <td className="px-3 py-3">
                          <Link
                            href={`/w/${slug}/projects/${p.id}`}
                            className="font-medium text-gray-900 hover:text-[#6d5df6]"
                          >
                            {p.title}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {p.code ?? "—"}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusBadge(p.status)}`}
                          >
                            {PROJECT_STATUS_LABEL[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-500">
                          {dateFmt(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Overview</h3>
            <dl className="mt-4 flex flex-col gap-4">
              <Stat label="Total Projects" value={String(projects.length)} />
              <Stat label="Active Projects" value={String(activeProjects)} />
              <Stat label="Total Billed" value="—" />
              <Stat label="Escrow in Hold" value="—" />
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Clock className="h-4 w-4 text-gray-400" />
              Activity
            </div>
            <dl className="mt-4 flex flex-col gap-4">
              <Stat label="Created" value={dateFmt(client.created_at)} />
              <Stat label="Last seen" value={timeAgo(client.created_at)} />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 block truncate text-sm font-medium text-gray-700 hover:text-[#6d5df6]"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 truncate text-sm font-medium text-gray-700">{value}</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
