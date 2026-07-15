"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteOrg } from "@/app/actions";

export function DeleteWorkspaceDialog({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState("");
  const matched = confirm === name;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-fit gap-2">
          <Trash2 className="size-4" />
          Delete workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-sidebar text-white">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{name}&rdquo;?</DialogTitle>
          <DialogDescription className="text-white/60">
            This permanently deletes the workspace and ALL its projects, payments, and history. Type{" "}
            <span className="font-extrabold text-white">{name}</span> to confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteOrg} className="flex flex-col gap-4">
          <input type="hidden" name="orgId" value={id} />
          <Input
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={name}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!matched}>
              Delete permanently
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
