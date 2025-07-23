import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import type { Host } from "@shared/schema";

interface GroupCollection {
  id: string;
  groupName: string;
  sandwichCount: number;
}

interface SandwichCollectionFormProps {
  onSuccess?: () => void;
}

export default function SandwichCollectionForm({ onSuccess }: SandwichCollectionFormProps = {}) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Default to today's date
  const today = new Date().toISOString().split("T")[0];
  const [collectionDate, setCollectionDate] = useState(today);
  const [hostName, setHostName] = useState("");
  const [isCustomHost, setIsCustomHost] = useState(false);
  const [individualSandwiches, setIndividualSandwiches] = useState("");
  const [groupCollections, setGroupCollections] = useState<GroupCollection[]>([
    { id: "1", groupName: "", sandwichCount: 0 },
  ]);


  // Fetch active hosts from the database
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const response = await fetch("/api/hosts");
      if (!response.ok) throw new Error("Failed to fetch hosts");
      return response.json();
    },
  });

  // Only include active hosts in dropdown to reduce clutter
  const activeHosts = hosts.filter(host => host.status === 'active');
  const hostOptions = [...activeHosts.map((host) => host.name).filter(name => name && name.trim() !== ""), "Other"];

  // Mutation for creating new hosts
  const createHostMutation = useMutation({
    mutationFn: async (hostData: {
      name: string;
      address: string;
      phone: string;
      email: string;
      status: string;
    }) => {
      const response = await apiRequest("POST", "/api/hosts", hostData);
      return response.json();
    },
    onSuccess: () => {
      // Refresh all host-related queries to update dropdown and management sections
      queryClient.invalidateQueries({ queryKey: ["/api/hosts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hosts-with-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
    },
  });

  const submitCollectionMutation = useMutation({
    mutationFn: async (data: {
      collectionDate: string;
      hostName: string;
      individualSandwiches: number;
      groupCollections: string;
      createdBy?: string;
      createdByName?: string;
    }) => {
      return await apiRequest(
        "POST",
        "/api/sandwich-collections",
        data,
      );
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hosts"] });

      // Sync to Google Sheets
      try {
        await apiRequest("POST", "/api/google-sheets/sync-entry", {
          collectionData: data
        });
        console.log("Collection synced to Google Sheets");
      } catch (error) {
        console.warn("Google Sheets sync failed:", error);
        // Don't show error to user as the main collection was successful
      }

      // Reset form
      setHostName("");
      setIsCustomHost(false);
      setIndividualSandwiches("");
      setGroupCollections([{ id: "1", groupName: "", sandwichCount: 0 }]);

      toast({
        title: "Collection submitted",
        description: "Sandwich collection has been logged and synced to Google Sheets.",
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit collection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addGroupRow = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setGroupCollections([
      ...groupCollections,
      { id: newId, groupName: "", sandwichCount: 0 },
    ]);
  };

  const removeGroupRow = (id: string) => {
    if (groupCollections.length > 1) {
      setGroupCollections(groupCollections.filter((group) => group.id !== id));
    }
  };

  const updateGroupCollection = (
    id: string,
    field: keyof GroupCollection,
    value: string | number,
  ) => {
    setGroupCollections(
      groupCollections.map((group) =>
        group.id === id ? { ...group, [field]: value } : group,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!collectionDate) {
      toast({
        title: "Missing collection date",
        description: "Please select a collection date.",
        variant: "destructive",
      });
      return;
    }

    // Check for valid group collections
    const validGroupCollections = groupCollections.filter(
      (g) => g.sandwichCount > 0 && g.groupName.trim() !== "",
    );
    
    // Auto-detect if this is group-only entry (has groups but no individual/host data)
    const hasIndividualSandwiches = individualSandwiches && parseInt(individualSandwiches) > 0;
    const hasHostName = hostName && hostName.trim() !== "";
    const hasGroupCollections = validGroupCollections.length > 0;
    const isAutoGroupOnlyMode = hasGroupCollections && !hasIndividualSandwiches && !hasHostName;

    if (isAutoGroupOnlyMode) {
      // Group-only mode validation - just need groups
      if (validGroupCollections.length === 0) {
        toast({
          title: "Missing group collections",
          description: "Please add at least one group collection with a name and sandwich count.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Regular mode requires host name and individual sandwiches
      if (!hasHostName || !hasIndividualSandwiches) {
        toast({
          title: "Missing information",
          description: "Please fill in the host name and individual sandwiches, or just add group collections.",
          variant: "destructive",
        });
        return;
      }
    }

    // Check if host exists and create if needed (skip for "Groups")
    if (
      hostName !== "Groups" &&
      (isCustomHost || !hosts.some((h) => h.name === hostName))
    ) {
      try {
        await createHostMutation.mutateAsync({
          name: hostName.trim(),
          address: "",
          phone: "",
          email: "",
          status: "active",
        });

        toast({
          title: "New host location created",
          description: `"${hostName.trim()}" has been added to host locations.`,
        });
      } catch (error) {
        // Host might already exist, continue with collection creation
        console.log("Host creation skipped (may already exist):", error);
      }
    }

    // validGroupCollections already defined above for validation
    const groupCollectionsString =
      validGroupCollections.length > 0
        ? JSON.stringify(
            validGroupCollections.map((g) => ({
              name: g.groupName.trim(),
              count: g.sandwichCount,
            })),
          )
        : "[]";

    // In group-only mode (manual or auto-detected), use "Groups" as host name and move group totals to individual sandwiches
    let finalHostName = hostName.trim();
    let finalIndividualSandwiches = parseInt(individualSandwiches) || 0;
    let finalGroupCollections = groupCollectionsString;
    
    if (isAutoGroupOnlyMode) {
      finalHostName = "Groups";
      // In group-only mode, sum all group collections and put in individual sandwiches field
      const totalGroupSandwiches = validGroupCollections.reduce((sum, group) => sum + group.sandwichCount, 0);
      finalIndividualSandwiches = totalGroupSandwiches;
      finalGroupCollections = groupCollectionsString; // Keep the group breakdown for reference
    }

    submitCollectionMutation.mutate({
      collectionDate,
      hostName: finalHostName,
      individualSandwiches: finalIndividualSandwiches,
      groupCollections: finalGroupCollections,
      createdBy: user?.id,
      createdByName: user && 'firstName' in user && 'lastName' in user && user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user && 'displayName' in user && user.displayName || user?.email || 'Unknown User',
    });
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <img src={sandwichLogo} alt="Sandwich Logo" className="mr-2 w-5 h-5" />
          Submit Collection
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Log a new sandwich collection for tracking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
        {/* Basic Information Section */}
        <div className="bg-blue-50/30 rounded-lg p-4 sm:p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', fontWeight: '600' }}>
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="collectionDate" className="text-base font-medium text-slate-700">
                Collection Date
              </Label>
              <Input
                id="collectionDate"
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                required
                className="min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="hostName" className="text-base font-medium text-slate-700">
                Host Name
              </Label>
              {isCustomHost ? (
                <div className="flex gap-2">
                  <Input
                    id="hostName"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Enter host location name"
                    className="min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    style={{ fontSize: '16px' }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCustomHost(false);
                      setHostName("");
                    }}
                    className="min-h-[44px] px-4 border-2 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={hostName}
                    onValueChange={(value) => {
                      if (value === "Other") {
                        setIsCustomHost(true);
                        setHostName("");
                      } else {
                        setHostName(value);
                        setIsCustomHost(false);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1 min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors" style={{ fontSize: '16px' }}>
                      <SelectValue placeholder="Select host location" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostOptions.map((host) => (
                        <SelectItem key={host} value={host}>
                          {host === "Groups"
                            ? "Groups (no location)"
                            : host === "Other"
                              ? "Other (create new location)"
                              : host}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hostName && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCustomHost(true);
                      }}
                      className="min-h-[44px] px-4 border-2 hover:bg-slate-50"
                    >
                      Edit
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Individual Collections Section */}
        <div className="bg-gray-50/50 rounded-lg p-4 sm:p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4" style={{ fontSize: '18px', fontWeight: '600' }}>
            Individual Collections
          </h3>
          
          <div className="space-y-3">
            <Label htmlFor="individualSandwiches" className="text-base font-medium text-slate-700">
              Number of Individual Sandwiches
            </Label>
            <Input
              id="individualSandwiches"
              type="number"
              min="0"
              value={individualSandwiches}
              onChange={(e) => setIndividualSandwiches(e.target.value)}
              placeholder="Enter number (leave blank if none)"
              className="min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors max-w-xs"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Group Collections Section */}
        <div className="bg-blue-50/30 rounded-lg p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2" style={{ fontSize: '18px', fontWeight: '600' }}>
                Group Collections
              </h3>
              <p className="text-sm italic text-gray-600" style={{ fontSize: '14px', color: '#666' }}>
                List any groups/organizations and their counts here. Don't add these to your individual total.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addGroupRow}
              className="min-h-[44px] px-4 py-2 border-2 hover:bg-blue-100 shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </div>

          <div className="space-y-4">
            {groupCollections.map((group) => (
              <div key={group.id} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-white p-4 rounded-md border border-slate-200">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Group Name</Label>
                  <Input
                    placeholder="e.g., Local Church, Elementary School"
                    value={group.groupName}
                    onChange={(e) =>
                      updateGroupCollection(group.id, "groupName", e.target.value)
                    }
                    className="min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="w-full sm:w-32 space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Count</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={group.sandwichCount || ""}
                    onChange={(e) =>
                      updateGroupCollection(
                        group.id,
                        "sandwichCount",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="min-h-[44px] text-base px-4 py-3 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                {groupCollections.length > 1 && (
                  <div className="flex sm:flex-col justify-end sm:justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeGroupRow(group.id)}
                      className="min-h-[44px] w-[44px] p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex justify-center pt-6">
          <Button
            type="submit"
            disabled={submitCollectionMutation.isPending}
            className="w-full sm:w-auto min-h-[44px] px-8 py-3 text-base font-semibold btn-tsp-primary text-white hover:bg-opacity-90 focus:ring-2 focus:ring-blue-200 transition-all"
            style={{ fontSize: '16px', minWidth: '200px' }}
          >
            {submitCollectionMutation.isPending
              ? "Submitting..."
              : "Submit Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
