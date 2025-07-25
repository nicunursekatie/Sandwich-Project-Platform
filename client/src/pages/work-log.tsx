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
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Debug info - minimized and subtle */}
      <div className="text-xs text-gray-400 px-2">
        Debug: {safelogs.length} logs loaded • User: {user?.email}
      </div>

      {canCreateLogs && (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Log Your Work</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => {
                e.preventDefault();
                createLog.mutate();
              }}
              className="space-y-4"
            >
              {/* Date field - compact styling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Date</label>
                <Input
                  type="date"
                  value={workDate}
                  onChange={e => setWorkDate(e.target.value)}
                  required
                  className="w-full sm:w-48"
                />
              </div>

              {/* Work description - properly sized */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Description</label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you worked on..."
                  required
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Time input - grouped visually as one unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Spent</label>
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={hours}
                      onChange={e => setHours(Number(e.target.value))}
                      placeholder="0"
                      required
                      className="w-16 text-center bg-white"
                    />
                    <span className="text-sm text-gray-600 font-medium">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      value={minutes}
                      onChange={e => setMinutes(Number(e.target.value))}
                      placeholder="0"
                      required
                      className="w-16 text-center bg-white"
                    />
                    <span className="text-sm text-gray-600 font-medium">minutes</span>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={createLog.isPending}
                  className="bg-[#FBAD3F] hover:bg-[#f09f2b] text-white font-medium px-6"
                >
                  {createLog.isPending ? "Logging..." : "Log Work"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Work Logs List - improved with better visual separation */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {canViewAllLogs ? "All Work Logs" : "My Work Logs"}
            </CardTitle>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="text-xs">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="py-8 text-center text-gray-500">
              Loading work logs...
            </div>
          )}
          
          {error && (
            <div className="py-8 text-center">
              <div className="text-red-600 font-medium">Error loading logs</div>
              <div className="text-sm text-gray-500 mt-1">{error.message}</div>
            </div>
          )}
          
          {!isLoading && !error && (
            <div className="space-y-4">
              {safelogs.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No work logs found. Start by logging your first work session above.
                </div>
              )}
              
              {safelogs.map((log: any) => (
                <div 
                  key={log?.id || Math.random()} 
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                >
                  {/* Main work description - emphasized */}
                  <div className="text-gray-900 font-medium leading-relaxed">
                    {log.description}
                  </div>
                  
                  {/* Metadata row - secondary information */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium text-[#FBAD3F]">
                        {log.hours}h {log.minutes}m
                      </span>
                      <span>
                        {log.workDate ? new Date(log.workDate).toLocaleDateString() : new Date(log.createdAt).toLocaleDateString()}
                      </span>
                      {log?.userId !== (user as any)?.id && (
                        <span className="text-blue-600 text-xs px-2 py-1 bg-blue-50 rounded-full">
                          Other user
                        </span>
                      )}
                    </div>
                    
                    {/* Delete button - subtle and less aggressive */}
                    {((canDeleteOwnLogs && log?.userId === (user as any)?.id) || canDeleteAllLogs) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLog.mutate(log?.id)}
                        disabled={deleteLog.isPending}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs px-2 py-1"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 