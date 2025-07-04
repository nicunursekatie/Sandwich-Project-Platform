import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface TaskAssigneeSelectorProps {
  value?: {
    assigneeId?: string;
    assigneeName?: string;
  };
  onChange: (value: { assigneeId?: string; assigneeName?: string }) => void;
  placeholder?: string;
}

export function TaskAssigneeSelector({ value, onChange, placeholder = "Assign to..." }: TaskAssigneeSelectorProps) {
  const [inputMode, setInputMode] = useState<'user' | 'text'>('user');
  const [textInput, setTextInput] = useState('');

  // Fetch users from the system
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Initialize text input with existing assigneeName
  useEffect(() => {
    if (value?.assigneeName && !value?.assigneeId) {
      setTextInput(value.assigneeName);
      setInputMode('text');
    }
  }, [value]);

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      onChange({
        assigneeId: userId,
        assigneeName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim() || selectedUser.email
      });
    }
  };

  const handleTextChange = (text: string) => {
    setTextInput(text);
    onChange({
      assigneeId: undefined,
      assigneeName: text || undefined
    });
  };

  const handleClear = () => {
    setTextInput('');
    onChange({
      assigneeId: undefined,
      assigneeName: undefined
    });
  };

  const getDisplayValue = () => {
    if (value?.assigneeId) {
      const user = users.find(u => u.id === value.assigneeId);
      return user ? `${user.firstName} ${user.lastName}`.trim() || user.email : value.assigneeName;
    }
    return value?.assigneeName || '';
  };

  const displayValue = getDisplayValue();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={inputMode === 'user' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('user')}
          className="text-xs"
        >
          Select User
        </Button>
        <Button
          type="button"
          variant={inputMode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInputMode('text')}
          className="text-xs"
        >
          Free Text
        </Button>
      </div>

      {inputMode === 'user' ? (
        <div className="space-y-2">
          <Select
            value={value?.assigneeId || ''}
            onValueChange={handleUserSelect}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading users..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter(user => user.isActive)
                .map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {`${user.firstName} ${user.lastName}`.trim() || user.email}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            value={textInput}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter assignee name..."
          />
        </div>
      )}

      {displayValue && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            {displayValue}
            <button
              type="button"
              onClick={handleClear}
              className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          {value?.assigneeId && (
            <Badge variant="secondary" className="text-xs">
              System User
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}