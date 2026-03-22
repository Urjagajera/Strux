import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: focusSessions } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("session_date", todayStr)
    .order("started_at", { ascending: false });

  return NextResponse.json(focusSessions || []);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { task_name, duration_minutes, started_at } = await req.json();
  const supabase = await createClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from("focus_sessions")
    .insert({
      user_id: session.user.id,
      task_name,
      duration_minutes,
      session_date: todayStr,
      started_at
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
