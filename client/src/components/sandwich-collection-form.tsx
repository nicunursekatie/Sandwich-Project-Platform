import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  count: number;
}

interface SandwichCollectionFormProps {
  onSuccess?: () => void;
}

interface Host {
  id: number;
  name: string;
  status: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export default function SandwichCollectionForm({
  onSuccess,
}: SandwichCollectionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [individualCount, setIndividualCount] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch active hosts
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ["/api/hosts"],
    select: (data: any) =>
      data.filter((host: Host) => host.status === "active"),
  });

  // Create new host mutation
  const createHostMutation = useMutation({
    mutationFn: async (hostName: string) => {
      const response = await fetch("/api/hosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hostName,
          status: "active",
          email: "",
          phone: "",
          address: "",
          notes: `Created from collection form on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to create host");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosts"] });
    },
  });

  // Submit collection mutation
  const submitMutation = useMutation({
    mutationFn: async (collectionData: any) => {
      const response = await fetch("/api/sandwich-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectionData),
      });
      if (!response.ok) throw new Error("Failed to submit collection");
      return response.json();
    },
    onSuccess: (data) => {
      const totalSandwiches = (parseInt(individualCount) || 0) + 
        groups.reduce((sum, group) => sum + (parseInt(group.count) || 0), 0);
      
      // Show clear success message with details
      toast({
        title: "Collection Submitted Successfully! 🥪",
        description: `Recorded ${totalSandwiches} sandwiches from ${location || customLocation} on ${new Date(date).toLocaleDateString()}. Thank you for your contribution!`,
        duration: 5000,
      });

      // Clear form
      setDate(new Date().toISOString().split("T")[0]);
      setLocation("");
      setCustomLocation("");
      setShowCustomLocation(false);
      setIndividualCount("");
      setGroups([]);

      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/sandwich-collections/stats"],
      });
      
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      // Show clear error message
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your collection. Please try again or contact support if the issue persists.",
        variant: "destructive",
        duration: 7000,
      });
    },
  });

  // Handle location change
  const handleLocationChange = (value: string) => {
    setLocation(value);
    setShowCustomLocation(value === "other");
    if (value !== "other") {
      setCustomLocation("");
    }
  };

  // Calculate total
  const calculateTotal = () => {
    const individual = parseInt(individualCount) || 0;
    const groupTotal = groups.reduce(
      (sum, group) => sum + (parseInt(group.count) || 0),
      0,
    );
    return individual + groupTotal;
  };

  // Add group
  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: "", count: 0 }]);
  };

  // Remove group
  const removeGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  // Calculator functions
  const handleCalcInput = (value: string) => {
    if (value === "=") {
      try {
        const result = eval(calcDisplay);
        setCalcDisplay(result.toString());
      } catch {
        setCalcDisplay("Error");
      }
    } else if (value === "C") {
      setCalcDisplay("");
    } else if (value === "←") {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay(calcDisplay + value);
    }
  };

  const useCalcResult = () => {
    if (calcDisplay && !isNaN(Number(calcDisplay))) {
      setIndividualCount(calcDisplay);
      setShowCalculator(false);
      setCalcDisplay("");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    let finalLocation = location;

    // If "other" is selected, create new host and use custom location
    if (location === "other" && customLocation.trim()) {
      try {
        await createHostMutation.mutateAsync(customLocation.trim());
        finalLocation = customLocation.trim();
      } catch (error) {
        console.error("Failed to create new host:", error);
        return;
      }
    }

    const collectionData = {
      collectionDate: date,
      hostName: finalLocation,
      individualSandwiches: parseInt(individualCount) || 0,
      groupSandwiches: groups.reduce(
        (sum, group) => sum + (parseInt(group.count) || 0),
        0,
      ),
      groupCollections: groups.filter((g) => g.name.trim() && g.count > 0),
      notes: `Submitted via collection form on ${new Date().toLocaleString()}`,
    };

    submitMutation.mutate(collectionData);
  };

  // Modern dashboard-integrated container styles
  const containerStyle = {
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  };

  const accentBarStyle = {
    width: "3px",
    height: "16px",
    background: "#FBAD3F",
    borderRadius: "2px",
    position: "absolute" as const,
    left: 0,
  };

  // Modern header style matching dashboard cards with TSP teal gradient
  const headerStyle = {
    background: "linear-gradient(135deg, #236383 0%, #007E8C 100%)",
    borderBottom: "1px solid #e2e8f0",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const headerLeftStyle = {
    flex: 1,
  };

  const h1Style = {
    fontSize: "20px",
    fontWeight: "600",
    margin: 0,
    marginBottom: "4px",
    color: "white",
    fontFamily: "Roboto, sans-serif",
  };

  const headerPStyle = {
    fontSize: "14px",
    fontWeight: "400",
    opacity: 0.9,
    margin: 0,
    color: "white",
    fontFamily: "Roboto, sans-serif",
  };

  const totalBadgeStyle = {
    background: "linear-gradient(135deg, #FBAD3F 0%, #F7931E 100%)",
    borderRadius: "8px",
    padding: "8px 16px",
    textAlign: "center" as const,
    minWidth: "80px",
    color: "white",
    border: "2px solid rgba(255,255,255,0.2)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  const totalLabelStyle = {
    fontSize: "13px",
    opacity: 0.9,
    marginBottom: "2px",
    fontWeight: "500",
  };

  const totalNumberStyle = {
    fontSize: "18px",
    fontWeight: "700",
  };

  // Modern form container with dashboard spacing
  const formContainerStyle = {
    padding: "24px",
    background: "white",
  };

  const formSectionStyle = {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
  };

  const sectionTitleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "16px",
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "8px",
    position: "relative" as const,
    paddingLeft: "13px",
    fontFamily: "Roboto, sans-serif",
  };

  const formRowStyle = {
    display: "grid",
    gridTemplateColumns: "160px 1fr",
    gap: "16px",
  };

  const formGroupStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "5px",
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
    fontFamily: "Roboto, sans-serif",
  };

  // Modern input styling matching dashboard
  const inputStyle = {
    height: "40px",
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "16px",
    fontFamily: "Roboto, sans-serif",
    transition: "all 0.2s ease",
    background: "white",
    color: "#1f2937",
    width: "100%",
  };

  const individualInputStyle = {
    ...inputStyle,
    width: "100px",
    fontWeight: "600",
    color: "#236383",
    fontSize: "20px",
    textAlign: "center" as const,
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23989393' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "28px",
    cursor: "pointer",
  };

  // Modern groups section
  const groupsContainerStyle = {
    background: "#ffffff",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    marginTop: "12px",
  };

  const groupsHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  };

  const groupItemStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 60px 28px",
    gap: "6px",
    marginBottom: "6px",
    alignItems: "center",
  };

  const groupInputStyle = {
    ...inputStyle,
    height: "28px",
    padding: "0 8px",
    fontSize: "14px",
  };

  const removeBtnStyle = {
    width: "28px",
    height: "28px",
    background: "#FFE5E5",
    border: "none",
    borderRadius: "4px",
    color: "#E74C3C",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s ease",
  };

  const addGroupBtnStyle = {
    padding: "6px 10px",
    background: "transparent",
    border: "1px dashed #236383",
    borderRadius: "4px",
    color: "#236383",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "Roboto, sans-serif",
  };

  // Modern submit section with TSP teal background
  const submitSectionStyle = {
    padding: "24px",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e1f3f7 0%, #cfe9f0 100%)",
  };

  const submitBtnStyle = {
    background: "linear-gradient(135deg, #FBAD3F 0%, #e89b2e 100%)",
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "Roboto, sans-serif",
    boxShadow: "0 2px 4px rgba(251, 173, 63, 0.25)",
  };

  const helperTextStyle = {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "4px",
    fontFamily: "Roboto, sans-serif",
  };

  const emptyStateStyle = {
    fontSize: "14px",
    color: "#989393",
    textAlign: "center",
    padding: "12px 0",
    fontStyle: "italic",
  };

  // Custom location input style
  const customLocationInputStyle = {
    ...inputStyle,
    marginTop: "6px",
  };

  // Calculator overlay styles
  const calculatorOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const calculatorStyle = {
    background: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    width: "240px",
    fontFamily: "Roboto, sans-serif",
  };

  const calcDisplayStyle = {
    width: "100%",
    height: "40px",
    padding: "0 12px",
    border: "1px solid #E9E6E6",
    borderRadius: "4px",
    fontSize: "16px",
    textAlign: "right",
    marginBottom: "12px",
    background: "#f8f9fa",
  };

  const calcButtonGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    marginBottom: "12px",
  };

  const calcButtonStyle = {
    height: "36px",
    border: "1px solid #E9E6E6",
    borderRadius: "4px",
    background: "white",
    fontSize: "14px",
    cursor: "pointer",
    fontFamily: "Roboto, sans-serif",
  };

  const calcActionButtonStyle = {
    ...calcButtonStyle,
    background: "#236383",
    color: "white",
    border: "1px solid #236383",
  };

  // Group collections collapsed section style
  const collapsedGroupSectionStyle = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "12px",
    textAlign: "center",
  };

  const instructionTextStyle = {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "8px",
    lineHeight: "1.4",
  };

  const addGroupButtonStyle = {
    ...addGroupBtnStyle,
    marginRight: "8px",
  };

  const calcButtonSmallStyle = {
    padding: "4px 8px",
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "Roboto, sans-serif",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  };
  // Event handlers
  const handleInputFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.outline = "none";
    e.currentTarget.style.borderColor = "#236383";
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = "#E9E6E6";
  };

  return (
    <div style={containerStyle}>
      {/* Compact Header with Total */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={h1Style}>Submit Collection</h1>
          <p style={headerPStyle}>Record today's sandwich distribution</p>
        </div>
        <div style={totalBadgeStyle}>
          <div style={totalLabelStyle}>Total</div>
          <div style={totalNumberStyle}>{calculateTotal()}</div>
        </div>
      </div>

      {/* Form */}
      <div style={formContainerStyle}>
        {/* Collection Details */}
        <div style={formSectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span style={accentBarStyle}></span>
            Collection Details
          </h3>
          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label htmlFor="date" style={labelStyle}>
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
              />
            </div>
            <div style={formGroupStyle}>
              <label htmlFor="location" style={labelStyle}>
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                style={selectStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
              >
                <option value="">Select location</option>
                {hosts.map((host) => (
                  <option key={host.id} value={host.name}>
                    {host.name}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {/* Custom Location Input */}
          {showCustomLocation && (
            <div style={formGroupStyle}>
              <label htmlFor="custom-location" style={labelStyle}>
                New Location Name
              </label>
              <input
                type="text"
                id="custom-location"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Enter new location name"
                style={customLocationInputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required={showCustomLocation}
              />
            </div>
          )}
        </div>

        {/* Individual Sandwiches */}
        <div style={formSectionStyle}>
          <h3 style={sectionTitleStyle}>
            <span style={accentBarStyle}></span>
            Individual Sandwiches
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="number"
              id="individual-count"
              min="0"
              placeholder="0"
              value={individualCount}
              onChange={(e) => setIndividualCount(e.target.value)}
              style={individualInputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <button
              type="button"
              onClick={() => setShowCalculator(true)}
              style={calcButtonSmallStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
              }}
            >
              <Calculator style={{ width: "14px", height: "14px" }} />
              Calculator
            </button>
          </div>
          <p style={helperTextStyle}>
            Count only individual sandwiches here (don't include group totals)
          </p>
        </div>

        {/* Group Collections - Collapsed or Expanded */}
        <div style={{ ...formSectionStyle, marginBottom: 0 }}>
          {groups.length === 0 ? (
            // Collapsed state
            <div style={collapsedGroupSectionStyle}>
              <p style={instructionTextStyle}>
                <strong>Group Collections:</strong> If you collected sandwiches
                from groups/organizations, record their totals separately with
                their group name. Don't add these to your individual count
                above.
              </p>
              <button
                type="button"
                onClick={addGroup}
                style={addGroupButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#236383";
                  e.currentTarget.style.background = "rgba(35, 99, 131, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#236383";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                + Add Group
              </button>
            </div>
          ) : (
            // Expanded state
            <div>
              <div style={groupsHeaderStyle}>
                <h3
                  style={{
                    ...sectionTitleStyle,
                    marginBottom: 0,
                    paddingBottom: 0,
                    borderBottom: "none",
                  }}
                >
                  <span style={accentBarStyle}></span>
                  Group Collections
                </h3>
                <button
                  type="button"
                  onClick={addGroup}
                  style={addGroupBtnStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#236383";
                    e.currentTarget.style.background =
                      "rgba(35, 99, 131, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#236383";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  + Add Group
                </button>
              </div>

              <div style={groupsContainerStyle}>
                <div>
                  {groups.map((group, i) => (
                    <div key={group.id} style={groupItemStyle}>
                      <input
                        type="text"
                        placeholder="Group name"
                        value={group.name}
                        onChange={(e) => {
                          const newGroups = [...groups];
                          newGroups[i].name = e.target.value;
                          setGroups(newGroups);
                        }}
                        style={groupInputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                      <input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={group.count}
                        onChange={(e) => {
                          const newGroups = [...groups];
                          newGroups[i].count = parseInt(e.target.value) || 0;
                          setGroups(newGroups);
                        }}
                        style={{
                          ...groupInputStyle,
                          textAlign: "center",
                          fontWeight: "600",
                          color: "#236383",
                        }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                      <button
                        type="button"
                        onClick={() => removeGroup(group.id)}
                        style={removeBtnStyle}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#E74C3C";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#FFE5E5";
                          e.currentTarget.style.color = "#E74C3C";
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div style={submitSectionStyle}>
        <button
          style={{
            ...submitBtnStyle,
            opacity:
              submitMutation.isPending || createHostMutation.isPending
                ? 0.6
                : 1,
            cursor:
              submitMutation.isPending || createHostMutation.isPending
                ? "not-allowed"
                : "pointer",
          }}
          onClick={handleSubmit}
          disabled={submitMutation.isPending || createHostMutation.isPending}
          onMouseEnter={(e) => {
            if (!submitMutation.isPending && !createHostMutation.isPending) {
              e.currentTarget.style.background = "#F39C12";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (!submitMutation.isPending && !createHostMutation.isPending) {
              e.currentTarget.style.background = "#FBAD3F";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {submitMutation.isPending || createHostMutation.isPending
            ? "Submitting..."
            : "Submit Collection"}
        </button>
      </div>

      {/* Calculator Modal */}
      {showCalculator && (
        <div
          style={calculatorOverlayStyle}
          onClick={() => setShowCalculator(false)}
        >
          <div style={calculatorStyle} onClick={(e) => e.stopPropagation()}>
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "16px",
                fontWeight: "600",
                color: "#236383",
              }}
            >
              Calculator Helper
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 12px 0",
              }}
            >
              Calculate your individual count (e.g., 150 - 25 - 30 = 95)
            </p>

            <input
              type="text"
              value={calcDisplay}
              readOnly
              style={calcDisplayStyle}
              placeholder="Enter calculation..."
            />

            <div style={calcButtonGridStyle}>
              <button
                style={calcActionButtonStyle}
                onClick={() => handleCalcInput("C")}
              >
                C
              </button>
              <button
                style={calcActionButtonStyle}
                onClick={() => handleCalcInput("←")}
              >
                ←
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("/")}
              >
                /
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("*")}
              >
                ×
              </button>

              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("7")}
              >
                7
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("8")}
              >
                8
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("9")}
              >
                9
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("-")}
              >
                -
              </button>

              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("4")}
              >
                4
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("5")}
              >
                5
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("6")}
              >
                6
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("+")}
              >
                +
              </button>

              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("1")}
              >
                1
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("2")}
              >
                2
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput("3")}
              >
                3
              </button>
              <button
                style={{ ...calcActionButtonStyle, gridRow: "span 2" }}
                onClick={() => handleCalcInput("=")}
              >
                =
              </button>

              <button
                style={{ ...calcButtonStyle, gridColumn: "span 2" }}
                onClick={() => handleCalcInput("0")}
              >
                0
              </button>
              <button
                style={calcButtonStyle}
                onClick={() => handleCalcInput(".")}
              >
                .
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#FBAD3F",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                onClick={useCalcResult}
              >
                Use Result
              </button>
              <button
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#f8f9fa",
                  color: "#6c757d",
                  border: "1px solid #dee2e6",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => setShowCalculator(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
