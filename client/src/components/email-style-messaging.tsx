import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Send, 
  Inbox, 
  Archive, 
  Trash2, 
  Search,
  Edit3,
  Reply,
  ReplyAll,
  Forward,
  Star,
  StarOff,
  Calendar,
  Paperclip,
  X
} from "lucide-react";

interface EmailMessage {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

// Real-time messages from API

export default function EmailStyleMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    content: ""
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get messages from API
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/real-time-messages', activeFolder],
    queryFn: () => apiRequest('GET', `/api/real-time-messages?folder=${activeFolder}`)
  });

  // Get users for recipient selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('GET', '/api/users')
  });

  // Fetch current user for authentication
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest('POST', '/api/real-time-messages', messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/real-time-messages'] });
      toast({
        title: "Message sent",
        description: "Your message has been delivered instantly."
      });
      setIsComposing(false);
      setComposeData({ to: "", subject: "", content: "" });
    }
  });

  const filteredMessages = messages.filter((msg: EmailMessage) => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Bulk actions
  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleBulkMarkAsRead = async () => {
    for (const messageId of selectedMessages) {
      await markAsReadMutation.mutateAsync(messageId);
    }
    setSelectedMessages([]);
  };

  const handleBulkDelete = async () => {
    for (const messageId of selectedMessages) {
      await deleteMessageMutation.mutateAsync(messageId);
    }
    setSelectedMessages([]);
  };

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest('DELETE', `/api/real-time-messages/${messageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/real-time-messages'] });
      toast({
        title: "Message deleted",
        description: "The message has been moved to trash."
      });
    }
  });

  // Mark message as read when clicked
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest('POST', `/api/real-time-messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/real-time-messages'] });
    }
  });

  const handleMessageClick = (message: EmailMessage) => {
    setSelectedMessage(message);
    
    // Mark message as read if it's unread
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleCompose = () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    sendMessageMutation.mutate(composeData);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to access messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg border">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <div className="p-4 border-b">
          <Button 
            className="w-full" 
            onClick={() => setIsComposing(true)}
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Compose
          </Button>
        </div>
        
        <div className="p-2">
          <nav className="space-y-1">
            <Button
              variant={activeFolder === 'inbox' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveFolder('inbox')}
            >
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
              <Badge variant="secondary" className="ml-auto">
                {messages.filter((m: EmailMessage) => m.folder === 'inbox' && !m.read).length}
              </Badge>
            </Button>
            
            <Button
              variant={activeFolder === 'sent' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveFolder('sent')}
            >
              <Send className="h-4 w-4 mr-2" />
              Sent
            </Button>
            
            <Button
              variant={activeFolder === 'drafts' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveFolder('drafts')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Drafts
            </Button>
            
            <Button
              variant={activeFolder === 'trash' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveFolder('trash')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Trash
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {isComposing ? (
          /* Compose View */
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">New Message</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposing(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To:</label>
                <select
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select recipient...</option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter subject..."
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Message:</label>
                <Textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message..."
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setIsComposing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCompose}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Message List & Detail View */
          <div className="flex-1 flex min-h-0">
            {/* Message List */}
            <div className="w-1/3 min-w-0 border-r flex flex-col">
              <div className="p-3 border-b space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Bulk Actions */}
                {selectedMessages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedMessages.length} selected
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleBulkMarkAsRead}
                    >
                      Mark Read
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground text-sm">No messages</p>
                    </div>
                  ) : (
                    filteredMessages.map((message: EmailMessage) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg transition-colors mb-2 ${
                          selectedMessage?.id === message.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-gray-50 border-transparent'
                        } border ${selectedMessages.includes(message.id) ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedMessages.includes(message.id)}
                              onChange={() => toggleMessageSelection(message.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded"
                            />
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(message.from.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span 
                              className={`text-sm truncate cursor-pointer ${!message.read ? 'font-semibold' : ''}`}
                              onClick={() => handleMessageClick(message)}
                            >
                              {message.from.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {message.starred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className={`text-sm mb-1 truncate ${!message.read ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </h4>
                        
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {message.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {!message.read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <Paperclip className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Message Detail */}
            <div className="flex-1 flex flex-col">
              {selectedMessage ? (
                <>
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-semibold">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          {selectedMessage.starred ? 
                            <StarOff className="h-4 w-4" /> : 
                            <Star className="h-4 w-4" />
                          }
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMessageMutation.mutate(selectedMessage.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(selectedMessage.from.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedMessage.from.name}</span>
                          <span className="text-sm text-muted-foreground">
                            &lt;{selectedMessage.from.email}&gt;
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(selectedMessage.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-4">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-sm">
                          {selectedMessage.content}
                        </p>
                      </div>
                    
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Attachments
                          </h4>
                          <div className="space-y-1">
                            {selectedMessage.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <span>{attachment.name}</span>
                                <span className="text-muted-foreground">({attachment.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        <ReplyAll className="h-4 w-4 mr-2" />
                        Reply All
                      </Button>
                      <Button variant="outline" size="sm">
                        <Forward className="h-4 w-4 mr-2" />
                        Forward
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a message to view
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}