import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Chat messages table for Socket.IO chat system
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channel: varchar("channel").notNull().default("general"), // 'general', 'core-team', 'host', 'driver', 'recipient'
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface ChatMessage {
  id: number;
  channel: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface ChatUser {
  id: string;
  username: string;
  rooms: string[];
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
  const activeUsers = new Map<string, ChatUser>();
  
  // Available chat rooms
  const CHAT_ROOMS = {
    general: "General Chat",
    "core-team": "Core Team",
    committee: "Committee",
    host: "Host Chat",
    driver: "Driver Chat",
    recipient: "Recipient Chat"
  };

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user joining
    socket.on("join-channel", async (channel) => {
      // Get user info from socket session/auth
      const userId = socket.handshake.auth?.userId || `user_${socket.id}`;
      const username = socket.handshake.auth?.username || "Guest";
      const userPermissions = socket.handshake.auth?.permissions || [];
      
      try {
      try {
        // Determine which rooms user can access based on permissions
        const allowedRooms = [];
        
        if (userPermissions.includes('general_chat')) allowedRooms.push('general');
        if (userPermissions.includes('core_team_chat')) allowedRooms.push('core_team');
        if (userPermissions.includes('committee_chat')) allowedRooms.push('committee');
        if (userPermissions.includes('host_chat')) allowedRooms.push('hosts');
        if (userPermissions.includes('driver_chat')) allowedRooms.push('drivers');
        if (userPermissions.includes('recipient_chat')) allowedRooms.push('recipients');

        // Store user info
        activeUsers.set(socket.id, {
          id: userId,
          username,
          rooms: allowedRooms
        });

        // Join user to their permitted rooms
        allowedRooms.forEach(room => {
          socket.join(room);
        });

        // Send available rooms to client
        socket.emit("rooms", {
          available: allowedRooms.map(room => ({
            id: room,
            name: CHAT_ROOMS[room as keyof typeof CHAT_ROOMS]
          }))
        });

        // Notify about user joining
        allowedRooms.forEach(room => {
          socket.to(room).emit("user_joined", {
            userId,
            username,
            room
          });
        });

        console.log(`User ${username} joined with access to: ${allowedRooms.join(', ')}`);
      } catch (error) {
        console.error("Error handling user join:", error);
        socket.emit("error", { message: "Failed to join chat" });
      }
    });

    // Handle sending messages
    socket.on("send-message", async ({ channel, content }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }

        if (!user.rooms.includes(channel)) {
          socket.emit("error", { message: "Not authorized for this channel" });
          return;
        }

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          username: user.username,
          content,
          timestamp: new Date(),
          room: channel
        };

        // Save message to database (simple storage)
        try {
          await storage.createMessage({
            senderId: user.id,
            content,
            contextType: 'chat_room',
            contextId: channel,
            senderEmail: null
          });
        } catch (dbError) {
          console.error("Failed to save message to database:", dbError);
          // Continue anyway - don't break real-time chat
        }

        // Broadcast to channel
        io.to(channel).emit("new-message", message);

        console.log(`Message sent to ${channel} by ${user.username}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle getting room history
    socket.on("get_room_history", async ({ room, limit = 50 }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user || !user.rooms.includes(room)) {
          socket.emit("error", { message: "Not authorized for this room" });
          return;
        }

        // Get recent messages for this room
        try {
          const messages = await storage.getMessagesByContext('chat_room', room, limit);
          const formattedMessages = messages.map(msg => ({
            id: msg.id.toString(),
            userId: msg.senderId,
            username: msg.senderEmail || 'Unknown User',
            content: msg.content,
            timestamp: msg.createdAt || new Date(),
            room
          }));

          socket.emit("room_history", {
            room,
            messages: formattedMessages
          });
        } catch (dbError) {
          console.error("Failed to fetch room history:", dbError);
          socket.emit("room_history", { room, messages: [] });
        }
      } catch (error) {
        console.error("Error fetching room history:", error);
        socket.emit("error", { message: "Failed to fetch room history" });
      }
    });

    // Join a chat channel
    socket.on("join-channel", (channel: string) => {
      socket.join(channel);
      console.log(`User ${socket.id} joined channel: ${channel}`);
    });
    
    // Leave a chat channel
    socket.on("leave-channel", (channel: string) => {
      socket.leave(channel);
      console.log(`User ${socket.id} left channel: ${channel}`);
    });
    
    // Handle new chat message
    socket.on("send-message", async (data: { channel: string; content: string; userId: string; userName: string }) => {
      try {
        const { channel, content, userId, userName } = data;
        
        // Save message to database
        const [newMessage] = await db
          .insert(chatMessages)
          .values({
            channel,
            userId,
            userName,
            content: content.trim(),
          })
          .returning();
        
        // Broadcast to all users in the channel
        io.to(channel).emit("new-message", {
          id: newMessage.id,
          channel: newMessage.channel,
          userId: newMessage.userId,
          userName: newMessage.userName,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
        });
        
        console.log(`Message sent to channel ${channel}: ${content}`);
      } catch (error) {
        console.error("Error sending chat message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
    
    // Handle message deletion
    socket.on("delete-message", async (data: { messageId: number; userId: string; userRole: string }) => {
      try {
        const { messageId, userId, userRole } = data;
        
        // Get the message to check permissions
        const [message] = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.id, messageId));
        
        if (!message) {
          socket.emit("error", { message: "Message not found" });
          return;
        }
        
        // Check if user can delete (author or admin)
        const isAuthor = message.userId === userId;
        const isAdmin = userRole === "admin" || userRole === "super_admin";
        
        if (!isAuthor && !isAdmin) {
          socket.emit("error", { message: "Permission denied" });
          return;
        }
        
        // Delete the message
        await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
        
        // Broadcast deletion to all users in the channel
        io.to(message.channel).emit("message-deleted", { messageId });
        
        console.log(`Message ${messageId} deleted from channel ${message.channel}`);
      } catch (error) {
        console.error("Error deleting chat message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        // Notify rooms about user leaving
        user.rooms.forEach(room => {
          socket.to(room).emit("user_left", {
            userId: user.id,
            username: user.username,
            room
          });
        });
        
        activeUsers.delete(socket.id);
        console.log(`User ${user.username} disconnected`);
      }
    });
  });

  console.log("✓ Socket.io chat server initialized");
  return io;
}