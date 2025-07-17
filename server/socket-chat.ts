import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { storage } from "./storage";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
}

interface ConnectedUser {
  id: string;
  userName: string;
  channels: string[];
}

export function setupSocketChat(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/socket.io/"
  });

  // Store active users
  const activeUsers = new Map<string, ConnectedUser>();

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle joining a channel
    socket.on("join-channel", async (data: { channel: string; userId: string; userName: string }) => {
      try {
        const { channel, userId, userName } = data;
        
        // Store user info
        activeUsers.set(socket.id, {
          id: userId,
          userName,
          channels: [channel]
        });

        // Join the channel
        socket.join(channel);
        
        console.log(`User ${userName} (${userId}) joined channel: ${channel}`);
        
        // Load and send message history (latest 50 messages in reverse chronological order)
        try {
          const messageHistory = await storage.getChatMessages(channel, 50);
          // Reverse to send oldest first
          socket.emit("message-history", messageHistory.reverse());
        } catch (error) {
          console.error("Error loading message history:", error);
          socket.emit("message-history", []);
        }
        
        // Send confirmation
        socket.emit("joined-channel", { channel, userName });
      } catch (error) {
        console.error("Error joining channel:", error);
        socket.emit("error", { message: "Failed to join channel" });
      }
    });

    // Handle sending messages
    socket.on("send-message", async ({ channel, content }: { channel: string; content: string }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        // Save message to database
        const savedMessage = await storage.createChatMessage({
          channel,
          userId: user.id,
          userName: user.userName,
          content
        });

        const message: ChatMessage = {
          id: savedMessage.id.toString(),
          userId: user.id,
          userName: user.userName,
          content,
          timestamp: savedMessage.createdAt,
          channel
        };

        // Broadcast to all users in the channel
        io.to(channel).emit("new-message", message);
        
        console.log(`Message saved and sent to ${channel} by ${user.userName}: ${content}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle leaving a channel
    socket.on("leave-channel", (data: { channel: string; userId: string; userName: string }) => {
      const { channel, userName } = data;
      socket.leave(channel);
      console.log(`User ${userName} left channel: ${channel}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      activeUsers.delete(socket.id);
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}