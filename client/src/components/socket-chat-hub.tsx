import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSocketChat, ChatMessage, ChatRoom } from "@/hooks/useSocketChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessageLikeButton } from "./chat-message-like-button";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Building2, 
  Truck, 
  Heart, 
  Shield,
  Hash,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const getRoomIcon = (roomId: string) => {
  switch (roomId) {
    case "general": return <MessageSquare className="h-4 w-4" />;
    case "core_team": return <Shield className="h-4 w-4" />;
    case "committee": return <Users className="h-4 w-4" />;
    case "hosts": return <Building2 className="h-4 w-4" />;
    case "drivers": return <Truck className="h-4 w-4" />;
    case "recipients": return <Heart className="h-4 w-4" />;
    default: return <Hash className="h-4 w-4" />;
  }
};

const getRoomColor = (roomId: string) => {
  switch (roomId) {
    case "general": return "bg-blue-100 text-blue-800";
    case "core_team": return "bg-red-100 text-red-800";
    case "committee": return "bg-purple-100 text-purple-800";
    case "hosts": return "bg-green-100 text-green-800";
    case "drivers": return "bg-orange-100 text-orange-800";
    case "recipients": return "bg-pink-100 text-pink-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function SocketChatHub() {
  const { user } = useAuth();
  const {
    connected,
    rooms,
    messages,
    activeUsers,
    currentRoom,
    sendMessage,
    joinRoom,
    setCurrentRoom
  } = useSocketChat();
  
  const [newMessage, setNewMessage] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentRoom]]);

  useEffect(() => {
    if (currentRoom) {
      joinRoom(currentRoom);
    }
  }, [currentRoom, joinRoom]);

  const handleSendMessage = () => {
    if (newMessage.trim() && currentRoom) {
      sendMessage(currentRoom, newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg border">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 border-r bg-gray-50`}>
        <div className="p-4 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-primary">Team Chat</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="p-2">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
            connected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            {!sidebarCollapsed && <span className="text-sm font-medium">
              {connected ? 'Connected' : 'Disconnected'}
            </span>}
          </div>

          {/* Room List */}
          <div className="space-y-1">
            {rooms.map(room => (
              <Button
                key={room.id}
                variant={currentRoom === room.id ? "default" : "ghost"}
                className={`w-full justify-start gap-2 ${
                  currentRoom === room.id ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setCurrentRoom(room.id)}
              >
                {getRoomIcon(room.id)}
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{room.name}</span>
                    {activeUsers[room.id] && (
                      <Badge variant="secondary" className="ml-auto">
                        {activeUsers[room.id].length}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                {getRoomIcon(currentRoom)}
                <h3 className="font-semibold">
                  {rooms.find(r => r.id === currentRoom)?.name || 'Unknown Room'}
                </h3>
                <Badge className={getRoomColor(currentRoom)}>
                  {activeUsers[currentRoom]?.length || 0} online
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages[currentRoom] || []).map((message: ChatMessage) => {
                  console.log("Rendering socket chat message:", message);
                  return (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(message.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{message.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-words">
                          {message.content}
                        </p>
                        {/* Message actions */}
                        <div className="flex items-center mt-2 space-x-2">
                          <ChatMessageLikeButton messageId={message.id} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder={`Message ${rooms.find(r => r.id === currentRoom)?.name || 'room'}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!connected}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!connected || !newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}