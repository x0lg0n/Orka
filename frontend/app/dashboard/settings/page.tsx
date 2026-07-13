import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { updateProfile } from "../../../app/actions";
import { AlertBanner, GlassPanel, PageHeader } from "../_components/DashboardUI";
import ConnectFreighter from "./_components/ConnectFreighter";

type ProfileRow = {
  id: string;
  full_name: string | null;
  stellar_address: string | null;
  custody_mode: string | null;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, stellar_address, custody_mode")
    .eq("id", user.id)
    .maybeSingle();

  const row = (profile as ProfileRow | null) ?? null;
  const { error } = await searchParams;
  const custodyMode = row?.custody_mode ?? "orka";

  return (
    <div>
      <PageHeader
        eyebrow="Workspace controls"
        title="Settings"
        description="Manage your profile, custody mode, and wallet connection for the ORKA escrow workspace."
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <GlassPanel className="p-5 sm:p-6">
        <form action={updateProfile} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-black uppercase tracking-[0.1em] text-slate-400">
              Full name
            </span>
            <input
              type="text"
              name="full_name"
              defaultValue={row?.full_name ?? ""}
              className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-black uppercase tracking-[0.1em] text-slate-400">
              Custody mode
            </span>
            <select
              name="custody_mode"
              defaultValue={row?.custody_mode ?? "orka"}
              className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold text-white outline-none transition focus:border-cyan-200/50"
            >
              <option value="orka">Orka (managed escrow)</option>
              <option value="freighter">Freighter (wallet)</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 w-fit rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-6 py-3 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
          >
            Save
          </button>
        </form>
      </GlassPanel>

      {custodyMode === "freighter" ? (
        <div className="mt-6">
          <ConnectFreighter currentAddress={row?.stellar_address ?? null} />
        </div>
      ) : (
        <GlassPanel className="mt-6 p-5 sm:p-6">
          <p className="text-sm font-bold leading-6 text-slate-400">
            Orka-managed custody is active. Switch the custody mode above to
            Freighter to connect your own wallet.
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
