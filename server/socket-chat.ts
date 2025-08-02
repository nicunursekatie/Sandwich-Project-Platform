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
  edited?: boolean;
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
          // Convert database timestamps to proper Date objects and reverse to send oldest first
          const formattedMessages = messageHistory.map(msg => ({
            ...msg,
            timestamp: new Date(msg.createdAt)
          })).reverse();
          socket.emit("message-history", formattedMessages);
          
          // Auto-mark all messages in this channel as read for the joining user
          try {
            await storage.markChannelMessagesAsRead(userId, channel);
            console.log(`Marked all messages in ${channel} as read for user ${userId}`);
          } catch (markReadError) {
            console.error("Error marking messages as read:", markReadError);
          }
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

    // Handle message editing
    socket.on("edit-message", async ({ messageId, newContent }: { messageId: number; newContent: string }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        // Get the message to verify ownership
        // Get all messages from all channels to find the specific one
        const allChannels = ["general", "core-team", "committee", "host", "driver", "recipient"];
        let messageToEdit = null;
        
        for (const channel of allChannels) {
          const channelMessages = await storage.getChatMessages(channel, 1000);
          messageToEdit = channelMessages.find(msg => msg.id === messageId || msg.id === messageId.toString());
          if (messageToEdit) break;
        }
        
        if (!messageToEdit) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        if (messageToEdit.userId !== user.id) {
          socket.emit("error", { message: "You can only edit your own messages" });
          return;
        }

        // Update the message in database
        await storage.updateChatMessage(messageId, { content: newContent });

        const updatedMessage: ChatMessage = {
          id: messageId.toString(),
          userId: user.id,
          userName: user.userName,
          content: newContent,
          timestamp: new Date(),
          channel: messageToEdit.channel,
          edited: true
        };

        // Broadcast the updated message to all users in the channel
        io.to(messageToEdit.channel).emit("message-edited", updatedMessage);
        
        console.log(`Message ${messageId} edited by ${user.userName} in ${messageToEdit.channel}`);
      } catch (error) {
        console.error("Error editing message:", error);
        socket.emit("error", { message: "Failed to edit message" });
      }
    });

    // Handle message deletion
    socket.on("delete-message", async ({ messageId }: { messageId: number }) => {
      try {
        const user = activeUsers.get(socket.id);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        // Get the message to verify ownership or admin rights
        // Get all messages from all channels to find the specific one
        const allChannels = ["general", "core-team", "committee", "host", "driver", "recipient"];
        let messageToDelete = null;
        
        for (const channel of allChannels) {
          const channelMessages = await storage.getChatMessages(channel, 1000);
          messageToDelete = channelMessages.find(msg => msg.id === messageId || msg.id === messageId.toString());
          if (messageToDelete) break;
        }
        
        if (!messageToDelete) {
          socket.emit("error", { message: "Message not found" });
          return;
        }

        // Allow deletion if user owns the message or is admin
        const isOwner = messageToDelete.userId === user.id;
        // Check for admin permissions - expand this based on your auth system
        const isAdmin = user.id === "admin@sandwich.project" || 
                       user.userName.toLowerCase().includes("admin") ||
                       user.id === "user_1751071509329_mrkw2z95z"; // Katie's admin account
        
        if (!isOwner && !isAdmin) {
          socket.emit("error", { message: "You can only delete your own messages" });
          return;
        }

        // Delete the message from database
        await storage.deleteChatMessage(messageId);

        // Broadcast the deletion to all users in the channel
        io.to(messageToDelete.channel).emit("message-deleted", { messageId, deletedBy: user.userName });
        
        console.log(`Message ${messageId} deleted by ${user.userName} in ${messageToDelete.channel}`);
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
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