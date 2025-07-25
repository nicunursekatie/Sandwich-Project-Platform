import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Heart, Coffee, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface HelpContent {
  id: string;
  title: string;
  message: string;
  tone: 'encouraging' | 'informative' | 'supportive' | 'celebratory';
  character?: 'mentor' | 'friend' | 'guide' | 'coach';
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnFirstVisit?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface HelpBubbleProps {
  content: HelpContent;
  trigger?: 'click' | 'hover' | 'auto';
  className?: string;
  onDismiss?: () => void;
}

const characterEmojis = {
  mentor: '👩‍🏫',
  friend: '😊',
  guide: '🧭',
  coach: '💪'
};

const toneStyles = {
  encouraging: 'border-l-4 border-l-green-400 bg-green-50 dark:bg-green-900/20',
  informative: 'border-l-4 border-l-blue-400 bg-blue-50 dark:bg-blue-900/20',
  supportive: 'border-l-4 border-l-purple-400 bg-purple-50 dark:bg-purple-900/20',
  celebratory: 'border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
};

const getCharacterMessage = (content: HelpContent) => {
  const character = content.character || 'guide';
  const emoji = characterEmojis[character];
  
  const personalizedIntros = {
    mentor: "I'm here to help you learn! ",
    friend: "Hey there! ",
    guide: "Let me show you the way! ",
    coach: "You've got this! "
  };

  return {
    emoji,
    intro: personalizedIntros[character],
    fullMessage: `${personalizedIntros[character]}${content.message}`
  };
};

export function HelpBubble({ content, trigger = 'click', className = '', onDismiss }: HelpBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const characterInfo = getCharacterMessage(content);

  useEffect(() => {
    // Auto-show on first visit if configured
    if (content.showOnFirstVisit && !hasBeenShown) {
      const hasSeenBefore = localStorage.getItem(`help-${content.id}-seen`);
      if (!hasSeenBefore) {
        setIsVisible(true);
        setHasBeenShown(true);
        localStorage.setItem(`help-${content.id}-seen`, 'true');
      }
    }
  }, [content.id, content.showOnFirstVisit, hasBeenShown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bubbleRef.current && 
        !bubbleRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        className="w-8 h-8 p-0 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
        onClick={handleTrigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Get help"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      {/* Help Bubble */}
      {isVisible && (
        <div
          ref={bubbleRef}
          className={`absolute z-50 w-80 ${
            content.position === 'left' ? 'right-full mr-2' :
            content.position === 'right' ? 'left-full ml-2' :
            content.position === 'top' ? 'bottom-full mb-2' :
            'top-full mt-2'
          } ${
            content.position === 'left' || content.position === 'right' ? 'top-0' : 'left-1/2 transform -translate-x-1/2'
          }`}
        >
          <Card className={`shadow-lg border-0 ${toneStyles[content.tone]}`}>
            <CardContent className="p-4">
              {/* Header with character and close button */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{characterInfo.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {content.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {content.character || 'guide'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message */}
              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {characterInfo.fullMessage}
                </p>
              </div>

              {/* Actions */}
              {content.actions && content.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {content.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.primary ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        action.action();
                        if (action.primary) {
                          handleDismiss();
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* Helpful icons for visual appeal */}
              <div className="flex justify-center mt-3 space-x-2 opacity-60">
                {content.tone === 'encouraging' && <Heart className="w-3 h-3 text-red-400" />}
                {content.tone === 'supportive' && <Coffee className="w-3 h-3 text-amber-400" />}
                {content.tone === 'informative' && <Lightbulb className="w-3 h-3 text-yellow-400" />}
              </div>
            </CardContent>
          </Card>

          {/* Arrow pointing to trigger */}
          <div className={`absolute ${
            content.position === 'left' ? 'right-0 top-3 translate-x-1 border-l-8 border-l-white border-t-4 border-b-4 border-t-transparent border-b-transparent' :
            content.position === 'right' ? 'left-0 top-3 -translate-x-1 border-r-8 border-r-white border-t-4 border-b-4 border-t-transparent border-b-transparent' :
            content.position === 'top' ? 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 border-t-8 border-t-white border-l-4 border-r-4 border-l-transparent border-r-transparent' :
            'top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 border-b-8 border-b-white border-l-4 border-r-4 border-l-transparent border-r-transparent'
          }`} />
        </div>
      )}
    </div>
  );
}