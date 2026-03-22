"use client";

import { useState, useEffect } from "react";
import { BarChart2, CheckCircle, Clock, FileText, Calendar, Award, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--text)] tracking-tight">Weekly Performance</h1>
        <p className="text-[var(--text-muted)] text-sm font-medium">Insights and progress from the last 7 days.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Created", value: report.totalTasks, icon: Clock, color: "blue" },
          { label: "Completed", value: report.completedTasks, icon: CheckCircle, color: "emerald" },
          { label: "Pending", value: report.pendingTasks, icon: Award, color: "amber" },
          { label: "New Notes", value: report.totalNotes, icon: FileText, color: "purple" },
        ].map((stat, i) => (
          <div key={i} className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl shadow-sm space-y-3">
            <div className={`h-10 w-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-[var(--text)]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Active Day */}
        <div className="lg:col-span-1 bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-[var(--accent)]" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-tight">Most Active</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <span className="text-4xl font-black text-[var(--accent)]">{report.mostActiveDay}</span>
            <span className="text-xs text-[var(--text-muted)] font-medium italic">Peak productivity achieved</span>
          </div>
        </div>

        {/* AI Weekly Summary */}
        <div className="lg:col-span-2 bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-[var(--accent)]" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-tight text-[var(--accent)]">AI Weekly Insights</h2>
          </div>
          <div className="prose prose-sm max-w-none text-[var(--text)] leading-relaxed">
            <ReactMarkdown>{report.aiSummary}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
