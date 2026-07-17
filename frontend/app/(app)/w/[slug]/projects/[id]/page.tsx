import { redirect } from "next/navigation";
import { PROJECT_TABS, type ProjectTabHref } from "./components/projectTabs.config";

export default async function ProjectRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug, id } = await params;
  const { tab } = await searchParams;

  const valid = PROJECT_TABS.map((t) => t.href);
  const target = tab && (valid as string[]).includes(tab) ? tab : "overview";

  redirect(`/w/${slug}/projects/${id}/${target as ProjectTabHref}`);
}
