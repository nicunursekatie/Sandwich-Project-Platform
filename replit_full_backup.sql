--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agenda_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_items (
    id integer NOT NULL,
    submitted_by text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL,
    meeting_id integer DEFAULT 1 NOT NULL
);


--
-- Name: agenda_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agenda_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agenda_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agenda_items_id_seq OWNED BY public.agenda_items.id;


--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type character varying DEFAULT 'general'::character varying NOT NULL,
    priority character varying DEFAULT 'medium'::character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    link text,
    link_text text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: committee_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committee_memberships (
    id integer NOT NULL,
    committee_id integer,
    user_id character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    role character varying(100) DEFAULT 'member'::character varying,
    permissions text[],
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: committee_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.committee_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: committee_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.committee_memberships_id_seq OWNED BY public.committee_memberships.id;


--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: committees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.committees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: committees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.committees_id_seq OWNED BY public.committees.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    role text DEFAULT 'volunteer'::text,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    organization text,
    address text
);


--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_participants (
    conversation_id integer NOT NULL,
    user_id text NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_read_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    type character varying(20) NOT NULL,
    name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversations_type_check CHECK (((type)::text = ANY ((ARRAY['direct'::character varying, 'group'::character varying, 'channel'::character varying])::text[])))
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: drive_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drive_links (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    url text NOT NULL,
    icon text NOT NULL,
    icon_color text NOT NULL
);


--
-- Name: drive_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drive_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drive_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drive_links_id_seq OWNED BY public.drive_links.id;


--
-- Name: driver_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_agreements (
    id integer NOT NULL,
    submitted_by text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    license_number text NOT NULL,
    vehicle_info text NOT NULL,
    emergency_contact text NOT NULL,
    emergency_phone text NOT NULL,
    agreement_accepted boolean DEFAULT false NOT NULL,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: driver_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.driver_agreements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: driver_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.driver_agreements_id_seq OWNED BY public.driver_agreements.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    vehicle_type text,
    license_number text,
    availability text DEFAULT 'available'::text,
    zone text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    van_approved boolean DEFAULT false,
    home_address text,
    availability_notes text,
    email_agreement_sent boolean DEFAULT false,
    voicemail_left boolean DEFAULT false,
    inactive_reason text,
    host_id integer,
    route_description text,
    host_location text
);


--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: group_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_memberships (
    id integer NOT NULL,
    user_id character varying(255) NOT NULL,
    group_id integer NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    is_active boolean DEFAULT true,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_memberships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_memberships_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_memberships_id_seq OWNED BY public.group_memberships.id;


--
-- Name: host_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.host_contacts (
    id integer NOT NULL,
    host_id integer NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    phone text NOT NULL,
    email text,
    is_primary boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: host_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.host_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: host_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.host_contacts_id_seq OWNED BY public.host_contacts.id;


--
-- Name: hosted_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hosted_files (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    file_name text NOT NULL,
    original_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    uploaded_by text NOT NULL,
    is_public boolean DEFAULT true NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: hosted_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hosted_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hosted_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hosted_files_id_seq OWNED BY public.hosted_files.id;


--
-- Name: hosts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hosts (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    address text,
    CONSTRAINT hosts_name_not_empty CHECK (((name IS NOT NULL) AND (TRIM(BOTH FROM name) <> ''::text)))
);


--
-- Name: hosts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hosts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: hosts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hosts_id_seq OWNED BY public.hosts.id;


--
-- Name: meeting_minutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_minutes (
    id integer NOT NULL,
    title text NOT NULL,
    date text NOT NULL,
    summary text NOT NULL,
    color text DEFAULT 'blue'::text NOT NULL,
    file_name text,
    file_path text,
    file_type text,
    mime_type text,
    committee_type text
);


--
-- Name: meeting_minutes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meeting_minutes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meeting_minutes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meeting_minutes_id_seq OWNED BY public.meeting_minutes.id;


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id integer NOT NULL,
    title text NOT NULL,
    date text NOT NULL,
    "time" text NOT NULL,
    final_agenda text,
    status text DEFAULT 'planning'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type text NOT NULL,
    location text,
    description text
);


--
-- Name: meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meetings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meetings_id_seq OWNED BY public.meetings.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    conversation_id integer,
    user_id text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sender text,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    type character varying NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    related_type character varying,
    related_id integer,
    celebration_data jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: project_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_assignments (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: project_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_assignments_id_seq OWNED BY public.project_assignments.id;


--
-- Name: project_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_comments (
    id integer NOT NULL,
    content text NOT NULL,
    author_name text NOT NULL,
    comment_type character varying(50) DEFAULT 'general'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    project_id integer NOT NULL
);


--
-- Name: project_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_comments_id_seq OWNED BY public.project_comments.id;


--
-- Name: project_congratulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_congratulations (
    id integer NOT NULL,
    project_id integer NOT NULL,
    user_id text NOT NULL,
    user_name text NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: project_congratulations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_congratulations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_congratulations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_congratulations_id_seq OWNED BY public.project_congratulations.id;


--
-- Name: project_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_documents (
    id integer NOT NULL,
    project_id integer NOT NULL,
    file_name text NOT NULL,
    original_name text NOT NULL,
    file_size integer NOT NULL,
    mime_type text NOT NULL,
    uploaded_by text NOT NULL,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: project_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_documents_id_seq OWNED BY public.project_documents.id;


--
-- Name: project_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    priority character varying(50) DEFAULT 'medium'::character varying NOT NULL,
    assignee_name text,
    due_date text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    order_num integer DEFAULT 0 NOT NULL,
    project_id integer NOT NULL,
    completed_at timestamp without time zone,
    "order" integer DEFAULT 0 NOT NULL,
    attachments text,
    assignee_id text,
    assignee_ids text[],
    assignee_names text[],
    completed_by text,
    completed_by_name text
);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_tasks_id_seq OWNED BY public.project_tasks.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status text NOT NULL,
    assignee_id integer,
    assignee_name text,
    color text DEFAULT 'blue'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    due_date text,
    start_date text,
    completion_date text,
    progress_percentage integer DEFAULT 0 NOT NULL,
    notes text,
    tags text,
    estimated_hours integer,
    actual_hours integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    requirements text,
    deliverables text,
    resources text,
    blockers text,
    estimatedhours integer,
    actualhours integer,
    startdate date,
    enddate date,
    budget numeric(10,2),
    risklevel character varying(50),
    stakeholders text,
    milestones text,
    assignee_ids jsonb DEFAULT '[]'::jsonb,
    assignee_names text
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipients (
    id integer NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    email text,
    address text,
    preferences text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    contact_name text,
    weekly_estimate integer
);


--
-- Name: recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipients_id_seq OWNED BY public.recipients.id;


--
-- Name: sandwich_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sandwich_collections (
    id integer NOT NULL,
    collection_date text NOT NULL,
    host_name text NOT NULL,
    individual_sandwiches integer NOT NULL,
    group_collections text NOT NULL,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: sandwich_collections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sandwich_collections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sandwich_collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sandwich_collections_id_seq OWNED BY public.sandwich_collections.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: suggestion_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestion_responses (
    id integer NOT NULL,
    suggestion_id integer NOT NULL,
    message text NOT NULL,
    is_admin_response boolean DEFAULT false NOT NULL,
    responded_by character varying(255) NOT NULL,
    respondent_name text,
    is_internal boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: suggestion_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suggestion_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suggestion_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suggestion_responses_id_seq OWNED BY public.suggestion_responses.id;


--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suggestions (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'submitted'::text NOT NULL,
    submitted_by character varying(255) NOT NULL,
    submitter_email character varying(255),
    submitter_name text,
    is_anonymous boolean DEFAULT false NOT NULL,
    upvotes integer DEFAULT 0 NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    implementation_notes text,
    estimated_effort text,
    assigned_to character varying(255),
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suggestions_id_seq OWNED BY public.suggestions.id;


--
-- Name: task_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_completions (
    id integer NOT NULL,
    task_id integer NOT NULL,
    user_id text NOT NULL,
    user_name text NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: task_completions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.task_completions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: task_completions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.task_completions_id_seq OWNED BY public.task_completions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    role character varying DEFAULT 'volunteer'::character varying,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    metadata jsonb,
    display_name character varying,
    password character varying(255),
    last_login_at timestamp without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weekly_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_reports (
    id integer NOT NULL,
    week_ending text NOT NULL,
    sandwich_count integer NOT NULL,
    notes text,
    submitted_by text NOT NULL,
    submitted_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.weekly_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.weekly_reports_id_seq OWNED BY public.weekly_reports.id;


--
-- Name: work_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_logs (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    description text NOT NULL,
    hours integer DEFAULT 0 NOT NULL,
    minutes integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'pending'::character varying,
    approved_by character varying,
    approved_at timestamp with time zone,
    visibility character varying(20) DEFAULT 'private'::character varying,
    shared_with jsonb DEFAULT '[]'::jsonb,
    department character varying(50),
    team_id character varying(50)
);


--
-- Name: work_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_logs_id_seq OWNED BY public.work_logs.id;


--
-- Name: agenda_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_items ALTER COLUMN id SET DEFAULT nextval('public.agenda_items_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: committee_memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_memberships ALTER COLUMN id SET DEFAULT nextval('public.committee_memberships_id_seq'::regclass);


--
-- Name: committees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees ALTER COLUMN id SET DEFAULT nextval('public.committees_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: drive_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drive_links ALTER COLUMN id SET DEFAULT nextval('public.drive_links_id_seq'::regclass);


--
-- Name: driver_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_agreements ALTER COLUMN id SET DEFAULT nextval('public.driver_agreements_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: group_memberships id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships ALTER COLUMN id SET DEFAULT nextval('public.group_memberships_id_seq'::regclass);


--
-- Name: host_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_contacts ALTER COLUMN id SET DEFAULT nextval('public.host_contacts_id_seq'::regclass);


--
-- Name: hosted_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hosted_files ALTER COLUMN id SET DEFAULT nextval('public.hosted_files_id_seq'::regclass);


--
-- Name: hosts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hosts ALTER COLUMN id SET DEFAULT nextval('public.hosts_id_seq'::regclass);


--
-- Name: meeting_minutes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes ALTER COLUMN id SET DEFAULT nextval('public.meeting_minutes_id_seq'::regclass);


--
-- Name: meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings ALTER COLUMN id SET DEFAULT nextval('public.meetings_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: project_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assignments ALTER COLUMN id SET DEFAULT nextval('public.project_assignments_id_seq'::regclass);


--
-- Name: project_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_comments ALTER COLUMN id SET DEFAULT nextval('public.project_comments_id_seq'::regclass);


--
-- Name: project_congratulations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_congratulations ALTER COLUMN id SET DEFAULT nextval('public.project_congratulations_id_seq'::regclass);


--
-- Name: project_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_documents ALTER COLUMN id SET DEFAULT nextval('public.project_documents_id_seq'::regclass);


--
-- Name: project_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks ALTER COLUMN id SET DEFAULT nextval('public.project_tasks_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: recipients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipients ALTER COLUMN id SET DEFAULT nextval('public.recipients_id_seq'::regclass);


--
-- Name: sandwich_collections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sandwich_collections ALTER COLUMN id SET DEFAULT nextval('public.sandwich_collections_id_seq'::regclass);


--
-- Name: suggestion_responses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_responses ALTER COLUMN id SET DEFAULT nextval('public.suggestion_responses_id_seq'::regclass);


--
-- Name: suggestions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions ALTER COLUMN id SET DEFAULT nextval('public.suggestions_id_seq'::regclass);


--
-- Name: task_completions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completions ALTER COLUMN id SET DEFAULT nextval('public.task_completions_id_seq'::regclass);


--
-- Name: weekly_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports ALTER COLUMN id SET DEFAULT nextval('public.weekly_reports_id_seq'::regclass);


--
-- Name: work_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_logs ALTER COLUMN id SET DEFAULT nextval('public.work_logs_id_seq'::regclass);


--
-- Data for Name: agenda_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agenda_items (id, submitted_by, title, description, status, submitted_at, meeting_id) FROM stdin;
3	Alex Rodriguez	Update Volunteer Training Materials	Review and update the current volunteer training materials to include new safety protocols and efficiency improvements.	pending	2025-06-09 01:40:41.440776	1
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, message, type, priority, start_date, end_date, is_active, link, link_text, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: committee_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.committee_memberships (id, committee_id, user_id, created_at, role, permissions, joined_at, is_active) FROM stdin;
1	1	user_1751071509329_mrkw2z95z	2025-07-07 02:14:07.338231	member	\N	2025-07-07 02:14:07.338231	t
\.


--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.committees (id, name, description, created_at, is_active, updated_at) FROM stdin;
1	Finance	Financial oversight and budgeting	2025-07-07 02:14:06.709356	t	2025-07-07 02:14:06.709356
2	Operations	Day-to-day operations management	2025-07-07 02:14:06.800092	t	2025-07-07 02:14:06.800092
3	Outreach	Community outreach and partnerships	2025-07-07 02:14:06.968867	t	2025-07-07 02:14:06.968867
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contacts (id, name, phone, email, role, notes, is_active, created_at, updated_at, organization, address) FROM stdin;
1	John Smith	555-0123	john@example.com	volunteer	\N	t	2025-06-25 01:49:22.98881	2025-06-25 01:49:22.98881	\N	\N
2	Sarah Johnson	555-0456	sarah@example.com	coordinator	\N	t	2025-06-25 01:49:22.98881	2025-06-25 01:49:22.98881	\N	\N
3	Mike Wilson	555-0789	mike@example.com	volunteer	\N	t	2025-06-25 01:49:22.98881	2025-06-25 01:49:22.98881	\N	\N
4	Lisa Brown	555-0321	lisa@example.com	driver	\N	t	2025-06-25 01:49:22.98881	2025-06-25 01:49:22.98881	\N	\N
\.


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversation_participants (conversation_id, user_id, joined_at, last_read_at) FROM stdin;
1	user_1751071509329_mrkw2z95z	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
1	user_1751072243271_fc8jaxl6u	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
1	user_1751493923615_nbcyq3am7	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
1	user_1751492211973_0pi1jdl3p	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
2	user_1751071509329_mrkw2z95z	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
2	user_1751072243271_fc8jaxl6u	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
7	user_1751071509329_mrkw2z95z	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
7	user_1751493923615_nbcyq3am7	2025-07-06 17:04:35.043937	2025-07-06 17:04:35.043937
10	user_1751071509329_mrkw2z95z	2025-07-07 00:15:58.718781	2025-07-07 00:15:58.718781
10	user_1751072243271_fc8jaxl6u	2025-07-07 00:15:58.718781	2025-07-07 00:15:58.718781
10	admin_1751065261945	2025-07-07 00:15:58.718781	2025-07-07 00:15:58.718781
11	user_1751072243271_fc8jaxl6u	2025-07-07 00:15:58.718781	2025-07-07 00:15:58.718781
69	user_1751071509329_mrkw2z95z	2025-07-07 02:18:04.751614	2025-07-07 02:18:04.751614
69	user_1751493923615_nbcyq3am7	2025-07-07 02:18:04.751614	2025-07-07 02:18:04.751614
11	user_1751493923615_nbcyq3am7	2025-07-07 02:48:04.964028	2025-07-07 02:48:04.964028
10	user_1751493923615_nbcyq3am7	2025-07-07 03:12:29.247404	2025-07-07 03:12:29.247404
87	admin_1751065261945	2025-07-08 23:04:06.008629	2025-07-08 23:04:06.008629
87	user_1751493923615_nbcyq3am7	2025-07-08 23:04:06.008629	2025-07-08 23:04:06.008629
88	admin_1751065261945	2025-07-08 23:13:02.747438	2025-07-08 23:13:02.747438
88	user_1751072243271_fc8jaxl6u	2025-07-08 23:13:02.747438	2025-07-08 23:13:02.747438
100	user_1751071509329_mrkw2z95z	2025-07-09 01:41:20.617182	2025-07-09 01:41:20.617182
100	user_1751920534988_2cgbrae86	2025-07-09 01:41:20.617182	2025-07-09 01:41:20.617182
101	user_1751071509329_mrkw2z95z	2025-07-09 01:41:22.232232	2025-07-09 01:41:22.232232
101	user_1751072243271_fc8jaxl6u	2025-07-09 01:41:22.232232	2025-07-09 01:41:22.232232
102	user_1751071509329_mrkw2z95z	2025-07-09 01:41:27.551087	2025-07-09 01:41:27.551087
102	user_1751492211973_0pi1jdl3p	2025-07-09 01:41:27.551087	2025-07-09 01:41:27.551087
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, type, name, created_at) FROM stdin;
1	channel	General Chat	2025-07-06 17:04:29.074747
2	channel	Core Team	2025-07-06 17:04:29.074747
3	channel	Marketing Committee	2025-07-06 17:04:29.074747
4	channel	Host Chat	2025-07-06 17:04:29.074747
5	channel	Driver Chat	2025-07-06 17:04:29.074747
6	channel	Recipient Chat	2025-07-06 17:04:29.074747
7	direct	\N	2025-07-06 17:04:31.961639
10	group	Giving Circle	2025-07-06 17:04:32.715077
11	group	Allstate Grant	2025-07-06 17:04:32.715077
87	direct	admin_1751065261945_user_1751493923615_nbcyq3am7	2025-07-08 23:04:05.913601
88	direct	admin_1751065261945_user_1751072243271_fc8jaxl6u	2025-07-08 23:13:02.672843
99	channel	Marketing Committee	2025-07-09 00:27:03.717489
100	direct	user_1751071509329_mrkw2z95z_user_1751920534988_2cgbrae86	2025-07-09 01:41:20.529424
101	direct	user_1751071509329_mrkw2z95z_user_1751072243271_fc8jaxl6u	2025-07-09 01:41:22.158073
102	direct	user_1751071509329_mrkw2z95z_user_1751492211973_0pi1jdl3p	2025-07-09 01:41:27.477549
69	direct	user_1751071509329_mrkw2z95z_user_1751493923615_nbcyq3am7	2025-07-07 02:18:04.666899
\.


--
-- Data for Name: drive_links; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drive_links (id, title, description, url, icon, icon_color) FROM stdin;
\.


--
-- Data for Name: driver_agreements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.driver_agreements (id, submitted_by, email, phone, license_number, vehicle_info, emergency_contact, emergency_phone, agreement_accepted, submitted_at) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.drivers (id, name, phone, email, address, notes, is_active, vehicle_type, license_number, availability, zone, created_at, updated_at, van_approved, home_address, availability_notes, email_agreement_sent, voicemail_left, inactive_reason, host_id, route_description, host_location) FROM stdin;
119	Brandon Graby	(859) 312-1743	brandon.j.graby@gmail.com	\N	\N	f	\N	\N	available	\N	2025-06-24 01:26:00.217642	2025-06-24 01:26:00.217646	f	\N	\N	f	f	\N	\N	\N	\N
115	Veronia (and daughter) Kelly-Cash	(864) 325-5979	vkellycash@comcast.net	\N	Area: Upper Westside. Moores Mill/Howell Mill/75.	f	\N	\N	available	Upper Westside. Moores Mill/Howell Mill/75.	2025-06-24 01:25:59.658195	2025-06-24 01:25:59.658201	f	\N	\N	f	f	\N	\N	Upper Westside. Moores Mill/Howell Mill/75.	\N
116	Melody MITCHELL	(901) 240-9703	getyou2sold@gmail.com	\N	Area: Grant Park near the Zoo	f	\N	\N	available	Grant Park near the Zoo	2025-06-24 01:25:59.798203	2025-06-24 01:25:59.798208	f	\N	\N	f	f	\N	\N	Grant Park near the Zoo	\N
117	Sarah Dolphino	\N	sarahdolphino@gmail.com	\N	Area: alpharetta - only here for summer	f	\N	\N	available	alpharetta - only here for summer	2025-06-24 01:25:59.938112	2025-06-24 01:25:59.938116	f	\N	\N	f	f	\N	\N	alpharetta - only here for summer	\N
118	Emily Nelson	(801) 870-7901	emily.7n@gmail.com	\N	Area: Cumming, close to West Forsyth High School	f	\N	\N	available	Cumming, close to West Forsyth High School	2025-06-24 01:26:00.077784	2025-06-24 01:26:00.077788	f	\N	\N	f	f	\N	\N	Cumming, close to West Forsyth High School	\N
120	Gina Matthews	(404) 550-8613	flybyg@comcast.net	\N	Area: Chamblee	f	\N	\N	available	Chamblee	2025-06-24 01:26:00.357461	2025-06-24 01:26:00.357466	f	\N	\N	f	f	\N	\N	Chamblee	\N
121	John Paine	(470) 701-3326	jpaine1231@gmail.com	\N	Area: Sandy Springs; Notes: Not 18 but mom can drive him	f	\N	\N	available	Sandy Springs	2025-06-24 01:26:00.497163	2025-06-24 01:26:00.497168	f	\N	\N	f	f	\N	\N	Sandy Springs	\N
122	Christian Rivers	(706) 313-0301	c.rivers1404@gmail.com	\N	Area: Dunwoody, near Perimeter Mall	f	\N	\N	available	Dunwoody, near Perimeter Mall	2025-06-24 01:26:00.63742	2025-06-24 01:26:00.637426	f	\N	\N	f	f	\N	\N	Dunwoody, near Perimeter Mall	\N
123	Ashley Roseberry	404) 396-5333	\N	\N	Area: Cumming	f	\N	\N	available	Cumming	2025-06-24 01:26:00.777229	2025-06-24 01:26:00.777234	f	\N	\N	f	f	\N	\N	Cumming	\N
124	Serena Terry	(404) 824-9419	serena.terry@gmail.com	\N	Area: Smyrna; Notes: reached out to us from Home Depot event	f	\N	\N	available	Smyrna	2025-06-24 01:26:00.981358	2025-06-24 01:26:00.981364	f	\N	\N	f	f	\N	\N	Smyrna	\N
125	Kathryn "Katie" Conroy	(678) 592-6212	katieconroy929@gmail.com	\N	Area: East Cobb - Marietta over by Lassiter High School - willing to drive if not too far	f	\N	\N	available	East Cobb - Marietta over by Lassiter High School - willing to drive if not too far	2025-06-24 01:26:01.121005	2025-06-24 01:26:01.121009	f	\N	\N	f	f	\N	\N	East Cobb - Marietta over by Lassiter High School - willing to drive if not too far	\N
258	Susanna + Richard Warren	205-577-0435	swarren0435@gmail.com	\N	Area: SS Agreement: signed	t	\N	\N	available	SS	2025-06-24 01:44:07.628238	2025-06-24 01:44:07.628243	f	305 Cannady Ct, Atlanta GA 30350	Wednesday	t	f	\N	58	SS	\N
181	Ellen Tighe	404.395.4998	ellenmtighe@gmail.com	\N	Agreement: no	f	\N	\N	available	\N	2025-06-24 01:26:34.913455	2025-06-24 01:26:34.913458	f	\N	\N	f	f	\N	\N	\N	\N
178	Victoria Rosetti	770-853-6546	\N	\N	Area: (Laura/Jordan) Brookhaven; Agreement: no	f	\N	\N	available	(Laura/Jordan) Brookhaven	2025-06-24 01:26:34.502215	2025-06-24 01:26:34.502219	f	\N	\N	f	f	\N	\N	(Laura/Jordan) Brookhaven	\N
129	Arlyn Bisogno	404-960-1300	arlynbb@yahoo.com	\N	Area: Buckhead/ Brookhaven	f	\N	\N	available	Buckhead/ Brookhaven	2025-06-24 01:26:01.680181	2025-06-24 01:26:01.680186	f	\N	\N	f	f	\N	\N	Buckhead/ Brookhaven	\N
127	Caitlin Fitch	(770) 335-6748	fitch.caitlinmarie@gmail.com	\N	\N	f	\N	\N	available	\N	2025-06-24 01:26:01.400887	2025-06-24 01:26:01.400891	f	\N	\N	f	f	\N	\N	\N	\N
154	Mary Mitchell	678-523-1783	mary.mitchell7890@gmail.com	\N	Agreement sent; hasn't driven in years	t	\N	\N	available	East Cobb	2025-06-24 01:26:05.366193	2025-06-24 01:26:05.366197	f	\N	\N	f	f	\N	\N	East Cobb	\N
130	Farah Angersola	(312) 500-1944	angersolaf@gmail.com	\N	\N	f	\N	\N	available	\N	2025-06-24 01:26:01.819796	2025-06-24 01:26:01.819801	f	\N	\N	f	f	\N	\N	\N	\N
140	Tonya Brown	\N	tanya.e.brown@att.net	\N	Agreement: no	f	\N	\N	available	\N	2025-06-24 01:26:03.362155	2025-06-24 01:26:03.36216	f	\N	\N	f	f	\N	\N	\N	\N
147	Nedia Hicks	\N	nediahicks@aol.com	\N	Agreement: sent	f	\N	\N	available	\N	2025-06-24 01:26:04.388789	2025-06-24 01:26:04.388793	f	\N	\N	f	f	\N	\N	\N	\N
149	Deidre Joe	\N	deidrejoe@gmail.com	\N	Agreement: no	f	\N	\N	available	\N	2025-06-24 01:26:04.667778	2025-06-24 01:26:04.667783	f	\N	\N	f	f	\N	\N	\N	\N
142	Elyn Daza	404-925-0501	elyndaza@gmail.com	\N	Agreement: yes	f	\N	\N	available	\N	2025-06-24 01:26:03.690603	2025-06-24 01:26:03.690607	f	\N	\N	f	f	\N	\N	\N	\N
128	Bettina Smalley	\N	bettina_smalley@yahoo.com	\N	Area: Peachtree Corners	f	\N	\N	available	Peachtree Corners	2025-06-24 01:26:01.540598	2025-06-24 01:26:01.540602	f	\N	\N	f	f	\N	\N	Peachtree Corners	\N
135	Emily Rosher	706-987-7432	emilybrosher@gmail.com	\N	Area: Brookhaven	f	\N	\N	available	Brookhaven	2025-06-24 01:26:02.661005	2025-06-24 01:26:02.66101	f	\N	\N	f	f	\N	\N	Brookhaven	\N
136	Deborah Mastin	(678) 982-3100	debmastin@gmail.com	\N	Area: possibly east cobb	f	\N	\N	available	possibly east cobb	2025-06-24 01:26:02.800878	2025-06-24 01:26:02.800883	f	\N	\N	f	f	\N	\N	possibly east cobb	\N
145	Lisa Gordon	770.490.1859	lisarose1111@gmail.com	\N	Area: dunwoody; Agreement: no	f	\N	\N	available	dunwoody	2025-06-24 01:26:04.109758	2025-06-24 01:26:04.109763	f	\N	\N	f	f	\N	\N	dunwoody	\N
150	Pamela Kinsley	404-934-4115	ugapamela@aol.com	\N	Area: Marist math teacher; Agreement: no	f	\N	\N	available	Marist math teacher	2025-06-24 01:26:04.807429	2025-06-24 01:26:04.807433	f	\N	\N	f	f	\N	\N	Marist math teacher	\N
227	Andrew  McElroy	678-736-0258	\N	\N	Area: Duluth	f	\N	\N	available	Duluth	2025-06-24 01:44:05.213511	2025-06-24 01:44:05.213515	f	\N	\N	f	f	\N	\N	Duluth	\N
231	Jan  Jay	6785925091	janjayrd@yahoo.com	\N	Area: Dunwoody; Notes: Happy to help, just not available on Wed Agreement: signed	t	\N	\N	available	Dunwoody	2025-06-24 01:44:05.507596	2025-06-24 01:44:05.5076	f	\N	Happy to help, just not on Wednesday	t	f	\N	56	Dunwoody	\N
241	Kim  Ross	502-377-5878	ross.kimberly.a@gmail.com	\N	Area: Sandy Springs to everywhere	f	\N	\N	available	Sandy Springs to everywhere	2025-06-24 01:44:06.197166	2025-06-24 01:44:06.197171	f	\N	\N	f	f	\N	\N	Sandy Springs to everywhere	\N
176	Amy Price	770-598-2135	amygp@comcast.net	\N	Area: East Cobb; Agreement: yes	t	\N	\N	available	East Cobb	2025-06-24 01:26:34.227949	2025-06-24 01:26:34.227953	f	\N	\N	f	f	\N	57	East Cobb	\N
184	Laura Warren	770-377-8822	genewarren@mindspring.com	\N	Agreement: yes	t	\N	\N	available	\N	2025-06-24 01:26:35.326066	2025-06-24 01:26:35.326071	f	\N	\N	f	f	\N	\N	\N	\N
131	Renee Walton	404-403-5465	\N	\N	No signed agreement documented	t	\N	\N	available	midtown	2025-06-24 01:26:01.959604	2025-06-24 01:26:01.959613	f	\N	\N	f	f	\N	59	Midtown	\N
132	Vicki Cherry	678-429-0492	\N	\N	No signed agreement documented	t	\N	\N	available	midtown	2025-06-24 01:26:02.09973	2025-06-24 01:26:02.099734	f	\N	\N	f	f	\N	59	Midtown	\N
173	Laurie Myler	404-808-9099	laurie.myler04@gmail.com	\N	New	t	\N	\N	available	East Cobb, Marietta	2025-06-24 01:26:33.816622	2025-06-24 01:26:33.816626	f	\N	\N	f	f	\N	\N	East Cobb, Marietta	\N
286	Carrey  Hugoo	314.363.2982	carreyhugoo@gmail.com	\N	Area: Roswell Agreement: signed	t	\N	\N	available	Roswell	2025-06-24 01:44:09.777747	2025-06-24 01:44:09.77775	f	\N	\N	t	f	\N	57	Roswell	\N
289	Marcy  Louza	678.596.9697	mdlouza@gmail.com	\N	Area: Dunwoody Agreement: signed	t	\N	\N	available	Dunwoody	2025-06-24 01:44:10.124678	2025-06-24 01:44:10.124682	t	\N	\N	t	f	\N	56	Dunwoody	\N
177	Tom Riddick	404-697-9424	tom.riddick@gmail.com	\N	New	t	\N	\N	available	Dunwoody	2025-06-24 01:26:34.365096	2025-06-24 01:26:34.3651	t	\N	flexible, any day, 8 am to 6pm	f	f	\N	56	Dunwoody	\N
180	Deborah G. Shendelman	770.355.7201	debi.shendelman@gmail.com	\N	New	t	\N	\N	available	Dunwoody (Mt. Vernon Road, near Ashford Dunwoody)	2025-06-24 01:26:34.77616	2025-06-24 01:26:34.776166	f	\N	\N	f	f	\N	56	Dunwoody (Mt. Vernon Road, near Ashford Dunwoody)	\N
144	Elizabeth Gordon	404-563-6401	edegordon@gmail.com	\N	New	t	\N	\N	available	Decatur	2025-06-24 01:26:03.970392	2025-06-24 01:26:03.970397	f	\N	\N	f	f	\N	59	Decatur	\N
175	Hunter Oskouei	404-387-1851	kerrioskouei@gmail.com	\N	New, Agreement: yes	t	\N	\N	available	\N	2025-06-24 01:26:34.090774	2025-06-24 01:26:34.090778	f	\N	\N	f	f	\N	\N	\N	\N
148	Jonathan Hobson	706-877-6970	jonathan.s.hobson@gmail.com	\N	New, Area: Decatur; Agreement: yes	t	\N	\N	available	Decatur	2025-06-24 01:26:04.528233	2025-06-24 01:26:04.528237	f	\N	\N	f	f	\N	59	Decatur	\N
185	Jonathan Weintraub	404-295-1939	jwlaw47@gmail.com	\N	New, Area: Embry hills; Agreement: yes	t	\N	\N	available	Embry hills	2025-06-24 01:26:35.550638	2025-06-24 01:26:35.550642	f	\N	\N	f	f	\N	59	Embry hills	\N
174	Suzanne O'Brien	202-297-4259	sbgobrien@gmail.com	\N	New, Area: Milton; Agreement: yes	t	\N	\N	available	Milton	2025-06-24 01:26:33.953708	2025-06-24 01:26:33.953712	f	\N	\N	f	f	\N	55	Milton	\N
298	Veronica Pendleton	678-427-6109	vpennington924@gmail.com	\N	Area: Decula	f	\N	\N	available	Decula	2025-06-24 01:44:10.744905	2025-06-24 01:44:10.744909	f	\N	\N	f	f	\N	\N	Decula	\N
304	Sonika Tataria	678-622-4670	sonika.tataria@choa.org	\N	Area: Decatur	f	\N	\N	available	Decatur	2025-06-24 01:44:11.165632	2025-06-24 01:44:11.165636	f	\N	\N	f	f	\N	\N	Decatur	\N
137	Linda Beer	404-274-1397	\N	\N	Area: linda.beer@gmail.com; Agreement: yes; Notes: not driving for TSP anymore	f	\N	\N	available	linda.beer@gmail.com	2025-06-24 01:26:02.94075	2025-06-24 01:26:02.940754	f	\N	\N	f	f	\N	\N	linda.beer@gmail.com	\N
139	Debra Brown	(770) 778-9880	debraybrown@bellsouth.net	\N	Area: Dunwoody; Agreement: yes	f	\N	\N	available	Dunwoody	2025-06-24 01:26:03.222243	2025-06-24 01:26:03.222249	f	\N	\N	f	f	\N	\N	Dunwoody	\N
182	Jim Tropauer	404-285-7092	\N	\N	Area: East Cobb; Van approved: yes; Agreement: yes	f	\N	\N	available	East Cobb	2025-06-24 01:26:35.051552	2025-06-24 01:26:35.051565	f	\N	\N	f	f	\N	\N	East Cobb	\N
183	John Truono	770-274-8810	truonoj@gmail.com	\N	Area: Kennesaw to anywhere; Agreement: yes	f	\N	\N	available	Kennesaw to anywhere	2025-06-24 01:26:35.188812	2025-06-24 01:26:35.188815	f	\N	\N	f	f	\N	\N	Kennesaw to anywhere	\N
179	Kim Ross	502-377-5878	ross.kimberly.a@gmail.com	\N	Area: Sandy Springs to everywhere; Agreement: yes	t	\N	\N	available	Sandy Springs to everywhere	2025-06-24 01:26:34.639164	2025-06-24 01:26:34.639168	f	\N	\N	f	f	\N	\N	Sandy Springs to everywhere	\N
143	Alex Farquarson	404-630-4578	\N	\N	Area: (Laura/Jordan) Brookhaven; Agreement: no	t	\N	\N	busy	(Laura/Jordan) Brookhaven	2025-06-24 01:26:03.830438	2025-06-24 01:26:03.830443	f	\N	\N	f	f	\N	59	(Laura/Jordan) Brookhaven	\N
172	Dawn Mullican	513-607-6433	dmullican@observatory.com	\N	Area: Dunwoody (groups); Agreement: yes	t	\N	\N	available	Dunwoody (groups)	2025-06-24 01:26:33.679549	2025-06-24 01:26:33.679554	f	\N	\N	f	f	\N	56	Dunwoody (groups)	\N
188	Doug Bradenburg	404-423-4393	dougsmail6@gmail.com	\N	Area: Candler Park; Agreement: yes	t	\N	\N	available	Candler Park	2025-06-24 01:26:35.968346	2025-06-24 01:26:35.968351	f	\N	\N	f	f	\N	59	Candler Park	\N
190	Elisabeth Callahan	404-543-0224	eliscallahan@gmail.com	\N	Area: Peachtree Corners; Agreement: yes	t	\N	\N	available	Peachtree Corners	2025-06-24 01:26:36.242472	2025-06-24 01:26:36.242477	f	\N	\N	f	f	\N	56	Peachtree Corners	\N
189	Felipe Buzeta	678-908-9972	felbuz@yahoo.com	\N	Area: (Laura/Jordan) Brookhaven; Agreement: yes	t	\N	\N	available	(Laura/Jordan) Brookhaven	2025-06-24 01:26:36.105643	2025-06-24 01:26:36.105647	f	\N	\N	f	f	\N	59	(Laura/Jordan) Brookhaven	\N
191	Noel Clark	(770) 235-8026	jdnclark@bellsouth.net	\N	Area: East Cobb/Downtown; Agreement: yes	t	\N	\N	available	East Cobb/Downtown	2025-06-24 01:26:36.37944	2025-06-24 01:26:36.379444	f	\N	\N	f	f	\N	57	East Cobb/Downtown	\N
254	Holly  Smith	443-848-6493	hollygsmith96@gmail.com	\N	Area: East Cobb (drives to T&Z)	f	\N	\N	available	East Cobb (drives to T&Z)	2025-06-24 01:44:07.352074	2025-06-24 01:44:07.35208	f	\N	\N	f	f	\N	\N	East Cobb (drives to T&Z)	\N
257	Alaysia Venable	470-528-2070	alaysiav@outlook.com	\N	Area: (Laura/Jordan) Brookhaven	f	\N	\N	available	(Laura/Jordan) Brookhaven	2025-06-24 01:44:07.55836	2025-06-24 01:44:07.558365	f	\N	\N	f	f	\N	\N	(Laura/Jordan) Brookhaven	\N
264	Randy  Whiting	(404) 633-0293	rwhiting17@comcast.net	\N	Area: Chamblee/Brookhaven; Notes: Retired	f	\N	\N	available	Chamblee/Brookhaven	2025-06-24 01:44:08.043105	2025-06-24 01:44:08.043108	f	\N	\N	f	f	\N	\N	Chamblee/Brookhaven	\N
265	Nabih Karim	(404) 512-8373	nabih.karim7121@gmail.com	\N	Area: Metro Atlanta; Notes: College Student	f	\N	\N	available	Metro Atlanta	2025-06-24 01:44:08.112036	2025-06-24 01:44:08.11204	f	\N	\N	f	f	\N	\N	Metro Atlanta	\N
281	Cynthia Cox	678.860.6442	cc.cox26@gmail.com	\N	Area: Atlanta Agreement: signed	t	\N	\N	available	Atlanta	2025-06-24 01:44:09.432312	2025-06-24 01:44:09.432317	f	\N	\N	t	f	\N	59	Atlanta	\N
283	Della Fried	404.556.0277	djonesfried@gmail.com	\N	Area: Atlanta Agreement: signed	t	\N	\N	available	Atlanta	2025-06-24 01:44:09.569899	2025-06-24 01:44:09.569903	f	\N	\N	t	f	\N	\N	Atlanta	\N
279	Jen Cohen	404-918-9933	jenmcohen@gmail.com	\N	Area: Sandy Springs AGREEMENT RECEIVED	t	\N	\N	available	Sandy Springs	2025-06-24 01:44:09.294658	2025-06-24 01:44:09.294663	f	\N	\N	f	f	\N	58	Sandy Springs	\N
280	Karen Cohen	404.451.7942	karenacohen@gmail.com	\N	Area: Alpharetta AGREEMENT RECEIVED	t	\N	\N	available	Alpharetta	2025-06-24 01:44:09.363229	2025-06-24 01:44:09.363233	f	\N	\N	f	f	\N	55	Alpharetta	\N
282	Kate Dolan	404.271.4352	kate.dolan@comcast.net	\N	Area: Chastain AGREEMENT RECEIVED	t	\N	\N	available	Chastain	2025-06-24 01:44:09.501034	2025-06-24 01:44:09.501039	f	\N	\N	f	f	\N	58	Chastain	\N
262	Linda  Wohlbach	770-448-1583	lwohlbach@gmail.com	\N	Area: Peachtree Corners Agreement: signed	t	\N	\N	available	Peachtree Corners	2025-06-24 01:44:07.90545	2025-06-24 01:44:07.905455	f	\N	\N	t	f	\N	56	Peachtree Corners	\N
252	Amy  Santy	404-386-3664	amysanty@comcast.net	\N	Area: Midtown (groups) Agreement: signed	t	\N	\N	available	Midtown (groups)	2025-06-24 01:44:07.214149	2025-06-24 01:44:07.214153	f	\N	\N	t	f	\N	59	Midtown (groups)	\N
246	James  Cramer	770-335-7092	\N	\N	Area: Dunwoody (St Vincents) Agreement: signed	t	\N	\N	available	Dunwoody (St Vincents)	2025-06-24 01:44:06.542168	2025-06-24 01:44:06.542172	f	\N	\N	t	f	\N	56	Dunwoody (St Vincents)	\N
277	Chet (William)  Bell	386-290-8930	bell73@bellsouth.net	\N	Area: Roswell Agreement: signed	t	\N	\N	available	Roswell	2025-06-24 01:44:09.156788	2025-06-24 01:44:09.156794	t	\N	\N	t	f	\N	57	Roswell	\N
186	Daniel Bekerman	404-354-1010	daniel.bekerman@gmail.com	\N	As needed	t	\N	\N	available	Dunwoody	2025-06-24 01:26:35.692154	2025-06-24 01:26:35.692158	f	\N	\N	f	f	\N	56	Dunwoody	\N
141	Libby Clement	404-210-5677	libbyclement@comcast.net	\N	Agreement: yes	t	\N	\N	available	\N	2025-06-24 01:26:03.550866	2025-06-24 01:26:03.550871	t	\N	\N	f	f	\N	\N	\N	\N
266	Kristin Storm	(678) 428-7092	kristinrmorrison@yahoo.com	\N	Area: Upper West Side Atl; Notes: weekend afternoons	f	\N	\N	available	Upper West Side Atl	2025-06-24 01:44:08.180972	2025-06-24 01:44:08.181046	f	\N	\N	f	f	\N	\N	Upper West Side Atl	\N
267	Shayla Smith	(404) 438-4456	shaylasmith920@gmail.com	\N	Area: Lawrenceville; Notes: available on Saturdays	f	\N	\N	available	Lawrenceville	2025-06-24 01:44:08.319887	2025-06-24 01:44:08.319891	f	\N	\N	f	f	\N	\N	Lawrenceville	\N
268	Lauren Eckman	(770) 851-5116	laurenceckman@gmail.com	\N	Area: Brookwood (by Piedmont Hospital); Notes: weekends & Friday after 4	f	\N	\N	available	Brookwood (by Piedmont Hospital)	2025-06-24 01:44:08.457705	2025-06-24 01:44:08.457709	f	\N	\N	f	f	\N	\N	Brookwood (by Piedmont Hospital)	\N
269	Kerol Guaqueta	(818) 675-7215	kerol.guaqueta@gmail.com	\N	Area: Atlanta; Notes: any day 12-3	f	\N	\N	available	Atlanta	2025-06-24 01:44:08.526725	2025-06-24 01:44:08.526729	f	\N	\N	f	f	\N	\N	Atlanta	\N
270	Jessica Garrido	(706) 386-4339	garrido_jessica@ymail.com	\N	Area: Buford	f	\N	\N	available	Buford	2025-06-24 01:44:08.595438	2025-06-24 01:44:08.595442	f	\N	\N	f	f	\N	\N	Buford	\N
271	Patricia  Hunter	(678) 637-4243	trishhunter211@gmail.com	\N	Area: East Atlanta; Notes: flexible, any day, 8 am to 6pm	f	\N	\N	available	East Atlanta	2025-06-24 01:44:08.664183	2025-06-24 01:44:08.664187	f	\N	\N	f	f	\N	\N	East Atlanta	\N
272	Susan Soper	(404) 281-9639	susanmsoper@gmail.com	\N	Area: Lives on Ivy Road; Notes: can drive on M; W; F (not Thursday unless after 11)	f	\N	\N	available	Lives on Ivy Road	2025-06-24 01:44:08.733404	2025-06-24 01:44:08.733424	f	\N	\N	f	f	\N	\N	Lives on Ivy Road	\N
273	Lori  Wilson	(410) 303-0090	klsjwilson@yahoo.com	\N	Area: Alpharetta/Milton; Notes: flexible	f	\N	\N	available	Alpharetta/Milton	2025-06-24 01:44:08.80216	2025-06-24 01:44:08.802164	f	\N	\N	f	f	\N	\N	Alpharetta/Milton	\N
199	Benjamin Gross	470-585-9222	bengross1987@gmail.com	\N	Area: Anywhere; Agreement: yes	f	\N	\N	available	Anywhere	2025-06-24 01:26:37.673267	2025-06-24 01:26:37.673271	f	\N	\N	f	f	\N	\N	Anywhere	\N
203	Leslie Johnson	(404) 644-8630	lesliebolinjohnson@yahoo.com	\N	Area: Lisa; Agreement: yes; Notes: Lisa	f	\N	\N	available	Lisa	2025-06-24 01:26:38.289444	2025-06-24 01:26:38.28945	f	\N	\N	f	f	\N	\N	Lisa	\N
197	Miriam Falaki	\N	mfalaki@savantwealth.com	\N	Area: Anywhere; Agreement: yes	t	\N	\N	available	Anywhere	2025-06-24 01:26:37.343965	2025-06-24 01:26:37.34397	f	\N	\N	f	f	\N	\N	Anywhere	\N
201	Suzanne Grosswald	678-758-2190	davnsuz@comcast.net	\N	Area: Peachtree Corners; Agreement: yes	t	\N	\N	available	Peachtree Corners	2025-06-24 01:26:38.015764	2025-06-24 01:26:38.015768	f	\N	\N	f	f	\N	\N	Peachtree Corners	\N
202	Renee Harris	404-823-7787	reneeharris05@gmail.com	\N	Area: Dunwoody; Agreement: yes	t	\N	\N	available	Dunwoody	2025-06-24 01:26:38.152728	2025-06-24 01:26:38.152733	f	\N	\N	f	f	\N	\N	Dunwoody	\N
207	Ataesia Mickens	470-559-6160	ataesiamickens@gmail.com	\N	Area: (Laura/Jordan) Suwanee; Agreement: yes	t	\N	\N	available	(Laura/Jordan) Suwanee	2025-06-24 01:26:38.890102	2025-06-24 01:26:38.890106	f	\N	\N	f	f	\N	\N	(Laura/Jordan) Suwanee	\N
260	Brian Williams	(650) 464-9969	brian.williams2@wholefoods.com	\N	Area: Cartersville; Notes: Whole Foods guy Agreement: signed	t	\N	\N	available	Cartersville	2025-06-24 01:44:07.767215	2025-06-24 01:44:07.767218	f	\N	\N	t	f	\N	\N	Cartersville	\N
209	Catherine Newsome	(404) 414-9172	\N	\N	Area: Groups; Agreement: yes	t	\N	\N	available	Groups	2025-06-24 01:26:39.163365	2025-06-24 01:26:39.163368	f	\N	\N	f	f	\N	55	Groups	\N
198	Chris Frye	4044312600	cmfrye@gmail.com	\N	Area: East Cobb; Agreement: yes	t	\N	\N	available	East Cobb	2025-06-24 01:26:37.536194	2025-06-24 01:26:37.536199	f	\N	\N	f	f	\N	57	East Cobb	\N
253	Jade Schoenberg	256-473-4229	jadeschoenberg@gmail.com	\N	Area: Sandy Springs/Dunwoody AGREEMENT RECEIVED	t	\N	\N	available	Sandy Springs/Dunwoody	2025-06-24 01:44:07.282959	2025-06-24 01:44:07.282964	f	\N	\N	f	f	\N	\N	Sandy Springs/Dunwoody	\N
194	Corinne Cramer	(404) 667-9841	corcramer@comcast.net	\N	Area: Dunwoody (St Vincents); Agreement: yes	t	\N	\N	available	Dunwoody (St Vincents)	2025-06-24 01:26:36.931381	2025-06-24 01:26:36.931386	f	\N	\N	f	f	\N	56	Dunwoody (St Vincents)	\N
251	Bree Roe	404-376-2288	breewroe@gmail.com	\N	Area: East Cobb (groups); Notes: breewroe@gmail.com Agreement: signed	t	\N	\N	available	East Cobb (groups)	2025-06-24 01:44:07.145547	2025-06-24 01:44:07.145551	f	\N	\N	t	f	\N	57	East Cobb (groups)	\N
208	Gary Munder	404-543-3078	mundergary@gmail.com	\N	Area: East Cobb to anywhere; Van approved: yes; Agreement: yes	t	\N	\N	available	East Cobb to anywhere	2025-06-24 01:26:39.026686	2025-06-24 01:26:39.026691	f	\N	\N	f	f	\N	57	East Cobb to anywhere	\N
195	James Cramer	770-335-7092	\N	\N	Area: Dunwoody (St Vincents); Agreement: yes	t	\N	\N	available	Dunwoody (St Vincents)	2025-06-24 01:26:37.068332	2025-06-24 01:26:37.068337	f	\N	\N	f	f	\N	56	Dunwoody (St Vincents)	\N
187	Marni Bekerman	(678) 938-8367	marnibekerman@gmail.com	\N	As needed	t	\N	\N	available	Dunwoody	2025-06-24 01:26:35.829305	2025-06-24 01:26:35.829309	f	\N	\N	f	f	\N	56	Dunwoody	\N
200	Jeff Gross	770.329.9709	jeffreygross@yahoo.com	\N	Area: East Cobb/SS; Agreement: yes; Notes: Drives wherever	t	\N	\N	available	East Cobb/SS	2025-06-24 01:26:37.87878	2025-06-24 01:26:37.878784	f	\N	\N	f	f	\N	57	East Cobb/SS	\N
256	Josh Tamarkin	(678) 674-0918	josh.tamarkin@pisgahpats.org	\N	Area: alpharetta; Notes: student AGREEMENT RECEIVED	t	\N	\N	available	alpharetta	2025-06-24 01:44:07.489381	2025-06-24 01:44:07.489386	f	\N	\N	f	f	\N	55	Alpharetta	\N
259	Kellie Whitley	770-880-7106	kjwhitley@gmail.com	\N	Area: East Cobb AGREEMENT RECEIVED	t	\N	\N	available	East Cobb	2025-06-24 01:44:07.698181	2025-06-24 01:44:07.698186	f	\N	\N	f	f	\N	57	East Cobb	\N
204	Kathy Ledford	678-428-5247	kledfo200@comcast.net	\N	Area: Dunwoody; Agreement: yes	t	\N	\N	available	Dunwoody	2025-06-24 01:26:38.480292	2025-06-24 01:26:38.480297	f	\N	\N	f	f	\N	56	Dunwoody	\N
292	Kelly McDonald	404.272.4126	kellymcdonald9@gmail.com	\N	Area: Milton AGREEMENT RECEIVED	t	\N	\N	available	Milton	2025-06-24 01:44:10.331843	2025-06-24 01:44:10.331848	f	\N	\N	f	f	\N	55	Milton	\N
291	Kristina McCarthney	678-372-7959	kristinamday@yahoo.com	\N	Area: Flowery Branch AGREEMENT RECEIVED	t	\N	\N	available	Flowery Branch	2025-06-24 01:44:10.262365	2025-06-24 01:44:10.262369	f	\N	\N	f	f	\N	60	Flowery Branch	\N
275	Laura Baldwin	404.931.8774	lzauderer@yahoo.com	\N	Area: Atlanta AGREEMENT RECEIVED	t	\N	\N	available	Atlanta	2025-06-24 01:44:08.94032	2025-06-24 01:44:08.940325	f	\N	\N	f	f	\N	59	Atlanta	\N
250	Lauren Roberts	404-556-8681	roberts.laurenf@gmail.com	\N	Area: Roswell; Notes: roberts.laurenf@gmail.com AGREEMENT RECEIVED	t	\N	\N	available	Roswell	2025-06-24 01:44:07.076603	2025-06-24 01:44:07.076609	f	\N	\N	f	f	\N	57	Roswell	\N
284	Lisa Hiles	770.826.0457	lisahiles@me.com	\N	Area: Dunwoody AGREEMENT RECEIVED	t	\N	\N	available	Dunwoody	2025-06-24 01:44:09.63888	2025-06-24 01:44:09.638885	f	\N	\N	f	f	\N	56	Dunwoody	\N
255	Melissa Spencer	404-316-4944	spen8270@bellsouth.net	\N	Area: East Cobb/Roswell driver AGREEMENT RECEIVED	t	\N	\N	available	East Cobb/Roswell driver	2025-06-24 01:44:07.420732	2025-06-24 01:44:07.420736	f	\N	\N	f	f	\N	57	East Cobb/Roswell driver	\N
287	Sarah Kass	404.455.6743	sarahlkass@gmail.com	\N	Area: Sandy Springs AGREEMENT RECEIVED	t	\N	\N	available	Sandy Springs	2025-06-24 01:44:09.918129	2025-06-24 01:44:09.918134	f	\N	\N	f	f	\N	58	Sandy Springs	\N
290	Stephanie Luis	678.372.9024	stephanieluis55@gmail.com	\N	Area: Dunwoody AGREEMENT RECEIVED	t	\N	\N	available	Dunwoody	2025-06-24 01:44:10.193516	2025-06-24 01:44:10.19352	f	\N	\N	f	f	\N	56	Dunwoody	\N
205	Mimi Loson	678-644-2062	mkl.cmf@gmail.com	\N	Area: East Cobb; Agreement: yes	t	\N	\N	available	East Cobb	2025-06-24 01:26:38.617084	2025-06-24 01:26:38.617088	f	\N	\N	f	f	\N	57	East Cobb	\N
133	Nisha Gross	(678) 521-0618	nisha.gross@gmail.com	\N	Area: Druid hills rd in Brookhaven; Agreement: yes	t	\N	\N	available	Druid hills rd in Brookhaven	2025-06-24 01:26:02.239284	2025-06-24 01:26:02.239288	f	\N	\N	f	f	\N	59	Druid hills rd in Brookhaven	\N
193	Parker Cohen	(678) 718-7518	parkerwcohen@gmail.com	\N	Area: Sandy Springs; Agreement: yes	t	\N	\N	available	Sandy Springs	2025-06-24 01:26:36.791736	2025-06-24 01:26:36.791741	f	\N	\N	f	f	\N	58	Sandy Springs	\N
274	Terri Bagen	404.273.5846	tsfb@bellsouth.net	\N	Area: Atlanta AGREEMENT RECEIVED	t	\N	\N	available	Atlanta	2025-06-24 01:44:08.871469	2025-06-24 01:44:08.871473	f	\N	\N	f	f	\N	59	Atlanta	\N
285	Jordan Horne	404.271.4352	jordanglick@gmail.com	\N	Area: Chamblee/N Brookhaven AGREEMENT RECEIVED	t	\N	\N	available	Chamblee/N Brookhaven	2025-06-24 01:44:09.70813	2025-06-24 01:44:09.708135	t	\N	\N	f	f	\N	59	Chamblee/N Brookhaven	\N
192	Mickey Cohen	404-457-4457	cyekcim@gmail.com	\N	As needed	t	\N	\N	available	Sandy Springs	2025-06-24 01:26:36.653941	2025-06-24 01:26:36.653947	f	\N	\N	f	f	\N	58	Sandy Springs	\N
276	Julie Bastek	404.808.2560	julierose27@comcast.net	\N	Area: Buckhead AGREEMENT RECEIVED	t	\N	\N	available	Buckhead	2025-06-24 01:44:09.087796	2025-06-24 01:44:09.087801	f	\N	\N	f	f	\N	59	Buckhead	\N
288	Ana LaBoy	(404) 983-7911	analaboy7@gmail.com	\N	Area: Lilburn Agreement: signed	t	\N	\N	available	Lilburn	2025-06-24 01:44:10.055966	2025-06-24 01:44:10.05597	f	\N	\N	t	f	\N	\N	Lilburn	\N
249	Jay Rein	404-348-6089	jaysrein@yahoo.com	\N	Area: Sandy Springs to anywhere; Notes: Marcy AGREEMENT RECEIVED	t	\N	\N	available	Sandy Springs to anywhere	2025-06-24 01:44:06.887965	2025-06-24 01:44:06.887969	f	\N	\N	f	f	\N	58	Sandy Springs to anywhere	\N
206	Susan McKenzie	(404) 735-5426	susan.mckenzie23@gmail.com	\N	Hasn't started; Lisa	t	\N	\N	available	Lisa	2025-06-24 01:26:38.753596	2025-06-24 01:26:38.753601	f	\N	\N	f	f	\N	\N	Lisa	\N
196	Elizabeth Dickson	678-779-2088	elizabethpdickson@gmail.com	\N	Area: Dunwoody; Agreement: yes;	t	\N	\N	available	Dunwoody	2025-06-24 01:26:37.205283	2025-06-24 01:26:37.205288	f	\N	M-F after 3; weekends	f	f	\N	56	Dunwoody	\N
303	Allison Tanenbaum	(770) 355-8876	abalembik@gmail.com	\N	Area: SS to SS/Dunwoody Agreement: signed	t	\N	\N	available	SS to SS/Dunwoody	2025-06-24 01:44:11.096452	2025-06-24 01:44:11.096457	f	\N	\N	t	f	\N	58	SS to SS/Dunwoody	\N
138	Amy Kelsch	404-421-8035	amykelsch@gmail.com	\N	Area: East Cobb; Agreement: yes; Notes: driver for home depot	t	\N	\N	available	East Cobb	2025-06-24 01:26:03.082386	2025-06-24 01:26:03.08239	f	\N		f	f	\N	57	East Cobb (Driver for Home Depot?)	\N
210	Ed Ogletree	770-331-1500	romaseriea@gmail.com	2290 Littlebrooke Lane, Dunwoody, GA 30338	Area: Dunwoody to everywhere; Agreement: yes	t	\N	\N	available	Dunwoody to everywhere	2025-06-24 01:26:39.300042	2025-06-24 01:26:39.300046	f	2290 Littlebrooke Lane, Dunwoody, GA 30338	\N	f	f	\N	56	Dunwoody to everywhere	\N
295	Rayna Nash	404.376.8028	itsanaturalthangsalon@gmail.com	\N	Area: College Park AGREEMENT RECEIVED	t	\N	\N	available	College Park	2025-06-24 01:44:10.53851	2025-06-24 01:44:10.538515	f	\N	\N	f	f	\N	59	College Park	\N
134	Jan Jay	6785925091	janjayrd@yahoo.com	\N	Area: Dunwoody; Agreement: yes; Notes: Happy to help, just not available on Wed	t	\N	\N	available	Dunwoody	2025-06-24 01:26:02.380055	2025-06-24 01:26:02.380061	t	\N	weekend afternoons	f	f	\N	56	Dunwoody	\N
211	Jenn Parks	(770) 289-0728	jenniferakopp@yahoo.com	\N	Area: Alpharetta (Near Avalon); Agreement: yes	t	\N	\N	available	Alpharetta (Near Avalon)	2025-06-24 01:26:39.43697	2025-06-24 01:26:39.436989	f	\N	\N	f	f	\N	55	Alpharetta (Near Avalon)	\N
309	Renee Videlefsky	770.265.3563	videlefsky@gmail.com	\N	Area: PTC to SS/Dun AGREEMENT RECEIVED	t	\N	\N	available	PTC to SS/Dun	2025-06-24 01:44:11.648738	2025-06-24 01:44:11.648743	f	\N	\N	f	f	\N	56	PTC to SS/Dun	\N
278	Angie Bradenburg	404.668.6886	ahberlin@yahoo.com	\N	Area: Candler Park Agreement: signed	t	\N	\N	available	Candler Park	2025-06-24 01:44:09.225768	2025-06-24 01:44:09.225774	f	\N	\N	t	f	\N	59	Candler Park	\N
152	Pat McGreevy	770-853-8783	pjmcgreevy@comcast.net	Brooke Farm	Area: Dunwoody to anywhere; Agreement: yes	t	\N	\N	available	Dunwoody to anywhere	2025-06-24 01:26:05.086524	2025-06-24 01:26:05.086528	t	4715 Ponte Vedra Drive, Marietta, GA 30067	\N	f	f	\N	56	Dunwoody to anywhere	\N
307	Vicki Tropauer	404.202.9108	vickib@aol.com	\N	Area: EC AGREEMENT RECEIVED	t	\N	\N	available	EC	2025-06-24 01:44:11.442286	2025-06-24 01:44:11.44229	t	\N	\N	f	f	\N	57	East Cobb	\N
294	Nancy Miller	678.575.6898	atlantamillers@comcast.net	\N	Area: Alpharetta AGREEMENT RECEIVED	t	\N	\N	available	Alpharetta	2025-06-24 01:44:10.469437	2025-06-24 01:44:10.469442	t	\N	\N	f	f	\N	55	Alpharetta	\N
299	Ashley Rush	678-480-8786	ashleyrush@comcast.net	\N	Area: Decatur Agreement: signed	t	\N	\N	available	Decatur	2025-06-24 01:44:10.813592	2025-06-24 01:44:10.813598	f	\N	\N	t	f	\N	59	Decatur	\N
153	Steve Miles	404-931-9862	milescatering01@aol.com	\N	Area: Roswell to everywhere; Agreement: yes	t	\N	\N	available	Roswell to everywhere	2025-06-24 01:26:05.226233	2025-06-24 01:26:05.226237	t	\N	\N	f	f	\N	57	Roswell to everywhere	\N
261	Claire Jo Wise	678-467-7216	cjcwise@comcast.net	\N	Area: Roswell/East Cobb driver Agreement: signed	t	\N	\N	available	Roswell/East Cobb driver	2025-06-24 01:44:07.836411	2025-06-24 01:44:07.836416	f	\N	\N	t	f	\N	57	Roswell/East Cobb driver	\N
151	Suzanne Sackleh	(678) 662-3334	suzannesackleh@gmail.com	\N	Area: Sandy Springs to anywhere; Agreement: yes	t	\N	\N	available	Sandy Springs to anywhere	2025-06-24 01:26:04.947027	2025-06-24 01:26:04.947031	t	123 Sandy Springs Road, Atlanta, GA 30328	\N	f	f	\N	58	Sandy Springs to anywhere	\N
263	Darren Wolkow	770-490-6206	dwolkow@gmail.com	\N	Area: Dunwoody Agreement: signed	t	\N	\N	available	Dunwoody	2025-06-24 01:44:07.974335	2025-06-24 01:44:07.974339	f	\N	\N	t	f	\N	56	Dunwoody	\N
297	Sarah Painter	816.308.2273	snpainter23@gmail.com	\N	Area: Milton AGREEMENT RECEIVED	t	\N	\N	available	Milton	2025-06-24 01:44:10.676088	2025-06-24 01:44:10.676093	f	\N	\N	f	f	\N	55	Milton	\N
300	Silke Shilling	404.375.9541	silke.shilling@gmail.com	\N	Area: EC AGREEMENT RECEIVED	t	\N	\N	available	EC	2025-06-24 01:44:10.888414	2025-06-24 01:44:10.888419	f	\N	\N	f	f	\N	57	East Cobb	\N
293	Steffi Miller	678-570-9009	steffilanetmc@gmail.com	\N	Area: Peachtree Corners AGREEMENT RECEIVED	t	\N	\N	available	Peachtree Corners	2025-06-24 01:44:10.400568	2025-06-24 01:44:10.400572	f	6241 Blackberry Hill, Norcross, GA 30092	\N	f	f	\N	56	Peachtree Corners	\N
306	Suzanna Trice	770.403.4821	suzannatrice@hotmail.com	\N	Area: PC AGREEMENT RECEIVED	t	\N	\N	available	PC	2025-06-24 01:44:11.303674	2025-06-24 01:44:11.303679	f	\N	\N	f	f	\N	56	Peachtree Corners	\N
146	Lexi Hayne	404-705-9522	haycuet@gmail.com	4715 Ponte Vedra Drive, Marietta, GA 30067	Agreement SENT	t	\N	\N	available	East Cobb / SS (last resort?)	2025-06-24 01:26:04.249357	2025-06-24 01:26:04.249363	f	4715 Ponte Vedra Drive, Marietta, GA 30067	\N	f	f	\N	57	East Cobb / SS (last resort?)	\N
302	Elaine Strauss	678-525-8607	elainerstrauss@gmail.com	\N	Area: Peachtree Corners AGREEMENT RECEIVED AGREEMENT MISSING AGREEMENT RECEIVED	t	\N	\N	available	Peachtree Corners	2025-06-24 01:44:11.027183	2025-06-24 01:44:11.027188	f	\N	\N	f	f	\N	56	Peachtree Corners	\N
301	Jason Smieja	(678) 245-2110	jsmieja@superiorplay.com	\N	Area: suwanee/jc/duluth AGREEMENT RECEIVED	t	\N	\N	available	suwanee/jc/duluth	2025-06-24 01:44:10.958138	2025-06-24 01:44:10.958142	f	\N	\N	f	f	\N	\N	suwanee/jc/duluth	\N
308	Jenny Vanier-Walter	703.403.0711	jennyavw@yahoo.com	\N	Area: Roswell AGREEMENT RECEIVED	t	\N	\N	available	Roswell	2025-06-24 01:44:11.579264	2025-06-24 01:44:11.579268	f	\N	\N	f	f	\N	57	Roswell	\N
305	Judy Toenmeiser	404-683-5823	toens@bellsouth.net	\N	Area: EC AGREEMENT RECEIVED	t	\N	\N	available	EC	2025-06-24 01:44:11.234932	2025-06-24 01:44:11.234937	f	\N	\N	f	f	\N	57	East Cobb	\N
296	Tracie Nowak	770.315.9177	tbnowak@yahoo.com	\N	Area: PC AGREEMENT RECEIVED	t	\N	\N	available	PC	2025-06-24 01:44:10.60722	2025-06-24 01:44:10.607224	f	\N	\N	f	f	\N	56	Peachtree Corners	\N
\.


--
-- Data for Name: group_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_memberships (id, user_id, group_id, role, is_active, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: host_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.host_contacts (id, host_id, name, role, phone, email, is_primary, notes, created_at, updated_at) FROM stdin;
22	46	Rayna Nash	Host/driver	4043768028	itsanaturalthangsalon@gmail.com	f	\N	2025-06-10 03:25:57.60669	2025-06-10 03:25:57.60669
25	48	Veronica Pendleton	Host/driver	6784276109	vpennington924@gmail.com	f	\N	2025-06-10 03:25:58.288485	2025-06-10 03:25:58.288485
23	56	Tracie Nowak	Host/driver	7703159177	tbnowak@yahoo.com	f		2025-06-10 03:25:57.833699	2025-06-30 16:16:53.926
32	56	Suzanna Trice	Host/Driver	7704034821	suzannatrice@hotmail.com	f		2025-06-10 03:25:59.975111	2025-06-30 16:16:57.602
16	56	Marcy  Louza	lead	6785969697	mdlouza@gmail.com	f		2025-06-10 03:25:56.247043	2025-06-30 16:17:01.598
17	56	Stephanie Luis	lead	6783729024	stephanieluis55@gmail.com	f		2025-06-10 03:25:56.473673	2025-06-30 16:17:06.994
18	60	Kristina McCarthney	Host/driver	6783727959	kristinamday@yahoo.com	f		2025-06-10 03:25:56.69997	2025-06-30 16:17:27.955
2	3	Laura Baldwin	Host/driver	4049318774	lzauderer@yahoo.com	f		2025-06-10 03:25:53.073218	2025-06-14 04:08:56.95
3	3	Julie Bastek	Host/driver	4048082560	julierose27@comcast.net	f		2025-06-10 03:25:53.299967	2025-06-14 04:09:09.522
9	58	Kate Dolan	Host/driver	4042714352	kate.dolan@comcast.net	f		2025-06-10 03:25:54.663274	2025-06-30 16:17:40.285
5	3	Angie Bradenburg	Host/driver	4046686886	ahberlin@yahoo.com	f		2025-06-10 03:25:53.754573	2025-06-14 04:09:52.691
10	3	Della Fried	Host/driver	4045560277	djonesfried@gmail.com	f		2025-06-10 03:25:54.890309	2025-06-14 04:10:42.437
12	3	Jordan Horne	Host/driver	4042714352	jordanglick@gmail.com	f		2025-06-10 03:25:55.343447	2025-06-14 04:11:00.019
26	3	Ashley Rush	Host/driver	6784808786	ashleyrush@comcast.net	f		2025-06-10 03:25:58.514469	2025-06-14 04:12:02.549
6	58	Jen Cohen	Host/driver	4049189933	jenmcohen@gmail.com	f		2025-06-10 03:25:53.981583	2025-06-30 16:17:58.72
14	58	Sarah Kass	Host/driver	4044556743	sarahLkass@gmail.com	f		2025-06-10 03:25:55.79608	2025-06-30 16:18:04.015
30	58	Allison Tanenbaum	Host/driver	7703558876	abalembik@gmail.com	f		2025-06-10 03:25:59.522803	2025-06-30 16:18:08.071
1	58	Terri Bagen	Host/driver	4042735846	tsfb@bellsouth.net	f		2025-06-10 03:25:52.826974	2025-06-30 16:18:11.97
37	54	Anna Baylin	volunteer	(770) 696-7218‬	annabaylin@gmail.com	f		2025-06-14 04:31:53.718491	2025-06-14 04:32:02.928
7	55	Karen Cohen	Host/driver	4044517942	karenacohen@gmail.com	f		2025-06-10 03:25:54.209333	2025-06-30 16:07:52.502
21	55	Nancy Miller	Host/driver	6785756898	atlantamillers@comcast.net	f		2025-06-10 03:25:57.379718	2025-06-30 16:08:15.594
28	55	Jason Smieja	Host/driver	6782452110	jsmieja@superiorplay.com	f		2025-06-10 03:25:59.069351	2025-06-30 16:14:12.088
19	55	Kelly McDonald	Host/driver	4042724126	kellymcdonald9@gmail.com	f		2025-06-10 03:25:56.926215	2025-06-30 16:14:19.718
24	55	Sarah Painter	Host/driver	8163082273	snpainter23@gmail.com	f		2025-06-10 03:25:58.06098	2025-06-30 16:14:23.764
13	55	Carrey  Hugoo	Host/driver	3143632982	carreyhugoo@gmail.com	f		2025-06-10 03:25:55.569661	2025-06-30 16:14:27.88
8	3	Cynthia Cox	Host/driver	6788606442	cc.cox26@gmail.com	f		2025-06-10 03:25:54.436386	2025-06-30 16:14:59.882
27	57	Silke Shilling	Host/driver	4043759541	silke.shilling@gmail.com	f		2025-06-10 03:25:58.774546	2025-06-30 16:15:20.952
4	57	Chet (William)  Bell	Driver/alt host	3862908930	bell73@bellsouth.net	f		2025-06-10 03:25:53.528047	2025-06-30 16:15:25.766
34	57	Jenny Vanier-Walter	Host/driver	7034030711	jennyavw@yahoo.com	f		2025-06-10 03:26:00.427848	2025-06-30 16:15:30.9
31	57	Judy Toenmeiser	Host/Driver	4046835823	toens@bellsouth.net	f		2025-06-10 03:25:59.749018	2025-06-30 16:15:35.452
33	57	Vicki Tropauer	lead	4042029108	vickib@aol.com	f		2025-06-10 03:26:00.200697	2025-06-30 16:15:40.873
11	56	Lisa Hiles	Host/driver	7708260457	lisahiles@me.com	f		2025-06-10 03:25:55.116953	2025-06-30 16:16:19.206
36	56	Darren Wolkow	Host/driver	7704906206	dwolkow@gmail.com	f		2025-06-10 03:26:00.882038	2025-06-30 16:16:35.767
35	56	Renee Videlefsky	Host/driver	7702653563	videlefsky@gmail.com	f		2025-06-10 03:26:00.6543	2025-06-30 16:16:40.008
20	56	Steffi Miller	Driver/Alt host	6785709009	steffilanetmc@gmail.com	f		2025-06-10 03:25:57.15323	2025-06-30 16:16:44.955
29	56	Elaine Strauss	Driver/Alt Host	6785258607	elainerstrauss@gmail.com	f		2025-06-10 03:25:59.296031	2025-06-30 16:16:49.422
\.


--
-- Data for Name: hosted_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hosted_files (id, title, description, file_name, original_name, file_path, file_size, mime_type, category, uploaded_by, is_public, download_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: hosts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.hosts (id, name, email, phone, status, notes, created_at, updated_at, address) FROM stdin;
29	Decatur			inactive		2025-06-08 15:33:02.723718	2025-06-08 15:33:02.723718	\N
30	Snellville			inactive		2025-06-08 22:20:09.209897	2025-06-08 22:20:09.209897	\N
31	Woodstock			inactive		2025-06-08 22:21:23.082472	2025-06-08 22:21:23.082472	\N
32	Oak Grove			inactive		2025-06-08 22:21:40.90949	2025-06-08 22:21:40.90949	\N
33	New Chastain			inactive		2025-06-08 22:22:03.131359	2025-06-08 22:22:03.131359	\N
34	Lenox/Brookhaven			inactive		2025-06-08 22:22:17.666476	2025-06-08 22:22:17.666476	\N
35	Glenwood Park			inactive		2025-06-08 22:22:32.651052	2025-06-08 22:22:32.651052	\N
36	Buckhead			inactive		2025-06-08 22:22:52.676652	2025-06-08 22:22:52.676652	\N
48	Dacula	\N	\N	inactive		2025-06-10 02:57:33.929812	2025-06-10 02:57:33.929812	
55	Alpharetta	\N	\N	active		2025-06-30 16:02:47.87595	2025-06-30 16:02:47.87595	
56	Dunwoody/PTC	\N	\N	active		2025-06-30 16:03:12.737669	2025-06-30 16:03:12.737669	
57	East Cobb/Roswell	\N	\N	active		2025-06-30 16:03:40.675639	2025-06-30 16:03:40.675639	
58	Sandy Springs	\N	\N	active		2025-06-30 16:03:51.546264	2025-06-30 16:03:51.546264	
42	Chamblee/N Brookhaven	\N	\N	inactive	\N	2025-06-10 02:57:32.42668	2025-06-10 22:27:28.717	\N
46	College Park	\N	\N	inactive	\N	2025-06-10 02:57:33.549978	2025-06-10 22:27:34.003	\N
53	Collective Learning	\N	\N	active		2025-06-14 03:19:29.426646	2025-06-14 03:19:29.426646	\N
54	Athens	\N	\N	active		2025-06-14 04:31:19.343217	2025-06-14 04:31:19.343217	
59	Intown/Druid Hills	\N	\N	active		2025-06-30 16:04:02.304318	2025-06-30 16:04:02.304318	
60	Flowery Branch	\N	\N	active		2025-06-30 16:04:08.911598	2025-06-30 16:04:08.911598	
50	Suwanee/JC/Duluth	\N	\N	inactive		2025-06-10 02:57:34.371341	2025-06-30 16:13:03.097	
45	Peachtree Corners	\N	\N	inactive	\N	2025-06-10 02:57:33.323457	2025-06-30 16:13:09.476	\N
38	Roswell	\N	\N	inactive	\N	2025-06-10 02:57:31.51294	2025-06-30 16:13:18.953	\N
43	Lilburn	\N	\N	inactive	\N	2025-06-10 02:57:32.787839	2025-06-30 16:13:28.396	\N
37	Atlanta	\N	\N	inactive	\N	2025-06-10 02:57:31.184738	2025-06-30 16:18:31.193	\N
62	Groups	groups@sandwich.project	N/A	active	Special host for group donations that don't have a specific host location. These are collective donations from various groups.	2025-07-02 23:47:55.927409	2025-07-02 23:47:55.927409	Multiple Locations
\.


--
-- Data for Name: meeting_minutes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meeting_minutes (id, title, date, summary, color, file_name, file_path, file_type, mime_type, committee_type) FROM stdin;
7	Core Team Meeting- April 8	2024-04-08	PDF document: 20240408_TSP Meeting Agenda & Notes.pdf	blue	20240408_TSP Meeting Agenda & Notes.pdf	/home/runner/workspace/uploads/meeting-minutes/71f47936a511b1eafeac2575269a827f	pdf	application/pdf	\N
11	Core Team Meeting 02/12/2024	2024-02-12	PDF document: 20240212_TSP Meeting Agenda & Notes.pdf	blue	20240212_TSP Meeting Agenda & Notes.pdf	/home/runner/workspace/uploads/meeting-minutes/20240212_meeting.pdf	pdf	application/pdf	\N
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meetings (id, title, date, "time", final_agenda, status, created_at, type, location, description) FROM stdin;
5	Core Team Meeting- April 8	2024-04-08	20:00	\N	scheduled	2025-06-20 22:59:18.531202	core_team	\N	\N
7	Core Team Meeting 02/12/2024	2024-02-12	TBD	\N	scheduled	2025-06-30 03:56:37.765827	core_team	\N	\N
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, user_id, content, created_at, sender, updated_at) FROM stdin;
19	5	admin_1751065261945	Welcome to Driver Chat! Coordinate deliveries here.	2025-07-08 23:22:37.284028	Admin	2025-07-08 23:22:37.284028
20	6	admin_1751065261945	Welcome to Recipient Chat! Updates and support for receiving organizations.	2025-07-08 23:22:37.284028	Admin	2025-07-08 23:22:37.284028
9	2	user_backup_restored	Reminder meeting	2025-06-25 18:41:31.750872	Admin User	2025-07-08 21:07:51.843861
11	2	user_1751071509329_mrkw2z95z	anyone in yet?	2025-07-02 22:24:34.005269	Team Member	2025-07-08 21:07:51.843861
26	5	admin_1751065261945	Driver chat is now working! Coordination messages will appear here.	2025-07-09 00:02:53.707994	System Admin	2025-07-09 00:02:53.707994
27	6	admin_1751065261945	Recipient chat is now working! Communication with receiving organizations will appear here.	2025-07-09 00:02:53.707994	System Admin	2025-07-09 00:02:53.707994
30	3	admin_1751065261945	Test message for Marketing Committee	2025-07-09 00:26:25.526112	Admin User	2025-07-09 00:26:25.526112
31	101	user_1751071509329_mrkw2z95z	hi!	2025-07-09 01:41:23.843099	Katie Long	2025-07-09 01:41:23.843099
32	102	user_1751071509329_mrkw2z95z	hi!	2025-07-09 01:41:30.317089	Katie Long	2025-07-09 01:41:30.317089
33	69	user_1751071509329_mrkw2z95z	hi!	2025-07-09 01:41:34.22351	Katie Long	2025-07-09 01:41:34.22351
34	10	user_1751071509329_mrkw2z95z	anyone?	2025-07-09 13:54:45.535903	Katie Long	2025-07-09 13:54:45.535903
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, is_read, related_type, related_id, celebration_data, created_at) FROM stdin;
\.


--
-- Data for Name: project_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_assignments (id, project_id, user_id, role, assigned_at) FROM stdin;
\.


--
-- Data for Name: project_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_comments (id, content, author_name, comment_type, created_at, project_id) FROM stdin;
\.


--
-- Data for Name: project_congratulations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_congratulations (id, project_id, user_id, user_name, message, created_at) FROM stdin;
\.


--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_documents (id, project_id, file_name, original_name, file_size, mime_type, uploaded_by, uploaded_at) FROM stdin;
\.


--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.project_tasks (id, title, description, status, priority, assignee_name, due_date, created_at, updated_at, order_num, project_id, completed_at, "order", attachments, assignee_id, assignee_ids, assignee_names, completed_by, completed_by_name) FROM stdin;
39	Submit request in Catchafire	describe the project in Catchafire and find someone qualified to complete	completed	medium	Christine	2025-06-16	2025-06-27 21:55:57.813989	2025-06-27 21:55:57.813989	0	18	2025-07-06 10:00:00	0	\N	\N	\N	\N	user_1751493923615_nbcyq3am7	Christine
44	Create user login functions		completed	medium			2025-06-30 02:54:30.106932	2025-06-30 02:54:32.317	0	19	2025-07-06 10:00:00	0	\N	\N	\N	\N	user_1751071509329_mrkw2z95z	Katie Long
40	Create "news banner" for the site	News banner on the platform, “looking for leader for volunteer committee”	waiting	medium			2025-06-27 21:56:18.742766	2025-06-27 21:56:18.742766	0	19	\N	0	\N	\N	\N	\N	\N	\N
41	Create Grants section	with q&a format from old grants	waiting	medium			2025-06-27 21:56:41.319168	2025-06-27 21:56:41.319168	0	19	\N	0	\N	\N	\N	\N	\N	\N
43	Convert meeting minutes files to pdfs for web display		completed	medium			2025-06-27 21:57:52.462292	2025-06-30 03:57:27.807	0	19	2025-07-06 10:00:00	0	\N	\N	\N	\N	user_1751071509329_mrkw2z95z	Katie Long
38	Meeting 6/27		completed	medium		2025-06-24	2025-06-27 20:58:37.615626	2025-06-30 03:58:29.806	0	4	2025-07-06 10:00:00	0	\N	\N	\N	\N	user_1751071509329_mrkw2z95z	Katie Long
42	Get recipient agreement and driver agreement hosted on the website		waiting	medium			2025-06-27 21:57:29.279335	2025-06-27 21:57:29.279335	0	19	\N	0	\N	\N	\N	\N	\N	\N
48	get back first proofs		completed	medium	\N	2025-06-17	2025-07-06 17:55:58.658736	2025-07-06 17:55:58.658736	0	18	2025-07-06 10:00:00	0	\N	\N	\N	\N	user_1751493923615_nbcyq3am7	Christine
47	Christine Test Assignment	text describing the project - assigned to myself and will complete	completed	medium	\N	2025-07-07	2025-07-06 17:51:34.56653	2025-07-09 14:01:47.123	0	25	2025-07-06 10:00:00	0	\N	\N	{user_1751493923615_nbcyq3am7}	{"Christine Cooper Nowicki"}	user_1751493923615_nbcyq3am7	Christine
45	Test out direct messaging	Send a message to someone else on the platform and have them reply to it	waiting	medium		2025-06-30T00:00:00.000+00:00	2025-06-30 22:02:18.138732	2025-07-09 14:41:54.911	0	20	\N	0	\N	\N	{user_1751072243271_fc8jaxl6u,user_1751492211973_0pi1jdl3p,user_1751493923615_nbcyq3am7,user_1751071509329_mrkw2z95z,user_1751920534988_2cgbrae86,user_1751975120117_tltz2rc1a}	{"Marcy Louza","Stephanie Luis","Christine Cooper Nowicki","Katie Long","Vicki Tropauer","Kimberly Ross"}	\N	\N
46	Create a task within our shared assignment project to make sure this works		pending	medium	\N		2025-07-06 05:02:54.951705	2025-07-06 17:16:31.639	0	25	\N	0	\N	\N	{user_1751493923615_nbcyq3am7,user_1751072243271_fc8jaxl6u,user_1751492211973_0pi1jdl3p,user_1751071509329_mrkw2z95z}	{"Christine Cooper Nowicki","Marcy Louza","Stephanie Luis","Katie Long"}	\N	\N
51	Build work log function		in_progress	medium	\N	2025-07-09	2025-07-09 15:02:34.381664	2025-07-09 15:02:34.381664	0	19	\N	0	\N	\N	{user_1751071509329_mrkw2z95z}	{"Katie Long"}	\N	\N
49	ask for final edits	Reach out to Lori one last time and ask for input. Close out circle with Mark.	pending	medium	\N	2025-07-07	2025-07-06 18:01:14.661767	2025-07-06 18:01:14.661767	0	18	\N	0	\N	\N	\N	\N	\N	\N
50	close out with Mark	Christine to ask Mark for final edits and close out the catchafire task.	pending	medium	\N	2025-07-11	2025-07-06 18:04:16.454239	2025-07-06 18:04:16.454239	0	18	\N	0	\N	\N	\N	\N	\N	\N
52	Build suggestion portal		pending	urgent	\N		2025-07-09 15:02:58.919743	2025-07-09 15:02:58.919743	0	19	\N	0	\N	\N	{user_1751071509329_mrkw2z95z}	{"Katie Long"}	\N	\N
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.projects (id, title, description, status, assignee_id, assignee_name, color, priority, category, due_date, start_date, completion_date, progress_percentage, notes, tags, estimated_hours, actual_hours, created_at, updated_at, requirements, deliverables, resources, blockers, estimatedhours, actualhours, startdate, enddate, budget, risklevel, stakeholders, milestones, assignee_ids, assignee_names) FROM stdin;
19	Sandwich Project Platform Website		in_progress	\N	Katie Long	blue	medium	technology	2025-07-01		\N	40	\N	\N	0	\N	2025-06-27 21:55:56.884993	2025-06-30 03:57:28.091	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
21	Giving Circle Grant		completed	\N	Katie Long	blue	urgent	fundraising	\N		\N	0	\N	\N	0	\N	2025-06-30 23:08:02.013434	2025-07-02 03:35:42.177	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
22	Catchafire Video Creation	Instructional Video	in_progress	\N	Marcy Louza	blue	high	general			\N	0	\N	\N	0	\N	2025-07-02 03:40:04.838284	2025-07-02 03:40:04.838284	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
4	Catchafire AI Training		completed	\N	Marcy Louza	blue	medium	technology	\N	\N	\N	100	\N	\N	\N	\N	2025-06-09 02:24:11.954073	2025-07-02 03:41:25.304	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
18	Catchafire logo design for Portfolio partnership	Working with a graphic designer to develop a 1" round sticker to go on Portfolio Olive Oil bottles	in_progress	\N	Christine Cooper Nowicki	blue	medium	fundraising	2025-07-03	2025-06-14	\N	0	\N	\N	0	\N	2025-06-27 21:37:56.528342	2025-06-27 21:37:56.528342	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
23	Catchafire Data Project	Produce Sheets Document to collect and analyze sandwich numbers	completed	\N	Marcy Louza	blue	high	general	\N		\N	0	\N	\N	0	\N	2025-07-02 03:43:15.488201	2025-07-02 03:43:51.152	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
25	Successfully Updated Project Title	Testing the new multiple user assignment functionality	in_progress	\N	Marcy Louza, Katie Long, Katie Long	blue	medium	general	2025-07-10	\N	\N	50	\N	\N	\N	\N	2025-07-03 00:55:39.435856	2025-07-09 14:01:01.124	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	["admin_1751065261945", "user_1751071509329_mrkw2z95z"]	Admin User, Katie Long
20	Test Sandwich Project Platform		in_progress	\N	Katie Long, Marcy Louza, Stephanie Luis, Christine Cooper Nowicki, Vicki Tropauer, Kimberly Ross	blue	high	technology	2025-07-11		\N	0	\N	\N	0	\N	2025-06-30 03:59:14.140364	2025-07-09 14:41:56.075	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N
\.


--
-- Data for Name: recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipients (id, name, phone, email, address, preferences, status, created_at, updated_at, contact_name, weekly_estimate) FROM stdin;
19	Boys and Girls Club	404-516-0938	kevin.johnson@uss.salvationarmy.org	Downtown (west side)	turkey, Weekly Estimate: 100	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
20	Community Assistance Center	954-350-2756	gretty.figueroa@ourcac.org	Sandy Springs	deli only, Weekly Estimate: 200	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
21	Cross Cultural Ministries	404-790-0459	\N	Dunwoody (Karen)	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
22	Focus Recovery (Veterans Program)	404-247-6447	\N	Dunwoody (Karen)	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
23	Gateway Center	404-215-6651	dbenton@gatewatctr.org	Downtown	deli (will take pbj if necessary), Weekly Estimate: 700-1000+	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
24	Giving Grace /Remerge	678-437-2024	\N	Dunwoody (Karen)	pb&j, Weekly Estimate: 100	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
25	Hope Atlanta	404-000-0000	aolvey@hopeatlanta.org	Midtown (Ponce/Boulevard)	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
26	Intown Cares	404-000-0001	Laura.DeGroot@intowncares.org	Midtown (Ponce/Boulevard)	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
27	Lettum Eat	850-381-5936	info@lettumeat.com	Snellville	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
28	Melody (City of Atlanta/Hope Atlanta)	470-233-2362	rland@hopeatlanta.org	Downtown	60 deli & 60 pbj, Weekly Estimate: 120	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
29	Omega Support Center	770-362-6627	omegaservesall@gmail.com	Tucker	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
30	St. Vincent de Paul (Outreach Program)	404-000-0002	aseeley@svdpgeorgia.org	Chamblee	deli (will take pbj), Weekly Estimate: 500+	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
31	The Elizabeth Foundation	404-468-6503	tracy@elizabethfoundation.org	Buckhead	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
32	The Shrine of The Immaculate Conception	404-840-6267	tilla@catholicshrineatlanta.org	Downtown	deli and want pbj weekly, Weekly Estimate: 500 (varies)	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
33	The Table on Delk	407-509-2799	thetableondelk@gmail.com	Marietta	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
34	The Zone (Davis Direction Foundation)	404-437-8522	daniel.spinney@davisdirection.com	Marietta	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
35	Toco Hills Community Alliance	404-375-9875	lisa@tocohillsalliance.org	Toco Hills/Emory	\N	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
36	Zaban Paradies Center	770-687-7520	rnation@zabanparadiescenter.org	Midtown	deli, Weekly Estimate: 300	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
37	Eye Believe Foundation	404-000-0003	\N	\N	any, Weekly Estimate: 1000-3000	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
38	True Worship / Angie's Kitchen	404-287-8292	helen@angieskitchen.org	\N	as requested consistently	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
39	City of Atlanta Mayor's Office Initiative	404-215-6600	chchu@atlantaga.gov	\N	by request consistently	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
40	Operation Peace	404-347-4040	opeace@bellsouth.net	\N	as needed consistently	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
41	The Goodman Group	757-338-2668	thegoodmangrouporg@gmail.com	\N	as requested (often)	active	2025-06-08 01:52:12.437601	2025-06-08 01:52:12.437601	\N	\N
\.


--
-- Data for Name: sandwich_collections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sandwich_collections (id, collection_date, host_name, individual_sandwiches, group_collections, submitted_at) FROM stdin;
2497	2024-07-17	Alpharetta	3333	[]	2025-06-08 17:05:45.157
1279	2021-09-15	Alpharetta	600	[]	2025-06-08 17:04:09.158
1285	2021-09-22	Alpharetta	790	[]	2025-06-08 17:04:09.615
1283	2021-09-15	East Cobb/Roswell	160	[]	2025-06-08 17:04:09.463
1282	2021-09-15	East Cobb/Roswell	1071	[]	2025-06-08 17:04:09.387
1284	2021-09-15	Sandy Springs	419	[]	2025-06-08 17:04:09.539
2498	2024-07-17	Dunwoody/PTC	1513	[]	2025-06-08 17:05:45.233
2500	2024-07-17	Decatur	101	[]	2025-06-08 17:05:45.387
1280	2021-09-15	Oak Grove	451	[]	2025-06-08 17:04:09.234
1292	2021-09-29	Alpharetta	594	[]	2025-06-08 17:04:10.146
1299	2021-10-06	Alpharetta	651	[]	2025-06-08 17:04:10.678
1305	2021-10-13	Alpharetta	509	[]	2025-06-08 17:04:11.194
1312	2021-10-20	Alpharetta	1005	[]	2025-06-08 17:04:11.727
1318	2021-10-27	Alpharetta	1043	[]	2025-06-08 17:04:12.187
1324	2021-11-03	Alpharetta	1247	[]	2025-06-08 17:04:12.642
1330	2021-11-10	Alpharetta	851	[]	2025-06-08 17:04:13.204
1336	2021-11-17	Alpharetta	777	[]	2025-06-08 17:04:13.665
1343	2021-11-22	Alpharetta	939	[]	2025-06-08 17:04:14.194
1349	2021-12-01	Alpharetta	540	[]	2025-06-08 17:04:14.651
1355	2021-12-08	Alpharetta	939	[]	2025-06-08 17:04:15.211
1362	2021-12-15	Alpharetta	868	[]	2025-06-08 17:04:15.743
1369	2022-01-03	Alpharetta	818	[]	2025-06-08 17:04:16.273
1372	2022-01-05	Alpharetta	438	[]	2025-06-08 17:04:16.501
1377	2022-01-17	Alpharetta	900	[]	2025-06-08 17:04:16.88
1382	2022-01-19	Alpharetta	649	[]	2025-06-08 17:04:17.259
1389	2022-01-26	Alpharetta	842	[]	2025-06-08 17:04:17.843
1387	2022-01-19	East Cobb/Roswell	351	[]	2025-06-08 17:04:17.691
1375	2022-01-05	East Cobb/Roswell	371	[]	2025-06-08 17:04:16.729
1374	2022-01-05	East Cobb/Roswell	1292	[]	2025-06-08 17:04:16.653
1367	2021-12-15	East Cobb/Roswell	558	[]	2025-06-08 17:04:16.122
1365	2021-12-15	East Cobb/Roswell	2214	[]	2025-06-08 17:04:15.97
1360	2021-12-08	East Cobb/Roswell	307	[]	2025-06-08 17:04:15.59
1358	2021-12-08	East Cobb/Roswell	1688	[]	2025-06-08 17:04:15.438
1353	2021-12-01	East Cobb/Roswell	166	[]	2025-06-08 17:04:14.954
1352	2021-12-01	East Cobb/Roswell	1585	[]	2025-06-08 17:04:14.878
1347	2021-11-22	East Cobb/Roswell	470	[]	2025-06-08 17:04:14.499
1345	2021-11-22	East Cobb/Roswell	2204	[]	2025-06-08 17:04:14.346
1339	2021-11-17	East Cobb/Roswell	1180	[]	2025-06-08 17:04:13.89
1334	2021-11-10	East Cobb/Roswell	245	[]	2025-06-08 17:04:13.514
1333	2021-11-10	East Cobb/Roswell	1231	[]	2025-06-08 17:04:13.438
1328	2021-11-03	East Cobb/Roswell	184	[]	2025-06-08 17:04:12.947
1327	2021-11-03	East Cobb/Roswell	2144	[]	2025-06-08 17:04:12.87
1322	2021-10-27	East Cobb/Roswell	130	[]	2025-06-08 17:04:12.491
1321	2021-10-27	East Cobb/Roswell	1229	[]	2025-06-08 17:04:12.414
1316	2021-10-20	East Cobb/Roswell	188	[]	2025-06-08 17:04:12.032
1315	2021-10-20	East Cobb/Roswell	1218	[]	2025-06-08 17:04:11.956
1308	2021-10-13	East Cobb/Roswell	1328	[]	2025-06-08 17:04:11.422
1303	2021-10-06	East Cobb/Roswell	126	[]	2025-06-08 17:04:10.982
1302	2021-10-06	East Cobb/Roswell	866	[]	2025-06-08 17:04:10.906
1297	2021-09-29	East Cobb/Roswell	114	[]	2025-06-08 17:04:10.525
1296	2021-09-29	East Cobb/Roswell	1855	[]	2025-06-08 17:04:10.449
1290	2021-09-22	East Cobb/Roswell	99	[]	2025-06-08 17:04:09.994
1288	2021-09-22	East Cobb/Roswell	988	[]	2025-06-08 17:04:09.842
1388	2022-01-19	Sandy Springs	162	[]	2025-06-08 17:04:17.767
1381	2022-01-17	Sandy Springs	513	[]	2025-06-08 17:04:17.183
1376	2022-01-05	Sandy Springs	1013	[]	2025-06-08 17:04:16.804
1368	2021-12-15	Sandy Springs	575	[]	2025-06-08 17:04:16.198
1361	2021-12-08	Sandy Springs	850	[]	2025-06-08 17:04:15.666
1354	2021-12-01	Sandy Springs	386	[]	2025-06-08 17:04:15.134
1342	2021-11-17	Sandy Springs	390	[]	2025-06-08 17:04:14.118
1335	2021-11-10	Sandy Springs	373	[]	2025-06-08 17:04:13.59
1329	2021-11-03	Sandy Springs	500	[]	2025-06-08 17:04:13.119
1323	2021-10-27	Sandy Springs	285	[]	2025-06-08 17:04:12.567
1317	2021-10-20	Sandy Springs	598	[]	2025-06-08 17:04:12.109
1311	2021-10-13	Sandy Springs	210	[]	2025-06-08 17:04:11.651
1304	2021-10-06	Sandy Springs	660	[]	2025-06-08 17:04:11.119
1298	2021-09-29	Sandy Springs	127	[]	2025-06-08 17:04:10.603
1291	2021-09-22	Sandy Springs	425	[]	2025-06-08 17:04:10.069
1390	2022-01-26	Dunwoody/PTC	3975	[]	2025-06-08 17:04:17.919
1384	2022-01-19	Dunwoody/PTC	2412	[]	2025-06-08 17:04:17.412
1379	2022-01-17	Dunwoody/PTC	5033	[]	2025-06-08 17:04:17.032
1373	2022-01-05	Dunwoody/PTC	3293	[]	2025-06-08 17:04:16.577
1364	2021-12-15	Dunwoody/PTC	1890	[]	2025-06-08 17:04:15.894
1357	2021-12-08	Dunwoody/PTC	2553	[]	2025-06-08 17:04:15.362
1351	2021-12-01	Dunwoody/PTC	2432	[]	2025-06-08 17:04:14.803
1344	2021-11-22	Dunwoody/PTC	2720	[]	2025-06-08 17:04:14.272
1338	2021-11-17	Dunwoody/PTC	3517	[]	2025-06-08 17:04:13.815
1326	2021-11-03	Dunwoody/PTC	2555	[]	2025-06-08 17:04:12.795
1320	2021-10-27	Dunwoody/PTC	2806	[]	2025-06-08 17:04:12.339
1314	2021-10-20	Dunwoody/PTC	1874	[]	2025-06-08 17:04:11.88
1307	2021-10-13	Dunwoody/PTC	1522	[]	2025-06-08 17:04:11.347
1301	2021-10-06	Dunwoody/PTC	2225	[]	2025-06-08 17:04:10.829
1295	2021-09-29	Dunwoody/PTC	1865	[]	2025-06-08 17:04:10.374
1287	2021-09-22	Dunwoody/PTC	2008	[]	2025-06-08 17:04:09.766
1386	2022-01-19	Decatur	566	[]	2025-06-08 17:04:17.614
1370	2022-01-03	Decatur	106	[]	2025-06-08 17:04:16.349
1366	2021-12-15	Decatur	80	[]	2025-06-08 17:04:16.046
1359	2021-12-08	Decatur	530	[]	2025-06-08 17:04:15.513
1346	2021-11-22	Decatur	10	[]	2025-06-08 17:04:14.422
1340	2021-11-17	Decatur	166	[]	2025-06-08 17:04:13.966
1309	2021-10-13	Decatur	9	[]	2025-06-08 17:04:11.498
1289	2021-09-22	Decatur	30	[]	2025-06-08 17:04:09.918
1371	2022-01-03	Snellville	120	[]	2025-06-08 17:04:16.425
1363	2021-12-15	Oak Grove	103	[]	2025-06-08 17:04:15.819
1356	2021-12-08	Oak Grove	60	[]	2025-06-08 17:04:15.286
1350	2021-12-01	Oak Grove	73	[]	2025-06-08 17:04:14.727
1337	2021-11-17	Oak Grove	82	[]	2025-06-08 17:04:13.74
1331	2021-11-10	Oak Grove	122	[]	2025-06-08 17:04:13.282
1325	2021-11-03	Oak Grove	112	[]	2025-06-08 17:04:12.719
1319	2021-10-27	Oak Grove	308	[]	2025-06-08 17:04:12.262
1313	2021-10-20	Oak Grove	40	[]	2025-06-08 17:04:11.804
1306	2021-10-13	Oak Grove	72	[]	2025-06-08 17:04:11.27
1300	2021-10-06	Oak Grove	120	[]	2025-06-08 17:04:10.754
1294	2021-09-29	Oak Grove	60	[]	2025-06-08 17:04:10.298
1286	2021-09-22	Oak Grove	48	[]	2025-06-08 17:04:09.69
1383	2022-01-19	Buckhead	263	[]	2025-06-08 17:04:17.335
1378	2022-01-17	Buckhead	225	[]	2025-06-08 17:04:16.956
1293	2021-09-29	Buckhead	273	[]	2025-06-08 17:04:10.222
1395	2022-02-02	Alpharetta	974	[]	2025-06-08 17:04:18.308
1404	2022-02-03	Alpharetta	2236	[]	2025-06-08 17:04:18.992
1413	2022-02-04	Alpharetta	1801	[]	2025-06-08 17:04:19.769
1421	2022-02-05	Alpharetta	1190	[]	2025-06-08 17:04:20.377
1429	2022-02-06	Alpharetta	1569	[]	2025-06-08 17:04:20.985
1438	2022-02-07	Alpharetta	1054	[]	2025-06-08 17:04:21.774
1447	2022-02-08	Alpharetta	2291	[]	2025-06-08 17:04:22.462
1458	2022-02-09	Alpharetta	2291	[]	2025-06-08 17:04:23.299
1469	2022-02-10	Alpharetta	1699	[]	2025-06-08 17:04:24.199
1482	2022-02-11	Alpharetta	867	[]	2025-06-08 17:04:25.183
1491	2022-02-12	Alpharetta	1134	[]	2025-06-08 17:04:25.87
1485	2022-02-11	East Cobb/Roswell	2156	[]	2025-06-08 17:04:25.411
1475	2022-02-10	East Cobb/Roswell	432	[]	2025-06-08 17:04:24.654
1473	2022-02-10	East Cobb/Roswell	1911	[]	2025-06-08 17:04:24.502
1462	2022-02-09	East Cobb/Roswell	1240	[]	2025-06-08 17:04:23.603
1463	2022-02-09	East Cobb/Roswell	432	[]	2025-06-08 17:04:23.678
1452	2022-02-08	East Cobb/Roswell	230	[]	2025-06-08 17:04:22.845
1451	2022-02-08	East Cobb/Roswell	1330	[]	2025-06-08 17:04:22.768
1443	2022-02-07	East Cobb/Roswell	773	[]	2025-06-08 17:04:22.154
1442	2022-02-07	East Cobb/Roswell	1877	[]	2025-06-08 17:04:22.078
1433	2022-02-06	East Cobb/Roswell	1809	[]	2025-06-08 17:04:21.288
1426	2022-02-05	East Cobb/Roswell	551	[]	2025-06-08 17:04:20.757
1425	2022-02-05	East Cobb/Roswell	1803	[]	2025-06-08 17:04:20.681
1418	2022-02-04	East Cobb/Roswell	462	[]	2025-06-08 17:04:20.148
1416	2022-02-04	East Cobb/Roswell	2311	[]	2025-06-08 17:04:19.997
1410	2022-02-03	East Cobb/Roswell	344	[]	2025-06-08 17:04:19.449
1408	2022-02-03	East Cobb/Roswell	1861	[]	2025-06-08 17:04:19.295
1401	2022-02-02	East Cobb/Roswell	252	[]	2025-06-08 17:04:18.764
1399	2022-02-02	East Cobb/Roswell	2011	[]	2025-06-08 17:04:18.612
1393	2022-01-26	East Cobb/Roswell	282	[]	2025-06-08 17:04:18.155
1487	2022-02-11	Sandy Springs	259	[]	2025-06-08 17:04:25.563
1476	2022-02-10	Sandy Springs	529	[]	2025-06-08 17:04:24.729
1464	2022-02-09	Sandy Springs	253	[]	2025-06-08 17:04:23.754
1453	2022-02-08	Sandy Springs	330	[]	2025-06-08 17:04:22.92
1444	2022-02-07	Sandy Springs	443	[]	2025-06-08 17:04:22.23
1436	2022-02-06	Sandy Springs	364	[]	2025-06-08 17:04:21.62
1427	2022-02-05	Sandy Springs	442	[]	2025-06-08 17:04:20.833
1419	2022-02-04	Sandy Springs	486	[]	2025-06-08 17:04:20.224
1411	2022-02-03	Sandy Springs	401	[]	2025-06-08 17:04:19.617
1402	2022-02-02	Sandy Springs	120	[]	2025-06-08 17:04:18.84
1394	2022-01-26	Sandy Springs	755	[]	2025-06-08 17:04:18.231
1488	2022-02-11	Intown/Druid Hills	275	[]	2025-06-08 17:04:25.639
1477	2022-02-10	Intown/Druid Hills	237	[]	2025-06-08 17:04:24.805
1465	2022-02-09	Intown/Druid Hills	90	[]	2025-06-08 17:04:23.83
1454	2022-02-08	Intown/Druid Hills	235	[]	2025-06-08 17:04:22.996
1445	2022-02-07	Intown/Druid Hills	102	[]	2025-06-08 17:04:22.311
1437	2022-02-06	Intown/Druid Hills	368	[]	2025-06-08 17:04:21.695
1420	2022-02-04	Intown/Druid Hills	224	[]	2025-06-08 17:04:20.3
1412	2022-02-03	Intown/Druid Hills	130	[]	2025-06-08 17:04:19.694
1403	2022-02-02	Intown/Druid Hills	185	[]	2025-06-08 17:04:18.916
1493	2022-02-12	Dunwoody/PTC	2774	[]	2025-06-08 17:04:26.022
1484	2022-02-11	Dunwoody/PTC	2267	[]	2025-06-08 17:04:25.334
1472	2022-02-10	Dunwoody/PTC	2068	[]	2025-06-08 17:04:24.426
1461	2022-02-09	Dunwoody/PTC	3471	[]	2025-06-08 17:04:23.527
1450	2022-02-08	Dunwoody/PTC	1927	[]	2025-06-08 17:04:22.692
1441	2022-02-07	Dunwoody/PTC	2844	[]	2025-06-08 17:04:22.003
1432	2022-02-06	Dunwoody/PTC	3121	[]	2025-06-08 17:04:21.213
1424	2022-02-05	Dunwoody/PTC	3564	[]	2025-06-08 17:04:20.605
1415	2022-02-04	Dunwoody/PTC	4550	[]	2025-06-08 17:04:19.921
1407	2022-02-03	Dunwoody/PTC	2341	[]	2025-06-08 17:04:19.22
1398	2022-02-02	Dunwoody/PTC	2478	[]	2025-06-08 17:04:18.537
1474	2022-02-10	Decatur	107	[]	2025-06-08 17:04:24.578
1434	2022-02-06	Decatur	68	[]	2025-06-08 17:04:21.364
1417	2022-02-04	Decatur	165	[]	2025-06-08 17:04:20.073
1409	2022-02-03	Decatur	84	[]	2025-06-08 17:04:19.372
1400	2022-02-02	Decatur	39	[]	2025-06-08 17:04:18.688
1392	2022-01-26	Decatur	28	[]	2025-06-08 17:04:18.074
1489	2022-02-11	Snellville	125	[]	2025-06-08 17:04:25.715
1478	2022-02-10	Snellville	125	[]	2025-06-08 17:04:24.88
1455	2022-02-08	Snellville	150	[]	2025-06-08 17:04:23.072
1446	2022-02-07	Snellville	80	[]	2025-06-08 17:04:22.387
1471	2022-02-10	Oak Grove	145	[]	2025-06-08 17:04:24.35
1460	2022-02-09	Oak Grove	61	[]	2025-06-08 17:04:23.45
1449	2022-02-08	Oak Grove	110	[]	2025-06-08 17:04:22.617
1440	2022-02-07	Oak Grove	287	[]	2025-06-08 17:04:21.927
1431	2022-02-06	Oak Grove	391	[]	2025-06-08 17:04:21.137
1423	2022-02-05	Oak Grove	200	[]	2025-06-08 17:04:20.529
1406	2022-02-03	Oak Grove	100	[]	2025-06-08 17:04:19.144
1397	2022-02-02	Oak Grove	239	[]	2025-06-08 17:04:18.461
1492	2022-02-12	Buckhead	282	[]	2025-06-08 17:04:25.946
1483	2022-02-11	Buckhead	125	[]	2025-06-08 17:04:25.258
1470	2022-02-10	Buckhead	616	[]	2025-06-08 17:04:24.275
1459	2022-02-09	Buckhead	516	[]	2025-06-08 17:04:23.374
1448	2022-02-08	Buckhead	638	[]	2025-06-08 17:04:22.538
1439	2022-02-07	Buckhead	486	[]	2025-06-08 17:04:21.85
1430	2022-02-06	Buckhead	1326	[]	2025-06-08 17:04:21.06
1422	2022-02-05	Buckhead	422	[]	2025-06-08 17:04:20.452
1414	2022-02-04	Buckhead	276	[]	2025-06-08 17:04:19.845
1405	2022-02-03	Buckhead	335	[]	2025-06-08 17:04:19.068
1396	2022-02-02	Buckhead	530	[]	2025-06-08 17:04:18.386
1490	2022-02-11	Woodstock	39	[]	2025-06-08 17:04:25.791
1480	2022-02-10	Woodstock	131	[]	2025-06-08 17:04:25.031
1457	2022-02-08	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":160}]	2025-06-08 17:04:23.223
1468	2022-02-09	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1837}]	2025-06-08 17:04:24.123
1503	2022-02-13	Alpharetta	2165	[]	2025-06-08 17:04:26.782
1513	2022-02-14	Alpharetta	1379	[]	2025-06-08 17:04:27.648
1524	2022-02-15	Alpharetta	1030	[]	2025-06-08 17:04:28.478
1535	2022-05-11	Alpharetta	1574	[]	2025-06-08 17:04:29.317
1544	2022-05-18	Alpharetta	1457	[]	2025-06-08 17:04:30.119
1556	2022-05-15	Alpharetta	1457	[]	2025-06-08 17:04:31.03
1568	2022-06-01	Alpharetta	634	[]	2025-06-08 17:04:31.945
1575	2022-06-08	Alpharetta	1471	[]	2025-06-08 17:04:32.475
1587	2022-06-15	Alpharetta	1232	[]	2025-06-08 17:04:33.464
1596	2022-06-22	Alpharetta	1147	[]	2025-06-08 17:04:34.147
1591	2022-06-15	East Cobb/Roswell	557	[]	2025-06-08 17:04:33.768
1580	2022-06-08	East Cobb/Roswell	453	[]	2025-06-08 17:04:32.932
1578	2022-06-08	East Cobb/Roswell	2163	[]	2025-06-08 17:04:32.782
1572	2022-06-01	East Cobb/Roswell	433	[]	2025-06-08 17:04:32.248
1571	2022-06-01	East Cobb/Roswell	1695	[]	2025-06-08 17:04:32.172
1547	2022-05-18	East Cobb/Roswell	1842	[]	2025-06-08 17:04:30.346
1549	2022-05-18	East Cobb/Roswell	165	[]	2025-06-08 17:04:30.499
1559	2022-05-15	East Cobb/Roswell	1747	[]	2025-06-08 17:04:31.258
1561	2022-05-15	East Cobb/Roswell	187	[]	2025-06-08 17:04:31.41
1540	2022-05-11	East Cobb/Roswell	699	[]	2025-06-08 17:04:29.696
1538	2022-05-11	East Cobb/Roswell	1999	[]	2025-06-08 17:04:29.545
1527	2022-02-15	East Cobb/Roswell	1570	[]	2025-06-08 17:04:28.707
1518	2022-02-14	East Cobb/Roswell	503	[]	2025-06-08 17:04:28.025
1516	2022-02-14	East Cobb/Roswell	2817	[]	2025-06-08 17:04:27.875
1507	2022-02-13	East Cobb/Roswell	829	[]	2025-06-08 17:04:27.193
1506	2022-02-13	East Cobb/Roswell	2760	[]	2025-06-08 17:04:27.118
1496	2022-02-12	East Cobb/Roswell	211	[]	2025-06-08 17:04:26.25
1581	2022-06-08	Sandy Springs	20	[]	2025-06-08 17:04:33.008
1550	2022-05-18	Sandy Springs	256	[]	2025-06-08 17:04:30.575
1562	2022-05-15	Sandy Springs	136	[]	2025-06-08 17:04:31.488
1541	2022-05-11	Sandy Springs	569	[]	2025-06-08 17:04:29.772
1530	2022-02-15	Sandy Springs	480	[]	2025-06-08 17:04:28.935
1519	2022-02-14	Sandy Springs	503	[]	2025-06-08 17:04:28.101
1508	2022-02-13	Sandy Springs	352	[]	2025-06-08 17:04:27.268
1497	2022-02-12	Sandy Springs	325	[]	2025-06-08 17:04:26.325
1582	2022-06-08	Intown/Druid Hills	270	[]	2025-06-08 17:04:33.084
1573	2022-06-01	Intown/Druid Hills	76	[]	2025-06-08 17:04:32.324
1551	2022-05-18	Intown/Druid Hills	118	[]	2025-06-08 17:04:30.651
1563	2022-05-15	Intown/Druid Hills	86	[]	2025-06-08 17:04:31.564
1542	2022-05-11	Intown/Druid Hills	86	[]	2025-06-08 17:04:29.848
1531	2022-02-15	Intown/Druid Hills	62	[]	2025-06-08 17:04:29.011
1520	2022-02-14	Intown/Druid Hills	380	[]	2025-06-08 17:04:28.177
1509	2022-02-13	Intown/Druid Hills	247	[]	2025-06-08 17:04:27.345
1498	2022-02-12	Intown/Druid Hills	112	[]	2025-06-08 17:04:26.401
1598	2022-06-22	Dunwoody/PTC	3174	[]	2025-06-08 17:04:34.298
1589	2022-06-15	Dunwoody/PTC	2032	[]	2025-06-08 17:04:33.616
1577	2022-06-08	Dunwoody/PTC	2404	[]	2025-06-08 17:04:32.706
1570	2022-06-01	Dunwoody/PTC	1855	[]	2025-06-08 17:04:32.096
1546	2022-05-18	Dunwoody/PTC	2532	[]	2025-06-08 17:04:30.27
1558	2022-05-15	Dunwoody/PTC	2415	[]	2025-06-08 17:04:31.182
1537	2022-05-11	Dunwoody/PTC	3729	[]	2025-06-08 17:04:29.469
1526	2022-02-15	Dunwoody/PTC	2707	[]	2025-06-08 17:04:28.631
1515	2022-02-14	Dunwoody/PTC	3034	[]	2025-06-08 17:04:27.798
1505	2022-02-13	Dunwoody/PTC	3490	[]	2025-06-08 17:04:26.933
1579	2022-06-08	Decatur	120	[]	2025-06-08 17:04:32.857
1548	2022-05-18	Decatur	77	[]	2025-06-08 17:04:30.423
1560	2022-05-15	Decatur	112	[]	2025-06-08 17:04:31.334
1528	2022-02-15	Decatur	195	[]	2025-06-08 17:04:28.782
1517	2022-02-14	Decatur	85	[]	2025-06-08 17:04:27.95
1495	2022-02-12	Decatur	21	[]	2025-06-08 17:04:26.175
1593	2022-06-15	Snellville	160	[]	2025-06-08 17:04:33.919
1583	2022-06-08	Snellville	170	[]	2025-06-08 17:04:33.161
1574	2022-06-01	Snellville	128	[]	2025-06-08 17:04:32.399
1552	2022-05-18	Snellville	121	[]	2025-06-08 17:04:30.727
1564	2022-05-15	Snellville	110	[]	2025-06-08 17:04:31.641
1543	2022-05-11	Snellville	115	[]	2025-06-08 17:04:29.924
1532	2022-02-15	Snellville	140	[]	2025-06-08 17:04:29.087
1521	2022-02-14	Snellville	116	[]	2025-06-08 17:04:28.252
1510	2022-02-13	Snellville	128	[]	2025-06-08 17:04:27.421
1499	2022-02-12	Snellville	105	[]	2025-06-08 17:04:26.477
1585	2022-06-08	Lenox/Brookhaven	19	[]	2025-06-08 17:04:33.312
1554	2022-05-18	Lenox/Brookhaven	208	[]	2025-06-08 17:04:30.879
1566	2022-05-15	Lenox/Brookhaven	155	[]	2025-06-08 17:04:31.793
1597	2022-06-22	Buckhead	278	[]	2025-06-08 17:04:34.222
1588	2022-06-15	Buckhead	1170	[]	2025-06-08 17:04:33.541
1576	2022-06-08	Buckhead	70	[]	2025-06-08 17:04:32.63
1569	2022-06-01	Buckhead	434	[]	2025-06-08 17:04:32.021
1545	2022-05-18	Buckhead	500	[]	2025-06-08 17:04:30.194
1557	2022-05-15	Buckhead	403	[]	2025-06-08 17:04:31.106
1536	2022-05-11	Buckhead	541	[]	2025-06-08 17:04:29.393
1525	2022-02-15	Buckhead	515	[]	2025-06-08 17:04:28.554
1514	2022-02-14	Buckhead	243	[]	2025-06-08 17:04:27.723
1504	2022-02-13	Buckhead	817	[]	2025-06-08 17:04:26.858
1501	2022-02-12	Woodstock	50	[]	2025-06-08 17:04:26.631
1502	2022-02-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1580}]	2025-06-08 17:04:26.707
1608	2022-06-29	Alpharetta	2340	[]	2025-06-08 17:04:35.12
1619	2022-07-06	Alpharetta	1144	[]	2025-06-08 17:04:35.957
1628	2022-07-13	Alpharetta	2688	[]	2025-06-08 17:04:36.638
1637	2022-07-20	Alpharetta	528	[]	2025-06-08 17:04:37.323
1648	2022-07-27	Alpharetta	1068	[]	2025-06-08 17:04:38.228
1658	2022-08-03	Alpharetta	760	[]	2025-06-08 17:04:38.986
1667	2022-08-10	Alpharetta	1697	[]	2025-06-08 17:04:39.774
1679	2022-08-17	Alpharetta	1339	[]	2025-06-08 17:04:40.683
1691	2022-08-31	Alpharetta	1310	[]	2025-06-08 17:04:41.593
1703	2022-09-07	Alpharetta	2611	[]	2025-06-08 17:04:42.611
1693	2022-08-31	East Cobb/Roswell	1321	[]	2025-06-08 17:04:41.744
1682	2022-08-17	East Cobb/Roswell	1132	[]	2025-06-08 17:04:40.911
1672	2022-08-10	East Cobb/Roswell	475	[]	2025-06-08 17:04:40.152
1670	2022-08-10	East Cobb/Roswell	1637	[]	2025-06-08 17:04:40.001
1663	2022-08-03	East Cobb/Roswell	401	[]	2025-06-08 17:04:39.365
1661	2022-08-03	East Cobb/Roswell	1845	[]	2025-06-08 17:04:39.214
1653	2022-07-27	East Cobb/Roswell	232	[]	2025-06-08 17:04:38.606
1651	2022-07-27	East Cobb/Roswell	2538	[]	2025-06-08 17:04:38.455
1641	2022-07-20	East Cobb/Roswell	272	[]	2025-06-08 17:04:37.694
1640	2022-07-20	East Cobb/Roswell	2533	[]	2025-06-08 17:04:37.618
1631	2022-07-13	East Cobb/Roswell	2168	[]	2025-06-08 17:04:36.865
1624	2022-07-06	East Cobb/Roswell	341	[]	2025-06-08 17:04:36.335
1622	2022-07-06	East Cobb/Roswell	2167	[]	2025-06-08 17:04:36.184
1612	2022-06-29	East Cobb/Roswell	591	[]	2025-06-08 17:04:35.426
1610	2022-06-29	East Cobb/Roswell	3182	[]	2025-06-08 17:04:35.272
1601	2022-06-22	East Cobb/Roswell	703	[]	2025-06-08 17:04:34.525
1696	2022-08-31	Sandy Springs	32	[]	2025-06-08 17:04:41.972
1685	2022-08-17	Sandy Springs	265	[]	2025-06-08 17:04:41.138
1673	2022-08-10	Sandy Springs	84	[]	2025-06-08 17:04:40.228
1664	2022-08-03	Sandy Springs	18	[]	2025-06-08 17:04:39.441
1642	2022-07-20	Sandy Springs	104	[]	2025-06-08 17:04:37.77
1634	2022-07-13	Sandy Springs	67	[]	2025-06-08 17:04:37.094
1625	2022-07-06	Sandy Springs	170	[]	2025-06-08 17:04:36.411
1613	2022-06-29	Sandy Springs	80	[]	2025-06-08 17:04:35.502
1602	2022-06-22	Sandy Springs	44	[]	2025-06-08 17:04:34.6
1674	2022-08-10	Intown/Druid Hills	175	[]	2025-06-08 17:04:40.304
1665	2022-08-03	Intown/Druid Hills	42	[]	2025-06-08 17:04:39.622
1654	2022-07-27	Intown/Druid Hills	90	[]	2025-06-08 17:04:38.682
1643	2022-07-20	Intown/Druid Hills	268	[]	2025-06-08 17:04:37.846
1626	2022-07-06	Intown/Druid Hills	210	[]	2025-06-08 17:04:36.486
1614	2022-06-29	Intown/Druid Hills	185	[]	2025-06-08 17:04:35.578
1603	2022-06-22	Intown/Druid Hills	235	[]	2025-06-08 17:04:34.675
1692	2022-08-31	Dunwoody/PTC	1819	[]	2025-06-08 17:04:41.669
1681	2022-08-17	Dunwoody/PTC	1818	[]	2025-06-08 17:04:40.835
1669	2022-08-10	Dunwoody/PTC	1616	[]	2025-06-08 17:04:39.925
1660	2022-08-03	Dunwoody/PTC	1319	[]	2025-06-08 17:04:39.138
1650	2022-07-27	Dunwoody/PTC	1970	[]	2025-06-08 17:04:38.379
1639	2022-07-20	Dunwoody/PTC	2046	[]	2025-06-08 17:04:37.475
1630	2022-07-13	Dunwoody/PTC	1645	[]	2025-06-08 17:04:36.789
1621	2022-07-06	Dunwoody/PTC	1067	[]	2025-06-08 17:04:36.108
1609	2022-06-29	Dunwoody/PTC	1837	[]	2025-06-08 17:04:35.196
1694	2022-08-31	Decatur	147	[]	2025-06-08 17:04:41.82
1683	2022-08-17	Decatur	79	[]	2025-06-08 17:04:40.987
1671	2022-08-10	Decatur	72	[]	2025-06-08 17:04:40.076
1662	2022-08-03	Decatur	366	[]	2025-06-08 17:04:39.29
1652	2022-07-27	Decatur	104	[]	2025-06-08 17:04:38.53
1632	2022-07-13	Decatur	66	[]	2025-06-08 17:04:36.941
1611	2022-06-29	Decatur	54	[]	2025-06-08 17:04:35.351
1600	2022-06-22	Decatur	114	[]	2025-06-08 17:04:34.449
1698	2022-08-31	Snellville	220	[]	2025-06-08 17:04:42.234
1686	2022-08-17	Snellville	175	[]	2025-06-08 17:04:41.215
1675	2022-08-10	Snellville	135	[]	2025-06-08 17:04:40.38
1666	2022-08-03	Snellville	102	[]	2025-06-08 17:04:39.698
1655	2022-07-27	Snellville	142	[]	2025-06-08 17:04:38.759
1644	2022-07-20	Snellville	172	[]	2025-06-08 17:04:37.922
1635	2022-07-13	Snellville	99	[]	2025-06-08 17:04:37.171
1627	2022-07-06	Snellville	187	[]	2025-06-08 17:04:36.562
1615	2022-06-29	Snellville	82	[]	2025-06-08 17:04:35.653
1604	2022-06-22	Snellville	104	[]	2025-06-08 17:04:34.752
1700	2022-08-31	Lenox/Brookhaven	230	[]	2025-06-08 17:04:42.385
1688	2022-08-17	Lenox/Brookhaven	60	[]	2025-06-08 17:04:41.366
1677	2022-08-10	Lenox/Brookhaven	74	[]	2025-06-08 17:04:40.532
1646	2022-07-20	Lenox/Brookhaven	70	[]	2025-06-08 17:04:38.075
1636	2022-07-13	Lenox/Brookhaven	106	[]	2025-06-08 17:04:37.247
1617	2022-06-29	Lenox/Brookhaven	197	[]	2025-06-08 17:04:35.805
1606	2022-06-22	Lenox/Brookhaven	20	[]	2025-06-08 17:04:34.903
1701	2022-08-31	New Chastain	268	[]	2025-06-08 17:04:42.461
1680	2022-08-17	Buckhead	222	[]	2025-06-08 17:04:40.759
1668	2022-08-10	Buckhead	300	[]	2025-06-08 17:04:39.85
1659	2022-08-03	Buckhead	373	[]	2025-06-08 17:04:39.062
1649	2022-07-27	Buckhead	305	[]	2025-06-08 17:04:38.304
1638	2022-07-20	Buckhead	423	[]	2025-06-08 17:04:37.399
1629	2022-07-13	Buckhead	176	[]	2025-06-08 17:04:36.714
1620	2022-07-06	Buckhead	107	[]	2025-06-08 17:04:36.032
1607	2022-06-22	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1750}]	2025-06-08 17:04:34.979
1717	2022-09-14	Alpharetta	1043	[]	2025-06-08 17:04:43.675
1731	2022-09-21	Alpharetta	2590	[]	2025-06-08 17:04:44.814
1746	2022-09-28	Alpharetta	1009	[]	2025-06-08 17:04:45.951
1757	2022-10-05	Alpharetta	1058	[]	2025-06-08 17:04:46.853
1768	2022-10-12	Alpharetta	1161	[]	2025-06-08 17:04:47.689
1779	2022-10-19	Alpharetta	1097	[]	2025-06-08 17:04:48.522
1790	2022-10-26	Alpharetta	963	[]	2025-06-08 17:04:49.428
1801	2022-11-02	Alpharetta	783	[]	2025-06-08 17:04:50.265
1803	2022-11-02	East Cobb/Roswell	1149	[]	2025-06-08 17:04:50.415
1794	2022-10-26	East Cobb/Roswell	257	[]	2025-06-08 17:04:49.73
1792	2022-10-26	East Cobb/Roswell	852	[]	2025-06-08 17:04:49.577
1783	2022-10-19	East Cobb/Roswell	468	[]	2025-06-08 17:04:48.825
1781	2022-10-19	East Cobb/Roswell	1250	[]	2025-06-08 17:04:48.673
1772	2022-10-12	East Cobb/Roswell	322	[]	2025-06-08 17:04:47.991
1770	2022-10-12	East Cobb/Roswell	1078	[]	2025-06-08 17:04:47.84
1759	2022-10-05	East Cobb/Roswell	1215	[]	2025-06-08 17:04:47.005
1750	2022-09-28	East Cobb/Roswell	374	[]	2025-06-08 17:04:46.254
1748	2022-09-28	East Cobb/Roswell	1009	[]	2025-06-08 17:04:46.102
1737	2022-09-21	East Cobb/Roswell	453	[]	2025-06-08 17:04:45.268
1735	2022-09-21	East Cobb/Roswell	1559	[]	2025-06-08 17:04:45.116
1723	2022-09-14	East Cobb/Roswell	307	[]	2025-06-08 17:04:44.21
1721	2022-09-14	East Cobb/Roswell	1235	[]	2025-06-08 17:04:43.978
1708	2022-09-07	East Cobb/Roswell	226	[]	2025-06-08 17:04:42.991
1706	2022-09-07	East Cobb/Roswell	1118	[]	2025-06-08 17:04:42.839
1806	2022-11-02	Sandy Springs	688	[]	2025-06-08 17:04:50.642
1784	2022-10-19	Sandy Springs	615	[]	2025-06-08 17:04:48.903
1773	2022-10-12	Sandy Springs	390	[]	2025-06-08 17:04:48.066
1762	2022-10-05	Sandy Springs	96	[]	2025-06-08 17:04:47.233
1751	2022-09-28	Sandy Springs	245	[]	2025-06-08 17:04:46.331
1738	2022-09-21	Sandy Springs	192	[]	2025-06-08 17:04:45.343
1724	2022-09-14	Sandy Springs	123	[]	2025-06-08 17:04:44.286
1709	2022-09-07	Sandy Springs	30	[]	2025-06-08 17:04:43.067
1807	2022-11-02	Intown/Druid Hills	567	[]	2025-06-08 17:04:50.718
1796	2022-10-26	Intown/Druid Hills	760	[]	2025-06-08 17:04:49.884
1785	2022-10-19	Intown/Druid Hills	460	[]	2025-06-08 17:04:48.978
1774	2022-10-12	Intown/Druid Hills	360	[]	2025-06-08 17:04:48.142
1763	2022-10-05	Intown/Druid Hills	534	[]	2025-06-08 17:04:47.309
1752	2022-09-28	Intown/Druid Hills	389	[]	2025-06-08 17:04:46.408
1739	2022-09-21	Intown/Druid Hills	118	[]	2025-06-08 17:04:45.419
1725	2022-09-14	Intown/Druid Hills	75	[]	2025-06-08 17:04:44.361
1710	2022-09-07	Intown/Druid Hills	106	[]	2025-06-08 17:04:43.143
1799	2022-10-26	Flowery Branch	293	[]	2025-06-08 17:04:50.113
1788	2022-10-19	Flowery Branch	191	[]	2025-06-08 17:04:49.277
1766	2022-10-05	Flowery Branch	75	[]	2025-06-08 17:04:47.536
1755	2022-09-28	Flowery Branch	100	[]	2025-06-08 17:04:46.701
1802	2022-11-02	Dunwoody/PTC	2150	[]	2025-06-08 17:04:50.34
1791	2022-10-26	Dunwoody/PTC	1414	[]	2025-06-08 17:04:49.503
1780	2022-10-19	Dunwoody/PTC	1317	[]	2025-06-08 17:04:48.598
1769	2022-10-12	Dunwoody/PTC	1579	[]	2025-06-08 17:04:47.765
1758	2022-10-05	Dunwoody/PTC	1417	[]	2025-06-08 17:04:46.929
1747	2022-09-28	Dunwoody/PTC	1373	[]	2025-06-08 17:04:46.026
1734	2022-09-21	Dunwoody/PTC	831	[]	2025-06-08 17:04:45.041
1720	2022-09-14	Dunwoody/PTC	1981	[]	2025-06-08 17:04:43.903
1705	2022-09-07	Dunwoody/PTC	1458	[]	2025-06-08 17:04:42.764
1804	2022-11-02	Decatur	267	[]	2025-06-08 17:04:50.491
1793	2022-10-26	Decatur	353	[]	2025-06-08 17:04:49.654
1782	2022-10-19	Decatur	194	[]	2025-06-08 17:04:48.75
1771	2022-10-12	Decatur	136	[]	2025-06-08 17:04:47.916
1760	2022-10-05	Decatur	394	[]	2025-06-08 17:04:47.082
1749	2022-09-28	Decatur	334	[]	2025-06-08 17:04:46.178
1736	2022-09-21	Decatur	30	[]	2025-06-08 17:04:45.192
1722	2022-09-14	Decatur	54	[]	2025-06-08 17:04:44.134
1707	2022-09-07	Decatur	190	[]	2025-06-08 17:04:42.915
1797	2022-10-26	Snellville	158	[]	2025-06-08 17:04:49.96
1786	2022-10-19	Snellville	162	[]	2025-06-08 17:04:49.123
1775	2022-10-12	Snellville	158	[]	2025-06-08 17:04:48.219
1764	2022-10-05	Snellville	201	[]	2025-06-08 17:04:47.384
1753	2022-09-28	Snellville	140	[]	2025-06-08 17:04:46.484
1740	2022-09-21	Snellville	160	[]	2025-06-08 17:04:45.495
1726	2022-09-14	Snellville	190	[]	2025-06-08 17:04:44.436
1711	2022-09-07	Snellville	150	[]	2025-06-08 17:04:43.219
1742	2022-09-21	Lenox/Brookhaven	190	[]	2025-06-08 17:04:45.646
1728	2022-09-14	Lenox/Brookhaven	160	[]	2025-06-08 17:04:44.588
1714	2022-09-07	Lenox/Brookhaven	248	[]	2025-06-08 17:04:43.448
1743	2022-09-21	New Chastain	30	[]	2025-06-08 17:04:45.722
1729	2022-09-14	New Chastain	30	[]	2025-06-08 17:04:44.663
1715	2022-09-07	New Chastain	146	[]	2025-06-08 17:04:43.523
1744	2022-09-21	Glenwood Park	178	[]	2025-06-08 17:04:45.798
1733	2022-09-21	Oak Grove	120	[]	2025-06-08 17:04:44.965
1719	2022-09-14	Oak Grove	110	[]	2025-06-08 17:04:43.827
1732	2022-09-21	Buckhead	217	[]	2025-06-08 17:04:44.89
1718	2022-09-14	Buckhead	125	[]	2025-06-08 17:04:43.75
1704	2022-09-07	Buckhead	115	[]	2025-06-08 17:04:42.688
1713	2022-09-07	Woodstock	150	[]	2025-06-08 17:04:43.372
1716	2022-09-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1700}]	2025-06-08 17:04:43.599
1812	2022-11-09	Alpharetta	1939	[]	2025-06-08 17:04:51.098
1823	2022-11-16	Alpharetta	2897	[]	2025-06-08 17:04:52.007
1834	2022-11-30	Alpharetta	1543	[]	2025-06-08 17:04:52.841
1845	2022-12-07	Alpharetta	1134	[]	2025-06-08 17:04:53.726
1856	2022-12-14	Alpharetta	1471	[]	2025-06-08 17:04:54.558
1865	2022-12-21	Alpharetta	493	[]	2025-06-08 17:04:55.25
1874	2022-12-28	Alpharetta	799	[]	2025-06-08 17:04:55.935
1883	2023-01-04	Alpharetta	818	[]	2025-06-08 17:04:56.693
1892	2023-01-11	Alpharetta	888	[]	2025-06-08 17:04:57.378
1901	2023-01-18	Alpharetta	908	[]	2025-06-08 17:04:58.067
1910	2023-01-25	Alpharetta	1025	[]	2025-06-08 17:04:58.751
1912	2023-01-25	East Cobb/Roswell	1465	[]	2025-06-08 17:04:58.902
1903	2023-01-18	East Cobb/Roswell	1614	[]	2025-06-08 17:04:58.217
1894	2023-01-11	East Cobb/Roswell	650	[]	2025-06-08 17:04:57.533
1885	2023-01-04	East Cobb/Roswell	1204	[]	2025-06-08 17:04:56.845
1877	2022-12-28	East Cobb/Roswell	140	[]	2025-06-08 17:04:56.164
1868	2022-12-21	East Cobb/Roswell	321	[]	2025-06-08 17:04:55.479
1867	2022-12-21	East Cobb/Roswell	1856	[]	2025-06-08 17:04:55.402
1860	2022-12-14	East Cobb/Roswell	530	[]	2025-06-08 17:04:54.863
1858	2022-12-14	East Cobb/Roswell	1690	[]	2025-06-08 17:04:54.712
1849	2022-12-07	East Cobb/Roswell	410	[]	2025-06-08 17:04:54.029
1847	2022-12-07	East Cobb/Roswell	1826	[]	2025-06-08 17:04:53.878
1838	2022-11-30	East Cobb/Roswell	347	[]	2025-06-08 17:04:53.146
1836	2022-11-30	East Cobb/Roswell	1497	[]	2025-06-08 17:04:52.993
1827	2022-11-16	East Cobb/Roswell	324	[]	2025-06-08 17:04:52.309
1825	2022-11-16	East Cobb/Roswell	2098	[]	2025-06-08 17:04:52.158
1814	2022-11-09	East Cobb/Roswell	2101	[]	2025-06-08 17:04:51.249
1915	2023-01-25	Sandy Springs	710	[]	2025-06-08 17:04:59.2
1906	2023-01-18	Sandy Springs	603	[]	2025-06-08 17:04:58.447
1897	2023-01-11	Sandy Springs	514	[]	2025-06-08 17:04:57.764
1888	2023-01-04	Sandy Springs	250	[]	2025-06-08 17:04:57.074
1878	2022-12-28	Sandy Springs	40	[]	2025-06-08 17:04:56.239
1869	2022-12-21	Sandy Springs	184	[]	2025-06-08 17:04:55.556
1861	2022-12-14	Sandy Springs	560	[]	2025-06-08 17:04:54.945
1850	2022-12-07	Sandy Springs	517	[]	2025-06-08 17:04:54.105
1839	2022-11-30	Sandy Springs	948	[]	2025-06-08 17:04:53.222
1828	2022-11-16	Sandy Springs	3594	[]	2025-06-08 17:04:52.385
1817	2022-11-09	Sandy Springs	644	[]	2025-06-08 17:04:51.476
1907	2023-01-18	Intown/Druid Hills	627	[]	2025-06-08 17:04:58.524
1898	2023-01-11	Intown/Druid Hills	152	[]	2025-06-08 17:04:57.84
1889	2023-01-04	Intown/Druid Hills	206	[]	2025-06-08 17:04:57.149
1879	2022-12-28	Intown/Druid Hills	40	[]	2025-06-08 17:04:56.314
1862	2022-12-14	Intown/Druid Hills	235	[]	2025-06-08 17:04:55.021
1851	2022-12-07	Intown/Druid Hills	487	[]	2025-06-08 17:04:54.18
1840	2022-11-30	Intown/Druid Hills	363	[]	2025-06-08 17:04:53.298
1829	2022-11-16	Intown/Druid Hills	950	[]	2025-06-08 17:04:52.461
1818	2022-11-09	Intown/Druid Hills	816	[]	2025-06-08 17:04:51.625
1909	2023-01-18	Flowery Branch	490	[]	2025-06-08 17:04:58.675
1900	2023-01-11	Flowery Branch	291	[]	2025-06-08 17:04:57.991
1891	2023-01-04	Flowery Branch	412	[]	2025-06-08 17:04:57.302
1881	2022-12-28	Flowery Branch	247	[]	2025-06-08 17:04:56.466
1864	2022-12-14	Flowery Branch	301	[]	2025-06-08 17:04:55.174
1854	2022-12-07	Flowery Branch	247	[]	2025-06-08 17:04:54.407
1843	2022-11-30	Flowery Branch	431	[]	2025-06-08 17:04:53.573
1832	2022-11-16	Flowery Branch	393	[]	2025-06-08 17:04:52.688
1821	2022-11-09	Flowery Branch	324	[]	2025-06-08 17:04:51.853
1810	2022-11-02	Flowery Branch	387	[]	2025-06-08 17:04:50.945
1911	2023-01-25	Dunwoody/PTC	2023	[]	2025-06-08 17:04:58.826
1902	2023-01-18	Dunwoody/PTC	1243	[]	2025-06-08 17:04:58.142
1893	2023-01-11	Dunwoody/PTC	1422	[]	2025-06-08 17:04:57.454
1884	2023-01-04	Dunwoody/PTC	1326	[]	2025-06-08 17:04:56.769
1875	2022-12-28	Dunwoody/PTC	888	[]	2025-06-08 17:04:56.013
1866	2022-12-21	Dunwoody/PTC	1204	[]	2025-06-08 17:04:55.326
1857	2022-12-14	Dunwoody/PTC	2186	[]	2025-06-08 17:04:54.634
1835	2022-11-30	Dunwoody/PTC	1156	[]	2025-06-08 17:04:52.917
1824	2022-11-16	Dunwoody/PTC	1621	[]	2025-06-08 17:04:52.082
1813	2022-11-09	Dunwoody/PTC	2705	[]	2025-06-08 17:04:51.173
1913	2023-01-25	Decatur	345	[]	2025-06-08 17:04:58.978
1904	2023-01-18	Decatur	465	[]	2025-06-08 17:04:58.293
1895	2023-01-11	Decatur	622	[]	2025-06-08 17:04:57.613
1886	2023-01-04	Decatur	161	[]	2025-06-08 17:04:56.921
1859	2022-12-14	Decatur	233	[]	2025-06-08 17:04:54.787
1848	2022-12-07	Decatur	150	[]	2025-06-08 17:04:53.953
1837	2022-11-30	Decatur	248	[]	2025-06-08 17:04:53.069
1826	2022-11-16	Decatur	625	[]	2025-06-08 17:04:52.234
1815	2022-11-09	Decatur	154	[]	2025-06-08 17:04:51.325
1908	2023-01-18	Snellville	148	[]	2025-06-08 17:04:58.599
1899	2023-01-11	Snellville	151	[]	2025-06-08 17:04:57.916
1890	2023-01-04	Snellville	106	[]	2025-06-08 17:04:57.225
1871	2022-12-21	Snellville	210	[]	2025-06-08 17:04:55.708
1863	2022-12-14	Snellville	136	[]	2025-06-08 17:04:55.097
1852	2022-12-07	Snellville	100	[]	2025-06-08 17:04:54.256
1830	2022-11-16	Snellville	142	[]	2025-06-08 17:04:52.537
1819	2022-11-09	Snellville	105	[]	2025-06-08 17:04:51.701
1811	2022-11-02	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2437}]	2025-06-08 17:04:51.021
1919	2023-02-01	Alpharetta	1471	[]	2025-06-08 17:04:59.507
1930	2023-02-08	Alpharetta	1889	[]	2025-06-08 17:05:00.35
1937	2023-02-15	Alpharetta	2637	[]	2025-06-08 17:05:00.879
1947	2023-02-22	Alpharetta	2195	[]	2025-06-08 17:05:01.639
1957	2023-03-01	Alpharetta	1251	[]	2025-06-08 17:05:02.496
1965	2023-03-08	Alpharetta	1334	[]	2025-06-08 17:05:03.103
1973	2023-03-22	Alpharetta	3005	[]	2025-06-08 17:05:03.708
1981	2023-03-29	Alpharetta	702	[]	2025-06-08 17:05:04.327
1990	2023-04-05	Alpharetta	930	[]	2025-06-08 17:05:05.074
1999	2023-04-12	Alpharetta	1034	[]	2025-06-08 17:05:05.753
2008	2023-04-19	Alpharetta	1956	[]	2025-06-08 17:05:06.429
2017	2023-04-26	Alpharetta	1077	[]	2025-06-08 17:05:07.108
2010	2023-04-19	East Cobb/Roswell	1968	[]	2025-06-08 17:05:06.58
2001	2023-04-12	East Cobb/Roswell	1078	[]	2025-06-08 17:05:05.902
1992	2023-04-05	East Cobb/Roswell	1057	[]	2025-06-08 17:05:05.224
1975	2023-03-22	East Cobb/Roswell	882	[]	2025-06-08 17:05:03.862
1967	2023-03-08	East Cobb/Roswell	1075	[]	2025-06-08 17:05:03.254
1959	2023-03-01	East Cobb/Roswell	885	[]	2025-06-08 17:05:02.647
1949	2023-02-22	East Cobb/Roswell	1513	[]	2025-06-08 17:05:01.796
1939	2023-02-15	East Cobb/Roswell	1292	[]	2025-06-08 17:05:01.03
1932	2023-02-08	East Cobb/Roswell	872	[]	2025-06-08 17:05:00.501
1921	2023-02-01	East Cobb/Roswell	2096	[]	2025-06-08 17:04:59.662
2021	2023-04-26	Sandy Springs	1263	[]	2025-06-08 17:05:07.409
2012	2023-04-19	Sandy Springs	938	[]	2025-06-08 17:05:06.731
2003	2023-04-12	Sandy Springs	747	[]	2025-06-08 17:05:06.053
1994	2023-04-05	Sandy Springs	655	[]	2025-06-08 17:05:05.375
1985	2023-03-29	Sandy Springs	1319	[]	2025-06-08 17:05:04.695
1977	2023-03-22	Sandy Springs	747	[]	2025-06-08 17:05:04.025
1969	2023-03-08	Sandy Springs	313	[]	2025-06-08 17:05:03.405
1961	2023-03-01	Sandy Springs	958	[]	2025-06-08 17:05:02.797
1951	2023-02-22	Sandy Springs	618	[]	2025-06-08 17:05:01.947
1941	2023-02-15	Sandy Springs	479	[]	2025-06-08 17:05:01.181
1934	2023-02-08	Sandy Springs	531	[]	2025-06-08 17:05:00.652
1924	2023-02-01	Sandy Springs	988	[]	2025-06-08 17:04:59.892
2022	2023-04-26	Intown/Druid Hills	531	[]	2025-06-08 17:05:07.484
2013	2023-04-19	Intown/Druid Hills	377	[]	2025-06-08 17:05:06.806
2004	2023-04-12	Intown/Druid Hills	500	[]	2025-06-08 17:05:06.129
1995	2023-04-05	Intown/Druid Hills	493	[]	2025-06-08 17:05:05.45
1986	2023-03-29	Intown/Druid Hills	1328	[]	2025-06-08 17:05:04.771
1970	2023-03-08	Intown/Druid Hills	326	[]	2025-06-08 17:05:03.481
1962	2023-03-01	Intown/Druid Hills	350	[]	2025-06-08 17:05:02.872
1952	2023-02-22	Intown/Druid Hills	792	[]	2025-06-08 17:05:02.117
1942	2023-02-15	Intown/Druid Hills	855	[]	2025-06-08 17:05:01.257
1935	2023-02-08	Intown/Druid Hills	1176	[]	2025-06-08 17:05:00.728
1925	2023-02-01	Intown/Druid Hills	762	[]	2025-06-08 17:04:59.968
1916	2023-01-25	Intown/Druid Hills	605	[]	2025-06-08 17:04:59.276
2015	2023-04-19	Flowery Branch	496	[]	2025-06-08 17:05:06.957
2006	2023-04-12	Flowery Branch	300	[]	2025-06-08 17:05:06.279
1997	2023-04-05	Flowery Branch	267	[]	2025-06-08 17:05:05.601
1988	2023-03-29	Flowery Branch	471	[]	2025-06-08 17:05:04.922
1980	2023-03-22	Flowery Branch	371	[]	2025-06-08 17:05:04.251
1972	2023-03-08	Flowery Branch	536	[]	2025-06-08 17:05:03.632
1964	2023-03-01	Flowery Branch	436	[]	2025-06-08 17:05:03.028
1955	2023-02-22	Flowery Branch	1230	[]	2025-06-08 17:05:02.344
1945	2023-02-15	Flowery Branch	305	[]	2025-06-08 17:05:01.488
1928	2023-02-01	Flowery Branch	219	[]	2025-06-08 17:05:00.199
1918	2023-01-25	Flowery Branch	300	[]	2025-06-08 17:04:59.427
2018	2023-04-26	Dunwoody/PTC	4789	[]	2025-06-08 17:05:07.183
2009	2023-04-19	Dunwoody/PTC	2946	[]	2025-06-08 17:05:06.505
2000	2023-04-12	Dunwoody/PTC	2344	[]	2025-06-08 17:05:05.828
1991	2023-04-05	Dunwoody/PTC	3763	[]	2025-06-08 17:05:05.149
1974	2023-03-22	Dunwoody/PTC	2775	[]	2025-06-08 17:05:03.786
1966	2023-03-08	Dunwoody/PTC	2572	[]	2025-06-08 17:05:03.179
1958	2023-03-01	Dunwoody/PTC	2243	[]	2025-06-08 17:05:02.571
1948	2023-02-22	Dunwoody/PTC	2462	[]	2025-06-08 17:05:01.721
1938	2023-02-15	Dunwoody/PTC	2342	[]	2025-06-08 17:05:00.954
1931	2023-02-08	Dunwoody/PTC	1488	[]	2025-06-08 17:05:00.426
1920	2023-02-01	Dunwoody/PTC	1461	[]	2025-06-08 17:04:59.587
2020	2023-04-26	Decatur	232	[]	2025-06-08 17:05:07.334
1976	2023-03-22	Decatur	433	[]	2025-06-08 17:05:03.946
1968	2023-03-08	Decatur	220	[]	2025-06-08 17:05:03.33
1960	2023-03-01	Decatur	498	[]	2025-06-08 17:05:02.722
1950	2023-02-22	Decatur	72	[]	2025-06-08 17:05:01.872
1940	2023-02-15	Decatur	269	[]	2025-06-08 17:05:01.106
1933	2023-02-08	Decatur	140	[]	2025-06-08 17:05:00.576
1922	2023-02-01	Decatur	230	[]	2025-06-08 17:04:59.74
2005	2023-04-12	Snellville	107	[]	2025-06-08 17:05:06.204
1996	2023-04-05	Snellville	594	[]	2025-06-08 17:05:05.525
1987	2023-03-29	Snellville	104	[]	2025-06-08 17:05:04.846
1979	2023-03-22	Snellville	189	[]	2025-06-08 17:05:04.176
1971	2023-03-08	Snellville	217	[]	2025-06-08 17:05:03.557
1963	2023-03-01	Snellville	159	[]	2025-06-08 17:05:02.95
1953	2023-02-22	Snellville	103	[]	2025-06-08 17:05:02.193
1943	2023-02-15	Snellville	191	[]	2025-06-08 17:05:01.333
1936	2023-02-08	Snellville	187	[]	2025-06-08 17:05:00.803
1926	2023-02-01	Snellville	183	[]	2025-06-08 17:05:00.043
1917	2023-01-25	Snellville	166	[]	2025-06-08 17:04:59.351
2026	2023-05-03	Alpharetta	1091	[]	2025-06-08 17:05:07.852
2035	2023-05-10	Alpharetta	1266	[]	2025-06-08 17:05:08.533
2044	2023-05-17	Alpharetta	622	[]	2025-06-08 17:05:09.217
2053	2023-05-24	Alpharetta	2481	[]	2025-06-08 17:05:09.898
2061	2023-05-31	Alpharetta	574	[]	2025-06-08 17:05:10.574
2070	2023-06-07	Alpharetta	1095	[]	2025-06-08 17:05:11.287
2079	2023-06-14	Alpharetta	1399	[]	2025-06-08 17:05:11.966
2088	2023-06-21	Alpharetta	1724	[]	2025-06-08 17:05:12.695
2096	2023-06-28	Alpharetta	1672	[]	2025-06-08 17:05:13.3
2104	2023-07-11	Alpharetta	2143	[]	2025-06-08 17:05:13.904
2112	2023-07-19	Alpharetta	1035	[]	2025-06-08 17:05:14.632
2120	2023-07-26	Alpharetta	2097	[]	2025-06-08 17:05:15.237
2129	2023-08-02	Alpharetta	1528	[]	2025-06-08 17:05:15.917
2114	2023-07-19	East Cobb/Roswell	1448	[]	2025-06-08 17:05:14.783
2098	2023-06-28	East Cobb/Roswell	1880	[]	2025-06-08 17:05:13.451
2090	2023-06-21	East Cobb/Roswell	1882	[]	2025-06-08 17:05:12.846
2081	2023-06-14	East Cobb/Roswell	2231	[]	2025-06-08 17:05:12.117
2072	2023-06-07	East Cobb/Roswell	2439	[]	2025-06-08 17:05:11.438
2063	2023-05-31	East Cobb/Roswell	1607	[]	2025-06-08 17:05:10.726
2055	2023-05-24	East Cobb/Roswell	1235	[]	2025-06-08 17:05:10.121
2037	2023-05-10	East Cobb/Roswell	1341	[]	2025-06-08 17:05:08.685
2028	2023-05-03	East Cobb/Roswell	1646	[]	2025-06-08 17:05:08.003
2124	2023-07-26	Sandy Springs	690	[]	2025-06-08 17:05:15.539
2115	2023-07-19	Sandy Springs	532	[]	2025-06-08 17:05:14.859
2107	2023-07-11	Sandy Springs	481	[]	2025-06-08 17:05:14.131
2100	2023-06-28	Sandy Springs	460	[]	2025-06-08 17:05:13.602
2092	2023-06-21	Sandy Springs	370	[]	2025-06-08 17:05:12.997
2083	2023-06-14	Sandy Springs	811	[]	2025-06-08 17:05:12.268
2074	2023-06-07	Sandy Springs	533	[]	2025-06-08 17:05:11.589
2065	2023-05-31	Sandy Springs	304	[]	2025-06-08 17:05:10.91
2057	2023-05-24	Sandy Springs	585	[]	2025-06-08 17:05:10.272
2048	2023-05-17	Sandy Springs	988	[]	2025-06-08 17:05:09.52
2039	2023-05-10	Sandy Springs	1165	[]	2025-06-08 17:05:08.837
2030	2023-05-03	Sandy Springs	720	[]	2025-06-08 17:05:08.154
2116	2023-07-19	Intown/Druid Hills	629	[]	2025-06-08 17:05:14.934
2108	2023-07-11	Intown/Druid Hills	656	[]	2025-06-08 17:05:14.206
2101	2023-06-28	Intown/Druid Hills	179	[]	2025-06-08 17:05:13.677
2093	2023-06-21	Intown/Druid Hills	196	[]	2025-06-08 17:05:13.073
2084	2023-06-14	Intown/Druid Hills	570	[]	2025-06-08 17:05:12.344
2075	2023-06-07	Intown/Druid Hills	560	[]	2025-06-08 17:05:11.664
2066	2023-05-31	Intown/Druid Hills	198	[]	2025-06-08 17:05:10.985
2058	2023-05-24	Intown/Druid Hills	468	[]	2025-06-08 17:05:10.347
2049	2023-05-17	Intown/Druid Hills	233	[]	2025-06-08 17:05:09.595
2040	2023-05-10	Intown/Druid Hills	218	[]	2025-06-08 17:05:08.912
2031	2023-05-03	Intown/Druid Hills	450	[]	2025-06-08 17:05:08.23
2127	2023-07-26	Flowery Branch	349	[]	2025-06-08 17:05:15.766
2118	2023-07-19	Flowery Branch	366	[]	2025-06-08 17:05:15.086
2110	2023-07-11	Flowery Branch	283	[]	2025-06-08 17:05:14.357
2094	2023-06-21	Flowery Branch	304	[]	2025-06-08 17:05:13.149
2086	2023-06-14	Flowery Branch	391	[]	2025-06-08 17:05:12.495
2077	2023-06-07	Flowery Branch	255	[]	2025-06-08 17:05:11.815
2068	2023-05-31	Flowery Branch	284	[]	2025-06-08 17:05:11.136
2059	2023-05-24	Flowery Branch	184	[]	2025-06-08 17:05:10.423
2051	2023-05-17	Flowery Branch	538	[]	2025-06-08 17:05:09.747
2042	2023-05-10	Flowery Branch	221	[]	2025-06-08 17:05:09.064
2033	2023-05-03	Flowery Branch	447	[]	2025-06-08 17:05:08.381
2121	2023-07-26	Dunwoody/PTC	1904	[]	2025-06-08 17:05:15.313
2113	2023-07-19	Dunwoody/PTC	2606	[]	2025-06-08 17:05:14.708
2105	2023-07-11	Dunwoody/PTC	2350	[]	2025-06-08 17:05:13.979
2097	2023-06-28	Dunwoody/PTC	1599	[]	2025-06-08 17:05:13.375
2089	2023-06-21	Dunwoody/PTC	2274	[]	2025-06-08 17:05:12.771
2080	2023-06-14	Dunwoody/PTC	3516	[]	2025-06-08 17:05:12.042
2071	2023-06-07	Dunwoody/PTC	2544	[]	2025-06-08 17:05:11.363
2062	2023-05-31	Dunwoody/PTC	1360	[]	2025-06-08 17:05:10.65
2054	2023-05-24	Dunwoody/PTC	2035	[]	2025-06-08 17:05:09.974
2045	2023-05-17	Dunwoody/PTC	1472	[]	2025-06-08 17:05:09.292
2036	2023-05-10	Dunwoody/PTC	3853	[]	2025-06-08 17:05:08.61
2027	2023-05-03	Dunwoody/PTC	2875	[]	2025-06-08 17:05:07.927
2123	2023-07-26	Decatur	85	[]	2025-06-08 17:05:15.464
2099	2023-06-28	Decatur	126	[]	2025-06-08 17:05:13.526
2091	2023-06-21	Decatur	100	[]	2025-06-08 17:05:12.922
2082	2023-06-14	Decatur	102	[]	2025-06-08 17:05:12.193
2073	2023-06-07	Decatur	100	[]	2025-06-08 17:05:11.513
2064	2023-05-31	Decatur	172	[]	2025-06-08 17:05:10.832
2056	2023-05-24	Decatur	321	[]	2025-06-08 17:05:10.197
2047	2023-05-17	Decatur	125	[]	2025-06-08 17:05:09.444
2029	2023-05-03	Decatur	222	[]	2025-06-08 17:05:08.079
2126	2023-07-26	Snellville	127	[]	2025-06-08 17:05:15.69
2117	2023-07-19	Snellville	94	[]	2025-06-08 17:05:15.01
2109	2023-07-11	Snellville	242	[]	2025-06-08 17:05:14.281
2102	2023-06-28	Snellville	96	[]	2025-06-08 17:05:13.753
2085	2023-06-14	Snellville	39	[]	2025-06-08 17:05:12.419
2076	2023-06-07	Snellville	138	[]	2025-06-08 17:05:11.74
2067	2023-05-31	Snellville	87	[]	2025-06-08 17:05:11.061
2050	2023-05-17	Snellville	230	[]	2025-06-08 17:05:09.671
2041	2023-05-10	Snellville	94	[]	2025-06-08 17:05:08.988
2032	2023-05-03	Snellville	84	[]	2025-06-08 17:05:08.306
2023	2023-04-26	Snellville	190	[]	2025-06-08 17:05:07.625
2137	2023-08-09	Alpharetta	1962	[]	2025-06-08 17:05:16.521
2145	2023-08-16	Alpharetta	1292	[]	2025-06-08 17:05:17.2
2154	2023-08-24	Alpharetta	1276	[]	2025-06-08 17:05:17.879
2163	2023-08-30	Alpharetta	1090	[]	2025-06-08 17:05:18.557
2172	2023-09-06	Alpharetta	2262	[]	2025-06-08 17:05:19.236
2181	2023-09-13	Alpharetta	615	[]	2025-06-08 17:05:20
2190	2023-09-20	Alpharetta	1842	[]	2025-06-08 17:05:20.686
2198	2023-09-27	Alpharetta	1922	[]	2025-06-08 17:05:21.298
2207	2023-10-05	Alpharetta	1022	[]	2025-06-08 17:05:21.986
2216	2023-10-11	Alpharetta	2187	[]	2025-06-08 17:05:22.776
2225	2023-10-18	Alpharetta	2107	[]	2025-06-08 17:05:23.462
2234	2023-10-25	Alpharetta	1339	[]	2025-06-08 17:05:24.147
2227	2023-10-18	East Cobb/Roswell	722	[]	2025-06-08 17:05:23.614
2209	2023-10-05	East Cobb/Roswell	1147	[]	2025-06-08 17:05:22.139
2200	2023-09-27	East Cobb/Roswell	869	[]	2025-06-08 17:05:21.451
2192	2023-09-20	East Cobb/Roswell	1614	[]	2025-06-08 17:05:20.842
2183	2023-09-13	East Cobb/Roswell	1605	[]	2025-06-08 17:05:20.152
2174	2023-09-06	East Cobb/Roswell	1060	[]	2025-06-08 17:05:19.388
2165	2023-08-30	East Cobb/Roswell	1095	[]	2025-06-08 17:05:18.708
2147	2023-08-16	East Cobb/Roswell	1570	[]	2025-06-08 17:05:17.351
2139	2023-08-09	East Cobb/Roswell	1105	[]	2025-06-08 17:05:16.672
2131	2023-08-02	East Cobb/Roswell	862	[]	2025-06-08 17:05:16.068
2229	2023-10-18	Sandy Springs	1159	[]	2025-06-08 17:05:23.768
2220	2023-10-11	Sandy Springs	444	[]	2025-06-08 17:05:23.08
2211	2023-10-05	Sandy Springs	589	[]	2025-06-08 17:05:22.292
2202	2023-09-27	Sandy Springs	827	[]	2025-06-08 17:05:21.604
2193	2023-09-20	Sandy Springs	495	[]	2025-06-08 17:05:20.918
2185	2023-09-13	Sandy Springs	888	[]	2025-06-08 17:05:20.304
2176	2023-09-06	Sandy Springs	305	[]	2025-06-08 17:05:19.617
2167	2023-08-30	Sandy Springs	459	[]	2025-06-08 17:05:18.859
2158	2023-08-24	Sandy Springs	579	[]	2025-06-08 17:05:18.18
2140	2023-08-09	Sandy Springs	457	[]	2025-06-08 17:05:16.747
2132	2023-08-02	Sandy Springs	522	[]	2025-06-08 17:05:16.143
2230	2023-10-18	Intown/Druid Hills	751	[]	2025-06-08 17:05:23.844
2221	2023-10-11	Intown/Druid Hills	580	[]	2025-06-08 17:05:23.156
2212	2023-10-05	Intown/Druid Hills	395	[]	2025-06-08 17:05:22.368
2203	2023-09-27	Intown/Druid Hills	635	[]	2025-06-08 17:05:21.681
2194	2023-09-20	Intown/Druid Hills	437	[]	2025-06-08 17:05:20.993
2186	2023-09-13	Intown/Druid Hills	746	[]	2025-06-08 17:05:20.381
2177	2023-09-06	Intown/Druid Hills	400	[]	2025-06-08 17:05:19.693
2168	2023-08-30	Intown/Druid Hills	178	[]	2025-06-08 17:05:18.934
2159	2023-08-24	Intown/Druid Hills	237	[]	2025-06-08 17:05:18.255
2150	2023-08-16	Intown/Druid Hills	245	[]	2025-06-08 17:05:17.577
2141	2023-08-09	Intown/Druid Hills	362	[]	2025-06-08 17:05:16.824
2133	2023-08-02	Intown/Druid Hills	214	[]	2025-06-08 17:05:16.219
2232	2023-10-18	Flowery Branch	205	[]	2025-06-08 17:05:23.996
2223	2023-10-11	Flowery Branch	240	[]	2025-06-08 17:05:23.309
2214	2023-10-05	Flowery Branch	409	[]	2025-06-08 17:05:22.622
2205	2023-09-27	Flowery Branch	438	[]	2025-06-08 17:05:21.834
2188	2023-09-13	Flowery Branch	200	[]	2025-06-08 17:05:20.533
2179	2023-09-06	Flowery Branch	249	[]	2025-06-08 17:05:19.845
2170	2023-08-30	Flowery Branch	349	[]	2025-06-08 17:05:19.085
2161	2023-08-24	Flowery Branch	346	[]	2025-06-08 17:05:18.406
2152	2023-08-16	Flowery Branch	190	[]	2025-06-08 17:05:17.728
2143	2023-08-09	Flowery Branch	206	[]	2025-06-08 17:05:16.975
2135	2023-08-02	Flowery Branch	235	[]	2025-06-08 17:05:16.37
2235	2023-10-25	Dunwoody/PTC	1349	[]	2025-06-08 17:05:24.223
2226	2023-10-18	Dunwoody/PTC	1800	[]	2025-06-08 17:05:23.537
2217	2023-10-11	Dunwoody/PTC	1127	[]	2025-06-08 17:05:22.851
2208	2023-10-05	Dunwoody/PTC	2880	[]	2025-06-08 17:05:22.062
2199	2023-09-27	Dunwoody/PTC	1520	[]	2025-06-08 17:05:21.375
2191	2023-09-20	Dunwoody/PTC	2138	[]	2025-06-08 17:05:20.765
2182	2023-09-13	Dunwoody/PTC	2090	[]	2025-06-08 17:05:20.076
2173	2023-09-06	Dunwoody/PTC	1881	[]	2025-06-08 17:05:19.311
2164	2023-08-30	Dunwoody/PTC	1182	[]	2025-06-08 17:05:18.633
2155	2023-08-24	Dunwoody/PTC	1650	[]	2025-06-08 17:05:17.954
2146	2023-08-16	Dunwoody/PTC	2218	[]	2025-06-08 17:05:17.276
2130	2023-08-02	Dunwoody/PTC	2480	[]	2025-06-08 17:05:15.992
2228	2023-10-18	Decatur	130	[]	2025-06-08 17:05:23.69
2219	2023-10-11	Decatur	92	[]	2025-06-08 17:05:23.004
2210	2023-10-05	Decatur	125	[]	2025-06-08 17:05:22.215
2201	2023-09-27	Decatur	142	[]	2025-06-08 17:05:21.527
2184	2023-09-13	Decatur	82	[]	2025-06-08 17:05:20.228
2175	2023-09-06	Decatur	92	[]	2025-06-08 17:05:19.464
2166	2023-08-30	Decatur	106	[]	2025-06-08 17:05:18.783
2157	2023-08-24	Decatur	97	[]	2025-06-08 17:05:18.105
2148	2023-08-16	Decatur	66	[]	2025-06-08 17:05:17.427
2231	2023-10-18	Snellville	126	[]	2025-06-08 17:05:23.92
2222	2023-10-11	Snellville	107	[]	2025-06-08 17:05:23.233
2213	2023-10-05	Snellville	171	[]	2025-06-08 17:05:22.444
2204	2023-09-27	Snellville	113	[]	2025-06-08 17:05:21.757
2195	2023-09-20	Snellville	109	[]	2025-06-08 17:05:21.07
2187	2023-09-13	Snellville	228	[]	2025-06-08 17:05:20.457
2178	2023-09-06	Snellville	80	[]	2025-06-08 17:05:19.768
2169	2023-08-30	Snellville	116	[]	2025-06-08 17:05:19.01
2151	2023-08-16	Snellville	162	[]	2025-06-08 17:05:17.653
2142	2023-08-09	Snellville	230	[]	2025-06-08 17:05:16.899
2134	2023-08-02	Snellville	128	[]	2025-06-08 17:05:16.294
2136	2023-08-02	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":555}]	2025-06-08 17:05:16.445
2243	2023-11-01	Alpharetta	781	[]	2025-06-08 17:05:24.833
2252	2023-11-08	Alpharetta	2028	[]	2025-06-08 17:05:25.623
2260	2023-11-15	Alpharetta	1722	[]	2025-06-08 17:05:26.233
2269	2023-11-29	Alpharetta	4232	[]	2025-06-08 17:05:26.919
2278	2023-12-06	Alpharetta	961	[]	2025-06-08 17:05:27.609
2287	2023-12-13	Alpharetta	1343	[]	2025-06-08 17:05:28.296
2296	2023-12-20	Alpharetta	2367	[]	2025-06-08 17:05:29.086
2304	2024-01-03	Alpharetta	609	[]	2025-06-08 17:05:29.696
2311	2024-01-10	Alpharetta	2000	[]	2025-06-08 17:05:30.23
2319	2024-01-17	Alpharetta	905	[]	2025-06-08 17:05:30.842
2328	2024-01-24	Alpharetta	1788	[]	2025-06-08 17:05:31.627
2336	2024-01-31	Alpharetta	1859	[]	2025-06-08 17:05:32.244
2330	2024-01-24	East Cobb/Roswell	1278	[]	2025-06-08 17:05:31.784
2313	2024-01-10	East Cobb/Roswell	1162	[]	2025-06-08 17:05:30.383
2306	2024-01-03	East Cobb/Roswell	1631	[]	2025-06-08 17:05:29.847
2298	2023-12-20	East Cobb/Roswell	1787	[]	2025-06-08 17:05:29.238
2289	2023-12-13	East Cobb/Roswell	1806	[]	2025-06-08 17:05:28.449
2280	2023-12-06	East Cobb/Roswell	2233	[]	2025-06-08 17:05:27.761
2271	2023-11-29	East Cobb/Roswell	1537	[]	2025-06-08 17:05:27.072
2254	2023-11-08	East Cobb/Roswell	1552	[]	2025-06-08 17:05:25.776
2245	2023-11-01	East Cobb/Roswell	937	[]	2025-06-08 17:05:24.988
2340	2024-01-31	Sandy Springs	935	[]	2025-06-08 17:05:32.56
2332	2024-01-24	Sandy Springs	700	[]	2025-06-08 17:05:31.937
2323	2024-01-17	Sandy Springs	1013	[]	2025-06-08 17:05:31.149
2315	2024-01-10	Sandy Springs	771	[]	2025-06-08 17:05:30.536
2307	2024-01-03	Sandy Springs	283	[]	2025-06-08 17:05:29.924
2300	2023-12-20	Sandy Springs	1052	[]	2025-06-08 17:05:29.39
2291	2023-12-13	Sandy Springs	630	[]	2025-06-08 17:05:28.705
2282	2023-12-06	Sandy Springs	944	[]	2025-06-08 17:05:27.914
2273	2023-11-29	Sandy Springs	718	[]	2025-06-08 17:05:27.225
2264	2023-11-15	Sandy Springs	996	[]	2025-06-08 17:05:26.537
2255	2023-11-08	Sandy Springs	928	[]	2025-06-08 17:05:25.853
2247	2023-11-01	Sandy Springs	296	[]	2025-06-08 17:05:25.14
2238	2023-10-25	Sandy Springs	669	[]	2025-06-08 17:05:24.452
2333	2024-01-24	Intown/Druid Hills	823	[]	2025-06-08 17:05:32.013
2324	2024-01-17	Intown/Druid Hills	1208	[]	2025-06-08 17:05:31.226
2316	2024-01-10	Intown/Druid Hills	225	[]	2025-06-08 17:05:30.613
2308	2024-01-03	Intown/Druid Hills	625	[]	2025-06-08 17:05:30.001
2301	2023-12-20	Intown/Druid Hills	460	[]	2025-06-08 17:05:29.467
2292	2023-12-13	Intown/Druid Hills	1161	[]	2025-06-08 17:05:28.781
2283	2023-12-06	Intown/Druid Hills	1387	[]	2025-06-08 17:05:27.991
2274	2023-11-29	Intown/Druid Hills	1203	[]	2025-06-08 17:05:27.302
2265	2023-11-15	Intown/Druid Hills	626	[]	2025-06-08 17:05:26.613
2256	2023-11-08	Intown/Druid Hills	935	[]	2025-06-08 17:05:25.929
2248	2023-11-01	Intown/Druid Hills	365	[]	2025-06-08 17:05:25.217
2239	2023-10-25	Intown/Druid Hills	1198	[]	2025-06-08 17:05:24.528
2342	2024-01-31	Flowery Branch	232	[]	2025-06-08 17:05:32.714
2326	2024-01-17	Flowery Branch	480	[]	2025-06-08 17:05:31.379
2310	2024-01-03	Flowery Branch	262	[]	2025-06-08 17:05:30.154
2294	2023-12-13	Flowery Branch	362	[]	2025-06-08 17:05:28.933
2285	2023-12-06	Flowery Branch	292	[]	2025-06-08 17:05:28.143
2276	2023-11-29	Flowery Branch	388	[]	2025-06-08 17:05:27.455
2267	2023-11-15	Flowery Branch	499	[]	2025-06-08 17:05:26.766
2258	2023-11-08	Flowery Branch	267	[]	2025-06-08 17:05:26.081
2250	2023-11-01	Flowery Branch	219	[]	2025-06-08 17:05:25.37
2337	2024-01-31	Dunwoody/PTC	1437	[]	2025-06-08 17:05:32.323
2329	2024-01-24	Dunwoody/PTC	1885	[]	2025-06-08 17:05:31.706
2320	2024-01-17	Dunwoody/PTC	1570	[]	2025-06-08 17:05:30.92
2312	2024-01-10	Dunwoody/PTC	2160	[]	2025-06-08 17:05:30.306
2305	2024-01-03	Dunwoody/PTC	1480	[]	2025-06-08 17:05:29.771
2297	2023-12-20	Dunwoody/PTC	1792	[]	2025-06-08 17:05:29.162
2288	2023-12-13	Dunwoody/PTC	1381	[]	2025-06-08 17:05:28.373
2279	2023-12-06	Dunwoody/PTC	1714	[]	2025-06-08 17:05:27.684
2270	2023-11-29	Dunwoody/PTC	2404	[]	2025-06-08 17:05:26.996
2261	2023-11-15	Dunwoody/PTC	2611	[]	2025-06-08 17:05:26.309
2253	2023-11-08	Dunwoody/PTC	1805	[]	2025-06-08 17:05:25.7
2244	2023-11-01	Dunwoody/PTC	2451	[]	2025-06-08 17:05:24.912
2339	2024-01-31	Decatur	128	[]	2025-06-08 17:05:32.485
2331	2024-01-24	Decatur	82	[]	2025-06-08 17:05:31.86
2322	2024-01-17	Decatur	320	[]	2025-06-08 17:05:31.071
2314	2024-01-10	Decatur	102	[]	2025-06-08 17:05:30.459
2299	2023-12-20	Decatur	184	[]	2025-06-08 17:05:29.315
2290	2023-12-13	Decatur	113	[]	2025-06-08 17:05:28.628
2281	2023-12-06	Decatur	111	[]	2025-06-08 17:05:27.838
2272	2023-11-29	Decatur	82	[]	2025-06-08 17:05:27.149
2246	2023-11-01	Decatur	135	[]	2025-06-08 17:05:25.064
2237	2023-10-25	Decatur	121	[]	2025-06-08 17:05:24.375
2334	2024-01-24	Snellville	180	[]	2025-06-08 17:05:32.089
2325	2024-01-17	Snellville	85	[]	2025-06-08 17:05:31.302
2317	2024-01-10	Snellville	185	[]	2025-06-08 17:05:30.689
2309	2024-01-03	Snellville	152	[]	2025-06-08 17:05:30.077
2302	2023-12-20	Snellville	106	[]	2025-06-08 17:05:29.543
2293	2023-12-13	Snellville	109	[]	2025-06-08 17:05:28.857
2284	2023-12-06	Snellville	128	[]	2025-06-08 17:05:28.067
2275	2023-11-29	Snellville	91	[]	2025-06-08 17:05:27.378
2266	2023-11-15	Snellville	90	[]	2025-06-08 17:05:26.69
2257	2023-11-08	Snellville	88	[]	2025-06-08 17:05:26.004
2249	2023-11-01	Snellville	129	[]	2025-06-08 17:05:25.294
2240	2023-10-25	Snellville	105	[]	2025-06-08 17:05:24.605
2344	2024-02-07	Alpharetta	1526	[]	2025-06-08 17:05:32.869
2352	2024-02-14	Alpharetta	3087	[]	2025-06-08 17:05:33.483
2360	2024-02-21	Alpharetta	2225	[]	2025-06-08 17:05:34.091
2368	2024-02-28	Alpharetta	938	[]	2025-06-08 17:05:34.855
2377	2024-03-06	Alpharetta	1324	[]	2025-06-08 17:05:35.545
2386	2024-03-13	Alpharetta	1254	[]	2025-06-08 17:05:36.242
2394	2024-03-20	Alpharetta	795	[]	2025-06-08 17:05:36.864
2402	2024-04-03	Alpharetta	757	[]	2025-06-08 17:05:37.579
2408	2024-04-10	Alpharetta	954	[]	2025-06-08 17:05:38.038
2415	2024-04-17	Alpharetta	1229	[]	2025-06-08 17:05:38.589
2421	2024-05-01	Alpharetta	1057	[]	2025-06-08 17:05:39.124
2429	2024-05-08	Alpharetta	1405	[]	2025-06-08 17:05:39.741
2437	2024-05-15	Alpharetta	1355	[]	2025-06-08 17:05:40.357
2445	2024-05-22	Alpharetta	848	[]	2025-06-08 17:05:40.97
2431	2024-05-08	East Cobb/Roswell	916	[]	2025-06-08 17:05:39.896
2423	2024-05-01	East Cobb/Roswell	1777	[]	2025-06-08 17:05:39.277
2417	2024-04-17	East Cobb/Roswell	968	[]	2025-06-08 17:05:38.746
2404	2024-04-03	East Cobb/Roswell	1629	[]	2025-06-08 17:05:37.733
2396	2024-03-20	East Cobb/Roswell	1845	[]	2025-06-08 17:05:37.121
2388	2024-03-13	East Cobb/Roswell	1849	[]	2025-06-08 17:05:36.405
2370	2024-02-28	East Cobb/Roswell	946	[]	2025-06-08 17:05:35.008
2362	2024-02-21	East Cobb/Roswell	1789	[]	2025-06-08 17:05:34.244
2354	2024-02-14	East Cobb/Roswell	821	[]	2025-06-08 17:05:33.634
2346	2024-02-07	East Cobb/Roswell	1048	[]	2025-06-08 17:05:33.023
2448	2024-05-22	Sandy Springs	644	[]	2025-06-08 17:05:41.201
2441	2024-05-15	Sandy Springs	581	[]	2025-06-08 17:05:40.663
2433	2024-05-08	Sandy Springs	1168	[]	2025-06-08 17:05:40.05
2425	2024-05-01	Sandy Springs	1282	[]	2025-06-08 17:05:39.432
2418	2024-04-17	Sandy Springs	609	[]	2025-06-08 17:05:38.822
2411	2024-04-10	Sandy Springs	1038	[]	2025-06-08 17:05:38.282
2405	2024-04-03	Sandy Springs	179	[]	2025-06-08 17:05:37.809
2390	2024-03-13	Sandy Springs	788	[]	2025-06-08 17:05:36.558
2381	2024-03-06	Sandy Springs	367	[]	2025-06-08 17:05:35.852
2372	2024-02-28	Sandy Springs	451	[]	2025-06-08 17:05:35.162
2364	2024-02-21	Sandy Springs	822	[]	2025-06-08 17:05:34.432
2355	2024-02-14	Sandy Springs	508	[]	2025-06-08 17:05:33.711
2348	2024-02-07	Sandy Springs	605	[]	2025-06-08 17:05:33.177
2449	2024-05-22	Intown/Druid Hills	533	[]	2025-06-08 17:05:41.281
2442	2024-05-15	Intown/Druid Hills	673	[]	2025-06-08 17:05:40.74
2434	2024-05-08	Intown/Druid Hills	507	[]	2025-06-08 17:05:40.127
2426	2024-05-01	Intown/Druid Hills	968	[]	2025-06-08 17:05:39.51
2419	2024-04-17	Intown/Druid Hills	2668	[]	2025-06-08 17:05:38.898
2412	2024-04-10	Intown/Druid Hills	2640	[]	2025-06-08 17:05:38.358
2406	2024-04-03	Intown/Druid Hills	482	[]	2025-06-08 17:05:37.886
2399	2024-03-20	Intown/Druid Hills	941	[]	2025-06-08 17:05:37.35
2391	2024-03-13	Intown/Druid Hills	277	[]	2025-06-08 17:05:36.635
2382	2024-03-06	Intown/Druid Hills	745	[]	2025-06-08 17:05:35.932
2365	2024-02-21	Intown/Druid Hills	1351	[]	2025-06-08 17:05:34.623
2356	2024-02-14	Intown/Druid Hills	930	[]	2025-06-08 17:05:33.788
2349	2024-02-07	Intown/Druid Hills	214	[]	2025-06-08 17:05:33.253
2450	2024-05-22	Flowery Branch	278	[]	2025-06-08 17:05:41.357
2443	2024-05-15	Flowery Branch	484	[]	2025-06-08 17:05:40.817
2435	2024-05-08	Flowery Branch	244	[]	2025-06-08 17:05:40.203
2427	2024-05-01	Flowery Branch	274	[]	2025-06-08 17:05:39.588
2413	2024-04-10	Flowery Branch	250	[]	2025-06-08 17:05:38.435
2400	2024-03-20	Flowery Branch	473	[]	2025-06-08 17:05:37.426
2384	2024-03-06	Flowery Branch	264	[]	2025-06-08 17:05:36.09
2375	2024-02-28	Flowery Branch	353	[]	2025-06-08 17:05:35.392
2358	2024-02-14	Flowery Branch	287	[]	2025-06-08 17:05:33.939
2446	2024-05-22	Dunwoody/PTC	2341	[]	2025-06-08 17:05:41.046
2438	2024-05-15	Dunwoody/PTC	2477	[]	2025-06-08 17:05:40.433
2430	2024-05-08	Dunwoody/PTC	1944	[]	2025-06-08 17:05:39.818
2422	2024-05-01	Dunwoody/PTC	2174	[]	2025-06-08 17:05:39.201
2416	2024-04-17	Dunwoody/PTC	2750	[]	2025-06-08 17:05:38.667
2409	2024-04-10	Dunwoody/PTC	1588	[]	2025-06-08 17:05:38.121
2403	2024-04-03	Dunwoody/PTC	2160	[]	2025-06-08 17:05:37.656
2395	2024-03-20	Dunwoody/PTC	1672	[]	2025-06-08 17:05:36.94
2387	2024-03-13	Dunwoody/PTC	1878	[]	2025-06-08 17:05:36.325
2378	2024-03-06	Dunwoody/PTC	1351	[]	2025-06-08 17:05:35.621
2361	2024-02-21	Dunwoody/PTC	2628	[]	2025-06-08 17:05:34.168
2353	2024-02-14	Dunwoody/PTC	1594	[]	2025-06-08 17:05:33.558
2345	2024-02-07	Dunwoody/PTC	1465	[]	2025-06-08 17:05:32.946
2440	2024-05-15	Decatur	92	[]	2025-06-08 17:05:40.587
2432	2024-05-08	Decatur	72	[]	2025-06-08 17:05:39.973
2424	2024-05-01	Decatur	112	[]	2025-06-08 17:05:39.355
2410	2024-04-10	Decatur	102	[]	2025-06-08 17:05:38.206
2397	2024-03-20	Decatur	82	[]	2025-06-08 17:05:37.197
2389	2024-03-13	Decatur	106	[]	2025-06-08 17:05:36.482
2380	2024-03-06	Decatur	102	[]	2025-06-08 17:05:35.775
2371	2024-02-28	Decatur	81	[]	2025-06-08 17:05:35.084
2363	2024-02-21	Decatur	92	[]	2025-06-08 17:05:34.356
2347	2024-02-07	Decatur	72	[]	2025-06-08 17:05:33.1
2392	2024-03-13	Snellville	114	[]	2025-06-08 17:05:36.712
2383	2024-03-06	Snellville	74	[]	2025-06-08 17:05:36.014
2374	2024-02-28	Snellville	74	[]	2025-06-08 17:05:35.315
2366	2024-02-21	Snellville	396	[]	2025-06-08 17:05:34.7
2357	2024-02-14	Snellville	108	[]	2025-06-08 17:05:33.864
2351	2024-02-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1960}]	2025-06-08 17:05:33.407
2452	2024-05-28	Alpharetta	584	[]	2025-06-08 17:05:41.618
2459	2024-06-05	Alpharetta	1569	[]	2025-06-08 17:05:42.151
2467	2024-06-12	Alpharetta	2135	[]	2025-06-08 17:05:42.764
2475	2024-06-19	Alpharetta	1218	[]	2025-06-08 17:05:43.376
2483	2024-06-26	Alpharetta	1198	[]	2025-06-08 17:05:43.99
2490	2024-07-10	Alpharetta	1134	[]	2025-06-08 17:05:44.622
2505	2024-07-24	Alpharetta	871	[]	2025-06-08 17:05:45.774
2513	2024-07-31	Alpharetta	2154	[]	2025-06-08 17:05:46.384
2521	2024-08-07	Alpharetta	1704	[]	2025-06-08 17:05:46.995
2529	2024-08-14	Alpharetta	1074	[]	2025-06-08 17:05:47.703
2537	2024-08-21	Alpharetta	1018	[]	2025-06-08 17:05:48.313
2544	2024-08-28	Alpharetta	1766	[]	2025-06-08 17:05:48.846
2552	2024-09-04	Alpharetta	1210	[]	2025-06-08 17:05:49.46
2560	2024-09-11	Alpharetta	875	[]	2025-06-08 17:05:50.07
2546	2024-08-28	East Cobb/Roswell	1290	[]	2025-06-08 17:05:49
2539	2024-08-21	East Cobb/Roswell	1327	[]	2025-06-08 17:05:48.465
2531	2024-08-14	East Cobb/Roswell	1347	[]	2025-06-08 17:05:47.855
2523	2024-08-07	East Cobb/Roswell	1455	[]	2025-06-08 17:05:47.149
2515	2024-07-31	East Cobb/Roswell	1499	[]	2025-06-08 17:05:46.537
2507	2024-07-24	East Cobb/Roswell	1962	[]	2025-06-08 17:05:45.926
2485	2024-06-26	East Cobb/Roswell	1715	[]	2025-06-08 17:05:44.143
2477	2024-06-19	East Cobb/Roswell	1695	[]	2025-06-08 17:05:43.529
2469	2024-06-12	East Cobb/Roswell	2323	[]	2025-06-08 17:05:42.917
2461	2024-06-05	East Cobb/Roswell	1436	[]	2025-06-08 17:05:42.303
2454	2024-05-28	East Cobb/Roswell	852	[]	2025-06-08 17:05:41.771
2556	2024-09-04	Sandy Springs	434	[]	2025-06-08 17:05:49.764
2548	2024-08-28	Sandy Springs	545	[]	2025-06-08 17:05:49.154
2540	2024-08-21	Sandy Springs	445	[]	2025-06-08 17:05:48.542
2525	2024-08-07	Sandy Springs	1074	[]	2025-06-08 17:05:47.302
2517	2024-07-31	Sandy Springs	890	[]	2025-06-08 17:05:46.689
2509	2024-07-24	Sandy Springs	889	[]	2025-06-08 17:05:46.079
2501	2024-07-17	Sandy Springs	632	[]	2025-06-08 17:05:45.463
2493	2024-07-10	Sandy Springs	583	[]	2025-06-08 17:05:44.851
2486	2024-06-26	Sandy Springs	789	[]	2025-06-08 17:05:44.219
2479	2024-06-19	Sandy Springs	1088	[]	2025-06-08 17:05:43.684
2471	2024-06-12	Sandy Springs	690	[]	2025-06-08 17:05:43.07
2463	2024-06-05	Sandy Springs	721	[]	2025-06-08 17:05:42.457
2455	2024-05-28	Sandy Springs	828	[]	2025-06-08 17:05:41.846
2557	2024-09-04	Intown/Druid Hills	567	[]	2025-06-08 17:05:49.841
2549	2024-08-28	Intown/Druid Hills	846	[]	2025-06-08 17:05:49.23
2541	2024-08-21	Intown/Druid Hills	722	[]	2025-06-08 17:05:48.618
2534	2024-08-14	Intown/Druid Hills	547	[]	2025-06-08 17:05:48.084
2526	2024-08-07	Intown/Druid Hills	428	[]	2025-06-08 17:05:47.379
2518	2024-07-31	Intown/Druid Hills	1607	[]	2025-06-08 17:05:46.765
2502	2024-07-17	Intown/Druid Hills	1425	[]	2025-06-08 17:05:45.545
2494	2024-07-10	Intown/Druid Hills	784	[]	2025-06-08 17:05:44.927
2487	2024-06-26	Intown/Druid Hills	766	[]	2025-06-08 17:05:44.295
2480	2024-06-19	Intown/Druid Hills	586	[]	2025-06-08 17:05:43.76
2472	2024-06-12	Intown/Druid Hills	751	[]	2025-06-08 17:05:43.146
2464	2024-06-05	Intown/Druid Hills	707	[]	2025-06-08 17:05:42.533
2456	2024-05-28	Intown/Druid Hills	511	[]	2025-06-08 17:05:41.923
2558	2024-09-04	Flowery Branch	214	[]	2025-06-08 17:05:49.917
2550	2024-08-28	Flowery Branch	250	[]	2025-06-08 17:05:49.306
2542	2024-08-21	Flowery Branch	175	[]	2025-06-08 17:05:48.694
2535	2024-08-14	Flowery Branch	150	[]	2025-06-08 17:05:48.161
2527	2024-08-07	Flowery Branch	226	[]	2025-06-08 17:05:47.46
2519	2024-07-31	Flowery Branch	132	[]	2025-06-08 17:05:46.842
2511	2024-07-24	Flowery Branch	191	[]	2025-06-08 17:05:46.232
2503	2024-07-17	Flowery Branch	226	[]	2025-06-08 17:05:45.621
2495	2024-07-10	Flowery Branch	426	[]	2025-06-08 17:05:45.004
2488	2024-06-26	Flowery Branch	275	[]	2025-06-08 17:05:44.372
2481	2024-06-19	Flowery Branch	454	[]	2025-06-08 17:05:43.837
2473	2024-06-12	Flowery Branch	125	[]	2025-06-08 17:05:43.223
2465	2024-06-05	Flowery Branch	735	[]	2025-06-08 17:05:42.609
2457	2024-05-28	Flowery Branch	250	[]	2025-06-08 17:05:41.999
2553	2024-09-04	Dunwoody/PTC	1184	[]	2025-06-08 17:05:49.536
2538	2024-08-21	Dunwoody/PTC	1698	[]	2025-06-08 17:05:48.389
2530	2024-08-14	Dunwoody/PTC	2154	[]	2025-06-08 17:05:47.779
2522	2024-08-07	Dunwoody/PTC	1012	[]	2025-06-08 17:05:47.072
2514	2024-07-31	Dunwoody/PTC	1460	[]	2025-06-08 17:05:46.461
2506	2024-07-24	Dunwoody/PTC	1989	[]	2025-06-08 17:05:45.85
2491	2024-07-10	Dunwoody/PTC	1681	[]	2025-06-08 17:05:44.699
2484	2024-06-26	Dunwoody/PTC	1272	[]	2025-06-08 17:05:44.067
2476	2024-06-19	Dunwoody/PTC	1980	[]	2025-06-08 17:05:43.452
2468	2024-06-12	Dunwoody/PTC	2400	[]	2025-06-08 17:05:42.841
2460	2024-06-05	Dunwoody/PTC	1552	[]	2025-06-08 17:05:42.227
2453	2024-05-28	Dunwoody/PTC	1740	[]	2025-06-08 17:05:41.694
2624	2024-11-13	Decatur	54	[]	2025-06-08 17:05:55.112
2547	2024-08-28	Decatur	54	[]	2025-06-08 17:05:49.076
2532	2024-08-14	Decatur	54	[]	2025-06-08 17:05:47.931
2524	2024-08-07	Decatur	54	[]	2025-06-08 17:05:47.225
2516	2024-07-31	Decatur	162	[]	2025-06-08 17:05:46.614
2508	2024-07-24	Decatur	54	[]	2025-06-08 17:05:46.003
2478	2024-06-19	Decatur	74	[]	2025-06-08 17:05:43.606
2470	2024-06-12	Decatur	72	[]	2025-06-08 17:05:42.994
2462	2024-06-05	Decatur	159	[]	2025-06-08 17:05:42.38
2568	2024-09-18	Alpharetta	1640	[]	2025-06-08 17:05:50.78
2576	2024-09-25	Alpharetta	1946	[]	2025-06-08 17:05:51.39
2584	2024-10-09	Alpharetta	1493	[]	2025-06-08 17:05:52.001
2592	2024-10-16	Alpharetta	1032	[]	2025-06-08 17:05:52.61
2600	2024-10-23	Alpharetta	618	[]	2025-06-08 17:05:53.22
2607	2024-10-30	Alpharetta	1427	[]	2025-06-08 17:05:53.754
2614	2024-11-06	Alpharetta	1427	[]	2025-06-08 17:05:54.349
2621	2024-11-13	Alpharetta	1226	[]	2025-06-08 17:05:54.883
2629	2024-11-20	Alpharetta	3625	[]	2025-06-08 17:05:55.497
2637	2024-12-04	Alpharetta	1379	[]	2025-06-08 17:05:56.107
2645	2024-12-11	Alpharetta	2176	[]	2025-06-08 17:05:56.718
2652	2024-12-18	Alpharetta	848	[]	2025-06-08 17:05:57.26
2663	2025-01-08	Alpharetta	1571	[]	2025-06-08 17:05:58.159
2662	2025-01-01	East Cobb/Roswell	185	[]	2025-06-08 17:05:58.083
2654	2024-12-18	East Cobb/Roswell	1706	[]	2025-06-08 17:05:57.415
2647	2024-12-11	East Cobb/Roswell	1203	[]	2025-06-08 17:05:56.871
2639	2024-12-04	East Cobb/Roswell	1439	[]	2025-06-08 17:05:56.26
2631	2024-11-20	East Cobb/Roswell	1643	[]	2025-06-08 17:05:55.65
2616	2024-11-06	East Cobb/Roswell	1017	[]	2025-06-08 17:05:54.504
2609	2024-10-30	East Cobb/Roswell	1017	[]	2025-06-08 17:05:53.906
2602	2024-10-23	East Cobb/Roswell	594	[]	2025-06-08 17:05:53.373
2594	2024-10-16	East Cobb/Roswell	1332	[]	2025-06-08 17:05:52.763
2586	2024-10-09	East Cobb/Roswell	919	[]	2025-06-08 17:05:52.152
2578	2024-09-25	East Cobb/Roswell	989	[]	2025-06-08 17:05:51.542
2562	2024-09-11	East Cobb/Roswell	1133	[]	2025-06-08 17:05:50.223
2666	2025-01-08	Sandy Springs	301	[]	2025-06-08 17:05:58.392
2655	2024-12-18	Sandy Springs	485	[]	2025-06-08 17:05:57.492
2648	2024-12-11	Sandy Springs	667	[]	2025-06-08 17:05:56.948
2641	2024-12-04	Sandy Springs	442	[]	2025-06-08 17:05:56.412
2633	2024-11-20	Sandy Springs	1087	[]	2025-06-08 17:05:55.802
2625	2024-11-13	Sandy Springs	554	[]	2025-06-08 17:05:55.187
2617	2024-11-06	Sandy Springs	452	[]	2025-06-08 17:05:54.579
2610	2024-10-30	Sandy Springs	452	[]	2025-06-08 17:05:53.982
2603	2024-10-23	Sandy Springs	224	[]	2025-06-08 17:05:53.449
2596	2024-10-16	Sandy Springs	431	[]	2025-06-08 17:05:52.915
2588	2024-10-09	Sandy Springs	344	[]	2025-06-08 17:05:52.304
2579	2024-09-25	Sandy Springs	510	[]	2025-06-08 17:05:51.618
2572	2024-09-18	Sandy Springs	747	[]	2025-06-08 17:05:51.085
2564	2024-09-11	Sandy Springs	721	[]	2025-06-08 17:05:50.375
2649	2024-12-11	Intown/Druid Hills	1190	[]	2025-06-08 17:05:57.03
2642	2024-12-04	Intown/Druid Hills	1280	[]	2025-06-08 17:05:56.488
2634	2024-11-20	Intown/Druid Hills	861	[]	2025-06-08 17:05:55.879
2626	2024-11-13	Intown/Druid Hills	437	[]	2025-06-08 17:05:55.263
2618	2024-11-06	Intown/Druid Hills	1380	[]	2025-06-08 17:05:54.654
2611	2024-10-30	Intown/Druid Hills	1380	[]	2025-06-08 17:05:54.119
2604	2024-10-23	Intown/Druid Hills	768	[]	2025-06-08 17:05:53.525
2597	2024-10-16	Intown/Druid Hills	1296	[]	2025-06-08 17:05:52.992
2589	2024-10-09	Intown/Druid Hills	555	[]	2025-06-08 17:05:52.38
2580	2024-09-25	Intown/Druid Hills	791	[]	2025-06-08 17:05:51.694
2573	2024-09-18	Intown/Druid Hills	406	[]	2025-06-08 17:05:51.162
2565	2024-09-11	Intown/Druid Hills	1059	[]	2025-06-08 17:05:50.452
2657	2024-12-18	Flowery Branch	426	[]	2025-06-08 17:05:57.698
2650	2024-12-11	Flowery Branch	105	[]	2025-06-08 17:05:57.107
2643	2024-12-04	Flowery Branch	250	[]	2025-06-08 17:05:56.565
2635	2024-11-20	Flowery Branch	304	[]	2025-06-08 17:05:55.955
2627	2024-11-13	Flowery Branch	200	[]	2025-06-08 17:05:55.34
2619	2024-11-06	Flowery Branch	179	[]	2025-06-08 17:05:54.73
2612	2024-10-30	Flowery Branch	332	[]	2025-06-08 17:05:54.195
2605	2024-10-23	Flowery Branch	503	[]	2025-06-08 17:05:53.601
2598	2024-10-16	Flowery Branch	200	[]	2025-06-08 17:05:53.068
2590	2024-10-09	Flowery Branch	260	[]	2025-06-08 17:05:52.457
2574	2024-09-18	Flowery Branch	494	[]	2025-06-08 17:05:51.238
2566	2024-09-11	Flowery Branch	223	[]	2025-06-08 17:05:50.626
2664	2025-01-08	Dunwoody/PTC	2397	[]	2025-06-08 17:05:58.24
2661	2025-01-01	Dunwoody/PTC	563	[]	2025-06-08 17:05:58.004
2659	2024-12-26	Dunwoody/PTC	504	[]	2025-06-08 17:05:57.85
2653	2024-12-18	Dunwoody/PTC	1342	[]	2025-06-08 17:05:57.338
2646	2024-12-11	Dunwoody/PTC	2226	[]	2025-06-08 17:05:56.794
2638	2024-12-04	Dunwoody/PTC	1643	[]	2025-06-08 17:05:56.183
2630	2024-11-20	Dunwoody/PTC	2378	[]	2025-06-08 17:05:55.574
2622	2024-11-13	Dunwoody/PTC	1396	[]	2025-06-08 17:05:54.959
2615	2024-11-06	Dunwoody/PTC	1449	[]	2025-06-08 17:05:54.426
2608	2024-10-30	Dunwoody/PTC	2035	[]	2025-06-08 17:05:53.83
2601	2024-10-23	Dunwoody/PTC	1774	[]	2025-06-08 17:05:53.297
2593	2024-10-16	Dunwoody/PTC	1377	[]	2025-06-08 17:05:52.687
2585	2024-10-09	Dunwoody/PTC	1284	[]	2025-06-08 17:05:52.077
2577	2024-09-25	Dunwoody/PTC	1836	[]	2025-06-08 17:05:51.466
2569	2024-09-18	Dunwoody/PTC	724	[]	2025-06-08 17:05:50.856
2561	2024-09-11	Dunwoody/PTC	1143	[]	2025-06-08 17:05:50.146
2640	2024-12-04	Decatur	54	[]	2025-06-08 17:05:56.336
2632	2024-11-20	Decatur	64	[]	2025-06-08 17:05:55.726
2595	2024-10-16	Decatur	119	[]	2025-06-08 17:05:52.839
2587	2024-10-09	Decatur	54	[]	2025-06-08 17:05:52.228
2571	2024-09-18	Decatur	118	[]	2025-06-08 17:05:51.009
2563	2024-09-11	Decatur	54	[]	2025-06-08 17:05:50.299
2670	2025-01-15	Alpharetta	1180	[]	2025-06-08 17:05:58.699
2677	2025-01-20	Alpharetta	436	[]	2025-06-08 17:05:59.233
2682	2025-01-22	Alpharetta	864	[]	2025-06-08 17:05:59.613
2699	2025-02-05	Alpharetta	1252	[]	2025-06-08 17:06:00.907
2705	2025-02-12	Alpharetta	1852	[]	2025-06-08 17:06:01.436
2712	2025-02-19	Alpharetta	900	[]	2025-06-08 17:06:01.971
2719	2025-02-26	Alpharetta	1010	[]	2025-06-08 17:06:02.506
2726	2025-03-05	Alpharetta	1092	[]	2025-06-08 17:06:03.043
2733	2025-03-12	Alpharetta	1301	[]	2025-06-08 17:06:03.576
2740	2025-03-19	Alpharetta	1106	[]	2025-06-08 17:06:04.202
2747	2025-03-27	Alpharetta	1100	[]	2025-06-08 17:06:04.738
2754	2025-04-02	Alpharetta	850	[]	2025-06-08 17:06:05.273
2761	2025-04-09	Alpharetta	628	[]	2025-06-08 17:06:05.809
2768	2025-04-16	Alpharetta	1556	[]	2025-06-08 17:06:06.345
2770	2025-04-16	East Cobb/Roswell	993	[]	2025-06-08 17:06:06.498
2763	2025-04-09	East Cobb/Roswell	950	[]	2025-06-08 17:06:05.963
2756	2025-04-02	East Cobb/Roswell	878	[]	2025-06-08 17:06:05.426
2749	2025-03-27	East Cobb/Roswell	907	[]	2025-06-08 17:06:04.891
2742	2025-03-19	East Cobb/Roswell	1270	[]	2025-06-08 17:06:04.354
2728	2025-03-05	East Cobb/Roswell	983	[]	2025-06-08 17:06:03.195
2721	2025-02-26	East Cobb/Roswell	854	[]	2025-06-08 17:06:02.659
2714	2025-02-19	East Cobb/Roswell	1381	[]	2025-06-08 17:06:02.124
2707	2025-02-12	East Cobb/Roswell	976	[]	2025-06-08 17:06:01.59
2701	2025-02-05	East Cobb/Roswell	1265	[]	2025-06-08 17:06:01.13
2694	2025-01-29	East Cobb/Roswell	1890	[]	2025-06-08 17:06:00.527
2679	2025-01-20	East Cobb/Roswell	400	[]	2025-06-08 17:05:59.385
2672	2025-01-15	East Cobb/Roswell	1776	[]	2025-06-08 17:05:58.851
2771	2025-04-16	Sandy Springs	1123	[]	2025-06-08 17:06:06.627
2764	2025-04-09	Sandy Springs	418	[]	2025-06-08 17:06:06.039
2757	2025-04-02	Sandy Springs	839	[]	2025-06-08 17:06:05.502
2750	2025-03-27	Sandy Springs	649	[]	2025-06-08 17:06:04.968
2743	2025-03-19	Sandy Springs	601	[]	2025-06-08 17:06:04.431
2736	2025-03-12	Sandy Springs	485	[]	2025-06-08 17:06:03.807
2729	2025-03-05	Sandy Springs	117	[]	2025-06-08 17:06:03.272
2722	2025-02-26	Sandy Springs	650	[]	2025-06-08 17:06:02.736
2715	2025-02-19	Sandy Springs	677	[]	2025-06-08 17:06:02.2
2702	2025-02-05	Sandy Springs	549	[]	2025-06-08 17:06:01.208
2695	2025-01-29	Sandy Springs	706	[]	2025-06-08 17:06:00.602
2685	2025-01-22	Sandy Springs	545	[]	2025-06-08 17:05:59.842
2680	2025-01-20	Sandy Springs	328	[]	2025-06-08 17:05:59.461
2673	2025-01-15	Sandy Springs	664	[]	2025-06-08 17:05:58.928
2765	2025-04-09	Intown/Druid Hills	514	[]	2025-06-08 17:06:06.116
2758	2025-04-02	Intown/Druid Hills	1647	[]	2025-06-08 17:06:05.579
2751	2025-03-27	Intown/Druid Hills	884	[]	2025-06-08 17:06:05.044
2744	2025-03-19	Intown/Druid Hills	882	[]	2025-06-08 17:06:04.51
2737	2025-03-12	Intown/Druid Hills	796	[]	2025-06-08 17:06:03.884
2730	2025-03-05	Intown/Druid Hills	815	[]	2025-06-08 17:06:03.348
2723	2025-02-26	Intown/Druid Hills	605	[]	2025-06-08 17:06:02.812
2716	2025-02-19	Intown/Druid Hills	1371	[]	2025-06-08 17:06:02.277
2709	2025-02-12	Intown/Druid Hills	719	[]	2025-06-08 17:06:01.742
2703	2025-02-05	Intown/Druid Hills	854	[]	2025-06-08 17:06:01.285
2686	2025-01-22	Intown/Druid Hills	662	[]	2025-06-08 17:05:59.918
2681	2025-01-20	Intown/Druid Hills	2120	[]	2025-06-08 17:05:59.537
2674	2025-01-15	Intown/Druid Hills	727	[]	2025-06-08 17:05:59.005
2667	2025-01-08	Intown/Druid Hills	1064	[]	2025-06-08 17:05:58.469
2766	2025-04-09	Flowery Branch	225	[]	2025-06-08 17:06:06.192
2759	2025-04-02	Flowery Branch	272	[]	2025-06-08 17:06:05.657
2752	2025-03-27	Flowery Branch	256	[]	2025-06-08 17:06:05.12
2745	2025-03-19	Flowery Branch	400	[]	2025-06-08 17:06:04.586
2738	2025-03-12	Flowery Branch	275	[]	2025-06-08 17:06:03.96
2731	2025-03-05	Flowery Branch	351	[]	2025-06-08 17:06:03.424
2724	2025-02-26	Flowery Branch	516	[]	2025-06-08 17:06:02.889
2717	2025-02-19	Flowery Branch	284	[]	2025-06-08 17:06:02.353
2710	2025-02-12	Flowery Branch	141	[]	2025-06-08 17:06:01.818
2697	2025-01-29	Flowery Branch	402	[]	2025-06-08 17:06:00.755
2675	2025-01-15	Flowery Branch	230	[]	2025-06-08 17:05:59.081
2668	2025-01-08	Flowery Branch	426	[]	2025-06-08 17:05:58.545
2769	2025-04-16	Dunwoody/PTC	2103	[]	2025-06-08 17:06:06.421
2762	2025-04-09	Dunwoody/PTC	1226	[]	2025-06-08 17:06:05.886
2755	2025-04-02	Dunwoody/PTC	2053	[]	2025-06-08 17:06:05.349
2748	2025-03-27	Dunwoody/PTC	1503	[]	2025-06-08 17:06:04.815
2734	2025-03-12	Dunwoody/PTC	840	[]	2025-06-08 17:06:03.653
2727	2025-03-05	Dunwoody/PTC	769	[]	2025-06-08 17:06:03.119
2720	2025-02-26	Dunwoody/PTC	1153	[]	2025-06-08 17:06:02.582
2713	2025-02-19	Dunwoody/PTC	2667	[]	2025-06-08 17:06:02.047
2706	2025-02-12	Dunwoody/PTC	1272	[]	2025-06-08 17:06:01.513
2700	2025-02-05	Dunwoody/PTC	2173	[]	2025-06-08 17:06:00.984
2683	2025-01-22	Dunwoody/PTC	986	[]	2025-06-08 17:05:59.689
2678	2025-01-20	Dunwoody/PTC	792	[]	2025-06-08 17:05:59.309
2671	2025-01-15	Dunwoody/PTC	2384	[]	2025-06-08 17:05:58.775
2775	2025-04-23	Alpharetta	2244	[]	2025-06-08 17:06:06.933
2789	2025-05-07	Alpharetta	2396	[]	2025-06-08 17:06:08.004
2796	2025-05-14	Alpharetta	2520	[]	2025-06-08 17:06:08.537
2810	2025-05-28	Alpharetta	1575	[]	2025-06-08 17:06:09.667
2784		East Cobb/Roswell	915	[]	2025-06-08 17:06:07.62
2798	2025-05-14	East Cobb/Roswell	726	[]	2025-06-08 17:06:08.691
2791	2025-05-07	East Cobb/Roswell	1052	[]	2025-06-08 17:06:08.156
2782		Alpharetta	618	[]	2025-06-08 17:06:07.468
2777	2025-04-23	East Cobb/Roswell	1122	[]	2025-06-08 17:06:07.086
2735	2025-03-12	East Cobb/Roswell	1597	[]	2025-06-08 17:06:03.73
2684	2025-01-22	East Cobb/Roswell	1192	[]	2025-06-08 17:05:59.765
2665	2025-01-08	East Cobb/Roswell	1115	[]	2025-06-08 17:05:58.316
2623	2024-11-13	East Cobb/Roswell	1389	[]	2025-06-08 17:05:55.035
2570	2024-09-18	East Cobb/Roswell	1323	[]	2025-06-08 17:05:50.932
2554	2024-09-04	East Cobb/Roswell	1148	[]	2025-06-08 17:05:49.612
2499	2024-07-17	East Cobb/Roswell	1820	[]	2025-06-08 17:05:45.31
2492	2024-07-10	East Cobb/Roswell	2170	[]	2025-06-08 17:05:44.776
2447	2024-05-22	East Cobb/Roswell	582	[]	2025-06-08 17:05:41.124
2439	2024-05-15	East Cobb/Roswell	1259	[]	2025-06-08 17:05:40.51
2379	2024-03-06	East Cobb/Roswell	1160	[]	2025-06-08 17:05:35.698
2338	2024-01-31	East Cobb/Roswell	1296	[]	2025-06-08 17:05:32.405
2321	2024-01-17	East Cobb/Roswell	1297	[]	2025-06-08 17:05:30.995
2262	2023-11-15	East Cobb/Roswell	1501	[]	2025-06-08 17:05:26.384
2236	2023-10-25	East Cobb/Roswell	1379	[]	2025-06-08 17:05:24.3
2218	2023-10-11	East Cobb/Roswell	1605	[]	2025-06-08 17:05:22.928
2156	2023-08-24	East Cobb/Roswell	970	[]	2025-06-08 17:05:18.029
2122	2023-07-26	East Cobb/Roswell	1864	[]	2025-06-08 17:05:15.388
2106	2023-07-11	East Cobb/Roswell	1690	[]	2025-06-08 17:05:14.055
2046	2023-05-17	East Cobb/Roswell	1246	[]	2025-06-08 17:05:09.369
2019	2023-04-26	East Cobb/Roswell	1034	[]	2025-06-08 17:05:07.258
1983	2023-03-29	East Cobb/Roswell	1310	[]	2025-06-08 17:05:04.478
1876	2022-12-28	East Cobb/Roswell	1411	[]	2025-06-08 17:04:56.089
1816	2022-11-09	East Cobb/Roswell	347	[]	2025-06-08 17:04:51.4
1805	2022-11-02	East Cobb/Roswell	190	[]	2025-06-08 17:04:50.566
1761	2022-10-05	East Cobb/Roswell	226	[]	2025-06-08 17:04:47.157
1695	2022-08-31	East Cobb/Roswell	224	[]	2025-06-08 17:04:41.896
1684	2022-08-17	East Cobb/Roswell	199	[]	2025-06-08 17:04:41.062
1633	2022-07-13	East Cobb/Roswell	370	[]	2025-06-08 17:04:37.017
1599	2022-06-22	East Cobb/Roswell	2897	[]	2025-06-08 17:04:34.373
1590	2022-06-15	East Cobb/Roswell	2841	[]	2025-06-08 17:04:33.692
1529	2022-02-15	East Cobb/Roswell	388	[]	2025-06-08 17:04:28.858
1494	2022-02-12	East Cobb/Roswell	1892	[]	2025-06-08 17:04:26.099
1486	2022-02-11	East Cobb/Roswell	496	[]	2025-06-08 17:04:25.487
1435	2022-02-06	East Cobb/Roswell	249	[]	2025-06-08 17:04:21.44
1391	2022-01-26	East Cobb/Roswell	2210	[]	2025-06-08 17:04:17.995
1385	2022-01-19	East Cobb/Roswell	4109	[]	2025-06-08 17:04:17.489
1380	2022-01-17	East Cobb/Roswell	879	[]	2025-06-08 17:04:17.108
1341	2021-11-17	East Cobb/Roswell	229	[]	2025-06-08 17:04:14.042
1310	2021-10-13	East Cobb/Roswell	266	[]	2025-06-08 17:04:11.575
2806	2025-05-21	Sandy Springs	644	[]	2025-06-08 17:06:09.359
2799	2025-05-14	Sandy Springs	631	[]	2025-06-08 17:06:08.767
2792	2025-05-07	Sandy Springs	599	[]	2025-06-08 17:06:08.233
2783		Dunwoody/PTC	2032	[]	2025-06-08 17:06:07.544
2778	2025-04-23	Sandy Springs	527	[]	2025-06-08 17:06:07.163
2708	2025-02-12	Sandy Springs	538	[]	2025-06-08 17:06:01.666
2533	2024-08-14	Sandy Springs	356	[]	2025-06-08 17:05:48.008
2398	2024-03-20	Sandy Springs	736	[]	2025-06-08 17:05:37.273
2149	2023-08-16	Sandy Springs	298	[]	2025-06-08 17:05:17.502
1795	2022-10-26	Sandy Springs	1106	[]	2025-06-08 17:04:49.806
1348	2021-11-22	Sandy Springs	350	[]	2025-06-08 17:04:14.575
2811	2025-05-28	Intown/Druid Hills	832	[]	2025-06-08 17:06:09.743
2807	2025-05-21	Intown/Druid Hills	516	[]	2025-06-08 17:06:09.436
2800	2025-05-14	Intown/Druid Hills	921	[]	2025-06-08 17:06:08.844
2793	2025-05-07	Intown/Druid Hills	853	[]	2025-06-08 17:06:08.309
2787		Flowery Branch	398	[]	2025-06-08 17:06:07.851
2779	2025-04-23	Intown/Druid Hills	1344	[]	2025-06-08 17:06:07.239
2772	2025-04-16	Intown/Druid Hills	1240	[]	2025-06-08 17:06:06.704
2696	2025-01-29	Intown/Druid Hills	1992	[]	2025-06-08 17:06:00.678
2656	2024-12-18	Intown/Druid Hills	922	[]	2025-06-08 17:05:57.621
2510	2024-07-24	Intown/Druid Hills	932	[]	2025-06-08 17:05:46.156
2373	2024-02-28	Intown/Druid Hills	749	[]	2025-06-08 17:05:35.238
2341	2024-01-31	Intown/Druid Hills	723	[]	2025-06-08 17:05:32.637
2125	2023-07-26	Intown/Druid Hills	923	[]	2025-06-08 17:05:15.614
1978	2023-03-22	Intown/Druid Hills	279	[]	2025-06-08 17:05:04.1
1870	2022-12-21	Intown/Druid Hills	300	[]	2025-06-08 17:04:55.632
1697	2022-08-31	Intown/Druid Hills	106	[]	2025-06-08 17:04:42.159
2808	2025-05-21	Flowery Branch	285	[]	2025-06-08 17:06:09.513
2801	2025-05-14	Flowery Branch	298	[]	2025-06-08 17:06:08.921
2794	2025-05-07	Flowery Branch	262	[]	2025-06-08 17:06:08.384
2785		Sandy Springs	744	[]	2025-06-08 17:06:07.697
2780	2025-04-23	Flowery Branch	350	[]	2025-06-08 17:06:07.315
2773	2025-04-16	Flowery Branch	175	[]	2025-06-08 17:06:06.78
2804	2025-05-21	Dunwoody/PTC	1783	[]	2025-06-08 17:06:09.204
2797	2025-05-14	Dunwoody/PTC	2316	[]	2025-06-08 17:06:08.614
2790	2025-05-07	Dunwoody/PTC	2607	[]	2025-06-08 17:06:08.08
2776	2025-04-23	Dunwoody/PTC	2223	[]	2025-06-08 17:06:07.009
2802	2025-05-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1800}]	2025-06-08 17:06:08.998
2795	2025-05-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":800}]	2025-06-08 17:06:08.46
2803	2025-05-21	Alpharetta	950	[]	2025-06-08 17:06:09.125
2774	2025-04-16	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1450}]	2025-06-08 17:06:06.857
2805	2025-05-21	East Cobb/Roswell	1403	[]	2025-06-08 17:06:09.283
2786		Intown/Druid Hills	1198	[]	2025-06-08 17:06:07.774
1592	2022-06-15	Intown/Druid Hills	93	[]	2025-06-08 17:04:33.844
1428	2022-02-05	Intown/Druid Hills	304	[]	2025-06-08 17:04:20.909
2581	2024-09-25	Flowery Branch	545	[]	2025-06-08 17:05:51.77
2241	2023-10-25	Flowery Branch	1163	[]	2025-06-08 17:05:24.681
2196	2023-09-20	Flowery Branch	635	[]	2025-06-08 17:05:21.146
2024	2023-04-26	Flowery Branch	374	[]	2025-06-08 17:05:07.701
1777	2022-10-12	Flowery Branch	200	[]	2025-06-08 17:04:48.37
2741	2025-03-19	Dunwoody/PTC	1097	[]	2025-06-08 17:06:04.278
2545	2024-08-28	Dunwoody/PTC	1322	[]	2025-06-08 17:05:48.923
2369	2024-02-28	Dunwoody/PTC	1708	[]	2025-06-08 17:05:34.931
2138	2023-08-09	Dunwoody/PTC	1777	[]	2025-06-08 17:05:16.597
1982	2023-03-29	Dunwoody/PTC	4041	[]	2025-06-08 17:05:04.402
1846	2022-12-07	Dunwoody/PTC	1238	[]	2025-06-08 17:04:53.802
1332	2021-11-10	Dunwoody/PTC	3728	[]	2025-06-08 17:04:13.363
1281	2021-09-15	Dunwoody/PTC	1989	[]	2025-06-08 17:04:09.31
2555	2024-09-04	Decatur	54	[]	2025-06-08 17:05:49.688
2263	2023-11-15	Decatur	91	[]	2025-06-08 17:05:26.461
2038	2023-05-10	Decatur	156	[]	2025-06-08 17:05:08.761
1623	2022-07-06	Decatur	107	[]	2025-06-08 17:04:36.26
1539	2022-05-11	Decatur	154	[]	2025-06-08 17:04:29.621
2350	2024-02-07	Snellville	110	[]	2025-06-08 17:05:33.33
2160	2023-08-24	Snellville	172	[]	2025-06-08 17:05:18.33
2014	2023-04-19	Snellville	239	[]	2025-06-08 17:05:06.882
1841	2022-11-30	Snellville	200	[]	2025-06-08 17:04:53.419
1808	2022-11-02	Snellville	105	[]	2025-06-08 17:04:50.793
1466	2022-02-09	Snellville	150	[]	2025-06-08 17:04:23.906
2781	2025-04-23	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3040}]	2025-06-08 17:06:07.391
2809	2025-05-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4810}]	2025-06-08 17:06:09.59
1481	2022-02-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":180}]	2025-06-08 17:04:25.107
1512	2022-02-13	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1005}]	2025-06-08 17:04:27.572
1523	2022-02-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":575}]	2025-06-08 17:04:28.402
1534	2022-02-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":190}]	2025-06-08 17:04:29.239
1555	2022-05-18	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":450}]	2025-06-08 17:04:30.954
1567	2022-05-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":800}]	2025-06-08 17:04:31.869
1586	2022-06-08	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1809}]	2025-06-08 17:04:33.388
1595	2022-06-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":450}]	2025-06-08 17:04:34.071
1618	2022-06-29	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":151}]	2025-06-08 17:04:35.88
1647	2022-07-20	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1740}]	2025-06-08 17:04:38.152
1657	2022-07-27	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":525}]	2025-06-08 17:04:38.911
1678	2022-08-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":375}]	2025-06-08 17:04:40.608
1689	2022-08-17	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1391}]	2025-06-08 17:04:41.442
1690	2022-08-24	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5986}]	2025-06-08 17:04:41.518
1702	2022-08-31	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":350}]	2025-06-08 17:04:42.536
1730	2022-09-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2138}]	2025-06-08 17:04:44.738
1745	2022-09-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1500}]	2025-06-08 17:04:45.875
1756	2022-09-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1320}]	2025-06-08 17:04:46.777
1767	2022-10-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2079}]	2025-06-08 17:04:47.613
1778	2022-10-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":653}]	2025-06-08 17:04:48.446
1789	2022-10-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2363}]	2025-06-08 17:04:49.353
1800	2022-10-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1167}]	2025-06-08 17:04:50.19
1822	2022-11-09	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5030}]	2025-06-08 17:04:51.931
1833	2022-11-16	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":10728}]	2025-06-08 17:04:52.764
1844	2022-11-30	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4652}]	2025-06-08 17:04:53.65
1855	2022-12-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2722}]	2025-06-08 17:04:54.482
1873	2022-12-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4000}]	2025-06-08 17:04:55.859
1882	2022-12-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":100}]	2025-06-08 17:04:56.617
1929	2023-02-01	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2998}]	2025-06-08 17:05:00.274
1946	2023-02-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4485}]	2025-06-08 17:05:01.564
1956	2023-02-22	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":200}]	2025-06-08 17:05:02.42
1989	2023-03-29	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":503}]	2025-06-08 17:05:04.998
1998	2023-04-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1238}]	2025-06-08 17:05:05.677
2007	2023-04-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":500}]	2025-06-08 17:05:06.354
2016	2023-04-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5019}]	2025-06-08 17:05:07.032
2025	2023-04-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1906}]	2025-06-08 17:05:07.777
2034	2023-05-03	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":500}]	2025-06-08 17:05:08.457
2043	2023-05-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":808}]	2025-06-08 17:05:09.141
2052	2023-05-17	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":350}]	2025-06-08 17:05:09.822
2060	2023-05-24	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1900}]	2025-06-08 17:05:10.499
2069	2023-05-31	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":841}]	2025-06-08 17:05:11.212
2078	2023-06-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1508}]	2025-06-08 17:05:11.891
2087	2023-06-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1931}]	2025-06-08 17:05:12.62
2095	2023-06-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1347}]	2025-06-08 17:05:13.224
2103	2023-06-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3098}]	2025-06-08 17:05:13.828
2111	2023-07-11	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1664}]	2025-06-08 17:05:14.432
2119	2023-07-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2113}]	2025-06-08 17:05:15.161
2128	2023-07-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":855}]	2025-06-08 17:05:15.841
2144	2023-08-09	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":432}]	2025-06-08 17:05:17.124
2153	2023-08-16	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":7479}]	2025-06-08 17:05:17.803
2162	2023-08-24	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1235}]	2025-06-08 17:05:18.481
2171	2023-08-30	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1485}]	2025-06-08 17:05:19.161
2180	2023-09-06	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1106}]	2025-06-08 17:05:19.924
2189	2023-09-13	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2045}]	2025-06-08 17:05:20.61
2197	2023-09-20	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1178}]	2025-06-08 17:05:21.222
2206	2023-09-27	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3005}]	2025-06-08 17:05:21.91
2215	2023-10-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1482}]	2025-06-08 17:05:22.699
2224	2023-10-11	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":194}]	2025-06-08 17:05:23.386
2233	2023-10-18	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3635}]	2025-06-08 17:05:24.072
2242	2023-10-25	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2985}]	2025-06-08 17:05:24.757
2251	2023-11-01	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1055}]	2025-06-08 17:05:25.446
2259	2023-11-08	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1761}]	2025-06-08 17:05:26.156
2268	2023-11-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":11278}]	2025-06-08 17:05:26.843
2277	2023-11-29	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":332}]	2025-06-08 17:05:27.532
2286	2023-12-06	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4981}]	2025-06-08 17:05:28.219
2295	2023-12-13	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1844}]	2025-06-08 17:05:29.01
2303	2023-12-20	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":8696}]	2025-06-08 17:05:29.62
2318	2024-01-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":485}]	2025-06-08 17:05:30.765
2327	2024-01-17	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":12252}]	2025-06-08 17:05:31.456
2335	2024-01-24	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1718}]	2025-06-08 17:05:32.166
2343	2024-01-31	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3254}]	2025-06-08 17:05:32.792
2359	2024-02-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3141}]	2025-06-08 17:05:34.015
2367	2024-02-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":7050}]	2025-06-08 17:05:34.777
2376	2024-02-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1000}]	2025-06-08 17:05:35.468
2385	2024-03-06	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4544}]	2025-06-08 17:05:36.166
2393	2024-03-13	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1734}]	2025-06-08 17:05:36.788
2401	2024-03-20	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4771}]	2025-06-08 17:05:37.503
2407	2024-04-03	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":200}]	2025-06-08 17:05:37.962
2414	2024-04-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4287}]	2025-06-08 17:05:38.513
2420	2024-04-17	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2052}]	2025-06-08 17:05:38.976
2428	2024-05-01	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2382}]	2025-06-08 17:05:39.665
2436	2024-05-08	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1559}]	2025-06-08 17:05:40.281
2444	2024-05-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2333}]	2025-06-08 17:05:40.893
2451	2024-05-22	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":402}]	2025-06-08 17:05:41.434
2458	2024-05-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":806}]	2025-06-08 17:05:42.075
2466	2024-06-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":100}]	2025-06-08 17:05:42.686
2474	2024-06-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2084}]	2025-06-08 17:05:43.299
2482	2024-06-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1432}]	2025-06-08 17:05:43.914
2489	2024-06-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2972}]	2025-06-08 17:05:44.449
2496	2024-07-10	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3032}]	2025-06-08 17:05:45.08
2504	2024-07-17	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2476}]	2025-06-08 17:05:45.697
2512	2024-07-24	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2700}]	2025-06-08 17:05:46.308
2520	2024-07-31	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2013}]	2025-06-08 17:05:46.919
2528	2024-08-07	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5000}]	2025-06-08 17:05:47.627
2536	2024-08-14	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":450}]	2025-06-08 17:05:48.237
2543	2024-08-21	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2326}]	2025-06-08 17:05:48.77
2551	2024-08-28	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":200}]	2025-06-08 17:05:49.383
2559	2024-09-04	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1400}]	2025-06-08 17:05:49.994
2567	2024-09-11	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3400}]	2025-06-08 17:05:50.703
2575	2024-09-18	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3015}]	2025-06-08 17:05:51.314
2582	2024-09-25	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5650}]	2025-06-08 17:05:51.847
2583	2024-10-02	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":14023}]	2025-06-08 17:05:51.924
2591	2024-10-09	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1900}]	2025-06-08 17:05:52.533
2599	2024-10-16	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3746}]	2025-06-08 17:05:53.144
2606	2024-10-23	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4279}]	2025-06-08 17:05:53.677
2613	2024-10-30	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1330}]	2025-06-08 17:05:54.271
2620	2024-11-06	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":550}]	2025-06-08 17:05:54.806
2628	2024-11-13	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1780}]	2025-06-08 17:05:55.416
2636	2024-11-20	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":6409}]	2025-06-08 17:05:56.031
2644	2024-12-04	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1500}]	2025-06-08 17:05:56.642
2651	2024-12-11	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":6570}]	2025-06-08 17:05:57.182
2658	2024-12-18	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5100}]	2025-06-08 17:05:57.774
2660	2024-12-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2000}]	2025-06-08 17:05:57.926
2669	2025-01-08	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":900}]	2025-06-08 17:05:58.622
2676	2025-01-15	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1730}]	2025-06-08 17:05:59.157
2698	2025-01-29	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":7140}]	2025-06-08 17:06:00.831
2704	2025-02-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2600}]	2025-06-08 17:06:01.361
2711	2025-02-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4474}]	2025-06-08 17:06:01.894
2718	2025-02-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2650}]	2025-06-08 17:06:02.429
2725	2025-02-26	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":1380}]	2025-06-08 17:06:02.967
2732	2025-03-05	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4795}]	2025-06-08 17:06:03.5
2739	2025-03-12	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":4780}]	2025-06-08 17:06:04.125
2746	2025-03-19	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":2618}]	2025-06-08 17:06:04.662
2753	2025-03-27	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":3278}]	2025-06-08 17:06:05.196
2760	2025-04-02	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":5518}]	2025-06-08 17:06:05.733
2767	2025-04-09	Groups - Main	0	[{"groupName":"Unnamed Groups","sandwichCount":153}]	2025-06-08 17:06:06.269
2815	2025-06-04	Alpharetta	2767		2025-06-14 03:13:17.621648
2816	2025-06-04	Dunwoody/PTC	1188		2025-06-14 03:14:01.844409
2817	2025-06-04	East Cobb/Roswell	2059		2025-06-14 03:14:21.017213
2818	2025-06-04	Sandy Springs	134		2025-06-14 03:14:41.845669
2819	2025-06-04	Flowery Branch	689		2025-06-14 03:15:05.292195
2820	2025-06-04	Collective Learning	250		2025-06-14 03:20:04.941773
2821	2025-06-11	Alpharetta	2964		2025-06-14 03:20:28.986432
2822	2025-06-11	Dunwoody/PTC	1251		2025-06-14 03:20:54.425635
2823	2025-06-11	East Cobb/Roswell	1186		2025-06-14 03:21:24.109425
2824	2025-06-11	Sandy Springs	203		2025-06-14 03:21:40.684005
2825	2025-06-11	Flowery Branch	258		2025-06-14 03:21:57.321829
2828	2025-06-11	Groups	4259	[]	2025-06-14 03:44:51.552884
2830	2025-02-05	Collective Learning	50	[]	2025-06-14 04:28:10.844
2831	2025-02-12	Collective Learning	50	[]	2025-06-14 04:28:11.044
2832	2025-02-19	Collective Learning	50	[]	2025-06-14 04:28:11.078
2833	2025-02-26	Collective Learning	50	[]	2025-06-14 04:28:11.111
2834	2025-03-05	Collective Learning	50	[]	2025-06-14 04:28:11.146
2835	2025-03-12	Collective Learning	50	[]	2025-06-14 04:28:11.18
2836	2025-03-19	Collective Learning	50	[]	2025-06-14 04:28:11.213
2837	2025-03-27	Collective Learning	50	[]	2025-06-14 04:28:11.247
2838	2025-04-02	Collective Learning	50	[]	2025-06-14 04:28:11.281
2839	2025-04-16	Collective Learning	50	[]	2025-06-14 04:28:11.315
2840	2025-04-23	Collective Learning	50	[]	2025-06-14 04:28:11.349
2842	2025-05-07	Collective Learning	50	[]	2025-06-14 04:28:11.417
2843	2025-05-14	Collective Learning	50	[]	2025-06-14 04:28:11.45
2844	2025-05-21	Collective Learning	50	[]	2025-06-14 04:28:11.485
2845	2025-05-29	Collective Learning	250	[]	2025-06-14 04:28:11.52
2847	2025-06-11	Collective Learning	300	[]	2025-06-14 04:28:11.588
2891	2022-08-10	Peachtree Corners	475	[]	2025-06-14 04:28:13.121
2890	2022-08-03	Peachtree Corners	401	[]	2025-06-14 04:28:13.088
2889	2022-07-27	Peachtree Corners	232	[]	2025-06-14 04:28:13.052
2888	2022-07-20	Peachtree Corners	272	[]	2025-06-14 04:28:13.017
2887	2022-07-13	Peachtree Corners	370	[]	2025-06-14 04:28:12.983
2886	2022-07-06	Peachtree Corners	341	[]	2025-06-14 04:28:12.944
2885	2022-06-29	Peachtree Corners	591	[]	2025-06-14 04:28:12.91
2884	2022-06-22	Peachtree Corners	703	[]	2025-06-14 04:28:12.876
2883	2022-06-15	Peachtree Corners	557	[]	2025-06-14 04:28:12.842
2882	2022-06-08	Peachtree Corners	453	[]	2025-06-14 04:28:12.808
2881	2022-06-01	Peachtree Corners	433	[]	2025-06-14 04:28:12.775
2879	2022-05-18	Peachtree Corners	165	[]	2025-06-14 04:28:12.707
2880	2022-05-15	Peachtree Corners	187	[]	2025-06-14 04:28:12.741
2878	2022-05-11	Peachtree Corners	699	[]	2025-06-14 04:28:12.674
2877	2022-05-04	Peachtree Corners	388	[]	2025-06-14 04:28:12.64
2876	2022-04-27	Peachtree Corners	503	[]	2025-06-14 04:28:12.606
2875	2022-04-20	Peachtree Corners	829	[]	2025-06-14 04:28:12.571
2874	2022-04-13	Peachtree Corners	211	[]	2025-06-14 04:28:12.537
2873	2022-04-06	Peachtree Corners	496	[]	2025-06-14 04:28:12.503
2872	2022-03-30	Peachtree Corners	432	[]	2025-06-14 04:28:12.469
2871	2022-03-23	Peachtree Corners	432	[]	2025-06-14 04:28:12.435
2870	2022-03-16	Peachtree Corners	230	[]	2025-06-14 04:28:12.4
2869	2022-03-09	Peachtree Corners	773	[]	2025-06-14 04:28:12.366
2868	2022-03-02	Peachtree Corners	249	[]	2025-06-14 04:28:12.333
2867	2022-02-23	Peachtree Corners	551	[]	2025-06-14 04:28:12.299
2866	2022-02-16	Peachtree Corners	462	[]	2025-06-14 04:28:12.265
2864	2022-02-02	Peachtree Corners	252	[]	2025-06-14 04:28:12.196
2863	2022-01-26	Peachtree Corners	282	[]	2025-06-14 04:28:12.162
2862	2022-01-05	Peachtree Corners	371	[]	2025-06-14 04:28:12.128
2861	2021-12-15	Peachtree Corners	558	[]	2025-06-14 04:28:12.094
2860	2021-12-08	Peachtree Corners	307	[]	2025-06-14 04:28:12.06
2859	2021-12-01	Peachtree Corners	166	[]	2025-06-14 04:28:12.026
2857	2021-11-17	Peachtree Corners	229	[]	2025-06-14 04:28:11.958
2856	2021-11-10	Peachtree Corners	245	[]	2025-06-14 04:28:11.926
2855	2021-11-03	Peachtree Corners	184	[]	2025-06-14 04:28:11.891
2854	2021-10-27	Peachtree Corners	130	[]	2025-06-14 04:28:11.858
2853	2021-10-20	Peachtree Corners	188	[]	2025-06-14 04:28:11.824
2852	2021-10-13	Peachtree Corners	266	[]	2025-06-14 04:28:11.789
2850	2021-09-29	Peachtree Corners	114	[]	2025-06-14 04:28:11.721
2849	2021-09-22	Peachtree Corners	99	[]	2025-06-14 04:28:11.686
2848	2021-09-15	Peachtree Corners	160	[]	2025-06-14 04:28:11.652
2788		Groups - Main	0	[{"name":"Unnamed Groups","count":2050}]	2025-06-08 17:06:07.928
2841		Collective Learning	50	[]	2025-06-14 04:28:11.383
2923	2020-04-22	OG Sandwich Project	317	[]	2025-06-14 13:58:25.821322
2924	2020-04-29	OG Sandwich Project	530	[]	2025-06-14 13:58:25.986478
2925	2020-05-06	OG Sandwich Project	290	[]	2025-06-14 13:58:26.059325
2926	2020-05-13	OG Sandwich Project	430	[]	2025-06-14 13:58:26.13446
2927	2020-05-20	OG Sandwich Project	581	[]	2025-06-14 13:58:26.207356
2928	2020-05-27	OG Sandwich Project	432	[]	2025-06-14 13:58:26.280642
2929	2020-06-03	OG Sandwich Project	780	[]	2025-06-14 13:58:26.353385
2930	2020-06-10	OG Sandwich Project	939	[]	2025-06-14 13:58:26.426194
2931	2020-06-17	OG Sandwich Project	995	[]	2025-06-14 13:58:26.499363
2932	2020-06-24	OG Sandwich Project	1177	[]	2025-06-14 13:58:26.572327
2933	2020-07-01	OG Sandwich Project	626	[]	2025-06-14 13:58:26.644968
2934	2020-07-08	OG Sandwich Project	866	[]	2025-06-14 13:58:26.718537
2935	2020-07-15	OG Sandwich Project	1231	[]	2025-06-14 13:58:26.791257
2936	2020-07-22	OG Sandwich Project	1195	[]	2025-06-14 13:58:26.863834
2937	2020-07-29	OG Sandwich Project	991	[]	2025-06-14 13:58:26.936663
2938	2020-08-05	OG Sandwich Project	953	[]	2025-06-14 13:58:27.009322
2939	2020-08-12	OG Sandwich Project	752	[]	2025-06-14 13:58:27.082184
2940	2020-08-19	OG Sandwich Project	1114	[]	2025-06-14 13:58:27.155493
2941	2020-08-26	OG Sandwich Project	965	[]	2025-06-14 13:58:27.228472
2942	2020-09-02	OG Sandwich Project	813	[]	2025-06-14 13:58:27.301281
2943	2020-09-09	OG Sandwich Project	1361	[]	2025-06-14 13:58:27.37415
2944	2020-09-16	OG Sandwich Project	1269	[]	2025-06-14 13:58:27.447058
2945	2020-09-23	OG Sandwich Project	1316	[]	2025-06-14 13:58:27.520229
2946	2020-09-30	OG Sandwich Project	1684	[]	2025-06-14 13:58:27.593074
2947	2020-10-07	OG Sandwich Project	1414	[]	2025-06-14 13:58:27.666312
2948	2020-10-14	OG Sandwich Project	943	[]	2025-06-14 13:58:27.740048
2949	2020-10-21	OG Sandwich Project	1364	[]	2025-06-14 13:58:27.812738
2950	2020-10-28	OG Sandwich Project	1454	[]	2025-06-14 13:58:27.886106
2951	2020-11-04	OG Sandwich Project	1474	[]	2025-06-14 13:58:27.958759
2952	2020-11-11	OG Sandwich Project	2595	[]	2025-06-14 13:58:28.031867
2953	2020-11-18	OG Sandwich Project	3159	[]	2025-06-14 13:58:28.105124
2954	2020-11-25	OG Sandwich Project	2518	[]	2025-06-14 13:58:28.177881
2955	2020-12-02	OG Sandwich Project	1511	[]	2025-06-14 13:58:28.250555
2956	2020-12-09	OG Sandwich Project	1365	[]	2025-06-14 13:58:28.323296
2957	2020-12-16	OG Sandwich Project	1762	[]	2025-06-14 13:58:28.39631
2958	2020-12-23	OG Sandwich Project	1481	[]	2025-06-14 13:58:28.469149
2959	2020-12-30	OG Sandwich Project	2311	[]	2025-06-14 13:58:28.542375
2960	2021-01-06	OG Sandwich Project	1841	[]	2025-06-14 13:58:28.614949
2961	2021-01-13	OG Sandwich Project	1912	[]	2025-06-14 13:58:28.687722
2962	2021-01-20	OG Sandwich Project	2865	[]	2025-06-14 13:58:28.760623
2963	2021-01-27	OG Sandwich Project	3109	[]	2025-06-14 13:58:28.833363
2964	2021-02-03	OG Sandwich Project	4711	[]	2025-06-14 13:58:28.908395
2965	2021-02-10	OG Sandwich Project	3840	[]	2025-06-14 13:58:28.981491
2966	2022-02-17	OG Sandwich Project	5418	[]	2025-06-14 13:58:29.053994
2967	2021-02-24	OG Sandwich Project	6030	[]	2025-06-14 13:58:29.127707
2968	2021-03-03	OG Sandwich Project	5186	[]	2025-06-14 13:58:29.200522
2969	2021-03-10	OG Sandwich Project	3989	[]	2025-06-14 13:58:29.274315
2970	2021-03-17	OG Sandwich Project	4052	[]	2025-06-14 13:58:29.347175
2971	2021-03-24	OG Sandwich Project	4865	[]	2025-06-14 13:58:29.420343
2972	2021-03-31	OG Sandwich Project	4225	[]	2025-06-14 13:58:29.493291
2973	2021-04-07	OG Sandwich Project	5442	[]	2025-06-14 13:58:29.569507
2974	2021-04-14	OG Sandwich Project	7241	[]	2025-06-14 13:58:29.643012
2975	2021-04-21	OG Sandwich Project	10085	[]	2025-06-14 13:58:29.716025
2976	2021-04-28	OG Sandwich Project	9454	[]	2025-06-14 13:58:29.788664
2977	2021-05-05	OG Sandwich Project	6715	[]	2025-06-14 13:58:29.861551
2978	2021-05-12	OG Sandwich Project	8579	[]	2025-06-14 13:58:29.936008
2979	2021-05-19	OG Sandwich Project	5475	[]	2025-06-14 13:58:30.008806
2980	2021-05-26	OG Sandwich Project	4063	[]	2025-06-14 13:58:30.08165
2981	2021-06-02	OG Sandwich Project	10085	[]	2025-06-14 13:58:30.155315
2982	2021-06-09	OG Sandwich Project	9454	[]	2025-06-14 13:58:30.228231
2983	2021-06-16	OG Sandwich Project	6715	[]	2025-06-14 13:58:30.301327
2984	2021-06-23	OG Sandwich Project	8579	[]	2025-06-14 13:58:30.374238
2985	2021-06-30	OG Sandwich Project	5475	[]	2025-06-14 13:58:30.446953
2986	2021-07-07	OG Sandwich Project	4063	[]	2025-06-14 13:58:30.519624
2987	2021-07-14	OG Sandwich Project	4198	[]	2025-06-14 13:58:30.592881
2988	2021-07-21	OG Sandwich Project	5372	[]	2025-06-14 13:58:30.667028
2989	2021-07-28	OG Sandwich Project	6175	[]	2025-06-14 13:58:30.739712
2990	2021-08-04	OG Sandwich Project	5764	[]	2025-06-14 13:58:30.816511
2918	2023-04-19	Decatur	93	[]	2025-06-14 04:28:14.163
2917	2023-04-12	Decatur	240	[]	2025-06-14 04:28:14.129
2915	2023-03-29	Decatur	220	[]	2025-06-14 04:28:14.062
2916	2023-04-05	Decatur	60	[]	2025-06-14 04:28:14.095
2914	2023-02-01	Peachtree Corners	496	[]	2025-06-14 04:28:14.028
2913	2023-01-25	Peachtree Corners	514	[]	2025-06-14 04:28:13.994
2912	2023-01-18	Peachtree Corners	290	[]	2025-06-14 04:28:13.959
2911	2023-01-11	Peachtree Corners	444	[]	2025-06-14 04:28:13.926
2910	2023-01-04	Peachtree Corners	263	[]	2025-06-14 04:28:13.892
2909	2022-12-28	Peachtree Corners	140	[]	2025-06-14 04:28:13.858
2908	2022-12-21	Peachtree Corners	321	[]	2025-06-14 04:28:13.823
2907	2022-12-14	Peachtree Corners	530	[]	2025-06-14 04:28:13.79
2906	2022-12-07	Peachtree Corners	410	[]	2025-06-14 04:28:13.756
2905	2022-11-30	Peachtree Corners	347	[]	2025-06-14 04:28:13.721
2904	2022-11-16	Peachtree Corners	324	[]	2025-06-14 04:28:13.687
2903	2022-11-09	Peachtree Corners	347	[]	2025-06-14 04:28:13.653
2902	2022-11-02	Peachtree Corners	190	[]	2025-06-14 04:28:13.62
2901	2022-10-26	Peachtree Corners	257	[]	2025-06-14 04:28:13.584
2900	2022-10-19	Peachtree Corners	468	[]	2025-06-14 04:28:13.55
2899	2022-10-12	Peachtree Corners	322	[]	2025-06-14 04:28:13.516
2898	2022-10-05	Peachtree Corners	226	[]	2025-06-14 04:28:13.481
2897	2022-09-28	Peachtree Corners	374	[]	2025-06-14 04:28:13.447
2896	2022-09-21	Peachtree Corners	453	[]	2025-06-14 04:28:13.41
2895	2022-09-14	Peachtree Corners	307	[]	2025-06-14 04:28:13.376
2894	2022-09-07	Peachtree Corners	226	[]	2025-06-14 04:28:13.34
2893	2022-08-31	Peachtree Corners	224	[]	2025-06-14 04:28:13.192
2892	2022-08-17	Peachtree Corners	199	[]	2025-06-14 04:28:13.158
2991	2021-08-11	OG Sandwich Project	6847	[]	2025-06-14 13:58:30.892708
2992	2021-08-18	OG Sandwich Project	5245	[]	2025-06-14 13:58:30.967119
2993	2021-08-25	OG Sandwich Project	4780	[]	2025-06-14 13:58:31.039806
2994	2021-09-01	OG Sandwich Project	4568	[]	2025-06-14 13:58:31.112796
2995	2021-09-08	OG Sandwich Project	3989	[]	2025-06-14 13:58:31.185639
2865	2022-02-09	Peachtree Corners	344	[]	2025-06-14 04:28:12.231
2858	2021-11-22	Peachtree Corners	470	[]	2025-06-14 04:28:11.992
2851	2021-10-06	Peachtree Corners	126	[]	2025-06-14 04:28:11.754
2996	2025-06-19	Alpharetta	2442	[]	2025-06-27 21:00:03.771163
2997	2025-06-19	Dunwoody/PTC	1889	[]	2025-06-27 21:00:28.518096
2998	2025-06-19	East Cobb/Roswell	2774	[]	2025-06-27 21:00:44.282973
2999	2025-06-19	Sandy Springs	856	[]	2025-06-27 21:00:59.136247
3000	2025-06-19	Intown/Druid Hills	1312	[]	2025-06-27 21:01:33.98
3001	2025-06-19	Collective Learning	300	[]	2025-06-27 21:02:09.582087
3002	2025-06-26	Alpharetta	2466	[]	2025-06-27 21:02:30.938719
3004	2025-06-26	East Cobb/Roswell	1960	[]	2025-06-27 21:03:52.328332
3005	2025-06-26	Sandy Springs	667	[]	2025-06-27 21:06:51.844333
3012	2025-01-08	Groups	900	[]	2025-07-02 23:47:56.320768
3013	2025-01-15	Groups	1730	[]	2025-07-02 23:47:56.471936
3014	2025-01-29	Groups	7140	[]	2025-07-02 23:47:56.610466
3015	2025-02-05	Groups	2600	[]	2025-07-02 23:47:56.749801
3016	2025-02-12	Groups	4474	[]	2025-07-02 23:47:56.889167
3017	2025-02-19	Groups	2650	[]	2025-07-02 23:47:57.028888
3018	2025-03-05	Groups	4795	[]	2025-07-02 23:47:57.169251
3019	2025-03-12	Groups	4780	[]	2025-07-02 23:47:57.309313
3020	2025-04-02	Groups	5518	[]	2025-07-02 23:47:57.44876
3021	2025-04-16	Groups	1450	[]	2025-07-02 23:47:57.587959
3023	2025-05-07	Groups	800	[]	2025-07-02 23:47:57.868109
3024	2025-05-14	Groups	1800	[]	2025-07-02 23:47:58.007497
3025	2025-05-21	Groups	4610	[]	2025-07-02 23:47:58.147159
3026	2025-05-29	Groups	100	[]	2025-07-02 23:47:58.289771
3027	2025-06-04	Groups	550	[]	2025-07-02 23:47:58.429513
3030	2023-02-01	Groups	2998	[]	2025-07-03 02:06:21.778948
3031	2023-02-15	Groups	4485	[]	2025-07-03 02:06:21.778948
3032	2023-02-22	Groups	200	[]	2025-07-03 02:06:21.778948
3033	2023-03-29	Groups	503	[]	2025-07-03 02:08:08.683208
3034	2023-04-05	Groups	1238	[]	2025-07-03 02:08:08.683208
3035	2023-04-12	Groups	500	[]	2025-07-03 02:08:08.683208
3036	2023-04-19	Groups	5019	[]	2025-07-03 02:08:08.683208
3037	2023-04-26	Groups	1906	[]	2025-07-03 02:08:08.683208
3038	2023-05-03	Groups	500	[]	2025-07-03 02:08:08.683208
3039	2023-05-10	Groups	808	[]	2025-07-03 02:08:08.683208
3040	2023-05-17	Groups	350	[]	2025-07-03 02:08:08.683208
3041	2023-05-24	Groups	1900	[]	2025-07-03 02:08:08.683208
3042	2023-05-31	Groups	841	[]	2025-07-03 02:08:08.683208
3043	2023-06-07	Groups	1508	[]	2025-07-03 02:08:08.683208
3044	2023-06-14	Groups	1931	[]	2025-07-03 02:08:08.683208
3045	2023-06-21	Groups	1347	[]	2025-07-03 02:08:08.683208
3046	2023-06-28	Groups	3098	[]	2025-07-03 02:08:08.683208
3047	2023-07-11	Groups	1664	[]	2025-07-03 02:08:08.683208
3048	2023-07-19	Groups	2113	[]	2025-07-03 02:08:08.683208
3049	2023-07-26	Groups	855	[]	2025-07-03 02:08:08.683208
3050	2023-08-02	Groups	555	[]	2025-07-03 02:08:08.683208
3051	2023-08-09	Groups	432	[]	2025-07-03 02:08:08.683208
3052	2023-08-16	Groups	7479	[]	2025-07-03 02:08:08.683208
3053	2023-08-24	Groups	1235	[]	2025-07-03 02:08:23.210047
3054	2023-08-30	Groups	1485	[]	2025-07-03 02:08:23.210047
3055	2023-09-06	Groups	1106	[]	2025-07-03 02:08:23.210047
3056	2023-09-13	Groups	2045	[]	2025-07-03 02:08:23.210047
3057	2023-09-20	Groups	1178	[]	2025-07-03 02:08:23.210047
3058	2023-09-27	Groups	3005	[]	2025-07-03 02:08:23.210047
3059	2023-10-05	Groups	1482	[]	2025-07-03 02:08:23.210047
3060	2023-10-11	Groups	194	[]	2025-07-03 02:08:23.210047
3061	2023-10-18	Groups	3635	[]	2025-07-03 02:08:23.210047
3062	2023-10-25	Groups	2985	[]	2025-07-03 02:08:23.210047
3063	2023-11-01	Groups	1055	[]	2025-07-03 02:08:23.210047
3064	2023-11-08	Groups	1761	[]	2025-07-03 02:08:23.210047
3065	2023-11-15	Groups	11278	[]	2025-07-03 02:08:23.210047
3066	2023-11-29	Groups	332	[]	2025-07-03 02:08:23.210047
3067	2023-12-06	Groups	4981	[]	2025-07-03 02:08:23.210047
3068	2023-12-13	Groups	1844	[]	2025-07-03 02:08:23.210047
3069	2023-12-20	Groups	8696	[]	2025-07-03 02:08:23.210047
3070	2024-01-10	Groups	485	[]	2025-07-03 02:08:44.274757
3071	2024-01-17	Groups	12252	[]	2025-07-03 02:08:44.274757
3072	2024-01-24	Groups	1718	[]	2025-07-03 02:08:44.274757
3073	2024-01-31	Groups	3254	[]	2025-07-03 02:08:44.274757
3074	2024-02-07	Groups	1960	[]	2025-07-03 02:08:44.274757
3075	2024-02-14	Groups	3141	[]	2025-07-03 02:08:44.274757
3076	2024-02-21	Groups	7050	[]	2025-07-03 02:08:44.274757
3077	2024-02-28	Groups	1000	[]	2025-07-03 02:08:44.274757
3078	2024-03-06	Groups	4544	[]	2025-07-03 02:08:44.274757
3079	2024-03-13	Groups	1734	[]	2025-07-03 02:08:44.274757
3080	2024-03-20	Groups	4771	[]	2025-07-03 02:08:44.274757
3081	2024-04-03	Groups	200	[]	2025-07-03 02:08:44.274757
3082	2024-04-10	Groups	4287	[]	2025-07-03 02:08:44.274757
3083	2024-04-17	Groups	2052	[]	2025-07-03 02:08:44.274757
3084	2024-04-23	Groups	3040	[]	2025-07-03 02:08:44.274757
3085	2024-05-01	Groups	2382	[]	2025-07-03 02:08:44.274757
3086	2024-05-08	Groups	1559	[]	2025-07-03 02:08:44.274757
3022		Groups	2050	[]	2025-07-02 23:47:57.728394
3087	2024-05-15	Groups	2333	[]	2025-07-03 02:08:44.274757
3088	2024-05-22	Groups	402	[]	2025-07-03 02:08:44.274757
3089	2024-05-28	Groups	806	[]	2025-07-03 02:08:44.274757
3090	2024-06-05	Groups	100	[]	2025-07-03 02:09:17.897644
3091	2024-06-12	Groups	2084	[]	2025-07-03 02:09:17.897644
3092	2024-06-19	Groups	1432	[]	2025-07-03 02:09:17.897644
3093	2024-06-26	Groups	2972	[]	2025-07-03 02:09:17.897644
3094	2024-07-10	Groups	3032	[]	2025-07-03 02:09:17.897644
3095	2024-07-17	Groups	2476	[]	2025-07-03 02:09:17.897644
3096	2024-07-24	Groups	2700	[]	2025-07-03 02:09:17.897644
3097	2024-07-31	Groups	2013	[]	2025-07-03 02:09:17.897644
3098	2024-08-07	Groups	5000	[]	2025-07-03 02:09:17.897644
3099	2024-08-14	Groups	450	[]	2025-07-03 02:09:17.897644
3100	2024-08-21	Groups	2326	[]	2025-07-03 02:09:17.897644
3101	2024-08-28	Groups	200	[]	2025-07-03 02:09:17.897644
3102	2024-09-04	Groups	1400	[]	2025-07-03 02:09:17.897644
3103	2024-09-11	Groups	3400	[]	2025-07-03 02:09:17.897644
3104	2024-09-18	Groups	3015	[]	2025-07-03 02:09:17.897644
3105	2024-09-25	Groups	5650	[]	2025-07-03 02:09:17.897644
3106	2024-10-02	Groups	14023	[]	2025-07-03 02:09:17.897644
3107	2024-10-09	Groups	1900	[]	2025-07-03 02:09:17.897644
3108	2024-10-16	Groups	3746	[]	2025-07-03 02:09:17.897644
3109	2024-10-23	Groups	4279	[]	2025-07-03 02:09:17.897644
3110	2024-10-30	Groups	1330	[]	2025-07-03 02:09:28.985625
3111	2024-11-06	Groups	550	[]	2025-07-03 02:09:28.985625
3112	2024-11-13	Groups	1780	[]	2025-07-03 02:09:28.985625
3113	2024-11-20	Groups	6409	[]	2025-07-03 02:09:28.985625
3114	2024-12-04	Groups	1500	[]	2025-07-03 02:09:28.985625
3115	2024-12-11	Groups	6570	[]	2025-07-03 02:09:28.985625
3116	2024-12-18	Groups	5100	[]	2025-07-03 02:09:28.985625
3117	2024-12-26	Groups	2000	[]	2025-07-03 02:09:28.985625
3118	2025-02-26	Groups	1380	[]	2025-07-03 02:09:28.985625
3119	2025-03-19	Groups	2618	[]	2025-07-03 02:09:28.985625
3120	2025-03-27	Groups	3278	[]	2025-07-03 02:09:28.985625
3121	2025-04-09	Groups	153	[]	2025-07-03 02:09:28.985625
3122	2024-04-23	Alpharetta	2244	[]	2025-07-03 02:12:07.274353
3123	2024-04-23	Dunwoody/PTC	2223	[]	2025-07-03 02:12:07.274353
3124	2024-04-23	East Cobb/Roswell	1122	[]	2025-07-03 02:12:07.274353
3125	2024-04-23	Sandy Springs	527	[]	2025-07-03 02:12:07.274353
3126	2024-04-23	Intown/Druid Hills	1344	[]	2025-07-03 02:12:07.274353
3127	2024-04-23	Flowery Branch	350	[]	2025-07-03 02:12:07.274353
3128	2024-04-23	Collective Learning	50	[]	2025-07-03 02:12:07.274353
3129	2025-01-22	Flowery Branch	258	[]	2025-07-03 02:12:17.340244
3130	2025-05-29	Alpharetta	768	[]	2025-07-03 02:12:17.340244
3131	2025-05-29	Dunwoody/PTC	1066	[]	2025-07-03 02:12:17.340244
3132	2025-05-29	East Cobb/Roswell	901	[]	2025-07-03 02:12:17.340244
3133	2025-05-29	Sandy Springs	529	[]	2025-07-03 02:12:17.340244
3134	2025-05-29	Intown/Druid Hills	832	[]	2025-07-03 02:12:17.340244
3135	2025-05-29	Flowery Branch	275	[]	2025-07-03 02:12:17.340244
3136	2025-06-04	Intown/Druid Hills	1221	[]	2025-07-03 02:12:17.340244
3137	2025-06-26	Dunwoody/PTC	2000	[]	2025-07-03 02:29:50.329872
3138	2025-06-26	Intown/Druid Hills	1000	[]	2025-07-03 02:30:56.303765
3139	2025-06-26	Flowery Branch	200	[]	2025-07-03 02:31:07.839619
3143	2025-06-26	Groups	3260	[{"name":"Groups","count":3260}]	2025-07-03 02:35:34.261358
3144	2025-06-19	Groups - Unassigned	0	[{"name":"Groups","count":2950}]	2025-07-03 02:36:33.204585
3145	2025-06-19	Groups	2950	[{"name":"Groups","count":2950}]	2025-07-03 02:37:14.763517
3146	2025-04-30	Alpharetta	618	[]	2025-07-03 02:57:30.828112
3147	2025-04-30	Dunwoody/PTC	2032	[]	2025-07-03 02:57:30.828112
3148	2025-04-30	East Cobb/Roswell	915	[]	2025-07-03 02:57:30.828112
3149	2025-04-30	Sandy Springs	744	[]	2025-07-03 02:57:30.828112
3150	2025-04-30	Intown/Druid Hills	1198	[]	2025-07-03 02:57:30.828112
3151	2025-04-30	Flowery Branch	398	[]	2025-07-03 03:02:27.896741
3152	2025-04-30	Groups	2050	[]	2025-07-03 03:02:27.896741
3153	2025-04-30	Collective Learning	50	[]	2025-07-03 03:02:27.896741
3154	2025-07-07	Alpharetta	200	[]	2025-07-07 03:30:14.634575
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
9eR3SP46u0YocqN7Zo4ankpDAOibkVrj	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:25:52.310Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:26:44
KupzfEkiQSxkg0hAVZ7c3R3BlEV8jbx2	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:26:43.076Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:26:44
9a3LLHoZjpwqMLh-go2gRUG-4ObAgi09	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T17:28:52.666Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 17:28:53
3xPKmZtIc2-IoFVdmQUp5Q55lu98n9PX	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-17T01:14:16.351Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-18 17:51:46
_ccmOh-Qxos7ZDY6nk1BVNnvf1GJZ8GQ	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:40:45.204Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:40:46
ABaUqIUYNjSTq4mPRYBYOIwkHtl28AbN	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:14.631Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:53:15
K9mlKP5dcb76PCr_GoHDslYV0di8vf3x	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:28:27.821Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:29:33
mlg-i8gp3GG7EwWDzK5BPvy--GERslJF	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:18.121Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:53:19
QwWjtFTYpSTPYNtmhGcKOSIKO6pt4TFu	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:26.180Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:53:27
fqjHBtoq2ZZCfoUCqY3NTt115EHh_tOf	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:58:14.598Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:58:15
MhcoNcyXu4rDwoXSEufrb-FzLArPPheX	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:20:51.147Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 15:20:52
A_exAlGK4eZVGcWrdBlkE3mspqqvFiOl	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:30:08.570Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 15:20:41
hi2bkWSunjCGsE4AH6gpYDA7FAHT4MDY	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:36:19.673Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 15:40:04
zeZIUSL9yrupY3UToaq-zZiVuyQDKCte	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:21:38.915Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 15:21:39
163Jcjth05rdA0ChSUzCDnbv1r9FZb36	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:33:01.947Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 15:33:21
5lS3O-wpkcIVdVVHUHh230-88UHkkw0p	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T02:40:07.798Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 02:40:10
5L9pwpvbNcrb4g4rEvmzx4wIVNUxEzDK	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:00:41.269Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-16 14:01:48
EWyWb47u2whiswXFSjHqYa1L7N0tGQb1	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T17:56:51.909Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-18 18:10:42
iGWYvIQRz-eEboXfdrzO1uqMuqva1TS6	{"user": {"id": "user_1751071509329_mrkw2z95z", "role": "admin", "email": "katielong2316@gmail.com", "isActive": true, "lastName": "Long", "firstName": "Katie", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "submit_suggestions", "respond_to_suggestions", "view_suggestions", "manage_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-17T01:11:19.458Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-17 01:26:49
8RMJ7ciBeElHXzU4zg6vz-PKlJNkIpUC	{"user": {"id": "admin_1751065261945", "role": "super_admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "manage_users", "export_data", "import_data", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-15T20:54:16.013Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-15 20:59:58
q7T8EAJVjxQrs84_OxYkBiIazaic4rtT	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T16:52:34.197Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-18 16:54:57
udVPid2TqLzVg8RIW5jiPBegAzjV-Id-	{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T16:58:21.909Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}	2025-07-18 18:00:30
\.


--
-- Data for Name: suggestion_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suggestion_responses (id, suggestion_id, message, is_admin_response, responded_by, respondent_name, is_internal, created_at) FROM stdin;
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.suggestions (id, title, description, category, priority, status, submitted_by, submitter_email, submitter_name, is_anonymous, upvotes, tags, implementation_notes, estimated_effort, assigned_to, completed_at, created_at, updated_at) FROM stdin;
1	Test Suggestion	This is a test suggestion to verify the API works	improvement	medium	submitted	admin_1751065261945	admin@sandwich.project	Admin User	f	0	{}	\N	\N	\N	\N	2025-07-11 17:03:03.562454	2025-07-11 17:03:03.562454
2	Submit your suggestions here!	If you need something to work differently, if something is confusing to you, you have tips on how we could better arrange this whole site, or if you run into a bug, please submit your feedback here so we can get this where it serves your needs the best it possibly can!	General	High	submitted	admin_1751065261945	admin@sandwich.project	Admin User	f	0	{}	\N	\N	\N	\N	2025-07-11 17:50:35.653229	2025-07-11 17:50:35.653229
3	Submit your suggestions here!	If you need something to work differently, if something is confusing to you, you have tips on how we could better arrange this whole site, or if you run into a bug, please submit your feedback here so we can get this where it serves your needs the best it possibly can!	General	High	submitted	admin_1751065261945	admin@sandwich.project	Admin User	f	0	{}	\N	\N	\N	\N	2025-07-11 17:51:26.043519	2025-07-11 17:51:26.043519
\.


--
-- Data for Name: task_completions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.task_completions (id, task_id, user_id, user_name, completed_at, notes) FROM stdin;
1	46	user_1751071509329_mrkw2z95z	katielong2316@gmail.com	2025-07-06 05:21:07.323175	
15	45	user_1751071509329_mrkw2z95z	katielong2316@gmail.com	2025-07-06 16:21:54.298122	
16	46	user_1751493923615_nbcyq3am7	christine@thesandwichproject.org	2025-07-06 17:51:55.58638	created task and completing task
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, first_name, last_name, profile_image_url, created_at, updated_at, role, permissions, is_active, metadata, display_name, password, last_login_at) FROM stdin;
user_1751493923615_nbcyq3am7	christine@thesandwichproject.org	Christine	Cooper Nowicki	\N	2025-07-02 22:05:23.700884	2025-07-10 01:10:56.477	admin	["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "direct_messages", "core_team_chat", "group_messages", "manage_hosts", "manage_drivers", "manage_announcements", "manage_projects", "manage_committees", "manage_collections", "manage_recipients", "edit_meetings", "schedule_reports", "send_messages", "moderate_messages", "view_suggestions", "submit_suggestions", "view_sandwich_data"]	t	{"password": "sandwich123"}	\N	\N	2025-07-07 18:26:27.568
user_1751072243271_fc8jaxl6u	mdlouza@gmail.com	Marcy	Louza	\N	2025-06-28 00:57:23.476	2025-07-10 01:10:43.05	admin	["manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "submit_suggestions", "view_suggestions", "view_sandwich_data"]	t	{"password": "sandwich123"}	Marcy	\N	2025-07-05 00:02:46.664
user_1751920534988_2cgbrae86	vickib@aol.com	Vicki	Tropauer	\N	2025-07-07 20:35:35.07486	2025-07-10 01:11:00.898	admin	["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "core_team_chat", "group_messages", "direct_messages", "edit_meetings", "schedule_reports", "send_messages", "submit_suggestions", "view_suggestions", "manage_projects", "view_sandwich_data"]	t	{"password": "TSP@1562"}	\N	\N	2025-07-07 20:35:51.654
user_1751975120117_tltz2rc1a	ross.kimberly.a@gmail.com	Kimberly	Ross	\N	2025-07-08 11:45:20.204698	2025-07-10 01:11:08.591	admin	["manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "submit_suggestions", "view_suggestions", "view_sandwich_data"]	t	{"password": "Ugga0720"}	Kim Ross	\N	2025-07-08 11:45:30.768
user_1751492211973_0pi1jdl3p	stephanie@thesandwichproject.org	Stephanie	Luis	\N	2025-07-02 21:36:52.064276	2025-07-10 01:10:52.421	admin	["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "direct_messages", "core_team_chat", "group_messages", "manage_hosts", "manage_drivers", "manage_announcements", "manage_projects", "manage_committees", "manage_collections", "manage_recipients", "edit_meetings", "schedule_reports", "send_messages", "view_suggestions", "submit_suggestions", "view_sandwich_data"]	t	{"password": "ChloeMarie24!"}	\N	\N	2025-07-08 18:07:29.481
user_1751250351194_sdteqpzz5	kenig.ka@gmail.com	Katie	Long	\N	2025-06-30 02:25:51.374	2025-07-11 18:00:38.052	driver	["view_phone_directory", "general_chat", "driver_chat", "direct_messages", "group_messages", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_sandwich_data", "send_messages"]	t	{"password": "Carter23!6"}	\N	\N	2025-07-04 04:01:19.677
user_1751071509329_mrkw2z95z	katielong2316@gmail.com	Katie	Long	\N	2025-06-28 00:45:09.513	2025-07-11 17:52:34.431	admin	["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "submit_suggestions", "respond_to_suggestions", "view_suggestions", "manage_suggestions", "view_sandwich_data"]	t	{"password": "Carter23!6"}	\N	\N	2025-07-11 17:52:34.431
admin_1751065261945	admin@sandwich.project	Admin	User	\N	2025-06-27 23:01:01.987	2025-07-11 17:56:51.855	admin	["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"]	t	{"password": "sandwich123"}	\N	\N	2025-07-11 17:56:51.855
\.


--
-- Data for Name: weekly_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.weekly_reports (id, week_ending, sandwich_count, notes, submitted_by, submitted_at) FROM stdin;
\.


--
-- Data for Name: work_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_logs (id, user_id, description, hours, minutes, created_at, status, approved_by, approved_at, visibility, shared_with, department, team_id) FROM stdin;
3	user_1751071509329_mrkw2z95z	Worked on website functionality	8	0	2025-07-09 18:42:10.326953+00	pending	\N	\N	private	[]	\N	\N
\.


--
-- Name: agenda_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agenda_items_id_seq', 5, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: committee_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.committee_memberships_id_seq', 1, true);


--
-- Name: committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.committees_id_seq', 3, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contacts_id_seq', 4, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 103, true);


--
-- Name: drive_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drive_links_id_seq', 1, false);


--
-- Name: driver_agreements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.driver_agreements_id_seq', 1, false);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.drivers_id_seq', 310, true);


--
-- Name: group_memberships_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_memberships_id_seq', 1, false);


--
-- Name: host_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.host_contacts_id_seq', 37, true);


--
-- Name: hosted_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hosted_files_id_seq', 1, false);


--
-- Name: hosts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hosts_id_seq', 62, true);


--
-- Name: meeting_minutes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meeting_minutes_id_seq', 11, true);


--
-- Name: meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meetings_id_seq', 7, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 34, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: project_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_assignments_id_seq', 1, false);


--
-- Name: project_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_comments_id_seq', 11, true);


--
-- Name: project_congratulations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_congratulations_id_seq', 1, false);


--
-- Name: project_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_documents_id_seq', 1, false);


--
-- Name: project_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.project_tasks_id_seq', 52, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.projects_id_seq', 25, true);


--
-- Name: recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipients_id_seq', 41, true);


--
-- Name: sandwich_collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sandwich_collections_id_seq', 3154, true);


--
-- Name: suggestion_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suggestion_responses_id_seq', 1, false);


--
-- Name: suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suggestions_id_seq', 3, true);


--
-- Name: task_completions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.task_completions_id_seq', 16, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.weekly_reports_id_seq', 1, false);


--
-- Name: work_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.work_logs_id_seq', 4, true);


--
-- Name: agenda_items agenda_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_items
    ADD CONSTRAINT agenda_items_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: committee_memberships committee_memberships_committee_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_memberships
    ADD CONSTRAINT committee_memberships_committee_id_user_id_key UNIQUE (committee_id, user_id);


--
-- Name: committee_memberships committee_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_memberships
    ADD CONSTRAINT committee_memberships_pkey PRIMARY KEY (id);


--
-- Name: committees committees_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_name_key UNIQUE (name);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: drive_links drive_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drive_links
    ADD CONSTRAINT drive_links_pkey PRIMARY KEY (id);


--
-- Name: driver_agreements driver_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_agreements
    ADD CONSTRAINT driver_agreements_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: group_memberships group_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_memberships
    ADD CONSTRAINT group_memberships_pkey PRIMARY KEY (id);


--
-- Name: host_contacts host_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.host_contacts
    ADD CONSTRAINT host_contacts_pkey PRIMARY KEY (id);


--
-- Name: hosted_files hosted_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hosted_files
    ADD CONSTRAINT hosted_files_pkey PRIMARY KEY (id);


--
-- Name: hosts hosts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hosts
    ADD CONSTRAINT hosts_pkey PRIMARY KEY (id);


--
-- Name: meeting_minutes meeting_minutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_minutes
    ADD CONSTRAINT meeting_minutes_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: project_assignments project_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);


--
-- Name: project_comments project_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT project_comments_pkey PRIMARY KEY (id);


--
-- Name: project_congratulations project_congratulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_congratulations
    ADD CONSTRAINT project_congratulations_pkey PRIMARY KEY (id);


--
-- Name: project_documents project_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_documents
    ADD CONSTRAINT project_documents_pkey PRIMARY KEY (id);


--
-- Name: project_tasks project_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: recipients recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (id);


--
-- Name: sandwich_collections sandwich_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sandwich_collections
    ADD CONSTRAINT sandwich_collections_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: suggestion_responses suggestion_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestion_responses
    ADD CONSTRAINT suggestion_responses_pkey PRIMARY KEY (id);


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- Name: task_completions task_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completions
    ADD CONSTRAINT task_completions_pkey PRIMARY KEY (id);


--
-- Name: task_completions task_completions_task_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completions
    ADD CONSTRAINT task_completions_task_id_user_id_key UNIQUE (task_id, user_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_reports weekly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_pkey PRIMARY KEY (id);


--
-- Name: work_logs work_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: idx_conversation_participants_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants USING btree (user_id);


--
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_session_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_session_expire ON public.sessions USING btree (expire);


--
-- Name: idx_work_logs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_logs_status ON public.work_logs USING btree (status);


--
-- Name: idx_work_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_work_logs_user_id ON public.work_logs USING btree (user_id);


--
-- Name: committee_memberships committee_memberships_committee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committee_memberships
    ADD CONSTRAINT committee_memberships_committee_id_fkey FOREIGN KEY (committee_id) REFERENCES public.committees(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: project_comments project_comments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_comments
    ADD CONSTRAINT project_comments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_congratulations project_congratulations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_congratulations
    ADD CONSTRAINT project_congratulations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_tasks project_tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_tasks
    ADD CONSTRAINT project_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: task_completions task_completions_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_completions
    ADD CONSTRAINT task_completions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.project_tasks(id) ON DELETE CASCADE;


--
-- Name: work_logs work_logs_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: work_logs work_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

