"use client";

import { use, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import CreateContractModal from "@/components/modals/create-contract-modal";
import SendDocumentModal from "@/components/modals/send-document-modal";
import NewProjectModal from "@/components/modals/new-project-modal";

function ClientDetail(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clients, documents, projects, updateClient, updateDocument, deleteDocument, addDocument } = useStore();
  const client = clients.find((c) => c.id === params.id);
  const clientDocs = documents.filter((d) => d.clientId === params.id);
  const clientProjects = projects.filter((p) => p.entityId === params.id && p.entityType === "client");
  const hasContract = clientDocs.some((d) => d.type === "contract");

  const showCreateContract = searchParams.get("create-contract") === "true";
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ ownerName: "", email: "", phone: "", website: "", notes: "", package: "", buildFee: "", monthlyFee: "" });
  const [showNewProject, setShowNewProject] = useState(false);
  const [sendDocId, setSendDocId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<typeof clientDocs[0] | null>(null);
  const [editDoc, setEditDoc] = useState<typeof clientDocs[0] | null>(null);
  const [editDocContent, setEditDocContent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const startEditing = useCallback(() => {
    if (!client) return;
    setEditFields({
      ownerName: client.ownerName, email: client.email, phone: client.phone,
      website: client.website, notes: client.notes, package: client.package,
      buildFee: String(client.buildFee), monthlyFee: String(client.monthlyFee),
    });
    setEditing(true);
  }, [client]);

  const saveEditing = useCallback(() => {
    if (!client) return;
    updateClient(client.id, {
      ownerName: editFields.ownerName,
      email: editFields.email,
      phone: editFields.phone,
      website: editFields.website,
      notes: editFields.notes,
      package: editFields.package,
      buildFee: Number(editFields.buildFee) || 0,
      monthlyFee: Number(editFields.monthlyFee) || 0,
    });
    setEditing(false);
  }, [client, editFields, updateClient]);

  const handleViewDoc = useCallback((doc: typeof clientDocs[0]) => {
    if (doc.fileData) {
      setViewDoc(doc);
    } else if (doc.content) {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(`
        <html><head><title>${doc.name}</title>
        <style>body{font-family:'Inter',sans-serif;padding:40px;color:#1c1c1c;max-width:800px;margin:0 auto;line-height:1.6}
        h1{font-size:24px;margin-bottom:20px}pre{white-space:pre-wrap;font-family:inherit}</style>
        </head><body><h1>${doc.name}</h1><pre>${doc.content}</pre></body></html>
      `);
      win.document.close();
      win.focus();
    }
  }, []);

  const handleUploadDoc = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      addDocument({
        clientId: params.id,
        name: file.name.replace(/\.pdf$/i, ""),
        type: "attachment",
        fileData: reader.result as string,
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [params.id, addDocument]);

  const handleSaveEditDoc = useCallback(() => {
    if (!editDoc) return;
    updateDocument(editDoc.id, { content: editDocContent });
    setEditDoc(null);
    setEditDocContent("");
  }, [editDoc, editDocContent, updateDocument]);

  if (!client) {
    return (
      <div className="w-full pt-8 text-center">
        <span className="material-symbols-outlined text-4xl text-secondary mb-4">info</span>
        <p className="text-secondary">Client not found.</p>
        <Link href="/clients" className="text-primary hover:underline mt-4 inline-block">Back to Clients</Link>
      </div>
    );
  }

  return (
    <>
      <CreateContractModal
        open={showCreateContract}
        onOpenChange={(open) => { if (!open) router.push(`/clients/${client.id}`); }}
        clientId={client.id}
      />
      <SendDocumentModal
        open={!!sendDocId}
        onOpenChange={(open) => { if (!open) setSendDocId(null); }}
        documentId={sendDocId || ""}
        clientEmail={client.email}
      />
      <NewProjectModal
        open={showNewProject}
        onOpenChange={setShowNewProject}
        preSelectedType="client"
        preSelectedId={client.id}
      />

      <div className="w-full space-y-8 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-surface-container-highest text-primary text-label-sm font-label-sm rounded-full uppercase tracking-widest">Client</span>
              <span className="flex items-center gap-1 text-on-surface-variant text-label-sm font-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary block"></span> Active
              </span>
            </div>
            <h2 className="text-display font-display text-primary">{client.businessName}</h2>
          </div>
          <div className="flex gap-3">
            {editing ? (
              <>
                <button onClick={startEditing} className="px-6 py-3 rounded-full bg-primary text-on-primary text-label-md font-label-md hover:bg-primary-container transition-colors cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="px-6 py-3 rounded-full border-2 border-surface-container-highest text-label-md font-label-md text-primary hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={startEditing} className="px-6 py-3 rounded-full border-2 border-surface-container-highest text-label-md font-label-md text-primary hover:bg-surface-container-low transition-colors cursor-pointer">
                  Edit Profile
                </button>
                <button onClick={() => setShowNewProject(true)} className="px-6 py-3 rounded-full border-2 border-surface-container-highest text-label-md font-label-md text-primary hover:bg-surface-container-low transition-colors cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Project
                </button>
                <button onClick={() => router.push(`/clients/${client.id}?create-contract=true`)} className="px-6 py-3 rounded-full bg-primary text-on-primary text-label-md font-label-md hover:bg-surface-tint transition-colors cursor-pointer">
                  Create Contract
                </button>
              </>
            )}
          </div>
        </div>

        {!hasContract && (
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-2xl">info</span>
              <div>
                <p className="text-label-md font-label-md text-primary font-semibold">No contract yet</p>
                <p className="text-label-sm font-label-sm text-secondary">This client does not have a contract. Create one to get started.</p>
              </div>
            </div>
            <button onClick={() => router.push(`/clients/${client.id}?create-contract=true`)} className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-label-sm hover:bg-primary-container transition-colors cursor-pointer whitespace-nowrap">
              Create Contract
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
                <h3 className="text-headline-md font-headline-md text-primary">Client Details</h3>
              </div>
              {editing ? (
                <div className="space-y-4">
                  {([
                    { key: "ownerName", label: "Owner Name", type: "text" },
                    { key: "email", label: "Email", type: "text" },
                    { key: "phone", label: "Phone", type: "text" },
                    { key: "website", label: "Website", type: "text" },
                    { key: "package", label: "Package", type: "text" },
                    { key: "buildFee", label: "Build Fee ($)", type: "number" },
                    { key: "monthlyFee", label: "Monthly Fee ($)", type: "number" },
                  ] as const).map((f) => (
                    <div key={f.key}>
                      <label className="text-label-sm font-label-sm text-secondary block mb-1">{f.label}</label>
                      <input
                        value={editFields[f.key as keyof typeof editFields]}
                        onChange={(e) => setEditFields({ ...editFields, [f.key]: e.target.value })}
                        type={f.type}
                        className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-label-sm font-label-sm text-secondary block mb-1">Notes</label>
                    <textarea
                      value={editFields.notes}
                      onChange={(e) => setEditFields({ ...editFields, notes: e.target.value })}
                      className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-6 bg-surface-container-low rounded-2xl mb-4">
                    <h4 className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider mb-2">Business Info</h4>
                    <p className="text-headline-md font-headline-md text-primary mb-1">{client.businessName}</p>
                    <p className="text-body-md font-body-md text-on-surface-variant">
                      Owner: {client.ownerName || "—"} | Package: {client.package || "—"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-surface-container rounded-2xl">
                      <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block mb-1">Build Fee</span>
                      <span className="text-body-lg font-body-lg text-primary font-semibold">${client.buildFee?.toLocaleString() || "0"}</span>
                    </div>
                    <div className="p-4 border border-surface-container rounded-2xl">
                      <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block mb-1">Monthly Fee</span>
                      <span className="text-body-lg font-body-lg text-primary font-semibold">${client.monthlyFee?.toLocaleString() || "0"}/mo</span>
                    </div>
                  </div>
                  {client.notes && (
                    <div className="mt-4 p-4 bg-surface-container-low rounded-2xl">
                      <span className="text-label-sm font-label-sm text-on-surface-variant uppercase block mb-1">Notes</span>
                      <p className="text-body-md font-body-md text-primary">{client.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
                <h3 className="text-headline-md font-headline-md text-primary">Projects</h3>
              </div>
              {clientProjects.length === 0 ? (
                <div className="text-center py-6 text-secondary flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                  <p className="text-body-md font-body-md">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientProjects.map((proj) => (
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
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">folder_open</span>
                  <h3 className="text-headline-md font-headline-md text-primary">Documents</h3>
                </div>
                <label className="text-secondary text-label-md font-label-md hover:text-primary transition-colors cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload New
                  <input ref={fileRef} type="file" accept=".pdf" onChange={handleUploadDoc} className="hidden" />
                </label>
              </div>

              {clientDocs.length === 0 ? (
                <div className="text-center py-8 text-secondary flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-4xl">description</span>
                  <p className="text-body-md font-body-md">No documents yet</p>
                </div>
              ) : (
                clientDocs.map((doc) => (
                  <div key={doc.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl mb-4 ${doc.type === "contract" ? "bg-primary text-on-primary" : "bg-surface-container-low"}`}>
                    <div className="flex items-start gap-4 mb-4 sm:mb-0">
                      <div className={`p-3 rounded-xl ${doc.type === "contract" ? "bg-on-primary/10" : "bg-surface-container-high"}`}>
                        <span className={`material-symbols-outlined ${doc.type === "contract" ? "text-on-primary" : "text-primary"}`}>contract</span>
                      </div>
                      <div>
                        <h4 className={`text-headline-md font-headline-md font-bold mb-1 ${doc.type === "contract" ? "text-on-primary" : "text-primary"}`}>{doc.name}</h4>
                        <p className={`text-body-md font-body-md ${doc.type === "contract" ? "text-inverse-primary" : "text-on-surface-variant"}`}>
                          {doc.type === "contract" ? "Contract" : doc.type.toUpperCase()}
                          {doc.fileName && ` • ${doc.fileName}`}
                          {doc.fileSize && ` • ${doc.fileSize}`}
                          {doc.sentTo && ` • Sent to ${doc.sentTo}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDoc(doc)} className={`p-2 rounded-full transition-colors cursor-pointer ${doc.type === "contract" ? "bg-on-primary/10 hover:bg-on-primary/20 text-on-primary" : "bg-surface-container-high hover:bg-surface-container-highest text-primary"}`} title="View">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {doc.content !== undefined && (
                        <button
                          onClick={() => { setEditDoc(doc); setEditDocContent(doc.content || ""); }}
                          className={`p-2 rounded-full transition-colors cursor-pointer ${doc.type === "contract" ? "bg-on-primary/10 hover:bg-on-primary/20 text-on-primary" : "bg-surface-container-high hover:bg-surface-container-highest text-primary"}`}
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSendDocId(doc.id)}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${doc.type === "contract" ? "bg-on-primary/10 hover:bg-on-primary/20 text-on-primary" : "bg-surface-container-high hover:bg-surface-container-highest text-primary"}`}
                        title="Send"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this document?")) deleteDocument(doc.id); }}
                        className={`p-2 rounded-full transition-colors cursor-pointer ${doc.type === "contract" ? "bg-on-primary/10 hover:bg-on-primary/20 text-on-primary" : "bg-surface-container-high hover:bg-surface-container-highest text-primary"}`}
                        title="Delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                <h3 className="text-headline-md font-headline-md text-primary">Financial Status</h3>
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-2">Payment Model</span>
                  <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-surface-container-highest">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-label-md font-label-md text-primary font-bold">{client.monthlyFee > 0 ? "Monthly Retainer" : "One-Time"}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-surface-container">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Current MRR</span>
                  <span className="text-headline-lg font-headline-lg text-primary">${client.monthlyFee?.toLocaleString() || "0"}</span>
                </div>
                <div className="p-4 bg-surface-container-low rounded-2xl flex items-center justify-between">
                  <span className="text-label-md font-label-md text-secondary">Next Invoice</span>
                  <span className="text-label-md font-label-md text-primary font-bold">Nov 1, 2023</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container rounded-3xl p-8">
              <h3 className="text-headline-md font-headline-md text-primary mb-6">Client Info</h3>
              <div className="flex flex-col gap-5">
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Primary Contact</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                      {client.ownerName ? client.ownerName.split(" ").map((n) => n[0]).join("") : client.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-body-md font-body-md text-primary font-semibold">{client.ownerName || client.businessName}</p>
                      <p className="text-label-sm font-label-sm text-on-surface-variant">Owner</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-surface-container">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Email</span>
                  <a className="text-body-md font-body-md text-primary hover:underline" href={`mailto:${client.email}`}>{client.email || "—"}</a>
                </div>
                <div className="pt-4 border-t border-surface-container">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Phone</span>
                  <a className="text-body-md font-body-md text-primary hover:underline" href={`tel:${client.phone}`}>{client.phone || "—"}</a>
                </div>
                <div className="pt-4 border-t border-surface-container">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Website</span>
                  <span className="text-body-md font-body-md text-primary">{client.website || "—"}</span>
                </div>
                <div className="pt-4 border-t border-surface-container">
                  <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Created</span>
                  <span className="text-body-md font-body-md text-primary">{client.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewDoc && viewDoc.fileData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewDoc(null)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-label-md font-label-md text-primary">{viewDoc.name}</h3>
              <button onClick={() => setViewDoc(null)} className="p-2 hover:bg-surface-container-low rounded-full cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <iframe src={viewDoc.fileData} className="flex-1 w-full rounded-b-3xl" />
          </div>
        </div>
      )}

      {editDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setEditDoc(null); setEditDocContent(""); }}>
          <div className="bg-surface-bright rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-headline-md font-headline-md text-primary mb-4">Edit: {editDoc.name}</h3>
            <textarea value={editDocContent} onChange={(e) => setEditDocContent(e.target.value)} className="flex-1 w-full min-h-[300px] p-4 rounded-xl bg-surface-container-low border border-surface-variant text-body-md font-body-md text-primary font-mono" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setEditDoc(null); setEditDocContent(""); }} className="px-6 py-2.5 rounded-full border-2 border-surface-container-highest text-label-sm font-label-sm text-primary hover:bg-surface-container-low transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSaveEditDoc} className="px-6 py-2.5 rounded-full bg-primary text-on-primary text-label-sm font-label-sm hover:bg-primary-container transition-colors cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function IndividualClientPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ClientDetail params={props.params} />
    </Suspense>
  );
}
