import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "Date is required" }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_entries")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("entry_date", date)
    .order("entry_time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { entry_date, entry_time, content } = body;

  if (!entry_date || !content) {
    return NextResponse.json({ error: "Date and content are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_entries")
    .insert({
      user_id: session.user.id,
      entry_date,
      entry_time,
      content,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
