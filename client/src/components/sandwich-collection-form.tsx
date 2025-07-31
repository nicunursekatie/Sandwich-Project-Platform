import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function SandwichCollectionForm({ onSuccess }) {
  const [date, setDate] = useState("2025-07-31");
  const [location, setLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [individualCount, setIndividualCount] = useState("");
  const [groups, setGroups] = useState([]);
  
  const queryClient = useQueryClient();

  // Fetch active hosts
  const { data: hosts = [] } = useQuery({
    queryKey: ['/api/hosts'],
    select: (data) => data.filter((host) => host.status === 'active')
  });

  // Create new host mutation
  const createHostMutation = useMutation({
    mutationFn: async (hostName) => {
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
    mutationFn: async (collectionData) => {
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
  const handleLocationChange = (value) => {
    setLocation(value);
    setShowCustomLocation(value === "other");
    if (value !== "other") {
      setCustomLocation("");
    }
  };

  // Calculate total
  const calculateTotal = () => {
    const individual = parseInt(individualCount) || 0;
    const groupTotal = groups.reduce((sum, group) => sum + (parseInt(group.count) || 0), 0);
    return individual + groupTotal;
  };

  // Add group
  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: "", count: 0 }]);
  };

  // Remove group
  const removeGroup = (id) => {
    setGroups(groups.filter((g) => g.id !== id));
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
        console.error('Failed to create new host:', error);
        return;
      }
    }

    const collectionData = {
      collectionDate: date,
      hostName: finalLocation,
      individualSandwiches: parseInt(individualCount) || 0,
      groupSandwiches: groups.reduce((sum, group) => sum + (parseInt(group.count) || 0), 0),
      groupCollections: groups.filter(g => g.name.trim() && g.count > 0),
      notes: `Submitted via collection form on ${new Date().toLocaleString()}`
    };

    submitMutation.mutate(collectionData);
  };

  // Container styles
  const containerStyle = {
    maxWidth: '420px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)'
  };

  // Compact header with total
  const headerStyle = {
    background: 'linear-gradient(135deg, #236383 0%, #007E8C 100%)',
    color: 'white',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const headerLeftStyle = {
    flex: 1
  };

  const h1Style = {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '1px'
  };

  const headerPStyle = {
    fontSize: '12px',
    fontWeight: '300',
    opacity: 0.9,
    margin: 0
  };

  const totalBadgeStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    padding: '6px 12px',
    textAlign: 'center',
    minWidth: '70px'
  };

  const totalLabelStyle = {
    fontSize: '10px',
    opacity: 0.8,
    marginBottom: '1px'
  };

  const totalNumberStyle = {
    fontSize: '20px',
    fontWeight: '700'
  };

  // Compact form container
  const formContainerStyle = {
    padding: '18px'
  };

  const formSectionStyle = {
    marginBottom: '16px'
  };

  const sectionTitleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#236383',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px'
  };

  const formRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '500',
    color: '#989393'
  };

  // Compact input styling
  const inputStyle = {
    height: '32px',
    padding: '0 10px',
    border: '1px solid #E9E6E6',
    borderRadius: '5px',
    fontSize: '13px',
    fontFamily: 'Roboto, sans-serif',
    transition: 'all 0.2s ease',
    background: 'white',
    color: '#646464'
  };

  const individualInputStyle = {
    ...inputStyle,
    width: '85px',
    fontWeight: '600',
    color: '#236383',
    fontSize: '16px',
    textAlign: 'center'
  };

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23989393' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '28px',
    cursor: 'pointer'
  };

  // Super compact groups section
  const groupsContainerStyle = {
    background: '#FAFAFA',
    borderRadius: '6px',
    padding: '12px',
    border: '1px solid #E9E6E6'
  };

  const groupsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  };

  const groupItemStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 60px 28px',
    gap: '6px',
    marginBottom: '6px',
    alignItems: 'center'
  };

  const groupInputStyle = {
    ...inputStyle,
    height: '28px',
    padding: '0 8px',
    fontSize: '12px'
  };

  const removeBtnStyle = {
    width: '28px',
    height: '28px',
    background: '#FFE5E5',
    border: 'none',
    borderRadius: '4px',
    color: '#E74C3C',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'all 0.2s ease'
  };

  const addGroupBtnStyle = {
    padding: '6px 10px',
    background: 'transparent',
    border: '1px dashed #236383',
    borderRadius: '4px',
    color: '#236383',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Roboto, sans-serif'
  };

  // Compact submit section
  const submitSectionStyle = {
    padding: '16px 18px',
    borderTop: '1px solid #E9E6E6',
    display: 'flex',
    justifyContent: 'flex-end'
  };

  const submitBtnStyle = {
    background: '#FBAD3F',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '5px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'Roboto, sans-serif'
  };

  const helperTextStyle = {
    fontSize: '10px',
    color: '#989393',
    marginTop: '3px'
  };

  const emptyStateStyle = {
    fontSize: '11px',
    color: '#989393',
    textAlign: 'center',
    padding: '12px 0',
    fontStyle: 'italic'
  };

  // Custom location input style
  const customLocationInputStyle = {
    ...inputStyle,
    marginTop: '6px'
  };

  // Event handlers
  const handleInputFocus = (e) => {
    e.currentTarget.style.outline = 'none';
    e.currentTarget.style.borderColor = '#236383';
  };

  const handleInputBlur = (e) => {
    e.currentTarget.style.borderColor = '#E9E6E6';
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
          <h3 style={sectionTitleStyle}>Collection Details</h3>
          <div style={formRowStyle}>
            <div style={formGroupStyle}>
              <label htmlFor="date" style={labelStyle}>Date</label>
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
              <label htmlFor="location" style={labelStyle}>Location</label>
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
                {hosts.map(host => (
                  <option key={host.id} value={host.name}>{host.name}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {/* Custom Location Input */}
          {showCustomLocation && (
            <div style={formGroupStyle}>
              <label htmlFor="custom-location" style={labelStyle}>New Location Name</label>
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
          <h3 style={sectionTitleStyle}>Individual Sandwiches</h3>
          <div>
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
            <p style={helperTextStyle}>Count only individual sandwiches here</p>
          </div>
        </div>

        {/* Group Collections */}
        <div style={{ ...formSectionStyle, marginBottom: 0 }}>
          <div style={groupsHeaderStyle}>
            <h3 style={sectionTitleStyle}>Group Collections</h3>
            <button
              type="button"
              onClick={addGroup}
              style={addGroupBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#236383';
                e.currentTarget.style.background = 'rgba(35, 99, 131, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#236383';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              + Add Group
            </button>
          </div>
          
          <div style={groupsContainerStyle}>
            {groups.length === 0 ? (
              <p style={emptyStateStyle}>
                Click "Add Group" to record group collections
              </p>
            ) : (
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
                      style={{ ...groupInputStyle, textAlign: 'center', fontWeight: '600', color: '#236383' }}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                    <button
                      type="button"
                      onClick={() => removeGroup(group.id)}
                      style={removeBtnStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E74C3C';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#FFE5E5';
                        e.currentTarget.style.color = '#E74C3C';
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div style={submitSectionStyle}>
        <button
          style={{
            ...submitBtnStyle,
            opacity: (submitMutation.isPending || createHostMutation.isPending) ? 0.6 : 1,
            cursor: (submitMutation.isPending || createHostMutation.isPending) ? 'not-allowed' : 'pointer'
          }}
          onClick={handleSubmit}
          disabled={submitMutation.isPending || createHostMutation.isPending}
          onMouseEnter={(e) => {
            if (!submitMutation.isPending && !createHostMutation.isPending) {
              e.currentTarget.style.background = '#F39C12';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!submitMutation.isPending && !createHostMutation.isPending) {
              e.currentTarget.style.background = '#FBAD3F';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {(submitMutation.isPending || createHostMutation.isPending) ? 'Submitting...' : 'Submit Collection'}
        </button>
      </div>
    </div>
  );
}