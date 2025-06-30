import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";

interface ProjectAssigneeSelectorProps {
  value: string;
  onChange: (value: string, userId?: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export function ProjectAssigneeSelector({ 
  value, 
  onChange, 
  placeholder = "Enter assignee name or select user",
  label = "Assigned To",
  className 
}: ProjectAssigneeSelectorProps) {
  const [mode, setMode] = useState<'text' | 'user'>('text');
  const [textValue, setTextValue] = useState(value || '');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch system users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    retry: false,
  });

  // Determine if current value matches a system user
  useEffect(() => {
    if (users.length > 0 && value) {
      const matchedUser = users.find(user => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        return fullName === value || user.email === value;
      });
      
      if (matchedUser) {
        setMode('user');
        setSelectedUserId(matchedUser.id);
      } else {
        setMode('text');
        setTextValue(value);
      }
    }
  }, [users, value]);

  const handleTextChange = (newValue: string) => {
    setTextValue(newValue);
    onChange(newValue);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
      onChange(displayName, userId);
    }
  };

  const formatUserName = (user: User) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email;
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('text')}
            className="h-7 text-xs"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Free Text
          </Button>
          <Button
            type="button"
            variant={mode === 'user' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('user')}
            className="h-7 text-xs"
            disabled={users.length === 0}
          >
            <Users className="w-3 h-3 mr-1" />
            Select User
          </Button>
        </div>
      </div>

      {mode === 'text' ? (
        <Input
          type="text"
          placeholder={placeholder}
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          className="mt-1"
        />
      ) : (
        <Select value={selectedUserId} onValueChange={handleUserSelect}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a user from the system" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{formatUserName(user)}</span>
                  {user.firstName && (
                    <span className="text-xs text-slate-500">{user.email}</span>
                  )}
                </div>
              </SelectItem>
            ))}
            {users.length === 0 && (
              <SelectItem value="" disabled>
                No system users available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}

      {mode === 'user' && users.length === 0 && (
        <p className="text-xs text-slate-500 mt-1">
          No users have set up accounts yet. Use "Free Text" mode to enter names manually.
        </p>
      )}
    </div>
  );
}