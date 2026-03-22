"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Flame, CheckCircle2 } from "lucide-react";
import { format, isSameDay, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
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
  }, []);

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
    // Start from today and go backwards
    for (let i = 0; i < 365; i++) {
      const d = format(subDays(today, i), "yyyy-MM-dd");
      const exists = logs.some(l => l.habit_id === habitId && l.completed_date === d);
      if (exists) {
        streak++;
      } else {
        // If it's today and not done, keep checking yesterday for the "last streak"
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

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">
            {format(new Date(), "EEEE, MMMM do")}
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            Focus on today. One step at a time.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/20 self-start md:self-center"
        >
          <Plus size={18} />
          New Habit
        </button>
      </header>

      {isAdding && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <form onSubmit={addHabit} className="flex gap-2">
            <input
              autoFocus
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="What habit do you want to start?"
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-xs font-bold">Add</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-muted)]">Cancel</button>
          </form>
        </div>
      )}

      {/* Habits List */}
      <div className="grid gap-3">
        {habits.length > 0 ? habits.map((habit) => {
          const isCompletedToday = logs.some(l => l.habit_id === habit.id && l.completed_date === todayStr);
          const streak = getStreak(habit.id);

          return (
            <div 
              key={habit.id} 
              className={cn(
                "group bg-[var(--surface)] border transition-all p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4",
                isCompletedToday ? "border-[var(--accent)]/50 bg-[var(--accent)]/[0.02]" : "border-[var(--border)]"
              )}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => toggleToday(habit.id)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    isCompletedToday 
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white" 
                      : "border-[var(--border)] text-transparent hover:border-[var(--accent)]/50"
                  )}
                >
                  <Check size={18} />
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "text-sm font-bold truncate transition-all",
                      isCompletedToday ? "text-[var(--text)]" : "text-[var(--text)]"
                    )}>
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">
                      <Flame size={10} />
                      {streak}
                    </div>
                  </div>
                  
                  {/* 7-day mini grid */}
                  <div className="flex items-center gap-1 mt-2">
                    {last7Days.map((date) => {
                      const done = logs.some(l => l.habit_id === habit.id && l.completed_date === date);
                      return (
                        <div 
                          key={date}
                          title={format(new Date(date), "MMM d")}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all",
                            done ? "bg-[var(--accent)]" : "bg-[var(--border)]"
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
          <div className="py-20 text-center space-y-4 bg-[var(--surface)] border-2 border-dashed border-[var(--border)] rounded-3xl">
            <div className="h-12 w-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)] mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text)]">No habits tracked yet</h3>
              <p className="text-xs text-[var(--text-muted)]">Build consistency by adding your first daily ritual.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
