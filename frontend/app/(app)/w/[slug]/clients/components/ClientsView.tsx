"use client";

import { useState } from "react";
import { ClientsHeader } from "./ClientsHeader";
import { ClientStats } from "./ClientStats";
import { ClientFilters } from "./ClientFilters";
import { ClientsTable } from "./ClientsTable";
import { TopClientsCard } from "./TopClientsCard";
import { ClientStatusCard } from "./ClientStatusCard";
import { RecentActivityCard } from "./RecentActivityCard";
import type { ClientSummary, ClientStatus } from "./client-types";

type Tab = "all" | ClientStatus;

export function ClientsView({
  slug,
  clients,
}: {
  slug: string;
  clients: ClientSummary[];
}) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = clients.filter((c) => {
    const name = c.name.toLowerCase();
    const contact = String(c.metadata?.contactName ?? "").toLowerCase();
    const email = (c.email ?? "").toLowerCase();
    const matchesSearch =
      !search ||
      name.includes(search.toLowerCase()) ||
      contact.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen overflow-hidden">
      <ClientsHeader slug={slug} search={search} setSearch={setSearch} />

      <ClientStats clients={clients} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — Table */}
        <div className="min-w-0">
          <ClientFilters activeTab={activeTab} setActiveTab={setActiveTab} />
          <ClientsTable clients={filtered} slug={slug} />
        </div>

        {/* Right — Sidebar */}
        <div className="flex flex-col gap-5">
          <TopClientsCard clients={clients} />
          <ClientStatusCard clients={clients} />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
}
