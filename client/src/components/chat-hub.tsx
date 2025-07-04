import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MessageLog from "@/components/message-log";
import CommitteeChat from "@/components/committee-chat";
import HostChat from "@/components/host-chat";
import CommitteeMessageLog from "@/components/committee-message-log";
import CoreTeamChat from "@/components/core-team-chat";
import DirectMessaging from "@/components/direct-messaging";
import { GroupMessaging } from "@/components/group-messaging";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, USER_ROLES } from "@/lib/authUtils";
import { PERMISSIONS } from "@/lib/authUtils";
import { 
  MessageSquare, 
  Users, 
  Building2, 
  Truck, 
  Heart,
  Shield,
  Mail,
  UsersRound,
  ArrowLeft
} from "lucide-react";

interface ChatChannel {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: string;
  color: string;
}

export default function ChatHub() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [showChannelList, setShowChannelList] = useState(true);

  // Determine available chat channels based on user role
  const availableChannels: ChatChannel[] = [];

  if (hasPermission(user, PERMISSIONS.GENERAL_CHAT)) {
    availableChannels.push({ 
      value: "general", 
      label: "General Chat", 
      description: "Open discussion for all team members",
      icon: <MessageSquare className="h-5 w-5" />,
      component: <CommitteeMessageLog committee="general" />,
      color: "bg-blue-500"
    });
  }

  if (hasPermission(user, PERMISSIONS.COMMITTEE_CHAT)) {
    availableChannels.push({ 
      value: "committee", 
      label: "Committee Chat", 
      description: "Specific committee discussions",
      icon: <Users className="h-5 w-5" />,
      component: <CommitteeChat />,
      color: "bg-purple-500"
    });
  }

  if (hasPermission(user, PERMISSIONS.HOST_CHAT)) {
    availableChannels.push({ 
      value: "hosts", 
      label: "Host Chat", 
      description: "Coordination with sandwich collection hosts",
      icon: <Building2 className="h-5 w-5" />,
      component: <HostChat />,
      color: "bg-green-500"
    });
  }

  if (hasPermission(user, PERMISSIONS.DRIVER_CHAT)) {
    availableChannels.push({ 
      value: "drivers", 
      label: "Driver Chat", 
      description: "Delivery and transportation coordination",
      icon: <Truck className="h-5 w-5" />,
      component: <CommitteeMessageLog committee="drivers" />,
      color: "bg-orange-500"
    });
  }

  if (hasPermission(user, PERMISSIONS.RECIPIENT_CHAT)) {
    availableChannels.push({ 
      value: "recipients", 
      label: "Recipient Chat", 
      description: "Communication with receiving organizations",
      icon: <Heart className="h-5 w-5" />,
      component: <CommitteeMessageLog committee="recipients" />,
      color: "bg-red-500"
    });
  }

  // Core team chat for admins only
  if (hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
    availableChannels.push({ 
      value: "core_team", 
      label: "Core Team", 
      description: "Private administrative discussions",
      icon: <Shield className="h-5 w-5" />,
      component: <CoreTeamChat />,
      badge: "Admin",
      color: "bg-indigo-500"
    });
  }

  // Direct messaging for all authenticated users
  if (user) {
    availableChannels.push({ 
      value: "direct", 
      label: "Direct Messages", 
      description: "One-on-one conversations",
      icon: <Mail className="h-5 w-5" />,
      component: <DirectMessaging />,
      color: "bg-teal-500"
    });
  }

  // Group messaging for all authenticated users
  if (user) {
    availableChannels.push({ 
      value: "groups", 
      label: "Group Messages", 
      description: "Custom group conversations",
      icon: <UsersRound className="h-5 w-5" />,
      component: <GroupMessaging currentUser={user} />,
      color: "bg-pink-500"
    });
  }

  const renderActiveChannel = () => {
    if (!activeChannel) return null;
    const channel = availableChannels.find(ch => ch.value === activeChannel);
    return channel?.component;
  };

  return (
    <div className="space-y-6">
      {showChannelList ? (
        // Channel Selection View
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-main-heading text-primary">Team Communication</h1>
              <p className="text-sm sm:text-base font-body text-muted-foreground">Choose a channel to join the conversation</p>
            </div>
          </div>

          {availableChannels.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Chat Channels Available</p>
                <p className="text-sm">You don't have access to any chat channels yet.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableChannels.map((channel) => (
                <Card 
                  key={channel.value} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20"
                  onClick={() => {
                    setActiveChannel(channel.value);
                    setShowChannelList(false);
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${channel.color} text-white`}>
                        {channel.icon}
                      </div>
                      {channel.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {channel.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-sub-heading">{channel.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground font-body">{channel.description}</p>
                    <Button variant="ghost" size="sm" className="mt-3 w-full">
                      Join Channel →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Active Channel View
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowChannelList(true)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Channels
            </Button>
            
            {activeChannel && (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${availableChannels.find(ch => ch.value === activeChannel)?.color} text-white`}>
                  {availableChannels.find(ch => ch.value === activeChannel)?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-sub-heading">
                    {availableChannels.find(ch => ch.value === activeChannel)?.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {availableChannels.find(ch => ch.value === activeChannel)?.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="min-h-[600px]">
            {renderActiveChannel()}
          </div>
        </div>
      )}
    </div>
  );
}
