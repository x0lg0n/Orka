import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "@/components/SignupForm";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

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
    <section>
      <AuthPageHeader
        title="Create your workspace"
        description="Bring your projects, clients, and payments into one place."
      />
      <div className="mt-8">
        <SignupForm />
      </div>
    </section>
  );
}
