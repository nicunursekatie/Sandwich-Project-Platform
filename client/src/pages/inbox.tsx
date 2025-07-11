import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/hooks/useMessaging";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import {
  Inbox as InboxIcon,
  MessageCircle,
  Send,
  Search,
  CheckCheck,
  Circle,
  Lightbulb,
  FolderOpen,
  ListTodo,
  Archive,
  Star,
  MoreVertical,
  Reply,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: number;
  senderId: string;
  senderName?: string;
  content: string;
  contextType?: string;
  contextId?: string;
  contextTitle?: string;
  createdAt: string;
  editedAt?: string;
  editedContent?: string;
  read?: boolean;
  readAt?: string;
}

export default function InboxPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    unreadMessages,
    markAsRead,
    markAllAsRead,
    getContextMessages,
    sendMessage,
    isSending,
  } = useMessaging();

  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");

  // Fetch all messages
  const { data: allMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["/api/messaging/messages", selectedTab],
    queryFn: async () => {
      let endpoint = "/api/messaging/messages";
      if (selectedTab !== "all") {
        endpoint += `?contextType=${selectedTab}`;
      }
      const response = await apiRequest("GET", endpoint);
      return response.messages || [];
    },
  });

  // Fetch thread messages when a message is selected
  const { data: threadMessages = [] } = useQuery({
    queryKey: [
      "/api/messaging/thread",
      selectedMessage?.contextType,
      selectedMessage?.contextId,
    ],
    queryFn: async () => {
      if (!selectedMessage?.contextType || !selectedMessage?.contextId)
        return [];
      return await getContextMessages(
        selectedMessage.contextType,
        selectedMessage.contextId,
      );
    },
    enabled: !!selectedMessage?.contextType && !!selectedMessage?.contextId,
  });

  // Handle message selection and mark as read
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
      refetchMessages();
    }
  };

  // Handle reply
  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;

    try {
      await sendMessage({
        recipientIds: [selectedMessage.senderId],
        content: replyContent,
        contextType: selectedMessage.contextType as any,
        contextId: selectedMessage.contextId,
      });

      setReplyContent("");
      refetchMessages();
      toast({ description: "Reply sent successfully" });
    } catch (error) {
      toast({
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  // Filter messages based on search
  const filteredMessages = allMessages.filter((message: Message) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      message.content.toLowerCase().includes(searchLower) ||
      message.senderName?.toLowerCase().includes(searchLower) ||
      message.contextTitle?.toLowerCase().includes(searchLower)
    );
  });

  // Get context icon
  const getContextIcon = (contextType?: string) => {
    switch (contextType) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "project":
        return <FolderOpen className="h-4 w-4" />;
      case "task":
        return <ListTodo className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Get context color
  const getContextColor = (contextType?: string) => {
    switch (contextType) {
      case "suggestion":
        return "text-yellow-600 bg-yellow-50";
      case "project":
        return "text-blue-600 bg-blue-50";
      case "task":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Message List */}
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <InboxIcon className="h-5 w-5" />
              Inbox
            </h2>
            {unreadMessages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-5 mx-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="project">Projects</TabsTrigger>
            <TabsTrigger value="task">Tasks</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No messages found
                </div>
              ) : (
                filteredMessages.map((message: Message) => (
                  <Card
                    key={message.id}
                    className={`mb-2 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? "bg-blue-50 border-blue-300"
                        : "hover:bg-gray-50"
                    } ${!message.read ? "border-l-4 border-l-blue-500" : ""}`}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.senderName?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {message.senderName || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(message.createdAt),
                                { addSuffix: true },
                              )}
                            </p>
                          </div>
                        </div>
                        {!message.read && (
                          <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />
                        )}
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {message.editedContent || message.content}
                      </p>

                      {message.contextType && (
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getContextColor(message.contextType)}`}
                        >
                          {getContextIcon(message.contextType)}
                          <span>
                            {message.contextTitle || message.contextType}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Message Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedMessage.senderName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedMessage.senderName || "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(
                        new Date(selectedMessage.createdAt),
                        { addSuffix: true },
                      )}
                      {selectedMessage.editedAt && " (edited)"}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      Star
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {selectedMessage.contextType && (
                <div className="mt-2">
                  <Badge variant="secondary" className="gap-1">
                    {getContextIcon(selectedMessage.contextType)}
                    {selectedMessage.contextTitle ||
                      selectedMessage.contextType}
                  </Badge>
                </div>
              )}
            </div>

            {/* Thread Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Original Message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedMessage.editedContent || selectedMessage.content}
                  </p>
                </div>

                {/* Thread Replies */}
                {threadMessages
                  .filter((m) => m.id !== selectedMessage.id)
                  .map((message: Message) => (
                    <div
                      key={message.id}
                      className={`rounded-lg p-4 ${
                        message.senderId === user?.id
                          ? "bg-blue-50 ml-auto max-w-[80%]"
                          : "bg-gray-50 mr-auto max-w-[80%]"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-sm">
                          {message.senderName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.editedContent || message.content}
                      </p>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            {/* Reply Box */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleReply()
                  }
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <InboxIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a message to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
