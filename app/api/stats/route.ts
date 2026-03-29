import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_memory")
    .select("*", { count: "exact", head: true });
  return NextResponse.json({ userCount: count || 0 });
}
