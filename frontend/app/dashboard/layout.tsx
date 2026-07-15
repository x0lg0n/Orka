import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "../../lib/supabase/server";
import { listOrgsForUser } from "../../lib/orka";
import { AppShell } from "../../components/shell/AppShell";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgs = await listOrgsForUser(supabase, user.id);
  const cookieStore = await cookies();
  const activeSlug = cookieStore.get("orka_active_org_slug")?.value ?? orgs[0]?.slug ?? "";
  const activeOrg = orgs.find((o) => o.slug === activeSlug);
  const role = activeOrg?.role ?? "member";

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const name = (profile?.full_name as string | null) ?? (user.user_metadata?.full_name as string | null) ?? "";

  return (
    <AppShell
      orgs={orgs.map((o) => ({ slug: o.slug, name: o.name }))}
      currentSlug={activeSlug}
      role={role}
      user={{ name: name || (user.email ?? ""), email: user.email ?? "" }}
    >
      {children}
    </AppShell>
  );
}
