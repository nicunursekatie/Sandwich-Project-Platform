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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  USER_ROLES,
  PERMISSIONS,
  getDefaultPermissionsForRole,
  getRoleDisplayName,
} from "@shared/auth-utils";
import {
  MessageCircle,
  Shield,
  Database,
  Eye,
  Edit,
  UserCog,
  FileText,
  TrendingUp,
  Users,
  Settings,
  ChevronRight,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface UserPermissionsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, role: string, permissions: string[]) => void;
}

// Permission categories focused on managing OTHER people's content
// Note: Users automatically own content they create - these permissions are for managing others' content
const PERMISSION_CATEGORIES = [
  {
    id: "content_management",
    label: "Content Management Authority", 
    icon: Shield,
    description: "Authority to edit/delete other users' content (you automatically own your own content)",
    permissions: [
      { key: PERMISSIONS.EDIT_COLLECTIONS, label: "Edit Others' Collections", description: "Edit collection entries created by other users" },
      { key: PERMISSIONS.DELETE_COLLECTIONS, label: "Delete Others' Collections", description: "Delete collection entries created by other users" },
      { key: PERMISSIONS.MANAGE_PROJECTS, label: "Manage Others' Projects", description: "Edit and delete projects created by other users" },
    ],
  },
  {
    id: "organizational_management",
    label: "Organizational Data Management",
    icon: Database,
    description: "Authority to manage organizational data (hosts, recipients, drivers)",
    permissions: [
      { key: PERMISSIONS.MANAGE_RECIPIENTS, label: "Manage Recipients", description: "Edit recipient information" },
      { key: PERMISSIONS.MANAGE_HOSTS, label: "Manage Hosts", description: "Edit host information" },
      { key: PERMISSIONS.MANAGE_DRIVERS, label: "Manage Drivers", description: "Edit driver information" },
    ],
  },
  {
    id: "access_control",
    label: "Access & Visibility",
    icon: Eye,
    description: "Access to view different sections and data",
    permissions: [
      { key: PERMISSIONS.VIEW_COLLECTIONS, label: "View Collections", description: "Access collection logs" },
      { key: PERMISSIONS.VIEW_PROJECTS, label: "View Projects", description: "Access project information" },
      { key: PERMISSIONS.VIEW_ANALYTICS, label: "View Analytics", description: "Access analytics dashboards" },
      { key: PERMISSIONS.VIEW_REPORTS, label: "View Reports", description: "Access and generate reports" },
      { key: PERMISSIONS.VIEW_MEETINGS, label: "View Meetings", description: "Access meeting information" },
    ],
  },
  {
    id: "communication",
    label: "Communication Access",
    icon: MessageCircle,
    description: "Access to chat rooms and messaging features",
    permissions: [
      { key: PERMISSIONS.GENERAL_CHAT, label: "General Chat", description: "Access to general chat room" },
      { key: PERMISSIONS.COMMITTEE_CHAT, label: "Committee Chat", description: "Access to committee chat room" },
      { key: PERMISSIONS.HOST_CHAT, label: "Host Chat", description: "Access to host chat room" },
      { key: PERMISSIONS.DRIVER_CHAT, label: "Driver Chat", description: "Access to driver chat room" },
      { key: PERMISSIONS.RECIPIENT_CHAT, label: "Recipient Chat", description: "Access to recipient chat room" },
      { key: "core_team_chat", label: "Core Team Chat", description: "Access to core team chat room" },
    ],
  },
  {
    id: "system_administration",
    label: "System Administration",
    icon: UserCog,
    description: "System management and advanced administrative functions",
    permissions: [
      { key: PERMISSIONS.VIEW_USERS, label: "Manage Users", description: "View and edit user roles and permissions" },
      { key: PERMISSIONS.MANAGE_USERS, label: "Full User Management", description: "Complete control over user accounts" },
      { key: PERMISSIONS.MANAGE_ANNOUNCEMENTS, label: "Manage Announcements", description: "Create and edit system announcements" },
      { key: PERMISSIONS.VIEW_SUGGESTIONS, label: "View All Suggestions", description: "Access all user suggestions" },
      { key: PERMISSIONS.MANAGE_SUGGESTIONS, label: "Manage Suggestions", description: "Review and update suggestion workflow" },
      { key: PERMISSIONS.RESPOND_TO_SUGGESTIONS, label: "Official Responses", description: "Post official organizational responses" },
    ],
  },
];

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
  onSave,
}: UserPermissionsDialogProps) {
  const [editingRole, setEditingRole] = useState<string>("");
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setEditingRole(user.role);
      setEditingPermissions([...user.permissions]);
      setHasChanges(false);
    }
  }, [user]);

  const handleRoleChange = (newRole: string) => {
    setEditingRole(newRole);
    const defaultPerms = getDefaultPermissionsForRole(newRole);
    setEditingPermissions(defaultPerms);
    setHasChanges(true);
  };

  const handlePermissionToggle = (permission: string) => {
    setEditingPermissions((prev) => {
      const newPerms = prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission];
      setHasChanges(true);
      return newPerms;
    });
  };

  const handleSave = () => {
    if (user) {
      onSave(user.id, editingRole, editingPermissions);
    }
  };

  const handleSelectAll = (categoryPermissions: string[]) => {
    setEditingPermissions((prev) => {
      const newPerms = [...prev];
      categoryPermissions.forEach((perm) => {
        if (!newPerms.includes(perm)) {
          newPerms.push(perm);
        }
      });
      setHasChanges(true);
      return newPerms;
    });
  };

  const handleDeselectAll = (categoryPermissions: string[]) => {
    setEditingPermissions((prev) => {
      const newPerms = prev.filter((p) => !categoryPermissions.includes(p));
      setHasChanges(true);
      return newPerms;
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit User Permissions</DialogTitle>
          <DialogDescription>
            Configure role and permissions for{" "}
            <span className="font-semibold">
              {user.firstName} {user.lastName}
            </span>{" "}
            ({user.email})
          </DialogDescription>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Users automatically own content they create or are assigned to. 
              These permissions control what they can do with <em>other people's</em> content and system access.
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-base font-semibold">
                User Role
              </Label>
              <Select value={editingRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center justify-between w-full">
                        <span>{getRoleDisplayName(role)}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {role}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Changing the role will reset permissions to the default for that role
              </p>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Permissions</Label>
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <Accordion type="multiple" className="w-full">
                  {PERMISSION_CATEGORIES.map((category) => {
                    const categoryPermissionKeys = category.permissions.map((p) => p.key);
                    const selectedCount = categoryPermissionKeys.filter((p) =>
                      editingPermissions.includes(p)
                    ).length;
                    const Icon = category.icon;

                    return (
                      <AccordionItem key={category.id} value={category.id}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <div className="text-left">
                                <div className="font-semibold">{category.label}</div>
                                <div className="text-sm text-muted-foreground">
                                  {category.description}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {selectedCount} / {category.permissions.length}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            <div className="flex justify-end gap-2 mb-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAll(categoryPermissionKeys)}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeselectAll(categoryPermissionKeys)}
                              >
                                Deselect All
                              </Button>
                            </div>
                            <div className="grid gap-3">
                              {category.permissions.map(({ key, label, description }) => (
                                <div
                                  key={key}
                                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={key}
                                    checked={editingPermissions.includes(key)}
                                    onCheckedChange={() => handlePermissionToggle(key)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 space-y-1">
                                    <Label
                                      htmlFor={key}
                                      className="font-medium cursor-pointer"
                                    >
                                      {label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                      {description}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {key}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {editingPermissions.length} permissions selected
            </Badge>
            {hasChanges && (
              <Badge variant="secondary" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}