import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { updateProfile } from "../../../app/actions";

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

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="display mb-6 text-3xl uppercase">Settings</h1>

      {error && (
        <p className="mb-5 rounded-2xl bg-orange/20 px-4 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
        <form action={updateProfile} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-black uppercase text-ink/70">
              Full name
            </span>
            <input
              type="text"
              name="full_name"
              defaultValue={row?.full_name ?? ""}
              className="rounded-2xl border-2 border-ink/10 px-4 py-2 text-sm font-bold text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-black uppercase text-ink/70">
              Custody mode
            </span>
            <select
              name="custody_mode"
              defaultValue={row?.custody_mode ?? "orka"}
              className="rounded-2xl border-2 border-ink/10 px-4 py-2 text-sm font-bold text-ink outline-none focus:border-ink"
            >
              <option value="orka">Orka (managed escrow)</option>
              <option value="freighter">Freighter (wallet)</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-2 w-fit rounded-full bg-orange px-6 py-2 text-sm font-black uppercase text-ink shadow-hard transition hover:-translate-y-0.5"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
