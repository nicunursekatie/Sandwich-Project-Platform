import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GroupCollection {
  id: string;
  groupName: string;
  sandwichCount: number;
}

export default function SandwichCollectionForm() {
  const { toast } = useToast();
  const [collectionDate, setCollectionDate] = useState("");
  const [hostName, setHostName] = useState("");
  const [individualSandwiches, setIndividualSandwiches] = useState("");
  const [groupCollections, setGroupCollections] = useState<GroupCollection[]>([
    { id: "1", groupName: "", sandwichCount: 0 }
  ]);

  // Common host names for the dropdown
  const hostOptions = [
    "Sarah Chen",
    "Mike Rodriguez", 
    "Jessica Park",
    "John Doe",
    "Other"
  ];

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
      setCollectionDate("");
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
              <Label htmlFor="host-name" className="block text-sm font-medium text-slate-700 mb-1">
                Host Name *
              </Label>
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