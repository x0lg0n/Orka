"use client";

import { useState, useMemo } from "react";
import { use } from "react";
import PaymentsHeader from "./components/PaymentsHeader";
import PaymentStats from "./components/PaymentStats";
import PaymentFilters from "./components/PaymentFilters";
import PaymentsTable from "./components/PaymentsTable";
import PaymentsOverviewCard from "./components/PaymentsOverviewCard";
import EscrowSummaryCard from "./components/EscrowSummaryCard";
import RecentActivityCard from "./components/RecentActivityCard";
import PaymentInsights from "./components/PaymentInsights";
import {
  mockPayments,
  type PaymentType,
  type PaymentStatus,
} from "./components/mockData";

export default function PaymentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentType | "All">("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">(
    "All"
  );
  const [dateRange, setDateRange] = useState("all");

  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      if (
        searchQuery &&
        !payment.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !payment.project.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (activeTab !== "All" && payment.type !== activeTab) return false;
      if (projectFilter !== "All" && payment.project !== projectFilter)
        return false;
      if (statusFilter !== "All" && payment.status !== statusFilter)
        return false;
      return true;
    });
  }, [searchQuery, activeTab, projectFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <PaymentsHeader
        slug={slug}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <PaymentStats />
      <PaymentFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PaymentsTable payments={filteredPayments} />
        </div>
        <div className="space-y-6">
          <PaymentsOverviewCard />
          <EscrowSummaryCard />
          <RecentActivityCard />
        </div>
      </div>
      <PaymentInsights />
    </div>
  );
}
