import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
// Removed Stream UI components - keeping only the client connection
import 'stream-chat-react/dist/css/v2/index.css';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, 
  Plus, 
  Inbox,
  Send,
  X,
  Loader2
} from 'lucide-react';

export default function StreamMessagesPage() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [recipientInput, setRecipientInput] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch real users from database
  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched real users from database:', data);
        // Filter out the current user and inactive users
        const activeUsers = Array.isArray(data) ? data : (data.users || []);
        const filteredUsers = activeUsers.filter(dbUser => 
          dbUser.isActive && 
          dbUser.id !== user?.id &&
          dbUser.email // Ensure user has email
        ).map(dbUser => ({
          id: dbUser.id,
          displayName: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : dbUser.email,
          email: dbUser.email
        }));
        setAvailableUsers(filteredUsers);
        console.log('Processed available users:', filteredUsers);
      } else {
        console.error('Failed to fetch users:', response.statusText);
        // Fall back to empty array
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAvailableUsers([]);
    }
  };

  // Real users from database
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // Create direct or group message channel (email-style)
  const createDirectMessage = async (recipientIds: string | string[]) => {
    if (!client) return null;

    try {
      // recipientIds can be a single ID or array of IDs
      const recipients = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
      const members = [client.userID!, ...recipients];
      
      console.log('Creating message channel with recipients:', recipients);
      const channelData: any = {
        members: members
      };
      if (members.length > 2) {
        channelData.name = 'Group Message';
      }
      
      const channel = client.channel('messaging', channelData);
      await channel.create();
      console.log('✅ Message channel created for', members.length, 'participants');
      return channel;
    } catch (error) {
      console.error('Error creating message channel:', error);
      return null;
    }
  };

  // Send email-style message with custom metadata
  const sendEmailStyleMessage = async (channel: any, messageBody: string, subject: string = 'Direct Message') => {
    if (!channel) return;

    try {
      await channel.sendMessage({
        text: messageBody,
        custom: {
          subject: subject,
          isRead: false,
          folder: 'inbox',
          messageType: 'direct'
        }
      });
      console.log('✅ Email-style message sent with metadata');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle autocomplete recipient input
  const handleRecipientInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRecipientInput(input);
    
    if (input.length > 0) {
      const filtered = availableUsers.filter(user => 
        user.displayName.toLowerCase().includes(input.toLowerCase()) ||
        user.email.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select recipient from autocomplete
  const selectRecipient = (user: any) => {
    if (!selectedRecipients.includes(user.id)) {
      setSelectedRecipients([...selectedRecipients, user.id]);
    }
    setRecipientInput('');
    setShowSuggestions(false);
  };

  // Remove selected recipient
  const removeRecipient = (userId: string) => {
    setSelectedRecipients(selectedRecipients.filter(id => id !== userId));
  };

  // Handle sending email-style message
  const handleSendMessage = async () => {
    if (!client || !user || selectedRecipients.length === 0 || !messageBody.trim()) return;

    try {
      const channel = await createDirectMessage(selectedRecipients);
      
      if (channel) {
        // Send message with email-style metadata
        await sendEmailStyleMessage(channel, messageBody, subject || 'Direct Message');
        
        setSelectedChannel(channel);
        setShowCompose(false);
        
        // Reset form
        setSelectedRecipients([]);
        setRecipientInput('');
        setSubject('');
        setMessageBody('');
        
        const recipientNames = selectedRecipients.map(id => 
          availableUsers.find(u => u.id === id)?.displayName
        ).join(', ');
        
        toast({
          title: "Message Sent",
          description: `Message sent to ${recipientNames}`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Initialize Stream Chat client
  useEffect(() => {
    console.log('StreamMessagesPage mounting...');
    console.log('User object:', user);
    console.log('User truthy?', !!user);
    
    const initializeClient = async () => {
      if (!user) {
        console.log('No user found, skipping Stream initialization');
        return;
      }

      console.log('✅ User found, initializing Stream Chat');
      
      try {
        console.log('Starting Stream Chat initialization...');
        setLoading(true);
        setError(null);

        console.log('Fetching Stream credentials from /api/stream/credentials...');
        // Get Stream credentials and user token from backend
        const response = await fetch('/api/stream/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        console.log('Credentials response status:', response.status);
        console.log('Credentials response:', response);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to get Stream credentials');
        }

        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        const { apiKey, userToken, streamUserId } = responseData;
        console.log('Got credentials - API Key:', apiKey, 'Stream User ID:', streamUserId);

        console.log('Creating StreamChat instance...');
        const chatClient = StreamChat.getInstance(apiKey);
        
        console.log('Connecting user to Stream Chat...');
        await chatClient.connectUser({
          id: streamUserId,
          name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || (user as any).email || 'User',
          image: (user as any).profileImageUrl || undefined,
        }, userToken);
        
        console.log('✅ Stream Chat connection successful!');

        setClient(chatClient);
        setLoading(false);

        toast({
          title: "Connected to Stream Chat",
          description: "You can now send and receive messages.",
        });

      } catch (error: any) {
        console.error('Failed to initialize Stream Chat:', error);
        setError(error.message || 'Failed to connect to Stream Chat');
        setLoading(false);
        
        toast({
          title: "Stream Chat Connection Failed",
          description: error.message || "Please check your internet connection and try again.",
          variant: "destructive"
        });
      }
    };

    initializeClient();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Connecting to Stream Chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Connection Failed</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stream Chat Not Available</h3>
            <p className="text-muted-foreground">Unable to connect to messaging service.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-main-heading text-primary dark:text-secondary">Direct Messages</h1>
          <p className="font-body text-muted-foreground">Email-style direct messaging system</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        </div>
      </div>

      {/* Gmail-style Email Interface */}
      <div className="flex h-full">
        {/* Email folders sidebar */}
        <div className="w-64 border-r bg-gray-50 dark:bg-gray-900/50 p-4">
          <Dialog open={showCompose} onOpenChange={setShowCompose}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4">
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">New Message</h2>
                
                {/* To field with autocomplete */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium mb-1">To:</label>
                  
                  {/* Selected recipients */}
                  {selectedRecipients.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedRecipients.map(recipientId => {
                        const user = availableUsers.find(u => u.id === recipientId);
                        return user ? (
                          <span key={user.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                            {user.displayName}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-blue-600" 
                              onClick={() => removeRecipient(user.id)}
                            />
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  
                  <Input
                    type="text"
                    placeholder="Start typing a name..."
                    value={recipientInput}
                    onChange={handleRecipientInput}
                    className="w-full"
                  />
                  
                  {/* Autocomplete dropdown */}
                  {showSuggestions && filteredUsers.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                      {filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectRecipient(user)}
                        >
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject line */}
                <div className="mb-4">
                  <Label className="block text-sm font-medium mb-1">Subject:</Label>
                  <Input
                    type="text"
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Message body */}
                <div className="mb-4">
                  <Label className="block text-sm font-medium mb-1">Message:</Label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your message..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={selectedRecipients.length === 0 || !messageBody.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCompose(false);
                      setSelectedRecipients([]);
                      setRecipientInput('');
                      setSubject('');
                      setMessageBody('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="space-y-1">
            <button className="w-full text-left p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center">
              📥 <span className="ml-2">Inbox</span>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center">
              📤 <span className="ml-2">Sent</span>
            </button>
            <button className="w-full text-left p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg flex items-center">
              📂 <span className="ml-2">Conversations</span>
            </button>
          </div>
        </div>

        {/* Message list and content area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg">Messages</h3>
          </div>
          
          <div className="flex-1 p-4">
            {selectedChannel ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <div className="mb-4 pb-2 border-b">
                  <p className="text-sm text-muted-foreground">
                    Conversation with {selectedChannel.data?.name || 'Direct Message'}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    Stream Chat connection established. Custom message interface coming soon.
                  </p>
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setSelectedChannel(null)}>
                      Back to Message List
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Direct Messages</h3>
                <p className="text-muted-foreground mb-4">
                  Select a conversation or compose a new message to get started.
                </p>
                <Button onClick={() => setShowCompose(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Compose New Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}