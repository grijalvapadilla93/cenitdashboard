"use client";

import Sidebar from "@/components/sidebar";
import { AppProvider } from "@/lib/store";

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
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">search</span>
                <input
                  className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full text-body-md font-body-md focus:ring-1 focus:ring-primary w-64 h-12 transition-all"
                  placeholder="Search..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-surface-container-low text-secondary transition-colors cursor-pointer active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="p-2 rounded-full hover:bg-surface-container-low text-secondary transition-colors cursor-pointer active:scale-95">
                <span className="material-symbols-outlined">settings</span>
              </button>
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
    </AppProvider>
  );
}
