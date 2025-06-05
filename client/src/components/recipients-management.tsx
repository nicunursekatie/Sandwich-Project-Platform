import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Users, Plus, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Recipient {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  preferences: string;
  status: "active" | "inactive";
}

export default function RecipientsManagement() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    preferences: "",
    status: "active" as const
  });

  // Mock data for recipients
  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ['/api/recipients'],
    queryFn: () => Promise.resolve([
      {
        id: 1,
        name: "Sarah Chen",
        phone: "(555) 123-4567",
        email: "sarah.chen@email.com",
        address: "123 Main St, City, State 12345",
        preferences: "No mayo, extra lettuce",
        status: "active" as const
      },
      {
        id: 2,
        name: "Mike Rodriguez",
        phone: "(555) 234-5678",
        email: "mike.rodriguez@email.com",
        address: "456 Oak Ave, City, State 12345",
        preferences: "Vegetarian options only",
        status: "active" as const
      },
      {
        id: 3,
        name: "Jessica Park",
        phone: "(555) 345-6789",
        email: "jessica.park@email.com",
        address: "789 Pine St, City, State 12345",
        preferences: "Gluten-free bread",
        status: "inactive" as const
      }
    ])
  });

  const createRecipientMutation = useMutation({
    mutationFn: async (data: typeof newRecipient) => {
      return apiRequest('/api/recipients', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      setNewRecipient({ name: "", phone: "", email: "", address: "", preferences: "", status: "active" });
      setIsAddModalOpen(false);
      toast({
        title: "Recipient added",
        description: "New recipient has been added successfully.",
      });
    }
  });

  const updateRecipientMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Recipient> & { id: number }) => {
      return apiRequest(`/api/recipients/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      setEditingRecipient(null);
      toast({
        title: "Recipient updated",
        description: "Recipient information has been updated.",
      });
    }
  });

  const deleteRecipientMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/recipients/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      toast({
        title: "Recipient deleted",
        description: "Recipient has been removed from the system.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.name || !newRecipient.phone) {
      toast({
        title: "Missing information",
        description: "Please fill in the recipient name and phone number.",
        variant: "destructive"
      });
      return;
    }
    createRecipientMutation.mutate(newRecipient);
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
  };

  const handleUpdate = () => {
    if (editingRecipient) {
      updateRecipientMutation.mutate(editingRecipient);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this recipient?")) {
      deleteRecipientMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading recipients...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Users className="text-blue-500 mr-3 w-6 h-6" />
            Recipients Management
          </h1>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-recipient-description">
              <DialogHeader>
                <DialogTitle>Add New Recipient</DialogTitle>
              </DialogHeader>
              <p id="add-recipient-description" className="text-sm text-slate-600 mb-4">
                Add a new recipient to the system for sandwich deliveries.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newRecipient.name}
                    onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                    placeholder="Enter recipient name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={newRecipient.phone}
                    onChange={(e) => setNewRecipient({ ...newRecipient, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newRecipient.address}
                    onChange={(e) => setNewRecipient({ ...newRecipient, address: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div>
                  <Label htmlFor="preferences">Preferences</Label>
                  <Input
                    id="preferences"
                    value={newRecipient.preferences}
                    onChange={(e) => setNewRecipient({ ...newRecipient, preferences: e.target.value })}
                    placeholder="Dietary restrictions or preferences"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRecipientMutation.isPending}>
                    {createRecipientMutation.isPending ? "Adding..." : "Add Recipient"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recipients List */}
      <div className="grid gap-4">
        {recipients.map((recipient) => (
          <Card key={recipient.id} className="border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{recipient.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={recipient.status === "active" ? "default" : "secondary"}>
                      {recipient.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(recipient)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(recipient.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{recipient.phone}</span>
              </div>
              {recipient.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{recipient.email}</span>
                </div>
              )}
              {recipient.address && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{recipient.address}</span>
                </div>
              )}
              {recipient.preferences && (
                <div className="text-sm text-slate-600">
                  <strong>Preferences:</strong> {recipient.preferences}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {recipients.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No recipients found. Add a new recipient to get started.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecipient && (
        <Dialog open={!!editingRecipient} onOpenChange={() => setEditingRecipient(null)}>
          <DialogContent aria-describedby="edit-recipient-description">
            <DialogHeader>
              <DialogTitle>Edit Recipient</DialogTitle>
            </DialogHeader>
            <p id="edit-recipient-description" className="text-sm text-slate-600 mb-4">
              Update recipient information.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingRecipient.name}
                  onChange={(e) => setEditingRecipient({ ...editingRecipient, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editingRecipient.phone}
                  onChange={(e) => setEditingRecipient({ ...editingRecipient, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingRecipient.email}
                  onChange={(e) => setEditingRecipient({ ...editingRecipient, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingRecipient.address}
                  onChange={(e) => setEditingRecipient({ ...editingRecipient, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-preferences">Preferences</Label>
                <Input
                  id="edit-preferences"
                  value={editingRecipient.preferences}
                  onChange={(e) => setEditingRecipient({ ...editingRecipient, preferences: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingRecipient(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateRecipientMutation.isPending}>
                  {updateRecipientMutation.isPending ? "Updating..." : "Update Recipient"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}