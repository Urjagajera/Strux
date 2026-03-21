"use client";

import { Note, deleteNote } from "@/actions/notes";
import { Trash2, Tag } from "lucide-react";

export default function NoteGrid({ notes }: { notes: Note[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col"
        >
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">{note.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 whitespace-pre-wrap">
              {note.content}
            </p>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags?.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-medium text-slate-500 uppercase">
                <Tag className="h-2 w-2" /> {tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => deleteNote(note.id)}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
