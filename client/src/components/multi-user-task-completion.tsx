import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SendKudosButton } from "@/components/send-kudos-button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Circle, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TaskCompletion {
  id: number;
  taskId: number;
  userId: string;
  userName: string;
  completedAt: string;
  notes?: string;
}

interface MultiUserTaskCompletionProps {
  taskId: number;
  projectId: number;
  assigneeIds: string[];
  assigneeNames: string[];
  currentUserId?: string;
  currentUserName?: string;
  taskStatus: string;
  onStatusChange?: (isCompleted: boolean) => void;
}

export function MultiUserTaskCompletion({
  taskId,
  projectId,
  assigneeIds,
  assigneeNames,
  currentUserId,
  currentUserName,
  taskStatus,
  onStatusChange
}: MultiUserTaskCompletionProps) {
  const [notes, setNotes] = useState("");
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch task completions
  const { data: completionsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/tasks', taskId, 'completions'],
    enabled: !!taskId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Prevent automatic refetch on window focus
    queryFn: async () => {
      const data = await apiRequest('GET', `/api/tasks/${taskId}/completions`);
      // apiRequest already returns parsed data, no need to call .json()
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    }
  });

  // completionsData is now properly parsed JSON array from queryFn
  const completions = completionsData || [];



  // Mark task complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (completionNotes: string) => {
      return apiRequest('POST', `/api/tasks/${taskId}/complete`, {
        notes: completionNotes
      });
    },
    onSuccess: (data) => {
      // Only invalidate the specific task completions - avoid excessive invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      
      setShowCompletionDialog(false);
      setNotes("");
      
      if (data.isFullyCompleted) {
        toast({
          title: "Task Fully Completed! 🎉",
          description: "All team members have completed this task - task automatically marked complete"
        });
        onStatusChange?.(true);
      } else {
        const completedCount = (completions.length || 0) + 1; // Add 1 for the just-completed task
        const totalCount = assigneeIds.length;
        toast({
          title: "Your portion completed",
          description: `${completedCount}/${totalCount} team members finished`
        });
        onStatusChange?.(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark task complete",
        variant: "destructive"
      });
    }
  });

  // Remove completion mutation
  const removeCompletionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/tasks/${taskId}/complete`);
    },
    onSuccess: () => {
      // Only invalidate the specific task completions - avoid excessive invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId, 'completions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      
      toast({
        title: "Completion removed",
        description: "Your completion has been removed from this task"
      });
      onStatusChange?.(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove completion",
        variant: "destructive"
      });
    }
  });

  const handleMarkComplete = () => {
    markCompleteMutation.mutate(notes);
  };

  const handleRemoveCompletion = () => {
    removeCompletionMutation.mutate();
  };



  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading completion status...</div>;
  }

  const currentUserCompletion = (completions || []).find(
    (c: TaskCompletion) => c.userId === currentUserId
  );
  const isCurrentUserCompleted = !!currentUserCompletion;
  const completedCount = (completions || []).length;
  const totalAssignees = (assigneeIds || []).length;
  const isFullyCompleted = completedCount >= totalAssignees;
  
  // Team progress calculation is working properly

  // Show assignee completion status
  const getAssigneeStatus = (assigneeId: string, assigneeName: string) => {
    // Check if this is the current user first
    const isCurrentUser = assigneeId === currentUserId;
    
    // Match completion by user ID (assigneeId is actually a user ID from the assigneeIds array)
    const completion = (completions || []).find((c: TaskCompletion) => {
      return c.userId === assigneeId;
    });
    const isCompleted = !!completion;

    return (
      <div key={assigneeId} className="flex items-center gap-2">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <Circle className="w-4 h-4 text-gray-400" />
        )}
        <span className={`text-sm ${isCurrentUser ? 'font-medium' : ''} ${isCompleted ? 'line-through text-gray-500' : ''}`}>
          {assigneeName}
          {isCurrentUser && ' (You)'}
        </span>
        {isCompleted && (
          <>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              ✓ Done
            </Badge>
            {/* Add kudos button for completed assignees */}
            {!isCurrentUser && (
              <SendKudosButton
                recipientId={assigneeId}
                recipientName={assigneeName}
                contextType="task"
                contextId={taskId.toString()}
                entityName={`task completion`}
                size="sm"
                className="ml-2"
              />
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Overall completion status */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium">
          Team Progress: {completions?.length || 0}/{totalAssignees || 0}
        </span>
        {isFullyCompleted && (
          <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold">
            ✓ Fully Complete
          </Badge>
        )}
      </div>

      {/* Individual assignee status */}
      <div className="space-y-2">
        {assigneeIds && assigneeIds.length > 0 ? (
          assigneeIds.map((assigneeId, index) => 
            getAssigneeStatus(assigneeId, assigneeNames[index] || 'Unknown User')
          )
        ) : (
          <div className="text-sm text-gray-500">No assignees found</div>
        )}
      </div>

      {/* Current user actions */}
      {currentUserId && assigneeIds.includes(currentUserId) && (
        <div className="pt-2 border-t">
          {isCurrentUserCompleted ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveCompletion}
                disabled={removeCompletionMutation.isPending}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Circle className="w-4 h-4 mr-2" />
                {removeCompletionMutation.isPending ? "Removing..." : "Mark Incomplete"}
              </Button>
              <div className="text-xs text-gray-500">
                Completed {new Date(currentUserCompletion.completedAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark My Portion Complete
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle>Complete Your Portion</DialogTitle>
                  <DialogDescription>
                    Add notes about your completion of this task portion.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="completion-notes">Notes (Optional)</Label>
                    <Textarea
                      id="completion-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any notes about your completion..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCompletionDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markCompleteMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {markCompleteMutation.isPending ? "Marking Complete..." : "Complete"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Show completion notes if any */}
      {completions.length > 0 && (
        <div className="text-xs text-gray-500">
          <Clock className="w-3 h-3 inline mr-1" />
          Last activity: {new Date(Math.max(...completions.map((c: TaskCompletion) => new Date(c.completedAt).getTime()))).toLocaleString()}
        </div>
      )}
    </div>
  );
}