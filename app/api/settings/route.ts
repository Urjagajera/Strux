import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(
    { error: "Unauthorized" }, { status: 401 })
  
  const supabase = await createClient()
  const { data } = await supabase
    .from("user_memory")
    .select("name, role, goals, challenges, work_hours")
    .eq("user_id", session.user.id)
    .single()
  
  return NextResponse.json(data || {})
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(
    { error: "Unauthorized" }, { status: 401 })
  
  const body = await request.json()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("user_memory")
    .update({
      name: body.name,
      role: body.role,
      goals: body.goals,
      challenges: body.challenges,
      work_hours: body.work_hours,
    })
    .eq("user_id", session.user.id)
  
  if (error) return NextResponse.json(
    { error: error.message }, { status: 500 })
  
  return NextResponse.json({ success: true })
}
