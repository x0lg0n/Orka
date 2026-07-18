export type ClientStatus = "active" | "inactive" | "lead" | "archived";

export type ClientSummary = {
  id: string;
  name: string;
  email: string | null;
  status: ClientStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
