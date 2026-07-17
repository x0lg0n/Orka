import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PersonalSettingsClient from "./components/PersonalSettingsClient";

export const metadata = { title: "Personal Settings · ORKA" };

export default async function PersonalSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, stellar_address")
    .eq("id", user.id)
    .maybeSingle();

  const { data: wallets } = await supabase
    .from("wallets")
    .select("id, address, wallet_type, network, is_primary, alias")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false });

  return (
    <PersonalSettingsClient
      profile={{
        id: user.id,
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        stellar_address: profile?.stellar_address ?? null,
      }}
      wallets={wallets ?? []}
    />
  );
}
