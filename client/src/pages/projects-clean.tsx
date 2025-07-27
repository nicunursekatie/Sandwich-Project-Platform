import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCelebration } from '@/components/celebration-toast';
import { PERMISSIONS, hasPermission } from '@shared/auth-utils';
import { 
  Plus, Circle, Play, CheckCircle2, Archive, Settings, 
  Edit, Trash2, User, Calendar, ArrowRight, Filter
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Project, InsertProject } from '@shared/schema';
import SendKudosButton from '@/components/send-kudos-button';
import sandwichLogo from '@assets/LOGOS/TSP_transparent.png';

export default function ProjectsClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { celebration, triggerCelebration, hideCelebration } = useCelebration();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  const [newProject, setNewProject] = useState<Partial<InsertProject>>({
    title: '',
    description: '',
    status: 'available',
    priority: 'medium',
    category: 'technology',
    assigneeName: '',
    dueDate: '',
    startDate: '',
    estimatedHours: 0,
    actualHours: 0,
    budget: ''
  });

  // Fetch all projects
  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  // Fetch archived projects data
  const { data: archivedProjects = [], isLoading: archiveLoading } = useQuery({
    queryKey: ["/api/projects/archived"],
  });

  // Mutations
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<InsertProject>) => {
      return await apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowCreateDialog(false);
      resetForm();
      toast({ 
        title: "Project created successfully!", 
        description: `"${data.title}" has been added to your projects.` 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to create project.",
        variant: "destructive" 
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, ...projectData }: { id: number } & Partial<InsertProject>) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, projectData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: "Project updated successfully!", 
        description: `"${data.title}" has been updated.` 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update project.",
        variant: "destructive" 
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: "Project deleted successfully!", 
        description: "The project has been removed." 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete project.",
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setNewProject({
      title: '',
      description: '',
      status: 'available',
      priority: 'medium',
      category: 'technology',
      assigneeName: '',
      dueDate: '',
      startDate: '',
      estimatedHours: 0,
      actualHours: 0,
      budget: ''
    });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title?.trim()) {
      const projectWithCreator = {
        ...newProject,
        createdBy: (user as any)?.id || '',
        createdByName: (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName || ''}`.trim() : (user as any)?.email || ''
      };
      createProjectMutation.mutate(projectWithCreator);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectMutation.mutate({
        id: editingProject.id,
        ...editingProject
      });
      setShowEditDialog(false);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (projectId: number, projectTitle: string) => {
    if (confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  const handleMarkComplete = (projectId: number, projectTitle: string) => {
    if (confirm(`Mark "${projectTitle}" as completed?`)) {
      updateProjectMutation.mutate({ id: projectId, status: 'completed' });
      toast({
        title: "🎉 Project completed!",
        description: `"${projectTitle}" has been marked as completed.`
      });
      triggerCelebration('🎉');
    }
  };

  const filterProjectsByStatus = (status: string) => {
    if (status === "active") {
      return allProjects.filter((project: Project) => project.status === "in_progress");
    }
    return allProjects.filter((project: Project) => project.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-[#FBAD3F]";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const canEditProject = (user: any, project: Project) => {
    return hasPermission(user, PERMISSIONS.EDIT_ALL_PROJECTS);
  };

  const canDeleteProject = (user: any, project: Project) => {
    return hasPermission(user, PERMISSIONS.DELETE_ALL_PROJECTS);
  };

  const renderProjectCard = (project: Project) => (
    <Card 
      key={project.id} 
      className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
      onClick={() => setLocation(`/projects/${project.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-[#236383] font-roboto text-lg mb-1 break-words leading-tight">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={`${getPriorityColor(project.priority)} text-white text-xs font-roboto`}>
                {project.priority} priority
              </Badge>
              <Badge className="bg-[#FBAD3F] text-white border-[#FBAD3F] text-xs font-roboto">
                {project.status === 'in_progress' ? 'active' : project.status?.replace('_', ' ') || 'available'}
              </Badge>
            </div>
          </div>
          
          {canEditProject(user, project) && (
            <div className="flex gap-1">
              {project.status !== 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(project.id, project.title);
                  }}
                  className="h-8 w-8 p-0 hover:bg-[#FBAD3F]/10"
                  title="Complete"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#FBAD3F]" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0 hover:bg-[#FBAD3F]/10"
                  >
                    <Settings className="h-4 w-4 text-[#FBAD3F]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}>
                    <Edit className="w-4 h-4 mr-2 text-[#FBAD3F]" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.title);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-roboto">
            {project.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 font-roboto">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4 text-[#FBAD3F]" />
            <span>{project.assigneeName || 'Unassigned'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#FBAD3F]" />
            <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const projects = filterProjectsByStatus(activeTab);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 font-roboto">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header with TSP Styling */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img 
            src={sandwichLogo} 
            alt="The Sandwich Project Logo" 
            className="w-10 h-10"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#236383] font-roboto">Project Management</h1>
            <p className="text-gray-600 font-roboto">Organize and track all team projects</p>
          </div>
        </div>
        {hasPermission(user, PERMISSIONS.CREATE_PROJECTS) && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#FBAD3F] hover:bg-[#e89a2f] text-white font-roboto font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Clean Status Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          <Button
            variant="ghost"
            onClick={() => setActiveTab("available")}
            className={`font-roboto font-medium transition-all ${activeTab === "available" 
              ? "bg-[#236383] text-white hover:bg-[#1e5470]" 
              : "text-[#236383] hover:text-[#1e5470] hover:bg-[#236383]/5"}`}
          >
            <Circle className="w-4 h-4 mr-2" />
            Available ({allProjects.filter(p => p.status === "available").length})
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setActiveTab("active")}
            className={`font-roboto font-medium transition-all ${activeTab === "active" 
              ? "bg-[#236383] text-white hover:bg-[#1e5470]" 
              : "text-[#236383] hover:text-[#1e5470] hover:bg-[#236383]/5"}`}
          >
            <Play className="w-4 h-4 mr-2" />
            Active ({allProjects.filter(p => p.status === "in_progress").length})
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setActiveTab("completed")}
            className={`font-roboto font-medium transition-all ${activeTab === "completed" 
              ? "bg-[#236383] text-white hover:bg-[#1e5470]" 
              : "text-[#236383] hover:text-[#1e5470] hover:bg-[#236383]/5"}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed ({allProjects.filter(p => p.status === "completed").length})
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setActiveTab("archived")}
            className={`font-roboto font-medium transition-all ${activeTab === "archived" 
              ? "bg-[#236383] text-white hover:bg-[#1e5470]" 
              : "text-[#236383] hover:text-[#1e5470] hover:bg-[#236383]/5"}`}
          >
            <Archive className="w-4 h-4 mr-2" />
            Archived ({Array.isArray(archivedProjects) ? archivedProjects.length : 0})
          </Button>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-[#236383]/30 mb-4">
              {activeTab === "available" && <Circle className="w-12 h-12 mx-auto" />}
              {activeTab === "active" && <Play className="w-12 h-12 mx-auto" />}
              {activeTab === "completed" && <CheckCircle2 className="w-12 h-12 mx-auto" />}
              {activeTab === "archived" && <Archive className="w-12 h-12 mx-auto" />}
            </div>
            <h3 className="text-lg font-medium text-[#236383] font-roboto mb-2">
              No {activeTab.replace('_', ' ')} Projects
            </h3>
            <p className="text-gray-600 font-roboto">
              {activeTab === "available" && "All projects are currently assigned or completed."}
              {activeTab === "active" && "No projects are currently in progress."}
              {activeTab === "completed" && "Completed projects will appear here."}
              {activeTab === "archived" && "Archived projects will appear here."}
            </p>
          </div>
        ) : (
          projects.map(renderProjectCard)
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#236383] font-roboto">Create New Project</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-roboto">Project Title</Label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                className="font-roboto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="font-roboto">Description</Label>
              <Textarea
                id="description"
                placeholder="Project description"
                value={newProject.description || ''}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                className="font-roboto"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="font-roboto">Priority</Label>
                <Select value={newProject.priority} onValueChange={(value) => setNewProject({...newProject, priority: value})}>
                  <SelectTrigger className="font-roboto">
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
              
              <div className="space-y-2">
                <Label htmlFor="category" className="font-roboto">Category</Label>
                <Select value={newProject.category} onValueChange={(value) => setNewProject({...newProject, category: value})}>
                  <SelectTrigger className="font-roboto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="fundraising">Fundraising</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assigneeName" className="font-roboto">Assigned To</Label>
              <Input
                id="assigneeName"
                placeholder="Enter assignee name"
                value={newProject.assigneeName || ''}
                onChange={(e) => setNewProject({...newProject, assigneeName: e.target.value})}
                className="font-roboto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="font-roboto">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newProject.dueDate || ''}
                onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
                className="font-roboto"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="font-roboto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#FBAD3F] hover:bg-[#e89a2f] text-white font-roboto"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-[#236383] font-roboto">Edit Project</DialogTitle>
          </DialogHeader>
          
          {editingProject && (
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="font-roboto">Project Title</Label>
                <Input
                  id="edit-title"
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                  className="font-roboto"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="font-roboto">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  className="font-roboto"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority" className="font-roboto">Priority</Label>
                  <Select value={editingProject.priority} onValueChange={(value) => setEditingProject({...editingProject, priority: value})}>
                    <SelectTrigger className="font-roboto">
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
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="font-roboto">Status</Label>
                  <Select value={editingProject.status} onValueChange={(value) => setEditingProject({...editingProject, status: value})}>
                    <SelectTrigger className="font-roboto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="waiting">Waiting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-assigneeName" className="font-roboto">Assigned To</Label>
                <Input
                  id="edit-assigneeName"
                  value={editingProject.assigneeName || ''}
                  onChange={(e) => setEditingProject({...editingProject, assigneeName: e.target.value})}
                  className="font-roboto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate" className="font-roboto">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingProject.dueDate || ''}
                  onChange={(e) => setEditingProject({...editingProject, dueDate: e.target.value})}
                  className="font-roboto"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
                  className="font-roboto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#FBAD3F] hover:bg-[#e89a2f] text-white font-roboto"
                  disabled={updateProjectMutation.isPending}
                >
                  {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}