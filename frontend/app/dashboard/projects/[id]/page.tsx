import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getActiveOrgId } from "../../../../lib/orka";
import {
  fundMilestone,
  submitMilestone,
  approveMilestone,
  releaseMilestone,
} from "../../../../app/actions";
import FreighterMilestoneButton from "../../_components/FreighterMilestoneButton";

const STATUS_PILL: Record<string, string> = {
  draft: "bg-one text-ink",
  funded: "bg-violet text-white",
  in_review: "bg-orange text-ink",
  approved: "bg-lime text-ink",
  released: "bg-teal text-white",
  refunded: "bg-coral text-white",
  disputed: "bg-orange text-ink",
};

const btn =
  "rounded-full border-2 border-ink px-4 py-2 text-xs font-black uppercase transition hover:-translate-y-0.5 disabled:opacity-40";

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
};

export const metadata = { title: "Project · ORKA" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  if (!(await getActiveOrgId(supabase))) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("custody_mode")
    .eq("id", user.id)
    .maybeSingle();
  const freighterMode = profile?.custody_mode === "freighter";

  const { data: project } = (await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()) as { data: ProjectRow | null };

  const { data: milestones } = (await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("chain_index", { ascending: true })) as {
    data: MilestoneRow[] | null;
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link
        href="/dashboard/projects"
        className="text-sm font-bold text-lime underline"
      >
        ← Back
      </Link>
      <h1 className="display mt-4 text-4xl uppercase">{project?.title ?? "Untitled"}</h1>
      <p className="mt-1 text-sm font-bold text-white/70">{project?.description ?? ""}</p>
      <p className="text-xs font-bold uppercase text-white/50">
        Client: {project?.client_name ?? "—"} · Freelancer:{" "}
        {project?.freelancer_name ?? "—"}
      </p>

      <p className="mt-8 rounded-[10px] border border-orange/40 bg-orange/10 px-3 py-2 text-xs font-bold text-orange">
        Demo mode: chain actions are simulated (no real Stellar). Any workspace member can act as client or freelancer.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {milestones?.map((m) => (
          <div
            key={m.id}
            className="rounded-[18px] bg-white p-4 text-ink shadow-hard"
          >
            <div className="flex items-center justify-between">
              <p className="font-black uppercase">{m.title}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                  STATUS_PILL[m.status] ?? "bg-one text-ink"
                }`}
              >
                {m.status}
              </span>
            </div>
            <p className="text-sm font-bold text-ink/70">{m.amount} USDC</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "draft" &&
                (freighterMode ? (
                  project?.contract_id ? (
                    <FreighterMilestoneButton
                      contractId={project.contract_id}
                      milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                      milestoneId={m.chain_index ?? 0}
                      dbId={m.id}
                      eventType="fund"
                      label="Fund"
                    />
                  ) : (
                    <span className={`${btn} bg-lime opacity-40`}>
                      No contract
                    </span>
                  )
                ) : (
                  <form action={fundMilestone}>
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <button className={`${btn} bg-lime`}>Fund</button>
                  </form>
                ))}
              {m.status === "funded" && (
                <form action={submitMilestone}>
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button className={`${btn} bg-violet text-white`}>Submit work</button>
                </form>
              )}
              {m.status === "in_review" && (
                <form action={approveMilestone}>
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button className={`${btn} bg-lime`}>Approve</button>
                </form>
              )}
              {m.status === "approved" &&
                (freighterMode ? (
                  project?.contract_id ? (
                    <FreighterMilestoneButton
                      contractId={project.contract_id}
                      milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                      milestoneId={m.chain_index ?? 0}
                      dbId={m.id}
                      eventType="release"
                      label="Release"
                    />
                  ) : (
                    <span className={`${btn} bg-teal text-white opacity-40`}>
                      No contract
                    </span>
                  )
                ) : (
                  <form action={releaseMilestone}>
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <button className={`${btn} bg-teal text-white`}>Release</button>
                  </form>
                ))}
            </div>
          </div>
        ))}
        {(!milestones || milestones.length === 0) && (
          <p className="text-sm font-bold text-white/70">No milestones yet.</p>
        )}
      </div>
    </div>
  );
}
