import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageLog from "@/components/message-log";
import CommitteeChat from "@/components/committee-chat";

export default function ChatHub() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Communication</h1>
          <p className="text-slate-600">Stay connected with your team and committees</p>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="messages">General Messages</TabsTrigger>
          <TabsTrigger value="committees">Committee Chat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6">
          <MessageLog />
        </TabsContent>
        
        <TabsContent value="committees" className="space-y-6">
          <CommitteeChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}