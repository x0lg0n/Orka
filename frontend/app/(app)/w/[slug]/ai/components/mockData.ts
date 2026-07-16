export interface QuickAction {
  title: string;
  description: string;
  icon: string;
}

export interface Conversation {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
}

export interface Insight {
  title: string;
  description: string;
  action: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface PopularPrompt {
  text: string;
}

export const quickActions: QuickAction[] = [
  { title: "Generate Proposal", description: "Create a professional proposal in seconds", icon: "file-text" },
  { title: "Summarize Document", description: "Get key insights from long documents", icon: "file-search" },
  { title: "Analyze Project", description: "Identify risks, delays and opportunities", icon: "bar-chart" },
  { title: "Draft Invoice", description: "Generate invoice based on milestones", icon: "receipt" },
  { title: "Market Research", description: "Research competitors and market trends", icon: "globe" },
];

export const recentConversations: Conversation[] = [
  { id: "c1", title: "Proposal for Mobile App Development", subtitle: "Create a proposal for building a cross-platform mobile app for an e-commerce startup...", timestamp: "2 hours ago", icon: "file-text" },
  { id: "c2", title: "Summarize Contract – Acme Website", subtitle: "Summarize the key terms and obligations from this contract...", timestamp: "5 hours ago", icon: "file-search" },
  { id: "c3", title: "Project Risk Analysis", subtitle: "Analyze the potential risks in the 'Nike Website Redesign' project...", timestamp: "1 day ago", icon: "bar-chart" },
  { id: "c4", title: "Invoice for Milestone 2", subtitle: "Generate invoice for Milestone 2 – Homepage Design...", timestamp: "2 days ago", icon: "receipt" },
];

export const insights: Insight[] = [
  {
    title: "Revenue Opportunity",
    description: "You can increase revenue by 28% by focusing on Web Development services.",
    action: "View details",
    icon: "trending-up",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Pending Approvals",
    description: "3 milestones are waiting for client approval.",
    action: "Take action",
    icon: "clock",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Cash Flow Alert",
    description: "You have 2 large payments expected in the next 7 days.",
    action: "View forecast",
    icon: "dollar-sign",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Client Satisfaction",
    description: "Acme Corp gave 5⭐ feedback on the 'Brand Identity Design' project.",
    action: "See feedback",
    icon: "star",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
];

export const popularPrompts: PopularPrompt[] = [
  { text: "Generate a project proposal" },
  { text: "Summarize project status" },
  { text: "Create invoice for milestone" },
  { text: "Analyze project risks" },
  { text: "Forecast cash flow" },
  { text: "Write professional email" },
];

export const promptChips: string[] = [
  "Write a proposal for a SaaS product",
  "What are the risks in my active projects?",
  "Summarize this contract",
  "Create an invoice for completed milestones",
];
