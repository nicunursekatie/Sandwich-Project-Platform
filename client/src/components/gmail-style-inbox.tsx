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
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  content: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  isDraft: boolean;
  parentMessageId?: number;
  createdAt: string;
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

  // Fetch messages based on folder
  const { data: messages = [], refetch: refetchMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", activeFolder],
    queryFn: async () => {
      let endpoint = "/api/messages";
      const params = new URLSearchParams();
      
      switch (activeFolder) {
        case "inbox":
          params.append("folder", "inbox");
          break;
        case "sent":
          params.append("folder", "sent");
          break;
        case "drafts":
          params.append("folder", "drafts");
          break;
        case "starred":
          params.append("folder", "starred");
          break;
        case "archived":
          params.append("folder", "archived");
          break;
        case "trash":
          params.append("folder", "trash");
          break;
      }
      
      if (params.toString()) {
        endpoint += "?" + params.toString();
      }
      
      const response = await apiRequest('GET', endpoint);
      return Array.isArray(response) ? response : response.messages || [];
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setShowCompose(false);
      resetCompose();
      toast({ description: "Message sent successfully" });
    },
    onError: () => {
      toast({ 
        description: "Failed to send message", 
        variant: "destructive" 
      });
    }
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (replyData: any) => {
      return await apiRequest('POST', '/api/messages/reply', replyData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setShowReply(false);
      setReplyContent("");
      toast({ description: "Reply sent successfully" });
    },
    onError: () => {
      toast({ 
        description: "Failed to send reply", 
        variant: "destructive" 
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      return await apiRequest('PATCH', '/api/messages/mark-read', { messageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    }
  });

  // Star/unstar mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: number; isStarred: boolean }) => {
      return await apiRequest('PATCH', `/api/messages/${messageId}/star`, { isStarred });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    }
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      return await apiRequest('PATCH', '/api/messages/archive', { messageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setSelectedMessages(new Set());
      toast({ description: "Messages archived" });
    }
  });

  // Trash mutation
  const trashMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      return await apiRequest('PATCH', '/api/messages/trash', { messageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setSelectedMessages(new Set());
      toast({ description: "Messages moved to trash" });
    }
  });

  // Delete permanently mutation
  const deleteMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      return await apiRequest('DELETE', '/api/messages', { messageIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
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
    if (!composeRecipient || !composeSubject || !composeContent) {
      toast({ 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    sendMessageMutation.mutate({
      content: composeContent,
      sender: null // Let backend use authenticated user info
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

    replyMutation.mutate({
      parentMessageId: selectedMessage.id,
      recipientId: selectedMessage.senderId,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent
    });
  };

  // Filter messages based on search
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.subject.toLowerCase().includes(query) ||
      message.content.toLowerCase().includes(query) ||
      message.senderName.toLowerCase().includes(query) ||
      message.recipientName.toLowerCase().includes(query)
    );
  });

  // Get folder counts
  const getUnreadCount = (folder: string) => {
    return messages.filter(m => {
      switch (folder) {
        case "inbox": return !m.isRead && !m.isArchived && !m.isTrashed;
        case "starred": return m.isStarred && !m.isTrashed;
        case "archived": return m.isArchived && !m.isTrashed;
        case "trash": return m.isTrashed;
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
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-slate-50 flex flex-col">
        <div className="p-4">
          <Button 
            onClick={() => setShowCompose(true)} 
            className="w-full gap-2"
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
                  w-full flex items-center justify-between px-3 py-2 mb-1 rounded-lg text-left transition-colors
                  ${activeFolder === folder.id 
                    ? 'bg-[#236383] text-white' 
                    : 'hover:bg-slate-200 text-slate-700'
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
      <div className="flex-1 flex">
        <div className="w-96 border-r flex flex-col">
          {/* Toolbar */}
          <div className="border-b p-4 space-y-3">
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedMessages.size === messages.length ? "Deselect All" : "Select All"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsReadMutation.mutate(Array.from(selectedMessages))}
                >
                  Mark Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => archiveMutation.mutate(Array.from(selectedMessages))}
                >
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => trashMutation.mutate(Array.from(selectedMessages))}
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
                    p-4 cursor-pointer transition-colors hover:bg-slate-50
                    ${selectedMessage?.id === message.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''}
                    ${!message.isRead ? 'font-semibold bg-blue-25' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
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
                        toggleStarMutation.mutate({ 
                          messageId: message.id, 
                          isStarred: !message.isStarred 
                        });
                      }}
                      className="mt-1"
                    >
                      <Star 
                        className={`h-4 w-4 ${message.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    </button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activeFolder === 'sent' 
                          ? (message.recipientName || 'U')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                          : (message.senderName || 'U')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {activeFolder === 'sent' ? (message.recipientName || 'Unknown') : (message.senderName || 'Unknown')}
                        </p>
                        <span className="text-xs text-gray-500">
                          {(() => {
                            try {
                              return message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'No date';
                            } catch (error) {
                              return 'Invalid date';
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate mt-1">{message.subject}</p>
                      <p className="text-sm text-gray-600 truncate">{message.content}</p>
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
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="border-b p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowReply(true)}>
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStarMutation.mutate({ 
                        messageId: selectedMessage.id, 
                        isStarred: !selectedMessage.isStarred 
                      })}
                    >
                      <Star 
                        className={`h-4 w-4 ${selectedMessage.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => archiveMutation.mutate([selectedMessage.id])}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => trashMutation.mutate([selectedMessage.id])}
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
                    <p className="font-medium">{selectedMessage.senderName}</p>
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
              <ScrollArea className="flex-1 p-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                </div>
              </ScrollArea>

              {/* Reply Section */}
              {showReply && (
                <div className="border-t p-4">
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

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Send a new message to another user
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">To</Label>
              <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient..." />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.id !== (user as any)?.id).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Enter subject..."
              />
            </div>
            
            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                placeholder="Type your message..."
                rows={8}
              />
            </div>
            
            {saveDraftMutation.isPending && (
              <p className="text-sm text-gray-500">Auto-saving draft...</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}