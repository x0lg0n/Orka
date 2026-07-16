"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ClientsHeader } from "./components/ClientsHeader";
import { ClientStats } from "./components/ClientStats";
import { ClientFilters } from "./components/ClientFilters";
import { ClientsTable } from "./components/ClientsTable";
import { TopClientsCard } from "./components/TopClientsCard";
import { ClientStatusCard } from "./components/ClientStatusCard";
import { RecentActivityCard } from "./components/RecentActivityCard";

export interface Client {
  id: string;
  name: string;
  website: string;
  email: string;
  contactName: string;
  contactEmail: string;
  activeProjects: number;
  totalBilled: number;
  escrowInHold: number;
  status: "Active" | "Inactive" | "Lead" | "Archived";
  lastActivity: string;
  logoColor: string;
  logoInitial: string;
}

const MOCK_CLIENTS: Client[] = [
  {
    id: "1",
    name: "Acme Corp",
    website: "acme.com",
    email: "sarah@acme.com",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@acme.com",
    activeProjects: 3,
    totalBilled: 850,
    escrowInHold: 450,
    status: "Active",
    lastActivity: "2 hours ago",
    logoColor: "#1a1a2e",
    logoInitial: "A",
  },
  {
    id: "2",
    name: "Google LLC",
    website: "google.com",
    email: "michael@google.com",
    contactName: "Michael Chen",
    contactEmail: "michael@google.com",
    activeProjects: 2,
    totalBilled: 650,
    escrowInHold: 250,
    status: "Active",
    lastActivity: "1 day ago",
    logoColor: "#4285f4",
    logoInitial: "G",
  },
  {
    id: "3",
    name: "Microsoft",
    website: "microsoft.com",
    email: "david@microsoft.com",
    contactName: "David Wilson",
    contactEmail: "david@microsoft.com",
    activeProjects: 1,
    totalBilled: 450,
    escrowInHold: 150,
    status: "Active",
    lastActivity: "3 days ago",
    logoColor: "#00a4ef",
    logoInitial: "M",
  },
  {
    id: "4",
    name: "Notion Labs",
    website: "notion.so",
    email: "emma@notion.so",
    contactName: "Emma Davis",
    contactEmail: "emma@notion.so",
    activeProjects: 2,
    totalBilled: 300,
    escrowInHold: 80,
    status: "Active",
    lastActivity: "5 days ago",
    logoColor: "#1a1a1a",
    logoInitial: "N",
  },
  {
    id: "5",
    name: "Airbnb",
    website: "airbnb.com",
    email: "james@airbnb.com",
    contactName: "James Brown",
    contactEmail: "james@airbnb.com",
    activeProjects: 1,
    totalBilled: 200,
    escrowInHold: 50,
    status: "Active",
    lastActivity: "1 week ago",
    logoColor: "#ff5a5f",
    logoInitial: "A",
  },
  {
    id: "6",
    name: "Linear Inc.",
    website: "linear.app",
    email: "daniel@linear.app",
    contactName: "Daniel Lee",
    contactEmail: "daniel@linear.app",
    activeProjects: 1,
    totalBilled: 150,
    escrowInHold: 0,
    status: "Inactive",
    lastActivity: "2 weeks ago",
    logoColor: "#5e6ad2",
    logoInitial: "L",
  },
  {
    id: "7",
    name: "Shopify",
    website: "shopify.com",
    email: "olivia@shopify.com",
    contactName: "Olivia Taylor",
    contactEmail: "olivia@shopify.com",
    activeProjects: 1,
    totalBilled: 100,
    escrowInHold: 0,
    status: "Inactive",
    lastActivity: "3 weeks ago",
    logoColor: "#96bf48",
    logoInitial: "S",
  },
  {
    id: "8",
    name: "Figma",
    website: "figma.com",
    email: "noah@figma.com",
    contactName: "Noah Martinez",
    contactEmail: "noah@figma.com",
    activeProjects: 0,
    totalBilled: 0,
    escrowInHold: 0,
    status: "Lead",
    lastActivity: "1 month ago",
    logoColor: "#a259ff",
    logoInitial: "F",
  },
];

export default function ClientsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">(
    "all",
  );

  const filtered = MOCK_CLIENTS.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && c.status === "Active") ||
      (activeTab === "archived" && c.status === "Archived");
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen overflow-hidden">
      <ClientsHeader slug={slug} search={search} setSearch={setSearch} />

      <ClientStats clients={MOCK_CLIENTS} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Left — Table */}
        <div className="min-w-0">
          <ClientFilters activeTab={activeTab} setActiveTab={setActiveTab} />
          <ClientsTable clients={filtered} slug={slug} />
        </div>

        {/* Right — Sidebar */}
        <div className="flex flex-col gap-5">
          <TopClientsCard clients={MOCK_CLIENTS} />
          <ClientStatusCard clients={MOCK_CLIENTS} />
          <RecentActivityCard />
        </div>
      </div>
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

type ClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  stellar_address: string | null;
  created_at: string;
};

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, stellar_address, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const rows = (clients as ClientRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Counterparties you work with across proposals, projects, and invoices."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Clients are created automatically the first time you draft a proposal with a counterparty address."
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.065] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-black uppercase text-white">
                    {c.name ?? "Unnamed"}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                    {c.email ?? c.stellar_address ?? "No contact"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
