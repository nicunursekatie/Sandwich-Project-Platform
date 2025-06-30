import { useState } from "react";
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
  ChevronDown, 
  ChevronRight 
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@/lib/authUtils";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  permission?: string;
}

interface NavigationSection {
  id: string;
  label: string;
  icon: any;
  type: "section";
  items: NavigationItem[];
}

interface NavigationPlainItem {
  id: string;
  label: string;
  icon: any;
  type: "item";
  href: string;
  permission?: string;
}

type NavigationStructureItem = NavigationSection | NavigationPlainItem;

export function CollapsibleNav() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [expandedSections, setExpandedSections] = useState<string[]>(["operations"]);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  


  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Navigation structure with expandable sections
  const navigationStructure: NavigationStructureItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, type: "item", href: "/" },
    { id: "collections", label: "Collections Log", icon: Sandwich, type: "item", href: "/collections" },
    { 
      id: "team", 
      label: "Team", 
      icon: Users, 
      type: "section",
      items: [
        { id: "hosts", label: "Hosts", icon: Building2, href: "/hosts", permission: PERMISSIONS.VIEW_HOSTS } as NavigationItem,
        { id: "recipients", label: "Recipients", icon: Users, href: "/recipients", permission: PERMISSIONS.VIEW_RECIPIENTS } as NavigationItem,
        { id: "drivers", label: "Drivers", icon: Car, href: "/drivers", permission: PERMISSIONS.VIEW_DRIVERS } as NavigationItem,
      ]
    },
    { 
      id: "operations", 
      label: "Operations", 
      icon: FolderOpen, 
      type: "section",
      items: [
        { id: "meetings", label: "Meetings", icon: ClipboardList, href: "/meetings", permission: PERMISSIONS.VIEW_MEETINGS },
        { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics", permission: PERMISSIONS.VIEW_ANALYTICS },
        { id: "reports", label: "Reports", icon: FileText, href: "/reporting-dashboard", permission: PERMISSIONS.VIEW_REPORTS },
        { id: "projects", label: "Projects", icon: ListTodo, href: "/projects", permission: PERMISSIONS.VIEW_PROJECTS },
        { id: "role-demo", label: "Role Demo", icon: Users, href: "/role-demo", permission: PERMISSIONS.VIEW_ROLE_DEMO }
      ]
    },
    { 
      id: "communication", 
      label: "Communication", 
      icon: MessageCircle, 
      type: "section",
      items: [
        { id: "committee", label: "Committee", icon: Users, href: "/committee", permission: PERMISSIONS.VIEW_COMMITTEE },
        { id: "messages-comm", label: "Messages", icon: MessageCircle, href: "/messages" },
        { id: "directory", label: "Directory", icon: Phone, href: "/directory", permission: PERMISSIONS.VIEW_PHONE_DIRECTORY }
      ]
    },
    { id: "toolkit", label: "Toolkit", icon: FileText, type: "item", href: "/toolkit" },
    { id: "development", label: "Development", icon: FolderOpen, type: "item", href: "/development" },
    { id: "admin", label: "Admin", icon: Users, type: "item", href: "/admin", permission: PERMISSIONS.MANAGE_USERS },
  ];

  // Simplified navigation filtering - force Operations to always show for committee members
  const filteredNavigation = navigationStructure.filter(item => {
    // Always show Operations section for any authenticated user
    if (item.type === "section" && item.id === "operations") {
      return !!user;
    }
    
    // Show other items normally
    if ((item as any).permission) {
      return user && hasPermission(user, (item as any).permission);
    }
    
    return true;
  });

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            
            if (item.type === "section") {
              const isExpanded = expandedSections.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors text-foreground hover:bg-muted hover:text-primary"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <ul className="mt-2 ml-8 space-y-1">
                      {item.items?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeSection === subItem.id;
                        return (
                          <li key={subItem.id}>
                            <button
                              onClick={() => {

                                if (subItem.href) {
                                  setLocation(subItem.href);
                                } else {
                                  setActiveSection(subItem.id);
                                }
                              }}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                isSubActive
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <SubIcon className="w-4 h-4" />
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            } else {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {

                      if (item.href) {
                        setLocation(item.href);
                      } else {
                        setActiveSection(item.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            }
          })}
        </ul>
      </nav>
    </div>
  );
}