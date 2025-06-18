import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";

import Dashboard from "@/pages/dashboard";
import Meetings from "@/pages/meetings";
import Development from "@/pages/development";
import PhoneDirectoryPage from "@/pages/phone-directory";
import RoleDemo from "@/pages/role-demo";
import Analytics from "@/pages/analytics";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import ImpactDashboard from "@/pages/impact-dashboard";
import DataManagement from "@/pages/data-management";
import PerformanceDashboard from "@/pages/performance-dashboard";
import ReportingDashboard from "@/pages/reporting-dashboard";
import Landing from "@/pages/landing";
import SignupPage from "@/pages/signup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState text="Authenticating..." size="lg" className="min-h-screen" />;
  }

  // If not authenticated, show public routes
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={SignupPage} />
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/meetings" component={Meetings} />
      <Route path="/development" component={Development} />
      <Route path="/phone-directory" component={PhoneDirectoryPage} />
      <Route path="/role-demo" component={RoleDemo} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/impact" component={ImpactDashboard} />
      <Route path="/data-management" component={DataManagement} />
      <Route path="/performance" component={PerformanceDashboard} />
      <Route path="/reports" component={ReportingDashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:id" component={ProjectDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
