"use client";

import { useState } from "react";
import { X, Calendar, DollarSign, FileText, Link2, StickyNote } from "lucide-react";

export function AddMilestoneModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Milestone
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Milestone Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Discovery & Research"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the deliverables for this milestone..."
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Deliverables
            </label>
            <div className="relative mt-1">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="List the specific deliverables..."
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Dependencies
            </label>
            <div className="relative mt-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={dependencies}
                onChange={(e) => setDependencies(e.target.value)}
                placeholder="e.g. Milestone 1 must be completed first"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <div className="relative mt-1">
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
          >
            Save Milestone
          </button>
        </div>
      </div>
    </div>
  );
}
