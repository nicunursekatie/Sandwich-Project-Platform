import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes instead of 0
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes instead of 0
    refetchOnMount: true, // Always check auth on mount to handle server restarts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Enhanced debugging for mobile issues and auth problems
  if (typeof window !== 'undefined') {
    // Check if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && (error || !user)) {
      console.log('[useAuth] Mobile authentication issue detected:', {
        error: error?.message,
        user: !!user,
        isLoading,
        userAgent: navigator.userAgent,
        cookies: document.cookie
      });
    }

    // Handle server restart - if we get auth error, try to login via temporary auth
    if (error && error.message?.includes('401') && !user && !isLoading) {
      console.log('[useAuth] Authentication expired, attempting to restore session');
      // Don't redirect immediately - let the user handle authentication manually
      // This prevents unnecessary redirects when the user is already trying to log in
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
  };
}