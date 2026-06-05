"use client";

import Sidebar from "@/components/sidebar";
import { AppProvider, useStore } from "@/lib/store";

function ToastContainer() {
  const { toasts, removeToast } = useStore();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`cursor-pointer px-5 py-3 rounded-2xl shadow-lg text-label-sm font-label-sm text-white animate-[slideIn_0.3s_ease] flex items-center gap-3 ${
            t.type === "success" ? "bg-primary" : t.type === "error" ? "bg-red-600" : "bg-surface-container-high text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {t.type === "success" ? "check_circle" : t.type === "error" ? "error" : "info"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 flex flex-col md:ml-64 w-full h-full">
          <header className="bg-surface-container-lowest border-b border-surface-variant w-full top-0 sticky z-10 flex justify-between items-center px-6 md:px-10 py-4">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded-full hover:bg-surface-container-low text-secondary transition-colors cursor-pointer active:scale-95">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-variant overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ml-2 border-2 border-surface-container-lowest shadow-sm">
                <div className="w-full h-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">AJ</div>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </AppProvider>
  );
}
