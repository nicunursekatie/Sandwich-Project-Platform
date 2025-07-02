import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, MessageCircle, User, Search } from "lucide-react";
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
  sender: string;
  userId: string;
  content: string;
  timestamp: string;
  committee: string;
  recipientId?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function DirectMessaging() {
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean up previous queries when user changes selection
  useEffect(() => {
    if (selectedUser) {
      // Cancel and remove all other direct message queries to prevent pollution
      queryClient.cancelQueries({ queryKey: ["direct-messages"] });
      queryClient.removeQueries({ 
        queryKey: ["direct-messages"],
        predicate: (query) => {
          const key = query.queryKey as string[];
          return key[0] === "direct-messages" && key[1] !== selectedUser.id && key[1] !== "none";
        }
      });
      console.log(`[DirectMessaging] Cleaned up old queries for user selection: ${selectedUser.firstName} ${selectedUser.lastName}`);
    }
  }, [selectedUser]);

  // Fetch all users for selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch direct messages with selected user - ISOLATED query key to prevent conflicts
  const { data: messages = [], error, isLoading } = useQuery<Message[]>({
    queryKey: selectedUser ? ["direct-messages", selectedUser.id] : ["direct-messages", "none"],
    queryFn: async () => {
      if (!selectedUser) return Promise.resolve([]);
      
      const url = `/api/messages?committee=direct&recipientId=${selectedUser.id}`;
      console.log(`[DirectMessaging] Fetching direct messages for ${selectedUser.firstName} ${selectedUser.lastName}`);
      const response = await apiRequest("GET", url);
      const data = await response.json();
      console.log(`[DirectMessaging] API Response:`, data);
      console.log(`[DirectMessaging] Response type:`, typeof data, Array.isArray(data));
      
      // Ensure we always return an array
      if (!Array.isArray(data)) {
        console.warn(`[DirectMessaging] Expected array but got:`, typeof data, data);
        return [];
      }
      
      return data;
    },
    enabled: !!selectedUser && !!user,
    refetchInterval: selectedUser ? 3000 : false,
    gcTime: 0,
    staleTime: 0,
  });

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: { sender: string; content: string; committee: string; recipientId: string; userId?: string }) => {
      return await apiRequest('POST', '/api/messages', newMessage);
    },
    onMutate: async (newMessage) => {
      if (!selectedUser) return { previousMessages: [], selectedUserId: null };
      
      const queryKey = ["direct-messages", selectedUser.id];
      
      // Cancel outgoing refetches to prevent overwrites
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value - ONLY for this specific conversation
      const optimisticMessage = {
        id: Date.now(), // Temporary ID
        sender: newMessage.sender,
        userId: newMessage.userId || "",
        content: newMessage.content,
        timestamp: new Date().toISOString(),
        committee: "direct",
        recipientId: selectedUser.id,
      };
      
      queryClient.setQueryData(
        queryKey, 
        (old: Message[] = []) => [...old, optimisticMessage]
      );
      
      return { previousMessages, selectedUserId: selectedUser.id };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.selectedUserId) {
        const queryKey = ["direct-messages", context.selectedUserId];
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
      toast({ title: "Failed to send message", variant: "destructive" });
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch only the specific conversation
      if (context?.selectedUserId) {
        const queryKey = ["direct-messages", context.selectedUserId];
        queryClient.invalidateQueries({ queryKey });
      }
      setMessage("");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const userName = (user as any)?.firstName && (user as any)?.lastName 
      ? `${(user as any).firstName} ${(user as any).lastName}` 
      : (user as any)?.email || "User";

    sendMessageMutation.mutate({
      sender: userName,
      content: message.trim(),
      committee: "direct",
      recipientId: selectedUser.id,
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

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.id !== (user as any)?.id && // Don't show current user
    (u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="flex h-[600px] gap-4">
      {/* User Selection Sidebar */}
      <div className="w-80 border-r border-slate-200">
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
                    console.log(`[DEBUG] User clicked:`, u);
                    setSelectedUser(u);
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
      <div className="flex-1">
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
                  <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="text-sm text-slate-500">{selectedUser.email}</div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                {Object.keys(groupedMessages).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-500 mb-2">No messages yet</p>
                    <p className="text-xs text-slate-400">Start the conversation by sending a message below</p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, dateMessages]) => (
                    <div key={date} className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <Badge variant="outline" className="text-xs">
                          {date}
                        </Badge>
                      </div>
                      
                      {dateMessages.map((msg) => {
                        const isCurrentUser = msg.userId === (user as any)?.id;
                        
                        return (
                          <div key={msg.id} className={`flex items-start space-x-3 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={`text-xs ${isCurrentUser ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
                                {msg.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`flex-1 min-w-0 ${isCurrentUser ? 'text-right' : ''}`}>
                              <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'justify-end' : ''}`}>
                                <span className="font-medium text-sm text-slate-900">
                                  {isCurrentUser ? 'You' : msg.sender}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatTime(msg.timestamp)}
                                </span>
                              </div>
                              
                              <div className={`${isCurrentUser ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50 border border-slate-200'} rounded-lg p-3 inline-block max-w-xs`}>
                                <p className="text-sm text-slate-800 whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              <div className="border-t border-slate-200 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedUser.firstName}...`}
                    className="flex-1"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Direct messages are private between you and {selectedUser.firstName}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}