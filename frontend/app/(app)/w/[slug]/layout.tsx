import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { listOrgsForUser } from "@/lib/orka";
import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgs = await listOrgsForUser(supabase, user.id);
  const activeOrg = orgs.find((o) => o.slug === slug);
  if (!activeOrg) redirect("/workspaces");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  const name =
    (profile?.full_name as string | null) ??
    (user.user_metadata?.full_name as string | null) ??
    "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">
      <DashboardSidebar
        slug={slug}
        workspace={{ name: activeOrg.name, role: activeOrg.role }}
        user={{ name: name || (user.email ?? ""), email: user.email ?? "" }}
      />
      <main
        className="flex-1 overflow-y-auto"
        id="main-content"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
