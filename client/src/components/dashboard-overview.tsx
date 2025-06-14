import { useQuery } from "@tanstack/react-query";
import { ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import type { Project, Message, MeetingMinutes, DriveLink, WeeklyReport, SandwichCollection } from "@shared/schema";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
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

  const { data: statsData } = useQuery({
    queryKey: ["/api/sandwich-collections/stats"],
    queryFn: async () => {
      const response = await fetch('/api/sandwich-collections/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 0, // Always refetch to ensure latest data
    cacheTime: 0  // Don't cache the response
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
  const totalCollectedSandwiches = statsData?.completeTotalSandwiches || 0;
  const upcomingProjects = projects.filter(p => p.status === "available" || p.status === "planning");
  const recentMessages = messages.slice(0, 3);
  const recentMinutes = minutes.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Total Collections Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Total Collections</h3>
            <p className="text-xl font-bold">{totalCollectedSandwiches.toLocaleString()}</p>
            <p className="text-xs text-green-100">sandwiches collected</p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sandwich Collection Form */}
      <SandwichCollectionForm />



      {/* Upcoming Projects */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900">Upcoming Projects</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("projects")}
            className="text-xs px-2 py-1"
          >
            View All
          </Button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {upcomingProjects.map((project) => (
              <div 
                key={project.id} 
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("projects")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">{project.title}</h3>
                    <p className="text-xs text-slate-600">{project.description}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {project.status === "available" ? "Available" : "Planning"}
                  </span>
                </div>
              </div>
            ))}
            
            {upcomingProjects.length === 0 && (
              <p className="text-slate-500 text-center py-3 text-sm">No upcoming projects</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900">Recent Messages</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("messages")}
            className="text-xs px-2 py-1"
          >
            View All
          </Button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {recentMessages.map((message) => (
              <div 
                key={message.id} 
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("messages")}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-slate-900">{message.sender}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  {message.content.length > 60 
                    ? message.content.substring(0, 60) + "..." 
                    : message.content}
                </p>
              </div>
            ))}
            
            {recentMessages.length === 0 && (
              <p className="text-slate-500 text-center py-3 text-sm">No recent messages</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Meeting Minutes */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-base font-semibold text-slate-900">Recent Meetings</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("meetings")}
            className="text-xs px-2 py-1"
          >
            View All
          </Button>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {recentMinutes.map((minute) => (
              <div 
                key={minute.id} 
                className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("meetings")}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-slate-900">{minute.title}</span>
                  <span className="text-xs text-slate-500">{minute.date}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {minute.summary.length > 70 
                    ? minute.summary.substring(0, 70) + "..." 
                    : minute.summary}
                </p>
              </div>
            ))}
            
            {recentMinutes.length === 0 && (
              <p className="text-slate-500 text-center py-3 text-sm">No recent meetings</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}