import { 
  users, projects, messages, weeklyReports, meetingMinutes, driveLinks, sandwichCollections, agendaItems, meetings, driverAgreements, hosts,
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
  type Host, type InsertHost
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import type { IStorage } from "./storage";

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
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(limit);
  }

  async getMessagesByCommittee(committee: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.committee, committee)).orderBy(desc(messages.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getThreadMessages(threadId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.threadId, threadId)).orderBy(messages.createdAt);
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
    return await db.select().from(weeklyReports).orderBy(desc(weeklyReports.createdAt));
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

  // Meeting Minutes
  async getAllMeetingMinutes(): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(desc(meetingMinutes.createdAt));
  }

  async getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(desc(meetingMinutes.createdAt)).limit(limit);
  }

  async createMeetingMinutes(insertMinutes: InsertMeetingMinutes): Promise<MeetingMinutes> {
    const [minutes] = await db.insert(meetingMinutes).values(insertMinutes).returning();
    return minutes;
  }

  // Drive Links
  async getAllDriveLinks(): Promise<DriveLink[]> {
    return await db.select().from(driveLinks).orderBy(desc(driveLinks.createdAt));
  }

  async createDriveLink(insertLink: InsertDriveLink): Promise<DriveLink> {
    const [link] = await db.insert(driveLinks).values(insertLink).returning();
    return link;
  }

  // Agenda Items
  async getAllAgendaItems(): Promise<AgendaItem[]> {
    return await db.select().from(agendaItems).orderBy(agendaItems.createdAt);
  }

  async createAgendaItem(insertItem: InsertAgendaItem): Promise<AgendaItem> {
    const [item] = await db.insert(agendaItems).values(insertItem).returning();
    return item;
  }

  async updateAgendaItemStatus(id: number, status: string): Promise<void> {
    await db.update(agendaItems).set({ status }).where(eq(agendaItems.id, id));
  }

  async updateAgendaItem(id: number, updates: Partial<AgendaItem>): Promise<AgendaItem | undefined> {
    const [item] = await db.update(agendaItems).set(updates).where(eq(agendaItems.id, id)).returning();
    return item || undefined;
  }

  // Meetings
  async getCurrentMeeting(): Promise<Meeting | undefined> {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.status, 'active')).limit(1);
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
}