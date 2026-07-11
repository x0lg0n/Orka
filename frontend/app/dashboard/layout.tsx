import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import DashboardNav from "./_components/DashboardNav";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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

  const role = (member?.role as string) ?? "member";

  return (
    <div className="flex min-h-screen bg-ink text-white">
      <aside className="w-64 shrink-0 border-r border-white/10 p-6">
        <div className="rounded-[28px] bg-white p-5 text-ink shadow-hard">
          <DashboardNav role={role} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
