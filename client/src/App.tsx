import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingState } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";
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
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState text="Authenticating..." size="lg" className="min-h-screen" />;
  }

  // If not authenticated, always show Landing page
  if (!isAuthenticated) {
    return <Landing />;
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
