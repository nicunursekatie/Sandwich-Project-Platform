import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Crown, Shield, AlertTriangle, Users, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: number;
  sender: string;
  userId: string;
  content: string;
  timestamp: string;
  committee: string;
}

export default function CoreTeamChat() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Only allow admin users to access core team chat
  const isAdmin = hasPermission(user, PERMISSIONS.MANAGE_USERS);
  
  if (!isAdmin) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Shield className="w-5 h-5 mr-2" />
            Core Team Chat - Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <p className="text-slate-600">This chat is restricted to core team administrators only.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch core team messages
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", "core_team"],
    queryFn: () => fetch("/api/messages?committee=core_team").then(res => res.json()),
    refetchInterval: 2000, // Refresh every 2 seconds for real-time feel
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { sender: string; content: string; committee: string; userId?: string }) => {
      return await apiRequest('POST', '/api/messages', newMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "core_team"] });
      setMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('DELETE', `/api/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "core_team"] });
      toast({
        title: "Message deleted",
        description: "The message has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userName = (user as any)?.firstName && (user as any)?.lastName 
      ? `${(user as any).firstName} ${(user as any).lastName}` 
      : (user as any)?.email || "Core Team Member";

    sendMessageMutation.mutate({
      sender: userName,
      content: message.trim(),
      committee: "core_team",
      userId: (user as any)?.id
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50 p-4">
        <div className="flex items-center mb-2">
          <Crown className="w-5 h-5 mr-2 text-orange-600" />
          Core Team Chat
          <Badge variant="destructive" className="ml-2 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
        </div>
        <p className="text-sm text-slate-600 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          Secure communication channel for core team administrators
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4">
          {Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 mx-auto text-orange-400 mb-4" />
              <p className="text-slate-500 mb-2">Welcome to the Core Team Chat</p>
              <p className="text-xs text-slate-400">Secure communications for admin team coordination</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Badge variant="outline" className="text-xs">
                    {date}
                  </Badge>
                </div>
                
                {dateMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3 mb-4">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                        {msg.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm text-slate-900">
                            {msg.sender}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-orange-100"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => deleteMessageMutation.mutate(msg.id)}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteMessageMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>
        
      <div className="border-t border-slate-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a secure message to the core team..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center">
          <Shield className="w-3 h-3 mr-1" />
          Messages in this channel are only visible to core team administrators
        </p>
      </div>
    </div>
  );
}