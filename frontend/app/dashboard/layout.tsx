import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "../../lib/supabase/server";
import DashboardNav from "./_components/DashboardNav";
import DashboardTopBar from "./_components/DashboardTopBar";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .limit(1)
    .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const role = (member?.role as string) ?? "member";
  const name = (profile?.full_name as string | null) ?? "";

  return (
    <div className="min-h-screen bg-[#030914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-18rem] top-[-16rem] size-[36rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-18rem] right-[-14rem] size-[38rem] rounded-full bg-violet/15 blur-3xl" />
        <div className="absolute left-1/3 top-1/4 size-[28rem] rounded-full bg-lime/8 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <aside className="z-40 border-b border-white/10 bg-[#06101f]/90 p-4 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-6">
          <DashboardNav role={role} />
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-10 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <DashboardTopBar email={user.email ?? ""} name={name} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
