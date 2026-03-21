"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateUserMemory } from "@/lib/memory/engine";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, User, Briefcase, Target, Clock, AlertCircle } from "lucide-react";

const questions = [
  { 
    id: "name", 
    text: "What should I call you?", 
    icon: User, 
    placeholder: "e.g. Alex" 
  },
  { 
    id: "role", 
    text: "What do you do for work or study?", 
    icon: Briefcase, 
    placeholder: "e.g. Software Engineer, Student..." 
  },
  { 
    id: "goals", 
    text: "What are your top 3 goals right now?", 
    icon: Target, 
    placeholder: "e.g. Build an AI app, Run a marathon..." 
  },
  { 
    id: "challenges", 
    text: "What is your biggest challenge right now?", 
    icon: AlertCircle, 
    placeholder: "e.g. Time management, Scaling..." 
  },
  { 
    id: "work_hours", 
    text: "How many hours a day do you usually work?", 
    icon: Clock, 
    placeholder: "e.g. 8-10 hours" 
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const handleNext = async () => {
    if (!inputValue.trim()) return;

    const currentQuestion = questions[step];
    const newAnswers = { ...answers, [currentQuestion.id]: inputValue };
    setAnswers(newAnswers);
    setInputValue("");

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      try {
        const response = await fetch("/api/user/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAnswers),
        });
        
        if (response.ok) {
          router.push("/dashboard");
        } else {
          const errorData = await response.json();
          console.error("Failed to save onboarding data:", errorData);
          alert("Something went wrong. Please try again.");
        }
      } catch (error) {
        console.error("Failed to save onboarding:", error);
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const currentQ = questions[step];
  const Icon = currentQ.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white overflow-hidden">
      <div className="max-w-xl w-full">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Strux Onboarding</h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Step {step + 1} of {questions.length}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-primary/60">
                <Icon className="h-12 w-12" />
                <div className="h-px flex-1 bg-slate-900"></div>
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tighter">
                {currentQ.text}
              </h2>
            </div>

            <div className="relative group">
              <input
                autoFocus
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
                placeholder={currentQ.placeholder}
                className="w-full bg-transparent border-b-2 border-slate-800 py-6 text-2xl focus:outline-none focus:border-primary transition-all text-white placeholder-slate-700"
              />
              <button
                onClick={handleNext}
                disabled={!inputValue.trim()}
                className="absolute right-0 bottom-6 h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-0 disabled:translate-x-4 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
              >
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-24 flex gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? "bg-primary" : "bg-slate-900"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
