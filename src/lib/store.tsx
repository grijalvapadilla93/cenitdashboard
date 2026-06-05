"use client";

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

export interface SocialLink {
  platform: "instagram" | "facebook" | "twitter" | "linkedin" | "none";
  url: string;
}

export interface Lead {
  id: string;
  businessName: string;
  phone: string;
  email: string;
  socials: SocialLink[];
  source: string;
  notes: string;
  website: string;
  hasWebsite: boolean;
  stage: string;
  createdAt: string;
}

export interface Client {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  website: string;
  package: string;
  buildFee: number;
  monthlyFee: number;
  notes: string;
  createdAt: string;
}

export interface Document {
  id: string;
  clientId: string;
  leadId?: string;
  name: string;
  type: "contract" | "sow" | "nda" | "attachment" | "project";
  content?: string;
  fileData?: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt: string;
  sentTo?: string;
  sentAt?: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  title: string;
  description: string;
  scope: string;
  deliverables: string;
  timeline: string;
  pricing: { label: string; amount: number }[];
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  entityId: string;
  entityType: "lead" | "client";
  name: string;
  pricing: number;
  dueDate: string;
  notes: string;
  assignees: Exclude<Assignee, "available">[];
  createdAt: string;
}

export type Assignee = "available" | "alex" | "diego" | "pablo";

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  assignedTo: Assignee;
  notes: string;
  status: "available" | "in-progress" | "completed";
  completedNotes?: string;
  completedAt?: string;
  returnedNotes?: string;
}

const personLabels: Record<Exclude<Assignee, "available">, string> = {
  alex: "Alex R.",
  diego: "Diego M.",
  pablo: "Pablo S.",
};

export interface Activity {
  id: string;
  action: string;
  entityType: string;
  entityName: string;
  user: string;
  timestamp: string;
}

export function assigneeLabel(a: Assignee): string {
  if (a === "available") return "Available";
  return personLabels[a];
}

interface StoreContextType {
  leads: Lead[];
  clients: Client[];
  tasks: Task[];
  proposals: Proposal[];
  documents: Document[];
  projects: Project[];
  activities: Activity[];
  addActivity: (action: string, entityType: string, entityName: string, user?: string) => void;
  addProject: (project: Omit<Project, "id" | "createdAt">) => Project;
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "stage">) => Lead;
  addClient: (client: Omit<Client, "id" | "createdAt">) => Client;
  convertLeadToClient: (leadId: string, overrides?: Partial<Omit<Client, "id" | "createdAt">>) => Client | null;
  updateLeadStage: (leadId: string, stage: string) => void;
  updateLead: (leadId: string, data: Partial<Omit<Lead, "id">>) => void;
  updateClient: (clientId: string, data: Partial<Omit<Client, "id">>) => void;
  addProposal: (proposal: Omit<Proposal, "id" | "createdAt">) => Proposal;
  updateProposalPricing: (proposalId: string, pricing: { label: string; amount: number }[]) => void;
  addDocument: (doc: Omit<Document, "id" | "uploadedAt">) => Document;
  updateDocument: (docId: string, data: Partial<Document>) => void;
  deleteDocument: (docId: string) => void;
  addTask: (task: Omit<Task, "id">) => Task;
  pickUpTask: (taskId: string, person: Exclude<Assignee, "available">) => void;
  completeTask: (taskId: string, completedNotes: string) => void;
  returnToAvailable: (taskId: string, notes: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([
    { id: "1", businessName: "Acme Corp", phone: "+1 (555) 019-2837", email: "jane@acmecorp.com", socials: [], source: "Website", notes: "", website: "acmecorp.com", hasWebsite: true, stage: "new", createdAt: "2024-10-20" },
    { id: "2", businessName: "Global Tech", phone: "+1 (555) 019-2838", email: "mike@globaltech.com", socials: [], source: "Referral", notes: "", website: "globaltech.com", hasWebsite: true, stage: "new", createdAt: "2024-10-19" },
    { id: "3", businessName: "Metro Solutions", phone: "+1 (555) 019-2839", email: "info@metrosolutions.com", socials: [], source: "LinkedIn", notes: "", website: "", hasWebsite: false, stage: "new", createdAt: "2024-10-18" },
    { id: "4", businessName: "Nexus Inc", phone: "+1 (555) 019-2840", email: "hello@nexusinc.com", socials: [], source: "Website", notes: "", website: "nexusinc.com", hasWebsite: true, stage: "reached", createdAt: "2024-10-17" },
    { id: "5", businessName: "Pulse Media", phone: "+1 (555) 019-2841", email: "info@pulsemedia.com", socials: [], source: "Twitter", notes: "", website: "pulsemedia.com", hasWebsite: true, stage: "reached", createdAt: "2024-10-16" },
    { id: "6", businessName: "Vortex", phone: "+1 (555) 019-2842", email: "contact@vortex.com", socials: [], source: "Referral", notes: "", website: "vortex.com", hasWebsite: true, stage: "proposal", createdAt: "2024-10-15" },
    { id: "7", businessName: "Omega LLC", phone: "+1 (555) 019-2843", email: "info@omegallic.com", socials: [], source: "Website", notes: "", website: "omegallic.com", hasWebsite: true, stage: "won", createdAt: "2024-10-14" },
  ]);

  const [clients, setClients] = useState<Client[]>([
    { id: "1", businessName: "Acme Corporation", ownerName: "Jane Smith", email: "jane.smith@acmecorp.com", phone: "+1 (555) 019-2837", website: "acmecorp.com", package: "Enterprise", buildFee: 12000, monthlyFee: 3000, notes: "", createdAt: "2024-08-15" },
    { id: "2", businessName: "Globex Inc.", ownerName: "John Doe", email: "john@globex.com", phone: "+1 (555) 019-2845", website: "globex.com", package: "Pro", buildFee: 8000, monthlyFee: 2000, notes: "", createdAt: "2024-09-01" },
    { id: "3", businessName: "Initech", ownerName: "Bill Lumbergh", email: "bill@initech.com", phone: "+1 (555) 019-2846", website: "initech.com", package: "Basic", buildFee: 5000, monthlyFee: 1000, notes: "", createdAt: "2024-09-10" },
    { id: "4", businessName: "Stark Industries", ownerName: "Tony Stark", email: "tony@stark.com", phone: "+1 (555) 019-2847", website: "starkindustries.com", package: "Enterprise", buildFee: 25000, monthlyFee: 5000, notes: "", createdAt: "2024-07-01" },
    { id: "5", businessName: "Wayne Enterprises", ownerName: "Bruce Wayne", email: "bruce@wayne.com", phone: "+1 (555) 019-2848", website: "wayne.com", package: "Pro", buildFee: 15000, monthlyFee: 4000, notes: "", createdAt: "2024-06-15" },
    { id: "6", businessName: "Oscorp", ownerName: "Norman Osborn", email: "norman@oscorp.com", phone: "+1 (555) 019-2849", website: "oscorp.com", package: "Basic", buildFee: 7000, monthlyFee: 1500, notes: "", createdAt: "2024-09-20" },
  ]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const idRef = useRef(0);
  const nextId = useCallback(() => {
    idRef.current += 1;
    return Date.now() * 1000 + idRef.current;
  }, []);
  const [activities, setActivities] = useState<Activity[]>([
    { id: "a1", action: "Created lead", entityType: "lead", entityName: "Acme Corp", user: "Alex J.", timestamp: "2024-10-20 09:15" },
    { id: "a2", action: "Sent invoice", entityType: "invoice", entityName: "Stark Industries", user: "Diego M.", timestamp: "2024-10-20 10:30" },
    { id: "a3", action: "Updated client", entityType: "client", entityName: "Globex Inc.", user: "Pablo S.", timestamp: "2024-10-20 11:00" },
    { id: "a4", action: "Completed task", entityType: "task", entityName: "Initial kickoff meeting", user: "Alex J.", timestamp: "2024-10-19 16:45" },
    { id: "a5", action: "Created contract", entityType: "contract", entityName: "Master Service Agreement", user: "Diego M.", timestamp: "2024-10-19 14:20" },
  ]);
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", name: "Finalize design system components", dueDate: "2024-10-25", assignedTo: "diego", notes: "Complete all remaining component variants", status: "in-progress" },
    { id: "t2", name: "Setup staging environment", dueDate: "", assignedTo: "alex", notes: "Configure AWS and deploy latest build", status: "in-progress" },
    { id: "t3", name: "Update API docs", dueDate: "", assignedTo: "pablo", notes: "", status: "in-progress" },
    { id: "t4", name: "Client kickoff prep", dueDate: "2024-10-26", assignedTo: "alex", notes: "Prepare agenda and presentation", status: "in-progress" },
    { id: "t5", name: "Review client feedback", dueDate: "", assignedTo: "available", notes: "", status: "available" },
    { id: "t6", name: "Draft weekly update", dueDate: "", assignedTo: "available", notes: "", status: "available" },
    { id: "t7", name: "Initial kickoff meeting", dueDate: "", assignedTo: "diego", notes: "", status: "completed", completedNotes: "Meeting went well", completedAt: "2024-10-22" },
    { id: "t8", name: "Sign non-disclosure agreements", dueDate: "", assignedTo: "alex", notes: "", status: "completed", completedNotes: "Signed by both parties", completedAt: "2024-10-21" },
  ]);

  const addActivity = useCallback((action: string, entityType: string, entityName: string, user = "Alex J.") => {
    const newActivity: Activity = {
      id: String(nextId()),
      action,
      entityType,
      entityName,
      user,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
    setActivities((prev) => [newActivity, ...prev]);
  }, [nextId]);

  const addLead = useCallback((lead: Omit<Lead, "id" | "createdAt" | "stage">) => {
    const newLead: Lead = { ...lead, id: String(Date.now()), stage: "new", createdAt: new Date().toISOString().split("T")[0] };
    setLeads((prev) => [...prev, newLead]);
    addActivity("Created lead", "lead", newLead.businessName);
    return newLead;
  }, [addActivity]);

  const addClient = useCallback((client: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = { ...client, id: String(Date.now()), createdAt: new Date().toISOString().split("T")[0] };
    setClients((prev) => [...prev, newClient]);
    addActivity("Created client", "client", newClient.businessName);
    return newClient;
  }, [addActivity]);

  const convertLeadToClient = useCallback((leadId: string, overrides?: Partial<Omit<Client, "id" | "createdAt">>) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;
    const newClient: Client = {
      id: String(Date.now()),
      businessName: overrides?.businessName || lead.businessName,
      ownerName: overrides?.ownerName || "",
      email: overrides?.email || lead.email,
      phone: overrides?.phone || lead.phone,
      website: overrides?.website || lead.website,
      package: overrides?.package || "Basic",
      buildFee: overrides?.buildFee ?? 0,
      monthlyFee: overrides?.monthlyFee ?? 0,
      notes: overrides?.notes || "",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [...prev, newClient]);
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: "won" } : l)));
    setDocuments((prev) => prev.map((d) => d.leadId === leadId ? { ...d, clientId: newClient.id, leadId: undefined } : d));
    addActivity("Converted lead to client", "client", newClient.businessName);
    return newClient;
  }, [leads, addActivity]);

  const updateLeadStage = useCallback((leadId: string, stage: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    const lead = leads.find((l) => l.id === leadId);
    if (lead) addActivity(`Moved to ${stage}`, "lead", lead.businessName);
  }, [leads, addActivity]);

  const updateLead = useCallback((leadId: string, data: Partial<Omit<Lead, "id">>) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, ...data } : l)));
    const lead = leads.find((l) => l.id === leadId);
    if (lead) addActivity("Updated lead details", "lead", lead.businessName);
  }, [leads, addActivity]);

  const updateClient = useCallback((clientId: string, data: Partial<Omit<Client, "id">>) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, ...data } : c)));
    const client = clients.find((c) => c.id === clientId);
    if (client) addActivity("Updated client profile", "client", client.businessName);
  }, [clients, addActivity]);

  const addProposal = useCallback((proposal: Omit<Proposal, "id" | "createdAt">) => {
    const newProposal: Proposal = { ...proposal, id: String(Date.now()), createdAt: new Date().toISOString().split("T")[0] };
    setProposals((prev) => [...prev, newProposal]);
    addActivity("Created proposal", "proposal", newProposal.title);
    return newProposal;
  }, [addActivity]);

  const updateProposalPricing = useCallback((proposalId: string, pricing: { label: string; amount: number }[]) => {
    setProposals((prev) => prev.map((p) => (p.id === proposalId ? { ...p, pricing } : p)));
  }, []);

  const addProject = useCallback((proj: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = { ...proj, id: String(nextId()), createdAt: new Date().toISOString().split("T")[0] };
    setProjects((prev) => [...prev, newProject]);
    addActivity("Created project", "project", newProject.name);
    return newProject;
  }, [addActivity, nextId]);

  const addDocument = useCallback((doc: Omit<Document, "id" | "uploadedAt">) => {
    const newDoc: Document = { ...doc, id: String(Date.now()), uploadedAt: new Date().toISOString().split("T")[0] };
    setDocuments((prev) => [...prev, newDoc]);
    addActivity(`Added ${doc.type}`, "document", doc.name);
    return newDoc;
  }, [addActivity]);

  const updateDocument = useCallback((docId: string, data: Partial<Document>) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, ...data } : d)));
    if (data.sentTo) {
      const doc = documents.find((d) => d.id === docId);
      if (doc) addActivity(`Sent ${doc.type} to ${data.sentTo}`, "document", doc.name);
    }
  }, [documents, addActivity]);

  const deleteDocument = useCallback((docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    const newTask: Task = { ...task, id: String(Date.now()) };
    setTasks((prev) => [...prev, newTask]);
    addActivity("Created task", "task", newTask.name);
    return newTask;
  }, [addActivity]);

  const pickUpTask = useCallback((taskId: string, person: Exclude<Assignee, "available">) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, assignedTo: person, status: "in-progress" } : t)));
    const task = tasks.find((t) => t.id === taskId);
    if (task) addActivity("Picked up task", "task", task.name, personLabels[person]);
  }, [tasks, addActivity]);

  const completeTask = useCallback((taskId: string, completedNotes: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "completed", completedNotes, completedAt: new Date().toISOString().split("T")[0] } : t)));
    const task = tasks.find((t) => t.id === taskId);
    if (task) addActivity("Completed task", "task", task.name);
  }, [tasks, addActivity]);

  const returnToAvailable = useCallback((taskId: string, notes: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: "available", assignedTo: "available", returnedNotes: notes } : t)));
    const task = tasks.find((t) => t.id === taskId);
    if (task) addActivity("Returned task to available", "task", task.name);
  }, [tasks, addActivity]);

  return (
    <StoreContext.Provider value={{ leads, clients, tasks, proposals, documents, projects, activities, addActivity, addProject, addLead, addClient, convertLeadToClient, updateLeadStage, updateLead, updateClient, addProposal, updateProposalPricing, addDocument, updateDocument, deleteDocument, addTask, pickUpTask, completeTask, returnToAvailable }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within AppProvider");
  return ctx;
}
