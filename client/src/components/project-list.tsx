import { useQuery, useMutation } from "@tanstack/react-query";
import { ListTodo, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Project } from "@shared/schema";

export default function ProjectList() {
  const { toast } = useToast();
  
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const claimProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/claim`, {
        assigneeName: "John Doe"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project claimed successfully",
        description: "The project has been assigned to you.",
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
        <span className="text-sm text-slate-500">{projects.length} total</span>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claimProjectMutation.mutate(project.id)}
                    disabled={claimProjectMutation.isPending}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    {claimProjectMutation.isPending ? "Claiming..." : "Claim"}
                  </Button>
                ) : project.assigneeName ? (
                  <span className="text-sm text-slate-500">Assigned to {project.assigneeName}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        

      </div>
    </div>
  );
}
