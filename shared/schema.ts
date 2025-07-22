import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index, decimal, unique, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // For custom auth system
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"), // User-chosen display name for chat/activities
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("volunteer"), // 'admin', 'coordinator', 'volunteer', 'viewer'
  permissions: jsonb("permissions").default('[]'), // Array of specific permissions
  metadata: jsonb("metadata").default('{}'), // Additional user data (phone, address, availability, etc.)
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"), // Track when user last logged in
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logging table for tracking all data changes
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: varchar("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  tableName: varchar("table_name").notNull(),
  recordId: varchar("record_id").notNull(),
  oldData: text("old_data"), // JSON string of old values
  newData: text("new_data"), // JSON string of new values
  userId: varchar("user_id"), // Who made the change
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Chat messages table for real-time chat system
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  channel: varchar("channel").notNull().default("general"), // 'general', 'core-team', 'host', 'driver', 'recipient'
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  content: text("content").notNull(),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat message read status tracking
export const chatMessageReads = pgTable("chat_message_reads", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => chatMessages.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  channel: varchar("channel").notNull(),
  readAt: timestamp("read_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueRead: unique().on(table.messageId, table.userId),
  channelUserIdx: index("idx_chat_reads_channel_user").on(table.channel, table.userId),
}));

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // 'waiting', 'available', 'in_progress', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  category: text("category").notNull().default("general"), // 'general', 'marketing', 'operations', 'grants', 'events'
  assigneeId: integer("assignee_id"),
  assigneeName: text("assignee_name"),
  assigneeIds: jsonb("assignee_ids").default('[]'), // Array of user IDs for multiple assignees
  assigneeNames: text("assignee_names"), // Comma-separated names for multiple assignees
  dueDate: text("due_date"), // ISO date string
  startDate: text("start_date"), // ISO date string
  completionDate: text("completion_date"), // ISO date string
  progressPercentage: integer("progress_percentage").notNull().default(0), // 0-100
  notes: text("notes"), // Additional project notes
  requirements: text("requirements"), // Project requirements and specifications
  deliverables: text("deliverables"), // Expected deliverables/outcomes
  resources: text("resources"), // Resources needed or available
  blockers: text("blockers"), // Current blockers or issues
  tags: text("tags"), // JSON array of tags
  estimatedHours: integer("estimated_hours"), // Estimated work hours
  actualHours: integer("actual_hours"), // Actual hours worked
  budget: varchar("budget"), // Project budget
  color: text("color").notNull().default("blue"), // for status indicator
  createdBy: varchar("created_by"), // User ID who created the project
  createdByName: varchar("created_by_name"), // Display name of creator
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  assigneeId: text("assignee_id"), // Single assignee - kept for backward compatibility
  assigneeName: text("assignee_name"), // Single assignee name - kept for backward compatibility
  assigneeIds: text("assignee_ids").array(), // Multiple assignee IDs as JSON array
  assigneeNames: text("assignee_names").array(), // Multiple assignee names as JSON array
  dueDate: text("due_date"),
  completedAt: timestamp("completed_at"),
  attachments: text("attachments"), // JSON array of file paths
  order: integer("order").notNull().default(0), // for task ordering
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectComments = pgTable("project_comments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  commentType: text("comment_type").notNull().default("general"), // 'general', 'update', 'blocker', 'completion'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  notes: text("notes"),
}, (table) => ({
  uniqueTaskUser: unique().on(table.taskId, table.userId),
}));

// User-project assignments for visibility control
export const projectAssignments = pgTable("project_assignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: text("user_id").notNull(), // References users.id
  role: text("role").notNull().default("member"), // 'owner', 'member', 'viewer'
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

// Committees table for organizing committee information
export const committees = pgTable("committees", {
  id: serial("id").primaryKey(), // Auto-incrementing numeric ID
  name: varchar("name").notNull(), // 'Marketing Committee', 'Grant Committee', etc.
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Committee memberships table for tracking which users belong to which committees
export const committeeMemberships = pgTable("committee_memberships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  committeeId: integer("committee_id").notNull(), // References committees.id
  role: varchar("role").notNull().default("member"), // 'chair', 'co-chair', 'member'
  permissions: jsonb("permissions").default('[]'), // Specific committee permissions
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Announcements table for website banners
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default("general"), // 'event', 'position', 'alert', 'general'
  priority: varchar("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  link: text("link"), // Optional external link
  linkText: text("link_text"), // Text for the link
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SIMPLE MESSAGING SYSTEM - 3 tables only

// 1. Conversations - stores all conversation types
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'direct', 'group', 'channel'
  name: text("name"), // NULL for direct messages, required for groups/channels
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Conversation participants - who's in each conversation
export const conversationParticipants = pgTable("conversation_participants", {
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.conversationId, table.userId] }),
}));

// 3. Messages - enhanced with contextual linking
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  sender: text("sender"), // Display name of sender
  contextType: text("context_type"), // 'suggestion', 'project', 'task', 'direct'
  contextId: text("context_id"),
  read: boolean("read").notNull().default(false), // Simple read status for email-style messaging
  editedAt: timestamp("edited_at"),
  editedContent: text("edited_content"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: text("deleted_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 4. Message Recipients - track read status per recipient
export const messageRecipients = pgTable("message_recipients", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  recipientId: text("recipient_id").notNull(),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  notificationSent: boolean("notification_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
  contextAccessRevoked: boolean("context_access_revoked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueRecipient: unique().on(table.messageId, table.recipientId),
  unreadIdx: index("idx_message_recipients_unread").on(table.recipientId, table.read),
}));

// 5. Message Threads - maintain threading hierarchy
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  rootMessageId: integer("root_message_id").references(() => messages.id, { onDelete: "cascade" }),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  parentMessageId: integer("parent_message_id").references(() => messages.id, { onDelete: "cascade" }),
  depth: integer("depth").notNull().default(0),
  path: text("path").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueMessage: unique().on(table.messageId),
  pathIdx: index("idx_thread_path").on(table.path),
}));

// 6. Kudos Tracking - prevent spam by tracking sent kudos
export const kudosTracking = pgTable("kudos_tracking", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  recipientId: text("recipient_id").notNull(),
  contextType: text("context_type").notNull(), // 'project' or 'task'
  contextId: text("context_id").notNull(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  sentAt: timestamp("sent_at").defaultNow(),
}, (table) => ({
  // Ensure one kudos per sender-recipient-context combination
  uniqueKudos: unique().on(table.senderId, table.recipientId, table.contextType, table.contextId),
  senderIdx: index("idx_kudos_sender").on(table.senderId),
}));

// All complex messaging tables removed - using enhanced messaging system above

export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  weekEnding: text("week_ending").notNull(), // date string
  sandwichCount: integer("sandwich_count").notNull(),
  notes: text("notes"),
  submittedBy: text("submitted_by").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const sandwichCollections = pgTable("sandwich_collections", {
  id: serial("id").primaryKey(),
  collectionDate: text("collection_date").notNull(),
  hostName: text("host_name").notNull(),
  individualSandwiches: integer("individual_sandwiches").notNull(),
  groupCollections: text("group_collections").notNull(), // JSON string of group data
  createdBy: text("created_by"), // User ID who created this entry
  createdByName: text("created_by_name"), // Display name of creator
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const meetingMinutes = pgTable("meeting_minutes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(), // date string
  summary: text("summary").notNull(),
  color: text("color").notNull().default("blue"), // for border color
  fileName: text("file_name"), // original uploaded file name
  filePath: text("file_path"), // stored file path
  fileType: text("file_type"), // 'pdf', 'docx', 'google_docs', 'text'
  mimeType: text("mime_type"), // file mime type
  committeeType: text("committee_type"), // Committee this minute belongs to - "core_group", "marketing_committee", etc.
});

export const driveLinks = pgTable("drive_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  icon: text("icon").notNull(), // icon name
  iconColor: text("icon_color").notNull(),
});

export const agendaItems = pgTable("agenda_items", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(), // Links to specific meeting
  submittedBy: text("submitted_by").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "postponed"
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "weekly", "marketing_committee", "grant_committee", "core_group", "all_team"
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location"),
  description: text("description"),
  finalAgenda: text("final_agenda"),
  status: text("status").notNull().default("planning"), // "planning", "agenda_set", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  vehicleType: text("vehicle_type"),
  licenseNumber: text("license_number"),
  availability: text("availability").default("available"), // "available", "busy", "off-duty"
  zone: text("zone"), // Keep for migration compatibility
  routeDescription: text("route_description"), // New field to preserve route info like "SS to Dunwoody"
  hostLocation: text("host_location"), // Connect to specific host locations
  hostId: integer("host_id"), // Reference to hosts table for directory connection
  vanApproved: boolean("van_approved").notNull().default(false),
  homeAddress: text("home_address"),
  availabilityNotes: text("availability_notes"),
  emailAgreementSent: boolean("email_agreement_sent").notNull().default(false),
  voicemailLeft: boolean("voicemail_left").notNull().default(false),
  inactiveReason: text("inactive_reason"),
});

export const driverAgreements = pgTable("driver_agreements", {
  id: serial("id").primaryKey(),
  submittedBy: text("submitted_by").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  licenseNumber: text("license_number").notNull(),
  vehicleInfo: text("vehicle_info").notNull(),
  emergencyContact: text("emergency_contact").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  agreementAccepted: boolean("agreement_accepted").notNull().default(false),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const hosts = pgTable("hosts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Location name (e.g., "Alpharetta", "Roswell Community Center")
  address: text("address"),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hostContacts = pgTable("host_contacts", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  name: text("name").notNull(), // Contact person name
  role: text("role").notNull(), // 'primary', 'backup', 'coordinator', 'manager', 'volunteer'
  phone: text("phone").notNull(),
  email: text("email"),
  isPrimary: boolean("is_primary").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"), // Contact person name
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  preferences: text("preferences"),
  weeklyEstimate: integer("weekly_estimate"), // Estimated weekly sandwich count
  status: text("status").notNull().default("active"), // 'active', 'inactive'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({ id: true, createdAt: true });
export const insertMessageThreadSchema = createInsertSchema(messageThreads).omit({ id: true, createdAt: true });
export const insertKudosTrackingSchema = createInsertSchema(kudosTracking).omit({ id: true, sentAt: true });
export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({ id: true, submittedAt: true });
export const insertSandwichCollectionSchema = createInsertSchema(sandwichCollections).omit({ id: true, submittedAt: true });
export const insertMeetingMinutesSchema = createInsertSchema(meetingMinutes).omit({ id: true });
export const insertDriveLinkSchema = createInsertSchema(driveLinks).omit({ id: true });
export const insertAgendaItemSchema = createInsertSchema(agendaItems).omit({ id: true, submittedAt: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true, createdAt: true });
export const insertDriverAgreementSchema = createInsertSchema(driverAgreements).omit({ id: true, submittedAt: true });
export const insertHostSchema = createInsertSchema(hosts).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  name: z.string().min(1, "Host name is required").trim().refine(
    (name) => name.length > 0,
    "Host name cannot be empty or just whitespace"
  ),
});
export const insertHostContactSchema = createInsertSchema(hostContacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({ id: true, uploadedAt: true });
export const insertProjectTaskSchema = createInsertSchema(projectTasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectCommentSchema = createInsertSchema(projectComments).omit({ id: true, createdAt: true });
export const insertProjectAssignmentSchema = createInsertSchema(projectAssignments).omit({ id: true, assignedAt: true });
export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).omit({ id: true, completedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = z.infer<typeof insertMessageRecipientSchema>;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = z.infer<typeof insertMessageThreadSchema>;
export type KudosTracking = typeof kudosTracking.$inferSelect;
export type InsertKudosTracking = z.infer<typeof insertKudosTrackingSchema>;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;
export type SandwichCollection = typeof sandwichCollections.$inferSelect;
export type InsertSandwichCollection = z.infer<typeof insertSandwichCollectionSchema>;
export type MeetingMinutes = typeof meetingMinutes.$inferSelect;
export type InsertMeetingMinutes = z.infer<typeof insertMeetingMinutesSchema>;
export type DriveLink = typeof driveLinks.$inferSelect;
export type InsertDriveLink = z.infer<typeof insertDriveLinkSchema>;
export type AgendaItem = typeof agendaItems.$inferSelect;
export type InsertAgendaItem = z.infer<typeof insertAgendaItemSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type DriverAgreement = typeof driverAgreements.$inferSelect;
export type InsertDriverAgreement = z.infer<typeof insertDriverAgreementSchema>;
export type Host = typeof hosts.$inferSelect;
export type InsertHost = z.infer<typeof insertHostSchema>;
export type HostContact = typeof hostContacts.$inferSelect;
export type InsertHostContact = z.infer<typeof insertHostContactSchema>;
export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;
export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;
export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = z.infer<typeof insertProjectCommentSchema>;
export type ProjectAssignment = typeof projectAssignments.$inferSelect;
export type InsertProjectAssignment = z.infer<typeof insertProjectAssignmentSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;
export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

// Hosted Files table
export const hostedFiles = pgTable("hosted_files", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  category: text("category").notNull().default("general"), // toolkit, forms, guides, etc.
  uploadedBy: text("uploaded_by").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertHostedFileSchema = createInsertSchema(hostedFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true
});

export type HostedFile = typeof hostedFiles.$inferSelect;
export type InsertHostedFile = z.infer<typeof insertHostedFileSchema>;

// General Contacts table (for people who aren't hosts or recipients)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization"),
  role: text("role"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  notes: text("notes"),
  category: text("category").notNull().default("general"), // volunteer, board, vendor, donor, etc.
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// Audit log types
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Driver types
export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true
});

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

// Notifications table for celebrations and system notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Who receives the notification
  type: varchar("type").notNull(), // 'celebration', 'reminder', 'achievement', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  relatedType: varchar("related_type"), // 'task', 'project', 'collection', etc.
  relatedId: integer("related_id"), // ID of related record
  celebrationData: jsonb("celebration_data"), // Extra data for celebrations (emojis, achievements, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Committee schema types
export const insertCommitteeSchema = createInsertSchema(committees).omit({
  createdAt: true,
  updatedAt: true
});

export type Committee = typeof committees.$inferSelect;
export type InsertCommittee = z.infer<typeof insertCommitteeSchema>;

export const insertCommitteeMembershipSchema = createInsertSchema(committeeMemberships).omit({
  id: true,
  joinedAt: true
});

export type CommitteeMembership = typeof committeeMemberships.$inferSelect;
export type InsertCommitteeMembership = z.infer<typeof insertCommitteeMembershipSchema>;

// Announcement schema types
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;

// Simple messaging schema types
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).omit({
  joinedAt: true,
  lastReadAt: true
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;

// Google Sheets integration table
export const googleSheets = pgTable("google_sheets", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  sheetId: varchar("sheet_id").notNull(), // Google Sheets document ID
  isPublic: boolean("is_public").notNull().default(true),
  embedUrl: text("embed_url").notNull(),
  directUrl: text("direct_url").notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoogleSheetSchema = createInsertSchema(googleSheets).omit({
  id: true,
  embedUrl: true,
  directUrl: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true
});

export type GoogleSheet = typeof googleSheets.$inferSelect;
export type InsertGoogleSheet = z.infer<typeof insertGoogleSheetSchema>;

// OLD COMPLEX MESSAGING TABLES REMOVED - Using simple 3-table system only
// The following tables were part of the old 7-table messaging system:
// - conversationThreads
// - messageGroups  
// - groupMemberships
// - groupMessageParticipants
// 
// These have been replaced by the simple 3-table system:
// - conversations
// - conversationParticipants  
// - messages

// Stream Chat integration tables
export const streamConversations = pgTable("stream_conversations", {
  id: serial("id").primaryKey(),
  streamChannelId: varchar("stream_channel_id").unique().notNull(), // Stream's channel ID
  channelType: varchar("channel_type").notNull().default("messaging"), // Stream channel type
  title: text("title"), // Conversation title/subject
  members: jsonb("members").notNull().default('[]'), // Array of user IDs
  isGroup: boolean("is_group").notNull().default(false),
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: text("last_message_preview"),
  unreadCount: integer("unread_count").notNull().default(0),
  metadata: jsonb("metadata").default('{}'), // Additional conversation data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const streamThreads = pgTable("stream_threads", {
  id: serial("id").primaryKey(),
  streamThreadId: varchar("stream_thread_id").unique().notNull(), // Stream's thread ID
  conversationId: integer("conversation_id").references(() => streamConversations.id, { onDelete: "cascade" }),
  parentMessageId: integer("parent_message_id"), // Will be set after messages table is defined
  title: text("title"), // Thread title (usually "Re: ...")
  participants: jsonb("participants").notNull().default('[]'), // Array of user IDs in thread
  lastReplyAt: timestamp("last_reply_at"),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const streamMessages = pgTable("stream_messages", {
  id: serial("id").primaryKey(),
  streamMessageId: varchar("stream_message_id").unique().notNull(), // Stream's message ID
  conversationId: integer("conversation_id").references(() => streamConversations.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").references(() => streamThreads.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull(),
  senderName: varchar("sender_name").notNull(),
  subject: text("subject"), // For email-style messages
  content: text("content").notNull(),
  messageType: varchar("message_type").notNull().default("direct"), // 'direct', 'group'
  folder: varchar("folder").notNull().default("inbox"), // 'inbox', 'sent', 'drafts', 'trash'
  isRead: boolean("is_read").notNull().default(false),
  isDraft: boolean("is_draft").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false), // soft delete
  recipients: jsonb("recipients").default('[]'), // Array of recipient IDs for display
  attachments: jsonb("attachments").default('[]'), // File attachments
  customData: jsonb("custom_data").default('{}'), // Additional Stream custom fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const workLogs = pgTable("work_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  description: text("description").notNull(),
  hours: integer("hours").notNull().default(0),
  minutes: integer("minutes").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 20 }).default("pending"), // for future approval
  approvedBy: varchar("approved_by"), // for future approval
  approvedAt: timestamp("approved_at", { withTimezone: true }), // for future approval
  visibility: varchar("visibility", { length: 20 }).default("private"), // "private", "team", "department", "public"
  sharedWith: jsonb("shared_with").$type<string[]>().default([]), // specific user IDs who can view
  department: varchar("department", { length: 50 }), // for department-based visibility
  teamId: varchar("team_id") // for team-based visibility
});

export type WorkLog = typeof workLogs.$inferSelect;
export type InsertWorkLog = typeof workLogs.$inferInsert;

// Suggestions portal for user feedback and feature requests
export const suggestions = pgTable("suggestions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"), // 'general', 'feature', 'bug', 'improvement', 'ui_ux'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("submitted"), // 'submitted', 'under_review', 'in_progress', 'completed', 'rejected', 'needs_clarification'
  submittedBy: varchar("submitted_by").notNull(),
  submitterEmail: varchar("submitter_email"),
  submitterName: text("submitter_name"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  upvotes: integer("upvotes").notNull().default(0),
  tags: text("tags").array().default([]),
  implementationNotes: text("implementation_notes"), // Admin notes on how this was/will be implemented
  estimatedEffort: text("estimated_effort"), // 'small', 'medium', 'large', 'epic'
  assignedTo: varchar("assigned_to"), // Admin user who is handling this suggestion
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Communication thread between admins and suggestion submitters
export const suggestionResponses = pgTable("suggestion_responses", {
  id: serial("id").primaryKey(),
  suggestionId: integer("suggestion_id").notNull(),
  message: text("message").notNull(),
  isAdminResponse: boolean("is_admin_response").notNull().default(false),
  respondedBy: varchar("responded_by").notNull(),
  respondentName: text("respondent_name"),
  isInternal: boolean("is_internal").notNull().default(false), // Internal admin notes not visible to submitter
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schema types for suggestions
export const insertSuggestionSchema = createInsertSchema(suggestions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  upvotes: true,
  completedAt: true,
  submittedBy: true,
  submitterEmail: true,
  submitterName: true
});

export const insertSuggestionResponseSchema = createInsertSchema(suggestionResponses).omit({
  id: true,
  createdAt: true
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = z.infer<typeof insertSuggestionSchema>;
export type SuggestionResponse = typeof suggestionResponses.$inferSelect;
export type InsertSuggestionResponse = z.infer<typeof insertSuggestionResponseSchema>;

// Stream Chat schema types
export const insertStreamMessageSchema = createInsertSchema(streamMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStreamConversationSchema = createInsertSchema(streamConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStreamThreadSchema = createInsertSchema(streamThreads).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type StreamMessage = typeof streamMessages.$inferSelect;
export type InsertStreamMessage = z.infer<typeof insertStreamMessageSchema>;
export type StreamConversation = typeof streamConversations.$inferSelect;
export type InsertStreamConversation = z.infer<typeof insertStreamConversationSchema>;
export type StreamThread = typeof streamThreads.$inferSelect;
export type InsertStreamThread = z.infer<typeof insertStreamThreadSchema>;