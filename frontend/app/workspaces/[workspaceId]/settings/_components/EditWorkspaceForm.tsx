"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateOrg } from "@/app/actions";

const TYPES = [
  { value: "freelancer", label: "Freelancer" },
  { value: "agency", label: "Agency" },
  { value: "studio", label: "Studio" },
  { value: "consultancy", label: "Consultancy" },
  { value: "startup", label: "Startup" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EditWorkspaceForm({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: { name: string; slug: string | null; type: string | null; logoUrl: string | null };
}) {
  const [name, setName] = useState(defaultValues.name);
  const [slug, setSlug] = useState(defaultValues.slug ?? "");
  const [type, setType] = useState(defaultValues.type ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues.logoUrl);

  return (
    <Card className="border-border bg-panel p-6">
      <form action={updateOrg} className="flex flex-col gap-5">
        <input type="hidden" name="orgId" value={id} />

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {logoPreview ? <AvatarImage src={logoPreview} alt={name} /> : null}
            <AvatarFallback className="bg-primary/20 text-xl font-extrabold text-primary">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Label htmlFor="logo" className="block text-sm font-bold text-white/70">Logo</Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPreview(URL.createObjectURL(f));
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name" className="block text-sm font-bold text-white/70">Workspace name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="slug" className="block text-sm font-bold text-white/70">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="block text-sm font-bold text-white/70">Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="mt-1 w-full justify-between">
                {TYPES.find((t) => t.value === type)?.label ?? "Select type"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-border bg-sidebar text-white">
              {TYPES.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onSelect={() => setType(t.value)}
                  className="gap-2 text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover"
                >
                  {t.label}
                  {type === t.value ? <Check className="ml-auto size-4 text-primary" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="hidden" name="type" value={type} />
        </div>

        <Button type="submit" className="w-fit">Save changes</Button>
      </form>
    </Card>
  );
}
