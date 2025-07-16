import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { storage } from "./storage";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  room: string;
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
    core_team: "Core Team",
    committee: "Committee",
    hosts: "Host Chat",
    drivers: "Driver Chat",
    recipients: "Recipient Chat"
  };

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Handle user joining
    socket.on("join", async ({ userId, username, userPermissions }) => {
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
    socket.on("send_message", async ({ room, content }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("error", { message: "User not authenticated" });
          return;
        }

        if (!user.rooms.includes(room)) {
          socket.emit("error", { message: "Not authorized for this room" });
          return;
        }

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          username: user.username,
          content,
          timestamp: new Date(),
          room
        };

        // Save message to database (simple storage)
        try {
          await storage.createMessage({
            senderId: user.id,
            content,
            contextType: 'chat_room',
            contextId: room,
            senderEmail: null
          });
        } catch (dbError) {
          console.error("Failed to save message to database:", dbError);
          // Continue anyway - don't break real-time chat
        }

        // Broadcast to room
        io.to(room).emit("new_message", message);

        console.log(`Message sent to ${room} by ${user.username}`);
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