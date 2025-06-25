import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, FileText, Upload, Eye, Download, Link, Edit, Trash2, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DocumentViewer } from '@/components/DocumentViewer';
import type { Meeting, MeetingMinutes, InsertMeeting } from "@shared/schema";

export default function MeetingMinutes() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isUploadingMinutes, setIsUploadingMinutes] = useState(false);
  const [viewingMinutes, setViewingMinutes] = useState<MeetingMinutes | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [googleDocsUrl, setGoogleDocsUrl] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "google_docs">("file");
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [newMeetingData, setNewMeetingData] = useState({
    title: "",
    date: "",
    time: "",
    type: "core_team" as "core_team" | "board" | "committee" | "special",
    location: "",
    description: ""
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

  const deleteMeetingMutation = useMutation({
    mutationFn: async (meetingId: number) => {
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete meeting");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      toast({ title: "Meeting deleted successfully" });
    },
  });

  const deleteMinutesMutation = useMutation({
    mutationFn: async (minutesId: number) => {
      const response = await fetch(`/api/meeting-minutes/${minutesId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete meeting minutes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meeting-minutes"] });
      setViewingMinutes(null);
      toast({ title: "Meeting minutes deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting meeting minutes", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: InsertMeeting) => {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });
      if (!response.ok) throw new Error("Failed to create meeting");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setIsCreatingMeeting(false);
      setNewMeetingData({
        title: "",
        date: "",
        time: "",
        type: "core_team",
        location: "",
        description: ""
      });
      toast({ title: "Meeting created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating meeting", 
        description: error.message,
        variant: "destructive" 
      });
    }
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

  const handleDownloadFile = async (fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileName}`);
      if (!response.ok) {
        throw new Error('File not found');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "File downloaded successfully" });
    } catch (error) {
      console.error('Download error:', error);
      toast({ 
        title: "Download failed", 
        description: "Could not download the file. It may have been moved or deleted.",
        variant: "destructive" 
      });
    }
  };

  const handleEditMeeting = (meeting: Meeting) => {
    // For now, show a toast that edit functionality would open a modal
    toast({ 
      title: "Edit Meeting", 
      description: "Edit functionality will be available in the meeting calendar page" 
    });
  };

  const handleDeleteMeeting = (meetingId: number) => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      deleteMeetingMutation.mutate(meetingId);
    }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    const meetingData: InsertMeeting = {
      title: newMeetingData.title,
      date: newMeetingData.date,
      time: newMeetingData.time || "TBD",
      type: newMeetingData.type,
      location: newMeetingData.location || undefined,
      description: newMeetingData.description || undefined,
      status: "scheduled"
    };

    createMeetingMutation.mutate(meetingData);
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

  // Show create meeting form
  if (isCreatingMeeting) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setIsCreatingMeeting(false)}>
            ← Back to Meetings
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Meeting</CardTitle>
            <CardDescription>Schedule a new meeting for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMeeting} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Title *</label>
                <Input
                  type="text"
                  value={newMeetingData.title}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Core Team Meeting - Q3 Planning"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <Input
                    type="date"
                    value={newMeetingData.date}
                    onChange={(e) => setNewMeetingData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <Input
                    type="time"
                    value={newMeetingData.time}
                    onChange={(e) => setNewMeetingData(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="10:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Meeting Type</label>
                <Select 
                  value={newMeetingData.type} 
                  onValueChange={(value: "core_team" | "board" | "committee" | "special") => 
                    setNewMeetingData(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core_team">Core Team</SelectItem>
                    <SelectItem value="board">Board Meeting</SelectItem>
                    <SelectItem value="committee">Committee</SelectItem>
                    <SelectItem value="special">Special Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <Input
                  type="text"
                  value={newMeetingData.location}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Conference Room A or Virtual Meeting Link"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newMeetingData.description}
                  onChange={(e) => setNewMeetingData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Meeting agenda and topics to be discussed..."
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createMeetingMutation.isPending}>
                  {createMeetingMutation.isPending ? "Creating..." : "Create Meeting"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreatingMeeting(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show individual meeting minutes view
  if (viewingMinutes) {
    const isGoogleDocsLink = viewingMinutes.summary.startsWith("Google Docs link:");
    const isUploadedFile = viewingMinutes.summary.startsWith("Uploaded file:") || viewingMinutes.summary.startsWith("Document uploaded:");
    const extractionFailed = viewingMinutes.summary.includes("content extraction failed");
    const isPdfFile = viewingMinutes.summary && viewingMinutes.summary.includes("PDF content extraction will be available");
    const hasExtractedContent = viewingMinutes.summary && viewingMinutes.summary.trim() && !isPdfFile && !extractionFailed;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setViewingMinutes(null)}>
            ← Back to Meetings
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteMinutesMutation.mutate(viewingMinutes.id)}
            disabled={deleteMinutesMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteMinutesMutation.isPending ? "Deleting..." : "Delete Minutes"}
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {viewingMinutes.title}
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Meeting Date: {new Date(viewingMinutes.date).toLocaleDateString()}</span>
              {viewingMinutes.fileName && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadFile(viewingMinutes.fileName!)}
                  className="ml-4"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Type Indicator */}
            {isGoogleDocsLink && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Google Docs Document</span>
                </div>
                <Button variant="outline" asChild>
                  <a href={viewingMinutes.summary.split("Google Docs link: ")[1]} target="_blank" rel="noopener noreferrer">
                    <Link className="w-4 h-4 mr-2" />
                    Open in Google Docs
                  </a>
                </Button>
              </div>
            )}
            
            {hasExtractedContent && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-100">Document Content Extracted</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Content has been extracted and is displayed below
                </p>
              </div>
            )}
            
            {isPdfFile && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">PDF Document Uploaded</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  PDF uploaded successfully. Text extraction for PDFs will be available in a future update.
                </p>
              </div>
            )}
            
            {isUploadedFile && extractionFailed && !isPdfFile && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-orange-900 dark:text-orange-100">Document Uploaded</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  File was uploaded successfully but content could not be extracted for preview
                </p>
              </div>
            )}

            {/* Document Content */}
            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">Meeting Minutes Document</h4>
              {isGoogleDocsLink ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <p className="text-gray-600 dark:text-gray-400 italic text-center py-8">
                    This document is hosted on Google Docs. Click "Open in Google Docs" above to view the full content.
                  </p>
                </div>
              ) : viewingMinutes.fileName ? (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Document: {viewingMinutes.fileName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Click the download button above to view the full document.
                    </p>
                    <Button 
                      onClick={() => handleDownloadFile(viewingMinutes.fileName!)}
                      className="inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                  <div className="prose max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                      {viewingMinutes.summary}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
        <Button onClick={() => setIsCreatingMeeting(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Meeting
        </Button>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditMeeting(meeting)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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