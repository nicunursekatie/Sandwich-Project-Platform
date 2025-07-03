import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageLog from "@/components/message-log";
import CommitteeChat from "@/components/committee-chat";
import HostChat from "@/components/host-chat";
import CommitteeMessageLog from "@/components/committee-message-log";
import CoreTeamChat from "@/components/core-team-chat";
import DirectMessaging from "@/components/direct-messaging";
import { GroupMessaging } from "@/components/group-messaging";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, USER_ROLES } from "@/lib/authUtils";
import { PERMISSIONS } from "@/lib/authUtils";

export default function ChatHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("");

  // Determine available chat tabs based on user role
  const availableTabs = [];

  if (hasPermission(user, PERMISSIONS.GENERAL_CHAT)) {
    availableTabs.push({ value: "general", label: "General Chat", component: <CommitteeMessageLog committee="general" /> });
  }

  if (hasPermission(user, PERMISSIONS.COMMITTEE_CHAT)) {
    availableTabs.push({ value: "committee", label: "Committee Chat", component: <CommitteeChat /> });
  }

  if (hasPermission(user, PERMISSIONS.HOST_CHAT)) {
    availableTabs.push({ value: "hosts", label: "Host Chat", component: <HostChat /> });
  }

  if (hasPermission(user, PERMISSIONS.DRIVER_CHAT)) {
    availableTabs.push({ value: "drivers", label: "Driver Chat", component: <CommitteeMessageLog committee="drivers" /> });
  }

  if (hasPermission(user, PERMISSIONS.RECIPIENT_CHAT)) {
    availableTabs.push({ value: "recipients", label: "Recipient Chat", component: <CommitteeMessageLog committee="recipients" /> });
  }

  // Core team chat for admins only
  if (hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
    availableTabs.push({ value: "core_team", label: "Core Team", component: <CoreTeamChat /> });
  }

  // Direct messaging for all authenticated users
  if (user) {
    availableTabs.push({ value: "direct", label: "Direct Messages", component: <DirectMessaging /> });
  }

  // Group messaging for all authenticated users
  if (user) {
    availableTabs.push({ value: "groups", label: "Group Messages", component: <GroupMessaging currentUser={user} /> });
  }

  const defaultTab = availableTabs.length > 0 ? availableTabs[0].value : "general";
  
  // Initialize activeTab to defaultTab if not set
  if (!activeTab && defaultTab) {
    setActiveTab(defaultTab);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-main-heading text-primary">Team Communication</h1>
          <p className="text-sm sm:text-base font-body text-muted-foreground">Stay connected with your team and committees</p>
        </div>
      </div>

      {availableTabs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-600">You don't have access to any chat channels.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-4 sm:mb-6 overflow-x-auto`} style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(80px, 1fr))` }}>
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="space-y-6">
            {/* Only render the active tab component to prevent simultaneous API calls */}
            {availableTabs.find(tab => tab.value === activeTab)?.component}
          </div>
        </Tabs>
      )}
    </div>
  );
}