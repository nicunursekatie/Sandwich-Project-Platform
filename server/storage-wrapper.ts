import type { IStorage } from './storage';
import { MemStorage } from './storage';
import { GoogleSheetsStorage } from './google-sheets';

class StorageWrapper implements IStorage {
  private primaryStorage: IStorage;
  private fallbackStorage: IStorage;
  private useGoogleSheets: boolean = false;

  constructor() {
    this.fallbackStorage = new MemStorage();
    
    if (this.hasGoogleSheetsCredentials()) {
      try {
        this.primaryStorage = new GoogleSheetsStorage();
        this.useGoogleSheets = true;
        console.log('Google Sheets storage initialized');
      } catch (error) {
        console.warn('Google Sheets initialization failed, using memory storage:', error);
        this.primaryStorage = this.fallbackStorage;
      }
    } else {
      console.log('Google Sheets credentials not provided, using memory storage');
      this.primaryStorage = this.fallbackStorage;
    }
  }

  private hasGoogleSheetsCredentials(): boolean {
    return !!(
      process.env.GOOGLE_SPREADSHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
    );
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    if (!this.useGoogleSheets) {
      return fallbackOperation();
    }

    try {
      return await operation();
    } catch (error) {
      console.warn('Google Sheets operation failed, using fallback:', error);
      return fallbackOperation();
    }
  }

  // User methods
  async getUser(id: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.getUser(id),
      () => this.fallbackStorage.getUser(id)
    );
  }

  async getUserByUsername(username: string) {
    return this.executeWithFallback(
      () => this.primaryStorage.getUserByUsername(username),
      () => this.fallbackStorage.getUserByUsername(username)
    );
  }

  async createUser(user: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createUser(user),
      () => this.fallbackStorage.createUser(user)
    );
  }

  // Project methods
  async getAllProjects() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllProjects(),
      () => this.fallbackStorage.getAllProjects()
    );
  }

  async getProject(id: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.getProject(id),
      () => this.fallbackStorage.getProject(id)
    );
  }

  async createProject(project: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createProject(project),
      () => this.fallbackStorage.createProject(project)
    );
  }

  async updateProject(id: number, updates: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateProject(id, updates),
      () => this.fallbackStorage.updateProject(id, updates)
    );
  }

  // Message methods
  async getAllMessages() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllMessages(),
      () => this.fallbackStorage.getAllMessages()
    );
  }

  async getRecentMessages(limit: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.getRecentMessages(limit),
      () => this.fallbackStorage.getRecentMessages(limit)
    );
  }

  async createMessage(message: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createMessage(message),
      () => this.fallbackStorage.createMessage(message)
    );
  }

  async getThreadMessages(threadId: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.getThreadMessages(threadId),
      () => this.fallbackStorage.getThreadMessages(threadId)
    );
  }

  async createReply(message: any, parentId: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.createReply(message, parentId),
      () => this.fallbackStorage.createReply(message, parentId)
    );
  }

  async updateReplyCount(messageId: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateReplyCount(messageId),
      () => this.fallbackStorage.updateReplyCount(messageId)
    );
  }

  // Weekly Reports methods
  async getAllWeeklyReports() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllWeeklyReports(),
      () => this.fallbackStorage.getAllWeeklyReports()
    );
  }

  async createWeeklyReport(report: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createWeeklyReport(report),
      () => this.fallbackStorage.createWeeklyReport(report)
    );
  }

  // Sandwich Collections methods
  async getAllSandwichCollections() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllSandwichCollections(),
      () => this.fallbackStorage.getAllSandwichCollections()
    );
  }

  async createSandwichCollection(collection: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createSandwichCollection(collection),
      () => this.fallbackStorage.createSandwichCollection(collection)
    );
  }

  async updateSandwichCollection(id: number, updates: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateSandwichCollection(id, updates),
      () => this.fallbackStorage.updateSandwichCollection(id, updates)
    );
  }

  async deleteSandwichCollection(id: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.deleteSandwichCollection(id),
      () => this.fallbackStorage.deleteSandwichCollection(id)
    );
  }

  // Meeting Minutes methods
  async getAllMeetingMinutes() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllMeetingMinutes(),
      () => this.fallbackStorage.getAllMeetingMinutes()
    );
  }

  async getRecentMeetingMinutes(limit: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.getRecentMeetingMinutes(limit),
      () => this.fallbackStorage.getRecentMeetingMinutes(limit)
    );
  }

  async createMeetingMinutes(minutes: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createMeetingMinutes(minutes),
      () => this.fallbackStorage.createMeetingMinutes(minutes)
    );
  }

  // Drive Links methods
  async getAllDriveLinks() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllDriveLinks(),
      () => this.fallbackStorage.getAllDriveLinks()
    );
  }

  async createDriveLink(link: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createDriveLink(link),
      () => this.fallbackStorage.createDriveLink(link)
    );
  }

  async getAllAgendaItems() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllAgendaItems(),
      () => this.fallbackStorage.getAllAgendaItems()
    );
  }

  async createAgendaItem(item: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createAgendaItem(item),
      () => this.fallbackStorage.createAgendaItem(item)
    );
  }

  async updateAgendaItemStatus(id: number, status: string) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateAgendaItemStatus(id, status),
      () => this.fallbackStorage.updateAgendaItemStatus(id, status)
    );
  }

  async getCurrentMeeting() {
    return this.executeWithFallback(
      () => this.primaryStorage.getCurrentMeeting(),
      () => this.fallbackStorage.getCurrentMeeting()
    );
  }

  async createMeeting(meeting: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createMeeting(meeting),
      () => this.fallbackStorage.createMeeting(meeting)
    );
  }

  async updateMeetingAgenda(id: number, agenda: string) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateMeetingAgenda(id, agenda),
      () => this.fallbackStorage.updateMeetingAgenda(id, agenda)
    );
  }
}

export const storage = new StorageWrapper();