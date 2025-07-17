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
}

interface SelectedUser {
  id: string;
  name: string;
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
  const [textInput, setTextInput] = useState('');
  const [mode, setMode] = useState<'user' | 'text'>('user');

  // Fetch system users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  // Initialize from existing value - handle both single names and comma-separated
  useEffect(() => {
    if (value && users.length > 0) {
      const names = value.split(',').map(name => name.trim()).filter(name => name.length > 0);
      const matchedUsers: SelectedUser[] = [];
      
      names.forEach(name => {
        const matchedUser = users.find(user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          return fullName === name || user.email === name;
        });
        
        if (matchedUser) {
          const fullName = `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim() || matchedUser.email;
          matchedUsers.push({ id: matchedUser.id, name: fullName });
        }
      });
      
      if (matchedUsers.length > 0) {
        setSelectedUsers(matchedUsers);
        setMode('user');
      } else {
        // No user matches, treat as custom text
        setTextInput(value);
        setMode('text');
      }
    }
  }, [users, value]);

  const addUserById = (userId: string) => {
    if (userId === 'custom') {
      setMode('text');
      return;
    }
    
    if (userId === 'none') {
      // Clear all selections
      setSelectedUsers([]);
      setTextInput('');
      onChange('', []);
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    
    // Check if already selected
    if (selectedUsers.some(u => u.id === user.id)) return;

    const updatedUsers = [...selectedUsers, { id: user.id, name: fullName }];
    setSelectedUsers(updatedUsers);
    
    // Update parent
    const names = updatedUsers.map(u => u.name).join(', ');
    const userIds = updatedUsers.map(u => u.id);
    onChange(names, userIds);
  };

  const removeUser = (userId: string) => {
    const updatedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(updatedUsers);
    
    const names = updatedUsers.map(u => u.name).join(', ');
    const userIds = updatedUsers.map(u => u.id);
    onChange(names, userIds);
  };

  const handleTextChange = (newValue: string) => {
    setTextInput(newValue);
    onChange(newValue, []);
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <Button
          type="button"
          variant={mode === 'user' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('user')}
          className="text-xs"
        >
          <Users className="w-3 h-3 mr-1" />
          Team Members
        </Button>
        <Button
          type="button"
          variant={mode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('text')}
          className="text-xs"
        >
          Custom Names
        </Button>
      </div>

      {mode === 'user' ? (
        <div className="space-y-3">
          {/* User Selection Dropdown */}
          <Select value="none" onValueChange={addUserById}>
            <SelectTrigger>
              <SelectValue placeholder="+ Add team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select a team member...</SelectItem>
              {users
                .filter(user => !selectedUsers.some(selected => selected.id === user.id))
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
              <SelectItem value="custom">Custom name...</SelectItem>
            </SelectContent>
          </Select>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-slate-600">Assigned Members:</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="default" className="flex items-center gap-1 px-3 py-1">
                    <span>{user.name}</span>
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
      ) : (
        <div className="space-y-2">
          <Input
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter names separated by commas"
          />
          <p className="text-xs text-slate-500">
            Enter multiple names separated by commas (e.g., "John Smith, Jane Doe, Bob Wilson")
          </p>
        </div>
      )}
    </div>
  );
}