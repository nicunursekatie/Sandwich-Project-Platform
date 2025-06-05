import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich, Settings, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GroupCollection {
  id: string;
  groupName: string;
  sandwichCount: number;
}

export default function SandwichCollectionForm() {
  const { toast } = useToast();
  
  // Default to today's date
  const today = new Date().toISOString().split('T')[0];
  const [collectionDate, setCollectionDate] = useState(today);
  const [hostName, setHostName] = useState("");
  const [individualSandwiches, setIndividualSandwiches] = useState("");
  const [groupCollections, setGroupCollections] = useState<GroupCollection[]>([
    { id: "1", groupName: "", sandwichCount: 0 }
  ]);

  // Host management state
  const [hostOptions, setHostOptions] = useState([
    "Sarah Chen",
    "Mike Rodriguez", 
    "Jessica Park",
    "John Doe",
    "Other"
  ]);
  const [isHostManagerOpen, setIsHostManagerOpen] = useState(false);
  const [newHostName, setNewHostName] = useState("");
  const [editingHostIndex, setEditingHostIndex] = useState<number | null>(null);
  const [editingHostValue, setEditingHostValue] = useState("");

  const submitCollectionMutation = useMutation({
    mutationFn: async (data: {
      collectionDate: string;
      hostName: string;
      individualSandwiches: number;
      groupCollections: string;
    }) => {
      const response = await apiRequest("POST", "/api/sandwich-collections", data);
      return response.json();
    },
    onSuccess: () => {
      setCollectionDate(today);
      setHostName("");
      setIndividualSandwiches("");
      setGroupCollections([{ id: "1", groupName: "", sandwichCount: 0 }]);
      queryClient.invalidateQueries({ queryKey: ["/api/sandwich-collections"] });
      toast({
        title: "Collection recorded",
        description: "Sandwich collection has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to record collection",
        description: "Please check your input and try again.",
        variant: "destructive"
      });
    }
  });

  const addGroupRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setGroupCollections([...groupCollections, { id: newId, groupName: "", sandwichCount: 0 }]);
  };

  const removeGroupRow = (id: string) => {
    if (groupCollections.length > 1) {
      setGroupCollections(groupCollections.filter(group => group.id !== id));
    }
  };

  const updateGroupCollection = (id: string, field: keyof GroupCollection, value: string | number) => {
    setGroupCollections(groupCollections.map(group => 
      group.id === id ? { ...group, [field]: value } : group
    ));
  };

  // Host management functions
  const addNewHost = () => {
    if (newHostName.trim() && !hostOptions.includes(newHostName.trim())) {
      setHostOptions([...hostOptions.filter(h => h !== "Other"), newHostName.trim(), "Other"]);
      setNewHostName("");
      toast({
        title: "Host added",
        description: "New host has been added to the list.",
      });
    }
  };

  const startEditingHost = (index: number) => {
    setEditingHostIndex(index);
    setEditingHostValue(hostOptions[index]);
  };

  const saveEditingHost = () => {
    if (editingHostIndex !== null && editingHostValue.trim()) {
      const newOptions = [...hostOptions];
      newOptions[editingHostIndex] = editingHostValue.trim();
      setHostOptions(newOptions);
      setEditingHostIndex(null);
      setEditingHostValue("");
      toast({
        title: "Host updated",
        description: "Host name has been updated.",
      });
    }
  };

  const cancelEditingHost = () => {
    setEditingHostIndex(null);
    setEditingHostValue("");
  };

  const deleteHost = (index: number) => {
    if (hostOptions[index] !== "Other") {
      const newOptions = hostOptions.filter((_, i) => i !== index);
      setHostOptions(newOptions);
      toast({
        title: "Host deleted",
        description: "Host has been removed from the list.",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!collectionDate || !hostName || !individualSandwiches) {
      toast({
        title: "Missing information",
        description: "Please fill in the collection date, host name, and individual sandwiches.",
        variant: "destructive"
      });
      return;
    }

    const individualCount = parseInt(individualSandwiches);
    if (isNaN(individualCount) || individualCount < 0) {
      toast({
        title: "Invalid sandwich count",
        description: "Please enter a valid number for individual sandwiches.",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty group collections and validate
    const validGroupCollections = groupCollections.filter(group => 
      group.groupName.trim() !== "" && group.sandwichCount > 0
    );

    submitCollectionMutation.mutate({
      collectionDate,
      hostName,
      individualSandwiches: individualCount,
      groupCollections: JSON.stringify(validGroupCollections)
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Sandwich className="text-amber-500 mr-2 w-5 h-5" />
          Sandwich Collection Entry
        </h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collection-date" className="block text-sm font-medium text-slate-700 mb-1">
                Collection Date *
              </Label>
              <Input
                id="collection-date"
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="host-name" className="block text-sm font-medium text-slate-700">
                  Host Name *
                </Label>
                <Dialog open={isHostManagerOpen} onOpenChange={setIsHostManagerOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2">
                      <Settings className="w-3 h-3 mr-1" />
                      Manage
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" aria-describedby="manage-hosts-description">
                    <DialogHeader>
                      <DialogTitle>Manage Hosts</DialogTitle>
                    </DialogHeader>
                    <p id="manage-hosts-description" className="text-sm text-slate-600 mb-4">
                      Add, edit, or remove host names from the dropdown list.
                    </p>
                    <div className="space-y-4">
                      {/* Add New Host */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new host name"
                          value={newHostName}
                          onChange={(e) => setNewHostName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addNewHost()}
                        />
                        <Button onClick={addNewHost} disabled={!newHostName.trim()}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Host List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {hostOptions.map((host, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                            {editingHostIndex === index ? (
                              <>
                                <Input
                                  value={editingHostValue}
                                  onChange={(e) => setEditingHostValue(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && saveEditingHost()}
                                  className="flex-1"
                                />
                                <Button size="sm" onClick={saveEditingHost}>
                                  <Settings className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditingHost}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 text-sm">{host}</span>
                                {host !== "Other" && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => startEditingHost(index)}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => deleteHost(index)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={hostName} onValueChange={setHostName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select host" />
                </SelectTrigger>
                <SelectContent>
                  {hostOptions.map((host) => (
                    <SelectItem key={host} value={host}>
                      {host}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Individual Sandwiches */}
          <div>
            <Label htmlFor="individual-sandwiches" className="block text-sm font-medium text-slate-700 mb-1">
              Individual Sandwiches Collected *
            </Label>
            <Input
              id="individual-sandwiches"
              type="number"
              placeholder="0"
              value={individualSandwiches}
              onChange={(e) => setIndividualSandwiches(e.target.value)}
              className="w-full md:w-48"
              min="0"
            />
            <p className="text-xs text-slate-500 mt-1">Sandwiches collected individually (not from groups)</p>
          </div>

          {/* Group Collections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium text-slate-700">
                Group Collections
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGroupRow}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Group
              </Button>
            </div>
            
            <div className="space-y-3">
              {groupCollections.map((group, index) => (
                <div key={group.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Group name (e.g., Youth Group, Book Club)"
                      value={group.groupName}
                      onChange={(e) => updateGroupCollection(group.id, "groupName", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Count"
                      value={group.sandwichCount || ""}
                      onChange={(e) => updateGroupCollection(group.id, "sandwichCount", parseInt(e.target.value) || 0)}
                      className="w-full"
                      min="0"
                    />
                  </div>
                  {groupCollections.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroupRow(group.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Add any groups that contributed sandwiches through this host
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
            disabled={submitCollectionMutation.isPending}
          >
            {submitCollectionMutation.isPending ? "Recording..." : "Record Collection"}
          </Button>
        </form>
      </div>
    </div>
  );
}