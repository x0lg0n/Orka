"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { summaryData } from "./listMockData";

export default function InvoiceSummaryCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Invoice Summary
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-[140px] w-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full flex-1 space-y-2">
          {summaryData.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-xs text-gray-600">{item.name}</span>
              </div>
              <span className="flex-shrink-0 text-xs font-medium text-gray-900">
                {item.xlm} ({item.percentage})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
