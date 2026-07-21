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
    <div>
      <h1 className="display mb-1 text-3xl uppercase">Create your account</h1>
      <p className="mb-6 text-sm font-bold text-foreground/70">
        Start running projects on ORKA.
      </p>
      <SignupForm />
    </div>
  );
}
