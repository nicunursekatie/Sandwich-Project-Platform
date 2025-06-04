import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatHistoryModal from "@/components/modals/chat-history-modal";
import type { Message } from "@shared/schema";

export default function MessageLog() {
  const [showChatHistory, setShowChatHistory] = useState(false);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"]
  });

  const formatTimeAgo = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "1d ago";
    return `${Math.floor(diffInHours / 24)}d ago`;
  };



  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <MessageCircle className="text-blue-500 mr-2 w-5 h-5" />
            Team Messages
          </h2>
          <span className="text-sm text-slate-500">{messages.length} total</span>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">{message.sender}</span>
                  <span className="text-sm text-slate-500">{formatTimeAgo(message.timestamp)}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{message.content}</p>
              </div>
            ))}
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No messages found.
              </div>
            )}
          </div>
          

        </div>
      </div>

      <ChatHistoryModal 
        open={showChatHistory} 
        onOpenChange={setShowChatHistory} 
      />
    </>
  );
}
