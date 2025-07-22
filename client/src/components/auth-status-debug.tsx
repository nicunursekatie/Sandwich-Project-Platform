import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function AuthStatusDebug() {
  const [email, setEmail] = useState("admin@sandwich.project");
  const [password, setPassword] = useState("sandwich123");
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const queryClient = useQueryClient();

  // Check authentication status
  const { data: authStatus, isLoading: checkingAuth, refetch: refetchAuth } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('GET', '/api/auth/user'),
    retry: false
  });

  // Test messages endpoint
  const { data: messagesTest, isLoading: checkingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['/api/real-time-messages-test'],
    queryFn: () => apiRequest('GET', '/api/real-time-messages'),
    retry: false,
    enabled: false // Only run when explicitly called
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response;
    },
    onSuccess: () => {
      setLoginStatus('success');
      queryClient.invalidateQueries();
      refetchAuth();
    },
    onError: (error) => {
      console.error('Login error:', error);
      setLoginStatus('error');
    }
  });

  const handleLogin = () => {
    setLoginStatus('loading');
    loginMutation.mutate({ email, password });
  };

  const testMessages = () => {
    refetchMessages();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Authentication Status Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Auth Status */}
          <div>
            <h3 className="font-semibold mb-2">Current Authentication Status</h3>
            <div className="flex items-center gap-2">
              {checkingAuth ? (
                <>
                  <Badge variant="secondary">Checking...</Badge>
                  <span>Checking authentication status...</span>
                </>
              ) : authStatus ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default" className="bg-green-500">Authenticated</Badge>
                  <span>Logged in as: {authStatus.email || authStatus.firstName || 'User'}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Not Authenticated</Badge>
                  <span>You need to log in first</span>
                </>
              )}
            </div>
          </div>

          {/* Messages API Test */}
          <div>
            <h3 className="font-semibold mb-2">Messages API Access</h3>
            <div className="flex items-center gap-2 mb-2">
              <Button onClick={testMessages} disabled={checkingMessages} size="sm">
                {checkingMessages ? 'Testing...' : 'Test Messages API'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {checkingMessages ? (
                <>
                  <Badge variant="secondary">Testing...</Badge>
                  <span>Testing messages endpoint...</span>
                </>
              ) : messagesTest ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="default" className="bg-green-500">Success</Badge>
                  <span>Messages API accessible ({Array.isArray(messagesTest) ? messagesTest.length : 0} messages)</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Failed</Badge>
                  <span>Messages API not accessible - authentication required</span>
                </>
              )}
            </div>
          </div>

          {/* Login Form */}
          {!authStatus && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Quick Login</h3>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button 
                  onClick={handleLogin}
                  disabled={loginMutation.isPending}
                  className="w-full"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </Button>
                {loginStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Login successful! You can now send messages.</span>
                  </div>
                )}
                {loginStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>Login failed. Check your credentials.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Credentials */}
          <div className="bg-gray-50 p-3 rounded text-sm">
            <h4 className="font-semibold mb-2">Available Test Accounts:</h4>
            <div className="space-y-1">
              <div><strong>Admin:</strong> admin@sandwich.project / sandwich123</div>
              <div><strong>Committee Member:</strong> katielong2316@gmail.com / sandwich123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}