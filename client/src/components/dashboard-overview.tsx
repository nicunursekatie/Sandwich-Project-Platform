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
    let groupTotal = 0;
    try {
      const groupData = JSON.parse(collection.groupCollections || "[]");
      if (Array.isArray(groupData)) {
        groupTotal = groupData.reduce((groupSum: number, group: any) => groupSum + (group.sandwichCount || 0), 0);
      }
    } catch (error) {
      // If parsing fails, treat as 0
      groupTotal = 0;
    }
    return sum + collection.individualSandwiches + groupTotal;
  }, 0);
  const upcomingProjects = projects.filter(p => p.status === "available" || p.status === "planning");
  const recentMessages = messages.slice(0, 3);
  const recentMinutes = minutes.slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Sandwich Collection Form */}
      <SandwichCollectionForm />

      {/* Weekly Totals Summary */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <BarChart3 className="text-green-500 mr-2 w-5 h-5" />
            Weekly Totals Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Total Weekly Reports</div>
              <div className="text-2xl font-bold text-green-600">{totalSandwiches}</div>
              <div className="text-sm text-slate-500">sandwiches reported</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Total Collections</div>
              <div className="text-2xl font-bold text-blue-600">{totalCollectedSandwiches}</div>
              <div className="text-sm text-slate-500">sandwiches collected</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Recent Reports</span>
              <span className="text-sm text-slate-500">{reports.length} total reports</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Projects */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Projects</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("projects")}
          >
            View All
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {upcomingProjects.map((project) => (
              <div 
                key={project.id} 
                className="p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("projects")}
              >
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

      {/* Recent Messages */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Messages</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("messages")}
          >
            View All
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentMessages.map((message) => (
              <div 
                key={message.id} 
                className="p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("messages")}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-900 text-sm">{message.sender}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {message.content.length > 80 
                    ? message.content.substring(0, 80) + "..." 
                    : message.content}
                </p>
              </div>
            ))}
            
            {recentMessages.length === 0 && (
              <p className="text-slate-500 text-center py-4">No recent messages</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Meeting Minutes */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Recent Meetings</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onSectionChange("meetings")}
          >
            View All
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentMinutes.map((minute) => (
              <div 
                key={minute.id} 
                className="p-3 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => onSectionChange("meetings")}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-900 text-sm">{minute.title}</span>
                  <span className="text-xs text-slate-500">{minute.date}</span>
                </div>
                <p className="text-sm text-slate-600">
                  {minute.summary.length > 80 
                    ? minute.summary.substring(0, 80) + "..." 
                    : minute.summary}
                </p>
              </div>
            ))}
            
            {recentMinutes.length === 0 && (
              <p className="text-slate-500 text-center py-4">No recent meetings</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}