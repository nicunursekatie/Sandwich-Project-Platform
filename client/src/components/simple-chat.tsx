import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
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
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = window.location.origin;
    
    const socketInstance = io(socketUrl, {
      path: "/socket.io/",
      transports: ["polling"],
      autoConnect: true,
      timeout: 10000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO chat server");
      setIsConnected(true);
      // Send user info when joining a channel
      socketInstance.emit("join-channel", {
        channel,
        userId: user.id,
        userName: user.firstName || user.email || "User"
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.IO chat server");
      setIsConnected(false);
    });

    socketInstance.on("joined-channel", ({ channel: joinedChannel, userName }) => {
      console.log(`Joined channel: ${joinedChannel} as ${userName}`);
    });

    socketInstance.on("new-message", (newMessage: ChatMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    socketInstance.on("error", (error: { message: string }) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    });

    return () => {
      socketInstance.emit("leave-channel", {
        channel,
        userId: user.id,
        userName: user.firstName || user.email || "User"
      });
      socketInstance.disconnect();
    };
  }, [user, channel, toast]);

  const sendMessage = () => {
    if (!socket || !message.trim() || !isConnected) return;

    socket.emit("send-message", {
      channel,
      content: message.trim()
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Please log in to access chat</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <span className={`ml-auto text-xs px-2 py-1 rounded ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{msg.userName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="flex-shrink-0 flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!message.trim() || !isConnected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}