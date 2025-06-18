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
import { TrendingUp, Calendar, Users, MapPin, AlertTriangle, BarChart3, PieChart as PieChartIcon, Crown, Clock, Edit, CheckSquare, Square } from "lucide-react";
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
    groupCollections: "0",
  });
  const [selectedCollections, setSelectedCollections] = useState<Set<number>>(new Set());
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [batchEditData, setBatchEditData] = useState({
    hostName: "",
    collectionDate: ""
  });

  const { toast } = useToast();

  // Helper function to normalize group data from various formats
  const parseGroupCollections = (groupCollections: any): number => {
    if (!groupCollections) return 0;
    
    if (typeof groupCollections === 'string') {
      try {
        const parsed = JSON.parse(groupCollections);
        if (Array.isArray(parsed)) {
          return parsed.reduce((total: number, group: any) => 
            total + (Number(group.sandwichCount) || 0), 0
          );
        } else {
          return Number(parsed) || 0;
        }
      } catch {
        return Number(groupCollections) || 0;
      }
    } else if (Array.isArray(groupCollections)) {
      return groupCollections.reduce((total: number, group: any) => 
        total + (Number(group.sandwichCount) || 0), 0
      );
    } else {
      return Number(groupCollections) || 0;
    }
  };

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

  // Mutation for batch editing collections
  const batchEditMutation = useMutation({
    mutationFn: async (data: { ids: number[], updates: Partial<SandwichCollection> }) => {
      const response = await fetch("/api/sandwich-collections/batch-edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update collections");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      setShowBatchEdit(false);
      setBatchEditData({ hostName: "", collectionDate: "" });
      setSelectedCollections(new Set());
      toast({
        title: "Success",
        description: `Successfully updated ${selectedCollections.size} collections`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update collections",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (collection: SandwichCollection) => {
    setEditingCollection(collection);
    setEditForm({
      collectionDate: collection.collectionDate,
      hostName: collection.hostName,
      individualSandwiches: collection.individualSandwiches || 0,
      groupCollections: String(collection.groupCollections || "0"),
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
        groupCollections: String(editForm.groupCollections),
      },
    });
  };

  const handleSelectCollection = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedCollections);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCollections(newSelected);
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedCollections(new Set(filteredCollections.map(c => c.id)));
    } else {
      setSelectedCollections(new Set());
    }
  };

  const handleBatchEdit = () => {
    if (selectedCollections.size === 0) {
      toast({
        title: "No collections selected",
        description: "Please select collections to edit.",
        variant: "destructive",
      });
      return;
    }
    setShowBatchEdit(true);
  };

  const submitBatchEdit = () => {
    const updates: Partial<SandwichCollection> = {};
    if (batchEditData.hostName) updates.hostName = batchEditData.hostName;
    if (batchEditData.collectionDate) updates.collectionDate = batchEditData.collectionDate;

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes to apply",
        description: "Please specify at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    batchEditMutation.mutate({
      ids: Array.from(selectedCollections),
      updates
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
      const totalSandwiches = (collection.individualSandwiches || 0) + parseGroupCollections(collection.groupCollections);
      if (sandwichFilter.min && totalSandwiches < Number(sandwichFilter.min)) return false;
      if (sandwichFilter.max && totalSandwiches > Number(sandwichFilter.max)) return false;
      
      // Collection type filters
      if (collectionTypeFilter === "with-groups" && parseGroupCollections(collection.groupCollections) === 0) return false;
      if (collectionTypeFilter === "individual-only" && parseGroupCollections(collection.groupCollections) > 0) return false;
      if (collectionTypeFilter === "og-project" && collection.hostName !== "OG Sandwich Project") return false;
      if (collectionTypeFilter === "location-based" && collection.hostName === "OG Sandwich Project") return false;
      
      return true;
    });
  }, [collections, dateFilter, hostFilter, sandwichFilter, collectionTypeFilter]);

  const analyticsData: AnalyticsData | null = useMemo(() => {
    if (!collections.length) return null;

    // Separate OG Project (historical bulk imports) from location-based collections
    const ogCollections = filteredCollections.filter(c => c.hostName === "OG Sandwich Project");
    const locationCollections = filteredCollections.filter(c => c.hostName !== "OG Sandwich Project");

    const totalCollections = filteredCollections.length;
    const totalSandwiches = filteredCollections.reduce((sum, c) => {
      const individual = Number(c.individualSandwiches || 0);
      const groups = parseGroupCollections(c.groupCollections);
      return sum + individual + groups;
    }, 0);
    
    // Calculate more meaningful averages
    const locationSandwiches = locationCollections.reduce((sum, c) => {
      const individual = Number(c.individualSandwiches || 0);
      const groups = parseGroupCollections(c.groupCollections);
      return sum + individual + groups;
    }, 0);
    
    const avgPerCollection = totalCollections > 0 ? totalSandwiches / totalCollections : 0;
    const avgPerLocationCollection = locationCollections.length > 0 ? locationSandwiches / locationCollections.length : 0;
    
    // Weekly average based on operational data
    const weeklyAverage = 14004;
    
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
      
      const individual = Number(c.individualSandwiches || 0);
      const groups = parseGroupCollections(c.groupCollections);
      
      stats.total += individual + groups;
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
      data.sandwiches += (c.individualSandwiches || 0) + parseGroupCollections(c.groupCollections);
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
      const individual = Number(c.individualSandwiches || 0);
      const groups = parseGroupCollections(c.groupCollections);
      data.total += individual + groups;
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
    const withGroups = filteredCollections.filter(c => parseGroupCollections(c.groupCollections) > 0).length;
    const withoutGroups = totalCollections - withGroups;
    const missingData = filteredCollections.filter(c => 
      !c.hostName || c.hostName.trim() === "" || (c.individualSandwiches || 0) === 0
    ).length;
    const suspiciousEntries = filteredCollections.filter(c => {
      const hostName = c.hostName.toLowerCase();
      return hostName.includes('test') || hostName.includes('duplicate') || 
             hostName.match(/^group \d+$/) || hostName.startsWith('loc ');
    }).length;

    // OG Sandwich Project analysis (using ogCollections defined above)
    const ogSandwiches = ogCollections.reduce((sum, c) => sum + (c.individualSandwiches || 0), 0);
    const ogDates = ogCollections.map(c => c.collectionDate).sort();
    const preLocationPeriod = ogDates.length > 0 ? `${ogDates[0]} to ${ogDates[ogDates.length - 1]}` : "No data";
    
    // Location-based collections analysis
    const locationBasedDates = locationCollections.map(c => c.collectionDate).sort();
    const locationBasedPeriod = locationBasedDates.length > 0 ? `${locationBasedDates[0]} to ${locationBasedDates[locationBasedDates.length - 1]}` : "No data";

    return {
      totalCollections,
      totalSandwiches,
      uniqueHosts,
      dateRange,
      avgPerCollection: totalCollections > 0 ? Math.round(totalSandwiches / totalCollections) : 0,
      avgPerLocationCollection: Math.round(avgPerLocationCollection),
      weeklyAverage,
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
        locationBasedPeriod,
        locationCollections: locationCollections.length,
        locationSandwiches
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
                {selectedCollections.size > 0 && (
                  <span className="ml-2 text-blue-600">({selectedCollections.size} selected)</span>
                )}
              </CardDescription>
              {selectedCollections.size > 0 && (
                <div className="flex space-x-2 mt-2">
                  <Button onClick={handleBatchEdit} size="sm">
                    Bulk Edit ({selectedCollections.size})
                  </Button>
                  <Button 
                    onClick={() => setSelectedCollections(new Set())} 
                    variant="outline" 
                    size="sm"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 w-8">
                        <button
                          onClick={() => handleSelectAll(!selectedCollections.size || selectedCollections.size < filteredCollections.length)}
                          className="flex items-center"
                        >
                          {selectedCollections.size === filteredCollections.length ? (
                            <CheckSquare className="w-4 h-4" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Host</th>
                      <th className="text-right p-2">Individual</th>
                      <th className="text-right p-2">Groups</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-left p-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollections.slice(0, 100).map((collection) => {
                      const isSelected = selectedCollections.has(collection.id);
                      return (
                        <tr 
                          key={collection.id} 
                          className={`border-b hover:bg-gray-50 group ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="p-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectCollection(collection.id, !isSelected)}
                              className="flex items-center"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td 
                            className="p-2 cursor-pointer"
                            onClick={() => handleEditClick(collection)}
                            title="Click to edit this collection"
                          >
                            {collection.collectionDate}
                          </td>
                          <td 
                            className="p-2 cursor-pointer"
                            onClick={() => handleEditClick(collection)}
                            title="Click to edit this collection"
                          >
                            {collection.hostName === 'OG Sandwich Project' && (
                              <Crown className="w-4 h-4 text-amber-500 inline mr-2" />
                            )}
                            {collection.hostName}
                            <Edit className="w-4 h-4 text-gray-400 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                          <td className="p-2 text-right">{collection.individualSandwiches || 0}</td>
                          <td className="p-2 text-right">{parseGroupCollections(collection.groupCollections)}</td>
                          <td className="p-2 text-right font-medium">
                            {Number(collection.individualSandwiches || 0) + parseGroupCollections(collection.groupCollections)}
                          </td>
                          <td className="p-2 text-xs text-gray-500">
                            {new Date(collection.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
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

          {/* All Host Locations List */}
          <Card>
            <CardHeader>
              <CardTitle>All Host Locations</CardTitle>
              <CardDescription>Complete list of all hosts represented in the collection database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Array.from(new Set(collections.map(c => c.hostName).filter(Boolean))).sort().map((hostName, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 bg-gray-50 rounded border"
                  >
                    {hostName === 'OG Sandwich Project' && (
                      <Crown className="w-4 h-4 text-amber-500 mr-2" />
                    )}
                    <span className="text-sm">{hostName}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total: {Array.from(new Set(collections.map(c => c.hostName).filter(Boolean))).length} unique host locations
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
                onChange={(e) => setEditForm(prev => ({ ...prev, groupCollections: e.target.value }))}
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

      {/* Bulk Edit Dialog */}
      <Dialog open={showBatchEdit} onOpenChange={setShowBatchEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Edit Collections</DialogTitle>
            <DialogDescription>
              Editing {selectedCollections.size} selected collections. Leave fields empty to keep existing values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-date">Collection Date</Label>
              <Input
                id="batch-date"
                type="date"
                value={batchEditData.collectionDate}
                onChange={(e) => setBatchEditData({ ...batchEditData, collectionDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="batch-host">Host Name</Label>
              <Input
                id="batch-host"
                value={batchEditData.hostName}
                onChange={(e) => setBatchEditData({ ...batchEditData, hostName: e.target.value })}
                placeholder="Enter new host name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBatchEdit(false)}>
                Cancel
              </Button>
              <Button onClick={submitBatchEdit} disabled={batchEditMutation.isPending}>
                {batchEditMutation.isPending ? "Updating..." : `Update ${selectedCollections.size} Collections`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}