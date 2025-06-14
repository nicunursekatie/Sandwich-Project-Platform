import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, User, Crown, Building2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Host, Message } from "@shared/schema";

interface HostWithContacts extends Host {
  contacts: any[];
}

export default function HostChat() {
  const { toast } = useToast();
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('chatUserName') || 'Team Member';
    setUserName(savedName);
  }, []);

  const { data: hosts = [] } = useQuery<HostWithContacts[]>({
    queryKey: ['/api/hosts-with-contacts'],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', 'host', selectedHost?.id],
    queryFn: async () => {
      if (!selectedHost) return [];
      const response = await fetch(`/api/messages?committee=host-${selectedHost.id}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedHost
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; committee: string; sender: string }) => {
      return await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', 'host', selectedHost?.id] });
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedHost) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      committee: `host-${selectedHost.id}`,
      sender: userName || 'Team Member'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedHost) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2" />
          Host Communication Hub
        </h2>
        
        <div className="grid gap-4">
          {hosts.map((host) => (
            <Card 
              key={host.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedHost(host)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {host.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold flex items-center">
                        {host.name}
                        {host.status === 'lead' && (
                          <Crown className="w-4 h-4 ml-2 text-amber-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{host.address || 'No address'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={host.status === 'active' ? 'default' : 'secondary'}>
                      {host.status}
                    </Badge>
                    <Building2 className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedHost(null)}
            className="p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {selectedHost.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold flex items-center">
              {selectedHost.name}
              {selectedHost.status === 'lead' && (
                <Crown className="w-4 h-4 ml-2 text-amber-500" />
              )}
            </h3>
            <p className="text-xs text-gray-600">Host Chat</p>
          </div>
        </div>
      </div>

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
              <div key={message.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-500 text-white text-xs">
                    {message.sender?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TM'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{message.sender}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
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
            placeholder={`Message ${selectedHost.name}...`}
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