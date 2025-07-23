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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MessageCircle, 
  Plus, 
  Inbox,
  Send,
  X,
  Loader2,
  ArrowLeft
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
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Note: fetchAvailableUsers is now called after user sync completes

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
        const filteredUsers = activeUsers.filter((dbUser: any) => 
          dbUser.isActive && 
          dbUser.id !== (user as any)?.id &&
          dbUser.email // Ensure user has email
        ).map((dbUser: any) => ({
          id: dbUser.id,
          displayName: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : dbUser.email,
          email: dbUser.email
        }));
        console.log('📊 Processed available users:', filteredUsers.length, 'users');
        console.log('📋 Users data structure:', filteredUsers);
        return filteredUsers; // Return the users array
      } else {
        console.error('Failed to fetch users:', response.statusText);
        return []; // Return empty array
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return []; // Return empty array
    }
  };

  // Sync all database users to Stream using server-side endpoint
  const syncUsersToStream = async () => {
    console.log('🔄 Starting server-side user sync to Stream...');
    
    try {
      const response = await fetch('/api/stream/sync-users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ Server-side sync successful: ${result.syncedUsers} users synced`);
        console.log('📋 Sync response:', result);
        return true;
      } else {
        console.error('❌ Server-side sync failed:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Server-side sync error:', error);
      return false;
    }
  };

  // Old client-side sync (keeping for fallback but not using)
  const oldSyncUsersToStream = async () => {
    if (!client) {
      console.log('❌ Stream client not ready for user sync');
      return false;
    }
    
    console.log('🔄 Starting client-side user sync to Stream...');
    
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const users = Array.isArray(data) ? data : (data.users || []);
        console.log('📊 Found users to sync:', users.length, 'total users');
        console.log('📋 Users data:', users);
        
        // Prepare users for batch upsert
        const streamUsers = users
          .filter((dbUser: any) => dbUser.isActive && dbUser.email)
          .map((dbUser: any) => ({
            id: dbUser.id,
            name: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : dbUser.email,
            email: dbUser.email
          }));
        
        console.log('🔄 Batch creating Stream users:', streamUsers.length, 'users');
        
        // Use upsertUsers (plural) for batch creation
        await client.upsertUsers(streamUsers);
        console.log('✅ Successfully synced all users to Stream');
        return true;
      } else {
        console.error('❌ Failed to fetch users:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to sync users to Stream:', error);
      return false;
    }
  };

  // Auto-sync users when Stream client is ready - this MUST complete before messaging
  useEffect(() => {
    const initializeUsersAndFetchAvailable = async () => {
      if (client) {
        console.log('📡 Stream client ready, starting user sync...');
        const syncSuccess = await syncUsersToStream();
        if (syncSuccess) {
          console.log('✅ User sync completed, now fetching available users...');
          const users = await fetchAvailableUsers();
          console.log('Setting available users to state:', users);
          setAvailableUsers(users); // Explicitly set state
          console.log('📊 Available users after fetch:', users.length, 'users');
          
          // Also fetch existing messages
          await fetchMessages();
        } else {
          console.error('❌ User sync failed, messaging may not work properly');
        }
      }
    };
    
    initializeUsersAndFetchAvailable();
  }, [client]);

  // Debug state updates
  useEffect(() => {
    console.log('Available users state updated:', availableUsers.length);
  }, [availableUsers]);

  // Listen for new messages in real-time
  useEffect(() => {
    if (!client) return;

    const handleNewMessage = (event: any) => {
      console.log('📨 New message received:', event.message);
      
      // Safe channel state update
      if (event.channel && event.channel.state && event.channel.state.messages) {
        event.channel.state.messages.push(event.message);
      }
      
      // Get recipient names (other members in the channel) - fix undefined state issue
      const recipientNames = event.channel?.state?.members ? 
        Object.keys(event.channel.state.members)
          .filter((m: string) => m !== event.message.user?.id)
          .map((memberId: string) => {
            // Find the display name for this member - handle both formats
            let memberUser = availableUsers.find(u => u.id === memberId);
            if (!memberUser) {
              // Try with user_ prefix stripped
              const cleanId = memberId.replace('user_', '');
              memberUser = availableUsers.find(u => u.id === cleanId);
            }
            if (!memberUser) {
              // Try finding by the full user_id format
              memberUser = availableUsers.find(u => `user_${u.id}` === memberId);
            }
            return memberUser?.displayName || memberId.replace('user_', '').replace('admin_', '').replace('_', ' ');
          }) : [];
      
      const newMessage = {
        id: event.message.id,
        from: event.message.user?.id,
        fromName: event.message.user?.name || event.message.user?.id,
        recipientNames: recipientNames,
        subject: (event.message as any).custom?.subject || `Message to ${recipientNames.join(', ')}`,
        text: event.message.text,
        timestamp: new Date(event.message.created_at!),
        channelId: event.channel.id,
        channel: event.channel
      };
      
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.find(msg => msg.id === newMessage.id);
        if (!exists) {
          console.log('✅ Adding new message to UI:', newMessage.subject);
          return [newMessage, ...prev];
        }
        return prev;
      });
    };

    client.on('message.new', handleNewMessage);

    return () => {
      client.off('message.new', handleNewMessage);
    };
  }, [client]);

  // Gmail-style folder navigation
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'conversations'>('inbox');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);

  // Filter messages based on folder
  const getFilteredMessages = () => {
    if (!user || !messages.length) return [];
    
    switch(activeFolder) {
      case 'inbox':
        return messages.filter(msg => 
          msg.from && msg.from !== (user as any)?.id // Messages from others (received)
        );
      case 'sent':
        return messages.filter(msg => msg.from === (user as any)?.id); // Messages from current user
      case 'conversations':
        return messages; // all messages
      default:
        return messages;
    }
  };

  // Fetch messages from Stream channels
  const fetchMessages = async () => {
    if (!client || !user) {
      console.log('Cannot fetch messages - missing client or user:', { client: !!client, user: !!user });
      return;
    }
    
    try {
      const currentUserId = (user as any)?.id; // Use the actual user ID without double prefix
      console.log('📥 Fetching messages from Stream Chat for user:', currentUserId);
      console.log('📋 Available users for name lookup:', availableUsers.map(u => ({ id: u.id, name: u.displayName })));
      
      // Get all channels the user is a member of - try multiple filter variations
      const filters = [
        { members: { $in: [currentUserId] } },
        { members: { $in: [`user_${currentUserId}`] } },
        { members: { $in: [currentUserId, `user_${currentUserId}`] } },
        {} // Get all channels as fallback
      ];
      
      let channelsResponse: any[] = [];
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        console.log(`Trying filter ${i + 1}:`, filter);
        const sort = [{ last_message_at: -1 }];
        
        try {
          channelsResponse = await client.queryChannels(filter, sort, {
            watch: true,
            state: true,
            limit: 30
          });
          
          console.log(`Filter ${i + 1} returned channels:`, channelsResponse.length, 'channels');
          if (channelsResponse.length > 0) {
            console.log('✅ Found channels with filter:', filter);
            break; // Use the first filter that returns results
          }
        } catch (error: any) {
          console.log(`Filter ${i + 1} failed:`, error?.message || 'Unknown error');
        }
      }
      channelsResponse.forEach((channel, index) => {
        console.log(`Channel ${index + 1}: ${channel.id}, members:`, channel.state?.members ? Object.keys(channel.state.members) : []);
      });
      
      const allMessages: any[] = [];
      
      for (const channel of channelsResponse) {
        console.log('Processing channel:', channel.id);
        const messagesResponse = await channel.query({
          messages: { limit: 100 }
        });
        
        if (messagesResponse.messages) {
          console.log(`Channel ${channel.id} has ${messagesResponse.messages.length} messages`);
          const formattedMessages = messagesResponse.messages.map((msg: any) => {
            // Get recipient names (other members in the channel) - improved user lookup
            const recipientNames = channel.state?.members ? 
              Object.keys(channel.state.members)
                .filter((m: string) => m !== msg.user?.id)
                .map((memberId: string) => {
                  // Find the display name for this member - handle multiple ID formats
                  let memberUser = availableUsers.find(u => u.id === memberId);
                  if (!memberUser) {
                    // Try with user_ prefix stripped
                    const cleanId = memberId.replace('user_', '').replace('admin_', '');
                    memberUser = availableUsers.find(u => u.id === cleanId);
                  }
                  if (!memberUser) {
                    // Try finding by the full user_id format
                    memberUser = availableUsers.find(u => `user_${u.id}` === memberId);
                  }
                  return memberUser?.displayName || memberId.replace('user_', '').replace('admin_', '').replace('_', ' ');
                }) : [];
            
            return {
              id: msg.id,
              from: msg.user?.id,
              fromName: msg.user?.name || msg.user?.id,
              recipientNames: recipientNames,
              subject: (msg as any).custom?.subject || `Message to ${recipientNames.join(', ')}`,
              text: msg.text,
              timestamp: new Date(msg.created_at!),
              channelId: channel.id,
              channel: channel
            };
          });
          allMessages.push(...formattedMessages);
        }
      }
      
      // Sort by timestamp, newest first
      allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      console.log('📊 Total messages loaded:', allMessages.length);
      console.log('Messages breakdown by folder:');
      console.log('- All messages:', allMessages.length);
      console.log('- From others (inbox):', allMessages.filter(msg => msg.from && msg.from !== currentUserId).length);
      console.log('- From current user (sent):', allMessages.filter(msg => msg.from === currentUserId).length);
      
      setMessages(allMessages);
      setConversations(channelsResponse);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

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
      console.log('✅ Email-style message sent with subject:', subject);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle autocomplete recipient input
  const handleRecipientInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRecipientInput(input);
    console.log('📝 Input changed:', input);
    console.log('👥 Available users:', availableUsers);
    console.log('👥 Available users count:', availableUsers.length);
    
    if (input.length > 0) {
      const filtered = availableUsers.filter(user => 
        user.displayName?.toLowerCase().includes(input.toLowerCase()) ||
        user.email?.toLowerCase().includes(input.toLowerCase())
      );
      console.log('🔍 Filtered users:', filtered);
      console.log('🔍 Filtered count:', filtered.length);
      setFilteredUsers(filtered);
      setShowSuggestions(true);
      console.log('👁️ Show suggestions:', true);
    } else {
      setShowSuggestions(false);
      console.log('👁️ Show suggestions:', false);
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
        
        // Refresh message list to show newly sent message with delay to allow Stream processing
        console.log('🔄 Refreshing message list after send...');
        setTimeout(async () => {
          console.log('📡 Delayed fetch after message send...');
          await fetchMessages();
        }, 1500);
        
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
          <p className="font-body text-muted-foreground">Email-style messaging - all database users auto-synced</p>
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
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Compose a new message to send to team members. Start typing names in the "To:" field to see available recipients.
              </DialogDescription>
              <div className="p-6">
                
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
                    <div className="absolute z-50 bg-white dark:bg-gray-800 border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
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
          
          {/* Folder navigation */}
          <div className="space-y-2">
            <div 
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm font-medium ${
                activeFolder === 'inbox' 
                  ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveFolder('inbox')}
            >
              <Inbox className="w-4 h-4" />
              <span>📥 Inbox ({getFilteredMessages().length})</span>
            </div>
            <div 
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm ${
                activeFolder === 'sent' 
                  ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveFolder('sent')}
            >
              <Send className="w-4 h-4" />
              <span>📤 Sent ({messages.filter(msg => msg.from === `user_${(user as any)?.id}`).length})</span>
            </div>
            <div 
              className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm ${
                activeFolder === 'conversations' 
                  ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 font-medium'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              onClick={() => setActiveFolder('conversations')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>💬 All Messages ({messages.length})</span>
            </div>
          </div>
        </div>

        {/* Message list and content area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            /* Message detail view when a channel is selected */
            <div className="flex flex-col h-full">
              {/* Message thread header */}
              <div className="border-b p-4 flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedChannel(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to {activeFolder}
                </Button>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">
                    {selectedChannel.data?.name || 'Direct Message'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedChannel.state?.members ? Object.keys(selectedChannel.state.members).length : 0} participants
                  </p>
                </div>
              </div>

              {/* Messages in the selected channel */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChannel.state?.messages?.map((message: any) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {message.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString()}
                        </span>
                      </div>
                      {message.custom?.subject && (
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Subject: {message.custom.subject}
                        </div>
                      )}
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!selectedChannel.state?.messages || selectedChannel.state.messages.length === 0) && (
                  <div className="text-center text-gray-500 py-8">
                    No messages in this conversation yet.
                  </div>
                )}
              </div>

              {/* Reply input area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a reply..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        selectedChannel.sendMessage({ text: e.currentTarget.value.trim() });
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Message list view when no channel is selected */
            <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <h2 className="text-lg font-semibold capitalize">
                  {activeFolder === 'conversations' ? 'All Messages' : activeFolder}
                  <span className="ml-2 text-sm text-gray-500">({getFilteredMessages().length})</span>
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {getFilteredMessages().length > 0 ? (
                  <div className="divide-y">
                    {getFilteredMessages().map((msg) => (
                      <div 
                        key={msg.id} 
                        className="p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-300"
                        onClick={() => setSelectedChannel(msg.channel)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="font-medium text-sm">
                            {activeFolder === 'sent' ? (
                              <span className="text-gray-600">To: {msg.recipientNames.join(', ')}</span>
                            ) : (
                              <span className="text-gray-900">{msg.fromName}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</div>
                        <div className="text-sm text-gray-600 truncate">{msg.text}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-center max-w-md mx-auto">
                      <MessageCircle className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                      <h3 className="text-2xl font-main-heading text-primary mb-4">
                        {activeFolder === 'inbox' && 'No Messages in Inbox'}
                        {activeFolder === 'sent' && 'No Sent Messages'}
                        {activeFolder === 'conversations' && 'No Conversations'}
                      </h3>
                      <p className="font-body text-muted-foreground mb-6">
                        {activeFolder === 'inbox' && 'You haven\'t received any messages yet.'}
                        {activeFolder === 'sent' && 'You haven\'t sent any messages yet.'}
                        {activeFolder === 'conversations' && 'No conversations available.'}
                      </p>
                      
                      <Button 
                        onClick={() => setShowCompose(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start Conversation
                      </Button>
                      
                      {/* Only show user availability when compose dialog is open */}
                      {showCompose && availableUsers.length > 0 && (
                        <div className="mt-4 text-center">
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">✅ {availableUsers.length} users available</p>
                        </div>
                      )}
                      
                      {showCompose && availableUsers.length === 0 && (
                        <div className="mt-4 text-center">
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">⏳ Loading users...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}