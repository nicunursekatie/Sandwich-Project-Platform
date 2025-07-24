import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Archive, 
  Trash2, 
  Search,
  Plus,
  MoreVertical,
  Reply,
  Forward,
  Heart,
  Clock,
  User
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmailMessage {
  id: number;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'starred' | 'archived' | 'trash' | 'kudos';
  threadId?: number;
  isKudos?: boolean;
}

interface EmailThread {
  id: number;
  subject: string;
  participants: string[];
  messageCount: number;
  lastActivity: string;
  messages: EmailMessage[];
}

const FOLDERS = [
  { id: 'inbox', name: 'Inbox', icon: Inbox, color: 'text-blue-600' },
  { id: 'sent', name: 'Sent', icon: Send, color: 'text-green-600' },
  { id: 'drafts', name: 'Drafts', icon: FileText, color: 'text-yellow-600' },
  { id: 'starred', name: 'Starred', icon: Star, color: 'text-amber-500' },
  { id: 'kudos', name: 'Kudos', icon: Heart, color: 'text-red-500' },
  { id: 'archived', name: 'Archived', icon: Archive, color: 'text-gray-500' },
  { id: 'trash', name: 'Trash', icon: Trash2, color: 'text-red-600' },
];

export default function GmailInbox() {
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: '',
    isKudos: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages for current folder
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/email-messages', selectedFolder, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        folder: selectedFolder,
        ...(searchQuery && { search: searchQuery })
      });
      return await apiRequest('GET', `/api/email-messages?${params}`);
    }
  });

  // Fetch message threads
  const { data: threads = [] } = useQuery({
    queryKey: ['/api/email-threads', selectedFolder],
    queryFn: async () => {
      return await apiRequest('GET', `/api/email-threads?folder=${selectedFolder}`);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest('POST', '/api/email-messages', messageData);
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully!" });
      setIsComposing(false);
      setComposeData({ to: '', subject: '', content: '', isKudos: false });
      queryClient.invalidateQueries({ queryKey: ['/api/email-messages'] });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('PATCH', `/api/email-messages/${messageId}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-messages'] });
    }
  });

  // Move to folder mutation
  const moveToFolderMutation = useMutation({
    mutationFn: async ({ messageId, folder }: { messageId: number; folder: string }) => {
      return await apiRequest('PATCH', `/api/email-messages/${messageId}`, { folder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-messages'] });
      toast({ title: "Message moved successfully!" });
    }
  });

  // Star/unstar mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: number; isStarred: boolean }) => {
      return await apiRequest('PATCH', `/api/email-messages/${messageId}`, { isStarred });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-messages'] });
    }
  });

  const handleSelectMessage = (message: EmailMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendMessage = () => {
    if (!composeData.to || !composeData.subject || !composeData.content) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    sendMessageMutation.mutate({
      ...composeData,
      folder: composeData.isKudos ? 'kudos' : 'sent'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getUnreadCount = (folderId: string) => {
    return messages.filter((msg: EmailMessage) => 
      msg.folder === folderId && !msg.isRead
    ).length;
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Compose Button */}
        <div className="p-4">
          <Button 
            onClick={() => setIsComposing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto">
          {FOLDERS.map((folder) => {
            const Icon = folder.icon;
            const unreadCount = getUnreadCount(folder.id);
            
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                  selectedFolder === folder.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${folder.color}`} />
                <span className="flex-1 font-medium text-gray-700">
                  {folder.name}
                </span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Message List */}
          <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
            {messagesLoading ? (
              <div className="p-4 text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <div>No messages in {FOLDERS.find(f => f.id === selectedFolder)?.name}</div>
              </div>
            ) : (
              messages.map((message: EmailMessage) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${!message.isRead ? 'bg-blue-25' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <span className={`text-sm ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {selectedFolder === 'sent' ? `To: ${message.recipient}` : `From: ${message.sender}`}
                        </span>
                        {message.isKudos && (
                          <Heart className="w-3 h-3 ml-2 text-red-500 fill-current" />
                        )}
                        {message.isStarred && (
                          <Star className="w-3 h-3 ml-2 text-amber-500 fill-current" />
                        )}
                      </div>
                      <div className={`text-sm mb-1 ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {message.subject}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {message.content.substring(0, 100)}...
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 ml-2">
                      {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="flex-2 bg-white overflow-y-auto">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Message Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedMessage.subject}
                        {selectedMessage.isKudos && (
                          <Heart className="w-5 h-5 inline ml-2 text-red-500 fill-current" />
                        )}
                      </h2>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span className="font-medium mr-2">
                          {selectedFolder === 'sent' ? selectedMessage.recipient : selectedMessage.sender}
                        </span>
                        <Clock className="w-4 h-4 mr-1 ml-4" />
                        <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStarMutation.mutate({
                          messageId: selectedMessage.id,
                          isStarred: !selectedMessage.isStarred
                        })}
                      >
                        <Star className={`w-4 h-4 ${selectedMessage.isStarred ? 'fill-current text-amber-500' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToFolderMutation.mutate({
                          messageId: selectedMessage.id,
                          folder: 'archived'
                        })}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToFolderMutation.mutate({
                          messageId: selectedMessage.id,
                          folder: 'trash'
                        })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="flex-1 p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800">
                      {selectedMessage.content}
                    </div>
                  </div>
                </div>

                {/* Reply Section */}
                <div className="border-t border-gray-200 p-6">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        setIsComposing(true);
                        setComposeData({
                          to: selectedMessage.sender,
                          subject: `Re: ${selectedMessage.subject}`,
                          content: `\n\n--- Original Message ---\nFrom: ${selectedMessage.sender}\nDate: ${selectedMessage.timestamp}\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.content}`,
                          isKudos: false
                        });
                      }}
                    >
                      <Reply className="w-4 h-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline">
                      <Forward className="w-4 h-4 mr-2" />
                      Forward
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">✉️</div>
                  <div className="text-xl mb-2">Select a message to read</div>
                  <div>Choose a message from the list to view its contents</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Compose Message</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsComposing(false)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To:</label>
                <Input
                  value={composeData.to}
                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <Input
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Enter subject"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isKudos"
                  checked={composeData.isKudos}
                  onChange={(e) => setComposeData({ ...composeData, isKudos: e.target.checked })}
                />
                <label htmlFor="isKudos" className="text-sm font-medium flex items-center">
                  <Heart className="w-4 h-4 mr-1 text-red-500" />
                  Send as Kudos
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message:</label>
                <Textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Write your message..."
                  rows={8}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending}
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsComposing(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}