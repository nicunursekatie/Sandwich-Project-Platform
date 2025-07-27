import { 
  users, projects, projectTasks, projectComments, taskCompletions, messages, weeklyReports, meetingMinutes, driveLinks, sandwichCollections, agendaItems, meetings, driverAgreements, hosts, hostContacts, recipients, contacts, notifications, committees, committeeMemberships, announcements, suggestions, suggestionResponses,
  type User, type InsertUser, type UpsertUser,
  type Project, type InsertProject,
  type ProjectTask, type InsertProjectTask,
  type ProjectComment, type InsertProjectComment,
  type TaskCompletion, type InsertTaskCompletion,
  type Message, type InsertMessage,
  type WeeklyReport, type InsertWeeklyReport,
  type SandwichCollection, type InsertSandwichCollection,
  type MeetingMinutes, type InsertMeetingMinutes,
  type DriveLink, type InsertDriveLink,
  type AgendaItem, type InsertAgendaItem,
  type Meeting, type InsertMeeting,
  type DriverAgreement, type InsertDriverAgreement,
  type Host, type InsertHost,
  type HostContact, type InsertHostContact,
  type Recipient, type InsertRecipient,
  type Contact, type InsertContact,
  type Notification, type InsertNotification,
  type Committee, type InsertCommittee,
  type CommitteeMembership, type InsertCommitteeMembership,
  type Suggestion, type InsertSuggestion,
  type SuggestionResponse, type InsertSuggestionResponse
} from "@shared/schema";

export interface IStorage {
  // Users (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Legacy user methods (for backwards compatibility)
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getArchivedProjects(): Promise<any[]>;
  archiveProject(id: number, userId?: string, userName?: string): Promise<any>;
  
  // Project Tasks
  getProjectTasks(projectId: number): Promise<ProjectTask[]>;
  getTaskById(id: number): Promise<ProjectTask | undefined>;
  getProjectTask(taskId: number): Promise<ProjectTask | undefined>;
  createProjectTask(task: InsertProjectTask): Promise<ProjectTask>;
  updateProjectTask(id: number, updates: Partial<ProjectTask>): Promise<ProjectTask | undefined>;
  updateTaskStatus(id: number, status: string): Promise<boolean>;
  deleteProjectTask(id: number): Promise<boolean>;
  getProjectCongratulations(projectId: number): Promise<any[]>;
  
  // Task Completions
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
  getTaskCompletions(taskId: number): Promise<TaskCompletion[]>;
  removeTaskCompletion(taskId: number, userId: string): Promise<boolean>;
  
  // Project Comments
  getProjectComments(projectId: number): Promise<ProjectComment[]>;
  createProjectComment(comment: InsertProjectComment): Promise<ProjectComment>;
  deleteProjectComment(id: number): Promise<boolean>;
  
  // Committee management
  getAllCommittees(): Promise<Committee[]>;
  getCommittee(id: string): Promise<Committee | undefined>;
  createCommittee(committee: InsertCommittee): Promise<Committee>;
  updateCommittee(id: string, updates: Partial<Committee>): Promise<Committee | undefined>;
  deleteCommittee(id: string): Promise<boolean>;
  
  // Committee membership management
  getUserCommittees(userId: string): Promise<Array<Committee & { membership: CommitteeMembership }>>;
  getCommitteeMembers(committeeId: string): Promise<Array<User & { membership: CommitteeMembership }>>;
  addUserToCommittee(membership: InsertCommitteeMembership): Promise<CommitteeMembership>;
  updateCommitteeMembership(id: number, updates: Partial<CommitteeMembership>): Promise<CommitteeMembership | undefined>;
  removeUserFromCommittee(userId: string, committeeId: string): Promise<boolean>;
  isUserCommitteeMember(userId: string, committeeId: string): Promise<boolean>;
  
  // Messages
  getAllMessages(): Promise<Message[]>;
  getRecentMessages(limit: number): Promise<Message[]>;
  getMessagesByCommittee(committee: string): Promise<Message[]>;
  getDirectMessages(userId1: string, userId2: string): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | undefined>;
  markMessageAsRead(messageId: number, userId: string): Promise<void>;
  createMessage(message: InsertMessage): Promise<Message>;
  getThreadMessages(threadId: number): Promise<Message[]>;
  createReply(message: InsertMessage, parentId: number): Promise<Message>;
  updateReplyCount(messageId: number): Promise<void>;
  deleteMessage(id: number): Promise<boolean>;
  getMessagesBySender(senderId: string): Promise<Message[]>;
  getMessagesForRecipient(recipientId: string): Promise<Message[]>;
  
  // Group messaging with individual thread management
  getUserMessageGroups(userId: string): Promise<any[]>;
  getMessageGroupMessages(groupId: number, userId: string): Promise<Message[]>;
  createMessageGroup(group: any): Promise<any>;
  addUserToMessageGroup(groupId: number, userId: string, role?: string): Promise<any>;
  
  // Conversation methods
  createConversation(conversationData: any, participants: string[]): Promise<any>;
  getConversationMessages(conversationId: number, userId: string): Promise<any[]>;
  addConversationMessage(messageData: any): Promise<any>;
  updateConversationMessage(messageId: number, userId: string, updates: any): Promise<any>;
  deleteConversationMessage(messageId: number, userId: string): Promise<boolean>;
  getConversationParticipants(conversationId: number): Promise<any[]>;
  
  // Message likes methods
  likeMessage(messageId: number, userId: string, userName: string): Promise<any>;
  unlikeMessage(messageId: number, userId: string): Promise<boolean>;
  getMessageLikes(messageId: number): Promise<any[]>;
  hasUserLikedMessage(messageId: number, userId: string): Promise<boolean>;
  
  // Thread participant management - individual user control over group threads
  getThreadParticipants(threadId: number): Promise<any[]>;
  getParticipantStatus(threadId: number, userId: string): Promise<string | null>;
  updateParticipantStatus(threadId: number, userId: string, status: 'active' | 'archived' | 'left' | 'muted'): Promise<boolean>;
  createThreadParticipant(threadId: number, userId: string): Promise<any>;
  updateParticipantLastRead(threadId: number, userId: string): Promise<boolean>;
  
  // Weekly Reports
  getAllWeeklyReports(): Promise<WeeklyReport[]>;
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  
  // Sandwich Collections
  getAllSandwichCollections(): Promise<SandwichCollection[]>;
  getSandwichCollections(limit: number, offset: number): Promise<SandwichCollection[]>;
  getSandwichCollectionsCount(): Promise<number>;
  getCollectionStats(): Promise<{ totalEntries: number; totalSandwiches: number; }>;
  createSandwichCollection(collection: InsertSandwichCollection): Promise<SandwichCollection>;
  updateSandwichCollection(id: number, updates: Partial<SandwichCollection>): Promise<SandwichCollection | undefined>;
  deleteSandwichCollection(id: number): Promise<boolean>;
  updateCollectionHostNames(oldHostName: string, newHostName: string): Promise<number>;
  
  // Meeting Minutes
  getAllMeetingMinutes(): Promise<MeetingMinutes[]>;
  getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]>;
  createMeetingMinutes(minutes: InsertMeetingMinutes): Promise<MeetingMinutes>;
  deleteMeetingMinutes(id: number): Promise<boolean>;
  
  // Drive Links
  getAllDriveLinks(): Promise<DriveLink[]>;
  createDriveLink(link: InsertDriveLink): Promise<DriveLink>;
  
  // Agenda Items
  getAllAgendaItems(): Promise<AgendaItem[]>;
  createAgendaItem(item: InsertAgendaItem): Promise<AgendaItem>;
  updateAgendaItemStatus(id: number, status: string): Promise<AgendaItem | undefined>;
  updateAgendaItem(id: number, updates: Partial<AgendaItem>): Promise<AgendaItem | undefined>;
  deleteAgendaItem(id: number): Promise<boolean>;
  
  // Meetings
  getCurrentMeeting(): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
  getMeetingsByType(type: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeetingAgenda(id: number, agenda: string): Promise<Meeting | undefined>;
  updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Driver Agreements (admin access only)
  createDriverAgreement(agreement: InsertDriverAgreement): Promise<DriverAgreement>;
  
  // Hosts
  getAllHosts(): Promise<Host[]>;
  getAllHostsWithContacts(): Promise<Array<Host & { contacts: HostContact[] }>>;
  getHost(id: number): Promise<Host | undefined>;
  createHost(host: InsertHost): Promise<Host>;
  updateHost(id: number, updates: Partial<Host>): Promise<Host | undefined>;
  deleteHost(id: number): Promise<boolean>;
  
  // Recipients
  getAllRecipients(): Promise<Recipient[]>;
  getRecipient(id: number): Promise<Recipient | undefined>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  updateRecipient(id: number, updates: Partial<Recipient>): Promise<Recipient | undefined>;
  deleteRecipient(id: number): Promise<boolean>;
  
  // General Contacts
  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;
  
  // Host Contacts
  createHostContact(contact: InsertHostContact): Promise<HostContact>;
  getHostContacts(hostId: number): Promise<HostContact[]>;
  updateHostContact(id: number, updates: Partial<HostContact>): Promise<HostContact | undefined>;
  deleteHostContact(id: number): Promise<boolean>;
  getAllHostsWithContacts(): Promise<Array<Host & { contacts: HostContact[] }>>;
  
  // Notifications & Celebrations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  createCelebration(userId: string, taskId: number, message: string): Promise<Notification>;
  
  // Announcements
  getAllAnnouncements(): Promise<any[]>;
  createAnnouncement(announcement: any): Promise<any>;
  updateAnnouncement(id: number, updates: any): Promise<any | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  
  // Suggestions Portal
  getAllSuggestions(): Promise<Suggestion[]>;
  getSuggestion(id: number): Promise<Suggestion | undefined>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  updateSuggestion(id: number, updates: Partial<Suggestion>): Promise<Suggestion | undefined>;
  deleteSuggestion(id: number): Promise<boolean>;
  upvoteSuggestion(id: number): Promise<boolean>;
  
  // Suggestion Responses
  getSuggestionResponses(suggestionId: number): Promise<SuggestionResponse[]>;
  createSuggestionResponse(response: InsertSuggestionResponse): Promise<SuggestionResponse>;
  deleteSuggestionResponse(id: number): Promise<boolean>;

  // Project assignments
  getProjectAssignments(projectId: number): Promise<any[]>;
  addProjectAssignment(assignment: { projectId: number; userId: string; role: string }): Promise<any>;
  removeProjectAssignment(projectId: number, userId: string): Promise<boolean>;
  updateProjectAssignment(projectId: number, userId: string, updates: { role: string }): Promise<any>;

  // Chat message methods for Socket.IO
  createChatMessage(data: { channel: string; userId: string; userName: string; content: string }): Promise<any>;
  getChatMessages(channel: string, limit?: number): Promise<any[]>;
  updateChatMessage(id: number, updates: { content: string }): Promise<void>;
  deleteChatMessage(id: number): Promise<void>;
  markChannelMessagesAsRead(userId: string, channel: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private projectTasks: Map<number, ProjectTask>;
  private projectComments: Map<number, ProjectComment>;
  private messages: Map<number, Message>;
  private weeklyReports: Map<number, WeeklyReport>;
  private sandwichCollections: Map<number, SandwichCollection>;
  private meetingMinutes: Map<number, MeetingMinutes>;
  private driveLinks: Map<number, DriveLink>;
  private agendaItems: Map<number, AgendaItem>;
  private meetings: Map<number, Meeting>;
  private driverAgreements: Map<number, DriverAgreement>;
  private hosts: Map<number, Host>;
  private hostContacts: Map<number, HostContact>;
  private recipients: Map<number, Recipient>;
  private contacts: Map<number, Contact>;
  private notifications: Map<number, Notification>;
  private committees: Map<string, Committee>;
  private committeeMemberships: Map<number, CommitteeMembership>;
  private announcements: Map<number, any>;
  private suggestions: Map<number, Suggestion>;
  private suggestionResponses: Map<number, SuggestionResponse>;
  private currentIds: {
    user: number;
    project: number;
    projectTask: number;
    projectComment: number;
    message: number;
    weeklyReport: number;
    sandwichCollection: number;
    meetingMinutes: number;
    driveLink: number;
    agendaItem: number;
    meeting: number;
    driverAgreement: number;
    host: number;
    hostContact: number;
    recipient: number;
    contact: number;
    notification: number;
    committeeMembership: number;
    announcement: number;
    suggestion: number;
    suggestionResponse: number;
  };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectTasks = new Map();
    this.projectComments = new Map();
    this.messages = new Map();
    this.weeklyReports = new Map();
    this.sandwichCollections = new Map();
    this.meetingMinutes = new Map();
    this.driveLinks = new Map();
    this.agendaItems = new Map();
    this.meetings = new Map();
    this.driverAgreements = new Map();
    this.hosts = new Map();
    this.hostContacts = new Map();
    this.recipients = new Map();
    this.contacts = new Map();
    this.notifications = new Map();
    this.committees = new Map();
    this.committeeMemberships = new Map();
    this.announcements = new Map();
    this.suggestions = new Map();
    this.suggestionResponses = new Map();
    this.taskCompletions = new Map();
    this.currentIds = {
      user: 1,
      project: 1,
      projectTask: 1,
      projectComment: 1,
      message: 1,
      weeklyReport: 1,
      sandwichCollection: 1,
      meetingMinutes: 1,
      driveLink: 1,
      agendaItem: 1,
      meeting: 1,
      driverAgreement: 1,
      host: 1,
      hostContact: 1,
      recipient: 1,
      contact: 1,
      notification: 1,
      committeeMembership: 1,
      announcement: 1,
      suggestion: 1,
      suggestionResponse: 1
    };
    
    // No sample data - start with clean storage
  }

  // User methods (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const newUser: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || 'volunteer',
      permissions: userData.permissions || {},
      metadata: userData.metadata || {},
      isActive: userData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(Number(userData.id), newUser);
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      const updated: User = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(Number(userData.id), updated);
      return updated;
    } else {
      const newUser: User = {
        id: userData.id,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'volunteer',
        permissions: userData.permissions || {},
        isActive: userData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(Number(userData.id), newUser);
      return newUser;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updated: User = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(Number(id), updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const numericId = Number(id);
    if (this.users.has(numericId)) {
      this.users.delete(numericId);
      return true;
    }
    return false;
  }

  // Legacy user methods (for backwards compatibility)
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === username);
  }



  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentIds.project++;
    const project: Project = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  async getArchivedProjects(): Promise<any[]> {
    // For MemStorage, return empty array for now
    return [];
  }

  async archiveProject(id: number, userId?: string, userName?: string): Promise<boolean> {
    // For MemStorage, just delete the project (simulating archive)
    return this.deleteProject(id);
  }

  // Project Task methods
  async getProjectTasks(projectId: number): Promise<ProjectTask[]> {
    return Array.from(this.projectTasks.values())
      .filter(task => task.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProjectTask(insertTask: InsertProjectTask): Promise<ProjectTask> {
    const id = this.currentIds.projectTask++;
    const task: ProjectTask = { 
      ...insertTask, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projectTasks.set(id, task);
    return task;
  }

  async updateProjectTask(id: number, updates: Partial<ProjectTask>): Promise<ProjectTask | undefined> {
    const task = this.projectTasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    this.projectTasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteProjectTask(id: number): Promise<boolean> {
    return this.projectTasks.delete(id);
  }

  async getTaskById(id: number): Promise<ProjectTask | undefined> {
    return this.projectTasks.get(id);
  }

  async getProjectTask(taskId: number): Promise<ProjectTask | undefined> {
    return this.projectTasks.get(taskId);
  }

  async updateTaskStatus(id: number, status: string): Promise<boolean> {
    const task = this.projectTasks.get(id);
    if (!task) return false;
    task.status = status;
    this.projectTasks.set(id, task);
    return true;
  }

  // Task completion methods (for fallback storage)
  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    // For fallback storage, we'll just return a mock completion
    const mockCompletion: TaskCompletion = {
      id: Date.now(),
      taskId: completion.taskId,
      userId: completion.userId,
      userName: completion.userName,
      completedAt: new Date(),
      notes: completion.notes
    };
    return mockCompletion;
  }

  async getTaskCompletions(taskId: number): Promise<TaskCompletion[]> {
    // For fallback storage, return empty array
    return [];
  }

  async removeTaskCompletion(taskId: number, userId: string): Promise<boolean> {
    // For fallback storage, always return true
    return true;
  }

  // Project Comment methods
  async getProjectComments(projectId: number): Promise<ProjectComment[]> {
    return Array.from(this.projectComments.values())
      .filter(comment => comment.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const id = this.currentIds.projectComment++;
    const comment: ProjectComment = { 
      ...insertComment, 
      id,
      createdAt: new Date()
    };
    this.projectComments.set(id, comment);
    return comment;
  }

  async deleteProjectComment(id: number): Promise<boolean> {
    return this.projectComments.delete(id);
  }

  // Message methods
  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    const allMessages = await this.getAllMessages();
    return allMessages.slice(0, limit);
  }

  async getMessagesByCommittee(committee: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.committee === committee)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getDirectMessages(userId1: string, userId2: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        message.committee === "direct" && (
          (message.userId === userId1 && message.recipientId === userId2) ||
          (message.userId === userId2 && message.recipientId === userId1)
        )
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    // For the real-time messaging system, we don't have a read status field in the Message schema
    // This is a placeholder implementation for now
    // In a real implementation, you would need a separate table for message read status
    console.log(`MemStorage: Marking message ${messageId} as read for user ${userId}`);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentIds.message++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      timestamp: new Date(),
      parentId: insertMessage.parentId || null,
      threadId: insertMessage.threadId || id,
      replyCount: 0,
      committee: insertMessage.committee || "general"
    };
    this.messages.set(id, message);
    return message;
  }

  async getThreadMessages(threadId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.threadId === threadId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createReply(insertMessage: InsertMessage, parentId: number): Promise<Message> {
    const parentMessage = this.messages.get(parentId);
    if (!parentMessage) {
      throw new Error("Parent message not found");
    }

    const id = this.currentIds.message++;
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: new Date(),
      parentId: parentId,
      threadId: parentMessage.threadId,
      replyCount: 0
    };
    
    this.messages.set(id, message);
    await this.updateReplyCount(parentMessage.threadId === parentMessage.id ? parentMessage.id : parentMessage.threadId);
    
    return message;
  }

  async updateReplyCount(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      const replyCount = Array.from(this.messages.values())
        .filter(m => m.threadId === message.threadId && m.id !== message.id).length;
      
      const updatedMessage = { ...message, replyCount };
      this.messages.set(messageId, updatedMessage);
    }
  }

  async deleteMessage(id: number): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Committee management methods
  async getAllCommittees(): Promise<Committee[]> {
    return Array.from(this.committees.values());
  }

  async getCommittee(id: string): Promise<Committee | undefined> {
    return this.committees.get(id);
  }

  async createCommittee(committee: InsertCommittee): Promise<Committee> {
    const newCommittee: Committee = {
      ...committee,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.committees.set(newCommittee.id, newCommittee);
    return newCommittee;
  }

  async updateCommittee(id: string, updates: Partial<Committee>): Promise<Committee | undefined> {
    const committee = this.committees.get(id);
    if (!committee) return undefined;
    
    const updatedCommittee = { 
      ...committee, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.committees.set(id, updatedCommittee);
    return updatedCommittee;
  }

  async deleteCommittee(id: string): Promise<boolean> {
    return this.committees.delete(id);
  }

  // Committee membership management methods
  async getUserCommittees(userId: string): Promise<Array<Committee & { membership: CommitteeMembership }>> {
    const memberships = Array.from(this.committeeMemberships.values())
      .filter(membership => membership.userId === userId);
    
    const result: Array<Committee & { membership: CommitteeMembership }> = [];
    for (const membership of memberships) {
      const committee = this.committees.get(membership.committeeId);
      if (committee) {
        result.push({ ...committee, membership });
      }
    }
    return result;
  }

  async getCommitteeMembers(committeeId: string): Promise<Array<User & { membership: CommitteeMembership }>> {
    const memberships = Array.from(this.committeeMemberships.values())
      .filter(membership => membership.committeeId === committeeId);
    
    const result: Array<User & { membership: CommitteeMembership }> = [];
    for (const membership of memberships) {
      const user = await this.getUser(membership.userId);
      if (user) {
        result.push({ ...user, membership });
      }
    }
    return result;
  }

  async addUserToCommittee(membership: InsertCommitteeMembership): Promise<CommitteeMembership> {
    const id = this.currentIds.committeeMembership++;
    const newMembership: CommitteeMembership = {
      ...membership,
      id,
      joinedAt: new Date()
    };
    this.committeeMemberships.set(id, newMembership);
    return newMembership;
  }

  async updateCommitteeMembership(id: number, updates: Partial<CommitteeMembership>): Promise<CommitteeMembership | undefined> {
    const membership = this.committeeMemberships.get(id);
    if (!membership) return undefined;
    
    const updatedMembership = { ...membership, ...updates };
    this.committeeMemberships.set(id, updatedMembership);
    return updatedMembership;
  }

  async removeUserFromCommittee(userId: string, committeeId: string): Promise<boolean> {
    for (const [id, membership] of this.committeeMemberships.entries()) {
      if (membership.userId === userId && membership.committeeId === committeeId) {
        return this.committeeMemberships.delete(id);
      }
    }
    return false;
  }

  async isUserCommitteeMember(userId: string, committeeId: string): Promise<boolean> {
    for (const membership of this.committeeMemberships.values()) {
      if (membership.userId === userId && membership.committeeId === committeeId) {
        return true;
      }
    }
    return false;
  }

  // Weekly Report methods
  async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    return Array.from(this.weeklyReports.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const id = this.currentIds.weeklyReport++;
    const report: WeeklyReport = { 
      ...insertReport, 
      id, 
      submittedAt: new Date()
    };
    this.weeklyReports.set(id, report);
    return report;
  }

  // Sandwich Collection methods
  async getAllSandwichCollections(): Promise<SandwichCollection[]> {
    return Array.from(this.sandwichCollections.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async getSandwichCollections(limit: number, offset: number): Promise<SandwichCollection[]> {
    const all = await this.getAllSandwichCollections();
    return all.slice(offset, offset + limit);
  }

  async getSandwichCollectionsCount(): Promise<number> {
    return this.sandwichCollections.size;
  }

  async getCollectionStats(): Promise<{ totalEntries: number; totalSandwiches: number; }> {
    const collections = Array.from(this.sandwichCollections.values());
    // PHASE 5: Use ONLY new columns - no JSON parsing
    const totalSandwiches = collections.reduce((sum, collection) => {
      const individual = collection.individualSandwiches || 0;
      const group1 = (collection as any).group1Count || 0;
      const group2 = (collection as any).group2Count || 0;
      return sum + individual + group1 + group2;
    }, 0);
    return {
      totalEntries: collections.length,
      totalSandwiches
    };
  }

  async createSandwichCollection(insertCollection: InsertSandwichCollection & {id?: number}): Promise<SandwichCollection> {
    const id = insertCollection.id || this.currentIds.sandwichCollection++;
    // Update currentIds if a higher ID is provided
    if (insertCollection.id && insertCollection.id >= this.currentIds.sandwichCollection) {
      this.currentIds.sandwichCollection = insertCollection.id + 1;
    }
    const collection: SandwichCollection = { 
      ...insertCollection, 
      id, 
      submittedAt: new Date()
    };
    this.sandwichCollections.set(id, collection);
    return collection;
  }

  async updateSandwichCollection(id: number, updates: Partial<SandwichCollection>): Promise<SandwichCollection | undefined> {
    const existing = this.sandwichCollections.get(id);
    if (!existing) return undefined;
    
    const updated: SandwichCollection = { ...existing, ...updates };
    this.sandwichCollections.set(id, updated);
    return updated;
  }

  async deleteSandwichCollection(id: number): Promise<boolean> {
    return this.sandwichCollections.delete(id);
  }

  async updateCollectionHostNames(oldHostName: string, newHostName: string): Promise<number> {
    let updatedCount = 0;
    for (const collection of this.sandwichCollections.values()) {
      if (collection.hostName === oldHostName) {
        collection.hostName = newHostName;
        updatedCount++;
      }
    }
    return updatedCount;
  }

  // Meeting Minutes methods
  async getAllMeetingMinutes(): Promise<MeetingMinutes[]> {
    return Array.from(this.meetingMinutes.values());
  }

  async getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]> {
    const allMinutes = await this.getAllMeetingMinutes();
    return allMinutes.slice(0, limit);
  }

  async createMeetingMinutes(insertMinutes: InsertMeetingMinutes): Promise<MeetingMinutes> {
    const id = this.currentIds.meetingMinutes++;
    const minutes: MeetingMinutes = { ...insertMinutes, id };
    this.meetingMinutes.set(id, minutes);
    return minutes;
  }

  async deleteMeetingMinutes(id: number): Promise<boolean> {
    return this.meetingMinutes.delete(id);
  }

  // Drive Link methods
  async getAllDriveLinks(): Promise<DriveLink[]> {
    return Array.from(this.driveLinks.values());
  }

  async createDriveLink(insertLink: InsertDriveLink): Promise<DriveLink> {
    const id = this.currentIds.driveLink++;
    const link: DriveLink = { ...insertLink, id };
    this.driveLinks.set(id, link);
    return link;
  }

  // Agenda Items
  async getAllAgendaItems(): Promise<AgendaItem[]> {
    return Array.from(this.agendaItems.values()).sort((a, b) => 
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  async createAgendaItem(insertItem: InsertAgendaItem): Promise<AgendaItem> {
    const id = this.currentIds.agendaItem++;
    const item: AgendaItem = { 
      ...insertItem, 
      id,
      submittedAt: new Date()
    };
    this.agendaItems.set(id, item);
    return item;
  }

  async updateAgendaItemStatus(id: number, status: string): Promise<AgendaItem | undefined> {
    const item = this.agendaItems.get(id);
    if (!item) return undefined;
    
    const updated: AgendaItem = { ...item, status };
    this.agendaItems.set(id, updated);
    return updated;
  }

  async updateAgendaItem(id: number, updates: Partial<AgendaItem>): Promise<AgendaItem | undefined> {
    const item = this.agendaItems.get(id);
    if (!item) return undefined;
    
    const updated: AgendaItem = { ...item, ...updates };
    this.agendaItems.set(id, updated);
    return updated;
  }

  async deleteAgendaItem(id: number): Promise<boolean> {
    return this.agendaItems.delete(id);
  }

  // Meetings
  async getCurrentMeeting(): Promise<Meeting | undefined> {
    const meetings = Array.from(this.meetings.values());
    return meetings.find(m => m.status === "planning") || meetings[0];
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getMeetingsByType(type: string): Promise<Meeting[]> {
    return Array.from(this.meetings.values())
      .filter(m => m.type === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = this.currentIds.meeting++;
    const meeting: Meeting = { 
      ...insertMeeting, 
      id,
      createdAt: new Date()
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async updateMeetingAgenda(id: number, agenda: string): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updated: Meeting = { 
      ...meeting, 
      finalAgenda: agenda,
      status: "agenda_set"
    };
    this.meetings.set(id, updated);
    return updated;
  }

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updated: Meeting = { 
      ...meeting, 
      ...updates
    };
    this.meetings.set(id, updated);
    return updated;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    return this.meetings.delete(id);
  }

  async createDriverAgreement(insertAgreement: InsertDriverAgreement): Promise<DriverAgreement> {
    const id = this.currentIds.driverAgreement++;
    const agreement: DriverAgreement = { 
      ...insertAgreement, 
      id,
      submittedAt: new Date()
    };
    this.driverAgreements.set(id, agreement);
    return agreement;
  }

  // Host methods
  async getAllHosts(): Promise<Host[]> {
    return Array.from(this.hosts.values());
  }

  async getHost(id: number): Promise<Host | undefined> {
    return this.hosts.get(id);
  }

  async createHost(insertHost: InsertHost): Promise<Host> {
    const id = this.currentIds.host++;
    const host: Host = { 
      ...insertHost, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.hosts.set(id, host);
    return host;
  }

  async updateHost(id: number, updates: Partial<Host>): Promise<Host | undefined> {
    const host = this.hosts.get(id);
    if (!host) return undefined;
    
    const updatedHost: Host = { 
      ...host, 
      ...updates, 
      updatedAt: new Date()
    };
    this.hosts.set(id, updatedHost);
    return updatedHost;
  }

  async deleteHost(id: number): Promise<boolean> {
    return this.hosts.delete(id);
  }

  // Recipients
  async getAllRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipients.values());
  }

  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }

  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const id = this.currentIds.recipient++;
    const recipient: Recipient = { 
      ...insertRecipient, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.recipients.set(id, recipient);
    return recipient;
  }

  async updateRecipient(id: number, updates: Partial<Recipient>): Promise<Recipient | undefined> {
    const recipient = this.recipients.get(id);
    if (!recipient) return undefined;
    
    const updatedRecipient: Recipient = { 
      ...recipient, 
      ...updates, 
      updatedAt: new Date()
    };
    this.recipients.set(id, updatedRecipient);
    return updatedRecipient;
  }

  async deleteRecipient(id: number): Promise<boolean> {
    return this.recipients.delete(id);
  }

  // General Contacts methods
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentIds.contact++;
    const now = new Date();
    const contact: Contact = {
      id,
      ...insertContact,
      createdAt: now,
      updatedAt: now,
      status: insertContact.status || "active",
      email: insertContact.email || null,
      address: insertContact.address || null,
      organization: insertContact.organization || null,
      role: insertContact.role || null,
      notes: insertContact.notes || null,
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact: Contact = { 
      ...contact, 
      ...updates, 
      updatedAt: new Date()
    };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Host Contact methods
  async createHostContact(insertContact: InsertHostContact): Promise<HostContact> {
    const id = this.currentIds.hostContact++;
    const now = new Date();
    const contact: HostContact = {
      id,
      ...insertContact,
      createdAt: now,
      updatedAt: now,
    };
    this.hostContacts.set(id, contact);
    return contact;
  }

  async getHostContacts(hostId: number): Promise<HostContact[]> {
    return Array.from(this.hostContacts.values())
      .filter(contact => contact.hostId === hostId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async updateHostContact(id: number, updates: Partial<HostContact>): Promise<HostContact | undefined> {
    const contact = this.hostContacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact: HostContact = { 
      ...contact, 
      ...updates, 
      updatedAt: new Date()
    };
    this.hostContacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteHostContact(id: number): Promise<boolean> {
    return this.hostContacts.delete(id);
  }

  async getAllHostsWithContacts(): Promise<Array<Host & { contacts: HostContact[] }>> {
    const allHosts = Array.from(this.hosts.values());
    return allHosts.map(host => ({
      ...host,
      contacts: Array.from(this.hostContacts.values()).filter(contact => contact.hostId === host.id)
    }));
  }

  // Notifications & Celebrations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentIds.notification++;
    const newNotification: Notification = {
      id,
      ...notification,
      createdAt: new Date(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(id, notification);
      return true;
    }
    return false;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async createCelebration(userId: string, taskId: number, message: string): Promise<Notification> {
    const celebrationEmojis = ["🎉", "🌟", "🎊", "🥳", "🏆", "✨", "👏", "💪"];
    const randomEmoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
    
    return this.createNotification({
      userId,
      type: "celebration",
      title: `${randomEmoji} Task Completed!`,
      message: `Thanks for completing your task! ${message}`,
      isRead: false,
      relatedType: "task",
      relatedId: taskId,
      celebrationData: {
        emoji: randomEmoji,
        achievementType: "task_completion",
        taskId,
        completedAt: new Date().toISOString()
      }
    });
  }

  // Announcement methods
  async getAllAnnouncements(): Promise<any[]> {
    return Array.from(this.announcements.values());
  }

  async createAnnouncement(announcement: any): Promise<any> {
    const id = this.currentIds.announcement++;
    const newAnnouncement = {
      id,
      ...announcement,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncement(id: number, updates: any): Promise<any | undefined> {
    const announcement = this.announcements.get(id);
    if (announcement) {
      const updatedAnnouncement = {
        ...announcement,
        ...updates,
        updatedAt: new Date(),
      };
      this.announcements.set(id, updatedAnnouncement);
      return updatedAnnouncement;
    }
    return undefined;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }

  // Project assignments
  async getProjectAssignments(projectId: number): Promise<any[]> {
    // For MemStorage, return empty array for now
    return [];
  }

  async addProjectAssignment(assignment: { projectId: number; userId: string; role: string }): Promise<any> {
    // For MemStorage, return basic assignment object
    return {
      id: Date.now(),
      projectId: assignment.projectId,
      userId: assignment.userId,
      role: assignment.role,
      assignedAt: new Date()
    };
  }

  async removeProjectAssignment(projectId: number, userId: string): Promise<boolean> {
    // For MemStorage, return true
    return true;
  }

  async updateProjectAssignment(projectId: number, userId: string, updates: { role: string }): Promise<any> {
    // For MemStorage, return updated assignment
    return {
      id: Date.now(),
      projectId,
      userId,
      role: updates.role,
      assignedAt: new Date()
    };
  }

  // Suggestions Portal methods
  async getAllSuggestions(): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSuggestion(id: number): Promise<Suggestion | undefined> {
    return this.suggestions.get(id);
  }

  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    const id = this.currentIds.suggestion++;
    const now = new Date();
    const newSuggestion: Suggestion = {
      id,
      ...suggestion,
      createdAt: now,
      updatedAt: now
    };
    this.suggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async updateSuggestion(id: number, updates: Partial<Suggestion>): Promise<Suggestion | undefined> {
    const suggestion = this.suggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion: Suggestion = { 
      ...suggestion, 
      ...updates, 
      updatedAt: new Date()
    };
    this.suggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  async deleteSuggestion(id: number): Promise<boolean> {
    // First delete all responses
    for (const [responseId, response] of this.suggestionResponses) {
      if (response.suggestionId === id) {
        this.suggestionResponses.delete(responseId);
      }
    }
    // Then delete the suggestion
    return this.suggestions.delete(id);
  }

  async upvoteSuggestion(id: number): Promise<boolean> {
    const suggestion = this.suggestions.get(id);
    if (suggestion) {
      suggestion.upvotes = (suggestion.upvotes || 0) + 1;
      this.suggestions.set(id, suggestion);
      return true;
    }
    return false;
  }

  async getSuggestionResponses(suggestionId: number): Promise<SuggestionResponse[]> {
    return Array.from(this.suggestionResponses.values())
      .filter(response => response.suggestionId === suggestionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async createSuggestionResponse(response: InsertSuggestionResponse): Promise<SuggestionResponse> {
    const id = this.currentIds.suggestionResponse++;
    const newResponse: SuggestionResponse = {
      id,
      ...response,
      createdAt: new Date()
    };
    this.suggestionResponses.set(id, newResponse);
    return newResponse;
  }

  async deleteSuggestionResponse(id: number): Promise<boolean> {
    return this.suggestionResponses.delete(id);
  }



  // Conversation methods (stub implementations for memory storage)
  async createConversation(conversationData: any, participants: string[]) {
    // TODO: Implement in memory storage
    return null;
  }

  async getConversationMessages(conversationId: number, userId: string) {
    // TODO: Implement in memory storage
    return [];
  }

  async addConversationMessage(messageData: any) {
    // TODO: Implement in memory storage
    return null;
  }

  async updateConversationMessage(messageId: number, userId: string, updates: any) {
    // TODO: Implement in memory storage
    return null;
  }

  async deleteConversationMessage(messageId: number, userId: string) {
    // TODO: Implement in memory storage
    return false;
  }

  async getConversationParticipants(conversationId: number) {
    // TODO: Implement in memory storage
    return [];
  }

  // Chat message methods for Socket.IO (fallback implementations)
  async createChatMessage(data: { channel: string; userId: string; userName: string; content: string }): Promise<any> {
    return {
      id: Date.now(),
      ...data,
      createdAt: new Date()
    };
  }

  async updateChatMessage(id: number, updates: { content: string }): Promise<void> {
    // In-memory storage doesn't persist anyway, so just log
    console.log(`[MemStorage] Updated chat message ${id} with content: ${updates.content}`);
  }

  async getChatMessages(channel: string, limit?: number): Promise<any[]> {
    return [];
  }

  async deleteChatMessage(id: number): Promise<void> {
    // No-op for memory storage
  }

  async markChannelMessagesAsRead(userId: string, channel: string): Promise<void> {
    // No-op for memory storage since it doesn't persist anyway
    console.log(`[MemStorage] Marked all messages in ${channel} as read for user ${userId}`);
  }
}

import { GoogleSheetsStorage } from './google-sheets';
import { DatabaseStorage } from './database-storage';

// Create storage instance with error handling
let storageInstance: IStorage;

try {
  // Priority 1: Use database storage if available (for persistence across deployments)
  if (process.env.DATABASE_URL) {
    console.log('Using database storage for data persistence...');
    storageInstance = new DatabaseStorage();
  } 
  // Priority 2: Use Google Sheets if database not available
  else if (process.env.GOOGLE_SPREADSHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    console.log('Database not available, using Google Sheets storage...');
    storageInstance = new GoogleSheetsStorage();
  } 
  // Fallback: Memory storage (data will not persist across deployments)
  else {
    console.log('No persistent storage configured, using memory storage (data will not persist)');
    storageInstance = new MemStorage();
  }
} catch (error) {
  console.error('Failed to initialize persistent storage, falling back to memory:', error);
  storageInstance = new MemStorage();
}

export const storage = storageInstance;
