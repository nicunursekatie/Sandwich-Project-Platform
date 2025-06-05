import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Car, Plus, Edit, Trash2, Phone, Mail, MapPin, Calendar, Upload, FileText, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleType: "",
    licenseNumber: "",
    availability: "available" as const,
    zone: ""
  });
  const [agreementSubmission, setAgreementSubmission] = useState({
    submittedBy: "",
    email: "",
    phone: "",
    licenseNumber: "",
    vehicleInfo: "",
    emergencyContact: "",
    emergencyPhone: "",
    agreementAccepted: false
  });

  // Mock data for drivers
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['/api/drivers'],
    queryFn: () => Promise.resolve([
      {
        id: 1,
        name: "John Smith",
        phone: "(555) 987-6543",
        email: "john.smith@delivery.com",
        vehicleType: "Van",
        licenseNumber: "DL123456",
        availability: "available" as const,
        zone: "North District"
      },
      {
        id: 2,
        name: "Maria Garcia",
        phone: "(555) 876-5432",
        email: "maria.garcia@delivery.com",
        vehicleType: "Motorcycle",
        licenseNumber: "DL234567",
        availability: "busy" as const,
        zone: "Downtown"
      },
      {
        id: 3,
        name: "David Kim",
        phone: "(555) 765-4321",
        email: "david.kim@delivery.com",
        vehicleType: "Car",
        licenseNumber: "DL345678",
        availability: "off-duty" as const,
        zone: "South District"
      }
    ])
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: typeof newDriver) => {
      return apiRequest('/api/drivers', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setNewDriver({ name: "", phone: "", email: "", vehicleType: "", licenseNumber: "", availability: "available", zone: "" });
      setIsAddModalOpen(false);
      toast({
        title: "Driver added",
        description: "New driver has been added successfully.",
      });
    }
  });

  const updateDriverMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Driver> & { id: number }) => {
      return apiRequest(`/api/drivers/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      setEditingDriver(null);
      toast({
        title: "Driver updated",
        description: "Driver information has been updated.",
      });
    }
  });

  const deleteDriverMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/drivers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      toast({
        title: "Driver removed",
        description: "Driver has been removed from the system.",
      });
    }
  });

  const submitAgreementMutation = useMutation({
    mutationFn: async (data: typeof agreementSubmission) => {
      return apiRequest('/api/driver-agreements', 'POST', data);
    },
    onSuccess: () => {
      setAgreementSubmission({
        submittedBy: "",
        email: "",
        phone: "",
        licenseNumber: "",
        vehicleInfo: "",
        emergencyContact: "",
        emergencyPhone: "",
        agreementAccepted: false
      });
      setIsSubmissionModalOpen(false);
      toast({
        title: "Agreement submitted",
        description: "Your volunteer driver agreement has been submitted. You will be contacted soon.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.vehicleType) {
      toast({
        title: "Missing information",
        description: "Please fill in the driver name, phone number, and vehicle type.",
        variant: "destructive"
      });
      return;
    }
    createDriverMutation.mutate(newDriver);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleUpdate = () => {
    if (editingDriver) {
      updateDriverMutation.mutate(editingDriver);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this driver?")) {
      deleteDriverMutation.mutate(id);
    }
  };

  const handleAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementSubmission.submittedBy || !agreementSubmission.email || !agreementSubmission.phone || !agreementSubmission.licenseNumber || !agreementSubmission.agreementAccepted) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and accept the agreement.",
        variant: "destructive",
      });
      return;
    }
    submitAgreementMutation.mutate(agreementSubmission);
  };

  const handleAgreementUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementFile) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Agreement uploaded",
      description: "Volunteer driver agreement has been uploaded successfully.",
    });
    setIsAgreementModalOpen(false);
    setAgreementFile(null);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case "busy":
        return <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>;
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
            </Dialog>
            
            <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Volunteer Agreement
                </Button>
              </DialogTrigger>
            </Dialog>
            
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="add-driver-description">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
              </DialogHeader>
              <p id="add-driver-description" className="text-sm text-slate-600 mb-4">
                Add a new driver to the delivery system.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
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
                    placeholder="DL123456"
                  />
                </div>
                <div>
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    value={newDriver.zone}
                    onChange={(e) => setNewDriver({ ...newDriver, zone: e.target.value })}
                    placeholder="Downtown, North District, etc."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDriverMutation.isPending}>
                    {createDriverMutation.isPending ? "Adding..." : "Add Driver"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Agreement Upload Modal */}
          <Dialog open={isAgreementModalOpen} onOpenChange={setIsAgreementModalOpen}>
            <DialogContent aria-describedby="upload-agreement-description">
              <DialogHeader>
                <DialogTitle>Upload Volunteer Driver Agreement</DialogTitle>
              </DialogHeader>
              <p id="upload-agreement-description" className="text-sm text-slate-600 mb-4">
                Upload a PDF version of the volunteer driver agreement for new volunteers to review.
              </p>
              <form onSubmit={handleAgreementUpload} className="space-y-4">
                <div>
                  <Label htmlFor="agreement-file">Agreement PDF *</Label>
                  <Input
                    id="agreement-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setAgreementFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAgreementModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!agreementFile}>
                    Upload Agreement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

        {/* Volunteer Submission Modal */}
        <Dialog open={isSubmissionModalOpen} onOpenChange={setIsSubmissionModalOpen}>
          <DialogContent className="max-w-2xl" aria-describedby="volunteer-submission-description">
            <DialogHeader>
              <DialogTitle>Volunteer Driver Agreement Submission</DialogTitle>
            </DialogHeader>
            <p id="volunteer-submission-description" className="text-sm text-slate-600 mb-4">
              Submit your volunteer driver agreement. This information will be securely transmitted to administrators.
            </p>
            <form onSubmit={handleAgreementSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submitted-by">Full Name *</Label>
                  <Input
                    id="submitted-by"
                    value={agreementSubmission.submittedBy}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, submittedBy: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="submission-email">Email Address *</Label>
                  <Input
                    id="submission-email"
                    type="email"
                    value={agreementSubmission.email}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submission-phone">Phone Number *</Label>
                  <Input
                    id="submission-phone"
                    value={agreementSubmission.phone}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="submission-license">Driver's License Number *</Label>
                  <Input
                    id="submission-license"
                    value={agreementSubmission.licenseNumber}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, licenseNumber: e.target.value })}
                    placeholder="DL123456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="vehicle-info">Vehicle Information *</Label>
                <Input
                  id="vehicle-info"
                  value={agreementSubmission.vehicleInfo}
                  onChange={(e) => setAgreementSubmission({ ...agreementSubmission, vehicleInfo: e.target.value })}
                  placeholder="Make, Model, Year, License Plate"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergency-contact">Emergency Contact *</Label>
                  <Input
                    id="emergency-contact"
                    value={agreementSubmission.emergencyContact}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, emergencyContact: e.target.value })}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-phone">Emergency Phone *</Label>
                  <Input
                    id="emergency-phone"
                    value={agreementSubmission.emergencyPhone}
                    onChange={(e) => setAgreementSubmission({ ...agreementSubmission, emergencyPhone: e.target.value })}
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg bg-blue-50">
                <input
                  type="checkbox"
                  id="agreement-accepted"
                  checked={agreementSubmission.agreementAccepted}
                  onChange={(e) => setAgreementSubmission({ ...agreementSubmission, agreementAccepted: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="agreement-accepted" className="text-sm">
                  I have read and agree to the volunteer driver agreement terms and conditions. I understand that my submission will be reviewed and I will be contacted regarding my application. *
                </Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsSubmissionModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitAgreementMutation.isPending || !agreementSubmission.agreementAccepted}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitAgreementMutation.isPending ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Agreement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(driver)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(driver.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{driver.phone}</span>
              </div>
              {driver.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{driver.email}</span>
                </div>
              )}
              {driver.zone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{driver.zone}</span>
                </div>
              )}
              {driver.licenseNumber && (
                <div className="text-sm text-slate-600">
                  <strong>License:</strong> {driver.licenseNumber}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {drivers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No drivers found. Add a new driver to get started.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDriver && (
        <Dialog open={!!editingDriver} onOpenChange={() => setEditingDriver(null)}>
          <DialogContent aria-describedby="edit-driver-description">
            <DialogHeader>
              <DialogTitle>Edit Driver</DialogTitle>
            </DialogHeader>
            <p id="edit-driver-description" className="text-sm text-slate-600 mb-4">
              Update driver information and availability.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
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
                <Label htmlFor="edit-vehicle">Vehicle Type</Label>
                <Select value={editingDriver.vehicleType} onValueChange={(value) => setEditingDriver({ ...editingDriver, vehicleType: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="edit-availability">Availability</Label>
                <Select value={editingDriver.availability} onValueChange={(value: any) => setEditingDriver({ ...editingDriver, availability: value })}>
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
              <div className="flex justify-end space-x-2">
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
      </div>
      </div>
    </div>
  );
}