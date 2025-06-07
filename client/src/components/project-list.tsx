import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ListTodo, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function ProjectList() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [claimingProjectId, setClaimingProjectId] = useState<number | null>(null);
  const [assigneeName, setAssigneeName] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "available"
  });
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const claimProjectMutation = useMutation({
    mutationFn: async ({ projectId, assigneeName }: { projectId: number; assigneeName: string }) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/claim`, {
        assigneeName
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setClaimingProjectId(null);
      setAssigneeName("");
      toast({
        title: "Project claimed successfully",
        description: "The project has been assigned.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to claim project",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof newProject) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewProject({ title: "", description: "", status: "available" });
      setShowAddForm(false);
      toast({
        title: "Project created successfully",
        description: "The new project has been added to the list.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create project",
        description: "Please check your input and try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a project title.",
        variant: "destructive"
      });
      return;
    }
    createProjectMutation.mutate(newProject);
  };

  const handleClaimProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeName.trim()) {
      toast({
        title: "Missing assignee name",
        description: "Please enter the name of the person claiming this project.",
        variant: "destructive"
      });
      return;
    }
    if (claimingProjectId) {
      claimProjectMutation.mutate({ projectId: claimingProjectId, assigneeName });
    }
  };

  const startClaimingProject = (projectId: number) => {
    setClaimingProjectId(projectId);
    setAssigneeName("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-500";
      case "in_progress": return "bg-amber-500";
      case "planning": return "bg-blue-500";
      case "completed": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available": return "px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full";
      case "in_progress": return "px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full";
      case "planning": return "px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full";
      case "completed": return "px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full";
      default: return "px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Available";
      case "in_progress": return "In Progress";
      case "planning": return "Planning";
      case "completed": return "Completed";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <ListTodo className="text-blue-500 mr-2 w-5 h-5" />
          Active Projects
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{projects.length} total</span>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Project
          </Button>
        </div>
      </div>
      <div className="p-6">
        {/* Add Project Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-900">Add New Project</h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-title" className="text-sm font-medium text-slate-700">
                    Project Title
                  </Label>
                  <Input
                    id="project-title"
                    type="text"
                    placeholder="Enter project title"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="project-status" className="text-sm font-medium text-slate-700">
                    Status
                  </Label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => setNewProject({ ...newProject, status: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="project-description" className="text-sm font-medium text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe the project details and requirements"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={createProjectMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || !newProject.title.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></span>
                  <div>
                    <h3 className="font-medium text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-600">{project.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={getStatusBadge(project.status)}>
                    {getStatusText(project.status)}
                  </span>
                  {project.status === "available" ? (
                    claimingProjectId === project.id ? (
                      <div className="text-sm text-slate-500">Claiming...</div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startClaimingProject(project.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        Claim
                      </Button>
                    )
                  ) : project.assigneeName ? (
                    <span className="text-sm text-slate-500">Assigned to {project.assigneeName}</span>
                  ) : null}
                </div>
              </div>
              
              {/* Claim form */}
              {claimingProjectId === project.id && (
                <div className="px-3 pb-3 border-t border-slate-200 bg-slate-25">
                  <form onSubmit={handleClaimProject} className="flex items-center gap-2 pt-3">
                    <div className="flex-1">
                      <Label htmlFor="assignee-name" className="sr-only">
                        Assignee Name
                      </Label>
                      <Input
                        id="assignee-name"
                        type="text"
                        placeholder="Enter assignee name"
                        value={assigneeName}
                        onChange={(e) => setAssigneeName(e.target.value)}
                        className="text-sm"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={claimProjectMutation.isPending || !assigneeName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {claimProjectMutation.isPending ? "Claiming..." : "Assign"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setClaimingProjectId(null)}
                      disabled={claimProjectMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
        

      </div>
    </div>
  );
}
