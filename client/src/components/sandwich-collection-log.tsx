import { useQuery, useMutation } from "@tanstack/react-query";
import { Sandwich, Calendar, User, Users, Edit, Trash2, Upload, AlertTriangle, Scan, Square, CheckSquare, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef } from "react";
import type { SandwichCollection, Host } from "@shared/schema";

interface ImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

interface DuplicateAnalysis {
  totalCollections: number;
  duplicateGroups: number;
  totalDuplicateEntries: number;
  suspiciousPatterns: number;
  duplicates: Array<{
    entries: SandwichCollection[];
    count: number;
    keepNewest: SandwichCollection;
    toDelete: SandwichCollection[];
  }>;
  suspiciousEntries: SandwichCollection[];
}

export default function SandwichCollectionLog() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingCollection, setEditingCollection] = useState<SandwichCollection | null>(null);
  const [showDuplicateAnalysis, setShowDuplicateAnalysis] = useState(false);
  const [duplicateAnalysis, setDuplicateAnalysis] = useState<DuplicateAnalysis | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<Set<number>>(new Set());
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [batchEditData, setBatchEditData] = useState({
    hostName: "",
    collectionDate: ""
  });
  const [searchFilters, setSearchFilters] = useState({
    hostName: "",
    collectionDateFrom: "",
    collectionDateTo: "",
    createdAtFrom: "",
    createdAtTo: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editFormData, setEditFormData] = useState({
    collectionDate: "",
    hostName: "",
    individualSandwiches: "",
    groupCollections: ""
  });

  const { data: collections = [], isLoading } = useQuery<SandwichCollection[]>({
    queryKey: ["/api/sandwich-collections"]
  });

  // Filter collections based on search criteria
  const filteredCollections = collections.filter(collection => {
    // Host name filter
    if (searchFilters.hostName && !collection.hostName.toLowerCase().includes(searchFilters.hostName.toLowerCase())) {
      return false;
    }
    
    // Collection date range filter
    if (searchFilters.collectionDateFrom) {
      const collectionDate = new Date(collection.collectionDate);
      const fromDate = new Date(searchFilters.collectionDateFrom);
      if (collectionDate < fromDate) return false;
    }
    
    if (searchFilters.collectionDateTo) {
      const collectionDate = new Date(collection.collectionDate);
      const toDate = new Date(searchFilters.collectionDateTo);
      if (collectionDate > toDate) return false;
    }
    
    // Created at date range filter
    if (searchFilters.createdAtFrom) {
      const createdDate = new Date(collection.submittedAt);
      const fromDate = new Date(searchFilters.createdAtFrom);
      if (createdDate < fromDate) return false;
    }
    
    if (searchFilters.createdAtTo) {
      const createdDate = new Date(collection.submittedAt);
      const toDate = new Date(searchFilters.createdAtTo);
      // Add 23:59:59 to include the entire day
      toDate.setHours(23, 59, 59, 999);
      if (createdDate > toDate) return false;
    }
    
    return true;
  });

  // Fetch active hosts from the database
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ['/api/hosts'],
    queryFn: async () => {
      const response = await fetch('/api/hosts');
      if (!response.ok) throw new Error('Failed to fetch hosts');
      return response.json();
    }
  });

  // Include all hosts (active and inactive) for collection assignment
  const hostOptions = [...hosts.map(host => host.name), "Other"];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSubmittedAt = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' at ' + new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (collection: SandwichCollection) => {
    let groupTotal = 0;
    try {
      // Handle JSON format
      const groupData = JSON.parse(collection.groupCollections || "[]");
      if (Array.isArray(groupData)) {
        groupTotal = groupData.reduce((sum: number, group: any) => sum + (group.sandwichCount || 0), 0);
      }
    } catch (error) {
      // Handle text format like "Marketing Team: 8, Development: 6"
      if (collection.groupCollections && collection.groupCollections !== "[]") {
        const matches = collection.groupCollections.match(/(\d+)/g);
        if (matches) {
          groupTotal = matches.reduce((sum, num) => sum + parseInt(num), 0);
        }
      }
    }
    return collection.individualSandwiches + groupTotal;
  };

  const parseGroupCollections = (groupCollectionsJson: string) => {
    try {
      return JSON.parse(groupCollectionsJson || "[]");
    } catch {
      // Handle text format by converting to array
      if (groupCollectionsJson && groupCollectionsJson !== "[]") {
        const parts = groupCollectionsJson.split(',');
        return parts.map(part => {
          const match = part.match(/([^:]+):\s*(\d+)/);
          if (match) {
            return {
              groupName: match[1].trim(),
              sandwichCount: parseInt(match[2])
            };
          }
          return null;
        }).filter(item => item !== null);
      }
      return [];
    }
  };

  // Mutations for update and delete
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/sandwich-collections/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      setEditingCollection(null);
      toast({
        title: "Collection updated",
        description: "Sandwich collection has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update collection. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sandwich-collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      toast({
        title: "Collection deleted",
        description: "Sandwich collection has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete collection. Please try again.",
        variant: "destructive",
      });
    }
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/import-collections', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json() as Promise<ImportResult>;
    },
    onSuccess: (result: ImportResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      toast({
        title: "Import completed",
        description: `Successfully imported ${result.successCount} of ${result.totalRecords} records.`,
      });
      if (result.errorCount > 0) {
        console.log("Import errors:", result.errors);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import CSV file",
        variant: "destructive",
      });
    }
  });

  const analyzeDuplicatesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/sandwich-collections/analyze-duplicates");
      return response.json() as Promise<DuplicateAnalysis>;
    },
    onSuccess: (result: DuplicateAnalysis) => {
      setDuplicateAnalysis(result);
      setShowDuplicateAnalysis(true);
      toast({
        title: "Analysis complete",
        description: `Found ${result.totalDuplicateEntries} duplicate entries and ${result.suspiciousPatterns} suspicious patterns.`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Failed to analyze duplicates. Please try again.",
        variant: "destructive",
      });
    }
  });

  const cleanDuplicatesMutation = useMutation({
    mutationFn: async (mode: 'exact' | 'suspicious') => {
      const response = await apiRequest("/api/sandwich-collections/clean-duplicates", {
        method: "DELETE",
        body: JSON.stringify({ mode })
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      setShowDuplicateAnalysis(false);
      setDuplicateAnalysis(null);
      toast({
        title: "Cleanup completed",
        description: `Successfully cleaned ${result.deletedCount} duplicate entries.`,
      });
    },
    onError: () => {
      toast({
        title: "Cleanup failed",
        description: "Failed to clean duplicates. Please try again.",
        variant: "destructive",
      });
    }
  });

  const batchEditMutation = useMutation({
    mutationFn: async (data: { ids: number[], updates: Partial<SandwichCollection> }) => {
      const response = await apiRequest("/api/sandwich-collections/batch-edit", {
        method: "PATCH",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      setSelectedCollections(new Set());
      setShowBatchEdit(false);
      setBatchEditData({ hostName: "", collectionDate: "" });
      toast({
        title: "Batch edit completed",
        description: `Successfully updated ${result.updatedCount} collections.`,
      });
    },
    onError: () => {
      toast({
        title: "Batch edit failed",
        description: "Failed to update collections. Please try again.",
        variant: "destructive",
      });
    }
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest("/api/sandwich-collections/batch-delete", {
        method: "DELETE",
        body: JSON.stringify({ ids })
      });
      return response.json();
    },
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      setSelectedCollections(new Set());
      toast({
        title: "Batch delete completed",
        description: `Successfully deleted ${result.deletedCount} collections.`,
      });
    },
    onError: () => {
      toast({
        title: "Batch delete failed",
        description: "Failed to delete collections. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      importMutation.mutate(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCollections(new Set(filteredCollections.map(c => c.id)));
    } else {
      setSelectedCollections(new Set());
    }
  };

  const handleSelectCollection = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedCollections);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedCollections(newSelected);
  };

  const handleBatchEdit = () => {
    if (selectedCollections.size === 0) {
      toast({
        title: "No collections selected",
        description: "Please select collections to edit.",
        variant: "destructive",
      });
      return;
    }
    setShowBatchEdit(true);
  };

  const submitBatchEdit = () => {
    const updates: Partial<SandwichCollection> = {};
    if (batchEditData.hostName) updates.hostName = batchEditData.hostName;
    if (batchEditData.collectionDate) updates.collectionDate = batchEditData.collectionDate;

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No changes specified",
        description: "Please specify at least one field to update.",
        variant: "destructive",
      });
      return;
    }

    batchEditMutation.mutate({
      ids: Array.from(selectedCollections),
      updates
    });
  };

  const handleBatchDelete = () => {
    if (selectedCollections.size === 0) {
      toast({
        title: "No collections selected",
        description: "Please select collections to delete.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedCollections.size} selected collections? This action cannot be undone.`)) {
      batchDeleteMutation.mutate(Array.from(selectedCollections));
    }
  };

  const handleEdit = (collection: SandwichCollection) => {
    setEditingCollection(collection);
    setEditFormData({
      collectionDate: collection.collectionDate,
      hostName: collection.hostName,
      individualSandwiches: collection.individualSandwiches.toString(),
      groupCollections: collection.groupCollections
    });
  };

  const handleUpdate = () => {
    if (!editingCollection) return;
    
    updateMutation.mutate({
      id: editingCollection.id,
      updates: {
        collectionDate: editFormData.collectionDate,
        hostName: editFormData.hostName,
        individualSandwiches: parseInt(editFormData.individualSandwiches) || 0,
        groupCollections: editFormData.groupCollections
      }
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Sandwich className="text-amber-500 mr-2 w-5 h-5" />
              Collection Log
            </h2>
            <p className="text-sm text-slate-500 mt-1">{collections.length} total entries</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
            {selectedCollections.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchEdit}
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit ({selectedCollections.size})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedCollections.size})
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzeDuplicatesMutation.mutate()}
              disabled={analyzeDuplicatesMutation.isPending}
              className="flex items-center"
            >
              <Scan className="w-4 h-4 mr-2" />
              {analyzeDuplicatesMutation.isPending ? "Analyzing..." : "Check Duplicates"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              {importMutation.isPending ? "Importing..." : "Import CSV"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="hostFilter" className="text-sm font-medium text-slate-700">Host/Location Name</Label>
              <Input
                id="hostFilter"
                placeholder="Search by host name..."
                value={searchFilters.hostName}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, hostName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="collectionFromDate" className="text-sm font-medium text-slate-700">Collection Date From</Label>
              <Input
                id="collectionFromDate"
                type="date"
                value={searchFilters.collectionDateFrom}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, collectionDateFrom: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="collectionToDate" className="text-sm font-medium text-slate-700">Collection Date To</Label>
              <Input
                id="collectionToDate"
                type="date"
                value={searchFilters.collectionDateTo}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, collectionDateTo: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="createdFromDate" className="text-sm font-medium text-slate-700">Created Date From</Label>
              <Input
                id="createdFromDate"
                type="date"
                value={searchFilters.createdAtFrom}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, createdAtFrom: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="createdToDate" className="text-sm font-medium text-slate-700">Created Date To</Label>
              <Input
                id="createdToDate"
                type="date"
                value={searchFilters.createdAtTo}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, createdAtTo: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-600">
              Showing {filteredCollections.length} of {collections.length} entries
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchFilters({
                hostName: "",
                collectionDateFrom: "",
                collectionDateTo: "",
                createdAtFrom: "",
                createdAtTo: ""
              })}
              className="flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </Button>
          </div>
        </div>
      )}
      <div className="p-6">
        {filteredCollections.length > 0 && (
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-200">
            <button
              onClick={() => handleSelectAll(!selectedCollections.size || selectedCollections.size < filteredCollections.length)}
              className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
            >
              {selectedCollections.size === filteredCollections.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All</span>
            </button>
            {selectedCollections.size > 0 && (
              <span className="text-sm text-slate-500">
                {selectedCollections.size} of {collections.length} selected
              </span>
            )}
          </div>
        )}
        <div className="space-y-4">
          {filteredCollections.map((collection) => {
            const groupData = parseGroupCollections(collection.groupCollections);
            const totalSandwiches = calculateTotal(collection);
            const isSelected = selectedCollections.has(collection.id);

            return (
              <div key={collection.id} className={`border border-slate-200 rounded-lg p-4 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleSelectCollection(collection.id, !isSelected)}
                      className="flex items-center"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                    <div className="flex items-center text-slate-700">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="font-medium">{formatDate(collection.collectionDate)}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <User className="w-4 h-4 mr-1" />
                      <span>{collection.hostName}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right mr-3">
                      <div className="text-lg font-semibold text-slate-900">{totalSandwiches}</div>
                      <div className="text-xs text-slate-500">total sandwiches</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(collection)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(collection.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Individual Collections */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Individual Collections</span>
                      <span className="text-sm font-semibold text-slate-900">{collection.individualSandwiches}</span>
                    </div>
                  </div>

                  {/* Group Collections */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Group Collections</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {Array.isArray(groupData) 
                          ? groupData.reduce((sum: number, group: any) => sum + (group.sandwichCount || 0), 0)
                          : 0}
                      </span>
                    </div>
                    {Array.isArray(groupData) && groupData.length > 0 && (
                      <div className="space-y-1">
                        {groupData.map((group: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {group.groupName}
                            </span>
                            <span className="text-slate-700 font-medium">{group.sandwichCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!Array.isArray(groupData) || groupData.length === 0) && (
                      <div className="text-xs text-slate-500">No group collections</div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Submitted {formatSubmittedAt(collection.submittedAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {collections.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No collection entries found. Use the form above to record sandwich collections.
            </div>
          )}

          {collections.length > 0 && filteredCollections.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No entries match the current filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Analysis Modal */}
      <Dialog open={showDuplicateAnalysis} onOpenChange={setShowDuplicateAnalysis}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
              Duplicate Analysis Results
            </DialogTitle>
          </DialogHeader>
          {duplicateAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{duplicateAnalysis.totalCollections}</div>
                  <div className="text-sm text-slate-600">Total Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{duplicateAnalysis.totalDuplicateEntries}</div>
                  <div className="text-sm text-slate-600">Duplicate Entries</div>
                </div>
              </div>

              {duplicateAnalysis.totalDuplicateEntries > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Exact Duplicates</h3>
                  {duplicateAnalysis.duplicates.map((group, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{group.entries[0].hostName} - {group.entries[0].collectionDate}</span>
                        <span className="text-sm text-slate-600">{group.count} entries</span>
                      </div>
                      <div className="text-sm text-slate-600">
                        Will keep newest entry (ID: {group.keepNewest.id}) and remove {group.toDelete.length} duplicates
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {duplicateAnalysis.suspiciousPatterns > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Suspicious Patterns ({duplicateAnalysis.suspiciousPatterns})</h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {duplicateAnalysis.suspiciousEntries.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="text-sm text-slate-600 border-l-2 border-amber-300 pl-2">
                        {entry.hostName} - {entry.collectionDate} (ID: {entry.id})
                      </div>
                    ))}
                    {duplicateAnalysis.suspiciousEntries.length > 10 && (
                      <div className="text-sm text-slate-500">... and {duplicateAnalysis.suspiciousEntries.length - 10} more</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDuplicateAnalysis(false)}>
                  Cancel
                </Button>
                {duplicateAnalysis.suspiciousPatterns > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => cleanDuplicatesMutation.mutate('suspicious')}
                    disabled={cleanDuplicatesMutation.isPending}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    Clean Suspicious ({duplicateAnalysis.suspiciousPatterns})
                  </Button>
                )}
                {duplicateAnalysis.totalDuplicateEntries > 0 && (
                  <Button 
                    onClick={() => cleanDuplicatesMutation.mutate('exact')}
                    disabled={cleanDuplicatesMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {cleanDuplicatesMutation.isPending ? "Cleaning..." : `Clean Duplicates (${duplicateAnalysis.totalDuplicateEntries})`}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingCollection} onOpenChange={(open) => !open && setEditingCollection(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-date">Collection Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.collectionDate}
                onChange={(e) => setEditFormData({ ...editFormData, collectionDate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-host">Host Name</Label>
              <Select value={editFormData.hostName} onValueChange={(value) => setEditFormData({ ...editFormData, hostName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select host" />
                </SelectTrigger>
                <SelectContent>
                  {hostOptions.map((host) => (
                    <SelectItem key={host} value={host}>{host}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-individual">Individual Sandwiches</Label>
              <Input
                id="edit-individual"
                type="number"
                min="0"
                value={editFormData.individualSandwiches}
                onChange={(e) => setEditFormData({ ...editFormData, individualSandwiches: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-groups">Group Collections (JSON format)</Label>
              <Input
                id="edit-groups"
                value={editFormData.groupCollections}
                onChange={(e) => setEditFormData({ ...editFormData, groupCollections: e.target.value })}
                placeholder='[{"groupName": "Youth Group", "sandwichCount": 100}]'
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingCollection(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Collection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Edit Modal */}
      <Dialog open={showBatchEdit} onOpenChange={setShowBatchEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Batch Edit Collections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Editing {selectedCollections.size} selected collections. Leave fields empty to keep existing values.
            </p>
            
            <div>
              <Label htmlFor="batch-date">Collection Date</Label>
              <Input
                id="batch-date"
                type="date"
                value={batchEditData.collectionDate}
                onChange={(e) => setBatchEditData({ ...batchEditData, collectionDate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="batch-host">Host Name</Label>
              <Select value={batchEditData.hostName} onValueChange={(value) => setBatchEditData({ ...batchEditData, hostName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select host (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {hostOptions.map((host) => (
                    <SelectItem key={host} value={host}>{host}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowBatchEdit(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitBatchEdit}
                disabled={batchEditMutation.isPending}
              >
                {batchEditMutation.isPending ? "Updating..." : "Update Collections"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}