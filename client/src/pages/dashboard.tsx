import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/project-list-tsp";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import EnhancedChat from "@/components/enhanced-chat";
import CommitteeChat from "@/components/committee-chat";
import GoogleDriveLinks from "@/components/google-drive-links";
import DashboardOverview from "@/components/dashboard-overview-tsp";
import SandwichCollectionLog from "@/components/sandwich-collection-log";
import RecipientsManagement from "@/components/recipients-management";
import DriversManagement from "@/components/drivers-management";
import HostsManagement from "@/components/hosts-management-consolidated";
import { DocumentsBrowser } from "@/components/documents-browser";
import PhoneDirectoryFixed from "@/components/phone-directory-fixed";
import BulkDataManager from "@/components/bulk-data-manager";
import AnalyticsDashboard from "@/components/analytics-dashboard";
import Development from "@/pages/development";
import UnifiedMeetings from "@/components/unified-meetings";
import RoleDemo from "@/pages/role-demo";
import ProjectsClean from "@/pages/projects-clean";
import ProjectDetailClean from "@/pages/project-detail-clean";
import Analytics from "@/pages/analytics";
import ImpactDashboard from "@/pages/impact-dashboard";
import DataManagement from "@/pages/data-management";
import PerformanceDashboard from "@/pages/performance-dashboard";
import ReportingDashboard from "@/pages/reporting-dashboard";
import UserManagement from "@/components/user-management";
import UserProfile from "@/components/user-profile";
import { useState } from "react";
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { queryClient } from "@/lib/queryClient";
import AnnouncementBanner from "@/components/announcement-banner";
import WorkLogPage from "@/pages/work-log";
import SuggestionsPortal from "@/pages/suggestions";
import GoogleSheetsPage from "@/pages/google-sheets";
import InboxPage from "@/pages/inbox";
import MessagingSystem from "@/components/messaging-system";
import RealTimeMessages from "@/pages/real-time-messages";
import Governance from "@/pages/governance";
import UnifiedMessagesPage from "@/pages/unified-messages";
import AdminPage from "@/pages/admin";
import StreamMessagesPage from "@/pages/stream-messages-clean";
import DirectMessages from "@/pages/direct-messages";
import GmailStyleInbox from "@/components/gmail-style-inbox";
import { HelpProvider } from "@/components/help-system/HelpProvider";
import { HelpToggle } from "@/components/help-system/HelpToggle";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import { ToolkitTabs } from "@/components/toolkit-tabs";
import TSPHeader from "@/components/tsp-header";
import TSPSidebar from "@/components/tsp-sidebar";
import { MessageCircle } from "lucide-react";

export default function Dashboard({ initialSection = "dashboard" }: { initialSection?: string }) {
  const [location] = useLocation();
  const [activeSection, setActiveSection] = useState(initialSection);
  
  // Listen to URL changes to update activeSection
  React.useEffect(() => {
    console.log('Current URL location:', location);
    
    // Extract section from URL path
    if (location.startsWith('/projects/')) {
      const projectId = location.split('/projects/')[1];
      if (projectId) {
        const newSection = `project-${projectId}`;
        console.log('Setting activeSection to project ID:', newSection);
        setActiveSection(newSection);
      }
    } else {
      // Handle other sections if needed
      const pathSection = location.substring(1) || 'dashboard';
      if (pathSection !== activeSection && pathSection !== location.substring(1)) {
        console.log('Setting activeSection to:', pathSection);
        setActiveSection(pathSection);
      }
    }
  }, [location]);
  
  // Debug logging
  React.useEffect(() => {
    console.log('Dashboard activeSection changed to:', activeSection);
  }, [activeSection]);

  // Enhanced setActiveSection with debugging
  const enhancedSetActiveSection = (section: string) => {
    console.log('📍 Dashboard setActiveSection called with:', section);
    setActiveSection(section);
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // Make setActiveSection available globally for project detail navigation
  React.useEffect(() => {
    (window as any).dashboardSetActiveSection = enhancedSetActiveSection;
    
    return () => {
      delete (window as any).dashboardSetActiveSection;
    };
  }, []);

  const renderContent = () => {
    // Extract project ID from activeSection if it's a project detail page
    const projectIdMatch = activeSection.match(/^project-(\d+)$/);
    const projectId = projectIdMatch ? parseInt(projectIdMatch[1]) : null;

    // Handle project detail pages
    if (projectId) {
      return <ProjectDetailClean projectId={projectId} />;
    }

    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview onSectionChange={setActiveSection} />;
      case "collections":
        return <SandwichCollectionLog />;
      case "projects":
        console.log("Rendering ProjectsClean component");
        return <ProjectsClean />;
      case "real-time-messages":
        return <RealTimeMessages />;
      case "messages":
        return <DirectMessages />;
      case "gmail-inbox":
        return <GmailStyleInbox />;
      case "inbox":
        return <InboxPage />;
      case "stream-messages":
        return <StreamMessagesPage />;
      case "chat":
        return <EnhancedChat />;
      case "profile":
        return <UserProfile />;
      case "meetings":
        return <UnifiedMeetings />;

      case "reports":
        return <ReportingDashboard isEmbedded={true} />;
      case "toolkit":
        return <ToolkitTabs />;
      case "hosts":
        return <HostsManagement />;
      case "recipients":
        return <RecipientsManagement />;
      case "drivers":
        return <DriversManagement />;
      case "phone-directory":
        return <PhoneDirectoryFixed />;
      case "analytics":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-main-heading text-primary dark:text-secondary">Analytics Dashboard</h1>
              <p className="font-body text-muted-foreground">Data insights and impact visualization</p>
            </div>
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
                <TabsTrigger value="data" className="text-xs sm:text-sm">Data Analytics</TabsTrigger>
                <TabsTrigger value="impact" className="text-xs sm:text-sm">Impact Dashboard</TabsTrigger>
              </TabsList>
              <TabsContent value="data" className="mt-6">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="impact" className="mt-6">
                <ImpactDashboard />
              </TabsContent>
            </Tabs>
          </div>
        );
      case "role-demo":
        return <RoleDemo />;
      case "work-log":
        return <WorkLogPage />;
      case "suggestions":
        return <SuggestionsPortal />;
      case "google-sheets":
        return <GoogleSheetsPage />;
      case "governance":
        return <Governance />;
      case "committee":
      case "committee-chat":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl" style={{backgroundColor: 'var(--tsp-teal-light)'}}>
                <MessageCircle className="w-6 h-6" style={{color: 'var(--tsp-teal)'}} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Committee Communications</h1>
                <p className="text-gray-600 dark:text-gray-300">Internal committee discussions and collaboration</p>
              </div>
            </div>
            <CommitteeChat />
          </div>
        );
      case "user-management":
        return <UserManagement />;
      case "development":
        return <Development />;
      case "admin":
        return <AdminPage />;
      default:
        // Handle project detail pages
        if (projectId) {
          return <ProjectDetailClean projectId={projectId} />;
        }
        // Handle legacy project routes
        if (activeSection.startsWith("project-")) {
          const legacyProjectId = parseInt(activeSection.replace("project-", ""));
          if (!isNaN(legacyProjectId)) {
            return <ProjectDetailClean projectId={legacyProjectId} />;
          }
        }
        return <DashboardOverview onSectionChange={setActiveSection} />;
    }
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading, redirect or show error
  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <HelpProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Announcement Banner */}
        <AnnouncementBanner />
        
        {/* TSP Header */}
        <TSPHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onSectionChange={setActiveSection}
        />

        <div className="flex">
          {/* TSP Sidebar */}
          <TSPSidebar
            activeSection={activeSection}
            onSectionChange={(section) => {
              console.log('Dashboard setActiveSection called with:', section);
              setActiveSection(section);
              setIsMobileMenuOpen(false);
              const newUrl = section === 'dashboard' ? '/dashboard' : `/dashboard?section=${section}`;
              window.history.pushState({}, '', newUrl);
            }}
            isMobileMenuOpen={isMobileMenuOpen}
          />

          {/* Main Content */}
          <main className="flex-1 xl:ml-64 min-h-screen">
            <div className="p-6 max-w-7xl mx-auto">
              <div className="max-w-full overflow-x-hidden">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </HelpProvider>
  );
}
