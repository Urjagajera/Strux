import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

async function getUserCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("user_memory")
    .select("*", { count: "exact", head: true });
  return count || 0;
}

export default async function LandingPage() {
  const userCount = await getUserCount();

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
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
              <span className="font-bold text-lg italic">S</span>
            </div>
            <span className="font-black text-xl tracking-tighter uppercase italic">Strux</span>
          </div>
          <Link 
            href="/login" 
            className="text-sm font-bold border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700">
            Your AI-powered personal operating system
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Strux combines professional AI assistance with personal coaching to help you work smarter, track habits, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link 
              href="/login"
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold text-gray-400 hover:text-black transition-all"
            >
              Learn More
            </button>
          </div>
          <p className="text-sm font-bold text-gray-400 pt-4">
            Join {userCount} people already using Strux
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight">Everything you need, in one place.</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="bg-white border border-gray-200 p-8 rounded-3xl hover:shadow-2xl hover:border-black/5 transition-all group scale-100 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500">{feature.emoji}</div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-20 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="space-y-1">
            <p className="text-4xl font-black">{userCount}</p>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Users</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black">2</p>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">AI Modes</p>
          </div>
          <div className="space-y-1">
            <p className="text-4xl font-black">10+</p>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Features</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 bg-black text-white p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-black/20">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Ready to get started?</h2>
          <p className="text-lg text-gray-400 font-medium">Start for free, no credit card required.</p>
          <Link 
            href="/login"
            className="inline-block bg-white text-black px-10 py-5 rounded-2xl text-xl font-black hover:scale-105 active:scale-95 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-gray-400">Strux © 2026</p>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
            <span>Built with</span>
            <span className="text-black">❤️</span>
            <span>for productivity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
