"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { revenueSources } from "./mockData";

export default function RevenueSources() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Revenue by Source
      </h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="h-[160px] w-[160px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueSources}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full flex-1 space-y-2.5">
          {revenueSources.map((source) => (
            <div key={source.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <span className="truncate text-xs text-gray-600">{source.name}</span>
              </div>
              <span className="flex-shrink-0 text-xs font-medium text-gray-900">
                {source.xlm} ({source.percentage})
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-sm font-medium text-gray-500">Total</span>
        <span className="text-lg font-bold text-gray-900">2,450 XLM</span>
      </div>
    </div>
  );
}
