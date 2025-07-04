import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface UnreadCounts {
  general: number;
  committee: number;
  hosts: number;
  drivers: number;
  recipients: number;
  core_team: number;
  direct: number;
  groups: number;
  total: number;
}

export default function MessageNotifications() {
  const { user, isAuthenticated } = useAuth();
  const [lastCheck, setLastCheck] = useState(Date.now());

  console.log('MessageNotifications: user=', (user as any)?.id, 'isAuthenticated=', isAuthenticated);

  // Early return if user is not authenticated to prevent any queries
  if (!isAuthenticated || !user) {
    console.log('MessageNotifications: Early return - not authenticated or no user');
    return null;
  }

  // Query for unread message counts - only when authenticated
  const { data: unreadCounts, refetch } = useQuery<UnreadCounts>({
    queryKey: ['/api/messages/unread-counts'],
    enabled: !!user && isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false, // Check every 30 seconds only when authenticated
  });

  // Listen for WebSocket notifications (to be implemented)
  useEffect(() => {
    if (!user) return;

    console.log('Setting up WebSocket for user:', (user as any)?.id);
    // Set up WebSocket connection for real-time notifications
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/notifications`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('Notification WebSocket connected successfully');
        console.log('User ID:', (user as any)?.id);
        // Send user identification
        socket.send(JSON.stringify({
          type: 'identify',
          userId: (user as any)?.id
        }));
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          if (data.type === 'new_message') {
            console.log('Processing new_message notification');
            // Refetch unread counts when new message arrives
            refetch();
            
            // Show browser notification if permission granted and available
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              console.log('Showing browser notification');
              new Notification(`New message in ${data.committee}`, {
                body: `${data.sender}: ${data.content.substring(0, 100)}...`,
                icon: '/favicon.ico'
              });
            } else {
              console.log('Browser notifications not available or not granted');
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        console.log('Notification WebSocket disconnected');
      };

      return () => {
        socket.close();
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }, [user, refetch]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (!unreadCounts) {
    return null;
  }

  const totalUnread = unreadCounts.total || 0;

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('POST', '/api/messages/mark-all-read');
      refetch();
    } catch (error) {
      console.error('Failed to mark all messages as read:', error);
    }
  };

  const getChatDisplayName = (committee: string) => {
    const names = {
      general: 'General Chat',
      committee: 'Committee Chat',
      hosts: 'Host Chat',
      drivers: 'Driver Chat',
      recipients: 'Recipient Chat',
      core_team: 'Core Team',
      direct: 'Direct Messages',
      groups: 'Group Messages'
    };
    return names[committee as keyof typeof names] || committee;
  };

  const navigateToChat = (chatType: string) => {
    // Navigate to the appropriate chat page
    if (chatType === 'direct') {
      window.location.href = '/messages';
    } else if (chatType === 'groups') {
      window.location.href = '/messages?tab=groups';
    } else {
      window.location.href = `/messages?tab=${chatType}`;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold">
          <div className="flex items-center justify-between">
            <span>Message Notifications</span>
            {totalUnread > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleMarkAllRead}
                className="text-xs h-6 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {totalUnread === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">
            No unread messages
          </DropdownMenuItem>
        ) : (
          Object.entries(unreadCounts)
            .filter(([key, count]) => key !== 'total' && count > 0)
            .map(([committee, count]) => (
              <DropdownMenuItem 
                key={committee}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => navigateToChat(committee)}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>{getChatDisplayName(committee)}</span>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </DropdownMenuItem>
            ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}