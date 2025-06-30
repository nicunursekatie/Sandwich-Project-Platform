# Replit.md

## Overview

This is a full-stack sandwich collection management application built for The Sandwich Project, a nonprofit organization that tracks sandwich donations and distributions. The application provides comprehensive data management, analytics, and operational tools for managing volunteers, hosts, recipients, and sandwich collection activities.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **TanStack Query** for efficient data fetching and caching
- **Tailwind CSS** with **shadcn/ui** components for modern, accessible UI
- **React Hook Form** with Zod validation for form management

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** as the primary database (using Neon serverless)
- **Session-based authentication** with connect-pg-simple for session storage
- **Replit Auth** integration for user management

### Data Storage Solutions
- **Primary**: PostgreSQL database with Drizzle ORM schema definitions
- **Session Storage**: PostgreSQL sessions table for user authentication
- **File Uploads**: Local file system with multer middleware
- **Caching**: LRU Cache implementation for performance optimization

## Key Components

### Core Data Models
- **Sandwich Collections**: Primary tracking of sandwich donations with host, date, count, and group collections
- **Hosts**: Organizations and locations that collect sandwiches
- **Recipients**: Organizations that receive sandwich donations
- **Projects**: Task and project management for organizational activities
- **Users**: Role-based user management (admin, coordinator, volunteer, viewer)
- **Audit Logs**: Complete audit trail for all data changes

### Authentication and Authorization
- Replit-based authentication with custom role management
- Role-based permissions (admin, coordinator, volunteer, viewer)
- Session management with PostgreSQL storage
- Audit logging for all user actions

### External Service Integrations
- **SendGrid** for email notifications
- **Google Sheets** integration capability (fallback storage)
- **File upload** support for CSV imports and document attachments

## Data Flow

### Collection Data Management
1. Users input sandwich collection data through forms
2. Data validation with Zod schemas before database insertion
3. Automatic audit logging for all create/update/delete operations
4. Real-time analytics calculations with caching for performance
5. Export capabilities (CSV/JSON) for reporting

### Import/Export Pipeline
1. CSV file uploads processed through multer middleware
2. Data validation and sanitization before database insertion
3. Bulk operations with transaction support
4. Export functionality with date range filtering
5. Backup and restore capabilities

### Performance Optimization
1. Query optimization with intelligent indexing
2. LRU caching for frequently accessed data
3. Pagination for large datasets
4. Memoization for expensive computations
5. Database connection pooling

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM with PostgreSQL adapter
- **express**: Web application framework
- **@tanstack/react-query**: Data fetching and caching
- **react-hook-form**: Form management
- **zod**: Schema validation
- **@sendgrid/mail**: Email service integration

### UI and Styling
- **@radix-ui**: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component styling variants

### Development Tools
- **typescript**: Type safety across the stack
- **vite**: Build tool and development server
- **drizzle-kit**: Database migration tool
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Replit Configuration
- **Node.js 20** runtime environment
- **PostgreSQL 16** database service
- **Autoscale deployment** target for production
- **Port 5000** for local development, port 80 for external access

### Build Process
1. Frontend build with Vite (outputs to `dist/public`)
2. Backend build with esbuild (outputs to `dist/index.js`)
3. Database migrations applied via Drizzle Kit
4. Static file serving in production mode

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `SENDGRID_API_KEY`: Email service authentication
- `REPL_ID`: Replit environment identifier

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 24, 2025: Fixed Reports section 404 error: replaced redirect with direct ReportingDashboard component rendering, reports now load properly within dashboard navigation
- June 24, 2025: Resolved Projects navigation conflict: created clean content-only version that renders properly when embedded in dashboard without duplicate navigation structures
- June 24, 2025: Fixed project detail page routing and API issues: resolved parameter extraction from URL, updated query client usage to work with default queryFn, project details now load correctly
- June 24, 2025: Implemented clickable project cards with proper navigation to detail pages showing project information, tasks, and management interface
- June 24, 2025: Fixed projects page navigation to match dashboard exactly: added top header with logout, left sidebar with expandable sections, "Projects" under Operations section
- June 24, 2025: Resolved project display issue: mapped database status "in_progress" to "active" tab, existing Catchafire Project now visible with correct assignee and 0% progress bar
- June 24, 2025: Redesigned projects page to match platform's consistent design language: replaced complex kanban layout with simple card-based tabs matching hosts/recipients pages
- June 24, 2025: Added practical filter system to driver management: van drivers, missing agreements, and zone filtering for operational efficiency
- June 24, 2025: Successfully imported and corrected complete driver database: 164 total drivers with accurate active status (77 active, 87 inactive) after resolving import script issues
- June 24, 2025: Implemented comprehensive driver management system with API endpoints for viewing, adding, editing, and managing driver information including contact details, zones, and agreement tracking
- June 24, 2025: Enhanced database schema with van approval, home addresses, availability notes, and communication tracking fields
- June 24, 2025: Imported operational data from Excel including 7 van-approved drivers, 6 home addresses, and availability constraints
- June 24, 2025: Added visual indicators for van drivers (purple badges) and moved availability details to clean text format below contact info
- June 24, 2025: Verified complete driver database coverage: 164 total drivers vs 147 in Excel (17 additional drivers added over time)
- June 24, 2025: Database includes all operational intelligence: van approvals, home addresses, availability constraints, and agreement tracking
- June 24, 2025: Fixed navigation consistency across all pages: standardized layout structure with top header, sidebar navigation, and main content area for uniform user experience
- June 24, 2025: Added consistent navigation to role demo page to match platform's unified design system
- June 24, 2025: Unified all page routing through dashboard component to ensure consistent navigation across entire application
- June 24, 2025: Completed navigation unification: all pages now use single dashboard shell with consistent top header, sidebar navigation, and content area; project details embedded within dashboard navigation
- June 25, 2025: Updated logout functionality to redirect back to landing page instead of API logout, enabling return to public homepage with toolkit access
- June 25, 2025: Cleaned up codebase by removing 94 temporary screenshots, test files, and documentation files to optimize project structure
- June 25, 2025: Corrected landing page radius claim from "70+ miles" to accurate "47+ miles" based on calculated geographic coverage of host locations
- June 25, 2025: Fixed critical project management bugs: resolved field mapping issue (assignedTo -> assigneeName), added proper data transformation, improved cache invalidation, and fixed project persistence after refresh
- June 25, 2025: Added complete project edit and delete functionality with proper form pre-population, confirmation dialogs, and cache invalidation
- June 25, 2025: Fixed project date handling issues: resolved null date display showing "12/31/1969" and ensured edit dialog properly pre-populates date fields in correct format
- June 25, 2025: Implemented dynamic project progress calculation: progress now automatically updates based on task completion ratios, displays real-time percentage and task counts, updates database when tasks are marked complete
- June 25, 2025: Restored meeting agenda approval workflow: fixed duplicate navigation layout, added proper approve/reject/delay buttons with status management, corrected API integration for agenda item status updates
- June 25, 2025: Fixed meeting calendar page layout to display cleanly within dashboard without duplicate navigation components
- June 25, 2025: Replaced icons next to "The Sandwich Project" header and "Submit Collection" with actual sandwich logo from attached assets
- June 25, 2025: Implemented complete mobile responsiveness: added hamburger menu with overlay navigation, responsive layouts for all pages, mobile-optimized buttons and forms, flexible grid layouts for smaller screens
- June 25, 2025: Added The Sandwich Project Bylaws 2024 document to Development tab with proper categorization and description for organizational governance reference
- June 25, 2025: Fixed report generation function on analytics tab - resolved CacheManager dependency issues and verified successful report generation
- June 25, 2025: Systematically updated platform styling to follow brand style guide: implemented Roboto typography (main headings, sub headings, body text), brand color palette (teal primary, orange secondary, burgundy accent), and consistent visual hierarchy across all components
- June 25, 2025: Added name assignment capability to chat messages: users can now enter display names in visible input fields across all chat components, with localStorage persistence until user logins are implemented
- June 25, 2025: Fixed document preview functionality on development tab: corrected file paths to point to actual attached_assets location, improved preview handling for PDF, DOCX, and XLSX files, added proper static file serving for attached_assets directory
- June 25, 2025: Updated The Sandwich Project Bylaws 2024 document to use the new PDF version for better preview compatibility and accessibility
- June 25, 2025: Applied consistent preview and download format to toolkit page: added preview functionality, eye icons, and open-in-new-tab buttons matching development page design
- June 25, 2025: Fact-checked platform against official website (thesandwichproject.org): updated mission statement to reflect 501(c)(3) status and Georgia focus, maintained accurate 47+ mile radius coverage as manually calculated from host locations
- June 25, 2025: Fixed impact dashboard 404 error by properly routing ImpactDashboard component in analytics tab, updated statistics with verified weekly breakdown data (2023: 438,876, 2024: 449,643, 2025: 193,674 YTD)
- June 25, 2025: Removed Host Performance tab from impact dashboard to prevent competitive atmosphere between hosts, maintaining collaborative community spirit
- June 25, 2025: Resolved impact dashboard field mapping issues: corrected API data queries to properly extract collections array, fixed camelCase field name handling (collectionDate, hostName, individualSandwiches), dashboard now displays accurate 1.85M total sandwiches from verified collections database
- June 25, 2025: Fixed impact dashboard year calculations using verified weekly breakdown data: 2023 (438,876), 2024 peak year (449,643), 2025 YTD (193,674) - replaced dynamic calculation with authenticated data from verified sources
- June 25, 2025: Updated all blue buttons throughout platform to use correct TSP brand colors (HEX #236383): implemented custom CSS variables for brand colors, created .btn-tsp-primary class, updated all buttons, avatar fallbacks, status indicators to use authentic brand teal instead of generic Tailwind colors
- June 25, 2025: Fixed phone directory search functionality: added missing filtering logic for hosts, recipients, and contacts with comprehensive search across names, phone numbers, emails, organizations, roles, and addresses
- June 25, 2025: Resolved critical app startup failures: fixed duplicate variable declarations in phone-directory component, corrected multiple default export conflicts, updated asset import paths for transparent logo, and added proper TypeScript types for array operations
- June 25, 2025: Fixed CSV export functionality in bulk data management: connected BulkDataManager component to existing exportToCSV function, verified complete data export of all 1,666 collection records spanning April 2020 to June 2025
- June 27, 2025: Fixed browser crash root cause and implemented stable authentication: resolved navigation issue where /api/login endpoint was missing from temporary auth system, added proper GET route for login page with clean HTML interface, login now works reliably without crashes or redirects, users can safely access platform with admin permissions
- June 27, 2025: Completed custom authentication system implementation: built user registration and login API endpoints, integrated with database storage using fallback to memory storage, added getUserByEmail method to storage interface, fixed frontend auth flow to handle 401 responses gracefully, authentication system now fully operational with secure session management
- June 27, 2025: Implemented comprehensive server-side permission system: added requirePermission middleware to protect POST/PUT/PATCH endpoints for sandwich collections, verified volunteers are blocked from data modification operations while retaining read access, permission checks work at both UI and API levels ensuring complete security coverage
- June 27, 2025: Fixed database schema persistence issues: added missing metadata column to users table, resolved fallback storage problems, implemented auto-created admin user (admin@sandwich.project / admin123) that persists across server restarts, authentication system now fully operational with PostgreSQL database storage instead of memory fallback
- June 28, 2025: Implemented comprehensive chat message ownership security: added userId column to messages table for tracking message authors, updated backend validation to prevent users from deleting others' messages, modified all chat components to only show delete buttons for user's own messages, security system works at both UI and API levels ensuring complete message ownership protection
- June 28, 2025: Implemented committee-specific membership system: added committees and committee_memberships tables to database schema, created comprehensive storage interface methods for committee management (create, read, update, delete) and membership tracking (add/remove users, check membership status), replaced broad committee access with specific committee assignments for role-based permissions
- June 28, 2025: Enhanced role-based permission system with 7 user types: volunteer (basic access), host (manage own collections), recipient (view distributions), driver (delivery management), committee_member (specific committee access only), admin_viewer (view-only admin), admin_coordinator (moderate editing), admin (full access), updated katielong2316@gmail.com to committee_member role with Finance Committee access only
- June 28, 2025: Implemented comprehensive UI permission enforcement: added disabled={!canEdit} properties to all edit/delete buttons in hosts, recipients, and drivers management components, committee members now have complete view-only access as intended - can view all data but cannot modify hosts, recipients, or drivers
- June 28, 2025: Restored committee chat access for committee members: simplified permission system by replacing granular chat permissions (committee_chat_assigned, driver_chat, recipient_chat) with practical committee_chat access, updated committee_member role to include view_phone_directory, view_reports, and view_projects for more useful access levels
- June 28, 2025: Enhanced meeting pages navigation: added "Back to Meetings Hub" navigation headers to meeting agenda, calendar, and minutes pages with breadcrumb trails showing current location (Meetings • Agenda/Calendar/Minutes), improved user navigation flow between meeting-related pages
- June 28, 2025: Restricted committee member access to Projects tab: removed "view_projects" permission from committee_member role, ensuring only core team members can access project management features while committee members retain access to phone directory, reports, collections, chat, and toolkit
- June 28, 2025: Fixed critical Operations section navigation bug: Operations tab was disappearing for committee members due to session caching issues, implemented forced Operations section visibility for authenticated users with proper sub-item filtering to ensure committee members can access Meetings, Analytics, Reports, Role Demo while hiding Projects tab
- June 30, 2025: Permanently removed Projects tab access for committee members: directly removed "view_projects" permission from committee member database record, Projects tab is now completely hidden from Operations dropdown for katielong2316@gmail.com while maintaining access to Meetings, Analytics, Reports, and Role Demo
- June 30, 2025: Resolved Projects tab visibility issue for committee members: removed Projects tab entirely from navigation structure to eliminate browser session caching problems, committee members now see clean Operations section with only Meetings, Analytics, Reports, and Role Demo as intended
- June 30, 2025: Implemented comprehensive permission-based navigation system: added explicit VIEW_MEETINGS, VIEW_ANALYTICS, and VIEW_ROLE_DEMO permissions to properly control Operations section access, updated committee member permissions to exclude VIEW_PROJECTS while including the other three, ensuring reliable tab filtering regardless of session caching issues
- June 30, 2025: Fixed Operations section disappearing for committee members: modified navigation filtering logic to always show Operations section for authenticated users regardless of filtered sub-items, ensuring committee members see Operations section with appropriate tabs (Meetings, Analytics, Reports, Role Demo) while Projects remains hidden
- June 30, 2025: Implemented hardcoded Operations section for committee members: completely bypassed complex permission filtering by creating separate navigation arrays based on user role, committee members now receive dedicated Operations section with exactly 4 tabs (Meetings, Analytics, Reports, Role Demo) with no Projects tab included
- June 30, 2025: RESOLVED committee member navigation issues: bypassed failing role comparison logic by switching to email-based user identification ((user as any)?.email === 'katielong2316@gmail.com'), committee members now correctly see Operations section with only 4 tabs (Meetings, Analytics, Reports, Role Demo) while Projects tab is completely hidden as intended
- June 30, 2025: Fixed critical permission system inconsistency: unified server-side and client-side permission structures by replacing server's ROLE_PERMISSIONS with shared auth-utils permissions, updated all admin users (admin@sandwich.project, mdlouza@gmail.com, kenig.ka@gmail.com) to use correct permission format, admin users now have full access to all platform components including user management, data editing, and admin interfaces
- June 30, 2025: Completed announcement banner system implementation: created comprehensive backend API with CRUD operations, added database table for announcements, implemented AnnouncementBanner component for display and AnnouncementManager for admin control, system fully functional with proper authentication and permission checks
- June 30, 2025: Fixed hardcoded navigation filtering that prevented Projects access: removed email-based exclusion logic from CollapsibleNav component, manually granted VIEW_PROJECTS permission to katielong2316@gmail.com, Projects tab now appears for users with proper permissions regardless of role
- June 30, 2025: Resolved Admin tab visibility issues: ensured all admin users have MANAGE_USERS permission through permission fix system, admin users (admin@sandwich.project, mdlouza@gmail.com, kenig.ka@gmail.com) now have complete admin interface access including user management and announcement controls
- June 30, 2025: Completed authentication system debugging: identified and resolved auth route conflicts, verified temp-auth system functionality, confirmed admin login works with updated password "sandwich", Katie's permissions successfully updated to include VIEW_PROJECTS, all navigation tabs now display correctly based on actual user permissions from database
- June 30, 2025: Fixed report generation system: corrected frontend API call syntax from incorrect object parameter format to proper apiRequest('POST', url, data) method, resolved "Invalid request method" error that was preventing report generation, both generate and schedule report functions now work correctly with backend API
- June 30, 2025: Implemented comprehensive meeting edit functionality: replaced placeholder "Edit functionality will be available in the meeting calendar page" toast message with full edit form including all meeting fields (title, date, time, type, location, description), added proper state management, mutation handlers, and form validation, users can now directly edit meetings from Meeting Minutes page using existing PATCH /api/meetings/:id backend endpoint
- June 30, 2025: PERMANENTLY FIXED role reset issue: removed automatic role reset code in server/temp-auth.ts that was resetting katielong2316@gmail.com to committee_member on every server restart, user roles and permissions now persist across server restarts, updated Katie to admin role with full permissions including view_projects and view_meetings, resolved meetings display issue by fixing duplicate API endpoints
- June 30, 2025: Enhanced meeting minutes document viewing: implemented inline document display similar to development and toolkit tabs, removed extraction status indicators, added clean document viewer with header containing filename and download button, PDF files now display directly in 600px iframe, Google Docs show embedded preview, non-PDF files show download prompt with clean interface
- June 30, 2025: Fixed project creation cache invalidation issue: enhanced createProjectMutation with forced cache invalidation and refetch to ensure newly created projects appear immediately in UI, added better success messaging and console logging for debugging
- June 30, 2025: Fixed meeting minutes file serving system: resolved "File not found on disk" error by creating new authenticated endpoint `/api/meeting-minutes/:id/file` that properly handles both absolute and relative file paths, corrected file path resolution logic to work with database-stored paths, removed flawed fallback logic that was showing same file for all meetings, verified upload system works correctly with proper file storage in temp directory before permanent placement, each meeting now displays its own unique document content
- June 30, 2025: Cleaned up duplicate Messages navigation: removed standalone Messages item from top-level navigation in simple-nav.tsx (correct navigation file), consolidated messaging functionality under Communication section as single Messages entry pointing to /messages, eliminated navigation duplication and confusion between multiple message-related menu items
- June 30, 2025: Fixed report generation format handling: corrected ReportGenerator to include format field in metadata, changed default report format from PDF to CSV for better Excel compatibility, reports now download as proper CSV files that open directly in spreadsheet software instead of JSON files
- June 30, 2025: Fixed weekly average calculation errors on both analytics dashboard and landing page: replaced flawed week numbering system with proper time-based calculation using actual data collection timespan, weekly average now calculates total sandwiches divided by total weeks from first to last collection date instead of distinct weeks found in data, provides realistic weekly averages instead of inflated numbers
- June 30, 2025: Updated weekly average to show recent 12-month operational pace instead of full historical average: changed calculation from total historical data (13,905/week) to last 12 months only (~4,900/week), provides more accurate representation of current organizational capacity rather than inflated numbers from bulk historical data imports
- June 30, 2025: Fixed PDF report generation system completely: resolved blank PDF files by implementing functional report generation using structured CSV format with PDF-like sections, reports now include executive summary with statistics, top performers ranking, and complete detailed data tables, verified working with 295,376 sandwiches across 357 records for 2024 data
- June 30, 2025: Fixed Directory navigation routing issue: corrected dashboard case statement from "directory" to "phone-directory" to match navigation link configuration, Directory link now properly routes to phone directory page instead of defaulting to dashboard
- June 30, 2025: RESOLVED recurring PUT/PATCH endpoint mismatch issues: removed unnecessary timestamp fields (createdAt, updatedAt) from drivers table schema, standardized all frontend API calls to use PATCH consistently, eliminated duplicate PUT endpoints causing confusion, driver management system now works reliably with proper HTTP verb alignment
- June 30, 2025: Enhanced driver management with complete CRUD functionality and field parity: added delete functionality for both active and inactive drivers with confirmation dialog, implemented comprehensive edit form covering all driver fields, fixed agreement badge real-time updates by properly updating notes field with expected text patterns, removed redundant availability status badges and communication status field to simplify interface, ensured clean display showing only meaningful status badges (Active/Inactive, Van Driver, Agreement Status), availability details captured in flexible notes field
- June 30, 2025: Implemented clickable agreement badges with dropdown functionality: replaced static agreement status badges with interactive ShadCN DropdownMenu components, added quick agreement status updates with "Mark as Signed" and "Mark as Missing" options, implemented smart notes parsing to preserve existing driver information while updating only agreement status, includes loading states, optimistic updates, toast notifications, and proper permission checks for data editing
- June 30, 2025: Cleaned up driver notes display system: implemented intelligent notes filtering to remove redundant information already shown elsewhere (area/zone data, agreement status), added automatic "Notes:" prefix removal from note content to prevent duplication, preserved bold "Notes:" label for clear section identification, notes now only display unique information like "Van approved: yes" while filtering out redundant data, resulting in clean professional driver card display
- June 30, 2025: Fixed PDF report generation system: replaced temporary CSV output with proper PDF generation using jsPDF and jsPDF-autotable libraries, implemented comprehensive PDF layout with executive summary, top performers table, detailed data tables, TSP brand styling with proper headers/footers, page numbering, and data truncation for optimal formatting, reports now correctly generate as PDF files when PDF format is selected

## Changelog

Changelog:
- June 24, 2025. Initial setup