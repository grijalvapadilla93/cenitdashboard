"use client";

import { use, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import NewProposalModal from "@/components/modals/new-proposal-modal";
import NewClientModal from "@/components/modals/new-client-modal";
import NewProjectModal from "@/components/modals/new-project-modal";

const STAGES = [
  { key: "new", label: "New" },
  { key: "reached", label: "Reached Out" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

function LeadDetail(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { leads, proposals, projects, updateLeadStage, updateLead, updateProposalPricing } = useStore();
  const lead = leads.find((l) => l.id === params.id);
  const proposal = proposals.find((p) => p.leadId === params.id);
  const leadProjects = projects.filter((p) => p.entityId === params.id && p.entityType === "lead");

  const showAddProposal = searchParams.get("add-proposal") === "true";
  const showConvertClient = searchParams.get("convert-client") === "true";
  const [showNewProject, setShowNewProject] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editPricing, setEditPricing] = useState(false);
  const [editFields, setEditFields] = useState({ businessName: "", email: "", phone: "", source: "", website: "", notes: "" });
  const [pricingItems, setPricingItems] = useState<{ label: string; amount: number }[]>([]);
  const [showStageMenu, setShowStageMenu] = useState(false);

  const startEditing = useCallback(() => {
    if (!lead) return;
    setEditFields({ businessName: lead.businessName, email: lead.email, phone: lead.phone, source: lead.source, website: lead.website, notes: lead.notes });
    setEditing(true);
  }, [lead]);

  const saveEditing = useCallback(() => {
    if (!lead) return;
    updateLead(lead.id, {
      ...editFields,
      hasWebsite: editFields.website.trim().length > 0,
    });
    setEditing(false);
  }, [lead, editFields, updateLead]);

  const openPricingEditor = useCallback(() => {
    if (proposal) {
      setPricingItems([...proposal.pricing]);
    }
    setEditPricing(true);
  }, [proposal]);

  const savePricing = useCallback(() => {
    if (!proposal) return;
    updateProposalPricing(proposal.id, pricingItems);
    setEditPricing(false);
  }, [proposal, pricingItems]);

  const handlePrintPDF = useCallback(() => {
    if (!lead || !proposal) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Proposal - ${lead.businessName}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1c1c1c; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 28px; margin-bottom: 4px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
        h2 { font-size: 20px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
        p { line-height: 1.6; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { font-weight: 600; background: #f5f5f5; }
        .total { font-size: 20px; font-weight: 700; text-align: right; margin-top: 20px; }
      </style></head><body>
      <h1>Proposal: ${proposal.title}</h1>
      <div class="meta">Prepared for ${lead.businessName} | ${proposal.createdAt}</div>
      ${proposal.description ? `<p>${proposal.description}</p>` : ""}
      ${proposal.scope ? `<h2>Scope of Work</h2><p>${proposal.scope}</p>` : ""}
      ${proposal.deliverables ? `<h2>Deliverables</h2><p>${proposal.deliverables}</p>` : ""}
      ${proposal.timeline ? `<h2>Timeline</h2><p>${proposal.timeline}</p>` : ""}
      <h2>Pricing</h2>
      <table><tr><th>Item</th><th style="text-align:right">Amount</th></tr>
      ${proposal.pricing.map((p: { label: string; amount: number }) => `<tr><td>${p.label}</td><td style="text-align:right">$${p.amount.toLocaleString()}</td></tr>`).join("")}
      <tr><td style="font-weight:700">Total</td><td style="text-align:right;font-weight:700">$${proposal.pricing.reduce((s: number, p: { label: string; amount: number }) => s + p.amount, 0).toLocaleString()}</td></tr>
      </table>
      ${proposal.notes ? `<h2>Notes</h2><p>${proposal.notes}</p>` : ""}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }, [lead, proposal]);

  if (!lead) {
    return (
      <div className="w-full pt-8 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-4">info</span>
        <p className="text-secondary">Lead not found.</p>
        <Link href="/leads" className="text-primary hover:underline mt-4 inline-block">Back to Leads</Link>
      </div>
    );
  }

  const totalPricing = proposal ? proposal.pricing.reduce((s: number, p: { label: string; amount: number }) => s + p.amount, 0) : 0;

  return (
    <>
      <NewProposalModal
        open={showAddProposal}
        onOpenChange={(open) => { if (!open) router.push(`/leads/${lead.id}`); }}
        leadId={lead.id}
      />
      <NewClientModal
        open={showConvertClient}
        onOpenChange={(open) => { if (!open) router.push(`/leads/${lead.id}`); }}
        leadId={lead.id}
      />
      <NewProjectModal
        open={showNewProject}
        onOpenChange={setShowNewProject}
        preSelectedType="lead"
        preSelectedId={lead.id}
      />

      <div className="w-full space-y-8 pt-8 pb-24 md:pb-8">
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-headline-lg-mobile md:text-display font-display font-black text-primary mb-2">{lead.businessName}</h1>
              <div className="flex flex-wrap items-center gap-4 text-label-sm font-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Lead Owner: Alex Jensen
                </span>
                <span className="w-1 h-1 rounded-full bg-surface-variant"></span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  {lead.createdAt}
                </span>
                <span className="w-1 h-1 rounded-full bg-surface-variant"></span>
                <div className="relative">
                  <span className="bg-surface-container-high px-2 py-1 rounded-full text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pending</span>
                    Status: {STAGES.find((s) => s.key === lead.stage)?.label || lead.stage}
                  </span>
                  <button
                    onClick={() => setShowStageMenu(!showStageMenu)}
                    className="ml-2 border-2 border-surface-container-highest text-primary text-label-sm font-label-sm px-4 py-1 rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    Change Status
                  </button>
                  {showStageMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-surface-bright border border-surface-container-high rounded-2xl shadow-lg p-2 min-w-[180px] z-20 space-y-1">
                      {STAGES.filter((s) => s.key !== lead.stage).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => { updateLeadStage(lead.id, s.key); setShowStageMenu(false); }}
                          className="w-full text-left px-4 py-2 rounded-xl text-label-sm font-label-sm text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {editing ? (
                <>
                  <button onClick={saveEditing} className="bg-primary text-on-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors active:scale-95 cursor-pointer">Save</button>
                  <button onClick={() => setEditing(false)} className="border-2 border-surface-container-highest text-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer">Cancel</button>
                </>
              ) : (
                <button onClick={startEditing} className="border-2 border-surface-container-highest text-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer">
                  Edit Details
                </button>
              )}
              <button onClick={() => router.push(`/leads/${lead.id}?add-proposal=true`)} className="border-2 border-surface-container-highest text-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Proposal
              </button>
              <button onClick={() => setShowNewProject(true)} className="border-2 border-surface-container-highest text-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-surface-container-low transition-colors active:scale-95 flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Project
              </button>
              <button onClick={() => router.push(`/leads/${lead.id}?convert-client=true`)} className="bg-primary text-on-primary text-label-md font-label-md px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors active:scale-95 cursor-pointer">
                Convert to Client
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest border border-surface-container-high rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container pb-4">
                <h2 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">description</span>
                  Lead Details
                </h2>
              </div>
              {editing ? (
                <div className="space-y-4">
                  {(["businessName", "email", "phone", "source", "website", "notes"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-label-sm font-label-sm text-secondary block mb-1 capitalize">{field === "businessName" ? "Business Name" : field}</label>
                      {field === "notes" ? (
                        <textarea value={editFields[field]} onChange={(e) => setEditFields({ ...editFields, [field]: e.target.value })} className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary" rows={3} />
                      ) : (
                        <input value={editFields[field]} onChange={(e) => setEditFields({ ...editFields, [field]: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container p-6 rounded-2xl mb-6">
                  <h3 className="text-headline-md text-[20px] font-bold text-primary mb-2">{lead.businessName}</h3>
                  <div className="space-y-3 text-body-md font-body-md text-on-surface-variant">
                    <p><span className="text-secondary font-semibold">Email:</span> {lead.email || "—"}</p>
                    <p><span className="text-secondary font-semibold">Phone:</span> {lead.phone || "—"}</p>
                    <p><span className="text-secondary font-semibold">Source:</span> {lead.source || "—"}</p>
                    <p><span className="text-secondary font-semibold">Website:</span> {lead.hasWebsite ? lead.website : "No website"}</p>
                    {lead.notes && <p><span className="text-secondary font-semibold">Notes:</span> {lead.notes}</p>}
                    {lead.socials.length > 0 && (
                      <div>
                        <span className="text-secondary font-semibold">Socials:</span>
                        <ul className="mt-1 space-y-1">
                          {lead.socials.map((s, i) => (
                            <li key={i}>{s.platform}: {s.url}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="bg-surface-container-lowest border border-surface-container-high rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-6 border-b border-surface-container pb-4">
                <h2 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">request_quote</span>
                  Pricing Breakdown
                </h2>
                {proposal && (
                  <div className="flex items-center gap-2">
                    <button onClick={openPricingEditor} className="border-2 border-surface-container-highest text-primary text-label-sm font-label-sm px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">edit</span> Edit Pricing
                    </button>
                    <button onClick={handlePrintPDF} className="border-2 border-surface-container-highest text-primary text-label-sm font-label-sm px-4 py-1.5 rounded-full hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">download</span> PDF
                    </button>
                  </div>
                )}
              </div>
              {!proposal ? (
                <div className="text-center py-12 text-secondary flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                  <p className="text-body-md font-body-md">Waiting for proposal</p>
                  <button onClick={() => router.push(`/leads/${lead.id}?add-proposal=true`)} className="bg-primary text-on-primary text-label-sm font-label-sm px-6 py-2.5 rounded-full hover:bg-primary-container transition-colors cursor-pointer">
                    Create Proposal
                  </button>
                </div>
              ) : editPricing ? (
                <div className="space-y-4">
                  {pricingItems.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <input value={item.label} onChange={(e) => { const next = [...pricingItems]; next[i] = { ...next[i], label: e.target.value }; setPricingItems(next); }} className="flex-1 h-12 px-4 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary" placeholder="Item name" />
                      <input value={item.amount} onChange={(e) => { const next = [...pricingItems]; next[i] = { ...next[i], amount: Number(e.target.value) || 0 }; setPricingItems(next); }} type="number" className="w-32 h-12 px-4 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary" placeholder="0" />
                      <button onClick={() => setPricingItems(pricingItems.filter((_, j) => j !== i))} className="text-error cursor-pointer">
                        <span className="material-symbols-outlined">remove_circle</span>
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setPricingItems([...pricingItems, { label: "", amount: 0 }])} className="text-primary text-label-sm font-label-sm flex items-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add item
                  </button>
                  <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                    <button onClick={() => setEditPricing(false)} className="border-2 border-surface-container-highest text-primary text-label-sm font-label-sm px-6 py-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
                    <button onClick={savePricing} className="bg-primary text-on-primary text-label-sm font-label-sm px-6 py-2 rounded-full hover:bg-primary-container transition-colors cursor-pointer">Save Pricing</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {proposal.pricing.map((item: { label: string; amount: number }) => (
                    <div key={item.label} className="flex justify-between items-center py-3 border-b border-surface-container-low">
                      <span className="text-body-md font-body-md text-on-surface-variant">{item.label}</span>
                      <span className="text-label-md font-label-md text-primary">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 mt-2">
                    <span className="text-headline-md text-[20px] font-bold text-primary">Total Estimated</span>
                    <span className="text-headline-md text-[24px] font-black text-primary">${totalPricing.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-surface-container-lowest border border-surface-container-high rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
                <h3 className="text-headline-md font-headline-md text-primary">Projects</h3>
              </div>
              {leadProjects.length === 0 ? (
                <div className="text-center py-6 text-secondary flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                  <p className="text-body-md font-body-md">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leadProjects.map((proj) => (
                    <div key={proj.id} className="p-5 bg-surface-container-low rounded-2xl border border-surface-container">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-label-md font-label-md text-primary font-bold">{proj.name}</h4>
                        {proj.pricing > 0 && (
                          <span className="text-label-md font-label-md text-primary font-bold">${proj.pricing.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-label-sm font-label-sm text-secondary mb-2">
                        {proj.dueDate && <span>Due {proj.dueDate}</span>}
                        <span>Assigned to {proj.assignees.map((a) => ({ alex: "Alex", diego: "Diego", pablo: "Pablo" })[a]).join(", ")}</span>
                      </div>
                      {proj.notes && <p className="text-body-md font-body-md text-on-surface-variant text-sm mt-2">{proj.notes}</p>}
                      <p className="text-label-sm font-label-sm text-secondary mt-2">Created {proj.createdAt}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <section className="bg-surface-container-lowest border border-surface-container-high rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-headline-md font-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">linear_scale</span>
                Onboarding
              </h2>
              <div className="relative border-l-2 border-surface-container ml-3 space-y-8 pb-4">
                {[
                  { label: "Lead Created", done: true, date: lead.createdAt },
                  { label: "Contact & Qualify", done: lead.stage !== "new", date: lead.stage === "reached" ? "Contacted" : "" },
                  { label: "Proposal Sent", done: !!proposal, date: proposal?.createdAt },
                  { label: "Closed Won", done: lead.stage === "won" || lead.stage === "lost", date: lead.stage === "won" ? "Won" : lead.stage === "lost" ? "Lost" : "" },
                ].map((step, i) => (
                  <div key={i} className="relative pl-6" style={{ opacity: step.done ? 1 : 0.5 }}>
                    <div className={`absolute w-4 h-4 ${step.done ? "bg-primary" : "bg-surface-container"} rounded-full -left-[9px] top-1 border-2 border-surface-container-lowest`}></div>
                    <h4 className="text-label-md font-label-md text-primary mb-1">{step.label}</h4>
                    {step.date && <p className="text-label-sm font-label-sm text-on-surface-variant">{step.date}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest border border-surface-container-high rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-headline-md font-headline-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">contact_page</span>
                Contact Info
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-lg">
                    {lead.businessName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-label-md font-label-md text-primary">{lead.businessName}</h4>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{lead.source || "Lead"}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="block text-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Email</span>
                    <a className="text-body-md font-body-md text-primary hover:underline" href={`mailto:${lead.email}`}>{lead.email || "—"}</a>
                  </div>
                  <div>
                    <span className="block text-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Phone</span>
                    <a className="text-body-md font-body-md text-primary hover:underline" href={`tel:${lead.phone}`}>{lead.phone || "—"}</a>
                  </div>
                  {lead.hasWebsite && (
                    <div>
                      <span className="block text-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Website</span>
                      <a className="text-body-md font-body-md text-primary flex items-center gap-1 hover:underline" href="#">
                        {lead.website}
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default function IndividualLeadPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <LeadDetail params={props.params} />
    </Suspense>
  );
}
