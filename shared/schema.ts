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
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'available', 'in_progress', 'planning', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  category: text("category").notNull().default("general"), // 'general', 'marketing', 'operations', 'grants', 'events'
  assigneeId: integer("assignee_id"),
  assigneeName: text("assignee_name"),
  dueDate: text("due_date"), // ISO date string
  startDate: text("start_date"), // ISO date string
  completionDate: text("completion_date"), // ISO date string
  progressPercentage: integer("progress_percentage").notNull().default(0), // 0-100
  notes: text("notes"), // Additional project notes
  tags: text("tags"), // JSON array of tags
  estimatedHours: integer("estimated_hours"), // Estimated work hours
  actualHours: integer("actual_hours"), // Actual hours worked
  color: text("color").notNull().default("blue"), // for status indicator
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
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
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("active"), // 'active', 'inactive'
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
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true, replyCount: true, threadId: true });
export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({ id: true, submittedAt: true });
export const insertSandwichCollectionSchema = createInsertSchema(sandwichCollections).omit({ id: true, submittedAt: true });
export const insertMeetingMinutesSchema = createInsertSchema(meetingMinutes).omit({ id: true });
export const insertDriveLinkSchema = createInsertSchema(driveLinks).omit({ id: true });
export const insertAgendaItemSchema = createInsertSchema(agendaItems).omit({ id: true, submittedAt: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true, createdAt: true });
export const insertDriverAgreementSchema = createInsertSchema(driverAgreements).omit({ id: true, submittedAt: true });
export const insertHostSchema = createInsertSchema(hosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectDocumentSchema = createInsertSchema(projectDocuments).omit({ id: true, uploadedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
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
export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type InsertProjectDocument = z.infer<typeof insertProjectDocumentSchema>;

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

export type UpsertUser = typeof users.$inferInsert;
