import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
  LoadingIndicator,
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Users, 
  Plus, 
  Star, 
  Archive, 
  Trash2,
  Folder,
  Search
} from 'lucide-react';

export default function StreamMessagesPage() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize Stream Chat client
  useEffect(() => {
    const initializeClient = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get Stream credentials and user token from backend
        const response = await fetch('/api/stream/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to get Stream credentials');
        }

        const { apiKey, userToken, streamUserId } = await response.json();

        const chatClient = StreamChat.getInstance(apiKey);
        
        await chatClient.connectUser({
          id: streamUserId,
          name: `${user.firstName} ${user.lastName}` || user.email,
          email: user.email,
          image: user.profileImageUrl || undefined,
        }, userToken);

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
          <LoadingIndicator size={40} />
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
          <h1 className="text-2xl font-main-heading text-primary dark:text-secondary">Stream Messages</h1>
          <p className="font-body text-muted-foreground">Professional messaging with Stream Chat</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Connected
          </Badge>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex">
        <Chat client={client}>
          {/* Channel List Sidebar */}
          <div className="w-80 border-r bg-background">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Conversations</h3>
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-9"
                />
              </div>
            </div>
            <ChannelList 
              filters={{ members: { $in: [client.userID!] } }}
              sort={{ last_message_at: -1 }}
              options={{ limit: 20 }}
              showChannelSearch
              onSelect={(channel) => setSelectedChannel(channel)}
            />
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {selectedChannel ? (
              <Channel channel={selectedChannel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Chat>
      </div>
    </div>
  );
}