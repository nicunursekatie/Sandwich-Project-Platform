import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, MessageSquare, Sandwich, TrendingUp, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DocumentsBrowser } from "@/components/documents-browser";

export default function Landing() {
  const [showToolkit, setShowToolkit] = useState(false);
  
  const handleLogin = async () => {
    try {
      const response = await fetch('/api/temp-login', { method: 'POST' });
      if (response.ok) {
        window.location.href = "/";
      } else {
        // Fallback to login page if temp auth fails
        window.location.href = "/api/login";
      }
    } catch (error) {
      // Fallback to login page
      window.location.href = "/api/login";
    }
  };

  // Fetch real statistics for public display
  const { data: collections } = useQuery({
    queryKey: ['/api/sandwich-collections'],
    retry: false,
  });

  // Calculate humanized statistics from real data (matching dashboard calculation)
  const totalSandwiches = collections?.reduce((sum: number, collection: any) => {
    let groupTotal = 0;
    try {
      const groupData = JSON.parse(collection.groupCollections || "[]");
      if (Array.isArray(groupData)) {
        groupTotal = groupData.reduce((groupSum: number, group: any) => groupSum + (group.sandwichCount || 0), 0);
      }
    } catch (error) {
      // If parsing fails, treat as 0
      groupTotal = 0;
    }
    return sum + (collection.individualSandwiches || 0) + groupTotal;
  }, 0) || 0;
  // Calculate proper weekly average based on program duration
  const weeklyAverage = collections?.length > 0 ? (() => {
    const dates = collections.map(c => new Date(c.collectionDate)).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const weeksDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    return Math.round(totalSandwiches / weeksDiff);
  })() : 0;
  // Calculate record week and efficiency metrics
  const recordWeek = collections?.length > 0 ? (() => {
    // Group by week and calculate totals
    const weeklyTotals = collections.reduce((weeks: { [key: string]: number }, collection) => {
      const weekKey = collection.collectionDate;
      let groupTotal = 0;
      try {
        const groupData = JSON.parse(collection.groupCollections || "[]");
        if (Array.isArray(groupData)) {
          groupTotal = groupData.reduce((sum: number, group: any) => sum + (group.sandwichCount || 0), 0);
        }
      } catch (error) {
        groupTotal = 0;
      }
      const total = (collection.individualSandwiches || 0) + groupTotal;
      weeks[weekKey] = (weeks[weekKey] || 0) + total;
      return weeks;
    }, {});
    
    return Math.max(...Object.values(weeklyTotals));
  })() : 0;
  
  const costPerSandwich = 3.5; // Average of $2.67-$5.35 range

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-12 py-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Heart className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            The Sandwich Project
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A community-driven initiative connecting volunteers, hosts, and recipients 
            to fight hunger one sandwich at a time. Building food security through 
            organized collection events and volunteer coordination.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Join Our Team
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowToolkit(!showToolkit)}
            >
              {showToolkit ? 'Hide' : 'View'} Volunteer Toolkit
            </Button>
          </div>
        </div>

        {/* Real-time Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center bg-white/80 backdrop-blur dark:bg-gray-800/80">
            <CardHeader>
              <Sandwich className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">{totalSandwiches.toLocaleString()}</CardTitle>
              <CardDescription className="font-semibold">Sandwiches Delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">meals shared with community members</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur dark:bg-gray-800/80">
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">{weeklyAverage.toLocaleString()}</CardTitle>
              <CardDescription className="font-semibold">Weekly Average</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">sandwiches collected each week</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur dark:bg-gray-800/80">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">{recordWeek.toLocaleString()}</CardTitle>
              <CardDescription className="font-semibold">Record Week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">highest weekly sandwich collection</p>
            </CardContent>
          </Card>

          <Card className="text-center bg-white/80 backdrop-blur dark:bg-gray-800/80">
            <CardHeader>
              <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">{Math.round(totalSandwiches / 3).toLocaleString()}</CardTitle>
              <CardDescription className="font-semibold">People Served</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">estimated community impact</p>
            </CardContent>
          </Card>
        </div>

        {/* Efficiency Metrics Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">
              Proven Impact Efficiency
            </CardTitle>
            <CardDescription className="text-lg text-green-700 dark:text-green-300">
              Data-backed claims with measurable results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${costPerSandwich.toFixed(2)}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost Per Sandwich</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">vs. $100M+ corporate marketing budgets</div>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">200-400x</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">More Efficient</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">impact per dollar vs. city programs</div>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">962%</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">5-Year Growth</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">from 42,647 to 452,683 annually</div>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="text-2xl font-bold text-red-600">70+</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Mile Radius</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">distributed infrastructure coverage</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Crisis Response: +100% surge capacity proven during Hurricane week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Toolkit Section */}
        {showToolkit && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Volunteer Toolkit</CardTitle>
              <CardDescription className="text-lg">
                Everything you need to organize and participate in sandwich collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentsBrowser />
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage hosts, volunteers, and drivers with comprehensive contact and role management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Project Coordination</CardTitle>
              <CardDescription>
                Track sandwich collections, coordinate meetings, and manage project workflows
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Communication Hub</CardTitle>
              <CardDescription>
                Real-time messaging, committee discussions, and comprehensive reporting tools
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Section */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Welcome to TSP</CardTitle>
            <CardDescription>
              Sign in with your account to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleLogin} size="lg" className="w-full">
              Access Platform
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}