"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useStore } from "@/lib/store";
import NewClientModal from "@/components/modals/new-client-modal";
import SendContractModal from "@/components/modals/send-contract-modal";

function ClientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clients } = useStore();

  const showNewClient = searchParams.get("new-client") === "true";
  const showSendContract = searchParams.get("send-contract") === "true";

  return (
    <div className="w-full pt-8">
      <NewClientModal
        open={showNewClient}
        onOpenChange={(open) => {
          if (!open) router.push("/clients");
        }}
      />
      <SendContractModal
        open={showSendContract}
        onOpenChange={(open) => {
          if (!open) router.push("/clients");
        }}
      />

      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-headline-lg font-headline-lg mb-2">Client Directory</h2>
          <p className="text-body-lg font-body-lg text-on-surface-variant">
            Manage your active client relationships and contracts.
          </p>
        </div>
        <Link
          href="/clients?new-client=true"
          className="bg-primary text-on-primary text-label-md font-label-md px-6 py-3 rounded-full hover:bg-surface-tint transition-colors duration-200 flex items-center gap-2 self-start md:self-auto"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
          New Client
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="bg-surface-container-lowest border border-outline-variant rounded-[32px] p-[32px] flex flex-col gap-6 hover:shadow-[0px_10px_30px_rgba(0,0,0,0.04)] hover:bg-surface-container-low transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                  <span className="text-3xl font-bold text-primary">{client.businessName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-headline-md font-headline-md leading-none">{client.businessName}</h3>
                  <p className="text-body-md font-body-md text-on-surface-variant mt-1">{client.package || "—"}</p>
                </div>
              </div>
              <span className="bg-surface-container-high text-on-surface text-label-sm font-label-sm px-3 py-1 rounded-full uppercase tracking-widest border border-outline-variant">
                {client.monthlyFee > 0 ? "Monthly" : "Paid"}
              </span>
            </div>
            <div className="mt-auto pt-6 border-t border-surface-container-high">
              <div className="w-full border-2 border-primary text-primary text-label-md font-label-md px-6 py-3 rounded-full hover:bg-surface-container-low transition-colors duration-200 cursor-pointer flex justify-center items-center gap-2">
                <span className="material-symbols-outlined">description</span>
                View Contract
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense>
      <ClientsContent />
    </Suspense>
  );
}
