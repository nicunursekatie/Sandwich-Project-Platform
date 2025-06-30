export const USER_ROLES = {
  ADMIN: 'admin',
  COMMITTEE_MEMBER: 'committee_member',
  HOST: 'host',
  DRIVER: 'driver',
  VOLUNTEER: 'volunteer',
  RECIPIENT: 'recipient',
  VIEWER: 'viewer'
} as const;

export const PERMISSIONS = {
  // Core access
  VIEW_PHONE_DIRECTORY: 'view_phone_directory',
  
  // Editing permissions (admin only)
  EDIT_DATA: 'edit_data',
  DELETE_DATA: 'delete_data',
  
  // Chat access
  GENERAL_CHAT: 'general_chat',
  COMMITTEE_CHAT: 'committee_chat',
  HOST_CHAT: 'host_chat',
  DRIVER_CHAT: 'driver_chat',
  RECIPIENT_CHAT: 'recipient_chat',
  
  // Toolkit access (public but tracked)
  TOOLKIT_ACCESS: 'toolkit_access',
  
  // Data viewing (most users)
  VIEW_COLLECTIONS: 'view_collections',
  VIEW_REPORTS: 'view_reports',
  VIEW_PROJECTS: 'view_projects',
  VIEW_MEETINGS: 'view_meetings',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_ROLE_DEMO: 'view_role_demo',
  
  // Individual tab access
  VIEW_HOSTS: 'view_hosts',
  VIEW_RECIPIENTS: 'view_recipients', 
  VIEW_DRIVERS: 'view_drivers',
  VIEW_COMMITTEE: 'view_committee',
  
  // User management
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users'
} as const;

export function getDefaultPermissionsForRole(role: string): string[] {
  switch (role) {
    case USER_ROLES.ADMIN:
      return Object.values(PERMISSIONS);
    
    case USER_ROLES.COMMITTEE_MEMBER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.VIEW_HOSTS,
        PERMISSIONS.VIEW_RECIPIENTS,
        PERMISSIONS.VIEW_DRIVERS,
        PERMISSIONS.VIEW_COMMITTEE,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.COMMITTEE_CHAT,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_MEETINGS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_ROLE_DEMO
      ];
    
    case USER_ROLES.HOST:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.HOST_CHAT,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS
      ];
    
    case USER_ROLES.DRIVER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.DRIVER_CHAT,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS
      ];
    
    case USER_ROLES.VOLUNTEER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,  // Need this for navigation access
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.EDIT_DATA  // For development tab access
      ];
    
    case USER_ROLES.RECIPIENT:
      return [
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.RECIPIENT_CHAT,
        PERMISSIONS.VIEW_COLLECTIONS
      ];
    
    case USER_ROLES.VIEWER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS
      ];
    
    default:
      return [];
  }
}