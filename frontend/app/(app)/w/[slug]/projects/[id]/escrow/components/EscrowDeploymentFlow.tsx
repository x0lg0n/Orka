"use client";

import { useState } from "react";
import { Rocket, ExternalLink, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type EscrowDeploymentFlowProps = {
  projectSlug: string;
  projectId: string;
  projectToken: string | null;
  deployedAt: string | null;
  contractAddress: string | null;
  role: "agency" | "client";
  onDeploy: () => Promise<void>;
};

export function EscrowDeploymentFlow({
  projectSlug,
  projectId,
  projectToken,
  deployedAt,
  contractAddress,
  role,
  onDeploy,
}: EscrowDeploymentFlowProps) {
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step1Done = !!deployedAt;
  const step2Done = false; // Will be true when escrow is fully funded
  const portalUrl = projectToken ? `/p/${projectToken}` : null;

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      await onDeploy();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deployment failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Escrow Deployment
      </h3>

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-3">
        <StepIndicator
          number={1}
          label="Deploy"
          done={step1Done}
          active={!step1Done}
        />
        <div
          className={`h-0.5 flex-1 ${step1Done ? "bg-[#7c3aed]" : "bg-gray-200"}`}
        />
        <StepIndicator
          number={2}
          label="Fund"
          done={step2Done}
          active={step1Done && !step2Done}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Deploy */}
      {!step1Done && role === "agency" && (
        <div className="text-center">
          <p className="mb-4 text-sm text-gray-500">
            Deploy the Soroban escrow contract. This creates the on-chain
            custody pool that will hold milestone funds.
          </p>
          <Button
            onClick={handleDeploy}
            disabled={deploying}
            className="bg-[#7c3aed] hover:bg-[#6d28d9]"
          >
            {deploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying…
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Escrow
              </>
            )}
          </Button>
        </div>
      )}

      {!step1Done && role === "client" && (
        <p className="text-center text-sm text-gray-500">
          Waiting for the agency to deploy the escrow contract…
        </p>
      )}

      {/* Step 2: Fund */}
      {step1Done && !step2Done && (
        <div className="text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <p className="mb-1 text-sm font-medium text-gray-900">
            Escrow deployed
          </p>
          {contractAddress && (
            <p className="mb-3 font-mono text-xs text-gray-500">
              {contractAddress.slice(0, 12)}…{contractAddress.slice(-6)}
            </p>
          )}
          <p className="mb-4 text-sm text-gray-500">
            Share the client portal link so the client can fund the escrow pool.
          </p>
          {portalUrl && (
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open client portal
            </a>
          )}
        </div>
      )}

      {step1Done && step2Done && (
        <div className="text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            Escrow funded and active
          </p>
        </div>
      )}
    </div>
  );
}

function StepIndicator({
  number,
  label,
  done,
  active,
}: {
  number: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
          done
            ? "bg-[#7c3aed] text-white"
            : active
              ? "bg-[#7c3aed]/10 text-[#7c3aed] ring-2 ring-[#7c3aed]"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : number}
      </div>
      <span
        className={`text-xs font-medium ${active ? "text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}
