import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, HelpCircle } from "lucide-react";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompactCollectionFormProps {
  onSuccess?: () => void;
}

export default function CompactCollectionForm({
  onSuccess,
}: CompactCollectionFormProps) {
  // Get today's date in user's local timezone
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
  const [date, setDate] = useState(localDate.toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [individualCount, setIndividualCount] = useState(0);
  const [groupCollections, setGroupCollections] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCount, setNewGroupCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allHosts = [] } = useQuery<any[]>({
    queryKey: ["/api/hosts"],
  });

  // Filter to only show active hosts
  const hosts = allHosts.filter((host: any) => host.status === 'active');

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/sandwich-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Collection submitted successfully!" });
      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections"],
      });
      onSuccess?.();
      // Reset form
      setIndividualCount(0);
      setGroupCollections([]);
      setLocation("");
    },
    onError: () => {
      toast({ title: "Failed to submit collection", variant: "destructive" });
    },
  });

  const totalSandwiches =
    individualCount +
    groupCollections.reduce((sum, group) => sum + group.count, 0);

  const addGroup = () => {
    if (newGroupName && newGroupCount > 0) {
      setGroupCollections([
        ...groupCollections,
        { name: newGroupName, count: newGroupCount },
      ]);
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
      groupCollections:
        groupCollections.length > 0 ? groupCollections : undefined,
      totalSandwiches,
    });
  };

  return (
    <TooltipProvider>
      <div className="max-w-sm mx-auto bg-white">
      {/* Compact header */}
      <div className="bg-gradient-to-r from-[#236383] to-[#007E8C] text-white text-center py-4 px-4">
        <h1 className="text-lg sm:text-base font-semibold mb-1">Submit Collection</h1>
        <p className="text-base sm:text-sm opacity-90">
          Record a sandwich collection log
        </p>
      </div>

      {/* Compact form sections */}
      <div className="p-3 space-y-3">
        {/* Date and Location in same row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-sm sm:text-xs font-medium text-[#236383]">
                Date
              </label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 sm:h-3 sm:w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose the day you collected or received the sandwiches</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 sm:h-8 text-base sm:text-sm"
            />
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <label className="text-sm sm:text-xs font-medium text-[#236383]">
                Location
              </label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 sm:h-3 sm:w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select where the sandwiches were collected or distributed</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="h-10 sm:h-8 text-base sm:text-sm">
                <SelectValue placeholder="Choose location..." />
              </SelectTrigger>
              <SelectContent>
                {hosts.map((host: any) => (
                  <SelectItem key={host.id} value={host.name}>
                    {host.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Individual sandwiches - compact row */}
        <div className="bg-gray-50 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <label className="text-sm sm:text-xs font-medium text-[#236383]">
              Individual Sandwiches
            </label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 sm:h-3 sm:w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Please subtract sandwiches made by a group from your total count and report those along with the name of each group in the section below.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={individualCount}
              onChange={(e) => setIndividualCount(Number(e.target.value) || 0)}
              className="h-10 sm:h-8 text-base sm:text-sm flex-1"
              placeholder="Enter number (e.g. 15)"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 px-2">
                  <Calculator className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Need help counting? Use this calculator</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm sm:text-xs text-gray-600 mt-1">
            Don't include group totals
          </p>
        </div>

        {/* Group collections - redesigned with better flow */}
        <div className="bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <label className="text-base sm:text-sm font-medium text-[#236383]">
                Group Collections
              </label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 sm:h-3 sm:w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add groups that brought sandwiches (like "Church Group: 50" or "School Class: 25")</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={addGroup}
                  size="sm"
                  className="h-5 w-5 p-0 bg-[#47B3CB] hover:bg-[#236383] rounded-md shadow-sm"
                >
                  <Plus className="h-2 w-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to add the group you entered above</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Add group form - stacked layout */}
          <div className="space-y-2 mb-3">
            <Input
              placeholder="e.g. 'Smith Family'"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="h-10 sm:h-8 text-base sm:text-sm"
            />
            <Input
              type="number"
              placeholder="Enter count (e.g. 25)"
              value={newGroupCount || ""}
              onChange={(e) => setNewGroupCount(Number(e.target.value) || 0)}
              className="h-10 sm:h-8 text-base sm:text-sm"
            />
          </div>

          {/* Group list - card style with proper hierarchy */}
          {groupCollections.length === 0 ? (
            <p className="text-base sm:text-sm text-gray-500 italic text-center py-2">
              No groups added
            </p>
          ) : (
            <div className="space-y-2">
              {groupCollections.map((group, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                >
                  <div className="text-base sm:text-sm font-medium text-[#236383] mb-1">
                    {group.name}
                  </div>
                  <div className="text-2xl sm:text-xl font-bold text-gray-800">
                    {group.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit button - compact */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="flex-1 h-12 sm:h-10 bg-gradient-to-r from-[#FBAD3F] to-[#e89b2e] hover:from-[#e89b2e] hover:to-[#FBAD3F] text-white font-semibold text-lg sm:text-base"
          >
            {submitMutation.isPending ? "Saving..." : "Save My Collection"}
          </Button>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to save your sandwich count. You can always edit or delete it after saving or add another entry for more sandwiches/more groups.</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Total counter moved to bottom */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-sm font-medium text-[#236383]">Total Sandwiches:</span>
            <span className="text-2xl sm:text-xl font-bold text-[#FBAD3F]">{totalSandwiches}</span>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
