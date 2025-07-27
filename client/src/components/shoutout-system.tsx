import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, Users, Clock, CheckCircle, AlertCircle, Megaphone, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ShoutoutTemplate {
  id: string;
  name: string;
  subject: string;
  message: string;
  type: 'reminder' | 'encouragement' | 'announcement' | 'celebration';
}

interface ShoutoutLog {
  id: string;
  templateName: string;
  subject: string;
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'failed';
  sentBy: string;
}

const predefinedTemplates: ShoutoutTemplate[] = [
  {
    id: 'check-in-reminder',
    name: 'Check-In Reminder',
    subject: 'Quick check-in - How are things going? 👋',
    message: `Hi there!

Just wanted to reach out and see how you're doing! 

The Sandwich Project platform has some exciting updates, and we'd love for you to take a quick look when you have a moment. Your feedback helps us make the system better for everyone.

No pressure - just checking in and letting you know we're thinking of you!

Best regards,
The Sandwich Project Team`,
    type: 'reminder'
  },
  {
    id: 'test-invitation',
    name: 'Platform Testing Invitation',
    subject: 'Help us test some cool new features! 🚀',
    message: `Hello!

We've been working on some exciting improvements to the platform, and we'd love your help testing them out!

Here's what's new:
• Enhanced dashboard with better visual design
• Improved data entry forms
• Better navigation and user experience

When you have 5-10 minutes, could you log in and let us know what you think? Your input is incredibly valuable to us.

Thanks for being an amazing part of our community!

The Sandwich Project Team`,
    type: 'encouragement'
  },
  {
    id: 'appreciation',
    name: 'Team Appreciation',
    subject: 'Thank you for everything you do! ❤️',
    message: `Dear Team Member,

We wanted to take a moment to say THANK YOU for all the incredible work you do for The Sandwich Project.

Every sandwich counted, every volunteer coordinated, every act of service - it all adds up to real impact in our community. You're making a difference!

The platform is here to support your amazing work, so please don't hesitate to reach out if you need anything or have suggestions for improvements.

With gratitude,
The Sandwich Project Team`,
    type: 'celebration'
  },
  {
    id: 'system-update',
    name: 'System Update Notification',
    subject: 'Platform updates - New features available!',
    message: `Hi there!

We've just rolled out some exciting updates to The Sandwich Project platform:

✨ What's New:
• Improved dashboard design for better clarity
• Enhanced data visualization
• Streamlined navigation
• Better mobile experience

These changes are designed to make your volunteer coordination work even easier and more efficient.

Log in whenever you're ready to explore the improvements!

Best,
The Sandwich Project Development Team`,
    type: 'announcement'
  }
];

export default function ShoutoutSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<ShoutoutTemplate | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<string>('all');

  // Fetch users for recipient selection
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    staleTime: 300000 // 5 minutes
  });

  // Fetch shoutout history
  const { data: shoutoutHistory } = useQuery({
    queryKey: ['/api/shoutouts/history'],
    staleTime: 60000 // 1 minute
  });

  // Send shoutout mutation
  const sendShoutoutMutation = useMutation({
    mutationFn: async (data: { 
      subject: string; 
      message: string; 
      recipientGroup: string;
      templateName?: string;
    }) => {
      return apiRequest('POST', '/api/shoutouts/send', data);
    },
    onSuccess: () => {
      toast({
        title: "Shoutout sent successfully!",
        description: "Your message has been delivered to the selected recipients."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shoutouts/history'] });
      // Reset form
      setSelectedTemplate(null);
      setCustomSubject('');
      setCustomMessage('');
      setRecipientGroup('all');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to send shoutout",
        description: error.message || "Please try again later."
      });
    }
  });

  const handleTemplateSelect = (template: ShoutoutTemplate) => {
    setSelectedTemplate(template);
    setCustomSubject(template.subject);
    setCustomMessage(template.message);
  };

  const handleSendShoutout = () => {
    if (!customSubject.trim() || !customMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both subject and message."
      });
      return;
    }

    sendShoutoutMutation.mutate({
      subject: customSubject,
      message: customMessage,
      recipientGroup,
      templateName: selectedTemplate?.name
    });
  };

  const getRecipientCount = () => {
    if (!users) return 0;
    switch (recipientGroup) {
      case 'all': return users.length;
      case 'admins': return users.filter((u: any) => u.role === 'admin' || u.role === 'super_admin').length;
      case 'hosts': return users.filter((u: any) => u.role === 'host').length;
      case 'volunteers': return users.filter((u: any) => u.role === 'volunteer').length;
      case 'committee': return users.filter((u: any) => u.role === 'committee_member').length;
      default: return 0;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="h-4 w-4" />;
      case 'encouragement': return <Heart className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'celebration': return <CheckCircle className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'encouragement': return 'bg-green-100 text-green-800 border-green-200';
      case 'announcement': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'celebration': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-[#FBAD3F]/5 via-white to-[#236383]/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FBAD3F] to-[#e89b2e] rounded-xl flex items-center justify-center shadow-lg">
              <Megaphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 font-roboto tracking-tight">Team Shoutouts</h1>
              <p className="text-sm font-medium text-slate-500 font-roboto mt-1">Send encouraging messages and reminders to your team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Selection */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900 font-roboto flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#236383]" />
              Quick Templates
            </CardTitle>
            <CardDescription>Choose a pre-written message or create your own</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {predefinedTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTemplate?.id === template.id
                    ? 'border-[#FBAD3F] bg-[#FBAD3F]/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 font-roboto">{template.name}</h3>
                  <Badge className={`${getTypeColor(template.type)} flex items-center gap-1`}>
                    {getTypeIcon(template.type)}
                    {template.type}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 font-roboto">{template.subject}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Message Composer */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900 font-roboto flex items-center gap-2">
              <Send className="h-5 w-5 text-[#236383]" />
              Compose Message
            </CardTitle>
            <CardDescription>Customize your message and select recipients</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Recipient Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 font-roboto">Send to:</label>
              <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users ({getRecipientCount()})</SelectItem>
                  <SelectItem value="admins">Administrators</SelectItem>
                  <SelectItem value="hosts">Host Coordinators</SelectItem>
                  <SelectItem value="volunteers">Volunteers</SelectItem>
                  <SelectItem value="committee">Committee Members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 font-roboto">Subject:</label>
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="border-slate-300"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 font-roboto">Message:</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={8}
                className="border-slate-300 resize-none"
              />
            </div>

            {/* Send Button */}
            <div className="pt-4">
              <Alert className="mb-4 border-[#FBAD3F]/30 bg-[#FBAD3F]/5">
                <Users className="h-4 w-4 text-[#FBAD3F]" />
                <AlertDescription className="text-slate-700">
                  This message will be sent to <strong>{getRecipientCount()} recipients</strong> via email.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleSendShoutout}
                disabled={sendShoutoutMutation.isPending || !customSubject.trim() || !customMessage.trim()}
                className="w-full bg-gradient-to-r from-[#FBAD3F] to-[#e89b2e] hover:from-[#e89b2e] hover:to-[#d4941f] text-white font-semibold py-3"
              >
                {sendShoutoutMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Shoutout
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shoutouts History */}
      {shoutoutHistory && shoutoutHistory.length > 0 && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 to-white border-b border-slate-200">
            <CardTitle className="text-xl font-bold text-slate-900 font-roboto flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#236383]" />
              Recent Shoutouts
            </CardTitle>
            <CardDescription>History of sent messages</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {shoutoutHistory.slice(0, 5).map((shoutout: ShoutoutLog) => (
                <div key={shoutout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 font-roboto">{shoutout.subject}</h4>
                    <p className="text-sm text-slate-600">
                      {shoutout.templateName} • {shoutout.recipientCount} recipients • {new Date(shoutout.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {shoutout.status === 'sent' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sent
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}