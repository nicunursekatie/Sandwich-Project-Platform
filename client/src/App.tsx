import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { initGA } from "../lib/analytics";
import { useAnalytics } from "../hooks/use-analytics";
import { useEnhancedTracking } from "../hooks/use-enhanced-tracking";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";

import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import SignupPage from "@/pages/signup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();
  
  // Track page views when routes change
  useAnalytics();
  
  // Enhanced tracking for detailed user behavior analytics
  useEnhancedTracking();

  if (isLoading) {
    return <LoadingState text="Authenticating..." size="lg" className="min-h-screen" />;
  }

  // Enhanced error handling for authentication issues
  if (error && error.message && !error.message.includes('401')) {
    console.error('[App] Authentication error:', error);
    // For non-401 errors, show error state
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">There was a problem verifying your account.</p>
          <button 
            onClick={() => window.location.href = "/api/login"}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, show public routes with login option
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={SignupPage} />
        <Route path="/login">
          {() => {
            // Redirect to the backend login page
            window.location.href = "/api/login";
            return <LoadingState text="Redirecting to login..." size="lg" className="min-h-screen" />;
          }}
        </Route>
        <Route path="/stream-messages">
          {() => (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold text-blue-600 mb-2">Authentication Required</h2>
                <p className="text-gray-600 mb-4">Please log in to access the messaging system.</p>
                <button 
                  onClick={() => window.location.href = "/api/login"}
                  className="px-6 py-2 bg-[#236383] text-white rounded hover:bg-[#1a4d61] transition-colors"
                >
                  Login to Continue
                </button>
              </div>
            </div>
          )}
        </Route>
        <Route path="/">
          {() => {
            // Redirect unauthenticated users directly to login
            window.location.href = "/api/login";
            return <LoadingState text="Redirecting to login..." size="lg" className="min-h-screen" />;
          }}
        </Route>
        <Route>
          {() => {
            // Default fallback - redirect to login
            window.location.href = "/api/login";
            return <LoadingState text="Redirecting to login..." size="lg" className="min-h-screen" />;
          }}
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/messages">{() => <Dashboard initialSection="messages" />}</Route>
      <Route path="/stream-messages">{() => <Dashboard initialSection="stream-messages" />}</Route>
      <Route path="/inbox">{() => <Dashboard initialSection="inbox" />}</Route>
      <Route path="/suggestions">{() => <Dashboard initialSection="suggestions" />}</Route>
      <Route path="/governance">{() => <Dashboard initialSection="governance" />}</Route>
      <Route path="/google-sheets">{() => <Dashboard initialSection="google-sheets" />}</Route>
      <Route path="/meetings">{() => <Dashboard initialSection="meetings" />}</Route>
      <Route path="/projects">{() => <Dashboard initialSection="projects" />}</Route>
      <Route path="/projects/:id">{(params) => <Dashboard initialSection={`project-${params.id}`} />}</Route>
      <Route path="/dashboard">{() => <Dashboard />}</Route>
      <Route path="/dashboard/:section">{(params) => <Dashboard initialSection={params.section} />}</Route>
      <Route path="/">{() => <Dashboard />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
