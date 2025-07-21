import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, X } from "lucide-react";

interface ProjectAssigneeSelectorProps {
  value: string;
  onChange: (value: string, userIds?: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  multiple?: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role?: string;
}

interface SelectedUser {
  id: string;
  name: string;
  isSystemUser: boolean;
}

export function ProjectAssigneeSelector({ 
  value, 
  onChange, 
  placeholder = "Add team members",
  label = "Assigned To",
  className,
  multiple = true
}: ProjectAssigneeSelectorProps) {
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [customNameInput, setCustomNameInput] = useState('');

  // Fetch system users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  // Initialize from existing value - handle both single names and comma-separated
  useEffect(() => {
    if (value && users.length > 0) {
      const names = value.split(',').map(name => name.trim()).filter(name => name.length > 0);
      const allUsers: SelectedUser[] = [];
      
      names.forEach(name => {
        const matchedUser = users.find(user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          return fullName === name || user.email === name;
        });
        
        if (matchedUser) {
          const fullName = `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim() || matchedUser.email;
          allUsers.push({ id: matchedUser.id, name: fullName, isSystemUser: true });
        } else {
          // Add as custom name
          allUsers.push({ id: `custom_${Date.now()}_${Math.random()}`, name, isSystemUser: false });
        }
      });
      
      setSelectedUsers(allUsers);
    }
  }, [users, value]);

  const addUserById = (userId: string) => {
    if (userId === 'none') {
      return; // Don't do anything for the placeholder option
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    
    // Check if already selected
    if (selectedUsers.some(u => u.id === user.id)) return;

    const updatedUsers = [...selectedUsers, { id: user.id, name: fullName, isSystemUser: true }];
    setSelectedUsers(updatedUsers);
    
    // Update parent
    updateParent(updatedUsers);
  };

  const addCustomName = () => {
    if (!customNameInput.trim()) return;
    
    // Check if already exists
    if (selectedUsers.some(u => u.name.toLowerCase() === customNameInput.trim().toLowerCase())) {
      setCustomNameInput('');
      return;
    }

    const customUser: SelectedUser = {
      id: `custom_${Date.now()}_${Math.random()}`,
      name: customNameInput.trim(),
      isSystemUser: false
    };

    const updatedUsers = [...selectedUsers, customUser];
    setSelectedUsers(updatedUsers);
    setCustomNameInput('');
    
    // Update parent
    updateParent(updatedUsers);
  };

  const updateParent = (users: SelectedUser[]) => {
    const names = users.map(u => u.name).join(', ');
    const systemUserIds = users.filter(u => u.isSystemUser).map(u => u.id);
    onChange(names, systemUserIds);
  };

  const removeUser = (userId: string) => {
    const updatedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(updatedUsers);
    updateParent(updatedUsers);
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      
      <div className="space-y-4">
        {/* System User Selection */}
        <div>
          <Label className="text-sm text-slate-600 mb-2 block">Add Team Members</Label>
          <Select value="none" onValueChange={addUserById}>
            <SelectTrigger>
              <SelectValue placeholder="+ Add team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a team member...</SelectItem>
              {users
                .filter(user => !selectedUsers.some(selected => selected.id === user.id && selected.isSystemUser))
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {user.role || 'User'}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Name Input */}
        <div>
          <Label className="text-sm text-slate-600 mb-2 block">Add Custom Names</Label>
          <div className="flex gap-2">
            <Input
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              placeholder="Enter custom name"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomName();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomName}
              disabled={!customNameInput.trim()}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* All Selected Users (System + Custom) */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Assigned:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge 
                  key={user.id} 
                  variant={user.isSystemUser ? "default" : "outline"} 
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <span>{user.name}</span>
                  {user.isSystemUser && (
                    <span className="text-xs opacity-75">(User)</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100"
                    onClick={() => removeUser(user.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}