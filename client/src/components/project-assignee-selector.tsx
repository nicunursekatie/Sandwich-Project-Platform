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
  placeholder = "Enter assignee names or select users",
  label = "Assigned To",
  className,
  multiple = true
}: ProjectAssigneeSelectorProps) {
  const [mode, setMode] = useState<'text' | 'user'>('text');
  const [textValue, setTextValue] = useState(value || '');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [pendingUserId, setPendingUserId] = useState<string>('');

  // Fetch system users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  // Initialize from existing value
  useEffect(() => {
    if (value && users.length > 0) {
      // Try to match the name to a user
      const matchedUser = users.find(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return fullName === value || user.email === value;
      });
      
      if (matchedUser) {
        const fullName = `${matchedUser.firstName || ''} ${matchedUser.lastName || ''}`.trim() || matchedUser.email;
        setSelectedUsers([{ id: matchedUser.id, name: fullName }]);
        setMode('user');
        setTextValue('');
      } else {
        // No user match, treat as custom text
        setTextValue(value);
        setMode('text');
        setSelectedUsers([]);
      }
    } else if (!value) {
      // Clear everything if no value
      setSelectedUsers([]);
      setTextValue('');
      setMode('user');
    }
  }, [users, value]);

  const handleTextChange = (newValue: string) => {
    setTextValue(newValue);
    onChange(newValue, []);
  };

  const addUser = () => {
    if (!pendingUserId) return;
    
    const user = users.find(u => u.id === pendingUserId);
    if (!user) return;

    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const newUser: SelectedUser = {
      id: user.id,
      name: fullName
    };

    // Check if already selected
    if (selectedUsers.some(u => u.id === user.id)) {
      setPendingUserId('');
      return;
    }

    const updatedUsers = [...selectedUsers, newUser];
    setSelectedUsers(updatedUsers);
    setPendingUserId('');
    
    // Update parent with names and IDs
    const names = updatedUsers.map(u => u.name).join(', ');
    const userIds = updatedUsers.filter(u => !u.id.startsWith('text_')).map(u => u.id);
    onChange(names, userIds);
  };

  const removeUser = (userId: string) => {
    const updatedUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(updatedUsers);
    
    const names = updatedUsers.map(u => u.name).join(', ');
    const userIds = updatedUsers.filter(u => !u.id.startsWith('text_')).map(u => u.id);
    onChange(names, userIds);
  };

  const toggleMode = () => {
    const newMode = mode === 'text' ? 'user' : 'text';
    setMode(newMode);
    
    if (newMode === 'text') {
      setSelectedUsers([]);
      setPendingUserId('');
      onChange(textValue, []);
    } else {
      setTextValue('');
      onChange('', []);
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>
      
      {/* Single dropdown with all users plus "Custom..." option */}
      <Select 
        value={selectedUsers.length > 0 ? selectedUsers[0].id : (textValue ? 'custom' : 'unassigned')} 
        onValueChange={(value) => {
          if (value === 'custom') {
            setMode('text');
            setSelectedUsers([]);
            onChange(textValue, []);
          } else if (value === 'unassigned') {
            // Clear selection
            setMode('user');
            setSelectedUsers([]);
            setTextValue('');
            onChange('', []);
          } else {
            // Select a user
            const user = users.find(u => u.id === value);
            if (user) {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
              const newUser = { id: user.id, name: fullName };
              setSelectedUsers([newUser]);
              setTextValue('');
              setMode('user');
              onChange(fullName, [user.id]);
            }
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select team member or enter custom name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom name...</SelectItem>
        </SelectContent>
      </Select>

      {/* Show text input when custom is selected */}
      {mode === 'text' && (
        <div className="mt-2">
          <Input
            value={textValue}
            onChange={(e) => {
              setTextValue(e.target.value);
              onChange(e.target.value, []);
            }}
            placeholder="Enter custom assignee name"
          />
        </div>
      )}
    </div>
  );
}