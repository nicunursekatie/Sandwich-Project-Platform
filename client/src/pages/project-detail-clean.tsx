
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Target, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Users,
  MessageSquare,
  Award
} from "lucide-react";
import { TaskAssigneeSelector } from "@/components/task-assignee-selector";
import { MultiUserTaskCompletion } from "@/components/multi-user-task-completion";
import { SendKudosButton } from "@/components/send-kudos-button";
import { useAuth } from "@/hooks/useAuth";

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailClean({ projectId }: { projectId?: number }) {
  const { id: paramId } = useParams<{ id: string }>();
  const id = projectId ? projectId.toString() : paramId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
    assigneeName: '',
    estimatedHours: 0
  });

  // Fetch project details
  const { data: project, isLoading: isProjectLoading } = useQuery<Project>({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${id}`);
      return response;
    },
    enabled: !!id,
  });

  // Fetch project tasks
  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/projects', id, 'tasks'],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/projects/${id}/tasks`);
      return Array.isArray(response) ? response : [];
    },
    enabled: !!id,
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', `/api/projects/${id}/tasks`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      setIsAddingTask(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
        assigneeName: '',
        estimatedHours: 0
      });
      toast({ description: "Task added successfully" });
    },
    onError: (error: any) => {
      console.error('Task creation failed:', error);
      toast({ 
        description: "Failed to add task", 
        variant: "destructive" 
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return await apiRequest('DELETE', `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      toast({ description: "Task deleted successfully" });
    },
    onError: (error: any) => {
      console.error('Task deletion failed:', error);
      toast({ 
        description: "Failed to delete task", 
        variant: "destructive" 
      });
    },
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      toast({ description: "Task title is required", variant: "destructive" });
      return;
    }
    addTaskMutation.mutate(newTask);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "in_progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "available": return "text-purple-600 bg-purple-50 border-purple-200";
      case "waiting": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (isProjectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Project not found</div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/dashboard/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status?.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Owner */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <User className="h-5 w-5" />
              PROJECT OWNER
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {project.assigneeName || 'Not assigned'}
            </div>
            <div className="text-sm text-gray-500">
              Currently managing this project
            </div>
          </CardContent>
        </Card>

        {/* Target Date */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-orange-600 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              TARGET DATE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
            </div>
            {project.dueDate && (
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(project.dueDate), { addSuffix: true })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-green-600 flex items-center gap-2">
              <Target className="h-5 w-5" />
              PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {progressPercentage}%
            </div>
            <div className="text-sm text-gray-500 mb-2">
              Complete
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">
              {completedTasks} of {totalTasks} tasks
            </div>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-purple-600 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              BUDGET
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <Button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>

        {/* Add Task Form */}
        {isAddingTask && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-priority">Priority</Label>
                  <select
                    id="task-priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <TaskAssigneeSelector
                value={newTask.assigneeId}
                displayName={newTask.assigneeName}
                onAssigneeChange={(assigneeId, assigneeName) => 
                  setNewTask({ ...newTask, assigneeId, assigneeName })
                }
              />
              <div>
                <Label htmlFor="task-estimated-hours">Estimated Hours</Label>
                <Input
                  id="task-estimated-hours"
                  type="number"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddTask}
                  disabled={addTaskMutation.isPending}
                >
                  {addTaskMutation.isPending ? 'Adding...' : 'Add Task'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {isTasksLoading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks yet. Add your first task to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {task.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status?.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {task.assigneeName && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {task.assigneeName}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.estimatedHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {task.estimatedHours}h estimated
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <MultiUserTaskCompletion taskId={task.id} />
                      {task.status === 'completed' && task.assigneeId && (
                        <SendKudosButton 
                          recipientId={task.assigneeId}
                          recipientName={task.assigneeName || 'Unknown'}
                          contextType="task"
                          contextId={task.id}
                          contextTitle={task.title}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
