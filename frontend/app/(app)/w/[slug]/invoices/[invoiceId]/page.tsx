import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import InvoiceHeader from "../components/InvoiceHeader";
import CompanyCard from "../components/CompanyCard";
import BillingCard from "../components/BillingCard";
import InvoiceDetailsCard from "../components/InvoiceDetailsCard";
import InvoiceItemsTable from "../components/InvoiceItemsTable";
import NotesCard from "../components/NotesCard";
import InvoiceHistory from "../components/InvoiceHistory";
import PaymentStatusCard from "../components/PaymentStatusCard";
import PaymentTimeline from "../components/PaymentTimeline";
import RelatedDocuments from "../components/RelatedDocuments";
import { mockInvoice } from "../components/mockData";

export const metadata = { title: "Invoice · ORKA" };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string; invoiceId: string }>;
}) {
  const { slug, invoiceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, currency, status, project_id, created_at, issued_at")
    .eq("org_id", org.id)
    .eq("id", invoiceId)
    .single();

  const invoiceData = invoice
    ? {
        ...mockInvoice,
        id: invoice.id,
        invoiceNumber: invoice.invoice_number || mockInvoice.invoiceNumber,
        status: invoice.status as "paid" | "pending" | "overdue" | "draft" | "cancelled",
        amount: Number(invoice.amount),
        currency: invoice.currency || "XLM",
        createdAt: invoice.issued_at
          ? new Date(invoice.issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : mockInvoice.createdAt,
      }
    : mockInvoice;

  return (
    <div className="space-y-6">
      <InvoiceHeader
        slug={slug}
        invoiceNumber={invoiceData.invoiceNumber}
        status={invoiceData.status}
        createdAt={invoiceData.createdAt}
        dueDate={invoiceData.dueDate}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CompanyCard
            company={invoiceData.company}
            amount={invoiceData.amount}
            amountUsd={invoiceData.amountUsd}
            currency={invoiceData.currency}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BillingCard client={invoiceData.client} />
            <InvoiceDetailsCard
              invoiceNumber={invoiceData.invoiceNumber}
              issueDate={invoiceData.createdAt}
              dueDate={invoiceData.dueDate}
              project={invoiceData.project}
              poReference={invoiceData.poReference}
            />
          </div>

          <InvoiceItemsTable
            items={invoiceData.items}
            taxRate={invoiceData.taxRate}
            currency={invoiceData.currency}
          />

          <NotesCard notes={invoiceData.notes} />

          <InvoiceHistory history={invoiceData.history} />
        </div>

        <div className="space-y-6">
          <PaymentStatusCard invoice={invoiceData} />
          <PaymentTimeline timeline={invoiceData.paymentTimeline} />
          <RelatedDocuments documents={invoiceData.documents} />
        </div>
      </div>
    </div>
  );
}
