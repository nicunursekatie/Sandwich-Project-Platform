import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { Phone, User, Users, Search } from "lucide-react";

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

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  zone: string;
  hostId?: number;
  isActive: boolean;
  notes: string;
  vanApproved: boolean;
  homeAddress?: string;
  availabilityNotes?: string;
}

interface GeneralContact {
  id: number;
  name: string;
  organization?: string;
  role?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function PhoneDirectoryFixed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("contacts");
  const { user } = useAuth();

  // Permission checks
  const canViewHosts = hasPermission(user, PERMISSIONS.ACCESS_HOSTS);
  const canViewRecipients = hasPermission(user, PERMISSIONS.ACCESS_RECIPIENTS);
  const canViewDrivers = hasPermission(user, PERMISSIONS.ACCESS_DRIVERS);

  // Data queries
  const { data: hosts = [] } = useQuery<HostWithContacts[]>({
    queryKey: ["/api/hosts-with-contacts"],
  });

  const { data: recipients = [] } = useQuery<Recipient[]>({
    queryKey: ["/api/recipients"],
  });

  const { data: contacts = [] } = useQuery<GeneralContact[]>({
    queryKey: ["/api/contacts"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Available tabs based on permissions
  const availableTabs = [
    { id: 'contacts', label: 'Contacts', icon: Phone, enabled: true },
    { id: 'hosts', label: 'Hosts', icon: Users, enabled: canViewHosts },
    { id: 'recipients', label: 'Recipients', icon: User, enabled: canViewRecipients },
    { id: 'drivers', label: 'Drivers', icon: User, enabled: canViewDrivers }
  ].filter(tab => tab.enabled);

  // Auto-select first available tab if current tab isn't available
  React.useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'contacts');
    }
  }, [availableTabs, activeTab]);

  // Filter data based on search
  const filteredHosts = hosts.filter((host) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return host.name.toLowerCase().includes(searchLower) ||
           (host.address && host.address.toLowerCase().includes(searchLower));
  });

  const filteredRecipients = recipients.filter((recipient) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return recipient.name.toLowerCase().includes(searchLower) ||
           recipient.phone.includes(searchTerm);
  });

  const filteredContacts = contacts.filter((contact) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return contact.name.toLowerCase().includes(searchLower) ||
           contact.phone.includes(searchTerm);
  });

  const filteredDrivers = drivers.filter((driver) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return driver.name.toLowerCase().includes(searchLower) ||
           driver.phone.includes(searchTerm) ||
           driver.zone.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phone Directory</h1>
          <p className="text-gray-600 mt-1">
            Contact information for team members and organizations
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 text-base"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory Tabs - Permission-based visibility */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${
          availableTabs.length === 1 ? 'grid-cols-1' :
          availableTabs.length === 2 ? 'grid-cols-2' :
          availableTabs.length === 3 ? 'grid-cols-3' :
          'grid-cols-4'
        }`}>
          {availableTabs.map(tab => {
            const Icon = tab.icon;
            let count = 0;
            
            if (tab.id === 'contacts') count = filteredContacts.length;
            else if (tab.id === 'hosts') count = filteredHosts.length;
            else if (tab.id === 'recipients') count = filteredRecipients.length;
            else if (tab.id === 'drivers') count = filteredDrivers.length;
            
            return (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                General Contacts
              </CardTitle>
              <CardDescription>
                Contact information for general contacts and volunteers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No contacts found matching your search.' : 'No contacts found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                      {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewHosts && <TabsContent value="hosts" className="space-y-4">
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
                    <div key={host.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900">{host.name}</h3>
                      {host.address && <p className="text-sm text-gray-600 mb-2">{host.address}</p>}
                      {host.contacts && host.contacts.length > 0 && (
                        <div className="space-y-1">
                          {host.contacts.map((contact, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-gray-600">{contact.phone}</div>
                              {contact.email && <div className="text-gray-600">{contact.email}</div>}
                              {contact.role && <div className="text-gray-500 italic">{contact.role}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                      {(!host.contacts || host.contacts.length === 0) && (
                        <p className="text-sm text-gray-500 italic">No contact information available</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        {canViewRecipients && <TabsContent value="recipients" className="space-y-4">
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
                    <div key={recipient.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900">{recipient.name}</h3>
                      <p className="text-sm text-gray-600">{recipient.phone}</p>
                      {recipient.email && <p className="text-sm text-gray-600">{recipient.email}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        {canViewDrivers && <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Driver Directory
              </CardTitle>
              <CardDescription>
                Contact information for delivery drivers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No drivers found matching your search.' : 'No drivers found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrivers.map((driver) => (
                    <div key={driver.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{driver.name}</h3>
                        {driver.vanApproved && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">Van Driver</span>}
                      </div>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                      <p className="text-sm text-gray-600">Zone: {driver.zone}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

      </Tabs>
    </div>
  );
}

export default PhoneDirectoryFixed;