import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Upload, Eye, Download, Link } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Meeting, MeetingMinutes } from "@shared/schema";

export default function MeetingMinutes() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isUploadingMinutes, setIsUploadingMinutes] = useState(false);
  const [viewingMinutes, setViewingMinutes] = useState<MeetingMinutes | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "google_docs">("file");
  const { toast } = useToast();

  // Fetch all meetings
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ["/api/meetings"],
  });

  // Fetch all meeting minutes
  const { data: minutes = [], isLoading: minutesLoading } = useQuery({
    queryKey: ["/api/meeting-minutes"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/meeting-minutes/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload minutes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-minutes"] });
      setIsUploadingMinutes(false);
      setSelectedMeetingId(null);
      setSelectedFile(null);
      setGoogleDocsUrl("");
      toast({ title: "Meeting minutes uploaded successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingId) return;

    const selectedMeeting = (meetings as Meeting[]).find((m: Meeting) => m.id === selectedMeetingId);
    if (!selectedMeeting) return;

    const formData = new FormData();
    formData.append("meetingId", selectedMeetingId.toString());
    formData.append("title", selectedMeeting.title);
    formData.append("date", selectedMeeting.date);

    if (uploadType === "file" && selectedFile) {
      formData.append("file", selectedFile);
      formData.append("summary", `Uploaded file: ${selectedFile.name}`);
    } else if (uploadType === "google_docs" && googleDocsUrl) {
      formData.append("googleDocsUrl", googleDocsUrl);
      formData.append("summary", `Google Docs link: ${googleDocsUrl}`);
    } else {
      toast({ title: "Please select a file or provide a Google Docs URL", variant: "destructive" });
      return;
    }

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast({ 
          title: "Invalid file type", 
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive" 
        });
        e.target.value = '';
      }
    }
  };

  const handleUploadMinutesForMeeting = (meeting: Meeting) => {
    setSelectedMeetingId(meeting.id);
    setIsUploadingMinutes(true);
    setSelectedFile(null);
    setGoogleDocsUrl("");
    setUploadType("file");
  };

  const getMeetingMinutes = (meetingId: number) => {
    const meeting = (meetings as Meeting[]).find((m: Meeting) => m.id === meetingId);
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
            {viewingMinutes.summary.includes("Google Docs link:") && (
              <div>
                <Button variant="outline" asChild>
                  <a href={viewingMinutes.summary.split("Google Docs link: ")[1]} target="_blank" rel="noopener noreferrer">
                    <Link className="w-4 h-4 mr-2" />
                    Open in Google Docs
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show upload minutes form
  if (isUploadingMinutes && selectedMeetingId) {
    const selectedMeeting = (meetings as Meeting[]).find((m: Meeting) => m.id === selectedMeetingId);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => {
            setIsUploadingMinutes(false);
            setSelectedMeetingId(null);
          }}>
            ← Back to Meetings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Meeting Minutes</CardTitle>
            <CardDescription>
              Upload minutes for: {selectedMeeting?.title} - {selectedMeeting && formatMeetingDateTime(selectedMeeting)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Upload Type Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Upload Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={uploadType === "file"}
                      onChange={(e) => setUploadType(e.target.value as "file" | "google_docs")}
                      className="mr-2"
                    />
                    Upload File
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="google_docs"
                      checked={uploadType === "google_docs"}
                      onChange={(e) => setUploadType(e.target.value as "file" | "google_docs")}
                      className="mr-2"
                    />
                    Google Docs Link
                  </label>
                </div>
              </div>

              {uploadType === "file" ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Document (.pdf, .doc, .docx)
                  </label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Docs URL
                  </label>
                  <Input
                    type="url"
                    value={googleDocsUrl}
                    onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Make sure the document is shared with appropriate permissions
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" disabled={uploadMutation.isPending}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadMutation.isPending ? "Uploading..." : "Upload Minutes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsUploadingMinutes(false);
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
          <p className="text-gray-600 dark:text-gray-400">Upload and view minutes for scheduled meetings</p>
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
                        onClick={() => handleUploadMinutesForMeeting(meeting)}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload Minutes
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