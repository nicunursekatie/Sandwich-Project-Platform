import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Host } from "@shared/schema";

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

  // Fetch active hosts from the database
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ['/api/hosts'],
    queryFn: async () => {
      const response = await fetch('/api/hosts');
      if (!response.ok) throw new Error('Failed to fetch hosts');
      return response.json();
    }
  });

  // Filter active hosts and add "Other" option
  const activeHosts = hosts.filter(host => host.status === "active");
  const hostOptions = [...activeHosts.map(host => host.name), "Other"];

  const submitCollectionMutation = useMutation({
    mutationFn: async (data: {
      collectionDate: string;
      hostName: string;
      individualSandwiches: number;
      groupCollections: string;
    }) => {
      const response = await apiRequest('POST', '/api/sandwich-collections', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sandwich-collections'] });
      // Reset form
      setHostName("");
      setIndividualSandwiches("");
      setGroupCollections([{ id: "1", groupName: "", sandwichCount: 0 }]);
      toast({
        title: "Collection submitted",
        description: "Sandwich collection has been logged successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit collection. Please try again.",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    const validGroupCollections = groupCollections.filter(g => g.groupName.trim() && g.sandwichCount > 0);
    const groupCollectionsString = validGroupCollections.length > 0 
      ? validGroupCollections.map(g => `${g.groupName}: ${g.sandwichCount}`).join(', ')
      : '';

    submitCollectionMutation.mutate({
      collectionDate,
      hostName,
      individualSandwiches: parseInt(individualSandwiches),
      groupCollections: groupCollectionsString
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Sandwich className="text-amber-500 mr-2 w-5 h-5" />
          Submit Collection
        </h2>
        <p className="text-sm text-slate-500 mt-1">Log a new sandwich collection for tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="collectionDate">Collection Date</Label>
            <Input
              id="collectionDate"
              type="date"
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostName">Host Name</Label>
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

        <div className="space-y-2">
          <Label htmlFor="individualSandwiches">Individual Sandwiches</Label>
          <Input
            id="individualSandwiches"
            type="number"
            min="0"
            value={individualSandwiches}
            onChange={(e) => setIndividualSandwiches(e.target.value)}
            placeholder="Number of individual sandwiches"
            required
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Group Collections (Optional)</Label>
            <Button type="button" variant="outline" size="sm" onClick={addGroupRow}>
              <Plus className="w-4 h-4 mr-1" />
              Add Group
            </Button>
          </div>
          
          <div className="space-y-3">
            {groupCollections.map((group) => (
              <div key={group.id} className="flex gap-3 items-center">
                <Input
                  placeholder="Group name"
                  value={group.groupName}
                  onChange={(e) => updateGroupCollection(group.id, "groupName", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Count"
                  value={group.sandwichCount || ""}
                  onChange={(e) => updateGroupCollection(group.id, "sandwichCount", parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                {groupCollections.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGroupRow(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={submitCollectionMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitCollectionMutation.isPending ? "Submitting..." : "Submit Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}