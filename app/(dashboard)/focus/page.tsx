"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Award, CheckCircle2, Volume2, Moon } from "lucide-react";
import { getTasks } from "@/actions/tasks";

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      const data = await getTasks();
      setTasks(data.filter((t: any) => t.status !== 'done'));
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
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

  const handleTimerComplete = () => {
    playNotificationSound();
    if (mode === "work") {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      if (newSessions % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(15 * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(5 * 60);
      }
    } else {
      setMode("work");
      setTimeLeft(25 * 60);
    }
    setIsActive(false);
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

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "work") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = () => {
    const total = mode === "work" ? 25 * 60 : mode === "shortBreak" ? 5 * 60 : 15 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const motivationalMessage = () => {
    if (mode === "work") return "Stay focused, you're doing great!";
    return "Time to recharge. You deserve this break.";
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter flex items-center justify-center gap-3">
          <Timer className="text-[var(--accent)]" size={32} />
          Focus Engine
        </h1>
        <p className="text-slate-400 font-medium">Deep work requires deep focus.</p>
      </div>

      {/* Timer Display */}
      <div className="relative h-72 w-72 flex items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-900"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * (1 - progress() / 100)}
            strokeLinecap="round"
            className="text-[var(--accent)] transition-all duration-1000"
          />
        </svg>
        <div className="text-center z-10">
          <span className="text-6xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">
            {mode === "work" ? "Focusing" : "Resting"}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-slate-400"
        >
          <RotateCcw size={24} />
        </button>
        <button
          onClick={toggleTimer}
          className="h-20 w-20 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-[var(--accent)]/20"
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>
        <button
          className="p-4 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all text-slate-400"
        >
          <Award size={24} />
        </button>
      </div>

      {/* Task Selector & Info */}
      <div className="max-w-md w-full space-y-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Objective</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 appearance-none"
            >
              <option value="">Select a task to focus on...</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" size={16} />
              <span className="text-xs text-slate-400">Sessions today: <span className="text-slate-100 font-bold">{sessionsCompleted}</span></span>
            </div>
            <p className="text-xs italic text-slate-500">{motivationalMessage()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
