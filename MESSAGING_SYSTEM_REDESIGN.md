# Messaging System Redesign Plan

## Executive Summary

This plan outlines the transformation of the current sidebar chat feature into a core infrastructure messaging service that enables contextual communication throughout the application. The new system will support direct messages, contextual linking (suggestions, projects, tasks), read/unread tracking, and real-time notifications.

## Current State Analysis

### Existing Infrastructure
- **Database**: Drizzle ORM with PostgreSQL
- **WebSocket**: Already implemented for real-time notifications
- **Tables**: Basic messaging structure exists (conversations, conversationParticipants, messages)
- **Authentication**: Session-based auth with user permissions
- **Notification Service**: Email notifications via SendGrid

### Limitations of Current System
- Messages are isolated in chat channels
- No contextual linking to app entities
- Limited read/unread tracking
- No direct messaging between users outside of channels

## Proposed Architecture

### 1. Enhanced Database Schema

#### Messages Table (Enhanced)

```typescript
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  contextType: text("context_type"), // 'suggestion', 'project', 'task', 'direct'
  contextId: text("context_id"),     // ID of related entity
  editedAt: timestamp("edited_at"),  // Track edits for transparency
  editedContent: text("edited_content"), // Preserve original in 'content'
  deletedAt: timestamp("deleted_at"), // Soft delete for audit trail
  deletedBy: text("deleted_by"),     // Who deleted the message
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

#### Message Recipients Table (New)

```typescript
export const messageRecipients = pgTable("message_recipients", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  recipientId: text("recipient_id").notNull(),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  notificationSent: boolean("notification_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"), // Track email fallback
}, (table) => ({
  messageRecipientIdx: index("message_recipient_idx").on(table.recipientId, table.read),
  uniqueRecipient: unique().on(table.messageId, table.recipientId),
}));
```

#### Message Threads Table (New - for reply chains)

```typescript
export const messageThreads = pgTable("message_threads", {
  id: serial("id").primaryKey(),
  rootMessageId: integer("root_message_id").references(() => messages.id),
  messageId: integer("message_id").references(() => messages.id, { onDelete: "cascade" }),
  depth: integer("depth").notNull().default(0),
  path: text("path").notNull(), // Materialized path for efficient queries
}, (table) => ({
  pathIdx: index("thread_path_idx").on(table.path),
  depthIdx: index("thread_depth_idx").on(table.depth),
}));
```

### 2. MessagingService Class

```typescript
// server/services/messaging-service.ts
export class MessagingService {
  // Core messaging methods
  async sendMessage(params: {
    senderId: string;
    recipientIds: string[];
    content: string;
    contextType?: 'suggestion' | 'project' | 'task' | 'direct';
    contextId?: string;
    parentMessageId?: number; // For replies
  }): Promise<Message>

  async getUnreadMessages(recipientId: string, options?: {
    contextType?: string;
    limit?: number;
    offset?: number;
  }): Promise<MessageWithSender[]>

  async markMessageRead(recipientId: string, messageId: number): Promise<boolean>

  async markAllMessagesRead(recipientId: string, contextType?: string): Promise<number>

  async getMessageThread(messageId: number): Promise<MessageThread[]>

  async getContextMessages(contextType: string, contextId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<MessageWithSender[]>

  async getUserConversations(userId: string, options?: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ConversationSummary[]>

  // Message management
  async editMessage(messageId: number, userId: string, newContent: string): Promise<Message>
  
  async deleteMessage(messageId: number, userId: string): Promise<boolean>
  
  // Thread pagination
  async getThreadPage(rootMessageId: number, options: {
    limit: number;
    offset: number;
    maxDepth?: number;
  }): Promise<MessageThread[]>

  // Context permissions
  async validateContextAccess(userId: string, contextType: string, contextId: string): Promise<boolean>
  
  async syncContextPermissions(contextType: string, contextId: string, allowedUserIds: string[]): Promise<void>

  // Notification helpers
  async triggerNotifications(message: Message, recipientIds: string[]): Promise<void>
  
  // Email fallback - sends email if message unread after delay
  async scheduleEmailFallback(messageId: number, recipientId: string, delayMinutes: number = 30): Promise<void>
}
```

### 3. API Endpoints

#### Message Management

- `POST /api/messages/send` - Send a message with context
- `GET /api/messages/unread` - Get unread messages for current user
- `GET /api/messages/context/:type/:id` - Get messages for specific context (with permission check)
- `POST /api/messages/:id/read` - Mark message as read
- `POST /api/messages/mark-all-read` - Mark all messages as read
- `GET /api/messages/:id/thread` - Get message thread with pagination
- `PUT /api/messages/:id` - Edit a message (only sender, within 15 min)
- `DELETE /api/messages/:id` - Soft delete a message (only sender/admin)

#### Conversation Management

- `GET /api/conversations` - Get user's conversations with unread counts
- `GET /api/conversations/:userId` - Get direct message history with user

#### Permission Sync Endpoints (Internal)

- `POST /api/messages/sync-permissions` - Update context permissions when project/suggestion access changes

### 4. WebSocket Integration

Enhanced WebSocket events:

```typescript
// Server -> Client
{
  type: 'new_message',
  message: Message,
  context: {
    type: string,
    id: string,
    title?: string
  }
}

{
  type: 'message_edited',
  messageId: number,
  newContent: string,
  editedAt: string
}

{
  type: 'message_deleted',
  messageId: number,
  deletedAt: string
}

{
  type: 'typing_indicator',
  userId: string,
  contextType: string,
  contextId: string,
  isTyping: boolean
}

// Client -> Server
{
  type: 'message_read',
  messageId: number
}

{
  type: 'typing_status',
  contextType: string,
  contextId: string,
  isTyping: boolean
}
```

### 5. Frontend Components

#### Core Components
- `MessageComposer` - Unified message composition with context
- `MessageThread` - Display message threads with context
- `UnreadIndicator` - Show unread counts globally
- `MessageNotificationDropdown` - Quick access to recent messages
- `ContextualMessagePanel` - Embedded messaging in suggestions/projects

#### Hooks
- `useMessaging()` - Core messaging operations
- `useUnreadCount()` - Real-time unread tracking
- `useMessageThread()` - Thread management

## Implementation Phases

### Phase 1: Backend Infrastructure (Week 1)
1. Create new database tables with migrations
2. Implement MessagingService class
3. Add API endpoints
4. Integrate with existing WebSocket system
5. Add message context to suggestion responses

### Phase 2: Frontend Core Components (Week 2)
1. Create messaging hooks
2. Build MessageComposer component
3. Implement UnreadIndicator
4. Add notification dropdown
5. Integrate with suggestion portal

### Phase 3: Integration & Polish (Week 3)

1. Add messaging to project pages
2. Implement message threading with pagination
3. Add search functionality
4. Add typing indicators and presence
5. Performance optimization
6. Testing and bug fixes

### Phase 4: Advanced Features (Week 4)

1. Implement email fallback for unread messages
2. Add message edit/delete with audit trail
3. Context permission syncing
4. Advanced thread pagination
5. Presence and typing indicators

## Migration Strategy

1. **Preserve Existing Data**: Current conversation/message data remains intact
2. **Gradual Rollout**: New features can coexist with old chat system
3. **Feature Flags**: Use environment variables to toggle new features
4. **Backward Compatibility**: Old chat continues working during transition

## Key Integration Points

### Suggestion Response Flow
```typescript
// When responding to a suggestion
const response = await api.respondToSuggestion(suggestionId, responseData);
await messagingService.sendMessage({
  senderId: currentUser.id,
  recipientIds: [suggestion.submittedBy],
  content: `Your suggestion "${suggestion.title}" has been reviewed: ${responseData.response}`,
  contextType: 'suggestion',
  contextId: suggestionId
});
```

### Project Assignment Flow
```typescript
// When assigning a project
await messagingService.sendMessage({
  senderId: currentUser.id,
  recipientIds: assigneeIds,
  content: `You've been assigned to project: ${project.title}`,
  contextType: 'project',
  contextId: projectId
});
```

## Security Considerations

1. **Permission Checks**: Validate user can message recipients
2. **Context Access**: Ensure user has access to linked context
   - Auto-revoke access when removed from project/suggestion
   - Check permissions on every message fetch
3. **Rate Limiting**: Prevent message spam (10 msgs/min per user)
4. **Content Sanitization**: Clean HTML/scripts from messages
5. **Audit Trail**: Log all messaging activities including edits/deletes
6. **Edit Time Limit**: Only allow edits within 15 minutes
7. **Delete Permissions**: Only sender or admin can delete

## Performance Optimizations

1. **Indexes**: On recipientId, read status, contextType/Id, thread paths
2. **Pagination**: Limit message queries
   - Default 50 messages per page
   - Thread depth limit of 100 for deep conversations
3. **Caching**: Cache unread counts in Redis/memory
4. **Batch Operations**: Group notifications
5. **Materialized Views**: For conversation summaries
6. **Thread Query Optimization**: Use path-based queries with LIMIT/OFFSET
7. **Lazy Loading**: Load thread branches on demand

## Testing Strategy

1. **Unit Tests**: MessagingService methods
2. **Integration Tests**: API endpoints
3. **WebSocket Tests**: Real-time notifications
4. **UI Tests**: Component interactions
5. **Load Tests**: Message volume handling

## Success Metrics

1. **Adoption**: % of users using messaging
2. **Engagement**: Messages sent per user
3. **Response Time**: Time to read messages
4. **Context Usage**: % of messages with context
5. **Performance**: Message delivery latency

## Next Steps

1. Review and approve this plan
2. Set up development branch
3. Create database migrations
4. Begin Phase 1 implementation

## Additional Considerations

### Message Editing Policy

- **Edit Window**: 15 minutes from creation
- **Edit History**: Original content preserved, edited content shown
- **Visual Indicator**: Show "edited" timestamp on modified messages
- **Notifications**: Don't re-notify on edits, but update in real-time if viewing

### Email Fallback Strategy

```typescript
// Triggered after message send
if (!recipient.isOnline) {
  await scheduleEmailFallback(messageId, recipientId, 30); // 30 min delay
}

// Background job checks unread messages
async function processEmailFallbacks() {
  const unreadMessages = await getUnreadMessagesOlderThan(30);
  for (const message of unreadMessages) {
    if (!message.emailSentAt) {
      await sendEmailNotification(message);
      await markEmailSent(message.id);
    }
  }
}
```

### Context Permission Syncing

```typescript
// When user removed from project
await messagingService.syncContextPermissions('project', projectId, remainingUserIds);

// Implementation
async syncContextPermissions(contextType, contextId, allowedUserIds) {
  // Mark messages as "access_revoked" for removed users
  // They keep the messages but can't access the context
  await db.update(messageRecipients)
    .set({ contextAccessRevoked: true })
    .where(
      and(
        eq(messages.contextType, contextType),
        eq(messages.contextId, contextId),
        notInArray(messageRecipients.recipientId, allowedUserIds)
      )
    );
}
```

### Typing Indicators & Presence

- **Debounced Updates**: Send typing status every 3 seconds
- **Auto-expire**: Clear typing indicator after 5 seconds of inactivity
- **Memory Store**: Use in-memory store for presence, not database
- **Optional Feature**: Can be disabled for performance

### Thread Pagination Strategy

```typescript
// Efficient thread loading with materialized paths
async getThreadPage(rootMessageId, { limit = 50, offset = 0, maxDepth = 10 }) {
  return db.select()
    .from(messages)
    .innerJoin(messageThreads, eq(messages.id, messageThreads.messageId))
    .where(
      and(
        eq(messageThreads.rootMessageId, rootMessageId),
        lte(messageThreads.depth, maxDepth)
      )
    )
    .orderBy(messageThreads.path)
    .limit(limit)
    .offset(offset);
}
```

---

This redesign transforms messaging from a peripheral feature into a core communication infrastructure that enhances collaboration throughout the application, with careful attention to scalability, permissions, and user experience.
