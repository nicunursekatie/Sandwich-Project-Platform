import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { hasPermission, USER_ROLES, PERMISSIONS, getRoleDisplayName, getDefaultPermissionsForRole } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Shield, Settings } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<string>("");
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  // Check if current user can manage users
  if (!hasPermission(currentUser, PERMISSIONS.MANAGE_USERS)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to manage users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: hasPermission(currentUser, PERMISSIONS.VIEW_USERS),
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string; permissions: string[] }) => {
      return apiRequest("PATCH", `/api/users/${data.userId}`, {
        role: data.role,
        permissions: data.permissions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Updated",
        description: "User permissions have been successfully updated.",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async (data: { userId: string; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/users/${data.userId}/status`, {
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User Status Updated",
        description: "User status has been successfully changed.",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingRole(user.role);
    setEditingPermissions(user.permissions || []);
  };

  const handleRoleChange = (role: string) => {
    setEditingRole(role);
    setEditingPermissions(getDefaultPermissionsForRole(role));
  };

  const handlePermissionToggle = (permission: string) => {
    setEditingPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;
    
    updateUserMutation.mutate({
      userId: selectedUser.id,
      role: editingRole,
      permissions: editingPermissions,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case USER_ROLES.COMMITTEE_MEMBER:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case USER_ROLES.VOLUNTEER:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case USER_ROLES.VIEWER:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions for team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit User Permissions</DialogTitle>
                            <DialogDescription>
                              Modify role and permissions for {user.firstName} {user.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div>
                              <Label htmlFor="role">Role</Label>
                              <Select
                                value={editingRole}
                                onValueChange={handleRoleChange}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={USER_ROLES.ADMIN}>Administrator</SelectItem>
                                  <SelectItem value={USER_ROLES.COMMITTEE_MEMBER}>Committee Member</SelectItem>
                                  <SelectItem value={USER_ROLES.VOLUNTEER}>Volunteer</SelectItem>
                                  <SelectItem value={USER_ROLES.VIEWER}>Viewer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Specific Permissions</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                {Object.entries(PERMISSIONS).map(([key, permission]) => (
                                  <div key={permission} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={permission}
                                      checked={editingPermissions.includes(permission)}
                                      onCheckedChange={() => handlePermissionToggle(permission)}
                                    />
                                    <Label
                                      htmlFor={permission}
                                      className="text-sm font-normal"
                                    >
                                      {key.replace(/_/g, ' ').toLowerCase()}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveChanges}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus.mutate({
                          userId: user.id,
                          isActive: !user.isActive
                        })}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}