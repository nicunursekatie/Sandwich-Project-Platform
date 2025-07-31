import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sandwich, 
  LayoutDashboard, 
  ListTodo, 
  MessageCircle, 
  ClipboardList, 
  FolderOpen, 
  BarChart3, 
  Users, 
  Car, 
  Building2, 
  FileText, 
  Phone,
  Settings,
  Sheet,
  Lightbulb,
  Inbox,
  Hash,
  Scale,
  ChevronRight,
  Heart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { useMessaging } from "@/hooks/useMessaging";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  permission?: string;
  group?: string;
}

interface TSPSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileMenuOpen: boolean;
}

export default function TSPSidebar({ 
  activeSection, 
  onSectionChange,
  isMobileMenuOpen 
}: TSPSidebarProps) {
  const { user } = useAuth();
  const { unreadCounts, totalUnread } = useMessaging();

  // Get Gmail inbox unread count
  const { data: gmailUnreadCount = 0 } = useQuery({
    queryKey: ['/api/emails/unread-count', (user as any)?.id || 'no-user'],
    queryFn: async () => {
      if (!(user as any)?.id) return 0;
      try {
        const response = await apiRequest('GET', '/api/emails/unread-count');
        return response.count || 0;
      } catch (error) {
        console.error('Failed to fetch Gmail unread count:', error);
        return 0;
      }
    },
    enabled: !!(user as any)?.id,
    refetchInterval: 30000,
  });

  const navigationItems: NavigationItem[] = [
    // MAIN section
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
    ...(hasPermission(user, PERMISSIONS.VIEW_PROJECTS) ? [{ id: "projects", label: "Projects", icon: ClipboardList, href: "projects" }] : []),
    { id: "collections", label: "Collections Log", icon: Sandwich, href: "collections" },
    
    // COMMUNICATION section
    { id: "gmail-inbox", label: "Inbox", icon: Inbox, href: "gmail-inbox", group: "communication" },
    { id: "chat", label: "Team Chat", icon: Hash, href: "chat", group: "communication" },
    ...(hasPermission(user, PERMISSIONS.VIEW_SUGGESTIONS) ? [{ id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "suggestions", group: "communication" }] : []),
    
    // WORKFLOW section
    ...(hasPermission(user, PERMISSIONS.ACCESS_WORK_LOGS) ? [{ id: "work-log", label: "Work Log", icon: ListTodo, href: "work-log", group: "workflow" }] : []),
    { id: "toolkit", label: "Toolkit", icon: FolderOpen, href: "toolkit", group: "workflow" },
    ...(hasPermission(user, PERMISSIONS.ADMIN_ACCESS) ? [{ id: "admin", label: "Important Documents", icon: FileText, href: "admin", group: "workflow" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_GOVERNANCE) ? [{ id: "governance", label: "Governance", icon: Scale, href: "governance", group: "workflow" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_MEETINGS) ? [{ id: "meetings", label: "Meetings", icon: ClipboardList, href: "meetings", group: "workflow" }] : []),
    
    // PEOPLE section
    { id: "phone-directory", label: "Directory", icon: Phone, href: "phone-directory", group: "people" },
    ...(hasPermission(user, PERMISSIONS.VIEW_HOSTS) ? [{ id: "hosts", label: "Hosts", icon: Building2, href: "hosts", group: "people" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_DRIVERS) ? [{ id: "drivers", label: "Drivers", icon: Car, href: "drivers", group: "people" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_RECIPIENTS) ? [{ id: "recipients", label: "Recipients", icon: Users, href: "recipients", group: "people" }] : []),
    
    // DATA section
    ...(hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) ? [{ id: "analytics", label: "Analytics", icon: BarChart3, href: "analytics", group: "data" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_REPORTS) ? [{ id: "reports", label: "Reports", icon: FileText, href: "reports", group: "data" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_SANDWICH_DATA) ? [{ id: "google-sheets", label: "Sandwich Data", icon: Sheet, href: "google-sheets", group: "data" }] : []),
    
    // Admin section
    ...(hasPermission(user, PERMISSIONS.MANAGE_USERS) ? [{ id: "user-management", label: "User Management", icon: Settings, href: "user-management", group: "admin" }] : [])
  ];

  const isActive = (href: string) => {
    if (href === "dashboard") return activeSection === "dashboard" || activeSection === "";
    return activeSection === href;
  };

  // Group items for visual separation
  const groupedItems = navigationItems.reduce((acc, item, index) => {
    const prevItem = navigationItems[index - 1];
    const showSeparator = prevItem && prevItem.group !== item.group && item.group;
    
    if (showSeparator) {
      acc.push({ type: 'separator', group: item.group });
    }
    acc.push({ type: 'item', ...item });
    return acc;
  }, [] as any[]);

  const getGroupLabel = (group: string) => {
    const labels = {
      communication: "CONNECT",
      workflow: "ORGANIZE",
      people: "COMMUNITY",
      data: "INSIGHTS",
      admin: "MANAGE"
    };
    return labels[group as keyof typeof labels] || group;
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white to-gray-50 border-r border-border/50 shadow-lg transition-transform duration-300",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
    )}>
      <ScrollArea className="h-full">
        <nav className="space-y-1 p-4">
          {/* Welcome Section */}
          <div className="mb-6 p-4 bg-gradient-tsp rounded-lg text-white">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 animate-pulse" />
              <h3 className="font-medium">Making a Difference</h3>
            </div>
            <p className="text-sm opacity-90">
              Together, we're feeding hope one sandwich at a time.
            </p>
          </div>

          {groupedItems.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <div key={`sep-${index}`} className="pt-4 pb-2">
                  <h4 className="px-3 text-xs font-semibold text-tsp-charcoal uppercase tracking-wider flex items-center gap-2">
                    <span className="h-px bg-border flex-1" />
                    <span>{getGroupLabel(item.group)}</span>
                    <span className="h-px bg-border flex-1" />
                  </h4>
                </div>
              );
            }

            const isCurrentlyActive = isActive(item.href);
            
            // Get unread count for specific items
            let unreadCount = 0;
            if (item.id === 'gmail-inbox') {
              unreadCount = gmailUnreadCount;
            } else if (item.id === 'messages') {
              unreadCount = totalUnread;
            } else if (item.id === 'chat') {
              unreadCount = unreadCounts.general;
            } else if (item.id === 'committee-chat') {
              unreadCount = unreadCounts.committee;
            } else if (item.id === 'suggestions' && unreadCounts.suggestion) {
              unreadCount = unreadCounts.suggestion;
            }
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3 transition-all duration-200",
                  isCurrentlyActive ? (
                    "bg-gradient-to-r from-tsp-navy to-tsp-teal-dark text-white shadow-md border-l-4 border-tsp-gold"
                  ) : (
                    "hover:bg-tsp-navy-light hover:translate-x-1 text-tsp-charcoal"
                  )
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSectionChange(item.href);
                }}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isCurrentlyActive ? "text-white" : "text-tsp-navy"
                )} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {unreadCount > 0 && (
                  <Badge 
                    variant={isCurrentlyActive ? "secondary" : "destructive"} 
                    className="ml-auto h-5 min-w-[20px] flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
                {isCurrentlyActive && (
                  <ChevronRight className="h-4 w-4 text-white" />
                )}
              </Button>
            );
          })}

          {/* Footer */}
          <div className="pt-6 mt-6 border-t border-border">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground text-center">
                © 2024 The Sandwich Project
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Powered by compassion ❤️
              </p>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}