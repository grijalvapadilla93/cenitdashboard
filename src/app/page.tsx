"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <body className="bg-background text-on-background min-h-screen flex flex-col justify-center items-center px-margin-mobile md:px-0">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-surface-container-high rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-secondary-container rounded-full blur-[120px] opacity-30"></div>
      </div>
      <main className="w-full max-w-[480px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-display font-display text-primary tracking-tighter mb-2">Hub Central</h1>
          <p className="text-body-md font-body-md text-secondary">Advanced CRM for LeadManager teams.</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-[32px] p-8 md:p-12 shadow-[0px_10px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-8">
            <h2 className="text-headline-md font-headline-md text-primary mb-2">Sign In</h2>
            <p className="text-label-md font-label-md text-on-secondary-container">
              Enter your credentials to access your dashboard.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-label-sm font-label-sm text-primary flex items-center gap-2" htmlFor="email">
                <span className="material-symbols-outlined text-[18px]">mail</span>
                EMAIL ADDRESS
              </label>
              <div className="relative group">
                <input
                  className="w-full h-[56px] px-6 rounded-xl bg-surface-container-low border-transparent border-2 focus:border-primary focus:ring-0 transition-all duration-200 text-body-md font-body-md"
                  id="email"
                  placeholder="name@company.com"
                  type="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-label-sm font-label-sm text-primary flex items-center gap-2" htmlFor="password">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  PASSWORD
                </label>
                <a className="text-label-sm font-label-sm text-secondary hover:text-primary transition-colors duration-200" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative group">
                <input
                  className="w-full h-[56px] px-6 rounded-xl bg-surface-container-low border-transparent border-2 focus:border-primary focus:ring-0 transition-all duration-200 text-body-md font-body-md"
                  id="password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>
            <button
              className="w-full h-[56px] bg-primary text-on-primary text-label-md font-label-md rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-secondary">
          <p className="text-label-sm font-label-sm">© 2024 Hub Central. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="text-label-sm font-label-sm hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="text-label-sm font-label-sm hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="text-label-sm font-label-sm hover:text-primary transition-colors" href="#">Help Center</a>
          </div>
        </div>
      </main>
    </body>
  );
}
