process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { auth } from "@/auth";
import { getChatResponse } from "@/lib/openai/client";
import { getUserMemory, formatMemoryForPrompt, updateUserMemory } from "@/lib/memory/engine";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { messages: currentTurnMessages, mode } = await req.json();
  const lastUserMessage = currentTurnMessages[currentTurnMessages.length - 1];

  const supabase = await createClient();

  // 1. Fetch Memory & Context Data
  const memory = await getUserMemory(session.user.id);
  const memoryBlock = formatMemoryForPrompt(memory);

  // Fetch last 20 messages for context
  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("user_id", session.user.id)
    .eq("mode", mode)
    .order("created_at", { ascending: true })
    .limit(20);

  const conversationHistory = history || [];

  // Fetch real-time data for grounding
  const { data: tasks } = await supabase
    .from("tasks")
    .select("title, due_date, status")
    .eq("user_id", session.user.id)
    .order("due_date", { ascending: true });

  const { data: calendarEntries } = await supabase
    .from("calendar_entries")
    .select("entry_date, entry_time, content")
    .eq("user_id", session.user.id)
    .order("entry_date", { ascending: true })
    .limit(20);

  const taskContext = tasks?.length 
    ? `User's current tasks:\n${tasks.map(t => `- ${t.title} | due: ${t.due_date || 'no date'} | status: ${t.status}`).join('\n')}`
    : "No tasks yet.";

  const calendarContext = calendarEntries?.length
    ? `User's calendar entries:\n${calendarEntries.map(e => `- ${e.entry_date} ${e.entry_time || ''}: ${e.content}`).join('\n')}`
    : "No calendar entries yet.";

  const recentFacts = memory?.recent_context || "None";

  // 2. Build Mode Prompt
  // 2. Build Mode Prompts
  const PRO_SYSTEM_PROMPT = `
You are Strux Professional, an elite AI assistant 
combining the capabilities of a senior project manager,
productivity expert, and strategic advisor.

RESPONSE FORMAT RULES:
- Maximum 150 words per response
- Use bullet points, never long paragraphs
- Lead with the most important point first
- If you need to ask questions, ask maximum 2
- Be direct like a senior consultant, not a teacher

CRITICAL RULE: If the user asks for project help 
but you do not know enough about the project 
(what it is, what needs to be done, current progress),
ask 1-2 specific clarifying questions BEFORE giving 
advice. Do not give generic advice without context.
Once you have enough info, give detailed, specific help.

RESPONSE QUALITY RULES:
- Give comprehensive, detailed answers like ChatGPT 
  or Claude would
- Use clear structure: headers, bullet points, 
  numbered steps
- Always be specific to the user's actual situation
- Never give generic advice - always reference their 
  real projects, deadlines, and goals

When asked about a project:
1. Ask clarifying questions if you don't have enough info
2. Break project into phases with specific deliverables
3. Create a day-by-day or week-by-week schedule
4. Identify risks and how to mitigate them
5. Tell user exactly what to do TODAY

When asked for tracking help:
- Create a detailed progress tracking system
- Define clear milestones with dates
- Suggest daily check-in questions
- Give a completion percentage estimate

When asked for scheduling:
- Build a realistic schedule based on deadline
- Account for the user's work hours
- Include buffer time for revisions
- Prioritize by impact and urgency

User Profile:
Name: {name}
Role: {role}  
Work hours per day: {work_hours}

User's Active Tasks:
{tasks}

Calendar & Upcoming Events:
{calendar}

Recent Context:
{recent_context}
`;

  const PERSONAL_SYSTEM_PROMPT = `
You are Strux Personal, a warm, empathetic AI companion
and life coach who truly knows the user.

RESPONSE RULES:
- Be warm, human, and conversational
- Remember everything the user has shared
- Reference their actual goals and challenges
- Use emojis naturally 😊
- Give thoughtful, caring responses
- Remove the 80 word limit - be as helpful as needed

When user shares feelings or challenges:
1. Acknowledge their feelings with empathy
2. Reference something specific from their profile 
   or past conversations
3. Give one concrete, actionable suggestion
4. Ask one focused follow-up question

When user asks about their schedule or plans:
- Reference their actual calendar entries
- Help them balance work and personal life
- Be encouraging and supportive

When user mentions any date or personal event:
- Acknowledge it
- Add it to calendar context
- Remember it for future conversations

User Profile:
Name: {name}
Goals: {goals}
Challenges: {challenges}

Calendar & Events:
{calendar}

Recent Context:
{recent_context}
`;

  let filledPrompt = "";

  if (mode === "pro") {
    filledPrompt = PRO_SYSTEM_PROMPT
      .replace("{name}", memory?.name || "User")
      .replace("{role}", memory?.role || "")
      .replace("{work_hours}", memory?.work_hours || "8")
      .replace(/{tasks}/g, taskContext)
      .replace(/{calendar}/g, calendarContext)
      .replace(/{recent_context}/g, memory?.recent_context || "");
  } else {
    filledPrompt = PERSONAL_SYSTEM_PROMPT
      .replace("{name}", memory?.name || "User")
      .replace("{goals}", memory?.goals || "")
      .replace("{challenges}", memory?.challenges || "")
      .replace(/{calendar}/g, calendarContext)
      .replace(/{recent_context}/g, memory?.recent_context || "");
  }

  // 3. Get AI Response with full history
  const groqMessages = [
    { role: "system", content: filledPrompt },
    ...conversationHistory,
    { role: "user", content: lastUserMessage.content }
  ];
  
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    max_tokens: mode === "pro" ? 500 : 1000,
  });
  
  const aiMessage = response.choices[0].message.content;

  // 4. Save Turn to DB
  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("type", mode)
    .single();

  let chatId = chat?.id;
  if (!chatId) {
    const { data: newChat } = await supabase
      .from("chats")
      .insert({ user_id: session.user.id, type: mode })
      .select("id")
      .single();
    chatId = newChat?.id;
  }

  // Save user message
  const { error: userMsgError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      user_id: session.user.id,
      role: "user",
      content: lastUserMessage.content,
      mode: mode,
      created_at: new Date().toISOString()
    });

  if (userMsgError) {
    console.error("Failed to save user message:", userMsgError);
  }

  // Save assistant message  
  const { error: assistantMsgError } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      user_id: session.user.id,
      role: "assistant",
      content: aiMessage,
      mode: mode,
      created_at: new Date().toISOString()
    });

  if (assistantMsgError) {
    console.error("Failed to save assistant message:", assistantMsgError);
  }

  // 5. POST-CONVERSATION PROCESSING
  try {
    // A. Task Extraction
    const extractionPrompt = `
Analyze this user message and extract task information.
User message: "${lastUserMessage.content}"

If this message contains a task, project, or deadline, respond with JSON only:
{
  "hasTask": true,
  "title": "task title",
  "due_date": "YYYY-MM-DD or null",
  "project": "project name or null"
}
If no task found respond with: { "hasTask": false }
`
    const extraction = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: extractionPrompt }],
      max_tokens: 100,
      response_format: { type: "json_object" }
    });

    const extracted = JSON.parse(extraction.choices[0].message.content || '{"hasTask":false}');
    if (extracted.hasTask && extracted.title && extracted.title.trim() !== "") {
      const { error: taskError } = await supabase.from("tasks").insert({
        user_id: session.user.id,
        title: extracted.title,
        due_date: extracted.due_date || null,
        created_at: new Date().toISOString()
      });
      if (taskError) console.error("Auto-task insert error:", taskError);
    }

    // B. Calendar Extraction (NEW)
    const calendarPrompt = `
Analyze this message and check if it mentions a specific 
date with an event or activity.
Message: "${lastUserMessage.content}"

If yes respond with JSON only:
{
  "hasEntry": true,
  "date": "YYYY-MM-DD",
  "time": "HH:MM or null",
  "content": "description of event"
}

If no date/event found:
{ "hasEntry": false }

JSON only. No other text.
`
    const calendarExtraction = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: calendarPrompt }],
      max_tokens: 100,
      response_format: { type: "json_object" }
    });

    const calendarData = JSON.parse(calendarExtraction.choices[0].message.content || '{"hasEntry":false}');
    if (calendarData.hasEntry) {
      await supabase.from("calendar_entries").insert({
        user_id: session.user.id,
        entry_date: calendarData.date,
        entry_time: calendarData.time,
        content: calendarData.content,
      });
    }

    // C. Fact Extraction (Memory Part B)
    const factPrompt = `
Extract any important facts from this message to remember about the user. 
Examples: deadlines, project names, goals, preferences.
Message: "${lastUserMessage.content}"
If facts found respond with JSON: {"facts": "fact content"}
If nothing important: {"facts": null}
JSON only, no other text.
`
    const factExtraction = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: factPrompt }],
      max_tokens: 100,
      response_format: { type: "json_object" }
    });
    
    const factData = JSON.parse(factExtraction.choices[0].message.content || '{"facts":null}');
    if (factData.facts) {
      await supabase
        .from("user_memory")
        .update({ recent_context: factData.facts })
        .eq("user_id", session.user.id);
    }
  } catch (e) {
    console.error("AI Post-processing error:", e);
  }

  return NextResponse.json({ message: aiMessage });
}
