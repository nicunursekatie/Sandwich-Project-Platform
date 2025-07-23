export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  COMMITTEE_MEMBER: 'committee_member',
  HOST: 'host',
  DRIVER: 'driver',
  VOLUNTEER: 'volunteer',
  RECIPIENT: 'recipient',
  VIEWER: 'viewer',
  WORK_LOGGER: 'work_logger'
} as const;

// Granular yet intuitive permission system
export const PERMISSIONS = {
  // Administrative permissions
  ADMIN_ACCESS: 'admin_access',
  MANAGE_USERS: 'manage_users',
  MANAGE_ANNOUNCEMENTS: 'manage_announcements',
  
  // Main tab access permissions
  ACCESS_DIRECTORY: 'access_directory',
  ACCESS_HOSTS: 'access_hosts', 
  ACCESS_RECIPIENTS: 'access_recipients',
  ACCESS_DRIVERS: 'access_drivers',
  ACCESS_COLLECTIONS: 'access_collections',
  ACCESS_CHAT: 'access_chat',
  ACCESS_MESSAGES: 'access_messages',
  ACCESS_TOOLKIT: 'access_toolkit',
  
  // Operations section permissions  
  ACCESS_MEETINGS: 'access_meetings',
  ACCESS_ANALYTICS: 'access_analytics',
  ACCESS_REPORTS: 'access_reports',
  ACCESS_PROJECTS: 'access_projects',
  ACCESS_ROLE_DEMO: 'access_role_demo',
  
  // Resources section permissions
  ACCESS_SUGGESTIONS: 'access_suggestions',
  ACCESS_SANDWICH_DATA: 'access_sandwich_data',
  ACCESS_GOVERNANCE: 'access_governance',
  ACCESS_WORK_LOGS: 'access_work_logs',
  
  // Simplified management permissions for each section
  MANAGE_HOSTS: 'manage_hosts',
  MANAGE_RECIPIENTS: 'manage_recipients', 
  MANAGE_DRIVERS: 'manage_drivers',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_MEETINGS: 'manage_meetings',
  MANAGE_SUGGESTIONS: 'manage_suggestions',
  SUBMIT_SUGGESTIONS: 'submit_suggestions',
  MANAGE_COLLECTIONS: 'manage_collections',
  
  // Content creation permissions (automatically grants edit/delete of own content)
  CREATE_PROJECTS: 'create_projects',
  CREATE_COLLECTIONS: 'create_collections',
  CREATE_WORK_LOGS: 'create_work_logs',
  EDIT_OWN_PROJECTS: 'edit_own_projects',
  DELETE_OWN_PROJECTS: 'delete_own_projects',
  EDIT_OWN_COLLECTIONS: 'edit_own_collections',
  DELETE_OWN_COLLECTIONS: 'delete_own_collections',
  
  // Override permissions for editing/deleting others' content
  EDIT_ALL_PROJECTS: 'edit_all_projects',
  DELETE_ALL_PROJECTS: 'delete_all_projects',
  EDIT_ALL_COLLECTIONS: 'edit_all_collections',
  DELETE_ALL_COLLECTIONS: 'delete_all_collections',
  
  // Work log specific permissions
  EDIT_OWN_WORK_LOGS: 'edit_own_work_logs',
  DELETE_OWN_WORK_LOGS: 'delete_own_work_logs',
  VIEW_ALL_WORK_LOGS: 'view_all_work_logs',
  EDIT_ALL_WORK_LOGS: 'edit_all_work_logs',
  DELETE_ALL_WORK_LOGS: 'delete_all_work_logs',
  
  // Data action permissions
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
  SCHEDULE_REPORTS: 'schedule_reports',
  
  // Message and communication permissions
  SEND_MESSAGES: 'send_messages',
  MODERATE_MESSAGES: 'moderate_messages',
  DIRECT_MESSAGES: 'direct_messages',
  GROUP_MESSAGES: 'group_messages',
  
  // Chat-specific permissions
  GENERAL_CHAT: 'general_chat',
  COMMITTEE_CHAT: 'committee_chat',
  HOST_CHAT: 'host_chat',
  DRIVER_CHAT: 'driver_chat',
  RECIPIENT_CHAT: 'recipient_chat',
  CORE_TEAM_CHAT: 'core_team_chat',
  
  // Legacy support for existing components (backwards compatibility)
  VIEW_PHONE_DIRECTORY: 'access_directory',
  VIEW_HOSTS: 'access_hosts',
  VIEW_RECIPIENTS: 'access_recipients', 
  VIEW_DRIVERS: 'access_drivers',
  VIEW_COLLECTIONS: 'access_collections',
  VIEW_REPORTS: 'access_reports',
  VIEW_MEETINGS: 'access_meetings',
  VIEW_ANALYTICS: 'access_analytics',
  VIEW_PROJECTS: 'access_projects',
  VIEW_ROLE_DEMO: 'access_role_demo',
  VIEW_SUGGESTIONS: 'access_suggestions',
  VIEW_SANDWICH_DATA: 'access_sandwich_data', 
  VIEW_GOVERNANCE: 'access_governance',
  VIEW_USERS: 'manage_users',
  VIEW_COMMITTEE: 'committee_chat',
  TOOLKIT_ACCESS: 'access_toolkit',
  EDIT_MEETINGS: 'manage_meetings',
  RESPOND_TO_SUGGESTIONS: 'manage_suggestions'
} as const;

export function getDefaultPermissionsForRole(role: string): string[] {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return Object.values(PERMISSIONS);
      
    case USER_ROLES.ADMIN:
      return Object.values(PERMISSIONS).filter(p => p !== PERMISSIONS.MODERATE_MESSAGES);
    
    case USER_ROLES.COMMITTEE_MEMBER:
      return [
        // Can view these sections but not manage them
        PERMISSIONS.ACCESS_DIRECTORY,
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_MEETINGS,
        PERMISSIONS.ACCESS_ANALYTICS,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_ROLE_DEMO,
        PERMISSIONS.ACCESS_SUGGESTIONS,
        PERMISSIONS.ACCESS_SANDWICH_DATA,
        PERMISSIONS.ACCESS_GOVERNANCE,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.COMMITTEE_CHAT
      ];
    
    case USER_ROLES.HOST:
      return [
        PERMISSIONS.ACCESS_DIRECTORY,
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_PROJECTS,
        PERMISSIONS.ACCESS_SUGGESTIONS,
        PERMISSIONS.ACCESS_SANDWICH_DATA,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.HOST_CHAT,
        PERMISSIONS.CREATE_COLLECTIONS, // Can create collections (automatically can edit/delete own)
        PERMISSIONS.CREATE_PROJECTS // Can create projects (automatically can edit/delete own)
      ];
    
    case USER_ROLES.DRIVER:
      return [
        PERMISSIONS.ACCESS_DIRECTORY,
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_PROJECTS,
        PERMISSIONS.ACCESS_SUGGESTIONS,
        PERMISSIONS.ACCESS_SANDWICH_DATA,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.DRIVER_CHAT
      ];
    
    case USER_ROLES.VOLUNTEER:
      return [
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_PROJECTS,
        PERMISSIONS.ACCESS_SUGGESTIONS,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.CREATE_COLLECTIONS, // Can create collections (automatically can edit/delete own)
        PERMISSIONS.CREATE_PROJECTS, // Can create projects (automatically can edit/delete own)
        PERMISSIONS.SUBMIT_SUGGESTIONS
      ];
    
    case USER_ROLES.RECIPIENT:
      return [
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.GENERAL_CHAT,
        PERMISSIONS.RECIPIENT_CHAT
      ];
    
    case USER_ROLES.VIEWER:
      return [
        PERMISSIONS.ACCESS_DIRECTORY,
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_PROJECTS,
        PERMISSIONS.ACCESS_SANDWICH_DATA
      ];
    
    case USER_ROLES.WORK_LOGGER:
      return [
        PERMISSIONS.ACCESS_DIRECTORY,
        PERMISSIONS.ACCESS_COLLECTIONS,
        PERMISSIONS.ACCESS_CHAT,
        PERMISSIONS.ACCESS_MESSAGES,
        PERMISSIONS.ACCESS_TOOLKIT,
        PERMISSIONS.ACCESS_REPORTS,
        PERMISSIONS.ACCESS_PROJECTS,
        PERMISSIONS.GENERAL_CHAT,
        'log_work'
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

// Function to check if user can edit a specific collection entry
export function canEditCollection(user: any, collection: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and users with EDIT_ALL_COLLECTIONS can edit all collections
  if (user.role === 'super_admin' || user.permissions.includes(PERMISSIONS.EDIT_ALL_COLLECTIONS)) return true;
  
  // Users with CREATE_COLLECTIONS can edit collections they created
  if (user.permissions.includes(PERMISSIONS.CREATE_COLLECTIONS) && 
      (collection?.createdBy === user.id || collection?.created_by === user.id)) return true;
  
  return false;
}

// Function to check if user can delete a specific collection entry
export function canDeleteCollection(user: any, collection: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and users with DELETE_ALL_COLLECTIONS can delete all collections
  if (user.role === 'super_admin' || user.permissions.includes(PERMISSIONS.DELETE_ALL_COLLECTIONS)) return true;
  
  // Users with CREATE_COLLECTIONS can delete collections they created
  if (user.permissions.includes(PERMISSIONS.CREATE_COLLECTIONS) && 
      (collection?.createdBy === user.id || collection?.created_by === user.id)) return true;
  
  return false;
}

// Function to check if user can edit a specific project
export function canEditProject(user: any, project: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and users with EDIT_ALL_PROJECTS can edit all projects
  if (user.role === 'super_admin' || user.permissions.includes(PERMISSIONS.EDIT_ALL_PROJECTS)) return true;
  
  // Users with CREATE_PROJECTS can edit projects they created
  if (user.permissions.includes(PERMISSIONS.CREATE_PROJECTS) && 
      (project?.createdBy === user.id || project?.created_by === user.id)) return true;
  
  // Users with CREATE_PROJECTS can edit projects they're assigned to
  if (user.permissions.includes(PERMISSIONS.CREATE_PROJECTS)) {
    // Check multi-assignee IDs
    if (project?.assigneeIds && Array.isArray(project.assigneeIds)) {
      if (project.assigneeIds.includes(user.id)) return true;
    }
    
    // Check legacy single assignee ID
    if (project?.assigneeId === user.id) return true;
    
    // Check assigneeName matches user's display name or email
    if (project?.assigneeName) {
      const userDisplayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
      if (project.assigneeName === userDisplayName || project.assigneeName === user.email) return true;
    }
  }
  
  return false;
}

// Function to check if user can delete a specific project
export function canDeleteProject(user: any, project: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and users with DELETE_ALL_PROJECTS can delete all projects
  if (user.role === 'super_admin' || user.permissions.includes(PERMISSIONS.DELETE_ALL_PROJECTS)) return true;
  
  // Users with CREATE_PROJECTS can only delete projects they created (not assigned ones)
  if (user.permissions.includes(PERMISSIONS.CREATE_PROJECTS) && 
      (project?.createdBy === user.id || project?.created_by === user.id)) return true;
  
  return false;
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
    case USER_ROLES.WORK_LOGGER:
      return 'Work Logger';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
  }
}