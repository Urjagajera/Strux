import { signIn } from "@/auth";
import { Milestone, CheckCircle2, Quote } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column: Branding & Info (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gray-950 p-16 flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-black">
            <Milestone size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic">Strux</span>
        </div>

        <div className="relative z-10 space-y-12">
          <div className="space-y-6">
            <Quote className="text-primary opacity-50" size={48} />
            <h2 className="text-4xl font-black tracking-tight leading-tight max-w-md">
              "The secret of getting ahead is getting started."
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">— Mark Twain</p>
          </div>

          <div className="space-y-4">
            {[
              "Dual AI System (Pro & Personal)",
              "Automatic Task Extraction",
              "Systemic Growth Tracking",
              "Built for Professionals"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary" />
                <span className="text-sm font-bold text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Strux OS © 2026</p>
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
            <p className="text-sm font-medium text-gray-500">Sign in to continue to your workspace.</p>
          </div>

          <div className="space-y-4">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button className="flex w-full items-center justify-center gap-3 bg-white border border-gray-200 text-black font-bold py-3.5 px-6 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* GitHub button on hold - omitting as per Step 3 instructions */}

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-gray-400">
                <span className="bg-white px-4">Managed Authentication</span>
              </div>
            </div>

            <p className="text-center text-sm font-bold text-gray-500">
              New to Strux? <Link href="/login" className="text-black hover:underline">It's free</Link>
            </p>
          </div>

          <p className="text-[10px] text-center font-bold text-gray-400 px-8 leading-relaxed uppercase tracking-widest">
            Identity verification handled by NextAuth.js
          </p>
        </div>
      </div>
    </div>
  );
}
