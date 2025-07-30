import { Request, Response, NextFunction } from 'express';
import type { IStorage } from '../storage';

interface ActivityLoggerOptions {
  storage: IStorage;
}

// Map routes to readable section names with detailed features
const routeToSectionAndFeature: Record<string, { section: string; feature: string }> = {
  '/api/sandwich-collections': { section: 'Collections', feature: 'Collection Management' },
  '/api/sandwich-collections/clean': { section: 'Collections', feature: 'Data Cleanup' },
  '/api/sandwich-collections/export': { section: 'Collections', feature: 'Data Export' },
  '/api/hosts': { section: 'Directory', feature: 'Host Management' },
  '/api/recipients': { section: 'Directory', feature: 'Recipient Management' },
  '/api/drivers': { section: 'Directory', feature: 'Driver Management' },
  '/api/projects': { section: 'Projects', feature: 'Project Management' },
  '/api/projects/assign-user': { section: 'Projects', feature: 'User Assignment' },
  '/api/meetings': { section: 'Meetings', feature: 'Meeting Management' },
  '/api/meetings/agenda': { section: 'Meetings', feature: 'Agenda Management' },
  '/api/messages': { section: 'Communication', feature: 'Messaging' },
  '/api/conversations': { section: 'Communication', feature: 'Conversations' },
  '/api/user-activity': { section: 'Analytics', feature: 'Activity Analytics' },
  '/api/suggestions': { section: 'Suggestions', feature: 'Suggestion Portal' },
  '/api/auth': { section: 'Authentication', feature: 'Login/Logout' },
  '/api/reports': { section: 'Reports', feature: 'Report Generation' },
  '/api/work-logs': { section: 'Work Log', feature: 'Time Tracking' },
  '/api/announcements': { section: 'Admin', feature: 'Announcements' },
  '/api/users': { section: 'Admin', feature: 'User Management' }
};

// Map HTTP methods to readable actions with context
const methodToActionDetails: Record<string, { action: string; description: string }> = {
  'GET': { action: 'View', description: 'Viewed content' },
  'POST': { action: 'Create', description: 'Created new item' },
  'PUT': { action: 'Update', description: 'Updated existing item' },
  'PATCH': { action: 'Update', description: 'Modified item' },
  'DELETE': { action: 'Delete', description: 'Deleted item' }
};

export function createActivityLogger(options: ActivityLoggerOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip logging for certain endpoints to avoid noise
    const skipPaths = [
      '/api/auth/user',
      '/api/message-notifications',
      '/api/emails/unread-count',
      '/api/messaging/unread',
      '/unread',
      '/api/user-activity' // Don't log activity API calls themselves
    ];

    const shouldSkip = skipPaths.some(path => req.path.includes(path)) || 
                      req.method === 'OPTIONS';

    if (shouldSkip) {
      return next();
    }

    // Store original end method
    const originalEnd = res.end;
    
    // Override end method to log after response
    res.end = function(chunk?: any, encoding?: any) {
      // Log the activity after response is sent
      setImmediate(async () => {
        try {
          const user = (req as any).user;
          if (user?.id && res.statusCode < 400) {
            // Determine section and feature from URL path
            let section = 'General';
            let feature = 'Unknown';
            let page = req.path;
            
            // Find the best matching route
            for (const [route, details] of Object.entries(routeToSectionAndFeature)) {
              if (req.path.startsWith(route)) {
                section = details.section;
                feature = details.feature;
                break;
              }
            }

            // Special handling for dashboard sections with query parameters
            if (req.path === '/' || req.path === '/dashboard') {
              section = 'Dashboard';
              const sectionParam = req.query.section as string;
              if (sectionParam) {
                switch (sectionParam) {
                  case 'user-management':
                    feature = 'User Management';
                    break;
                  case 'collections':
                    feature = 'Collections Dashboard';
                    break;
                  case 'analytics':
                    feature = 'Analytics Dashboard';
                    break;
                  case 'projects':
                    feature = 'Projects Dashboard';
                    break;
                  default:
                    feature = `Dashboard - ${sectionParam}`;
                }
              } else {
                feature = 'Main Dashboard';
              }
            }

            // Determine action from method
            const actionDetails = methodToActionDetails[req.method] || { action: 'Unknown', description: 'Unknown action' };
            
            // Build metadata with request details
            const metadata: any = {
              url: req.originalUrl || req.url,
              method: req.method,
              statusCode: res.statusCode,
              queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
              bodySize: req.get('content-length') ? parseInt(req.get('content-length') || '0') : undefined,
              userAgent: req.get('User-Agent'),
              referer: req.get('Referer'),
              timestamp: new Date().toISOString()
            };

            // Add specific details based on the endpoint
            if (req.path.includes('/collections') && req.method === 'POST') {
              metadata.itemType = 'sandwich_collection';
            } else if (req.path.includes('/projects') && req.method === 'POST') {
              metadata.itemType = 'project';
            } else if (req.path.includes('/messages') && req.method === 'POST') {
              metadata.itemType = 'message';
            }

            // Create detailed activity log entry
            await options.storage.logUserActivity({
              userId: user.id,
              action: actionDetails.action,
              section,
              page,
              feature,
              sessionId: (req as any).sessionID,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent') || 'Unknown',
              metadata
            });

            console.log(`📊 Activity logged: ${user.firstName || user.email} - ${actionDetails.action} ${feature} in ${section}`);
          }
        } catch (error) {
          console.error('Error logging user activity:', error);
        }
      });

      // Call original end method
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}