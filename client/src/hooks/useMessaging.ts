import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

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
  // Add context-specific counts
  suggestion: number;
  project: number;
  task: number;
}

interface Message {
  id: number;
  senderId: string;
  content: string;
  sender?: string;
  senderName?: string;
  senderEmail?: string;
  contextType?: string;
  contextId?: string;
  editedAt?: string;
  editedContent?: string;
  deletedAt?: string;
  deletedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface SendMessageParams {
  recipientIds: string[];
  content: string;
  contextType?: 'suggestion' | 'project' | 'task' | 'direct';
  contextId?: string;
  parentMessageId?: number;
}

export function useMessaging() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Get unread message counts
  const { data: unreadCounts = {
    general: 0,
    committee: 0,
    hosts: 0,
    drivers: 0,
    recipients: 0,
    core_team: 0,
    direct: 0,
    groups: 0,
    total: 0,
    suggestion: 0,
    project: 0,
    task: 0,
  } as UnreadCounts, refetch: refetchUnreadCounts } = useQuery({
    queryKey: ['/api/message-notifications/unread-counts', user?.id],
    queryFn: async () => {
      if (!user?.id) return {
        general: 0,
        committee: 0,
        hosts: 0,
        drivers: 0,
        recipients: 0,
        core_team: 0,
        direct: 0,
        groups: 0,
        total: 0,
        suggestion: 0,
        project: 0,
        task: 0,
      };
      try {
        const response = await apiRequest('GET', '/api/message-notifications/unread-counts');
        // Add context-specific counts
        const contextCounts = await apiRequest('GET', '/api/messaging/unread?groupByContext=true');
        return {
          ...response,
          suggestion: contextCounts.suggestion || 0,
          project: contextCounts.project || 0,
          task: contextCounts.task || 0,
        };
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
        return {
          general: 0,
          committee: 0,
          hosts: 0,
          drivers: 0,
          recipients: 0,
          core_team: 0,
          direct: 0,
          groups: 0,
          total: 0,
          suggestion: 0,
          project: 0,
          task: 0,
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 30000, // Data remains fresh for 30 seconds
    gcTime: 60000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unread messages
  const { data: unreadMessages = [], refetch: refetchUnreadMessages } = useQuery({
    queryKey: ['/api/messaging/unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await apiRequest('GET', '/api/messaging/unread');
      return response.messages || [];
    },
    enabled: !!user?.id,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (params: SendMessageParams) => {
      return await apiRequest('POST', '/api/messaging/send', params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messaging'] });
      toast({ description: 'Message sent successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send message',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('POST', `/api/messaging/${messageId}/read`);
    },
    onSuccess: () => {
      refetchUnreadCounts();
      refetchUnreadMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/messaging'] });
    },
  });

  // Mark all messages as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async (contextType?: string) => {
      return await apiRequest('POST', '/api/messaging/mark-all-read', { contextType });
    },
    onSuccess: () => {
      refetchUnreadCounts();
      refetchUnreadMessages();
      queryClient.invalidateQueries({ queryKey: ['/api/messaging'] });
      toast({ description: 'All messages marked as read' });
    },
  });

  // Listen for notification refresh events (from chat mark-as-read)
  useEffect(() => {
    const handleNotificationRefresh = () => {
      console.log('Notification refresh event received in useMessaging hook - refetching counts');
      refetchUnreadCounts();
    };

    window.addEventListener('notificationRefresh', handleNotificationRefresh);
    
    return () => {
      window.removeEventListener('notificationRefresh', handleNotificationRefresh);
    };
  }, [refetchUnreadCounts]);

  // Setup WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Fix WebSocket URL construction for different environments
    let wsUrl: string;
    
    if (window.location.hostname.includes('.replit.dev') || window.location.hostname.includes('.replit.app')) {
      // Replit environment - use the full hostname without port
      wsUrl = `${protocol}//${window.location.hostname}/notifications`;
    } else {
      // Local development or other environments - use window.location.host which includes port
      wsUrl = `${protocol}//${window.location.host}/notifications`;
    }
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Messaging WebSocket connected');
      // Identify user
      ws.send(JSON.stringify({ type: 'identify', userId: user.id }));
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_message') {
          // Refetch unread counts and messages
          refetchUnreadCounts();
          refetchUnreadMessages();

          // Show toast notification
          toast({
            title: 'New message',
            description: data.message.sender || 'You have a new message',
          });
        } else if (data.type === 'message_edited' || data.type === 'message_deleted') {
          // Refresh message lists
          queryClient.invalidateQueries({ queryKey: ['/api/messaging'] });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Messaging WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Messaging WebSocket disconnected');
      setWsConnection(null);
    };

    return () => {
      ws.close();
    };
  }, [user?.id, refetchUnreadCounts, refetchUnreadMessages, queryClient, toast]);

  // Send a message
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    if (!user?.id) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to send messages',
        variant: 'destructive',
      });
      return;
    }

    return await sendMessageMutation.mutateAsync(params);
  }, [user?.id, sendMessageMutation, toast]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: number) => {
    return await markAsReadMutation.mutateAsync(messageId);
  }, [markAsReadMutation]);

  // Mark all messages as read
  const markAllAsRead = useCallback(async (contextType?: string) => {
    return await markAllAsReadMutation.mutateAsync(contextType);
  }, [markAllAsReadMutation]);

  // Get messages for a specific context
  const getContextMessages = useCallback(async (contextType: string, contextId: string) => {
    try {
      const response = await apiRequest('GET', `/api/messaging/context/${contextType}/${contextId}`);
      return response.messages || [];
    } catch (error) {
      console.error('Failed to fetch context messages:', error);
      return [];
    }
  }, []);

  return {
    // Data
    unreadCounts,
    unreadMessages,
    totalUnread: unreadCounts.total + unreadCounts.suggestion + unreadCounts.project + unreadCounts.task,

    // Actions
    sendMessage,
    markAsRead,
    markAllAsRead,
    getContextMessages,
    refetchUnreadCounts,
    refetchUnreadMessages,

    // Status
    isConnected: !!wsConnection,
    isSending: sendMessageMutation.isPending,
  };
}