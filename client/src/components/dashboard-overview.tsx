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
      {/* Total Counts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Weekly Reports</h3>
              <p className="text-xl font-bold">{totalSandwiches.toLocaleString()}</p>
              <p className="text-xs text-blue-100">sandwiches reported</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 rounded-full">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium">Total Entries</h3>
              <p className="text-sm font-bold">{collections.length.toLocaleString()}</p>
              <p className="text-xs text-purple-100">entries</p>
            </div>
            <div className="bg-white bg-opacity-20 p-1 rounded-full">
              <Users className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Sandwich Collection Form */}
      <SandwichCollectionForm />

      {/* Weekly Totals Summary */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-3 py-2 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center">
            <BarChart3 className="text-green-500 mr-1 w-3 h-3" />
            Weekly Totals Summary
          </h2>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">Weekly Reports</div>
              <div className="text-sm font-bold text-green-600">{totalSandwiches}</div>
              <div className="text-xs text-slate-500">reported</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-700 mb-1">Collections</div>
              <div className="text-base font-bold text-blue-600">{totalCollectedSandwiches}</div>
              <div className="text-xs text-slate-500">collected</div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-700">Recent Reports</span>
              <span className="text-xs text-slate-500">{reports.length} total</span>
            </div>
          </div>
        </div>
      </div>

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