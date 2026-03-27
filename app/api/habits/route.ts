import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // e.g., 2026-03

  const supabase = await createClient();
  
  // Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  let startDate: string;
  let endDate: string;

  if (month) {
    const monthDate = new Date(`${month}-01`);
    startDate = format(startOfMonth(monthDate), "yyyy-MM-dd");
    endDate = format(endOfMonth(monthDate), "yyyy-MM-dd");
  } else {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    startDate = lastWeek.toISOString().split('T')[0];
    endDate = new Date().toISOString().split('T')[0];
  }

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("completed_date", startDate)
    .lte("completed_date", endDate);

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
