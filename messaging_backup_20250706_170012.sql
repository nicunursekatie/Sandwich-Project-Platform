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
-- Name: conversation_threads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversation_threads (
    id integer NOT NULL,
    type text NOT NULL,
    reference_id text,
    title text,
    description text,
    created_by text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_message_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.conversation_threads OWNER TO neondb_owner;

--
-- Name: conversation_threads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.conversation_threads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversation_threads_id_seq OWNER TO neondb_owner;

--
-- Name: conversation_threads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.conversation_threads_id_seq OWNED BY public.conversation_threads.id;


--
-- Name: group_message_participants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.group_message_participants (
    id integer NOT NULL,
    thread_id integer NOT NULL,
    user_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    last_read_at timestamp without time zone,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    left_at timestamp without time zone,
    archived_at timestamp without time zone,
    muted_at timestamp without time zone
);


ALTER TABLE public.group_message_participants OWNER TO neondb_owner;

--
-- Name: group_message_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.group_message_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.group_message_participants_id_seq OWNER TO neondb_owner;

--
-- Name: group_message_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.group_message_participants_id_seq OWNED BY public.group_message_participants.id;


--
-- Name: message_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.message_groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_by text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.message_groups OWNER TO neondb_owner;

--
-- Name: message_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.message_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_groups_id_seq OWNER TO neondb_owner;

--
-- Name: message_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.message_groups_id_seq OWNED BY public.message_groups.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender text NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    parent_id integer,
    thread_id integer,
    reply_count integer DEFAULT 0 NOT NULL,
    committee text DEFAULT 'general'::text NOT NULL,
    user_id text,
    recipient_id text,
    chat_type text
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: conversation_threads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads ALTER COLUMN id SET DEFAULT nextval('public.conversation_threads_id_seq'::regclass);


--
-- Name: group_message_participants id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_message_participants ALTER COLUMN id SET DEFAULT nextval('public.group_message_participants_id_seq'::regclass);


--
-- Name: message_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_groups ALTER COLUMN id SET DEFAULT nextval('public.message_groups_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Data for Name: conversation_threads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversation_threads (id, type, reference_id, title, description, created_by, is_active, last_message_at, created_at, updated_at) FROM stdin;
3	group	4	Allstate Grant	\N	user_1751072243271_fc8jaxl6u	t	\N	2025-07-05 18:40:12.303549	2025-07-05 18:40:12.303549
4	chat	general	General Chat	Open discussion for all team members	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
5	chat	core_team	Core Team Chat	Private administrative discussions	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
6	chat	committee_marketing	Marketing Committee	Marketing committee discussions	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
7	chat	hosts	Host Chat	Coordination with sandwich collection hosts	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
8	chat	drivers	Driver Chat	Delivery and transportation coordination	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
9	chat	recipients	Recipient Chat	Communication with receiving organizations	system	t	\N	2025-07-05 18:41:44.316258	2025-07-05 18:41:44.316258
2	group	2	Test Group A	Testing group message filtering	admin_1751065261945	f	\N	2025-07-05 18:40:12.303549	2025-07-05 18:40:12.303549
1	group	1	Giving Circle	\N	user_1751071509329_mrkw2z95z	t	2025-07-06 16:45:30.069	2025-07-05 18:40:12.303549	2025-07-05 18:40:12.303549
10	general	\N	General Chat	\N	system	t	\N	2025-07-06 16:58:21.004825	2025-07-06 16:58:21.00483
11	core_team	\N	Core Team Chat	\N	system	t	\N	2025-07-06 16:58:21.153812	2025-07-06 16:58:21.153817
12	host	\N	Host Chat	\N	system	t	\N	2025-07-06 16:58:21.294537	2025-07-06 16:58:21.294541
13	driver	\N	Driver Chat	\N	system	t	\N	2025-07-06 16:58:21.434923	2025-07-06 16:58:21.434927
14	recipient	\N	Recipient Chat	\N	system	t	\N	2025-07-06 16:58:21.576864	2025-07-06 16:58:21.57687
15	direct	user_1751071509329_mrkw2z95z_user_1751493923615_nbcyq3am7	Direct Messages - user_1751071509329_mrkw2z95z_user_1751493923615_nbcyq3am7	\N	system	t	\N	2025-07-06 04:26:27.3673	2025-07-06 16:58:40.036831
16	direct	user_1751071509329_mrkw2z95z_user_1751492211973_0pi1jdl3p	Direct Messages - user_1751071509329_mrkw2z95z_user_1751492211973_0pi1jdl3p	\N	system	t	\N	2025-07-06 04:26:30.216642	2025-07-06 16:58:40.254921
17	direct	user_1751071509329_mrkw2z95z_user_1751072243271_fc8jaxl6u	Direct Messages - user_1751071509329_mrkw2z95z_user_1751072243271_fc8jaxl6u	\N	system	t	\N	2025-07-06 04:26:33.884994	2025-07-06 16:58:40.465496
\.


--
-- Data for Name: group_message_participants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.group_message_participants (id, thread_id, user_id, status, last_read_at, joined_at, left_at, archived_at, muted_at) FROM stdin;
1	1	user_1751071509329_mrkw2z95z	active	\N	2025-06-30 22:36:49.664314	\N	\N	\N
2	1	user_1751250351194_sdteqpzz5	active	\N	2025-06-30 22:36:49.745345	\N	\N	\N
3	1	user_1751072243271_fc8jaxl6u	active	\N	2025-06-30 22:36:49.745345	\N	\N	\N
6	1	admin_1751065261945	left	\N	2025-07-05 19:08:14.953238	\N	\N	\N
\.


--
-- Data for Name: message_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.message_groups (id, name, description, created_by, is_active, created_at, updated_at) FROM stdin;
1	Giving Circle	\N	user_1751071509329_mrkw2z95z	t	2025-06-30 22:36:49.433885	2025-06-30 22:36:49.433885
4	Allstate Grant	\N	user_1751072243271_fc8jaxl6u	t	2025-07-03 18:39:32.323986	2025-07-03 18:39:32.323986
2	Test Group A	Testing group message filtering	admin_1751065261945	f	2025-07-02 22:27:04.749369	2025-07-02 22:27:04.749369
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, sender, content, "timestamp", parent_id, thread_id, reply_count, committee, user_id, recipient_id, chat_type) FROM stdin;
9	Marcy	Reminder meeting	2025-06-25 18:41:31.750872	\N	6	0	marketing_committee	\N	\N	committee
15	Katie	leave a message here to let me know you're account is working!	2025-06-30 03:20:20.40628	\N	4	0	general	\N	\N	general
23	Katie	anyone in yet?	2025-07-02 22:24:34.005269	\N	4	0	general	\N	\N	general
27	Marcy Louza	Hi Team!!	2025-07-03 18:38:57.092373	\N	5	0	core_team	user_1751072243271_fc8jaxl6u	\N	core_team
28	Marcy Louza	Thanks, Katie for all the hard work	2025-07-03 18:39:13.10188	\N	5	0	core_team	user_1751072243271_fc8jaxl6u	\N	core_team
30	Katie Long	You're welcome. We're getting there!	2025-07-04 03:16:11.324884	\N	5	0	core_team	user_1751071509329_mrkw2z95z	\N	core_team
51	Katie Long	how did the meeting go?	2025-07-06 16:45:19.768	\N	1	0	general	user_1751071509329_mrkw2z95z	\N	\N
52	Katie Long	how did the meeting go?	2025-07-06 16:45:22.058	\N	1	0	general	user_1751071509329_mrkw2z95z	\N	\N
48	Katie Long	hi!	2025-07-06 04:26:27.3673	\N	15	0	direct	user_1751071509329_mrkw2z95z	user_1751493923615_nbcyq3am7	\N
49	Katie Long	hi!	2025-07-06 04:26:30.216642	\N	16	0	direct	user_1751071509329_mrkw2z95z	user_1751492211973_0pi1jdl3p	\N
50	Katie Long	hi!	2025-07-06 04:26:33.884994	\N	17	0	direct	user_1751071509329_mrkw2z95z	user_1751072243271_fc8jaxl6u	\N
\.


--
-- Name: conversation_threads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.conversation_threads_id_seq', 17, true);


--
-- Name: group_message_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.group_message_participants_id_seq', 6, true);


--
-- Name: message_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.message_groups_id_seq', 4, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 53, true);


--
-- Name: conversation_threads conversation_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversation_threads
    ADD CONSTRAINT conversation_threads_pkey PRIMARY KEY (id);


--
-- Name: group_message_participants group_message_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.group_message_participants
    ADD CONSTRAINT group_message_participants_pkey PRIMARY KEY (id);


--
-- Name: message_groups message_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_groups
    ADD CONSTRAINT message_groups_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

