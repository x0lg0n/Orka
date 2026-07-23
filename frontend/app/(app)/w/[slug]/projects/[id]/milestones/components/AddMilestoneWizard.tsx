"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

type MilestoneData = {
  name: string;
  description: string;
  dueDate: string;
  amount: string;
  asset: string;
};

const STEPS = ["Basic Info", "Payment Details", "Review & Confirm"];

export function AddMilestoneWizard({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (data: MilestoneData) => void | Promise<void>;
}) {
  const [step, setStep] = useState(0);
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

  const reset = () => {
    setStep(0);
    setData({ name: "", description: "", dueDate: "", amount: "", asset: "USDC" });
  };

  const canNext =
    (step === 0 && data.name.trim().length > 0) ||
    (step === 1 && data.amount.trim().length > 0 && Number(data.amount) > 0) ||
    step === 2;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onComplete(data);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    await handleSave();
    reset();
    onClose();
  };

  const handleAddAnother = async () => {
    await handleSave();
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
          <DialogTitle>Add Milestone</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  i < step
                    ? "bg-[#7c3aed] text-white"
                    : i === step
                      ? "bg-[#7c3aed]/10 text-[#7c3aed] ring-2 ring-[#7c3aed]"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 ${i < step ? "bg-[#7c3aed]" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[200px]">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="ms-name">Milestone Name *</Label>
                <Input
                  id="ms-name"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Discovery & Research"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ms-desc">Description</Label>
                <textarea
                  id="ms-desc"
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe the deliverables for this milestone..."
                  rows={3}
                  className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
              <div>
                <Label htmlFor="ms-due">Due Date</Label>
                <Input
                  id="ms-due"
                  type="date"
                  value={data.dueDate}
                  onChange={(e) => update("dueDate", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="ms-amount">Amount *</Label>
                <Input
                  id="ms-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ms-asset">Asset</Label>
                <select
                  id="ms-asset"
                  value={data.asset}
                  onChange={(e) => update("asset", e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                >
                  <option value="USDC">USDC</option>
                  <option value="XLM">XLM</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Name</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.name || "—"}
                </span>
              </div>
              {data.description && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Description</span>
                  <span className="max-w-[60%] text-right text-sm text-gray-900">
                    {data.description}
                  </span>
                </div>
              )}
              {data.dueDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.dueDate}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(data.amount).toLocaleString()} {data.asset}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex w-full items-center justify-between">
            <Button
              variant="outline"
              onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            >
              {step > 0 ? (
                <>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </>
              ) : (
                "Cancel"
              )}
            </Button>
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canNext || saving}
                className="bg-[#7c3aed] hover:bg-[#6d28d9]"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleAddAnother}
                  disabled={saving}
                  variant="outline"
                >
                  {saving ? "Saving..." : "Add Another"}
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={saving}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9]"
                >
                  <Check className="mr-1 h-4 w-4" /> Confirm & Close
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
