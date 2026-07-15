import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Sign Up · ORKA",
  description: "Create your ORKA account.",
};

export default async function SignupPage() {
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
        <h1 className="display mb-1 text-3xl uppercase">Create your account</h1>
        <p className="mb-6 text-sm font-bold text-night/70">
          Start running projects on ORKA.
        </p>
        <SignupForm />
      </div>

      <p className="text-center text-sm font-bold text-night/70">
        Just exploring?{" "}
        <Link href="/" className="text-lime underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
