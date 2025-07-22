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
  
  // Granular management permissions for each section
  MANAGE_HOSTS: 'manage_hosts',
  MANAGE_RECIPIENTS: 'manage_recipients', 
  MANAGE_DRIVERS: 'manage_drivers',
  MANAGE_COLLECTIONS: 'manage_collections',
  MANAGE_PROJECTS: 'manage_projects',
  EDIT_OWN_PROJECTS: 'edit_own_projects',
  EDIT_ALL_PROJECTS: 'edit_all_projects',
  DELETE_OWN_PROJECTS: 'delete_own_projects',
  DELETE_ALL_PROJECTS: 'delete_all_projects',
  MANAGE_MEETINGS: 'manage_meetings',
  MANAGE_SUGGESTIONS: 'manage_suggestions',
  SUBMIT_SUGGESTIONS: 'submit_suggestions',
  
  // Data action permissions
  EDIT_DATA: 'edit_data',
  DELETE_DATA: 'delete_data',
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
  
  // Legacy support for existing components
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
  EDIT_COLLECTIONS: 'edit_collections',
  DELETE_COLLECTIONS: 'delete_collections',
  EDIT_OWN_COLLECTIONS: 'edit_own_collections',
  DELETE_OWN_COLLECTIONS: 'delete_own_collections',
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
        PERMISSIONS.EDIT_OWN_COLLECTIONS, // Hosts can only edit their own collections
        PERMISSIONS.DELETE_OWN_COLLECTIONS // Hosts can only delete their own collections
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
        PERMISSIONS.EDIT_OWN_COLLECTIONS, // Volunteers can only edit their own collections
        PERMISSIONS.DELETE_OWN_COLLECTIONS // Volunteers can only delete their own collections
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
  
  // Super admins and admins can edit all collections
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Check if user has edit_collections permission (can edit ALL collections)
  if (user.permissions.includes('edit_collections') || user.permissions.includes('manage_collections')) return true;
  
  // Check if user has edit_own_collections permission AND owns this collection
  if (user.permissions.includes('edit_own_collections') && (collection?.createdBy === user.id || collection?.created_by === user.id)) return true;
  
  return false;
}

// Function to check if user can delete a specific collection entry
export function canDeleteCollection(user: any, collection: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and admins can delete all collections
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Check if user has delete_collections permission (can delete ALL collections)
  if (user.permissions.includes('delete_collections') || user.permissions.includes('manage_collections')) return true;
  
  // Check if user has delete_own_collections permission AND owns this collection
  if (user.permissions.includes('delete_own_collections') && (collection?.createdBy === user.id || collection?.created_by === user.id)) return true;
  
  return false;
}

// Function to check if user can edit a specific project
export function canEditProject(user: any, project: any): boolean {
  // Debug logging
  console.log('=== canEditProject Debug ===');
  console.log('User:', { id: user?.id, email: user?.email, firstName: user?.firstName, lastName: user?.lastName, role: user?.role });
  console.log('Project:', { id: project?.id, title: project?.title, assigneeName: project?.assigneeName, assigneeIds: project?.assigneeIds, createdBy: project?.createdBy, created_by: project?.created_by });
  console.log('User permissions:', user?.permissions);

  if (!user || !user.permissions) {
    console.log('Permission check failed: no user or permissions');
    return false;
  }
  
  // Super admins and admins can edit all projects
  if (user.role === 'super_admin' || user.role === 'admin') {
    console.log('Permission granted: super admin or admin role');
    return true;
  }
  
  // Check if user has edit_all_projects permission (can edit ALL projects)
  if (user.permissions.includes('edit_all_projects') || user.permissions.includes('manage_projects')) {
    console.log('Permission granted: has edit_all_projects or manage_projects');
    return true;
  }
  
  // Check if user has edit_own_projects permission AND is assigned to this project
  if (user.permissions.includes('edit_own_projects')) {
    console.log('User has edit_own_projects permission, checking assignment...');
    
    // Check if user is the assignee of this project
    if (project?.assigneeIds && Array.isArray(project.assigneeIds)) {
      console.log('Checking assigneeIds array:', project.assigneeIds, 'for user ID:', user.id);
      if (project.assigneeIds.includes(user.id)) {
        console.log('Permission granted: user ID found in assigneeIds');
        return true;
      }
    }
    
    // Check assigneeName matches user's display name or email
    if (project?.assigneeName) {
      const userDisplayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
      console.log('Checking assigneeName:', project.assigneeName, 'vs userDisplayName:', userDisplayName, 'vs email:', user.email);
      if (project.assigneeName === userDisplayName || project.assigneeName === user.email) {
        console.log('Permission granted: assigneeName matches user');
        return true;
      }
    }
    
    console.log('Permission denied: user not assigned to this project');
  } else {
    console.log('Permission denied: user does not have edit_own_projects permission');
  }
  
  console.log('=== canEditProject Result: FALSE ===');
  return false;
}

// Function to check if user can delete a specific project
export function canDeleteProject(user: any, project: any): boolean {
  if (!user || !user.permissions) return false;
  
  // Super admins and admins can delete all projects
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  
  // Check if user has delete_all_projects permission (can delete ALL projects)
  if (user.permissions.includes('delete_all_projects') || user.permissions.includes('manage_projects')) return true;
  
  // Check if user has delete_own_projects permission AND is assigned to this project
  if (user.permissions.includes('delete_own_projects')) {
    // Check if user is the assignee of this project
    if (project?.assigneeIds && Array.isArray(project.assigneeIds)) {
      // Multi-assignee support - check if user ID is in assignee list
      if (project.assigneeIds.includes(user.id)) return true;
    }
    
    // Check assigneeName matches user's display name or email
    if (project?.assigneeName) {
      const userDisplayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
      if (project.assigneeName === userDisplayName || project.assigneeName === user.email) return true;
    }
    
    // Creator ownership removed - projects can only be edited by assignees
  }
  
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