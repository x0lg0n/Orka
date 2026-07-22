import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { listOrgsForUser } from "@/lib/orka";
import { WorkspaceSidebar } from "./components/sidebar/WorkspaceSidebar";
import { WorkspaceMobileNav } from "./components/sidebar/WorkspaceMobileNav";

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
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  const name =
    (profile?.full_name as string | null) ??
    (user.user_metadata?.full_name as string | null) ??
    (user.email ?? "");

  return (
    <div className="flex h-dvh overflow-hidden bg-surfaceMuted">
      <WorkspaceSidebar
        orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
        currentSlug={slug}
        user={{
          name: name || (user.email ?? ""),
          email: user.email ?? "",
          avatarUrl: (profile?.avatar_url as string | null) ?? undefined,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceMobileNav currentSlug={slug} workspaceName={activeOrg.name} />
        <main
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          id="main-content"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
