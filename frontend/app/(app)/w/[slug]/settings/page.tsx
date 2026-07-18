import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import SettingsPageClient from "./components/SettingsPageClient";

export const metadata = { title: "Settings · ORKA" };

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  return (
    <SettingsPageClient
      workspace={{
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo_url: (org as { logo_url?: string | null }).logo_url ?? null,
      }}
    />
  );
}
