import { Sandwich, LogOut, ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3 } from "lucide-react";
import ProjectList from "@/components/project-list";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import MessageLog from "@/components/message-log";
import MeetingMinutes from "@/components/meeting-minutes";
import GoogleDriveLinks from "@/components/google-drive-links";
import { useState } from "react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("projects");

  const sidebarItems = [
    { id: "projects", label: "Projects", icon: ListTodo },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "meetings", label: "Meetings", icon: ClipboardList },
    { id: "files", label: "Files", icon: FolderOpen },
    { id: "reports", label: "Reports", icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "projects":
        return <ProjectList />;
      case "messages":
        return <MessageLog />;
      case "meetings":
        return <MeetingMinutes />;
      case "files":
        return <GoogleDriveLinks />;
      case "reports":
        return <WeeklySandwichForm />;
      default:
        return <ProjectList />;
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
            <h1 className="text-lg font-semibold text-slate-900">Marcy's Project</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
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
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900 capitalize">
            {sidebarItems.find(item => item.id === activeSection)?.label}
          </h2>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
