import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SimpleCongratulation {
  id: number;
  projectId: number;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

interface SimpleCongratulationsProps {
  projectId: number;
  projectTitle: string;
  currentUser: any;
  isCompleted: boolean;
}

export default function SimpleCongratulations({
  projectId,
  projectTitle,
  currentUser,
  isCompleted
}: SimpleCongratulationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: congratulations = [] } = useQuery<SimpleCongratulation[]>({
    queryKey: [`/api/projects/${projectId}/simple-congratulations`],
    enabled: isCompleted,
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${projectId}/simple-congratulations`);
      return response;
    }
  });

  const sendCongratulationMutation = useMutation({
    mutationFn: async (congratulationData: { message: string }) => {
      return apiRequest('POST', `/api/projects/${projectId}/simple-congratulations`, {
        message: congratulationData.message,
        userId: currentUser?.id,
        userName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.email || 'Team Member'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/simple-congratulations`] });
      toast({
        title: "Congratulations sent!",
        description: "Your message has been added to the project celebration",
      });
      setMessage('');
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error sending congratulations",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSending(false);
    }
  });

  const handleSendCongratulations = () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    sendCongratulationMutation.mutate({ message });
  };

  if (!isCompleted) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Trophy className="w-5 h-5" />
          Project Completed!
        </CardTitle>
        <CardDescription className="text-green-700">
          {congratulations.length > 0 
            ? `${congratulations.length} team ${congratulations.length === 1 ? 'member has' : 'members have'} congratulated this achievement`
            : 'Be the first to congratulate this achievement'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display existing congratulations */}
        {congratulations.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {congratulations.map((congrats) => (
              <div key={congrats.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-green-800">
                      {congrats.userName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(congrats.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 break-words">
                    {congrats.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add congratulations button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Send Congratulations
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Congratulate the Team</DialogTitle>
              <DialogDescription>
                Send a congratulations message to celebrate this completed project.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Send a congratulatory message for completing "{projectTitle}"
                </p>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Great work on completing this project! 🎉"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCongratulations}
                  disabled={!message.trim() || isSending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSending ? 'Sending...' : 'Send Congratulations'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}