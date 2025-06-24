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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    queryFn: () => apiRequest(`/api/projects/${projectId}`),
    enabled: !!projectId
  });

  // Fetch project tasks - using the real API endpoint that already exists
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['/api/projects', projectId, 'tasks'],
    queryFn: () => apiRequest(`/api/projects/${projectId}/tasks`),
    enabled: !!projectId
  });

  // Log API responses for debugging
  console.log('API Debug:', {
    project,
    projectError,
    tasks,
    tasksError,
    projectLoading,
    tasksLoading
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: any) => {
      return apiRequest(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'tasks'] });
      setIsAddTaskModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
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

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
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

  // Separate tasks by status
  const todoTasks = tasks.filter((task: any) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task: any) => task.status === 'in_progress');
  const completedTasks = tasks.filter((task: any) => task.status === 'completed');

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
              <Button className="flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Project
              </Button>
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
                    <form onSubmit={handleSubmitTask} className="space-y-4">
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
                        <Label htmlFor="assignedTo">Assigned To</Label>
                        <Input
                          id="assignedTo"
                          value={newTask.assignedTo}
                          onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
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
              </div>

              {/* Tasks List */}
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first task for this project.</p>
                  <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create First Task
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  {/* To Do */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      To Do ({todoTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {todoTasks.map((task: any) => (
                        <Card key={task.id} className="border border-gray-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{task.assignedTo || 'Unassigned'}</span>
                              {task.dueDate && (
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      In Progress ({inProgressTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {inProgressTasks.map((task: any) => (
                        <Card key={task.id} className="border border-blue-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{task.assignedTo || 'Unassigned'}</span>
                              {task.dueDate && (
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Completed */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Completed ({completedTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map((task: any) => (
                        <Card key={task.id} className="border border-green-200 shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{task.assignedTo || 'Unassigned'}</span>
                              {task.dueDate && (
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-medium">Category</Label>
                      <p className="text-gray-600">{project.category || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Start Date</Label>
                      <p className="text-gray-600">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Due Date</Label>
                      <p className="text-gray-600">
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium">Estimated Hours</Label>
                      <p className="text-gray-600">{project.estimatedHours || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Actual Hours</Label>
                      <p className="text-gray-600">{project.actualHours || 'Not logged'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Additional Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="font-medium">Requirements</Label>
                      <p className="text-gray-600">{project.requirements || 'No requirements specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Deliverables</Label>
                      <p className="text-gray-600">{project.deliverables || 'No deliverables specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Resources</Label>
                      <p className="text-gray-600">{project.resources || 'No resources specified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Blockers</Label>
                      <p className="text-gray-600">{project.blockers || 'No blockers identified'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Notes</Label>
                      <p className="text-gray-600">{project.notes || 'No additional notes'}</p>
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