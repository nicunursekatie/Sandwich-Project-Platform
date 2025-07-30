import { Request, Response, NextFunction } from 'express';
import type { IStorage } from '../storage';

interface ActivityLoggerOptions {
  storage: IStorage;
}

// Map routes to readable section names
const routeToSection: Record<string, string> = {
  '/api/sandwich-collections': 'Collections',
  '/api/hosts': 'Hosts',
  '/api/recipients': 'Recipients', 
  '/api/drivers': 'Drivers',
  '/api/projects': 'Projects',
  '/api/meetings': 'Meetings',
  '/api/messages': 'Messages',
  '/api/user-activity': 'Analytics',
  '/api/suggestions': 'Suggestions',
  '/api/auth': 'Authentication',
  '/api/reports': 'Reports'
};

// Map HTTP methods to readable actions
const methodToAction: Record<string, string> = {
  'GET': 'View',
  'POST': 'Create',
  'PUT': 'Update',
  'PATCH': 'Update',
  'DELETE': 'Delete'
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
            // Determine section from URL path
            let section = 'General';
            for (const [route, sectionName] of Object.entries(routeToSection)) {
              if (req.path.startsWith(route)) {
                section = sectionName;
                break;
              }
            }

            // Special handling for dashboard sections
            if (req.path === '/' || req.path === '/dashboard') {
              section = 'Dashboard';
            }

            // Determine action from method
            const action = methodToAction[req.method] || req.method;

            // Create detailed description
            let details = `${action} ${section}`;
            if (req.path !== '/') {
              details += ` (${req.path})`;
            }

            // Log the activity
            await options.storage.logUserActivity({
              userId: user.id,
              action: action,
              section: section,
              details: details,
              ipAddress: req.ip || '',
              userAgent: req.get('User-Agent') || '',
              sessionId: req.sessionID || '',
              timestamp: new Date()
            });

            console.log(`📊 Activity logged: ${user.firstName || user.email} - ${details}`);
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