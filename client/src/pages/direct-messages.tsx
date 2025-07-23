import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Plus, 
  Send,
  Users,
  Loader2,
  Mail,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  otherUser: User;
  lastMessage: Message;
  unreadCount: number;
}

export default function DirectMessages() {
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  
  // Compose form
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  // Fetch all active users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const activeUsers = Array.isArray(data) ? data : (data.users || []);
        setUsers(activeUsers.filter((u: User) => u.isActive && u.id !== (user as any)?.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messaging/conversations', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Conversations data:', data);
        
        // Group messages by conversation partner
        const conversationMap = new Map<string, Conversation>();
        
        data.messages?.forEach((message: Message) => {
          const currentUserId = (user as any)?.id;
          const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;
          const otherUserName = message.senderId === currentUserId ? message.recipientName : message.senderName;
          
          if (!conversationMap.has(otherUserId)) {
            // Find user details
            const otherUser = users.find(u => u.id === otherUserId) || {
              id: otherUserId,
              firstName: otherUserName.split(' ')[0] || 'Unknown',
              lastName: otherUserName.split(' ')[1] || 'User',
              email: 'unknown@email.com',
              isActive: true
            };
            
            conversationMap.set(otherUserId, {
              otherUser,
              lastMessage: message,
              unreadCount: 0
            });
          }
          
          // Update with latest message
          const existing = conversationMap.get(otherUserId)!;
          if (new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
            existing.lastMessage = message;
          }
          
          // Count unread messages
          if (!message.isRead && message.recipientId === currentUserId) {
            existing.unreadCount++;
          }
        });
        
        setConversations(Array.from(conversationMap.values()));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchConversationMessages = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/messaging/conversation/${otherUserId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  // Send a quick reply
  const sendQuickReply = async () => {
    if (!selectedConversation || !newMessage.trim()) return;
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: [selectedConversation.otherUser.id],
          content: `Re: ${selectedConversation.lastMessage.subject}\n\n${newMessage}`,
          contextType: 'direct'
        })
      });

      if (response.ok) {
        setNewMessage('');
        await fetchConversationMessages(selectedConversation.otherUser.id);
        await fetchConversations();
        
        toast({
          title: "Message Sent",
          description: "Your reply has been sent successfully",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Send new message
  const sendNewMessage = async () => {
    if (!recipientId || !subject.trim() || !body.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: [recipientId],
          content: `Subject: ${subject}\n\n${body}`,
          contextType: 'direct'
        })
      });

      if (response.ok) {
        setRecipientId('');
        setSubject('');
        setBody('');
        setShowCompose(false);
        
        await fetchConversations();
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Initialize data
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (users.length > 0) {
      fetchConversations();
    }
  }, [users]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r bg-background">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
            </h2>
            <Dialog open={showCompose} onOpenChange={setShowCompose}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                  <DialogDescription>
                    Send a direct message to another user
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select value={recipientId} onValueChange={setRecipientId}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select recipient..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter message subject"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <Textarea
                      id="body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Type your message here..."
                      className="mt-1 min-h-[120px]"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCompose(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendNewMessage} disabled={submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a new conversation to get started</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.otherUser.id}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    fetchConversationMessages(conversation.otherUser.id);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.otherUser.id === conversation.otherUser.id 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(conversation.otherUser.firstName, conversation.otherUser.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">
                          {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-[20px] text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.subject}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt))} ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(selectedConversation.otherUser.firstName, selectedConversation.otherUser.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.otherUser.firstName} {selectedConversation.otherUser.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.otherUser.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === (user as any)?.id;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {message.subject}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.body}
                        </div>
                        <div className={`text-xs mt-2 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatDistanceToNow(new Date(message.createdAt))} ago
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Quick Reply */}
            <div className="p-4 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a quick reply..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendQuickReply()}
                  className="flex-1"
                />
                <Button onClick={sendQuickReply} disabled={!newMessage.trim() || submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}