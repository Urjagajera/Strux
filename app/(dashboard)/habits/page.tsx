"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Check, Flame, CheckCircle2, 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  LayoutDashboard
} from "lucide-react";
import { 
  format, isSameDay, subDays, startOfMonth, endOfMonth, 
  eachDayOfInterval, isSameMonth, addMonths, subMonths,
  isFuture, startOfWeek, endOfWeek
} from "date-fns";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState<"today" | "monthly">("today");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fetchHabits = async () => {
    try {
      const url = view === "monthly" 
        ? `/api/habits?month=${format(currentMonth, "yyyy-MM")}`
        : "/api/habits";
      
      const res = await fetch(url);
      const data = await res.json();
      setHabits(data.habits || []);
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [view, currentMonth]);

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newHabitName }),
      });
      if (res.ok) {
        setNewHabitName("");
        setIsAdding(false);
        fetchHabits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) return;
    try {
      await fetch(`/api/habits/${id}/log`, { method: "DELETE" });
      fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleToday = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr }),
      });
      if (res.ok) fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(today, i), "yyyy-MM-dd");
      const exists = logs.some(l => l.habit_id === habitId && l.completed_date === d);
      if (exists) {
        streak++;
      } else {
        if (i === 0) continue; 
        break;
      }
    }
    return streak;
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, "yyyy-MM-dd");
  });

  const renderTodayView = () => (
    <div className="grid gap-3">
      {habits.length > 0 ? habits.map((habit) => {
        const isCompletedToday = logs.some(l => l.habit_id === habit.id && l.completed_date === todayStr);
        const streak = getStreak(habit.id);

        return (
          <div 
            key={habit.id} 
            className={cn(
              "group bg-[var(--surface)] border transition-all p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4",
              isCompletedToday ? "border-primary/50 bg-primary/[0.02]" : "border-[var(--border)]"
            )}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => toggleToday(habit.id)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                  isCompletedToday 
                    ? "bg-primary border-primary text-white" 
                    : "border-[var(--border)] text-transparent hover:border-primary/50"
                )}
              >
                <Check size={18} />
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold truncate text-[var(--text)]">
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">
                    <Flame size={10} />
                    {streak}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-2">
                  {last7Days.map((date) => {
                    const done = logs.some(l => l.habit_id === habit.id && l.completed_date === date);
                    return (
                      <div 
                        key={date}
                        title={format(new Date(date), "MMM d")}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all",
                          done ? "bg-primary" : "bg-[var(--border)]"
                        )}
                       />
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => deleteHabit(habit.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-red-500 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      }) : (
        <div className="py-20 text-center space-y-4 bg-[var(--surface)]/50 border-2 border-dashed border-[var(--border)] rounded-3xl">
          <CheckCircle2 className="h-12 w-12 text-primary/20 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text)]">No habits tracked yet</h3>
            <p className="text-xs text-[var(--text-muted)]">Build consistency by adding your first daily ritual.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getDailyCompletion = (date: Date) => {
      const dStr = format(date, "yyyy-MM-dd");
      const doneSub = logs.filter(l => l.completed_date === dStr).length;
      const total = habits.length;
      if (total === 0) return 0;
      return (doneSub / total) * 100;
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)]">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[var(--bg)] rounded-xl transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-[var(--text-muted)] uppercase py-2">
              {d}
            </div>
          ))}
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const completion = getDailyCompletion(day);
            const future = isFuture(day) && !isToday;

            return (
              <div 
                key={i}
                className={cn(
                  "aspect-square rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all relative group",
                  !isCurrentMonth ? "bg-transparent border-transparent text-[var(--text-muted)]/20" : "border-[var(--border)] text-[var(--text-muted)]",
                  completion === 100 && isCurrentMonth && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400",
                  completion > 0 && completion < 100 && isCurrentMonth && "bg-amber-500/20 border-amber-500/30 text-amber-400",
                  isToday && "ring-2 ring-primary ring-offset-2 ring-offset-[var(--bg)]",
                  future && "opacity-20 grayscale"
                )}
              >
                {format(day, "d")}
                {isCurrentMonth && completion > 0 && (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <span className="text-[8px] font-black text-[var(--text)]">{Math.round(completion)}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl text-center">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Consistency</p>
            <p className="text-xl font-black text-primary">
              {Math.round((logs.length / (habits.length * 30 || 1)) * 100)}%
            </p>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl text-center">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Best Streak</p>
            <p className="text-xl font-black text-orange-500">
              {habits.length > 0 ? Math.max(...habits.map(h => getStreak(h.id))) : 0} days
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32 min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">{format(new Date(), "MMMM do")}</h1>
          <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">Rituals & Consistency</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--surface)] p-1.5 rounded-2xl border border-[var(--border)]">
          <button 
            onClick={() => setView("today")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === "today" ? "bg-primary text-white shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            Today
          </button>
          <button 
            onClick={() => setView("monthly")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              view === "monthly" ? "bg-primary text-white shadow-lg" : "text-[var(--text-muted)] hover:text-[var(--text)]"
            )}
          >
            Monthly
          </button>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          New Habit
        </button>
      </header>

      {isAdding && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200">
          <form onSubmit={addHabit} className="flex gap-4">
            <input
              autoFocus
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="What new ritual are we building?"
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Create</button>
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-[10px] font-black uppercase text-[var(--text-muted)]">Cancel</button>
          </form>
        </div>
      )}

      {view === "today" ? renderTodayView() : renderMonthlyView()}
    </div>
  );
}
