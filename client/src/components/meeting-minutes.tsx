import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus, Maximize2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MeetingMinutesModal from "@/components/modals/meeting-minutes-modal";
import AddMeetingModal from "@/components/modals/add-meeting-modal";
import type { MeetingMinutes } from "@shared/schema";

export default function MeetingMinutes() {
  const [showAllMinutes, setShowAllMinutes] = useState(false);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const { toast } = useToast();

  const { data: minutes = [], isLoading } = useQuery<MeetingMinutes[]>({
    queryKey: ["/api/meeting-minutes"]
  });

  // Handle clicking on a meeting minute to view document
  const handleViewMinutes = async (minute: MeetingMinutes) => {
    if (minute.filePath) {
      try {
        // Try to download/view the file
        const response = await fetch(`/api/meeting-minutes/${minute.id}/file`);
        if (!response.ok) {
          throw new Error('File not found');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open in new tab for viewing
        window.open(url, '_blank');
        
        toast({ 
          title: "Opening document",
          description: `Opening ${minute.fileName || 'meeting minutes'}`
        });
      } catch (error) {
        console.error('Error accessing meeting minutes:', error);
        toast({
          title: "Unable to access document",
          description: "The meeting minutes document could not be opened. It may have been moved or deleted.",
          variant: "destructive"
        });
      }
    } else if (minute.summary.includes("Google Docs link:")) {
      // Extract Google Docs URL and open it
      const googleDocsMatch = minute.summary.match(/https:\/\/docs\.google\.com[^\s)]+/);
      if (googleDocsMatch) {
        window.open(googleDocsMatch[0], '_blank');
        toast({ 
          title: "Opening Google Docs",
          description: "Opening meeting minutes in Google Docs"
        });
      }
    } else {
      // Show summary in modal for text-only minutes
      setShowAllMinutes(true);
    }
  };

  const getBorderColor = (color: string) => {
    switch (color) {
      case "blue": return "border-l-blue-500";
      case "green": return "border-l-green-500";
      case "amber": return "border-l-amber-500";
      case "purple": return "border-l-purple-500";
      default: return "border-l-blue-500";
    }
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
              <div 
                key={minute.id} 
                className={`border-l-4 ${getBorderColor(minute.color)} pl-4 cursor-pointer hover:bg-gray-50 p-3 rounded-r transition-colors`}
                onClick={() => handleViewMinutes(minute)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900">{minute.title}</h3>
                    {minute.filePath ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : minute.summary.includes("Google Docs link:") ? (
                      <ExternalLink className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                  <span className="text-sm text-slate-500">{minute.date}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                  {minute.summary.length > 150 ? `${minute.summary.substring(0, 150)}...` : minute.summary}
                </p>
                <div className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                  Click to view full meeting minutes →
                </div>
              </div>
            ))}
          </div>
          

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
