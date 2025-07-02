import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Plus, Users, Send, Crown, Trash2, UserPlus, Edit, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { MessageGroup, InsertMessageGroup, GroupMembership, Message, User } from "@shared/schema";

interface GroupWithMembers extends MessageGroup {
  memberCount: number;
  userRole: string;
  members?: Array<{
    userId: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface GroupMessagesProps {
  currentUser: any;
}

export function GroupMessaging({ currentUser }: GroupMessagesProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    memberIds: [] as string[]
  });
  const [addMemberForm, setAddMemberForm] = useState({
    memberIds: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's message groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/message-groups"],
  });

  // Fetch all users for member selection
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Fetch group members when a group is selected
  const { data: groupMembers = [] } = useQuery<Array<{
    userId: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
  }>>({
    queryKey: ["/api/message-groups", selectedGroup?.id, "members"],
    enabled: !!selectedGroup,
  });

  // Fetch messages for selected group with proper API call
  const { data: groupMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages", "group", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup) return [];
      const response = await fetch(`/api/messages?groupId=${selectedGroup.id}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Not authorized to view messages in this group");
        }
        throw new Error("Failed to fetch group messages");
      }
      return response.json();
    },
    enabled: !!selectedGroup,
  });

  // Create new group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (data: InsertMessageGroup & { memberIds: string[] }) => {
      const response = await fetch("/api/message-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create group");
      return response.json();
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-groups"] });
      setGroupForm({ name: "", description: "", memberIds: [] });
      setShowCreateDialog(false);
      setSelectedGroup(newGroup);
      toast({ title: "Group created successfully!" });
      
      // Send congratulations notification through the notification system
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id,
          type: "success",
          title: "Group Created Successfully!",
          message: `🎉 You've successfully created the "${newGroup.name}" group. Start collaborating with your team members!`,
          data: { groupId: newGroup.id, action: "group_created" }
        }),
      }).catch(err => console.log("Notification failed:", err));
      
      // Also send a welcome message to the group
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `Welcome to ${newGroup.name}! This group was created by ${currentUser?.firstName || currentUser?.email}. Let's start collaborating! 🚀`,
          committee: `group_${newGroup.id}`,
          sender: "System"
        }),
      }).catch(err => console.log("Welcome message failed:", err));
    },
  });

  // Add members to group mutation
  const addMembersMutation = useMutation({
    mutationFn: async (data: { groupId: number; memberIds: string[] }) => {
      const response = await fetch(`/api/message-groups/${data.groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberIds: data.memberIds }),
      });
      if (!response.ok) throw new Error("Failed to add members");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/message-groups", selectedGroup?.id, "members"] });
      setAddMemberForm({ memberIds: [] });
      setShowAddMemberDialog(false);
      toast({ title: "Members added successfully!" });
    },
  });

  // Send message mutation  
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; committee: string }) => {
      const messageData = {
        ...data,
        sender: currentUser?.firstName && currentUser?.lastName 
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser?.email || "Anonymous",
        userId: currentUser?.id
      };
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "group", selectedGroup?.id] });
      setNewMessage("");
    },
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: number; content: string }) => {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to edit message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "group", selectedGroup?.id] });
      setEditingMessage(null);
      setEditedContent("");
      toast({ title: "Message updated successfully!" });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", "group", selectedGroup?.id] });
      toast({ title: "Message deleted successfully!" });
    },
  });

  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) {
      toast({ title: "Group name is required", variant: "destructive" });
      return;
    }
    createGroupMutation.mutate({
      ...groupForm,
      createdBy: currentUser?.id || "",
    });
  };

  const handleAddMembers = () => {
    if (!selectedGroup || addMemberForm.memberIds.length === 0) {
      toast({ title: "Please select members to add", variant: "destructive" });
      return;
    }
    addMembersMutation.mutate({
      groupId: selectedGroup.id,
      memberIds: addMemberForm.memberIds,
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      committee: `group_${selectedGroup.id}`,
    });
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditedContent(message.content);
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editedContent.trim()) return;
    
    editMessageMutation.mutate({
      messageId: editingMessage.id,
      content: editedContent,
    });
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditedContent("");
  };

  const handleDeleteMessage = (messageId: number) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const canEditMessage = (message: Message) => {
    return message.userId === currentUser?.id;
  };

  const formatDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] flex">
      {/* Groups sidebar */}
      <div className="w-1/3 border-r bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Message Groups</h3>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Message Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Group Name</label>
                    <Input
                      value={groupForm.name}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                      value={groupForm.description}
                      onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter group description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Add Members</label>
                    <Select onValueChange={(userId) => {
                      if (!groupForm.memberIds.includes(userId)) {
                        setGroupForm(prev => ({ 
                          ...prev, 
                          memberIds: [...prev.memberIds, userId] 
                        }));
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select users to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers
                          .filter(user => user.id !== currentUser?.id && !groupForm.memberIds.includes(user.id))
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {formatDisplayName(user)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {groupForm.memberIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {groupForm.memberIds.map((userId) => {
                          const user = allUsers.find(u => u.id === userId);
                          return (
                            <Badge key={userId} variant="secondary" className="text-xs">
                              {user ? formatDisplayName(user) : userId}
                              <button
                                onClick={() => setGroupForm(prev => ({
                                  ...prev,
                                  memberIds: prev.memberIds.filter(id => id !== userId)
                                }))}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateGroup}
                      disabled={createGroupMutation.isPending}
                    >
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No groups yet</p>
                <p className="text-xs">Create your first group to get started</p>
              </div>
            ) : (
              groups.map((group) => (
                <Card
                  key={group.id}
                  className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    selectedGroup?.id === group.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{group.name}</h4>
                          {group.userRole === 'admin' && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        {group.description && (
                          <p className="text-xs text-gray-500 truncate">{group.description}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{group.memberCount} members</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Group header */}
            <div className="p-4 border-b bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {selectedGroup.name}
                    {selectedGroup.userRole === 'admin' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                  </h3>
                  {selectedGroup.description && (
                    <p className="text-sm text-gray-500">{selectedGroup.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {selectedGroup.memberCount} members
                  </Badge>
                  {selectedGroup.userRole === 'admin' && (
                    <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Members to {selectedGroup.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Select Members to Add</label>
                            <Select onValueChange={(userId) => {
                              const existingMemberIds = groupMembers.map(m => m.userId);
                              if (!addMemberForm.memberIds.includes(userId) && !existingMemberIds.includes(userId)) {
                                setAddMemberForm(prev => ({ 
                                  memberIds: [...prev.memberIds, userId] 
                                }));
                              }
                            }}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select users to add" />
                              </SelectTrigger>
                              <SelectContent>
                                {allUsers
                                  .filter(user => {
                                    const existingMemberIds = groupMembers.map(m => m.userId);
                                    return user.id !== currentUser?.id && 
                                           !addMemberForm.memberIds.includes(user.id) &&
                                           !existingMemberIds.includes(user.id);
                                  })
                                  .map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      {formatDisplayName(user)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {addMemberForm.memberIds.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {addMemberForm.memberIds.map((userId) => {
                                  const user = allUsers.find(u => u.id === userId);
                                  return (
                                    <Badge key={userId} variant="secondary" className="text-xs">
                                      {user ? formatDisplayName(user) : userId}
                                      <button
                                        onClick={() => setAddMemberForm(prev => ({
                                          memberIds: prev.memberIds.filter(id => id !== userId)
                                        }))}
                                        className="ml-1 text-red-500 hover:text-red-700"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleAddMembers}
                              disabled={addMembersMutation.isPending || addMemberForm.memberIds.length === 0}
                            >
                              Add Members
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {groupMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  groupMessages.map((message) => (
                    <div key={message.id} className="group relative">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.sender ? message.sender[0]?.toUpperCase() : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.sender || "Anonymous"}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {canEditMessage(message) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditMessage(message)}>
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                          {editingMessage?.id === message.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={handleSaveEdit}
                                  disabled={editMessageMutation.isPending}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                              {message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t bg-white dark:bg-gray-800">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">Select a group to start messaging</h3>
              <p className="text-sm">Choose a group from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}