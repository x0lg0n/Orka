import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LockKeyhole,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import CreateOrgModal from "./_components/CreateOrgModal";
import { OrgGrid } from "./_components/OrgGrid";

export const metadata = { title: "Your organizations · ORKA" };

export type Org = {
  id: string;
  name: string;
  role: string;
  projects: number;
  members: number;
  currency: string;
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const [{ data: members, error }, { error: searchError }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("role, organizations(id, name, slug)")
      .eq("user_id", user.id),
    searchParams,
  ]);

  const orgs: Org[] = (
    await Promise.all(
      (members ?? []).map(async (membership) => {
        const organization = Array.isArray(membership.organizations)
          ? membership.organizations[0]
          : membership.organizations;
        if (!organization) return null;

        const [projects, membersResult, milestones] = await Promise.all([
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .eq("org_id", organization.id),
          supabase
            .from("organization_members")
            .select("user_id", { count: "exact", head: true })
            .eq("org_id", organization.id),
          supabase
            .from("milestones")
            .select("asset")
            .eq("org_id", organization.id)
            .limit(20),
        ]);
        const assets = Array.from(
          new Set(
            (milestones.data ?? [])
              .map((row) => String(row.asset ?? ""))
              .filter(Boolean),
          ),
        );

        return {
          id: organization.id,
          name: organization.name,
          role: String(membership.role ?? "member"),
          projects: projects.count ?? 0,
          members: membersResult.count ?? 0,
          currency: assets.length > 1 ? "Mixed" : assets[0] ?? "USDC",
        };
      }),
    )
  ).filter((organization): organization is Org => organization !== null);

  const name =
    (user.user_metadata?.full_name as string | null) ??
    (user.email ? user.email.split("@")[0] : "Workspace Owner");
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="dark h-dvh overflow-hidden bg-[#020713] font-product text-white">
      <div className="grid h-dvh lg:grid-cols-[264px_minmax(0,1fr)]">
        <aside className="hidden h-dvh flex-col border-r border-white/[0.08] bg-[#040914] lg:flex">
          <div className="px-[18px] pt-7">
            <Link href="/onboarding" className="flex items-center gap-3 px-2">
              <Image
                src="/Logo/LOGO.svg"
                alt="ORKA"
                width={42}
                height={42}
                className="size-11 object-contain"
                priority
              />
              <span className="text-[28px] font-extrabold tracking-[-0.03em]">ORKA</span>
            </Link>

            <nav className="mt-12 grid gap-3">
              <a href="#organizations" className="flex h-[52px] items-center gap-4 rounded-[9px] bg-primary/20 px-4 text-[15px] font-extrabold">
                <Building2 className="size-5 text-primary" aria-hidden />
                Organizations
              </a>
              <Link href="/dashboard/settings" className="flex h-[52px] items-center gap-4 rounded-[9px] px-4 text-[15px] font-extrabold text-white/90 transition hover:bg-white/[0.05]">
                <Settings className="size-5" aria-hidden />
                Settings
              </Link>
              <Link href="/dashboard/payments" className="flex h-[52px] items-center gap-4 rounded-[9px] px-4 text-[15px] font-extrabold text-white/90 transition hover:bg-white/[0.05]">
                <CreditCard className="size-5" aria-hidden />
                Billing
              </Link>
            </nav>
          </div>

          <div className="mt-auto px-6 pb-5">
            <div className="rounded-[10px] bg-primary/20 p-5">
              <Sparkles className="size-5 text-lime" aria-hidden />
              <p className="mt-5 text-base font-extrabold">Upgrade to Pro</p>
              <p className="mt-2 text-[14px] font-bold leading-6 text-white/65">
                Unlock unlimited projects, advanced analytics and priority support.
              </p>
              <Link href="/dashboard/settings" className="btn btn-primary mt-5 h-11 w-full text-sm">
                Upgrade Now
              </Link>
            </div>

            <Link href="/dashboard/settings" className="mt-5 flex items-center gap-3 rounded-[9px] bg-white/[0.045] p-3">
              <Avatar className="size-11">
                <AvatarFallback
                  style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }}
                  className="text-sm font-extrabold text-white"
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-extrabold">{name}</span>
                <span className="mt-1 block truncate text-xs font-bold text-white/40">{user.email}</span>
              </span>
              <ChevronDown className="size-4 text-white/40" aria-hidden />
            </Link>
          </div>
        </aside>

        <section className="relative h-dvh overflow-y-auto px-5 py-5 sm:px-8 lg:overflow-hidden lg:px-[34px] lg:py-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(148,116,255,0.12),transparent_28%)]" />
          <div className="relative mx-auto flex h-full max-w-[1150px] flex-col">
            <header className="flex justify-end gap-3">
              <Link href="/dashboard/settings" aria-label="Theme settings" className="btn btn-icon size-10">
                <Sun className="size-[18px]" aria-hidden />
              </Link>
              <Link href="/docs" aria-label="Help" className="btn btn-icon size-10">
                <HelpCircle className="size-[18px]" aria-hidden />
              </Link>
              <Link href="/dashboard/home" aria-label="Notifications" className="btn btn-icon relative size-10">
                <Bell className="size-[18px]" aria-hidden />
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-extrabold text-white">3</span>
              </Link>
            </header>

            <div id="organizations" className="min-h-0 flex-1 pt-8 lg:pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-[32px] font-extrabold tracking-[-0.035em] sm:text-[34px]">Your Organizations</h1>
                  <p className="mt-3 text-[15px] font-bold text-white/50 sm:text-[16px]">All the organizations / workspaces you belong to.</p>
                </div>
                <CreateOrgModal
                  trigger={<span className="btn btn-primary h-[46px] px-5 text-sm"><span className="text-lg leading-none">+</span> New organization</span>}
                />
              </div>

              {searchError ? <p className="mt-5 max-w-[420px] rounded-[9px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">{searchError}</p> : null}
              {error ? (
                <p className="mt-8 rounded-card border border-danger/35 bg-danger/10 px-5 py-4 text-sm font-bold text-red-100">Couldn&apos;t load your workspaces. Please try again.</p>
              ) : (
                <div className="mt-8">
                  <OrgGrid orgs={orgs} />
                </div>
              )}
            </div>

            <p className="flex items-center justify-center gap-2 pb-1 pt-6 text-xs font-bold text-white/35 sm:text-sm">
              <LockKeyhole className="size-4" aria-hidden />
              Your data is encrypted and secure.
              <a href="#learn-more" className="text-primary">Learn more</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
