import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Plus, 
  Inbox,
  Send,
  ArrowLeft,
  Loader2,
  Reply,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  contextType?: string;
  conversationId?: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export default function UnifiedMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Compose form
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all messages from database
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Fetch both inbox and sent messages
      const [inboxResponse, sentResponse] = await Promise.all([
        fetch('/api/messaging/inbox', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/messaging/sent', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ]);
      
      const inboxData = inboxResponse.ok ? await inboxResponse.json() : { messages: [] };
      const sentData = sentResponse.ok ? await sentResponse.json() : { messages: [] };
      
      // Combine messages with proper recipient/sender info
      const combinedMessages = [
        ...(inboxData.messages || []).map((msg: any) => ({
          ...msg,
          type: 'received',
          recipientId: (user as any)?.id,
          recipientName: `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim() || (user as any)?.email
        })),
        ...(sentData.messages || []).map((msg: any) => ({
          ...msg,
          type: 'sent',
          // For sent messages, we need to get recipient info from the message recipients
          recipientId: 'unknown', // Will be filled in by backend if available
          recipientName: 'Recipients'
        }))
      ];
      
      console.log('Fetched messages:', {
        inbox: inboxData.messages?.length || 0,
        sent: sentData.messages?.length || 0,
        total: combinedMessages.length
      });
      
      setMessages(combinedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for recipient selection
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched users:', data);
        const activeUsers = Array.isArray(data) ? data : (data.users || []);
        setUsers(activeUsers.filter((u: User) => u.isActive && u.id !== (user as any)?.id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Filter messages based on active tab
  const getFilteredMessages = () => {
    const currentUserId = (user as any)?.id;
    if (!currentUserId) return [];

    switch (activeTab) {
      case 'inbox':
        return messages.filter(msg => msg.recipientId === currentUserId);
      case 'sent':
        return messages.filter(msg => msg.senderId === currentUserId);
      default:
        return messages;
    }
  };

  // Send new message
  const handleSendMessage = async () => {
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
          recipientIds: [recipientId], // Convert to array format expected by API
          content: `Subject: ${subject}\n\n${body}`, // Combine subject and body
          contextType: 'direct'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Message sent:', result);
        
        toast({
          title: "Message Sent",
          description: "Your message has been sent successfully",
        });

        // Reset form and close dialog
        setRecipientId('');
        setSubject('');
        setBody('');
        setShowCompose(false);
        
        // Refresh messages
        await fetchMessages();
      } else {
        const errorData = await response.json();
        console.error('Send failed:', errorData);
        toast({
          title: "Send Failed",
          description: errorData.message || "Failed to send message",
          variant: "destructive",
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
      fetchMessages();
      fetchUsers();
    }
  }, [user]);

  const filteredMessages = getFilteredMessages();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMessage(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
          <h1 className="text-2xl font-bold">Message Details</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>From: {selectedMessage.senderName}</span>
                  <span>To: {selectedMessage.recipientName}</span>
                  <span>{formatDistanceToNow(new Date(selectedMessage.createdAt))} ago</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm">
              {selectedMessage.body}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Direct Messages
        </h1>
        
        <Dialog open={showCompose} onOpenChange={setShowCompose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Compose Message
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
                <select
                  id="recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select recipient...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter your message"
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={submitting}
                  className="gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={activeTab === 'inbox' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('inbox')}
          className="gap-2"
        >
          <Inbox className="h-4 w-4" />
          Inbox ({messages.filter(msg => msg.recipientId === (user as any)?.id).length})
        </Button>
        <Button
          variant={activeTab === 'sent' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sent')}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Sent ({messages.filter(msg => msg.senderId === (user as any)?.id).length})
        </Button>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeTab === 'inbox' ? 'Received Messages' : 'Sent Messages'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {activeTab === 'inbox' ? 'received' : 'sent'} messages found</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredMessages.map((message) => (
                  <Card 
                    key={message.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {activeTab === 'inbox' ? message.senderName : message.recipientName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt))} ago
                            </span>
                          </div>
                          <h4 className="font-medium truncate mt-1">{message.subject}</h4>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {message.body}
                          </p>
                        </div>
                        {activeTab === 'inbox' && !message.isRead && (
                          <Badge variant="secondary" className="ml-2">New</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}