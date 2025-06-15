import { Sandwich, LogOut, LayoutDashboard, ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, TrendingUp, Users, Car, Building2, FileText, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/project-list";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import ChatHub from "@/components/chat-hub";
import MeetingMinutes from "@/components/meeting-minutes";
import MeetingAgenda from "@/components/meeting-agenda";
import GoogleDriveLinks from "@/components/google-drive-links";
import DashboardOverview from "@/components/dashboard-overview";
import SandwichCollectionLog from "@/components/sandwich-collection-log";
import RecipientsManagement from "@/components/recipients-management";
import DriversManagement from "@/components/drivers-management";
import HostsManagement from "@/components/hosts-management-consolidated";
import { DocumentsBrowser } from "@/components/documents-browser";
import PhoneDirectory from "@/components/phone-directory";
import BulkDataManager from "@/components/bulk-data-manager";
import CollectionAnalytics from "@/components/collection-analytics";
import Development from "@/pages/development";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission } from "@/lib/authUtils";
import { PERMISSIONS } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user } = useAuth();

  // Filter sidebar items based on user permissions
  const allSidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: ListTodo },
    { id: "meetings", label: "Meetings", icon: ClipboardList },
    { id: "toolkit", label: "Toolkit", icon: FileText },
    { id: "collections", label: "Collections", icon: Sandwich },
    { id: "hosts", label: "Hosts", icon: Building2 },
    { id: "recipients", label: "Recipients", icon: Users },
    { id: "drivers", label: "Drivers", icon: Car },
    { id: "directory", label: "Phone Directory", icon: Phone, permission: PERMISSIONS.VIEW_PHONE_DIRECTORY },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "role-demo", label: "Role Demo", icon: Users },
    { id: "development", label: "Development", icon: FolderOpen },
  ];

  const sidebarItems = allSidebarItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case "projects":
        return <ProjectList />;
      case "messages":
        return <ChatHub />;
      case "meetings":
        return <MeetingAgenda />;
      case "toolkit":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Toolkit</h1>
                <p className="text-gray-600 dark:text-gray-300">Essential training documents and resources</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Food Safety Volunteers Guide",
                  description: "Essential food safety guidelines for all volunteers",
                  path: "/20230525-TSP-Food Safety Volunteers_1749341916234.pdf",
                  category: "Safety"
                },
                {
                  title: "Deli Sandwich Making 101",
                  description: "Step-by-step guide for preparing deli sandwiches",
                  path: "/20240622-TSP-Deli Sandwich Making 101_1749341916236.pdf",
                  category: "Training"
                },
                {
                  title: "PBJ Sandwich Making 101", 
                  description: "Instructions for peanut butter and jelly sandwich preparation",
                  path: "/20250622-TSP-PBJ Sandwich Making 101_1749341916236.pdf",
                  category: "Training"
                },
                {
                  title: "Deli Labels",
                  description: "Printable labels for deli sandwich packaging",
                  path: "/Deli labels_1749341916236.pdf",
                  category: "Resources"
                },
                {
                  title: "PBJ Labels",
                  description: "Printable labels for PBJ sandwich packaging", 
                  path: "/Pbj labels_1749341916237.pdf",
                  category: "Resources"
                },
                {
                  title: "Sandwich Inventory List",
                  description: "Current inventory tracking spreadsheet for 3 oz portions",
                  path: "/TSP Sandwich Inventory List for 3 ozs_1749341916237.xlsx",
                  category: "Operations"
                }
              ].map((doc, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doc.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          doc.category === 'Safety' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          doc.category === 'Training' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          doc.category === 'Resources' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {doc.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{doc.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = doc.path;
                        link.download = doc.title;
                        link.click();
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => window.open(doc.path, '_blank')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "collections":
        return <SandwichCollectionLog />;
      case "hosts":
        return <HostsManagement />;
      case "recipients":
        return <RecipientsManagement />;
      case "drivers":
        return <DriversManagement />;
      case "directory":
        return <PhoneDirectory />;
      case "analytics":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Data insights and impact visualization</p>
            </div>
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="data">Data Analytics</TabsTrigger>
                <TabsTrigger value="impact">Impact Dashboard</TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="mt-6">
                <CollectionAnalytics />
              </TabsContent>
              <TabsContent value="impact" className="mt-6">
                <iframe 
                  src="/impact" 
                  className="w-full h-screen border-0 rounded-lg bg-white"
                  title="Impact Dashboard"
                />
              </TabsContent>
            </Tabs>
          </div>
        );
      case "role-demo":
        return (
          <div className="p-6">
            <iframe 
              src="/role-demo" 
              className="w-full h-screen border-0 rounded-lg"
              title="Role Demo"
            />
          </div>
        );

      case "development":
        return <Development />;
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Sandwich className="text-amber-500 w-6 h-6" />
          <h1 className="text-lg font-semibold text-slate-900">The Sandwich Project</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveSection("messages")}
            className={`p-2 rounded-lg transition-colors ${
              activeSection === "messages"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              queryClient.clear();
              window.location.href = "/api/logout";
            }}
            className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
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
              <span className="text-sm text-slate-600">Welcome, {(user as any)?.firstName || 'Team'}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
