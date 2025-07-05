export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
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
  
  // Message moderation (super admin only)
  MODERATE_MESSAGES: 'moderate_messages',
  
  // Chat access - specific chat room permissions
  GENERAL_CHAT: 'general_chat',
  COMMITTEE_CHAT: 'committee_chat',
  HOST_CHAT: 'host_chat',
  DRIVER_CHAT: 'driver_chat',
  RECIPIENT_CHAT: 'recipient_chat',
  CORE_TEAM_CHAT: 'core_team_chat',
  DIRECT_MESSAGES: 'direct_messages',
  GROUP_MESSAGES: 'group_messages',
  
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
  MANAGE_USERS: 'manage_users',
  
  // Data export (admin only)
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
  
  // Message sending
  SEND_MESSAGES: 'send_messages'
} as const;

export function getDefaultPermissionsForRole(role: string): string[] {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return Object.values(PERMISSIONS);
      
    case USER_ROLES.ADMIN:
      return Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MODERATE_MESSAGES);
    
    case USER_ROLES.COMMITTEE_MEMBER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.VIEW_HOSTS,
        PERMISSIONS.VIEW_RECIPIENTS,
        PERMISSIONS.VIEW_DRIVERS,
        PERMISSIONS.VIEW_COMMITTEE,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.COMMITTEE_CHAT,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_MEETINGS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.VIEW_ROLE_DEMO,
        PERMISSIONS.SEND_MESSAGES
      ];
    
    case USER_ROLES.HOST:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.HOST_CHAT,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.SEND_MESSAGES
      ];
    
    case USER_ROLES.DRIVER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.DRIVER_CHAT,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.SEND_MESSAGES
      ];
    
    case USER_ROLES.VOLUNTEER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,  // Need this for navigation access
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.EDIT_DATA,  // For development tab access
        PERMISSIONS.SEND_MESSAGES
      ];
    
    case USER_ROLES.RECIPIENT:
      return [
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.RECIPIENT_CHAT,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.SEND_MESSAGES
      ];
    
    case USER_ROLES.VIEWER:
      return [
        PERMISSIONS.VIEW_PHONE_DIRECTORY,
        PERMISSIONS.DIRECT_MESSAGES,
        PERMISSIONS.GROUP_MESSAGES,
        PERMISSIONS.TOOLKIT_ACCESS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.SEND_MESSAGES
      ];
    
    default:
      return [];
  }
}

// Chat room to permission mapping
export const CHAT_PERMISSIONS = {
  'general': PERMISSIONS.GENERAL_CHAT,
  'committee': PERMISSIONS.COMMITTEE_CHAT,
  'hosts': PERMISSIONS.HOST_CHAT,
  'drivers': PERMISSIONS.DRIVER_CHAT,
  'recipients': PERMISSIONS.RECIPIENT_CHAT,
  'core_team': PERMISSIONS.CORE_TEAM_CHAT,
  'direct': PERMISSIONS.DIRECT_MESSAGES,
  'groups': PERMISSIONS.GROUP_MESSAGES
} as const;

// Function to check if user has access to a specific chat room
export function hasAccessToChat(user: any, chatRoom: string): boolean {
  if (!user || !user.permissions) return false;
  
  const requiredPermission = CHAT_PERMISSIONS[chatRoom as keyof typeof CHAT_PERMISSIONS];
  if (!requiredPermission) return false;
  
  return user.permissions.includes(requiredPermission);
}