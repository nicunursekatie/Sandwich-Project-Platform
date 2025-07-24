import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface SendKudosButtonProps {
  recipientId: string;
  recipientName?: string;
  contextType: "project" | "task";
  contextId: string;
  entityName: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

export function SendKudosButton({
  recipientId,
  recipientName,
  contextType,
  contextId,
  entityName,
  className,
  size = "sm",
}: SendKudosButtonProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [kudosSent, setKudosSent] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  // Check if kudos already sent on mount
  useEffect(() => {
    if (!user?.id || !recipientId) return;

    const checkKudosStatus = async () => {
      try {
        const response = await apiRequest(
          "GET",
          `/api/messaging/kudos/check?recipientId=${recipientId}&contextType=${contextType}&contextId=${contextId}`
        );
        setKudosSent(response.sent);
      } catch (error) {
        console.error("Failed to check kudos status:", error);
      }
    };

    checkKudosStatus();
  }, [user?.id, recipientId, contextType, contextId]);

  const handleSendKudos = async () => {
    if (!user?.id) {
      toast({
        title: "Not authenticated",
        description: "Please log in to send kudos",
        variant: "destructive",
      });
      return;
    }

    if (user.id === recipientId) {
      toast({
        title: "Cannot send kudos to yourself",
        description: "Kudos are meant for others!",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const content = customMessage.trim() 
        ? `🎉 ${customMessage}`
        : `🎉 Kudos! Great job completing ${entityName}!`;

      const response = await apiRequest("POST", "/api/messaging/kudos", {
        recipientId,
        contextType,
        contextId,
        entityName,
        content,
      });

      if (response.alreadySent) {
        toast({
          title: "Kudos already sent",
          description: "You've already sent kudos for this achievement",
        });
      } else {
        toast({
          title: "Kudos sent! 🎉",
          description: `Your appreciation has been sent to ${recipientName || "the user"}`,
        });
        setKudosSent(true);
      }
      
      setShowDialog(false);
      setCustomMessage("");
    } catch (error: any) {
      if (error.status === 409) {
        toast({
          title: "Kudos already sent",
          description: "You've already sent kudos for this achievement",
        });
        setKudosSent(true);
      } else {
        toast({
          title: "Failed to send kudos",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  // Don't show button if user is the recipient
  if (user?.id === recipientId) {
    return null;
  }

  return (
    <>
      <Button
        variant={kudosSent ? "secondary" : "outline"}
        size={size}
        className={className}
        onClick={() => setShowDialog(true)}
        disabled={kudosSent || isSending}
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Heart className={`h-4 w-4 ${kudosSent ? "fill-current" : ""}`} />
            <span className="ml-2">
              {kudosSent ? "Kudos Sent" : "Send Kudos"}
            </span>
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Kudos 🎉</DialogTitle>
            <DialogDescription>
              Send a congratulatory message to {recipientName || "the user"} for completing {entityName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder={`Great job completing ${entityName}! (optional custom message)`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Leave blank for default message or write your own
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendKudos} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Send Kudos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}