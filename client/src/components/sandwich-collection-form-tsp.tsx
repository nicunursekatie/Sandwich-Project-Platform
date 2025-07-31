import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Sandwich, Info, Calendar, Building2, Users } from "lucide-react";
import { TSPButton, TSPIconButton } from "@/components/ui/tsp-button";
import { TSPCard, TSPCardContent } from "@/components/ui/tsp-card";
import { FormInput, FormLabel, FormField, FormSelect, FormActions, FormError, FormHelperText, FormGroup } from "@/components/ui/tsp-form";
import { Heading, Text, Highlight } from "@/components/ui/tsp-typography";
import { TSPBadge } from "@/components/ui/tsp-badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
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

  const today = new Date().toISOString().split("T")[0];
  const [collectionDate, setCollectionDate] = useState(today);
  const [hostName, setHostName] = useState("");
  const [isCustomHost, setIsCustomHost] = useState(false);
  const [individualSandwiches, setIndividualSandwiches] = useState("");
  const [groupCollections, setGroupCollections] = useState<GroupCollection[]>([
    { id: "1", groupName: "", sandwichCount: 0 },
  ]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any) => {
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'hostName':
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

  const isFormValid = () => {
    const hasHost = hostName && hostName.trim() !== "";
    const hasIndividual = individualSandwiches && individualSandwiches.trim() !== "" && parseInt(individualSandwiches) > 0;
    const hasGroups = groupCollections.some(g => g.groupName.trim() !== "" && g.sandwichCount > 0);
    
    const hostRequiredForIndividual = hasIndividual ? hasHost : true;
    
    return hostRequiredForIndividual && (hasIndividual || hasGroups) && Object.keys(validationErrors).length === 0;
  };

  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    queryFn: async () => {
      const response = await fetch("/api/hosts");
      if (!response.ok) throw new Error("Failed to fetch hosts");
      return response.json();
    },
  });

  const activeHosts = hosts.filter(host => host.status === 'active' && host.name !== 'Groups');
  const hostOptions = [...activeHosts.map((host) => host.name).filter(name => name && name.trim() !== ""), "Other"];

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections/stats"],
      });
      
      toast({
        title: "Success!",
        description: "Collection data has been recorded.",
      });
      
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Error submitting collection:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit collection data.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) return;

    let finalHostName = hostName;

    if (isCustomHost && hostName && hostName.trim() !== "" && hostName !== "Other") {
      try {
        await createHostMutation.mutateAsync({
          name: hostName,
          address: "Address pending",
          phone: "Phone pending",
          email: "Email pending",
          status: "active",
        });
      } catch (error) {
        console.error("Failed to create new host:", error);
      }
    }

    const hasIndividual = individualSandwiches && individualSandwiches.trim() !== "" && parseInt(individualSandwiches) > 0;
    
    if (!hasIndividual && !finalHostName) {
      finalHostName = "Groups";
    }

    const validGroups = groupCollections.filter(
      (g) => g.groupName.trim() !== "" && g.sandwichCount > 0
    );

    if (!hasIndividual && validGroups.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter either individual sandwiches or group collections.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      collectionDate,
      hostName: finalHostName,
      individualSandwiches: parseInt(individualSandwiches) || 0,
      groupCollections: JSON.stringify(validGroups),
      createdBy: (user as any)?.id || undefined,
      createdByName: (user as any)?.firstName
        ? `${(user as any).firstName} ${(user as any)?.lastName || ""}`.trim()
        : (user as any)?.email || undefined,
    };

    submitCollectionMutation.mutate(data);
  };

  const resetForm = () => {
    setCollectionDate(today);
    setHostName("");
    setIsCustomHost(false);
    setIndividualSandwiches("");
    setGroupCollections([{ id: "1", groupName: "", sandwichCount: 0 }]);
    setValidationErrors({});
  };

  const addGroupCollection = () => {
    const newId = Date.now().toString();
    setGroupCollections([
      ...groupCollections,
      { id: newId, groupName: "", sandwichCount: 0 },
    ]);
  };

  const removeGroupCollection = (id: string) => {
    const updatedGroups = groupCollections.filter((g) => g.id !== id);
    setGroupCollections(updatedGroups.length === 0 ? [{ id: "1", groupName: "", sandwichCount: 0 }] : updatedGroups);
    validateField('groupCollections', updatedGroups);
  };

  const updateGroupCollection = (id: string, field: "groupName" | "sandwichCount", value: string | number) => {
    const updatedGroups = groupCollections.map((g) =>
      g.id === id ? { ...g, [field]: value } : g
    );
    setGroupCollections(updatedGroups);
    validateField('groupCollections', updatedGroups);
  };

  const getTotalSandwiches = () => {
    const individual = parseInt(individualSandwiches) || 0;
    const groups = groupCollections.reduce(
      (sum, g) => sum + (g.sandwichCount || 0),
      0
    );
    return individual + groups;
  };

  return (
    <TSPCard variant="elevated" className="max-w-2xl mx-auto">
      <TSPCardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center shadow-md">
              <Sandwich className="h-6 w-6 text-white" />
            </div>
            <div>
              <Heading as="h3">Record Collection Data</Heading>
              <Text variant="muted">Track sandwich contributions for our community</Text>
            </div>
          </div>

          {/* Collection Date */}
          <FormField>
            <FormLabel htmlFor="collectionDate">
              <Calendar className="w-4 h-4 inline-block mr-1" />
              Collection Date
            </FormLabel>
            <FormInput
              id="collectionDate"
              type="date"
              value={collectionDate}
              onChange={(e) => setCollectionDate(e.target.value)}
              required
            />
          </FormField>

          {/* Individual Sandwiches Section */}
          <FormGroup>
            <legend className="font-medium text-tsp-navy mb-4">Individual Sandwiches</legend>
            
            <div className="space-y-4">
              <FormField>
                <FormLabel htmlFor="hostName">
                  <Building2 className="w-4 h-4 inline-block mr-1" />
                  Host Location
                </FormLabel>
                {isCustomHost ? (
                  <FormInput
                    id="hostName"
                    value={hostName}
                    onChange={(e) => {
                      setHostName(e.target.value);
                      validateField('hostName', e.target.value);
                    }}
                    placeholder="Enter custom host name"
                  />
                ) : (
                  <FormSelect
                    id="hostName"
                    value={hostName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "Other") {
                        setIsCustomHost(true);
                        setHostName("");
                      } else {
                        setHostName(value);
                        validateField('hostName', value);
                      }
                    }}
                  >
                    <option value="">Select a host location</option>
                    {hostOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </FormSelect>
                )}
                <FormError>{validationErrors.hostName}</FormError>
              </FormField>

              <FormField>
                <FormLabel htmlFor="individualSandwiches">
                  Number of Individual Sandwiches
                </FormLabel>
                <FormInput
                  id="individualSandwiches"
                  type="number"
                  min="0"
                  value={individualSandwiches}
                  onChange={(e) => {
                    setIndividualSandwiches(e.target.value);
                    validateField('individualSandwiches', e.target.value);
                  }}
                  placeholder="0"
                />
                <FormError>{validationErrors.individualSandwiches}</FormError>
              </FormField>
            </div>
          </FormGroup>

          {/* Group Collections Section */}
          <FormGroup>
            <legend className="font-medium text-tsp-navy mb-4">
              <Users className="w-4 h-4 inline-block mr-1" />
              Group Collections
            </legend>
            
            <div className="space-y-3">
              {groupCollections.map((group, index) => (
                <div key={group.id} className="flex gap-3 items-start">
                  <FormInput
                    placeholder="Group name"
                    value={group.groupName}
                    onChange={(e) => updateGroupCollection(group.id, "groupName", e.target.value)}
                    className="flex-1"
                  />
                  <FormInput
                    type="number"
                    min="0"
                    placeholder="Count"
                    value={group.sandwichCount || ""}
                    onChange={(e) => updateGroupCollection(group.id, "sandwichCount", parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                  {groupCollections.length > 1 && (
                    <TSPIconButton
                      variant="ghost"
                      icon={<Trash2 className="w-4 h-4 text-destructive" />}
                      label="Remove group"
                      onClick={() => removeGroupCollection(group.id)}
                    />
                  )}
                </div>
              ))}
              <FormError>{validationErrors.groupCollections}</FormError>
              
              <TSPButton
                type="button"
                variant="outline"
                size="sm"
                onClick={addGroupCollection}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Another Group
              </TSPButton>
            </div>
          </FormGroup>

          {/* Total Summary */}
          <Highlight variant="info" icon={<Info className="h-5 w-5" />}>
            <div className="flex justify-between items-center">
              <Text className="font-medium">Total Sandwiches:</Text>
              <TSPBadge variant="secondary" size="lg">
                {getTotalSandwiches()} sandwiches
              </TSPBadge>
            </div>
          </Highlight>

          {/* Form Actions */}
          <FormActions>
            <TSPButton
              type="button"
              variant="outline"
              onClick={resetForm}
            >
              Reset Form
            </TSPButton>
            <TSPButton
              type="submit"
              loading={submitCollectionMutation.isPending}
              disabled={!isFormValid() || submitCollectionMutation.isPending}
            >
              Submit Collection
            </TSPButton>
          </FormActions>
        </form>
      </TSPCardContent>
    </TSPCard>
  );
}