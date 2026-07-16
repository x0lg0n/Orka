"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { projectStatuses } from "./mockData";
import Link from "next/link";

interface ProjectStatusChartProps {
  slug: string;
}

export default function ProjectStatusChart({ slug }: ProjectStatusChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Project Status Distribution
      </h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-[160px] w-[160px] flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={projectStatuses}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {projectStatuses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">36</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="w-full flex-1 space-y-2.5">
          {projectStatuses.map((status) => (
            <div key={status.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="truncate text-xs text-gray-600">{status.name}</span>
              </div>
              <span className="flex-shrink-0 text-xs font-medium text-gray-900">
                {status.count} ({status.percentage})
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <Link
          href={`/w/${slug}/projects`}
          className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]"
        >
          View all projects →
        </Link>
      </div>
    </div>
  );
}
