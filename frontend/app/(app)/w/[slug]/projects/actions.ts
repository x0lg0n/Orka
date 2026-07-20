"use server";

import { createClient } from "@/lib/supabase/server";
import {
  listProjectsPage,
  type ProjectPage,
  type ProjectStatus,
} from "@/lib/orka";

export async function fetchProjectsPage(
  slug: string,
  opts: {
    status?: ProjectStatus | "all";
    search?: string;
    limit?: number;
    offset?: number;
  },
): Promise<ProjectPage> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      items: [],
      total: 0,
      hasMore: false,
      counts: { draft: 0, active: 0, completed: 0, archived: 0 },
    };
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!org) {
    return {
      items: [],
      total: 0,
      hasMore: false,
      counts: { draft: 0, active: 0, completed: 0, archived: 0 },
    };
  }

  const page = await listProjectsPage(supabase, org.id, opts);
  return page;
}
