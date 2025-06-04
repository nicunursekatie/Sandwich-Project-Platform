import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MeetingMinutesModal from "@/components/modals/meeting-minutes-modal";
import AddMeetingModal from "@/components/modals/add-meeting-modal";
import type { MeetingMinutes } from "@shared/schema";

export default function MeetingMinutes() {
  const [showAllMinutes, setShowAllMinutes] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);

  const { data: minutes = [], isLoading } = useQuery<MeetingMinutes[]>({
    queryKey: ["/api/meeting-minutes", { limit: 3 }],
    queryFn: async () => {
      const response = await fetch("/api/meeting-minutes?limit=3", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch meeting minutes");
      return response.json();
    }
  });

  const getBorderColor = (color: string) => {
    switch (color) {
      case "blue": return "border-l-blue-500";
      case "green": return "border-l-green-500";
      case "amber": return "border-l-amber-500";
      case "purple": return "border-l-purple-500";
      default: return "border-l-blue-500";
    }
  };

  const truncateSummary = (summary: string, maxLength: number = 60) => {
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border-l-4 border-slate-200 pl-4">
              <div className="h-4 bg-slate-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <ClipboardList className="text-purple-500 mr-2 w-5 h-5" />
            Meeting Minutes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => setShowAddMeeting(true)}
          >
            <Plus className="mr-1 w-4 h-4" />
            Add Entry
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {minutes.map((minute) => (
              <div key={minute.id} className={`border-l-4 ${getBorderColor(minute.color)} pl-4`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-slate-900">{minute.title}</h3>
                  <span className="text-sm text-slate-500">{minute.date}</span>
                </div>
                <p className="text-sm text-slate-600">{truncateSummary(minute.summary)}</p>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            className="mt-4 w-full justify-center border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            onClick={() => setShowAllMinutes(true)}
          >
            <Maximize2 className="mr-2 w-4 h-4" />
            View All Minutes
          </Button>
        </div>
      </div>

      <MeetingMinutesModal 
        open={showAllMinutes} 
        onOpenChange={setShowAllMinutes} 
      />
      
      <AddMeetingModal 
        open={showAddMeeting} 
        onOpenChange={setShowAddMeeting} 
      />
    </>
  );
}
