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
- June 25, 2025: Replaced all platform logos with official Sandwich Project branding: updated landing page, dashboard header, and all placeholder logos throughout analytics, performance, and reporting pages with professional orange TSP badges
- June 25, 2025: Fixed logo display issues: replaced broken image references with consistent orange TSP badges throughout platform for professional branded appearance

## Changelog

Changelog:
- June 24, 2025. Initial setup