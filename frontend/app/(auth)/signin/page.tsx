import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WalletSignIn from "@/components/WalletSignIn";

export const metadata = {
  title: "Sign In · ORKA",
  description: "Sign in to ORKA.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/workspaces");

  return (
    <div>
      <h1 className="display mb-1 text-3xl uppercase">Sign in</h1>
      <p className="mb-6 text-sm font-bold text-foreground/70">
        Welcome back to ORKA.
      </p>
      <WalletSignIn />
    </div>
  );
}
