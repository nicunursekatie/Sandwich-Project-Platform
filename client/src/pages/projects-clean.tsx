import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
  Award,
  Trash2,
  Edit,
  Settings,
  Archive
} from "lucide-react";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useCelebration, CelebrationToast } from "@/components/celebration-toast";
import { ProjectAssigneeSelector } from "@/components/project-assignee-selector";
import { hasPermission, PERMISSIONS, canEditProject, canDeleteProject } from "@shared/auth-utils";
import type { Project, InsertProject } from "@shared/schema";
import SendKudosButton from "@/components/send-kudos-button";

export default function ProjectsClean() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { celebration, triggerCelebration, hideCelebration } = useCelebration();
  // Remove old blanket edit permission - now handled per-project basis
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  
  // Filter and sort state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("title"); // 'title', 'priority', 'dueDate', 'status'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc'
  const [filterCategory, setFilterCategory] = useState("all"); // 'all', 'technology', 'events', 'grants', 'outreach'
  const [showMyProjects, setShowMyProjects] = useState(false);
  
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
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Fetch archived projects data
  const { data: archivedProjects = [], isLoading: archiveLoading } = useQuery({
    queryKey: ["/api/projects/archived"],
  });

  // Filter and sort projects based on the selected tab
  const getFilteredProjects = () => {
    if (activeTab === "archived") {
      return (archivedProjects as Project[]) || [];
    }
    
    return allProjects.filter(project => {
      // Filter by tab (status)
      let statusMatch = false;
      if (activeTab === "available") {
        statusMatch = project.status === "available";
      } else if (activeTab === "active") {
        statusMatch = project.status === "in_progress";
      } else if (activeTab === "completed") {
        statusMatch = project.status === "completed";
      }
      
      // Filter by category
      const categoryMatch = filterCategory === "all" || project.category === filterCategory;
      
      // Filter by ownership (My Projects)
      const ownershipMatch = !showMyProjects || 
        (project.assigneeIds && Array.isArray(project.assigneeIds) && user?.id && (project.assigneeIds as string[]).includes(user.id)) ||
        project.assigneeId === user?.id ||
        project.createdBy === user?.id;
      
      return statusMatch && categoryMatch && ownershipMatch;
    });
  };

  const filteredAndSortedProjects = getFilteredProjects()
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const projects = filteredAndSortedProjects;

  // Calculate project counts for tab buttons
  const activeProjects = allProjects.filter(project => 
    project.status === "available" || project.status === "in_progress"
  );
  const completedProjects = allProjects.filter(project => 
    project.status === "completed"
  );

  // Update project status mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, { status });
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: "Project updated", 
        description: "Project status has been updated successfully." 
      });
      
      // If project was marked as completed, send kudos to all assignees
      if (variables.status === 'completed') {
        const project = projects?.find(p => p.id === variables.id);
        if (project) {
          await sendKudosForProjectCompletion(project);
          triggerCelebration();
        }
      }
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update project status.",
        variant: "destructive" 
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<InsertProject>) => {
      return await apiRequest('POST', '/api/projects', projectData);
    },
    onSuccess: (data) => {
      // Only invalidate the projects cache once - no need for refetch
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      setShowCreateDialog(false);
      setNewProject({
        title: '',
        description: '',
        status: 'available',
        priority: 'medium',
        category: 'general',
        assigneeName: '',
        dueDate: '',
        startDate: '',
        estimatedHours: 0
      });
      
      toast({ 
        title: "Project created successfully!", 
        description: `"${data.title}" has been added to your Available projects.` 
      });
    },
    onError: (error: any) => {
      console.error('Project creation failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to create project.",
        variant: "destructive" 
      });
    },
  });

  // Edit project mutation
  const editProjectMutation = useMutation({
    mutationFn: async ({ id, projectData }: { id: number; projectData: Partial<InsertProject> }) => {
      return await apiRequest('PATCH', `/api/projects/${id}`, projectData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowEditDialog(false);
      setEditingProject(null);
      toast({ 
        title: "Project updated successfully!", 
        description: `"${data.title}" has been updated.` 
      });
    },
    onError: (error: any) => {
      console.error('Project update failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to update project.",
        variant: "destructive" 
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ 
        title: "Project deleted successfully!", 
        description: "The project has been removed from your list." 
      });
    },
    onError: (error: any) => {
      console.error('Project deletion failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete project.",
        variant: "destructive" 
      });
    },
  });

  // Archive project mutation
  const archiveProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('POST', `/api/projects/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects/archived"] });
      toast({ 
        title: "Project archived successfully!", 
        description: "The completed project has been moved to archives." 
      });
    },
    onError: (error: any) => {
      console.error('Project archive failed:', error);
      toast({ 
        title: "Error", 
        description: "Failed to archive project.",
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
    console.log('Navigating to project:', projectId);
    // Navigate to dashboard with project section
    const newUrl = `/dashboard?section=project-${projectId}`;
    setLocation(newUrl);
    
    // Update the URL in the browser history
    window.history.pushState({}, '', newUrl);
    
    // Trigger the dashboard section change if available
    if ((window as any).dashboardSetActiveSection) {
      (window as any).dashboardSetActiveSection(`project-${projectId}`);
    }
  };

  const handleStatusChange = (projectId: number, newStatus: string) => {
    const project = projects?.find(p => p.id === projectId);
    if (project && canEditProject(user, project)) {
      updateProjectMutation.mutate({ id: projectId, status: newStatus });
    }
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setShowEditDialog(true);
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      editProjectMutation.mutate({ 
        id: editingProject.id, 
        projectData: {
          title: editingProject.title,
          description: editingProject.description,
          status: editingProject.status,
          priority: editingProject.priority,
          category: editingProject.category,
          assigneeName: editingProject.assigneeName,
          assigneeIds: editingProject.assigneeIds,
          dueDate: editingProject.dueDate,
          estimatedHours: editingProject.estimatedHours,
          budget: editingProject.budget
        }
      });
    }
  };

  const handleDeleteProject = (projectId: number, projectTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    const project = projects?.find(p => p.id === projectId);
    if (project && canDeleteProject(user, project) && confirm(`Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  // Function to send kudos to all project assignees when project is completed
  const sendKudosForProjectCompletion = async (project: Project, projectTitle: string) => {
    if (!user?.id) return;

    try {
      // Get all assignees for this project
      const assigneesToNotify = [];
      
      // Handle multiple assignees from assigneeIds array
      if (project.assigneeIds && project.assigneeIds.length > 0) {
        for (let i = 0; i < project.assigneeIds.length; i++) {
          const assigneeId = project.assigneeIds[i];
          const assigneeName = project.assigneeNames?.[i] || `User ${assigneeId}`;
          
          // Don't send kudos to yourself
          if (assigneeId !== user.id) {
            assigneesToNotify.push({ id: assigneeId, name: assigneeName });
          }
        }
      } 
      // Handle single assignee from legacy assigneeId field
      else if (project.assigneeId && project.assigneeId !== user.id) {
        assigneesToNotify.push({ 
          id: project.assigneeId, 
          name: project.assigneeName || `User ${project.assigneeId}` 
        });
      }

      // Send kudos to each assignee
      for (const assignee of assigneesToNotify) {
        try {
          await apiRequest("POST", "/api/messaging/kudos", {
            recipientId: assignee.id,
            recipientName: assignee.name,
            contextType: "project",
            contextId: project.id.toString(),
            entityName: projectTitle,
            customMessage: `🎉 Congratulations on completing "${projectTitle}"! Amazing work!`
          });

          console.log(`Kudos sent to ${assignee.name} for project completion`);
        } catch (error) {
          console.error(`Failed to send kudos to ${assignee.name}:`, error);
        }
      }

      if (assigneesToNotify.length > 0) {
        toast({
          title: "🎉 Kudos sent!",
          description: `Congratulations sent to ${assigneesToNotify.length} team member${assigneesToNotify.length > 1 ? 's' : ''} for completing "${projectTitle}"`,
        });
      }
    } catch (error) {
      console.error('Failed to send project completion kudos:', error);
    }
  };

  const handleMarkComplete = async (projectId: number, projectTitle: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    const project = projects?.find(p => p.id === projectId);
    if (project && canEditProject(user, project) && confirm(`Mark "${projectTitle}" as completed?`)) {
      // Update project status first
      updateProjectMutation.mutate({ id: projectId, status: 'completed' });
      
      toast({
        title: "🎉 Project completed!",
        description: `"${projectTitle}" has been marked as completed. Time to celebrate!`
      });
      
      // Trigger celebration for project completion
      triggerCelebration();
      
      // Send kudos to all assignees
      await sendKudosForProjectCompletion(project);
    }
  };

  const handleStatusQuickChange = async (projectId: number, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    const project = projects?.find(p => p.id === projectId);
    if (project && canEditProject(user, project)) {
      updateProjectMutation.mutate({ id: projectId, status: newStatus });
      toast({
        title: "Status updated",
        description: `Project status changed to ${newStatus.replace('_', ' ')}`
      });
      
      // If project is being completed, send kudos to all assignees
      if (newStatus === 'completed') {
        await sendKudosForProjectCompletion(project);
        triggerCelebration();
      }
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title?.trim()) {
      // Add creator information to the project
      const projectWithCreator = {
        ...newProject,
        createdBy: user?.id || '',
        createdByName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || ''
      };
      createProjectMutation.mutate(projectWithCreator);
    }
  };

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

  const filterProjectsByStatus = (status: string) => {
    if (status === "in_progress") {
      return projects.filter((project: Project) => project.status === "in_progress");
    }
    return projects.filter((project: Project) => project.status === status);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return '💻';
      case 'marketing': return '📈';
      case 'operations': return '⚙️';
      case 'community': return '👥';
      case 'fundraising': return '💰';
      case 'event': return '🎉';
      default: return '📋';
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'technology': return 'from-blue-500 to-indigo-600';
      case 'marketing': return 'from-green-500 to-emerald-600';
      case 'operations': return 'from-[#236383] to-blue-700';
      case 'community': return 'from-purple-500 to-pink-600';
      case 'fundraising': return 'from-[#FBAD3F] to-orange-600';
      case 'event': return 'from-rose-500 to-red-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'completed': return 'from-green-50 to-emerald-50 border-green-200';
      case 'in_progress': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'waiting': return 'from-amber-50 to-yellow-50 border-amber-200';
      case 'available': return 'from-purple-50 to-pink-50 border-purple-200';
      default: return 'from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const renderProjectCard = (project: Project) => (
    <Card 
      key={project.id} 
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br ${getStatusGradient(project.status)} border-2 overflow-hidden`}
      onClick={() => handleProjectClick(project.id)}
    >
      {/* Colorful Category Header */}
      <div className={`h-2 bg-gradient-to-r ${getCategoryGradient(project.category)}`}></div>
      
      <CardContent className="p-3">
        {/* Compact Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1">
              {/* Category Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryGradient(project.category)} flex items-center justify-center text-white text-sm shadow-sm`}>
                {getCategoryIcon(project.category)}
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-tight font-roboto">
                {project.title}
              </h3>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              {/* Vibrant Priority Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold font-roboto text-white shadow-sm ${
                project.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                project.priority === 'medium' ? 'bg-gradient-to-r from-[#FBAD3F] to-orange-500' :
                'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}>
                {project.priority} priority
              </span>
              
              {/* Vibrant Status Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold font-roboto capitalize text-white shadow-sm ${
                project.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                project.status === 'in_progress' ? 'bg-gradient-to-r from-[#236383] to-blue-600' :
                project.status === 'waiting' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                'bg-gradient-to-r from-purple-500 to-pink-600'
              }`}>
                {project.status ? project.status.replace('_', ' ') : 'available'}
              </span>
            </div>
          </div>
          {canEditProject(user, project) && (
            <div className="flex gap-1 shrink-0">
              {project.status !== 'completed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleMarkComplete(project.id, project.title, e)}
                  className="h-6 w-6 p-0 hover:bg-green-50"
                  title="Complete"
                >
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 p-0 hover:bg-gray-50"
                    title="Actions"
                  >
                    <Settings className="h-3 w-3 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => handleStatusQuickChange(project.id, 'available', e)}>
                    <Circle className="w-4 h-4 mr-2 text-purple-600" />
                    Available
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleStatusQuickChange(project.id, 'in_progress', e)}>
                    <Play className="w-4 h-4 mr-2 text-blue-600" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => handleStatusQuickChange(project.id, 'completed', e)}>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => handleEditProject(project, e)}>
                    <Edit className="w-4 h-4 mr-2 text-blue-600" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => handleDeleteProject(project.id, project.title, e)}
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

        {/* Compact description */}
        {project.description && (
          <p className="text-xs text-slate-600 mb-2 line-clamp-2 font-roboto">
            {project.description}
          </p>
        )}

        {/* Compact assignment and progress row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-600 truncate">
              {project.assigneeName ? project.assigneeName.split(', ').slice(0, 1).join('') + (project.assigneeName.split(', ').length > 1 ? '...' : '') : 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-slate-600">{(project as any).progress || 0}%</span>
          </div>
        </div>
        
        {/* Ultra-compact progress bar with TSP colors */}
        <div className="mb-2">
          <div className={`w-full h-1 rounded-full overflow-hidden ${
            project.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <div 
              className={`h-full transition-all duration-300 ${
                project.status === 'completed' 
                  ? 'bg-green-500' 
                  : (project as any).progress > 50 
                    ? 'bg-[#FBAD3F]' 
                    : 'bg-[#236383]'
              }`}
              style={{ width: `${(project as any).progress || 0}%` }}
            />
          </div>
        </div>

        {/* Compact footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
          </div>
          
          {project.status === 'completed' ? (
            <div className="flex gap-1 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Archive this completed project?')) {
                    archiveProjectMutation.mutate(project.id);
                  }
                }}
                disabled={archiveProjectMutation.isPending}
                className="h-6 px-2 text-xs"
              >
                {archiveProjectMutation.isPending ? (
                  <div className="animate-spin rounded-full h-2 w-2 border-b border-purple-600"></div>
                ) : (
                  <Archive className="w-3 h-3" />
                )}
              </Button>
              
              {/* Compact kudos buttons */}
              {project.assigneeIds && project.assigneeIds.length > 0 ? (
                project.assigneeIds.map((assigneeId, index) => {
                  const assigneeName = project.assigneeNames?.[index] || `User ${assigneeId}`;
                  return user?.id !== assigneeId ? (
                    <SendKudosButton
                      key={assigneeId}
                      recipientId={assigneeId}
                      recipientName={assigneeName}
                      contextType="project"
                      contextId={project.id.toString()}
                      entityName={project.title}
                      size="sm"
                    />
                  ) : null;
                })
              ) : (
                project.assigneeId && project.assigneeName && user?.id !== project.assigneeId ? (
                  <SendKudosButton
                    recipientId={project.assigneeId}
                    recipientName={project.assigneeName}
                    contextType="project"
                    contextId={project.id.toString()}
                    entityName={project.title}
                    size="sm"
                  />
                ) : null
              )}
            </div>
          ) : (
            <ArrowRight className="w-3 h-3 text-slate-400" />
          )}
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
    <div className="p-4 sm:p-6 bg-white min-h-screen">
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
            className="bg-[#FBAD3F] hover:bg-[#f09f2b] text-white font-roboto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Clean Status Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
        <Button
          variant={activeTab === "available" ? "default" : "outline"}
          onClick={() => setActiveTab("available")}
          className={`font-roboto ${activeTab === "available" 
            ? "bg-[#236383] hover:bg-[#1e5470] text-white" 
            : "text-[#236383] border-[#236383] hover:bg-[#236383]/10"}`}
        >
          <Circle className="w-4 h-4 mr-2" />
          Available ({allProjects.filter(p => p.status === "available").length})
        </Button>
        
        <Button
          variant={activeTab === "active" ? "default" : "outline"}
          onClick={() => setActiveTab("active")}
          className={`font-roboto ${activeTab === "active" 
            ? "bg-[#236383] hover:bg-[#1e5470] text-white" 
            : "text-[#236383] border-[#236383] hover:bg-[#236383]/10"}`}
        >
          <Play className="w-4 h-4 mr-2" />
          Active ({allProjects.filter(p => p.status === "in_progress").length})
        </Button>
        
        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          onClick={() => setActiveTab("completed")}
          className={`font-roboto ${activeTab === "completed" 
            ? "bg-[#236383] hover:bg-[#1e5470] text-white" 
            : "text-[#236383] border-[#236383] hover:bg-[#236383]/10"}`}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed ({allProjects.filter(p => p.status === "completed").length})
        </Button>
        
        <Button
          variant={activeTab === "archived" ? "default" : "outline"}
          onClick={() => setActiveTab("archived")}
          className={`font-roboto ${activeTab === "archived" 
            ? "bg-[#236383] hover:bg-[#1e5470] text-white" 
            : "text-[#236383] border-[#236383] hover:bg-[#236383]/10"}`}
        >
          <Archive className="w-4 h-4 mr-2" />
          Archived ({(archivedProjects as any[])?.length || 0})
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter Buttons */}
          <Button
            variant={showMyProjects ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMyProjects(!showMyProjects)}
            className={`font-roboto ${showMyProjects 
              ? "bg-[#FBAD3F] hover:bg-[#f09f2b] text-white" 
              : "text-[#FBAD3F] border-[#FBAD3F] hover:bg-[#FBAD3F]/10"}`}
          >
            <User className="w-4 h-4 mr-1" />
            My Projects
          </Button>
          
          <Button
            variant={filterCategory === "technology" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(filterCategory === "technology" ? "all" : "technology")}
            className={`font-roboto ${filterCategory === "technology" 
              ? "bg-[#FBAD3F] hover:bg-[#f09f2b] text-white" 
              : "text-[#FBAD3F] border-[#FBAD3F] hover:bg-[#FBAD3F]/10"}`}
          >
            💻 Tech
          </Button>
          
          <Button
            variant={filterCategory === "events" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(filterCategory === "events" ? "all" : "events")}
            className={`font-roboto ${filterCategory === "events" 
              ? "bg-[#FBAD3F] hover:bg-[#f09f2b] text-white" 
              : "text-[#FBAD3F] border-[#FBAD3F] hover:bg-[#FBAD3F]/10"}`}
          >
            📅 Events
          </Button>
          
          <Button
            variant={filterCategory === "grants" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(filterCategory === "grants" ? "all" : "grants")}
            className={`font-roboto ${filterCategory === "grants" 
              ? "bg-[#FBAD3F] hover:bg-[#f09f2b] text-white" 
              : "text-[#FBAD3F] border-[#FBAD3F] hover:bg-[#FBAD3F]/10"}`}
          >
            💰 Grants
          </Button>
          
          <Button
            variant={filterCategory === "outreach" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(filterCategory === "outreach" ? "all" : "outreach")}
            className={`font-roboto ${filterCategory === "outreach" 
              ? "bg-[#FBAD3F] hover:bg-[#f09f2b] text-white" 
              : "text-[#FBAD3F] border-[#FBAD3F] hover:bg-[#FBAD3F]/10"}`}
          >
            🤝 Outreach
          </Button>
        </div>

        {/* Sort/Filter Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-[#236383] border-[#236383] hover:bg-[#236383]/10 font-roboto"
        >
          <Settings className="w-4 h-4 mr-2" />
          Sort & Filter
        </Button>
      </div>

      {/* Collapsible Sort/Filter Controls */}
      {showFilters && (
        <Card className="mb-6 border-[#236383]/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category-filter" className="text-sm font-medium text-[#236383] font-roboto">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger id="category-filter" className="mt-1 border-[#236383]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technology">💻 Technology</SelectItem>
                    <SelectItem value="events">📅 Events</SelectItem>
                    <SelectItem value="grants">💰 Grants</SelectItem>
                    <SelectItem value="outreach">🤝 Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort-by" className="text-sm font-medium text-[#236383] font-roboto">Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort-by" className="mt-1 border-[#236383]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Alphabetical</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sort-order" className="text-sm font-medium text-[#236383] font-roboto">Order</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sort-order" className="mt-1 border-[#236383]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A-Z / Low-High</SelectItem>
                    <SelectItem value="desc">Z-A / High-Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="mt-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            {activeTab === "available" && (
              <>
                <Circle className="w-12 h-12 text-[#236383]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#236383] font-roboto mb-2">No Available Projects</h3>
                <p className="text-gray-600 font-roboto">All projects are currently assigned or completed.</p>
              </>
            )}
            {activeTab === "active" && (
              <>
                <Play className="w-12 h-12 text-[#236383]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#236383] font-roboto mb-2">No Active Projects</h3>
                <p className="text-gray-600 font-roboto">No projects are currently in progress.</p>
              </>
            )}
            {activeTab === "completed" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-[#236383]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#236383] font-roboto mb-2">No Completed Projects</h3>
                <p className="text-gray-600 font-roboto">Completed projects will appear here.</p>
              </>
            )}
            {activeTab === "archived" && (
              <>
                <Archive className="w-12 h-12 text-[#236383]/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#236383] font-roboto mb-2">No Archived Projects</h3>
                <p className="text-gray-600 font-roboto">Archived projects will appear here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map(renderProjectCard)}
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={newProject.title || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="Enter project title"
                  className="h-11 text-base"
                />
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe the project goals and requirements"
                  className="text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newProject.status} onValueChange={(value) => setNewProject(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newProject.priority} onValueChange={(value) => setNewProject(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
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
                <Label htmlFor="category">Category</Label>
                <Select value={newProject.category} onValueChange={(value) => setNewProject(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">💻 Tech</SelectItem>
                    <SelectItem value="events">📅 Events</SelectItem>
                    <SelectItem value="grants">💰 Grants</SelectItem>
                    <SelectItem value="outreach">🤝 Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <ProjectAssigneeSelector
                  value={newProject.assigneeName || ''}
                  onChange={(value, userIds) => setNewProject(prev => ({ 
                    ...prev, 
                    assigneeName: value,
                    assigneeIds: userIds?.length ? userIds : undefined,
                    assigneeNames: value // Store the display names as well
                  }))}
                  label="Team Members"
                  placeholder="Add team members (multiple allowed)"
                  multiple={true}
                />
              </div>
              
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newProject.startDate || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                />
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
              
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  value={newProject.estimatedHours || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="text"
                  value={newProject.budget || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="e.g., $500 or TBD"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending || !newProject.title?.trim()}
                className="btn-tsp-primary text-white"
              >
                {createProjectMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingProject?.title || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingProject?.description || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingProject?.status || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, status: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={editingProject?.priority || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, priority: value } : null)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingProject?.category || ''} 
                  onValueChange={(value) => setEditingProject(prev => prev ? { ...prev, category: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">💻 Tech</SelectItem>
                    <SelectItem value="events">📅 Events</SelectItem>
                    <SelectItem value="grants">💰 Grants</SelectItem>
                    <SelectItem value="outreach">🤝 Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <ProjectAssigneeSelector
                  value={editingProject?.assigneeName || ''}
                  onChange={(value, userIds) => setEditingProject(prev => prev ? { 
                    ...prev, 
                    assigneeName: value,
                    assigneeIds: userIds?.length ? userIds : undefined,
                    assigneeNames: value // Store the display names as well
                  } : null)}
                  label="Team Members"
                  placeholder="Add team members (multiple allowed)"
                  multiple={true}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editingProject?.startDate || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingProject?.dueDate || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-estimatedHours">Estimated Hours</Label>
                <Input
                  id="edit-estimatedHours"
                  type="number"
                  min="0"
                  value={editingProject?.estimatedHours || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, estimatedHours: parseInt(e.target.value) || 0 } : null)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-budget">Budget</Label>
                <Input
                  id="edit-budget"
                  type="text"
                  value={editingProject?.budget || ''}
                  onChange={(e) => setEditingProject(prev => prev ? { ...prev, budget: e.target.value } : null)}
                  placeholder="e.g., $500 or TBD"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingProject(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={editProjectMutation.isPending || !editingProject?.title?.trim()}
                className="btn-tsp-primary text-white"
              >
                {editProjectMutation.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}