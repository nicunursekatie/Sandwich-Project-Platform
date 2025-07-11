# Database Migrations

This directory contains SQL migrations for the messaging system redesign.

## Migration Files

### Complete Migration (All Changes)
- `001_messaging_system_redesign.up.sql` - Applies all messaging system changes
- `001_messaging_system_redesign.down.sql` - Reverts all changes (with data loss warnings)

### Individual Migrations (Safer Approach)
1. `001a_messages_enhancement.sql` - Enhances the messages table with context and edit tracking
2. `001b_message_recipients.sql` - Creates message_recipients table for read tracking
3. `001c_message_threads.sql` - Creates message_threads table for conversation threading

## How to Apply Migrations

### Using psql
```bash
# Apply complete migration
psql -d your_database -f migrations/001_messaging_system_redesign.up.sql

# Or apply individual migrations in order
psql -d your_database -f migrations/001a_messages_enhancement.sql
psql -d your_database -f migrations/001b_message_recipients.sql
psql -d your_database -f migrations/001c_message_threads.sql
```

### Using Drizzle Kit
```bash
# Generate migrations from schema
npx drizzle-kit generate:pg

# Push changes to database
npx drizzle-kit push:pg
```

## Rollback Instructions

Each individual migration file includes rollback instructions at the bottom.

**WARNING**: Rollbacks will cause data loss. Always backup before rolling back.

## Migration Features

### Messages Table Enhancements
- Context linking (suggestion, project, task, direct)
- Edit tracking with original content preservation
- Soft delete with audit trail
- Performance indexes

### Message Recipients Table
- Per-recipient read tracking
- Email notification fallback tracking
- Context access revocation
- Unread message counts

### Message Threads Table
- Materialized path for efficient queries
- Unlimited depth threading
- Thread pagination support
- Parent-child relationships

## Best Practices

1. **Always backup** before applying migrations
2. **Test in development** first
3. **Apply during low-traffic periods**
4. **Monitor performance** after applying indexes
5. **Verify data integrity** after migration

## Notes

- The migrations preserve existing conversation data
- Unread messages older than 7 days are marked as read during migration
- Indexes are created for optimal query performance
- Views are provided for common query patterns