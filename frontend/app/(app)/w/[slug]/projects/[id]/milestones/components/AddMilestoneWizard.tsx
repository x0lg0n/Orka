"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check } from "lucide-react";

type MilestoneData = {
  name: string;
  description: string;
  dueDate: string;
  amount: string;
  asset: string;
};

const ASSETS = ["USDC", "XLM"];

export function AddMilestoneWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (data: MilestoneData) => void | Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MilestoneData>({
    name: "",
    description: "",
    dueDate: "",
    amount: "",
    asset: "USDC",
  });

  const update = (field: keyof MilestoneData, value: string) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const isValid =
    data.name.trim().length > 0 &&
    data.amount.trim().length > 0 &&
    Number(data.amount) > 0;

  const reset = () => {
    setData({ name: "", description: "", dueDate: "", amount: "", asset: "USDC" });
  };

  const save = async () => {
    setSaving(true);
    try {
      await onComplete(data);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    await save();
    reset();
    onClose();
  };

  const handleSaveAndAddAnother = async () => {
    await save();
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/10">
              <Plus className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div>
              <DialogTitle>New Milestone</DialogTitle>
              <p className="mt-0.5 text-sm text-gray-500">
                Define a milestone for this project
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Milestone Name */}
          <div>
            <Label htmlFor="ms-name" className="text-sm font-medium text-gray-700">
              Milestone Name *
            </Label>
            <Input
              id="ms-name"
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Discovery & Research"
              className="mt-1.5"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="ms-desc" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="ms-desc"
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the deliverables, acceptance criteria, or key outcomes..."
              rows={4}
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/15"
            />
          </div>

          {/* Amount + Asset row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ms-amount" className="text-sm font-medium text-gray-700">
                Amount *
              </Label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  $
                </span>
                <Input
                  id="ms-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  placeholder="0.00"
                  className="pl-6"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ms-asset" className="text-sm font-medium text-gray-700">
                Asset
              </Label>
              <select
                id="ms-asset"
                value={data.asset}
                onChange={(e) => update("asset", e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/15"
              >
                {ASSETS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="ms-due" className="text-sm font-medium text-gray-700">
              Due Date
            </Label>
            <Input
              id="ms-due"
              type="date"
              value={data.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-5">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveAndAddAnother}
              disabled={!isValid || saving}
              variant="outline"
            >
              {saving ? "Saving..." : "Save & Add Another"}
            </Button>
            <Button
              onClick={handleSaveAndClose}
              disabled={!isValid || saving}
              className="bg-[#7c3aed] hover:bg-[#6d28d9]"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" /> Save & Close
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
