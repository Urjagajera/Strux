"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatWindow from "./ChatWindow";

export default function ChatLayout() {
  const [activeMode, setActiveMode] = useState<"pro" | "personal">("pro");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Strux AI</h1>
        <Tabs value={activeMode} onValueChange={(v: string) => setActiveMode(v as any)} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pro">Strux Professional</TabsTrigger>
            <TabsTrigger value="personal">Strux Personal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatWindow mode={activeMode} />
      </div>
    </div>
  );
}
