import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  USER_ROLES,
  PERMISSIONS,
  getDefaultPermissionsForRole,
  getRoleDisplayName,
} from "@shared/auth-utils";
import {
  Users,
  Phone,
  Building,
  UserCheck,
  Truck,
  Database,
  MessageCircle,
  Mail,
  Wrench,
  Calendar,
  TrendingUp,
  FileText,
  FolderOpen,
  Lightbulb,
  PieChart,
  Shield,
  Edit,
  Eye,
  Settings,
  CheckSquare,
  Square,
  Minus,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface SimplePermissionsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, role: string, permissions: string[]) => void;
}

// Content-focused permission groups organized by user capabilities
const PERMISSION_GROUPS = [
  {
    id: "content_management",
    label: "Content Management",
    description: "Control over creating, editing, and managing various content types",
    type: "content",
    permissions: [
      { key: PERMISSIONS.ACCESS_COLLECTIONS, label: "View Collections", icon: Eye, description: "View all collection records" },
      { key: PERMISSIONS.MANAGE_COLLECTIONS, label: "Submit Own Collections", icon: Database, description: "Submit your own collection data" },
      { key: PERMISSIONS.EDIT_OWN_COLLECTIONS, label: "Edit Own Collections", icon: Edit, description: "Modify your own collection records" },
      { key: PERMISSIONS.DELETE_OWN_COLLECTIONS, label: "Delete Own Collections", icon: Edit, description: "Delete your own collection records" },
      { key: PERMISSIONS.EDIT_ALL_COLLECTIONS, label: "Edit All Collections", icon: Shield, description: "Edit any collection record" },
      { key: PERMISSIONS.DELETE_ALL_COLLECTIONS, label: "Delete All Collections", icon: Shield, description: "Delete any collection record" },
      
      { key: PERMISSIONS.ACCESS_PROJECTS, label: "View Projects", icon: Eye, description: "View project information" },
      { key: PERMISSIONS.EDIT_OWN_PROJECTS, label: "Edit Own Projects", icon: Edit, description: "Edit projects you created" },
      { key: PERMISSIONS.DELETE_OWN_PROJECTS, label: "Delete Own Projects", icon: Edit, description: "Delete projects you created" },
      { key: PERMISSIONS.EDIT_ALL_PROJECTS, label: "Edit All Projects", icon: Shield, description: "Edit any project (admin level)" },
      { key: PERMISSIONS.DELETE_ALL_PROJECTS, label: "Delete All Projects", icon: Shield, description: "Delete any project (admin level)" },
      { key: PERMISSIONS.MANAGE_PROJECTS, label: "Manage Projects (Legacy)", icon: FolderOpen, description: "Legacy: Full project management access" },
      
      { key: PERMISSIONS.ACCESS_SUGGESTIONS, label: "View Suggestions", icon: Eye, description: "View suggestion portal" },
      { key: PERMISSIONS.SUBMIT_SUGGESTIONS, label: "Submit Suggestions", icon: Lightbulb, description: "Submit your own suggestions" },
      { key: PERMISSIONS.MANAGE_SUGGESTIONS, label: "Manage All Suggestions", icon: Shield, description: "Review and respond to all suggestions" },
      
      { key: PERMISSIONS.ACCESS_WORK_LOGS, label: "View Work Logs", icon: Eye, description: "Access work logs section" },
      { key: PERMISSIONS.CREATE_WORK_LOGS, label: "Create Work Logs", icon: Edit, description: "Submit your own work log entries" },
      { key: PERMISSIONS.EDIT_OWN_WORK_LOGS, label: "Edit Own Work Logs", icon: Edit, description: "Edit your own work log entries" },
      { key: PERMISSIONS.DELETE_OWN_WORK_LOGS, label: "Delete Own Work Logs", icon: Edit, description: "Delete your own work log entries" },
      { key: PERMISSIONS.VIEW_ALL_WORK_LOGS, label: "View All Work Logs", icon: Eye, description: "View everyone's work logs (admin/supervisor)" },
      { key: PERMISSIONS.EDIT_ALL_WORK_LOGS, label: "Edit All Work Logs", icon: Shield, description: "Edit any work log entry (admin level)" },
      { key: PERMISSIONS.DELETE_ALL_WORK_LOGS, label: "Delete All Work Logs", icon: Shield, description: "Delete any work log entry (admin level)" },
    ]
  },
  {
    id: "directory_contact",
    label: "Directory & Contact Data",
    description: "Access levels to organizational contact information",
    type: "directory",
    permissions: [
      { key: PERMISSIONS.ACCESS_DIRECTORY, label: "Basic Directory Access", icon: Phone, description: "View basic contact information" },
      // Note: Full contact details would need a new permission
      
      { key: PERMISSIONS.ACCESS_HOSTS, label: "View Hosts", icon: Eye, description: "View host organizations" },
      { key: PERMISSIONS.MANAGE_HOSTS, label: "Add/Edit Hosts", icon: Building, description: "Add and edit host organizations" },
      // Note: "Manage All Hosts" would be separate from basic edit
      
      { key: PERMISSIONS.ACCESS_DRIVERS, label: "View Drivers", icon: Eye, description: "View driver information" },
      { key: PERMISSIONS.MANAGE_DRIVERS, label: "Add/Edit Drivers", icon: Truck, description: "Add and edit driver records" },
      
      { key: PERMISSIONS.ACCESS_RECIPIENTS, label: "View Recipients", icon: Eye, description: "View recipient organizations" },
      { key: PERMISSIONS.MANAGE_RECIPIENTS, label: "Add/Edit Recipients", icon: UserCheck, description: "Add and edit recipient organizations" },
    ]
  },
  {
    id: "communication_access",
    label: "Communication",
    description: "Chat room access and messaging capabilities",
    type: "communication",
    permissions: [
      { key: PERMISSIONS.GENERAL_CHAT, label: "General Chat", icon: MessageCircle, description: "Access general team chat" },
      { key: PERMISSIONS.HOST_CHAT, label: "Host Chat", icon: Building, description: "Access host-specific chat room" },
      { key: PERMISSIONS.DRIVER_CHAT, label: "Driver Chat", icon: Truck, description: "Access driver-specific chat room" },
      { key: PERMISSIONS.RECIPIENT_CHAT, label: "Recipient Chat", icon: UserCheck, description: "Access recipient-specific chat room" },
      { key: PERMISSIONS.COMMITTEE_CHAT, label: "Committee Chat", icon: Users, description: "Access committee chat room" },
      { key: PERMISSIONS.CORE_TEAM_CHAT, label: "Core Team Chat", icon: Shield, description: "Access leadership chat room" },
      
      { key: PERMISSIONS.DIRECT_MESSAGES, label: "Direct Messaging", icon: Mail, description: "Send/receive private messages" },
      { key: PERMISSIONS.MODERATE_MESSAGES, label: "Message Moderation", icon: Eye, description: "Edit/delete others' messages across all channels" },
    ]
  },
  {
    id: "navigation_control",
    label: "Navigation Control", 
    description: "Which tabs and features appear in user's interface",
    type: "navigation",
    permissions: [
      { key: PERMISSIONS.ACCESS_CHAT, label: "Chat Tab", icon: MessageCircle, description: "Show Chat tab in navigation" },
      { key: PERMISSIONS.ACCESS_MESSAGES, label: "Messages Tab", icon: Mail, description: "Show Messages tab in navigation" },
      { key: PERMISSIONS.ACCESS_TOOLKIT, label: "Toolkit Tab", icon: Wrench, description: "Show Toolkit/Documents tab" },
      { key: PERMISSIONS.ACCESS_MEETINGS, label: "Meetings Section", icon: Calendar, description: "Show Meetings in Operations" },
      { key: PERMISSIONS.ACCESS_ANALYTICS, label: "Analytics Section", icon: TrendingUp, description: "Show Analytics in Operations" },
      { key: PERMISSIONS.ACCESS_REPORTS, label: "Reports Section", icon: FileText, description: "Show Reports in Operations" },
      { key: PERMISSIONS.ACCESS_SANDWICH_DATA, label: "Sandwich Data", icon: PieChart, description: "Access to sandwich totals data sheet" },
      { key: PERMISSIONS.ACCESS_WORK_LOGS, label: "Work Logs Section", icon: Calendar, description: "Show Work Logs in navigation" },
    ]
  },
  {
    id: "system_access",
    label: "System Access",
    description: "Administrative functions and system-level capabilities",
    type: "system",
    permissions: [
      { key: PERMISSIONS.ADMIN_ACCESS, label: "Admin Panel", icon: Shield, description: "Access to admin interface" },
      { key: PERMISSIONS.MANAGE_USERS, label: "User Management", icon: Users, description: "Manage users and permissions" },
      { key: PERMISSIONS.MANAGE_ANNOUNCEMENTS, label: "System Announcements", icon: FileText, description: "Create/edit system announcements" },
      { key: PERMISSIONS.MANAGE_MEETINGS, label: "Meeting Management", icon: Calendar, description: "Schedule and manage meetings" },
    ]
  },
  {
    id: "data_operations",
    label: "Data Operations",
    description: "Bulk operations and cross-content editing capabilities",
    type: "operations",
    permissions: [
      { key: PERMISSIONS.EXPORT_DATA, label: "Export Data", icon: FileText, description: "Download data as files" },
      { key: PERMISSIONS.IMPORT_DATA, label: "Import Data", icon: Database, description: "Upload bulk data from files" },
      { key: PERMISSIONS.SCHEDULE_REPORTS, label: "Schedule Reports", icon: Calendar, description: "Set up automated reporting" },
      // Note: Cross-content editing and permanent deletions would need new granular permissions
    ]
  }
];

// Helper functions for visual organization
function getCardColorForType(type: string) {
  switch (type) {
    case "content": return "border-blue-200 bg-blue-50/50";
    case "directory": return "border-green-200 bg-green-50/50";
    case "communication": return "border-purple-200 bg-purple-50/50";
    case "navigation": return "border-orange-200 bg-orange-50/50";
    case "system": return "border-red-200 bg-red-50/50";
    case "operations": return "border-indigo-200 bg-indigo-50/50";
    default: return "border-gray-200 bg-gray-50/50";
  }
}

function getIconForType(type: string) {
  switch (type) {
    case "content": return <Database className="h-4 w-4 text-blue-600" />;
    case "directory": return <Phone className="h-4 w-4 text-green-600" />;
    case "communication": return <MessageCircle className="h-4 w-4 text-purple-600" />;
    case "navigation": return <Eye className="h-4 w-4 text-orange-600" />;
    case "system": return <Shield className="h-4 w-4 text-red-600" />;
    case "operations": return <Settings className="h-4 w-4 text-indigo-600" />;
    default: return <Settings className="h-4 w-4 text-gray-600" />;
  }
}

export function SimplePermissionsDialog({ user, open, onOpenChange, onSave }: SimplePermissionsDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user && open) {
      setSelectedRole(user.role);
      setSelectedPermissions(user.permissions || []);

    }
  }, [user, open]);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    const defaultPermissions = getDefaultPermissionsForRole(newRole);
    setSelectedPermissions(defaultPermissions);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permission]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    }
  };

  const handleSave = () => {
    if (user) {
      onSave(user.id, selectedRole, selectedPermissions);
      onOpenChange(false);
    }
  };

  const isPermissionChecked = (permission: string) => {
    return selectedPermissions.includes(permission);
  };

  // Bulk selection helpers
  const getCategoryStatus = (category: any) => {
    const categoryPermissions = category.permissions.map((p: any) => p.key);
    const checkedCount = categoryPermissions.filter((p: string) => selectedPermissions.includes(p)).length;
    
    if (checkedCount === 0) return 'none';
    if (checkedCount === categoryPermissions.length) return 'all';
    return 'partial';
  };

  const handleBulkCategoryToggle = (category: any) => {
    const categoryPermissions = category.permissions.map((p: any) => p.key);
    const status = getCategoryStatus(category);
    
    if (status === 'all') {
      // Remove all category permissions
      setSelectedPermissions(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      // Add all category permissions
      const newPermissions = [...selectedPermissions];
      categoryPermissions.forEach((perm: string) => {
        if (!newPermissions.includes(perm)) {
          newPermissions.push(perm);
        }
      });
      setSelectedPermissions(newPermissions);
    }
  };

  const getBulkIcon = (status: string) => {
    switch (status) {
      case 'all': return <CheckSquare className="h-4 w-4" />;
      case 'partial': return <Minus className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Edit Permissions: {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            Control which sections of the application this user can access. Choose a role preset or customize individual permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="role">User Role</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Common viewer permissions - view-only access
                    const viewerPermissions = [
                      PERMISSIONS.ACCESS_DIRECTORY,
                      PERMISSIONS.ACCESS_COLLECTIONS,
                      PERMISSIONS.ACCESS_HOSTS,
                      PERMISSIONS.ACCESS_RECIPIENTS, 
                      PERMISSIONS.ACCESS_DRIVERS,
                      PERMISSIONS.ACCESS_PROJECTS,
                      PERMISSIONS.ACCESS_TOOLKIT,
                      PERMISSIONS.ACCESS_SANDWICH_DATA,
                      PERMISSIONS.GENERAL_CHAT
                    ];
                    setSelectedPermissions(viewerPermissions);
                  }}
                  className="text-xs"
                >
                  Viewer Preset
                </Button>

              </div>
            </div>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(USER_ROLES).map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Use role presets for quick setup, or choose permission presets above for common configurations.
            </p>
          </div>

          {/* Permission Categories */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((category) => (
                <Card key={category.id} className={`${getCardColorForType(category.type)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getIconForType(category.type)}
                        {category.label}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBulkCategoryToggle(category)}
                        className="h-8 px-2 text-xs"
                        title={`Select all ${category.label.toLowerCase()}`}
                      >
                        {getBulkIcon(getCategoryStatus(category))}
                        <span className="ml-1 hidden sm:inline">
                          {getCategoryStatus(category) === 'all' ? 'Deselect All' : 'Select All'}
                        </span>
                      </Button>
                    </div>
                    <CardDescription className="text-sm">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((permission) => {
                        const Icon = permission.icon;
                        return (
                          <div
                            key={permission.key}
                            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <Checkbox
                              id={permission.key}
                              checked={isPermissionChecked(permission.key)}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(permission.key, checked as boolean)
                              }
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <Label
                                  htmlFor={permission.key}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.label}
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Actions & Permission Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedPermissions.length} permissions selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Role: {getRoleDisplayName(selectedRole)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPermissions([])}
                disabled={selectedPermissions.length === 0}
              >
                Clear All
              </Button>
              <Button
                variant="outline" 
                size="sm"
                onClick={() => {
                  const allPermissions = PERMISSION_GROUPS.flatMap(group => 
                    group.permissions.map(p => p.key)
                  );
                  setSelectedPermissions(allPermissions);
                }}
                disabled={selectedPermissions.length === Object.values(PERMISSIONS).length}
              >
                Select All
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}