import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, Hash, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { insertMessageSchema, type Message } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";

const messageFormSchema = insertMessageSchema.extend({
  sender: insertMessageSchema.shape.sender.default("Team Member")
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function MessageLog() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"]
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      sender: "Team Member",
      content: ""
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      form.reset({
        sender: form.getValues("sender"),
        content: ""
      });
      toast({
        title: "Message sent",
        description: "Your message has been added to the team chat."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  const formatMessageTime = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    
    // Show time for today, date for older
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };



  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header - Slack style */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center">
        <Hash className="w-4 h-4 text-slate-500 mr-2" />
        <h2 className="text-lg font-bold text-slate-900">team-chat</h2>
        <div className="ml-auto text-xs text-slate-500">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </div>
      </div>

      {/* Chat Messages - Slack style */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mb-4" />
            <div className="text-xl font-bold text-slate-900 mb-2">Welcome to #team-chat</div>
            <div className="text-slate-600 max-w-md">
              This is the beginning of your team conversation. Share updates, coordinate projects, and stay connected.
            </div>
          </div>
        )}
        
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const isSameSender = prevMessage?.sender === message.sender;
          const timeDiff = prevMessage ? 
            new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() : 
            Number.MAX_SAFE_INTEGER;
          const shouldShowAvatar = !isSameSender || timeDiff > 300000; // 5 minutes

          return (
            <div key={message.id} className={`group hover:bg-slate-50 px-2 py-1 rounded ${shouldShowAvatar ? 'mt-4' : 'mt-0.5'}`}>
              <div className="flex items-start">
                {shouldShowAvatar ? (
                  <Avatar className={`w-9 h-9 mr-3 ${getAvatarColor(message.sender)}`}>
                    <AvatarFallback className="text-white text-sm font-medium">
                      {getInitials(message.sender)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-9 mr-3 flex items-center justify-center">
                    <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {shouldShowAvatar && (
                    <div className="flex items-baseline mb-1">
                      <span className="font-bold text-slate-900 text-sm mr-2">
                        {message.sender}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className="text-slate-800 text-sm leading-relaxed break-words">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Slack style */}
      <div className="border-t border-slate-200 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="sender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Display name"
                      {...field}
                      className="text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Message #team-chat"
                          {...field}
                          className="pr-10 resize-none border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                        />
                        <Button 
                          type="submit" 
                          disabled={sendMessageMutation.isPending || !form.watch("content").trim()}
                          size="sm"
                          className="absolute right-1 top-1 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
