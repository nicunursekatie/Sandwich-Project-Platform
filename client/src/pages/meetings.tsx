import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeetingAgenda from "@/components/meeting-agenda";
import MeetingsCalendar from "@/components/meetings-calendar";

export default function Meetings() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="calendar">Meetings Calendar</TabsTrigger>
          <TabsTrigger value="agenda">Meeting Agenda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6">
          <MeetingsCalendar />
        </TabsContent>
        
        <TabsContent value="agenda" className="space-y-6">
          <MeetingAgenda />
        </TabsContent>
      </Tabs>
    </div>
  );
}