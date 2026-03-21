import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export type UserMemory = {
  name?: string;
  role?: string;
  active_projects?: string[];
  goals?: string;
  preferences?: Record<string, any>;
  recent_context?: string;
  work_hours?: string;
  challenges?: string;
};

export async function getUserMemory(userId: string): Promise<UserMemory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_memory")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error("Error fetching user memory:", error);
    return null;
  }

  return data as UserMemory;
}

export function formatMemoryForPrompt(memory: UserMemory | null): string {
  if (!memory) return "No long-term memory found for this user.";

  return `
## USER CONTEXT (MEMORY)
- **Name**: ${memory.name || "Unknown"}
- **Role**: ${memory.role || "Not specified"}
- **Active Projects**: ${JSON.stringify(memory.active_projects || [])}
- **Goals**: ${memory.goals || "None stated"}
- **Work Hours**: ${memory.work_hours || "Not specified"}
- **Challenges**: ${memory.challenges || "Not specified"}
- **Recent Context**: ${memory.recent_context || "New conversation"}
`.trim();
}

/**
 * Update memory based on AI extraction.
 * In Phase 1, this is called after a response is generated.
 */
export async function updateUserMemory(userId: string, update: Partial<UserMemory>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_memory")
    .upsert({
      user_id: userId,
      ...update,
      updated_at: new Date().toISOString(),
    });

  if (error) console.error("Error updating user memory:", error);
}
