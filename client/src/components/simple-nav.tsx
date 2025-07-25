import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Scale
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { useMessaging } from "@/hooks/useMessaging";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  permission?: string;
  group?: string;
}

export default function SimpleNav({ onSectionChange, activeSection }: { onSectionChange: (section: string) => void; activeSection?: string }) {
  const { user } = useAuth();
  const [location] = useLocation();
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Navigation organized by sections: MAIN, COMMUNICATION, WORKFLOW, PEOPLE, DATA
  const navigationItems: NavigationItem[] = [
    // MAIN section
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
    ...(hasPermission(user, PERMISSIONS.VIEW_PROJECTS) ? [{ id: "projects", label: "Projects", icon: ClipboardList, href: "projects" }] : []),
    { id: "collections", label: "Collections Log", icon: Sandwich, href: "collections" },
    
    // COMMUNICATION section
    { id: "gmail-inbox", label: "Inbox", icon: Inbox, href: "gmail-inbox", group: "communication" },
    { id: "stream-messages", label: "Stream Chat", icon: Inbox, href: "stream-messages", group: "communication" },
    { id: "chat", label: "Team Chat", icon: Hash, href: "chat", group: "communication" },
    ...(hasPermission(user, PERMISSIONS.VIEW_SUGGESTIONS) ? [{ id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "suggestions", group: "communication" }] : []),
    
    // WORKFLOW section
    ...(hasPermission(user, PERMISSIONS.ACCESS_WORK_LOGS) ? [{ id: "work-log", label: "Work Log", icon: ListTodo, href: "work-log", group: "workflow" }] : []),
    { id: "toolkit", label: "Toolkit", icon: FolderOpen, href: "toolkit", group: "workflow" },
    ...(hasPermission(user, PERMISSIONS.ADMIN_ACCESS) ? [{ id: "admin", label: "Important Documents", icon: FileText, href: "admin", group: "workflow" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_GOVERNANCE) ? [{ id: "governance", label: "Governance", icon: Scale, href: "governance", group: "workflow" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_MEETINGS) ? [
      { id: "meeting-minutes", label: "Meeting Minutes", icon: FileText, href: "minutes", group: "workflow" },
      { id: "meeting-agenda", label: "Meeting Agenda", icon: ClipboardList, href: "agenda", group: "workflow" },
      { id: "meeting-calendar", label: "Meeting Calendar", icon: ClipboardList, href: "calendar", group: "workflow" }
    ] : []),
    
    // PEOPLE section
    { id: "phone-directory", label: "Directory", icon: Phone, href: "phone-directory", group: "people" },
    ...(hasPermission(user, PERMISSIONS.VIEW_HOSTS) ? [{ id: "hosts", label: "Hosts", icon: Building2, href: "hosts", group: "people" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_DRIVERS) ? [{ id: "drivers", label: "Drivers", icon: Car, href: "drivers", group: "people" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_RECIPIENTS) ? [{ id: "recipients", label: "Recipients", icon: Users, href: "recipients", group: "people" }] : []),
    
    // DATA section
    ...(hasPermission(user, PERMISSIONS.VIEW_ANALYTICS) ? [{ id: "analytics", label: "Analytics", icon: BarChart3, href: "analytics", group: "data" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_REPORTS) ? [{ id: "reports", label: "Reports", icon: FileText, href: "reports", group: "data" }] : []),
    ...(hasPermission(user, PERMISSIONS.VIEW_SANDWICH_DATA) ? [{ id: "google-sheets", label: "Sandwich Data", icon: Sheet, href: "google-sheets", group: "data" }] : []),
    
    // Admin section (filtered by permissions)
    ...(hasPermission(user, PERMISSIONS.MANAGE_USERS) ? [{ id: "user-management", label: "User Management", icon: Settings, href: "user-management", group: "admin" }] : [])
  ];

  const isActive = (href: string) => {
    // If activeSection is provided, use it directly
    if (activeSection) {
      // For dashboard, check both "dashboard" and root
      if (href === "dashboard") return activeSection === "dashboard" || activeSection === "";
      return activeSection === href;
    }
    
    // Fallback to URL-based navigation for standalone usage
    if (href === "dashboard") return location === "/" || location === "/dashboard";
    return location === `/${href}`;
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
      communication: "COMMUNICATION",
      workflow: "WORKFLOW",
      people: "PEOPLE",
      data: "DATA",
      admin: "ADMIN"
    };
    return labels[group as keyof typeof labels] || group;
  };

  return (
    <nav className="space-y-1 p-3 sm:p-4 pb-6 sm:pb-8">
      {groupedItems.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div key={`sep-${index}`} className="pt-3 sm:pt-4 pb-2">
              <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="h-px bg-slate-200 flex-1 mr-2 sm:mr-3" />
                <span className="text-[10px] sm:text-xs">{getGroupLabel(item.group)}</span>
              </div>
            </div>
          );
        }

        const isCurrentlyActive = isActive(item.href);
        
        // Get unread count for specific items
        let unreadCount = 0;
        if (item.id === 'gmail-inbox') {
          unreadCount = gmailUnreadCount; // Gmail inbox unread count
        } else if (item.id === 'messages') {
          unreadCount = totalUnread; // Direct/Group messages
        } else if (item.id === 'chat') {
          unreadCount = unreadCounts.general; // Chat rooms
        } else if (item.id === 'committee-chat') {
          unreadCount = unreadCounts.committee;
        } else if (item.id === 'suggestions' && unreadCounts.suggestion) {
          unreadCount = unreadCounts.suggestion;
        }
        
        return (
          <Button
            key={item.id}
            variant={isCurrentlyActive ? "default" : "ghost"}
            className={`
              w-full justify-start text-left h-10 sm:h-11 px-2 sm:px-3 touch-manipulation
              ${isCurrentlyActive 
                ? "bg-primary text-primary-foreground shadow-sm border-l-4 border-l-yellow-500" 
                : "hover:bg-slate-100 text-slate-700"
              }
            `}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Navigation click:', item.href);
              onSectionChange(item.href);
            }}
          >
            <item.icon className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
            <span className="truncate flex-1 text-sm sm:text-base">{item.label}</span>
            {unreadCount > 0 && (
              <Badge 
                variant={isCurrentlyActive ? "secondary" : "destructive"} 
                className="ml-auto h-4 sm:h-5 px-1 sm:px-1.5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
}