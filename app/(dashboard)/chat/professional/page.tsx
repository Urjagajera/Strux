import ChatWindow from "@/components/chat/ChatWindow";

export default function ProfessionalChatPage() {
  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50">
        <h1 className="text-xl font-bold text-white tracking-tight">Strux Professional</h1>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
          Senior Strategic Advisor & Project Manager
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatWindow mode="pro" />
      </div>
    </div>
  );
}
