"use client";

import { use } from "react";
import AnalyticsHeader from "./components/AnalyticsHeader";
import StatsCards from "./components/StatsCards";
import RevenueChart from "./components/RevenueChart";
import RevenueSources from "./components/RevenueSources";
import ProjectStatusChart from "./components/ProjectStatusChart";
import TopClientsCard from "./components/TopClientsCard";
import CashFlowChart from "./components/CashFlowChart";
import MilestoneProgress from "./components/MilestoneProgress";
import InsightsSection from "./components/InsightsSection";
import ReportsSection from "./components/ReportsSection";

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <RevenueSources />
        </div>
        <div className="lg:col-span-1">
          <ProjectStatusChart slug={slug} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TopClientsCard slug={slug} />
        </div>
        <div className="lg:col-span-1">
          <CashFlowChart />
        </div>
        <div className="lg:col-span-1">
          <MilestoneProgress />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InsightsSection />
        </div>
        <div className="lg:col-span-1">
          <ReportsSection />
        </div>
      </div>
    </div>
  );
}
