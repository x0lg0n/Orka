import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { generateActivityItems } from "./components/types";
import { ProjectActivityView } from "./components/ProjectActivityView";

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

  const { data: files } = await supabase
    .from("files")
    .select("id, name, size, created_at, uploaded_by")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, description, created_by, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const allMilestones = milestones ?? [];
  const allFiles = files ?? [];
  const allContracts = contracts ?? [];
  const allComments = comments ?? [];
  const allActivity = activity ?? [];
  const allNotes = notes ?? [];

  const actorIds = new Set<string>();
  for (const a of allActivity) if (a.actor_id) actorIds.add(a.actor_id);
  for (const f of allFiles) if (f.uploaded_by) actorIds.add(f.uploaded_by);
  for (const c of allComments) if (c.author_id) actorIds.add(c.author_id);
  for (const n of allNotes) if (n.created_by) actorIds.add(n.created_by);

  const { data: profiles } = actorIds.size > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(actorIds))
    : { data: [] };

  const allProfiles = profiles ?? [];

  const groups = generateActivityItems(
    id,
    allMilestones,
    allFiles,
    allContracts,
    allComments,
    allActivity,
    allNotes,
    allProfiles
  );

  const totalActivities =
    allMilestones.length +
    allFiles.length +
    allContracts.length +
    allComments.length +
    allActivity.length +
    allNotes.length;

  const milestoneCount = allMilestones.length;

  const paymentCount = allActivity.filter(
    (a) => a.type === "payment_released" || a.type === "payment"
  ).length;

  const fileCount = allFiles.length;
  const commentCount = allComments.length;
  const contractCount = allContracts.length;

  const contributorMap = new Map<string, number>();
  for (const a of allActivity) {
    if (a.actor_id) {
      contributorMap.set(a.actor_id, (contributorMap.get(a.actor_id) ?? 0) + 1);
    }
  }
  for (const f of allFiles) {
    if (f.uploaded_by) {
      contributorMap.set(
        f.uploaded_by,
        (contributorMap.get(f.uploaded_by) ?? 0) + 1
      );
    }
  }
  for (const c of allComments) {
    if (c.author_id) {
      contributorMap.set(
        c.author_id,
        (contributorMap.get(c.author_id) ?? 0) + 1
      );
    }
  }
  for (const n of allNotes) {
    if (n.created_by) {
      contributorMap.set(
        n.created_by,
        (contributorMap.get(n.created_by) ?? 0) + 1
      );
    }
  }

  const contributors = Array.from(contributorMap.entries())
    .map(([id, count]) => ({
      name: allProfiles.find((p) => p.id === id)?.full_name ?? "System",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentNotes = allNotes.slice(0, 3).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    created_by_name: allProfiles.find((p) => p.id === n.created_by)?.full_name ?? null,
    created_at: n.created_at,
  }));

  return (
    <ProjectActivityView
      slug={slug}
      projectId={id}
      groups={groups}
      stats={{
        totalActivities,
        totalMilestones: milestoneCount,
        totalPayments: paymentCount,
        totalFiles: fileCount,
        totalComments: commentCount,
        totalContracts: contractCount,
      }}
      contributors={contributors}
      recentNotes={recentNotes}
    />
  );
}
