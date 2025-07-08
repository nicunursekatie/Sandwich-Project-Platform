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
  // Management permissions
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_HOSTS: 'MANAGE_HOSTS',
  MANAGE_RECIPIENTS: 'MANAGE_RECIPIENTS',
  MANAGE_DRIVERS: 'MANAGE_DRIVERS',
  MANAGE_COLLECTIONS: 'MANAGE_COLLECTIONS',
  MANAGE_ANNOUNCEMENTS: 'MANAGE_ANNOUNCEMENTS',
  MANAGE_COMMITTEES: 'MANAGE_COMMITTEES',
  MANAGE_PROJECTS: 'MANAGE_PROJECTS',
  
  // View permissions
  VIEW_PHONE_DIRECTORY: 'VIEW_PHONE_DIRECTORY',
  VIEW_HOSTS: 'VIEW_HOSTS',
  VIEW_RECIPIENTS: 'VIEW_RECIPIENTS',
  VIEW_DRIVERS: 'VIEW_DRIVERS',
  VIEW_COMMITTEE: 'VIEW_COMMITTEE',
  VIEW_USERS: 'VIEW_USERS',
  VIEW_COLLECTIONS: 'VIEW_COLLECTIONS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  VIEW_MEETINGS: 'VIEW_MEETINGS',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_PROJECTS: 'VIEW_PROJECTS',
  VIEW_ROLE_DEMO: 'VIEW_ROLE_DEMO',
  
  // Edit permissions
  EDIT_COLLECTIONS: 'EDIT_COLLECTIONS',
  EDIT_MEETINGS: 'EDIT_MEETINGS',
  DELETE_COLLECTIONS: 'DELETE_COLLECTIONS',
  SCHEDULE_REPORTS: 'SCHEDULE_REPORTS',
  
  // Chat permissions
  GENERAL_CHAT: 'GENERAL_CHAT',
  COMMITTEE_CHAT: 'COMMITTEE_CHAT',
  HOST_CHAT: 'HOST_CHAT',
  DRIVER_CHAT: 'DRIVER_CHAT',
  CORE_TEAM_CHAT: 'CORE_TEAM_CHAT',
  DIRECT_MESSAGES: 'DIRECT_MESSAGES',
  GROUP_MESSAGES: 'GROUP_MESSAGES',
  SEND_MESSAGES: 'SEND_MESSAGES',
  
  // Toolkit access
  TOOLKIT_ACCESS: 'TOOLKIT_ACCESS'
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

// Function to check if user has a specific permission
export function hasPermission(user: any, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

// Function to get human-readable role display name
export function getRoleDisplayName(role: string): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Super Administrator';
    case USER_ROLES.ADMIN:
      return 'Administrator';
    case USER_ROLES.COMMITTEE_MEMBER:
      return 'Committee Member';
    case USER_ROLES.HOST:
      return 'Host Organization';
    case USER_ROLES.DRIVER:
      return 'Delivery Driver';
    case USER_ROLES.VOLUNTEER:
      return 'Volunteer';
    case USER_ROLES.RECIPIENT:
      return 'Recipient Organization';
    case USER_ROLES.VIEWER:
      return 'Viewer';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  }
}