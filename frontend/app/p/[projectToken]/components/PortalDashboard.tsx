import { Calendar, DollarSign, TrendingUp, Wallet, CheckCircle2, Clock, ArrowUpCircle, FileText, FileSignature, Upload, MessageSquare } from "lucide-react";
import type { PortalProject, PortalMilestone } from "@/lib/portal";

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

function fmtAmount(amount: number | null, currency = "USD") {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

function fmtShortAmount(amount: number | null, asset: string) {
  if (amount === null || amount === undefined) return "—";
  const n = amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return `${n} ${asset}`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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

function milestoneStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-600";
    case "funded":
      return "bg-emerald-50 text-emerald-600";
    case "in_review":
      return "bg-blue-50 text-blue-600";
    case "released":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function milestoneStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Upcoming";
    case "funded":
      return "Funded";
    case "in_review":
      return "In Review";
    case "released":
      return "Completed";
    default:
      return status;
  }
}

function activityIcon(type: string) {
  switch (type) {
    case "milestone_completed":
      return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "payment_released":
      return { icon: ArrowUpCircle, color: "text-blue-500", bg: "bg-blue-50" };
    case "proposal_accepted":
      return { icon: FileText, color: "text-purple-500", bg: "bg-purple-50" };
    case "contract_signed":
      return { icon: FileSignature, color: "text-indigo-500", bg: "bg-indigo-50" };
    case "files_uploaded":
      return { icon: Upload, color: "text-amber-500", bg: "bg-amber-50" };
    case "client_commented":
      return { icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-50" };
    default:
      return { icon: CheckCircle2, color: "text-gray-400", bg: "bg-gray-50" };
  }
}

function activityTitle(type: string) {
  switch (type) {
    case "milestone_completed":
      return "Milestone completed";
    case "payment_released":
      return "Payment released";
    case "proposal_accepted":
      return "Proposal accepted";
    case "contract_signed":
      return "Contract signed by both parties";
    case "files_uploaded":
      return "Files uploaded";
    case "client_commented":
      return "Client commented";
    default:
      return type.replace(/_/g, " ");
  }
}

export function PortalDashboard({
  project,
  token,
}: {
  project: PortalProject;
  token: string;
}) {
  const milestones = project.milestones ?? [];
  const invoices = project.invoices ?? [];

  const totalAmount = milestones.reduce((sum, m) => sum + (m.amount ?? 0), 0);
  const releasedAmount = milestones
    .filter((m) => m.status === "released")
    .reduce((sum, m) => sum + (m.amount ?? 0), 0);
  const pendingAmount = totalAmount - releasedAmount;
  const releasedCount = milestones.filter((m) => m.status === "released").length;
  const progressPct = milestones.length > 0
    ? Math.round((releasedCount / milestones.length) * 100)
    : 0;
  const asset = milestones[0]?.asset ?? "XLM";
  const isCompleted = project.status === "completed";
  const isActive = project.status === "active";
  const activeMilestones = milestones.filter((m) => m.status === "funded" || m.status === "in_review");
  const upcomingMilestones = milestones.filter((m) => m.status === "draft");

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-[#6C4DFF]"
          label="Active Projects"
          value={isActive || (!isCompleted && project.status !== "archived") ? "1" : "0"}
          sub={project.title ?? ""}
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          label="Total Paid"
          value={fmtShortAmount(releasedAmount, asset)}
          sub={`${releasedCount} milestones completed`}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Pending Payments"
          value={fmtShortAmount(pendingAmount, asset)}
          sub={`${activeMilestones.length + upcomingMilestones.length} milestones remaining`}
        />
        <StatCard
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Completed Projects"
          value={isCompleted ? "1" : "0"}
          sub={isCompleted ? "All milestones delivered" : "In progress"}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — wider */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Progress Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              {project.title ?? "Your Project"}
            </h3>
            <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
              <span>{project.organization?.name ?? "ORKA"}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(project.status)}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusLabel(project.status)}
              </span>
            </div>

            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-900">{progressPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-[#6C4DFF] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {releasedCount} of {milestones.length} milestones completed
            </p>

            {project.description && (
              <p className="mt-4 text-sm text-gray-500">{project.description}</p>
            )}
          </div>

          {/* Milestone Timeline Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Milestones & Payments</h3>
              {milestones.length > 0 && (
                <span className="text-sm text-gray-400">
                  Total: {fmtShortAmount(totalAmount, asset)}
                </span>
              )}
            </div>

            {milestones.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No milestones yet
              </div>
            ) : (
              <div className="relative space-y-0">
                {milestones.map((m, idx) => {
                  const isLast = idx === milestones.length - 1;
                  const isCompleted = m.status === "released";
                  const isActive = m.status === "funded" || m.status === "in_review";
                  return (
                    <div key={m.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {!isLast && (
                        <div
                          className={`absolute left-[15px] top-8 w-0.5 ${isCompleted ? "bg-emerald-200" : "bg-gray-200"}`}
                          style={{ height: "calc(100% - 32px)" }}
                        />
                      )}
                      <div
                        className={`relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-600"
                            : isActive
                              ? "bg-purple-100 text-[#6C4DFF]"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${isCompleted ? "text-gray-900" : isActive ? "text-gray-900" : "text-gray-500"}`}>
                            {m.title ?? `Milestone ${idx + 1}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isCompleted ? "text-gray-900" : "text-gray-500"}`}>
                              {fmtShortAmount(m.amount, m.asset || asset)}
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${milestoneStatusBadge(m.status)}`}>
                              {milestoneStatusLabel(m.status)}
                            </span>
                          </div>
                        </div>
                        {m.chain_index !== null && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Milestone #{m.chain_index}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Files Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Files & Deliverables</h3>
            <div className="py-8 text-center text-sm text-gray-400">
              No files shared yet
            </div>
          </div>
        </div>

        {/* Right column — narrower */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contract Value</span>
                <span className="font-medium text-gray-900">
                  {fmtShortAmount(totalAmount, asset)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Paid
                </span>
                <span className="font-medium text-emerald-600">
                  {fmtShortAmount(releasedAmount, asset)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  Pending
                </span>
                <span className="font-medium text-amber-600">
                  {fmtShortAmount(pendingAmount, asset)}
                </span>
              </div>
              {upcomingMilestones.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Next Payment</span>
                  <span className="font-medium text-gray-900">
                    {fmtShortAmount(upcomingMilestones[0]?.amount ?? null, asset)}
                  </span>
                </div>
              )}
            </div>
            {project.contract_address && totalAmount > 0 && (
              <button className="mt-5 w-full rounded-xl bg-[#6C4DFF] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5a3de0]">
                Make a Payment
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex flex-col gap-0.5">
              <a
                href={`/p/${token}?nav=messages`}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <MessageSquare className="h-4 w-4 text-gray-400" />
                Send Message
              </a>
              <a
                href={`/p/${token}?nav=invoices`}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                View Invoices
              </a>
              <a
                href={`/p/${token}?nav=files`}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <Upload className="h-4 w-4 text-gray-400" />
                Upload Files
              </a>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Recent Activity</h3>
            {invoices.length === 0 && milestones.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No activity yet
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {milestones
                  .filter((m) => m.status === "released")
                  .slice(0, 3)
                  .map((m) => (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Milestone completed
                        </p>
                        <p className="text-xs text-gray-400">
                          {m.title ?? `Milestone`}
                        </p>
                      </div>
                    </div>
                  ))}
                {invoices.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Invoice created
                      </p>
                      <p className="text-xs text-gray-400">
                        {inv.invoice_number ?? "Invoice"} · {fmtAmount(inv.amount, inv.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
