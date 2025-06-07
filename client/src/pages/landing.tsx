import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sandwich, Users, Calendar, MessageCircle, BarChart3, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sandwich className="w-12 h-12 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-900">The Sandwich Project</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive team communication and collaboration platform for managing projects, 
            scheduling meetings, and coordinating community outreach efforts.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Project Management
              </CardTitle>
              <CardDescription>
                Track and assign projects, monitor progress, and coordinate team efforts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                Committee Communication
              </CardTitle>
              <CardDescription>
                Dedicated chat channels for different committees and working groups
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Meeting Coordination
              </CardTitle>
              <CardDescription>
                Schedule meetings, manage agendas, and track action items
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Activity Tracking
              </CardTitle>
              <CardDescription>
                Monitor weekly reports, collection logs, and community impact metrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sandwich className="w-5 h-5 text-amber-600" />
                Collection Management
              </CardTitle>
              <CardDescription>
                Track sandwich collections, manage volunteers, and coordinate distribution
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                Secure Access
              </CardTitle>
              <CardDescription>
                Role-based access control and secure document management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Team Member Access</CardTitle>
              <CardDescription>
                Login to access the team communication platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                size="lg"
              >
                Login with Replit
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>© 2024 The Sandwich Project. A 501(c)(3) non-profit organization.</p>
        </div>
      </div>
    </div>
  );
}