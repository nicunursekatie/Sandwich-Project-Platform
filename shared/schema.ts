import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
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

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(), // 'waiting', 'available', 'in_progress', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  category: text("category").notNull().default("general"), // 'general', 'marketing', 'operations', 'grants', 'events'
  assigneeId: integer("assignee_id"),
  assigneeName: text("assignee_name"),
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
  color: text("color").notNull().default("blue"), // for status indicator
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
  assigneeName: text("assignee_name"),
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

// Committees table for organizing committee information
export const committees = pgTable("committees", {
  id: varchar("id").primaryKey(), // 'marketing_committee', 'grant_committee', etc.
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
  committeeId: varchar("committee_id").notNull(),
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

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  userId: text("user_id"), // User ID who created the message - nullable for backwards compatibility
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  parentId: integer("parent_id"), // for threading - references another message
  threadId: integer("thread_id"), // groups messages in same thread
  replyCount: integer("reply_count").notNull().default(0), // number of replies
  committee: text("committee").notNull().default("general"), // committee channel: general, marketing_committee, grant_committee, hosts, group_events
});

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
  zone: text("zone"),
  vanApproved: boolean("van_approved").notNull().default(false),
  homeAddress: text("home_address"),
  availabilityNotes: text("availability_notes"),
  emailAgreementSent: boolean("email_agreement_sent").notNull().default(false),
  voicemailLeft: boolean("voicemail_left").notNull().default(false),
  inactiveReason: text("inactive_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true, replyCount: true, threadId: true });
export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({ id: true, submittedAt: true });
export const insertSandwichCollectionSchema = createInsertSchema(sandwichCollections).omit({ id: true, submittedAt: true });
export const insertMeetingMinutesSchema = createInsertSchema(meetingMinutes).omit({ id: true });
export const insertDriveLinkSchema = createInsertSchema(driveLinks).omit({ id: true });
export const insertAgendaItemSchema = createInsertSchema(agendaItems).omit({ id: true, submittedAt: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true, createdAt: true });
export const insertDriverAgreementSchema = createInsertSchema(driverAgreements).omit({ id: true, submittedAt: true });
export const insertHostSchema = createInsertSchema(hosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHostContactSchema = createInsertSchema(hostContacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({ id: true, uploadedAt: true });
export const insertProjectTaskSchema = createInsertSchema(projectTasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectCommentSchema = createInsertSchema(projectComments).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
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
  id: true,
  createdAt: true,
  updatedAt: true
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
