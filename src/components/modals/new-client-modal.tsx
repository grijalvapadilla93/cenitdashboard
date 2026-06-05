"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import Link from "next/link";
import NewLeadModal from "./new-lead-modal";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  leadId?: string;
}

export default function NewClientModal({ open, onOpenChange, onSuccess, leadId }: Props) {
  const { leads, addClient } = useStore();
  const [selectedLeadId, setSelectedLeadId] = useState(leadId || "");
  const [ownerName, setOwnerName] = useState("");
  const [pkg, setPkg] = useState("");
  const [buildFee, setBuildFee] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [notes, setNotes] = useState("");
  const [showNewLead, setShowNewLead] = useState(false);

  useEffect(() => {
    if (leadId) {
      setSelectedLeadId(leadId);
    }
  }, [leadId, open]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    addClient({
      businessName: selectedLead.businessName,
      ownerName,
      email: selectedLead.email,
      phone: selectedLead.phone,
      website: selectedLead.website,
      package: pkg,
      buildFee: Number(buildFee) || 0,
      monthlyFee: Number(monthlyFee) || 0,
      notes,
    });
    setSelectedLeadId(""); setOwnerName(""); setPkg(""); setBuildFee(""); setMonthlyFee(""); setNotes("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open && !showNewLead} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
          <DialogHeader>
            <DialogTitle className="text-headline-md font-headline-md">Convert to Client</DialogTitle>
            <DialogDescription>Convert this lead into a client.</DialogDescription>
          </DialogHeader>

          {leads.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <span className="material-symbols-outlined text-4xl text-secondary">info</span>
              <p className="text-secondary">No leads exist yet. Create a lead first.</p>
              <Link href="/leads?new-lead=true" onClick={() => onOpenChange(false)} className="inline-block bg-primary text-on-primary rounded-full px-6 py-2 text-label-md font-label-md hover:bg-surface-tint transition-colors">
                Create Lead
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {!leadId ? (
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Select Lead</Label>
                  <Select value={selectedLeadId} onValueChange={(v) => setSelectedLeadId(v || "")}>
                    <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                      <SelectValue placeholder="Choose a lead to convert...">{leads.find((l) => l.id === selectedLeadId)?.businessName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => { setShowNewLead(true); }}
                    className="text-label-sm font-label-sm text-primary hover:underline mt-1 cursor-pointer"
                  >
                    + Or create a new lead
                  </button>
                </div>
              ) : null}

              {selectedLead && (
                <>
                  <div className="bg-surface-container-low p-4 rounded-2xl">
                    <p className="text-label-sm font-label-sm text-secondary mb-1">Converting:</p>
                    <p className="text-body-md font-body-md text-primary">{selectedLead.businessName}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{selectedLead.email} • {selectedLead.phone}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Owner / Contact Name</Label>
                    <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jane Smith" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Package</Label>
                    <Select value={pkg || null} onValueChange={(v) => setPkg(v || "")}>
                      <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                        <SelectValue placeholder="Select package" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Basic", "Pro", "Enterprise", "Custom"].map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Build Fee ($)</Label>
                      <Input value={buildFee} onChange={(e) => setBuildFee(e.target.value)} placeholder="5000" type="number" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-label-sm font-label-sm text-primary">Monthly Fee ($)</Label>
                      <Input value={monthlyFee} onChange={(e) => setMonthlyFee(e.target.value)} placeholder="1000" type="number" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-label-sm font-label-sm text-primary">Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className="min-h-[80px] rounded-xl bg-surface-container-low border-transparent" />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
                    <Button type="submit" className="rounded-full px-6 bg-primary text-on-primary">Create Client</Button>
                  </div>
                </>
              )}
            </form>
          )}
        </DialogContent>
      </Dialog>

      <NewLeadModal
        open={showNewLead}
        onOpenChange={setShowNewLead}
        onSuccess={() => { setShowNewLead(false); }}
      />
    </>
  );
}
