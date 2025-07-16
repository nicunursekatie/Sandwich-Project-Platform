import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Inbox, 
  UserPlus, 
  Reply,
  Mail,
  Users
} from "lucide-react";

interface SimpleMessage {
  id: number;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface MessageUser {
  id: string;
  name: string;
  email: string;
}

export default function SimpleMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMessage, setSelectedMessage] = useState<SimpleMessage | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [newMessageTo, setNewMessageTo] = useState("");
  const [newMessageSubject, setNewMessageSubject] = useState("");
  const [newMessageContent, setNewMessageContent] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  // Get inbox messages
  const { data: inboxMessages = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['/api/simple-messages/inbox'],
    queryFn: () => apiRequest('GET', '/api/simple-messages/inbox')
  });

  // Get sent messages
  const { data: sentMessages = [], isLoading: sentLoading } = useQuery({
    queryKey: ['/api/simple-messages/sent'],
    queryFn: () => apiRequest('GET', '/api/simple-messages/sent')
  });

  // Get users for recipient selection
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('GET', '/api/users')
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('POST', '/api/simple-messages', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simple-messages/sent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/simple-messages/inbox'] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      });
      setShowCompose(false);
      setNewMessageTo("");
      setNewMessageSubject("");
      setNewMessageContent("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (replyData: any) => {
      return apiRequest('POST', '/api/simple-messages/reply', replyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simple-messages/sent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/simple-messages/inbox'] });
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully."
      });
      setReplyContent("");
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive"
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return apiRequest('POST', `/api/simple-messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/simple-messages/inbox'] });
    }
  });

  const handleMessageClick = (message: SimpleMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendMessage = () => {
    if (!newMessageTo || !newMessageSubject || !newMessageContent) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate({
      recipientId: newMessageTo,
      subject: newMessageSubject,
      content: newMessageContent
    });
  };

  const handleReply = () => {
    if (!replyContent.trim() || !selectedMessage) return;

    replyMutation.mutate({
      originalMessageId: selectedMessage.id,
      content: replyContent
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderMessageList = (messages: SimpleMessage[], showSender = false) => (
    <div className="space-y-2">
      {messages.map(message => (
        <div
          key={message.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            selectedMessage?.id === message.id
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => handleMessageClick(message)}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(showSender ? message.senderName : message.recipientName)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {showSender ? message.senderName : message.recipientName}
              </span>
              {!message.read && !showSender && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(message.createdAt)}
            </span>
          </div>
          <h4 className="font-medium text-sm text-gray-900 mb-1">
            {message.subject}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {message.content}
          </p>
        </div>
      ))}
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access messages</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <Button onClick={() => setShowCompose(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Inbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inbox" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="inbox">Inbox</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>
                <TabsContent value="inbox" className="mt-4">
                  <ScrollArea className="h-[500px]">
                    {inboxLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-muted-foreground">Loading...</div>
                      </div>
                    ) : inboxMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-muted-foreground">No messages</div>
                      </div>
                    ) : (
                      renderMessageList(inboxMessages, true)
                    )}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="sent" className="mt-4">
                  <ScrollArea className="h-[500px]">
                    {sentLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-muted-foreground">Loading...</div>
                      </div>
                    ) : sentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-sm text-muted-foreground">No sent messages</div>
                      </div>
                    ) : (
                      renderMessageList(sentMessages, false)
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {showCompose ? (
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To:</label>
                  <select
                    value={newMessageTo}
                    onChange={(e) => setNewMessageTo(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={usersLoading}
                  >
                    <option value="">Select recipient...</option>
                    {users.map((user: MessageUser) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject:</label>
                  <Input
                    value={newMessageSubject}
                    onChange={(e) => setNewMessageSubject(e.target.value)}
                    placeholder="Enter subject..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message:</label>
                  <Textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message..."
                    rows={10}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCompose(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {getInitials(selectedMessage.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedMessage.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {selectedMessage.senderName}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Reply className="h-4 w-4" />
                    Reply
                  </h4>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="mb-3"
                  />
                  <Button
                    onClick={handleReply}
                    disabled={replyMutation.isPending || !replyContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a message to view</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}