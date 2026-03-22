import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: habitId } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { date } = await req.json();
  const supabase = await createClient();

  // Check if log exists
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_date", date)
    .single();

  if (existing) {
    // Delete log (toggle off)
    await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id);
    return NextResponse.json({ status: "removed" });
  } else {
    // Create log (toggle on)
    await supabase
      .from("habit_logs")
      .insert({
        habit_id: habitId,
        user_id: session.user.id,
        completed_date: date
      });
    return NextResponse.json({ status: "added" });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: habitId } = await params;
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();

  // Delete logs first due to FK
  await supabase.from("habit_logs").delete().eq("habit_id", habitId);
  const { error } = await supabase.from("habits").delete().eq("id", habitId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: "deleted" });
}
