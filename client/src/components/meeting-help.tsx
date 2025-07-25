import React from 'react';
import { HelpBubble } from '@/components/help-system';
import { Calendar, Clock, Users, FileText } from 'lucide-react';

interface MeetingHelpWrapperProps {
  children: React.ReactNode;
  type: 'schedule' | 'agenda' | 'minutes' | 'attendance';
}

export const MeetingHelpWrapper: React.FC<MeetingHelpWrapperProps> = ({ children, type }) => {
  const getHelpContent = () => {
    switch (type) {
      case 'schedule':
        return {
          title: "Meeting Scheduling",
          content: "Creating meetings helps everyone stay organized! Add the date, time, and details so team members can plan ahead. Don't worry if you need to change details later - meetings can always be updated.",
          character: 'coordinator' as const
        };
      case 'agenda':
        return {
          title: "Meeting Agendas",
          content: "A good agenda keeps meetings focused and productive! List the topics you want to discuss so everyone comes prepared. This helps make the most of everyone's valuable time.",
          character: 'coordinator' as const
        };
      case 'minutes':
        return {
          title: "Meeting Minutes",
          content: "Recording what happened in meetings is so important! These notes help people who couldn't attend stay informed and serve as a record of decisions made and next steps.",
          character: 'helper' as const
        };
      case 'attendance':
        return {
          title: "Tracking Attendance",
          content: "Knowing who attended helps with follow-up communication and ensures important information reaches the right people. It's also helpful for understanding engagement patterns.",
          character: 'helper' as const
        };
      default:
        return {
          title: "Meeting Management",
          content: "This section helps you organize all aspects of your meetings efficiently and effectively!",
          character: 'coordinator' as const
        };
    }
  };

  const content = getHelpContent();

  return (
    <HelpBubble
      title={content.title}
      content={content.content}
      character={content.character}
      position="top"
      trigger="hover"
    >
      {children}
    </HelpBubble>
  );
};

export default MeetingHelpWrapper;