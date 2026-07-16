import { createClient } from "@supabase/supabase-js";
import { DashboardContent } from "@/components/dashboard/home/DashboardContent";
import { getDashboardData } from "@/lib/workspace/queries";
import { getActiveOrgId } from "@/lib/orka";
import { getSupabase } from "@/lib/supabase";

export default async function DashboardHomePage() {
  const supabase = getSupabase();
  const orgId = await getActiveOrgId(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!orgId || !user) {
    return (
      <DashboardContent
        data={{
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
        }}
      />
    );
  }

  const data = await getDashboardData(orgId, {
    id: user.id,
    firstName: user.user_metadata?.full_name ?? "there",
    lastName: "dashboard",
    avatar: user.user_metadata?.avatar_url,
  });

  return <DashboardContent data={data} />;
}
