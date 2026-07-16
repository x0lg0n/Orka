"use client";

import { DollarSign, Lock, CheckCircle, Folder, Calculator } from "lucide-react";
import { statCards } from "./mockData";

const iconMap = {
  dollar: DollarSign,
  lock: Lock,
  check: CheckCircle,
  folder: Folder,
  calculator: Calculator,
};

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statCards.map((card) => {
        const Icon = iconMap[card.icon as keyof typeof iconMap];
        return (
          <div
            key={card.title}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {card.title}
              </span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="text-sm font-medium text-emerald-600">
                {card.change}
              </span>
              <span className="text-xs text-gray-400">{card.changeValue}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
