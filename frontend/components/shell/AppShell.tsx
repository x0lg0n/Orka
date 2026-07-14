import type { ReactNode } from "react";
import { Sidebar, type ShellUser } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({
  orgs,
  role,
  user,
  children,
}: {
  orgs: { id: string; name: string }[];
  role: string;
  user: ShellUser;
  children: ReactNode;
}) {
  return (
    <div className="product-ui min-h-screen bg-shell font-product text-white">
      <MobileNav orgs={orgs} role={role} user={user} />
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="hidden lg:block">
          <Sidebar orgs={orgs} role={role} user={user} />
        </div>
        <main className="min-w-0 flex-1 px-4 pb-10 sm:px-6 lg:px-8 lg:py-6" id="main-content">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
