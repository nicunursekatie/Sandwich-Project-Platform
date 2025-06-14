import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@shared/schema";

interface CommitteeMessageLogProps {
  committee: string;
}

export default function CommitteeMessageLog({ committee }: CommitteeMessageLogProps) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('chatUserName') || 'Team Member';
    setUserName(savedName);
  }, []);

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', committee],
    queryFn: async () => {
      const response = await fetch(`/api/messages?committee=${committee}`);
      if (!response.ok) return [];
      return response.json();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; committee: string; sender: string }) => {
      return await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', committee] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('DELETE', `/api/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', committee] });
      toast({
        title: "Message deleted",
        description: "The message has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      committee: committee,
      sender: userName || 'Team Member'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex space-x-3 group">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-500 text-white text-xs">
                    {message.sender?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TM'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMessageMutation.mutate(message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      disabled={deleteMessageMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-900">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${committee} committee...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}