import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  AlertCircle
} from "lucide-react";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";
import type { Project } from "@shared/schema";

export default function ProjectsClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = hasPermission(user, PERMISSIONS.EDIT_DATA);

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Update project status mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: "Project updated", 
        description: "Project status has been updated successfully." 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update project status.",
        variant: "destructive" 
      });
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
    // Use dashboard navigation instead of routing
    if ((window as any).dashboardSetActiveSection) {
      (window as any).dashboardSetActiveSection(`project-${projectId}`);
    } else {
      setLocation(`/projects/${projectId}`);
    }
  };

  const handleStatusChange = (projectId: number, newStatus: string) => {
    if (canEdit) {
      updateProjectMutation.mutate({ id: projectId, status: newStatus });
    }
  };

  const filterProjectsByStatus = (status: string) => {
    if (status === "active") {
      return projects.filter((project: Project) => project.status === "in_progress");
    }
    return projects.filter((project: Project) => project.status === status);
  };

  const activeProjects = filterProjectsByStatus("active");
  const availableProjects = filterProjectsByStatus("available");
  const waitingProjects = filterProjectsByStatus("waiting");
  const completedProjects = filterProjectsByStatus("completed");

  const renderProjectCard = (project: Project) => (
    <Card 
      key={project.id} 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleProjectClick(project.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-slate-900 truncate">
              {project.title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-1 line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-2 ml-4 shrink-0">
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>{project.assigneeName || 'Unassigned'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium text-slate-900">{project.progress || 0}%</span>
          </div>
          <Progress value={project.progress || 0} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center">
            <img src={sandwichLogo} alt="Sandwich Logo" className="w-6 h-6 mr-2" />
            Project Management
          </h2>
          <p className="text-slate-600 mt-1">Organize and track all team projects</p>
        </div>
        <Button onClick={() => setLocation("/projects/new")} disabled={!canEdit}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
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
        
        <TabsContent value="active" className="mt-6">
          {activeProjects.length === 0 ? (
            <div className="text-center py-12">
              <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No active projects</h3>
              <p className="text-slate-500">Start working on available projects or create a new one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProjects.map(renderProjectCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          {availableProjects.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No available projects</h3>
              <p className="text-slate-500">All projects are either active or completed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProjects.map(renderProjectCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="waiting" className="mt-6">
          {waitingProjects.length === 0 ? (
            <div className="text-center py-12">
              <Pause className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No waiting projects</h3>
              <p className="text-slate-500">No projects are currently on hold.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {waitingProjects.map(renderProjectCard)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {completedProjects.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No completed projects</h3>
              <p className="text-slate-500">Completed projects will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedProjects.map(renderProjectCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}