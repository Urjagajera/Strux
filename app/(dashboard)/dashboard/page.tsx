import { auth } from "@/auth";
import { getTasks } from "@/actions/tasks";
import { getNotes } from "@/actions/notes";
import { getUserMemory } from "@/lib/memory/engine";
import { createClient } from "@/lib/supabase/server";
import { CheckSquare, Star, Zap, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const supabase = await createClient();
  const { data: memoryExists } = await supabase
    .from("user_memory")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!memoryExists) {
    redirect("/onboarding");
  }

  const [tasks, memory, notes] = await Promise.all([
    getTasks(),
    getUserMemory(session.user.id),
    getNotes()
  ]);

  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.due_date === todayStr && t.status !== 'done');
  
  // Find days until nearest deadline
  const deadlines = tasks
    .filter(t => t.due_date && t.status !== 'done')
    .map(t => new Date(t.due_date!));
  const nearestDeadline = deadlines.length > 0 ? Math.min(...deadlines.map(d => d.getTime())) : null;
  const daysUntil = nearestDeadline ? Math.ceil((nearestDeadline - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* SECTION 1: Welcome Bar */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">
            {greeting()}, {memory?.name || session.user.name || "Struxer"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="px-4 py-2 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-xl">
          <p className="text-xs italic text-[var(--accent)] font-medium">
            "{memory?.goals ? `Keep pushing towards: ${memory.goals}` : "Identify your core objective for this week."}"
          </p>
        </div>
      </header>

      {/* SECTION 2: Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-3 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">{tasks.length}</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Total Tasks</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-3 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">{pendingTasks.length}</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Pending</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-3 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-501 border border-emerald-500/10">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">{notes.length}</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Knowledge Items</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-3 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/10">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text)]">{daysUntil}</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Days to Deadline</p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
              Focusing Today
            </h2>
            <Link href="/tasks" className="text-[10px] font-bold text-[var(--accent)] hover:underline uppercase">View All</Link>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <div key={task.id} className="p-4 flex items-center justify-between group hover:bg-[var(--bg)]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded border-2 border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-colors" />
                    <span className="text-sm font-medium text-[var(--text)]">{task.title}</span>
                  </div>
                  {task.due_date && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/10">
                      Today
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-sm text-[var(--text-muted)] italic">No immediate tasks. Use this time to strategize.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight px-1">Quick Console</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/tasks" className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-all group">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] border border-[var(--border)]">
                <CheckSquare className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text)]">New Task</span>
            </Link>
            
            <Link href="/notes" className="flex items-center gap-3 p-4 bg-[var(--surface)] border border(--border) rounded-xl hover:bg-[var(--bg)] transition-all group">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] border border-[var(--border)]">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text)]">New Note</span>
            </Link>

            <Link href="/chat/professional" className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-all group">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] border border-[var(--border)]">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text)]">Strux Pro Chat</span>
            </Link>

            <Link href="/calendar" className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-all group">
              <div className="h-8 w-8 rounded-lg bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] border border-[var(--border)]">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-[var(--text)]">View Schedule</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
