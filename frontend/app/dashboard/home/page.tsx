import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import SignOutButton from "../../../components/SignOutButton";

export const metadata = {
  title: "Dashboard · ORKA",
  description: "Your ORKA workspace.",
};

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, custody_mode, stellar_address")
    .eq("id", user.id)
    .single();

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .limit(1)
    .maybeSingle();

  const role = (member?.role as string) ?? "member";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="display text-3xl">ORKA</span>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
        <h1 className="display mb-1 text-3xl uppercase">Your dashboard</h1>
        <p className="mb-6 text-sm font-bold text-ink/70">
          This page is session-protected (middleware redirects to /signup when
          signed out). Use it to verify the auth flow end-to-end.
        </p>
        <dl className="flex flex-col gap-3 text-sm font-bold">
          <Row label="Email" value={user.email ?? "—"} />
          <Row
            label="Email confirmed"
            value={user.email_confirmed_at ? "Yes" : "No — check your inbox"}
          />
          <Row label="Full name" value={profile?.full_name ?? "—"} />
          <Row label="Role" value={role} />
          <Row label="Custody mode" value={profile?.custody_mode ?? "—"} />
          <Row label="Stellar address" value={profile?.stellar_address ?? "—"} />
          <Row label="User ID" value={user.id} />
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/projects"
            className="rounded-full bg-lime px-5 py-2 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
          >
            Projects
          </Link>
          <Link
            href="/invoices"
            className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone"
          >
            Invoices
          </Link>
          <Link
            href="/onboarding"
            className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone"
          >
            New workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col border-b border-ink/10 pb-2 sm:flex-row sm:items-center sm:justify-between">
      <dt className="uppercase text-ink/60">{label}</dt>
      <dd className="break-all text-ink">{value}</dd>
    </div>
  );
}
