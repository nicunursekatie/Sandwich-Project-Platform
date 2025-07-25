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
  const { user } = useAuth();

  // Permission checks
  const canViewHosts = hasPermission(user, PERMISSIONS.ACCESS_HOSTS);
  const canViewRecipients = hasPermission(user, PERMISSIONS.ACCESS_RECIPIENTS);
  const canViewDrivers = hasPermission(user, PERMISSIONS.ACCESS_DRIVERS);

  // Smart default tab selection: prefer hosts, then other tabs (exclude contacts)
  const getDefaultTab = React.useCallback(() => {
    if (canViewHosts) return "hosts";
    if (canViewRecipients) return "recipients";  
    if (canViewDrivers) return "drivers";
    return "contacts"; // fallback if no other permissions
  }, [canViewHosts, canViewRecipients, canViewDrivers]);

  const [activeTab, setActiveTab] = useState(() => getDefaultTab());

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

  // Auto-select appropriate tab based on permissions
  React.useEffect(() => {
    const defaultTab = getDefaultTab();
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [availableTabs, activeTab, getDefaultTab]);

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
    <div className="space-y-8 p-6 font-['Roboto',sans-serif]">
      {/* Header */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-4xl font-bold" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>Phone Directory</h1>
          <p className="text-lg mt-2" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
            Contact information for team members and organizations
          </p>
        </div>

        {/* Search */}
        <Card className="border-2" style={{ borderColor: '#e6f3f7' }}>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#646464' }} />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base border-2 focus:ring-2"
                style={{ 
                  borderColor: '#236383', 
                  fontFamily: 'Roboto, sans-serif'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Directory Tabs - Permission-based visibility */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full h-14 p-1 rounded-lg ${
          availableTabs.length === 1 ? 'grid-cols-1' :
          availableTabs.length === 2 ? 'grid-cols-2' :
          availableTabs.length === 3 ? 'grid-cols-3' :
          'grid-cols-4'
        }`} style={{ backgroundColor: '#e6f3f7' }}>
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
                className="flex items-center gap-2 h-12 text-base font-medium rounded-md transition-all duration-200 data-[state=active]:shadow-sm"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  color: '#646464'
                }}
                data-active-style={{ 
                  backgroundColor: '#236383', 
                  color: 'white' 
                }}
              >
                <Icon className="w-5 h-5" />
                {tab.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm" style={{ borderColor: '#e6f3f7' }}>
            <CardHeader className="pb-4" style={{ backgroundColor: '#e6f3f7' }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>
                <Phone className="w-6 h-6" style={{ color: '#236383' }} />
                General Contacts
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                Contact information for general contacts and volunteers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                  {searchTerm ? 'No contacts found matching your search.' : 'No contacts found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <div key={contact.id} className="p-5 border-2 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ borderColor: '#e6f3f7' }}>
                      <h3 className="font-bold text-lg mb-2" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>{contact.name}</h3>
                      <p className="text-base mb-1" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>{contact.phone}</p>
                      {contact.email && <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>{contact.email}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canViewHosts && <TabsContent value="hosts" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm" style={{ borderColor: '#e6f3f7' }}>
            <CardHeader className="pb-4" style={{ backgroundColor: '#e6f3f7' }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>
                <Users className="w-6 h-6" style={{ color: '#236383' }} />
                Host Directory
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                Contact information for sandwich collection hosts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredHosts.length === 0 ? (
                <div className="text-center py-12 text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                  {searchTerm ? 'No hosts found matching your search.' : 'No hosts found.'}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredHosts.map((host) => (
                    <div key={host.id} className="p-5 border-2 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ borderColor: '#e6f3f7' }}>
                      <h3 className="font-bold text-lg mb-3" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>{host.name}</h3>
                      {host.address && (
                        <p className="text-base mb-4" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                          <span className="font-medium">Address:</span> {host.address}
                        </p>
                      )}
                      {host.contacts && host.contacts.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-base" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>Contacts:</h4>
                          {host.contacts.map((contact, idx) => (
                            <div key={idx} className="ml-4 p-3 rounded-md" style={{ backgroundColor: '#f8fbfc' }}>
                              <div className="font-semibold text-base mb-1" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>{contact.name}</div>
                              <div className="space-y-1">
                                <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                                  <span className="font-medium">Phone:</span> {contact.phone}
                                </p>
                                {contact.email && (
                                  <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                                    <span className="font-medium">Email:</span> {contact.email}
                                  </p>
                                )}
                                {contact.role && (
                                  <p className="text-base italic" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                                    <span className="font-medium">Role:</span> {contact.role}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {(!host.contacts || host.contacts.length === 0) && (
                        <p className="text-base italic" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>No contact information available</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        {canViewRecipients && <TabsContent value="recipients" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm" style={{ borderColor: '#e6f3f7' }}>
            <CardHeader className="pb-4" style={{ backgroundColor: '#e6f3f7' }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>
                <User className="w-6 h-6" style={{ color: '#236383' }} />
                Recipient Directory
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                Contact information for sandwich delivery recipients
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredRecipients.length === 0 ? (
                <div className="text-center py-12 text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                  {searchTerm ? 'No recipients found matching your search.' : 'No recipients found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecipients.map((recipient) => (
                    <div key={recipient.id} className="p-5 border-2 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ borderColor: '#e6f3f7' }}>
                      <h3 className="font-bold text-lg mb-2" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>{recipient.name}</h3>
                      <div className="space-y-1">
                        <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                          <span className="font-medium">Phone:</span> {recipient.phone}
                        </p>
                        {recipient.email && (
                          <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                            <span className="font-medium">Email:</span> {recipient.email}
                          </p>
                        )}
                        {recipient.address && (
                          <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                            <span className="font-medium">Address:</span> {recipient.address}
                          </p>
                        )}
                        {recipient.contactName && (
                          <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                            <span className="font-medium">Contact:</span> {recipient.contactName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>}

        {canViewDrivers && <TabsContent value="drivers" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm" style={{ borderColor: '#e6f3f7' }}>
            <CardHeader className="pb-4" style={{ backgroundColor: '#e6f3f7' }}>
              <CardTitle className="flex items-center gap-3 text-xl font-bold" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>
                <User className="w-6 h-6" style={{ color: '#236383' }} />
                Driver Directory
              </CardTitle>
              <CardDescription className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                Contact information for delivery drivers
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-12 text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                  {searchTerm ? 'No drivers found matching your search.' : 'No drivers found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrivers.map((driver) => (
                    <div key={driver.id} className="p-5 border-2 rounded-lg hover:shadow-md transition-shadow duration-200" style={{ borderColor: '#e6f3f7' }}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg" style={{ color: '#236383', fontFamily: 'Roboto, sans-serif' }}>{driver.name}</h3>
                        <div className="flex gap-2">
                          {driver.isActive && (
                            <span className="px-2 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#236383', fontFamily: 'Roboto, sans-serif' }}>
                              Active
                            </span>
                          )}
                          {driver.vanApproved && (
                            <span className="px-2 py-1 text-sm font-medium rounded-full text-white" style={{ backgroundColor: '#FBAD3F', fontFamily: 'Roboto, sans-serif' }}>
                              Van Driver
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                          <span className="font-medium">Phone:</span> {driver.phone}
                        </p>
                        <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                          <span className="font-medium">Email:</span> {driver.email}
                        </p>
                        <p className="text-base" style={{ color: '#646464', fontFamily: 'Roboto, sans-serif' }}>
                          <span className="font-medium">Zone:</span> {driver.zone}
                        </p>
                      </div>
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