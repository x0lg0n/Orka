"use client";

import { paymentTypeData } from "./mockData";

export default function PaymentsOverviewCard() {
  const total = paymentTypeData.reduce((sum, d) => sum + d.value, 0);
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const segments = paymentTypeData.reduce<
    Array<{ type: string; value: number; color: string; offset: number }>
  >((acc, segment, index) => {
    const percentage = segment.value / total;
    const prevOffset = index === 0 ? 0 : acc[index - 1].offset;
    return [
      ...acc,
      { ...segment, offset: prevOffset + percentage * circumference },
    ];
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Payments Overview
      </h3>
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {segments.map((segment) => {
            const percentage = segment.value / total;
            const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
            return (
              <circle
                key={segment.type}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-segment.offset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
          <text
            x="80"
            y="75"
            textAnchor="middle"
            className="fill-gray-900 text-lg font-bold"
          >
            {total.toLocaleString()}
          </text>
          <text
            x="80"
            y="95"
            textAnchor="middle"
            className="fill-gray-500 text-xs"
          >
            XLM Total
          </text>
        </svg>
      </div>
      <div className="mt-4 space-y-2">
        {paymentTypeData.map((segment) => (
          <div key={segment.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600">{segment.type}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {segment.value.toLocaleString()} XLM
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
