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

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          userName: user.userName,
          content,
          timestamp: new Date(),
          channel
        };

        // Broadcast to all users in the channel
        io.to(channel).emit("new-message", message);
        
        console.log(`Message sent to ${channel} by ${user.userName}: ${content}`);
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