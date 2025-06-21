import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle2, Circle, MessageSquare, Users, Calendar, FileText, Upload, ExternalLink, Trash2, FolderOpen, Clock, Plus, Edit, Download, Eye } from "lucide-react";
import type { Project, ProjectTask, ProjectComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CollapsibleNav } from "@/components/collapsible-nav";

export default function ProjectDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for editing modes
  const [editingProject, setEditingProject] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    status: "",
    requirements: "",
    deliverables: "",
    resources: "",
    blockers: ""
  });

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    assigneeId: null as number | null
  });

  const [newComment, setNewComment] = useState({
    content: "",
    author: ""
  });

  // Fetch project data
  const { data: project, isLoading: projectLoading, error } = useQuery({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery<ProjectTask[]>({
    queryKey: [`/api/projects/${id}/tasks`],
    enabled: !!id
  });

  // Fetch comments
  const { data: comments = [] } = useQuery<ProjectComment[]>({
    queryKey: [`/api/projects/${id}/comments`],
    enabled: !!id
  });

  // Fetch project files
  const { data: projectFiles = [] } = useQuery({
    queryKey: [`/api/projects/${id}/files`],
    enabled: !!id
  });

  // Update mutations
  const updateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setEditingProject(false);
      setEditingDetails(false);
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    }
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const response = await apiRequest(`/api/projects/${id}/tasks`, {
        method: "POST",
        body: JSON.stringify({ ...taskData, projectId: parseInt(id!) })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      setNewTask({ title: "", description: "", priority: "medium", assigneeId: null });
      toast({ title: "Task added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await apiRequest(`/api/projects/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ ...commentData, projectId: parseInt(id!) })
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/comments`] });
      setNewComment({ content: "", author: "" });
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  });

  // Handle project save
  const handleProjectSave = () => {
    updateProjectMutation.mutate(projectForm);
  };

  // Handle details save
  const handleDetailsSave = () => {
    updateProjectMutation.mutate({
      requirements: projectForm.requirements,
      deliverables: projectForm.deliverables,
      resources: projectForm.resources,
      blockers: projectForm.blockers
    });
  };

  // Handle task add
  const handleTaskAdd = () => {
    if (!newTask.title.trim()) return;
    addTaskMutation.mutate(newTask);
  };

  // Handle comment add
  const handleCommentAdd = () => {
    if (!newComment.content.trim() || !newComment.author.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  // Initialize form when project loads
  useEffect(() => {
    if (project) {
      setProjectForm({
        title: project.title,
        description: project.description || "",
        category: project.category,
        priority: project.priority,
        status: project.status,
        requirements: project.requirements || "",
        deliverables: project.deliverables || "",
        resources: project.resources || "",
        blockers: project.blockers || ""
      });
    }
  }, [project]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "on_hold": return "bg-yellow-500";
      case "completed": return "bg-blue-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-red-600">Project not found</div>
            <Button onClick={() => setLocation("/projects")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((task: ProjectTask) => task.status === "completed").length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CollapsibleNav />
      <div className="lg:ml-16 transition-all duration-300">
        {/* Hero Header */}
        <div className="bg-white shadow-lg border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-center gap-6 mb-8">
              <Button variant="outline" onClick={() => setLocation("/projects")} className="flex items-center gap-2 px-4 py-2">
                <ArrowLeft className="w-5 h-5" />
                Back to Projects
              </Button>
              <div className="h-8 w-px bg-gray-300"></div>
              <span className="text-gray-600 font-medium text-lg">Project Details</span>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex-1">
                {editingProject ? (
                  <Input
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="text-5xl font-bold border-none p-0 h-auto bg-transparent focus:ring-0 mb-6"
                  />
                ) : (
                  <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">{project.title}</h1>
                )}
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Badge className={`${getStatusColor(project.status || "active")} text-white px-4 py-2 text-base font-medium`}>
                    {project.status?.replace("_", " ") || "Active"}
                  </Badge>
                  <Badge className={`${getPriorityColor(project.priority || "medium")} text-white px-4 py-2 text-base font-medium`}>
                    {project.priority || "Medium"} Priority
                  </Badge>
                  <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-gray-600" />
                    <span className="text-base font-medium text-gray-700">
                      {completedTasks}/{totalTasks} Tasks ({progressPercentage}%)
                    </span>
                  </div>
                </div>
                
                {!editingProject && project.description && (
                  <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
                    {project.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {editingProject ? (
                  <>
                    <Button onClick={handleProjectSave} disabled={updateProjectMutation.isPending} size="lg" className="px-8 py-3 text-base">
                      {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProject(false)} size="lg" className="px-8 py-3 text-base">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setEditingProject(true)} size="lg" className="px-8 py-3 text-base">
                    Edit Project
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Edit Project Form */}
          {editingProject && (
            <div className="bg-white rounded-2xl shadow-sm border p-10 mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Edit Project Information</h2>
              <div className="space-y-8">
                <div>
                  <label className="block text-xl font-semibold mb-4">Description</label>
                  <Textarea
                    value={projectForm.description || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe what this project is about and its purpose..."
                    rows={5}
                    className="text-lg leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xl font-semibold mb-4">Category</label>
                    <Input
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      placeholder="e.g. Community Outreach, Fundraising"
                      className="text-lg py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-xl font-semibold mb-4">Priority</label>
                    <Select
                      value={projectForm.priority}
                      onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}
                    >
                      <SelectTrigger className="text-lg py-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Cards */}
          {!editingProject && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="bg-white rounded-2xl shadow-sm border p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-500 mb-1">Created</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(project.createdAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-500 mb-1">Category</p>
                    <p className="text-xl font-bold text-gray-900">
                      {project.category || "Uncategorized"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-500 mb-1">Last Updated</p>
                    <p className="text-xl font-bold text-gray-900">
                      {new Date(project.updatedAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border p-2 mb-8">
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent gap-2">
                <TabsTrigger 
                  value="details" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                >
                  <FileText className="w-5 h-5" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium rounded-xl data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="comments" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-sm transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </TabsTrigger>
                <TabsTrigger 
                  value="files" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium rounded-xl data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Files
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
                    <div className="flex items-center gap-3">
                      {editingDetails ? (
                        <>
                          <Button onClick={handleDetailsSave} disabled={updateProjectMutation.isPending} className="px-6 py-2">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingDetails(false)} className="px-6 py-2">
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setEditingDetails(true)} className="px-6 py-2">
                          Edit Details
                        </Button>
                      )}
                    </div>
                  </div>

                  {editingDetails ? (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <label className="block text-xl font-bold text-blue-900">Goals & Impact</label>
                        </div>
                        <Textarea
                          value={projectForm.requirements || ""}
                          onChange={(e) => setProjectForm({ ...projectForm, requirements: e.target.value })}
                          placeholder="What are the goals of this project? Who will it help and what impact will it have?"
                          rows={5}
                          className="text-base leading-relaxed border-blue-200 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <label className="block text-xl font-bold text-green-900">Volunteer Needs</label>
                        </div>
                        <Textarea
                          value={projectForm.deliverables || ""}
                          onChange={(e) => setProjectForm({ ...projectForm, deliverables: e.target.value })}
                          placeholder="What types of volunteers are needed? Skills, time commitment, special requirements..."
                          rows={5}
                          className="text-base leading-relaxed border-green-200 focus:border-green-500"
                        />
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <label className="block text-xl font-bold text-purple-900">Resources & Materials</label>
                        </div>
                        <Textarea
                          value={projectForm.resources || ""}
                          onChange={(e) => setProjectForm({ ...projectForm, resources: e.target.value })}
                          placeholder="What materials, supplies, or funding are needed for this project?"
                          rows={5}
                          className="text-base leading-relaxed border-purple-200 focus:border-purple-500"
                        />
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <label className="block text-xl font-bold text-orange-900">Project Notes</label>
                        </div>
                        <Textarea
                          value={projectForm.blockers || ""}
                          onChange={(e) => setProjectForm({ ...projectForm, blockers: e.target.value })}
                          placeholder="Additional notes, challenges, or important information about this project..."
                          rows={5}
                          className="text-base leading-relaxed border-orange-200 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-blue-900">Goals & Impact</h3>
                        </div>
                        <div className="text-base text-blue-800 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {project.requirements || (
                            <span className="text-blue-500 italic">
                              Click "Edit Details" to add information about the project goals and expected impact.
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-green-900">Volunteer Needs</h3>
                        </div>
                        <div className="text-base text-green-800 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {project.deliverables || (
                            <span className="text-green-500 italic">
                              Click "Edit Details" to specify what types of volunteers and skills are needed.
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-purple-900">Resources & Materials</h3>
                        </div>
                        <div className="text-base text-purple-800 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {project.resources || (
                            <span className="text-purple-500 italic">
                              Click "Edit Details" to list required materials, supplies, or funding.
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-orange-900">Project Notes</h3>
                        </div>
                        <div className="text-base text-orange-800 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                          {project.blockers || (
                            <span className="text-orange-500 italic">
                              Click "Edit Details" to add additional notes or important information.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Project Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add Task Form */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Task Title</label>
                          <Input
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            placeholder="Enter task title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Input
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="Task description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Priority</label>
                          <Select
                            value={newTask.priority}
                            onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}
                          >
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
                      </div>
                      <Button onClick={handleTaskAdd} disabled={addTaskMutation.isPending}>
                        {addTaskMutation.isPending ? "Adding..." : "Add Task"}
                      </Button>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3">
                      {tasks.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No tasks yet. Add one above!</p>
                      ) : (
                        tasks.map((task: ProjectTask) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <div className="flex-shrink-0">
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{task.title}</div>
                              {task.description && (
                                <div className="text-sm text-gray-500">{task.description}</div>
                              )}
                            </div>
                            <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                              {task.priority}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Project Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Comment Form */}
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Your Name</label>
                          <Input
                            value={newComment.author}
                            onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Comment</label>
                        <Textarea
                          value={newComment.content}
                          onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                          placeholder="Add your comment..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleCommentAdd} disabled={addCommentMutation.isPending}>
                        {addCommentMutation.isPending ? "Adding..." : "Add Comment"}
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {comments.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</p>
                      ) : (
                        comments.map((comment: ProjectComment) => (
                          <div key={comment.id} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-medium">{comment.author}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-gray-700 whitespace-pre-wrap">{comment.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Project Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      {projectFiles.length === 0 ? (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm">No files uploaded yet</p>
                          <p className="text-xs text-gray-400">Upload files to share with your project team</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm">Files will be displayed here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}