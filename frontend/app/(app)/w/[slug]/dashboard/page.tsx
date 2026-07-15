import type { Metadata } from "next";
import { DashboardContent } from "@/components/dashboard/home/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard · ORKA",
  description: "Your ORKA workspace dashboard.",
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <DashboardContent slug={slug} />;
}
