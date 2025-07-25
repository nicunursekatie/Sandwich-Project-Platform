import { useHelp } from './HelpProvider';
import { HelpContent } from './HelpBubble';

interface UseContextualHelpOptions {
  id: string;
  autoShow?: boolean;
  showOnce?: boolean;
}

export function useContextualHelp(id: string, options: Partial<UseContextualHelpOptions> = {}) {
  const { getHelpContent, isHelpEnabled, registerHelp } = useHelp();
  
  const helpContent = getHelpContent(id);
  
  const registerContextualHelp = (content: Omit<HelpContent, 'id'>) => {
    registerHelp(id, { ...content, id });
  };

  const shouldShowHelp = () => {
    if (!isHelpEnabled || !helpContent) return false;
    
    if (options.showOnce) {
      const hasShown = localStorage.getItem(`help-${id}-shown`);
      return !hasShown;
    }
    
    return true;
  };

  const markAsShown = () => {
    if (options.showOnce) {
      localStorage.setItem(`help-${id}-shown`, 'true');
    }
  };

  return {
    helpContent,
    shouldShowHelp: shouldShowHelp(),
    registerContextualHelp,
    markAsShown,
    isHelpEnabled
  };
}