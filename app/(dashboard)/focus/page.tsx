"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, CheckCircle2, ListChecks, Plus, Trash2, Zap, Clock } from "lucide-react";
import { format } from "date-fns";
import { getTasks } from "@/actions/tasks";
import { cn } from "@/lib/utils";

export default function FocusPage() {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"FOCUS" | "SHORT BREAK" | "LONG BREAK">("FOCUS");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // App State
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Constants for Progress Ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const init = async () => {
      const taskData = await getTasks();
      setTasks(taskData.filter((t: any) => t.status !== 'done'));
      fetchHistory();
    };
    init();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/focus");
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      if (!sessionStartTime && mode === "FOCUS") {
        setSessionStartTime(new Date().toISOString());
      }
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    playNotificationSound();
    
    // Save session if it was a FOCUS session
    if (mode === "FOCUS") {
      const duration = 25; // standard focus
      const taskName = tasks.find(t => t.id === selectedTask)?.title || "General Focus";
      
      try {
        await fetch("/api/focus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_name: taskName,
            duration_minutes: duration,
            started_at: sessionStartTime || new Date().toISOString()
          })
        });
        fetchHistory();
      } catch (e) {
        console.error(e);
      }

      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      
      if (newCount % 4 === 0) {
        setMode("LONG BREAK");
        setTimeLeft(15 * 60);
      } else {
        setMode("SHORT BREAK");
        setTimeLeft(5 * 60);
      }
    } else {
      setMode("FOCUS");
      setTimeLeft(25 * 60);
    }
    
    setIsActive(false);
    setSessionStartTime(null);
  };

  const playNotificationSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  const switchMode = (newMode: typeof mode, time: number) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(time * 60);
    setSessionStartTime(null);
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSessionStartTime(null);
    if (mode === "FOCUS") setTimeLeft(25 * 60);
    else if (mode === "SHORT BREAK") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = () => {
    const total = mode === "FOCUS" ? 25 * 60 : mode === "SHORT BREAK" ? 5 * 60 : 15 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const totalFocusTimeToday = history.reduce((acc, sess) => acc + sess.duration_minutes, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: TIMER */}
        <div className="lg:w-[60%] space-y-8 bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center">
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Focus Engine</h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">Power your productivity with Strux.</p>
          </div>

          {/* Progress Ring */}
          <div className="relative h-64 w-64 flex items-center justify-center my-8">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="var(--border)"
                strokeWidth="4"
                fill="transparent"
                className="transition-all"
              />
              <circle
                cx="128"
                cy="128"
                r={radius}
                stroke="var(--accent)"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress() / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center z-10 space-y-1">
              <span className="text-5xl font-black tabular-nums text-[var(--text)]">{formatTime(timeLeft)}</span>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest mt-1",
                mode === "FOCUS" ? "text-[var(--accent)]" : "text-emerald-500"
              )}>
                {mode}
              </p>
            </div>
          </div>

          {/* Mode Selectors */}
          <div className="flex bg-[var(--bg)] p-1 rounded-2xl border border-[var(--border)] gap-1">
            {[
              { label: "Focus", value: "FOCUS", time: 25 },
              { label: "Short Break", value: "SHORT BREAK", time: 5 },
              { label: "Long Break", value: "LONG BREAK", time: 15 },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => switchMode(m.value as any, m.time)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all",
                  mode === m.value 
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-8">
            <button
              onClick={resetTimer}
              className="h-14 w-14 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center hover:bg-[var(--surface)] hover:text-[var(--text)] transition-all shadow-sm"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleTimer}
              className="h-20 w-20 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--accent)]/30 border-4 border-white/10"
            >
              {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
            <div className="h-14 w-14 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center cursor-default shadow-sm">
              <span className="text-xs font-black">{sessionsCompleted}/4</span>
            </div>
          </div>

          {/* Task Info */}
          <div className="mt-8 w-full max-w-xs text-center space-y-2">
            <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Target Objective</p>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all appearance-none text-center"
            >
              <option value="">General Focus Session</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
            {selectedTask && (
              <p className="text-[10px] font-medium italic text-[var(--accent)]">
                Focusing on: {tasks.find(t => t.id === selectedTask)?.title}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: TODAY'S GOALS */}
        <div className="lg:w-[40%] space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-[2rem] shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ListChecks className="text-[var(--accent)]" size={20} />
                <h2 className="text-sm font-black uppercase tracking-tight">Today&apos;s Gains</h2>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">{format(new Date(), "MMM d, yyyy")}</span>
            </div>

            {/* List */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin h-5 w-5 border-b-2 border-[var(--accent)] rounded-full"></div>
                </div>
              ) : history.length > 0 ? (
                history.map((sess) => (
                  <div key={sess.id} className="bg-[var(--bg)]/50 border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between group transition-all hover:border-[var(--accent)]/30">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" />
                        <span className="text-xs font-bold">{sess.task_name}</span>
                      </div>
                      <p className="text-[10px] font-medium text-[var(--text-muted)]">
                        {sess.started_at ? format(new Date(sess.started_at), "hh:mm a") : "Manual Entry"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--accent)]">
                      <Clock size={12} />
                      <span className="text-xs font-black">{sess.duration_minutes}m</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
                  <Zap size={32} className="text-[var(--text-muted)]" />
                  <p className="text-xs italic">No sessions logged today yet.</p>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">Total Focus</p>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-[var(--text)]">{totalFocusTimeToday}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">mins</span>
                </div>
              </div>
              <button className="h-10 w-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)]/20 transition-all">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
