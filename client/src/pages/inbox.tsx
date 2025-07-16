import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/hooks/useMessaging";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  Inbox as InboxIcon, 
  MessageCircle, 
  Send, 
  Search,
  CheckCheck,
  Circle,
  Lightbulb,
  FolderOpen,
  ListTodo,
  Archive,
  Star,
  MoreVertical,
  Reply,
  Trash2,
  Edit2,
  Plus,
  Users,
  Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageComposer } from "@/components/message-composer";
import { GroupConversation } from "@/components/group-conversation";
import { queryClient } from "@/lib/queryClient";

interface GroupThread {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  unreadCount: number;
  lastMessage?: {
    content: string;
    senderName: string;
    createdAt: string;
  };
  members: Array<{
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface Message {
  id: number;
  senderId: string;
  senderName?: string;
  content: string;
  contextType?: string;
  contextId?: string;
  contextTitle?: string;
  createdAt: string;
  editedAt?: string;
  editedContent?: string;
  read?: boolean;
  readAt?: string;
}

export default function InboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    unreadMessages, 
    markAsRead, 
    markAllAsRead,
    getContextMessages,
    sendMessage,
    isSending 
  } = useMessaging();

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  // Fetch group threads for the "groups" tab
  const { data: groupThreads = [] } = useQuery<GroupThread[]>({
    queryKey: ['/api/conversations/groups-with-preview'],
    queryFn: async () => {
      try {
        // Get conversations
        const conversationsResponse = await apiRequest('GET', '/api/conversations?type=group');
        const conversations = Array.isArray(conversationsResponse) ? conversationsResponse : [];

        // For each conversation, get preview data
        const groupThreads = await Promise.all(
          conversations.map(async (conv: any) => {
            try {
              // Get participants
              const participantsResponse = await apiRequest('GET', `/api/conversations/${conv.id}/participants`);
              const participants = Array.isArray(participantsResponse) ? participantsResponse : [];

              // Get recent messages
              const messagesResponse = await apiRequest('GET', `/api/conversations/${conv.id}/messages`);
              const messages = Array.isArray(messagesResponse) ? messagesResponse : [];

              // Get unread count for this group
              const unreadResponse = await apiRequest('GET', `/api/messaging/unread?contextType=group&contextId=${conv.id}`);
              const unreadCount = unreadResponse?.count || 0;

              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

              return {
                id: conv.id,
                name: conv.name || 'Unnamed Group',
                description: conv.description,
                memberCount: participants.length,
                unreadCount,
                lastMessage: lastMessage ? {
                  content: lastMessage.content || '',
                  senderName: lastMessage.senderName || lastMessage.sender || 'Unknown',
                  createdAt: lastMessage.createdAt || new Date().toISOString()
                } : undefined,
                members: participants.slice(0, 5) // Show first 5 members for preview
              };
            } catch (error) {
              console.error(`Error fetching data for group ${conv.id}:`, error);
              return {
                id: conv.id,
                name: conv.name || 'Unnamed Group',
                description: conv.description,
                memberCount: 0,
                unreadCount: 0,
                members: []
              };
            }
          })
        );

        return groupThreads;
      } catch (error) {
        console.error('Error fetching group threads:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: selectedTab === 'groups' || selectedTab === 'all',
  });

  // Fetch all messages
  const { data: allMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['/api/messaging/messages', selectedTab],
    queryFn: async () => {
      if (selectedTab === 'groups') {
        // For groups tab, return empty array since we'll show group threads instead
        return [];
      }

      let endpoint = '/api/messaging/messages';
      if (selectedTab !== 'all') {
        endpoint += `?contextType=${selectedTab}`;
      }
      const response = await apiRequest('GET', endpoint);
      return (response as any).messages || [];
    },
  });

  // Fetch sent messages
  const { data: sentMessages = [] } = useQuery({
    queryKey: ['/api/messaging/sent', selectedTab],
    queryFn: async () => {
      if (selectedTab !== 'sent') {
        return [];
      }

      const response = await apiRequest('GET', '/api/messaging/sent');
      return (response as any).messages || [];
    },
    enabled: selectedTab === 'sent',
  });

  // Fetch thread messages when a message is selected
  const { data: threadMessages = [] } = useQuery({
    queryKey: ['/api/messaging/thread', selectedMessage?.contextType, selectedMessage?.contextId],
    queryFn: async () => {
      if (!selectedMessage?.contextType || !selectedMessage?.contextId) return [];

      // Handle group conversations specially
      if (selectedMessage.contextType === 'group') {
        try {
          const response = await apiRequest('GET', `/api/conversations/${selectedMessage.contextId}/messages`);
          return Array.isArray(response) ? response : [];
        } catch (error) {
          console.error('Error fetching group messages:', error);
          return [];
        }
      }

      return await getContextMessages(selectedMessage.contextType, selectedMessage.contextId);
    },
    enabled: !!selectedMessage?.contextType && !!selectedMessage?.contextId,
  });

  // Handle message selection and mark as read
  const handleSelectMessage = async (message: any) => {
    // Handle group thread selection
    if (message.contextType === 'group' && message.groupData) {
      const mockMessage = {
        id: -1,
        senderId: 'system',
        senderName: message.groupData.name,
        content: `Group conversation: ${message.groupData.name}`,
        contextType: 'group',
        contextId: message.contextId,
        contextTitle: message.groupData.name,
        createdAt: new Date().toISOString(),
        read: true,
        groupData: message.groupData
      };
      setSelectedMessage(mockMessage);
    } else {
      setSelectedMessage(message);
      if (!message.read) {
        await markAsRead(message.id);
        refetchMessages();
      }
    }
    setShowComposer(false); // Close composer when selecting a message
  };

  // Handle reply
  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      // Handle group conversation replies specially
      if (selectedMessage.contextType === 'group' && selectedMessage.contextId) {
        const response = await apiRequest('POST', `/api/conversations/${selectedMessage.contextId}/messages`, {
          content: replyContent
        });

        // Invalidate group thread queries
        queryClient.invalidateQueries({ 
          queryKey: ['/api/messaging/thread', selectedMessage.contextType, selectedMessage.contextId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['/api/conversations/groups-with-preview'] 
        });
      } else {
        await sendMessage({
          recipientIds: [selectedMessage.senderId],
          content: replyContent,
          contextType: selectedMessage.contextType as any,
          contextId: selectedMessage.contextId,
        });
      }

      setReplyContent("");
      refetchMessages();
      toast({ description: "Reply sent successfully" });
    } catch (error) {
      toast({ 
        description: "Failed to send reply", 
        variant: "destructive" 
      });
    }
  };

  // Convert group threads to message-like objects for display
  const groupThreadMessages = groupThreads.map(group => ({
    id: `group-${group.id}`,
    senderId: 'system',
    senderName: group.name,
    content: group.lastMessage?.content || 'No messages yet',
    contextType: 'group' as const,
    contextId: group.id.toString(),
    contextTitle: group.name,
    createdAt: group.lastMessage?.createdAt || new Date().toISOString(),
    read: group.unreadCount === 0,
    groupData: group // Store the full group data
  }));

  // Combine messages based on selected tab
  const displayMessages = selectedTab === 'groups' ? groupThreadMessages : 
                          selectedTab === 'all' ? [...allMessages, ...groupThreadMessages] : 
                          allMessages;

  // Filter messages based on search
  const filteredMessages = displayMessages.filter((message: any) => {
    if (!message) return false; // Skip undefined/null messages
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (message.content || '').toLowerCase().includes(searchLower) ||
      (message.senderName || '').toLowerCase().includes(searchLower) ||
      (message.contextTitle || '').toLowerCase().includes(searchLower)
    );
  });

  // Get context icon
  const getContextIcon = (contextType?: string) => {
    switch (contextType) {
      case 'suggestion': return <Lightbulb className="h-4 w-4" />;
      case 'project': return <FolderOpen className="h-4 w-4" />;
      case 'task': return <ListTodo className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Get context color
  const getContextColor = (contextType?: string) => {
    switch (contextType) {
      case 'suggestion': return 'text-yellow-600 bg-yellow-50';
      case 'project': return 'text-blue-600 bg-blue-50';
      case 'task': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };



  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Message List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
              <InboxIcon className="h-5 w-5" />
              Inbox
            </h2>
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Message System Update</span>
              </div>
              <p className="text-sm text-blue-700">
                Direct messages have moved to the <strong>Chat</strong> section. This inbox is now for formal notifications, suggestions, and project updates.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowComposer(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
                {unreadMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Improved Tab Navigation */}
          <div className="px-4 py-2 border-b bg-slate-50">
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[
                { id: 'all', label: 'All', icon: InboxIcon, count: allMessages.length + groupThreads.length },
                { id: 'direct', label: 'Direct', icon: MessageCircle, count: allMessages.filter((m: Message) => m.contextType === 'direct' || !m.contextType).length },
                // Temporarily removed until inbox/chat separation is complete
                // { id: 'sent', label: 'Sent', icon: Send, count: sentMessages.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-1 px-2 py-1.5 rounded-md font-medium text-xs transition-all
                    ${selectedTab === tab.id 
                      ? 'bg-white text-[#236383] shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <tab.icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge 
                      variant={selectedTab === tab.id ? "default" : "secondary"}
                      className={`
                        h-3 px-1 text-[9px] min-w-[12px] flex items-center justify-center
                        ${selectedTab === tab.id 
                          ? 'bg-[#236383] text-white' 
                          : 'bg-slate-200 text-slate-700'
                        }
                      `}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'groups', label: 'Groups', icon: Users, count: groupThreads.length },
                { id: 'suggestion', label: 'Ideas', icon: Lightbulb, count: allMessages.filter((m: Message) => m.contextType === 'suggestion').length },
                { id: 'project', label: 'Projects', icon: FolderOpen, count: allMessages.filter((m: Message) => m.contextType === 'project').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-1 px-2 py-1.5 rounded-md font-medium text-xs transition-all
                    ${selectedTab === tab.id 
                      ? 'bg-white text-[#236383] shadow-sm border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                    }
                  `}
                >
                  <tab.icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge 
                      variant={selectedTab === tab.id ? "default" : "secondary"}
                      className={`
                        h-3 px-1 text-[9px] min-w-[12px] flex items-center justify-center
                        ${selectedTab === tab.id 
                          ? 'bg-[#236383] text-white' 
                          : 'bg-slate-200 text-slate-700'
                        }
                      `}
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages found
                </div>
              ) : (
                filteredMessages.map((message: any) => {
                  if (!message) return null; // Skip undefined messages
                  const isGroupThread = message.groupData;

                  return (
                    <Card
                      key={message.id}
                      className={`mb-2 cursor-pointer transition-colors ${
                        selectedMessage?.contextId === message.contextId && selectedMessage?.contextType === message.contextType
                          ? 'bg-blue-50 border-blue-300' 
                          : 'hover:bg-gray-50'
                      } ${!message.read ? 'border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {isGroupThread ? <Users className="h-4 w-4" /> : (message.senderName?.charAt(0) || '?')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {message?.senderName || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isGroupThread && message?.groupData?.lastMessage?.createdAt ? 
                                  formatDistanceToNow(new Date(message.groupData.lastMessage.createdAt), { addSuffix: true }) :
                                  message?.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'Unknown time'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isGroupThread && message.groupData.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] text-xs">
                                {message.groupData.unreadCount}
                              </Badge>
                            )}
                            {!message.read && !isGroupThread && (
                              <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                            )}
                          </div>
                        </div>

                        {/* Group thread preview */}
                        {isGroupThread && message?.groupData ? (
                          <div>
                            {message.groupData.description && (
                              <p className="text-sm text-gray-600 mb-1">{message.groupData.description}</p>
                            )}
                            {message.groupData.lastMessage && (
                              <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                                <span className="font-medium">{message.groupData.lastMessage.senderName || message.groupData.lastMessage.sender || 'Unknown'}:</span>{' '}
                                {message.groupData.lastMessage.content}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="text-xs text-gray-600">{message.groupData.memberCount || 0} members</span>
                              </div>
                              {/* Member avatars preview */}
                              {message.groupData.members?.length > 0 && (
                                <div className="flex -space-x-1">
                                  {message.groupData.members.slice(0, 3).map((member: any, index: number) => (
                                    <Avatar key={member?.userId || index} className="h-5 w-5 border border-white">
                                      <AvatarFallback className="text-xs">
                                        {member?.firstName?.[0] || member?.email?.[0] || '?'}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {(message.groupData.memberCount || 0) > 3 && (
                                    <div className="h-5 w-5 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                                      <span className="text-xs text-gray-600">+{(message.groupData.memberCount || 0) - 3}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                              {message?.editedContent || message?.content || 'No content'}
                            </p>

                            {message?.contextType && message.contextType !== 'group' && (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getContextColor(message.contextType)}`}>
                                {getContextIcon(message.contextType)}
                                <span>{message?.contextTitle || message.contextType}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {showComposer ? (
          <div className="p-4">
            <MessageComposer
              contextType="direct"
              onSent={() => {
                setShowComposer(false);
                refetchMessages();
              }}
              onCancel={() => setShowComposer(false)}
            />
          </div>
        ) : selectedMessage ? (
          selectedMessage.contextType === 'group' ? (
            <GroupConversation
              groupId={parseInt(selectedMessage.contextId || '0')}
              groupName={selectedMessage.senderName || 'Group Chat'}
              groupDescription={(selectedMessage as any).groupData?.description}
              onBack={() => setSelectedMessage(null)}
              currentUser={user}
            />
          ) : (
            <>
              {/* Message Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedMessage.senderName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedMessage.senderName || 'Unknown'}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
                        {selectedMessage.editedAt && ' (edited)'}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Star
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {selectedMessage.contextType && selectedMessage.contextType !== 'group' && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="gap-1">
                      {getContextIcon(selectedMessage.contextType)}
                      {selectedMessage.contextTitle || selectedMessage.contextType}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thread Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedMessage.editedContent || selectedMessage.content}
                    </p>
                  </div>

                  {/* Thread Replies */}
                  {threadMessages.filter((m: Message) => m.id !== selectedMessage.id).map((message: Message) => (
                    <div 
                      key={message.id} 
                      className={`rounded-lg p-4 ${
                        message.senderId === (user as any)?.id 
                          ? 'bg-blue-50 ml-auto max-w-[80%]' 
                          : 'bg-gray-50 mr-auto max-w-[80%]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm">{message.senderName}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.editedContent || message.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Reply Box */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  />
                  <Button 
                    onClick={handleReply} 
                    disabled={!replyContent.trim() || isSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              {selectedTab === 'groups' ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Group messaging</p>
                </>
              ) : (
                <>
                  <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowComposer(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Compose New Message
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}