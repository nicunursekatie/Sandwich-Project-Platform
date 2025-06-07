import type { IStorage } from './storage';
import { MemStorage } from './storage';
import { GoogleSheetsStorage } from './google-sheets';

class StorageWrapper implements IStorage {
  private primaryStorage: IStorage;
  private fallbackStorage: IStorage;
  private useGoogleSheets: boolean = false;
  private deletedIds: Set<number> = new Set(); // Track deleted items to prevent re-sync

  constructor() {
    this.fallbackStorage = new MemStorage();
    
    if (this.hasGoogleSheetsCredentials()) {
      try {
        this.primaryStorage = new GoogleSheetsStorage();
        this.useGoogleSheets = true;
        console.log('Google Sheets storage initialized');
        // Initialize synchronization in the background
        this.syncDataFromGoogleSheets();
      } catch (error) {
        console.warn('Google Sheets initialization failed, using memory storage:', error);
        this.primaryStorage = this.fallbackStorage;
      }
    } else {
      console.log('Google Sheets credentials not provided, using memory storage');
      this.primaryStorage = this.fallbackStorage;
    }
  }

  private async syncDataFromGoogleSheets() {
    if (!this.useGoogleSheets) return;
    
    try {
      // Sync sandwich collections to memory storage
      const collections = await this.primaryStorage.getAllSandwichCollections();
      let syncedCount = 0;
      
      for (const collection of collections) {
        // Skip items that have been deleted
        if (this.deletedIds.has(collection.id)) {
          continue;
        }
        
        try {
          await this.fallbackStorage.createSandwichCollection(collection);
          syncedCount++;
        } catch (error) {
          // Ignore duplicates or other sync errors
        }
      }
      console.log(`Synchronized ${syncedCount} sandwich collections to memory storage`);
    } catch (error) {
      console.warn('Failed to sync data from Google Sheets:', error);
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
      const result = await operation();
      // For delete operations that return false, use fallback
      if (typeof result === 'boolean' && result === false) {
        console.log('Google Sheets operation returned false, using fallback storage');
        return fallbackOperation();
      }
      // For update operations that return undefined, use fallback
      if (result === undefined) {
        console.log('Google Sheets operation returned undefined, using fallback storage');
        return fallbackOperation();
      }
      return result;
    } catch (error) {
      // Check if it's a rate limit error
      if (error.status === 429) {
        console.warn('Google Sheets rate limit exceeded, temporarily using memory storage');
        // Temporarily disable Google Sheets to avoid further rate limit errors
        this.useGoogleSheets = false;
        setTimeout(() => {
          this.useGoogleSheets = true;
          console.log('Re-enabling Google Sheets after rate limit cooldown');
        }, 60000); // Re-enable after 1 minute
      } else {
        console.warn('Google Sheets operation failed, using fallback:', error);
      }
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

  async getMessagesByCommittee(committee: string) {
    return this.executeWithFallback(
      () => this.primaryStorage.getMessagesByCommittee(committee),
      () => this.fallbackStorage.getMessagesByCommittee(committee)
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

  async deleteMessage(id: number) {
    return this.executeWithFallback(
      () => this.primaryStorage.deleteMessage(id),
      () => this.fallbackStorage.deleteMessage(id)
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
    const collections = await this.executeWithFallback(
      () => this.primaryStorage.getAllSandwichCollections(),
      () => this.fallbackStorage.getAllSandwichCollections()
    );
    
    // Filter out deleted items
    return collections.filter(collection => !this.deletedIds.has(collection.id));
  }

  async createSandwichCollection(collection: any) {
    return this.executeWithFallback(
      async () => {
        const result = await this.primaryStorage.createSandwichCollection(collection);
        // Also create in fallback storage to keep them synchronized
        try {
          await this.fallbackStorage.createSandwichCollection({...collection, id: result.id});
        } catch (error) {
          console.warn('Failed to sync collection to fallback storage:', error);
        }
        return result;
      },
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
    // Track the deleted ID to prevent re-sync
    this.deletedIds.add(id);
    
    const result = await this.executeWithFallback(
      () => this.primaryStorage.deleteSandwichCollection(id),
      () => this.fallbackStorage.deleteSandwichCollection(id)
    );
    
    // If deletion fails, remove from tracking
    if (!result) {
      this.deletedIds.delete(id);
    }
    
    return result;
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

  async updateAgendaItem(id: number, updates: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.updateAgendaItem(id, updates),
      () => this.fallbackStorage.updateAgendaItem(id, updates)
    );
  }

  async getCurrentMeeting() {
    return this.executeWithFallback(
      () => this.primaryStorage.getCurrentMeeting(),
      () => this.fallbackStorage.getCurrentMeeting()
    );
  }

  async getAllMeetings() {
    return this.executeWithFallback(
      () => this.primaryStorage.getAllMeetings(),
      () => this.fallbackStorage.getAllMeetings()
    );
  }

  async getMeetingsByType(type: string) {
    return this.executeWithFallback(
      () => this.primaryStorage.getMeetingsByType(type),
      () => this.fallbackStorage.getMeetingsByType(type)
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

  async createDriverAgreement(agreement: any) {
    return this.executeWithFallback(
      () => this.primaryStorage.createDriverAgreement(agreement),
      () => this.fallbackStorage.createDriverAgreement(agreement)
    );
  }
}

export const storage = new StorageWrapper();