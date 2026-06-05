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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  leadId?: string;
}

interface Template {
  name: string;
  fields: { title: string; description: string; scope: string; deliverables: string; timeline: string; pricing: string };
}

const templates: Template[] = [
  {
    name: "Web Development",
    fields: {
      title: "Web Development Proposal",
      description: "A fully responsive, modern web application tailored to your business needs.",
      scope: "Full-cycle development including UI/UX design, frontend and backend implementation, database setup, and deployment.",
      deliverables: "Wireframes & prototypes, responsive frontend, REST API / backend, CMS integration, deployment & CI/CD pipeline.",
      timeline: "8-12 weeks",
      pricing: "25000",
    },
  },
  {
    name: "Mobile App",
    fields: {
      title: "Mobile Application Proposal",
      description: "A cross-platform mobile application for iOS and Android.",
      scope: "End-to-end mobile app development including design, development, testing, and app store submission.",
      deliverables: "App UI/UX design, iOS & Android builds, backend API, admin dashboard, app store assets & submission.",
      timeline: "12-16 weeks",
      pricing: "35000",
    },
  },
  {
    name: "Branding & Design",
    fields: {
      title: "Brand Identity Proposal",
      description: "Complete brand identity design to establish a strong market presence.",
      scope: "Brand strategy, visual identity design, brand guidelines, and application to key collateral.",
      deliverables: "Logo & variations, color palette, typography system, brand guidelines PDF, business card & stationery templates.",
      timeline: "4-6 weeks",
      pricing: "8000",
    },
  },
  {
    name: "Consulting",
    fields: {
      title: "Technology Consulting Proposal",
      description: "Expert technology consulting to optimize your processes and infrastructure.",
      scope: "Current state assessment, gap analysis, roadmap creation, and recommendations.",
      deliverables: "Assessment report, technology roadmap, architecture recommendations, implementation plan.",
      timeline: "2-4 weeks",
      pricing: "5000",
    },
  },
];

export default function NewProposalModal({ open, onOpenChange, onSuccess, leadId }: Props) {
  const { leads, addLead, addProposal } = useStore();
  const [mode, setMode] = useState<"select" | "new-lead">("select");
  const [selectedLeadId, setSelectedLeadId] = useState(leadId || "");
  const [creationMode, setCreationMode] = useState<"scratch" | "template">("scratch");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [timeline, setTimeline] = useState("");
  const [pricing, setPricing] = useState("");
  const [notes, setNotes] = useState("");

  const [newBusiness, setNewBusiness] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (leadId) {
      setSelectedLeadId(leadId);
      const lead = leads.find((l) => l.id === leadId);
      if (lead && creationMode === "scratch") {
        setTitle(`Proposal for ${lead.businessName}`);
      }
    }
  }, [leadId, leads, open, creationMode]);

  useEffect(() => {
    if (creationMode === "template" && selectedTemplate) {
      const tmpl = templates.find((t) => t.name === selectedTemplate);
      if (tmpl) {
        setTitle(tmpl.fields.title);
        setDescription(tmpl.fields.description);
        setScope(tmpl.fields.scope);
        setDeliverables(tmpl.fields.deliverables);
        setTimeline(tmpl.fields.timeline);
        setPricing(tmpl.fields.pricing);
      }
    }
  }, [selectedTemplate, creationMode]);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetLeadId = selectedLeadId;
    if (mode === "new-lead") {
      const created = addLead({
        businessName: newBusiness,
        phone: newPhone,
        email: newEmail,
        socials: [],
        source: "Proposal",
        notes: "",
        website: "",
        hasWebsite: false,
      });
      targetLeadId = created.id;
    }
    if (!targetLeadId) return;
    addProposal({
      leadId: targetLeadId,
      title,
      description,
      scope,
      deliverables,
      timeline,
      pricing: pricing ? [{ label: "Total", amount: Number(pricing) }] : [],
      notes,
    });
    setSelectedLeadId(""); setTitle(""); setDescription(""); setScope(""); setDeliverables(""); setTimeline(""); setPricing(""); setNotes("");
    setNewBusiness(""); setNewEmail(""); setNewPhone(""); setSelectedTemplate("");
    onOpenChange(false);
    onSuccess?.();
  };

  const hasLeads = leads.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="text-headline-md font-headline-md">New Proposal</DialogTitle>
          <DialogDescription>Create a proposal for a lead.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-2">
          <Button type="button" variant={creationMode === "scratch" ? "default" : "outline"} onClick={() => setCreationMode("scratch")} className={`rounded-full ${creationMode === "scratch" ? "bg-primary text-on-primary" : ""}`}>From Scratch</Button>
          <Button type="button" variant={creationMode === "template" ? "default" : "outline"} onClick={() => setCreationMode("template")} className={`rounded-full ${creationMode === "template" ? "bg-primary text-on-primary" : ""}`}>Template</Button>
        </div>

        {!leadId && hasLeads && (
          <div className="flex gap-2 mb-2">
            <Button type="button" variant={mode === "select" ? "default" : "outline"} onClick={() => setMode("select")} className={`rounded-full ${mode === "select" ? "bg-primary text-on-primary" : ""}`}>Existing Lead</Button>
            <Button type="button" variant={mode === "new-lead" ? "default" : "outline"} onClick={() => setMode("new-lead")} className={`rounded-full ${mode === "new-lead" ? "bg-primary text-on-primary" : ""}`}>New Lead</Button>
          </div>
        )}
        {!hasLeads && !leadId ? (
          <div className="text-center py-8 space-y-4">
            <span className="material-symbols-outlined text-4xl text-secondary">info</span>
            <p className="text-secondary">No leads exist yet. Create a lead first or add one now.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setMode("new-lead")} className="rounded-full">Add New Lead</Button>
              <Link href="/leads?new-lead=true" onClick={() => onOpenChange(false)}>
                <Button variant="outline" className="rounded-full">Go to Leads</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {creationMode === "template" && (
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Choose Template</Label>
                <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v || "")}>
                  <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!leadId && mode === "select" ? (
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Select Lead</Label>
                <Select value={selectedLeadId} onValueChange={(v) => setSelectedLeadId(v || "")}>
                  <SelectTrigger className="h-12 rounded-xl bg-surface-container-low border-transparent">
                    <SelectValue placeholder="Choose a lead...">{leads.find((l) => l.id === selectedLeadId)?.businessName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.businessName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : !leadId && mode === "new-lead" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-label-sm font-label-sm text-primary">Business Name</Label>
                  <Input value={newBusiness} onChange={(e) => setNewBusiness(e.target.value)} placeholder="Company name" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Email</Label>
                  <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@company.com" type="email" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                </div>
                <div className="space-y-2">
                  <Label className="text-label-sm font-label-sm text-primary">Phone</Label>
                  <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
                </div>
              </div>
            ) : null}
            {leadId && selectedLead && (
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <p className="text-label-sm font-label-sm text-secondary mb-1">Proposal for</p>
                <p className="text-body-md font-body-md text-primary">{selectedLead.businessName}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Proposal Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Web App Redesign" required className="h-12 rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief overview of the proposal..." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Scope of Work</Label>
              <Textarea value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Describe what's included..." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Deliverables</Label>
              <Textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Key deliverables..." rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Timeline</Label>
                <Input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="e.g. 4 weeks" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
              </div>
              <div className="space-y-2">
                <Label className="text-label-sm font-label-sm text-primary">Total Pricing ($)</Label>
                <Input value={pricing} onChange={(e) => setPricing(e.target.value)} placeholder="15000" type="number" className="h-12 rounded-xl bg-surface-container-low border-transparent" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-label-sm font-label-sm text-primary">Additional Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl bg-surface-container-low border-transparent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full px-6">Cancel</Button>
              <Button type="submit" disabled={!leadId && !selectedLeadId && mode !== "new-lead"} className="rounded-full px-6 bg-primary text-on-primary">Create Proposal</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
