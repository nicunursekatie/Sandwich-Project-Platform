export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export const USER_ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator', 
  VOLUNTEER: 'volunteer',
  VIEWER: 'viewer'
} as const;

export const PERMISSIONS = {
  // Project management
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  VIEW_PROJECTS: 'view_projects',
  
  // Host management
  MANAGE_HOSTS: 'manage_hosts',
  VIEW_HOSTS: 'view_hosts',
  
  // Sandwich collections
  CREATE_COLLECTIONS: 'create_collections',
  EDIT_COLLECTIONS: 'edit_collections',
  DELETE_COLLECTIONS: 'delete_collections',
  VIEW_COLLECTIONS: 'view_collections',
  
  // Driver management
  MANAGE_DRIVERS: 'manage_drivers',
  VIEW_DRIVERS: 'view_drivers',
  
  // Messages and communication
  CREATE_MESSAGES: 'create_messages',
  DELETE_MESSAGES: 'delete_messages',
  VIEW_MESSAGES: 'view_messages',
  
  // Reports and analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  
  // Meetings
  MANAGE_MEETINGS: 'manage_meetings',
  VIEW_MEETINGS: 'view_meetings'
} as const;

export function hasRole(user: any, requiredRoles: string[]): boolean {
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
}

export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;
  
  // Admin role has all permissions
  if (user.role === USER_ROLES.ADMIN) return true;
  
  // Check specific permissions
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissions.includes(permission);
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Administrator';
    case USER_ROLES.COORDINATOR:
      return 'Coordinator';
    case USER_ROLES.VOLUNTEER:
      return 'Volunteer';
    case USER_ROLES.VIEWER:
      return 'Viewer';
    default:
      return 'Unknown';
  }
}

export function getDefaultPermissionsForRole(role: string): string[] {
  switch (role) {
    case USER_ROLES.ADMIN:
      return Object.values(PERMISSIONS);
    
    case USER_ROLES.COORDINATOR:
      return [
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.EDIT_PROJECTS,
        PERMISSIONS.CREATE_PROJECTS,
        PERMISSIONS.VIEW_HOSTS,
        PERMISSIONS.MANAGE_HOSTS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.CREATE_COLLECTIONS,
        PERMISSIONS.EDIT_COLLECTIONS,
        PERMISSIONS.VIEW_DRIVERS,
        PERMISSIONS.MANAGE_DRIVERS,
        PERMISSIONS.VIEW_MESSAGES,
        PERMISSIONS.CREATE_MESSAGES,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_MEETINGS,
        PERMISSIONS.MANAGE_MEETINGS
      ];
    
    case USER_ROLES.VOLUNTEER:
      return [
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.VIEW_HOSTS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.CREATE_COLLECTIONS,
        PERMISSIONS.VIEW_DRIVERS,
        PERMISSIONS.VIEW_MESSAGES,
        PERMISSIONS.CREATE_MESSAGES,
        PERMISSIONS.VIEW_MEETINGS
      ];
    
    case USER_ROLES.VIEWER:
      return [
        PERMISSIONS.VIEW_PROJECTS,
        PERMISSIONS.VIEW_HOSTS,
        PERMISSIONS.VIEW_COLLECTIONS,
        PERMISSIONS.VIEW_DRIVERS,
        PERMISSIONS.VIEW_MESSAGES,
        PERMISSIONS.VIEW_MEETINGS
      ];
    
    default:
      return [];
  }
}