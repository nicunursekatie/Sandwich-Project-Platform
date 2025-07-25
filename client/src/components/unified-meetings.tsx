import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, FileText, Calendar } from "lucide-react";
import MeetingMinutes from "@/pages/meeting-minutes";
import MeetingAgenda from "@/pages/meeting-agenda";
import MeetingCalendar from "@/pages/meeting-calendar";
import { MeetingHelpWrapper } from "@/components/meeting-help";
import { QuickHelp } from "@/components/help-system";

export default function UnifiedMeetings() {
  const [activeTab, setActiveTab] = useState("minutes");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
          <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage meeting minutes, agendas, and calendar</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <MeetingHelpWrapper type="minutes">
            <TabsTrigger value="minutes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Minutes
            </TabsTrigger>
          </MeetingHelpWrapper>
          <MeetingHelpWrapper type="agenda">
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Agenda
            </TabsTrigger>
          </MeetingHelpWrapper>
          <MeetingHelpWrapper type="schedule">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </MeetingHelpWrapper>
        </TabsList>

        <TabsContent value="minutes" className="mt-6">
          <MeetingMinutes isEmbedded={true} />
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          <MeetingAgenda isEmbedded={true} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <MeetingCalendar isEmbedded={true} />
        </TabsContent>
      </Tabs>
      
      {/* Quick Help Button */}
      <QuickHelp section="meetings" />
    </div>
  );
}