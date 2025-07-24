
import { useState, useEffect } from "react";
import * as React from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { ProjectAssigneeSelector } from "@/components/project-assignee-selector";
import { MultiUserTaskCompletion } from "@/components/multi-user-task-completion";
import { SendKudosButton } from "@/components/send-kudos-button";
import { useAuth } from "@/hooks/useAuth";
import { canEditProject, canDeleteProject } from "@shared/auth-utils";

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
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assigneeId: '',
    assigneeName: '',
    estimatedHours: 0
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  // Function to send kudos to all project assignees when project is completed
  const sendKudosForProjectCompletion = async (project: Project, projectTitle: string) => {
    if (!user?.id) return;

    try {
      // Get all assignees for this project
      const assigneesToNotify = [];
      
      // Handle multiple assignees from assigneeIds array
      if ((project as any).assigneeIds && (project as any).assigneeIds.length > 0) {
        for (let i = 0; i < (project as any).assigneeIds.length; i++) {
          const assigneeId = (project as any).assigneeIds[i];
          const assigneeName = (project as any).assigneeNames?.[i] || `User ${assigneeId}`;
          
          // Don't send kudos to yourself
          if (assigneeId !== user.id) {
            assigneesToNotify.push({ id: assigneeId, name: assigneeName });
          }
        }
      } 
      // Handle single assignee from legacy assigneeId field
      else if (project.assigneeId && project.assigneeName && user?.id !== project.assigneeId) {
        assigneesToNotify.push({ 
          id: project.assigneeId, 
          name: project.assigneeName
        });
      }

      // Send kudos to each assignee
      for (const assignee of assigneesToNotify) {
        try {
          await apiRequest("POST", "/api/messaging/kudos", {
            recipientId: assignee.id,
            recipientName: assignee.name,
            contextType: "project",
            contextId: project.id.toString(),
            entityName: projectTitle,
            customMessage: `🎉 Congratulations on completing "${projectTitle}"! Amazing work!`
          });

          console.log(`Kudos sent to ${assignee.name} for project completion`);
        } catch (error) {
          console.error(`Failed to send kudos to ${assignee.name}:`, error);
        }
      }

      if (assigneesToNotify.length > 0) {
        toast({
          title: "🎉 Kudos sent!",
          description: `Congratulations sent to ${assigneesToNotify.length} team member${assigneesToNotify.length > 1 ? 's' : ''} for completing "${projectTitle}"`,
        });
      }
    } catch (error) {
      console.error('Failed to send project completion kudos:', error);
    }
  };

  // Project edit mutation
  const editProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, projectData);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsEditingProject(false);
      setEditingProject(null);
      toast({ description: "Project updated successfully" });
      
      // If project was marked as completed, send kudos to all assignees
      if (variables.status === 'completed' && project) {
        await sendKudosForProjectCompletion(project, project.title);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error updating project",
        description: error.message || "Failed to update project",
        variant: "destructive"
      });
    }
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

  // Function to check if project should be auto-completed
  const checkAndCompleteProject = async () => {
    if (!project || !tasks || tasks.length === 0) return;

    // Check if all tasks are completed
    const allTasksCompleted = tasks.every(task => task.status === 'completed');
    
    if (allTasksCompleted && project.status !== 'completed') {
      try {
        // Auto-complete the project
        await apiRequest('PATCH', `/api/projects/${id}`, { status: 'completed' });
        
        // Send kudos to all project assignees
        await sendKudosForProjectCompletion(project, project.title);
        
        toast({
          title: "🎉 Project Auto-Completed!",
          description: `"${project.title}" has been automatically completed since all tasks are done!`
        });
        
        // Refresh project data
        queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        
      } catch (error) {
        console.error('Failed to auto-complete project:', error);
      }
    }
  };



  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: number; taskData: Partial<Task> }) => {
      return await apiRequest('PATCH', `/api/tasks/${taskId}`, taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      setIsEditingTask(null);
      toast({ description: "Task updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description: error.message || "Failed to update task",
        variant: "destructive"
      });
    }
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

  const handleEditProject = () => {
    if (project) {
      setEditingProject(project);
      setIsEditingProject(true);
    }
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      editProjectMutation.mutate(editingProject);
    }
  };

  const handleEditTask = (task: Task) => {
    setIsEditingTask(task);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingTask) {
      editTaskMutation.mutate({ 
        taskId: isEditingTask.id, 
        taskData: isEditingTask 
      });
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
            onClick={() => {
              // Navigate back to projects section in dashboard
              setLocation('/dashboard?section=projects');
              
              // Force dashboard section change immediately
              setTimeout(() => {
                if ((window as any).dashboardSetActiveSection) {
                  (window as any).dashboardSetActiveSection('projects');
                }
                // Also trigger a page refresh to ensure proper navigation
                window.location.href = '/dashboard?section=projects';
              }, 100);
            }}
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
          {user && canEditProject(user, project) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditProject}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Project
            </Button>
          )}
          {/* Show kudos buttons for completed projects */}
          {project.status === 'completed' && (
            <div className="flex gap-2 flex-wrap">
              <SendKudosButton 
                recipientId="team"
                recipientName="Project Team"
                contextType="project"
                contextId={project.id.toString()}
                entityName={project.title}
                size="sm"
              />
              {project.assigneeName && (
                <SendKudosButton 
                  recipientId="assignee"
                  recipientName={project.assigneeName}
                  contextType="project"
                  contextId={project.id.toString()}
                  entityName={project.title}
                  size="sm"
                />
              )}
            </div>
          )}
          <Badge className={getStatusColor(project.status)}>
            {project.status?.replace('_', ' ')}
          </Badge>
          <Badge className={getPriorityColor(project.priority)}>
            {project.priority}
          </Badge>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Owner */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-blue-600 flex items-center gap-2">
              <User className="h-5 w-5" />
              PROJECT OWNER
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-gray-900 mb-1">
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
            <div className="text-lg font-bold text-gray-900 mb-1">
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


      </div>

      {/* Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tasks</h2>
          {user && canEditProject(user, project) && (
            <Button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
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
                value={{
                  assigneeIds: newTask.assigneeIds || [],
                  assigneeNames: newTask.assigneeNames || []
                }}
                onChange={({ assigneeIds, assigneeNames }) => 
                  setNewTask({ 
                    ...newTask, 
                    assigneeIds, 
                    assigneeNames,
                    // Keep backward compatibility
                    assigneeId: assigneeIds?.[0],
                    assigneeName: assigneeNames?.[0]
                  })
                }
                multiple={true}
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
              <Card key={task.id} className={`relative ${task.status === 'completed' ? 'bg-green-50 border-green-200' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className={`text-lg ${task.status === 'completed' ? 'line-through text-gray-600' : ''}`}>
                        {task.status === 'completed' && <CheckCircle2 className="inline w-5 h-5 mr-2 text-green-600" />}
                        {task.title}
                      </CardTitle>
                      <CardDescription className={`mt-1 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
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
                      {user && canEditProject(user, project) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {(task.assigneeNames?.length > 0 || task.assigneeName) && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <div className="flex flex-wrap gap-1">
                            {task.assigneeNames?.length > 0 ? (
                              task.assigneeNames.map((name, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))
                            ) : task.assigneeName ? (
                              <Badge variant="outline" className="text-xs">
                                {task.assigneeName}
                              </Badge>
                            ) : null}
                          </div>
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
                      <MultiUserTaskCompletion 
                        taskId={task.id}
                        projectId={project.id}
                        assigneeIds={task.assigneeIds?.length > 0 ? task.assigneeIds : (task.assigneeId ? [task.assigneeId] : [])}
                        assigneeNames={task.assigneeNames?.length > 0 ? task.assigneeNames : (task.assigneeName ? [task.assigneeName] : [])}
                        currentUserId={user?.id}
                        currentUserName={user?.firstName || user?.displayName}
                        taskStatus={task.status}
                        onStatusChange={(isCompleted) => {
                          // Invalidate queries to refresh UI immediately
                          queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'tasks'] });
                          queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
                          
                          // Trigger congratulations when task is completed by someone else
                          const assigneeIds = task.assigneeIds?.length > 0 ? task.assigneeIds : (task.assigneeId ? [task.assigneeId] : []);
                          const assigneeNames = task.assigneeNames?.length > 0 ? task.assigneeNames : (task.assigneeName ? [task.assigneeName] : []);
                          if (isCompleted && assigneeIds.length > 0 && !assigneeIds.includes(user?.id || '')) {
                            toast({
                              title: "🎉 Task Completed!",
                              description: `Team member completed "${task.title}"`,
                            });
                          }
                        }}
                      />
                      {/* Show kudos buttons for completed tasks */}
                      {task.status === 'completed' && (
                        <div className="flex gap-1 flex-wrap">
                          <SendKudosButton 
                            recipientId="task-team"
                            recipientName={task.assigneeName || "Task Team"}
                            contextType="task"
                            contextId={task.id.toString()}
                            entityName={task.title}
                            size="xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Project Edit Dialog */}
      <Dialog open={isEditingProject} onOpenChange={setIsEditingProject}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project details and assignments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-project-title">Title</Label>
                <Input
                  id="edit-project-title"
                  value={editingProject?.title || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-project-description">Description</Label>
                <Textarea
                  id="edit-project-description"
                  value={editingProject?.description || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-project-status">Status</Label>
                <Select 
                  value={editingProject?.status || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-project-priority">Priority</Label>
                <Select 
                  value={editingProject?.priority || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, priority: value } : null)}
                >
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
                <Label htmlFor="edit-project-category">Category</Label>
                <Select 
                  value={editingProject?.category || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="strategic">Strategic</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <ProjectAssigneeSelector
                  value={editingProject?.assigneeName || ''}
                  onChange={(value, userIds) => setEditingProject(prev => prev ? { 
                    ...prev, 
                    assigneeName: value,
                    assigneeIds: userIds?.length ? userIds : undefined
                  } : null)}
                  label="Assigned To"
                  placeholder="Select or enter person responsible"
                />
              </div>
              <div>
                <Label htmlFor="edit-project-due-date">Due Date</Label>
                <Input
                  id="edit-project-due-date"
                  type="date"
                  value={editingProject?.dueDate ? editingProject.dueDate.split('T')[0] : ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-project-budget">Budget</Label>
                <Input
                  id="edit-project-budget"
                  type="number"
                  value={editingProject?.budget || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, budget: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="edit-project-estimated-hours">Estimated Hours</Label>
                <Input
                  id="edit-project-estimated-hours"
                  type="number"
                  value={editingProject?.estimatedHours || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, estimatedHours: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingProject(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editProjectMutation.isPending}>
                {editProjectMutation.isPending ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Edit Dialog */}
      <Dialog open={!!isEditingTask} onOpenChange={() => setIsEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Modify task details and assignments
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-task-title">Title</Label>
                <Input
                  id="edit-task-title"
                  value={isEditingTask?.title || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={isEditingTask?.description || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-status">Status</Label>
                <Select 
                  value={isEditingTask?.status || ''} 
                  onValueChange={(value) => setIsEditingTask(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select 
                  value={isEditingTask?.priority || ''} 
                  onValueChange={(value) => setIsEditingTask(prev => prev ? { ...prev, priority: value } : null)}
                >
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
                <Label htmlFor="edit-task-assignee">Assigned To</Label>
                <TaskAssigneeSelector
                  value={{
                    assigneeIds: isEditingTask?.assigneeIds || (isEditingTask?.assigneeId ? [isEditingTask.assigneeId] : []),
                    assigneeNames: isEditingTask?.assigneeNames || (isEditingTask?.assigneeName ? [isEditingTask.assigneeName] : [])
                  }}
                  onChange={({ assigneeIds, assigneeNames }) => 
                    setIsEditingTask(prev => prev ? { 
                      ...prev, 
                      assigneeIds, 
                      assigneeNames,
                      // Keep backward compatibility with single assignee fields
                      assigneeId: assigneeIds?.[0],
                      assigneeName: assigneeNames?.[0]
                    } : null)
                  }
                  multiple={true}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="date"
                  value={isEditingTask?.dueDate ? isEditingTask.dueDate.split('T')[0] : ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-estimated-hours">Estimated Hours</Label>
                <Input
                  id="edit-task-estimated-hours"
                  type="number"
                  value={isEditingTask?.estimatedHours || ''}
                  onChange={(e) => setIsEditingTask(prev => prev ? { ...prev, estimatedHours: Number(e.target.value) } : null)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingTask(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editTaskMutation.isPending}>
                {editTaskMutation.isPending ? 'Updating...' : 'Update Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
