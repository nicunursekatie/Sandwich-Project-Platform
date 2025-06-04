import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"]
  });

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

  const formatTimeAgo = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "1d ago";
    return `${Math.floor(diffInHours / 24)}d ago`;
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
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <MessageCircle className="text-blue-500 mr-2 w-5 h-5" />
          Team Chat
        </h2>
        <span className="text-sm text-slate-500">{messages.length} messages</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-900 text-sm">{message.sender}</span>
              <span className="text-xs text-slate-500">{formatTimeAgo(message.timestamp)}</span>
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2 max-w-lg">
              <p className="text-slate-700">{message.content}</p>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No messages yet. Start the conversation!
          </div>
        )}
      </div>

      {/* Message Input */}
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
                      placeholder="Your name"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Type your message..."
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={sendMessageMutation.isPending || !form.watch("content").trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
