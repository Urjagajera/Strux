"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Flame, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, subDays } from "date-fns";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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

  const toggleLog = async (habitId: string, date: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      if (res.ok) fetchHabits();
    } catch (e) {
      console.error(e);
    }
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return format(d, "yyyy-MM-dd");
  });

  const getStreak = (habitId: string) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(today, i), "yyyy-MM-dd");
      const exists = logs.some(l => l.habit_id === habitId && l.completed_date === d);
      if (exists) streak++;
      else break;
    }
    return streak;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Daily Habits</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">Small wins lead to big victories.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-[var(--accent)]/20"
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
              placeholder="What habit do you want to build?"
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
            <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-xs font-bold">Add</button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-[var(--text-muted)]">Cancel</button>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid gap-4">
        {habits.length > 0 ? habits.map((habit) => (
          <div key={habit.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 md:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[var(--text)]">{habit.name}</h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">
                  <Flame size={10} />
                  {getStreak(habit.id)} day streak
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium">Consistency is key.</p>
            </div>

            <div className="flex gap-2 items-center">
              {last7Days.map((date) => {
                const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed_date === date);
                const isT = isSameDay(new Date(date), new Date());
                return (
                  <div key={date} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{format(new Date(date), "EEE")}</span>
                    <button
                      onClick={() => toggleLog(habit.id, date)}
                      className={cn(
                        "h-10 w-10 md:h-12 md:w-12 rounded-xl border-2 transition-all flex items-center justify-center group",
                        isCompleted
                          ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                          : "border-[var(--border)] bg-transparent text-transparent hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5"
                      )}
                    >
                      {isCompleted ? <Check size={20} /> : <Check size={20} className="group-hover:text-[var(--accent)]/40" />}
                    </button>
                  </div>
                );
              })}
              <div className="h-10 w-[1px] bg-[var(--border)] mx-2 hidden md:block" />
              <button
                onClick={() => deleteHabit(habit.id)}
                className="p-3 text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center space-y-4 bg-[var(--surface)] border-2 border-dashed border-[var(--border)] rounded-3xl">
            <div className="h-12 w-12 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)] mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--text)]">No habits yet</h3>
              <p className="text-xs text-[var(--text-muted)]">Build your discipline by tracking daily rituals.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
