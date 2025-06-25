import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, User, Clock, Target, CheckCircle2, Circle, Pause, Play, Plus, Trash2, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";
import type { Project, ProjectTask } from "@shared/schema";

interface ProjectDetailCleanProps {
  projectId: number;
  onBack?: () => void;
}

export default function ProjectDetailClean({ projectId, onBack }: ProjectDetailCleanProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = hasPermission(user, PERMISSIONS.EDIT_DATA);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    assigneeName: "",
    dueDate: ""
  });
  const [editProject, setEditProject] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigneeName: "",
    dueDate: ""
  });

  // Fetch project details
  const { data: projects = [], isLoading: projectLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", projectId],
  });

  const project = projects.find(p => p.id === projectId);

  // Fetch tasks for this project
  const { data: projectTasks = [], isLoading: tasksLoading } = useQuery<ProjectTask[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
    queryFn: () => fetch(`/api/projects/${projectId}/tasks`).then(res => res.json()),
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', `/api/projects/${projectId}/tasks`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      setNewTask({ title: "", description: "", status: "pending", priority: "medium", assigneeName: "", dueDate: "" });
      setIsAddingTask(false);
      toast({ title: "Task created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create task", variant: "destructive" });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<ProjectTask> }) => {
      return await apiRequest('PATCH', `/api/projects/${projectId}/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      setEditingTask(null);
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/projects/${projectId}/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', `/api/projects/${projectId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsEditingProject(false);
      toast({ title: "Project updated successfully", description: "The project has been updated." });
    },
    onError: () => {
      toast({ title: "Failed to update project", description: "Please try again later.", variant: "destructive" });
    },
  });

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
      case "pending": return "text-orange-600 bg-orange-50 border-orange-200";
      case "waiting": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress": return <Play className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "waiting": return <Pause className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    updateTaskMutation.mutate({
      id: editingTask.id,
      updates: editingTask
    });
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleToggleTaskCompletion = (task: ProjectTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateTaskMutation.mutate({
      id: task.id,
      updates: { status: newStatus }
    });
  };

  const handleEditProject = () => {
    // Format date for input field (YYYY-MM-DD)
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch {
        return "";
      }
    };

    setEditProject({
      title: project?.title || "",
      description: project?.description || "",
      priority: project?.priority || "medium",
      assigneeName: project?.assigneeName || "",
      dueDate: formatDateForInput(project?.dueDate)
    });
    setIsEditingProject(true);
  };

  const handleUpdateProject = () => {
    if (!editProject.title.trim()) return;
    
    const projectData = {
      title: editProject.title,
      description: editProject.description,
      priority: editProject.priority,
      assigneeName: editProject.assigneeName || null,
      dueDate: editProject.dueDate || null,
      status: project?.status || 'available',
      category: project?.category || 'general',
      progressPercentage: project?.progressPercentage || 0
    };

    updateProjectMutation.mutate(projectData);
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Project not found</h3>
          <p className="text-slate-500">The requested project could not be found.</p>
          {onBack && (
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-slate-600 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
          <Badge variant="outline" className={getStatusColor(project.status)}>
            {getStatusIcon(project.status)}
            <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
          </Badge>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={handleEditProject}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Assignee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-slate-400" />
              <span className="text-slate-900">{project.assigneeName || 'Unassigned'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <span className="text-slate-900">
                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date set'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Completion</span>
                <span className="font-medium text-slate-900">{project.progress || 0}%</span>
              </div>
              <Progress value={project.progress || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({projectTasks.length})</TabsTrigger>
          <TabsTrigger value="details">Project Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
              <DialogTrigger asChild>
                <Button disabled={!canEdit}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="task-title">Task Title *</Label>
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
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-priority">Priority</Label>
                      <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="task-status">Status</Label>
                      <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-assignee">Assignee</Label>
                      <Input
                        id="task-assignee"
                        value={newTask.assigneeName}
                        onChange={(e) => setNewTask({ ...newTask, assigneeName: e.target.value })}
                        placeholder="Assign to someone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-due">Due Date</Label>
                      <Input
                        id="task-due"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddingTask(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateTask}
                      disabled={!newTask.title.trim() || createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-slate-600">Loading tasks...</div>
            </div>
          ) : projectTasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
              <p className="text-slate-500">Add your first task to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectTasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex items-center pt-1">
                          <Checkbox
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleToggleTaskCompletion(task)}
                            disabled={!canEdit}
                            className="w-5 h-5"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                              {task.title}
                            </h4>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                          </div>
                          {task.description && (
                            <p className={`text-sm mb-2 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            {task.assigneeName && (
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {task.assigneeName}
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1 ml-4">
                        <Dialog open={editingTask?.id === task.id} onOpenChange={(open) => !open && setEditingTask(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={!canEdit}
                              onClick={() => setEditingTask(task)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                            </DialogHeader>
                            {editingTask && (
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-task-title">Task Title *</Label>
                                  <Input
                                    id="edit-task-title"
                                    value={editingTask.title}
                                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-task-description">Description</Label>
                                  <Textarea
                                    id="edit-task-description"
                                    value={editingTask.description || ""}
                                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                    rows={3}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-task-priority">Priority</Label>
                                    <Select value={editingTask.priority} onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-task-status">Status</Label>
                                    <Select value={editingTask.status} onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="waiting">Waiting</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-task-assignee">Assignee</Label>
                                    <Input
                                      id="edit-task-assignee"
                                      value={editingTask.assigneeName || ""}
                                      onChange={(e) => setEditingTask({ ...editingTask, assigneeName: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-task-due">Due Date</Label>
                                    <Input
                                      id="edit-task-due"
                                      type="date"
                                      value={editingTask.dueDate || ""}
                                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setEditingTask(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleUpdateTask}
                                    disabled={!editingTask.title.trim() || updateTaskMutation.isPending}
                                  >
                                    {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!canEdit}
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Project Title</Label>
                  <p className="text-slate-900">{project.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Category</Label>
                  <p className="text-slate-900 capitalize">{project.category || 'General'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Priority</Label>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Status</Label>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                    <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-slate-700">Description</Label>
                  <p className="text-slate-900">{project.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Edit Dialog */}
      <Dialog open={isEditingProject} onOpenChange={setIsEditingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-project-title">Title</Label>
              <Input
                id="edit-project-title"
                value={editProject.title}
                onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                placeholder="Enter project title"
              />
            </div>
            <div>
              <Label htmlFor="edit-project-description">Description</Label>
              <Textarea
                id="edit-project-description"
                value={editProject.description}
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-project-priority">Priority</Label>
                <Select value={editProject.priority} onValueChange={(value) => setEditProject({ ...editProject, priority: value })}>
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
                <Label htmlFor="edit-project-assignee">Assigned To</Label>
                <Input
                  id="edit-project-assignee"
                  value={editProject.assigneeName}
                  onChange={(e) => setEditProject({ ...editProject, assigneeName: e.target.value })}
                  placeholder="Enter assignee name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-project-due">Due Date</Label>
              <Input
                id="edit-project-due"
                type="date"
                value={editProject.dueDate}
                onChange={(e) => setEditProject({ ...editProject, dueDate: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditingProject(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateProject}
                disabled={updateProjectMutation.isPending}
              >
                {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}