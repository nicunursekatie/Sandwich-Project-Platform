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
import { ArrowLeft, CheckCircle2, Circle, MessageSquare, Users, Calendar, FileText, Upload, ExternalLink, Trash2 } from "lucide-react";
import type { Project, ProjectTask, ProjectComment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function ProjectDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" });
  const [newComment, setNewComment] = useState("");
  const [editingTaskData, setEditingTaskData] = useState<{ [taskId: number]: { title: string; description: string; priority: string } }>({});
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [projectFiles, setProjectFiles] = useState<any[]>([]);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  // Update project form when project data loads
  useEffect(() => {
    if (project) {
      setProjectForm({
        title: project.title || "",
        description: project.description || "",
        category: project.category || "",
        priority: project.priority || "medium",
        status: project.status || "active",
        requirements: project.requirements || "",
        deliverables: project.deliverables || "",
        resources: project.resources || "",
        blockers: project.blockers || ""
      });
    }
  }, [project]);

  // Fetch project tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<ProjectTask[]>({
    queryKey: [`/api/projects/${id}/tasks`],
    enabled: !!id,
  });

  // Fetch project comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery<ProjectComment[]>({
    queryKey: [`/api/projects/${id}/comments`],
    enabled: !!id,
  });

  // Mutation to update project
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setEditingProject(false);
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    }
  });

  // Mutation to add task
  const addTaskMutation = useMutation({
    mutationFn: async (task: { title: string; description: string; priority: string }) => {
      const response = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      });
      if (!response.ok) throw new Error('Add task failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      setNewTask({ title: "", description: "", priority: "medium" });
      toast({ title: "Task added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    }
  });

  // Mutation to update task
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<ProjectTask> }) => {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Update task failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    }
  });

  // Mutation to delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error('Delete task failed');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      toast({ title: "Task deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    }
  });

  // Mutation to add comment
  const addCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const response = await fetch(`/api/projects/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: parseInt(id!),
          content: comment,
          authorName: "Current User",
          commentType: "general"
        })
      });
      if (!response.ok) throw new Error('Add comment failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/comments`] });
      setNewComment("");
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    }
  });

  // Mutation to upload project files
  const uploadProjectFilesMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`/api/projects/${id}/files`, {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error('File upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Files uploaded successfully" });
      // Refresh project files list
      fetchProjectFiles();
    },
    onError: () => {
      toast({ title: "Failed to upload files", variant: "destructive" });
    }
  });

  const fetchProjectFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/files`);
      if (response.ok) {
        const files = await response.json();
        setProjectFiles(files);
      }
    } catch (error) {
      console.error('Failed to fetch project files:', error);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const handleProjectSave = () => {
    updateProjectMutation.mutate(projectForm);
  };

  const handleTaskStatusChange = (taskId: number, status: string) => {
    const updates: Partial<ProjectTask> = { status };
    if (status === "completed") {
      updates.completedAt = new Date();
    }
    updateTaskMutation.mutate({ taskId, updates });
  };

  const handleTaskEdit = (task: ProjectTask) => {
    setEditingTask(task.id);
    setEditingTaskData({
      ...editingTaskData,
      [task.id]: {
        title: task.title,
        description: task.description || "",
        priority: task.priority
      }
    });
  };

  const handleTaskSave = (taskId: number) => {
    const taskData = editingTaskData[taskId];
    if (taskData) {
      updateTaskMutation.mutate({ 
        taskId, 
        updates: taskData 
      });
    }
    setEditingTask(null);
  };

  const handleTaskCancel = () => {
    setEditingTask(null);
  };

  const handleProjectFilesUpload = (files: FileList) => {
    uploadProjectFilesMutation.mutate(files);
  };

  // Initialize project form when project data is available
  useEffect(() => {
    if (project) {
      setProjectForm({
        title: project.title,
        description: project.description,
        category: project.category,
        priority: project.priority,
        status: project.status
      });
    }
  }, [project]);

  // Fetch project files on component mount
  useEffect(() => {
    if (id) {
      fetchProjectFiles();
    }
  }, [id]);

  const handleFileUpload = async (taskId: number, files: FileList) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/projects/${id}/tasks/${taskId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
        toast({ title: "Files uploaded successfully" });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({ title: "Failed to upload files", variant: "destructive" });
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/projects")} className="self-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
                {editingProject ? (
                  <Input
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="text-xl sm:text-2xl font-bold"
                  />
                ) : (
                  project.title
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(project.status || "active")} text-white text-xs`}>
                  {project.status?.replace("_", " ") || "Active"}
                </Badge>
                <Badge className={`${getPriorityColor(project.priority || "medium")} text-white text-xs`}>
                  {project.priority || "Medium"} Priority
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {completedTasks}/{totalTasks} Tasks ({progressPercentage}%)
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {editingProject ? (
              <>
                <Button onClick={handleProjectSave} disabled={updateProjectMutation.isPending} size="sm">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditingProject(false)} size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditingProject(true)} size="sm">
                Edit Project
              </Button>
            )}
          </div>
        </div>

        {/* Project Overview */}
        {editingProject ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    placeholder="Project category"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select
                    value={projectForm.priority}
                    onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}
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
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={projectForm.description || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleProjectSave} disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditingProject(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project.description || "No description provided"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-base sm:text-lg break-words">{project.category || "Uncategorized"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="text-base sm:text-lg">{new Date(project.createdAt || "").toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="text-base sm:text-lg">{new Date(project.updatedAt || "").toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tasks</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Details</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Comments</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Files</span>
              <span className="sm:hidden">Files</span>
            </TabsTrigger>
          </TabsList>

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
                  <h3 className="font-medium mb-3">Add New Task</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="sm:col-span-2 lg:col-span-1"
                    />
                    <Input
                      placeholder="Description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="sm:col-span-2 lg:col-span-1"
                    />
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
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
                    <Button 
                      onClick={handleAddTask} 
                      disabled={addTaskMutation.isPending || !newTask.title.trim()}
                      className="w-full"
                    >
                      Add Task
                    </Button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {tasksLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading tasks...</div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No tasks yet. Add one above!</div>
                  ) : (
                    tasks.map((task: ProjectTask) => (
                      <div key={task.id} className="border rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleTaskStatusChange(task.id, task.status === "completed" ? "pending" : "completed")}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            
                            <div className="flex-1">
                              {editingTask === task.id ? (
                                <div className="space-y-3">
                                  <Input
                                    value={editingTaskData[task.id]?.title || task.title}
                                    onChange={(e) => setEditingTaskData({
                                      ...editingTaskData,
                                      [task.id]: { ...editingTaskData[task.id], title: e.target.value }
                                    })}
                                    placeholder="Task title"
                                  />
                                  <Textarea
                                    value={editingTaskData[task.id]?.description || task.description || ""}
                                    onChange={(e) => setEditingTaskData({
                                      ...editingTaskData,
                                      [task.id]: { ...editingTaskData[task.id], description: e.target.value }
                                    })}
                                    placeholder="Task description"
                                    rows={2}
                                  />
                                  <Select
                                    value={editingTaskData[task.id]?.priority || task.priority}
                                    onValueChange={(value) => setEditingTaskData({
                                      ...editingTaskData,
                                      [task.id]: { ...editingTaskData[task.id], priority: value }
                                    })}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleTaskSave(task.id)}>
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleTaskCancel}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h4 className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge className={`${getPriorityColor(task.priority)} text-white text-xs`}>
                                      {task.priority}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {task.status.replace("_", " ")}
                                    </Badge>
                                    {task.completedAt && (
                                      <span className="text-xs text-gray-500">
                                        Completed {new Date(task.completedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* File Attachments */}
                                  {task.attachments && (() => {
                                    try {
                                      const attachments = JSON.parse(task.attachments);
                                      return attachments.length > 0 ? (
                                        <div className="mt-2">
                                          <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {attachments.map((file: any, index: number) => (
                                              <Badge key={index} variant="outline" className="text-xs">
                                                📎 {file.originalname}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null;
                                    } catch {
                                      return null;
                                    }
                                  })()}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {editingTask !== task.id && (
                            <div className="flex flex-col gap-2 mt-3 sm:mt-0 sm:flex-row sm:items-center sm:ml-auto sm:flex-shrink-0">
                              <input
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                                onChange={(e) => e.target.files && handleFileUpload(task.id, e.target.files)}
                                className="hidden"
                                id={`file-upload-${task.id}`}
                              />
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
                                  className="p-2"
                                  title="Attach file"
                                >
                                  📎
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleTaskEdit(task)}
                                  className="p-2"
                                  title="Edit task"
                                >
                                  ✏️
                                </Button>
                                <Select
                                  value={task.status}
                                  onValueChange={(value) => handleTaskStatusChange(task.id, value)}
                                >
                                  <SelectTrigger className="w-24 sm:w-28 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  className="p-2"
                                  title="Delete task"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.requirements || "No requirements specified"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.deliverables || "No deliverables specified"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.resources || "No resources specified"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Blockers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.blockers || "No blockers identified"}
                  </p>
                </CardContent>
              </Card>
            </div>
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
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                  />
                  <Button onClick={handleAddComment} disabled={addCommentMutation.isPending || !newComment.trim()}>
                    Add Comment
                  </Button>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No comments yet. Start the conversation!</div>
                  ) : (
                    comments.map((comment: ProjectComment) => (
                      <div key={comment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{comment.authorName}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.commentType}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
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
                  <FileText className="w-5 h-5" />
                  Project Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    id="project-file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleProjectFilesUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                  <label htmlFor="project-file-upload" className="cursor-pointer">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Click to upload files or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports documents, images, and other project files
                    </p>
                  </label>
                </div>

                {uploadProjectFilesMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Uploading files...
                  </div>
                )}

                {/* Files List */}
                <div className="space-y-2">
                  {projectFiles.length > 0 ? (
                    projectFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{file.name || `File ${index + 1}`}</p>
                            <p className="text-xs text-gray-500">
                              {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Unknown size'} • 
                              {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Recently uploaded'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.url && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <Calendar className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              // Add delete functionality here
                              console.log('Delete file:', file);
                            }}
                          >
                            <Circle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No files uploaded yet</p>
                      <p className="text-xs text-gray-400">Upload files to share with your project team</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}