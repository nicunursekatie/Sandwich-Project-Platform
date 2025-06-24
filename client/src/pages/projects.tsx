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
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Clock, CheckCircle, AlertCircle, FolderOpen, Edit2, Trash2, Sandwich, LogOut, LayoutDashboard, ListTodo, MessageCircle, ClipboardList, BarChart3, TrendingUp, Building2, FileText, Phone, Car, ChevronDown, ChevronRight } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";


interface Project {
  id: number;
  title: string;
  description: string;
  status: string; // Database uses: in_progress, pending, not_started, completed
  priority: 'low' | 'medium' | 'high';
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const { user } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    dueDate: ''
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const createMutation = useMutation({
    mutationFn: (project: any) => apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...project,
        status: 'not_started',
        progressPercentage: 0
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsAddModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        priority: 'medium',
        assigneeName: '',
        dueDate: ''
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newProject);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation structure with expandable sections (matching dashboard)
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

  // Expand Operations section by default so Projects is visible
  useEffect(() => {
    setExpandedSections(['operations']);
  }, []);

  // Map database status to display categories
  const mapStatus = (status: string) => {
    switch (status) {
      case 'in_progress': return 'active';
      case 'pending': return 'waiting';
      case 'not_started': return 'available';
      case 'completed': return 'completed';
      default: return 'available';
    }
  };

  // Separate projects by status - including database status values
  const activeProjects = projects.filter((project: any) => 
    project.status === 'active' || project.status === 'in_progress'
  );
  const availableProjects = projects.filter((project: any) => 
    project.status === 'available' || project.status === 'not_started'
  );
  const waitingProjects = projects.filter((project: any) => 
    project.status === 'waiting' || project.status === 'on_hold' || project.status === 'pending'
  );
  const completedProjects = projects.filter((project: any) => 
    project.status === 'completed' || project.status === 'finished'
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

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
                  const isActive = item.id === "projects";
                  return (
                    <li key={item.id}>
                      <button
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management</h1>
            <p className="text-gray-600">Organize and track all team projects with interactive task management</p>
          </div>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newProject.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewProject(prev => ({ ...prev, priority: value }))
                  }>
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
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newProject.assignedTo || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Enter assignee name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newProject.dueDate || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects in tab-based layout matching other pages */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Active ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Available ({availableProjects.length})
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Waiting ({waitingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {activeProjects.map((project: any) => (
              <Card key={project.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.priority === 'high' ? 'destructive' :
                        project.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {project.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {project.status === 'in_progress' ? 'active' : project.status}
                      </Badge>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{project.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.assigneeName || project.assignedTo || 'Unassigned'}
                    </span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {activeProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active projects. Create a new project to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-4">
            {availableProjects.map((project: any) => (
              <Card key={project.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.priority === 'high' ? 'destructive' :
                        project.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {project.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {project.status}
                      </Badge>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{project.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.assigneeName || 'Unassigned'}
                    </span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {availableProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available projects.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          <div className="grid gap-4">
            {waitingProjects.map((project: any) => (
              <Card key={project.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.priority === 'high' ? 'destructive' :
                        project.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {project.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {project.status}
                      </Badge>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{project.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.assigneeName || 'Unassigned'}
                    </span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {waitingProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No waiting projects.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {completedProjects.map((project: any) => (
              <Card key={project.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        project.priority === 'high' ? 'destructive' :
                        project.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {project.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {project.status}
                      </Badge>
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{project.description || 'No description provided'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.assigneeName || 'Unassigned'}
                    </span>
                    {project.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {completedProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No completed projects.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onEdit }: { project: Project; onEdit: (project: Project) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'waiting': return <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
      case 'completed': return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'available': return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(project.status)}
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority} priority
              </Badge>
              {project.assigneeName && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.assigneeName}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(project)}
              className="flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {project.description && (
          <p className="text-sm text-slate-600 mb-4">{project.description}</p>
        )}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}