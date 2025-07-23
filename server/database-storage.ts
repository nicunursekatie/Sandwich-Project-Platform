import { 
  users, projects, archivedProjects, projectTasks, projectComments, projectAssignments, taskCompletions, messages, conversations, conversationParticipants, weeklyReports, meetingMinutes, driveLinks, sandwichCollections, agendaItems, meetings, driverAgreements, drivers, hosts, hostContacts, recipients, contacts, committees, committeeMemberships, notifications, suggestions, suggestionResponses, chatMessages,
  type User, type InsertUser, type UpsertUser,
  type Project, type InsertProject,
  type ProjectTask, type InsertProjectTask,
  type ProjectComment, type InsertProjectComment,
  type ProjectAssignment, type InsertProjectAssignment,
  type TaskCompletion, type InsertTaskCompletion,
  type Message, type InsertMessage,
  type WeeklyReport, type InsertWeeklyReport,
  type SandwichCollection, type InsertSandwichCollection,
  type MeetingMinutes, type InsertMeetingMinutes,
  type DriveLink, type InsertDriveLink,
  type AgendaItem, type InsertAgendaItem,
  type Meeting, type InsertMeeting,
  type DriverAgreement, type InsertDriverAgreement,
  type Driver, type InsertDriver,
  type Host, type InsertHost,
  type HostContact, type InsertHostContact,
  type Recipient, type InsertRecipient,
  type Contact, type InsertContact,
  type Committee, type InsertCommittee,
  type CommitteeMembership, type InsertCommitteeMembership,
  type Notification, type InsertNotification,
  type Suggestion, type InsertSuggestion,
  type SuggestionResponse, type InsertSuggestionResponse
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or, isNull, ne, isNotNull, gt, gte, lte, inArray, like } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Users (required for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Legacy user methods (for backwards compatibility)
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
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
    // Get the current project to check its current state
    const currentProject = await this.getProject(id);
    if (!currentProject) return undefined;

    // Auto-update status based on assignee changes
    const updateData = { ...updates, updatedAt: new Date() };

    // If assigneeName is being set and project is currently available, change to in_progress
    if (updateData.assigneeName && updateData.assigneeName.trim() && currentProject.status === "available") {
      updateData.status = "in_progress";
    }
    // If assigneeName is being removed and project is currently in_progress, change to available
    else if (updateData.assigneeName === "" && currentProject.status === "in_progress") {
      updateData.status = "available";
    }

    const [project] = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Archive functionality for completed projects
  async archiveProject(id: number): Promise<boolean> {
    const project = await this.getProject(id);
    if (!project) return false;

    // Create archived version
    const archiveData = {
      originalProjectId: project.id,
      title: project.title,
      description: project.description,
      priority: project.priority,
      category: project.category,
      assigneeId: project.assigneeId,
      assigneeName: project.assigneeName,
      assigneeIds: project.assigneeIds,
      assigneeNames: project.assigneeNames,
      dueDate: project.dueDate,
      startDate: project.startDate,
      completionDate: project.completionDate || new Date().toISOString(),
      progressPercentage: 100,
      notes: project.notes,
      requirements: project.requirements,
      deliverables: project.deliverables,
      resources: project.resources,
      blockers: project.blockers,
      tags: project.tags,
      estimatedHours: project.estimatedHours,
      actualHours: project.actualHours,
      budget: project.budget,
      createdBy: project.createdBy,
      createdByName: project.createdByName,
      originalCreatedAt: project.createdAt,
      originalUpdatedAt: project.updatedAt,
    };

    // Insert into archived table
    await db.insert(archivedProjects).values(archiveData);
    
    // Delete from active projects
    await this.deleteProject(id);
    
    return true;
  }

  async getArchivedProjects(): Promise<any[]> {
    return await db.select().from(archivedProjects).orderBy(desc(archivedProjects.createdAt));
  }

  async getArchivedProject(id: number): Promise<any | undefined> {
    const [project] = await db.select().from(archivedProjects).where(eq(archivedProjects.id, id));
    return project || undefined;
  }

  // Project Tasks
  async getProjectTasks(projectId: number): Promise<ProjectTask[]> {
    return await db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId)).orderBy(projectTasks.order);
  }

  async getProjectTask(taskId: number): Promise<ProjectTask | undefined> {
    const [task] = await db.select().from(projectTasks).where(eq(projectTasks.id, taskId));
    return task || undefined;
  }

  async createProjectTask(insertTask: InsertProjectTask): Promise<ProjectTask> {
    const [task] = await db.insert(projectTasks).values(insertTask).returning();
    return task;
  }

  async updateProjectTask(id: number, updates: Partial<ProjectTask>): Promise<ProjectTask | undefined> {
    // Log for debugging
    console.log(`Updating task ${id} with updates:`, updates);

    // Handle timestamp fields properly and filter out fields that shouldn't be updated
    const processedUpdates = { ...updates };

    // Remove fields that shouldn't be updated directly
    delete processedUpdates.id;
    delete processedUpdates.projectId;
    delete processedUpdates.createdAt;

    if (processedUpdates.completedAt && typeof processedUpdates.completedAt === 'string') {
      processedUpdates.completedAt = new Date(processedUpdates.completedAt);
    }
    if (processedUpdates.dueDate && typeof processedUpdates.dueDate === 'string') {
      processedUpdates.dueDate = new Date(processedUpdates.dueDate);
    }

    // Always update the updatedAt timestamp
    processedUpdates.updatedAt = new Date();

    console.log(`Processed updates for task ${id}:`, processedUpdates);

    try {
      const [task] = await db.update(projectTasks).set(processedUpdates).where(eq(projectTasks.id, id)).returning();
      console.log(`Task ${id} updated successfully:`, task);
      return task || undefined;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async deleteProjectTask(id: number): Promise<boolean> {
    const result = await db.delete(projectTasks).where(eq(projectTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getProjectCongratulations(projectId: number): Promise<any[]> {
    const result = await db.select().from(notifications)
      .where(
        and(
          eq(notifications.relatedType, 'project'),
          eq(notifications.relatedId, projectId),
          eq(notifications.type, 'congratulations')
        )
      )
      .orderBy(desc(notifications.createdAt));
    return result;
  }

  async getTaskById(id: number): Promise<ProjectTask | undefined> {
    const result = await db.select().from(projectTasks)
      .where(eq(projectTasks.id, id))
      .limit(1);
    return result[0];
  }

  async updateTaskStatus(id: number, status: string): Promise<boolean> {
    const result = await db.update(projectTasks)
      .set({ status: status })
      .where(eq(projectTasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Task completion methods
  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    const [result] = await db.insert(taskCompletions).values(completion).returning();
    return result;
  }

  async getTaskCompletions(taskId: number): Promise<TaskCompletion[]> {
    return await db.select().from(taskCompletions)
      .where(eq(taskCompletions.taskId, taskId))
      .orderBy(taskCompletions.completedAt);
  }

  async removeTaskCompletion(taskId: number, userId: string): Promise<boolean> {
    const result = await db.delete(taskCompletions)
      .where(and(
        eq(taskCompletions.taskId, taskId),
        eq(taskCompletions.userId, userId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  // Project Comments
  async getProjectComments(projectId: number): Promise<ProjectComment[]> {
    return await db.select().from(projectComments).where(eq(projectComments.projectId, projectId)).orderBy(desc(projectComments.createdAt));
  }

  async createProjectComment(insertComment: InsertProjectComment): Promise<ProjectComment> {
    const [comment] = await db.insert(projectComments).values(insertComment).returning();
    return comment;
  }

  async deleteProjectComment(id: number): Promise<boolean> {
    const result = await db.delete(projectComments).where(eq(projectComments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Messages
  async getAllMessages(): Promise<Message[]> {
    try {
      const result = await db
        .select({
          id: messages.id,
          content: messages.content,
          sender: messages.sender,
          timestamp: messages.createdAt,
          userId: messages.userId,
          conversationId: messages.conversationId
        })
        .from(messages)
        .orderBy(messages.createdAt);

      return result;
    } catch (error) {
      // If sender column doesn't exist, query without it and add default sender
      console.log('Sender column not found, using fallback query');
      const result = await db
        .select({
          id: messages.id,
          content: messages.content,
          timestamp: messages.createdAt,
          userId: messages.userId,
          conversationId: messages.conversationId
        })
        .from(messages)
        .orderBy(messages.createdAt);

      // Add default sender for compatibility
      return result.map(msg => ({
        ...msg,
        sender: 'Unknown User'
      }));
    }
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.id).limit(limit);
  }

  // REMOVED: getMessagesByCommittee - no longer needed with new conversation system

  // UPDATED: Get messages by conversationId (preferred method)
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    const results = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        userId: messages.userId,
        senderId: messages.senderId,
        content: messages.content,
        sender: sql<string>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), ${users.firstName}, ${users.email}, ${messages.sender}, 'Member')`,
        contextType: messages.contextType,
        contextId: messages.contextId,
        editedAt: messages.editedAt,
        editedContent: messages.editedContent,
        deletedAt: messages.deletedAt,
        deletedBy: messages.deletedBy,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
      })
      .from(messages)
      .leftJoin(users, eq(users.id, messages.senderId))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    
    return results.map(row => ({
      ...row,
      sender: row.sender || 'Member'
    }));
  }

  // Get participants for a conversation
  async getConversationParticipants(conversationId: number): Promise<Array<{
    userId: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
  }>> {
    // Note: conversationParticipants table doesn't have role column, so we'll default to 'member'
    const results = await db
      .select({
        userId: conversationParticipants.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(conversationParticipants)
      .leftJoin(users, eq(users.id, conversationParticipants.userId))
      .where(eq(conversationParticipants.conversationId, conversationId));
    
    console.log(`[DB] Found ${results.length} participants for conversation ${conversationId}`);
    return results.map(row => ({
      userId: row.userId,
      role: 'member', // Default role since table doesn't have role column
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
    }));
  }

  // ALIAS: getMessagesByThreadId for backwards compatibility
  async getMessagesByThreadId(threadId: number): Promise<Message[]> {
    return await this.getMessagesByConversationId(threadId);
  }

  // ALIAS: getMessages for backwards compatibility
  async getMessages(messageContext: string, limit?: number): Promise<Message[]> {
    if (limit) {
      return await this.getRecentMessages(limit);
    } else {
      // For backwards compatibility, return all messages since committee filtering is removed
      return await this.getAllMessages();
    }
  }

  // NEW: Get or create conversation for specific conversation types
  async getOrCreateThreadId(type: string, referenceId?: string): Promise<number> {
    try {
      // For the new simple system, we'll use conversation IDs as thread IDs
      // Check if conversation already exists
      const [existing] = await db.select()
        .from(conversations)
        .where(and(
          eq(conversations.type, type),
          referenceId ? eq(conversations.name, referenceId) : isNull(conversations.name)
        ));

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const [newConversation] = await db.insert(conversations).values({
        type,
        name: referenceId || this.generateThreadTitle(type, referenceId),
      }).returning();

      return newConversation.id;
    } catch (error) {
      console.error("Error getting/creating conversation:", error);
      throw error;
    }
  }

  private generateThreadTitle(type: string, referenceId?: string): string {
    switch (type) {
      case 'general': return 'General Chat';
      case 'committee': return `Committee Chat - ${referenceId}`;
      case 'host': return 'Host Chat';
      case 'driver': return 'Driver Chat';
      case 'recipient': return 'Recipient Chat';
      case 'core_team': return 'Core Team';
      case 'direct': return `Direct Messages - ${referenceId}`;
      case 'group': return `Group Chat - ${referenceId}`;
      default: return `${type} Chat`;
    }
  }

  // FIXED: Direct messages must use conversationId for proper isolation
  async getDirectMessages(userId1: string, userId2: string): Promise<Message[]> {
    // Create consistent reference ID for direct message conversation
    const userIds = [userId1, userId2].sort();
    const referenceId = userIds.join('_');
    const conversationId = await this.getOrCreateThreadId('direct', referenceId);

    console.log(`🔍 QUERY: getDirectMessages - conversationId: ${conversationId}, users: ${userId1} <-> ${userId2}, referenceId: ${referenceId}`);

    const messageResults = await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    console.log(`🔍 RESULT: Found ${messageResults.length} direct messages for conversationId ${conversationId}`);
    return messageResults;
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    console.log(`[DEBUG] getMessageById called with id: ${id}`);
    try {
      const [message] = await db.select().from(messages).where(eq(messages.id, id));
      console.log(`[DEBUG] getMessageById result:`, message);
      return message || undefined;
    } catch (error) {
      console.error(`[ERROR] getMessageById failed for id ${id}:`, error);
      return undefined;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    console.log(`[DB] Marking message ${messageId} as read for user ${userId}`);
    try {
      // Update the message read status
      await db
        .update(messages)
        .set({ read: true })
        .where(eq(messages.id, parseInt(messageId)));
      console.log(`[DB] Message ${messageId} marked as read for user ${userId}`);
    } catch (error) {
      console.error(`[ERROR] Failed to mark message ${messageId} as read for user ${userId}:`, error);
      throw error;
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    // Ensure conversationId is set for proper conversation isolation
    if (!insertMessage.conversationId) {
      // Auto-assign conversationId based on message type
      let conversationType = 'channel';
      let conversationName = 'general'; // Default to general chat

      // For now, create a general conversation if none exists
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(
          and(
            eq(conversations.type, 'channel'),
            eq(conversations.name, 'general')
          )
        )
        .limit(1);

      if (conversation) {
        insertMessage.conversationId = conversation.id;
        console.log(`✅ SEND: Using existing conversationId ${conversation.id} for general message from ${insertMessage.userId}`);
      } else {
        // Create new general conversation
        const [newConversation] = await db
          .insert(conversations)
          .values({
            type: 'channel',
            name: 'general'
          })
          .returning();
        
        insertMessage.conversationId = newConversation.id;
        console.log(`✅ SEND: Created new conversationId ${newConversation.id} for general message from ${insertMessage.userId}`);
      }
    } else {
      console.log(`🔄 SEND: Using existing conversationId ${insertMessage.conversationId} for message from ${insertMessage.userId}`);
    }

    const [message] = await db.insert(messages).values(insertMessage).returning();
    console.log(`📤 MESSAGE SENT: id=${message.id}, conversationId=${message.conversationId}, sender=${message.userId}`);
    return message;
  }

  async getThreadMessages(threadId: number): Promise<Message[]> {
    console.log(`🔍 QUERY: getThreadMessages - threadId: ${threadId}`);
    const messageResults = await db.select().from(messages).where(eq(messages.conversationId, threadId)).orderBy(messages.createdAt);
    console.log(`🔍 RESULT: Found ${messageResults.length} messages for threadId ${threadId}`);
    return messageResults;
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
    console.log(`[DEBUG] deleteMessage called with id: ${id}`);
    try {
      const result = await db.delete(messages).where(eq(messages.id, id));
      console.log(`[DEBUG] deleteMessage result:`, result);
      const success = (result.rowCount ?? 0) > 0;
      console.log(`[DEBUG] deleteMessage success: ${success}`);
      return success;
    } catch (error) {
      console.error(`[ERROR] deleteMessage failed for id ${id}:`, error);
      return false;
    }
  }

  async getMessagesBySender(senderId: string): Promise<Message[]> {
    console.log(`[DEBUG] getMessagesBySender called with senderId: ${senderId}`);
    try {
      const result = await db.select()
        .from(messages)
        .where(eq(messages.senderId, senderId))
        .orderBy(desc(messages.createdAt));
      console.log(`[DEBUG] Found ${result.length} messages sent by ${senderId}`);
      return result;
    } catch (error) {
      console.error(`[ERROR] getMessagesBySender failed for senderId ${senderId}:`, error);
      return [];
    }
  }

  async getMessagesForRecipient(recipientId: string): Promise<Message[]> {
    console.log(`[DEBUG] getMessagesForRecipient called with recipientId: ${recipientId}`);
    try {
      const result = await db.select()
        .from(messages)
        .where(eq(messages.contextId, recipientId))
        .orderBy(desc(messages.createdAt));
      console.log(`[DEBUG] Found ${result.length} messages for recipient ${recipientId}`);
      return result;
    } catch (error) {
      console.error(`[ERROR] getMessagesForRecipient failed for recipientId ${recipientId}:`, error);
      return [];
    }
  }

  // Conversation management methods
  async getDirectConversation(userId1: string, userId2: string): Promise<any | undefined> {
    try {
      // Find direct conversations where both users are participants
      const directConversations = await db
        .select({ conversation: conversations })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(
          and(
            eq(conversations.type, 'direct'),
            eq(conversationParticipants.userId, userId1)
          )
        );

      // Check if any of these conversations also include userId2
      for (const conv of directConversations) {
        const participant2 = await db
          .select()
          .from(conversationParticipants)
          .where(
            and(
              eq(conversationParticipants.conversationId, conv.conversation.id),
              eq(conversationParticipants.userId, userId2)
            )
          )
          .limit(1);

        if (participant2.length > 0) {
          return conv.conversation;
        }
      }

      return undefined;
    } catch (error) {
      console.error('Error finding direct conversation:', error);
      return undefined;
    }
  }

  async createConversation(conversationData: any): Promise<any> {
    const [conversation] = await db
      .insert(conversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async addConversationParticipant(participantData: any): Promise<any> {
    const [participant] = await db
      .insert(conversationParticipants)
      .values(participantData)
      .returning();
    return participant;
  }

  // REMOVED: Old group messaging methods - replaced with simple conversation system
  // These methods referenced non-existent tables (messageGroups, groupMessageParticipants)
  // The new system uses conversations, conversationParticipants, and messages tables

  // Weekly Reports
  async getAllWeeklyReports(): Promise<WeeklyReport[]> {
    return await db.select().from(weeklyReports).orderBy(weeklyReports.id);
  }

  async createWeeklyReport(insertReport: InsertWeeklyReport): Promise<WeeklyReport> {
    const [report] = await db.insert(weeklyReports).values(insertReport).returning();
    return report;
  }

  // Sandwich Collections
  async getAllSandwichCollections(): Promise<SandwichCollection[]> {
    return await db.select().from(sandwichCollections).orderBy(desc(sandwichCollections.collectionDate));
  }

  async getSandwichCollections(limit: number, offset: number): Promise<SandwichCollection[]> {
    return await db.select()
      .from(sandwichCollections)
      .orderBy(desc(sandwichCollections.collectionDate))
      .limit(limit)
      .offset(offset);
  }

  async getSandwichCollectionsCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(sandwichCollections);
    return Number(result[0].count);
  }

  async getCollectionStats(): Promise<{ totalEntries: number; totalSandwiches: number; }> {
    const result = await db.select({ 
      totalEntries: sql<number>`count(*)::int`,
      totalSandwiches: sql<number>`coalesce(sum(individual_sandwiches), 0)::int + coalesce(sum(group_sandwiches), 0)::int`
    }).from(sandwichCollections);

    return {
      totalEntries: Number(result[0].totalEntries),
      totalSandwiches: Number(result[0].totalSandwiches)
    };
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
    return (result.rowCount ?? 0) > 0;
  }

  // Meeting Minutes
  async getAllMeetingMinutes(): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(meetingMinutes.id);
  }

  async getRecentMeetingMinutes(limit: number): Promise<MeetingMinutes[]> {
    return await db.select().from(meetingMinutes).orderBy(meetingMinutes.id).limit(limit);
  }

  async createMeetingMinutes(insertMinutes: InsertMeetingMinutes): Promise<MeetingMinutes> {
    const [minutes] = await db.insert(meetingMinutes).values(insertMinutes).returning();
    return minutes;
  }

  async deleteMeetingMinutes(id: number): Promise<boolean> {
    const result = await db.delete(meetingMinutes).where(eq(meetingMinutes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Drive Links
  async getAllDriveLinks(): Promise<DriveLink[]> {
    return await db.select().from(driveLinks).orderBy(driveLinks.id);
  }

  async createDriveLink(insertLink: InsertDriveLink): Promise<DriveLink> {
    const [link] = await db.insert(driveLinks).values(insertLink).returning();
    return link;
  }

  // Agenda Items
  async getAllAgendaItems(): Promise<AgendaItem[]> {
    return await db.select().from(agendaItems).orderBy(agendaItems.id);
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

  async deleteAgendaItem(id: number): Promise<boolean> {
    const result = await db.delete(agendaItems).where(eq(agendaItems.id, id));
    return (result.rowCount ?? 0) > 0;
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

  async updateMeeting(id: number, updates: Partial<Meeting>): Promise<Meeting | undefined> {
    const [meeting] = await db.update(meetings).set(updates).where(eq(meetings.id, id)).returning();
    return meeting || undefined;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    const result = await db.delete(meetings).where(eq(meetings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Driver Agreements
  async createDriverAgreement(insertAgreement: InsertDriverAgreement): Promise<DriverAgreement> {
    const [agreement] = await db.insert(driverAgreements).values(insertAgreement).returning();
    return agreement;
  }

  // Drivers
  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).orderBy(drivers.name);
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver || undefined;
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriver(id: number, updates: Partial<Driver>): Promise<Driver | undefined> {
    const [driver] = await db.update(drivers).set(updates).where(eq(drivers.id, id)).returning();
    return driver || undefined;
  }

  async deleteDriver(id: number): Promise<boolean> {
    const result = await db.delete(drivers).where(eq(drivers.id, id));
    return (result.rowCount ?? 0) > 0;
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
    const [host] = await db.update(hosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hosts.id, id))
      .returning();
    return host || undefined;
  }

  async deleteHost(id: number): Promise<boolean> {
    // First check if this host has any associated sandwich collections
    const host = await db.select().from(hosts).where(eq(hosts.id, id)).limit(1);
    if (host.length === 0) {
      return false; // Host doesn't exist
    }

    const hostName = host[0].name;
    const [collectionCount] = await db
      .select({ count: sql`count(*)` })
      .from(sandwichCollections)
      .where(eq(sandwichCollections.hostName, hostName));

    if (Number(collectionCount.count) > 0) {
      throw new Error(`Cannot delete host "${hostName}" because it has ${collectionCount.count} associated collection records. Please update or remove these records first.`);
    }

    // Also delete any host contacts first
    await db.delete(hostContacts).where(eq(hostContacts.hostId, id));

    // Now delete the host
    const result = await db.delete(hosts).where(eq(hosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateCollectionHostNames(oldHostName: string, newHostName: string): Promise<number> {
    const result = await db
      .update(sandwichCollections)
      .set({ hostName: newHostName })
      .where(eq(sandwichCollections.hostName, oldHostName));
    return result.rowCount ?? 0;
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
    return (result.rowCount ?? 0) > 0;
  }

  // General Contacts
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(contacts.name);
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact || undefined;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts).set(updates).where(eq(contacts.id, id)).returning();
    return contact || undefined;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Host Contact methods
  async createHostContact(insertContact: InsertHostContact): Promise<HostContact> {
    const [contact] = await db.insert(hostContacts).values(insertContact).returning();
    return contact;
  }

  async getHostContacts(hostId: number): Promise<HostContact[]> {
    return await db.select().from(hostContacts).where(eq(hostContacts.hostId, hostId));
  }

  async updateHostContact(id: number, updates: Partial<HostContact>): Promise<HostContact | undefined> {
    const [contact] = await db.update(hostContacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hostContacts.id, id))
      .returning();
    return contact;
  }

  async deleteHostContact(id: number): Promise<boolean> {
    const result = await db.delete(hostContacts).where(eq(hostContacts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Optimized query to get all hosts with their contacts in one call
  async getAllHostsWithContacts(): Promise<Array<Host & { contacts: HostContact[] }>> {
    const hostsData = await db.select().from(hosts).orderBy(hosts.name);
    const contactsData = await db.select().from(hostContacts);

    return hostsData.map(host => ({
      ...host,
      contacts: contactsData.filter(contact => contact.hostId === host.id)
    }));
  }

  // Project Assignments
  async getProjectAssignments(projectId: number): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.projectId, projectId));
  }

  async createProjectAssignment(assignment: InsertProjectAssignment): Promise<ProjectAssignment> {
    const [created] = await db.insert(projectAssignments).values(assignment).returning();
    return created;
  }

  async deleteProjectAssignment(projectId: number, userId: string): Promise<boolean> {
    const result = await db.delete(projectAssignments)
      .where(and(
        eq(projectAssignments.projectId, projectId),
        eq(projectAssignments.userId, userId)
      ));
    return (result.rowCount ?? 0) > 0;
  }

  async getUserProjectAssignments(userId: string): Promise<ProjectAssignment[]> {
    return await db.select().from(projectAssignments).where(eq(projectAssignments.userId, userId));
  }

  // Modified project methods to support user-specific visibility
  async getProjectsForUser(userId: string): Promise<Project[]> {
    // Get projects where user is assigned
    const assignedProjects = await db
      .select()
      .from(projects)
      .innerJoin(projectAssignments, eq(projects.id, projectAssignments.projectId))
      .where(eq(projectAssignments.userId, userId));

    return assignedProjects.map(result => result.projects);
  }

  async getAllProjectsWithAssignments(): Promise<Array<Project & { assignments: ProjectAssignment[] }>> {
    const projectsData = await db.select().from(projects).orderBy(projects.createdAt);
    const assignmentsData = await db.select().from(projectAssignments);

    return projectsData.map(project => ({
      ...project,
      assignments: assignmentsData.filter(assignment => assignment.projectId === project.id)
    }));
  }

  // Committee management
  async getAllCommittees(): Promise<Committee[]> {
    return await db.select().from(committees).orderBy(committees.createdAt);
  }

  async getCommittee(id: number): Promise<Committee | undefined> {
    const [committee] = await db.select().from(committees).where(eq(committees.id, id));
    return committee || undefined;
  }

  async createCommittee(committee: InsertCommittee): Promise<Committee> {
    const [newCommittee] = await db.insert(committees).values(committee).returning();
    return newCommittee;
  }

  async updateCommittee(id: number, updates: Partial<Committee>): Promise<Committee | undefined> {
    const [committee] = await db
      .update(committees)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(committees.id, id))
      .returning();
    return committee || undefined;
  }

  async deleteCommittee(id: number): Promise<boolean> {
    const result = await db.delete(committees).where(eq(committees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Committee membership management
  async getUserCommittees(userId: string): Promise<Array<Committee & { membership: CommitteeMembership }>> {
    const userCommittees = await db
      .select()
      .from(committeeMemberships)
      .innerJoin(committees, eq(committeeMemberships.committeeId, committees.id))
      .where(eq(committeeMemberships.userId, userId));

    return userCommittees.map(result => ({
      ...result.committees,
      membership: result.committee_memberships
    }));
  }

  async getCommitteeMembers(committeeId: number): Promise<Array<User & { membership: CommitteeMembership }>> {
    const members = await db
      .select()
      .from(committeeMemberships)
      .innerJoin(users, eq(committeeMemberships.userId, users.id))
      .where(eq(committeeMemberships.committeeId, committeeId));

    return members.map(result => ({
      ...result.users,
      membership: result.committee_memberships
    }));
  }

  async addUserToCommittee(membership: InsertCommitteeMembership): Promise<CommitteeMembership> {
    const [newMembership] = await db.insert(committeeMemberships).values(membership).returning();
    return newMembership;
  }

  async updateCommitteeMembership(id: number, updates: Partial<CommitteeMembership>): Promise<CommitteeMembership | undefined> {
    const [membership] = await db
      .update(committeeMemberships)
      .set(updates)
      .where(eq(committeeMemberships.id, id))
      .returning();
    return membership || undefined;
  }

  async removeUserFromCommittee(userId: string, committeeId: number): Promise<boolean> {
    const result = await db
      .delete(committeeMemberships)
      .where(and(eq(committeeMemberships.userId, userId), eq(committeeMemberships.committeeId, committeeId)));
    return (result.rowCount ?? 0) > 0;
  }

  async isUserCommitteeMember(userId: string, committeeId: number): Promise<boolean> {
    const [membership] = await db
      .select()
      .from(committeeMemberships)
      .where(and(eq(committeeMemberships.userId, userId), eq(committeeMemberships.committeeId, committeeId)));
    return !!membership;
  }

  // Notifications & Celebrations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      return [];
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const [createdNotification] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return createdNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async markNotificationRead(id: number): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }

  async deleteNotification(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(notifications)
        .where(eq(notifications.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
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

  // Announcements
  async getAllAnnouncements(): Promise<any[]> {
    // For now return empty array - announcements can be implemented later
    return [];
  }

  async createAnnouncement(announcement: any): Promise<any> {
    // Basic announcement creation - can be enhanced later
    return announcement;
  }

  async updateAnnouncement(id: number, updates: any): Promise<any | undefined> {
    // For now return the updates - can be implemented later
    return updates;
  }

  async deleteAnnouncement(id: number): Promise<boolean> {
    // For now return true - can be implemented later
    return true;
  }

  // Consolidated notification methods (removing duplicates)
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  // Project assignments
  async getProjectAssignments(projectId: number): Promise<any[]> {
    try {
      const assignments = await db
        .select({
          id: projectAssignments.id,
          projectId: projectAssignments.projectId,
          userId: projectAssignments.userId,
          role: projectAssignments.role,
          assignedAt: projectAssignments.assignedAt,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role
          }
        })
        .from(projectAssignments)
        .leftJoin(users, eq(projectAssignments.userId, users.id))
        .where(eq(projectAssignments.projectId, projectId))
        .orderBy(projectAssignments.assignedAt);
      
      return assignments;
    } catch (error) {
      console.error('Error fetching project assignments:', error);
      return [];
    }
  }

  async addProjectAssignment(assignment: { projectId: number; userId: string; role: string }): Promise<any> {
    try {
      const [newAssignment] = await db
        .insert(projectAssignments)
        .values({
          projectId: assignment.projectId,
          userId: assignment.userId,
          role: assignment.role,
          assignedAt: new Date()
        })
        .returning();
      
      return newAssignment;
    } catch (error) {
      console.error('Error adding project assignment:', error);
      return null;
    }
  }

  async removeProjectAssignment(projectId: number, userId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(projectAssignments)
        .where(and(
          eq(projectAssignments.projectId, projectId),
          eq(projectAssignments.userId, userId)
        ));
      
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error removing project assignment:', error);
      return false;
    }
  }

  async updateProjectAssignment(projectId: number, userId: string, updates: { role: string }): Promise<any> {
    try {
      const [updatedAssignment] = await db
        .update(projectAssignments)
        .set({ role: updates.role })
        .where(and(
          eq(projectAssignments.projectId, projectId),
          eq(projectAssignments.userId, userId)
        ))
        .returning();
      
      return updatedAssignment;
    } catch (error) {
      console.error('Error updating project assignment:', error);
      return null;
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing database storage...');

      // Test database connection
      await this.testConnection();

      // Check and add missing sender column if needed
      try {
        await db.execute(sql`SELECT sender FROM messages LIMIT 1`);
        console.log('Sender column exists');
      } catch (error) {
        console.log('Adding missing sender column to messages table...');
        try {
          await db.execute(sql`ALTER TABLE messages ADD COLUMN sender TEXT DEFAULT 'Unknown User'`);
          console.log('Sender column added successfully');
        } catch (alterError) {
          console.log('Could not add sender column, will use fallback queries');
        }
      }

      console.log('Database storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database storage:', error);
      throw error;
    }
  }

  // Suggestions Portal methods
  async getAllSuggestions(): Promise<Suggestion[]> {
    try {
      const result = await db.select().from(suggestions).orderBy(suggestions.createdAt);
      return result as Suggestion[];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  async getSuggestion(id: number): Promise<Suggestion | undefined> {
    try {
      const result = await db.select().from(suggestions).where(eq(suggestions.id, id)).limit(1);
      return result[0] as Suggestion | undefined;
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      return undefined;
    }
  }

  async createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion> {
    try {
      const result = await db.insert(suggestions).values(suggestion).returning();
      return result[0] as Suggestion;
    } catch (error) {
      console.error('Error creating suggestion:', error);
      throw error;
    }
  }

  async updateSuggestion(id: number, updates: Partial<Suggestion>): Promise<Suggestion | undefined> {
    try {
      const result = await db.update(suggestions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(suggestions.id, id))
        .returning();
      return result[0] as Suggestion | undefined;
    } catch (error) {
      console.error('Error updating suggestion:', error);
      return undefined;
    }
  }

  async deleteSuggestion(id: number): Promise<boolean> {
    try {
      // First delete all responses
      await db.delete(suggestionResponses).where(eq(suggestionResponses.suggestionId, id));
      // Then delete the suggestion
      const result = await db.delete(suggestions).where(eq(suggestions.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      return false;
    }
  }

  async upvoteSuggestion(id: number): Promise<boolean> {
    try {
      await db.update(suggestions)
        .set({ upvotes: sql`${suggestions.upvotes} + 1` })
        .where(eq(suggestions.id, id));
      return true;
    } catch (error) {
      console.error('Error upvoting suggestion:', error);
      return false;
    }
  }

  // Suggestion responses
  async getSuggestionResponses(suggestionId: number): Promise<SuggestionResponse[]> {
    try {
      const result = await db.select().from(suggestionResponses)
        .where(eq(suggestionResponses.suggestionId, suggestionId))
        .orderBy(suggestionResponses.createdAt);
      return result as SuggestionResponse[];
    } catch (error) {
      console.error('Error fetching suggestion responses:', error);
      return [];
    }
  }

  async createSuggestionResponse(response: InsertSuggestionResponse): Promise<SuggestionResponse> {
    try {
      const result = await db.insert(suggestionResponses).values(response).returning();
      return result[0] as SuggestionResponse;
    } catch (error) {
      console.error('Error creating suggestion response:', error);
      throw error;
    }
  }

  async deleteSuggestionResponse(id: number): Promise<boolean> {
    try {
      await db.delete(suggestionResponses).where(eq(suggestionResponses.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting suggestion response:', error);
      return false;
    }
  }

  // Messaging System methods
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      console.log(`[DB] Getting conversations for user: ${userId}`);
      
      // Get all conversations where the user is a participant
      const userConversations = await db
        .select({
          id: conversations.id,
          type: conversations.type,
          name: conversations.name,
          createdAt: conversations.createdAt,
          lastReadAt: conversationParticipants.lastReadAt,
          joinedAt: conversationParticipants.joinedAt,
        })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(eq(conversationParticipants.userId, userId))
        .orderBy(conversations.createdAt);

      console.log(`[DB] Found ${userConversations.length} conversations for user ${userId}`);

      // For each conversation, get additional metadata
      const enrichedConversations = await Promise.all(
        userConversations.map(async (conv) => {
          // Get member count
          const memberCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(conversationParticipants)
            .where(eq(conversationParticipants.conversationId, conv.id));

          // Get last message
          const lastMessage = await db
            .select({
              id: messages.id,
              content: messages.content,
              createdAt: messages.createdAt,
              sender: messages.sender,
              userId: messages.userId,
            })
            .from(messages)
            .where(eq(messages.conversationId, conv.id))
            .orderBy(messages.createdAt)
            .limit(1);

          return {
            ...conv,
            memberCount: memberCount[0]?.count || 0,
            lastMessage: lastMessage[0] || null,
          };
        })
      );

      return enrichedConversations;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  async createConversation(conversationData: {
    type: string;
    name?: string;
    createdBy: string;
  }, participants: string[]): Promise<any> {
    try {
      console.log(`[DB] Creating conversation:`, conversationData);
      
      // Create the conversation
      const [newConversation] = await db
        .insert(conversations)
        .values({
          type: conversationData.type,
          name: conversationData.name,
        })
        .returning();

      console.log(`[DB] Created conversation with ID: ${newConversation.id}`);

      // Add participants
      const participantData = participants.map(userId => ({
        conversationId: newConversation.id,
        userId: userId,
      }));

      await db.insert(conversationParticipants).values(participantData);

      console.log(`[DB] Added ${participants.length} participants to conversation ${newConversation.id}`);

      return {
        ...newConversation,
        memberCount: participants.length,
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId: number, userId: string): Promise<any[]> {
    try {
      console.log(`[DB] Getting messages for conversation ${conversationId} and user ${userId}`);
      
      // First verify user has access to this conversation
      const hasAccess = await db
        .select()
        .from(conversationParticipants)
        .where(and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        ))
        .limit(1);

      if (hasAccess.length === 0) {
        console.log(`[DB] User ${userId} does not have access to conversation ${conversationId}`);
        return [];
      }

      // Get messages with sender information
      const messages = await db
        .select({
          id: messages.id,
          conversationId: messages.conversationId,
          userId: messages.userId,
          senderId: messages.senderId,
          content: messages.content,
          sender: messages.sender,
          contextType: messages.contextType,
          contextId: messages.contextId,
          createdAt: messages.createdAt,
          updatedAt: messages.updatedAt,
          editedAt: messages.editedAt,
          deletedAt: messages.deletedAt,
        })
        .from(messages)
        .where(and(
          eq(messages.conversationId, conversationId),
          isNull(messages.deletedAt)
        ))
        .orderBy(messages.createdAt);

      console.log(`[DB] Found ${messages.length} messages for conversation ${conversationId}`);
      return messages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  async addConversationMessage(messageData: {
    conversationId: number;
    userId: string;
    content: string;
    sender?: string;
    contextType?: string;
    contextId?: string;
  }): Promise<any> {
    try {
      console.log(`[DB] Adding message to conversation ${messageData.conversationId}`);
      
      const [newMessage] = await db
        .insert(messages)
        .values({
          conversationId: messageData.conversationId,
          userId: messageData.userId,
          senderId: messageData.userId,
          content: messageData.content,
          sender: messageData.sender || 'Unknown User',
          contextType: messageData.contextType || 'direct',
          contextId: messageData.contextId,
        })
        .returning();

      console.log(`[DB] Created message with ID: ${newMessage.id}`);
      return newMessage;
    } catch (error) {
      console.error('Error adding conversation message:', error);
      throw error;
    }
  }

  async updateConversationMessage(messageId: number, userId: string, updates: {
    content?: string;
    editedAt?: Date;
  }): Promise<any> {
    try {
      console.log(`[DB] Updating message ${messageId} by user ${userId}`);
      
      const [updatedMessage] = await db
        .update(messages)
        .set({
          ...updates,
          editedAt: new Date(),
        })
        .where(and(
          eq(messages.id, messageId),
          eq(messages.userId, userId)
        ))
        .returning();

      return updatedMessage;
    } catch (error) {
      console.error('Error updating conversation message:', error);
      throw error;
    }
  }

  async deleteConversationMessage(messageId: number, userId: string): Promise<boolean> {
    try {
      console.log(`[DB] Deleting message ${messageId} by user ${userId}`);
      
      const result = await db
        .update(messages)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
        })
        .where(and(
          eq(messages.id, messageId),
          eq(messages.userId, userId)
        ));

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Error deleting conversation message:', error);
      return false;
    }
  }

  // Chat message methods for Socket.IO
  async createChatMessage(data: { channel: string; userId: string; userName: string; content: string }): Promise<any> {
    try {
      const [message] = await db
        .insert(chatMessages)
        .values({
          channel: data.channel,
          userId: data.userId,
          userName: data.userName,
          content: data.content,
          createdAt: new Date()
        })
        .returning();
      return message;
    } catch (error: any) {
      if (error.code === '23505') {
        // Retry with a small delay to avoid ID collision
        await new Promise(resolve => setTimeout(resolve, 10));
        const [message] = await db
          .insert(chatMessages)
          .values({
            channel: data.channel,
            userId: data.userId,
            userName: data.userName,
            content: data.content,
            createdAt: new Date()
          })
          .returning();
        return message;
      }
      throw error;
    }
  }

  async getChatMessages(channel: string, limit: number = 50): Promise<any[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channel, channel))  // CRITICAL: Filter by channel field in chatMessages table
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async updateChatMessage(id: number, updates: { content: string }): Promise<void> {
    await db
      .update(chatMessages)
      .set({ 
        content: updates.content,
        editedAt: new Date()
      })
      .where(eq(chatMessages.id, id));
  }

  async deleteChatMessage(id: number): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.id, id));
  }

  async markChannelMessagesAsRead(userId: string, channel: string): Promise<void> {
    // Insert read records for all messages in this channel that the user hasn't read yet
    const { chatMessageReads } = await import("@shared/schema");
    await db.execute(sql`
      INSERT INTO chat_message_reads (message_id, user_id, channel, read_at, created_at)
      SELECT cm.id, ${userId}, cm.channel, NOW(), NOW()
      FROM chat_messages cm
      WHERE cm.channel = ${channel}
        AND NOT EXISTS (
          SELECT 1 FROM chat_message_reads cmr 
          WHERE cmr.message_id = cm.id AND cmr.user_id = ${userId}
        )
    `);
  }
}