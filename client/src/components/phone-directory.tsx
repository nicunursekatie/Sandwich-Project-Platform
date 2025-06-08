import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertHostSchema, insertHostContactSchema, insertRecipientSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Search, Download, User, Users, Star, Building2, Plus, Edit, Trash2 } from "lucide-react";

interface Host {
  id: number;
  name: string;
  address: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
}

interface HostContact {
  id: number;
  hostId: number;
  name: string;
  role: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  notes: string | null;
}

interface HostWithContacts extends Host {
  contacts: HostContact[];
}

interface Recipient {
  id: number;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  preferences: string | null;
  status: 'active' | 'inactive';
}

export default function PhoneDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("hosts");
  const [isAddingHost, setIsAddingHost] = useState(false);
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const { toast } = useToast();

  // Fetch hosts (temporarily using existing endpoint until backend is updated)
  const { data: hosts = [], isLoading: hostsLoading } = useQuery<HostWithContacts[]>({
    queryKey: ["/api/hosts-with-contacts"],
    queryFn: async () => {
      // For now, fetch hosts and mock the contact structure
      const response = await fetch("/api/hosts");
      const hostData = await response.json();
      
      // Transform existing host data to new structure with mock contacts
      return hostData.map((host: any) => ({
        id: host.id,
        name: host.name,
        address: host.address || null,
        status: host.status || 'active',
        notes: host.notes,
        contacts: host.phone ? [{
          id: host.id * 1000,
          hostId: host.id,
          name: "Primary Contact",
          role: "primary",
          phone: host.phone,
          email: host.email,
          isPrimary: true,
          notes: null
        }] : []
      }));
    }
  });

  // Fetch recipients
  const { data: recipients = [], isLoading: recipientsLoading } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  // Mutations for CRUD operations
  const createHostMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertHostSchema>) => apiRequest(`/api/hosts`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hosts-with-contacts"] });
      setIsAddingHost(false);
      toast({ title: "Host added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add host", variant: "destructive" });
    },
  });

  const updateHostMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<z.infer<typeof insertHostSchema>> }) => 
      apiRequest(`/api/hosts/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hosts-with-contacts"] });
      setEditingHost(null);
      toast({ title: "Host updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update host", variant: "destructive" });
    },
  });

  const createRecipientMutation = useMutation({
    mutationFn: (data: z.infer<typeof insertRecipientSchema>) => apiRequest(`/api/recipients`, "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      setIsAddingRecipient(false);
      toast({ title: "Recipient added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add recipient", variant: "destructive" });
    },
  });

  const updateRecipientMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<z.infer<typeof insertRecipientSchema>> }) => 
      apiRequest(`/api/recipients/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      setEditingRecipient(null);
      toast({ title: "Recipient updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update recipient", variant: "destructive" });
    },
  });

  // Filter functions
  const filteredHosts = hosts.filter(host =>
    host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    host.contacts.some(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredRecipients = recipients.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipient.contactName && recipient.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    recipient.phone.includes(searchTerm) ||
    (recipient.email && recipient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    // Format phone number for display (e.g., (555) 123-4567)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const HostCard = ({ host }: { host: HostWithContacts }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-gray-900">{host.name}</h3>
              {host.status === 'inactive' && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            
            {host.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{host.address}</span>
              </div>
            )}
            
            {host.contacts.length === 0 ? (
              <div className="text-gray-500 text-sm italic">No contact information available</div>
            ) : (
              <div className="space-y-3">
                {host.contacts.map((contact) => (
                  <div key={contact.id} className="border-l-2 border-blue-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                        {contact.isPrimary && (
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2">
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors group"
                      >
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-700 text-lg">
                          {formatPhone(contact.phone)}
                        </span>
                      </a>
                      
                      {contact.email && (
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{contact.email}</span>
                        </a>
                      )}
                    </div>
                    
                    {contact.notes && (
                      <div className="text-xs text-gray-500">
                        <strong>Notes:</strong> {contact.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {host.notes && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                <strong>Location Notes:</strong> {host.notes}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingHost(host)}
              className="flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecipientCard = ({ recipient }: { recipient: Recipient }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-gray-900">{recipient.name}</h3>
              {recipient.status === 'inactive' && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            
            {recipient.contactName && (
              <div className="text-sm text-gray-600 mb-2">
                <strong>Contact:</strong> {recipient.contactName}
              </div>
            )}
            
            <div className="flex items-center gap-3 mb-3">
              <a 
                href={`tel:${recipient.phone}`} 
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors group"
              >
                <Phone className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-700 text-lg">
                  {formatPhone(recipient.phone)}
                </span>
              </a>
              
              {recipient.email && (
                <a 
                  href={`mailto:${recipient.email}`} 
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{recipient.email}</span>
                </a>
              )}
            </div>
            
            {recipient.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{recipient.address}</span>
              </div>
            )}
            
            {recipient.preferences && (
              <div className="text-sm text-gray-600">
                <strong>Preferences:</strong> {recipient.preferences}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingRecipient(recipient)}
              className="flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (hostsLoading || recipientsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Phone Directory</h2>
          <p className="text-slate-600">Contact information for hosts and recipients</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "hosts" ? (
            <Button 
              onClick={() => setIsAddingHost(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Host
            </Button>
          ) : (
            <Button 
              onClick={() => setIsAddingRecipient(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Recipient
            </Button>
          )}
        </div>
      </div>

      {/* Search and Export Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const hostExportData = hosts.flatMap(host => 
                    host.contacts.map(contact => ({
                      location: host.name,
                      contactName: contact.name,
                      role: contact.role,
                      phone: contact.phone,
                      email: contact.email || '',
                      isPrimary: contact.isPrimary ? 'Yes' : 'No',
                      address: host.address || '',
                      notes: contact.notes || ''
                    }))
                  );
                  exportToCSV(hostExportData, 'hosts-directory.csv');
                }}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Hosts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(recipients, 'recipients-directory.csv')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Recipients
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directory Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hosts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Hosts ({filteredHosts.length})
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Recipients ({filteredRecipients.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hosts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Host Directory
              </CardTitle>
              <CardDescription>
                Contact information for sandwich collection hosts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredHosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No hosts found matching your search.' : 'No hosts found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHosts.map((host) => (
                    <HostCard key={host.id} host={host} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Recipient Directory
              </CardTitle>
              <CardDescription>
                Contact information for sandwich delivery recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No recipients found matching your search.' : 'No recipients found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecipients.map((recipient) => (
                    <RecipientCard key={recipient.id} recipient={recipient} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hosts</p>
                <p className="text-2xl font-bold">{hosts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {hosts.filter(h => h.contacts.length > 0).length} with contacts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">{recipients.length}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {recipients.filter(r => r.status === 'active').length} active, {recipients.filter(r => r.phone).length} with phone numbers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Host Dialog */}
      <Dialog open={isAddingHost} onOpenChange={setIsAddingHost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Host Location</DialogTitle>
            <DialogDescription>
              Add a new host location for sandwich collection
            </DialogDescription>
          </DialogHeader>
          <HostForm
            onSubmit={(data) => createHostMutation.mutate(data)}
            onCancel={() => setIsAddingHost(false)}
            isLoading={createHostMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Host Dialog */}
      <Dialog open={!!editingHost} onOpenChange={(open) => !open && setEditingHost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Host Location</DialogTitle>
            <DialogDescription>
              Update host location information
            </DialogDescription>
          </DialogHeader>
          {editingHost && (
            <HostForm
              initialData={editingHost}
              onSubmit={(data) => updateHostMutation.mutate({ id: editingHost.id, data })}
              onCancel={() => setEditingHost(null)}
              isLoading={updateHostMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Recipient Dialog */}
      <Dialog open={isAddingRecipient} onOpenChange={setIsAddingRecipient}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Recipient</DialogTitle>
            <DialogDescription>
              Add a new recipient for sandwich delivery
            </DialogDescription>
          </DialogHeader>
          <RecipientForm
            onSubmit={(data) => createRecipientMutation.mutate(data)}
            onCancel={() => setIsAddingRecipient(false)}
            isLoading={createRecipientMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Recipient Dialog */}
      <Dialog open={!!editingRecipient} onOpenChange={(open) => !open && setEditingRecipient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Recipient</DialogTitle>
            <DialogDescription>
              Update recipient information
            </DialogDescription>
          </DialogHeader>
          {editingRecipient && (
            <RecipientForm
              initialData={editingRecipient}
              onSubmit={(data) => updateRecipientMutation.mutate({ id: editingRecipient.id, data })}
              onCancel={() => setEditingRecipient(null)}
              isLoading={updateRecipientMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Host Form Component
const HostForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  initialData?: Host;
  onSubmit: (data: z.infer<typeof insertHostSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const form = useForm<z.infer<typeof insertHostSchema>>({
    resolver: zodResolver(insertHostSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      status: initialData?.status || "active",
      notes: initialData?.notes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter host location name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about this location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Host" : "Add Host"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Recipient Form Component
const RecipientForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: {
  initialData?: Recipient;
  onSubmit: (data: z.infer<typeof insertRecipientSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}) => {
  const form = useForm<z.infer<typeof insertRecipientSchema>>({
    resolver: zodResolver(insertRecipientSchema),
    defaultValues: {
      name: initialData?.name || "",
      contactName: initialData?.contactName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      status: initialData?.status || "active",
      preferences: initialData?.preferences || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person</FormLabel>
              <FormControl>
                <Input placeholder="Enter contact person name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contact@organization.org" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Preferences</FormLabel>
              <FormControl>
                <Textarea placeholder="Special delivery instructions or preferences" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Recipient" : "Add Recipient"}
          </Button>
        </div>
      </form>
    </Form>
  );
};