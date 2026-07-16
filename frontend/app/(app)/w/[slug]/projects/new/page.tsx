"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { X, Save } from "lucide-react";
import { StepNavigation } from "./components/StepNavigation";
import { ProjectDetailsStep } from "./components/ProjectDetailsStep";
import { ScopeStep } from "./components/ScopeStep";
import { ProposalStep } from "./components/ProposalStep";
import { EscrowStep } from "./components/EscrowStep";
import { AICopilotCard } from "./components/AICopilotCard";
import { PreviewCard } from "./components/PreviewCard";

export interface ProjectFormData {
  name: string;
  client: string;
  category: string;
  timeline: string;
  description: string;
  engagementType: "fixed" | "hourly" | "retainer";
  visibility: "private" | "public";
}

const STEPS = [
  { num: 1, title: "Project Details", subtitle: "Basic information" },
  { num: 2, title: "Scope & Milestones", subtitle: "Define work" },
  { num: 3, title: "Proposal & Contract", subtitle: "Review and customize" },
  { num: 4, title: "Escrow & Launch", subtitle: "Fund and start" },
];

export default function NewProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    client: "",
    category: "",
    timeline: "",
    description: "",
    engagementType: "fixed",
    visibility: "private",
  });

  const updateField = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canContinue =
    currentStep === 1
      ? formData.name.trim() !== "" &&
        formData.client.trim() !== "" &&
        formData.category.trim() !== "" &&
        formData.timeline.trim() !== "" &&
        formData.description.trim() !== ""
      : true;

  const handleNext = () => {
    if (currentStep < 4 && canContinue) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleCreate = async () => {
    const formDataObj = new FormData();
    formDataObj.append("slug", slug);
    formDataObj.append("title", formData.name);
    formDataObj.append("description", formData.description);
    formDataObj.append("clientName", formData.client);

    try {
      const { createProject } = await import("@/app/actions");
      await createProject(formDataObj);
    } catch {
      window.location.href = `/w/${slug}/projects`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Project
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Start a new project and streamline your client collaboration from
            proposal to payment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <Link
            href={`/w/${slug}/projects`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stepper */}
      <StepNavigation steps={STEPS} current={currentStep} />

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Form Area */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {currentStep === 1 && (
            <ProjectDetailsStep
              formData={formData}
              updateField={updateField}
            />
          )}
          {currentStep === 2 && <ScopeStep />}
          {currentStep === 3 && <ProposalStep />}
          {currentStep === 4 && <EscrowStep />}

          {/* Bottom Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <Link
              href={`/w/${slug}/projects`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Cancel
            </Link>
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className="flex items-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue to{" "}
                {currentStep === 1
                  ? "Scope & Milestones"
                  : currentStep === 2
                    ? "Proposal & Contract"
                    : "Escrow & Launch"}
                →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
              >
                Create Project →
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          <AICopilotCard formData={formData} />
          <PreviewCard formData={formData} />
        </div>
      </div>
    </div>
  );
}
