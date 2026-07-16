import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectHeader } from "./components/ProjectHeader";
import { SummaryCards } from "./components/SummaryCards";
import { ProjectTabs } from "./components/ProjectTabs";
import { ProjectTimeline } from "./components/ProjectTimeline";
import { CurrentStep } from "./components/CurrentStep";
import { ClientCard } from "./components/ClientCard";
import { ActionsCard } from "./components/ActionsCard";
import { CopilotCard } from "./components/CopilotCard";
import { SummaryCard } from "./components/SummaryCard";

type MilestoneRow = {
  id: string;
  title: string | null;
  amount: number | null;
  status: string;
  chain_index: number | null;
};

type ProjectRow = {
  id: string;
  title: string | null;
  description: string | null;
  client_name: string | null;
  freelancer_name: string | null;
  contract_id: string | null;
  status: string | null;
  created_at: string;
};

const MOCK_PROJECTS: Record<string, ProjectRow> = {
  "1": {
    id: "1",
    title: "Nike Website Redesign",
    description: "Complete redesign of Nike's corporate website with modern UI/UX.",
    client_name: "Nike Inc.",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-07-14T00:00:00Z",
  },
  "2": {
    id: "2",
    title: "Mobile App Development",
    description: "Cross-platform mobile app for iOS and Android.",
    client_name: "Acme Corp",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-07-10T00:00:00Z",
  },
  "3": {
    id: "3",
    title: "E-commerce Platform",
    description: "Full-featured e-commerce platform with payment integration.",
    client_name: "TechStart Inc.",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: "0xabc123",
    status: "completed",
    created_at: "2025-05-01T00:00:00Z",
  },
  "4": {
    id: "4",
    title: "Brand Identity Design",
    description: "Complete brand identity including logo, colors, and guidelines.",
    client_name: "DesignHub",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-07-05T00:00:00Z",
  },
  "5": {
    id: "5",
    title: "Marketing Campaign",
    description: "Digital marketing campaign across social media channels.",
    client_name: "GrowthLabs",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-06-20T00:00:00Z",
  },
  "6": {
    id: "6",
    title: "SaaS Dashboard",
    description: "Analytics dashboard for SaaS metrics and reporting.",
    client_name: "StartupXYZ",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: "0xdef456",
    status: "completed",
    created_at: "2025-04-15T00:00:00Z",
  },
  "7": {
    id: "7",
    title: "Learning Platform",
    description: "Online learning platform with course management and quizzes.",
    client_name: "EduTech Co.",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-06-28T00:00:00Z",
  },
  "8": {
    id: "8",
    title: "Data Analytics Tool",
    description: "Business intelligence tool for data visualization and reporting.",
    client_name: "DataViz Inc.",
    freelancer_name: "Siddhartha Kunwar",
    contract_id: null,
    status: "active",
    created_at: "2025-06-15T00:00:00Z",
  },
};

const MOCK_MILESTONES: Record<string, MilestoneRow[]> = {
  "1": [
    { id: "m1", title: "Research & Planning", amount: 100, status: "released", chain_index: 0 },
    { id: "m2", title: "Homepage Design", amount: 150, status: "in_review", chain_index: 1 },
    { id: "m3", title: "Inner Pages Design", amount: 150, status: "draft", chain_index: 2 },
    { id: "m4", title: "Final Development", amount: 200, status: "draft", chain_index: 3 },
  ],
  "2": [
    { id: "m5", title: "UI/UX Design", amount: 80, status: "released", chain_index: 0 },
    { id: "m6", title: "Frontend Development", amount: 120, status: "funded", chain_index: 1 },
    { id: "m7", title: "Backend Integration", amount: 100, status: "draft", chain_index: 2 },
    { id: "m8", title: "Testing & Launch", amount: 50, status: "draft", chain_index: 3 },
  ],
  "3": [
    { id: "m9", title: "Wireframes", amount: 50, status: "released", chain_index: 0 },
    { id: "m10", title: "Design System", amount: 100, status: "released", chain_index: 1 },
    { id: "m11", title: "Frontend Build", amount: 200, status: "released", chain_index: 2 },
    { id: "m12", title: "Backend & Payments", amount: 150, status: "released", chain_index: 3 },
    { id: "m13", title: "QA & Deployment", amount: 100, status: "released", chain_index: 4 },
  ],
};

const MOCK_CLIENT_WEBSITES: Record<string, string> = {
  "Nike Inc.": "nike.com",
  "Acme Corp": "acme.com",
  "TechStart Inc.": "techstart.io",
  "DesignHub": "designhub.co",
  "GrowthLabs": "growthlabs.com",
  "StartupXYZ": "startupxyz.io",
  "EduTech Co.": "edutech.com",
  "DataViz Inc.": "dataviz.io",
};

export const metadata = { title: "Project · ORKA" };

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug, id } = await params;
  const { tab } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  // Try real DB first, fall back to mock data
  const { data: dbProject } = (await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .single()) as { data: ProjectRow | null };

  const project = dbProject ?? MOCK_PROJECTS[id] ?? null;
  if (!project) redirect(`/w/${slug}/projects`);

  // Try real milestones first, fall back to mock
  const { data: dbMilestones } = (await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("chain_index", { ascending: true })) as {
    data: MilestoneRow[] | null;
  };

  const allMilestones =
    dbMilestones && dbMilestones.length > 0
      ? dbMilestones
      : MOCK_MILESTONES[id] ?? [];

  const completedCount = allMilestones.filter(
    (m) => m.status === "approved" || m.status === "released",
  ).length;
  const totalBudget = allMilestones.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0,
  );
  const lockedAmount = allMilestones
    .filter((m) => m.status === "funded" || m.status === "in_review")
    .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const progressPct =
    allMilestones.length > 0
      ? Math.round((completedCount / allMilestones.length) * 100)
      : 0;

  const activeTab = tab ?? "timeline";
  const clientWebsite =
    MOCK_CLIENT_WEBSITES[project.client_name ?? ""] ?? "example.com";

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-500">
        <Link
          href={`/w/${slug}/projects`}
          className="font-medium text-gray-600 hover:text-gray-900"
        >
          Projects
        </Link>
        <span className="text-gray-300">&gt;</span>
        <span className="font-medium text-gray-900">
          {project.title ?? "Untitled"}
        </span>
      </nav>

      <ProjectHeader
        slug={slug}
        projectId={id}
        title={project.title ?? "Untitled"}
        status={project.status ?? "active"}
      />

      <SummaryCards
        clientName={project.client_name ?? "No client"}
        progressPct={progressPct}
        lockedAmount={lockedAmount}
        totalBudget={totalBudget}
      />

      <ProjectTabs slug={slug} projectId={id} active={activeTab} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr_0.8fr]">
        {/* Left — Timeline */}
        <ProjectTimeline milestones={allMilestones} />

        {/* Center — Current Step */}
        <CurrentStep milestones={allMilestones} />

        {/* Right — Sidebar cards */}
        <div className="flex flex-col gap-5">
          <ClientCard
            clientName={project.client_name ?? "No client"}
            website={clientWebsite}
          />
          <ActionsCard slug={slug} projectId={id} />
          <CopilotCard />
          <SummaryCard
            createdAt={project.created_at}
            owner={project.freelancer_name ?? "Unassigned"}
          />
        </div>
      </div>
    </div>
  );
}
