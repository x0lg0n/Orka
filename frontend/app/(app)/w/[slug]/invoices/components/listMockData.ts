export type InvoiceStatus = "paid" | "partial" | "sent" | "draft" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  poNumber: string;
  client: string;
  clientInitial: string;
  clientColor: string;
  project: string;
  amount: number;
  amountUsd: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
}

export interface ActivityItem {
  id: string;
  icon: "payment" | "partial" | "sent" | "overdue";
  title: string;
  description: string;
  timestamp: string;
}

export const statusColors: Record<InvoiceStatus, { bg: string; text: string }> = {
  paid: { bg: "bg-emerald-50", text: "text-emerald-700" },
  partial: { bg: "bg-amber-50", text: "text-amber-700" },
  sent: { bg: "bg-blue-50", text: "text-blue-700" },
  draft: { bg: "bg-gray-100", text: "text-gray-600" },
  overdue: { bg: "bg-rose-50", text: "text-rose-700" },
};

export const mockInvoices: Invoice[] = [
  { id: "inv-001", number: "INV-2025-0007", poNumber: "PO-88472", client: "Acme Corp", clientInitial: "A", clientColor: "bg-gray-800", project: "Website Redesign", amount: 450, amountUsd: 256.30, status: "paid", issueDate: "May 28, 2025", dueDate: "May 30, 2025", paidDate: "Paid on May 30" },
  { id: "inv-002", number: "INV-2025-0006", poNumber: "PO-88471", client: "Google LLC", clientInitial: "G", clientColor: "bg-blue-500", project: "SEO Optimization", amount: 250, amountUsd: 142.15, status: "partial", issueDate: "May 25, 2025", dueDate: "May 28, 2025" },
  { id: "inv-003", number: "INV-2025-0005", poNumber: "PO-88470", client: "Microsoft", clientInitial: "M", clientColor: "bg-green-500", project: "UI/UX Design", amount: 650, amountUsd: 369.45, status: "sent", issueDate: "May 24, 2025", dueDate: "May 31, 2025" },
  { id: "inv-004", number: "INV-2025-0004", poNumber: "PO-88469", client: "Airbnb", clientInitial: "A", clientColor: "bg-rose-500", project: "Mobile App Dev", amount: 300, amountUsd: 170.58, status: "overdue", issueDate: "May 18, 2025", dueDate: "May 25, 2025" },
  { id: "inv-005", number: "INV-2025-0003", poNumber: "PO-88468", client: "Notion Labs", clientInitial: "N", clientColor: "bg-gray-800", project: "Dashboard Design", amount: 200, amountUsd: 113.72, status: "draft", issueDate: "May 15, 2025", dueDate: "—" },
  { id: "inv-006", number: "INV-2025-0002", poNumber: "PO-88467", client: "Shopify", clientInitial: "S", clientColor: "bg-green-600", project: "E-commerce Dev", amount: 500, amountUsd: 284.30, status: "paid", issueDate: "May 12, 2025", dueDate: "May 15, 2025", paidDate: "Paid on May 14" },
  { id: "inv-007", number: "INV-2025-0001", poNumber: "PO-88466", client: "Linear Inc.", clientInitial: "L", clientColor: "bg-violet-500", project: "Brand Identity", amount: 100, amountUsd: 56.86, status: "paid", issueDate: "May 10, 2025", dueDate: "May 12, 2025", paidDate: "Paid on May 11" },
  { id: "inv-008", number: "INV-2025-0000", poNumber: "PO-88465", client: "Slack", clientInitial: "S", clientColor: "bg-purple-500", project: "Marketing Site", amount: 150, amountUsd: 85.29, status: "sent", issueDate: "May 8, 2025", dueDate: "May 22, 2025" },
];

export const mockActivity: ActivityItem[] = [
  { id: "a1", icon: "payment", title: "Payment received", description: "INV-2025-0007 paid", timestamp: "2 hours ago" },
  { id: "a2", icon: "partial", title: "Payment partial", description: "INV-2025-0006", timestamp: "5 hours ago" },
  { id: "a3", icon: "sent", title: "Invoice sent", description: "INV-2025-0005 sent to Microsoft", timestamp: "1 day ago" },
  { id: "a4", icon: "overdue", title: "Invoice overdue", description: "INV-2025-0004 is overdue", timestamp: "2 days ago" },
];

export const summaryData = [
  { name: "Paid", value: 70, color: "#16a34a", xlm: "1,720 XLM", percentage: "70%" },
  { name: "Partial", value: 12, color: "#f59e0b", xlm: "300 XLM", percentage: "12%" },
  { name: "Sent", value: 16, color: "#2563eb", xlm: "400 XLM", percentage: "16%" },
  { name: "Overdue", value: 2, color: "#ef4444", xlm: "120 XLM", percentage: "2%" },
  { name: "Draft", value: 4, color: "#9ca3af", xlm: "80 XLM", percentage: "4%" },
];
