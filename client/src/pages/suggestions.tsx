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
import { 
  Lightbulb, 
  Plus, 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  EyeOff, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Filter,
  Search,
  ArrowUpRight,
  User,
  Calendar,
  AlertTriangle,
  Trash2,
  Send,
  Mail
} from "lucide-react";
import { hasPermission } from "@shared/auth-utils";
import { MessageComposer } from "@/components/message-composer";
import { useMessaging } from "@/hooks/useMessaging";

// Schema for suggestion form
const suggestionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be under 2000 characters"),
  category: z.string().default("general"),
  priority: z.string().default("medium"),
  isAnonymous: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

type SuggestionFormData = z.infer<typeof suggestionSchema>;

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
  const [showClarificationDialog, setShowClarificationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
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

  // Fetch suggestions
  const { data: suggestions = [], isLoading } = useQuery<Suggestion[]>({
    queryKey: ['/api/suggestions'],
    enabled: hasPermission(currentUser, 'view_suggestions'),
    staleTime: 0
  });

  // Update selected suggestion when suggestions data changes
  useEffect(() => {
    if (selectedSuggestion && suggestions.length > 0) {
      const updatedSuggestion = suggestions.find((s: Suggestion) => s.id === selectedSuggestion.id);
      if (updatedSuggestion) {
        setSelectedSuggestion(updatedSuggestion);
      }
    }
  }, [suggestions, selectedSuggestion]);

  // Submit suggestion mutation
  const submitSuggestionMutation = useMutation({
    mutationFn: (data: SuggestionFormData) => {
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

  // Update suggestion mutation (admin only)
  const updateSuggestionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Suggestion> }) => 
      apiRequest('PATCH', `/api/suggestions/${id}`, updates),
    onSuccess: (updatedSuggestion) => {
      if (selectedSuggestion && updatedSuggestion) {
        setSelectedSuggestion({ ...selectedSuggestion, ...updatedSuggestion });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
      queryClient.refetchQueries({ queryKey: ['/api/suggestions'] });
      toast({
        title: "Success",
        description: "Suggestion updated successfully!"
      });
    },
    onError: (error) => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/suggestions'] });
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


  // Enhanced filtering logic
  const filteredSuggestions = (suggestions as Suggestion[]).filter((suggestion: Suggestion) => {
    // Tab filter
    let tabMatch = true;
    switch (activeTab) {
      case "pending":
        tabMatch = suggestion.status === "submitted" || suggestion.status === "under_review" || suggestion.status === "needs_clarification";
        break;
      case "in-progress":
        tabMatch = suggestion.status === "in_progress";
        break;
      case "completed":
        tabMatch = suggestion.status === "completed";
        break;
      case "mine":
        tabMatch = suggestion.submittedBy === currentUser?.id;
        break;
      default:
        tabMatch = true;
    }

    // Search filter
    const searchMatch = searchQuery === "" || 
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const categoryMatch = selectedCategory === "all" || suggestion.category === selectedCategory;

    // Priority filter
    const priorityMatch = selectedPriority === "all" || suggestion.priority === selectedPriority;

    return tabMatch && searchMatch && categoryMatch && priorityMatch;
  });

  const onSubmitSuggestion = (data: SuggestionFormData) => {
    submitSuggestionMutation.mutate(data);
  };


  const handleRequestClarification = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowClarificationDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-700 border-red-200";
      case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
      case "low": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed": 
        return { 
          icon: <CheckCircle className="h-4 w-4" />, 
          color: "text-green-600",
          bg: "bg-green-50",
          label: "Completed"
        };
      case "in_progress": 
        return { 
          icon: <Clock className="h-4 w-4" />, 
          color: "text-blue-600",
          bg: "bg-blue-50",
          label: "In Progress"
        };
      case "under_review": 
        return { 
          icon: <Eye className="h-4 w-4" />, 
          color: "text-purple-600",
          bg: "bg-purple-50",
          label: "Under Review"
        };
      case "needs_clarification": 
        return { 
          icon: <MessageSquare className="h-4 w-4" />, 
          color: "text-orange-600",
          bg: "bg-orange-50",
          label: "Needs Clarification"
        };
      case "on_hold": 
        return { 
          icon: <Pause className="h-4 w-4" />, 
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          label: "On Hold"
        };
      case "rejected": 
        return { 
          icon: <XCircle className="h-4 w-4" />, 
          color: "text-red-600",
          bg: "bg-red-50",
          label: "Rejected"
        };
      default: 
        return { 
          icon: <Star className="h-4 w-4" />, 
          color: "text-gray-600",
          bg: "bg-gray-50",
          label: "Submitted"
        };
    }
  };

  const getTabCounts = () => {
    const suggestionList = suggestions as Suggestion[];
    return {
      all: suggestionList.length,
      pending: suggestionList.filter(s => ["submitted", "under_review", "needs_clarification"].includes(s.status)).length,
      inProgress: suggestionList.filter(s => s.status === "in_progress").length,
      completed: suggestionList.filter(s => s.status === "completed").length,
      mine: suggestionList.filter(s => s.submittedBy === currentUser?.id).length
    };
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

  const tabCounts = getTabCounts();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section - Mobile responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <span className="truncate">Suggestions Portal</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Share ideas and feedback to improve our operations</p>
          <p className="text-sm sm:text-base text-gray-700 mt-2 leading-relaxed">
            If you need something to work differently, if something is confusing to you, you have tips on how we could better arrange this whole site, or if you run into a bug, please submit your feedback here so we can get this where it serves your needs the best it possibly can!
          </p>
        </div>
        {canSubmit && hasPermission(currentUser, 'submit_suggestions') && (
          <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
            <DialogTrigger asChild>
              <Button size="sm" className="shadow-sm w-full sm:w-auto sm:size-lg">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Submit Suggestion</span>
                <span className="sm:hidden">Submit</span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Search and Filter Section - Mobile responsive */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search suggestions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 h-10 sm:h-11 justify-center"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {(selectedCategory !== "all" || selectedPriority !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {[selectedCategory !== "all" ? 1 : 0, selectedPriority !== "all" ? 1 : 0].reduce((a, b) => a + b)}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
              <div className="min-w-0 flex-1 sm:min-w-[200px]">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="volunteer_experience">Volunteer Experience</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 flex-1 sm:min-w-[150px]">
                <Label className="text-sm font-medium">Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(selectedCategory !== "all" || selectedPriority !== "all") && (
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedPriority("all");
                    }}
                    className="text-sm w-full sm:w-auto"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs with Counts - Mobile responsive */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${canSubmit && hasPermission(currentUser, 'submit_suggestions') ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'} gap-1`}>
          <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">All</span>
            <span className="sm:hidden">All</span>
            <Badge className="bg-[#FBAD3F] text-white hover:bg-[#f09f2b] text-xs">{tabCounts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">Pending</span>
            <span className="sm:hidden">New</span>
            <Badge className="bg-[#FBAD3F] text-white hover:bg-[#f09f2b] text-xs">{tabCounts.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">Active</span>
            <span className="sm:hidden">Active</span>
            <Badge className="bg-[#FBAD3F] text-white hover:bg-[#f09f2b] text-xs">{tabCounts.inProgress}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <span className="hidden sm:inline">Done</span>
            <span className="sm:hidden">Done</span>
            <Badge className="bg-[#FBAD3F] text-white hover:bg-[#f09f2b] text-xs">{tabCounts.completed}</Badge>
          </TabsTrigger>
          {canSubmit && hasPermission(currentUser, 'submit_suggestions') && (
            <TabsTrigger value="mine" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Mine</span>
              <span className="sm:hidden">Mine</span>
              <Badge className="bg-[#FBAD3F] text-white hover:bg-[#f09f2b] text-xs">{tabCounts.mine}</Badge>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="text-center py-12">
                <Lightbulb className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== "all" || selectedPriority !== "all" 
                    ? "No suggestions match your filters" 
                    : "No suggestions found"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === "mine" && canSubmit && hasPermission(currentUser, 'submit_suggestions')
                    ? "You haven't submitted any suggestions yet." 
                    : searchQuery || selectedCategory !== "all" || selectedPriority !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to share an idea for improvement."}
                </p>
                {canSubmit && hasPermission(currentUser, 'submit_suggestions') && (activeTab === "mine" || (!searchQuery && selectedCategory === "all" && selectedPriority === "all")) && (
                  <Button onClick={() => setShowSubmissionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Suggestion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredSuggestions.map((suggestion: Suggestion) => {
                const statusConfig = getStatusConfig(suggestion.status);
                return (
                  <Card 
                    key={suggestion.id} 
                    className="hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500 group" 
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => setSelectedSuggestion(suggestion)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig.bg} ${statusConfig.color} border-0 text-xs font-medium`}
                            >
                              {statusConfig.icon}
                              <span className="ml-1">{statusConfig.label}</span>
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`${getPriorityColor(suggestion.priority)} border text-xs`}
                            >
                              {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                            {suggestion.title}
                          </CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {suggestion.description.length > 120 
                              ? `${suggestion.description.substring(0, 120)}...` 
                              : suggestion.description}
                          </CardDescription>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            {suggestion.isAnonymous ? (
                              <>
                                <EyeOff className="h-4 w-4" />
                                <span>Anonymous</span>
                              </>
                            ) : (
                              <>
                                <User className="h-4 w-4" />
                                <span>{suggestion.submitterName || "Unknown"}</span>
                              </>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category.replace('_', ' ')}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              upvoteMutation.mutate(suggestion.id);
                            }}
                            className="flex items-center gap-1 h-8 px-2 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <ThumbsUp className="h-4 w-4" />
                            <span className="font-medium">{suggestion.upvotes || 0}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Admin Actions - Mobile responsive */}
                      {hasPermission(currentUser, 'manage_suggestions') && (
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 sm:justify-start justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSuggestionMutation.mutate({ 
                                id: suggestion.id, 
                                updates: { status: 'under_review', assignedTo: currentUser?.id } 
                              });
                            }}
                            disabled={suggestion.status === 'under_review'}
                            className="h-8 px-3 text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                          >
                            <Eye className="h-3 w-3 mr-1.5" />
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSuggestionMutation.mutate({ 
                                id: suggestion.id, 
                                updates: { status: 'in_progress', assignedTo: currentUser?.id } 
                              });
                            }}
                            disabled={suggestion.status === 'in_progress'}
                            className="h-8 px-3 text-xs text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                          >
                            <Clock className="h-3 w-3 mr-1.5" />
                            In Progress
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateSuggestionMutation.mutate({ 
                                id: suggestion.id, 
                                updates: { status: 'completed', assignedTo: currentUser?.id } 
                              });
                            }}
                            disabled={suggestion.status === 'completed'}
                            className="h-8 px-3 text-xs text-green-700 hover:bg-green-50 hover:text-green-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            Complete
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestClarification(suggestion);
                            }}
                            className="h-8 px-3 text-xs text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                          >
                            <Mail className="h-3 w-3 mr-1.5" />
                            Ask for Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this suggestion? This action cannot be undone.')) {
                                deleteSuggestionMutation.mutate(suggestion.id);
                              }
                            }}
                            className="h-8 px-3 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Suggestion Detail Dialog - Simple view only */}
      <Dialog open={!!selectedSuggestion && !showClarificationDialog} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedSuggestion.title}</DialogTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getPriorityColor(selectedSuggestion.priority)}>
                    {selectedSuggestion.priority} priority
                  </Badge>
                  <Badge variant="outline">{selectedSuggestion.category}</Badge>
                  <span className="text-sm text-gray-500">
                    {selectedSuggestion.isAnonymous ? "Anonymous" : selectedSuggestion.submitterName || "Unknown"}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Submitted: {new Date(selectedSuggestion.createdAt).toLocaleDateString()}</span>
                    <span>Status: {selectedSuggestion.status.replace('_', ' ')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => upvoteMutation.mutate(selectedSuggestion.id)}
                    className="flex items-center space-x-1"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{selectedSuggestion.upvotes || 0}</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Clarification Request Dialog */}
      <Dialog open={showClarificationDialog} onOpenChange={setShowClarificationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Request Clarification
            </DialogTitle>
            <DialogDescription>
              Send a message to {selectedSuggestion?.isAnonymous ? 'the anonymous submitter' : selectedSuggestion?.submitterName} requesting more details about their suggestion.
            </DialogDescription>
          </DialogHeader>

          {selectedSuggestion && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedSuggestion.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{selectedSuggestion.description}</p>
              </div>

              <MessageComposer
                contextType="suggestion"
                contextId={String(selectedSuggestion.id)}
                contextTitle={selectedSuggestion.title}
                defaultRecipients={selectedSuggestion.isAnonymous ? [] : [{
                  id: selectedSuggestion.submittedBy,
                  name: selectedSuggestion.submitterName || 'Unknown'
                }]}
                compact={true}
                onSent={() => {
                  setShowClarificationDialog(false);
                  toast({
                    title: "Clarification Request Sent",
                    description: "The author will be notified and can respond through the messaging system."
                  });
                }}
                onCancel={() => setShowClarificationDialog(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}