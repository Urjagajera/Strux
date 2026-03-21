"use server";

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { revalidatePath } from "next/cache";

export type Note = Database["public"]["Tables"]["notes"]["Row"];

export async function getNotes(query?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };

  const supabase = await createClient();
  let b = supabase
    .from("notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (query) {
    b = b.ilike("title", `%${query}%`);
  }

  const { data, error } = await b;
  if (error) throw new Error(error.message);
  return data;
}

export async function createNote(note: Partial<Note>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .upsert({ ...note, user_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}

export const upsertNote = createNote;

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };

  const supabase = await createClient();
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/notes");
}
