import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, Search, Download, User, Users, Star, Building2 } from "lucide-react";

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
    </div>
  );
}