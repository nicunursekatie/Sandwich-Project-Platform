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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Projects</p>
              <p className="text-2xl font-semibold text-slate-900">{projects.length}</p>
            </div>
            <ListTodo className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {statusCounts.available} available • {statusCounts.in_progress} in progress
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Team Messages</p>
              <p className="text-2xl font-semibold text-slate-900">{messages.length}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Communication updates
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Meeting Records</p>
              <p className="text-2xl font-semibold text-slate-900">{minutes.length}</p>
            </div>
            <ClipboardList className="w-8 h-8 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Documented meetings
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Collected</p>
              <p className="text-2xl font-semibold text-slate-900">{totalCollectedSandwiches}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {collections.length} collection entries
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Projects */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <ListTodo className="text-blue-500 mr-2 w-5 h-5" />
              Upcoming Projects
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${
                      project.status === "available" ? "bg-green-500" : "bg-blue-500"
                    }`}></span>
                    <div>
                      <h3 className="font-medium text-slate-900">{project.title}</h3>
                      <p className="text-sm text-slate-600">{project.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === "available" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {project.status === "available" ? "Available" : "Planning"}
                    </span>
                    {project.assigneeName && (
                      <span className="text-sm text-slate-500">Assigned to {project.assigneeName}</span>
                    )}
                  </div>
                </div>
              ))}
              
              {upcomingProjects.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No upcoming projects at this time.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <FolderOpen className="text-blue-500 mr-2 w-5 h-5" />
              Quick Access
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {driveLinks.slice(0, 4).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-slate-900">{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sandwich Collection Form */}
      <div className="mb-6">
        <SandwichCollectionForm />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <MessageCircle className="text-blue-500 mr-2 w-5 h-5" />
              Recent Messages
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <div key={message.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 text-sm">{message.sender}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {message.content.length > 80 
                      ? message.content.substring(0, 80) + "..." 
                      : message.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Meeting Minutes */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <ClipboardList className="text-purple-500 mr-2 w-5 h-5" />
              Recent Meetings
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentMinutes.map((minute) => (
                <div key={minute.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 text-sm">{minute.title}</span>
                    <span className="text-xs text-slate-500">{minute.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {minute.summary.length > 80 
                      ? minute.summary.substring(0, 80) + "..." 
                      : minute.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}