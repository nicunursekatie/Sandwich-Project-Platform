import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, Star, Trophy, Sparkles, Target } from "lucide-react";

interface SendKudosButtonProps {
  recipientId: string;
  recipientName: string;
  contextType: "project" | "task";
  contextId: string;
  contextTitle: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline";
}

export default function SendKudosButton({
  recipientId,
  recipientName,
  contextType,
  contextId,
  contextTitle,
  className = "",
  size = "sm",
  variant = "outline"
}: SendKudosButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasSentKudos, setHasSentKudos] = useState(false);

  const sendKudosMutation = useMutation({
    mutationFn: async () => {
      const kudosMessage = generateKudosMessage(recipientName, contextType, contextTitle);
      
      return await apiRequest('POST', '/api/messages', {
        recipientId,
        subject: `Kudos for ${contextTitle}!`,
        content: kudosMessage,
        contextType,
        contextId,
        contextTitle
      });
    },
    onSuccess: () => {
      setHasSentKudos(true);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        description: `Kudos sent to ${recipientName}!`,
        duration: 3000
      });
    },
    onError: () => {
      toast({
        description: "Failed to send kudos",
        variant: "destructive"
      });
    }
  });

  const generateKudosMessage = (name: string, type: string, title: string) => {
    const messages = [
      `🎉 Fantastic work on ${title}, ${name}! Your dedication really shows.`,
      `⭐ Great job completing ${title}! Thanks for your excellent contribution.`,
      `🏆 Outstanding work on ${title}, ${name}! Keep up the amazing effort.`,
      `✨ Excellent completion of ${title}! Your work makes a real difference.`,
      `🎯 Awesome job with ${title}, ${name}! Thanks for being such a valuable team member.`,
      `🌟 Brilliant work on ${title}! Your contribution is truly appreciated.`,
      `🚀 Amazing job completing ${title}, ${name}! Your effort doesn't go unnoticed.`,
      `💫 Wonderful work on ${title}! Thanks for your commitment to excellence.`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getRandomIcon = () => {
    const icons = [Heart, Star, Trophy, Sparkles, Target];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent className="h-3 w-3" />;
  };

  if (!user || (user as any).id === recipientId) {
    return null; // Don't show kudos button for yourself
  }

  if (hasSentKudos) {
    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        <Heart className="h-3 w-3 fill-red-400 text-red-400" />
        Kudos Sent
      </Badge>
    );
  }

  return (
    <Button
      onClick={() => sendKudosMutation.mutate()}
      disabled={sendKudosMutation.isPending}
      size={size}
      variant={variant}
      className={`gap-1 ${className}`}
    >
      {sendKudosMutation.isPending ? (
        <>
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
          Sending...
        </>
      ) : (
        <>
          {getRandomIcon()}
          Send Kudos
        </>
      )}
    </Button>
  );
}