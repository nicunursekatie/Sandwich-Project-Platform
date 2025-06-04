import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatHistoryModal from "@/components/modals/chat-history-modal";
import type { Message } from "@shared/schema";

export default function MessageLog() {
  const [showChatHistory, setShowChatHistory] = useState(false);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", { limit: 3 }],
    queryFn: async () => {
      const response = await fetch("/api/messages?limit=3", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    }
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

  const truncateMessage = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
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
            Recent Messages
          </h2>
          <span className="text-sm text-slate-500">3 new</span>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900">{message.sender}</span>
                  <span className="text-slate-500 text-xs">{formatTimeAgo(message.timestamp)}</span>
                </div>
                <p className="text-slate-600">{truncateMessage(message.content)}</p>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            className="mt-4 w-full justify-center border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setShowChatHistory(true)}
          >
            <Maximize2 className="mr-2 w-4 h-4" />
            View Full Chat History
          </Button>
        </div>
      </div>

      <ChatHistoryModal 
        open={showChatHistory} 
        onOpenChange={setShowChatHistory} 
      />
    </>
  );
}
