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

export default function SendContractModal({ open, onOpenChange, onSuccess }: Props) {
  const { clients, leads, convertLeadToClient } = useStore();
  const [mode, setMode] = useState<"send" | "convert">("send");
  const [clientId, setClientId] = useState("");
  const [leadId, setLeadId] = useState("");

  const [pricing, setPricing] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [scope, setScope] = useState("");
  const [terms, setTerms] = useState("");
  const [notes, setNotes] = useState("");

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedLead = leads.find((l) => l.id === leadId);

  const handleSend = () => {
    let targetClient: ReturnType<typeof convertLeadToClient> | undefined = selectedClient;
    if (mode === "convert" && selectedLead) {
      targetClient = convertLeadToClient(leadId, {
        businessName: selectedLead.businessName,
        package: "Custom",
        buildFee: Number(pricing) || 0,
      });
    }
    alert(`Contract ${targetClient ? `sent to ${targetClient.businessName}` : "created"}`);
    onOpenChange(false);
    onSuccess?.();
  };

  const hasClients = clients.length > 0;
  const hasLeads = leads.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">Send Contract</DialogTitle>
          <DialogDescription>Send a contract to an existing client or convert a lead first.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {!hasClients && !hasLeads ? (
            <div className="text-center py-8 space-y-4">
              <span className="material-symbols-outlined text-4xl text-secondary">info</span>
              <p className="text-secondary">No clients or leads exist yet.</p>
              <Link href="/clients?new-client=true" onClick={() => onOpenChange(false)}>
                <Button className="rounded-full">Create Client</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-2">
                <Button type="button" variant={mode === "send" ? "default" : "outline"} onClick={() => setMode("send")} className={`rounded-full ${mode === "send" ? "bg-primary text-on-primary" : ""}`} disabled={!hasClients}>Existing Client</Button>
                <Button type="button" variant={mode === "convert" ? "default" : "outline"} onClick={() => setMode("convert")} className={`rounded-full ${mode === "convert" ? "bg-primary text-on-primary" : ""}`} disabled={!hasLeads}>Convert Lead to Client</Button>
              </div>

              {mode === "send" ? (
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Select Client</Label>
                  <Select value={clientId} onValueChange={(v) => setClientId(v || "")}>
                    <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Select Lead to Convert</Label>
                  <Select value={leadId} onValueChange={(v) => setLeadId(v || "")}>
                    <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                      <SelectValue placeholder="Choose a lead..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.filter((l) => l.stage !== "won" && l.stage !== "lost").map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="border-t border-surface-container pt-4 mt-2">
                <h4 className="text-label-md font-label-md text-primary mb-4">Contract Template</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Total Pricing ($)</Label>
                      <Input value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="25000" type="number" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Timeframe</Label>
                      <Input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. 6 months" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Scope of Work</Label>
                    <Textarea value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Describe the work to be performed..." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Terms & Conditions</Label>
                    <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Payment terms, milestones, etc." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Additional Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl">
                <p className="text-label-sm font-label-sm text-secondary mb-2">Contract Preview</p>
                <div className="border-b border-surface-container pb-2 mb-2">
                  <p className="text-headline-md font-headline-md text-primary">Master Service Agreement</p>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="text-secondary">Client:</span> {(mode === "send" ? selectedClient?.businessName : selectedLead?.businessName) || "—"}</p>
                  <p><span className="text-secondary">Pricing:</span> ${pricing || "0"}</p>
                  <p><span className="text-secondary">Timeframe:</span> {timeframe || "—"}</p>
                  <p><span className="text-secondary">Scope:</span> {scope || "—"}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
                <Button type="button" onClick={handleSend} disabled={mode === "send" ? !clientId : !leadId} className="rounded-full px-6 bg-primary text-on-primary">
                  {mode === "convert" ? "Convert & Send Contract" : "Send Contract"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
