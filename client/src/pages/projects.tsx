import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Sandwich
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

  // Sidebar navigation items
  const allSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "projects", label: "Projects", icon: ListTodo, path: "/projects" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/messages" },
    { id: "meetings", label: "Meetings", icon: ClipboardList, path: "/meetings" },
    { id: "toolkit", label: "Toolkit", icon: FileText, path: "/toolkit" },
    { id: "collections", label: "Collections", icon: Sandwich, path: "/collections" },
    { id: "hosts", label: "Hosts", icon: Building2, path: "/hosts" },
    { id: "recipients", label: "Recipients", icon: Users, path: "/recipients" },
    { id: "drivers", label: "Drivers", icon: Car, path: "/drivers" },
    { id: "directory", label: "Phone Directory", icon: Phone, path: "/phone-directory", permission: PERMISSIONS.VIEW_PHONE_DIRECTORY },
    { id: "analytics", label: "Data Analytics", icon: BarChart3, path: "/analytics" },
    { id: "impact", label: "Impact Dashboard", icon: TrendingUp, path: "/impact" },
    { id: "role-demo", label: "Role Demo", icon: Users, path: "/role-demo" },
    { id: "development", label: "Development", icon: FolderOpen, path: "/development" },
  ];

  const sidebarItems = allSidebarItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">TSP Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Sandwich Project Platform</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setLocation(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.id === "projects"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = "/api/logout"}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
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
            
            <Button onClick={() => setLocation("/projects/new")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
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
  );
}