import ChatWindow from "@/components/chat/ChatWindow";

export default function PersonalChatPage() {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-4 border-b border-rose-900/20 bg-rose-950/10">
        <h1 className="text-xl font-bold text-rose-100 tracking-tight">Strux Personal</h1>
        <p className="text-xs text-rose-400/60 font-medium uppercase tracking-widest mt-1">
          Supportive Life Coach & Companion
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow mode="personal" />
      </div>
    </div>
  );
}
