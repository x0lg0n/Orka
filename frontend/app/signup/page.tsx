import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SignupForm from "../../components/SignupForm";

export const metadata = {
  title: "Sign up · ORKA",
  description: "Create your ORKA account.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-ink px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
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

        <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
          <h1 className="display mb-1 text-3xl uppercase">Create your account</h1>
          <p className="mb-6 text-sm font-bold text-ink/70">
            Start running projects on ORKA.
          </p>
          <SignupForm />
        </div>

        <p className="text-center text-sm font-bold text-white/70">
          Just exploring?{" "}
          <Link href="/" className="text-lime underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
