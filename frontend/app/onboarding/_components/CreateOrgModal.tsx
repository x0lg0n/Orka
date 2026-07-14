"use client";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createOrg } from "../../actions";
import { X } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create workspace"}
    </Button>
  );
}

export default function CreateOrgModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block w-full text-left">
        {trigger}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-shell/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-org-title"
            className="w-full max-w-md rounded-[16px] border border-white/10 bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="create-org-title" className="text-2xl font-extrabold tracking-[-0.02em] text-white">
                New organization
              </h2>
              <Button type="button" variant="ghost" size="icon" className="size-9" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} aria-hidden />
              </Button>
            </div>
            <p className="mt-2 text-sm font-bold text-white/60">
              Give your workspace a name. You can invite teammates later.
            </p>

            <form
              action={createOrg}
              className="mt-5 flex flex-col gap-4"
              onSubmit={(e) => {
                const name = new FormData(e.currentTarget).get("name");
                if (!name || String(name).trim().length === 0) {
                  e.preventDefault();
                  setInvalid(true);
                }
              }}
            >
              <div>
                <Label htmlFor="org-name" className="mb-1.5 block text-sm font-bold text-white/80">
                  Workspace name
                </Label>
                <Input
                  ref={inputRef}
                  id="org-name"
                  name="name"
                  required
                  aria-invalid={invalid}
                  placeholder="Acme Studio"
                  onChange={() => invalid && setInvalid(false)}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
