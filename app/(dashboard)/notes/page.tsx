"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import NoteGrid from "@/components/notes/NoteGrid";
import NewNoteButton from "@/components/notes/NewNoteButton";

export default function NotesPage() {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/notes?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [query]);

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-black tracking-tight mb-1 text-white">Knowledge Base</h1>
          <p className="text-xs text-slate-400 font-medium">Keep track of ideas, tags, and snippets.</p>
        </div>
        <NewNoteButton />
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      <NoteGrid notes={notes} />
    </div>
  );
}
