import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Clock, User, Target, CheckCircle2, Circle, AlertCircle, Plus, X, Edit3, Save, MessageSquare, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, ProjectTask, ProjectComment, InsertProjectTask, InsertProjectComment } from "@shared/schema";

export default function ProjectDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" });
  const [newComment, setNewComment] = useState("");
  const [taskFiles, setTaskFiles] = useState<{ [taskId: number]: FileList | null }>({});
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
        status: project.status || "",
        priority: project.priority || "",
        dueDate: project.dueDate || "",
        assigneeName: project.assigneeName || "",
        estimatedHours: project.estimatedHours || 0,
        actualHours: project.actualHours || 0,
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

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (updates: Partial<Project>) => {
      await apiRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(false);
      toast({ title: "Project updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update project", variant: "destructive" });
    },
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (task: InsertProjectTask) => {
      await apiRequest(`/api/projects/${id}/tasks`, {
        method: "POST",
        body: JSON.stringify(task),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      setNewTask({ title: "", description: "", priority: "medium" });
      toast({ title: "Task added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add task", variant: "destructive" });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<ProjectTask> }) => {
      await apiRequest(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/tasks`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      setEditingTask(null);
      toast({ title: "Task updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: InsertProjectComment) => {
      await apiRequest(`/api/projects/${id}/comments`, {
        method: "POST",
        body: JSON.stringify(comment),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/comments`] });
      setNewComment("");
      toast({ title: "Comment added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add comment", variant: "destructive" });
    },
  });

  if (projectLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Not Found</h2>
        <Button onClick={() => setLocation("/projects")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "available": return "bg-purple-500";
      case "waiting": return "bg-gray-500";
      default: return "bg-gray-500";
    }
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

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    
    addTaskMutation.mutate({
      projectId: parseInt(id!),
      title: newTask.title,
      description: newTask.description || null,
      priority: newTask.priority,
      status: "pending",
      assigneeName: null,
      dueDate: null,
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      projectId: parseInt(id!),
      authorName: "Current User", // This will be replaced with actual user data
      content: newComment,
      commentType: "general",
    });
  };

  const completedTasks = tasks.filter((task: ProjectTask) => task.status === "completed").length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/projects")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status || "")}`}></div>
              <Badge variant="outline" className="capitalize">
                {project.status?.replace("_", " ") || "No Status"}
              </Badge>
              <Badge className={`${getPriorityColor(project.priority || "")} text-white capitalize`}>
                {project.priority || "No Priority"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editingProject ? (
            <>
              <Button onClick={handleProjectSave} disabled={updateProjectMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={() => setEditingProject(false)} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditingProject(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </div>

      {/* Project Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingProject ? (
                <div className="space-y-4">
                  <Input
                    value={projectForm.title || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="text-xl font-bold"
                    placeholder="Project title"
                  />
                  <Textarea
                    value={projectForm.description || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Project description"
                  />
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      value={projectForm.assigneeName || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, assigneeName: e.target.value })}
                      placeholder="Project Owner/Assignee"
                    />
                    <Input
                      type="date"
                      value={projectForm.dueDate || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
                      placeholder="Due Date"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={projectForm.status} onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={projectForm.priority} onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {project.description || "No description provided"}
                  </CardDescription>
                </>
              )}
            </div>
            
            <div className="ml-6 text-right space-y-2">
              {project.dueDate && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  Due: {new Date(project.dueDate).toLocaleDateString()}
                </div>
              )}
              {project.assigneeName && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 mr-1" />
                  {project.assigneeName}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedTasks}/{totalTasks} tasks completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            {/* Project Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {project.estimatedHours || 0}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Estimated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {project.actualHours || 0}h
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Actual</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed sections */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Tasks</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Task Form */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                      <SelectTrigger className="w-32">
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
              </div>
              
              {/* Task List */}
              <div className="space-y-2">
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