import React, { useState } from 'react';
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
import { Plus, Users, Clock, CheckCircle, AlertCircle, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'available' | 'waiting' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        status: 'available',
        progress: 0
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsAddModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
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

  // Separate projects by status
  const activeProjects = projects.filter((project: Project) => project.status === 'active');
  const availableProjects = projects.filter((project: Project) => project.status === 'available');
  const waitingProjects = projects.filter((project: Project) => project.status === 'waiting');
  const completedProjects = projects.filter((project: Project) => project.status === 'completed');

  const getProjectIcon = (project: Project) => {
    const iconMap: Record<string, any> = {
      'general': Target,
      'technology': Calendar,
      'media': User,
      'design': Clock,
      'outreach': BarChart3,
      'administration': TrendingUp,
      'default': AlertCircle
    };
    return iconMap[project.category || 'default'] || iconMap.default;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const renderProjectCard = (project: Project) => {
    const IconComponent = getProjectIcon(project);
    
    return (
      <Card 
        key={project.id} 
        className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-white dark:bg-gray-800"
        onClick={() => setLocation(`/projects/${project.id}`)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {project.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getPriorityColor(project.priority || 'medium')}>
                    {project.priority || 'medium'}
                  </Badge>
                  <Badge variant="outline" className={project.category === 'technology' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}>
                    {project.category || 'General'}
                  </Badge>
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {project.description || "No description provided"}
          </CardDescription>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{project.progressPercentage || 0}%</span>
            </div>
            <Progress value={project.progressPercentage || 0} className="h-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4 mr-1" />
                <span>{project.assigneeName || 'Unassigned'}</span>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/projects/${project.id}`);
                }}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <img src={logoPath} alt="The Sandwich Project" className="h-8 w-8" />
          <span className="text-lg font-semibold text-slate-900">The Sandwich Project</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Messages"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Navigation</h2>
              <p className="text-sm text-slate-600 mt-1">Sandwich Project Platform</p>
            </div>
            <div className="h-full overflow-y-auto p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => { setLocation("/projects"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Projects
                </button>
                <button
                  onClick={() => { setLocation("/meetings"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Meetings
                </button>
                <button
                  onClick={() => { setLocation("/analytics"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </button>
                <button
                  onClick={() => { setLocation("/phone-directory"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Phone Directory
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop Sidebar - Only show on large screens */}
        {!isMobile && (
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Navigation</h2>
              <p className="text-sm text-slate-600 mt-1">Sandwich Project Platform</p>
            </div>
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setLocation("/")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setLocation("/projects")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Projects
                </button>
                <button
                  onClick={() => setLocation("/meetings")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Meetings
                </button>
                <button
                  onClick={() => setLocation("/analytics")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </button>
                <button
                  onClick={() => setLocation("/phone-directory")}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Phone Directory
                </button>
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Welcome, {(user as any)?.firstName || 'Team'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Project Management</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                  Organize and track all team projects with interactive task management
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto shrink-0">
                <Button 
                  onClick={() => setLocation("/projects/new")} 
                  className="bg-blue-600 hover:bg-blue-700 text-sm px-3 sm:px-4 py-2 shrink-0 min-w-0"
                  size="sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">New Project</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <LoadingState text="Loading projects..." />
            ) : (
              <ErrorBoundary>
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="active" className="text-xs sm:text-sm">
                      Active ({activeProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="available" className="text-xs sm:text-sm">
                      Available ({availableProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="waiting" className="text-xs sm:text-sm">
                      Waiting ({waitingProjects.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs sm:text-sm">
                      Completed ({completedProjects.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {activeProjects.length > 0 ? (
                        activeProjects.map(renderProjectCard)
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No active projects. Create a new project to get started.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="available" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {availableProjects.length > 0 ? (
                        availableProjects.map(renderProjectCard)
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No available projects.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="waiting" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {waitingProjects.length > 0 ? (
                        waitingProjects.map(renderProjectCard)
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No waiting projects.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {completedProjects.length > 0 ? (
                        completedProjects.map(renderProjectCard)
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                          No completed projects.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}