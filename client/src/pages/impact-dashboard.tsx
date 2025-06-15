import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Heart, 
  Users, 
  Calendar,
  MapPin,
  Award,
  Target,
  Clock,
  DollarSign,
  PieChart,
  BarChart3,
  Activity
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from "recharts";

export default function ImpactDashboard() {
  // Fetch sandwich collections data
  const { data: collections = [] } = useQuery({
    queryKey: ["/api/sandwich-collections"],
  });

  // Fetch collection stats
  const { data: stats } = useQuery({
    queryKey: ["/api/sandwich-collections/stats"],
  });

  // Fetch hosts data
  const { data: hosts = [] } = useQuery({
    queryKey: ["/api/hosts"],
  });

  // Process data for visualizations
  const processCollectionData = () => {
    if (!Array.isArray(collections)) return [];
    
    const monthlyData: Record<string, {
      month: string;
      sandwiches: number;
      collections: number;
      hosts: Set<string>;
    }> = {};
    
    collections.forEach((collection: any) => {
      if (collection.collectionDate) {
        const date = new Date(collection.collectionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            sandwiches: 0,
            collections: 0,
            hosts: new Set()
          };
        }
        
        monthlyData[monthKey].sandwiches += collection.sandwichCount || 0;
        monthlyData[monthKey].collections += 1;
        if (collection.hostName) {
          monthlyData[monthKey].hosts.add(collection.hostName);
        }
      }
    });

    return Object.values(monthlyData).map((item) => ({
      month: item.month,
      sandwiches: item.sandwiches,
      collections: item.collections,
      hosts: item.hosts.size
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processHostPerformance = () => {
    if (!Array.isArray(collections)) return [];
    
    const hostData: Record<string, {
      name: string;
      totalSandwiches: number;
      totalCollections: number;
      avgPerCollection: number;
    }> = {};
    
    collections.forEach((collection: any) => {
      const hostName = collection.hostName || 'Unknown';
      
      if (!hostData[hostName]) {
        hostData[hostName] = {
          name: hostName,
          totalSandwiches: 0,
          totalCollections: 0,
          avgPerCollection: 0
        };
      }
      
      hostData[hostName].totalSandwiches += collection.sandwichCount || 0;
      hostData[hostName].totalCollections += 1;
    });

    return Object.values(hostData).map((host) => ({
      ...host,
      avgPerCollection: host.totalCollections > 0 ? Math.round(host.totalSandwiches / host.totalCollections) : 0
    })).sort((a, b) => b.totalSandwiches - a.totalSandwiches).slice(0, 10);
  };

  const calculateImpactMetrics = () => {
    if (!Array.isArray(collections) || !stats) {
      return {
        totalSandwiches: 0,
        totalCollections: 0,
        uniqueHosts: 0,
        estimatedMealsServed: 0,
        estimatedPeopleHelped: 0,
        estimatedVolunteerHours: 0,
        estimatedFoodValue: 0
      };
    }
    
    const totalSandwiches = (stats as any).totalSandwiches || 0;
    const totalCollections = collections.length;
    const uniqueHosts = new Set(collections.map((c: any) => c.hostName)).size;
    
    // Estimate impact metrics
    const estimatedMealsServed = totalSandwiches;
    const estimatedPeopleHelped = Math.round(totalSandwiches * 0.8); // Assuming 80% reach
    const estimatedVolunteerHours = totalCollections * 2; // Estimate 2 hours per collection
    const estimatedFoodValue = totalSandwiches * 8; // $8 per sandwich estimate
    
    return {
      totalSandwiches,
      totalCollections,
      uniqueHosts,
      estimatedMealsServed,
      estimatedPeopleHelped,
      estimatedVolunteerHours,
      estimatedFoodValue
    };
  };

  const monthlyData = processCollectionData();
  const hostPerformance = processHostPerformance();
  const impactMetrics = calculateImpactMetrics();

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Impact Dashboard</h1>
          <p className="text-lg text-gray-600">Visualizing our community impact through sandwich collections</p>
        </div>

        {/* Key Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Total Sandwiches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{impactMetrics.totalSandwiches?.toLocaleString()}</div>
              <p className="text-blue-100 text-sm">Meals provided to community</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Users className="w-5 h-5 mr-2" />
                People Helped
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{impactMetrics.estimatedPeopleHelped?.toLocaleString()}</div>
              <p className="text-green-100 text-sm">Estimated individuals served</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Volunteer Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{impactMetrics.estimatedVolunteerHours?.toLocaleString()}</div>
              <p className="text-purple-100 text-sm">Community volunteer time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Food Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${impactMetrics.estimatedFoodValue?.toLocaleString()}</div>
              <p className="text-orange-100 text-sm">Estimated value provided</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Visualizations */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="hosts" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Host Performance
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Impact Analysis
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Monthly Sandwich Collections
                  </CardTitle>
                  <CardDescription>Tracking sandwich collection trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.split('-')[1] + '/' + value.split('-')[0].slice(2)}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => `Month: ${value}`}
                        formatter={(value, name) => [value, name === 'sandwiches' ? 'Sandwiches' : 'Collections']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sandwiches" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Collection Activity
                  </CardTitle>
                  <CardDescription>Number of collection events per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.split('-')[1] + '/' + value.split('-')[0].slice(2)}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => `Month: ${value}`}
                        formatter={(value, name) => [value, name === 'collections' ? 'Collections' : 'Active Hosts']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="collections" 
                        stroke="#82ca9d" 
                        strokeWidth={3}
                        dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="hosts" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ fill: '#ffc658', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Host Performance Tab */}
          <TabsContent value="hosts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Top Performing Hosts
                  </CardTitle>
                  <CardDescription>Hosts ranked by total sandwich contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hostPerformance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 10 }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Total Sandwiches']}
                        labelFormatter={(label) => `Host: ${label}`}
                      />
                      <Bar dataKey="totalSandwiches" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Host Performance Metrics</CardTitle>
                  <CardDescription>Detailed breakdown of top hosts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hostPerformance.slice(0, 5).map((host: any, index) => (
                      <div key={host.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{host.name}</p>
                            <p className="text-sm text-gray-600">{host.totalCollections} collections</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{host.totalSandwiches}</p>
                          <p className="text-sm text-gray-600">sandwiches</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Host Distribution
                  </CardTitle>
                  <CardDescription>Distribution of sandwich collections by host</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={hostPerformance.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="totalSandwiches"
                      >
                        {hostPerformance.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Collection Summary</CardTitle>
                  <CardDescription>Overall collection statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Collections</span>
                    <span className="font-bold text-xl">{impactMetrics.totalCollections.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Hosts</span>
                    <span className="font-bold text-xl">{impactMetrics.uniqueHosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg per Collection</span>
                    <span className="font-bold text-xl">
                      {impactMetrics.totalCollections > 0 
                        ? Math.round(impactMetrics.totalSandwiches / impactMetrics.totalCollections)
                        : 0}
                    </span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Collection Efficiency</span>
                      <span className="font-bold">
                        {impactMetrics.totalCollections > 0 
                          ? Math.round((impactMetrics.totalSandwiches / impactMetrics.totalCollections) / 50 * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={impactMetrics.totalCollections > 0 
                        ? Math.min(100, Math.round((impactMetrics.totalSandwiches / impactMetrics.totalCollections) / 50 * 100))
                        : 0} 
                      className="h-2" 
                    />
                    <p className="text-xs text-gray-500 mt-1">Based on 50 sandwich target per collection</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Impact Analysis Tab */}
          <TabsContent value="impact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Community Impact Goals
                  </CardTitle>
                  <CardDescription>Progress towards annual targets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Annual Sandwich Goal</span>
                      <span className="font-bold">50,000</span>
                    </div>
                    <Progress value={(impactMetrics.totalSandwiches / 50000) * 100} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {impactMetrics.totalSandwiches} / 50,000 sandwiches ({Math.round((impactMetrics.totalSandwiches / 50000) * 100)}%)
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Volunteer Hours Goal</span>
                      <span className="font-bold">2,000</span>
                    </div>
                    <Progress value={(impactMetrics.estimatedVolunteerHours / 2000) * 100} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {impactMetrics.estimatedVolunteerHours.toLocaleString()} / 2,000 hours ({Math.round((impactMetrics.estimatedVolunteerHours / 2000) * 100)}%)
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Host Participation Goal</span>
                      <span className="font-bold">100</span>
                    </div>
                    <Progress value={(impactMetrics.uniqueHosts / 100) * 100} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {impactMetrics.uniqueHosts} / 100 hosts ({Math.round((impactMetrics.uniqueHosts / 100) * 100)}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Highlights</CardTitle>
                  <CardDescription>Key achievements and milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <Heart className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-green-900">Meals Provided</p>
                        <p className="text-sm text-green-700">
                          Over {impactMetrics.estimatedMealsServed?.toLocaleString()} meals delivered to community members in need
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium text-blue-900">Community Engagement</p>
                        <p className="text-sm text-blue-700">
                          {impactMetrics.uniqueHosts} active host locations contributing to the cause
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium text-purple-900">Volunteer Dedication</p>
                        <p className="text-sm text-purple-700">
                          {impactMetrics.estimatedVolunteerHours?.toLocaleString()} hours of community service contributed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-orange-600 mt-1" />
                      <div>
                        <p className="font-medium text-orange-900">Economic Impact</p>
                        <p className="text-sm text-orange-700">
                          ${impactMetrics.estimatedFoodValue?.toLocaleString()} worth of food assistance provided to the community
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}