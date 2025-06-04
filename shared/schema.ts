import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'available', 'in_progress', 'planning', 'completed'
  assigneeId: integer("assignee_id"),
  assigneeName: text("assignee_name"),
  color: text("color").notNull().default("blue"), // for status indicator
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const weeklyReports = pgTable("weekly_reports", {
  id: serial("id").primaryKey(),
  weekEnding: text("week_ending").notNull(), // date string
  sandwichCount: integer("sandwich_count").notNull(),
  notes: text("notes"),
  submittedBy: text("submitted_by").notNull(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertWeeklyReportSchema = createInsertSchema(weeklyReports).omit({ id: true, submittedAt: true });
export const insertMeetingMinutesSchema = createInsertSchema(meetingMinutes).omit({ id: true });
export const insertDriveLinkSchema = createInsertSchema(driveLinks).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type WeeklyReport = typeof weeklyReports.$inferSelect;
export type InsertWeeklyReport = z.infer<typeof insertWeeklyReportSchema>;
export type MeetingMinutes = typeof meetingMinutes.$inferSelect;
export type InsertMeetingMinutes = z.infer<typeof insertMeetingMinutesSchema>;
export type DriveLink = typeof driveLinks.$inferSelect;
export type InsertDriveLink = z.infer<typeof insertDriveLinkSchema>;
