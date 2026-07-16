import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WalletSignIn from "@/components/WalletSignIn";

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
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Image
          src="/Logo/LOGO.svg"
          alt="ORKA"
          width={36}
          height={36}
          className="size-9 object-contain"
        />
        <span className="display text-3xl">ORKA</span>
      </div>

      <div>
        <h1 className="display mb-1 text-3xl uppercase">Continue with Wallet</h1>
        <p className="mb-6 text-sm font-bold text-foreground/70">
          Your wallet is your ORKA account. Sign once and you&apos;re in.
        </p>
        <WalletSignIn />
      </div>
    </div>
  );
}
