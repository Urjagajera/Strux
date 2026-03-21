import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "pro";
  const limit = parseInt(searchParams.get("limit") || "20");

  const supabase = await createClient();
  
  const { data: messages, error } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("user_id", session.user.id)
    .eq("mode", mode)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  console.log("History query - user:", session.user.id, "mode:", mode, "results:", messages?.length);

  if (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json([]);
  }

  // Reverse back to ascending order for display
  return NextResponse.json(messages?.reverse() || []);
}
