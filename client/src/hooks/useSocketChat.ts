import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getUserPermissions } from "@shared/auth-utils";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  room: string;
}

export interface ChatRoom {
  id: string;
  name: string;
}

export interface ChatUser {
  userId: string;
  username: string;
  room: string;
}

export function useSocketChat() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeUsers, setActiveUsers] = useState<Record<string, ChatUser[]>>({});
  const [currentRoom, setCurrentRoom] = useState<string>("");

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    let socketUrl: string;
    
    if (window.location.hostname.includes('.replit.dev') || window.location.hostname.includes('.replit.app')) {
      socketUrl = `${protocol}//${window.location.hostname}`;
    } else {
      const port = window.location.port || '';
      socketUrl = `${protocol}//${window.location.hostname}:${port}`;
    }

    const newSocket = io(socketUrl, {
      path: "/socket.io/",
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      setConnected(true);
      console.log("Socket.io connected");
      
      // Join with user info
      const userPermissions = getUserPermissions(user);
      newSocket.emit("join", {
        userId: (user as any)?.id || 'anonymous',
        username: (user as any)?.firstName || (user as any)?.email || 'Anonymous',
        userPermissions: userPermissions
      });
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      console.log("Socket.io disconnected");
    });

    newSocket.on("rooms", ({ available }) => {
      setRooms(available);
      // Auto-select first room if none selected
      if (available.length > 0 && !currentRoom) {
        setCurrentRoom(available[0].id);
      }
    });

    newSocket.on("new_message", (message: ChatMessage) => {
      setMessages(prev => ({
        ...prev,
        [message.room]: [...(prev[message.room] || []), message]
      }));
    });

    newSocket.on("room_history", ({ room, messages: roomMessages }) => {
      setMessages(prev => ({
        ...prev,
        [room]: roomMessages
      }));
    });

    newSocket.on("user_joined", ({ userId, username, room }) => {
      setActiveUsers(prev => ({
        ...prev,
        [room]: [...(prev[room] || []).filter(u => u.userId !== userId), { userId, username, room }]
      }));
    });

    newSocket.on("user_left", ({ userId, room }) => {
      setActiveUsers(prev => ({
        ...prev,
        [room]: (prev[room] || []).filter(u => u.userId !== userId)
      }));
    });

    newSocket.on("error", ({ message }) => {
      console.error("Socket.io error:", message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Send message
  const sendMessage = useCallback((room: string, content: string) => {
    if (socket && connected) {
      socket.emit("send_message", { room, content });
    }
  }, [socket, connected]);

  // Join room and get history
  const joinRoom = useCallback((roomId: string) => {
    if (socket && connected) {
      setCurrentRoom(roomId);
      socket.emit("get_room_history", { room: roomId });
    }
  }, [socket, connected]);

  return {
    connected,
    rooms,
    messages,
    activeUsers,
    currentRoom,
    sendMessage,
    joinRoom,
    setCurrentRoom
  };
}