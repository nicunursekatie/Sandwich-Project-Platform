import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Users, MapPin, AlertTriangle, BarChart3, PieChart as PieChartIcon, Crown, Clock, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SandwichCollection } from "@shared/schema";

interface AnalyticsData {
  totalCollections: number;
  totalSandwiches: number;
  uniqueHosts: number;
  dateRange: { start: string; end: string };
  avgPerCollection: number;
  topHosts: Array<{ host: string; count: number; total: number }>;
  monthlyTrends: Array<{ month: string; collections: number; sandwiches: number }>;
  weeklyPatterns: Array<{ day: string; collections: number; avg: number }>;
  hostDistribution: Array<{ name: string; value: number; color: string }>;
  qualityMetrics: {
    withGroups: number;
    withoutGroups: number;
    missingData: number;
    suspiciousEntries: number;
  };
  ogAnalysis: {
    ogCollections: number;
    ogSandwiches: number;
    preLocationPeriod: string;
    locationBasedPeriod: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

export default function CollectionAnalytics() {
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [hostFilter, setHostFilter] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("sandwiches");
  const [sandwichFilter, setSandwichFilter] = useState({ min: "", max: "" });
  const [collectionTypeFilter, setCollectionTypeFilter] = useState("all");
  const [editingCollection, setEditingCollection] = useState<SandwichCollection | null>(null);
  const [editForm, setEditForm] = useState({
    collectionDate: "",
    hostName: "",
    individualSandwiches: 0,
    groupCollections: 0,
  });

  const { toast } = useToast();

  // Mutation for updating collections
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<SandwichCollection> }) => {
      return await apiRequest(`/api/sandwich-collections/${data.id}`, "PATCH", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      toast({ title: "Success", description: "Collection updated successfully" });
      setEditingCollection(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update collection", variant: "destructive" });
    },
  });

  const handleEditClick = (collection: SandwichCollection) => {
    setEditingCollection(collection);
    setEditForm({
      collectionDate: collection.collectionDate,
      hostName: collection.hostName,
      individualSandwiches: Number(collection.individualSandwiches || 0),
      groupCollections: Number(collection.groupCollections || 0),
    });
  };

  const handleSaveEdit = () => {
    if (!editingCollection) return;
    
    updateMutation.mutate({
      id: editingCollection.id,
      updates: {
        collectionDate: editForm.collectionDate,
        hostName: editForm.hostName,
        individualSandwiches: editForm.individualSandwiches,
        groupCollections: editForm.groupCollections,
      },
    });
  };

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["/api/sandwich-collections", { limit: 10000 }],
    queryFn: async () => {
      const response = await fetch("/api/sandwich-collections?limit=10000");
      if (!response.ok) throw new Error('Failed to fetch collections');
      const data = await response.json();
      return data.collections as SandwichCollection[];
    }
  });

  // Filter collections based on search criteria
  const filteredCollections = useMemo(() => {
    return collections.filter((collection: SandwichCollection) => {
      // Date filters
      if (dateFilter.start && collection.collectionDate < dateFilter.start) return false;
      if (dateFilter.end && collection.collectionDate > dateFilter.end) return false;
      
      // Host name filter
      if (hostFilter && !collection.hostName?.toLowerCase().includes(hostFilter.toLowerCase())) return false;
      
      // Sandwich count filters
      const totalSandwiches = (collection.individualSandwiches || 0) + Number(collection.groupCollections || 0);
      if (sandwichFilter.min && totalSandwiches < Number(sandwichFilter.min)) return false;
      if (sandwichFilter.max && totalSandwiches > Number(sandwichFilter.max)) return false;
      
      // Collection type filters
      if (collectionTypeFilter === "with-groups" && !collection.groupCollections) return false;
      if (collectionTypeFilter === "individual-only" && collection.groupCollections) return false;
      if (collectionTypeFilter === "og-project" && collection.hostName !== "OG Sandwich Project") return false;
      if (collectionTypeFilter === "location-based" && collection.hostName === "OG Sandwich Project") return false;
      
      return true;
    });
  }, [collections, dateFilter, hostFilter, sandwichFilter, collectionTypeFilter]);

  const analyticsData: AnalyticsData | null = useMemo(() => {
    if (!collections.length) return null;

    // Use filtered collections for analytics when filters are applied
    let dataCollections = filteredCollections;

    const totalCollections = filteredCollections.length;
    const totalSandwiches = filteredCollections.reduce((sum, c) => sum + (c.individualSandwiches || 0), 0);
    const uniqueHosts = new Set(filteredCollections.map(c => c.hostName)).size;
    
    // Date range
    const dates = filteredCollections.map(c => c.collectionDate).sort();
    const dateRange = {
      start: dates[0] || "",
      end: dates[dates.length - 1] || ""
    };

    // Top hosts analysis
    const hostStats = new Map();
    filteredCollections.forEach(c => {
      const host = c.hostName;
      if (!hostStats.has(host)) {
        hostStats.set(host, { count: 0, total: 0 });
      }
      const stats = hostStats.get(host);
      stats.count++;
      stats.total += (c.individualSandwiches || 0);
    });

    const topHosts = Array.from(hostStats.entries())
      .map(([host, stats]) => ({ host, count: stats.count, total: stats.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Monthly trends
    const monthlyData = new Map();
    filteredCollections.forEach(c => {
      const month = c.collectionDate.substring(0, 7); // YYYY-MM
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { collections: 0, sandwiches: 0 });
      }
      const data = monthlyData.get(month);
      data.collections++;
      data.sandwiches += (c.individualSandwiches || 0);
    });

    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Weekly patterns (day of week analysis)
    const weeklyData = new Map();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    filteredCollections.forEach(c => {
      const day = new Date(c.collectionDate).getDay();
      const dayName = dayNames[day];
      if (!weeklyData.has(dayName)) {
        weeklyData.set(dayName, { collections: 0, total: 0 });
      }
      const data = weeklyData.get(dayName);
      data.collections++;
      data.total += (c.individualSandwiches || 0);
    });

    const weeklyPatterns = dayNames.map(day => {
      const data = weeklyData.get(day) || { collections: 0, total: 0 };
      return {
        day,
        collections: data.collections,
        avg: data.collections > 0 ? Math.round(data.total / data.collections) : 0
      };
    });

    // Host distribution for pie chart
    const hostDistribution = topHosts.slice(0, 8).map((host, index) => ({
      name: host.host.length > 15 ? host.host.substring(0, 15) + "..." : host.host,
      value: host.total,
      color: COLORS[index % COLORS.length]
    }));

    // Quality metrics
    const withGroups = filteredCollections.filter(c => (Number(c.groupCollections) || 0) > 0).length;
    const withoutGroups = totalCollections - withGroups;
    const missingData = filteredCollections.filter(c => 
      !c.hostName || c.hostName.trim() === "" || (c.individualSandwiches || 0) === 0
    ).length;
    const suspiciousEntries = filteredCollections.filter(c => {
      const hostName = c.hostName.toLowerCase();
      return hostName.includes('test') || hostName.includes('duplicate') || 
             hostName.match(/^group \d+$/) || hostName.startsWith('loc ');
    }).length;

    // OG Sandwich Project analysis
    const ogCollections = filteredCollections.filter(c => c.hostName === 'OG Sandwich Project');
    const ogSandwiches = ogCollections.reduce((sum, c) => sum + (c.individualSandwiches || 0), 0);
    const ogDates = ogCollections.map(c => c.collectionDate).sort();
    const preLocationPeriod = ogDates.length > 0 ? `${ogDates[0]} to ${ogDates[ogDates.length - 1]}` : "No data";
    
    const locationBasedCollections = filteredCollections.filter(c => 
      c.hostName !== 'OG Sandwich Project' && c.hostName && c.hostName.trim() !== ""
    );
    const locationDates = locationBasedCollections.map(c => c.collectionDate).sort();
    const locationBasedPeriod = locationDates.length > 0 ? `${locationDates[0]} to ${locationDates[locationDates.length - 1]}` : "No data";

    return {
      totalCollections,
      totalSandwiches,
      uniqueHosts,
      dateRange,
      avgPerCollection: totalCollections > 0 ? Math.round(totalSandwiches / totalCollections) : 0,
      topHosts,
      monthlyTrends,
      weeklyPatterns,
      hostDistribution,
      qualityMetrics: {
        withGroups,
        withoutGroups,
        missingData,
        suspiciousEntries
      },
      ogAnalysis: {
        ogCollections: ogCollections.length,
        ogSandwiches,
        preLocationPeriod,
        locationBasedPeriod
      }
    };
  }, [collections, dateFilter, hostFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No data available for analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Collection Analytics</h2>
          <p className="text-sm text-gray-600">
            Comprehensive analysis of {analyticsData.totalCollections.toLocaleString()} collections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Data Insights</span>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Collection Logs</CardTitle>
          <CardDescription>Search by any characteristic to view matching collection logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="host-filter">Host Name</Label>
              <Input
                id="host-filter"
                placeholder="Type host name..."
                value={hostFilter}
                onChange={(e) => setHostFilter(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sandwich-min">Min Sandwiches</Label>
              <Input
                id="sandwich-min"
                type="number"
                placeholder="e.g. 100"
                value={sandwichFilter.min}
                onChange={(e) => setSandwichFilter(prev => ({ ...prev, min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="sandwich-max">Max Sandwiches</Label>
              <Input
                id="sandwich-max"
                type="number"
                placeholder="e.g. 500"
                value={sandwichFilter.max}
                onChange={(e) => setSandwichFilter(prev => ({ ...prev, max: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="collection-type">Collection Type</Label>
              <Select value={collectionTypeFilter} onValueChange={setCollectionTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  <SelectItem value="with-groups">With Group Collections</SelectItem>
                  <SelectItem value="individual-only">Individual Only</SelectItem>
                  <SelectItem value="og-project">OG Sandwich Project</SelectItem>
                  <SelectItem value="location-based">Location-Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="metric-select">Primary Metric</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandwiches">Sandwiches</SelectItem>
                  <SelectItem value="collections">Collections</SelectItem>
                  <SelectItem value="average">Average per Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setDateFilter({ start: "", end: "" });
                  setHostFilter("");
                  setSandwichFilter({ min: "", max: "" });
                  setCollectionTypeFilter("all");
                }}
                className="w-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Results:</strong> {filteredCollections.length} collections found
              {hostFilter && ` • Host contains "${hostFilter}"`}
              {dateFilter.start && ` • From ${dateFilter.start}`}
              {dateFilter.end && ` • To ${dateFilter.end}`}
              {sandwichFilter.min && ` • Min ${sandwichFilter.min} sandwiches`}
              {sandwichFilter.max && ` • Max ${sandwichFilter.max} sandwiches`}
              {collectionTypeFilter !== "all" && ` • Type: ${collectionTypeFilter}`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <p className="text-2xl font-bold">{analyticsData.totalCollections.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sandwiches</p>
                <p className="text-2xl font-bold">{analyticsData.totalSandwiches.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Hosts</p>
                <p className="text-2xl font-bold">{analyticsData.uniqueHosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg per Collection</p>
                <p className="text-2xl font-bold">{analyticsData.avgPerCollection}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="hosts">Host Analysis</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Collection activity and sandwich totals over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="collections" fill="#8884d8" name="Collections" />
                  <Line yAxisId="right" type="monotone" dataKey="sandwiches" stroke="#82ca9d" strokeWidth={2} name="Sandwiches" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Filtered Collections Table */}
          <Card>
            <CardHeader>
              <CardTitle>Filtered Collection Logs</CardTitle>
              <CardDescription>
                {filteredCollections.length} collections matching current filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Host</th>
                      <th className="text-right p-2">Individual</th>
                      <th className="text-right p-2">Groups</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-left p-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollections.slice(0, 100).map((collection) => (
                      <tr 
                        key={collection.id} 
                        className="border-b hover:bg-gray-50 cursor-pointer group"
                        onClick={() => handleEditClick(collection)}
                        title="Click to edit this collection"
                      >
                        <td className="p-2">{collection.collectionDate}</td>
                        <td className="p-2">
                          {collection.hostName === 'OG Sandwich Project' && (
                            <Crown className="w-4 h-4 text-amber-500 inline mr-2" />
                          )}
                          {collection.hostName}
                          <Edit className="w-4 h-4 text-gray-400 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="p-2 text-right">{collection.individualSandwiches || 0}</td>
                        <td className="p-2 text-right">{
                          Array.isArray(collection.groupCollections) ? 0 : (collection.groupCollections || 0)
                        }</td>
                        <td className="p-2 text-right font-medium">
                          {Number(collection.individualSandwiches || 0) + Number(Array.isArray(collection.groupCollections) ? 0 : (collection.groupCollections || 0))}
                        </td>
                        <td className="p-2 text-xs text-gray-500">
                          {new Date(collection.submittedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCollections.length > 100 && (
                  <div className="mt-4 text-center text-sm text-gray-500">
                    Showing first 100 of {filteredCollections.length} matching collections
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hosts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Hosts</CardTitle>
                <CardDescription>Hosts by total sandwich contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topHosts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="host" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Host Distribution</CardTitle>
                <CardDescription>Sandwich contribution breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.hostDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.hostDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Host Performance Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Host</th>
                      <th className="text-right p-2">Collections</th>
                      <th className="text-right p-2">Total Sandwiches</th>
                      <th className="text-right p-2">Avg per Collection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topHosts.map((host, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">
                          {host.host === 'OG Sandwich Project' && (
                            <Crown className="w-4 h-4 text-amber-500 inline mr-2" />
                          )}
                          {host.host}
                        </td>
                        <td className="p-2 text-right">{host.count}</td>
                        <td className="p-2 text-right">{host.total.toLocaleString()}</td>
                        <td className="p-2 text-right">{Math.round(host.total / host.count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Patterns</CardTitle>
              <CardDescription>Collection activity by day of week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.weeklyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="collections" fill="#8884d8" name="Collections" />
                  <Bar yAxisId="right" dataKey="avg" fill="#82ca9d" name="Avg Sandwiches" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">With Group Data</p>
                    <p className="text-2xl font-bold text-green-600">{analyticsData.qualityMetrics.withGroups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Individual Only</p>
                    <p className="text-2xl font-bold text-blue-600">{analyticsData.qualityMetrics.withoutGroups}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Missing Data</p>
                    <p className="text-2xl font-bold text-amber-600">{analyticsData.qualityMetrics.missingData}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Suspicious</p>
                    <p className="text-2xl font-bold text-red-600">{analyticsData.qualityMetrics.suspiciousEntries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Data Quality Summary</CardTitle>
              <CardDescription>Overview of data completeness and accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Collections with complete data</span>
                  <Badge variant="secondary">
                    {((analyticsData.totalCollections - analyticsData.qualityMetrics.missingData) / analyticsData.totalCollections * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Collections with group data</span>
                  <Badge variant="secondary">
                    {(analyticsData.qualityMetrics.withGroups / analyticsData.totalCollections * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data quality score</span>
                  <Badge variant={analyticsData.qualityMetrics.suspiciousEntries > analyticsData.totalCollections * 0.05 ? "destructive" : "default"}>
                    {((analyticsData.totalCollections - analyticsData.qualityMetrics.suspiciousEntries - analyticsData.qualityMetrics.missingData) / analyticsData.totalCollections * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 text-amber-500 mr-2" />
                  OG Sandwich Project Era
                </CardTitle>
                <CardDescription>Pre-location based collection period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Collections</span>
                    <Badge variant="secondary">{analyticsData.ogAnalysis.ogCollections}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Sandwiches</span>
                    <Badge variant="secondary">{analyticsData.ogAnalysis.ogSandwiches.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time Period</span>
                    <Badge variant="outline" className="text-xs">{analyticsData.ogAnalysis.preLocationPeriod}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg per Collection</span>
                    <Badge variant="secondary">
                      {analyticsData.ogAnalysis.ogCollections > 0 ? 
                        Math.round(analyticsData.ogAnalysis.ogSandwiches / analyticsData.ogAnalysis.ogCollections) : 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                  Location-Based Era
                </CardTitle>
                <CardDescription>Host-specific collection tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Collections</span>
                    <Badge variant="secondary">
                      {analyticsData.totalCollections - analyticsData.ogAnalysis.ogCollections}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Sandwiches</span>
                    <Badge variant="secondary">
                      {(analyticsData.totalSandwiches - analyticsData.ogAnalysis.ogSandwiches).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Time Period</span>
                    <Badge variant="outline" className="text-xs">{analyticsData.ogAnalysis.locationBasedPeriod}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unique Hosts</span>
                    <Badge variant="secondary">{analyticsData.uniqueHosts - 1}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historical Timeline</CardTitle>
              <CardDescription>Evolution of collection tracking methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">OG Sandwich Project Period</h4>
                    <p className="text-sm text-gray-600">
                      Centralized tracking without specific host locations. 
                      {analyticsData.ogAnalysis.ogCollections} collections totaling {analyticsData.ogAnalysis.ogSandwiches.toLocaleString()} sandwiches.
                    </p>
                    <Badge variant="outline" className="mt-2">{analyticsData.ogAnalysis.preLocationPeriod}</Badge>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Location-Based Tracking</h4>
                    <p className="text-sm text-gray-600">
                      Transition to host-specific tracking with detailed location data. 
                      {analyticsData.uniqueHosts - 1} unique hosts providing detailed collection information.
                    </p>
                    <Badge variant="outline" className="mt-2">{analyticsData.ogAnalysis.locationBasedPeriod}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update the details for this sandwich collection record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">Collection Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.collectionDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, collectionDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-host">Host Name</Label>
              <Input
                id="edit-host"
                value={editForm.hostName}
                onChange={(e) => setEditForm(prev => ({ ...prev, hostName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-individual">Individual Sandwiches</Label>
              <Input
                id="edit-individual"
                type="number"
                value={editForm.individualSandwiches}
                onChange={(e) => setEditForm(prev => ({ ...prev, individualSandwiches: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-groups">Group Collections</Label>
              <Input
                id="edit-groups"
                type="number"
                value={editForm.groupCollections}
                onChange={(e) => setEditForm(prev => ({ ...prev, groupCollections: Number(e.target.value) }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingCollection(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}