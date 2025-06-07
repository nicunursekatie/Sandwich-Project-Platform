import { useQuery, useMutation } from "@tanstack/react-query";
import { Sandwich, Calendar, User, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { SandwichCollection } from "@shared/schema";

export default function SandwichCollectionLog() {
  const { toast } = useToast();
  const [editingCollection, setEditingCollection] = useState<SandwichCollection | null>(null);
  const [editFormData, setEditFormData] = useState({
    collectionDate: "",
    hostName: "",
    individualSandwiches: "",
    groupCollections: ""
  });

  const { data: collections = [], isLoading } = useQuery<SandwichCollection[]>({
    queryKey: ["/api/sandwich-collections"]
  });

  // Collection host names for the dropdown
  const hostOptions = [
    "Alex Thompson",
    "Maria Gonzalez", 
    "David Kim",
    "Rachel Williams",
    "James Anderson",
    "Other"
  ];

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
      const groupData = JSON.parse(collection.groupCollections || "[]");
      if (Array.isArray(groupData)) {
        groupTotal = groupData.reduce((sum: number, group: any) => sum + (group.sandwichCount || 0), 0);
      }
    } catch (error) {
      // If parsing fails, treat as 0
      groupTotal = 0;
    }
    return collection.individualSandwiches + groupTotal;
  };

  const parseGroupCollections = (groupCollectionsJson: string) => {
    try {
      return JSON.parse(groupCollectionsJson || "[]");
    } catch {
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
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Sandwich className="text-amber-500 mr-2 w-5 h-5" />
          Collection Log
        </h2>
        <p className="text-sm text-slate-500 mt-1">{collections.length} total entries</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {collections.map((collection) => {
            const groupData = parseGroupCollections(collection.groupCollections);
            const totalSandwiches = calculateTotal(collection);

            return (
              <div key={collection.id} className="border border-slate-200 rounded-lg p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
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
        </div>
      </div>

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
    </div>
  );
}