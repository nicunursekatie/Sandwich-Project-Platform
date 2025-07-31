// Modernized Sandwich Collection Form — Final Polish
// Incorporates deep blue (#236383), gold (#FBAD3F), and teal (#007E8C)

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Info, Plus, Trash2, Sandwich, ChevronDown } from "lucide-react";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Host } from "@shared/schema";

interface SandwichCollectionFormProps {
  onSuccess?: () => void;
}

export default function SandwichCollectionForm({ onSuccess }: SandwichCollectionFormProps) {
  const [date, setDate] = useState("2025-07-31");
  const [location, setLocation] = useState("");
  const [individualCount, setIndividualCount] = useState("");
  const [groups, setGroups] = useState([{ id: "1", name: "", count: 0 }]);

  // Input styling with interaction states
  const inputStyle = {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
    transition: 'all 0.2s ease',
    fontSize: '16px',
    height: '48px'
  };

  // Date input styling - removes default calendar icon
  const dateInputStyle = {
    ...inputStyle,
    paddingRight: '44px', // Make room for custom icon
    WebkitAppearance: 'none' as const,
    MozAppearance: 'textfield' as const,
  };

  // Additional CSS to remove browser calendar icon and customize select
  const customInputCSS = `
    input[type="date"]::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    }
    input[type="date"]::-webkit-inner-spin-button {
      display: none;
      -webkit-appearance: none;
    }
    input[type="date"]::-webkit-clear-button {
      display: none;
      -webkit-appearance: none;
    }
    
    /* Custom select styling */
    .custom-select-trigger {
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      background-image: none !important;
      padding-right: 48px !important;
    }
    
    .custom-select-trigger::-ms-expand {
      display: none;
    }
  `;

  // Custom select trigger styling
  const selectTriggerStyle = {
    ...inputStyle,
    paddingRight: '48px', // Make room for custom icon
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'none' as const,
    backgroundImage: 'none',
  };

  const handleInputMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#cbd5e1';
    e.currentTarget.style.background = '#ffffff';
  };

  const handleInputMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (e.currentTarget !== document.activeElement) {
      e.currentTarget.style.borderColor = '#e2e8f0';
      e.currentTarget.style.background = '#f8fafc';
    }
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

  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: "", count: 0 }]);
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  return (
    <>
      <style>{customInputCSS}</style>
      <div className="mx-auto" style={{ 
        maxWidth: '480px', 
        padding: '24px', 
        background: '#FFFFFF', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        margin: '0 auto'
      }}>
      <form className="w-full text-[#646464] font-roboto">
      {/* Header */}
      <div className="text-center">
        <h1 className="flex items-center justify-center" style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1e293b',
          marginBottom: '8px'
        }}>
          <div className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm bg-white flex items-center justify-center mr-2">
            <img
              src={sandwichLogo}
              alt="Sandwich Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          Submit Collection
        </h1>
        <p style={{ 
          fontSize: '16px', 
          fontWeight: '400', 
          color: '#64748b',
          marginBottom: '32px'
        }}>
          We count each sandwich—because every meal matters.
        </p>
      </div>

      {/* Collection Details */}
      <div style={{ marginBottom: '32px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#334155',
              marginBottom: '8px',
              display: 'block'
            }}>Date</Label>
            <div style={{ position: 'relative' }}>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={dateInputStyle}
                onMouseEnter={handleInputMouseEnter}
                onMouseLeave={handleInputMouseLeave}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <Calendar 
                className="w-4 h-4"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location" style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#334155',
              marginBottom: '8px',
              display: 'block'
            }}>Location</Label>
            <div style={{ position: 'relative' }}>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger 
                  className="custom-select-trigger"
                  style={selectTriggerStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#f8fafc';
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
                >
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Church">Church</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
      </div>

      {/* Individual Sandwiches */}
      <div style={{ marginBottom: '32px' }}>
        <div className="flex items-center gap-2">
          <Label htmlFor="individualCount" style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#334155'
          }}>
            Individual Sandwiches
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-[#FBAD3F]" />
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
        <Input
          id="individualCount"
          type="number"
          min="0"
          value={individualCount}
          onChange={(e) => setIndividualCount(e.target.value)}
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
        border: '1px dashed #e2e8f0',
        borderRadius: '12px',
        padding: '20px'
      }}>
        <div>
          <h3 className="flex items-center gap-1" style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#334155',
            marginBottom: '8px'
          }}>
            <Plus style={{ 
              color: '#236383', 
              fontSize: '20px', 
              fontWeight: '600',
              width: '20px',
              height: '20px'
            }} /> Group Sandwiches
          </h3>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '400', 
            color: '#94a3b8',
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
            <Input
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
            <Input
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

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-[#236383] text-white hover:bg-[#1b4d66] font-semibold rounded-xl shadow-md"
        style={{ padding: '16px 24px' }}
      >
        Submit Collection
      </Button>
      </form>
    </div>
    </>
  );
}
