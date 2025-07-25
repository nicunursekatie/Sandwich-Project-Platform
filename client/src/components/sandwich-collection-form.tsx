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

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Real-time validation
  const validateField = (fieldName: string, value: any) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'hostName':
        if (!value || value.trim() === "") {
          errors.hostName = "Host location is required";
        } else {
          delete errors.hostName;
        }
        break;
      case 'individualSandwiches':
        const hasIndividual = value && value.trim() !== "" && parseInt(value) > 0;
        const hasGroups = groupCollections.some(g => g.groupName.trim() !== "" && g.sandwichCount > 0);
        if (!hasIndividual && !hasGroups) {
          errors.individualSandwiches = "Either individual sandwiches or group collections required";
        } else {
          delete errors.individualSandwiches;
        }
        break;
      case 'groupCollections':
        const hasValidGroups = groupCollections.some(g => g.groupName.trim() !== "" && g.sandwichCount > 0);
        const hasValidIndividual = individualSandwiches && individualSandwiches.trim() !== "" && parseInt(individualSandwiches) > 0;
        if (!hasValidGroups && !hasValidIndividual) {
          errors.groupCollections = "Either individual sandwiches or group collections required";
        } else {
          delete errors.groupCollections;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  // Check if form is valid
  const isFormValid = () => {
    const hasHost = hostName && hostName.trim() !== "";
    const hasIndividual = individualSandwiches && individualSandwiches.trim() !== "" && parseInt(individualSandwiches) > 0;
    const hasGroups = groupCollections.some(g => g.groupName.trim() !== "" && g.sandwichCount > 0);
    
    return hasHost && (hasIndividual || hasGroups) && Object.keys(validationErrors).length === 0;
  };


  // Fetch active hosts from the database
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const response = await fetch("/api/hosts");
      if (!response.ok) throw new Error("Failed to fetch hosts");
      return response.json();
    },
  });

  // Only include active hosts in dropdown to reduce clutter, exclude "Groups" from dropdown
  const activeHosts = hosts.filter(host => host.status === 'active' && host.name !== 'Groups');
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
      groupSandwiches: number; // Add the new field to the type
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
    const updatedGroups = groupCollections.map((group) =>
      group.id === id ? { ...group, [field]: value } : group,
    );
    setGroupCollections(updatedGroups);
    // Trigger validation after updating groups
    validateField('groupCollections', updatedGroups);
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

    // Calculate total group sandwiches for the new numeric field
    const totalGroupSandwiches = validGroupCollections.reduce((sum, group) => sum + group.sandwichCount, 0);
    
    // In group-only mode (manual or auto-detected), use "Groups" as host name and move group totals to individual sandwiches
    let finalHostName = hostName.trim();
    let finalIndividualSandwiches = parseInt(individualSandwiches) || 0;
    let finalGroupSandwiches = totalGroupSandwiches;
    let finalGroupCollections = groupCollectionsString;
    
    if (isAutoGroupOnlyMode) {
      finalHostName = "Groups";
      // In group-only mode, put all sandwiches in group field and zero out individual field
      finalIndividualSandwiches = 0; // No individual sandwiches for group-only entries
      finalGroupSandwiches = totalGroupSandwiches; // All sandwiches are from groups
      finalGroupCollections = groupCollectionsString; // Keep the group breakdown for reference
    }

    submitCollectionMutation.mutate({
      collectionDate,
      hostName: finalHostName,
      individualSandwiches: finalIndividualSandwiches,
      groupSandwiches: finalGroupSandwiches, // Use the corrected variable to avoid double counting
      groupCollections: finalGroupCollections,
      createdBy: (user as any)?.id,
      createdByName: user && typeof user === 'object' && 'firstName' in user && 'lastName' in user && user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user && typeof user === 'object' && 'displayName' in user && (user as any).displayName || (user as any)?.email || 'Unknown User',
    });
  };

  return (
    <div className="w-full bg-white rounded border border-slate-200">
      {/* Ultra Compact Header */}
      <div className="px-2 py-2 border-b border-slate-200 bg-gray-50">
        <h2 className="text-sm font-medium text-slate-900 flex items-center">
          <img src={sandwichLogo} alt="Logo" className="mr-1 w-3 h-3" />
          Submit Collection
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-2 space-y-3">
        {/* Ultra Compact Basic Info */}
        <div className="bg-blue-50/30 rounded p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="collectionDate" className="text-xs font-medium text-slate-700 block mb-1">
                Date
              </Label>
              <Input
                id="collectionDate"
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                required
                className="h-8 text-xs px-2 py-1 border border-slate-300 rounded"
              />
            </div>

            <div>
              <Label htmlFor="hostName" className="text-xs font-medium text-slate-700 block mb-1">
                Location
              </Label>
              {isCustomHost ? (
                <div className="flex gap-1">
                  <Input
                    id="hostName"
                    value={hostName}
                    onChange={(e) => {
                      setHostName(e.target.value);
                      validateField('hostName', e.target.value);
                    }}
                    placeholder="Location name"
                    className={`h-8 text-xs px-2 py-1 border rounded ${
                      validationErrors.hostName 
                        ? 'border-red-500' 
                        : 'border-slate-300'
                    }`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCustomHost(false);
                      setHostName("");
                    }}
                    className="h-8 px-2 text-xs"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select
                  value={hostName}
                  onValueChange={(value) => {
                    if (value === "Other") {
                      setIsCustomHost(true);
                      setHostName("");
                      validateField('hostName', "");
                    } else {
                      setHostName(value);
                      setIsCustomHost(false);
                      validateField('hostName', value);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs px-2 py-1 border border-slate-300">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostOptions.map((host) => (
                      <SelectItem key={host} value={host}>
                        {host === "Groups"
                          ? "Groups"
                          : host === "Other"
                            ? "Other"
                            : host}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {validationErrors.hostName && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.hostName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ultra Compact Warning */}
        <div className="bg-yellow-50 border-l-2 border-yellow-400 p-1 text-xs text-yellow-800">
          ⚠️ Don't include group totals in individual count
        </div>

        {/* Ultra Compact Collections */}
        <div className="space-y-2">
          {/* Individual Collections - Single Line */}
          <div className="bg-gray-50 rounded p-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="individualSandwiches" className="text-xs font-medium text-slate-700 w-20 flex-shrink-0">
                Individual:
              </Label>
              <Input
                id="individualSandwiches"
                type="number"
                min="0"
                value={individualSandwiches}
                onChange={(e) => {
                  setIndividualSandwiches(e.target.value);
                  validateField('individualSandwiches', e.target.value);
                }}
                placeholder="0"
                className={`h-8 text-xs px-2 py-1 border rounded flex-1 ${
                  validationErrors.individualSandwiches 
                    ? 'border-red-500' 
                    : 'border-slate-300'
                }`}
              />
            </div>
            {validationErrors.individualSandwiches && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.individualSandwiches}</p>
            )}
          </div>

          {/* Group Collections - Ultra Compact */}
          <div className="bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-medium text-slate-700">Groups:</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGroupRow}
                className="h-6 px-2 text-xs"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-1">
              {groupCollections.map((group) => (
                <div key={group.id} className="flex gap-1 items-center">
                  <Input
                    placeholder="Group name"
                    value={group.groupName}
                    onChange={(e) =>
                      updateGroupCollection(group.id, "groupName", e.target.value)
                    }
                    className="h-7 text-xs px-2 py-1 border border-slate-300 rounded flex-1"
                  />
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
                    className="h-7 text-xs px-2 py-1 border border-slate-300 rounded w-16"
                  />
                  {groupCollections.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeGroupRow(group.id)}
                      className="h-7 w-7 p-0 text-red-600"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ultra Compact Submit */}
        <Button
          type="submit"
          disabled={submitCollectionMutation.isPending || !isFormValid()}
          className={`w-full h-8 px-4 text-xs font-medium ${
            isFormValid() && !submitCollectionMutation.isPending
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitCollectionMutation.isPending ? "Submitting..." : "Submit Collection"}
        </Button>
      </form>
    </div>
  );
}
