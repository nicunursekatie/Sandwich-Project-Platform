import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, Upload, MessageSquare, FileText, File, Edit, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AgendaItem {
  id: number;
  submittedBy: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  finalAgenda: string;
  status: "planning" | "agenda_set" | "completed";
}

export default function MeetingAgenda() {
  const { toast } = useToast();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [newItem, setNewItem] = useState({
    submittedBy: "",
    title: "",
    description: ""
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { data: agendaItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/agenda-items']
  });

  const { data: currentMeeting } = useQuery({
    queryKey: ['/api/current-meeting']
  });

  const submitItemMutation = useMutation({
    mutationFn: async (data: typeof newItem) => {
      return apiRequest('/api/agenda-items', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agenda-items'] });
      setNewItem({ submittedBy: "", title: "", description: "" });
      setIsSubmitModalOpen(false);
      toast({
        title: "Agenda item submitted",
        description: "Your agenda item has been submitted for review.",
      });
    }
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "approved" | "rejected" }) => {
      return apiRequest(`/api/agenda-items/${id}`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agenda-items'] });
      toast({
        title: "Status updated",
        description: "Agenda item status has been updated.",
      });
    }
  });

  const uploadAgendaMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('agenda', file);
      return apiRequest('/api/meetings/1/upload-agenda', 'POST', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-meeting'] });
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      toast({
        title: "Agenda uploaded",
        description: "The final meeting agenda has been uploaded.",
      });
    }
  });

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.submittedBy || !newItem.title) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and agenda item title.",
        variant: "destructive"
      });
      return;
    }
    submitItemMutation.mutate(newItem);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadAgenda = () => {
    if (uploadedFile) {
      uploadAgendaMutation.mutate(uploadedFile);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (itemsLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Calendar className="text-blue-500 mr-3 w-6 h-6" />
            Meetings
          </h1>
        </div>
        
        {currentMeeting && (
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{currentMeeting.title}</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(currentMeeting.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentMeeting.time}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Submit Agenda Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent aria-describedby="submit-agenda-description">
                    <DialogHeader>
                      <DialogTitle>Submit Agenda Item</DialogTitle>
                    </DialogHeader>
                    <p id="submit-agenda-description" className="text-sm text-slate-600 mb-4">
                      Submit an item to be considered for the meeting agenda.
                    </p>
                    <form onSubmit={handleSubmitItem} className="space-y-4">
                      <div>
                        <Label htmlFor="submitted-by">Your Name *</Label>
                        <Input
                          id="submitted-by"
                          value={newItem.submittedBy}
                          onChange={(e) => setNewItem({ ...newItem, submittedBy: e.target.value })}
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-title">Agenda Item Title *</Label>
                        <Input
                          id="item-title"
                          value={newItem.title}
                          onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                          placeholder="Brief title for your agenda item"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea
                          id="item-description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder="Provide more details about this agenda item"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitItemMutation.isPending}>
                          {submitItemMutation.isPending ? "Submitting..." : "Submit Item"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Final Agenda
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submitted Items for Review */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <MessageSquare className="text-orange-500 mr-2 w-5 h-5" />
            Submitted Agenda Items
          </h2>
        </div>
        <div className="p-6">
          {agendaItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No agenda items submitted yet. Click "Submit Agenda Item" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {agendaItems.map((item) => (
                <Card key={item.id} className="border border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <User className="w-3 h-3" />
                          <span>{item.submittedBy}</span>
                          <span>•</span>
                          <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        {item.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatusMutation.mutate({ id: item.id, status: "approved" })}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemStatusMutation.mutate({ id: item.id, status: "rejected" })}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Final Agenda */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="text-green-500 mr-2 w-5 h-5" />
            Final Meeting Agenda
          </h2>
        </div>
        <div className="p-6">
          {currentMeeting?.finalAgenda ? (
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <File className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Uploaded Agenda</span>
              </div>
              <div className="text-sm text-slate-600">
                Final agenda file has been uploaded and is available for the meeting.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No final agenda uploaded yet. Upload the final agenda file to complete meeting preparation.
            </div>
          )}
        </div>
      </div>

      {/* Upload Agenda Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="upload-agenda-description">
          <DialogHeader>
            <DialogTitle>Upload Final Agenda</DialogTitle>
          </DialogHeader>
          <p id="upload-agenda-description" className="text-sm text-slate-600 mb-4">
            Upload the final meeting agenda file.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="agenda-upload">Agenda File</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="agenda-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload agenda file</span>
                      <input
                        id="agenda-upload"
                        name="agenda-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                </div>
              </div>
              {uploadedFile && (
                <p className="mt-2 text-sm text-green-600">Selected: {uploadedFile.name}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUploadAgenda} 
                disabled={!uploadedFile || uploadAgendaMutation.isPending}
              >
                {uploadAgendaMutation.isPending ? "Uploading..." : "Upload Agenda"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}