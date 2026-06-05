"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, type Assignee } from "@/lib/store";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preSelectedType?: "lead" | "client";
  preSelectedId?: string;
}

const teamMembers: { key: Exclude<Assignee, "available">; label: string }[] = [
  { key: "alex", label: "Alex" },
  { key: "diego", label: "Diego" },
  { key: "pablo", label: "Pablo" },
];

export default function NewProjectModal({ open, onOpenChange, onSuccess, preSelectedType, preSelectedId }: Props) {
  const { clients, leads, addProject, addTask } = useStore();
  const [entityType, setEntityType] = useState<"lead" | "client">(preSelectedType || "client");
  const [entityId, setEntityId] = useState(preSelectedId || "");
  const [name, setName] = useState("");
  const [pricing, setPricing] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [assignees, setAssignees] = useState<Set<Exclude<Assignee, "available">>>(new Set());

  const toggleAssignee = (person: Exclude<Assignee, "available">) => {
    setAssignees((prev) => {
      const next = new Set(prev);
      if (next.has(person)) next.delete(person);
      else next.add(person);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId || !name.trim()) return;

    const entityName = entityType === "lead"
      ? leads.find((l) => l.id === entityId)?.businessName || ""
      : clients.find((c) => c.id === entityId)?.businessName || "";

    addProject({
      entityId,
      entityType,
      entityName,
      name,
      pricing: Number(pricing) || 0,
      dueDate,
      notes,
      assignees: Array.from(assignees),
    });

    assignees.forEach((person) => {
      addTask({
        name: `Project: ${name}`,
        dueDate,
        assignedTo: person,
        notes: notes || "",
        status: "in-progress",
      });
    });

    setEntityId(""); setName(""); setPricing(""); setDueDate(""); setNotes(""); setAssignees(new Set());
    onOpenChange(false);
    onSuccess?.();
  };

  const entityName = entityType === "client" ? "Client" : "Lead";
  const entities = entityType === "client" ? clients : leads;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">New Project</DialogTitle>
          <DialogDescription>Create a project and assign tasks to the team.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Lead or Client (only if not pre-selected) */}
          {!preSelectedType && (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Project For</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setEntityType("client"); setEntityId(""); }}
                  className={`px-6 py-2.5 rounded-full text-label-sm font-label-sm border-2 transition-all cursor-pointer ${
                    entityType === "client"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-transparent text-secondary border-surface-container-highest hover:border-primary"
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => { setEntityType("lead"); setEntityId(""); }}
                  className={`px-6 py-2.5 rounded-full text-label-sm font-label-sm border-2 transition-all cursor-pointer ${
                    entityType === "lead"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-transparent text-secondary border-surface-container-highest hover:border-primary"
                  }`}
                >
                  Lead
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select entity */}
          {(preSelectedType || entityType) && (
            <>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Select {entityName}</Label>
                {entities.length === 0 ? (
                  <p className="text-label-sm font-label-sm text-secondary">No {entityName.toLowerCase()}s available.</p>
                ) : (
                  <Select value={entityId} onValueChange={(v) => setEntityId(v || "")}>
                    <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                      <SelectValue placeholder={`Choose a ${entityName.toLowerCase()}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {entityId && (
                <>
                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Project Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Pricing ($)</Label>
                      <Input value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="15000" type="number" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Due Date</Label>
                      <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Who is working on this</Label>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => toggleAssignee(m.key)}
                          className={`px-4 py-2 rounded-full text-label-sm font-label-sm border-2 transition-all cursor-pointer ${
                            assignees.has(m.key)
                              ? "bg-primary text-on-primary border-primary"
                              : "bg-transparent text-secondary border-surface-container-highest hover:border-primary"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {assignees.size === 0 && (
                      <p className="text-label-sm font-label-sm text-secondary">Select at least one person</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional project details..." rows={3} className="rounded-xl bg-surface-container-low border-transparent" />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
                    <Button type="submit" disabled={!entityId || !name.trim() || assignees.size === 0} className="rounded-full px-6 bg-primary text-on-primary">Create Project</Button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
