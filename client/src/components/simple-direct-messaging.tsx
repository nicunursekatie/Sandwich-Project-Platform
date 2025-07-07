import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, MessageCircle, User, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
  conversationId: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Conversation {
  id: number;
  type: string;
  name: string;
  createdAt: string;
}

export default function SimpleDirectMessaging() {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all users for selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch user's conversations
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Get or create conversation when user is selected
  useEffect(() => {
    if (selectedUser && user && conversations.length > 0) {
      const userIds = [(user as any).id, selectedUser.id].sort();
      const conversationName = `${userIds[0]}_${userIds[1]}`;
      
      // Find existing conversation
      let conversation = conversations.find(c => 
        c.type === 'direct' && c.name === conversationName
      );
      
      if (conversation) {
        setCurrentConversation(conversation);
      } else if (!createConversationMutation.isPending) {
        // Create new conversation only if not already creating one
        createConversationMutation.mutate({
          type: "direct",
          name: conversationName,
          participants: [(user as any).id, selectedUser.id]
        });
      }
    }
  }, [selectedUser, user]);

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", currentConversation?.id, "messages"],
    enabled: !!currentConversation,
    refetchInterval: 3000,
  });

  // Create or get direct conversation
  const createConversationMutation = useMutation({
    mutationFn: async (otherUserId: string) => {
      return await apiRequest('POST', '/api/conversations/direct', { otherUserId });
    },
    onSuccess: (conversation) => {
      setCurrentConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversation) throw new Error("No conversation selected");
      return await apiRequest("POST", `/api/conversations/${currentConversation.id}/messages`, {
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", currentConversation?.id, "messages"] });
      setMessage("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !currentConversation) return;
    sendMessageMutation.mutate(message.trim());
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

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.id !== (user as any)?.id && // Don't show current user
    (u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full max-h-screen flex flex-col lg:flex-row">
      {/* User Selection Sidebar */}
      <div className="w-full lg:w-1/3 lg:border-r bg-gray-50 dark:bg-gray-900 flex flex-col lg:min-h-0">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-sub-heading text-lg mb-3">Direct Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="p-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <User className="w-12 h-12 mx-auto mb-2" />
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    createConversationMutation.mutate(u.id);
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-slate-100 ${
                    selectedUser?.id === u.id ? 'bg-teal-50 border border-teal-200' : ''
                  }`}
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {u.role}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Select a user to start messaging</h3>
              <p className="text-slate-500">Choose someone from the list to begin a direct conversation</p>
            </div>
          </div>
        ) : (
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b border-slate-200 py-4">
              <CardTitle className="flex items-center">
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarFallback className="bg-teal-100 text-teal-700">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isCurrentUser = msg.userId === (user as any)?.id;
                    return (
                      <div key={msg.id} className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`text-xs ${isCurrentUser ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
                            {isCurrentUser 
                              ? `${(user as any)?.firstName?.[0] || ''}${(user as any)?.lastName?.[0] || ''}`.toUpperCase()
                              : `${selectedUser?.firstName?.[0] || ''}${selectedUser?.lastName?.[0] || ''}`.toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>

                        <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
                          <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                            <span className="font-medium text-sm text-slate-900">
                              {isCurrentUser ? 'You' : `${selectedUser?.firstName} ${selectedUser?.lastName}`}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>

                          <div className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${
                            isCurrentUser 
                              ? 'bg-primary text-white ml-auto' 
                              : 'bg-slate-100 text-slate-900'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex space-x-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedUser.firstName}...`}
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                    rows={1}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}