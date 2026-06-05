"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, type Assignee } from "@/lib/store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const persons: { key: Exclude<Assignee, "available">; label: string }[] = [
  { key: "alex", label: "Alex" },
  { key: "diego", label: "Diego" },
  { key: "pablo", label: "Pablo" },
];

export default function NewTaskModal({ open, onOpenChange, onSuccess }: Props) {
  const { addTask } = useStore();
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignTo, setAssignTo] = useState<Assignee>("alex");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTask({
      name,
      dueDate,
      assignedTo: assignTo,
      notes,
      status: assignTo === "available" ? "available" : "in-progress",
    });
    setName(""); setDueDate(""); setAssignTo("alex"); setNotes("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">Create Task</DialogTitle>
          <DialogDescription>Add a new task to the board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Task Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="What needs to be done?" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Due Date</Label>
            <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Assign To</Label>
            <div className="flex flex-wrap gap-2">
              {persons.map((p) => (
                <Button key={p.key} type="button" variant={assignTo === p.key ? "default" : "outline"} onClick={() => setAssignTo(p.key)} className={`rounded-full ${assignTo === p.key ? "bg-primary text-on-primary" : ""}`}>
                  {p.label}
                </Button>
              ))}
              <Button type="button" variant={assignTo === "available" ? "default" : "outline"} onClick={() => setAssignTo("available")} className={`rounded-full ${assignTo === "available" ? "bg-primary text-on-primary" : ""}`}>
                Available
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-label-sm font-label-sm text-primary">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional details..." rows={3} className="rounded-xl bg-surface-container-low border-transparent" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
            <Button type="submit" className="rounded-full px-6 bg-primary text-on-primary">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
