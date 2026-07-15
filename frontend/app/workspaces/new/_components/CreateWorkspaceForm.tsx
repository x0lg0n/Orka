"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, ImagePlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { createOrg } from "../../../../app/actions";

const TYPES = ["Freelancer", "Agency", "Studio", "Consultancy", "Startup"] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? "Creating…" : "Create Workspace"}
      {!pending ? <ArrowRight size={16} aria-hidden /> : null}
    </Button>
  );
}

export function CreateWorkspaceForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60),
      );
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <Card className="rounded-[16px] border-border bg-card p-7">
      <h1 className="text-2xl font-extrabold tracking-[-0.02em]">Create Workspace</h1>
      <p className="mt-2 text-sm font-bold text-white/55">
        Your workspace is where you manage projects, clients and payments.
      </p>

      <form action={createOrg} className="mt-6 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-[10px] border border-border bg-primary/10"
            aria-label="Upload workspace logo"
          >
            <Avatar className="size-16 rounded-[10px]">
              {logoPreview ? <AvatarImage src={logoPreview} alt="Workspace logo" /> : null}
              <AvatarFallback className="rounded-[10px] bg-primary/15 text-2xl font-extrabold text-primary">
                {name ? name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition group-hover:opacity-100">
              <ImagePlus className="size-5 text-white" aria-hidden />
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/80">Workspace logo</p>
            <p className="text-xs font-bold text-white/40">Optional. Upload or we&apos;ll use your initial.</p>
            <input ref={fileRef} type="file" name="logo" accept="image/*" className="hidden" onChange={onFile} />
          </div>
        </div>

        <div>
          <Label htmlFor="ws-name" className="mb-1.5 block text-sm font-bold text-white/80">
            Workspace name
          </Label>
          <Input
            id="ws-name"
            name="name"
            required
            placeholder="Acme Studio"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-1.5 block text-sm font-bold text-white/80">Workspace type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="w-full justify-between">
                {type ?? "Select a type"}
                <Check className="size-4 opacity-0" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] border-border bg-card text-white">
              {TYPES.map((t) => (
                <DropdownMenuItem
                  key={t}
                  onSelect={() => setType(t)}
                  className="text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover dark:hover:bg-hover dark:focus:bg-hover dark:data-[highlighted]:bg-hover"
                >
                  {t}
                  {type === t ? <Check className="ml-auto size-4 text-primary" aria-hidden /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="hidden" name="type" value={type ?? ""} />
        </div>

        <div>
          <Label htmlFor="ws-slug" className="mb-1.5 block text-sm font-bold text-white/80">
            Workspace slug
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white/40">orka.io/</span>
            <Input
              id="ws-slug"
              name="slug"
              placeholder="acme"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </Card>
  );
}
