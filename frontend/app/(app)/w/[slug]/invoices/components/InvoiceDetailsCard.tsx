"use client";

interface InvoiceDetailsCardProps {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  project: string;
  poReference: string;
}

export default function InvoiceDetailsCard({
  invoiceNumber,
  issueDate,
  dueDate,
  project,
  poReference,
}: InvoiceDetailsCardProps) {
  const details = [
    { label: "Invoice Number", value: invoiceNumber },
    { label: "Issue Date", value: issueDate },
    { label: "Due Date", value: dueDate },
    { label: "Project", value: project },
    { label: "PO / Reference", value: poReference },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Invoice Details
      </h4>
      <div className="space-y-3">
        {details.map((detail) => (
          <div key={detail.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{detail.label}</span>
            <span className="text-sm font-medium text-gray-900">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
