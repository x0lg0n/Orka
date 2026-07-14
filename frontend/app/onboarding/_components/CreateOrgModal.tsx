"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createOrg } from "../../actions";
import { X } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-violet text-[15px] font-black text-white shadow-[0_0_30px_rgba(148,116,255,0.35)] transition hover:bg-orange disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-7"
    >
      {pending ? "Creating…" : "Create workspace"}
    </button>
  );
}

export default function CreateOrgModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
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
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left"
      >
        {trigger}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-org-title"
            className="w-full max-w-md rounded-[16px] border border-white/10 bg-night p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2
                id="create-org-title"
                className="text-2xl font-black tracking-[-0.02em] text-white"
              >
                New organization
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm font-bold text-white/60">
              Give your workspace a name. You can invite teammates later.
            </p>

            <form action={createOrg} className="mt-5 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="org-name"
                  className="mb-1.5 block text-sm font-bold text-white/80"
                >
                  Workspace name
                </label>
                <input
                  ref={inputRef}
                  id="org-name"
                  name="name"
                  required
                  placeholder="Acme Studio"
                  className="h-12 w-full rounded-[10px] border border-white/15 bg-background px-4 text-[15px] font-bold text-white outline-none transition placeholder:text-white/30 focus:border-violet focus:ring-4 focus:ring-violet/20"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center rounded-[10px] border border-white/15 px-5 text-sm font-black text-white/80 transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
