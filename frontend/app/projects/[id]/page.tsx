import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import {
  addMilestone,
  fundMilestone,
  submitMilestone,
  releaseMilestone,
  refundMilestone,
  openDispute,
  resolveDispute,
  inviteMember,
} from "../../../app/actions";

export const metadata = { title: "Project · ORKA" };

const btn =
  "rounded-full border-2 border-ink px-4 py-2 text-xs font-black uppercase transition hover:-translate-y-0.5 disabled:opacity-40";

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

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <Link href="/projects" className="text-sm font-bold text-lime underline">← Back</Link>
      <h1 className="display mt-4 text-4xl uppercase">{project?.title}</h1>
      <p className="mt-1 text-sm font-bold text-white/70">{project?.description}</p>
      <p className="text-xs font-bold uppercase text-white/50">
        Client: {project?.client_name ?? "—"} · Freelancer: {project?.freelancer_name ?? "—"}
      </p>

      <p className="mt-8 rounded-[10px] border border-orange/40 bg-orange/10 px-3 py-2 text-xs font-bold text-orange">
        Demo mode: chain actions are simulated (no real Stellar). Any workspace member can act as client or freelancer.
      </p>

      {/* Invite */}
      <form action={inviteMember} className="mt-6 flex flex-wrap items-end gap-2">
        <input name="email" type="email" placeholder="invite@email.com" required
          className="min-h-10 flex-1 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <select name="role" className="min-h-10 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button className={`${btn} bg-lime`}>Invite</button>
      </form>

      {/* Add milestone */}
      <form action={addMilestone} className="mt-6 flex flex-wrap items-end gap-2">
        <input type="hidden" name="projectId" value={id} />
        <input name="title" placeholder="Milestone title" required
          className="min-h-10 flex-1 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <input name="amount" type="number" step="0.01" min="0.01" placeholder="USDC" required
          className="min-h-10 w-32 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <button className={`${btn} bg-lime`}>Add</button>
      </form>

      {/* Milestone board */}
      <div className="mt-6 flex flex-col gap-3">
        {milestones?.map((m) => (
          <div key={m.id} className="rounded-[18px] bg-white p-4 text-ink shadow-hard">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase">{m.title}</p>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">
                {m.status}
              </span>
            </div>
            <p className="text-sm font-bold text-ink/70">{m.amount} USDC</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "draft" && (
                <form action={fundMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-lime`}>Fund</button></form>
              )}
              {m.status === "funded" && (
                <form action={submitMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-violet text-white`}>Submit</button></form>
              )}
              {m.status === "in_review" && (
                <>
                  <form action={releaseMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-lime`}>Approve & Release</button></form>
                  <form action={refundMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-coral text-white`}>Refund</button></form>
                </>
              )}
              {["draft", "funded", "in_review"].includes(m.status) && (
                <form action={openDispute}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} border-coral text-coral`}>Dispute</button></form>
              )}
              {m.status === "disputed" && (
                <form action={resolveDispute} className="flex items-end gap-2">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input name="splitBp" type="number" placeholder="split bp (0-10000)" className="min-h-10 w-40 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold" />
                  <button className={`${btn} bg-teal text-white`}>Resolve</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {(!milestones || milestones.length === 0) && (
          <p className="text-sm font-bold text-white/70">No milestones yet.</p>
        )}
      </div>
    </main>
  );
}