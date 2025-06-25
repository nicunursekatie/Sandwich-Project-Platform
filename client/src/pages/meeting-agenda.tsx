import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, ListTodo, Plus, Edit, Trash2, CheckCircle2, Circle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AgendaItem {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  assignedTo?: string;
  estimatedDuration: number;
  meetingId?: number;
  createdAt: string;
}

export default function MeetingAgenda() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assignedTo: "",
    estimatedDuration: 15
  });
  const { toast } = useToast();

  const { data: agendaItems = [], isLoading } = useQuery({
    queryKey: ["/api/agenda-items"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/agenda-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create agenda item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-items"] });
      setIsCreating(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        assignedTo: "",
        estimatedDuration: 15
      });
      toast({ title: "Agenda item created successfully" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/agenda-items/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agenda-items"] });
      toast({ title: "Status updated successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const toggleStatus = (item: AgendaItem) => {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    updateStatusMutation.mutate({ id: item.id, status: newStatus });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const totalDuration = agendaItems.reduce((sum: number, item: AgendaItem) => sum + item.estimatedDuration, 0);
  const completedItems = agendaItems.filter((item: AgendaItem) => item.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <ListTodo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meeting Agenda</h1>
            <p className="text-gray-600 dark:text-gray-400">Plan and organize meeting topics and discussions</p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} className="self-start">
          <Plus className="w-4 h-4 mr-2" />
          New Agenda Item
        </Button>
      </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ListTodo className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{agendaItems.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{completedItems}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{totalDuration}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Form */}
          {isCreating && (
            <Card>
              <CardHeader>
                <CardTitle>Create Agenda Item</CardTitle>
                <CardDescription>Add a new topic to the meeting agenda</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Discussion topic or agenda item"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the agenda item"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Assigned To</label>
                      <Input
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        placeholder="Person responsible"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 15 })}
                        min="5"
                        max="120"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Item"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Agenda Items */}
          <div className="space-y-4">
            {agendaItems.map((item: AgendaItem, index: number) => (
              <Card key={item.id} className={item.status === "completed" ? "opacity-75" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(item)}
                        className="mt-1"
                      >
                        {item.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(item.priority)}`}></div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.estimatedDuration} min
                          </Badge>
                        </div>
                        <h3 className={`font-semibold ${item.status === "completed" ? "line-through text-gray-500" : ""}`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{item.description}</p>
                        )}
                        {item.assignedTo && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                            Assigned to: {item.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {agendaItems.length === 0 && !isCreating && (
            <Card>
              <CardContent className="text-center py-12">
                <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No agenda items yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first agenda item to start planning your meeting</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Item
                </Button>
              </CardContent>
            </Card>
          )}
    </div>
  );
}