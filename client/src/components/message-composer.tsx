import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMessaging } from "@/hooks/useMessaging";
import { Send, X, User, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

interface MessageComposerProps {
  contextType?: "suggestion" | "project" | "task" | "direct";
  contextId?: string;
  contextTitle?: string;
  defaultRecipients?: Array<{ id: string; name: string; email?: string }>;
  onSent?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function MessageComposer({
  contextType = "direct",
  contextId,
  contextTitle,
  onSent,
  onCancel,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const { toast } = useToast();
  const { sendMessage, isSending } = useMessaging();
  const queryClient = useQueryClient();

  // Fetch all users for direct messaging
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/users');
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: contextType === 'direct',
  });

  const handleSend = async () => {
    if (!content.trim()) {
      toast({ 
        title: "Message content required", 
        description: "Please enter a message", 
        variant: "destructive" 
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({ 
        title: "Recipients required", 
        description: "Please select at least one recipient", 
        variant: "destructive" 
      });
      return;
    }

    console.log('Sending message:', {
      recipientIds: selectedRecipients,
      content: content.trim(),
      contextType,
      contextId,
      recipientCount: selectedRecipients.length
    });

    try {
      await sendMessage({
        recipientIds: selectedRecipients,
        content: content.trim(),
        contextType,
        contextId,
      });

      setContent("");
      setSelectedRecipients([]);
      onSent?.();

      toast({
        description: "Message sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] }); // Refresh messages
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({ 
        title: "Failed to send message", 
        description: error instanceof Error ? error.message : "Please try again", 
        variant: "destructive" 
      });
    }
  };
return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Compose Message
            {contextType !== "direct" && contextTitle && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                to {contextTitle}
              </span>
            )}
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {contextType !== "direct" && (
          <Badge variant="secondary" className="w-fit">
            {contextType.charAt(0).toUpperCase() + contextType.slice(1)} Message
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {contextType === "direct" && (
          <div>
            <label className="text-sm font-medium">Recipients</label>
            {isLoadingUsers ? (
              <div className="text-sm text-gray-500 mt-1">Loading users...</div>
            ) : (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                {users.length === 0 ? (
                  <div className="text-sm text-gray-500">No users available</div>
                ) : (
                  users.map((user: any) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={selectedRecipients.includes(user.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRecipients([...selectedRecipients, user.id]);
                          } else {
                            setSelectedRecipients(selectedRecipients.filter(id => id !== user.id));
                          }
                        }}
                      />
                      <label htmlFor={user.id} className="text-sm cursor-pointer">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email}
                        {user.email && user.firstName && (
                          <span className="text-gray-500 ml-1">({user.email})</span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
            {selectedRecipients.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium">Selected:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedRecipients.map(recipientId => {
                    const user = users.find((u: any) => u.id === recipientId);
                    return user ? (
                      <Badge key={recipientId} variant="outline" className="text-xs">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.email}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Message</label>
          <Textarea
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isSending || (contextType === "direct" && selectedRecipients.length === 0)}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}