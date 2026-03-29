import ChatWindow from "@/components/chat/ChatWindow";

export default function PersonalChatPage() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="p-4 border-b border-primary/10 bg-primary/5">
        <h1 className="text-xl font-bold text-primary tracking-tight">Strux Personal</h1>
        <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-1">
          Supportive Life Coach & Companion
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow mode="personal" />
      </div>
    </div>
  );
}
