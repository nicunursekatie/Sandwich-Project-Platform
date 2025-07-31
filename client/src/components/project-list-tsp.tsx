import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ListTodo, Plus, X, Edit, Trash2, Upload, File, ExternalLink, Calendar, Clock, Users, Flag } from "lucide-react";
import { TSPButton, TSPIconButton } from "@/components/ui/tsp-button";
import { TSPCard, TSPCardHeader, TSPCardTitle, TSPCardContent } from "@/components/ui/tsp-card";
import { TSPBadge, TSPStatusBadge } from "@/components/ui/tsp-badge";
import { FormInput, FormLabel, FormField, FormTextarea, FormSelect, FormActions } from "@/components/ui/tsp-form";
import { Heading, Text } from "@/components/ui/tsp-typography";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function ProjectList() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [claimingProjectId, setClaimingProjectId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [assigneeName, setAssigneeName] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    status: "available",
    priority: "medium",
    category: "general",
    assigneeId: null,
    assigneeName: "",
    dueDate: "",
    startDate: "",
    estimatedHours: "",
    actualHours: "",
    progress: 0,
    notes: "",
    tags: "",
    dependencies: "",
    resources: "",
    milestones: "",
    riskAssessment: "",
    successCriteria: ""
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
      const transformedData = {
        ...projectData,
        estimatedHours: projectData.estimatedHours ? parseInt(projectData.estimatedHours) || null : null,
        actualHours: projectData.actualHours ? parseInt(projectData.actualHours) || null : null,
        progress: parseInt(projectData.progress.toString()) || 0,
        assigneeName: projectData.assigneeName || null,
        dueDate: projectData.dueDate || null,
        startDate: projectData.startDate || null,
        description: projectData.description || null,
        notes: projectData.notes || null,
        tags: projectData.tags || null,
        dependencies: projectData.dependencies || null,
        resources: projectData.resources || null,
        milestones: projectData.milestones || null,
        riskAssessment: projectData.riskAssessment || null,
        successCriteria: projectData.successCriteria || null
      };
      const response = await apiRequest("POST", "/api/projects", transformedData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowAddForm(false);
      resetForm();
      toast({
        title: "Project created successfully",
        description: "Your new project has been added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create project",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted successfully",
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

  const resetForm = () => {
    setNewProject({
      title: "",
      description: "",
      status: "available",
      priority: "medium",
      category: "general",
      assigneeId: null,
      assigneeName: "",
      dueDate: "",
      startDate: "",
      estimatedHours: "",
      actualHours: "",
      progress: 0,
      notes: "",
      tags: "",
      dependencies: "",
      resources: "",
      milestones: "",
      riskAssessment: "",
      successCriteria: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in-progress': return 'warning';
      case 'completed': return 'info';
      case 'on-hold': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { variant: 'danger' as const, icon: <Flag className="w-3 h-3" /> };
      case 'medium': return { variant: 'warning' as const, icon: null };
      case 'low': return { variant: 'info' as const, icon: null };
      default: return { variant: 'default' as const, icon: null };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tsp-navy mx-auto mb-4"></div>
          <Text variant="muted">Loading projects...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-tsp rounded-lg flex items-center justify-center shadow-md">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          <div>
            <Heading as="h1" variant="title">Projects</Heading>
            <Text variant="muted">Manage and track volunteer initiatives</Text>
          </div>
        </div>
        <TSPButton 
          onClick={() => setShowAddForm(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Project
        </TSPButton>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <TSPCard 
            key={project.id} 
            variant="elevated" 
            hover
            className="cursor-pointer"
            onClick={() => setLocation(`/projects/${project.id}`)}
          >
            <TSPCardHeader>
              <div className="flex items-start justify-between">
                <TSPCardTitle as="h3">{project.title}</TSPCardTitle>
                <TSPStatusBadge status={
                  project.status === 'available' ? 'active' :
                  project.status === 'in-progress' ? 'pending' :
                  project.status === 'completed' ? 'completed' :
                  'inactive'
                }>
                  {project.status}
                </TSPStatusBadge>
              </div>
            </TSPCardHeader>
            <TSPCardContent className="space-y-4">
              {project.description && (
                <Text variant="small" className="line-clamp-2">
                  {project.description}
                </Text>
              )}

              <div className="flex flex-wrap gap-2">
                {project.priority && (
                  <TSPBadge 
                    variant={getPriorityBadge(project.priority).variant}
                    size="sm"
                  >
                    {getPriorityBadge(project.priority).icon}
                    {project.priority} priority
                  </TSPBadge>
                )}
                {project.category && (
                  <TSPBadge variant="outline" size="sm">
                    {project.category}
                  </TSPBadge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {project.assigneeName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{project.assigneeName}</span>
                  </div>
                )}
                {project.dueDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                {project.estimatedHours && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{project.estimatedHours} hours estimated</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {project.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-tsp transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                {project.status === 'available' && !project.assigneeId && (
                  <TSPButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      setClaimingProjectId(project.id);
                    }}
                  >
                    Claim Project
                  </TSPButton>
                )}
                <TSPIconButton
                  variant="ghost"
                  size="sm"
                  icon={<Edit className="w-4 h-4" />}
                  label="Edit project"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                  }}
                />
                <TSPIconButton
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-destructive" />}
                  label="Delete project"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this project?')) {
                      deleteProjectMutation.mutate(project.id);
                    }
                  }}
                />
              </div>
            </TSPCardContent>
          </TSPCard>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <TSPCard variant="bordered" className="p-12 text-center">
          <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <Heading as="h3" className="mb-2">No projects yet</Heading>
          <Text variant="muted" className="mb-4">
            Create your first project to get started with volunteer coordination.
          </Text>
          <TSPButton onClick={() => setShowAddForm(true)} leftIcon={<Plus />}>
            Create First Project
          </TSPButton>
        </TSPCard>
      )}

      {/* Add/Edit Project Dialog */}
      <Dialog open={showAddForm || !!editingProject} onOpenChange={(open) => {
        if (!open) {
          setShowAddForm(false);
          setEditingProject(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-tsp-navy">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (editingProject) {
              // Handle edit
            } else {
              createProjectMutation.mutate(newProject);
            }
          }} className="space-y-4">
            <FormField>
              <FormLabel htmlFor="title">Project Title *</FormLabel>
              <FormInput
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                required
                placeholder="Enter project title"
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormTextarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Describe the project goals and requirements"
                rows={3}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="status">Status</FormLabel>
                <FormSelect
                  id="status"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </FormSelect>
              </FormField>

              <FormField>
                <FormLabel htmlFor="priority">Priority</FormLabel>
                <FormSelect
                  id="priority"
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </FormSelect>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField>
                <FormLabel htmlFor="startDate">Start Date</FormLabel>
                <FormInput
                  id="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="dueDate">Due Date</FormLabel>
                <FormInput
                  id="dueDate"
                  type="date"
                  value={newProject.dueDate}
                  onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormField>
              <FormLabel htmlFor="estimatedHours">Estimated Hours</FormLabel>
              <FormInput
                id="estimatedHours"
                type="number"
                value={newProject.estimatedHours}
                onChange={(e) => setNewProject({ ...newProject, estimatedHours: e.target.value })}
                placeholder="0"
              />
            </FormField>

            <FormActions>
              <TSPButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProject(null);
                  resetForm();
                }}
              >
                Cancel
              </TSPButton>
              <TSPButton
                type="submit"
                loading={createProjectMutation.isPending}
              >
                {editingProject ? 'Update Project' : 'Create Project'}
              </TSPButton>
            </FormActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Claim Project Dialog */}
      <Dialog open={!!claimingProjectId} onOpenChange={(open) => {
        if (!open) {
          setClaimingProjectId(null);
          setAssigneeName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormField>
              <FormLabel htmlFor="assigneeName">Your Name</FormLabel>
              <FormInput
                id="assigneeName"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </FormField>
            <FormActions>
              <TSPButton
                variant="outline"
                onClick={() => {
                  setClaimingProjectId(null);
                  setAssigneeName("");
                }}
              >
                Cancel
              </TSPButton>
              <TSPButton
                onClick={() => {
                  if (claimingProjectId && assigneeName) {
                    claimProjectMutation.mutate({ 
                      projectId: claimingProjectId, 
                      assigneeName 
                    });
                  }
                }}
                loading={claimProjectMutation.isPending}
                disabled={!assigneeName.trim()}
              >
                Claim Project
              </TSPButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}