import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, Eye, EyeOff } from 'lucide-react';
import { useHelp } from './HelpProvider';

interface HelpToggleProps {
  className?: string;
}

export function HelpToggle({ className = '' }: HelpToggleProps) {
  const { isHelpEnabled, toggleHelpMode } = useHelp();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center space-x-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-colors ${className}`}
      onClick={toggleHelpMode}
      title={isHelpEnabled ? 'Hide help bubbles' : 'Show help bubbles'}
    >
      <HelpCircle className="w-4 h-4" />
      {isHelpEnabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      <span className="text-xs sm:text-sm hidden sm:block">
        {isHelpEnabled ? 'Hide Help' : 'Show Help'}
      </span>
    </Button>
  );
}