import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { format, startOfDay, subDays, eachDayOfInterval } from "date-fns";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 6));
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();

  // Fetch tasks from last 7 days
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("created_at", sevenDaysAgoStr);

  // Fetch focus sessions from last 7 days
  const { data: focusSessions } = await supabase
    .from("focus_sessions")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("session_date", format(sevenDaysAgo, "yyyy-MM-dd"));

  // Fetch notes from last 7 days
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("created_at", sevenDaysAgoStr);

  const completedTasks = tasks?.filter(t => t.status === 'done')?.length || 0;
  const pendingTasks = tasks?.filter(t => t.status !== 'done')?.length || 0;
  const totalTasks = tasks?.length || 0;
  const totalNotes = notes?.length || 0;

  // Prepare chart data - Tasks by day
  const days = eachDayOfInterval({
    start: sevenDaysAgo,
    end: now,
  });

  const tasksByDay = days.map(date => {
    const dayStr = format(date, "EEE");
    const count = tasks?.filter(t => format(new Date(t.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")).length || 0;
    return { day: dayStr, count };
  });

  // Prepare chart data - Focus by day
  const focusByDay = days.map(date => {
    const dayStr = format(date, "EEE");
    const minutes = focusSessions?.filter(s => s.session_date === format(date, "yyyy-MM-dd"))
      .reduce((acc, s) => acc + s.duration_minutes, 0) || 0;
    return { day: dayStr, minutes };
  });

  // Find most active day
  let mostActiveDay = "None";
  let maxCount = 0;
  tasksByDay.forEach(d => {
    if (d.count > maxCount) {
      maxCount = d.count;
      mostActiveDay = d.day;
    }
  });

  // Generate AI Summary using Groq
  const summaryPrompt = `
Analyze this week's activity and give a concise, motivating summary (2-3 sentences).
Total tasks created: ${totalTasks}
Completed: ${completedTasks}
Pending: ${pendingTasks}
Notes created: ${totalNotes}
Most active day: ${mostActiveDay}
Total Focus Time: ${focusByDay.reduce((acc, d) => acc + d.minutes, 0)} minutes

Also give 2 bullet points for "Next Week Suggestions".
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: summaryPrompt }],
    max_tokens: 300,
  });

  const aiSummary = completion.choices[0].message.content;

  return NextResponse.json({
    totalTasks,
    completedTasks,
    pendingTasks,
    totalNotes,
    mostActiveDay,
    aiSummary,
    tasksByDay,
    focusByDay,
    completedCount: completedTasks,
    pendingCount: pendingTasks
  });
}
