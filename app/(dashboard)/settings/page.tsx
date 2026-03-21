import { auth } from "@/auth"
import { createClient } from "@/lib/supabase/server"
import SettingsForm from "@/components/settings/SettingsForm"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("user_memory")
    .select("name, role, goals, challenges, work_hours")
    .eq("user_id", session.user.id)
    .single()

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <div className="p-6 max-w-2xl mx-auto space-y-6 pb-20">
        <SettingsForm 
          profile={profile || {}} 
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
        />
      </div>
    </div>
  )
}
