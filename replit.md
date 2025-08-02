# Replit.md

## Overview
This is a full-stack sandwich collection management application designed for The Sandwich Project, a nonprofit organization. It facilitates tracking sandwich donations and distributions, offering comprehensive data management, analytics, and operational tools for volunteers, hosts, recipients, and collection activities. The vision is to streamline operations, enhance data visibility, and support the organization's growth and impact in addressing food insecurity.

## Recent Critical Fixes (August 2025)
- **CRITICAL: Responsive Button Layout Issue**: User reports persistent text cutoff on dashboard collection buttons at smaller screen sizes. Multiple attempts to fix via CSS changes have not resolved due to browser caching. Requires hard browser refresh to see updates.
- **Email Read Status Bug**: Fixed critical issue where senders viewing sent messages incorrectly marked emails as read for recipients. Now only recipients can change read status.
- **UI Component Transparency**: Resolved widespread black element issues in Select, Input, Button, Checkbox, and Textarea components by removing problematic CSS variable dependencies.
- **Message Composer**: Fixed user dropdown population in message composer after UI component fixes.
- **Collapsible Navigation**: Implemented collapsible sidebar that shrinks to icon-only view while remaining visually present and easily expandable. Includes smooth transitions and tooltip support for collapsed state.

## User Preferences
Preferred communication style: Simple, everyday language.
UI Design: Button labels and interface text must be extremely clear about their function - avoid ambiguous labels like "Submit" in favor of specific action descriptions like "Enter New Data".

## System Architecture

### Core Technologies
- **Frontend**: React 18 (TypeScript), Vite, TanStack Query, Tailwind CSS (with shadcn/ui), React Hook Form (with Zod).
- **Backend**: Express.js (TypeScript), Drizzle ORM, PostgreSQL (Neon serverless), Session-based authentication (connect-pg-simple), Replit Auth.

### Key Features
- **Data Models**: Manages Sandwich Collections, Hosts, Recipients, Projects, Users (role-based), and Audit Logs.
- **Authentication & Authorization**: Replit-based auth with custom role management (admin, coordinator, volunteer, viewer), session management, and audit logging.
- **UI/UX**: Consistent brand styling using TSP color palette (teal primary, orange secondary, burgundy accent), Roboto typography, clear button labels, responsive layouts with mobile optimizations (e.g., hamburger menu, compact forms), and professional visual hierarchy (e.g., card-based dashboards, clear sectioning). Form elements include enhanced styling for inputs, selects, and buttons with focus states and subtle hover effects.
- **Performance**: Query optimization, LRU caching, pagination, memoization, and database connection pooling.
- **Messaging & Notifications**:
    - **Email System**: Gmail-style inbox with folders, composition, threaded conversations, bulk actions, and SendGrid integration for notifications.
    - **Real-time Chat**: Socket.IO-based chat with persistent storage (PostgreSQL), distinct channels (General, Core Team, Committee, Host, Driver, Recipient), real-time message broadcasting, edit/delete functionality, and unread count notifications.
    - **Notifications**: Real-time bell notifications in dashboard header, email alerts for new suggestions, and congratulations for project/task completion.
- **Operational Tools**:
    - **Project Management**: Project creation, editing, deletion, multi-user assignment, task tracking with completion kudos system, and dynamic progress calculation.
    - **Meeting Management**: Scheduling, agenda tracking, minutes management with file attachments, and 12-hour time formatting.
    - **Directory**: Comprehensive management for Hosts, Recipients, and Drivers with search, filtering, and detailed profiles.
    - **Work Logs**: Track work hours with administrative oversight and user-specific visibility.
    - **Suggestions Portal**: Two-way communication platform for user feedback with workflow management (status tracking, admin responses) and email notifications.
    - **Analytics & Reporting**: Dashboard overview with key metrics (sandwiches delivered, peak performance), user activity tracking, and PDF/CSV report generation.
    - **Toolkit**: Organized repository of documents (safety guidelines, labels, guides) with modal preview and download functionality.
- **Data Integrity**: Automated audit logging, Zod validation for data input, and data correction systems for suspicious entries.

## External Dependencies
- **Database**: `@neondatabase/serverless`, `drizzle-orm`
- **Web Framework**: `express`
- **UI/Styling**: `@radix-ui`, `tailwindcss`, `lucide-react`, `class-variance-authority`, `shadcn/ui`
- **Data Fetching/State**: `@tanstack/react-query`, `react-hook-form`, `zod`
- **Email**: `@sendgrid/mail`
- **Real-time Communication**: `socket.io`, `socket.io-client`
- **PDF Generation**: `pdfkit` (server-side)
- **Authentication**: `connect-pg-simple` (for session storage)
- **File Uploads**: `multer`
- **Google Integration**: Google Sheets API (for data viewing, with fallback to static files)