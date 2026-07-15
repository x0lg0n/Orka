import type { MetricData } from "@/types/dashboard";
import { MetricCard } from "./MetricCard";

interface MetricCardsProps {
  metrics: MetricData[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}
