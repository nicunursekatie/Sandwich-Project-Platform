import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Meeting, MeetingMinutes } from "@shared/schema";

export default function MeetingMinutes() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isCreatingMinutes, setIsCreatingMinutes] = useState(false);
  const [viewingMinutes, setViewingMinutes] = useState<MeetingMinutes | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    summary: "",
    color: "blue"
  });
  const { toast } = useToast();

  // Fetch all meetings
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings"],
  });

  // Fetch all meeting minutes
  const { data: minutes = [], isLoading: minutesLoading } = useQuery({
    queryKey: ["/api/meeting-minutes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/meeting-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create minutes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-minutes"] });
      setIsCreatingMinutes(false);
      setSelectedMeetingId(null);
      setFormData({
        title: "",
        date: "",
        summary: "",
        color: "blue"
      });
      toast({ title: "Meeting minutes created successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeetingId) {
      const selectedMeeting = meetings.find((m: Meeting) => m.id === selectedMeetingId);
      if (selectedMeeting) {
        createMutation.mutate({
          ...formData,
          title: selectedMeeting.title,
          date: selectedMeeting.date,
        });
      }
    }
  };

  const handleCreateMinutesForMeeting = (meeting: Meeting) => {
    setSelectedMeetingId(meeting.id);
    setFormData({
      title: meeting.title,
      date: meeting.date,
      summary: "",
      color: "blue"
    });
    setIsCreatingMinutes(true);
  };

  const getMeetingMinutes = (meetingId: number) => {
    const meeting = meetings.find((m: Meeting) => m.id === meetingId);
    if (!meeting) return null;
    
    return (minutes as MeetingMinutes[]).find(m => 
      m.title === meeting.title && m.date === meeting.date
    );
  };

  const formatMeetingDateTime = (meeting: Meeting) => {
    const date = new Date(meeting.date);
    const dateStr = date.toLocaleDateString();
    const timeStr = meeting.time || "Time TBD";
    return `${dateStr} at ${timeStr}`;
  };

  if (meetingsLoading || minutesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Show individual meeting minutes view
  if (viewingMinutes) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setViewingMinutes(null)}>
            ← Back to Meetings
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingMinutes.title}
            </CardTitle>
            <CardDescription>
              Meeting Date: {new Date(viewingMinutes.date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {viewingMinutes.summary}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show create minutes form
  if (isCreatingMinutes && selectedMeetingId) {
    const selectedMeeting = meetings.find((m: Meeting) => m.id === selectedMeetingId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => {
            setIsCreatingMinutes(false);
            setSelectedMeetingId(null);
          }}>
            ← Back to Meetings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Meeting Minutes</CardTitle>
            <CardDescription>
              Create minutes for: {selectedMeeting?.title} - {selectedMeeting && formatMeetingDateTime(selectedMeeting)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Summary</label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Enter detailed meeting summary, key discussions, decisions made, and action items..."
                  rows={8}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color Tag</label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Minutes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreatingMinutes(false);
                  setSelectedMeetingId(null);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show main meetings list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting Minutes</h1>
          <p className="text-gray-600 dark:text-gray-400">View and create minutes for scheduled meetings</p>
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid gap-4">
        {(meetings as Meeting[]).map((meeting: Meeting) => {
          const existingMinutes = getMeetingMinutes(meeting.id);
          
          return (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {meeting.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatMeetingDateTime(meeting)}
                      </span>
                      <Badge variant="secondary">{meeting.type.replace('_', ' ')}</Badge>
                      <Badge variant={meeting.status === 'completed' ? 'default' : 'outline'}>
                        {meeting.status}
                      </Badge>
                    </CardDescription>
                    {meeting.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {meeting.description}
                      </p>
                    )}
                    {meeting.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Location: {meeting.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {existingMinutes ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setViewingMinutes(existingMinutes)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Minutes
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCreateMinutesForMeeting(meeting)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Create Minutes
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {(meetings as Meeting[]).length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meetings scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for scheduled meetings</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}