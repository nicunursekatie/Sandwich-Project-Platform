import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Eye, TrendingUp, User, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivityStats = {
  totalActions: number;
  sectionsUsed: string[];
  topActions: { action: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
};

type UserActivitySummary = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalActions: number;
  lastActive: Date | null;
  topSection: string;
};

export default function UserActivityAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [viewMode, setViewMode] = useState<"summary" | "details">("summary");

  // Get all users activity summary
  const { data: activitySummary, isLoading: summaryLoading } = useQuery<UserActivitySummary[]>({
    queryKey: ["/api/user-activity/summary", selectedPeriod],
    queryFn: () => fetch(`/api/user-activity/summary?days=${selectedPeriod}`).then(res => res.json()),
    enabled: viewMode === "summary"
  });

  // Get individual user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<ActivityStats>({
    queryKey: ["/api/user-activity/stats", selectedUser, selectedPeriod],
    queryFn: () => fetch(`/api/user-activity/stats/${selectedUser}?days=${selectedPeriod}`).then(res => res.json()),
    enabled: viewMode === "details" && !!selectedUser
  });

  const getSectionBadgeColor = (section: string) => {
    const colors: Record<string, string> = {
      dashboard: "bg-blue-100 text-blue-800",
      collections: "bg-green-100 text-green-800", 
      messaging: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
      reports: "bg-yellow-100 text-yellow-800",
      projects: "bg-teal-100 text-teal-800",
      directory: "bg-orange-100 text-orange-800",
      none: "bg-gray-100 text-gray-800"
    };
    return colors[section] || "bg-gray-100 text-gray-800";
  };

  const getActivityLevel = (count: number) => {
    if (count > 100) return { level: "High", color: "text-green-600" };
    if (count > 50) return { level: "Medium", color: "text-yellow-600" };
    if (count > 0) return { level: "Low", color: "text-blue-600" };
    return { level: "None", color: "text-gray-600" };
  };

  const formatActionName = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity Analytics
          </CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "summary" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("summary")}
                className="bg-[#236383] hover:bg-[#1e5470] text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                All Users Summary
              </Button>
              <Button
                variant={viewMode === "details" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("details")}
                className="bg-[#236383] hover:bg-[#1e5470] text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Individual Details
              </Button>
            </div>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "summary" && (
            <div>
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {activitySummary?.map((user) => {
                      const activity = getActivityLevel(user.totalActions);
                      return (
                        <div key={user.userId} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#236383] text-white flex items-center justify-center text-sm font-medium">
                                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-600">{user.email}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${activity.color}`}>
                                {user.totalActions}
                              </div>
                              <div className="text-sm text-gray-500">actions</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <Badge className={getSectionBadgeColor(user.topSection)}>
                                {user.topSection}
                              </Badge>
                              <span className={activity.color}>
                                {activity.level} Activity
                              </span>
                            </div>
                            <div className="text-gray-500">
                              {user.lastActive 
                                ? `Active ${formatDistanceToNow(new Date(user.lastActive))} ago`
                                : "No recent activity"
                              }
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user.userId);
                              setViewMode("details");
                            }}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {(!activitySummary || activitySummary.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No user activity data found for the selected period.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {viewMode === "details" && (
            <div className="space-y-6">
              {!selectedUser ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">Select a user to view detailed activity stats</div>
                  <Button
                    onClick={() => setViewMode("summary")}
                    className="bg-[#236383] hover:bg-[#1e5470] text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Users
                  </Button>
                </div>
              ) : statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userStats ? (
                <div className="grid gap-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Actions</p>
                            <p className="text-2xl font-bold text-[#236383]">{userStats.totalActions}</p>
                          </div>
                          <Activity className="h-8 w-8 text-[#236383]" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Sections Used</p>
                            <p className="text-2xl font-bold text-[#236383]">{userStats.sectionsUsed.length}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-[#236383]" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Daily Average</p>
                            <p className="text-2xl font-bold text-[#236383]">
                              {Math.round(userStats.totalActions / parseInt(selectedPeriod))}
                            </p>
                          </div>
                          <Calendar className="h-8 w-8 text-[#236383]" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {userStats.topActions.map((action, index) => (
                          <div key={action.action} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#236383] text-white flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{formatActionName(action.action)}</span>
                            </div>
                            <Badge variant="secondary">{action.count} times</Badge>
                          </div>
                        ))}
                        {userStats.topActions.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No actions recorded for this period.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sections Used */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Sections Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {userStats.sectionsUsed.map((section) => (
                          <Badge 
                            key={section} 
                            className={getSectionBadgeColor(section)}
                          >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </Badge>
                        ))}
                        {userStats.sectionsUsed.length === 0 && (
                          <div className="text-center py-4 text-gray-500 w-full">
                            No sections accessed during this period.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No activity data found for the selected user and period.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}