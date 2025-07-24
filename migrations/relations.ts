import { relations } from "drizzle-orm/relations";
import { projects, projectComments, projectTasks, committees, committeeMemberships, taskCompletions, conversations, messages, projectCongratulations, messageRecipients, users, workLogs, messageThreads, chatMessages, chatMessageReads, kudosTracking, messageReads, conversationParticipants } from "./schema";

export const projectCommentsRelations = relations(projectComments, ({one}) => ({
	project: one(projects, {
		fields: [projectComments.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	projectComments: many(projectComments),
	projectTasks: many(projectTasks),
	projectCongratulations: many(projectCongratulations),
}));

export const projectTasksRelations = relations(projectTasks, ({one, many}) => ({
	project: one(projects, {
		fields: [projectTasks.projectId],
		references: [projects.id]
	}),
	taskCompletions: many(taskCompletions),
}));

export const committeeMembershipsRelations = relations(committeeMemberships, ({one}) => ({
	committee: one(committees, {
		fields: [committeeMemberships.committeeId],
		references: [committees.id]
	}),
}));

export const committeesRelations = relations(committees, ({many}) => ({
	committeeMemberships: many(committeeMemberships),
}));

export const taskCompletionsRelations = relations(taskCompletions, ({one}) => ({
	projectTask: one(projectTasks, {
		fields: [taskCompletions.taskId],
		references: [projectTasks.id]
	}),
}));

export const messagesRelations = relations(messages, ({one, many}) => ({
	conversation: one(conversations, {
		fields: [messages.conversationId],
		references: [conversations.id]
	}),
	messageRecipients: many(messageRecipients),
	messageThreads_rootMessageId: many(messageThreads, {
		relationName: "messageThreads_rootMessageId_messages_id"
	}),
	messageThreads_messageId: many(messageThreads, {
		relationName: "messageThreads_messageId_messages_id"
	}),
	kudosTrackings: many(kudosTracking),
	messageReads: many(messageReads),
}));

export const conversationsRelations = relations(conversations, ({many}) => ({
	messages: many(messages),
	conversationParticipants: many(conversationParticipants),
}));

export const projectCongratulationsRelations = relations(projectCongratulations, ({one}) => ({
	project: one(projects, {
		fields: [projectCongratulations.projectId],
		references: [projects.id]
	}),
}));

export const messageRecipientsRelations = relations(messageRecipients, ({one}) => ({
	message: one(messages, {
		fields: [messageRecipients.messageId],
		references: [messages.id]
	}),
}));

export const workLogsRelations = relations(workLogs, ({one}) => ({
	user_userId: one(users, {
		fields: [workLogs.userId],
		references: [users.id],
		relationName: "workLogs_userId_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [workLogs.approvedBy],
		references: [users.id],
		relationName: "workLogs_approvedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	workLogs_userId: many(workLogs, {
		relationName: "workLogs_userId_users_id"
	}),
	workLogs_approvedBy: many(workLogs, {
		relationName: "workLogs_approvedBy_users_id"
	}),
}));

export const messageThreadsRelations = relations(messageThreads, ({one}) => ({
	message_rootMessageId: one(messages, {
		fields: [messageThreads.rootMessageId],
		references: [messages.id],
		relationName: "messageThreads_rootMessageId_messages_id"
	}),
	message_messageId: one(messages, {
		fields: [messageThreads.messageId],
		references: [messages.id],
		relationName: "messageThreads_messageId_messages_id"
	}),
}));

export const chatMessageReadsRelations = relations(chatMessageReads, ({one}) => ({
	chatMessage: one(chatMessages, {
		fields: [chatMessageReads.messageId],
		references: [chatMessages.id]
	}),
}));

export const chatMessagesRelations = relations(chatMessages, ({many}) => ({
	chatMessageReads: many(chatMessageReads),
}));

export const kudosTrackingRelations = relations(kudosTracking, ({one}) => ({
	message: one(messages, {
		fields: [kudosTracking.messageId],
		references: [messages.id]
	}),
}));

export const messageReadsRelations = relations(messageReads, ({one}) => ({
	message: one(messages, {
		fields: [messageReads.messageId],
		references: [messages.id]
	}),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({one}) => ({
	conversation: one(conversations, {
		fields: [conversationParticipants.conversationId],
		references: [conversations.id]
	}),
}));