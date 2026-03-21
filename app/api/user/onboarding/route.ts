import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    console.log("Onboarding - session user id:", session?.user?.id)
    
    if (!session?.user?.id) {
      console.log("Onboarding - no session")
      return NextResponse.json(
        { error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Onboarding - body received:", body)
    
    const supabase = await createClient()
    
    const { error } = await supabase
      .from("user_memory")
      .upsert({
        user_id: session.user.id,
        email: session.user.email,
        name: body.name,
        role: body.role,
        goals: body.goals,
        challenges: body.challenges,
        work_hours: body.work_hours,
      }, { onConflict: "user_id" })

    console.log("Onboarding - upsert error:", error)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error full:", error)
    return NextResponse.json(
      { error: "Failed to save" }, { status: 500 })
  }
}
