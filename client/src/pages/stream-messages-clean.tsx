import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  LoadingIndicator,
  ChannelList
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

import { useAuth } from '@/hooks/useAuth';

// Type guard for user object
function isValidUser(user: any): user is { id: number; firstName?: string; lastName?: string; email: string } {
  return user && typeof user.id !== 'undefined' && user.email;
}
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  MessageCircle, 
  Plus, 
  Users,
  Hash,
  Loader2
} from 'lucide-react';

export default function StreamMessagesPage() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'messaging' | 'team'>('messaging');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch available users for creating channels
  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        const activeUsers = Array.isArray(data) ? data : (data.users || []);
        const filteredUsers = activeUsers.filter((dbUser: any) => 
          dbUser.isActive && 
          dbUser.id !== (isValidUser(user) ? user.id : null) &&
          dbUser.email
        ).map((dbUser: any) => ({
          id: dbUser.id.toString(),
          name: dbUser.firstName ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim() : dbUser.email,
          email: dbUser.email
        }));
        return filteredUsers;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  };

  // Initialize Stream Chat client
  useEffect(() => {
    const initializeStreamChat = async () => {
      if (!isValidUser(user)) return;

      try {
        setLoading(true);
        console.log('🚀 Initializing Stream Chat...');

        // First sync users to Stream
        const syncResponse = await fetch('/api/stream/sync-users', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!syncResponse.ok) {
          throw new Error('Failed to sync users to Stream');
        }

        console.log('✅ Users synced to Stream successfully');

        // Get Stream token for current user
        const tokenResponse = await fetch('/api/stream/token', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id.toString() })
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to get Stream token');
        }

        const { token, apiKey } = await tokenResponse.json();
        console.log('✅ Stream token received');

        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(apiKey);
        
        // Connect user to Stream
        await chatClient.connectUser(
          {
            id: user.id.toString(),
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email
          },
          token
        );

        console.log('✅ Connected to Stream Chat');
        setClient(chatClient);

        // Fetch available users for creating channels
        const users = await fetchAvailableUsers();
        setAvailableUsers(users);

        setError(null);
      } catch (err: any) {
        console.error('Stream Chat initialization failed:', err);
        setError(err.message);
        toast({
          title: 'Connection Failed',
          description: 'Unable to connect to messaging service. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeStreamChat();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [isValidUser(user) ? user.id : null]);

  const createChannel = async () => {
    if (!client || !channelName.trim()) return;

    try {
      setLoading(true);

      const currentUser = user as any; // Type assertion since we've validated with isValidUser
      let channel;
      if (channelType === 'messaging') {
        // For messaging channels, use auto-generated ID
        channel = client.channel(channelType, {
          members: [currentUser.id.toString(), ...selectedUsers]
        });
      } else {
        // For team channels, include name in metadata
        channel = client.channel(channelType, channelName, {
          members: [currentUser.id.toString(), ...selectedUsers]
        });
      }

      await channel.create();
      setActiveChannel(channel);
      setShowNewChannel(false);
      setChannelName('');
      setSelectedUsers([]);

      toast({
        title: 'Channel Created',
        description: `${channelName || 'Direct message'} has been created successfully.`
      });
    } catch (err: any) {
      console.error('Failed to create channel:', err);
      toast({
        title: 'Creation Failed',
        description: 'Unable to create channel. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Connecting to Stream Chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Stream Chat not initialized</p>
      </div>
    );
  }

  const filters = { members: { $in: [isValidUser(user) ? user.id.toString() : ''] } };
  const sort = [{ last_message_at: -1 }] as const;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-semibold">Stream Chat Messages</h1>
        </div>
        
        <Dialog open={showNewChannel} onOpenChange={setShowNewChannel}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Channel</DialogTitle>
              <DialogDescription>
                Start a new conversation with team members
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="channelName">Channel Name</Label>
                <Input
                  id="channelName"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Enter channel name"
                />
              </div>

              <div>
                <Label htmlFor="channelType">Channel Type</Label>
                <select
                  id="channelType"
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value as 'messaging' | 'team')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="messaging">Direct Message</option>
                  <option value="team">Team Channel</option>
                </select>
              </div>

              <div>
                <Label>Select Users</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                  {availableUsers.map((availableUser) => (
                    <div key={availableUser.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${availableUser.id}`}
                        checked={selectedUsers.includes(availableUser.id)}
                        onChange={() => toggleUserSelection(availableUser.id)}
                        className="rounded"
                      />
                      <label htmlFor={`user-${availableUser.id}`} className="text-sm">
                        {availableUser.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                onClick={createChannel} 
                className="w-full"
                disabled={!channelName.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Channel'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stream Chat Interface */}
      <div className="flex-1 flex">
        <Chat client={client} theme="str-chat__theme-light">
          {/* Channel List Sidebar */}
          <div className="w-80 border-r">
            <ChannelList
              filters={filters}
              sort={sort}
              showChannelSearch
            />
          </div>

          {/* Main Chat Area */}
          <div className="flex-1">
            {activeChannel ? (
              <Channel channel={activeChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Channel</h3>
                  <p className="text-muted-foreground">
                    Choose a channel from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </Chat>
      </div>
    </div>
  );
}