import { createClient } from "@/lib/supabase/server";

export type PortalMilestone = {
  id: string;
  title: string | null;
  amount: number | null;
  asset: string;
  status: string;
  chain_index: number | null;
};

export type PortalInvoice = {
  id: string;
  invoice_number: string | null;
  amount: number | null;
  currency: string;
  status: string;
  issued_at: string | null;
};

export type PortalProposal = {
  id: string;
  status: string;
  asset: string;
  contract_id: string | null;
  milestones: Array<{ amount: number; description: string }> | null;
};

export type PortalProject = {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  contract_id: string | null;
  created_at: string;
  organization: { name: string | null } | null;
  client: { name: string | null } | null;
  milestones: PortalMilestone[];
  invoices: PortalInvoice[];
  proposals: PortalProposal[];
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a public, read-only project view by its share token.
 * Returns null for a missing, invalid, or expired token.
 *
 * Reads go through the `get_portal_project` SECURITY DEFINER RPC (granted to
 * the anon role), so no service-role key is used and org-membership RLS does
 * not apply. The SQL lives in `supabase/portal.sql` and must be applied to
 * the database.
 */
export async function getPortalProject(
  token: string,
): Promise<PortalProject | null> {
  if (!UUID_RE.test(token)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_portal_project", {
    p_token: token,
  });

  if (error || !data) return null;
  return data as PortalProject;
}
