import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Users, MessageCircle, Hash, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  committee: string;
  parentId: number | null;
  threadId: number | null;
  replyCount: number;
}

const committees = [
  { 
    id: "general", 
    name: "General Chat", 
    description: "Main team communication",
    color: "bg-blue-100 text-blue-800",
    icon: MessageCircle
  },
  { 
    id: "marketing_committee", 
    name: "Marketing Committee", 
    description: "Marketing campaigns and promotions",
    color: "bg-purple-100 text-purple-800",
    icon: Users
  },
  { 
    id: "grant_committee", 
    name: "Grant Committee", 
    description: "Grant applications and funding",
    color: "bg-green-100 text-green-800",
    icon: Users
  },
  { 
    id: "hosts", 
    name: "Hosts", 
    description: "Event hosting coordination",
    color: "bg-orange-100 text-orange-800",
    icon: Users
  },
  { 
    id: "group_events", 
    name: "Group Events", 
    description: "Team events and activities",
    color: "bg-red-100 text-red-800",
    icon: Users
  }
];

export default function CommitteeChat() {
  const { toast } = useToast();
  const [selectedCommittee, setSelectedCommittee] = useState("general");
  const [newMessage, setNewMessage] = useState("");

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages', selectedCommittee],
    queryFn: () => fetch(`/api/messages?committee=${selectedCommittee}`).then(res => res.json())
  });

  const createMessageMutation = useMutation({
    mutationFn: async (data: { content: string; committee: string }) => {
      return apiRequest('/api/messages', 'POST', {
        content: data.content,
        sender: "John Doe", // This would come from auth
        committee: data.committee
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedCommittee] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been posted to the committee chat.",
      });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest(`/api/messages/${messageId}`, 'DELETE');
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidate all message queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.refetchQueries({ queryKey: ['/api/messages', selectedCommittee] });
      toast({
        title: "Message deleted",
        description: "The message has been removed from the chat.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    createMessageMutation.mutate({
      content: newMessage,
      committee: selectedCommittee
    });
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: Date) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const selectedCommitteeInfo = committees.find(c => c.id === selectedCommittee);
  const Icon = selectedCommitteeInfo?.icon || MessageCircle;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading committee chat...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Committee Chat</h1>
          <p className="text-slate-600">Collaborate with your team committees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Committee Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Committees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {committees.map((committee) => {
                const CommitteeIcon = committee.icon;
                return (
                  <button
                    key={committee.id}
                    onClick={() => setSelectedCommittee(committee.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedCommittee === committee.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CommitteeIcon className="w-5 h-5 text-slate-600" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {committee.name}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {committee.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-slate-600" />
                <div>
                  <CardTitle>{selectedCommitteeInfo?.name}</CardTitle>
                  <p className="text-sm text-slate-600">{selectedCommitteeInfo?.description}</p>
                </div>
                <Badge className={selectedCommitteeInfo?.color}>
                  {messages.length} messages
                </Badge>
              </div>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No messages yet in this committee.</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message: Message) => (
                  <div key={message.id} className="flex gap-3 group hover:bg-slate-50 -mx-2 px-2 py-2 rounded relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900">{message.sender}</span>
                        <span className="text-xs text-slate-500">
                          {formatTime(message.timestamp)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <div className="text-slate-700 break-words">
                        {message.content}
                      </div>
                    </div>
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessageMutation.mutate(message.id)}
                        disabled={deleteMessageMutation.isPending}
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedCommitteeInfo?.name}...`}
                  className="flex-1"
                  disabled={createMessageMutation.isPending}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || createMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}