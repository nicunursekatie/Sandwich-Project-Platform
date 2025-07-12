import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Lightbulb,
  FolderOpen,
  ListTodo,
  MessageCircle,
  X,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
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
  contextType,
  contextId,
  contextTitle,
  defaultRecipients = [],
  onSent,
  onCancel,
  compact = false,
}: MessageComposerProps) {
  const { sendMessage, isSending } = useMessaging();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] =
    useState<Array<{ id: string; name: string }>>(defaultRecipients);
  const [recipientSearchOpen, setRecipientSearchOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");

  // Fetch users for recipient selection
  const { data: allUsers = [], isError: usersError } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/users");
        return Array.isArray(response) ? response : [];
      } catch (error: any) {
        // If user doesn't have permission to view users, show a helpful message
        if (error.status === 403) {
          console.warn("User doesn't have permission to view all users for messaging");
        }
        console.error("Failed to fetch users:", error);
        return [];
      }
    },
    retry: false, // Don't retry if there's a permission error
  });

  // Filter users based on search query
  const users = allUsers.filter((user: any) => {
    // Show all users when search is empty or show filtered results
    if (!recipientSearch) return true;
    const searchLower = recipientSearch.toLowerCase();
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return (
      name.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 10); // Limit to 10 results to avoid overwhelming the UI

  // Helper function to get user display name
  const getUserDisplayName = (user: any) => {
    if (user.displayName) return user.displayName;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.email || 'Unknown User';
  };

  const handleSend = async () => {
    if (!content.trim()) {
      toast({
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage({
        recipientIds: selectedRecipients.map((r) => r.id),
        content: content.trim(),
        contextType,
        contextId,
      });

      setContent("");
      setSelectedRecipients(defaultRecipients);
      onSent?.();

      toast({
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const removeRecipient = (id: string) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const addRecipient = (user: { id: string; name: string }) => {
    if (!selectedRecipients.find((r) => r.id === user.id)) {
      setSelectedRecipients((prev) => [...prev, user]);
    }
    setRecipientSearchOpen(false);
    setRecipientSearch("");
  };

  const getContextIcon = () => {
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

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Label className="text-sm">To:</Label>
          {selectedRecipients.map((recipient) => (
            <Badge key={recipient.id} variant="secondary" className="gap-1">
              {recipient.name}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeRecipient(recipient.id)}
              />
            </Badge>
          ))}
          <Popover
            open={recipientSearchOpen}
            onOpenChange={setRecipientSearchOpen}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Add recipient
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search users..."
                  value={recipientSearch}
                  onValueChange={setRecipientSearch}
                />
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user: any) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() =>
                        addRecipient({ id: user.id, name: getUserDisplayName(user) })
                      }
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          {getUserDisplayName(user)?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{getUserDisplayName(user)}</span>
                      {user.email && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({user.email})
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Textarea
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />

        <div className="flex justify-between items-center">
          {contextType && contextTitle && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getContextIcon()}
              <span>{contextTitle}</span>
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSend}
              disabled={
                isSending || !content.trim() || selectedRecipients.length === 0
              }
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getContextIcon()}
          Send Message
          {contextType && contextTitle && (
            <Badge variant="secondary" className="ml-auto">
              {contextTitle}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedRecipients.map((recipient) => (
              <Badge key={recipient.id} variant="secondary" className="gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {recipient.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                {recipient.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeRecipient(recipient.id)}
                />
              </Badge>
            ))}
          </div>
          <Popover
            open={recipientSearchOpen}
            onOpenChange={setRecipientSearchOpen}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Add recipients...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search users by name or email..."
                  value={recipientSearch}
                  onValueChange={setRecipientSearch}
                />
                <CommandEmpty>No users found.</CommandEmpty>
                <CommandGroup>
                  {users.map((user: any) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() =>
                        addRecipient({ id: user.id, name: getUserDisplayName(user) })
                      }
                      className="cursor-pointer"
                    >
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>
                          {getUserDisplayName(user)?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{getUserDisplayName(user)}</p>
                        {user.email && (
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            placeholder="Type your message here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="resize-none"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSend}
          disabled={
            isSending || !content.trim() || selectedRecipients.length === 0
          }
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
