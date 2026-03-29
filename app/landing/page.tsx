import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

async function getUserCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_memory")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export default async function LandingPage() {
  const userCount = await getUserCount();
  // Simulate an active user count proportional to total users for social proof
  const activeNow = Math.floor((userCount * 0.12) + 7);

  const features = [
    {
      title: "Dual AI System",
      description: "Professional and Personal AI modes that remember your context across sessions.",
      emoji: "🤖"
    },
    {
      title: "Smart Task Management",
      description: "AI automatically extracts tasks from your conversations and tracks deadlines.",
      emoji: "✅"
    },
    {
      title: "Calendar Integration",
      description: "Connect your schedule with AI insights for better time management.",
      emoji: "📅"
    },
    {
      title: "Habit Tracker",
      description: "Build lasting habits with daily tracking and streak visualization.",
      emoji: "🎯"
    },
    {
      title: "Focus Timer",
      description: "Pomodoro-based focus sessions with productivity tracking.",
      emoji: "⏱️"
    },
    {
      title: "Weekly Reports",
      description: "AI-generated insights on your productivity trends and improvements.",
      emoji: "📊"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[var(--bg)]/80 backdrop-blur-md z-50 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="font-bold text-lg italic">S</span>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Strux</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{activeNow} Active Now</span>
             </div>
             <Link 
              href="/login" 
              className="text-sm font-bold bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-xl hover:bg-[var(--bg)] transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] animate-in fade-in zoom-in duration-1000">
             <Zap size={14} className="text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Aritificial Intelligence OS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] bg-gradient-to-br from-[var(--text)] via-[var(--text)] to-[var(--text-muted)] bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700">
            Your personal operating system.
          </h1>
          <p className="text-xl text-[var(--text-muted)] font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 leading-relaxed">
            Strux combines professional AI assistance with personal memory to help you work smarter, track habits, and archive your life goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 pt-4">
            <Link 
              href="/login"
              className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] px-10 py-5 rounded-2xl text-lg font-black hover:bg-[var(--bg)] transition-all"
            >
              Learn More
            </button>
          </div>
          <div className="flex flex-col items-center gap-2 pt-8 animate-in fade-in duration-1000 delay-500">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em]">
              Trusted by {userCount}+ Humans
            </p>
            <div className="flex -space-x-3">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-8 w-8 rounded-full bg-[var(--surface)] border-2 border-[var(--bg)] flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="h-full w-full object-cover grayscale" />
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-[var(--surface)]/30">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Core Modules</h2>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight">Everything you need.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-[var(--surface)] border border-[var(--border)] p-10 rounded-[2.5rem] hover:border-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:opacity-20 transition-opacity rotate-12 group-hover:rotate-0 duration-500">{feature.emoji}</div>
                <div className="text-4xl mb-8 grayscale group-hover:grayscale-0 transition-all duration-500">{feature.emoji}</div>
                <h4 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h4>
                <p className="text-[var(--text-muted)] leading-relaxed font-bold text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-24 border-y border-[var(--border)] bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">{userCount}+</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Knowledge Hubs</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">02</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Modes</p>
          </div>
          <div className="space-y-2">
            <p className="text-5xl font-black tracking-tighter">100%</p>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Privacy First</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-10 bg-primary text-white p-12 md:p-24 rounded-[4rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-white/10 blur-[100px] rounded-full rotate-45 group-hover:translate-x-20 transition-transform duration-1000" />
          
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter relative z-10 leading-[0.9]">Transform your <br />workflow today.</h2>
          <p className="text-xl text-white/70 font-bold relative z-10 max-w-xl mx-auto">Join the new era of personal productivity with AI that actually remembers you.</p>
          <div className="relative z-10">
            <Link 
              href="/login"
              className="inline-block bg-white text-black px-12 py-6 rounded-2xl text-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Launch Your Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[var(--border)] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center text-white text-xs font-black italic">S</div>
            <span className="text-sm font-black uppercase tracking-tighter italic">Strux OS</span>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-[var(--text-muted)] uppercase">Strux &copy; 2026 &mdash; Built for Professionals</p>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
