# The Sandwich Project Platform - Maintenance Guide

## Daily Operations (5 minutes)

### ✅ System Health Check
- **Check notification bell**: Verify it shows current unread counts
- **Test WebSocket connection**: Bell should update in real-time when new messages arrive  
- **Verify login system**: Admin users can access all sections
- **Monitor active users**: Check who's online via the system

### ⚠️ Daily Alert Monitoring
Watch for these error patterns in logs:
- `Primary storage operation failed` - Database connectivity issues
- `WebSocket client disconnected` - Connection drops (normal but monitor frequency)
- `recipient_id column does not exist` - Database schema needs update

## Weekly Tasks (15-30 minutes)

### 📊 Data Review
- **Sandwich totals**: Verify weekly collection numbers match physical records
- **Host participation**: Check if any regular hosts haven't submitted collections
- **Driver activity**: Review driver agreement status and zone coverage
- **User permissions**: Ensure committee members have appropriate access levels

### 🔧 System Maintenance
- **Clear old notifications**: Archive read messages older than 30 days
- **Review audit logs**: Check for unusual data changes or access patterns  
- **Test backup exports**: Generate a CSV export to verify data integrity
- **Update announcements**: Rotate public announcements as needed

### 📈 Performance Check
- **Response times**: API calls should be under 500ms for most operations
- **Memory usage**: Monitor server memory consumption
- **Database size**: Track growth rate (currently 1,675+ collections)

## Monthly Tasks (1-2 hours)

### 🛠️ Deep System Review
- **Database cleanup**: Remove duplicate entries using built-in OG duplicate detection
- **Permission audit**: Review all user roles and access levels
- **Report generation**: Test PDF and CSV report exports thoroughly
- **Meeting system**: Verify agenda uploads and document previews work

### 📋 Data Integrity
- **Cross-reference totals**: Compare platform totals with external spreadsheets
- **Host database sync**: Verify host information matches current operations
- **Driver directory**: Update inactive drivers and agreement statuses
- **Project tracking**: Review active projects and completion rates

### 🔐 Security Review
- **User accounts**: Deactivate unused accounts
- **API endpoints**: Review access logs for unusual patterns
- **File uploads**: Clean temporary files and validate document storage
- **Session management**: Monitor session timeouts and authentication

## Quarterly Tasks (2-3 hours)

### 🔄 Major Updates
- **Schema updates**: Run `npm run db:push` for any database changes
- **Dependency updates**: Update Node.js packages for security
- **Feature testing**: Thoroughly test all major platform functions
- **Performance optimization**: Review slow queries and optimize caching

### 📊 Analytics Deep Dive
- **Impact reports**: Generate comprehensive yearly/quarterly summaries
- **Growth analysis**: Track sandwich collection trends and forecasting
- **Host engagement**: Analyze participation patterns and identify areas for improvement
- **Geographic coverage**: Review the 47+ mile radius coverage effectiveness

## Emergency Procedures

### 🚨 Platform Down
1. Check Replit deployment status
2. Restart workflow: "Start application"
3. Verify DATABASE_URL environment variable
4. Check for SSL certificate issues

### 🚨 Data Loss Prevention
1. **Immediate backup**: Export all collections to CSV
2. **Database verification**: Run integrity checks
3. **Version control**: Document any emergency changes
4. **Recovery plan**: Restore from most recent backup if needed

### 🚨 Security Incident
1. **Immediate action**: Disable affected user accounts
2. **Audit review**: Check all recent data changes
3. **Permission reset**: Verify all role assignments
4. **System scan**: Review for unauthorized access

## Key Metrics to Track

### 📈 Growth Indicators
- **Total sandwiches**: Currently 1,868,147 (target growth tracking)
- **Active hosts**: Monitor participation rates
- **Driver coverage**: Ensure adequate zone coverage
- **User engagement**: Track login frequency and feature usage

### ⚡ Performance Metrics
- **API response times**: Keep under 500ms average
- **WebSocket connections**: Monitor connection stability
- **Database queries**: Watch for slow operations
- **File upload success**: Track document processing rates

### 🛡️ System Health
- **Uptime**: Target 99%+ availability
- **Error rates**: Keep under 1% for critical functions
- **Memory usage**: Monitor for memory leaks
- **Storage growth**: Plan for database scaling

## Automation Opportunities

### 🤖 Consider Implementing
- **Daily health reports**: Automated system status emails
- **Weekly data summaries**: Automatic collection total reports
- **Alert notifications**: Email alerts for system errors
- **Backup scheduling**: Automated daily data exports

## Emergency Contacts

### 🔧 Technical Issues
- **Platform problems**: Check Replit status page
- **Database issues**: Monitor PostgreSQL connection logs
- **WebSocket problems**: Verify real-time features

### 📞 Operational Support
- **Data questions**: Review audit logs first
- **User access issues**: Check permission settings
- **Report problems**: Verify file generation processes

---

## Quick Commands Reference

```bash
# Database updates
npm run db:push

# Export data backup
# Use Analytics → Reports → Generate Report (CSV format)

# System restart
# Use Replit "Start application" workflow

# Check system status
# Monitor /api/system/health endpoint
```

## File Locations

- **Main config**: `replit.md`
- **Database schema**: `shared/schema.ts`  
- **API routes**: `server/routes.ts`
- **User management**: `server/temp-auth.ts`
- **Notifications**: `client/src/components/message-notifications.tsx`

---

*Last updated: June 30, 2025*
*Review and update this document monthly*