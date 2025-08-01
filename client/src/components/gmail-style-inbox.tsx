import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  Inbox as InboxIcon,
  Send,
  Edit3,
  Trash2,
  Star,
  Archive,
  Reply,
  ReplyAll,
  Forward,
  MoreVertical,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface Message {
  id: number;
  content: string;
  userId: string;
  sender: string;
  senderName: string;
  conversationId: number;
  createdAt: string;
  // Email fields for Gmail-style inbox (NO THREADING)
  senderId?: string;
  senderEmail?: string;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  subject?: string;
  isRead?: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  isDraft?: boolean;
  // REMOVED: parentMessageId - No threading functionality
  readAt?: string;
  contextType?: string;
  contextId?: string;
  contextTitle?: string;
}

interface Draft {
  id?: number;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  lastSaved: string;
}

export default function GmailStyleInbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // UI State
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  
  // Compose State
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  
  // Reply State
  const [replyContent, setReplyContent] = useState("");
  
  // Draft State
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Fetch users for compose
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Use email system for Gmail inbox
  const apiBase = "/api/emails";

  // Fetch messages from email system - simple flat list
  const { data: messages = [], refetch: refetchMessages } = useQuery<any[]>({
    queryKey: [apiBase, activeFolder],
    queryFn: async () => {
      // Get flat email list for simple inbox view
      const response = await apiRequest('GET', `/api/emails?folder=${activeFolder}`);
      const messages = Array.isArray(response) ? response : response.messages || [];
      
      console.log(`Fetched ${messages.length} emails from ${activeFolder} folder`);
      return messages;
    },
  });

  // Fetch drafts
  const { data: drafts = [] } = useQuery<Draft[]>({
    queryKey: ["/api/drafts"],
    enabled: activeFolder === "drafts",
  });

  // Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (draft: Partial<Draft>) => {
      if (draft.id) {
        return await apiRequest('PUT', `/api/drafts/${draft.id}`, draft);
      } else {
        return await apiRequest('POST', '/api/drafts', draft);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drafts"] });
    }
  });

  // Send message mutation - use email endpoint for Gmail
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Use proper email format for emailMessages table
      const emailData = {
        recipientId: messageData.recipientId,
        recipientName: messageData.recipientName,
        recipientEmail: messageData.recipientEmail,
        subject: messageData.subject || 'Project Discussion',
        content: messageData.content,
        isDraft: messageData.isDraft || false
      };
      console.log('Sending email with data:', emailData);
      return await apiRequest('POST', '/api/emails', emailData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Also invalidate Gmail unread count to update navigation indicator
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unread-count'] });
      setShowCompose(false);
      resetCompose();
      toast({ description: "Message sent successfully" });
    },
    onError: (error) => {
      console.error('Send email error:', error);
      toast({ 
        description: "Failed to send message", 
        variant: "destructive" 
      });
    }
  });

  // Reply mutation - simple email reply without threading
  const replyMutation = useMutation({
    mutationFn: async (replyData: any) => {
      if (!selectedMessage) {
        throw new Error("No message selected for reply");
      }
      
      // Create simple reply email
      const replyEmailData = {
        recipientId: selectedMessage.senderId,
        recipientName: selectedMessage.senderName,
        recipientEmail: selectedMessage.senderEmail,
        subject: selectedMessage.subject?.startsWith('Re: ') ? selectedMessage.subject : `Re: ${selectedMessage.subject || 'No Subject'}`,
        content: replyData.content,
        isDraft: false
      };
      
      console.log('Sending reply:', replyEmailData);
      return await apiRequest('POST', '/api/emails', replyEmailData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Also invalidate Gmail unread count to update navigation indicator
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unread-count'] });
      setShowReply(false);
      setReplyContent("");
      toast({ description: "Reply sent successfully" });
    },
    onError: (error) => {
      console.error('Reply error:', error);
      toast({ 
        description: "Failed to send reply", 
        variant: "destructive" 
      });
    }
  });

  // Mark as read mutation - use email PATCH endpoint
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      // Mark each message as read using the email PATCH endpoint
      const promises = messageIds.map(id => 
        apiRequest('PATCH', `/api/emails/${id}`, { isRead: true })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Also invalidate Gmail unread count to update navigation indicator
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unread-count'] });
      toast({ description: "Marked as read" });
    },
    onError: (error) => {
      console.error('Mark as read error:', error);
      toast({ 
        description: "Failed to mark as read", 
        variant: "destructive" 
      });
    }
  });

  // Star/unstar mutation - disabled for conversation messages
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: number; isStarred: boolean }) => {
      console.log('Star not implemented for conversation messages:', messageId, isStarred);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
    }
  });

  // Archive mutation - mark messages as archived
  const archiveMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      // Mark each message as archived using the email PATCH endpoint
      const promises = messageIds.map(id => 
        apiRequest('PATCH', `/api/emails/${id}`, { isArchived: true })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Also invalidate Gmail unread count to update navigation indicator
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unread-count'] });
      setSelectedMessages(new Set());
      toast({ description: "Messages archived successfully" });
    },
    onError: (error) => {
      console.error('Archive error:', error);
      toast({ 
        description: "Failed to archive messages", 
        variant: "destructive" 
      });
    }
  });

  // Trash mutation - mark messages as trashed
  const trashMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      // Mark each message as trashed using the email PATCH endpoint
      const promises = messageIds.map(id => 
        apiRequest('PATCH', `/api/emails/${id}`, { isTrashed: true })
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      // Also invalidate Gmail unread count to update navigation indicator
      queryClient.invalidateQueries({ queryKey: ['/api/emails/unread-count'] });
      setSelectedMessages(new Set());
      toast({ description: "Messages moved to trash" });
    },
    onError: (error) => {
      console.error('Trash error:', error);
      toast({ 
        description: "Failed to move messages to trash", 
        variant: "destructive" 
      });
    }
  });

  // Delete permanently mutation - use conversation delete
  const deleteMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      // Delete conversation messages one by one
      const deletePromises = messageIds.map(id => 
        apiRequest('DELETE', `/api/messages/${id}`)
      );
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiBase] });
      setSelectedMessages(new Set());
      toast({ description: "Messages deleted permanently" });
    }
  });

  // Auto-save draft effect
  useEffect(() => {
    if (composeRecipient || composeSubject || composeContent) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        const draft = {
          id: currentDraft?.id,
          recipientId: composeRecipient,
          recipientName: users.find(u => u.id === composeRecipient)?.firstName + ' ' + users.find(u => u.id === composeRecipient)?.lastName || '',
          subject: composeSubject,
          content: composeContent,
          lastSaved: new Date().toISOString()
        };
        
        saveDraftMutation.mutate(draft);
        setCurrentDraft(draft as Draft);
      }, 2000); // Auto-save after 2 seconds of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [composeRecipient, composeSubject, composeContent]);

  // Helper functions
  const resetCompose = () => {
    setComposeRecipient("");
    setComposeSubject("");
    setComposeContent("");
    setCurrentDraft(null);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if not already read
    if (!message.isRead) {
      markAsReadMutation.mutate([message.id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const handleToggleSelect = (messageId: number) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSendMessage = () => {
    if (!composeRecipient || !composeContent) {
      toast({ 
        description: "Please select a recipient and enter a message", 
        variant: "destructive" 
      });
      return;
    }

    const recipient = users.find(u => u.id === composeRecipient);
    
    // Always use conversation format now
    sendMessageMutation.mutate({
      recipientId: composeRecipient,
      recipientName: recipient ? `${recipient.firstName} ${recipient.lastName}`.trim() : '',
      recipientEmail: recipient?.email || '',
      subject: composeSubject || 'Project Discussion',
      content: composeContent,
      isDraft: false
    });
  };

  const handleReply = () => {
    if (!selectedMessage || !replyContent) {
      toast({ 
        description: "Please enter a reply message", 
        variant: "destructive" 
      });
      return;
    }

    console.log('Sending reply with data:', {
      content: replyContent,
      sender: null, // Let backend use authenticated user info
      recipientId: selectedMessage.userId,
      conversationName: null, // Reply to existing conversation
      conversationId: selectedMessage.conversationId
    });

    replyMutation.mutate({
      content: replyContent,
      sender: null, // Let backend use authenticated user info
      recipientId: selectedMessage.userId,
      conversationName: null, // Reply to existing conversation
      conversationId: selectedMessage.conversationId
    });
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.content.toLowerCase().includes(query) ||
      message.senderName.toLowerCase().includes(query)
    );
  });

  // Get folder counts
  const getUnreadCount = (folder: string) => {
    return messages.filter(m => {
      switch (folder) {
        case "inbox": return !m.isRead; // Count unread messages in inbox
        case "starred": return false; // No starred functionality yet
        case "archived": return false; // No archived functionality yet  
        case "trash": return false; // No trash functionality yet
        default: return false;
      }
    }).length;
  };

  const folders = [
    { id: "inbox", label: "Inbox", icon: InboxIcon, count: getUnreadCount("inbox") },
    { id: "starred", label: "Starred", icon: Star, count: getUnreadCount("starred") },
    { id: "sent", label: "Sent", icon: Send, count: 0 },
    { id: "drafts", label: "Drafts", icon: Edit3, count: drafts.length },
    { id: "archived", label: "Archived", icon: Archive, count: getUnreadCount("archived") },
    { id: "trash", label: "Trash", icon: Trash2, count: getUnreadCount("trash") },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 lg:w-64 md:w-56 sm:w-52 xs:w-48 border-r bg-white flex flex-col flex-shrink-0">
        <div className="p-4">
          <Button 
            onClick={() => setShowCompose(true)} 
            className="w-full gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-['Roboto'] font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Compose
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="px-2">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg text-left transition-colors font-['Roboto']
                  ${activeFolder === folder.id 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
                    : 'hover:bg-amber-50 hover:border-amber-200 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <folder.icon className="h-4 w-4" />
                  <span className="font-medium">{folder.label}</span>
                </div>
                {folder.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`
                      h-5 px-2 text-xs
                      ${activeFolder === folder.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-slate-300 text-slate-700'
                      }
                    `}
                  >
                    {folder.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message List */}
      <div className="flex-1 flex bg-white min-w-0">
        <div className="flex-1 lg:flex-none lg:w-1/2 md:w-3/5 border-r flex flex-col bg-white min-w-0">
          {/* Toolbar */}
          <div className="border-b p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize">{activeFolder}</h2>
              <Button variant="ghost" size="sm" onClick={() => refetchMessages()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Bulk Actions */}
            {selectedMessages.size > 0 && (
              <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  {selectedMessages.size === messages.length ? "Deselect" : "Select All"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => console.log('Mark Read not implemented for conversation messages')}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Mark Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMessages.size > 0) {
                      archiveMutation.mutate(Array.from(selectedMessages));
                    }
                  }}
                  disabled={selectedMessages.size === 0 || archiveMutation.isPending}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedMessages.size > 0) {
                      trashMutation.mutate(Array.from(selectedMessages));
                    }
                  }}
                  disabled={selectedMessages.size === 0 || trashMutation.isPending}
                  className="text-xs lg:text-sm px-2 lg:px-3"
                >
                  Trash
                </Button>
              </div>
            )}
          </div>

          {/* Message List */}
          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`
                    p-3 lg:p-5 cursor-pointer transition-colors hover:bg-amber-50 font-['Roboto'] border-b border-gray-100
                    ${selectedMessage?.id === message.id ? 'bg-amber-100 border-r-4 border-amber-500 shadow-sm' : ''}
                    ${!message.isRead ? 'bg-blue-50 font-bold border-l-4 border-blue-500' : 'bg-white font-normal'}
                  `}
                >
                  <div className="flex items-start gap-2 lg:gap-3">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelect(message.id);
                      }}
                      className="mt-1"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Star clicked for message', message.id);
                      }}
                      className="mt-1"
                    >
                      <Star 
                        className="h-4 w-4 text-gray-300"
                      />
                    </button>
                    <Avatar className="h-7 w-7 lg:h-8 lg:w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {activeFolder === 'sent' 
                          ? (message.recipientName || 'U')?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
                          : (message.senderName || 'U')?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <p className={`text-sm flex-1 truncate ${!message.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {activeFolder === 'sent' ? (message.recipientName || 'Unknown') : (message.senderName || 'Unknown')}
                        </p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {(() => {
                            try {
                              return message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'No date';
                            } catch (error) {
                              return 'Invalid date';
                            }
                          })()}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!message.isRead ? 'font-bold text-gray-900' : 'font-normal text-gray-600'}`} style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredMessages.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery ? "No messages found matching your search" : `No ${activeFolder} messages`}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Detail */}
        <div className="hidden lg:flex lg:flex-1 flex-col bg-white">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {selectedMessage.content.length > 40 
                      ? `${selectedMessage.content.substring(0, 40)}...`
                      : selectedMessage.content}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowReply(true)}>
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Star clicked for message', selectedMessage.id)}
                    >
                      <Star 
                        className="h-4 w-4 text-gray-300"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedMessage) {
                          archiveMutation.mutate([selectedMessage.id]);
                          setSelectedMessage(null);
                        }
                      }}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (selectedMessage) {
                          trashMutation.mutate([selectedMessage.id]);
                          setSelectedMessage(null);
                        }
                      }}
                      disabled={trashMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedMessage.senderName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">From: {selectedMessage.senderName}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.senderEmail}</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">
                    {(() => {
                      try {
                        return selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'No date';
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className={`p-4 ${selectedMessage.content.length > 500 ? 'flex-1 overflow-y-auto' : 'flex-shrink-0'}`}>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                </div>
              </div>

              {/* Flexible spacer for short messages */}
              {selectedMessage.content.length <= 500 && (
                <div className="flex-1 min-h-0"></div>
              )}

              {/* Reply Section */}
              {showReply && (
                <div className="border-t p-4 flex-shrink-0">
                  <div className="space-y-3">
                    <Label>Reply to {selectedMessage.senderName}</Label>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setShowReply(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReply}
                        disabled={replyMutation.isPending}
                      >
                        {replyMutation.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog - Subtle TSP Branding */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl bg-white border border-gray-200 rounded-xl shadow-xl">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-800 font-['Roboto']">
                  New Message
                </DialogTitle>
                <DialogDescription className="text-gray-600 font-['Roboto']">
                  Send a message to your team member
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-sm font-semibold text-gray-700 font-['Roboto']">
                To
              </Label>
              <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                <SelectTrigger className="rounded-lg border border-gray-300 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 h-11 transition-colors">
                  <SelectValue placeholder="Choose team member..." />
                </SelectTrigger>
                <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  {users.filter(u => u.id !== (user as any)?.id).map((user) => (
                    <SelectItem 
                      key={user.id} 
                      value={user.id} 
                      className="py-2 px-3 hover:bg-amber-50 focus:bg-amber-50 data-[highlighted]:bg-amber-50"
                      style={{ 
                        color: '#1f2937', 
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      <div className="flex items-center gap-2" style={{ color: '#1f2937' }}>
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>
                          {user.firstName} {user.lastName}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>
                          ({user.email})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-700 font-['Roboto'] flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                Project/Task name (optional)
              </Label>
              <Input
                id="subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Budget Review, Website Updates, Event Planning..."
                className="rounded-lg border border-gray-300 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 h-11 font-['Roboto'] placeholder:text-gray-500 transition-colors text-gray-900"
                style={{ color: '#1f2937' }}
              />
              <p className="text-xs text-gray-500 font-['Roboto'] italic">
                Leave blank for general conversation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold text-gray-700 font-['Roboto']">
                Message
              </Label>
              <Textarea
                id="content"
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="rounded-lg border border-gray-300 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-['Roboto'] placeholder:text-gray-500 resize-none transition-colors text-gray-900"
                style={{ color: '#1f2937' }}
              />
            </div>
            
            {saveDraftMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                Auto-saving draft...
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4 border-t border-gray-100 gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowCompose(false)}
              className="rounded-lg px-6 py-2 text-gray-600 hover:bg-gray-100 font-['Roboto'] font-medium transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
              className="rounded-lg px-8 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-['Roboto'] font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {sendMessageMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}