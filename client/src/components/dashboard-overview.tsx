import { useQuery } from "@tanstack/react-query";
import { ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import type { Project, Message, MeetingMinutes, DriveLink, WeeklyReport, SandwichCollection } from "@shared/schema";

export default function DashboardOverview() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"]
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"]
  });

  const { data: minutes = [] } = useQuery<MeetingMinutes[]>({
    queryKey: ["/api/meeting-minutes"]
  });

  const { data: driveLinks = [] } = useQuery<DriveLink[]>({
    queryKey: ["/api/drive-links"]
  });

  const { data: reports = [] } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/weekly-reports"]
  });

  const { data: collections = [] } = useQuery<SandwichCollection[]>({
    queryKey: ["/api/sandwich-collections"]
  });

  const getProjectStatusCounts = () => {
    const counts = {
      available: 0,
      in_progress: 0,
      planning: 0,
      completed: 0,
    };
    
    projects.forEach(project => {
      if (counts.hasOwnProperty(project.status)) {
        counts[project.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  };

  const statusCounts = getProjectStatusCounts();
  const totalSandwiches = reports.reduce((sum, report) => sum + report.sandwichCount, 0);
  const totalCollectedSandwiches = collections.reduce((sum, collection) => {
    const groupData = JSON.parse(collection.groupCollections || "[]");
    const groupTotal = groupData.reduce((groupSum: number, group: any) => groupSum + group.sandwichCount, 0);
    return sum + collection.individualSandwiches + groupTotal;
  }, 0);
  const upcomingProjects = projects.filter(p => p.status === "available" || p.status === "planning");
  const recentMessages = messages.slice(0, 3);
  const recentMinutes = minutes.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Upcoming Projects */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Projects</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {upcomingProjects.map((project) => (
              <div key={project.id} className="p-3 border border-slate-200 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-600">{project.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {project.status === "available" ? "Available" : "Planning"}
                  </span>
                </div>
              </div>
            ))}
            
            {upcomingProjects.length === 0 && (
              <p className="text-slate-500 text-center py-4">No upcoming projects</p>
            )}
          </div>
        </div>
      </div>

      {/* Sandwich Collection Form */}
      <SandwichCollectionForm />
    </div>
  );
}