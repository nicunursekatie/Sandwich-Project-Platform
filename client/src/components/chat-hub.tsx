import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Shield, Car, Heart, Globe } from "lucide-react";
import SimpleChat from "./simple-chat";
import { useAuth } from "@/hooks/useAuth";

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  permission?: string;
}

const CHAT_ROOMS: ChatRoom[] = [
  {
    id: "general",
    name: "General Chat",
    description: "Open discussion for all team members",
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: "core-team",
    name: "Core Team",
    description: "Private discussions for core team members",
    icon: <Shield className="h-5 w-5" />,
    permission: "core_team_chat"
  },
  {
    id: "committee",
    name: "Committee Chat",
    description: "Committee member discussions",
    icon: <Users className="h-5 w-5" />,
    permission: "committee_chat"
  },
  {
    id: "host",
    name: "Host Chat",
    description: "Communication for sandwich collection hosts",
    icon: <Heart className="h-5 w-5" />,
    permission: "host_chat"
  },
  {
    id: "driver",
    name: "Driver Chat",
    description: "Coordination for delivery drivers",
    icon: <Car className="h-5 w-5" />,
    permission: "driver_chat"
  },
  {
    id: "recipient",
    name: "Recipient Chat",
    description: "Communication for recipient organizations",
    icon: <MessageCircle className="h-5 w-5" />,
    permission: "recipient_chat"
  }
];

export default function ChatHub() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const { user } = useAuth();

  // Filter rooms based on user permissions
  const availableRooms = CHAT_ROOMS.filter(room => {
    if (!room.permission) return true; // General chat is always available
    if (!user || !user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(room.permission);
  });

  const selectedRoomData = CHAT_ROOMS.find(room => room.id === selectedRoom);

  if (selectedRoom && selectedRoomData) {
    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRoom(null)}
          >
            ← Back to Chat Rooms
          </Button>
          <div className="flex items-center gap-2">
            {selectedRoomData.icon}
            <h2 className="text-lg font-semibold">{selectedRoomData.name}</h2>
          </div>
        </div>
        
        <div className="flex-1">
          <SimpleChat 
            channel={selectedRoom} 
            title={selectedRoomData.name}
            icon={selectedRoomData.icon}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Team Chat</h1>
        <p className="text-gray-600">
          Connect with your team in real-time across different channels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableRooms.map((room) => (
          <Card 
            key={room.id} 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setSelectedRoom(room.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {room.icon}
                {room.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{room.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Join Chat
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableRooms.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No chat rooms available</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact your administrator for access to chat channels
          </p>
        </div>
      )}
    </div>
  );
}