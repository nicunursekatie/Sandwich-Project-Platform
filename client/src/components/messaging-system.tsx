import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessaging } from "@/hooks/useMessaging";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageCircle, 
  Send, 
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit2,
  UserPlus,
  Settings,
  Hash
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import DirectMessaging from "@/components/direct-messaging";
import { GroupMessaging } from "@/components/group-messaging";

interface MessagingSystemProps {
  initialTab?: 'direct' | 'groups' | 'all';
}

export default function MessagingSystem({ initialTab = 'direct' }: MessagingSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'direct':
        return <DirectMessaging />;
      case 'groups':
        return <GroupMessaging currentUser={user} />;
      case 'all':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Direct Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Private one-on-one conversations with team members
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('direct')}
                    className="w-full"
                  >
                    Open Direct Messages
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Group Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create and participate in group conversations
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('groups')}
                    className="w-full"
                  >
                    Open Group Messages
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-sm text-muted-foreground">
            Please log in to access messaging features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">Direct and group conversations</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-50 border-r transition-all duration-200 flex flex-col`}>
          <div className="p-4">
            <nav className="space-y-2">
              {[
                { id: 'all', label: 'All Messages', icon: MessageCircle, description: 'Overview of all conversations' },
                { id: 'direct', label: 'Direct Messages', icon: MessageCircle, description: 'One-on-one conversations' },
                { id: 'groups', label: 'Group Messages', icon: Users, description: 'Group conversations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                    ${activeTab === tab.id 
                      ? 'bg-white text-primary shadow-sm border border-gray-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tab.label}</div>
                      <div className="text-xs text-gray-500 truncate">{tab.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}