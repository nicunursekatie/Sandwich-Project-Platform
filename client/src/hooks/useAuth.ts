import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}