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

const COMING_SOON_TABS = new Set([
  "proposal",
  "contract",
  "escrow",
  "milestones",
  "payments",
  "files",
  "activity",
]);

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

  const { data: project } = (await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .single()) as { data: ProjectRow | null };

  if (!project) redirect(`/w/${slug}/projects`);

  const { data: dbMilestones } = (await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("chain_index", { ascending: true })) as {
    data: MilestoneRow[] | null;
  };

  const allMilestones = dbMilestones ?? [];

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

      {activeTab === "timeline" ?
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr_0.8fr]">
          {/* Left — Timeline */}
          <ProjectTimeline milestones={allMilestones} />

          {/* Center — Current Step */}
          <CurrentStep milestones={allMilestones} />

          {/* Right — Sidebar cards */}
          <div className="flex flex-col gap-5">
            <ClientCard
              clientName={project.client_name ?? "No client"}
              website={project.client_name ? `${project.client_name.toLowerCase().replace(/\s+/g, "")}.com` : "example.com"}
            />
            <ActionsCard slug={slug} projectId={id} />
            <CopilotCard />
            <SummaryCard
              createdAt={project.created_at}
              owner={project.freelancer_name ?? "Unassigned"}
            />
          </div>
        </div>
      : <div className="mt-10 rounded-[14px] border-2 border-dashed border-border bg-card p-10 text-center">
          <p className="display text-2xl uppercase text-foreground">
            {COMING_SOON_TABS.has(activeTab) ? "Panel coming soon" : "Overview"}
          </p>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            The “{activeTab}” panel for this project will render real data here.
          </p>
        </div>
      }
    </div>
  );
}
