import { useState, useEffect, memo } from "react";
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

interface MessageNotificationsProps {
  user: any; // User object passed from parent Dashboard
}

function MessageNotifications({ user }: MessageNotificationsProps) {
  const isAuthenticated = !!user;
  const [lastCheck, setLastCheck] = useState(Date.now());

  // Early return if user is not authenticated to prevent any queries
  if (!isAuthenticated || !user) {
    return null;
  }

  // Query for unread message counts - only when authenticated
  const { data: unreadCounts, refetch, error, isLoading } = useQuery<UnreadCounts>({
    queryKey: ['/api/message-notifications/unread-counts'],
    enabled: !!user && isAuthenticated,
    refetchInterval: isAuthenticated ? 30000 : false, // Check every 30 seconds only when authenticated
  });



  // Listen for WebSocket notifications
  useEffect(() => {
    if (!user) {
      return;
    }

    // Declare variables in outer scope for cleanup
    let socket: WebSocket | null = null;
    let reconnectTimeoutId: NodeJS.Timeout | null = null;

    // Set up WebSocket connection for real-time notifications
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    
    // Simple WebSocket URL construction for Replit environment
    let wsUrl: string;
    
    if (window.location.hostname.includes('.replit.dev') || window.location.hostname.includes('.replit.app')) {
      // Replit environment - use the full hostname without port but with correct protocol
      wsUrl = `${protocol}//${window.location.hostname}/notifications`;
    } else if (window.location.hostname === 'localhost') {
      // Local development - use the actual port from location
      const port = window.location.port || '5000';
      wsUrl = `${protocol}//${window.location.hostname}:${port}/notifications`;
    } else {
      // Fallback for other environments
      wsUrl = `${protocol}//${window.location.host}/notifications`;
    }

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        // Send user identification
        if (socket) {
          socket.send(JSON.stringify({
            type: 'identify',
            userId: (user as any)?.id
          }));
        }
      };

      socket.onerror = (error) => {
        // Silently handle WebSocket errors to avoid console spam
        console.debug('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        // Only attempt reconnection if not a normal closure
        if (event.code !== 1000) {
          reconnectTimeoutId = setTimeout(() => {
            // The cleanup function will trigger re-initialization
          }, 5000);
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_message') {
            // Refetch unread counts when new message arrives
            refetch();

            // Show browser notification if permission granted and available
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              new Notification(`New message in ${data.committee}`, {
                body: `${data.sender}: ${data.content.substring(0, 100)}...`,
                icon: '/favicon.ico'
              });
            }
          }
        } catch (error) {
          // Silently handle parsing errors
        }
      };

    } catch (error) {
      // Still allow component to function without real-time updates
    }

    return () => {
      if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
      }
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [user, refetch]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show loading state or empty state instead of returning null
  if (isLoading) {
    return null; // Could show a loading spinner here
  }

  if (error) {
    return null; // Could show error state here
  }

  const finalUnreadCounts = unreadCounts || {
    general: 0, committee: 0, hosts: 0, drivers: 0, recipients: 0,
    core_team: 0, direct: 0, groups: 0, total: 0
  };

  const totalUnread = finalUnreadCounts.total || 0;

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('POST', '/api/message-notifications/mark-all-read');
      refetch();
    } catch (error) {
      // Silently handle errors
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
    // Navigate to chat system instead of messages inbox
    window.location.href = '/dashboard?section=chat';
  };



  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {/* Debug indicator - green dot shows component is mounted */}
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full" title="Notifications Active"></div>
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
          Object.entries(finalUnreadCounts)
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

// Memoize the component to prevent unnecessary re-renders when props haven't changed
export default memo(MessageNotifications, (prevProps, nextProps) => {
  // Only re-render if the user ID changes, not the entire user object
  return prevProps.user?.id === nextProps.user?.id;
});