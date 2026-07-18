export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft" | "cancelled";

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  gstNumber: string;
  email: string;
  phone: string;
}

export interface ClientInfo {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface InvoiceItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface HistoryEvent {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  icon: "payment" | "viewed" | "sent" | "created" | "reminder";
  badge?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  amount?: string;
  completed: boolean;
}

export interface RelatedDocument {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "fig" | "doc";
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  createdAt: string;
  dueDate: string;
  project: string;
  poReference: string;
  amount: number;
  amountUsd: number;
  currency: string;
  taxRate: number;
  company: CompanyInfo;
  client: ClientInfo;
  items: InvoiceItem[];
  notes: string;
  history: HistoryEvent[];
  paymentTimeline: TimelineEvent[];
  transactionHash: string | null;
  documents: RelatedDocument[];
}

export const mockInvoice: InvoiceDetail = {
  id: "inv-001",
  invoiceNumber: "INV-2025-0007",
  status: "paid",
  createdAt: "May 28, 2025",
  dueDate: "Jun 12, 2025",
  project: "Website Redesign",
  poReference: "PO-88472",
  amount: 450,
  amountUsd: 256.3,
  currency: "XLM",
  taxRate: 0,
  company: {
    name: "Acme Studio",
    address: "123 Creator Street",
    city: "Bangalore, KA 560001, India",
    gstNumber: "29ABCDE1234F1Z5",
    email: "hello@acme.com",
    phone: "+91 98765 43210",
  },
  client: {
    name: "Acme Corp",
    contactPerson: "John Smith",
    email: "john.smith@acmecorp.com",
    phone: "+1 (415) 987-6543",
  },
  items: [
    { description: "Milestone 1: Discovery & Planning", qty: 1, rate: 100, amount: 100 },
    { description: "Milestone 2: Design & Prototyping", qty: 1, rate: 150, amount: 150 },
    { description: "Milestone 3: Development", qty: 1, rate: 150, amount: 150 },
    { description: "Milestone 4: Testing & Deployment", qty: 1, rate: 50, amount: 50 },
  ],
  notes: "Thank you for your business! If you have any questions, feel free to reach out.",
  history: [
    { id: "h1", action: "Payment of 450 XLM received", description: "Payment received in full", timestamp: "May 30, 2025, 10:24 AM", icon: "payment", badge: "Received" },
    { id: "h2", action: "Invoice viewed by client", description: "Opened by john.smith@acmecorp.com", timestamp: "May 29, 2025, 04:32 PM", icon: "viewed" },
    { id: "h3", action: "Invoice sent to client", description: "Sent to john.smith@acmecorp.com", timestamp: "May 28, 2025, 09:15 AM", icon: "sent" },
    { id: "h4", action: "Invoice created", description: "Auto-generated from milestone release", timestamp: "May 28, 2025, 09:10 AM", icon: "created" },
  ],
  paymentTimeline: [
    { id: "pt1", title: "Invoice Created", timestamp: "May 28, 2025, 09:10 AM", completed: true },
    { id: "pt2", title: "Sent to Client", timestamp: "May 28, 2025, 09:15 AM", completed: true },
    { id: "pt3", title: "Viewed by Client", timestamp: "May 29, 2025, 04:32 PM", completed: true },
    { id: "pt4", title: "Payment Received", timestamp: "May 30, 2025, 10:24 AM", amount: "450 XLM", completed: true },
    { id: "pt5", title: "Marked as Paid", timestamp: "May 30, 2025, 10:24 AM", completed: false },
  ],
  transactionHash: "0x8a7f...9c3d2e",
  documents: [
    { id: "d1", name: "Contract.pdf", size: "2.4 MB", type: "pdf" },
  ],
};

export const mockInvoiceList = [
  { id: "inv-001", number: "INV-2025-0007", client: "Acme Corp", project: "Website Redesign", amount: 450, currency: "XLM", status: "paid" as InvoiceStatus, date: "May 28, 2025", dueDate: "Jun 12, 2025" },
  { id: "inv-002", number: "INV-2025-0008", client: "TechStart Inc", project: "Mobile App", amount: 1200, currency: "XLM", status: "pending" as InvoiceStatus, date: "Jun 01, 2025", dueDate: "Jun 15, 2025" },
  { id: "inv-003", number: "INV-2025-0009", client: "DesignHub", project: "Brand Identity", amount: 850, currency: "XLM", status: "overdue" as InvoiceStatus, date: "May 15, 2025", dueDate: "May 30, 2025" },
  { id: "inv-004", number: "INV-2025-0010", client: "CloudNine Ltd", project: "SaaS Dashboard", amount: 320, currency: "XLM", status: "draft" as InvoiceStatus, date: "Jun 05, 2025", dueDate: "Jun 20, 2025" },
  { id: "inv-005", number: "INV-2025-0011", client: "Acme Corp", project: "E-commerce Platform", amount: 680, currency: "XLM", status: "paid" as InvoiceStatus, date: "May 20, 2025", dueDate: "Jun 03, 2025" },
];
