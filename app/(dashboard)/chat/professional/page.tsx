import ChatWindow from "@/components/chat/ChatWindow";

export default function ProfessionalChatPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]/50">
        <h1 className="text-xl font-bold text-[var(--text)] tracking-tight">Strux Professional</h1>
        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest mt-1">
          Senior Strategic Advisor & Project Manager
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow mode="pro" />
      </div>
    </div>
  );
}
