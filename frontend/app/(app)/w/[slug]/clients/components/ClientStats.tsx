import { Users, FolderKanban, DollarSign, Lock } from "lucide-react";
import type { ClientSummary } from "./client-types";

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  subColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      {sub && (
        <p className={`mt-1 text-xs ${subColor ?? "text-gray-400"}`}>{sub}</p>
      )}
    </div>
  );
}

export function ClientStats({ clients }: { clients: ClientSummary[] }) {
  const totalClients = clients.length;
  const active = clients.filter((c) => c.status === "active").length;

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Users}
        iconBg="bg-violet-50"
        iconColor="text-violet-500"
        label="Total Clients"
        value={String(totalClients)}
        sub="in this workspace"
        subColor="text-gray-400"
      />
      <StatCard
        icon={FolderKanban}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        label="Active"
        value={String(active)}
        sub="active clients"
        subColor="text-gray-400"
      />
      <StatCard
        icon={DollarSign}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        label="Total Billed"
        value="—"
        sub="billing coming soon"
      />
      <StatCard
        icon={Lock}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        label="Escrow in Hold"
        value="—"
        sub="escrow coming soon"
      />
    </div>
  );
}
