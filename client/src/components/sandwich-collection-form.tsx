import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Calendar, ChevronDown, Plus, Trash2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
}

export default function SandwichCollectionForm({ onSuccess }: SandwichCollectionFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [individualCount, setIndividualCount] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch active hosts
  const { data: hosts = [] } = useQuery<Host[]>({
    queryKey: ['/api/hosts'],
    select: (data) => data.filter((host: Host) => host.status === 'active')
  });

  // Create new host mutation
  const createHostMutation = useMutation({
    mutationFn: async (hostName: string) => {
      const response = await fetch('/api/hosts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: hostName,
          status: 'active',
          email: '',
          phone: '',
          address: '',
          notes: `Created from collection form on ${new Date().toLocaleDateString()}`
        })
      });
      if (!response.ok) throw new Error('Failed to create host');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hosts'] });
    }
  });

  // Submit collection mutation
  const submitMutation = useMutation({
    mutationFn: async (collectionData: any) => {
      const response = await fetch('/api/sandwich-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionData)
      });
      if (!response.ok) throw new Error('Failed to submit collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sandwich-collections'] });
      if (onSuccess) onSuccess();
    }
  });

  // Handle location change
  const handleLocationChange = (value: string) => {
    setLocation(value);
    setShowCustomLocation(value === "other");
    if (value !== "other") {
      setCustomLocation("");
    }
  };

  // Calculate total sandwiches
  const calculateTotal = () => {
    const individual = parseInt(individualCount) || 0;
    const groupTotal = groups.reduce((sum, group) => sum + (parseInt(group.count.toString()) || 0), 0);
    return individual + groupTotal;
  };

  // Add group
  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: "", count: 0 }]);
  };

  // Remove group
  const removeGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalLocation = location;
    
    // If "other" is selected, create new host and use custom location
    if (location === "other" && customLocation.trim()) {
      try {
        await createHostMutation.mutateAsync(customLocation.trim());
        finalLocation = customLocation.trim();
      } catch (error) {
        console.error('Failed to create new host:', error);
        return;
      }
    }

    const collectionData = {
      collectionDate: date,
      hostName: finalLocation,
      individualSandwiches: parseInt(individualCount) || 0,
      groupSandwiches: groups.reduce((sum, group) => sum + (parseInt(group.count.toString()) || 0), 0),
      groupCollections: groups.filter(g => g.name.trim() && g.count > 0),
      notes: `Submitted via collection form on ${new Date().toLocaleString()}`
    };

    submitMutation.mutate(collectionData);
  };

  // Base input styling
  const inputStyle = {
    height: '44px',
    padding: '0 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '400',
    color: '#334155',
    background: '#f8fafc',
    transition: 'all 0.2s ease',
    width: '100%'
  };

  const handleInputMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#cbd5e1';
  };

  const handleInputMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.outline = 'none';
    e.currentTarget.style.borderColor = '#236383';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(35, 99, 131, 0.1)';
    e.currentTarget.style.background = '#ffffff';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#e2e8f0';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = '#f8fafc';
  };

  return (
    <form onSubmit={handleSubmit} style={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Collection Details Section */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '24px', 
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '20px',
          textTransform: 'none'
        }}>
          Collection Details
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Date Field */}
          <div>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#646464',
              display: 'block',
              marginBottom: '8px'
            }}>
              Date
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
                onMouseEnter={handleInputMouseEnter}
                onMouseLeave={handleInputMouseLeave}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
              />
              <Calendar 
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#64748b',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>

          {/* Location Field */}
          <div>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#646464',
              display: 'block',
              marginBottom: '8px'
            }}>
              Location
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  cursor: 'pointer',
                  paddingRight: '48px'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = 'none';
                  e.currentTarget.style.borderColor = '#236383';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(35, 99, 131, 0.1)';
                  e.currentTarget.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#f8fafc';
                }}
                required
              >
                <option value="">Select location</option>
                {hosts.map(host => (
                  <option key={host.id} value={host.name}>{host.name}</option>
                ))}
                <option value="other">Other (New Location)</option>
              </select>
              <ChevronDown 
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '20px',
                  height: '20px',
                  color: '#64748b',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Custom Location Input */}
        {showCustomLocation && (
          <div style={{ marginTop: '20px' }}>
            <label style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#646464',
              display: 'block',
              marginBottom: '8px'
            }}>
              New Location Name
            </label>
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter new location name"
              style={inputStyle}
              onMouseEnter={handleInputMouseEnter}
              onMouseLeave={handleInputMouseLeave}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required={showCustomLocation}
            />
          </div>
        )}
      </div>

      {/* Individual Sandwiches */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#334155'
          }}>
            Individual Sandwiches
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    background: '#f1f5f9',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '4px'
                  }}
                >
                  <Info style={{ fontSize: '12px', color: '#64748b', width: '12px', height: '12px' }} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '400', 
                  color: '#94a3b8',
                  fontStyle: 'italic'
                }}>Do not include group totals here.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <input
          type="number"
          min="0"
          value={individualCount}
          onChange={(e) => setIndividualCount(e.target.value)}
          placeholder="0"
          style={{ ...inputStyle, width: '128px' }}
          onMouseEnter={handleInputMouseEnter}
          onMouseLeave={handleInputMouseLeave}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      {/* Group Sandwiches */}
      <div style={{ 
        marginBottom: '32px',
        background: '#f8fafc',
        border: '2px dashed #e2e8f0',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#334155',
            margin: '0'
          }}>
            Group Collections
          </h3>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: '400', 
            color: '#64748b',
            margin: '0',
            fontStyle: 'italic'
          }}>
            Optional — enter group totals separately below.
          </p>
        </div>

        {groups.map((group, i) => (
          <div
            key={group.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '12px'
            }}
          >
            <input
              type="text"
              placeholder="Group name"
              value={group.name}
              onChange={(e) => {
                const newGroups = [...groups];
                newGroups[i].name = e.target.value;
                setGroups(newGroups);
              }}
              style={{ ...inputStyle, flex: '1' }}
              onMouseEnter={handleInputMouseEnter}
              onMouseLeave={handleInputMouseLeave}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <input
              type="number"
              placeholder="Count"
              min="0"
              value={group.count}
              onChange={(e) => {
                const newGroups = [...groups];
                newGroups[i].count = parseInt(e.target.value) || 0;
                setGroups(newGroups);
              }}
              style={{ ...inputStyle, width: '100px' }}
              onMouseEnter={handleInputMouseEnter}
              onMouseLeave={handleInputMouseLeave}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <button
              type="button"
              onClick={() => removeGroup(group.id)}
              style={{
                width: '44px',
                height: '44px',
                background: '#fee2e2',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fecaca';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fee2e2';
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px', color: '#ef4444' }} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addGroup}
          style={{
            background: 'none',
            border: 'none',
            color: '#236383',
            fontWeight: '600',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '8px',
            width: '100%',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(35, 99, 131, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> Add Group
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitMutation.isPending || createHostMutation.isPending}
        style={{
          width: '100%',
          height: '56px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          letterSpacing: '0.5px',
          textTransform: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          background: '#236383',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          opacity: (submitMutation.isPending || createHostMutation.isPending) ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!submitMutation.isPending && !createHostMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 12px -2px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.background = '#1b4d66';
          }
        }}
        onMouseLeave={(e) => {
          if (!submitMutation.isPending && !createHostMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.background = '#236383';
          }
        }}
        onMouseDown={(e) => {
          if (!submitMutation.isPending && !createHostMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
        onMouseUp={(e) => {
          if (!submitMutation.isPending && !createHostMutation.isPending) {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
      >
        {(submitMutation.isPending || createHostMutation.isPending) ? 'Submitting...' : 'Submit Collection'}
      </button>

      {/* Display total */}
      {calculateTotal() > 0 && (
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center',
          fontSize: '14px',
          color: '#64748b'
        }}>
          Total Sandwiches: <strong style={{ color: '#236383' }}>{calculateTotal()}</strong>
        </div>
      )}
    </form>
  );
}