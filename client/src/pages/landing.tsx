import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Calendar, MessageSquare, Sandwich, TrendingUp, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DocumentsBrowser } from "@/components/documents-browser";

export default function Landing() {
  const [showToolkit, setShowToolkit] = useState(false);
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  // Fetch real statistics for public display
  const { data: collections } = useQuery({
    queryKey: ['/api/sandwich-collections'],
    retry: false,
  });

  // Calculate humanized statistics from real data
  const totalSandwiches = collections?.reduce((sum: number, collection: any) => sum + (collection.individualSandwiches || 0), 0) || 0;
  const weeklyAverage = collections?.length > 0 ? Math.round(totalSandwiches / Math.max(1, collections.length)) : 0;
  const totalCollections = collections?.length || 0;

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
              Volunteer Toolkit
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
              <CardTitle className="text-2xl font-bold">{totalCollections.toLocaleString()}</CardTitle>
              <CardDescription className="font-semibold">Total Collections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">community events organized</p>
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
              Sign In with Replit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}