"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useStore, type Task, type Assignee } from "@/lib/store";
import NewInvoiceModal from "@/components/modals/new-invoice-modal";
import NewTaskModal from "@/components/modals/new-task-modal";
import TaskDetailModal from "@/components/modals/task-detail-modal";

const persons: { key: Exclude<Assignee, "available">; label: string; initial: string }[] = [
  { key: "alex", label: "Alex", initial: "A" },
  { key: "diego", label: "Diego", initial: "D" },
  { key: "pablo", label: "Pablo", initial: "P" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tasks } = useStore();
  const showInvoice = searchParams.get("new-invoice") === "true";
  const showNewTask = searchParams.get("new-task") === "true";
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activePerson, setActivePerson] = useState<Exclude<Assignee, "available">>("alex");

  const availableTasks = tasks.filter((t) => t.status === "available");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="w-full space-y-8 pt-8">
      <NewInvoiceModal
        open={showInvoice}
        onOpenChange={(open) => {
          if (!open) router.push("/dashboard");
        }}
      />
      <NewTaskModal
        open={showNewTask}
        onOpenChange={(open) => {
          if (!open) router.push("/dashboard");
        }}
      />
      <TaskDetailModal
        task={selectedTask}
        open={showDetail}
        onOpenChange={(open) => {
          setShowDetail(open);
          if (!open) setSelectedTask(null);
        }}
      />

      <section className="flex flex-wrap items-center gap-4">
        <h2 className="text-headline-md font-headline-md text-on-surface mr-4 hidden lg:block">Quick Actions</h2>
        <Link
          href="/leads?new-lead=true"
          className="py-3 px-6 bg-primary text-on-primary rounded-full text-label-md font-label-md hover:bg-surface-tint transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
        >
          Create New Lead
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
        <Link
          href="/clients?new-client=true"
          className="py-3 px-6 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-full text-label-md font-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 group whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          New Client
        </Link>
        <Link
          href="/dashboard?new-invoice=true"
          className="py-3 px-6 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-full text-label-md font-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 group whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">receipt</span>
          New Invoice
        </Link>
        <Link
          href="/leads?new-proposal=true"
          className="py-3 px-6 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-full text-label-md font-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 group whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">description</span>
          New Proposal
        </Link>
        <Link
          href="/clients?send-contract=true"
          className="py-3 px-6 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-full text-label-md font-label-md hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 group whitespace-nowrap shadow-sm hover:shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          Send Contract
        </Link>
      </section>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-surface-container-lowest p-8 rounded-[32px] border border-surface-variant shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-headline-md font-headline-md text-on-surface">Leads Pipeline</h2>
            <button className="text-secondary hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
          <div className="flex gap-6 h-full overflow-hidden">
            <div className="flex-1 flex flex-col bg-surface-container-low rounded-[24px] p-4 overflow-hidden">
              <h3 className="text-label-md font-label-md text-secondary mb-4 uppercase tracking-wider px-2">New Leads</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {["Acme Corp Redesign", "Stark Ind. Dashboard", "Wayne Ent. Mobile"].map((name, i) => (
                  <Link key={i} href={`/leads/${i + 1}`} className="block bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant hover:shadow-md transition-shadow cursor-pointer">
                    <p className="text-label-md font-label-md text-on-surface mb-1">{name}</p>
                    <p className="text-body-md font-body-md text-secondary text-sm">
                      {["Enterprise Web App", "Data Analytics UI", "iOS Application"][i]}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-surface-container-low rounded-[24px] p-4 overflow-hidden">
              <h3 className="text-label-md font-label-md text-secondary mb-4 uppercase tracking-wider px-2">In Progress</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                  <p className="text-label-md font-label-md text-on-surface mb-1">Globex Branding</p>
                  <p className="text-body-md font-body-md text-secondary text-sm">Identity System</p>
                  <div className="mt-3 flex">
                    <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-label-sm font-label-sm rounded-full border border-outline-variant">Proposal</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant hover:shadow-md transition-shadow cursor-pointer">
                  <p className="text-label-md font-label-md text-on-surface mb-1">Initech Portal</p>
                  <p className="text-body-md font-body-md text-secondary text-sm">Internal Tool</p>
                  <div className="mt-3 flex">
                    <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-label-sm font-label-sm rounded-full border border-outline-variant">Contacted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-[32px] border border-surface-variant shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-headline-md font-headline-md text-on-surface">Active Clients</h2>
            <Link href="/clients" className="text-label-sm font-label-sm text-primary uppercase tracking-wider hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { initial: "A", name: "Acme Corporation", plan: "Enterprise Plan" },
              { initial: "G", name: "Globex Inc.", plan: "Pro Plan" },
              { initial: "S", name: "Stark Industries", plan: "Enterprise Plan" },
              { initial: "W", name: "Wayne Enterprises", plan: "Basic Plan" },
            ].map((client, i) => (
              <Link
                key={i}
                href={`/clients/${i + 1}`}
                className="p-8 rounded-[24px] border border-surface-variant flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer bg-surface-bright group hover:border-outline-variant"
              >
                <div className="w-20 h-20 rounded-full bg-surface-container-low mb-6 flex items-center justify-center text-3xl font-bold text-primary group-hover:scale-105 transition-transform">
                  {client.initial}
                </div>
                <h3 className="text-label-md font-label-md text-on-surface">{client.name}</h3>
                <p className="text-body-md font-body-md text-secondary text-sm mt-2">{client.plan}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-surface-container-lowest p-8 rounded-[32px] border border-surface-variant shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-headline-md font-headline-md text-on-surface">Task Board</h2>
          </div>
          <div className="mb-8">
            <button onClick={() => router.push("/dashboard?new-task=true")} className="flex items-center gap-3 text-body-md font-body-md text-secondary hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Create a new task
            </button>
          </div>
          <div className="flex flex-col xl:flex-row gap-6 flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col bg-surface-container-low rounded-[24px] p-4 overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-label-md font-label-md text-secondary uppercase tracking-wider">Available</h3>
                <span className="text-label-sm font-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full">{availableTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {availableTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setShowDetail(true); }}
                    className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-variant flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <p className="text-label-md font-label-md text-on-surface">{task.name}</p>
                    {task.dueDate && <p className="text-label-sm font-label-sm text-secondary">Due {task.dueDate}</p>}
                  </div>
                ))}
                {availableTasks.length === 0 && (
                  <p className="text-body-md font-body-md text-secondary text-center py-8">No available tasks</p>
                )}
              </div>
            </div>
            <div className="flex-[2] flex flex-col bg-surface-container-low rounded-[24px] p-4 overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-label-md font-label-md text-secondary uppercase tracking-wider">In Progress</h3>
                <span className="text-label-sm font-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full">{tasks.filter((t) => t.status === "in-progress" && t.assignedTo === activePerson).length}</span>
              </div>
              <div className="flex gap-1 mb-4 p-1 bg-surface-container-high rounded-xl w-fit">
                {persons.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setActivePerson(p.key)}
                    className={`px-4 py-1.5 rounded-lg text-label-sm font-label-sm transition-all cursor-pointer ${activePerson === p.key ? "bg-surface-bright text-on-surface shadow-sm" : "text-secondary hover:text-on-surface"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {tasks.filter((t) => t.status === "in-progress" && t.assignedTo === activePerson).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setShowDetail(true); }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-surface-variant hover:border-primary transition-colors cursor-pointer bg-surface-container-lowest"
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-secondary flex-shrink-0 mt-0.5"></div>
                    <div className="flex-1">
                      <p className="text-label-md font-label-md text-on-surface leading-tight">{task.name}</p>
                      {task.dueDate && <p className="text-label-sm font-label-sm text-secondary mt-1">Due {task.dueDate}</p>}
                    </div>
                  </div>
                ))}
                {tasks.filter((t) => t.status === "in-progress" && t.assignedTo === activePerson).length === 0 && (
                  <p className="text-body-md font-body-md text-secondary text-center py-8">No tasks for {activePerson}</p>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col bg-surface-container-low rounded-[24px] p-4 overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-label-md font-label-md text-secondary uppercase tracking-wider">Completed</h3>
                <span className="text-label-sm font-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full">{completedTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => { setSelectedTask(task); setShowDetail(true); }}
                    className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-variant opacity-60 flex gap-3 cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    <div className="w-5 h-5 rounded-md border-2 border-primary bg-primary flex items-center justify-center flex-shrink-0 text-on-primary mt-0.5">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                    </div>
                    <div className="line-through">
                      <p className="text-label-md font-label-md text-on-surface leading-tight">{task.name}</p>
                    </div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <p className="text-body-md font-body-md text-secondary text-center py-8">No completed tasks</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
