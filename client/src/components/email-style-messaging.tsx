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
  
  // Clear selected message when switching tabs
  const handleTabChange = (folder: 'inbox' | 'sent' | 'drafts' | 'trash') => {
    setActiveFolder(folder);
    setSelectedMessage(null); // Clear selection when switching tabs
    setSelectedMessages([]); // Clear bulk selections too
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    content: ""
  });
  const [replyData, setReplyData] = useState<EmailMessage | null>(null);

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

  // Get messages from API with error handling
  const { data: messages = [], isLoading, error: messagesError } = useQuery({
    queryKey: ['/api/real-time-messages', activeFolder],
    queryFn: () => apiRequest('GET', `/api/real-time-messages?folder=${activeFolder}`),
    retry: false
  });

  // Get users for recipient selection
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('GET', '/api/users'),
    retry: false
  });

  // Fetch current user for authentication
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      console.log('Sending message data:', messageData);
      const response = await apiRequest('POST', '/api/real-time-messages', messageData);
      console.log('Send message response:', response);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/real-time-messages'] });
      toast({
        title: "Message sent",
        description: "Your message has been delivered successfully."
      });
      setIsComposing(false);
      setReplyData(null);
      setComposeData({ to: "", subject: "", content: "" });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      // More detailed error handling
      let errorMessage = "Failed to send message. Please try again.";
      if (error.message?.includes('401')) {
        errorMessage = "Authentication required. Please log in first.";
      } else if (error.message?.includes('403')) {
        errorMessage = "Permission denied. You may not have access to send messages.";
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const filteredMessages = Array.isArray(messages) ? messages.filter((msg: EmailMessage) => 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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

  const handleReply = (message: EmailMessage) => {
    setReplyData(message);
    setComposeData({
      to: message.from.email,
      subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${message.from.name} <${message.from.email}>\nDate: ${formatDate(message.timestamp)}\nSubject: ${message.subject}\n\n${message.content}`
    });
    setIsComposing(true);
  };

  const handleReplyAll = (message: EmailMessage) => {
    const currentUserEmail = (currentUser as any)?.email || '';
    const allRecipients = [message.from.email, ...message.to.filter(email => email !== currentUserEmail)];
    setReplyData(message);
    setComposeData({
      to: allRecipients.join(', '),
      subject: message.subject.startsWith('Re:') ? message.subject : `Re: ${message.subject}`,
      content: `\n\n--- Original Message ---\nFrom: ${message.from.name} <${message.from.email}>\nDate: ${formatDate(message.timestamp)}\nSubject: ${message.subject}\n\n${message.content}`
    });
    setIsComposing(true);
  };

  const handleForward = (message: EmailMessage) => {
    setReplyData(message);
    setComposeData({
      to: "",
      subject: message.subject.startsWith('Fwd:') ? message.subject : `Fwd: ${message.subject}`,
      content: `\n\n--- Forwarded Message ---\nFrom: ${message.from.name} <${message.from.email}>\nDate: ${formatDate(message.timestamp)}\nSubject: ${message.subject}\n\n${message.content}`
    });
    setIsComposing(true);
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
              onClick={() => handleTabChange('inbox')}
            >
              <Inbox className="h-4 w-4 mr-2" />
              Inbox
              <Badge variant="secondary" className="ml-auto">
                {Array.isArray(messages) ? messages.filter((m: EmailMessage) => m.folder === 'inbox' && !m.read).length : 0}
              </Badge>
            </Button>
            
            <Button
              variant={activeFolder === 'sent' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleTabChange('sent')}
            >
              <Send className="h-4 w-4 mr-2" />
              Sent
            </Button>
            
            <Button
              variant={activeFolder === 'drafts' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleTabChange('drafts')}
            >
              <Archive className="h-4 w-4 mr-2" />
              Drafts
            </Button>
            
            <Button
              variant={activeFolder === 'trash' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleTabChange('trash')}
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
                <h2 className="text-lg font-semibold">
                  {replyData ? (
                    replyData.subject.startsWith('Re:') ? 'Reply to Message' :
                    replyData.subject.startsWith('Fwd:') ? 'Forward Message' : 
                    'Reply to Message'
                  ) : 'New Message'}
                </h2>
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
                {replyData ? (
                  <Input
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="Recipient email..."
                  />
                ) : (
                  <select
                    value={composeData.to}
                    onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select recipient...</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.email}>
                        {user.firstName || user.email} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
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
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsComposing(false);
                      setReplyData(null);
                      setComposeData({ to: "", subject: "", content: "" });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCompose}
                    disabled={sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Message List & Detail View */
          <div className="flex-1 flex min-h-0">
            {/* Message List */}
            <div className="w-2/5 min-w-0 border-r flex flex-col bg-white">
              <div className="p-4 border-b bg-gray-50 space-y-3">
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
                <div className="">
                  {filteredMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground text-sm">No messages</p>
                    </div>
                  ) : (
                    filteredMessages.map((message: EmailMessage) => (
                      <div
                        key={message.id}
                        className={`px-3 py-4 cursor-pointer transition-colors border-b border-gray-100 ${
                          selectedMessage?.id === message.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'
                        } ${selectedMessages.includes(message.id) ? 'bg-blue-25' : ''}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(message.id)}
                            onChange={() => toggleMessageSelection(message.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 mt-1"
                          />
                          
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                              {getInitials(message.from.name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            {/* Header Row - Fix timestamp cutoff */}
                            <div className="flex items-center justify-between mb-1 gap-3">
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className={`text-sm truncate ${!message.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                  {message.from.name}
                                </span>
                                {activeFolder === 'sent' && message.to && (
                                  <span className="text-xs text-gray-500 truncate">
                                    to: {Array.isArray(message.to) ? message.to.join(', ') : message.to}
                                  </span>
                                )}
                                {!message.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
                                {message.starred && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                                )}
                                {message.attachments && message.attachments.length > 0 && (
                                  <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(message.timestamp)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Subject Line */}
                            <div className="mb-2">
                              <h4 className={`text-sm truncate ${!message.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                                {message.subject || '(No Subject)'}
                              </h4>
                            </div>
                            
                            {/* Message Preview */}
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 pr-4">
                              {message.content}
                            </p>
                            
                            {/* Tags and Status */}
                            <div className="flex items-center gap-2 mt-2">
                              {!message.read && (
                                <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-medium">
                                  New
                                </Badge>
                              )}
                              {message.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs px-2 py-1">
                                  High Priority
                                </Badge>
                              )}
                              {message.labels && message.labels.length > 0 && (
                                <div className="flex gap-1">
                                  {message.labels.map((label: string) => (
                                    <Badge key={label} variant="outline" className="text-xs px-2 py-1">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
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
                          {activeFolder === 'sent' ? (
                            <span className="font-bold text-red-600">TO:</span>
                          ) : (
                            <span className="font-bold text-blue-600">FROM:</span>
                          )}
                          <span className="font-medium">{selectedMessage.from.name}</span>
                          <span className="text-sm text-muted-foreground">
                            &lt;{selectedMessage.from.email}&gt;
                          </span>
                        </div>
                        {activeFolder === 'sent' && selectedMessage.to && Array.isArray(selectedMessage.to) && selectedMessage.to.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-bold text-red-600">TO:</span> {selectedMessage.to.join(', ')}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground mt-1">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReply(selectedMessage)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReplyAll(selectedMessage)}
                      >
                        <ReplyAll className="h-4 w-4 mr-2" />
                        Reply All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleForward(selectedMessage)}
                      >
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