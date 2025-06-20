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
import { ArrowLeft, CheckCircle2, Circle, MessageSquare, Users, Calendar, FileText } from "lucide-react";
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
        blockers: project.blockers || "",
        budget: project.budget || "",
        timeline: project.timeline || "",
        stakeholders: project.stakeholders || "",
        risks: project.risks || ""
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
      return apiRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
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
    mutationFn: async (task: typeof newTask) => {
      return apiRequest(`/api/projects/${id}/tasks`, {
        method: "POST",
        body: JSON.stringify({ ...task, projectId: parseInt(id!) })
      });
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
      return apiRequest(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
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
      return apiRequest(`/api/projects/${id}/tasks/${taskId}`, {
        method: "DELETE"
      });
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
      return apiRequest(`/api/projects/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({
          projectId: parseInt(id!),
          content: comment,
          authorName: "Current User",
          commentType: "general"
        })
      });
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

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTaskMutation.mutate(newTask);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation("/projects")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {editingProject ? (
                  <Input
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="text-3xl font-bold"
                  />
                ) : (
                  project.title
                )}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${getStatusColor(project.status || "active")} text-white`}>
                  {project.status?.replace("_", " ") || "Active"}
                </Badge>
                <Badge className={`${getPriorityColor(project.priority || "medium")} text-white`}>
                  {project.priority || "Medium"} Priority
                </Badge>
                <Badge variant="outline">
                  {completedTasks}/{totalTasks} Tasks Complete ({progressPercentage}%)
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editingProject ? (
              <>
                <Button onClick={handleProjectSave} disabled={updateProjectMutation.isPending}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingProject(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditingProject(true)}>
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
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project.description || "No description provided"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category</span>
                  <p className="text-lg">{project.category || "Uncategorized"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="text-lg">{new Date(project.createdAt || "").toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Updated</span>
                  <p className="text-lg">{new Date(project.updatedAt || "").toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Files
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
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
                    <Button onClick={handleAddTask} disabled={addTaskMutation.isPending || !newTask.title.trim()}>
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
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleTaskStatusChange(task.id, task.status === "completed" ? "pending" : "completed")}
                              className="mt-0.5"
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
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx"
                                onChange={(e) => e.target.files && handleFileUpload(task.id, e.target.files)}
                                className="hidden"
                                id={`file-upload-${task.id}`}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => document.getElementById(`file-upload-${task.id}`)?.click()}
                              >
                                📎
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTaskEdit(task)}
                              >
                                ✏️
                              </Button>
                              <Select
                                value={task.status}
                                onValueChange={(value) => handleTaskStatusChange(task.id, value)}
                              >
                                <SelectTrigger className="w-32">
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
                              >
                                🗑️
                              </Button>
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
                <CardTitle>Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  File management coming soon...
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}