import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Eye, 
  TrendingUp, 
  User, 
  Users, 
  MousePointer, 
  FileText, 
  MessageSquare,
  BarChart3,
  Target
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// Enhanced interfaces for granular user behavior tracking
interface DetailedUserActivity {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalActions: number;
  lastActive: Date | null;
  topSection: string;
  topFeature: string;
  timeSpent: number; // in minutes
  sessionsCount: number;
  featuresUsed: string[];
  sectionBreakdown: { section: string; actions: number; timeSpent: number }[];
}

interface ActivityStats {
  totalActions: number;
  sectionsUsed: string[];
  topActions: { action: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
  featureUsage: { feature: string; count: number; avgDuration: number }[];
  sectionBreakdown: { section: string; actions: number; timeSpent: number }[];
  peakUsageTimes: { hour: number; count: number }[];
}

interface ActivityLog {
  id: number;
  userId: string;
  userName: string;
  action: string;
  section: string;
  feature: string;
  page: string;
  duration: number;
  createdAt: string;
  metadata: any;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalActions: number;
  averageActionsPerUser: number;
  topSections: { section: string; actions: number }[];
  topFeatures: { feature: string; usage: number }[];
  dailyActiveUsers: { date: string; users: number }[];
}

export default function EnhancedUserAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // System-wide analytics
  const { data: systemStats, isLoading: isLoadingStats } = useQuery<SystemStats>({
    queryKey: ['/api/enhanced-user-activity/enhanced-stats', selectedTimeframe],
    queryFn: async () => {
      const res = await fetch(`/api/enhanced-user-activity/enhanced-stats?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch system stats');
      return res.json();
    },
    staleTime: 60000,
  });

  // Detailed user activities
  const { data: detailedActivities, isLoading: isLoadingUsers } = useQuery<DetailedUserActivity[]>({
    queryKey: ['/api/enhanced-user-activity/detailed-users', selectedTimeframe],
    queryFn: async () => {
      const res = await fetch(`/api/enhanced-user-activity/detailed-users?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch user activities');
      return res.json();
    },
    staleTime: 30000,
  });

  // Activity logs for detailed view
  const { data: activityLogs, isLoading: isLoadingLogs } = useQuery<ActivityLog[]>({
    queryKey: ['/api/enhanced-user-activity/logs', selectedUser, activityFilter, selectedTimeframe],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: selectedTimeframe,
        ...(selectedUser !== 'all' && { userId: selectedUser }),
        ...(activityFilter !== 'all' && { action: activityFilter })
      });
      const res = await fetch(`/api/enhanced-user-activity/logs?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      return res.json();
    },
    staleTime: 15000,
  });

  // Individual user stats
  const { data: userStats, isLoading: isLoadingUserStats } = useQuery<ActivityStats>({
    queryKey: ['/api/enhanced-user-activity/user-stats', selectedUser, selectedTimeframe],
    queryFn: async () => {
      const res = await fetch(`/api/enhanced-user-activity/user-stats/${selectedUser}?days=${selectedTimeframe}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch user stats');
      return res.json();
    },
    enabled: selectedUser !== 'all',
    staleTime: 30000,
  });

  const getSectionColor = (section: string) => {
    const colors: Record<string, string> = {
      'Dashboard': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Collections': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Communication': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Directory': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Projects': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'Analytics': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Meetings': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    return colors[section] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'View': return <Eye className="h-4 w-4" />;
      case 'Create': return <FileText className="h-4 w-4" />;
      case 'Update': return <MousePointer className="h-4 w-4" />;
      case 'Delete': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoadingStats || isLoadingUsers) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select user" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {detailedActivities?.map((user) => (
              <SelectItem key={user.userId} value={user.userId}>
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Stats Cards */}
      {systemStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {systemStats.activeUsersLast24h || systemStats.activeUsers} active (24h)
                </p>
                <p className="text-xs text-green-600">
                  {systemStats.activeUsersLast12h || 0} active (12h)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalActions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(systemStats.averageActionsPerUser)} avg per user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Section</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.topSections?.[0]?.section || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStats.topSections?.[0]?.actions || 0} actions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Feature</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {systemStats.topFeatures?.[0]?.feature || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {systemStats.topFeatures?.[0]?.usage || 0} uses
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">User Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {detailedActivities?.map((user) => (
                    <div key={user.userId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#236383] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {user.totalActions} actions
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Top Section</p>
                          <Badge className={getSectionColor(user.topSection)}>
                            {user.topSection}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Top Feature</p>
                          <p className="font-medium">{user.topFeature}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Time Spent</p>
                          <p className="font-medium">{Math.round(user.timeSpent)} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Active</p>
                          <p className="font-medium">
                            {user.lastActive 
                              ? formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Features Used</p>
                        <div className="flex flex-wrap gap-1">
                          {user.featuresUsed.slice(0, 5).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {user.featuresUsed.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.featuresUsed.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
              <div className="flex gap-2">
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="View">View</SelectItem>
                    <SelectItem value="Create">Create</SelectItem>
                    <SelectItem value="Update">Update</SelectItem>
                    <SelectItem value="Delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {activityLogs?.map((log) => (
                    <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant="outline">{log.action}</Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{log.userName || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.feature} in {log.section}
                          {log.page && ` (${log.page})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                        </p>
                        {log.duration && (
                          <p className="text-xs text-muted-foreground">
                            {log.duration}s duration
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Most Used Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Most Used Features
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Features with highest user engagement
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStats?.topFeatures?.filter(f => f.feature && f.feature !== 'Unknown').slice(0, 6).map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-green-500' : 
                          idx === 1 ? 'bg-blue-500' : 
                          idx === 2 ? 'bg-purple-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium">{feature.feature}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{feature.usage}</span>
                        <p className="text-xs text-muted-foreground">
                          {feature.feature !== 'Unknown' ? 'uses' : 'unknown'}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No feature data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Most Visited Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Most Visited Sections
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Platform areas with highest traffic
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStats?.topSections?.filter(s => s.section && s.section !== 'General' && s.section !== 'Unknown').slice(0, 6).map((section, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <Badge className={getSectionColor(section.section)} variant="outline">
                        {section.section.replace('/api/', '').replace('/', '')}
                      </Badge>
                      <div className="text-right">
                        <span className="text-sm font-bold">{section.actions || section.usage}</span>
                        <p className="text-xs text-muted-foreground">actions</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No section data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Engagement Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  User Engagement
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Overall platform activity patterns
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Users</span>
                      <span>{systemStats?.activeUsers || 0} of {systemStats?.totalUsers || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ 
                          width: `${systemStats?.totalUsers ? (systemStats.activeUsers / systemStats.totalUsers) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Average Actions per User</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(systemStats?.averageActionsPerUser || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Total Sessions</p>
                    <p className="text-lg font-bold">
                      {detailedActivities?.reduce((sum, user) => sum + user.sessionsCount, 0) || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis for All Users or Selected User */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  {selectedUser === 'all' ? 'All Users Activity Breakdown' : 'Individual User Analysis'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {selectedUser === 'all' 
                    ? 'Comprehensive platform usage overview' 
                    : 'Detailed activity analysis for selected user'
                  }
                </p>
              </CardHeader>
              <CardContent>
                {selectedUser === 'all' ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Active vs Inactive Users</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Active Users (with activity)</span>
                          <span className="font-bold text-green-600">
                            {detailedActivities?.filter(u => u.totalActions > 0).length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Inactive Users (no activity)</span>
                          <span className="font-bold text-red-600">
                            {detailedActivities?.filter(u => u.totalActions === 0).length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Top Active Users</h4>
                      <div className="space-y-2">
                        {detailedActivities
                          ?.filter(u => u.totalActions > 0)
                          .slice(0, 5)
                          .map((user, idx) => (
                            <div key={user.userId} className="flex justify-between">
                              <span className="text-sm">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="font-bold">
                                {user.totalActions} actions
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ) : (
                  // Individual user analysis would go here when a specific user is selected
                  <div className="space-y-3">
                    {selectedUser !== 'all' && detailedActivities && (
                      (() => {
                        const user = detailedActivities.find(u => u.userId === selectedUser);
                        if (!user) return <p>User not found</p>;
                        return (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Total Actions</p>
                                <p className="text-2xl font-bold">{user.totalActions}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Sessions</p>
                                <p className="text-2xl font-bold">{user.sessionsCount}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Features Used</p>
                              <div className="flex flex-wrap gap-1">
                                {user.featuresUsed.map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Section Activity</p>
                              <div className="space-y-2">
                                {user.sectionBreakdown?.map((section, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-sm">{section.section}</span>
                                    <span className="font-medium">{section.actions} actions</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Areas Needing Attention
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Features and sections that may need improvement
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Unused Features</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Platform features that haven't been accessed recently
                    </p>
                    <div className="space-y-1">
                      {/* This would need to be calculated based on all available features vs used features */}
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        Unknown Features
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Consider user training or interface improvements
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-orange-600">Low Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Users with 0 actions</span>
                        <span className="font-bold text-orange-600">
                          {detailedActivities?.filter(u => u.totalActions === 0).length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Users with 1-2 actions</span>
                        <span className="font-bold text-orange-600">
                          {detailedActivities?.filter(u => u.totalActions > 0 && u.totalActions <= 2).length || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Recommendations</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Focus on onboarding inactive users</li>
                      <li>• Improve discoverability of unused features</li>
                      <li>• Analyze user paths to identify friction points</li>
                      <li>• Consider user feedback for feature improvements</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}