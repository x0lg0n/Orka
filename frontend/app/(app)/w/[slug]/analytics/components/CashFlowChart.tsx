"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cashFlowData } from "./mockData";

export default function CashFlowChart() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Cash Flow</h3>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">1,430 XLM</span>
          <span className="text-sm font-medium text-emerald-600">
            ↑ 15.3%
          </span>
          <span className="text-xs text-gray-400">vs Apr 1 – Apr 30</span>
        </div>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cashFlowData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name) => [
                `${value} XLM`,
                name === "inflow" ? "Inflow" : "Outflow",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "inflow" ? "Inflow" : "Outflow"
              }
            />
            <Bar
              dataKey="inflow"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="outflow"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
          View detailed cash flow →
        </button>
      </div>
    </div>
  );
}
