import { auth } from "@/auth";
import { getUserMemory } from "@/lib/memory/engine";
import { createClient } from "@/lib/supabase/server";
import { 
  CheckSquare, Zap, Calendar, FileText, Sparkles, 
  ArrowUpRight, ArrowDownRight, Minus, Timer 
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Groq from "groq-sdk";
import { startOfDay, subDays, format } from "date-fns";
import { cn } from "@/lib/utils";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const supabase = await createClient();
  
  // 1. Initial Checks
  const { data: memoryExists } = await supabase
    .from("user_memory")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (!memoryExists) {
    redirect("/onboarding");
  }

  // 2. Date Calculations
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");
  const thisWeekStart = startOfDay(subDays(now, 6));
  const lastWeekStart = startOfDay(subDays(now, 13));
  const lastWeekEnd = startOfDay(subDays(now, 7));

  // 3. Data Fetching
  const [
    memory,
    thisWeekTasksData,
    lastWeekTasksData,
    thisWeekNotesData,
    lastWeekNotesData,
    thisWeekFocusData,
    lastWeekFocusData,
  ] = await Promise.all([
    getUserMemory(session.user.id),
    supabase.from("tasks").select("*").eq("user_id", session.user.id).gte("created_at", thisWeekStart.toISOString()),
    supabase.from("tasks").select("*").eq("user_id", session.user.id).gte("created_at", lastWeekStart.toISOString()).lte("created_at", lastWeekEnd.toISOString()),
    supabase.from("notes").select("*").eq("user_id", session.user.id).gte("created_at", thisWeekStart.toISOString()),
    supabase.from("notes").select("*").eq("user_id", session.user.id).gte("created_at", lastWeekStart.toISOString()).lte("created_at", lastWeekEnd.toISOString()),
    supabase.from("focus_sessions").select("*").eq("user_id", session.user.id).gte("session_date", format(thisWeekStart, "yyyy-MM-dd")),
    supabase.from("focus_sessions").select("*").eq("user_id", session.user.id).gte("session_date", format(lastWeekStart, "yyyy-MM-dd")).lte("session_date", format(lastWeekEnd, "yyyy-MM-dd")),
  ]);

  const thisWeekTasks = thisWeekTasksData.data || [];
  const lastWeekTasks = lastWeekTasksData.data || [];
  const thisWeekNotes = thisWeekNotesData.data || [];
  const lastWeekNotes = lastWeekNotesData.data || [];
  const thisWeekFocus = thisWeekFocusData.data || [];
  const lastWeekFocus = lastWeekFocusData.data || [];

  // 4. Stat Calculations
  const calcStats = (tasks: any[], focus: any[], notesCount: number) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalFocusMinutes = focus.reduce((acc, s) => acc + s.duration_minutes, 0);
    return { totalTasks, completedTasks, completionRate, totalFocusMinutes, notesCount };
  };

  const currentStats = calcStats(thisWeekTasks, thisWeekFocus, thisWeekNotes.length);
  const previousStats = calcStats(lastWeekTasks, lastWeekFocus, lastWeekNotes.length);

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "same";
  };

  const trends = {
    tasks: getTrend(currentStats.totalTasks, previousStats.totalTasks),
    completion: getTrend(currentStats.completionRate, previousStats.completionRate),
    notes: getTrend(currentStats.notesCount, previousStats.notesCount),
    focus: getTrend(currentStats.totalFocusMinutes, previousStats.totalFocusMinutes),
  };

  // 5. AI Briefing
  let dailyBrief = (memory as any)?.daily_brief;
  const briefDate = (memory as any)?.brief_date;

  if (briefDate !== todayStr) {
    const pendingTasks = thisWeekTasks.filter(t => t.status !== 'done');
    const briefingPrompt = `
Generate a warm and motivating 3-4 sentence morning briefing for ${memory?.name || "the user"}.
Today is ${format(now, "EEEE")}.
Pending tasks: ${pendingTasks.map(t => t.title).join(', ')}
User's goals: ${memory?.goals || "Not set yet"}

The briefing should be persona-based (Strux Assistant), encouraging, and focus on 1-2 key things for today.
    `;
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: briefingPrompt }],
        max_tokens: 200,
      });
      dailyBrief = completion.choices[0].message.content;
      await supabase.from("user_memory").update({ daily_brief: dailyBrief, brief_date: todayStr }).eq("user_id", session.user.id);
    } catch (e) {
      dailyBrief = "Ready to conquer the day? Let's focus on your top priorities and make today count!";
    }
  }

  const TrendIndicator = ({ trend, label }: { trend: string, label: string }) => {
    if (trend === "up") return <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-0.5"><ArrowUpRight size={10} /> +{label}</span>;
    if (trend === "down") return <span className="text-[8px] font-black text-red-500 uppercase flex items-center gap-0.5"><ArrowDownRight size={10} /> -{label}</span>;
    return <span className="text-[8px] font-black text-[var(--text-muted)] uppercase flex items-center gap-0.5"><Minus size={10} /> Stable</span>;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 pb-32 bg-[var(--bg)] text-[var(--text)] min-h-screen">
      {/* Welcome Bar */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-[var(--text)] to-[var(--text-muted)] bg-clip-text text-transparent">
            {now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening"}, {memory?.name || "Struxer"}
          </h1>
          <p className="text-xs text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-2">
            {format(now, "EEEE, MMMM do")}
          </p>
        </div>
        
        {memory?.goals && (
          <div className="px-5 py-3 bg-primary/5 border border-primary/20 rounded-2xl shadow-xl shadow-primary/5">
            <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Active Objective</p>
            <p className="text-xs font-bold text-[var(--text)]">"{memory.goals}"</p>
          </div>
        )}
      </header>

      {/* AI Daily Briefing */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-2xl flex flex-col md:flex-row gap-8 items-center group hover:border-primary/30 transition-all">
        <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
          <Sparkles size={32} className="opacity-80" />
        </div>
        <div className="space-y-2 text-center md:text-left flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Insight</h2>
          <p className="text-base font-bold text-[var(--text)] leading-relaxed italic">
            "{dailyBrief}"
          </p>
        </div>
      </div>

      {/* Stats & Trends Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Performance Trends</h2>
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">vs Last Week</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Total Tasks */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] space-y-4 hover:bg-[var(--surface)]/80 transition-all border-b-4 border-b-blue-500/50 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                <CheckSquare size={20} />
              </div>
              <TrendIndicator trend={trends.tasks} label="Tasks" />
            </div>
            <div>
              <h3 className="text-3xl font-black">{currentStats.totalTasks}</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Velocity Items</p>
            </div>
          </div>

          {/* Card 2: Completion Rate */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] space-y-4 hover:bg-[var(--surface)]/80 transition-all border-b-4 border-b-emerald-500/50 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                <Zap size={20} />
              </div>
              <TrendIndicator trend={trends.completion} label="Rate" />
            </div>
            <div>
              <h3 className="text-3xl font-black">{Math.round(currentStats.completionRate)}%</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Efficiency Mark</p>
            </div>
          </div>

          {/* Card 3: Notes (Knowledge) */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] space-y-4 hover:bg-[var(--surface)]/80 transition-all border-b-4 border-b-purple-500/50 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
                <FileText size={20} />
              </div>
              <TrendIndicator trend={trends.notes} label="Assets" />
            </div>
            <div>
              <h3 className="text-3xl font-black">{currentStats.notesCount}</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Knowledge Base</p>
            </div>
          </div>

          {/* Card 4: Focus Time */}
          <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] space-y-4 hover:bg-[var(--surface)]/80 transition-all border-b-4 border-b-orange-500/50 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                <Timer size={20} />
              </div>
              <TrendIndicator trend={trends.focus} label="Minutes" />
            </div>
            <div>
              <h3 className="text-3xl font-black">{currentStats.totalFocusMinutes}</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Deep Work Minutes</p>
            </div>
          </div>
        </div>

        {/* Summary Line */}
        <div className="px-6 py-4 bg-[var(--surface)]/30 rounded-2xl border border-[var(--border)]/50 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Trend Summary: {
              currentStats.completedTasks > previousStats.completedTasks 
              ? `You completed ${currentStats.completedTasks - previousStats.completedTasks} more tasks than last week 🎉`
              : currentStats.totalFocusMinutes > previousStats.totalFocusMinutes
              ? `Your focus intensity is up by ${currentStats.totalFocusMinutes - previousStats.totalFocusMinutes} minutes! 🚀`
              : "High-level consistency maintained across all channels."
            }
          </p>
        </div>
      </div>

      {/* Task & Action Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] flex items-center gap-2">
              <CheckSquare size={14} className="text-primary" /> Active Roadmap
            </h2>
            <Link href="/tasks" className="text-[10px] font-black text-primary hover:text-[var(--text)] uppercase tracking-widest transition-colors">View Deep Stack</Link>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-2xl">
            {thisWeekTasks.filter(t => t.status !== 'done').length > 0 ? (
              thisWeekTasks.filter(t => t.status !== 'done').slice(0, 5).map(task => (
                <div key={task.id} className="p-6 flex items-center justify-between group hover:bg-[var(--surface)]/80 transition-all border-b border-[var(--border)]/50 last:border-0 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-6 rounded-lg border-2 border-[var(--border)] group-hover:border-primary/50 transition-all flex items-center justify-center">
                        <div className="h-2 w-2 rounded-sm bg-primary opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                    <span className="text-sm font-bold text-[var(--text)]">{task.title}</span>
                  </div>
                  {task.due_date && (
                    <span className="text-[8px] font-black px-3 py-1 rounded-full bg-[var(--bg)] text-[var(--text-muted)] uppercase tracking-widest border border-[var(--border)]">
                      {task.due_date}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                    <Zap size={24} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Roadmap clear. Excellent execution.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] px-2">Command Center</h2>
          <div className="grid gap-4">
            {[
              { label: "Add Operation", icon: CheckSquare, href: "/tasks", color: "blue" },
              { label: "Capture Item", icon: FileText, href: "/notes", color: "purple" },
              { label: "Deep Work Zone", icon: Timer, href: "/focus", color: "orange" },
              { label: "Launch AI Pro", icon: Zap, href: "/chat/professional", color: "primary" },
            ].map((action, i) => (
              <Link 
                key={i} 
                href={action.href} 
                className="flex items-center gap-4 p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface)]/80 hover:border-primary/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="h-10 w-10 rounded-xl bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors shadow-inner border border-[var(--border)]">
                  <action.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-[0.2em]">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
