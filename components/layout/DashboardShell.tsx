"use client";

import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Menu } from "lucide-react";

type Props = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function DashboardShell({ 
  children, 
  user 
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative z-50 h-full
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar user={user} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]" style={{ background: "var(--surface)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1 -ml-1 text-[var(--text)]">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-[var(--text)]">Strux</span>
        </div>
        
        <main className="flex-1 overflow-y-auto relative scroll-smooth bg-[var(--bg)]">
          {children}
        </main>
      </div>
    </div>
  );
}
