import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  
  // Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  // Fetch logs for last 7 days
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString().split('T')[0];

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("completed_date", lastWeekStr);

  return NextResponse.json({ habits, logs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { name, frequency } = await req.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: session.user.id,
      name,
      frequency: frequency || "daily"
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
