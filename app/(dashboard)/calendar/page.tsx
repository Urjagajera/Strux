"use client";

import { useState, useEffect } from "react";
import { getTasks, Task } from "@/actions/tasks";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Circle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data || []);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{format(currentMonth, "MMMM yyyy")}</h1>
          <p className="text-xs text-muted-foreground">Manage your schedule and deadlines.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-sm">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-2 py-0.5 text-xs font-semibold hover:bg-slate-800 rounded-lg transition-colors text-slate-200"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dayTasks = tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), cloneDay));
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[100px] p-1.5 border-t border-l last:border-r border-slate-800 transition-all cursor-pointer hover:bg-blue-900/5",
              !isCurrentMonth && "bg-slate-950/50 text-slate-700",
              isSelected && "bg-blue-900/10 ring-2 ring-inset ring-primary z-10"
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div className="flex justify-between items-start mb-0.5">
              <span className={cn(
                "text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full",
                isSameDay(day, new Date()) ? "bg-primary text-primary-foreground shadow-lg" : "text-slate-300"
              )}>
                {formattedDate}
              </span>
              {dayTasks.length > 0 && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary/20">
                  {dayTasks.length}
                </span>
              )}
            </div>
            <div className="space-y-0.5 overflow-hidden">
              {dayTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "text-[9px] p-0.5 rounded border truncate font-medium",
                    task.status === "done" 
                      ? "bg-slate-900/50 text-slate-600 border-slate-800 line-through" 
                      : "bg-slate-800 text-slate-200 border-slate-700 shadow-sm"
                  )}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 3 && (
                <div className="text-[8px] text-slate-500 font-bold pl-0.5 uppercase tracking-tighter">
                  + {dayTasks.length - 3}
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 border-r border-slate-800 last:border-b" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl h-full overflow-hidden">{rows}</div>;
  };

  const [entries, setEntries] = useState<any[]>([]);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [newEntryTime, setNewEntryTime] = useState(format(new Date(), "HH:mm"));

  useEffect(() => {
    const fetchEntries = async () => {
      const resp = await fetch(`/api/calendar/entries?date=${format(selectedDate, "yyyy-MM-dd")}`);
      if (resp.ok) {
        const data = await resp.json();
        setEntries(data);
      }
    };
    fetchEntries();
  }, [selectedDate]);

  const handleAddEntry = async () => {
    if (!newEntryContent) return;
    const resp = await fetch("/api/calendar/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entry_date: format(selectedDate, "yyyy-MM-dd"),
        entry_time: newEntryTime,
        content: newEntryContent,
      }),
    });
    if (resp.ok) {
      const newEntry = await resp.json();
      setEntries([...entries, newEntry].sort((a, b) => (a.entry_time || "").localeCompare(b.entry_time || "")));
      setNewEntryContent("");
    }
  };

  const selectedDayTasks = tasks.filter(task => task.due_date && isSameDay(parseISO(task.due_date), selectedDate));

  return (
    <div className="flex h-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="flex-1 p-6 overflow-y-auto">
        {renderHeader()}
        <div className="flex flex-col">
          {renderDays()}
          {renderCells()}
        </div>
      </div>

      <div className="w-72 border-l border-slate-800 bg-slate-900/50 p-6 overflow-y-auto flex flex-col gap-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{format(selectedDate, "MMM d, yyyy")}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Selected Date</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Planned Tasks</h3>
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl space-y-3"
                >
                  <div className="flex items-start gap-3">
                    {task.status === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-slate-700 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-bold text-xs leading-tight text-slate-100",
                        task.status === "done" && "text-slate-500 line-through"
                      )}>
                        {task.title}
                      </h4>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-600 italic px-1">No tasks today</p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest">Daily Log</h3>
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{entries.length} entries</span>
          </div>

          <div className="space-y-3 bg-slate-900/50 p-4 rounded-3xl border border-slate-800">
            <div className="flex gap-2">
              <input
                type="time"
                value={newEntryTime}
                onChange={(e) => setNewEntryTime(e.target.value)}
                className="bg-slate-800 border-none rounded-xl text-[10px] font-bold text-white px-2 py-1 w-20 focus:ring-1 focus:ring-primary h-8"
              />
              <input
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                placeholder="Log your progress..."
                className="flex-1 bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-700 focus:ring-0 h-8"
                onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
              />
            </div>
            <button
              onClick={handleAddEntry}
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold py-2 rounded-xl border border-primary/20 transition-all uppercase tracking-widest"
            >
              Add Entry
            </button>
          </div>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-800">
                <div className="absolute left-[-2px] top-2 h-1.5 w-1.5 rounded-full bg-primary" />
                <div className="text-[10px] font-black text-slate-500 mb-1">{entry.entry_time || "All day"}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{entry.content}</p>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center opacity-20 filter grayscale">
                <FileText className="h-8 w-8 text-slate-500 mb-3" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No log entries</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
