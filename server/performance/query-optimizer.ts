import { db } from "../db";
import { sql } from "drizzle-orm";

export class QueryOptimizer {
  // Database connection pool monitoring
  static async getConnectionPoolStatus() {
    try {
      const result = await db.execute(sql`
        SELECT 
          count(*) as total_connections,
          count(*) filter (where state = 'active') as active_connections,
          count(*) filter (where state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      return result[0];
    } catch (error) {
      console.error('Failed to get connection pool status:', error);
      return null;
    }
  }

  // Query performance monitoring
  static async getSlowQueries() {
    try {
      const result = await db.execute(sql`
        SELECT 
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          rows
        FROM pg_stat_statements 
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC 
        LIMIT 10
      `);
      return result;
    } catch (error) {
      console.error('pg_stat_statements extension not available');
      return [];
    }
  }

  // Index usage analysis
  static async getIndexUsage() {
    try {
      const result = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_scan,
          idx_tup_read,
          idx_tup_fetch
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC
      `);
      return result;
    } catch (error) {
      console.error('Failed to get index usage:', error);
      return [];
    }
  }

  // Table statistics
  static async getTableStats() {
    try {
      const result = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          last_vacuum,
          last_autovacuum,
          last_analyze,
          last_autoanalyze
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC
      `);
      return result;
    } catch (error) {
      console.error('Failed to get table stats:', error);
      return [];
    }
  }

  // Suggest optimizations based on query patterns
  static async analyzeAndSuggestOptimizations() {
    const suggestions = [];

    try {
      // Check for missing indexes on frequently queried columns
      const heavyTables = await db.execute(sql`
        SELECT 
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch
        FROM pg_stat_user_tables 
        WHERE seq_scan > idx_scan * 2 
        AND seq_tup_read > 10000
      `);

      if (heavyTables.length > 0) {
        suggestions.push({
          type: 'missing_indexes',
          message: 'Tables with high sequential scan ratio detected',
          tables: heavyTables.map(t => t.tablename),
          recommendation: 'Consider adding indexes on frequently queried columns'
        });
      }

      // Check for unused indexes
      const unusedIndexes = await db.execute(sql`
        SELECT 
          schemaname,
          tablename,
          indexname
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0
        AND indexname NOT LIKE '%_pkey'
      `);

      if (unusedIndexes.length > 0) {
        suggestions.push({
          type: 'unused_indexes',
          message: 'Unused indexes detected',
          indexes: unusedIndexes.map(i => `${i.tablename}.${i.indexname}`),
          recommendation: 'Consider dropping unused indexes to improve write performance'
        });
      }

      // Check for tables needing vacuum
      const staleStats = await db.execute(sql`
        SELECT 
          tablename,
          n_dead_tup,
          n_live_tup,
          last_autovacuum
        FROM pg_stat_user_tables 
        WHERE n_dead_tup > n_live_tup * 0.1 
        AND n_dead_tup > 1000
      `);

      if (staleStats.length > 0) {
        suggestions.push({
          type: 'vacuum_needed',
          message: 'Tables with high dead tuple ratio detected',
          tables: staleStats.map(t => t.tablename),
          recommendation: 'Consider running VACUUM ANALYZE on these tables'
        });
      }

    } catch (error) {
      console.error('Failed to analyze optimizations:', error);
    }

    return suggestions;
  }

  // Create recommended indexes
  static async createOptimalIndexes() {
    const indexesToCreate = [
      // Sandwich collections - commonly queried fields
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sandwich_collections_date ON sandwich_collections(collection_date)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sandwich_collections_host ON sandwich_collections(host_name)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sandwich_collections_submitted ON sandwich_collections(submitted_at)',
      
      // Hosts - status and name queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hosts_status ON hosts(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hosts_name ON hosts(name)',
      
      // Projects - status and priority queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_status ON projects(status)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_priority ON projects(priority)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_created ON projects(created_at)',
      
      // Messages - committee and timestamp
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_committee ON messages(committee)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_parent ON messages(parent_id)',
      
      // Audit logs - timestamp and action
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name)',
      
      // Host contacts - host_id and role
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_host_contacts_host_id ON host_contacts(host_id)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_host_contacts_role ON host_contacts(role)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_host_contacts_primary ON host_contacts(is_primary)',
      
      // Recipients - status
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recipients_status ON recipients(status)'
    ];

    const results = [];
    
    for (const indexSql of indexesToCreate) {
      try {
        await db.execute(sql.raw(indexSql));
        results.push({ 
          sql: indexSql, 
          status: 'created',
          message: 'Index created successfully'
        });
      } catch (error) {
        results.push({ 
          sql: indexSql, 
          status: 'failed',
          message: error.message
        });
      }
    }

    return results;
  }

  // Performance health check
  static async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      connectionPool: await this.getConnectionPoolStatus(),
      tableStats: await this.getTableStats(),
      indexUsage: await this.getIndexUsage(),
      optimizationSuggestions: await this.analyzeAndSuggestOptimizations()
    };

    return health;
  }
}