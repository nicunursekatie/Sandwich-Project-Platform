import React from 'react';
import { HelpBubble, helpContent } from '@/components/help-system';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface AnalyticsHelpWrapperProps {
  children: React.ReactNode;
  type: 'charts' | 'trends' | 'summary';
}

export const AnalyticsHelpWrapper: React.FC<AnalyticsHelpWrapperProps> = ({ children, type }) => {
  const getHelpContent = () => {
    switch (type) {
      case 'charts':
        return {
          title: "Understanding Your Charts",
          content: "These visualizations show your sandwich collection trends over time. Each bar or line represents data from different time periods, helping you see patterns and growth in your community impact.",
          character: 'guide' as const
        };
      case 'trends':
        return {
          title: "Trend Analysis",
          content: "Look for patterns here! Rising trends show growing community engagement, while dips might indicate seasonal changes or opportunities for outreach. I'm here to help you understand what your data means!",
          character: 'guide' as const
        };
      case 'summary':
        return {
          title: "Impact Summary",
          content: "This is your impact at a glance! These numbers represent real meals provided to community members. Every sandwich counted here made a difference in someone's day.",
          character: 'sandy' as const
        };
      default:
        return helpContent.analytics.charts;
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

export default AnalyticsHelpWrapper;