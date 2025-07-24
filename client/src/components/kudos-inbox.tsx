import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface KudosMessage {
  id: number;
  content: string;
  sender: string;
  senderName: string;
  contextType: "task" | "project";
  contextId: string;
  entityName: string;
  createdAt: string;
  read: boolean;
}

export function KudosInbox() {
  const { user } = useAuth();

  const { data: kudosMessages = [], isLoading } = useQuery({
    queryKey: ['/api/messaging/kudos/received'],
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds for new kudos
  });

  const unreadCount = kudosMessages.filter((k: KudosMessage) => !k.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (kudosMessages.length === 0) {
    return (
      <div className="text-center p-8">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No kudos yet</h3>
        <p className="text-gray-500">
          When team members send you appreciation for your work, it will appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Your Kudos ({kudosMessages.length})
          </h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-red-500">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </div>

      {/* Kudos list */}
      <div className="space-y-3">
        {kudosMessages.map((kudos: KudosMessage) => (
          <Card 
            key={kudos.id} 
            className={`transition-all duration-200 ${
              !kudos.read 
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-md' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon based on context */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  !kudos.read ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {kudos.contextType === 'task' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        From {kudos.senderName}
                      </p>
                      <p className="text-gray-700 mb-2">{kudos.content}</p>
                      
                      {/* Context info */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs">
                          {kudos.contextType === 'task' ? 'Task' : 'Project'}
                        </Badge>
                        <span>"{kudos.entityName}"</span>
                      </div>
                    </div>

                    {/* Timestamp and status */}
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(kudos.createdAt), { addSuffix: true })}
                      </div>
                      {!kudos.read && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}