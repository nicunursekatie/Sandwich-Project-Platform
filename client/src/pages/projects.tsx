import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Clock, CheckCircle, AlertCircle, FolderOpen, Edit2, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { CollapsibleNav } from '@/components/collapsible-nav';

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'available' | 'waiting' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
    dueDate: ''
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
  });

  const createMutation = useMutation({
    mutationFn: (project: any) => apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...project,
        status: 'available',
        progress: 0
      })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsAddModalOpen(false);
      setNewProject({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: ''
      });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newProject);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  // Separate projects by status
  const activeProjects = projects.filter((project: Project) => project.status === 'active');
  const availableProjects = projects.filter((project: Project) => project.status === 'available');
  const waitingProjects = projects.filter((project: Project) => project.status === 'waiting');
  const completedProjects = projects.filter((project: Project) => project.status === 'completed');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollapsibleNav />
      <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-64">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management</h1>
                <p className="text-gray-600">Organize and track all team projects with interactive task management</p>
              </div>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newProject.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewProject(prev => ({ ...prev, priority: value }))
                  }>
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
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={newProject.assignedTo || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, assignedTo: e.target.value }))}
                    placeholder="Enter assignee name"
                  />
                </div>
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
              </Dialog>
            </div>

            {/* Projects in tab-based layout matching other pages */}
            <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Active ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Available ({availableProjects.length})
          </TabsTrigger>
          <TabsTrigger value="waiting" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Waiting ({waitingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Completed ({completedProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {activeProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
            {activeProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No active projects. Create a new project to get started.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-4">
            {availableProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
            {availableProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No available projects.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="waiting" className="mt-6">
          <div className="grid gap-4">
            {waitingProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
            {waitingProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No waiting projects.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {completedProjects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} onEdit={handleEdit} />
            ))}
            {completedProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No completed projects.
              </div>
            )}
          </div>
        </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function ProjectCard({ project, onEdit }: { project: Project; onEdit: (project: Project) => void }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'waiting': return <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
      case 'completed': return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'available': return <Badge className="bg-blue-100 text-blue-800">Available</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(project.status)}
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority} priority
              </Badge>
              {project.assignedTo && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.assignedTo}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(project)}
              className="flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {project.description && (
          <p className="text-sm text-slate-600 mb-4">{project.description}</p>
        )}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
          {project.dueDate && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}