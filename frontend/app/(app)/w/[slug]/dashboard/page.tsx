import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { DashboardContent } from "@/components/dashboard/home/DashboardContent";
import { getDashboardData } from "@/lib/workspace/queries";
import { getActiveOrgBySlug } from "@/lib/orka";

export const metadata: Metadata = {
  title: "Dashboard · ORKA",
  description: "Your ORKA workspace dashboard.",
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url!, key!, { auth: { persistSession: false } });

  const org = await getActiveOrgBySlug(supabase, slug);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!org || !user) {
    return <DashboardContent data={emptyDashboard()} slug={slug} />;
  }

  const data = await getDashboardData(org.id, slug, {
    id: user.id,
    firstName: user.user_metadata?.full_name ?? "there",
    lastName: org.name,
    avatar: user.user_metadata?.avatar_url,
  });

  return <DashboardContent data={data} slug={slug} />;
}

function emptyDashboard() {
  return {
    user: { id: "", firstName: "there", lastName: "", avatar: undefined },
    metrics: [],
    approvals: [],
    activities: [],
    milestones: [],
    projects: [],
    summary: {
      period: "This month",
      revenue: "USDC 0",
      revenueTrend: "",
      revenueUp: true,
      completedProjects: 0,
      completedTrend: "",
      completedUp: true,
      totalClients: 0,
      clientsTrend: "",
      clientsUp: true,
    },
  };
}
