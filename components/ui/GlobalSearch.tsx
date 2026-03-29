"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Command, X, CheckSquare, FileText, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchResults {
  tasks: { id: string; title: string }[];
  notes: { id: string; title: string; content: string }[];
  calendar: { id: string; content: string; entry_date: string }[];
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ tasks: [], notes: [], calendar: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ tasks: [], notes: [], calendar: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigateTo = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-3 py-2 w-full text-slate-500 hover:text-slate-300 bg-slate-900 border border-slate-800 rounded-xl transition-all group"
    >
      <Search size={16} className="group-hover:text-primary transition-colors" />
      <span className="text-xs font-black uppercase tracking-widest flex-1 text-left">Search everything...</span>
      <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-md text-[8px] font-black text-slate-400">
        <Command size={8} /> K
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 backdrop-blur-sm bg-slate-950/60 transition-all animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center gap-4">
          <Search className="text-primary" size={20} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search tasks, notes, or calendar..."
            className="flex-1 bg-transparent text-white text-base focus:outline-none placeholder:text-slate-600 font-bold"
          />
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          )}

          {!loading && query.length >= 2 && (
            <div className="space-y-6 p-4">
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <CheckSquare size={12} /> Tasks
                  </h3>
                  <div className="grid gap-1">
                    {results.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => navigateTo("/tasks")}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-2xl transition-all text-left group"
                      >
                        <span className="text-sm font-bold text-slate-200">{task.title}</span>
                        <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <FileText size={12} /> Knowledge Base
                  </h3>
                  <div className="grid gap-1">
                    {results.notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => navigateTo("/notes")}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-2xl transition-all text-left group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{note.title}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{note.content}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Calendar */}
              {results.calendar.length > 0 && (
                <section className="space-y-2">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                    <Calendar size={12} /> Calendar
                  </h3>
                  <div className="grid gap-1">
                    {results.calendar.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => navigateTo("/calendar")}
                        className="w-full flex items-center justify-between p-3 hover:bg-slate-800 rounded-2xl transition-all text-left group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200">{entry.content}</span>
                          <span className="text-[10px] text-slate-500">{entry.entry_date}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {results.tasks.length === 0 && results.notes.length === 0 && results.calendar.length === 0 && (
                <div className="py-20 text-center opacity-40">
                  <p className="text-sm font-black uppercase tracking-widest">No matching bits found</p>
                </div>
              )}
            </div>
          )}

          {query.length > 0 && query.length < 2 && (
            <div className="py-20 text-center opacity-40">
              <p className="text-sm font-black uppercase tracking-widest">Type more characters...</p>
            </div>
          )}
          
          {query.length === 0 && (
            <div className="py-20 text-center opacity-40">
              <p className="text-sm font-black uppercase tracking-widest">Start typing to explore</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-center">
            <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                    <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-400">ESC</kbd>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Close</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-400">↵</kbd>
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Select</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
