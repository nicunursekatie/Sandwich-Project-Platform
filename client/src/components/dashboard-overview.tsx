import { useQuery } from "@tanstack/react-query";
import { ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import type { Project, MeetingMinutes, DriveLink, WeeklyReport, SandwichCollection, Meeting } from "@shared/schema";
import { HelpBubble } from "@/components/help-system/HelpBubble";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const { user } = useAuth();
  
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: hasPermission(user, PERMISSIONS.VIEW_PROJECTS)
  });



  const { data: driveLinks = [] } = useQuery<DriveLink[]>({
    queryKey: ["/api/drive-links"]
  });

  const { data: reports = [] } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/weekly-reports"],
    enabled: hasPermission(user, PERMISSIONS.VIEW_REPORTS)
  });

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: hasPermission(user, PERMISSIONS.VIEW_MEETINGS)
  });

  const { data: statsData } = useQuery({
    queryKey: ["/api/sandwich-collections/stats"],
    queryFn: async () => {
      const response = await fetch('/api/sandwich-collections/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data to show corrected totals
    refetchOnWindowFocus: true
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
  const activeProjects = projects.filter(p => p.status === "in_progress" || p.status === "available" || p.status === "planning");

  
  // Filter upcoming meetings (not completed and future or current dates)
  const upcomingMeetings = meetings
    .filter(meeting => meeting.status !== "completed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-6 font-body">
      {/* Welcome Help Bubble - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome to Your Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Here's an overview of your TSP activity</p>
        </div>
        <div className="flex-shrink-0">
          <HelpBubble
            content={{
              id: 'dashboard-welcome',
              title: 'Welcome to TSP!',
              message: "I'm so glad you're here! This dashboard is your central hub for everything related to The Sandwich Project. From here, you can track collections, connect with your team, and make a real difference in your community.",
              tone: 'encouraging',
              character: 'friend',
              position: 'left',
              showOnFirstVisit: true
            }}
          />
        </div>
      </div>

      {/* Colorful Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections Card */}
        <div className="bg-gradient-to-br from-[#236383] to-blue-600 rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Total</p>
              <p className="text-lg font-bold">{totalCollectedSandwiches.toLocaleString()}</p>
              <p className="text-xs opacity-90">sandwiches</p>
            </div>
          </div>
        </div>

        {/* Active Projects Card */}
        <div className="bg-gradient-to-br from-[#FBAD3F] to-orange-500 rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <ListTodo className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Active</p>
              <p className="text-lg font-bold">{activeProjects.length}</p>
              <p className="text-xs opacity-90">projects</p>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Upcoming</p>
              <p className="text-lg font-bold">{upcomingMeetings.length}</p>
              <p className="text-xs opacity-90">meetings</p>
            </div>
          </div>
        </div>

        {/* Team Progress Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Completed</p>
              <p className="text-lg font-bold">{statusCounts.completed}</p>
              <p className="text-xs opacity-90">projects</p>
            </div>
          </div>
        </div>
      </div>





      {/* Quick Collection Entry - Only show if user has permission - Mobile responsive */}
      {(hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) || hasPermission(user, PERMISSIONS.MANAGE_COLLECTIONS)) && (
        <div className="bg-card rounded-lg border border-border">
          <div className="px-3 sm:px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-sub-heading text-primary">Quick Collection Entry</h2>
              <HelpBubble
                content={{
                  id: 'collections-form',
                  title: 'Recording Your Collections',
                  message: "Every sandwich you record here represents a meal for someone in need. Don't worry about making mistakes - you can always edit entries later. Just do your best, and know that your contribution matters so much!",
                  tone: 'supportive',
                  character: 'mentor',
                  position: 'bottom'
                }}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange?.("collections")}
              className="text-xs px-2 py-1 w-full sm:w-auto"
            >
              View All Collections
            </Button>
          </div>
          <div className="p-3 sm:p-4">
            <SandwichCollectionForm onSuccess={() => onSectionChange?.("collections")} />
          </div>
        </div>
      )}

      {/* Active Projects - Only show if user has permission */}
      {hasPermission(user, PERMISSIONS.VIEW_PROJECTS) && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 shadow-lg">
          <div className="px-4 py-3 border-b border-indigo-200 flex justify-between items-center bg-gradient-to-r from-indigo-100 to-purple-100 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg">
                <ListTodo className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-indigo-900">Active Projects</h2>
              <HelpBubble
                content={{
                  id: 'project-management',
                  title: 'Making Things Happen',
                  message: "Projects might seem overwhelming, but remember - every big change starts with small steps. You don't have to do everything at once. Just pick something that speaks to you and take it one task at a time!",
                  tone: 'supportive',
                  character: 'coach',
                  position: 'bottom'
                }}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange("projects")}
              className="text-xs px-2 py-1 bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-700"
            >
              View All
            </Button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {activeProjects.map((project) => (
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
                      {project.status === "in_progress" ? "In Progress" : 
                       project.status === "available" ? "Available" : "Planning"}
                    </span>
                  </div>
                </div>
              ))}
              
              {activeProjects.length === 0 && (
                <p className="text-slate-500 text-center py-3 text-sm">No active projects</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Meetings - Only show if user has permission */}
      {hasPermission(user, PERMISSIONS.VIEW_MEETINGS) && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-lg">
          <div className="px-4 py-3 border-b border-emerald-200 flex justify-between items-center bg-gradient-to-r from-emerald-100 to-teal-100 rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-lg">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-emerald-900">Upcoming Meetings</h2>
              <HelpBubble
                content={{
                  id: 'meetings-schedule',
                  title: 'Stay Connected',
                  message: "Meetings are where we come together as a team! They're not just about business - they're about connecting, sharing ideas, and supporting each other. Your participation is valued!",
                  tone: 'encouraging',
                  character: 'mentor',
                  position: 'bottom'
                }}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSectionChange("meetings")}
              className="text-xs px-2 py-1 bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700"
            >
              View All
            </Button>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {upcomingMeetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onSectionChange("meetings")}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">{meeting.title}</h3>
                      <p className="text-xs text-slate-600">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                      {meeting.location && (
                        <p className="text-xs text-slate-500 mt-1">📍 {meeting.location}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 capitalize">
                      {meeting.status === "planning" ? "Planning" : 
                       meeting.status === "agenda_set" ? "Agenda Set" : meeting.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {upcomingMeetings.length === 0 && (
                <p className="text-slate-500 text-center py-3 text-sm">No upcoming meetings</p>
              )}
            </div>
          </div>
        </div>
      )}





    </div>
  );
}