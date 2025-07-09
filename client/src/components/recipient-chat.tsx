import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, User, Building2, ChevronLeft, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessageReads } from "@/hooks/useMessageReads";
import type { Message } from "@shared/schema";

export default function RecipientChat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize read tracking hook
  const { useAutoMarkAsRead } = useMessageReads();

  // Get user profile for display name
  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/profile"],
    enabled: !!user,
  });

  // Get user name from profile or fallback to email prefix
  const getUserName = () => {
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      if (profile.displayName) {
        return profile.displayName;
      }
      if (profile.firstName) {
        return profile.firstName;
      }
    }
    if (user && typeof user === 'object' && 'email' in user && user.email) {
      return String(user.email).split('@')[0];
    }
    return 'Team Member';
  };

  const canDeleteMessage = (message: Message) => {
    const currentUser = user as any;
    const isOwner = message.sender === getUserName() || message.userId === currentUser?.id;
    const isSuperAdmin = currentUser?.role === "super_admin";
    const isAdmin = currentUser?.role === "admin";
    const hasModeratePermission = currentUser?.permissions?.includes("moderate_messages");
    
    return isOwner || isSuperAdmin || isAdmin || hasModeratePermission;
  };

  const canEditMessage = (message: Message) => {
    const currentUser = user as any;
    return message.sender === getUserName() || message.userId === currentUser?.id;
  };

  // Get or create recipient conversation
  const { data: recipientConversation } = useQuery({
    queryKey: ["/api/conversations/recipient"],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        type: 'channel',
        name: 'Recipient Chat'
      });
      return response;
    },
  });

  // Fetch messages for recipient conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", recipientConversation?.id, "messages"],
    enabled: !!recipientConversation,
    refetchInterval: 3000,
  });

  const [optimisticMessages, setOptimisticMessages] = useState<Message[] | null>(null);
  const displayedMessages = optimisticMessages || messages;

  // Auto-mark messages as read when viewing recipient chat
  useAutoMarkAsRead("recipient", messages, true);

  useEffect(() => {
    setOptimisticMessages(null);
    if (recipientConversation?.id) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", recipientConversation.id, "messages"] 
      });
    }
  }, [recipientConversation?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!recipientConversation) throw new Error('No conversation found');
      
      const response = await apiRequest('POST', `/api/conversations/${recipientConversation.id}/messages`, {
        content,
        sender: getUserName(),
      });
      return response;
    },
    onMutate: async (content: string) => {
      const optimisticMessage: Message = {
        id: Date.now().toString(),
        conversationId: recipientConversation?.id || '',
        userId: (user as any)?.id || '',
        content,
        sender: getUserName(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setOptimisticMessages([...displayedMessages, optimisticMessage]);
      return { optimisticMessage };
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", recipientConversation?.id, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-counts"] });
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setOptimisticMessages(null);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest('DELETE', `/api/messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", recipientConversation?.id, "messages"] 
      });
      toast({
        title: "Message deleted",
        description: "The message has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      await apiRequest('PATCH', `/api/messages/${messageId}`, { content });
    },
    onSuccess: () => {
      setEditingMessage(null);
      setEditContent("");
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", recipientConversation?.id, "messages"] 
      });
      toast({
        title: "Message updated",
        description: "Your message has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingMessage) return;
    editMessageMutation.mutate({ messageId: editingMessage, content: editContent.trim() });
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'TM';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'bg-gray-500';
    }
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full">
            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recipient Chat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Communication channel for receiving organizations
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {displayedMessages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet. Start the conversation with recipient organizations!</p>
          </div>
        ) : (
          displayedMessages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className={`${getAvatarColor(message.sender)} text-white text-xs`}>
                  {getInitials(message.sender)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {message.sender || 'Team Member'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
                
                <div className="group relative">
                  {editingMessage === message.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveEdit();
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white">
                        {message.content}
                      </div>
                      
                      {canDeleteMessage(message) && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white dark:bg-gray-800 shadow-sm border">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEditMessage(message) && (
                                <DropdownMenuItem onClick={() => handleEdit(message)}>
                                  Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteMessageMutation.mutate(message.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message to recipient organizations..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}