import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  
  if (query.length < 2) {
    return NextResponse.json({
        tasks: [],
        notes: [],
        calendar: [],
    });
  }

  const supabase = await createClient();
  
  const [tasks, notes, calendar] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,title,status")
      .eq("user_id", session.user.id)
      .ilike("title", `%${query}%`)
      .limit(5),
    supabase
      .from("notes")
      .select("id,title,content")
      .eq("user_id", session.user.id)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(5),
    supabase
      .from("calendar_entries")
      .select("id,entry_date,content")
      .eq("user_id", session.user.id)
      .ilike("content", `%${query}%`)
      .limit(5),
  ]);

  return NextResponse.json({
    tasks: tasks.data || [],
    notes: notes.data || [],
    calendar: calendar.data || [],
  });
}
