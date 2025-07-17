import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: number;
  channel: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface SimpleChatProps {
  channel: string;
  title: string;
  icon?: React.ReactNode;
}

export default function SimpleChat({ channel, title, icon }: SimpleChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const socketInstance = io({
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO chat server");
      socketInstance.emit("join-channel", channel);
    });

    socketInstance.on("new-message", (newMessage: ChatMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socketInstance.on("message-deleted", ({ messageId }: { messageId: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    socketInstance.on("error", (error: { message: string }) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    });

    return () => {
      socketInstance.emit("leave-channel", channel);
      socketInstance.disconnect();
    };
  }, [user, channel, toast]);

  // Fetch initial messages for this channel
  const { isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat", channel],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/chat/${channel}`);
      return response;
    },
    onSuccess: (data) => {
      setMessages(data);
    },
    enabled: !!user,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && socket && user) {
      socket.emit("send-message", {
        channel,
        content: message.trim(),
        userId: user.id,
        userName: user.firstName || user.email || "Anonymous User"
      });
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (window.confirm("Are you sure you want to delete this message?") && socket && user) {
      socket.emit("delete-message", {
        messageId,
        userId: user.id,
        userRole: user.role
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canDeleteMessage = (messageUserId: string) => {
    return (
      messageUserId === user?.id ||
      user?.role === "admin" ||
      user?.role === "super_admin"
    );
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon || <MessageCircle className="h-5 w-5" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to participate in chat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          {icon || <MessageCircle className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[400px]">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 group">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(msg.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                    {canDeleteMessage(msg.userId) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!socket || !user}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !socket || !user}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}