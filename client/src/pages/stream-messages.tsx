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
  Plus, 
  Inbox,
  Send
} from 'lucide-react';

export default function StreamMessagesPage() {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create direct message channel between two users (email-style)
  const createDirectMessage = async (recipientId: string) => {
    if (!client) return null;

    try {
      console.log('Creating direct message channel with:', recipientId);
      const channel = client.channel('messaging', {
        members: [client.userID!, recipientId]
      });
      await channel.create();
      console.log('✅ Direct message channel created');
      return channel;
    } catch (error) {
      console.error('Error creating direct message:', error);
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

  // Handle starting a new conversation (compose)
  const handleComposeMessage = async () => {
    if (!client || !user) return;

    try {
      // For testing, create conversation with test user
      const channel = await createDirectMessage('test-user-2');
      if (channel) {
        setSelectedChannel(channel);
        
        // Send a welcome message with email-style metadata
        await sendEmailStyleMessage(channel, 'This is a direct message conversation.', 'Welcome to Direct Messaging');
        
        toast({
          title: "New Conversation",
          description: "Started new conversation with Test User",
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start new conversation",
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
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User',
          image: user.profileImageUrl || undefined,
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
          <h1 className="text-2xl font-main-heading text-primary dark:text-secondary">Direct Messages</h1>
          <p className="font-body text-muted-foreground">Email-style direct messaging system</p>
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
          {/* Email-style Sidebar */}
          <div className="w-80 border-r bg-background">
            <div className="p-4 border-b">
              <Button 
                onClick={handleComposeMessage} 
                className="w-full mb-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Button>
              
              {/* Email-style folders */}
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start">
                  <Inbox className="w-4 h-4 mr-2" />
                  Inbox
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Send className="w-4 h-4 mr-2" />
                  Sent
                </Button>
              </div>
            </div>
            
            {/* Direct Messages List */}
            <div className="flex-1">
              <ChannelList 
                filters={{ 
                  members: { $in: [client.userID!] },
                  type: 'messaging'
                }}
                sort={{ last_message_at: -1 }}
                options={{ limit: 20 }}
              />
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            <Channel>
              <Window>
                <ChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </div>
        </Chat>
      </div>
    </div>
  );
}