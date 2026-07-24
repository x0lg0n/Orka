import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getPortalProject } from "@/lib/portal";
import { PortalSidebar } from "./components/PortalSidebar";
import { PortalTopBar } from "./components/PortalTopBar";

export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectToken: string }>;
}) {
  const { projectToken } = await params;
  const project = await getPortalProject(projectToken);
  if (!project) notFound();

  return (
    <div className="flex h-dvh bg-[#F5F5F7]">
      <PortalSidebar
        token={projectToken}
        orgName={project.organization?.name ?? "ORKA"}
        clientName={project.client?.name ?? null}
        clientEmail={project.client?.email ?? null}
      />
      <div className="flex flex-1 flex-col">
        <PortalTopBar clientName={project.client?.name ?? null} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
