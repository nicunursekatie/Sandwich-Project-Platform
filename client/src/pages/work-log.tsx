import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Lock, Eye, Globe } from "lucide-react";

export default function WorkLogPage() {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [visibility, setVisibility] = useState("private");
  const [sharedWith, setSharedWith] = useState<string[]>([]);

  const { data: logs = [], refetch, isLoading, error } = useQuery({
    queryKey: ["/api/work-logs"],
    queryFn: () => apiRequest("GET", "/api/work-logs"),
  });

  // Ensure logs is always an array
  const safelogs = Array.isArray(logs) ? logs : [];

  const createLog = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/work-logs", { 
        description, 
        hours, 
        minutes, 
        visibility, 
        sharedWith 
      });
    },
    onSuccess: () => {
      setDescription("");
      setHours(0);
      setMinutes(0);
      setVisibility("private");
      setSharedWith([]);
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs"] });
    },
  });

  const deleteLog = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/work-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs"] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
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
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your work..."
              required
            />
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                value={hours}
                onChange={e => setHours(Number(e.target.value))}
                placeholder="Hours"
                required
              />
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                placeholder="Minutes"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Who can see this work log?</label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Private (Only me)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="team">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Team (My team members)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="department">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>Department (Same department)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Public (Everyone)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {visibility !== "private" && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {visibility === "team" && <><Users className="w-3 h-3" /> Visible to your team members</>}
                  {visibility === "department" && <><Eye className="w-3 h-3" /> Visible to your department</>}
                  {visibility === "public" && <><Globe className="w-3 h-3" /> Visible to all users</>}
                </div>
              )}
            </div>

            <Button type="submit" disabled={createLog.isPending}>
              {createLog.isPending ? "Logging..." : "Log Work"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>My Work Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <div className="py-4 text-gray-500">Loading work logs...</div>}
            {error && <div className="py-4 text-red-500">Error loading logs: {error.message}</div>}
            {!isLoading && !error && (
              <ul className="divide-y">
                {safelogs.length === 0 && <li className="py-4 text-gray-500">No logs yet.</li>}
                {safelogs.map((log: any) => (
                <li key={log.id} className="py-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium">{log.description}</div>
                      <div className="flex items-center gap-1">
                        {log.visibility === "private" && <Badge variant="secondary" className="text-xs"><Lock className="w-3 h-3 mr-1" />Private</Badge>}
                        {log.visibility === "team" && <Badge variant="outline" className="text-xs"><Users className="w-3 h-3 mr-1" />Team</Badge>}
                        {log.visibility === "department" && <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />Department</Badge>}
                        {log.visibility === "public" && <Badge variant="default" className="text-xs"><Globe className="w-3 h-3 mr-1" />Public</Badge>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {log.hours}h {log.minutes}m &middot; {new Date(log.createdAt).toLocaleString()}
                      {log.userId !== user?.id && <span className="ml-2 text-blue-600">(by other user)</span>}
                    </div>
                  </div>
                  {(user?.role === "super_admin" || log.userId === user?.id) && (
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