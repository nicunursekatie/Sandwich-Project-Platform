import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, FileText, Plus, Edit, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MeetingMinutes {
  id: number;
  meetingDate: string;
  attendees: string[];
  agenda: string;
  notes: string;
  actionItems: string[];
  nextMeetingDate?: string;
  createdAt: string;
}

export default function MeetingMinutes() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    meetingDate: "",
    attendees: "",
    agenda: "",
    notes: "",
    actionItems: "",
    nextMeetingDate: ""
  });
  const { toast } = useToast();

  const { data: minutes = [], isLoading } = useQuery({
    queryKey: ["/api/meeting-minutes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/meeting-minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          attendees: data.attendees.split(",").map((a: string) => a.trim()).filter(Boolean),
          actionItems: data.actionItems.split("\n").filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Failed to create minutes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-minutes"] });
      setIsCreating(false);
      setFormData({
        meetingDate: "",
        attendees: "",
        agenda: "",
        notes: "",
        actionItems: "",
        nextMeetingDate: ""
      });
      toast({ title: "Meeting minutes created successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting Minutes</h1>
          <p className="text-gray-600 dark:text-gray-400">Record and track meeting discussions and action items</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="self-start">
          <Plus className="w-4 h-4 mr-2" />
          New Minutes
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Meeting Minutes</CardTitle>
            <CardDescription>Document the meeting details and outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Meeting Date</label>
                  <Input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Next Meeting Date (Optional)</label>
                  <Input
                    type="date"
                    value={formData.nextMeetingDate}
                    onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Attendees (comma-separated)</label>
                <Input
                  value={formData.attendees}
                  onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                  placeholder="John Doe, Jane Smith, Bob Johnson"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Agenda</label>
                <Textarea
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="Meeting agenda and topics covered"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Detailed discussion notes and decisions made"
                  rows={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action Items (one per line)</label>
                <Textarea
                  value={formData.actionItems}
                  onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                  placeholder="Action item 1&#10;Action item 2&#10;Action item 3"
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Minutes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Minutes List */}
      <div className="grid gap-6">
        {(minutes as MeetingMinutes[]).map((minute: MeetingMinutes) => (
          <Card key={minute.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Meeting - {new Date(minute.meetingDate).toLocaleDateString()}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {minute.attendees.length} attendees
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(minute.createdAt).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Attendees</h4>
                <div className="flex flex-wrap gap-2">
                  {minute.attendees.map((attendee, index) => (
                    <Badge key={index} variant="secondary">{attendee}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Agenda</h4>
                <p className="text-gray-600 dark:text-gray-400">{minute.agenda}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{minute.notes}</p>
              </div>
              {minute.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {minute.actionItems.map((item, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {minute.nextMeetingDate && (
                <div>
                  <h4 className="font-semibold mb-2">Next Meeting</h4>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {new Date(minute.nextMeetingDate).toLocaleDateString()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(minutes as MeetingMinutes[]).length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No meeting minutes yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start documenting your meetings to track progress and action items</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Minutes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}