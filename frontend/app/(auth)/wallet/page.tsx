import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WalletSignIn from "@/components/WalletSignIn";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

export const metadata = {
  title: "Continue with Wallet · ORKA",
  description: "Sign in to ORKA with your Stellar wallet.",
};

export default async function WalletLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/workspaces");

  return (
    <section>
      <AuthPageHeader
        title="Continue with wallet"
        description="Your Stellar wallet is your ORKA account. Sign once to securely continue."
      />
      <div className="mt-8">
        <WalletSignIn />
      </div>
    </section>
  );
}
