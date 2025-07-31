import { Sandwich, LogOut, LayoutDashboard, ListTodo, MessageCircle, ClipboardList, FolderOpen, BarChart3, TrendingUp, Users, Car, Building2, FileText, Phone, ChevronDown, ChevronRight, Menu, X, UserCog, Lightbulb, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectList from "@/components/project-list";
import WeeklySandwichForm from "@/components/weekly-sandwich-form";
import EnhancedChat from "@/components/enhanced-chat";
import CommitteeChat from "@/components/committee-chat";
import GoogleDriveLinks from "@/components/google-drive-links";
import DashboardOverview from "@/components/dashboard-overview";
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
import SimpleNav from "@/components/simple-nav";
import AnnouncementBanner from "@/components/announcement-banner";
import MessageNotifications from "@/components/message-notifications";
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
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // Make setActiveSection available globally for project detail navigation
  React.useEffect(() => {
    (window as any).dashboardSetActiveSection = enhancedSetActiveSection;
    
    return () => {
      delete (window as any).dashboardSetActiveSection;
    };
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Simplified navigation structure
  const navigationItems = [
    // Core section
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "collections", label: "Collections", icon: Sandwich },
    { id: "messages", label: "Messages", icon: MessageCircle },
    
    // Data section (filtered by permissions)
    ...(hasPermission(user, PERMISSIONS.VIEW_HOSTS) ? [{ id: "hosts", label: "Hosts", icon: Building2 }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_RECIPIENTS) ? [{ id: "recipients", label: "Recipients", icon: Users }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_DRIVERS) ? [{ id: "drivers", label: "Drivers", icon: Car }] : []),
    
    // Operations section
    ...(hasPermission(user, PERMISSIONS.VIEW_MEETINGS) ? [{ id: "meetings", label: "Meetings", icon: ClipboardList }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) ? [{ id: "analytics", label: "Analytics", icon: BarChart3 }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_REPORTS) ? [{ id: "reports", label: "Reports", icon: FileText }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_PROJECTS) ? [{ id: "projects", label: "Projects", icon: ListTodo }] : []),
    
    // Communication section
    { id: "inbox", label: "Inbox", icon: MessageCircle },
    { id: "chat", label: "Chat", icon: MessageCircle },
    ...(hasPermission(user, PERMISSIONS.VIEW_COMMITTEE) ? [{ id: "committee", label: "Committee", icon: MessageCircle }] : []),
    { id: "directory", label: "Directory", icon: Phone },
    ...(hasPermission(user, PERMISSIONS.VIEW_SUGGESTIONS) ? [{ id: "suggestions", label: "Suggestions", icon: Lightbulb }] : []),
    
    // Resources section
    { id: "toolkit", label: "Toolkit", icon: FolderOpen },
    { id: "development", label: "Development", icon: FileText },
    { id: "work-log", label: "Work Log", icon: ClipboardList },
    
    // Admin section
    ...(hasPermission(user, PERMISSIONS.MANAGE_USERS) ? [{ id: "user-management", label: "Admin", icon: UserCog }] : []),
  ];

  // Navigation is already filtered by permissions above

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
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen flex flex-col">
      {/* Announcement Banner */}
      <AnnouncementBanner />
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-white to-orange-50/30 border-b-2 border-amber-200 shadow-sm px-2 sm:px-4 md:px-6 py-3 flex items-center relative z-50">
        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
          {/* Mobile menu button - positioned first for easy access */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors touch-manipulation relative z-60"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <img src={sandwichLogo} alt="Sandwich Logo" className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          <h1 className="text-base sm:text-lg font-semibold text-teal-800 hidden sm:block">The Sandwich Project</h1>
          <h1 className="text-sm font-semibold text-teal-800 sm:hidden">TSP</h1>
        </div>
        
        {/* Flexible spacer */}
        <div className="flex-1" />
        
        {/* Current User Indicator - moved to right side with right-aligned buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && (
            <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 shadow-sm">
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-teal-100 to-teal-200 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xs font-medium text-teal-800">
                  {(user as any)?.firstName?.charAt(0) || (user as any)?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-medium text-teal-800">
                  {(user as any)?.firstName ? `${(user as any).firstName} ${(user as any)?.lastName || ''}`.trim() : (user as any)?.email}
                </span>
                <span className="text-xs text-amber-600">
                  {(user as any)?.email}
                </span>
              </div>
              <div className="sm:hidden">
                <span className="text-xs font-medium text-teal-800">
                  {(user as any)?.firstName ? `${(user as any).firstName}` : (user as any)?.email?.split('@')[0] || 'User'}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-1 sm:space-x-2 relative z-50 flex-shrink-0">
          <button
            onClick={() => {
              console.log('Messages button clicked');
              setActiveSection("messages");
              setIsMobileMenuOpen(false);
            }}
            className={`p-2 rounded-lg transition-colors relative z-50 pointer-events-auto touch-manipulation ${
              activeSection === "messages"
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-teal-700 border border-amber-300 shadow-sm"
                : "text-teal-600 hover:bg-amber-50 hover:text-teal-800"
            }`}
            title="Messages"
            aria-label="Messages"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <MessageNotifications user={user} />
          <HelpToggle />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Profile button clicked, current section:', activeSection);
              setActiveSection("profile");
              // Force update URL to ensure proper navigation
              window.history.pushState({}, '', '/dashboard?section=profile');
              // Close mobile menu if open
              setIsMobileMenuOpen(false);
            }}
            className={`p-2 rounded-lg transition-colors relative z-50 pointer-events-auto touch-manipulation ${
              activeSection === "profile"
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-teal-700 border border-amber-300 shadow-sm"
                : "text-teal-600 hover:bg-amber-50 hover:text-teal-800"
            }`}
            title="Account Settings"
            aria-label="Account Settings"
          >
            <UserCog className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={async () => {
              try {
                // Call logout API to clear session
                await fetch('/api/logout', {
                  method: 'POST',
                  credentials: 'include'
                });
                // Clear query cache
                queryClient.clear();
                // Redirect to landing page
                window.location.href = "/";
              } catch (error) {
                console.error('Logout error:', error);
                // Fallback: clear cache and redirect anyway
                queryClient.clear();
                window.location.href = "/";
              }
            }}
            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-50 transition-colors touch-manipulation border border-amber-200 hover:border-amber-300"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs sm:text-sm hidden sm:block">Logout</span>
          </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative z-50 w-64 sm:w-72 bg-gradient-to-b from-white to-orange-50/30 border-r-2 border-amber-200 shadow-lg flex flex-col transition-transform duration-300 ease-in-out h-full`}>
          {/* Simple Navigation with enhanced mobile scrolling */}
          <div className="flex-1 overflow-y-auto pb-6 touch-pan-y overscroll-contain">
            <SimpleNav 
              activeSection={activeSection} 
              onSectionChange={(section) => {
                console.log('Dashboard setActiveSection called with:', section);
                setActiveSection(section);
                // Close mobile menu when navigation item is clicked
                setIsMobileMenuOpen(false);
                // Also update URL for back button support
                const newUrl = section === 'dashboard' ? '/dashboard' : `/dashboard?section=${section}`;
                window.history.pushState({}, '', newUrl);
              }} 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto w-full md:w-auto relative z-10">
          <div className="p-3 sm:p-4 md:p-6 pb-20 min-h-full bg-gradient-to-br from-white/80 to-orange-50/20 rounded-tl-lg">
            <div className="max-w-full overflow-x-hidden">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </HelpProvider>
  );
}
