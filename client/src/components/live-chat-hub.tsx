import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Shield, Car, Heart, Globe, Hash } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import io, { Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
}

interface ChannelPreview {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  permission?: string;
  unreadCount: number;
  lastMessage?: ChatMessage;
  activeUsers: string[];
  messages: ChatMessage[];
}

interface LiveChatHubProps {
  onChannelSelect: (channel: string) => void;
  selectedChannel?: string;
}

const CHAT_CHANNELS: Omit<ChannelPreview, 'unreadCount' | 'lastMessage' | 'activeUsers' | 'messages'>[] = [
  {
    id: "general",
    name: "General",
    description: "Open discussion for all team members",
    icon: <Hash className="h-4 w-4" />
  },
  {
    id: "core-team",
    name: "Core Team",
    description: "Private discussions for core team members",
    icon: <Shield className="h-4 w-4" />,
    permission: "core_team_chat"
  },
  {
    id: "committee",
    name: "Committee",
    description: "Committee member discussions",
    icon: <Users className="h-4 w-4" />,
    permission: "committee_chat"
  },
  {
    id: "host",
    name: "Host Chat",
    description: "Communication for sandwich collection hosts",
    icon: <Heart className="h-4 w-4" />,
    permission: "host_chat"
  },
  {
    id: "driver",
    name: "Driver Chat",
    description: "Coordination for delivery drivers",
    icon: <Car className="h-4 w-4" />,
    permission: "driver_chat"
  },
  {
    id: "recipient",
    name: "Recipient Chat",
    description: "Communication for recipient organizations",
    icon: <MessageCircle className="h-4 w-4" />,
    permission: "recipient_chat"
  }
];

export default function LiveChatHub({ onChannelSelect, selectedChannel }: LiveChatHubProps) {
  const [channels, setChannels] = useState<ChannelPreview[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${protocol}//${window.location.host}`;
    const socketInstance = io(socketUrl, {
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: false
    });

    setSocket(socketInstance);

    // Initialize channels with empty data
    const initialChannels = CHAT_CHANNELS
      .filter(channel => {
        if (!channel.permission) return true;
        if (!user?.permissions) return false;
        return user.permissions.includes(channel.permission);
      })
      .map(channel => ({
        ...channel,
        unreadCount: 0,
        lastMessage: undefined,
        activeUsers: [],
        messages: []
      }));

    setChannels(initialChannels);

    // Auto-join all available channels for previews
    initialChannels.forEach(channel => {
      socketInstance.emit("join-channel", {
        channel: channel.id,
        userId: user.id,
        userName: user.firstName || user.email || "User"
      });
    });

    // Listen for message history
    socketInstance.on("message-history", (history: ChatMessage[]) => {
      if (history.length > 0) {
        const channelId = history[0].channel;
        setChannels(prev => prev.map(ch => {
          if (ch.id === channelId) {
            const formattedHistory = history.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp || msg.createdAt)
            }));
            return {
              ...ch,
              messages: formattedHistory,
              lastMessage: formattedHistory[formattedHistory.length - 1]
            };
          }
          return ch;
        }));
      }
    });

    // Listen for new messages
    socketInstance.on("new-message", (message: ChatMessage) => {
      const formattedMessage = {
        ...message,
        timestamp: new Date(message.timestamp)
      };
      
      setChannels(prev => prev.map(ch => {
        if (ch.id === message.channel) {
          const updatedMessages = [...ch.messages, formattedMessage];
          return {
            ...ch,
            messages: updatedMessages,
            lastMessage: formattedMessage,
            unreadCount: selectedChannel === ch.id ? 0 : ch.unreadCount + 1
          };
        }
        return ch;
      }));
    });

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user, selectedChannel]);

  // Auto-select General channel on mount
  useEffect(() => {
    if (!selectedChannel && channels.length > 0) {
      const generalChannel = channels.find(ch => ch.id === "general");
      if (generalChannel) {
        onChannelSelect("general");
      }
    }
  }, [channels, selectedChannel, onChannelSelect]);

  const handleChannelClick = async (channelId: string) => {
    // Clear unread count for selected channel immediately (optimistic update)
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
    ));
    onChannelSelect(channelId);

    // Mark messages as read on server
    try {
      const response = await fetch('/api/message-notifications/mark-chat-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: channelId }),
        credentials: 'include',
      });

      if (response.ok) {
        console.log(`Successfully marked ${channelId} chat messages as read`);
        
        // Trigger a refresh of notification counts to clear the bell icon
        const notificationRefreshEvent = new CustomEvent('refreshNotifications');
        window.dispatchEvent(notificationRefreshEvent);
      } else {
        console.error('Failed to mark chat messages as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking chat messages as read:', error);
    }
  };

  const formatLastActivity = (lastMessage?: ChatMessage) => {
    if (!lastMessage) return "No messages yet";
    try {
      return formatDistanceToNow(lastMessage.timestamp, { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Channels</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time team communication</p>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {channels.map((channel) => {
          const isSelected = selectedChannel === channel.id;
          const isCorteTeam = channel.id === "core-team";
          
          return (
            <Card 
              key={channel.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? isCorteTeam 
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700" 
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
              }`}
              onClick={() => handleChannelClick(channel.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`${
                      isSelected 
                        ? isCorteTeam 
                          ? "text-amber-600 dark:text-amber-400" 
                          : "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {channel.icon}
                    </div>
                    <span className={`font-medium ${
                      isSelected 
                        ? isCorteTeam
                          ? "text-amber-900 dark:text-amber-100"
                          : "text-blue-900 dark:text-blue-100"
                        : "text-gray-900 dark:text-gray-100"
                    }`}>
                      {channel.name}
                    </span>
                  </div>
                  {channel.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      {channel.unreadCount}
                    </Badge>
                  )}
                </div>

                {/* Last Message Preview */}
                {channel.lastMessage ? (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      <span className="font-medium">{channel.lastMessage.userName}:</span>{" "}
                      {channel.lastMessage.content}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {formatLastActivity(channel.lastMessage)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    No messages yet • Click to start the conversation
                  </div>
                )}

                {/* Active Users Indicator */}
                {channel.activeUsers.length > 0 && (
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3 mr-1" />
                    {channel.activeUsers.length} active
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Connected as {user?.firstName || user?.email || "User"}
      </div>
    </div>
  );
}