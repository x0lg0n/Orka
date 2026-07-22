import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthPageHeader from "@/components/auth/AuthPageHeader";
import SignInForm from "@/components/SignInForm";

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
    <section>
      <AuthPageHeader
        title="Welcome back"
        description="Use your email or Stellar wallet to return to your ORKA workspace."
      />
      <div className="mt-8">
        <SignInForm />
      </div>
    </section>
  );
}
