import Link from "next/link";

export const metadata = {
  title: "Log in · ORKA",
  description: "Log in to ORKA.",
};

export default function LoginPage() {
  return (
    <div className="text-center">
      <h1 className="display text-3xl uppercase">Log in</h1>
      <p className="mt-2 text-sm font-bold text-night/70">
        Login is coming soon. In the meantime, create a new account.
      </p>
      <Link
        href="/signup"
        className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-night bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
      >
        Create account
      </Link>
    </div>
  );
}
