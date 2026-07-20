"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { updateClientAction } from "@/app/actions";
import type { ClientDetail, ClientStatus } from "@/lib/orka";
import {
  ArrowLeft,
  UploadCloud,
  ChevronDown,
  Check,
  User,
  Briefcase,
  MapPin,
  Info,
  Sparkles,
  Clock,
} from "lucide-react";

const ACCENT = "#6d5df6";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#6d5df6] focus:outline-none focus:ring-2 focus:ring-[#6d5df6]/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-10 items-center gap-2 rounded-lg px-5 text-sm font-medium text-white shadow-sm transition disabled:opacity-60"
      style={{ backgroundColor: ACCENT }}
    >
      {pending ? "Saving…" : "Save Changes"}
    </button>
  );
}

const COLLAPSIBLE = [
  { id: "billing", label: "Billing Address", icon: MapPin },
  { id: "additional", label: "Additional Information", icon: Info },
] as const;

export function EditClientForm({
  slug,
  orgId,
  clientId,
  client,
}: {
  slug: string;
  orgId: string;
  clientId: string;
  client: ClientDetail;
}) {
  const meta = (client.metadata ?? {}) as Record<string, unknown>;
  const billing = (meta.billing as Record<string, unknown> | undefined) ?? {};
  const tags = Array.isArray(meta.tags)
    ? (meta.tags as string[]).join(", ")
    : typeof meta.tags === "string"
      ? (meta.tags as string)
      : "";

  const [open, setOpen] = useState<Record<string, boolean>>({
    billing: Boolean(
      billing.addressLine1 ||
        billing.addressLine2 ||
        billing.city ||
        billing.state ||
        billing.postalCode ||
        billing.country,
    ),
    additional: Boolean(
      meta.notes || tags || meta.preferredCurrency || meta.paymentTerms,
    ),
  });
  const [logoName, setLogoName] = useState<string | null>(null);

  return (
    <form action={updateClientAction} className="min-h-screen pb-28">
      <input type="hidden" name="orgId" value={orgId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="clientId" value={clientId} />

      {/* Breadcrumb + title */}
      <div className="mb-6">
        <nav className="flex items-center gap-1.5 text-sm text-gray-400">
          <Link href={`/w/${slug}/clients`} className="hover:text-gray-600">
            Clients
          </Link>
          <span>/</span>
          <Link href={`/w/${slug}/clients/${clientId}`} className="hover:text-gray-600">
            {client.name}
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-700">Edit</span>
        </nav>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Edit Client</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the details for {client.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form column */}
        <div className="flex flex-col gap-6">
          {/* Section 1: Client Information */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Client Information
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              The basics about this client.
            </p>

            {/* Logo uploader (UI only for now) */}
            <div className="mb-5">
              <span className="mb-1.5 block text-sm font-medium text-gray-700">
                Company Logo
              </span>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-8 text-center transition hover:border-[#6d5df6]/40 hover:bg-gray-50">
                <UploadCloud className="h-7 w-7 text-gray-300" />
                <span className="text-sm font-medium text-gray-600">
                  {logoName ?? "Drag & drop a logo, or click to browse"}
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG or SVG up to 2MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Client Name" required>
                <input
                  name="name"
                  required
                  defaultValue={client.name}
                  className={inputCls}
                  placeholder="Acme Corporation"
                />
              </Field>
              <Field label="Email Address">
                <input
                  name="email"
                  type="email"
                  defaultValue={client.email ?? ""}
                  className={inputCls}
                  placeholder="hello@acme.com"
                />
              </Field>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Client Type">
                <div className="relative">
                  <select
                    name="clientType"
                    defaultValue={String(meta.clientType ?? "company")}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    name="status"
                    defaultValue={client.status}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lead">Lead</option>
                    <option value="archived">Archived</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Short Description">
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={String(meta.description ?? "")}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#6d5df6] focus:outline-none focus:ring-2 focus:ring-[#6d5df6]/20"
                  placeholder="Brief description of the client…"
                />
              </Field>
            </div>
          </section>

          {/* Section 2: Primary Contact */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Primary Contact
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              Who we reach out to at this client.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <input
                  name="contactName"
                  defaultValue={String(meta.contactName ?? "")}
                  className={inputCls}
                  placeholder="Sarah Johnson"
                />
              </Field>
              <Field label="Email Address">
                <input
                  name="contactEmail"
                  type="email"
                  defaultValue={String(meta.contactEmail ?? "")}
                  className={inputCls}
                  placeholder="sarah@acme.com"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  name="phone"
                  defaultValue={String(meta.phone ?? "")}
                  className={inputCls}
                  placeholder="+1 (555) 000-0000"
                />
              </Field>
              <Field label="Job Title">
                <input
                  name="jobTitle"
                  defaultValue={String(meta.jobTitle ?? "")}
                  className={inputCls}
                  placeholder="Procurement Manager"
                />
              </Field>
            </div>
          </section>

          {/* Section 3: Company Details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Company Details
            </h2>
            <p className="mb-5 text-sm text-gray-400">
              Public and structural information.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Company Website">
                <input
                  name="website"
                  defaultValue={String(meta.website ?? "")}
                  className={inputCls}
                  placeholder="acme.com"
                />
              </Field>
              <Field label="Industry">
                <input
                  name="industry"
                  defaultValue={String(meta.industry ?? "")}
                  className={inputCls}
                  placeholder="Software"
                />
              </Field>
              <Field label="Company Size">
                <div className="relative">
                  <select
                    name="companySize"
                    defaultValue={String(meta.companySize ?? "")}
                    className={`${inputCls} appearance-none pr-10`}
                  >
                    <option value="">Select size…</option>
                    <option value="1-10">1–10</option>
                    <option value="11-50">11–50</option>
                    <option value="51-200">51–200</option>
                    <option value="201-500">201–500</option>
                    <option value="500+">500+</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </Field>
              <Field label="Tax ID / GST" hint="Optional">
                <input
                  name="taxId"
                  defaultValue={String(meta.taxId ?? "")}
                  className={inputCls}
                  placeholder="GST123456789"
                />
              </Field>
            </div>
          </section>

          {/* Collapsible sections */}
          {COLLAPSIBLE.map(({ id, label, icon: Icon }) => (
            <section
              key={id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Icon className="h-4 w-4 text-gray-400" />
                  {label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition ${open[id] ? "rotate-180" : ""}`}
                />
              </button>
              {open[id] && (
                <div className="border-t border-gray-100 px-6 py-5">
                  {id === "billing" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Address Line 1">
                        <input
                          name="addressLine1"
                          defaultValue={String(billing.addressLine1 ?? "")}
                          className={inputCls}
                          placeholder="123 Market St"
                        />
                      </Field>
                      <Field label="Address Line 2">
                        <input
                          name="addressLine2"
                          defaultValue={String(billing.addressLine2 ?? "")}
                          className={inputCls}
                          placeholder="Suite 400"
                        />
                      </Field>
                      <Field label="City">
                        <input
                          name="city"
                          defaultValue={String(billing.city ?? "")}
                          className={inputCls}
                          placeholder="San Francisco"
                        />
                      </Field>
                      <Field label="State">
                        <input
                          name="state"
                          defaultValue={String(billing.state ?? "")}
                          className={inputCls}
                          placeholder="CA"
                        />
                      </Field>
                      <Field label="Postal Code">
                        <input
                          name="postalCode"
                          defaultValue={String(billing.postalCode ?? "")}
                          className={inputCls}
                          placeholder="94103"
                        />
                      </Field>
                      <Field label="Country">
                        <input
                          name="country"
                          defaultValue={String(billing.country ?? "")}
                          className={inputCls}
                          placeholder="United States"
                        />
                      </Field>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Notes">
                        <textarea
                          name="notes"
                          rows={3}
                          defaultValue={String(meta.notes ?? "")}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#6d5df6] focus:outline-none focus:ring-2 focus:ring-[#6d5df6]/20"
                          placeholder="Internal notes…"
                        />
                      </Field>
                      <Field label="Internal Tags" hint="Comma-separated">
                        <input
                          name="tags"
                          defaultValue={tags}
                          className={inputCls}
                          placeholder="vip, retainer"
                        />
                      </Field>
                      <Field label="Preferred Currency">
                        <div className="relative">
                          <select
                            name="preferredCurrency"
                            defaultValue={String(meta.preferredCurrency ?? "")}
                            className={`${inputCls} appearance-none pr-10`}
                          >
                            <option value="">Select…</option>
                            <option value="XLM">XLM</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </Field>
                      <Field label="Payment Terms">
                        <div className="relative">
                          <select
                            name="paymentTerms"
                            defaultValue={String(meta.paymentTerms ?? "")}
                            className={`${inputCls} appearance-none pr-10`}
                          >
                            <option value="">Select…</option>
                            <option value="net15">Net 15</option>
                            <option value="net30">Net 30</option>
                            <option value="net60">Net 60</option>
                            <option value="due_on_receipt">Due on receipt</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        </div>
                      </Field>
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Quick Tips */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Sparkles className="h-4 w-4" style={{ color: ACCENT }} />
              Quick Tips
            </div>
            <ul className="mt-4 flex flex-col gap-3">
              {[
                "Changes save instantly on submit",
                "Used in proposals and contracts",
                "Linked to escrow payments",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#dcfce7" }}
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Setup Progress */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Clock className="h-4 w-4 text-gray-400" />
              Setup Progress
            </div>
            <ol className="mt-4 flex flex-col gap-4">
              {[
                { icon: User, label: "Client Information", done: true },
                { icon: MapPin, label: "Billing & Address", done: Boolean(open.billing) },
                { icon: Info, label: "Additional Details", done: Boolean(open.additional) },
              ].map(({ icon: Icon, label, done }, i) => (
                <li key={label} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      done
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className={done ? "text-sm text-gray-500" : "text-sm text-gray-700"}>
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <Link
            href={`/w/${slug}/clients/${clientId}`}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <SubmitButton />
          </div>
        </div>
      </div>
    </form>
  );
}
