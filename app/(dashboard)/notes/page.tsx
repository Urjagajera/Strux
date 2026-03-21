import { getNotes } from "@/actions/notes";
import NoteGrid from "@/components/notes/NoteGrid";
import NewNoteButton from "@/components/notes/NewNoteButton";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-black tracking-tight mb-1 text-white">Knowledge Base</h1>
          <p className="text-xs text-slate-400 font-medium">Keep track of ideas, tags, and snippets.</p>
        </div>
        <NewNoteButton />
      </div>

      <NoteGrid notes={notes} />
    </div>
  );
}
