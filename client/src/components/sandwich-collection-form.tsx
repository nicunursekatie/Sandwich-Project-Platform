import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
        // Only require host if there are individual sandwiches
        const hasIndividualSandwiches = individualSandwiches && individualSandwiches.trim() !== "" && parseInt(individualSandwiches) > 0;
        if (hasIndividualSandwiches && (!value || value.trim() === "")) {
          errors.hostName = "Host location is required for individual sandwich collections";
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
    
    // For individual collections, require host. For group-only collections, host is optional (auto-assigned)
    const hostRequiredForIndividual = hasIndividual ? hasHost : true;
    
    return hostRequiredForIndividual && (hasIndividual || hasGroups) && Object.keys(validationErrors).length === 0;
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

    // Validation: Need either individual data OR group data (or both)
    if (!hasIndividualSandwiches && !hasGroupCollections) {
      toast({
        title: "Missing sandwich data",
        description: "Please enter either individual sandwiches (with host) or group collections.",
        variant: "destructive",
      });
      return;
    }

    // If they have individual sandwiches, they need a host
    if (hasIndividualSandwiches && !hasHostName) {
      toast({
        title: "Missing host information",
        description: "Please select a host location for individual sandwich collections.",
        variant: "destructive",
      });
      return;
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

    // Phase 3: Extract group data for new simple columns
    const group1Name = validGroupCollections.length > 0 ? validGroupCollections[0].groupName.trim() : null;
    const group1Count = validGroupCollections.length > 0 ? validGroupCollections[0].sandwichCount : null;
    const group2Name = validGroupCollections.length > 1 ? validGroupCollections[1].groupName.trim() : null;
    const group2Count = validGroupCollections.length > 1 ? validGroupCollections[1].sandwichCount : null;

    // Phase 3: Submit with new group columns (temporarily typed as any to work around TypeScript)
    const submissionData = {
      collectionDate,
      hostName: finalHostName,
      individualSandwiches: finalIndividualSandwiches,
      groupCollections: finalGroupCollections, // Keep for backward compatibility during migration
      group1Name,
      group1Count,
      group2Name,
      group2Count,
      createdBy: (user as any)?.id,
      createdByName: user && typeof user === 'object' && 'firstName' in user && 'lastName' in user && user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user && typeof user === 'object' && 'displayName' in user && (user as any).displayName || (user as any)?.email || 'Unknown User',
    };

    submitCollectionMutation.mutate(submissionData as any);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-[#236383]/30 shadow-lg">
      {/* Single Header with Logo */}
      <div className="px-6 py-4 border-b border-[#236383]/30 bg-gradient-to-r from-[#236383]/5 to-[#FBAD3F]/5">
        <h2 className="text-lg font-bold text-[#236383] flex items-center font-roboto">
          <div className="w-8 h-8 bg-white rounded-lg mr-3 flex items-center justify-center border border-[#236383]/40 shadow-sm">
            <img src={sandwichLogo} alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          Submit Collection
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white rounded-b-lg">
        {/* Collection Info Section */}
        <div className="bg-gradient-to-r from-[#236383]/8 to-[#236383]/4 rounded-lg p-5 space-y-4 border border-[#236383]/20 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#236383]/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#236383]" />
              <h3 className="text-base font-bold text-[#236383] font-roboto">Collection Info</h3>
            </div>
            <span className="bg-[#47B3CB] text-white text-xs font-bold px-2 py-1 rounded-full">Required</span>
          </div>
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

        {/* Collections Data */}
        <div className="space-y-5">
          {/* Individual Collections */}
          <div className="bg-gradient-to-r from-[#FBAD3F]/10 to-[#FBAD3F]/5 rounded-lg p-4 border border-[#FBAD3F]/30 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-28 flex-shrink-0">
                <Label htmlFor="individualSandwiches" className="text-sm font-bold text-[#922B21] font-roboto">
                  Individual:
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-[#FBAD3F] hover:text-[#e89b2e] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">Don't include group totals here - enter those separately below</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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
                    ? 'border-[#A31C41] border-2' 
                    : 'border-slate-300'
                }`}
              />
            </div>
            {validationErrors.individualSandwiches && (
              <div className="mt-2 flex items-center gap-2">
                <span className="bg-[#A31C41] text-white text-xs font-bold px-2 py-1 rounded-full">Error</span>
                <p className="text-xs text-[#A31C41] font-medium">{validationErrors.individualSandwiches}</p>
              </div>
            )}
          </div>

          {/* Instruction Text */}
          <div className="text-sm text-[#922B21] italic px-3 py-2 bg-[#922B21]/5 rounded-md border border-[#922B21]/20">
            Enter group totals separately below. Each group needs a name and count. Use "Add Group" button to add more groups.
          </div>

          {/* Group Collections */}
          <div className="bg-gradient-to-r from-[#922B21]/8 to-[#922B21]/4 rounded-lg p-4 border border-[#922B21]/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-bold text-[#922B21] font-roboto">Groups:</Label>
              <span className="bg-[#47B3CB] text-white text-xs font-bold px-2 py-1 rounded-full">Optional</span>
            </div>

            <div className="space-y-2">
              {groupCollections.map((group) => (
                <div key={group.id} className="space-y-1">
                  <Input
                    placeholder="Group name (e.g., Church Group, School Club)"
                    value={group.groupName}
                    onChange={(e) =>
                      updateGroupCollection(group.id, "groupName", e.target.value)
                    }
                    className="h-7 text-xs px-2 py-1 border border-slate-300 rounded w-full"
                  />
                  <div className="flex gap-1 items-center">
                    <div className="flex-1">
                      <Label htmlFor={`group-count-${group.id}`} className="text-xs text-slate-600 mb-1 block">
                        # of sandwiches from this group
                      </Label>
                      <Input
                        id={`group-count-${group.id}`}
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
                        className="h-7 text-xs px-2 py-1 border border-slate-300 rounded w-full"
                      />
                    </div>
                    {groupCollections.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => removeGroupRow(group.id)}
                        className="h-7 w-7 p-0 bg-[#A31C41] hover:bg-[#8b1836] text-white font-bold border border-[#A31C41] mt-4"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Full-width Add Group button */}
              <Button
                type="button"
                onClick={addGroupRow}
                className="w-full h-9 text-sm font-semibold bg-[#007E8C] hover:bg-[#006670] text-white font-bold border border-[#007E8C] transition-all duration-200 font-roboto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitCollectionMutation.isPending || !isFormValid()}
          className={`w-full h-11 px-6 text-sm font-semibold rounded-lg shadow-md transition-all duration-200 font-roboto ${
            isFormValid() && !submitCollectionMutation.isPending
              ? 'bg-gradient-to-r from-[#FBAD3F] via-[#e89b2e] to-[#922B21] hover:from-[#e89b2e] hover:via-[#d88a1e] hover:to-[#7a2419] text-white shadow-lg shadow-[#FBAD3F]/25 border border-[#922B21]/20'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
          }`}
        >
          {submitCollectionMutation.isPending ? "Submitting..." : "Submit Collection"}
        </Button>
      </form>
    </div>
  );
}
