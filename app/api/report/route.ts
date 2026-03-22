import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekStr = lastWeek.toISOString();

  // Fetch tasks from last 7 days
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("created_at", lastWeekStr);

  // Fetch notes from last 7 days
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", session.user.id)
    .gte("created_at", lastWeekStr);

  const completedTasks = tasks?.filter(t => t.status === 'done')?.length || 0;
  const pendingTasks = tasks?.filter(t => t.status !== 'done')?.length || 0;
  const totalTasks = tasks?.length || 0;
  const totalNotes = notes?.length || 0;

  // Find most active day
  const days: { [key: string]: number } = {};
  tasks?.forEach(t => {
    const day = new Date(t.created_at).toLocaleDateString('en-US', { weekday: 'long' });
    days[day] = (days[day] || 0) + 1;
  });
  let mostActiveDay = "None";
  let maxCount = 0;
  for (const day in days) {
    if (days[day] > maxCount) {
      maxCount = days[day];
      mostActiveDay = day;
    }
  }

  // Generate AI Summary using Groq
  const summaryPrompt = `
Analyze this week's activity and give a concise, motivating summary (2-3 sentences).
Total tasks created: ${totalTasks}
Completed: ${completedTasks}
Pending: ${pendingTasks}
Notes created: ${totalNotes}
Most active day: ${mostActiveDay}

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
    aiSummary
  });
}
