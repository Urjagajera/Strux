"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Circle } from "lucide-react";

type Theme = "dark" | "light" | "blue";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("strux-theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("strux-theme", newTheme);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
      <button
        onClick={() => toggleTheme("dark")}
        className={`p-1.5 rounded-lg transition-all ${
          theme === "dark" ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleTheme("light")}
        className={`p-1.5 rounded-lg transition-all ${
          theme === "light" ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleTheme("blue")}
        className={`p-1.5 rounded-lg transition-all ${
          theme === "blue" ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
        }`}
        title="Blue Mode"
      >
        <Circle className="h-4 w-4 fill-blue-500 text-blue-500" />
      </button>
    </div>
  );
}
