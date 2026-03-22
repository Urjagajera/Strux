"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

export default function ChatWindow({ mode }: { mode: "pro" | "personal" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    setIsLoadingHistory(true);
    
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?mode=${mode}&limit=4`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        console.log("Loading history for mode:", mode);
        console.log("History data received:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data.map((m: any) => ({
            role: m.role,
            content: m.content,
            created_at: m.created_at
          })));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadHistory();
  }, [mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, mode }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach((m) => {
      const date = m.created_at ? new Date(m.created_at) : new Date();
      let dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  };

  const renderDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    let label = format(date, "MMMM d");
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";

    return (
      <div className="flex items-center justify-center my-6">
        <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
        <span className="px-4 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
          {label}
        </span>
        <div className="h-[1px] flex-1 bg-[var(--border)]"></div>
      </div>
    );
  };

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full bg-[var(--bg)]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] text-[var(--text)]">
      <div ref={scrollRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-2">
        {Object.keys(groupedMessages).sort().map((dateKey) => (
          <div key={dateKey}>
            {renderDateSeparator(dateKey)}
            <div className="space-y-6">
              {groupedMessages[dateKey].map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* AI Avatar */}
                    {m.role === "assistant" && (
                      <div className="h-6 w-6 rounded-full bg-[var(--accent)] flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mb-1 shadow-sm">
                        S
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "max-w-[80%] md:max-w-[70%] px-4 py-2.5 text-sm shadow-sm transition-all",
                        m.role === "user"
                          ? "bg-[var(--accent)] text-white rounded-2xl rounded-br-sm ml-auto"
                          : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-2xl rounded-bl-sm"
                      )}
                    >
                      <div className="prose prose-invert max-w-none text-inherit leading-relaxed">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '')
                              return !inline ? (
                                <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto my-2">
                                  <code className={`text-sm text-slate-100 ${className}`} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-slate-700 rounded px-1.5 py-0.5 text-sm text-slate-100" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mt-4 mb-2 text-[var(--text)]">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mt-3 mb-2 text-[var(--text)]">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mt-2 mb-1 text-[var(--text)]">{children}</h3>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 leading-relaxed text-sm">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-2 text-[var(--text-muted)] italic text-sm">
                                {children}
                              </blockquote>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-2">
                                <table className="min-w-full text-sm border border-[var(--border)] rounded-lg">
                                  {children}
                                </table>
                              </div>
                            ),
                            th: ({ children }) => (
                              <th className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] font-semibold text-left text-xs">{children}</th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 border border-[var(--border)] text-xs">{children}</td>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={cn(
                    "text-[10px] text-[var(--text-muted)] font-medium px-1",
                    m.role === "user" ? "text-right" : "text-left pl-8"
                  )}>
                    {m.created_at ? format(new Date(m.created_at), "HH:mm") : format(new Date(), "HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 pl-8 mt-4">
            <div className="h-6 w-6 rounded-full bg-[var(--accent)]/10 animate-pulse flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
              S
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-2 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]/60" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[var(--bg)] border-t border-[var(--border)]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Strux..."
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all placeholder:text-[var(--text-muted)]/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[var(--accent)] text-white rounded-xl p-2.5 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
