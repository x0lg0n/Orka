"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  funded: "#22c55e",
  released: "#3b82f6",
  pending: "#f97316",
  refunded: "#9ca3af",
};

function LegendItem({
  color,
  label,
  amount,
  asset,
}: {
  color: string;
  label: string;
  amount: number;
  asset: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">
        {amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} {asset}
      </span>
    </div>
  );
}

export function EscrowOverviewCard({
  fundedAmount,
  releasedAmount,
  pendingAmount,
  refundedAmount,
  totalBudget,
  asset,
  escrowFundedPct,
  slug,
  contractAddress,
  escrowStatus,
}: {
  fundedAmount: number;
  releasedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  totalBudget: number;
  asset: string;
  escrowFundedPct?: number;
  slug: string;
  contractAddress?: string | null;
  escrowStatus?: string | null;
}) {
  const data = [
    { name: "Funded", value: fundedAmount },
    { name: "Released", value: releasedAmount },
    { name: "Pending", value: pendingAmount },
    { name: "Refunded", value: refundedAmount },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Escrow &amp; Payment Overview
        </h3>
        <Link
          href={`/w/${slug}/projects/escrow`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View Details
        </Link>
      </div>

      {(contractAddress || escrowStatus) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {escrowStatus && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                escrowStatus === "deployed"
                  ? "bg-blue-50 text-blue-600"
                  : escrowStatus === "funded"
                    ? "bg-green-50 text-green-600"
                    : escrowStatus === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {escrowStatus}
            </span>
          )}
          {contractAddress && (
            <a
              href={`https://stellar.expert/explorer/public/contract/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-gray-500 hover:text-[#7c3aed] hover:underline"
            >
              {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}
            </a>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-32 w-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      COLORS[entry.name.toLowerCase() as keyof typeof COLORS]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-gray-900">
              {totalBudget.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              {asset}
            </span>
            <span className="text-[10px] text-gray-400">Escrow Funded</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <LegendItem
            color={COLORS.funded}
            label="Funded"
            amount={fundedAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.released}
            label="Released"
            amount={releasedAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.pending}
            label="Pending"
            amount={pendingAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.refunded}
            label="Refunded"
            amount={refundedAmount}
            asset={asset}
          />
        </div>
      </div>
    </div>
  );
}
