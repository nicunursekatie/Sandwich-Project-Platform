import { Sandwich, LogOut, LayoutDashboard, ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, Users, Car, Calendar } from "lucide-react";
import ProjectList from "@/components/project-list";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import MessageLog from "@/components/message-log";
import MeetingMinutes from "@/components/meeting-minutes";
import MeetingAgenda from "@/components/meeting-agenda";
import GoogleDriveLinks from "@/components/google-drive-links";
import DashboardOverview from "@/components/dashboard-overview";
import SandwichCollectionLog from "@/components/sandwich-collection-log";
import RecipientsManagement from "@/components/recipients-management";
import DriversManagement from "@/components/drivers-management";
import MeetingsCalendar from "@/components/meetings-calendar";

import { useState } from "react";
import { Link } from "wouter";

export default function Meetings() {
  const [activeSection, setActiveSection] = useState("calendar");

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { id: "projects", label: "Projects", icon: ListTodo },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "meetings", label: "Meetings", icon: ClipboardList },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "collections", label: "Collection Log", icon: Sandwich },
    { id: "recipients", label: "Recipients", icon: Users },
    { id: "drivers", label: "Drivers", icon: Car },
  ];

  const meetingSections = [
    { id: "calendar", label: "Meetings Calendar", icon: Calendar },
    { id: "agenda", label: "Meeting Agenda", icon: ClipboardList },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "projects":
        return <ProjectList />;
      case "messages":
        return <MessageLog />;
      case "meetings":
        return <MeetingAgenda />;
      case "files":
        return <GoogleDriveLinks />;
      case "reports":
        return <WeeklySandwichForm />;
      case "collections":
        return <SandwichCollectionLog />;
      case "recipients":
        return <RecipientsManagement />;
      case "drivers":
        return <DriversManagement />;
      case "calendar":
        return <MeetingsCalendar />;
      case "agenda":
        return <MeetingAgenda />;
      default:
        return <MeetingsCalendar />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Sandwich className="text-amber-500 w-6 h-6" />
            <h1 className="text-lg font-semibold text-slate-900">The Sandwich Project</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main</h3>
              <ul className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  if (item.path) {
                    return (
                      <li key={item.id}>
                        <Link href={item.path}>
                          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </button>
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Meetings Subsection */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Meetings</h3>
              <ul className="space-y-2">
                {meetingSections.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Welcome, John</span>
            <button className="text-slate-400 hover:text-slate-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}