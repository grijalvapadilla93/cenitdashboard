"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import NewLeadModal from "@/components/modals/new-lead-modal";
import NewProposalModal from "@/components/modals/new-proposal-modal";

function LeadsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { leads, updateLeadStage } = useStore();
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(stage);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOver(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      updateLeadStage(leadId, stage);
    }
  }, [updateLeadStage]);

  const showNewLead = searchParams.get("new-lead") === "true";
  const showNewProposal = searchParams.get("new-proposal") === "true";

  const stages = [
    { key: "new", label: "New Leads", count: leads.filter((l) => l.stage === "new").length },
    { key: "reached", label: "Reached Out", count: leads.filter((l) => l.stage === "reached").length },
    { key: "proposal", label: "Proposal", count: leads.filter((l) => l.stage === "proposal").length },
    { key: "won", label: "Won", count: leads.filter((l) => l.stage === "won").length },
    { key: "lost", label: "Lost", count: 0 },
  ];

  return (
    <div className="w-full pt-8">
      <NewLeadModal
        open={showNewLead}
        onOpenChange={(open) => {
          if (!open) router.push("/leads");
        }}
      />
      <NewProposalModal
        open={showNewProposal}
        onOpenChange={(open) => {
          if (!open) router.push("/leads");
        }}
      />

      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-display font-display text-primary mb-2">Lead Pipeline</h1>
          <p className="text-body-lg font-body-lg text-secondary">Manage and track your current opportunities.</p>
        </div>
      </div>
      <div className="flex gap-8 pb-6 overflow-x-auto" style={{ scrollSnapType: "x mandatory" }}>
        {stages.map((stage) => (
          <div
            key={stage.key}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
            className={`flex-[0_0_320px] flex flex-col gap-4 transition-colors ${dragOver === stage.key ? "bg-primary/5 rounded-[32px] -mx-2 px-2" : ""}`}
            style={{ scrollSnapAlign: "start" }}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-primary">
              <h3 className="text-headline-md font-headline-md text-primary flex items-center gap-2">
                {stage.label}
                <span className="bg-surface-container-low text-secondary text-label-sm font-label-sm px-2 py-1 rounded-full">{stage.count}</span>
              </h3>
            </div>
            {stage.key === "new" && (
              <Link
                href="/leads?new-lead=true"
                className="w-full py-4 border-2 border-dashed border-outline-variant rounded-card text-secondary hover:bg-surface-container-low hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-label-md font-label-md"
              >
                <span className="material-symbols-outlined">add</span>
                Add Lead
              </Link>
            )}
            {leads
              .filter((l) => l.stage === stage.key)
              .map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-surface-container-lowest rounded-[32px] p-6 border border-surface-container-high hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)] transition-all flex flex-col gap-4 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary font-bold">
                        {lead.businessName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-label-md font-label-md text-primary group-hover:text-on-primary-fixed-variant transition-colors">
                          {lead.businessName}
                        </h4>
                        <p className="text-label-sm font-label-sm text-secondary">{lead.source || "—"}</p>
                      </div>
                    </div>
                    <button className="text-outline-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                      <span className="material-symbols-outlined">more_horiz</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="bg-surface-container-low text-secondary text-label-sm font-label-sm px-3 py-1 rounded-full uppercase tracking-wider">
                      {lead.stage === "new" ? "New" : lead.stage === "reached" ? "Reached" : lead.stage === "proposal" ? "Proposal" : lead.stage === "won" ? "Won" : "Lost"}
                    </span>
                    <span className="text-label-sm font-label-sm text-secondary">{lead.createdAt}</span>
                  </div>
                </Link>
              ))}
            {stage.key === "lost" && (
              <div className="w-full py-12 border-2 border-dashed border-outline-variant rounded-[32px] text-outline-variant flex flex-col items-center justify-center gap-2 bg-surface-container-lowest/50">
                <span className="material-symbols-outlined text-3xl">inbox</span>
                <span className="text-label-sm font-label-sm">No recent losses</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsContent />
    </Suspense>
  );
}
