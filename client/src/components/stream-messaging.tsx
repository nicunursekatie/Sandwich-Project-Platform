import React, { useState, useEffect } from 'react';
import { 
  Chat, 
  Channel, 
  ChannelList, 
  MessageList, 
  MessageInput,
  Thread,
  Window,
  ChannelHeader,
  LoadingIndicator,
  ChannelPreviewProps
} from 'stream-chat-react';
import { StreamChat, Channel as ChannelType } from 'stream-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Edit3, 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Search,
  Users,
  Plus,
  Mail,
  Star,
  Reply,
  Forward,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Import Stream Chat styles
import 'stream-chat-react/dist/css/v2/index.css';

// Custom email-style preview component
const EmailPreview = ({ channel, setActiveChannel }: ChannelPreviewProps) => {
  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();
  const isUnread = unreadCount > 0;
  
  // Get subject from channel data or last message
  const subject = channel.data?.subject || lastMessage?.text?.substring(0, 50) + '...' || '(No Subject)';
  const senderName = lastMessage?.user?.name || 'Unknown Sender';
  const timestamp = lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleDateString() : '';
  const preview = lastMessage?.text?.substring(0, 100) + '...' || '';

  return (
    <div 
      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${isUnread ? 'bg-blue-25 border-l-4 border-l-blue-500' : ''}`}
      onClick={() => setActiveChannel?.(channel)}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
          {senderName}
        </span>
        <div className="flex items-center gap-2">
          {isUnread && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              {unreadCount}
            </Badge>
          )}
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
      </div>
      
      <h4 className={`text-sm mb-1 ${isUnread ? 'font-bold' : 'text-gray-700'}`}>
        {subject}
      </h4>
      
      <p className={`text-xs line-clamp-2 ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
        {preview}
      </p>
    </div>
  );
};

export default function StreamMessaging() {
  const { user } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<ChannelType | null>(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  });

  // Initialize Stream Chat client
  useEffect(() => {
    const initializeClient = async () => {
      if (!user) return;

      try {
        // Note: In production, you'll need to get these from your backend
        const apiKey = import.meta.env.VITE_STREAM_API_KEY || 'demo-api-key';
        const userToken = import.meta.env.VITE_STREAM_USER_TOKEN || 'demo-token';

        const chatClient = StreamChat.getInstance(apiKey);
        
        await chatClient.connectUser({
          id: user.id,
          name: `${user.firstName} ${user.lastName}` || user.email,
          email: user.email,
        }, userToken);

        setClient(chatClient);
      } catch (error) {
        console.error('Failed to initialize Stream Chat:', error);
        toast({
          title: "Chat Initialization Failed",
          description: "Please contact support if this issue persists.",
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
  }, [user]);

  // Filter functions for different folders
  const getChannelFilters = () => {
    const baseFilter = { 
      type: 'messaging',
      members: { $in: [user?.id || ''] }
    };

    switch (activeFolder) {
      case 'inbox':
        return {
          ...baseFilter,
          'custom.folder': { $ne: 'sent' },
          'custom.isDeleted': { $ne: true },
          'custom.isDraft': { $ne: true }
        };
      case 'sent':
        return {
          ...baseFilter,
          'custom.folder': 'sent',
          'custom.isDeleted': { $ne: true }
        };
      case 'drafts':
        return {
          ...baseFilter,
          'custom.isDraft': true
        };
      case 'trash':
        return {
          ...baseFilter,
          'custom.isDeleted': true
        };
      default:
        return baseFilter;
    }
  };

  const handleCompose = async () => {
    if (!client || !composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a channel with the recipient
      const channel = client.channel('messaging', {
        members: [user?.id || '', composeData.to],
        created_by_id: user?.id || '',
        custom: {
          subject: composeData.subject,
          messageType: 'direct',
          folder: 'sent'
        }
      });

      await channel.create();
      
      // Send the message
      await channel.sendMessage({
        text: composeData.content,
        custom: {
          subject: composeData.subject,
          folder: 'inbox',
          recipients: [composeData.to]
        }
      });

      // Reset compose form
      setComposeData({ to: '', subject: '', content: '' });
      setIsComposing(false);
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered."
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Failed to send",
        description: "There was an error sending your message.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access messages</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg border">
      <Chat client={client}>
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50">
          <div className="p-4 border-b">
            <Button 
              className="w-full" 
              onClick={() => setIsComposing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
          
          <div className="p-2">
            <nav className="space-y-1">
              <Button
                variant={activeFolder === 'inbox' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFolder('inbox')}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Button>
              
              <Button
                variant={activeFolder === 'sent' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFolder('sent')}
              >
                <Send className="h-4 w-4 mr-2" />
                Sent
              </Button>
              
              <Button
                variant={activeFolder === 'drafts' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFolder('drafts')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Drafts
              </Button>
              
              <Button
                variant={activeFolder === 'trash' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveFolder('trash')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Trash
              </Button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {isComposing ? (
            /* Compose View */
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">New Message</h2>
              </div>
              
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To:</label>
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Recipient email or user ID..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Subject:</label>
                  <Input
                    value={composeData.subject}
                    onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject..."
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Message:</label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Type your message..."
                    className="w-full h-64 p-3 border rounded-md resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsComposing(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCompose}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Channel List & Messaging View */
            <div className="flex-1 flex min-h-0">
              {/* Channel List */}
              <div className="w-2/5 border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <ChannelList
                    filters={getChannelFilters()}
                    sort={{ last_message_at: -1 }}
                    options={{ limit: 20 }}
                    Preview={EmailPreview}
                    setActiveChannel={setActiveChannel}
                  />
                </ScrollArea>
              </div>
              
              {/* Message View */}
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
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a conversation to view messages
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Chat>
    </div>
  );
}