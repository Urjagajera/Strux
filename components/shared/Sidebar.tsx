"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Heart, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Settings, 
  LogOut,
  Milestone
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import { signOut } from "next-auth/react";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Strux Professional", href: "/chat/professional", icon: Briefcase },
  { name: "Strux Personal", href: "/chat/personal", icon: Heart },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

type SidebarProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-[220px] bg-[var(--bg)] border-r border-[var(--border)]">
      {/* Top: Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="h-8 w-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white shadow-lg">
          <Milestone className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg tracking-tight text-[var(--text)]">Strux</span>
      </div>
      
      {/* Middle: Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                isActive 
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium" 
                  : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings, User, Logout */}
      <div className="p-3 border-t border-[var(--border)] space-y-3">
        <ThemeSwitcher />

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
            pathname === "/settings" 
              ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium" 
              : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        
        {/* User Profile */}
        <div className="flex items-center gap-2 px-2 py-2">
          <img 
            src={user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
            alt="User" 
            className="h-7 w-7 rounded-full bg-[var(--surface)] border border-[var(--border)]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--text)] truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
