import Link from "next/link";
import { Sparkles, FolderKanban, Users, CircleDollarSign } from "lucide-react";

interface WorkspaceHealthProps {
  totalProjects: number;
  completedProjects: number;
  totalClients: number;
  inEscrow: string;
  slug: string;
}

export function WorkspaceHealth({
  totalProjects,
  completedProjects,
  totalClients,
  inEscrow,
  slug,
}: WorkspaceHealthProps) {
  const completionRate =
    totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const stats = [
    { label: "Projects", value: String(totalProjects), href: `/w/${slug}/projects`, icon: FolderKanban },
    { label: "Clients", value: String(totalClients), href: `/w/${slug}/clients`, icon: Users },
    { label: "In Escrow", value: inEscrow, href: `/w/${slug}/payments`, icon: CircleDollarSign },
  ];

  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#7c3aed]" />
        <h2 className="text-base font-bold text-[#11182d]">Workspace Health</h2>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-[#5f6b86]">
            Completion rate
          </span>
          <span className="text-sm font-bold text-[#11182d]">
            {completionRate}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e5e8f0]">
          <div
            className="h-full rounded-full bg-[#7c3aed] transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-[#8b95aa]">
          {completedProjects} of {totalProjects} projects completed
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="flex flex-col gap-2 rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:border-[#7c3aed] hover:bg-[#f7f8fc]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#11182d]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#8b95aa]">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
