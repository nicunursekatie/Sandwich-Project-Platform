import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Plus, Users, Clock, CheckCircle, AlertCircle, 
  Edit2, Trash2, Calendar, Target, FileText, MessageSquare,
  Sandwich, LogOut, LayoutDashboard, ListTodo, MessageCircle, 
  ClipboardList, BarChart3, TrendingUp, Building2, Phone, Car, 
  ChevronDown, ChevronRight, FolderOpen 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { useLocation, useRoute } from "wouter";

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  startDate?: string;
  completionDate?: string;
  progressPercentage: number;
  notes?: string;
  requirements?: string;
  deliverables?: string;
  resources?: string;
  blockers?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [match, params] = useRoute("/projects/:id");
  const projectId = params?.id;
  
  // Debug the URL and params
  console.log('Current location:', location);
  console.log('useRoute match:', match);
  console.log('useRoute params:', params);
  console.log('Extracted projectId:', projectId);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    dueDate: ''
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation structure
  const navigationStructure = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, type: "item" },
    { id: "collections", label: "Collections Log", icon: Sandwich, type: "item" },
    { id: "messages", label: "Messages", icon: MessageCircle, type: "item" },
    { 
      id: "team", 
      label: "Team", 
      icon: Users, 
      type: "section",
      items: [
        { id: "hosts", label: "Hosts", icon: Building2 },
        { id: "recipients", label: "Recipients", icon: Users },
        { id: "directory", label: "Phone Directory", icon: Phone },
        { id: "drivers", label: "Drivers", icon: Car },
        { id: "committee", label: "Committee", icon: Users }
      ]
    },
    {
      id: "operations",
      label: "Operations",
      icon: FolderOpen,
      type: "section", 
      items: [
        { id: "projects", label: "Projects", icon: ListTodo },
        { id: "meetings", label: "Meetings", icon: ClipboardList },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "reports", label: "Reports", icon: TrendingUp },
        { id: "role-demo", label: "Role Demo", icon: Users }
      ]
    },
    { id: "toolkit", label: "Toolkit", icon: FileText, type: "item" },
    { id: "development", label: "Development", icon: FileText, type: "item" }
  ];

  // Expand Operations section by default
  useEffect(() => {
    setExpandedSections(['operations']);
  }, []);

  // Debug log
  console.log('ProjectDetail - projectId:', projectId, 'enabled:', !!projectId);

  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId
  });

  // Fetch project tasks 
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: [`/api/projects/${projectId}/tasks`],
    enabled: !!projectId
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: any) => {
      return apiRequest('POST', `/api/projects/${projectId}/tasks`, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      setIsAddTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assigneeName: '',
        dueDate: ''
      });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: number; updates: any }) => {
      return apiRequest('PATCH', `/api/projects/${projectId}/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => {
      return apiRequest('DELETE', `/api/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
    }
  });

  const toggleTaskCompletionMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      return apiRequest('PATCH', `/api/projects/${projectId}/tasks/${taskId}`, {
        status: completed ? 'completed' : 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/tasks`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTaskMutation.mutateAsync(newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      assigneeName: task.assigneeName || '',
      dueDate: task.dueDate || ''
    });
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    
    try {
      await updateTaskMutation.mutateAsync({
        taskId: editingTask.id,
        updates: editingTask
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleToggleTaskCompletion = async (taskId: number, isCompleted: boolean) => {
    try {
      await toggleTaskCompletionMutation.mutateAsync({
        taskId,
        completed: !isCompleted
      });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const updateProjectMutation = useMutation({
    mutationFn: (updates: any) => {
      return apiRequest('PATCH', `/api/projects/${projectId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive"
      });
    }
  });

  const handleEditProject = () => {
    setEditingProject({
      title: project.title,
      description: project.description,
      category: project.category,
      priority: project.priority,
      status: project.status,
      assigneeName: project.assigneeName || '',
      startDate: project.startDate || '',
      dueDate: project.dueDate || '',
      requirements: project.requirements || '',
      deliverables: project.deliverables || '',
      resources: project.resources || '',
      blockers: project.blockers || '',
      notes: project.notes || ''
    });
    setIsEditProjectModalOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    try {
      await updateProjectMutation.mutateAsync(editingProject);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (projectLoading || !projectId) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            {!projectId ? `No project ID found in URL: ${location}` : 'Loading project...'}
          </div>
        </div>
      </div>
    );
  }

  if (!project && !projectLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/projects")}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have valid task data
  const actualTasks = Array.isArray(tasks) ? tasks : [];
  
  console.log('=== TASK DEBUG ===');
  console.log('Raw tasks:', tasks);
  console.log('Actual tasks:', actualTasks);
  console.log('Tasks loading:', tasksLoading);
  console.log('Tasks error:', tasksError);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Sandwich className="text-amber-500 w-6 h-6" />
          <h1 className="text-lg font-semibold text-slate-900">The Sandwich Project</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              queryClient.clear();
              window.location.href = "/api/logout";
            }}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationStructure.map((item) => {
                const Icon = item.icon;
                
                if (item.type === "section") {
                  const isExpanded = expandedSections.includes(item.id);
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleSection(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && (
                        <ul className="mt-2 ml-8 space-y-1">
                          {item.items?.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = subItem.id === "projects";
                            return (
                              <li key={subItem.id}>
                                <button
                                  onClick={() => {
                                    if (subItem.id === "dashboard") {
                                      setLocation("/");
                                    } else if (subItem.id === "hosts") {
                                      setLocation("/");
                                    } else if (subItem.id === "recipients") {
                                      setLocation("/");
                                    } else if (subItem.id === "directory") {
                                      setLocation("/phone-directory");
                                    } else if (subItem.id === "drivers") {
                                      setLocation("/");
                                    } else if (subItem.id === "projects") {
                                      setLocation("/projects");
                                    } else if (subItem.id === "meetings") {
                                      setLocation("/meetings");
                                    } else if (subItem.id === "analytics") {
                                      setLocation("/analytics");
                                    } else if (subItem.id === "reports") {
                                      setLocation("/reporting-dashboard");
                                    } else if (subItem.id === "role-demo") {
                                      setLocation("/role-demo");
                                    }
                                  }}
                                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    isSubActive
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  <SubIcon className="w-4 h-4" />
                                  <span className="text-sm">{subItem.label}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                } else {
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (item.id === "dashboard") {
                            setLocation("/");
                          } else if (item.id === "collections") {
                            setLocation("/");
                          } else if (item.id === "messages") {
                            setLocation("/");
                          } else if (item.id === "toolkit") {
                            setLocation("/");
                          } else if (item.id === "development") {
                            setLocation("/development");
                          }
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Project Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/projects")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Button>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <p className="text-gray-600 mb-4">{project.description || 'No description provided'}</p>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    project.priority === 'high' ? 'destructive' :
                    project.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {project.priority} priority
                  </Badge>
                  <Badge variant="outline">
                    {project.status === 'in_progress' ? 'active' : project.status}
                  </Badge>
                  {project.assigneeName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Assigned to: {project.assigneeName}</span>
                    </div>
                  )}
                  {project.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Project
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Update Progress
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Project Progress</span>
                <span>{project.progressPercentage || 0}%</span>
              </div>
              <Progress value={project.progressPercentage || 0} className="h-3" />
            </div>
          </div>

          {/* Project Details and Tasks */}
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-6">
              <div className="max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Tasks</h2>
                  <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateTask} className="space-y-4">
                        <div>
                          <Label htmlFor="title">Task Title</Label>
                          <Input
                            id="title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            placeholder="Enter task title"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="Enter task description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="assigneeName">Assigned To</Label>
                          <Input
                            id="assigneeName"
                            value={newTask.assigneeName}
                            onChange={(e) => setNewTask({ ...newTask, assigneeName: e.target.value })}
                            placeholder="Enter assignee name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                          <Input
                            id="dueDate"
                            type="date"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createTaskMutation.isPending}>
                            {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Task Modal */}
                  <Dialog open={isEditTaskModalOpen} onOpenChange={setIsEditTaskModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateTask} className="space-y-4">
                        <div>
                          <Label htmlFor="editTitle">Title</Label>
                          <Input
                            id="editTitle"
                            value={editingTask?.title || ''}
                            onChange={(e) => setEditingTask(editingTask ? { ...editingTask, title: e.target.value } : null)}
                            placeholder="Enter task title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editDescription">Description</Label>
                          <Textarea
                            id="editDescription"
                            value={editingTask?.description || ''}
                            onChange={(e) => setEditingTask(editingTask ? { ...editingTask, description: e.target.value } : null)}
                            placeholder="Enter task description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editPriority">Priority</Label>
                          <Select 
                            value={editingTask?.priority || 'medium'} 
                            onValueChange={(value) => setEditingTask(editingTask ? { ...editingTask, priority: value } : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="editAssigneeName">Assigned To</Label>
                          <Input
                            id="editAssigneeName"
                            value={editingTask?.assigneeName || ''}
                            onChange={(e) => setEditingTask(editingTask ? { ...editingTask, assigneeName: e.target.value } : null)}
                            placeholder="Enter assignee name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editDueDate">Due Date</Label>
                          <Input
                            id="editDueDate"
                            type="date"
                            value={editingTask?.dueDate || ''}
                            onChange={(e) => setEditingTask(editingTask ? { ...editingTask, dueDate: e.target.value } : null)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsEditTaskModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={updateTaskMutation.isPending}>
                            {updateTaskMutation.isPending ? 'Updating...' : 'Update Task'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Project Modal */}
                  <Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Project Details</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateProject} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editProjectTitle">Title</Label>
                            <Input
                              id="editProjectTitle"
                              value={editingProject?.title || ''}
                              onChange={(e) => setEditingProject(editingProject ? { ...editingProject, title: e.target.value } : null)}
                              placeholder="Project title"
                            />
                          </div>
                          <div>
                            <Label htmlFor="editProjectCategory">Category</Label>
                            <Input
                              id="editProjectCategory"
                              value={editingProject?.category || ''}
                              onChange={(e) => setEditingProject(editingProject ? { ...editingProject, category: e.target.value } : null)}
                              placeholder="Project category"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="editProjectDescription">Description</Label>
                          <Textarea
                            id="editProjectDescription"
                            value={editingProject?.description || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, description: e.target.value } : null)}
                            placeholder="Project description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="editProjectPriority">Priority</Label>
                            <Select 
                              value={editingProject?.priority || 'medium'} 
                              onValueChange={(value) => setEditingProject(editingProject ? { ...editingProject, priority: value } : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="editProjectStatus">Status</Label>
                            <Select 
                              value={editingProject?.status || 'pending'} 
                              onValueChange={(value) => setEditingProject(editingProject ? { ...editingProject, status: value } : null)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on_hold">On Hold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="editProjectAssignee">Assigned To</Label>
                            <Input
                              id="editProjectAssignee"
                              value={editingProject?.assigneeName || ''}
                              onChange={(e) => setEditingProject(editingProject ? { ...editingProject, assigneeName: e.target.value } : null)}
                              placeholder="Assignee name"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="editProjectStartDate">Start Date</Label>
                            <Input
                              id="editProjectStartDate"
                              type="date"
                              value={editingProject?.startDate || ''}
                              onChange={(e) => setEditingProject(editingProject ? { ...editingProject, startDate: e.target.value } : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="editProjectDueDate">Due Date</Label>
                            <Input
                              id="editProjectDueDate"
                              type="date"
                              value={editingProject?.dueDate || ''}
                              onChange={(e) => setEditingProject(editingProject ? { ...editingProject, dueDate: e.target.value } : null)}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="editProjectRequirements">Requirements</Label>
                          <Textarea
                            id="editProjectRequirements"
                            value={editingProject?.requirements || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, requirements: e.target.value } : null)}
                            placeholder="Project requirements"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editProjectDeliverables">Deliverables</Label>
                          <Textarea
                            id="editProjectDeliverables"
                            value={editingProject?.deliverables || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, deliverables: e.target.value } : null)}
                            placeholder="Project deliverables"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editProjectResources">Resources</Label>
                          <Textarea
                            id="editProjectResources"
                            value={editingProject?.resources || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, resources: e.target.value } : null)}
                            placeholder="Required resources"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editProjectBlockers">Current Blockers</Label>
                          <Textarea
                            id="editProjectBlockers"
                            value={editingProject?.blockers || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, blockers: e.target.value } : null)}
                            placeholder="Current blockers or issues"
                          />
                        </div>
                        <div>
                          <Label htmlFor="editProjectNotes">Notes</Label>
                          <Textarea
                            id="editProjectNotes"
                            value={editingProject?.notes || ''}
                            onChange={(e) => setEditingProject(editingProject ? { ...editingProject, notes: e.target.value } : null)}
                            placeholder="Additional notes"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsEditProjectModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={updateProjectMutation.isPending}>
                            {updateProjectMutation.isPending ? 'Updating...' : 'Update Details'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

              {/* Tasks List */}
              {actualTasks.length === 0 ? (
                <div className="text-center py-8">
                  <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600">Create your first task using the Add Task button above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actualTasks.map((task: any) => (
                    <Card key={task.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => handleToggleTaskCompletion(task.id, task.status === 'completed')}
                              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className={
                                task.status === 'completed' || task.status === 'done' ? 'border-green-500 text-green-700' :
                                task.status === 'in_progress' || task.status === 'active' ? 'border-blue-500 text-blue-700' :
                                'border-gray-500 text-gray-700'
                              }>
                                {task.status === 'in_progress' || task.status === 'active' ? 'In Progress' : 
                                 task.status === 'completed' || task.status === 'done' ? 'Completed' : 'Pending'}
                              </Badge>
                              </div>
                              {task.description && (
                                <p className={`text-sm mb-2 ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Assigned: {task.assigneeName || task.assignedTo || 'Unassigned'}</span>
                                {task.dueDate && task.dueDate !== '' && (
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTask(task)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Project Details</h2>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleEditProject}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-medium text-gray-700">Category</Label>
                        <p className="text-gray-900 mt-1">{project.category || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Priority</Label>
                        <p className="text-gray-900 mt-1 capitalize">{project.priority}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Status</Label>
                        <p className="text-gray-900 mt-1 capitalize">{project.status === 'in_progress' ? 'Active' : project.status}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Assigned To</Label>
                        <p className="text-gray-900 mt-1">{project.assigneeName || 'Unassigned'}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Start Date</Label>
                        <p className="text-gray-900 mt-1">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Due Date</Label>
                        <p className="text-gray-900 mt-1">
                          {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Time Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="font-medium text-gray-700">Estimated Hours</Label>
                        <p className="text-gray-900 mt-1">{project.estimatedHours || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Actual Hours</Label>
                        <p className="text-gray-900 mt-1">{project.actualHours || 'Not logged'}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Created</Label>
                        <p className="text-gray-900 mt-1">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Last Updated</Label>
                        <p className="text-gray-900 mt-1">{new Date(project.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-medium text-gray-700">Description</Label>
                      <p className="text-gray-900 mt-1">{project.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Requirements</Label>
                      <p className="text-gray-900 mt-1">{project.requirements || 'No requirements specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Deliverables</Label>
                      <p className="text-gray-900 mt-1">{project.deliverables || 'No deliverables specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Resources</Label>
                      <p className="text-gray-900 mt-1">{project.resources || 'No resources specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Current Blockers</Label>
                      <p className="text-gray-900 mt-1">{project.blockers || 'No blockers identified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">Notes</Label>
                      <p className="text-gray-900 mt-1">{project.notes || 'No additional notes'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files uploaded</h3>
                <p className="text-gray-600 mb-4">Upload project files, documents, and resources here.</p>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Upload Files
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600">Project activity and updates will appear here as the team works.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}