"use server";

import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { revalidatePath } from "next/cache";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];

export async function getTasks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };
  
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createTask(task: Partial<Task>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .upsert({ ...task, user_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}

// Keep upsertTask for compatibility with existing components if any
export const upsertTask = createTask;

export async function deleteTask(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = { id: session.user.id };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
