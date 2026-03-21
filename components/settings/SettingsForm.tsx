"use client";

import { useState } from "react";
import { Loader2, User, Mail, LogOut, Save, CheckCircle, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface SettingsFormProps {
  profile: {
    name?: string;
    role?: string;
    goals?: string;
    challenges?: string;
    work_hours?: number;
  };
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function SettingsForm({ profile, user }: SettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || "",
    role: profile.role || "",
    goals: profile.goals || "",
    challenges: profile.challenges || "",
    work_hours: String(profile.work_hours || "8"),
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          work_hours: parseInt(formData.work_hours),
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white mb-1">Settings</h1>
        <p className="text-xs text-slate-400">Manage your profile and account preferences.</p>
      </div>

      {/* SECTION 1 — USER PROFILE */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
          <h2 className="text-sm font-semibold text-white">User Profile</h2>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Your Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Role / Occupation</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Software Engineer, etc."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Current Goals</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              placeholder="What are you working towards?"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Biggest Challenge</label>
            <textarea
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 h-20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              placeholder="What's holding you back?"
            />
          </div>

          <div className="w-full md:w-1/3 space-y-1">
            <label className="text-xs font-medium text-slate-400 ml-1">Work Hours per Day</label>
            <input
              type="number"
              value={formData.work_hours}
              onChange={(e) => setFormData({ ...formData, work_hours: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              min="1"
              max="24"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg px-6 py-2 font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Changes saved successfully!</span>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* SECTION 2 — ACCOUNT INFO */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Account Information</h2>
        </div>
        <div className="p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-16 h-16 rounded-full border-2 border-slate-800 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                <User className="h-8 w-8 text-slate-500" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-center md:justify-start gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-800">
                <User className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-0.5">Name</p>
                  <p className="text-white text-sm font-medium">{user.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-800 text-left">
                <Mail className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none mb-0.5">Email</p>
                  <p className="text-white text-sm font-medium truncate max-w-[150px]">{user.email || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/30 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg px-6 py-2 font-semibold flex items-center gap-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout from Strux
          </button>
        </div>
      </section>
    </div>
  );
}
