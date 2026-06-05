"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, type Task, type Assignee, assigneeLabel } from "@/lib/store";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface Props {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const persons: { key: Exclude<Assignee, "available">; label: string }[] = [
  { key: "alex", label: "Alex" },
  { key: "diego", label: "Diego" },
  { key: "pablo", label: "Pablo" },
];

export default function TaskDetailModal({ task, open, onOpenChange }: Props) {
  const { pickUpTask, completeTask, returnToAvailable } = useStore();
  const [completedNotes, setCompletedNotes] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);

  if (!task) return null;

  const handlePickUp = (person: Exclude<Assignee, "available">) => {
    pickUpTask(task.id, person);
    onOpenChange(false);
  };

  const handleComplete = () => {
    completeTask(task.id, completedNotes);
    setCompletedNotes("");
    onOpenChange(false);
  };

  const handleReturnToAvailable = () => {
    returnToAvailable(task.id, returnNotes);
    setReturnNotes("");
    onOpenChange(false);
  };

  const isAvailable = task.status === "available";
  const isCompleted = task.status === "completed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">{task.name}</DialogTitle>
          <DialogDescription>
            {isCompleted ? "Completed" : isAvailable ? "Available to pick up" : "In progress"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="bg-surface-container-low p-4 rounded-2xl space-y-3">
            <div className="flex justify-between">
              <span className="text-label-sm font-label-sm text-secondary">Status</span>
              <span className={`text-label-sm font-label-sm px-2 py-0.5 rounded-full ${isCompleted ? "bg-primary/10 text-primary" : isAvailable ? "bg-surface-container-high text-secondary" : "bg-surface-container-high text-primary"}`}>
                {isCompleted ? "Completed" : isAvailable ? "Available" : "In Progress"}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex justify-between">
                <span className="text-label-sm font-label-sm text-secondary">Due Date</span>
                <span className="text-label-sm font-label-sm text-primary">{task.dueDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-label-sm font-label-sm text-secondary">Assigned To</span>
              <span className="text-label-sm font-label-sm text-primary">{assigneeLabel(task.assignedTo)}</span>
            </div>
          </div>

          {task.notes && (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Notes</Label>
              <div className="p-3 bg-surface-container-low rounded-xl text-body-md font-body-md text-on-surface">
                {task.notes}
              </div>
            </div>
          )}

          {isCompleted && task.completedNotes && (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Completion Notes</Label>
              <div className="p-3 bg-surface-container-low rounded-xl text-body-md font-body-md text-on-surface">
                {task.completedNotes}
              </div>
            </div>
          )}

          {isCompleted && task.completedAt && (
            <div className="bg-surface-container-low p-3 rounded-xl flex justify-between">
              <span className="text-label-sm font-label-sm text-secondary">Completed At</span>
              <span className="text-label-sm font-label-sm text-primary">{task.completedAt}</span>
            </div>
          )}

          {task.returnedNotes && task.status === "available" && (
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Return Notes</Label>
              <div className="p-3 bg-surface-container-low rounded-xl text-body-md font-body-md text-on-surface">
                {task.returnedNotes}
              </div>
            </div>
          )}

          {isAvailable && (
            <div className="space-y-3">
              <Label className="text-label-sm font-label-sm text-primary">Assign to</Label>
              <div className="flex gap-2">
                {persons.map((p) => (
                  <Button key={p.key} onClick={() => handlePickUp(p.key)} className="flex-1 rounded-full bg-primary text-on-primary">
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!isAvailable && !isCompleted && (
            <div className="space-y-4 border-t border-surface-container pt-4">
              <div className="space-y-2">
                <Button onClick={() => setConfirmReturn(true)} disabled={!returnNotes.trim()} className="w-full rounded-full bg-surface-container-high text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">undo</span>
                  Return to Available
                </Button>
                <Textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} placeholder="Reason for returning..." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
              </div>
              <div className="border-t border-surface-container pt-4">
                <Label className="text-label-sm font-label-sm text-primary">Complete Task</Label>
                <Textarea value={completedNotes} onChange={(e) => setCompletedNotes(e.target.value)} placeholder="Completion notes..." rows={2} className="mt-2 rounded-xl bg-surface-container-low border-transparent" />
                <Button onClick={() => setConfirmComplete(true)} disabled={!completedNotes.trim()} className="w-full rounded-full bg-primary text-on-primary mt-2">
                  Mark as Complete
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmComplete}
        onOpenChange={setConfirmComplete}
        title="Complete Task"
        description={`Are you sure you want to mark "${task.name}" as complete?`}
        confirmLabel="Complete"
        onConfirm={handleComplete}
      />

      <ConfirmDialog
        open={confirmReturn}
        onOpenChange={setConfirmReturn}
        title="Return to Available"
        description="Are you sure you want to return this task to available? It will be unassigned."
        confirmLabel="Return"
        onConfirm={handleReturnToAvailable}
      />
    </Dialog>
  );
}
