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

// Granular permission groups organized by section and action
const PERMISSION_GROUPS = [
  {
    id: "access_tabs",
    label: "Tab Access",
    description: "Control which sections users can view",
    type: "access",
    permissions: [
      { key: PERMISSIONS.ACCESS_DIRECTORY, label: "Directory Tab", icon: Phone, description: "Phone directory and contact information" },
      { key: PERMISSIONS.ACCESS_HOSTS, label: "Hosts Tab", icon: Building, description: "Host organizations section" },
      { key: PERMISSIONS.ACCESS_RECIPIENTS, label: "Recipients Tab", icon: UserCheck, description: "Recipient organizations section" },
      { key: PERMISSIONS.ACCESS_DRIVERS, label: "Drivers Tab", icon: Truck, description: "Driver management section" },
      { key: PERMISSIONS.ACCESS_COLLECTIONS, label: "Collections Tab", icon: Database, description: "Sandwich collection data" },
      { key: PERMISSIONS.ACCESS_CHAT, label: "Chat Tab", icon: MessageCircle, description: "Real-time team chat" },
      { key: PERMISSIONS.ACCESS_MESSAGES, label: "Messages Tab", icon: Mail, description: "Formal messaging system" },
      { key: PERMISSIONS.ACCESS_TOOLKIT, label: "Toolkit Tab", icon: Wrench, description: "Documents and resources" },
    ]
  },
  {
    id: "operations_access",
    label: "Operations Access",
    description: "Access to operational tools and reporting",
    type: "access",
    permissions: [
      { key: PERMISSIONS.ACCESS_MEETINGS, label: "Meetings", icon: Calendar, description: "Meeting management and agendas" },
      { key: PERMISSIONS.ACCESS_ANALYTICS, label: "Analytics", icon: TrendingUp, description: "Data analytics and insights" },
      { key: PERMISSIONS.ACCESS_REPORTS, label: "Reports", icon: FileText, description: "Generate and view reports" },
      { key: PERMISSIONS.ACCESS_PROJECTS, label: "Projects", icon: FolderOpen, description: "Project management" },
      { key: PERMISSIONS.ACCESS_ROLE_DEMO, label: "Role Demo", icon: Users, description: "User role demonstration" },
    ]
  },
  {
    id: "resources_access",
    label: "Resources Access", 
    description: "Additional tools and data access",
    type: "access",
    permissions: [
      { key: PERMISSIONS.ACCESS_SUGGESTIONS, label: "Suggestions", icon: Lightbulb, description: "Suggestion portal" },
      { key: PERMISSIONS.ACCESS_SANDWICH_DATA, label: "Sandwich Data", icon: PieChart, description: "Sandwich totals data sheet" },
    ]
  },
  {
    id: "management_permissions",
    label: "Management Permissions",
    description: "Ability to add, edit, and manage data in sections",
    type: "management",
    permissions: [
      { key: PERMISSIONS.MANAGE_HOSTS, label: "Manage Hosts", icon: Building, description: "Add, edit, delete host organizations" },
      { key: PERMISSIONS.MANAGE_RECIPIENTS, label: "Manage Recipients", icon: UserCheck, description: "Add, edit, delete recipient organizations" },
      { key: PERMISSIONS.MANAGE_DRIVERS, label: "Manage Drivers", icon: Truck, description: "Add, edit, delete drivers" },
      { key: PERMISSIONS.MANAGE_COLLECTIONS, label: "Manage Collections", icon: Database, description: "Add, edit, delete collection records" },
      { key: PERMISSIONS.MANAGE_PROJECTS, label: "Manage Projects", icon: FolderOpen, description: "Create and modify projects" },
      { key: PERMISSIONS.MANAGE_MEETINGS, label: "Manage Meetings", icon: Calendar, description: "Schedule and edit meetings" },
      { key: PERMISSIONS.MANAGE_SUGGESTIONS, label: "Manage Suggestions", icon: Lightbulb, description: "Review and respond to suggestions" },
    ]
  },
  {
    id: "data_actions",
    label: "Data Actions",
    description: "Specific actions users can perform with data",
    type: "action",
    permissions: [
      { key: PERMISSIONS.EDIT_DATA, label: "Edit Data", icon: Edit, description: "Modify existing records" },
      { key: PERMISSIONS.DELETE_DATA, label: "Delete Data", icon: Users, description: "Remove records permanently" },
      { key: PERMISSIONS.EXPORT_DATA, label: "Export Data", icon: FileText, description: "Download data as files" },
      { key: PERMISSIONS.IMPORT_DATA, label: "Import Data", icon: Database, description: "Upload data from files" },
      { key: PERMISSIONS.SCHEDULE_REPORTS, label: "Schedule Reports", icon: Calendar, description: "Set up automated reporting" },
    ]
  },
  {
    id: "communication",
    label: "Communication",
    description: "Messaging and chat permissions",
    type: "communication",
    permissions: [
      { key: PERMISSIONS.SEND_MESSAGES, label: "Send Messages", icon: Mail, description: "Send formal messages" },
      { key: PERMISSIONS.DIRECT_MESSAGES, label: "Direct Messages", icon: MessageCircle, description: "One-on-one messaging" },
      { key: PERMISSIONS.GROUP_MESSAGES, label: "Group Messages", icon: Users, description: "Group conversations" },
      { key: PERMISSIONS.GENERAL_CHAT, label: "General Chat", icon: MessageCircle, description: "General chat room" },
      { key: PERMISSIONS.COMMITTEE_CHAT, label: "Committee Chat", icon: Users, description: "Committee chat room" },
      { key: PERMISSIONS.HOST_CHAT, label: "Host Chat", icon: Building, description: "Host chat room" },
      { key: PERMISSIONS.DRIVER_CHAT, label: "Driver Chat", icon: Truck, description: "Driver chat room" },
      { key: PERMISSIONS.RECIPIENT_CHAT, label: "Recipient Chat", icon: UserCheck, description: "Recipient chat room" },
      { key: PERMISSIONS.CORE_TEAM_CHAT, label: "Core Team Chat", icon: Shield, description: "Leadership chat room" },
    ]
  },
  {
    id: "admin",
    label: "Administrative",
    description: "System administration capabilities",
    type: "admin",
    permissions: [
      { key: PERMISSIONS.ADMIN_ACCESS, label: "Admin Panel", icon: Shield, description: "Access to admin interface" },
      { key: PERMISSIONS.MANAGE_USERS, label: "Manage Users", icon: Users, description: "User management and permissions" },
      { key: PERMISSIONS.MANAGE_ANNOUNCEMENTS, label: "Manage Announcements", icon: FileText, description: "System announcements" },
      { key: PERMISSIONS.MODERATE_MESSAGES, label: "Moderate Messages", icon: Eye, description: "Message moderation across all channels" },
    ]
  }
];

// Helper functions for visual organization
function getCardColorForType(type: string) {
  switch (type) {
    case "access": return "border-blue-200 bg-blue-50/50";
    case "management": return "border-green-200 bg-green-50/50";
    case "action": return "border-orange-200 bg-orange-50/50";
    case "communication": return "border-purple-200 bg-purple-50/50";
    case "admin": return "border-red-200 bg-red-50/50";
    default: return "border-gray-200 bg-gray-50/50";
  }
}

function getIconForType(type: string) {
  switch (type) {
    case "access": return <Eye className="h-4 w-4 text-blue-600" />;
    case "management": return <Edit className="h-4 w-4 text-green-600" />;
    case "action": return <Users className="h-4 w-4 text-orange-600" />;
    case "communication": return <MessageCircle className="h-4 w-4 text-purple-600" />;
    case "admin": return <Shield className="h-4 w-4 text-red-600" />;
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
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
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
              Changing the role will reset permissions to defaults for that role.
            </p>
          </div>

          {/* Permission Categories */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((category) => (
                <Card key={category.id} className={`${getCardColorForType(category.type)}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getIconForType(category.type)}
                      {category.label}
                    </CardTitle>
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

          {/* Current Permission Count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedPermissions.length} permissions selected
              </Badge>
              <span className="text-sm text-muted-foreground">
                Role: {getRoleDisplayName(selectedRole)}
              </span>
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