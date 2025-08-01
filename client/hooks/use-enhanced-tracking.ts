import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackEvent, trackPageView } from '../lib/analytics';

interface TrackingData {
  section: string;
  action: string;
  feature?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export const useEnhancedTracking = () => {
  const [location] = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const currentSectionRef = useRef<string>('');
  
  useEffect(() => {
    // Track page view when location changes
    trackPageView(location);
    
    // Calculate time spent on previous page
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    
    // Send time spent data for previous section if it exists
    if (currentSectionRef.current && timeSpent > 2) { // Only track if spent more than 2 seconds
      trackEvent('page_duration', 'engagement', currentSectionRef.current, timeSpent);
      
      // Also send to our backend
      fetch('/api/enhanced-user-activity/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'Page View',
          section: getSectionFromPath(currentSectionRef.current),
          page: currentSectionRef.current,
          duration: timeSpent,
          metadata: { 
            timestamp: new Date().toISOString(),
            from: currentSectionRef.current,
            to: location 
          }
        })
      }).catch(console.error);
    }
    
    // Update refs for current page
    startTimeRef.current = Date.now();
    currentSectionRef.current = location;
  }, [location]);

  const trackUserAction = (data: TrackingData) => {
    // Track in Google Analytics
    trackEvent(data.action, data.section, data.feature);
    
    // Track in our backend
    fetch('/api/enhanced-user-activity/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: data.action,
        section: data.section,
        page: location,
        feature: data.feature,
        duration: data.duration,
        metadata: {
          timestamp: new Date().toISOString(),
          ...data.metadata
        }
      })
    }).catch(console.error);
  };

  const trackButtonClick = (buttonName: string, section: string) => {
    trackUserAction({
      section,
      action: 'Button Click',
      feature: buttonName,
      metadata: { buttonName, location }
    });
  };

  const trackFormSubmit = (formName: string, section: string) => {
    trackUserAction({
      section,
      action: 'Form Submit',
      feature: formName,
      metadata: { formName, location }
    });
  };

  const trackSearch = (searchTerm: string, section: string, resultsCount?: number) => {
    trackUserAction({
      section,
      action: 'Search',
      feature: 'Search',
      metadata: { searchTerm, resultsCount, location }
    });
  };

  const trackDownload = (fileName: string, section: string) => {
    trackUserAction({
      section,
      action: 'Download',
      feature: 'File Download',
      metadata: { fileName, location }
    });
  };

  return {
    trackUserAction,
    trackButtonClick,
    trackFormSubmit,
    trackSearch,
    trackDownload
  };
};

const getSectionFromPath = (path: string): string => {
  if (path === '/') return 'Dashboard';
  if (path.startsWith('/inbox')) return 'Communication';
  if (path.startsWith('/messages')) return 'Communication';
  if (path.startsWith('/projects')) return 'Projects';
  if (path.startsWith('/hosts')) return 'Directory';
  if (path.startsWith('/recipients')) return 'Directory';
  if (path.startsWith('/drivers')) return 'Directory';
  if (path.startsWith('/meetings')) return 'Meetings';
  if (path.startsWith('/suggestions')) return 'Suggestions';
  if (path.startsWith('/governance')) return 'Governance';
  if (path.startsWith('/toolkit')) return 'Toolkit';
  if (path.startsWith('/reports')) return 'Analytics';
  if (path.includes('admin')) return 'Admin';
  return 'Other';
};