import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { listOrgsForUser } from "@/lib/orka";
import { WorkspaceSidebar } from "@/components/dashboard/sidebar/WorkspaceSidebar";

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
      <WorkspaceSidebar
        orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
        currentSlug={slug}
        user={{ name: name || (user.email ?? ""), email: user.email ?? "" }}
      />
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        id="main-content"
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
