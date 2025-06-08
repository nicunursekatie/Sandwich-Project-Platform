import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ListTodo, Plus, X, Edit, Trash2, Upload, File, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function ProjectList() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [claimingProjectId, setClaimingProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<Project>) => {
      return apiRequest("PUT", `/api/projects/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
      toast({
        title: "Project updated successfully",
        description: "The project has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update project",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted successfully",
        description: "The project has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete project",
        description: "Please try again later.",
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

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a project title.",
        variant: "destructive"
      });
      return;
    }
    updateProjectMutation.mutate(editingProject);
  };

  const handleDeleteProject = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(id);
    }
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

  const startEditingProject = (project: Project) => {
    setEditingProject(project);
    setShowAddForm(false);
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
            <div key={project.id} className="bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors relative">
              {/* Action buttons in top right corner */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditingProject(project)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProject(project.id, project.title)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 pr-16">
                <div className="flex items-center space-x-3">
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">{project.title}</h3>
                      {project.priority && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          project.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.priority}
                        </span>
                      )}
                      {project.category && project.category !== 'general' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                          {project.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{project.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {project.dueDate && (
                        <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      )}
                      {project.progressPercentage > 0 && (
                        <span>{project.progressPercentage}% complete</span>
                      )}
                      {project.estimatedHours && (
                        <span>Est: {project.estimatedHours}h</span>
                      )}
                    </div>
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

        {/* Edit Project Modal */}
        {editingProject && (
          <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-project-description">
              <DialogHeader>
                <DialogTitle>Edit Project Details</DialogTitle>
              </DialogHeader>
              <p id="edit-project-description" className="text-sm text-slate-600 mb-4">
                Comprehensive project management with assignments, dates, attachments, and progress tracking.
              </p>
              <form onSubmit={handleUpdateProject} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-title" className="text-sm font-medium text-slate-700">
                        Project Title *
                      </Label>
                      <Input
                        id="edit-title"
                        type="text"
                        placeholder="Enter project title"
                        value={editingProject.title || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-category" className="text-sm font-medium text-slate-700">
                        Category
                      </Label>
                      <Select 
                        value={editingProject.category || "general"} 
                        onValueChange={(value) => setEditingProject({ ...editingProject, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="grants">Grants</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description" className="text-sm font-medium text-slate-700">
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Describe the project details and requirements"
                      value={editingProject.description || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Status and Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Status & Assignment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-status" className="text-sm font-medium text-slate-700">
                        Status
                      </Label>
                      <Select 
                        value={editingProject.status} 
                        onValueChange={(value) => setEditingProject({ ...editingProject, status: value })}
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
                    
                    <div>
                      <Label htmlFor="edit-priority" className="text-sm font-medium text-slate-700">
                        Priority
                      </Label>
                      <Select 
                        value={editingProject.priority || "medium"} 
                        onValueChange={(value) => setEditingProject({ ...editingProject, priority: value })}
                      >
                        <SelectTrigger className="mt-1">
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
                      <Label htmlFor="edit-assignee" className="text-sm font-medium text-slate-700">
                        Assigned To
                      </Label>
                      <Input
                        id="edit-assignee"
                        type="text"
                        placeholder="Enter assignee name"
                        value={editingProject.assigneeName || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, assigneeName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates and Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-start-date" className="text-sm font-medium text-slate-700">
                        Start Date
                      </Label>
                      <Input
                        id="edit-start-date"
                        type="date"
                        value={editingProject.startDate || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-due-date" className="text-sm font-medium text-slate-700">
                        Due Date
                      </Label>
                      <Input
                        id="edit-due-date"
                        type="date"
                        value={editingProject.dueDate || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, dueDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-completion-date" className="text-sm font-medium text-slate-700">
                        Completion Date
                      </Label>
                      <Input
                        id="edit-completion-date"
                        type="date"
                        value={editingProject.completionDate || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, completionDate: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress and Effort */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Progress & Effort</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-progress" className="text-sm font-medium text-slate-700">
                        Progress (%)
                      </Label>
                      <Input
                        id="edit-progress"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={editingProject.progressPercentage || 0}
                        onChange={(e) => setEditingProject({ ...editingProject, progressPercentage: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-estimated-hours" className="text-sm font-medium text-slate-700">
                        Estimated Hours
                      </Label>
                      <Input
                        id="edit-estimated-hours"
                        type="number"
                        min="0"
                        placeholder="Hours"
                        value={editingProject.estimatedHours || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, estimatedHours: parseInt(e.target.value) || null })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-actual-hours" className="text-sm font-medium text-slate-700">
                        Actual Hours
                      </Label>
                      <Input
                        id="edit-actual-hours"
                        type="number"
                        min="0"
                        placeholder="Hours"
                        value={editingProject.actualHours || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, actualHours: parseInt(e.target.value) || null })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Additional Information</h3>
                  <div>
                    <Label htmlFor="edit-notes" className="text-sm font-medium text-slate-700">
                      Project Notes
                    </Label>
                    <Textarea
                      id="edit-notes"
                      placeholder="Additional notes, updates, or important information"
                      value={editingProject.notes || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, notes: e.target.value })}
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-tags" className="text-sm font-medium text-slate-700">
                      Tags (comma-separated)
                    </Label>
                    <Input
                      id="edit-tags"
                      type="text"
                      placeholder="tag1, tag2, tag3"
                      value={editingProject.tags ? JSON.parse(editingProject.tags).join(", ") : ""}
                      onChange={(e) => {
                        const tags = e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag);
                        setEditingProject({ ...editingProject, tags: JSON.stringify(tags) });
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Attachments and Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">Documents & Attachments</h3>
                  
                  {/* Current Attachments */}
                  {editingProject.attachments && JSON.parse(editingProject.attachments).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2 block">
                        Current Attachments
                      </Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {JSON.parse(editingProject.attachments).map((attachment: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded border">
                            <div className="flex items-center space-x-2">
                              <File className="w-4 h-4 text-slate-500" />
                              <span className="text-sm text-slate-700 truncate">{attachment.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {attachment.url && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  className="h-6 w-6 p-0"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const attachments = JSON.parse(editingProject.attachments || "[]");
                                  attachments.splice(index, 1);
                                  setEditingProject({ ...editingProject, attachments: JSON.stringify(attachments) });
                                }}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Attachment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attachment-name" className="text-sm font-medium text-slate-700">
                        Document Name
                      </Label>
                      <Input
                        id="attachment-name"
                        type="text"
                        placeholder="Document name or description"
                        className="mt-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const name = e.currentTarget.value;
                            const urlInput = document.getElementById('attachment-url') as HTMLInputElement;
                            const url = urlInput?.value || '';
                            
                            if (name.trim()) {
                              const attachments = JSON.parse(editingProject.attachments || "[]");
                              attachments.push({ name: name.trim(), url: url.trim() });
                              setEditingProject({ ...editingProject, attachments: JSON.stringify(attachments) });
                              e.currentTarget.value = '';
                              if (urlInput) urlInput.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="attachment-url" className="text-sm font-medium text-slate-700">
                        Document URL (optional)
                      </Label>
                      <Input
                        id="attachment-url"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        className="mt-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const url = e.currentTarget.value;
                            const nameInput = document.getElementById('attachment-name') as HTMLInputElement;
                            const name = nameInput?.value || '';
                            
                            if (name.trim()) {
                              const attachments = JSON.parse(editingProject.attachments || "[]");
                              attachments.push({ name: name.trim(), url: url.trim() });
                              setEditingProject({ ...editingProject, attachments: JSON.stringify(attachments) });
                              e.currentTarget.value = '';
                              if (nameInput) nameInput.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nameInput = document.getElementById('attachment-name') as HTMLInputElement;
                      const urlInput = document.getElementById('attachment-url') as HTMLInputElement;
                      const name = nameInput?.value || '';
                      const url = urlInput?.value || '';
                      
                      if (name.trim()) {
                        const attachments = JSON.parse(editingProject.attachments || "[]");
                        attachments.push({ name: name.trim(), url: url.trim() });
                        setEditingProject({ ...editingProject, attachments: JSON.stringify(attachments) });
                        if (nameInput) nameInput.value = '';
                        if (urlInput) urlInput.value = '';
                      }
                    }}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingProject(null)}
                    disabled={updateProjectMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProjectMutation.isPending || !editingProject.title?.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
}
