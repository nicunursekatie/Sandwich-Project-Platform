import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";

export default function WorkLogPage() {
  const { user } = useAuth();

  // Check permissions
  const canCreateLogs = hasPermission(user, PERMISSIONS.CREATE_WORK_LOGS);
  const canEditOwnLogs = hasPermission(user, PERMISSIONS.EDIT_OWN_WORK_LOGS);
  const canDeleteOwnLogs = hasPermission(user, PERMISSIONS.DELETE_OWN_WORK_LOGS);
  const canViewAllLogs = hasPermission(user, PERMISSIONS.VIEW_ALL_WORK_LOGS);
  const canEditAllLogs = hasPermission(user, PERMISSIONS.EDIT_ALL_WORK_LOGS);
  const canDeleteAllLogs = hasPermission(user, PERMISSIONS.DELETE_ALL_WORK_LOGS);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [workDate, setWorkDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { data: logs = [], refetch, isLoading, error } = useQuery({
    queryKey: ["/api/work-logs"],
    queryFn: async () => {
      console.log("🚀 Work logs query function called");
      const data = await apiRequest("GET", "/api/work-logs");
      console.log("🚀 Work logs API response data:", data);
      return data;
    },
    enabled: !!user, // Only fetch when user is authenticated
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache results (TanStack Query v5 uses gcTime instead of cacheTime)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Ensure logs is always an array
  const safelogs = Array.isArray(logs) ? logs : [];

  const createLog = useMutation({
    mutationFn: async () => {
      const data = await apiRequest("POST", "/api/work-logs", { 
        description, 
        hours, 
        minutes,
        workDate: workDate + "T12:00:00.000Z" // Add time component for proper date parsing
      });
      return data;
    },
    onSuccess: () => {
      setDescription("");
      setHours(0);
      setMinutes(0);
      setWorkDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs"] });
      refetch(); // Force refetch to update the list immediately
    },
  });

  const deleteLog = useMutation({
    mutationFn: async (id: number) => {
      const data = await apiRequest("DELETE", `/api/work-logs/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs"] });
      refetch(); // Force refetch to update the list immediately
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      {canCreateLogs && (
        <Card>
          <CardHeader>
            <CardTitle>Log Your Work</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => {
                e.preventDefault();
                createLog.mutate();
              }}
              className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Date</label>
              <Input
                type="date"
                value={workDate}
                onChange={e => setWorkDate(e.target.value)}
                required
              />
            </div>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your work..."
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <Input
                  type="number"
                  min={0}
                  value={hours}
                  onChange={e => setHours(Number(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={e => setMinutes(Number(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={createLog.isPending}>
              {createLog.isPending ? "Logging..." : "Log Work"}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {canViewAllLogs ? "All Work Logs" : "My Work Logs"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="py-4 text-gray-500">Loading work logs...</div>}
            {error && <div className="py-4 text-red-500">Error loading logs: {error.message}</div>}
            <div className="py-2 text-xs text-gray-400">
              Debug: User ID: {user?.id}, Logs count: {safelogs.length}, Loading: {isLoading ? 'yes' : 'no'}, Error: {error?.message || 'none'}
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mb-2">
              Refresh Logs
            </Button>
            {!isLoading && !error && (
              <ul className="divide-y">
                {safelogs.length === 0 && <li className="py-4 text-gray-500">No logs yet.</li>}
                {safelogs.map((log: any) => (
                <li key={log.id} className="py-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{log.description}</div>
                    <div className="text-sm text-gray-500">
                      {log.hours}h {log.minutes}m &middot; Work Date: {log.workDate ? new Date(log.workDate).toLocaleDateString() : new Date(log.createdAt).toLocaleDateString()}
                      {log.userId !== user?.id && <span className="ml-2 text-blue-600">(by other user)</span>}
                    </div>
                  </div>
                  {((canDeleteOwnLogs && log.userId === user?.id) || canDeleteAllLogs) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteLog.mutate(log.id)}
                      disabled={deleteLog.isPending}
                    >
                      Delete
                    </Button>
                  )}
                </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 