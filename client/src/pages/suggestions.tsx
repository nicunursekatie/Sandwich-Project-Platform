import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Lightbulb, Plus, MessageSquare, ThumbsUp, Eye, EyeOff, Star, Clock, CheckCircle, XCircle, Pause } from "lucide-react";
import { hasPermission } from "@shared/auth-utils";

// Schema for suggestion form
const suggestionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be under 2000 characters"),
  category: z.string().default("general"),
  priority: z.string().default("medium"),
  isAnonymous: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const responseSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message must be under 1000 characters"),
  isInternal: z.boolean().default(false)
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;
type ResponseFormData = z.infer<typeof responseSchema>;

interface Suggestion {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  submittedBy: string;
  submitterEmail?: string;
  submitterName?: string;
  isAnonymous: boolean;
  upvotes: number;
  tags: string[];
  implementationNotes?: string;
  estimatedEffort?: string;
  assignedTo?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface SuggestionResponse {
  id: number;
  suggestionId: number;
  message: string;
  isAdminResponse: boolean;
  respondedBy: string;
  respondentName?: string;
  isInternal: boolean;
  createdAt: string;
}

export default function SuggestionsPortal() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: true
  });

  // Check permissions
  const canSubmit = hasPermission(currentUser, 'submit_suggestions');
  const canManage = hasPermission(currentUser, 'manage_suggestions');
  const canRespond = hasPermission(currentUser, 'respond_to_suggestions');

  // Debug permissions
  console.log('🔍 User permissions debug:', {
    currentUser: currentUser,
    canSubmit,
    canManage,
    canRespond,
    userPermissions: currentUser?.permissions
  });

  // Fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['/api/suggestions'],
    enabled: hasPermission(currentUser, 'view_suggestions'),
    staleTime: 0 // Always fetch fresh data
  });

  // Update selected suggestion when suggestions data changes
  useEffect(() => {
    if (selectedSuggestion && suggestions.length > 0) {
      const updatedSuggestion = suggestions.find((s: Suggestion) => s.id === selectedSuggestion.id);
      if (updatedSuggestion) {
        console.log('🔄 Updating selected suggestion from fresh data:', updatedSuggestion);
        setSelectedSuggestion(updatedSuggestion);
      }
    }
  }, [suggestions, selectedSuggestion]);

  // Fetch responses for selected suggestion
  const { data: responses = [] } = useQuery({
    queryKey: ['/api/suggestions', selectedSuggestion?.id, 'responses'],
    enabled: !!selectedSuggestion?.id
  });

  // Submit suggestion mutation
  const submitSuggestionMutation = useMutation({
    mutationFn: (data: SuggestionFormData) => {
      console.log('🔍 Frontend form data being submitted:', data);
      return apiRequest('POST', '/api/suggestions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      setShowSubmissionForm(false);
      suggestionForm.reset();
      toast({
        title: "Success",
        description: "Your suggestion has been submitted successfully!"
      });
    },
    onError: (error: any) => {
      console.error('🚨 Suggestion submission error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit suggestion",
        variant: "destructive"
      });
    }
  });

  // Upvote suggestion mutation
  const upvoteMutation = useMutation({
    mutationFn: (suggestionId: number) => apiRequest('POST', `/api/suggestions/${suggestionId}/upvote`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      toast({
        title: "Success",
        description: "Suggestion upvoted!"
      });
    }
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: ({ suggestionId, data }: { suggestionId: number; data: ResponseFormData }) => 
      apiRequest('POST', `/api/suggestions/${suggestionId}/responses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions', selectedSuggestion?.id, 'responses'] });
      toast({
        title: "Success",
        description: "Response submitted successfully!"
      });
    }
  });

  // Update suggestion mutation (admin only)
  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Suggestion> }) => 
      apiRequest('PATCH', `/api/suggestions/${id}`, updates),
    onSuccess: (updatedSuggestion) => {
      console.log('🔄 Update successful, updated suggestion:', updatedSuggestion);
      
      // Update the selected suggestion in local state immediately
      if (selectedSuggestion && updatedSuggestion) {
        console.log('🔄 Updating selected suggestion state');
        setSelectedSuggestion({ ...selectedSuggestion, ...updatedSuggestion });
      }
      
      // Force refresh the main suggestions list
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      
      // Force refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ['/api/suggestions'] });
      
      toast({
        title: "Success",
        description: "Suggestion updated successfully!"
      });
    },
    onError: (error) => {
      console.error('🚨 Update failed:', error);
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive"
      });
    }
  });

  // Delete suggestion mutation (admin only)
  const deleteSuggestionMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/suggestions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'], staleTime: 0 });
      setSelectedSuggestion(null);
      toast({
        title: "Suggestion deleted",
        description: "The suggestion has been permanently removed.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to delete suggestion. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Forms
  const suggestionForm = useForm<SuggestionFormData>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      category: "general",
      priority: "medium",
      isAnonymous: false,
      tags: []
    }
  });

  const responseForm = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      isInternal: false
    }
  });

  // Filter suggestions based on active tab
  const filteredSuggestions = suggestions.filter((suggestion: Suggestion) => {
    switch (activeTab) {
      case "pending":
        return suggestion.status === "submitted" || suggestion.status === "under_review" || suggestion.status === "needs_clarification";
      case "in-progress":
        return suggestion.status === "in_progress";
      case "completed":
        return suggestion.status === "completed";
      case "mine":
        return suggestion.submittedBy === currentUser?.id;
      default:
        return true;
    }
  });

  const onSubmitSuggestion = (data: SuggestionFormData) => {
    submitSuggestionMutation.mutate(data);
  };

  const onSubmitResponse = (data: ResponseFormData) => {
    if (selectedSuggestion) {
      submitResponseMutation.mutate({ suggestionId: selectedSuggestion.id, data });
      responseForm.reset();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      case "under_review": return <Eye className="h-4 w-4 text-purple-600" />;
      case "needs_clarification": return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case "on_hold": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Star className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!hasPermission(currentUser, 'view_suggestions')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-gray-400" />
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              You need permission to view the suggestions portal.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suggestions Portal</h1>
          <p className="text-gray-600">Share ideas and feedback to improve our operations</p>
        </div>
        {canSubmit && hasPermission(currentUser, 'submit_suggestions') && (
          <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Suggestion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit a New Suggestion</DialogTitle>
                <DialogDescription>
                  Share your ideas for improving our operations, processes, or services.
                </DialogDescription>
              </DialogHeader>
              <Form {...suggestionForm}>
                <form onSubmit={suggestionForm.handleSubmit(onSubmitSuggestion)} className="space-y-4">
                  <FormField
                    control={suggestionForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of your suggestion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suggestionForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detailed description of your suggestion, including benefits and implementation ideas"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={suggestionForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="operations">Operations</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="volunteer_experience">Volunteer Experience</SelectItem>
                              <SelectItem value="communication">Communication</SelectItem>
                              <SelectItem value="training">Training</SelectItem>
                              <SelectItem value="logistics">Logistics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={suggestionForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={suggestionForm.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Submit Anonymously</FormLabel>
                          <FormDescription>
                            Your name will not be shown with this suggestion
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowSubmissionForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitSuggestionMutation.isPending}>
                      {submitSuggestionMutation.isPending ? "Submitting..." : "Submit Suggestion"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${canSubmit && hasPermission(currentUser, 'submit_suggestions') ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="all">All Suggestions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          {canSubmit && hasPermission(currentUser, 'submit_suggestions') && (
            <TabsTrigger value="mine">My Suggestions</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No suggestions found in this category.</p>
                {canSubmit && hasPermission(currentUser, 'submit_suggestions') && activeTab === "mine" && (
                  <Button className="mt-4" onClick={() => setShowSubmissionForm(true)}>
                    Submit Your First Suggestion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestion: Suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <CardTitle className="text-lg hover:text-teal-600 transition-colors">
                          {suggestion.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          {suggestion.description.length > 120 
                            ? `${suggestion.description.substring(0, 120)}...` 
                            : suggestion.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(suggestion.status)}
                          <span className="text-xs text-gray-600 capitalize">
                            {suggestion.status.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          {suggestion.isAnonymous ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {suggestion.isAnonymous ? "Anonymous" : suggestion.submitterName || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            upvoteMutation.mutate(suggestion.id);
                          }}
                          className="flex items-center space-x-1 h-7 px-2"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{suggestion.upvotes || 0}</span>
                        </Button>
                        <span className="text-xs">{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Quick Action Buttons */}
                    {canManage && hasPermission(currentUser, 'manage_suggestions') && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSuggestionMutation.mutate({ 
                              id: suggestion.id, 
                              updates: { status: 'under_review', assignedTo: currentUser?.id } 
                            });
                          }}
                          disabled={suggestion.status === 'under_review'}
                          className="h-7 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                        >
                          📋 Going to Work
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSuggestionMutation.mutate({ 
                              id: suggestion.id, 
                              updates: { status: 'in_progress', assignedTo: currentUser?.id } 
                            });
                          }}
                          disabled={suggestion.status === 'in_progress'}
                          className="h-7 px-3 text-xs bg-orange-50 hover:bg-orange-100 border-orange-200"
                        >
                          🔄 Working On It
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSuggestionMutation.mutate({ 
                              id: suggestion.id, 
                              updates: { status: 'completed', assignedTo: currentUser?.id } 
                            });
                          }}
                          disabled={suggestion.status === 'completed'}
                          className="h-7 px-3 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                        >
                          ✅ Implemented
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSuggestion(suggestion);
                            setTimeout(() => {
                              updateSuggestionMutation.mutate({ 
                                id: suggestion.id, 
                                updates: { status: 'needs_clarification', assignedTo: currentUser?.id } 
                              });
                              responseForm.setValue('message', 'I need more clarification on this suggestion. Could you please provide more details about what you\'d like to see implemented?');
                            }, 100);
                          }}
                          className="h-7 px-3 text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
                        >
                          ❓ Ask Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
                              deleteSuggestionMutation.mutate(suggestion.id);
                            }
                          }}
                          className="h-7 px-3 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Suggestion Detail Dialog */}
      <Dialog open={!!selectedSuggestion} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader className="pb-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-gray-900 mb-3">
                      {selectedSuggestion.title}
                    </DialogTitle>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedSuggestion.status)}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {selectedSuggestion.status.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge className={getPriorityColor(selectedSuggestion.priority)}>
                        {selectedSuggestion.priority} priority
                      </Badge>
                      <Badge variant="outline">{selectedSuggestion.category}</Badge>
                      <span className="text-sm text-gray-500">
                        Submitted by: {selectedSuggestion.isAnonymous ? "Anonymous" : selectedSuggestion.submitterName || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => upvoteMutation.mutate(selectedSuggestion.id)}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>{selectedSuggestion.upvotes || 0} votes</span>
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 pt-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedSuggestion.description}</p>
                </div>

                {canManage && hasPermission(currentUser, 'manage_suggestions') && (
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-4 text-lg flex items-center">
                      ⚡ Workflow Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => updateSuggestionMutation.mutate({ id: selectedSuggestion.id, updates: { status: 'under_review', assignedTo: currentUser?.id } })}
                        disabled={selectedSuggestion.status === 'under_review'}
                        className="h-12 bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-800 font-medium"
                      >
                        📋 Going to Work on This
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => updateSuggestionMutation.mutate({ id: selectedSuggestion.id, updates: { status: 'in_progress', assignedTo: currentUser?.id } })}
                        disabled={selectedSuggestion.status === 'in_progress'}
                        className="h-12 bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800 font-medium"
                      >
                        🔄 Currently Working on This
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => updateSuggestionMutation.mutate({ id: selectedSuggestion.id, updates: { status: 'completed', assignedTo: currentUser?.id } })}
                        disabled={selectedSuggestion.status === 'completed'}
                        className="h-12 bg-green-100 hover:bg-green-200 border-green-300 text-green-800 font-medium"
                      >
                        ✅ Successfully Implemented
                      </Button>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => {
                          updateSuggestionMutation.mutate({ id: selectedSuggestion.id, updates: { status: 'needs_clarification', assignedTo: currentUser?.id } });
                          responseForm.setValue('message', 'I need more clarification on this suggestion. Could you please provide more details about what you\'d like to see implemented?');
                        }}
                        className="h-12 bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800 font-medium"
                      >
                        ❓ Ask for Clarification
                      </Button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-300">
                      <Button
                        variant="outline"
                        size="default"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
                            deleteSuggestionMutation.mutate(selectedSuggestion.id);
                          }
                        }}
                        className="h-10 px-4 bg-red-100 hover:bg-red-200 border-red-300 text-red-800 font-medium"
                      >
                        🗑️ Delete Suggestion
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Current Status:</span> {selectedSuggestion.status}
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span> {selectedSuggestion.assignedTo || "Unassigned"}
                      </div>
                      <div>
                        <span className="font-medium">Estimated effort:</span> {selectedSuggestion.estimatedEffort || "Not estimated"}
                      </div>
                      <div>
                        <span className="font-medium">Submitted by:</span> {selectedSuggestion.submitterEmail || "Unknown"}
                      </div>
                    </div>
                    {selectedSuggestion.implementationNotes && (
                      <div className="mt-4">
                        <span className="font-medium">Implementation notes:</span>
                        <p className="mt-1 text-gray-700">{selectedSuggestion.implementationNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Responses Section */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Discussion ({responses.length})
                  </h3>
                  
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {responses.map((response: SuggestionResponse) => (
                      <div key={response.id} className={`p-3 rounded-lg ${response.isAdminResponse ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">
                            {response.respondentName || "Unknown"}
                            {response.isAdminResponse && <Badge className="ml-2" variant="secondary">Admin</Badge>}
                            {response.isInternal && <Badge className="ml-2" variant="outline">Internal</Badge>}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(response.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{response.message}</p>
                      </div>
                    ))}
                  </div>

                  {canRespond && hasPermission(currentUser, 'respond_to_suggestions') && (
                    <Form {...responseForm}>
                      <form onSubmit={responseForm.handleSubmit(onSubmitResponse)} className="mt-4 space-y-3">
                        <FormField
                          control={responseForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add a response or ask for clarification..."
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {canManage && (
                          <FormField
                            control={responseForm.control}
                            name="isInternal"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Internal note (visible to admins only)
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        )}
                        <Button type="submit" disabled={submitResponseMutation.isPending} size="sm">
                          {submitResponseMutation.isPending ? "Sending..." : "Send Response"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}