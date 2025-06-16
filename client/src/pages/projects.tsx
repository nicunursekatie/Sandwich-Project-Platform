import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingState, CardSkeleton, LoadingButton } from "@/components/ui/loading";
import { 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle, 
  Pause,
  Play,
  ArrowRight,
  BarChart3,
  TrendingUp,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  ClipboardList,
  FolderOpen,
  Users,
  Car,
  Building2,
  FileText,
  Phone,
  Sandwich,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";
import type { Project } from "@shared/schema";

export default function Projects() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation structure with expandable sections
  const navigationStructure = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, type: "item", href: "/" },
    { id: "collections", label: "Collections Log", icon: Sandwich, type: "item", href: "/collections" },
    { 
      id: "team", 
      label: "Team", 
      icon: Users, 
      type: "section",
      items: [
        { id: "hosts", label: "Hosts", icon: Building2, href: "/hosts" },
        { id: "recipients", label: "Recipients", icon: Users, href: "/recipients" },
        { id: "drivers", label: "Drivers", icon: Car, href: "/drivers" },
      ]
    },
    { 
      id: "operations", 
      label: "Operations", 
      icon: FolderOpen, 
      type: "section",
      items: [
        { id: "projects", label: "Projects", icon: ListTodo, href: "/projects" },
        { id: "meetings", label: "Meetings", icon: ClipboardList, href: "/meetings" },
        { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
        { id: "role-demo", label: "Role Demo", icon: Users, href: "/role-demo" },
      ]
    },
    { id: "toolkit", label: "Toolkit", icon: FileText, type: "item", href: "/toolkit" },
    { id: "directory", label: "Phone Directory", icon: Phone, type: "item", href: "/directory", permission: PERMISSIONS.VIEW_PHONE_DIRECTORY },
    { id: "development", label: "Development", icon: FolderOpen, type: "item", href: "/development" },
  ];

  // Filter navigation items based on user permissions
  const filteredNavigation = navigationStructure.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch project stats
  const { data: stats } = useQuery({
    queryKey: ["/api/projects/stats"],
  });

  // Update project status mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/stats"] });
      toast({ title: "Project status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project status", variant: "destructive" });
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
      case "available": return "text-purple-600 bg-purple-50 border-purple-200";
      case "waiting": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-4 h-4" />;
      case "in_progress": return <Play className="w-4 h-4" />;
      case "available": return <Circle className="w-4 h-4" />;
      case "waiting": return <Pause className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const handleProjectClick = (projectId: number) => {
    setLocation(`/projects/${projectId}`);
  };

  const handleStatusChange = (projectId: number, newStatus: string) => {
    updateProjectMutation.mutate({ id: projectId, status: newStatus });
  };

  const filterProjectsByStatus = (status: string) => {
    return (projects as Project[]).filter((project: Project) => project.status === status);
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 ${getStatusColor(project.status)}`}
      onClick={() => handleProjectClick(project.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(project.status)}
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-2">
              {project.description || "No description provided"}
            </CardDescription>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Priority and Category */}
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {project.category}
            </Badge>
          </div>
          
          {/* Progress */}
          {project.progressPercentage !== undefined && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium">{project.progressPercentage}%</span>
              </div>
              <Progress value={project.progressPercentage} className="h-2" />
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {project.assigneeName && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{project.assigneeName}</span>
                </div>
              )}
              {project.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            {project.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{project.estimatedHours}h</span>
              </div>
            )}
          </div>
          
          {/* Quick Status Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                const nextStatus = project.status === "available" ? "in_progress" : 
                                 project.status === "in_progress" ? "completed" : "available";
                handleStatusChange(project.id, nextStatus);
              }}
              className="text-xs"
            >
              {project.status === "available" && "Start Project"}
              {project.status === "in_progress" && "Mark Complete"}
              {project.status === "completed" && "Reopen"}
              {project.status === "waiting" && "Make Available"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const waitingProjects = filterProjectsByStatus("waiting");
  const availableProjects = filterProjectsByStatus("available");
  const activeProjects = filterProjectsByStatus("in_progress");
  const completedProjects = filterProjectsByStatus("completed");



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
            onClick={() => window.location.href = "/api/logout"}
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
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Navigation</h2>
            <p className="text-sm text-slate-600 mt-1">Sandwich Project Platform</p>
          </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => {
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
                          const isActive = subItem.id === "projects";
                          return (
                            <li key={subItem.id}>
                              <button
                                onClick={() => setLocation(subItem.href)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                  isActive
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
              }
              
              const isActive = item.id === "projects";
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setLocation(item.href || "/")}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Welcome, {(user as any)?.firstName || 'Team'}</span>
          </div>
        </div>
      </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Management</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Organize and track all team projects with interactive task management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = "/"}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Messages"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <Button onClick={() => setLocation("/projects/new")} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{(stats as any).total || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Projects</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{(stats as any).completed || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{(stats as any).active || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{(stats as any).available || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Project Sections */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Active ({activeProjects.length})
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Circle className="w-4 h-4" />
                Available ({availableProjects.length})
              </TabsTrigger>
              <TabsTrigger value="waiting" className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Waiting ({waitingProjects.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Completed ({completedProjects.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Projects */}
            <TabsContent value="active">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Active Projects</h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    {activeProjects.length} projects
                  </Badge>
                </div>
                
                {activeProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Active Projects
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Start working on available projects or create new ones to see them here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProjects.map((project: Project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Available Projects */}
            <TabsContent value="available">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">Available Projects</h2>
                  <Badge className="bg-purple-100 text-purple-800">
                    {availableProjects.length} projects
                  </Badge>
                </div>
                
                {availableProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Available Projects
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        All projects are either in progress, completed, or waiting for approval.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableProjects.map((project: Project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Waiting Projects */}
            <TabsContent value="waiting">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Pause className="w-5 h-5 text-gray-600" />
                  <h2 className="text-xl font-semibold">Waiting Projects</h2>
                  <Badge className="bg-gray-100 text-gray-800">
                    {waitingProjects.length} projects
                  </Badge>
                </div>
                
                {waitingProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Pause className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Waiting Projects
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Projects in discussion or planning phase will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {waitingProjects.map((project: Project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Completed Projects */}
            <TabsContent value="completed">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Completed Projects</h2>
                  <Badge className="bg-green-100 text-green-800">
                    {completedProjects.length} projects
                  </Badge>
                </div>
                
                {completedProjects.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Completed Projects
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Completed projects will be archived here for reference.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedProjects.map((project: Project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
}