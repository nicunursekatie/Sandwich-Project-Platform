import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CompactCollectionFormProps {
  onSuccess?: () => void;
}

export default function CompactCollectionForm({ onSuccess }: CompactCollectionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  const [individualCount, setIndividualCount] = useState(0);
  const [groupCollections, setGroupCollections] = useState<Array<{name: string, count: number}>>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCount, setNewGroupCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hosts = [] } = useQuery<any[]>({
    queryKey: ['/api/hosts'],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/sandwich-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Collection submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/sandwich-collections'] });
      onSuccess?.();
      // Reset form
      setIndividualCount(0);
      setGroupCollections([]);
      setLocation("");
    },
    onError: () => {
      toast({ title: "Failed to submit collection", variant: "destructive" });
    }
  });

  const totalSandwiches = individualCount + groupCollections.reduce((sum, group) => sum + group.count, 0);

  const addGroup = () => {
    if (newGroupName && newGroupCount > 0) {
      setGroupCollections([...groupCollections, { name: newGroupName, count: newGroupCount }]);
      setNewGroupName("");
      setNewGroupCount(0);
    }
  };

  const handleSubmit = () => {
    if (!location) {
      toast({ title: "Please select a location", variant: "destructive" });
      return;
    }
    
    const host = hosts.find((h: any) => h.name === location);
    submitMutation.mutate({
      date,
      hostId: host?.id,
      location,
      individualSandwiches: individualCount,
      groupCollections: groupCollections.length > 0 ? groupCollections : undefined,
      totalSandwiches,
    });
  };

  return (
    <div className="max-w-sm mx-auto bg-white">
      {/* Ultra-compact header */}
      <div className="bg-gradient-to-r from-[#236383] to-[#007E8C] text-white text-center py-2 px-4">
        <h1 className="text-base font-semibold mb-1">Submit Collection</h1>
        <p className="text-xs opacity-90">Record today's distribution</p>
        <div className="bg-gradient-to-r from-[#FBAD3F] to-[#F7931E] rounded px-3 py-1 mt-1 inline-block">
          <div className="text-xs opacity-90">Total</div>
          <div className="text-sm font-bold">{totalSandwiches}</div>
        </div>
      </div>

      {/* Compact form sections */}
      <div className="p-3 space-y-3">
        {/* Date and Location in same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-[#236383] block mb-1">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#236383] block mb-1">Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {hosts.map((host: any) => (
                  <SelectItem key={host.id} value={host.name}>{host.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Individual sandwiches - compact row */}
        <div className="bg-gray-50 rounded p-2">
          <label className="text-xs font-medium text-[#236383] block mb-1">Individual Sandwiches</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={individualCount}
              onChange={(e) => setIndividualCount(Number(e.target.value) || 0)}
              className="h-8 text-sm flex-1"
              placeholder="0"
            />
            <Button size="sm" variant="outline" className="h-8 px-2">
              <Calculator className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-1">Don't include group totals</p>
        </div>

        {/* Group collections - compact */}
        <div className="bg-gray-50 rounded p-2">
          <label className="text-xs font-medium text-[#236383] block mb-1">Group Collections</label>
          
          {/* Add group form - ultra compact */}
          <div className="flex gap-1 mb-2">
            <Input
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="h-7 text-xs flex-1"
            />
            <Input
              type="number"
              placeholder="Count"
              value={newGroupCount || ""}
              onChange={(e) => setNewGroupCount(Number(e.target.value) || 0)}
              className="h-7 text-xs w-16"
            />
            <Button size="sm" onClick={addGroup} className="h-7 px-2">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Group list - very compact */}
          {groupCollections.map((group, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-1 border-b last:border-b-0">
              <span className="font-medium">{group.name}</span>
              <span className="text-[#FBAD3F] font-bold">{group.count}</span>
            </div>
          ))}
          
          {groupCollections.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2 italic">No groups added</p>
          )}
        </div>

        {/* Submit button - compact */}
        <Button 
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full h-10 bg-gradient-to-r from-[#FBAD3F] to-[#e89b2e] hover:from-[#e89b2e] hover:to-[#FBAD3F] text-white font-semibold"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Collection"}
        </Button>
      </div>
    </div>
  );
}