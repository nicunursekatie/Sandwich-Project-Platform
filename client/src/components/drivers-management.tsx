import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Car, Plus, Send, Upload, Phone, Mail, Edit2, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  licenseNumber: string;
  availability: "available" | "busy" | "off-duty";
  zone: string;
}

export default function DriversManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    licenseNumber: "",
    availability: "available" as const,
    zone: ""
  });

  const [volunteerForm, setVolunteerForm] = useState({
    submittedBy: "",
    phone: "",
    email: "",
    licenseNumber: "",
    vehicleInfo: "",
    emergencyContact: "",
    emergencyPhone: "",
    agreementAccepted: false
  });

  const [agreementFile, setAgreementFile] = useState<File | null>(null);

  // Fetch drivers
  const { data: drivers = [], isLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Add driver mutation
  const addDriverMutation = useMutation({
    mutationFn: (driver: typeof newDriver) => apiRequest("/api/drivers", "POST", driver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setNewDriver({
        name: "",
        phone: "",
        email: "",
        vehicleType: "",
        licenseNumber: "",
        availability: "available",
        zone: ""
      });
      setIsAddModalOpen(false);
      toast({ title: "Driver added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add driver", variant: "destructive" });
    }
  });

  // Update driver mutation
  const updateDriverMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Driver> }) =>
      apiRequest(`/api/drivers/${id}`, "PATCH", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      setEditingDriver(null);
      toast({ title: "Driver updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update driver", variant: "destructive" });
    }
  });

  // Upload agreement mutation
  const uploadAgreementMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("agreement", file);
      return apiRequest("/api/driver-agreement/upload", "POST", formData);
    },
    onSuccess: () => {
      setAgreementFile(null);
      setIsAgreementModalOpen(false);
      toast({ title: "Agreement template uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload agreement", variant: "destructive" });
    }
  });

  // Submit volunteer agreement mutation
  const submitVolunteerMutation = useMutation({
    mutationFn: (data: typeof volunteerForm) =>
      apiRequest("/api/driver-agreement/submit", "POST", data),
    onSuccess: () => {
      setVolunteerForm({
        submittedBy: "",
        phone: "",
        email: "",
        licenseNumber: "",
        vehicleInfo: "",
        emergencyContact: "",
        emergencyPhone: "",
        agreementAccepted: false
      });
      setIsSubmissionModalOpen(false);
      toast({ title: "Volunteer agreement submitted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to submit volunteer agreement", variant: "destructive" });
    }
  });

  const handleAdd = () => {
    if (!newDriver.name || !newDriver.phone || !newDriver.vehicleType) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    addDriverMutation.mutate(newDriver);
  };

  const handleUpdate = () => {
    if (!editingDriver) return;
    updateDriverMutation.mutate({
      id: editingDriver.id,
      updates: editingDriver
    });
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver({ ...driver });
  };

  const handleUploadAgreement = () => {
    if (!agreementFile) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }
    uploadAgreementMutation.mutate(agreementFile);
  };

  const handleSubmitVolunteer = () => {
    if (!volunteerForm.submittedBy || !volunteerForm.phone || !volunteerForm.email || !volunteerForm.agreementAccepted) {
      toast({ title: "Please fill in all required fields and accept the agreement", variant: "destructive" });
      return;
    }
    submitVolunteerMutation.mutate(volunteerForm);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case "busy":
        return <Badge variant="destructive">Busy</Badge>;
      case "off-duty":
        return <Badge variant="secondary">Off Duty</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading drivers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Car className="text-blue-500 mr-3 w-6 h-6" />
            Drivers Management
          </h1>
          <div className="flex gap-2">
            <Dialog open={isAgreementModalOpen} onOpenChange={setIsAgreementModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Agreement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Driver Agreement Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="agreement-file">Agreement PDF</Label>
                    <Input
                      id="agreement-file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setAgreementFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAgreementModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadAgreement} disabled={uploadAgreementMutation.isPending}>
                      {uploadAgreementMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Volunteer Agreement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Volunteer Driver Agreement</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmitVolunteer(); }}>
                  <div>
                    <Label htmlFor="volunteer-name">Full Name *</Label>
                    <Input
                      id="volunteer-name"
                      value={volunteerForm.submittedBy}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, submittedBy: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="volunteer-phone">Phone Number *</Label>
                    <Input
                      id="volunteer-phone"
                      value={volunteerForm.phone}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="volunteer-email">Email Address *</Label>
                    <Input
                      id="volunteer-email"
                      type="email"
                      value={volunteerForm.email}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, email: e.target.value })}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="volunteer-license">Driver's License Number</Label>
                    <Input
                      id="volunteer-license"
                      value={volunteerForm.licenseNumber}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, licenseNumber: e.target.value })}
                      placeholder="License number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volunteer-vehicle">Vehicle Information</Label>
                    <Input
                      id="volunteer-vehicle"
                      value={volunteerForm.vehicleInfo}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, vehicleInfo: e.target.value })}
                      placeholder="Year, Make, Model, Color"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-contact">Emergency Contact Name</Label>
                    <Input
                      id="emergency-contact"
                      value={volunteerForm.emergencyContact}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, emergencyContact: e.target.value })}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency-phone"
                      value={volunteerForm.emergencyPhone}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, emergencyPhone: e.target.value })}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="agreement-accepted"
                      checked={volunteerForm.agreementAccepted}
                      onChange={(e) => setVolunteerForm({ ...volunteerForm, agreementAccepted: e.target.checked })}
                      required
                    />
                    <Label htmlFor="agreement-accepted" className="text-sm">
                      I have read and agree to the volunteer driver agreement terms *
                    </Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsSubmissionModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitVolunteerMutation.isPending}>
                      {submitVolunteerMutation.isPending ? "Submitting..." : "Submit Agreement"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Driver
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Driver</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Driver Name *</Label>
                    <Input
                      id="name"
                      value={newDriver.name}
                      onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                      placeholder="Enter driver name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicle-type">Vehicle Type *</Label>
                    <Select value={newDriver.vehicleType} onValueChange={(value) => setNewDriver({ ...newDriver, vehicleType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Car">Car</SelectItem>
                        <SelectItem value="Van">Van</SelectItem>
                        <SelectItem value="Truck">Truck</SelectItem>
                        <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="Bicycle">Bicycle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="license">License Number</Label>
                    <Input
                      id="license"
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                      placeholder="License number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zone">Zone</Label>
                    <Input
                      id="zone"
                      value={newDriver.zone}
                      onChange={(e) => setNewDriver({ ...newDriver, zone: e.target.value })}
                      placeholder="Coverage zone"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={addDriverMutation.isPending}>
                      {addDriverMutation.isPending ? "Adding..." : "Add Driver"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="border border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{driver.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getAvailabilityBadge(driver.availability)}
                    <Badge variant="outline">{driver.vehicleType}</Badge>
                    {driver.zone && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {driver.zone}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(driver)}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                {driver.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {driver.phone}
                  </div>
                )}
                {driver.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {driver.email}
                  </div>
                )}
                {driver.licenseNumber && (
                  <div className="text-xs text-slate-500">
                    License: {driver.licenseNumber}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Driver Name</Label>
                <Input
                  id="edit-name"
                  value={editingDriver.name}
                  onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editingDriver.phone}
                  onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingDriver.email}
                  onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-availability">Availability</Label>
                <Select
                  value={editingDriver.availability}
                  onValueChange={(value: "available" | "busy" | "off-duty") =>
                    setEditingDriver({ ...editingDriver, availability: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="off-duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-zone">Zone</Label>
                <Input
                  id="edit-zone"
                  value={editingDriver.zone}
                  onChange={(e) => setEditingDriver({ ...editingDriver, zone: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDriver(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateDriverMutation.isPending}>
                  {updateDriverMutation.isPending ? "Updating..." : "Update Driver"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}