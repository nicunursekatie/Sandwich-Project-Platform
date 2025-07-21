import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/ui/loading";
import { SimpleErrorBoundary } from "@/components/simple-error-boundary";

import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import SimpleLanding from "@/pages/simple-landing";
import SignupPage from "@/pages/signup";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();

  if (isLoading) {
    return <LoadingState text="Authenticating..." size="lg" className="min-h-screen" />;
  }

  // For any authentication errors, show simple landing
  if (error) {
    console.warn('[App] Authentication issue, showing simple landing:', error);
    return <SimpleLanding />;
  }

  // If not authenticated, show simple landing
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/signup" component={SignupPage} />
        <Route path="/" component={SimpleLanding} />
        <Route component={SimpleLanding} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/messages">{() => <Dashboard initialSection="messages" />}</Route>
      <Route path="/inbox">{() => <Dashboard initialSection="inbox" />}</Route>
      <Route path="/suggestions">{() => <Dashboard initialSection="suggestions" />}</Route>
      <Route path="/google-sheets">{() => <Dashboard initialSection="google-sheets" />}</Route>
      <Route path="/dashboard">{() => <Dashboard />}</Route>
      <Route path="/dashboard/:section">{(params) => <Dashboard initialSection={params.section} />}</Route>
      <Route path="/">{() => <Dashboard />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <SimpleErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </SimpleErrorBoundary>
  );
}

export default App;
