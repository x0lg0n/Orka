import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { generateActivityItems } from "./components/types";
import { ProjectActivityView } from "./components/ProjectActivityView";

type MilestoneData = {
  id: string;
  title: string | null;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  project_id: string | null;
  milestone_id: string | null;
  invoice_id: string | null;
  payment_type: "escrow" | "milestone" | "invoice" | "refund";
  amount: number;
  currency: string | null;
  status: "completed" | "pending" | "failed" | "released" | "processing" | null;
  tx_hash: string | null;
  created_at: string;
};

export default async function ProjectActivityPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("workspace_payments")
    .select("*")
    .eq("org_id", org.id)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const allMilestones = (milestones ?? []) as MilestoneData[];
  const allPayments = (payments ?? []) as PaymentRow[];

  const groups = generateActivityItems(id, allMilestones, allPayments);

  const totalActivities = allMilestones.length + allPayments.length;
  const milestoneCount = allMilestones.length;
  const paymentCount = allPayments.length;

  return (
    <ProjectActivityView
      slug={slug}
      projectId={id}
      groups={groups}
      stats={{
        totalActivities,
        totalMilestones: milestoneCount,
        totalPayments: paymentCount,
        totalFiles: 0,
        totalComments: 0,
        totalContracts: 0,
      }}
      contributors={[]}
      recentNotes={[]}
    />
  );
}
