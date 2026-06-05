"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import Link from "next/link";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function NewInvoiceModal({ open, onOpenChange, onSuccess }: Props) {
  const { leads, clients } = useStore();
  const [entityType, setEntityType] = useState<"lead" | "client">("client");
  const [entityId, setEntityId] = useState("");
  const [invoiceNumber] = useState(`INV-${Date.now()}`);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Professional services as agreed per contract.");
  const [dueDate, setDueDate] = useState("");

  const selectedEntity = entityType === "client"
    ? clients.find((c) => c.id === entityId)
    : leads.find((l) => l.id === entityId);

  const handleSend = () => {
    alert(`Invoice ${invoiceNumber} sent to ${selectedEntity?.businessName || "Unknown"} for $${amount}`);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">New Invoice</DialogTitle>
          <DialogDescription>Create and send an invoice to a lead or client.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {leads.length === 0 && clients.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <span className="material-symbols-outlined text-4xl text-secondary">info</span>
              <p className="text-secondary">No leads or clients exist yet. Create one first.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/leads?new-lead=true" onClick={() => onOpenChange(false)}>
                  <Button className="rounded-full">Create Lead</Button>
                </Link>
                <Link href="/clients?new-client=true" onClick={() => onOpenChange(false)}>
                  <Button variant="outline" className="rounded-full">Create Client</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Bill To</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={entityType === "client" ? "default" : "outline"}
                    onClick={() => { setEntityType("client"); setEntityId(""); }}
                    className={`rounded-full ${entityType === "client" ? "bg-primary text-on-primary" : ""}`}
                  >
                    Client
                  </Button>
                  <Button
                    type="button"
                    variant={entityType === "lead" ? "default" : "outline"}
                    onClick={() => { setEntityType("lead"); setEntityId(""); }}
                    className={`rounded-full ${entityType === "lead" ? "bg-primary text-on-primary" : ""}`}
                  >
                    Lead
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Select {entityType === "client" ? "Client" : "Lead"}</Label>
                <Select value={entityId} onValueChange={(v) => setEntityId(v || "")}>
                  <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                    <SelectValue placeholder={`Choose a ${entityType}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(entityType === "client" ? clients : leads).map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.businessName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Invoice #</Label>
                  <Input value={invoiceNumber} disabled className="h-12 rounded-xl bg-surface-container-low border-transparent opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Due Date</Label>
                  <Input value={dueDate} onChange={(e) => setDueDate(e.target.value)} type="date" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Amount ($)</Label>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1500.00" type="number" step="0.01" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
              </div>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl bg-surface-container-low border-transparent" />
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <p className="text-label-sm font-label-sm text-secondary mb-2">Invoice Preview</p>
                <div className="border-b border-surface-container pb-2 mb-2">
                  <span className="text-xs text-secondary">Hub Central</span>
                  <p className="text-headline-md font-headline-md text-primary mt-1">INVOICE</p>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-secondary">Bill To:</span> {selectedEntity?.businessName || "—"}</p>
                  <p><span className="text-secondary">Amount:</span> ${amount || "0.00"}</p>
                  <p><span className="text-secondary">Due:</span> {dueDate || "—"}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
                <Button type="button" disabled={!entityId || !amount} onClick={handleSend} className="rounded-full px-6 bg-primary text-on-primary">
                  Send Invoice
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
