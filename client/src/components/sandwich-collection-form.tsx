// Modernized Sandwich Collection Form — Final Polish
// Incorporates deep blue (#236383), gold (#FBAD3F), and teal (#007E8C)

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Info, Plus, Trash2, Sandwich } from "lucide-react";
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

  const addGroup = () => {
    setGroups([...groups, { id: Date.now().toString(), name: "", count: 0 }]);
  };

  const removeGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id));
  };

  return (
    <div className="mx-auto" style={{ 
      maxWidth: '480px', 
      padding: '24px', 
      background: '#FFFFFF', 
      borderRadius: '16px', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      margin: '0 auto'
    }}>
      <form className="w-full space-y-6 text-[#646464] font-roboto">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-[#236383] flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl border border-gray-200 shadow-sm bg-white flex items-center justify-center mr-2">
            <img
              src={sandwichLogo}
              alt="Sandwich Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          Submit Collection
        </h1>
        <p className="text-sm text-gray-500">
          We count each sandwich—because every meal matters.
        </p>
      </div>

      {/* Collection Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-[#007E8C]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="rounded-xl border-gray-300 text-sm focus:ring-2 focus:ring-[#007E8C]">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Church">Church</SelectItem>
                <SelectItem value="School">School</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Individual Sandwiches */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="individualCount" className="text-sm font-medium">
            Individual Sandwiches
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-[#FBAD3F]" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Do not include group totals here.</p>
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
          className="rounded-xl border-gray-300 text-sm w-32 focus:ring-2 focus:ring-[#007E8C]"
        />
      </div>

      {/* Group Sandwiches */}
      <div className="space-y-3">
        <div>
          <h3 className="text-[#236383] font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Group Sandwiches
          </h3>
          <p className="text-xs text-gray-500 italic">
            Optional — enter group totals separately below.
          </p>
        </div>

        {groups.map((group, i) => (
          <div
            key={group.id}
            className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center"
          >
            <Input
              placeholder="Group name"
              value={group.name}
              onChange={(e) => {
                const newGroups = [...groups];
                newGroups[i].name = e.target.value;
                setGroups(newGroups);
              }}
              className="rounded-xl col-span-3 border-gray-300 text-sm focus:ring-2 focus:ring-[#007E8C]"
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
              className="rounded-xl col-span-1 border-gray-300 text-sm focus:ring-2 focus:ring-[#007E8C]"
            />
            <Button
              type="button"
              onClick={() => removeGroup(group.id)}
              variant="outline"
              className="col-span-1 text-[#A31C41] border-[#A31C41] hover:bg-[#fce8ec] hover:text-[#8b1e35] h-9"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          onClick={addGroup}
          className="w-full bg-[#FBAD3F] text-[#236383] hover:bg-[#f4a530] rounded-xl font-semibold h-10 shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Group
        </Button>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-[#236383] text-white hover:bg-[#1b4d66] font-semibold rounded-xl h-11 shadow-md"
      >
        Submit Collection
      </Button>
      </form>
    </div>
  );
}
