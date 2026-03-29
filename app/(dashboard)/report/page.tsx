"use client";

import { useState, useEffect } from "react";
import { BarChart2, CheckCircle, Clock, FileText, Calendar, Award, ArrowRight, PieChart as PieIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid
} from "recharts";

const COLORS = ["#3b82f6", "var(--border)"]; // accent vs border/muted

export default function WeeklyReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch("/api/report");
        const data = await res.json();
        setReport(data);
      } catch (e) {
        console.error("Failed to fetch report", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pieData = [
    { name: "Completed", value: report.completedCount || 0 },
    { name: "Pending", value: report.pendingCount || 0 },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 pb-24 bg-[var(--bg)] text-[var(--text)] min-h-screen">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--text-muted)] bg-clip-text text-transparent">Weekly Performance</h1>
        <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">Efficiency & Logic Breakdown</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Created", value: report.totalTasks, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed", value: report.completedTasks, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending", value: report.pendingTasks, icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Knowledge Base", value: report.totalNotes, icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--surface)]/50 border border-[var(--border)] p-6 rounded-[2rem] shadow-xl space-y-4 hover:border-primary/20 transition-all group">
            <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} border border-[var(--border)]`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART 1: Tasks by day */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart2 size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Velocity by Day</h2>
            </div>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tasks Created</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.tasksByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--text-muted)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--text-muted)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', fontSize: '12px', color: 'var(--text)' }}
                  cursor={{ fill: 'var(--bg)', opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Task completion rate */}
        <div className="lg:col-span-1 bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <PieIcon size={18} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Completion Mix</h2>
          </div>

          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', fontSize: '12px', color: 'var(--text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-[var(--text)]">{Math.round((report.completedCount / (report.totalTasks || 1)) * 100)}%</span>
              <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-tighter">Done</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[var(--bg)]/50 rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Completed</span>
              </div>
              <span className="text-xs font-black text-[var(--text)]">{report.completedCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[var(--bg)]/50 rounded-2xl border border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--bg)]" />
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Pending</span>
              </div>
              <span className="text-xs font-black text-[var(--text)]">{report.pendingCount}</span>
            </div>
          </div>
        </div>

        {/* CHART 3: Focus Time by day */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-2xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Clock size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text)]">Focus Intensity</h2>
            </div>
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Minutes Focused</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.focusByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--text-muted)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--text-muted)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', fontSize: '12px', color: 'var(--text)' }}
                  cursor={{ fill: 'var(--bg)', opacity: 0.4 }}
                />
                <Bar dataKey="minutes" fill="#f97316" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI INSIGHTS */}
        <div className="lg:col-span-1 bg-primary border border-primary/20 p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Award size={18} />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">Coach Insights</h2>
            </div>
            <div className="text-sm font-bold text-white/90 leading-relaxed italic">
              <ReactMarkdown>{report.aiSummary}</ReactMarkdown>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between text-white/60">
              <span className="text-[10px] font-black uppercase tracking-widest">Top Day</span>
              <span className="text-xs font-black text-white">{report.mostActiveDay}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
