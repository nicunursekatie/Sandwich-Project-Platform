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

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  permission?: string;
  group?: string;
}

export default function SimpleNav({ onSectionChange }: { onSectionChange: (section: string) => void }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { unreadCounts, totalUnread } = useMessaging();

  // Navigation organized by sections: MAIN, COMMUNICATION, WORKFLOW, PEOPLE, DATA
  const navigationItems: NavigationItem[] = [
    // MAIN section
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "dashboard" },
    ...(hasPermission(user, PERMISSIONS.VIEW_PROJECTS) ? [{ id: "projects", label: "Projects", icon: ClipboardList, href: "projects" }] : []),
    { id: "collections", label: "Collections Log", icon: Sandwich, href: "collections" },
    
    // COMMUNICATION section
    { id: "real-time-messages", label: "Messages", icon: MessageCircle, href: "real-time-messages", group: "communication" },
    { id: "stream-messages", label: "Messaging Premade", icon: Inbox, href: "stream-messages", group: "communication" },
    { id: "chat", label: "Chat", icon: Hash, href: "chat", group: "communication" },
    ...(hasPermission(user, PERMISSIONS.VIEW_SUGGESTIONS) ? [{ id: "suggestions", label: "Suggestions", icon: Lightbulb, href: "suggestions", group: "communication" }] : []),
    
    // WORKFLOW section
    { id: "work-log", label: "Work Log", icon: ListTodo, href: "work-log", group: "workflow" },
    { id: "toolkit", label: "Toolkit", icon: FolderOpen, href: "toolkit", group: "workflow" },
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
    
    // Admin section (filtered by permissions)
    ...(hasPermission(user, PERMISSIONS.ADMIN_ACCESS) ? [{ id: "admin", label: "Important Documents", icon: FileText, href: "admin", group: "admin" }] : []),
    ...(hasPermission(user, PERMISSIONS.MANAGE_USERS) ? [{ id: "user-management", label: "User Management", icon: Settings, href: "user-management", group: "admin" }] : [])
  ];

  const isActive = (href: string) => {
    // For dashboard, check if we're on root or dashboard
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
    <nav className="space-y-1 p-4 pb-8">
      {groupedItems.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div key={`sep-${index}`} className="pt-4 pb-2">
              <div className="flex items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                <div className="h-px bg-slate-200 flex-1 mr-3" />
                {getGroupLabel(item.group)}
              </div>
            </div>
          );
        }

        const isCurrentlyActive = isActive(item.href);
        
        // Get unread count for specific items
        let unreadCount = 0;
        if (item.id === 'messages') {
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
              w-full justify-start text-left h-10 px-3
              ${isCurrentlyActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
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
            <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="truncate flex-1">{item.label}</span>
            {unreadCount > 0 && (
              <Badge 
                variant={isCurrentlyActive ? "secondary" : "destructive"} 
                className="ml-auto h-5 px-1.5 min-w-[20px] flex items-center justify-center"
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