import Link from "next/link";

export const metadata = {
  title: "Log in · ORKA",
  description: "Log in to ORKA.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center text-ink shadow-hard md:p-8">
        <h1 className="display text-3xl uppercase">Log in</h1>
        <p className="mt-2 text-sm font-bold text-ink/70">
          Login is coming soon. In the meantime, create a new account.
        </p>
        <Link
          href="/signup"
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          Create account
        </Link>
      </div>
    </main>
  );
}
