import { 
  users, projects, messages, weeklyReports, meetingMinutes, driveLinks, sandwichCollections, agendaItems, meetings, driverAgreements, hosts, hostContacts, recipients, contacts,
  type User, type InsertUser, 
  type Project, type InsertProject,
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
  type Contact, type InsertContact
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Messages
  getAllMessages(): Promise<Message[]>;
  getRecentMessages(limit: number): Promise<Message[]>;
  getMessagesByCommittee(committee: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getThreadMessages(threadId: number): Promise<Message[]>;
  createReply(message: InsertMessage, parentId: number): Promise<Message>;
  updateReplyCount(messageId: number): Promise<void>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Weekly Reports
  getAllWeeklyReports(): Promise<WeeklyReport[]>;
  createWeeklyReport(report: InsertWeeklyReport): Promise<WeeklyReport>;
  
  // Sandwich Collections
  getAllSandwichCollections(): Promise<SandwichCollection[]>;
  createSandwichCollection(collection: InsertSandwichCollection): Promise<SandwichCollection>;
  updateSandwichCollection(id: number, updates: Partial<SandwichCollection>): Promise<SandwichCollection | undefined>;
  deleteSandwichCollection(id: number): Promise<boolean>;
  updateCollectionHostNames(oldHostName: string, newHostName: string): Promise<number>;
  
  // Meeting Minutes
  getAllMeetingMinutes(): Promise<MeetingMinutes[]>;
  getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]>;
  createMeetingMinutes(minutes: InsertMeetingMinutes): Promise<MeetingMinutes>;
  
  // Drive Links
  getAllDriveLinks(): Promise<DriveLink[]>;
  createDriveLink(link: InsertDriveLink): Promise<DriveLink>;
  
  // Agenda Items
  getAllAgendaItems(): Promise<AgendaItem[]>;
  createAgendaItem(item: InsertAgendaItem): Promise<AgendaItem>;
  updateAgendaItemStatus(id: number, status: string): Promise<AgendaItem | undefined>;
  updateAgendaItem(id: number, updates: Partial<AgendaItem>): Promise<AgendaItem | undefined>;
  
  // Meetings
  getCurrentMeeting(): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
  getMeetingsByType(type: string): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeetingAgenda(id: number, agenda: string): Promise<Meeting | undefined>;
  
  // Driver Agreements (admin access only)
  createDriverAgreement(agreement: InsertDriverAgreement): Promise<DriverAgreement>;
  
  // Hosts
  getAllHosts(): Promise<Host[]>;
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private messages: Map<number, Message>;
  private weeklyReports: Map<number, WeeklyReport>;
  private sandwichCollections: Map<number, SandwichCollection>;
  private meetingMinutes: Map<number, MeetingMinutes>;
  private driveLinks: Map<number, DriveLink>;
  private agendaItems: Map<number, AgendaItem>;
  private meetings: Map<number, Meeting>;
  private driverAgreements: Map<number, DriverAgreement>;
  private hosts: Map<number, Host>;
  private recipients: Map<number, Recipient>;
  private contacts: Map<number, Contact>;
  private currentIds: {
    user: number;
    project: number;
    message: number;
    weeklyReport: number;
    sandwichCollection: number;
    meetingMinutes: number;
    driveLink: number;
    agendaItem: number;
    meeting: number;
    driverAgreement: number;
    host: number;
    recipient: number;
    contact: number;
  };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.messages = new Map();
    this.weeklyReports = new Map();
    this.sandwichCollections = new Map();
    this.meetingMinutes = new Map();
    this.driveLinks = new Map();
    this.agendaItems = new Map();
    this.meetings = new Map();
    this.driverAgreements = new Map();
    this.hosts = new Map();
    this.recipients = new Map();
    this.contacts = new Map();
    this.currentIds = {
      user: 1,
      project: 1,
      message: 1,
      weeklyReport: 1,
      sandwichCollection: 1,
      meetingMinutes: 1,
      driveLink: 1,
      agendaItem: 1,
      meeting: 1,
      driverAgreement: 1,
      host: 1,
      recipient: 1,
      contact: 1,
    };
    
    // No sample data - start with clean storage
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

import { GoogleSheetsStorage } from './google-sheets';
import { db } from './db';
import { eq, desc, sql } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  // Messages
  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.timestamp));
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.timestamp)).limit(limit);
  }

  async getMessagesByCommittee(committee: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.committee, committee)).orderBy(desc(messages.timestamp));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getThreadMessages(threadId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.timestamp);
  }

  async createReply(insertMessage: InsertMessage, parentId: number): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    await this.updateReplyCount(parentId);
    return message;
  }

  async updateReplyCount(messageId: number): Promise<void> {
    await db.update(messages)
      .set({ replyCount: sql`${messages.replyCount} + 1` })
      .where(eq(messages.id, messageId));
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount > 0;
  }

  // Weekly Reports
  async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    return await db.select().from(weeklyReports).orderBy(desc(weeklyReports.submittedAt));
  }

  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const [report] = await db.insert(weeklyReports).values(insertReport).returning();
    return report;
  }

  // Sandwich Collections
  async getAllSandwichCollections(): Promise<SandwichCollection[]> {
    return await db.select().from(sandwichCollections).orderBy(desc(sandwichCollections.collectionDate));
  }

  async createSandwichCollection(insertCollection: InsertSandwichCollection): Promise<SandwichCollection> {
    const [collection] = await db.insert(sandwichCollections).values(insertCollection).returning();
    return collection;
  }

  async updateSandwichCollection(id: number, updates: Partial<SandwichCollection>): Promise<SandwichCollection | undefined> {
    const [collection] = await db.update(sandwichCollections).set(updates).where(eq(sandwichCollections.id, id)).returning();
    return collection || undefined;
  }

  async deleteSandwichCollection(id: number): Promise<boolean> {
    const result = await db.delete(sandwichCollections).where(eq(sandwichCollections.id, id));
    return result.rowCount > 0;
  }

  async updateCollectionHostNames(oldHostName: string, newHostName: string): Promise<number> {
    const result = await db
      .update(sandwichCollections)
      .set({ hostName: newHostName })
      .where(eq(sandwichCollections.hostName, oldHostName));
    return result.rowCount ?? 0;
  }

  // Meeting Minutes
  async getAllMeetingMinutes(): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(desc(meetingMinutes.date));
  }

  async getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(desc(meetingMinutes.date)).limit(limit);
  }

  async createMeetingMinutes(insertMinutes: InsertMeetingMinutes): Promise<MeetingMinutes> {
    const [minutes] = await db.insert(meetingMinutes).values(insertMinutes).returning();
    return minutes;
  }

  // Drive Links
  async getAllDriveLinks(): Promise<DriveLink[]> {
    return await db.select().from(driveLinks);
  }

  async createDriveLink(insertLink: InsertDriveLink): Promise<DriveLink> {
    const [link] = await db.insert(driveLinks).values(insertLink).returning();
    return link;
  }

  // Agenda Items
  async getAllAgendaItems(): Promise<AgendaItem[]> {
    return await db.select().from(agendaItems).orderBy(agendaItems.submittedAt);
  }

  async createAgendaItem(insertItem: InsertAgendaItem): Promise<AgendaItem> {
    const [item] = await db.insert(agendaItems).values(insertItem).returning();
    return item;
  }

  async updateAgendaItemStatus(id: number, status: string): Promise<AgendaItem | undefined> {
    const [item] = await db.update(agendaItems).set({ status }).where(eq(agendaItems.id, id)).returning();
    return item || undefined;
  }

  async updateAgendaItem(id: number, updates: Partial<AgendaItem>): Promise<AgendaItem | undefined> {
    const [item] = await db.update(agendaItems).set(updates).where(eq(agendaItems.id, id)).returning();
    return item || undefined;
  }

  // Meetings
  async getCurrentMeeting(): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.status, 'planning')).limit(1);
    return meeting || undefined;
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return await db.select().from(meetings).orderBy(desc(meetings.date));
  }

  async getMeetingsByType(type: string): Promise<Meeting[]> {
    return await db.select().from(meetings).where(eq(meetings.type, type)).orderBy(desc(meetings.date));
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(insertMeeting).returning();
    return meeting;
  }

  async updateMeetingAgenda(id: number, agenda: string): Promise<Meeting | undefined> {
    const [meeting] = await db.update(meetings).set({ finalAgenda: agenda }).where(eq(meetings.id, id)).returning();
    return meeting || undefined;
  }

  // Driver Agreements
  async createDriverAgreement(insertAgreement: InsertDriverAgreement): Promise<DriverAgreement> {
    const [agreement] = await db.insert(driverAgreements).values(insertAgreement).returning();
    return agreement;
  }

  // Hosts
  async getAllHosts(): Promise<Host[]> {
    return await db.select().from(hosts).orderBy(hosts.name);
  }

  async getHost(id: number): Promise<Host | undefined> {
    const [host] = await db.select().from(hosts).where(eq(hosts.id, id));
    return host || undefined;
  }

  async createHost(insertHost: InsertHost): Promise<Host> {
    const [host] = await db.insert(hosts).values(insertHost).returning();
    return host;
  }

  async updateHost(id: number, updates: Partial<Host>): Promise<Host | undefined> {
    const [host] = await db.update(hosts).set(updates).where(eq(hosts.id, id)).returning();
    return host || undefined;
  }

  async deleteHost(id: number): Promise<boolean> {
    const result = await db.delete(hosts).where(eq(hosts.id, id));
    return result.rowCount > 0;
  }

  // Recipients
  async getAllRecipients(): Promise<Recipient[]> {
    return await db.select().from(recipients).orderBy(recipients.name);
  }

  async getRecipient(id: number): Promise<Recipient | undefined> {
    const [recipient] = await db.select().from(recipients).where(eq(recipients.id, id));
    return recipient || undefined;
  }

  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const [recipient] = await db.insert(recipients).values(insertRecipient).returning();
    return recipient;
  }

  async updateRecipient(id: number, updates: Partial<Recipient>): Promise<Recipient | undefined> {
    const [recipient] = await db.update(recipients).set(updates).where(eq(recipients.id, id)).returning();
    return recipient || undefined;
  }

  async deleteRecipient(id: number): Promise<boolean> {
    const result = await db.delete(recipients).where(eq(recipients.id, id));
    return result.rowCount > 0;
  }
}

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
