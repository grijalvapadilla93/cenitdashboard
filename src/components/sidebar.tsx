"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import NewProjectModal from "@/components/modals/new-project-modal";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/leads", label: "Leads", icon: "leaderboard" },
  { href: "/clients", label: "Clients", icon: "group" },
];

const bottomItems = [
  { href: "#", label: "Archive", icon: "archive" },
];

const actionIcons: Record<string, string> = {
  lead: "leaderboard",
  client: "group",
  task: "checklist",
  proposal: "description",
  document: "description",
  contract: "contract",
  invoice: "receipt",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { activities } = useStore();
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <>
      <NewProjectModal open={showNewProject} onOpenChange={setShowNewProject} />

      <nav className="bg-surface-container-lowest border-r border-surface-variant h-screen w-64 fixed left-0 top-0 flex flex-col p-6 gap-8 z-20 hidden md:flex overflow-y-auto">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden flex items-center justify-center">
              <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary font-bold">H</div>
            </div>
            <div>
              <h1 className="text-headline-md font-headline-md text-primary">Hub Central</h1>
              <p className="text-label-sm font-label-sm text-secondary">Enterprise Suite</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full py-3 px-4 bg-primary text-on-primary rounded-full text-label-md font-label-md hover:bg-surface-tint transition-colors mb-8 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            New Project
          </button>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full text-label-md font-label-md transition-all duration-200 ease-in-out ${
                      isActive
                        ? "bg-primary text-on-primary"
                        : "text-secondary hover:bg-surface-container"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-4 flex-1 overflow-hidden flex flex-col">
          <h3 className="text-label-sm font-label-sm text-secondary uppercase tracking-wider mb-4 px-4">Recent Activity</h3>
          <ul className="flex flex-col gap-3 px-4 overflow-y-auto flex-1">
            {activities.slice(0, 15).map((a) => (
              <li key={a.id} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 flex-shrink-0">
                  {actionIcons[a.entityType] || "circle"}
                </span>
                <div className="min-w-0">
                  <p className="text-label-sm font-label-sm text-on-surface leading-tight">
                    {a.action}{" "}
                    <span className="text-secondary">{a.entityName}</span>
                  </p>
                  <p className="text-label-xs font-label-xs text-secondary mt-0.5" style={{ fontSize: "10px" }}>
                    {a.user} • {a.timestamp}
                  </p>
                </div>
              </li>
            ))}
            {activities.length === 0 && (
              <li className="text-label-sm font-label-sm text-secondary text-center py-4">No recent activity</li>
            )}
          </ul>
        </div>
        <div className="pt-8">
          <ul className="flex flex-col gap-2">
            {bottomItems.map((item) => (
              <li key={item.label}>
                <a
                  className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container rounded-full text-label-md font-label-md transition-all duration-200 ease-in-out"
                  href={item.href}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
