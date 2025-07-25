import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpContent } from './HelpBubble';

interface HelpContextType {
  showHelp: (content: HelpContent) => void;
  hideHelp: (id: string) => void;
  registerHelp: (id: string, content: HelpContent) => void;
  isHelpEnabled: boolean;
  toggleHelpMode: () => void;
  getHelpContent: (id: string) => HelpContent | null;
}

const HelpContext = createContext<HelpContextType | null>(null);

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}

interface HelpProviderProps {
  children: React.ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [registeredHelp, setRegisteredHelp] = useState<Map<string, HelpContent>>(new Map());
  const [isHelpEnabled, setIsHelpEnabled] = useState(() => {
    // Check if user has help mode preference stored
    const saved = localStorage.getItem('help-mode-enabled');
    return saved ? JSON.parse(saved) : true; // Default to enabled
  });

  const registerHelp = useCallback((id: string, content: HelpContent) => {
    setRegisteredHelp(prev => new Map(prev.set(id, content)));
  }, []);

  const showHelp = useCallback((content: HelpContent) => {
    // This would be used for programmatic help display
    console.log('Showing help:', content);
  }, []);

  const hideHelp = useCallback((id: string) => {
    console.log('Hiding help:', id);
  }, []);

  const toggleHelpMode = useCallback(() => {
    const newMode = !isHelpEnabled;
    setIsHelpEnabled(newMode);
    localStorage.setItem('help-mode-enabled', JSON.stringify(newMode));
  }, [isHelpEnabled]);

  const getHelpContent = useCallback((id: string): HelpContent | null => {
    return registeredHelp.get(id) || null;
  }, [registeredHelp]);

  // Initialize default help content
  useEffect(() => {
    const defaultHelpContent: Array<[string, HelpContent]> = [
      ['dashboard-welcome', {
        id: 'dashboard-welcome',
        title: 'Welcome to TSP!',
        message: "I'm so glad you're here! This dashboard is your central hub for everything related to The Sandwich Project. From here, you can track collections, connect with your team, and make a real difference in your community.",
        tone: 'encouraging',
        character: 'friend',
        position: 'bottom',
        showOnFirstVisit: true
      }],
      ['collections-form', {
        id: 'collections-form',
        title: 'Recording Your Collections',
        message: "Every sandwich you record here represents a meal for someone in need. Don't worry about making mistakes - you can always edit entries later. Just do your best, and know that your contribution matters so much!",
        tone: 'supportive',
        character: 'mentor',
        position: 'right'
      }],
      ['navigation-help', {
        id: 'navigation-help',
        title: 'Finding Your Way Around',
        message: "Think of this sidebar as your map to everything TSP! Each section is designed to help you contribute in your own unique way. Take your time exploring - there's no rush.",
        tone: 'informative',
        character: 'guide',
        position: 'right'
      }],
      ['team-chat', {
        id: 'team-chat',
        title: 'Connect with Your Team',
        message: "This is where the magic happens! Chat with your fellow volunteers, share updates, and celebrate each other's wins. We're all in this together, and your voice matters here.",
        tone: 'encouraging',
        character: 'friend',
        position: 'top'
      }],
      ['reports-analytics', {
        id: 'reports-analytics',
        title: 'See Your Impact',
        message: "These numbers tell the story of our collective impact! Every chart and statistic represents real people whose lives we've touched. You should feel proud - you're part of something beautiful.",
        tone: 'celebratory',
        character: 'coach',
        position: 'bottom'
      }],
      ['directory-contacts', {
        id: 'directory-contacts',
        title: 'Your TSP Family',
        message: "Here's everyone who's part of our wonderful community! Don't hesitate to reach out to anyone - we're all here to support each other in this important work.",
        tone: 'supportive',
        character: 'friend',
        position: 'left'
      }],
      ['meetings-schedule', {
        id: 'meetings-schedule',
        title: 'Stay Connected',
        message: "Meetings are where we come together as a team! They're not just about business - they're about connecting, sharing ideas, and supporting each other. Your participation is valued!",
        tone: 'encouraging',
        character: 'mentor',
        position: 'bottom'
      }],
      ['project-management', {
        id: 'project-management',
        title: 'Making Things Happen',
        message: "Projects might seem overwhelming, but remember - every big change starts with small steps. You don't have to do everything at once. Just pick something that speaks to you and take it one task at a time!",
        tone: 'supportive',
        character: 'coach',
        position: 'right'
      }],
      ['data-entry-tips', {
        id: 'data-entry-tips',
        title: 'Data Entry Made Easy',
        message: "I know forms can feel tedious, but think of each entry as a story of generosity! Take breaks when you need them, and remember - accuracy matters more than speed. You're doing great!",
        tone: 'encouraging',
        character: 'mentor',
        position: 'top'
      }],
      ['first-time-user', {
        id: 'first-time-user',
        title: 'New Here? You\'re Welcome!',
        message: "Starting something new can feel a bit overwhelming, but you've joined an incredibly supportive community! Take things at your own pace, ask questions whenever you need to, and know that everyone here wants to see you succeed.",
        tone: 'supportive',
        character: 'friend',
        position: 'bottom',
        showOnFirstVisit: true,
        actions: [
          {
            label: 'Take a Quick Tour',
            action: () => console.log('Starting tour'),
            primary: true
          },
          {
            label: 'I\'ll Explore on My Own',
            action: () => console.log('Self exploration')
          }
        ]
      }]
    ];

    defaultHelpContent.forEach(([id, content]) => {
      registerHelp(id, content);
    });
  }, [registerHelp]);

  const contextValue: HelpContextType = {
    showHelp,
    hideHelp,
    registerHelp,
    isHelpEnabled,
    toggleHelpMode,
    getHelpContent
  };

  return (
    <HelpContext.Provider value={contextValue}>
      {children}
    </HelpContext.Provider>
  );
}