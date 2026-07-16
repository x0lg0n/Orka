export interface Client {
  id: string;
  name: string;
  website: string;
  email: string;
  contactName: string;
  contactEmail: string;
  activeProjects: number;
  totalBilled: number;
  escrowInHold: number;
  status: "Active" | "Inactive" | "Lead" | "Archived";
  lastActivity: string;
  logoColor: string;
  logoInitial: string;
}
