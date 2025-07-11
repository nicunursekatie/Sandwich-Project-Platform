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

--
-- Data for Name: agenda_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.agenda_items VALUES (3, 'Alex Rodriguez', 'Update Volunteer Training Materials', 'Review and update the current volunteer training materials to include new safety protocols and efficiency improvements.', 'pending', '2025-06-09 01:40:41.440776', 1);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: committees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.committees VALUES (1, 'Finance', 'Financial oversight and budgeting', '2025-07-07 02:14:06.709356', true, '2025-07-07 02:14:06.709356');
INSERT INTO public.committees VALUES (2, 'Operations', 'Day-to-day operations management', '2025-07-07 02:14:06.800092', true, '2025-07-07 02:14:06.800092');
INSERT INTO public.committees VALUES (3, 'Outreach', 'Community outreach and partnerships', '2025-07-07 02:14:06.968867', true, '2025-07-07 02:14:06.968867');


--
-- Data for Name: committee_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.committee_memberships VALUES (1, 1, 'user_1751071509329_mrkw2z95z', '2025-07-07 02:14:07.338231', 'member', NULL, '2025-07-07 02:14:07.338231', true);


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.contacts VALUES (1, 'John Smith', '555-0123', 'john@example.com', 'volunteer', NULL, true, '2025-06-25 01:49:22.98881', '2025-06-25 01:49:22.98881', NULL, NULL);
INSERT INTO public.contacts VALUES (2, 'Sarah Johnson', '555-0456', 'sarah@example.com', 'coordinator', NULL, true, '2025-06-25 01:49:22.98881', '2025-06-25 01:49:22.98881', NULL, NULL);
INSERT INTO public.contacts VALUES (3, 'Mike Wilson', '555-0789', 'mike@example.com', 'volunteer', NULL, true, '2025-06-25 01:49:22.98881', '2025-06-25 01:49:22.98881', NULL, NULL);
INSERT INTO public.contacts VALUES (4, 'Lisa Brown', '555-0321', 'lisa@example.com', 'driver', NULL, true, '2025-06-25 01:49:22.98881', '2025-06-25 01:49:22.98881', NULL, NULL);


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.conversations VALUES (1, 'channel', 'General Chat', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (2, 'channel', 'Core Team', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (3, 'channel', 'Marketing Committee', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (4, 'channel', 'Host Chat', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (5, 'channel', 'Driver Chat', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (6, 'channel', 'Recipient Chat', '2025-07-06 17:04:29.074747');
INSERT INTO public.conversations VALUES (7, 'direct', NULL, '2025-07-06 17:04:31.961639');
INSERT INTO public.conversations VALUES (10, 'group', 'Giving Circle', '2025-07-06 17:04:32.715077');
INSERT INTO public.conversations VALUES (11, 'group', 'Allstate Grant', '2025-07-06 17:04:32.715077');
INSERT INTO public.conversations VALUES (87, 'direct', 'admin_1751065261945_user_1751493923615_nbcyq3am7', '2025-07-08 23:04:05.913601');
INSERT INTO public.conversations VALUES (88, 'direct', 'admin_1751065261945_user_1751072243271_fc8jaxl6u', '2025-07-08 23:13:02.672843');
INSERT INTO public.conversations VALUES (99, 'channel', 'Marketing Committee', '2025-07-09 00:27:03.717489');
INSERT INTO public.conversations VALUES (100, 'direct', 'user_1751071509329_mrkw2z95z_user_1751920534988_2cgbrae86', '2025-07-09 01:41:20.529424');
INSERT INTO public.conversations VALUES (101, 'direct', 'user_1751071509329_mrkw2z95z_user_1751072243271_fc8jaxl6u', '2025-07-09 01:41:22.158073');
INSERT INTO public.conversations VALUES (102, 'direct', 'user_1751071509329_mrkw2z95z_user_1751492211973_0pi1jdl3p', '2025-07-09 01:41:27.477549');
INSERT INTO public.conversations VALUES (69, 'direct', 'user_1751071509329_mrkw2z95z_user_1751493923615_nbcyq3am7', '2025-07-07 02:18:04.666899');


--
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.conversation_participants VALUES (1, 'user_1751071509329_mrkw2z95z', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (1, 'user_1751072243271_fc8jaxl6u', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (1, 'user_1751493923615_nbcyq3am7', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (1, 'user_1751492211973_0pi1jdl3p', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (2, 'user_1751071509329_mrkw2z95z', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (2, 'user_1751072243271_fc8jaxl6u', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (7, 'user_1751071509329_mrkw2z95z', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (7, 'user_1751493923615_nbcyq3am7', '2025-07-06 17:04:35.043937', '2025-07-06 17:04:35.043937');
INSERT INTO public.conversation_participants VALUES (10, 'user_1751071509329_mrkw2z95z', '2025-07-07 00:15:58.718781', '2025-07-07 00:15:58.718781');
INSERT INTO public.conversation_participants VALUES (10, 'user_1751072243271_fc8jaxl6u', '2025-07-07 00:15:58.718781', '2025-07-07 00:15:58.718781');
INSERT INTO public.conversation_participants VALUES (10, 'admin_1751065261945', '2025-07-07 00:15:58.718781', '2025-07-07 00:15:58.718781');
INSERT INTO public.conversation_participants VALUES (11, 'user_1751072243271_fc8jaxl6u', '2025-07-07 00:15:58.718781', '2025-07-07 00:15:58.718781');
INSERT INTO public.conversation_participants VALUES (69, 'user_1751071509329_mrkw2z95z', '2025-07-07 02:18:04.751614', '2025-07-07 02:18:04.751614');
INSERT INTO public.conversation_participants VALUES (69, 'user_1751493923615_nbcyq3am7', '2025-07-07 02:18:04.751614', '2025-07-07 02:18:04.751614');
INSERT INTO public.conversation_participants VALUES (11, 'user_1751493923615_nbcyq3am7', '2025-07-07 02:48:04.964028', '2025-07-07 02:48:04.964028');
INSERT INTO public.conversation_participants VALUES (10, 'user_1751493923615_nbcyq3am7', '2025-07-07 03:12:29.247404', '2025-07-07 03:12:29.247404');
INSERT INTO public.conversation_participants VALUES (87, 'admin_1751065261945', '2025-07-08 23:04:06.008629', '2025-07-08 23:04:06.008629');
INSERT INTO public.conversation_participants VALUES (87, 'user_1751493923615_nbcyq3am7', '2025-07-08 23:04:06.008629', '2025-07-08 23:04:06.008629');
INSERT INTO public.conversation_participants VALUES (88, 'admin_1751065261945', '2025-07-08 23:13:02.747438', '2025-07-08 23:13:02.747438');
INSERT INTO public.conversation_participants VALUES (88, 'user_1751072243271_fc8jaxl6u', '2025-07-08 23:13:02.747438', '2025-07-08 23:13:02.747438');
INSERT INTO public.conversation_participants VALUES (100, 'user_1751071509329_mrkw2z95z', '2025-07-09 01:41:20.617182', '2025-07-09 01:41:20.617182');
INSERT INTO public.conversation_participants VALUES (100, 'user_1751920534988_2cgbrae86', '2025-07-09 01:41:20.617182', '2025-07-09 01:41:20.617182');
INSERT INTO public.conversation_participants VALUES (101, 'user_1751071509329_mrkw2z95z', '2025-07-09 01:41:22.232232', '2025-07-09 01:41:22.232232');
INSERT INTO public.conversation_participants VALUES (101, 'user_1751072243271_fc8jaxl6u', '2025-07-09 01:41:22.232232', '2025-07-09 01:41:22.232232');
INSERT INTO public.conversation_participants VALUES (102, 'user_1751071509329_mrkw2z95z', '2025-07-09 01:41:27.551087', '2025-07-09 01:41:27.551087');
INSERT INTO public.conversation_participants VALUES (102, 'user_1751492211973_0pi1jdl3p', '2025-07-09 01:41:27.551087', '2025-07-09 01:41:27.551087');


--
-- Data for Name: drive_links; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: driver_agreements; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.drivers VALUES (119, 'Brandon Graby', '(859) 312-1743', 'brandon.j.graby@gmail.com', NULL, NULL, false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:00.217642', '2025-06-24 01:26:00.217646', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (115, 'Veronia (and daughter) Kelly-Cash', '(864) 325-5979', 'vkellycash@comcast.net', NULL, 'Area: Upper Westside. Moores Mill/Howell Mill/75.', false, NULL, NULL, 'available', 'Upper Westside. Moores Mill/Howell Mill/75.', '2025-06-24 01:25:59.658195', '2025-06-24 01:25:59.658201', false, NULL, NULL, false, false, NULL, NULL, 'Upper Westside. Moores Mill/Howell Mill/75.', NULL);
INSERT INTO public.drivers VALUES (116, 'Melody MITCHELL', '(901) 240-9703', 'getyou2sold@gmail.com', NULL, 'Area: Grant Park near the Zoo', false, NULL, NULL, 'available', 'Grant Park near the Zoo', '2025-06-24 01:25:59.798203', '2025-06-24 01:25:59.798208', false, NULL, NULL, false, false, NULL, NULL, 'Grant Park near the Zoo', NULL);
INSERT INTO public.drivers VALUES (117, 'Sarah Dolphino', NULL, 'sarahdolphino@gmail.com', NULL, 'Area: alpharetta - only here for summer', false, NULL, NULL, 'available', 'alpharetta - only here for summer', '2025-06-24 01:25:59.938112', '2025-06-24 01:25:59.938116', false, NULL, NULL, false, false, NULL, NULL, 'alpharetta - only here for summer', NULL);
INSERT INTO public.drivers VALUES (118, 'Emily Nelson', '(801) 870-7901', 'emily.7n@gmail.com', NULL, 'Area: Cumming, close to West Forsyth High School', false, NULL, NULL, 'available', 'Cumming, close to West Forsyth High School', '2025-06-24 01:26:00.077784', '2025-06-24 01:26:00.077788', false, NULL, NULL, false, false, NULL, NULL, 'Cumming, close to West Forsyth High School', NULL);
INSERT INTO public.drivers VALUES (120, 'Gina Matthews', '(404) 550-8613', 'flybyg@comcast.net', NULL, 'Area: Chamblee', false, NULL, NULL, 'available', 'Chamblee', '2025-06-24 01:26:00.357461', '2025-06-24 01:26:00.357466', false, NULL, NULL, false, false, NULL, NULL, 'Chamblee', NULL);
INSERT INTO public.drivers VALUES (121, 'John Paine', '(470) 701-3326', 'jpaine1231@gmail.com', NULL, 'Area: Sandy Springs; Notes: Not 18 but mom can drive him', false, NULL, NULL, 'available', 'Sandy Springs', '2025-06-24 01:26:00.497163', '2025-06-24 01:26:00.497168', false, NULL, NULL, false, false, NULL, NULL, 'Sandy Springs', NULL);
INSERT INTO public.drivers VALUES (122, 'Christian Rivers', '(706) 313-0301', 'c.rivers1404@gmail.com', NULL, 'Area: Dunwoody, near Perimeter Mall', false, NULL, NULL, 'available', 'Dunwoody, near Perimeter Mall', '2025-06-24 01:26:00.63742', '2025-06-24 01:26:00.637426', false, NULL, NULL, false, false, NULL, NULL, 'Dunwoody, near Perimeter Mall', NULL);
INSERT INTO public.drivers VALUES (123, 'Ashley Roseberry', '404) 396-5333', NULL, NULL, 'Area: Cumming', false, NULL, NULL, 'available', 'Cumming', '2025-06-24 01:26:00.777229', '2025-06-24 01:26:00.777234', false, NULL, NULL, false, false, NULL, NULL, 'Cumming', NULL);
INSERT INTO public.drivers VALUES (124, 'Serena Terry', '(404) 824-9419', 'serena.terry@gmail.com', NULL, 'Area: Smyrna; Notes: reached out to us from Home Depot event', false, NULL, NULL, 'available', 'Smyrna', '2025-06-24 01:26:00.981358', '2025-06-24 01:26:00.981364', false, NULL, NULL, false, false, NULL, NULL, 'Smyrna', NULL);
INSERT INTO public.drivers VALUES (125, 'Kathryn "Katie" Conroy', '(678) 592-6212', 'katieconroy929@gmail.com', NULL, 'Area: East Cobb - Marietta over by Lassiter High School - willing to drive if not too far', false, NULL, NULL, 'available', 'East Cobb - Marietta over by Lassiter High School - willing to drive if not too far', '2025-06-24 01:26:01.121005', '2025-06-24 01:26:01.121009', false, NULL, NULL, false, false, NULL, NULL, 'East Cobb - Marietta over by Lassiter High School - willing to drive if not too far', NULL);
INSERT INTO public.drivers VALUES (258, 'Susanna + Richard Warren', '205-577-0435', 'swarren0435@gmail.com', NULL, 'Area: SS Agreement: signed', true, NULL, NULL, 'available', 'SS', '2025-06-24 01:44:07.628238', '2025-06-24 01:44:07.628243', false, '305 Cannady Ct, Atlanta GA 30350', 'Wednesday', true, false, NULL, 58, 'SS', NULL);
INSERT INTO public.drivers VALUES (181, 'Ellen Tighe', '404.395.4998', 'ellenmtighe@gmail.com', NULL, 'Agreement: no', false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:34.913455', '2025-06-24 01:26:34.913458', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (178, 'Victoria Rosetti', '770-853-6546', NULL, NULL, 'Area: (Laura/Jordan) Brookhaven; Agreement: no', false, NULL, NULL, 'available', '(Laura/Jordan) Brookhaven', '2025-06-24 01:26:34.502215', '2025-06-24 01:26:34.502219', false, NULL, NULL, false, false, NULL, NULL, '(Laura/Jordan) Brookhaven', NULL);
INSERT INTO public.drivers VALUES (129, 'Arlyn Bisogno', '404-960-1300', 'arlynbb@yahoo.com', NULL, 'Area: Buckhead/ Brookhaven', false, NULL, NULL, 'available', 'Buckhead/ Brookhaven', '2025-06-24 01:26:01.680181', '2025-06-24 01:26:01.680186', false, NULL, NULL, false, false, NULL, NULL, 'Buckhead/ Brookhaven', NULL);
INSERT INTO public.drivers VALUES (127, 'Caitlin Fitch', '(770) 335-6748', 'fitch.caitlinmarie@gmail.com', NULL, NULL, false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:01.400887', '2025-06-24 01:26:01.400891', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (154, 'Mary Mitchell', '678-523-1783', 'mary.mitchell7890@gmail.com', NULL, 'Agreement sent; hasn''t driven in years', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:05.366193', '2025-06-24 01:26:05.366197', false, NULL, NULL, false, false, NULL, NULL, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (130, 'Farah Angersola', '(312) 500-1944', 'angersolaf@gmail.com', NULL, NULL, false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:01.819796', '2025-06-24 01:26:01.819801', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (140, 'Tonya Brown', NULL, 'tanya.e.brown@att.net', NULL, 'Agreement: no', false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:03.362155', '2025-06-24 01:26:03.36216', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (147, 'Nedia Hicks', NULL, 'nediahicks@aol.com', NULL, 'Agreement: sent', false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:04.388789', '2025-06-24 01:26:04.388793', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (149, 'Deidre Joe', NULL, 'deidrejoe@gmail.com', NULL, 'Agreement: no', false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:04.667778', '2025-06-24 01:26:04.667783', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (142, 'Elyn Daza', '404-925-0501', 'elyndaza@gmail.com', NULL, 'Agreement: yes', false, NULL, NULL, 'available', NULL, '2025-06-24 01:26:03.690603', '2025-06-24 01:26:03.690607', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (128, 'Bettina Smalley', NULL, 'bettina_smalley@yahoo.com', NULL, 'Area: Peachtree Corners', false, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:26:01.540598', '2025-06-24 01:26:01.540602', false, NULL, NULL, false, false, NULL, NULL, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (135, 'Emily Rosher', '706-987-7432', 'emilybrosher@gmail.com', NULL, 'Area: Brookhaven', false, NULL, NULL, 'available', 'Brookhaven', '2025-06-24 01:26:02.661005', '2025-06-24 01:26:02.66101', false, NULL, NULL, false, false, NULL, NULL, 'Brookhaven', NULL);
INSERT INTO public.drivers VALUES (136, 'Deborah Mastin', '(678) 982-3100', 'debmastin@gmail.com', NULL, 'Area: possibly east cobb', false, NULL, NULL, 'available', 'possibly east cobb', '2025-06-24 01:26:02.800878', '2025-06-24 01:26:02.800883', false, NULL, NULL, false, false, NULL, NULL, 'possibly east cobb', NULL);
INSERT INTO public.drivers VALUES (145, 'Lisa Gordon', '770.490.1859', 'lisarose1111@gmail.com', NULL, 'Area: dunwoody; Agreement: no', false, NULL, NULL, 'available', 'dunwoody', '2025-06-24 01:26:04.109758', '2025-06-24 01:26:04.109763', false, NULL, NULL, false, false, NULL, NULL, 'dunwoody', NULL);
INSERT INTO public.drivers VALUES (150, 'Pamela Kinsley', '404-934-4115', 'ugapamela@aol.com', NULL, 'Area: Marist math teacher; Agreement: no', false, NULL, NULL, 'available', 'Marist math teacher', '2025-06-24 01:26:04.807429', '2025-06-24 01:26:04.807433', false, NULL, NULL, false, false, NULL, NULL, 'Marist math teacher', NULL);
INSERT INTO public.drivers VALUES (227, 'Andrew  McElroy', '678-736-0258', NULL, NULL, 'Area: Duluth', false, NULL, NULL, 'available', 'Duluth', '2025-06-24 01:44:05.213511', '2025-06-24 01:44:05.213515', false, NULL, NULL, false, false, NULL, NULL, 'Duluth', NULL);
INSERT INTO public.drivers VALUES (231, 'Jan  Jay', '6785925091', 'janjayrd@yahoo.com', NULL, 'Area: Dunwoody; Notes: Happy to help, just not available on Wed Agreement: signed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:44:05.507596', '2025-06-24 01:44:05.5076', false, NULL, 'Happy to help, just not on Wednesday', true, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (241, 'Kim  Ross', '502-377-5878', 'ross.kimberly.a@gmail.com', NULL, 'Area: Sandy Springs to everywhere', false, NULL, NULL, 'available', 'Sandy Springs to everywhere', '2025-06-24 01:44:06.197166', '2025-06-24 01:44:06.197171', false, NULL, NULL, false, false, NULL, NULL, 'Sandy Springs to everywhere', NULL);
INSERT INTO public.drivers VALUES (176, 'Amy Price', '770-598-2135', 'amygp@comcast.net', NULL, 'Area: East Cobb; Agreement: yes', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:34.227949', '2025-06-24 01:26:34.227953', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (184, 'Laura Warren', '770-377-8822', 'genewarren@mindspring.com', NULL, 'Agreement: yes', true, NULL, NULL, 'available', NULL, '2025-06-24 01:26:35.326066', '2025-06-24 01:26:35.326071', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (131, 'Renee Walton', '404-403-5465', NULL, NULL, 'No signed agreement documented', true, NULL, NULL, 'available', 'midtown', '2025-06-24 01:26:01.959604', '2025-06-24 01:26:01.959613', false, NULL, NULL, false, false, NULL, 59, 'Midtown', NULL);
INSERT INTO public.drivers VALUES (132, 'Vicki Cherry', '678-429-0492', NULL, NULL, 'No signed agreement documented', true, NULL, NULL, 'available', 'midtown', '2025-06-24 01:26:02.09973', '2025-06-24 01:26:02.099734', false, NULL, NULL, false, false, NULL, 59, 'Midtown', NULL);
INSERT INTO public.drivers VALUES (173, 'Laurie Myler', '404-808-9099', 'laurie.myler04@gmail.com', NULL, 'New', true, NULL, NULL, 'available', 'East Cobb, Marietta', '2025-06-24 01:26:33.816622', '2025-06-24 01:26:33.816626', false, NULL, NULL, false, false, NULL, NULL, 'East Cobb, Marietta', NULL);
INSERT INTO public.drivers VALUES (286, 'Carrey  Hugoo', '314.363.2982', 'carreyhugoo@gmail.com', NULL, 'Area: Roswell Agreement: signed', true, NULL, NULL, 'available', 'Roswell', '2025-06-24 01:44:09.777747', '2025-06-24 01:44:09.77775', false, NULL, NULL, true, false, NULL, 57, 'Roswell', NULL);
INSERT INTO public.drivers VALUES (289, 'Marcy  Louza', '678.596.9697', 'mdlouza@gmail.com', NULL, 'Area: Dunwoody Agreement: signed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:44:10.124678', '2025-06-24 01:44:10.124682', true, NULL, NULL, true, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (177, 'Tom Riddick', '404-697-9424', 'tom.riddick@gmail.com', NULL, 'New', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:34.365096', '2025-06-24 01:26:34.3651', true, NULL, 'flexible, any day, 8 am to 6pm', false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (180, 'Deborah G. Shendelman', '770.355.7201', 'debi.shendelman@gmail.com', NULL, 'New', true, NULL, NULL, 'available', 'Dunwoody (Mt. Vernon Road, near Ashford Dunwoody)', '2025-06-24 01:26:34.77616', '2025-06-24 01:26:34.776166', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody (Mt. Vernon Road, near Ashford Dunwoody)', NULL);
INSERT INTO public.drivers VALUES (144, 'Elizabeth Gordon', '404-563-6401', 'edegordon@gmail.com', NULL, 'New', true, NULL, NULL, 'available', 'Decatur', '2025-06-24 01:26:03.970392', '2025-06-24 01:26:03.970397', false, NULL, NULL, false, false, NULL, 59, 'Decatur', NULL);
INSERT INTO public.drivers VALUES (175, 'Hunter Oskouei', '404-387-1851', 'kerrioskouei@gmail.com', NULL, 'New, Agreement: yes', true, NULL, NULL, 'available', NULL, '2025-06-24 01:26:34.090774', '2025-06-24 01:26:34.090778', false, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (148, 'Jonathan Hobson', '706-877-6970', 'jonathan.s.hobson@gmail.com', NULL, 'New, Area: Decatur; Agreement: yes', true, NULL, NULL, 'available', 'Decatur', '2025-06-24 01:26:04.528233', '2025-06-24 01:26:04.528237', false, NULL, NULL, false, false, NULL, 59, 'Decatur', NULL);
INSERT INTO public.drivers VALUES (185, 'Jonathan Weintraub', '404-295-1939', 'jwlaw47@gmail.com', NULL, 'New, Area: Embry hills; Agreement: yes', true, NULL, NULL, 'available', 'Embry hills', '2025-06-24 01:26:35.550638', '2025-06-24 01:26:35.550642', false, NULL, NULL, false, false, NULL, 59, 'Embry hills', NULL);
INSERT INTO public.drivers VALUES (174, 'Suzanne O''Brien', '202-297-4259', 'sbgobrien@gmail.com', NULL, 'New, Area: Milton; Agreement: yes', true, NULL, NULL, 'available', 'Milton', '2025-06-24 01:26:33.953708', '2025-06-24 01:26:33.953712', false, NULL, NULL, false, false, NULL, 55, 'Milton', NULL);
INSERT INTO public.drivers VALUES (298, 'Veronica Pendleton', '678-427-6109', 'vpennington924@gmail.com', NULL, 'Area: Decula', false, NULL, NULL, 'available', 'Decula', '2025-06-24 01:44:10.744905', '2025-06-24 01:44:10.744909', false, NULL, NULL, false, false, NULL, NULL, 'Decula', NULL);
INSERT INTO public.drivers VALUES (304, 'Sonika Tataria', '678-622-4670', 'sonika.tataria@choa.org', NULL, 'Area: Decatur', false, NULL, NULL, 'available', 'Decatur', '2025-06-24 01:44:11.165632', '2025-06-24 01:44:11.165636', false, NULL, NULL, false, false, NULL, NULL, 'Decatur', NULL);
INSERT INTO public.drivers VALUES (137, 'Linda Beer', '404-274-1397', NULL, NULL, 'Area: linda.beer@gmail.com; Agreement: yes; Notes: not driving for TSP anymore', false, NULL, NULL, 'available', 'linda.beer@gmail.com', '2025-06-24 01:26:02.94075', '2025-06-24 01:26:02.940754', false, NULL, NULL, false, false, NULL, NULL, 'linda.beer@gmail.com', NULL);
INSERT INTO public.drivers VALUES (139, 'Debra Brown', '(770) 778-9880', 'debraybrown@bellsouth.net', NULL, 'Area: Dunwoody; Agreement: yes', false, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:03.222243', '2025-06-24 01:26:03.222249', false, NULL, NULL, false, false, NULL, NULL, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (182, 'Jim Tropauer', '404-285-7092', NULL, NULL, 'Area: East Cobb; Van approved: yes; Agreement: yes', false, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:35.051552', '2025-06-24 01:26:35.051565', false, NULL, NULL, false, false, NULL, NULL, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (183, 'John Truono', '770-274-8810', 'truonoj@gmail.com', NULL, 'Area: Kennesaw to anywhere; Agreement: yes', false, NULL, NULL, 'available', 'Kennesaw to anywhere', '2025-06-24 01:26:35.188812', '2025-06-24 01:26:35.188815', false, NULL, NULL, false, false, NULL, NULL, 'Kennesaw to anywhere', NULL);
INSERT INTO public.drivers VALUES (179, 'Kim Ross', '502-377-5878', 'ross.kimberly.a@gmail.com', NULL, 'Area: Sandy Springs to everywhere; Agreement: yes', true, NULL, NULL, 'available', 'Sandy Springs to everywhere', '2025-06-24 01:26:34.639164', '2025-06-24 01:26:34.639168', false, NULL, NULL, false, false, NULL, NULL, 'Sandy Springs to everywhere', NULL);
INSERT INTO public.drivers VALUES (143, 'Alex Farquarson', '404-630-4578', NULL, NULL, 'Area: (Laura/Jordan) Brookhaven; Agreement: no', true, NULL, NULL, 'busy', '(Laura/Jordan) Brookhaven', '2025-06-24 01:26:03.830438', '2025-06-24 01:26:03.830443', false, NULL, NULL, false, false, NULL, 59, '(Laura/Jordan) Brookhaven', NULL);
INSERT INTO public.drivers VALUES (172, 'Dawn Mullican', '513-607-6433', 'dmullican@observatory.com', NULL, 'Area: Dunwoody (groups); Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody (groups)', '2025-06-24 01:26:33.679549', '2025-06-24 01:26:33.679554', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody (groups)', NULL);
INSERT INTO public.drivers VALUES (188, 'Doug Bradenburg', '404-423-4393', 'dougsmail6@gmail.com', NULL, 'Area: Candler Park; Agreement: yes', true, NULL, NULL, 'available', 'Candler Park', '2025-06-24 01:26:35.968346', '2025-06-24 01:26:35.968351', false, NULL, NULL, false, false, NULL, 59, 'Candler Park', NULL);
INSERT INTO public.drivers VALUES (190, 'Elisabeth Callahan', '404-543-0224', 'eliscallahan@gmail.com', NULL, 'Area: Peachtree Corners; Agreement: yes', true, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:26:36.242472', '2025-06-24 01:26:36.242477', false, NULL, NULL, false, false, NULL, 56, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (189, 'Felipe Buzeta', '678-908-9972', 'felbuz@yahoo.com', NULL, 'Area: (Laura/Jordan) Brookhaven; Agreement: yes', true, NULL, NULL, 'available', '(Laura/Jordan) Brookhaven', '2025-06-24 01:26:36.105643', '2025-06-24 01:26:36.105647', false, NULL, NULL, false, false, NULL, 59, '(Laura/Jordan) Brookhaven', NULL);
INSERT INTO public.drivers VALUES (191, 'Noel Clark', '(770) 235-8026', 'jdnclark@bellsouth.net', NULL, 'Area: East Cobb/Downtown; Agreement: yes', true, NULL, NULL, 'available', 'East Cobb/Downtown', '2025-06-24 01:26:36.37944', '2025-06-24 01:26:36.379444', false, NULL, NULL, false, false, NULL, 57, 'East Cobb/Downtown', NULL);
INSERT INTO public.drivers VALUES (254, 'Holly  Smith', '443-848-6493', 'hollygsmith96@gmail.com', NULL, 'Area: East Cobb (drives to T&Z)', false, NULL, NULL, 'available', 'East Cobb (drives to T&Z)', '2025-06-24 01:44:07.352074', '2025-06-24 01:44:07.35208', false, NULL, NULL, false, false, NULL, NULL, 'East Cobb (drives to T&Z)', NULL);
INSERT INTO public.drivers VALUES (257, 'Alaysia Venable', '470-528-2070', 'alaysiav@outlook.com', NULL, 'Area: (Laura/Jordan) Brookhaven', false, NULL, NULL, 'available', '(Laura/Jordan) Brookhaven', '2025-06-24 01:44:07.55836', '2025-06-24 01:44:07.558365', false, NULL, NULL, false, false, NULL, NULL, '(Laura/Jordan) Brookhaven', NULL);
INSERT INTO public.drivers VALUES (264, 'Randy  Whiting', '(404) 633-0293', 'rwhiting17@comcast.net', NULL, 'Area: Chamblee/Brookhaven; Notes: Retired', false, NULL, NULL, 'available', 'Chamblee/Brookhaven', '2025-06-24 01:44:08.043105', '2025-06-24 01:44:08.043108', false, NULL, NULL, false, false, NULL, NULL, 'Chamblee/Brookhaven', NULL);
INSERT INTO public.drivers VALUES (265, 'Nabih Karim', '(404) 512-8373', 'nabih.karim7121@gmail.com', NULL, 'Area: Metro Atlanta; Notes: College Student', false, NULL, NULL, 'available', 'Metro Atlanta', '2025-06-24 01:44:08.112036', '2025-06-24 01:44:08.11204', false, NULL, NULL, false, false, NULL, NULL, 'Metro Atlanta', NULL);
INSERT INTO public.drivers VALUES (281, 'Cynthia Cox', '678.860.6442', 'cc.cox26@gmail.com', NULL, 'Area: Atlanta Agreement: signed', true, NULL, NULL, 'available', 'Atlanta', '2025-06-24 01:44:09.432312', '2025-06-24 01:44:09.432317', false, NULL, NULL, true, false, NULL, 59, 'Atlanta', NULL);
INSERT INTO public.drivers VALUES (283, 'Della Fried', '404.556.0277', 'djonesfried@gmail.com', NULL, 'Area: Atlanta Agreement: signed', true, NULL, NULL, 'available', 'Atlanta', '2025-06-24 01:44:09.569899', '2025-06-24 01:44:09.569903', false, NULL, NULL, true, false, NULL, NULL, 'Atlanta', NULL);
INSERT INTO public.drivers VALUES (279, 'Jen Cohen', '404-918-9933', 'jenmcohen@gmail.com', NULL, 'Area: Sandy Springs AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Sandy Springs', '2025-06-24 01:44:09.294658', '2025-06-24 01:44:09.294663', false, NULL, NULL, false, false, NULL, 58, 'Sandy Springs', NULL);
INSERT INTO public.drivers VALUES (280, 'Karen Cohen', '404.451.7942', 'karenacohen@gmail.com', NULL, 'Area: Alpharetta AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Alpharetta', '2025-06-24 01:44:09.363229', '2025-06-24 01:44:09.363233', false, NULL, NULL, false, false, NULL, 55, 'Alpharetta', NULL);
INSERT INTO public.drivers VALUES (282, 'Kate Dolan', '404.271.4352', 'kate.dolan@comcast.net', NULL, 'Area: Chastain AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Chastain', '2025-06-24 01:44:09.501034', '2025-06-24 01:44:09.501039', false, NULL, NULL, false, false, NULL, 58, 'Chastain', NULL);
INSERT INTO public.drivers VALUES (262, 'Linda  Wohlbach', '770-448-1583', 'lwohlbach@gmail.com', NULL, 'Area: Peachtree Corners Agreement: signed', true, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:44:07.90545', '2025-06-24 01:44:07.905455', false, NULL, NULL, true, false, NULL, 56, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (252, 'Amy  Santy', '404-386-3664', 'amysanty@comcast.net', NULL, 'Area: Midtown (groups) Agreement: signed', true, NULL, NULL, 'available', 'Midtown (groups)', '2025-06-24 01:44:07.214149', '2025-06-24 01:44:07.214153', false, NULL, NULL, true, false, NULL, 59, 'Midtown (groups)', NULL);
INSERT INTO public.drivers VALUES (246, 'James  Cramer', '770-335-7092', NULL, NULL, 'Area: Dunwoody (St Vincents) Agreement: signed', true, NULL, NULL, 'available', 'Dunwoody (St Vincents)', '2025-06-24 01:44:06.542168', '2025-06-24 01:44:06.542172', false, NULL, NULL, true, false, NULL, 56, 'Dunwoody (St Vincents)', NULL);
INSERT INTO public.drivers VALUES (277, 'Chet (William)  Bell', '386-290-8930', 'bell73@bellsouth.net', NULL, 'Area: Roswell Agreement: signed', true, NULL, NULL, 'available', 'Roswell', '2025-06-24 01:44:09.156788', '2025-06-24 01:44:09.156794', true, NULL, NULL, true, false, NULL, 57, 'Roswell', NULL);
INSERT INTO public.drivers VALUES (186, 'Daniel Bekerman', '404-354-1010', 'daniel.bekerman@gmail.com', NULL, 'As needed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:35.692154', '2025-06-24 01:26:35.692158', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (141, 'Libby Clement', '404-210-5677', 'libbyclement@comcast.net', NULL, 'Agreement: yes', true, NULL, NULL, 'available', NULL, '2025-06-24 01:26:03.550866', '2025-06-24 01:26:03.550871', true, NULL, NULL, false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.drivers VALUES (266, 'Kristin Storm', '(678) 428-7092', 'kristinrmorrison@yahoo.com', NULL, 'Area: Upper West Side Atl; Notes: weekend afternoons', false, NULL, NULL, 'available', 'Upper West Side Atl', '2025-06-24 01:44:08.180972', '2025-06-24 01:44:08.181046', false, NULL, NULL, false, false, NULL, NULL, 'Upper West Side Atl', NULL);
INSERT INTO public.drivers VALUES (267, 'Shayla Smith', '(404) 438-4456', 'shaylasmith920@gmail.com', NULL, 'Area: Lawrenceville; Notes: available on Saturdays', false, NULL, NULL, 'available', 'Lawrenceville', '2025-06-24 01:44:08.319887', '2025-06-24 01:44:08.319891', false, NULL, NULL, false, false, NULL, NULL, 'Lawrenceville', NULL);
INSERT INTO public.drivers VALUES (268, 'Lauren Eckman', '(770) 851-5116', 'laurenceckman@gmail.com', NULL, 'Area: Brookwood (by Piedmont Hospital); Notes: weekends & Friday after 4', false, NULL, NULL, 'available', 'Brookwood (by Piedmont Hospital)', '2025-06-24 01:44:08.457705', '2025-06-24 01:44:08.457709', false, NULL, NULL, false, false, NULL, NULL, 'Brookwood (by Piedmont Hospital)', NULL);
INSERT INTO public.drivers VALUES (269, 'Kerol Guaqueta', '(818) 675-7215', 'kerol.guaqueta@gmail.com', NULL, 'Area: Atlanta; Notes: any day 12-3', false, NULL, NULL, 'available', 'Atlanta', '2025-06-24 01:44:08.526725', '2025-06-24 01:44:08.526729', false, NULL, NULL, false, false, NULL, NULL, 'Atlanta', NULL);
INSERT INTO public.drivers VALUES (270, 'Jessica Garrido', '(706) 386-4339', 'garrido_jessica@ymail.com', NULL, 'Area: Buford', false, NULL, NULL, 'available', 'Buford', '2025-06-24 01:44:08.595438', '2025-06-24 01:44:08.595442', false, NULL, NULL, false, false, NULL, NULL, 'Buford', NULL);
INSERT INTO public.drivers VALUES (271, 'Patricia  Hunter', '(678) 637-4243', 'trishhunter211@gmail.com', NULL, 'Area: East Atlanta; Notes: flexible, any day, 8 am to 6pm', false, NULL, NULL, 'available', 'East Atlanta', '2025-06-24 01:44:08.664183', '2025-06-24 01:44:08.664187', false, NULL, NULL, false, false, NULL, NULL, 'East Atlanta', NULL);
INSERT INTO public.drivers VALUES (272, 'Susan Soper', '(404) 281-9639', 'susanmsoper@gmail.com', NULL, 'Area: Lives on Ivy Road; Notes: can drive on M; W; F (not Thursday unless after 11)', false, NULL, NULL, 'available', 'Lives on Ivy Road', '2025-06-24 01:44:08.733404', '2025-06-24 01:44:08.733424', false, NULL, NULL, false, false, NULL, NULL, 'Lives on Ivy Road', NULL);
INSERT INTO public.drivers VALUES (273, 'Lori  Wilson', '(410) 303-0090', 'klsjwilson@yahoo.com', NULL, 'Area: Alpharetta/Milton; Notes: flexible', false, NULL, NULL, 'available', 'Alpharetta/Milton', '2025-06-24 01:44:08.80216', '2025-06-24 01:44:08.802164', false, NULL, NULL, false, false, NULL, NULL, 'Alpharetta/Milton', NULL);
INSERT INTO public.drivers VALUES (199, 'Benjamin Gross', '470-585-9222', 'bengross1987@gmail.com', NULL, 'Area: Anywhere; Agreement: yes', false, NULL, NULL, 'available', 'Anywhere', '2025-06-24 01:26:37.673267', '2025-06-24 01:26:37.673271', false, NULL, NULL, false, false, NULL, NULL, 'Anywhere', NULL);
INSERT INTO public.drivers VALUES (203, 'Leslie Johnson', '(404) 644-8630', 'lesliebolinjohnson@yahoo.com', NULL, 'Area: Lisa; Agreement: yes; Notes: Lisa', false, NULL, NULL, 'available', 'Lisa', '2025-06-24 01:26:38.289444', '2025-06-24 01:26:38.28945', false, NULL, NULL, false, false, NULL, NULL, 'Lisa', NULL);
INSERT INTO public.drivers VALUES (197, 'Miriam Falaki', NULL, 'mfalaki@savantwealth.com', NULL, 'Area: Anywhere; Agreement: yes', true, NULL, NULL, 'available', 'Anywhere', '2025-06-24 01:26:37.343965', '2025-06-24 01:26:37.34397', false, NULL, NULL, false, false, NULL, NULL, 'Anywhere', NULL);
INSERT INTO public.drivers VALUES (201, 'Suzanne Grosswald', '678-758-2190', 'davnsuz@comcast.net', NULL, 'Area: Peachtree Corners; Agreement: yes', true, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:26:38.015764', '2025-06-24 01:26:38.015768', false, NULL, NULL, false, false, NULL, NULL, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (202, 'Renee Harris', '404-823-7787', 'reneeharris05@gmail.com', NULL, 'Area: Dunwoody; Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:38.152728', '2025-06-24 01:26:38.152733', false, NULL, NULL, false, false, NULL, NULL, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (207, 'Ataesia Mickens', '470-559-6160', 'ataesiamickens@gmail.com', NULL, 'Area: (Laura/Jordan) Suwanee; Agreement: yes', true, NULL, NULL, 'available', '(Laura/Jordan) Suwanee', '2025-06-24 01:26:38.890102', '2025-06-24 01:26:38.890106', false, NULL, NULL, false, false, NULL, NULL, '(Laura/Jordan) Suwanee', NULL);
INSERT INTO public.drivers VALUES (260, 'Brian Williams', '(650) 464-9969', 'brian.williams2@wholefoods.com', NULL, 'Area: Cartersville; Notes: Whole Foods guy Agreement: signed', true, NULL, NULL, 'available', 'Cartersville', '2025-06-24 01:44:07.767215', '2025-06-24 01:44:07.767218', false, NULL, NULL, true, false, NULL, NULL, 'Cartersville', NULL);
INSERT INTO public.drivers VALUES (209, 'Catherine Newsome', '(404) 414-9172', NULL, NULL, 'Area: Groups; Agreement: yes', true, NULL, NULL, 'available', 'Groups', '2025-06-24 01:26:39.163365', '2025-06-24 01:26:39.163368', false, NULL, NULL, false, false, NULL, 55, 'Groups', NULL);
INSERT INTO public.drivers VALUES (198, 'Chris Frye', '4044312600', 'cmfrye@gmail.com', NULL, 'Area: East Cobb; Agreement: yes', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:37.536194', '2025-06-24 01:26:37.536199', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (253, 'Jade Schoenberg', '256-473-4229', 'jadeschoenberg@gmail.com', NULL, 'Area: Sandy Springs/Dunwoody AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Sandy Springs/Dunwoody', '2025-06-24 01:44:07.282959', '2025-06-24 01:44:07.282964', false, NULL, NULL, false, false, NULL, NULL, 'Sandy Springs/Dunwoody', NULL);
INSERT INTO public.drivers VALUES (194, 'Corinne Cramer', '(404) 667-9841', 'corcramer@comcast.net', NULL, 'Area: Dunwoody (St Vincents); Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody (St Vincents)', '2025-06-24 01:26:36.931381', '2025-06-24 01:26:36.931386', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody (St Vincents)', NULL);
INSERT INTO public.drivers VALUES (251, 'Bree Roe', '404-376-2288', 'breewroe@gmail.com', NULL, 'Area: East Cobb (groups); Notes: breewroe@gmail.com Agreement: signed', true, NULL, NULL, 'available', 'East Cobb (groups)', '2025-06-24 01:44:07.145547', '2025-06-24 01:44:07.145551', false, NULL, NULL, true, false, NULL, 57, 'East Cobb (groups)', NULL);
INSERT INTO public.drivers VALUES (208, 'Gary Munder', '404-543-3078', 'mundergary@gmail.com', NULL, 'Area: East Cobb to anywhere; Van approved: yes; Agreement: yes', true, NULL, NULL, 'available', 'East Cobb to anywhere', '2025-06-24 01:26:39.026686', '2025-06-24 01:26:39.026691', false, NULL, NULL, false, false, NULL, 57, 'East Cobb to anywhere', NULL);
INSERT INTO public.drivers VALUES (195, 'James Cramer', '770-335-7092', NULL, NULL, 'Area: Dunwoody (St Vincents); Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody (St Vincents)', '2025-06-24 01:26:37.068332', '2025-06-24 01:26:37.068337', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody (St Vincents)', NULL);
INSERT INTO public.drivers VALUES (187, 'Marni Bekerman', '(678) 938-8367', 'marnibekerman@gmail.com', NULL, 'As needed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:35.829305', '2025-06-24 01:26:35.829309', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (200, 'Jeff Gross', '770.329.9709', 'jeffreygross@yahoo.com', NULL, 'Area: East Cobb/SS; Agreement: yes; Notes: Drives wherever', true, NULL, NULL, 'available', 'East Cobb/SS', '2025-06-24 01:26:37.87878', '2025-06-24 01:26:37.878784', false, NULL, NULL, false, false, NULL, 57, 'East Cobb/SS', NULL);
INSERT INTO public.drivers VALUES (256, 'Josh Tamarkin', '(678) 674-0918', 'josh.tamarkin@pisgahpats.org', NULL, 'Area: alpharetta; Notes: student AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'alpharetta', '2025-06-24 01:44:07.489381', '2025-06-24 01:44:07.489386', false, NULL, NULL, false, false, NULL, 55, 'Alpharetta', NULL);
INSERT INTO public.drivers VALUES (259, 'Kellie Whitley', '770-880-7106', 'kjwhitley@gmail.com', NULL, 'Area: East Cobb AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:44:07.698181', '2025-06-24 01:44:07.698186', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (204, 'Kathy Ledford', '678-428-5247', 'kledfo200@comcast.net', NULL, 'Area: Dunwoody; Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:38.480292', '2025-06-24 01:26:38.480297', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (292, 'Kelly McDonald', '404.272.4126', 'kellymcdonald9@gmail.com', NULL, 'Area: Milton AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Milton', '2025-06-24 01:44:10.331843', '2025-06-24 01:44:10.331848', false, NULL, NULL, false, false, NULL, 55, 'Milton', NULL);
INSERT INTO public.drivers VALUES (291, 'Kristina McCarthney', '678-372-7959', 'kristinamday@yahoo.com', NULL, 'Area: Flowery Branch AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Flowery Branch', '2025-06-24 01:44:10.262365', '2025-06-24 01:44:10.262369', false, NULL, NULL, false, false, NULL, 60, 'Flowery Branch', NULL);
INSERT INTO public.drivers VALUES (275, 'Laura Baldwin', '404.931.8774', 'lzauderer@yahoo.com', NULL, 'Area: Atlanta AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Atlanta', '2025-06-24 01:44:08.94032', '2025-06-24 01:44:08.940325', false, NULL, NULL, false, false, NULL, 59, 'Atlanta', NULL);
INSERT INTO public.drivers VALUES (250, 'Lauren Roberts', '404-556-8681', 'roberts.laurenf@gmail.com', NULL, 'Area: Roswell; Notes: roberts.laurenf@gmail.com AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Roswell', '2025-06-24 01:44:07.076603', '2025-06-24 01:44:07.076609', false, NULL, NULL, false, false, NULL, 57, 'Roswell', NULL);
INSERT INTO public.drivers VALUES (284, 'Lisa Hiles', '770.826.0457', 'lisahiles@me.com', NULL, 'Area: Dunwoody AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:44:09.63888', '2025-06-24 01:44:09.638885', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (255, 'Melissa Spencer', '404-316-4944', 'spen8270@bellsouth.net', NULL, 'Area: East Cobb/Roswell driver AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'East Cobb/Roswell driver', '2025-06-24 01:44:07.420732', '2025-06-24 01:44:07.420736', false, NULL, NULL, false, false, NULL, 57, 'East Cobb/Roswell driver', NULL);
INSERT INTO public.drivers VALUES (287, 'Sarah Kass', '404.455.6743', 'sarahlkass@gmail.com', NULL, 'Area: Sandy Springs AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Sandy Springs', '2025-06-24 01:44:09.918129', '2025-06-24 01:44:09.918134', false, NULL, NULL, false, false, NULL, 58, 'Sandy Springs', NULL);
INSERT INTO public.drivers VALUES (290, 'Stephanie Luis', '678.372.9024', 'stephanieluis55@gmail.com', NULL, 'Area: Dunwoody AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:44:10.193516', '2025-06-24 01:44:10.19352', false, NULL, NULL, false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (205, 'Mimi Loson', '678-644-2062', 'mkl.cmf@gmail.com', NULL, 'Area: East Cobb; Agreement: yes', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:38.617084', '2025-06-24 01:26:38.617088', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (133, 'Nisha Gross', '(678) 521-0618', 'nisha.gross@gmail.com', NULL, 'Area: Druid hills rd in Brookhaven; Agreement: yes', true, NULL, NULL, 'available', 'Druid hills rd in Brookhaven', '2025-06-24 01:26:02.239284', '2025-06-24 01:26:02.239288', false, NULL, NULL, false, false, NULL, 59, 'Druid hills rd in Brookhaven', NULL);
INSERT INTO public.drivers VALUES (193, 'Parker Cohen', '(678) 718-7518', 'parkerwcohen@gmail.com', NULL, 'Area: Sandy Springs; Agreement: yes', true, NULL, NULL, 'available', 'Sandy Springs', '2025-06-24 01:26:36.791736', '2025-06-24 01:26:36.791741', false, NULL, NULL, false, false, NULL, 58, 'Sandy Springs', NULL);
INSERT INTO public.drivers VALUES (274, 'Terri Bagen', '404.273.5846', 'tsfb@bellsouth.net', NULL, 'Area: Atlanta AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Atlanta', '2025-06-24 01:44:08.871469', '2025-06-24 01:44:08.871473', false, NULL, NULL, false, false, NULL, 59, 'Atlanta', NULL);
INSERT INTO public.drivers VALUES (285, 'Jordan Horne', '404.271.4352', 'jordanglick@gmail.com', NULL, 'Area: Chamblee/N Brookhaven AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Chamblee/N Brookhaven', '2025-06-24 01:44:09.70813', '2025-06-24 01:44:09.708135', true, NULL, NULL, false, false, NULL, 59, 'Chamblee/N Brookhaven', NULL);
INSERT INTO public.drivers VALUES (192, 'Mickey Cohen', '404-457-4457', 'cyekcim@gmail.com', NULL, 'As needed', true, NULL, NULL, 'available', 'Sandy Springs', '2025-06-24 01:26:36.653941', '2025-06-24 01:26:36.653947', false, NULL, NULL, false, false, NULL, 58, 'Sandy Springs', NULL);
INSERT INTO public.drivers VALUES (276, 'Julie Bastek', '404.808.2560', 'julierose27@comcast.net', NULL, 'Area: Buckhead AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Buckhead', '2025-06-24 01:44:09.087796', '2025-06-24 01:44:09.087801', false, NULL, NULL, false, false, NULL, 59, 'Buckhead', NULL);
INSERT INTO public.drivers VALUES (288, 'Ana LaBoy', '(404) 983-7911', 'analaboy7@gmail.com', NULL, 'Area: Lilburn Agreement: signed', true, NULL, NULL, 'available', 'Lilburn', '2025-06-24 01:44:10.055966', '2025-06-24 01:44:10.05597', false, NULL, NULL, true, false, NULL, NULL, 'Lilburn', NULL);
INSERT INTO public.drivers VALUES (249, 'Jay Rein', '404-348-6089', 'jaysrein@yahoo.com', NULL, 'Area: Sandy Springs to anywhere; Notes: Marcy AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Sandy Springs to anywhere', '2025-06-24 01:44:06.887965', '2025-06-24 01:44:06.887969', false, NULL, NULL, false, false, NULL, 58, 'Sandy Springs to anywhere', NULL);
INSERT INTO public.drivers VALUES (206, 'Susan McKenzie', '(404) 735-5426', 'susan.mckenzie23@gmail.com', NULL, 'Hasn''t started; Lisa', true, NULL, NULL, 'available', 'Lisa', '2025-06-24 01:26:38.753596', '2025-06-24 01:26:38.753601', false, NULL, NULL, false, false, NULL, NULL, 'Lisa', NULL);
INSERT INTO public.drivers VALUES (196, 'Elizabeth Dickson', '678-779-2088', 'elizabethpdickson@gmail.com', NULL, 'Area: Dunwoody; Agreement: yes;', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:37.205283', '2025-06-24 01:26:37.205288', false, NULL, 'M-F after 3; weekends', false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (303, 'Allison Tanenbaum', '(770) 355-8876', 'abalembik@gmail.com', NULL, 'Area: SS to SS/Dunwoody Agreement: signed', true, NULL, NULL, 'available', 'SS to SS/Dunwoody', '2025-06-24 01:44:11.096452', '2025-06-24 01:44:11.096457', false, NULL, NULL, true, false, NULL, 58, 'SS to SS/Dunwoody', NULL);
INSERT INTO public.drivers VALUES (138, 'Amy Kelsch', '404-421-8035', 'amykelsch@gmail.com', NULL, 'Area: East Cobb; Agreement: yes; Notes: driver for home depot', true, NULL, NULL, 'available', 'East Cobb', '2025-06-24 01:26:03.082386', '2025-06-24 01:26:03.08239', false, NULL, '', false, false, NULL, 57, 'East Cobb (Driver for Home Depot?)', NULL);
INSERT INTO public.drivers VALUES (210, 'Ed Ogletree', '770-331-1500', 'romaseriea@gmail.com', '2290 Littlebrooke Lane, Dunwoody, GA 30338', 'Area: Dunwoody to everywhere; Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody to everywhere', '2025-06-24 01:26:39.300042', '2025-06-24 01:26:39.300046', false, '2290 Littlebrooke Lane, Dunwoody, GA 30338', NULL, false, false, NULL, 56, 'Dunwoody to everywhere', NULL);
INSERT INTO public.drivers VALUES (295, 'Rayna Nash', '404.376.8028', 'itsanaturalthangsalon@gmail.com', NULL, 'Area: College Park AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'College Park', '2025-06-24 01:44:10.53851', '2025-06-24 01:44:10.538515', false, NULL, NULL, false, false, NULL, 59, 'College Park', NULL);
INSERT INTO public.drivers VALUES (134, 'Jan Jay', '6785925091', 'janjayrd@yahoo.com', NULL, 'Area: Dunwoody; Agreement: yes; Notes: Happy to help, just not available on Wed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:26:02.380055', '2025-06-24 01:26:02.380061', true, NULL, 'weekend afternoons', false, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (211, 'Jenn Parks', '(770) 289-0728', 'jenniferakopp@yahoo.com', NULL, 'Area: Alpharetta (Near Avalon); Agreement: yes', true, NULL, NULL, 'available', 'Alpharetta (Near Avalon)', '2025-06-24 01:26:39.43697', '2025-06-24 01:26:39.436989', false, NULL, NULL, false, false, NULL, 55, 'Alpharetta (Near Avalon)', NULL);
INSERT INTO public.drivers VALUES (309, 'Renee Videlefsky', '770.265.3563', 'videlefsky@gmail.com', NULL, 'Area: PTC to SS/Dun AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'PTC to SS/Dun', '2025-06-24 01:44:11.648738', '2025-06-24 01:44:11.648743', false, NULL, NULL, false, false, NULL, 56, 'PTC to SS/Dun', NULL);
INSERT INTO public.drivers VALUES (278, 'Angie Bradenburg', '404.668.6886', 'ahberlin@yahoo.com', NULL, 'Area: Candler Park Agreement: signed', true, NULL, NULL, 'available', 'Candler Park', '2025-06-24 01:44:09.225768', '2025-06-24 01:44:09.225774', false, NULL, NULL, true, false, NULL, 59, 'Candler Park', NULL);
INSERT INTO public.drivers VALUES (152, 'Pat McGreevy', '770-853-8783', 'pjmcgreevy@comcast.net', 'Brooke Farm', 'Area: Dunwoody to anywhere; Agreement: yes', true, NULL, NULL, 'available', 'Dunwoody to anywhere', '2025-06-24 01:26:05.086524', '2025-06-24 01:26:05.086528', true, '4715 Ponte Vedra Drive, Marietta, GA 30067', NULL, false, false, NULL, 56, 'Dunwoody to anywhere', NULL);
INSERT INTO public.drivers VALUES (307, 'Vicki Tropauer', '404.202.9108', 'vickib@aol.com', NULL, 'Area: EC AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'EC', '2025-06-24 01:44:11.442286', '2025-06-24 01:44:11.44229', true, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (294, 'Nancy Miller', '678.575.6898', 'atlantamillers@comcast.net', NULL, 'Area: Alpharetta AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Alpharetta', '2025-06-24 01:44:10.469437', '2025-06-24 01:44:10.469442', true, NULL, NULL, false, false, NULL, 55, 'Alpharetta', NULL);
INSERT INTO public.drivers VALUES (299, 'Ashley Rush', '678-480-8786', 'ashleyrush@comcast.net', NULL, 'Area: Decatur Agreement: signed', true, NULL, NULL, 'available', 'Decatur', '2025-06-24 01:44:10.813592', '2025-06-24 01:44:10.813598', false, NULL, NULL, true, false, NULL, 59, 'Decatur', NULL);
INSERT INTO public.drivers VALUES (153, 'Steve Miles', '404-931-9862', 'milescatering01@aol.com', NULL, 'Area: Roswell to everywhere; Agreement: yes', true, NULL, NULL, 'available', 'Roswell to everywhere', '2025-06-24 01:26:05.226233', '2025-06-24 01:26:05.226237', true, NULL, NULL, false, false, NULL, 57, 'Roswell to everywhere', NULL);
INSERT INTO public.drivers VALUES (261, 'Claire Jo Wise', '678-467-7216', 'cjcwise@comcast.net', NULL, 'Area: Roswell/East Cobb driver Agreement: signed', true, NULL, NULL, 'available', 'Roswell/East Cobb driver', '2025-06-24 01:44:07.836411', '2025-06-24 01:44:07.836416', false, NULL, NULL, true, false, NULL, 57, 'Roswell/East Cobb driver', NULL);
INSERT INTO public.drivers VALUES (151, 'Suzanne Sackleh', '(678) 662-3334', 'suzannesackleh@gmail.com', NULL, 'Area: Sandy Springs to anywhere; Agreement: yes', true, NULL, NULL, 'available', 'Sandy Springs to anywhere', '2025-06-24 01:26:04.947027', '2025-06-24 01:26:04.947031', true, '123 Sandy Springs Road, Atlanta, GA 30328', NULL, false, false, NULL, 58, 'Sandy Springs to anywhere', NULL);
INSERT INTO public.drivers VALUES (263, 'Darren Wolkow', '770-490-6206', 'dwolkow@gmail.com', NULL, 'Area: Dunwoody Agreement: signed', true, NULL, NULL, 'available', 'Dunwoody', '2025-06-24 01:44:07.974335', '2025-06-24 01:44:07.974339', false, NULL, NULL, true, false, NULL, 56, 'Dunwoody', NULL);
INSERT INTO public.drivers VALUES (297, 'Sarah Painter', '816.308.2273', 'snpainter23@gmail.com', NULL, 'Area: Milton AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Milton', '2025-06-24 01:44:10.676088', '2025-06-24 01:44:10.676093', false, NULL, NULL, false, false, NULL, 55, 'Milton', NULL);
INSERT INTO public.drivers VALUES (300, 'Silke Shilling', '404.375.9541', 'silke.shilling@gmail.com', NULL, 'Area: EC AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'EC', '2025-06-24 01:44:10.888414', '2025-06-24 01:44:10.888419', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (293, 'Steffi Miller', '678-570-9009', 'steffilanetmc@gmail.com', NULL, 'Area: Peachtree Corners AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:44:10.400568', '2025-06-24 01:44:10.400572', false, '6241 Blackberry Hill, Norcross, GA 30092', NULL, false, false, NULL, 56, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (306, 'Suzanna Trice', '770.403.4821', 'suzannatrice@hotmail.com', NULL, 'Area: PC AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'PC', '2025-06-24 01:44:11.303674', '2025-06-24 01:44:11.303679', false, NULL, NULL, false, false, NULL, 56, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (146, 'Lexi Hayne', '404-705-9522', 'haycuet@gmail.com', '4715 Ponte Vedra Drive, Marietta, GA 30067', 'Agreement SENT', true, NULL, NULL, 'available', 'East Cobb / SS (last resort?)', '2025-06-24 01:26:04.249357', '2025-06-24 01:26:04.249363', false, '4715 Ponte Vedra Drive, Marietta, GA 30067', NULL, false, false, NULL, 57, 'East Cobb / SS (last resort?)', NULL);
INSERT INTO public.drivers VALUES (302, 'Elaine Strauss', '678-525-8607', 'elainerstrauss@gmail.com', NULL, 'Area: Peachtree Corners AGREEMENT RECEIVED AGREEMENT MISSING AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Peachtree Corners', '2025-06-24 01:44:11.027183', '2025-06-24 01:44:11.027188', false, NULL, NULL, false, false, NULL, 56, 'Peachtree Corners', NULL);
INSERT INTO public.drivers VALUES (301, 'Jason Smieja', '(678) 245-2110', 'jsmieja@superiorplay.com', NULL, 'Area: suwanee/jc/duluth AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'suwanee/jc/duluth', '2025-06-24 01:44:10.958138', '2025-06-24 01:44:10.958142', false, NULL, NULL, false, false, NULL, NULL, 'suwanee/jc/duluth', NULL);
INSERT INTO public.drivers VALUES (308, 'Jenny Vanier-Walter', '703.403.0711', 'jennyavw@yahoo.com', NULL, 'Area: Roswell AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'Roswell', '2025-06-24 01:44:11.579264', '2025-06-24 01:44:11.579268', false, NULL, NULL, false, false, NULL, 57, 'Roswell', NULL);
INSERT INTO public.drivers VALUES (305, 'Judy Toenmeiser', '404-683-5823', 'toens@bellsouth.net', NULL, 'Area: EC AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'EC', '2025-06-24 01:44:11.234932', '2025-06-24 01:44:11.234937', false, NULL, NULL, false, false, NULL, 57, 'East Cobb', NULL);
INSERT INTO public.drivers VALUES (296, 'Tracie Nowak', '770.315.9177', 'tbnowak@yahoo.com', NULL, 'Area: PC AGREEMENT RECEIVED', true, NULL, NULL, 'available', 'PC', '2025-06-24 01:44:10.60722', '2025-06-24 01:44:10.607224', false, NULL, NULL, false, false, NULL, 56, 'Peachtree Corners', NULL);


--
-- Data for Name: group_memberships; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: host_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.host_contacts VALUES (22, 46, 'Rayna Nash', 'Host/driver', '4043768028', 'itsanaturalthangsalon@gmail.com', false, NULL, '2025-06-10 03:25:57.60669', '2025-06-10 03:25:57.60669');
INSERT INTO public.host_contacts VALUES (25, 48, 'Veronica Pendleton', 'Host/driver', '6784276109', 'vpennington924@gmail.com', false, NULL, '2025-06-10 03:25:58.288485', '2025-06-10 03:25:58.288485');
INSERT INTO public.host_contacts VALUES (23, 56, 'Tracie Nowak', 'Host/driver', '7703159177', 'tbnowak@yahoo.com', false, '', '2025-06-10 03:25:57.833699', '2025-06-30 16:16:53.926');
INSERT INTO public.host_contacts VALUES (32, 56, 'Suzanna Trice', 'Host/Driver', '7704034821', 'suzannatrice@hotmail.com', false, '', '2025-06-10 03:25:59.975111', '2025-06-30 16:16:57.602');
INSERT INTO public.host_contacts VALUES (16, 56, 'Marcy  Louza', 'lead', '6785969697', 'mdlouza@gmail.com', false, '', '2025-06-10 03:25:56.247043', '2025-06-30 16:17:01.598');
INSERT INTO public.host_contacts VALUES (17, 56, 'Stephanie Luis', 'lead', '6783729024', 'stephanieluis55@gmail.com', false, '', '2025-06-10 03:25:56.473673', '2025-06-30 16:17:06.994');
INSERT INTO public.host_contacts VALUES (18, 60, 'Kristina McCarthney', 'Host/driver', '6783727959', 'kristinamday@yahoo.com', false, '', '2025-06-10 03:25:56.69997', '2025-06-30 16:17:27.955');
INSERT INTO public.host_contacts VALUES (2, 3, 'Laura Baldwin', 'Host/driver', '4049318774', 'lzauderer@yahoo.com', false, '', '2025-06-10 03:25:53.073218', '2025-06-14 04:08:56.95');
INSERT INTO public.host_contacts VALUES (3, 3, 'Julie Bastek', 'Host/driver', '4048082560', 'julierose27@comcast.net', false, '', '2025-06-10 03:25:53.299967', '2025-06-14 04:09:09.522');
INSERT INTO public.host_contacts VALUES (9, 58, 'Kate Dolan', 'Host/driver', '4042714352', 'kate.dolan@comcast.net', false, '', '2025-06-10 03:25:54.663274', '2025-06-30 16:17:40.285');
INSERT INTO public.host_contacts VALUES (5, 3, 'Angie Bradenburg', 'Host/driver', '4046686886', 'ahberlin@yahoo.com', false, '', '2025-06-10 03:25:53.754573', '2025-06-14 04:09:52.691');
INSERT INTO public.host_contacts VALUES (10, 3, 'Della Fried', 'Host/driver', '4045560277', 'djonesfried@gmail.com', false, '', '2025-06-10 03:25:54.890309', '2025-06-14 04:10:42.437');
INSERT INTO public.host_contacts VALUES (12, 3, 'Jordan Horne', 'Host/driver', '4042714352', 'jordanglick@gmail.com', false, '', '2025-06-10 03:25:55.343447', '2025-06-14 04:11:00.019');
INSERT INTO public.host_contacts VALUES (26, 3, 'Ashley Rush', 'Host/driver', '6784808786', 'ashleyrush@comcast.net', false, '', '2025-06-10 03:25:58.514469', '2025-06-14 04:12:02.549');
INSERT INTO public.host_contacts VALUES (6, 58, 'Jen Cohen', 'Host/driver', '4049189933', 'jenmcohen@gmail.com', false, '', '2025-06-10 03:25:53.981583', '2025-06-30 16:17:58.72');
INSERT INTO public.host_contacts VALUES (14, 58, 'Sarah Kass', 'Host/driver', '4044556743', 'sarahLkass@gmail.com', false, '', '2025-06-10 03:25:55.79608', '2025-06-30 16:18:04.015');
INSERT INTO public.host_contacts VALUES (30, 58, 'Allison Tanenbaum', 'Host/driver', '7703558876', 'abalembik@gmail.com', false, '', '2025-06-10 03:25:59.522803', '2025-06-30 16:18:08.071');
INSERT INTO public.host_contacts VALUES (1, 58, 'Terri Bagen', 'Host/driver', '4042735846', 'tsfb@bellsouth.net', false, '', '2025-06-10 03:25:52.826974', '2025-06-30 16:18:11.97');
INSERT INTO public.host_contacts VALUES (37, 54, 'Anna Baylin', 'volunteer', '(770) 696-7218‬', 'annabaylin@gmail.com', false, '', '2025-06-14 04:31:53.718491', '2025-06-14 04:32:02.928');
INSERT INTO public.host_contacts VALUES (7, 55, 'Karen Cohen', 'Host/driver', '4044517942', 'karenacohen@gmail.com', false, '', '2025-06-10 03:25:54.209333', '2025-06-30 16:07:52.502');
INSERT INTO public.host_contacts VALUES (21, 55, 'Nancy Miller', 'Host/driver', '6785756898', 'atlantamillers@comcast.net', false, '', '2025-06-10 03:25:57.379718', '2025-06-30 16:08:15.594');
INSERT INTO public.host_contacts VALUES (28, 55, 'Jason Smieja', 'Host/driver', '6782452110', 'jsmieja@superiorplay.com', false, '', '2025-06-10 03:25:59.069351', '2025-06-30 16:14:12.088');
INSERT INTO public.host_contacts VALUES (19, 55, 'Kelly McDonald', 'Host/driver', '4042724126', 'kellymcdonald9@gmail.com', false, '', '2025-06-10 03:25:56.926215', '2025-06-30 16:14:19.718');
INSERT INTO public.host_contacts VALUES (24, 55, 'Sarah Painter', 'Host/driver', '8163082273', 'snpainter23@gmail.com', false, '', '2025-06-10 03:25:58.06098', '2025-06-30 16:14:23.764');
INSERT INTO public.host_contacts VALUES (13, 55, 'Carrey  Hugoo', 'Host/driver', '3143632982', 'carreyhugoo@gmail.com', false, '', '2025-06-10 03:25:55.569661', '2025-06-30 16:14:27.88');
INSERT INTO public.host_contacts VALUES (8, 3, 'Cynthia Cox', 'Host/driver', '6788606442', 'cc.cox26@gmail.com', false, '', '2025-06-10 03:25:54.436386', '2025-06-30 16:14:59.882');
INSERT INTO public.host_contacts VALUES (27, 57, 'Silke Shilling', 'Host/driver', '4043759541', 'silke.shilling@gmail.com', false, '', '2025-06-10 03:25:58.774546', '2025-06-30 16:15:20.952');
INSERT INTO public.host_contacts VALUES (4, 57, 'Chet (William)  Bell', 'Driver/alt host', '3862908930', 'bell73@bellsouth.net', false, '', '2025-06-10 03:25:53.528047', '2025-06-30 16:15:25.766');
INSERT INTO public.host_contacts VALUES (34, 57, 'Jenny Vanier-Walter', 'Host/driver', '7034030711', 'jennyavw@yahoo.com', false, '', '2025-06-10 03:26:00.427848', '2025-06-30 16:15:30.9');
INSERT INTO public.host_contacts VALUES (31, 57, 'Judy Toenmeiser', 'Host/Driver', '4046835823', 'toens@bellsouth.net', false, '', '2025-06-10 03:25:59.749018', '2025-06-30 16:15:35.452');
INSERT INTO public.host_contacts VALUES (33, 57, 'Vicki Tropauer', 'lead', '4042029108', 'vickib@aol.com', false, '', '2025-06-10 03:26:00.200697', '2025-06-30 16:15:40.873');
INSERT INTO public.host_contacts VALUES (11, 56, 'Lisa Hiles', 'Host/driver', '7708260457', 'lisahiles@me.com', false, '', '2025-06-10 03:25:55.116953', '2025-06-30 16:16:19.206');
INSERT INTO public.host_contacts VALUES (36, 56, 'Darren Wolkow', 'Host/driver', '7704906206', 'dwolkow@gmail.com', false, '', '2025-06-10 03:26:00.882038', '2025-06-30 16:16:35.767');
INSERT INTO public.host_contacts VALUES (35, 56, 'Renee Videlefsky', 'Host/driver', '7702653563', 'videlefsky@gmail.com', false, '', '2025-06-10 03:26:00.6543', '2025-06-30 16:16:40.008');
INSERT INTO public.host_contacts VALUES (20, 56, 'Steffi Miller', 'Driver/Alt host', '6785709009', 'steffilanetmc@gmail.com', false, '', '2025-06-10 03:25:57.15323', '2025-06-30 16:16:44.955');
INSERT INTO public.host_contacts VALUES (29, 56, 'Elaine Strauss', 'Driver/Alt Host', '6785258607', 'elainerstrauss@gmail.com', false, '', '2025-06-10 03:25:59.296031', '2025-06-30 16:16:49.422');


--
-- Data for Name: hosted_files; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: hosts; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hosts VALUES (29, 'Decatur', '', '', 'inactive', '', '2025-06-08 15:33:02.723718', '2025-06-08 15:33:02.723718', NULL);
INSERT INTO public.hosts VALUES (30, 'Snellville', '', '', 'inactive', '', '2025-06-08 22:20:09.209897', '2025-06-08 22:20:09.209897', NULL);
INSERT INTO public.hosts VALUES (31, 'Woodstock', '', '', 'inactive', '', '2025-06-08 22:21:23.082472', '2025-06-08 22:21:23.082472', NULL);
INSERT INTO public.hosts VALUES (32, 'Oak Grove', '', '', 'inactive', '', '2025-06-08 22:21:40.90949', '2025-06-08 22:21:40.90949', NULL);
INSERT INTO public.hosts VALUES (33, 'New Chastain', '', '', 'inactive', '', '2025-06-08 22:22:03.131359', '2025-06-08 22:22:03.131359', NULL);
INSERT INTO public.hosts VALUES (34, 'Lenox/Brookhaven', '', '', 'inactive', '', '2025-06-08 22:22:17.666476', '2025-06-08 22:22:17.666476', NULL);
INSERT INTO public.hosts VALUES (35, 'Glenwood Park', '', '', 'inactive', '', '2025-06-08 22:22:32.651052', '2025-06-08 22:22:32.651052', NULL);
INSERT INTO public.hosts VALUES (36, 'Buckhead', '', '', 'inactive', '', '2025-06-08 22:22:52.676652', '2025-06-08 22:22:52.676652', NULL);
INSERT INTO public.hosts VALUES (48, 'Dacula', NULL, NULL, 'inactive', '', '2025-06-10 02:57:33.929812', '2025-06-10 02:57:33.929812', '');
INSERT INTO public.hosts VALUES (55, 'Alpharetta', NULL, NULL, 'active', '', '2025-06-30 16:02:47.87595', '2025-06-30 16:02:47.87595', '');
INSERT INTO public.hosts VALUES (56, 'Dunwoody/PTC', NULL, NULL, 'active', '', '2025-06-30 16:03:12.737669', '2025-06-30 16:03:12.737669', '');
INSERT INTO public.hosts VALUES (57, 'East Cobb/Roswell', NULL, NULL, 'active', '', '2025-06-30 16:03:40.675639', '2025-06-30 16:03:40.675639', '');
INSERT INTO public.hosts VALUES (58, 'Sandy Springs', NULL, NULL, 'active', '', '2025-06-30 16:03:51.546264', '2025-06-30 16:03:51.546264', '');
INSERT INTO public.hosts VALUES (42, 'Chamblee/N Brookhaven', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:32.42668', '2025-06-10 22:27:28.717', NULL);
INSERT INTO public.hosts VALUES (46, 'College Park', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:33.549978', '2025-06-10 22:27:34.003', NULL);
INSERT INTO public.hosts VALUES (53, 'Collective Learning', NULL, NULL, 'active', '', '2025-06-14 03:19:29.426646', '2025-06-14 03:19:29.426646', NULL);
INSERT INTO public.hosts VALUES (54, 'Athens', NULL, NULL, 'active', '', '2025-06-14 04:31:19.343217', '2025-06-14 04:31:19.343217', '');
INSERT INTO public.hosts VALUES (59, 'Intown/Druid Hills', NULL, NULL, 'active', '', '2025-06-30 16:04:02.304318', '2025-06-30 16:04:02.304318', '');
INSERT INTO public.hosts VALUES (60, 'Flowery Branch', NULL, NULL, 'active', '', '2025-06-30 16:04:08.911598', '2025-06-30 16:04:08.911598', '');
INSERT INTO public.hosts VALUES (50, 'Suwanee/JC/Duluth', NULL, NULL, 'inactive', '', '2025-06-10 02:57:34.371341', '2025-06-30 16:13:03.097', '');
INSERT INTO public.hosts VALUES (45, 'Peachtree Corners', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:33.323457', '2025-06-30 16:13:09.476', NULL);
INSERT INTO public.hosts VALUES (38, 'Roswell', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:31.51294', '2025-06-30 16:13:18.953', NULL);
INSERT INTO public.hosts VALUES (43, 'Lilburn', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:32.787839', '2025-06-30 16:13:28.396', NULL);
INSERT INTO public.hosts VALUES (37, 'Atlanta', NULL, NULL, 'inactive', NULL, '2025-06-10 02:57:31.184738', '2025-06-30 16:18:31.193', NULL);
INSERT INTO public.hosts VALUES (62, 'Groups', 'groups@sandwich.project', 'N/A', 'active', 'Special host for group donations that don''t have a specific host location. These are collective donations from various groups.', '2025-07-02 23:47:55.927409', '2025-07-02 23:47:55.927409', 'Multiple Locations');


--
-- Data for Name: meeting_minutes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.meeting_minutes VALUES (7, 'Core Team Meeting- April 8', '2024-04-08', 'PDF document: 20240408_TSP Meeting Agenda & Notes.pdf', 'blue', '20240408_TSP Meeting Agenda & Notes.pdf', '/home/runner/workspace/uploads/meeting-minutes/71f47936a511b1eafeac2575269a827f', 'pdf', 'application/pdf', NULL);
INSERT INTO public.meeting_minutes VALUES (11, 'Core Team Meeting 02/12/2024', '2024-02-12', 'PDF document: 20240212_TSP Meeting Agenda & Notes.pdf', 'blue', '20240212_TSP Meeting Agenda & Notes.pdf', '/home/runner/workspace/uploads/meeting-minutes/20240212_meeting.pdf', 'pdf', 'application/pdf', NULL);


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.meetings VALUES (5, 'Core Team Meeting- April 8', '2024-04-08', '20:00', NULL, 'scheduled', '2025-06-20 22:59:18.531202', 'core_team', NULL, NULL);
INSERT INTO public.meetings VALUES (7, 'Core Team Meeting 02/12/2024', '2024-02-12', 'TBD', NULL, 'scheduled', '2025-06-30 03:56:37.765827', 'core_team', NULL, NULL);


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.messages VALUES (19, 5, 'admin_1751065261945', 'Welcome to Driver Chat! Coordinate deliveries here.', '2025-07-08 23:22:37.284028', 'Admin', '2025-07-08 23:22:37.284028');
INSERT INTO public.messages VALUES (20, 6, 'admin_1751065261945', 'Welcome to Recipient Chat! Updates and support for receiving organizations.', '2025-07-08 23:22:37.284028', 'Admin', '2025-07-08 23:22:37.284028');
INSERT INTO public.messages VALUES (9, 2, 'user_backup_restored', 'Reminder meeting', '2025-06-25 18:41:31.750872', 'Admin User', '2025-07-08 21:07:51.843861');
INSERT INTO public.messages VALUES (11, 2, 'user_1751071509329_mrkw2z95z', 'anyone in yet?', '2025-07-02 22:24:34.005269', 'Team Member', '2025-07-08 21:07:51.843861');
INSERT INTO public.messages VALUES (26, 5, 'admin_1751065261945', 'Driver chat is now working! Coordination messages will appear here.', '2025-07-09 00:02:53.707994', 'System Admin', '2025-07-09 00:02:53.707994');
INSERT INTO public.messages VALUES (27, 6, 'admin_1751065261945', 'Recipient chat is now working! Communication with receiving organizations will appear here.', '2025-07-09 00:02:53.707994', 'System Admin', '2025-07-09 00:02:53.707994');
INSERT INTO public.messages VALUES (30, 3, 'admin_1751065261945', 'Test message for Marketing Committee', '2025-07-09 00:26:25.526112', 'Admin User', '2025-07-09 00:26:25.526112');
INSERT INTO public.messages VALUES (31, 101, 'user_1751071509329_mrkw2z95z', 'hi!', '2025-07-09 01:41:23.843099', 'Katie Long', '2025-07-09 01:41:23.843099');
INSERT INTO public.messages VALUES (32, 102, 'user_1751071509329_mrkw2z95z', 'hi!', '2025-07-09 01:41:30.317089', 'Katie Long', '2025-07-09 01:41:30.317089');
INSERT INTO public.messages VALUES (33, 69, 'user_1751071509329_mrkw2z95z', 'hi!', '2025-07-09 01:41:34.22351', 'Katie Long', '2025-07-09 01:41:34.22351');
INSERT INTO public.messages VALUES (34, 10, 'user_1751071509329_mrkw2z95z', 'anyone?', '2025-07-09 13:54:45.535903', 'Katie Long', '2025-07-09 13:54:45.535903');


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: project_assignments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.projects VALUES (19, 'Sandwich Project Platform Website', '', 'in_progress', NULL, 'Katie Long', 'blue', 'medium', 'technology', '2025-07-01', '', NULL, 40, NULL, NULL, 0, NULL, '2025-06-27 21:55:56.884993', '2025-06-30 03:57:28.091', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (21, 'Giving Circle Grant', '', 'completed', NULL, 'Katie Long', 'blue', 'urgent', 'fundraising', NULL, '', NULL, 0, NULL, NULL, 0, NULL, '2025-06-30 23:08:02.013434', '2025-07-02 03:35:42.177', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (22, 'Catchafire Video Creation', 'Instructional Video', 'in_progress', NULL, 'Marcy Louza', 'blue', 'high', 'general', '', '', NULL, 0, NULL, NULL, 0, NULL, '2025-07-02 03:40:04.838284', '2025-07-02 03:40:04.838284', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (4, 'Catchafire AI Training', '', 'completed', NULL, 'Marcy Louza', 'blue', 'medium', 'technology', NULL, NULL, NULL, 100, NULL, NULL, NULL, NULL, '2025-06-09 02:24:11.954073', '2025-07-02 03:41:25.304', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (18, 'Catchafire logo design for Portfolio partnership', 'Working with a graphic designer to develop a 1" round sticker to go on Portfolio Olive Oil bottles', 'in_progress', NULL, 'Christine Cooper Nowicki', 'blue', 'medium', 'fundraising', '2025-07-03', '2025-06-14', NULL, 0, NULL, NULL, 0, NULL, '2025-06-27 21:37:56.528342', '2025-06-27 21:37:56.528342', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (23, 'Catchafire Data Project', 'Produce Sheets Document to collect and analyze sandwich numbers', 'completed', NULL, 'Marcy Louza', 'blue', 'high', 'general', NULL, '', NULL, 0, NULL, NULL, 0, NULL, '2025-07-02 03:43:15.488201', '2025-07-02 03:43:51.152', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);
INSERT INTO public.projects VALUES (25, 'Successfully Updated Project Title', 'Testing the new multiple user assignment functionality', 'in_progress', NULL, 'Marcy Louza, Katie Long, Katie Long', 'blue', 'medium', 'general', '2025-07-10', NULL, NULL, 50, NULL, NULL, NULL, NULL, '2025-07-03 00:55:39.435856', '2025-07-09 14:01:01.124', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["admin_1751065261945", "user_1751071509329_mrkw2z95z"]', 'Admin User, Katie Long');
INSERT INTO public.projects VALUES (20, 'Test Sandwich Project Platform', '', 'in_progress', NULL, 'Katie Long, Marcy Louza, Stephanie Luis, Christine Cooper Nowicki, Vicki Tropauer, Kimberly Ross', 'blue', 'high', 'technology', '2025-07-11', '', NULL, 0, NULL, NULL, 0, NULL, '2025-06-30 03:59:14.140364', '2025-07-09 14:41:56.075', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', NULL);


--
-- Data for Name: project_comments; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: project_congratulations; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: project_documents; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: project_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.project_tasks VALUES (39, 'Submit request in Catchafire', 'describe the project in Catchafire and find someone qualified to complete', 'completed', 'medium', 'Christine', '2025-06-16', '2025-06-27 21:55:57.813989', '2025-06-27 21:55:57.813989', 0, 18, '2025-07-06 10:00:00', 0, NULL, NULL, NULL, NULL, 'user_1751493923615_nbcyq3am7', 'Christine');
INSERT INTO public.project_tasks VALUES (44, 'Create user login functions', '', 'completed', 'medium', '', '', '2025-06-30 02:54:30.106932', '2025-06-30 02:54:32.317', 0, 19, '2025-07-06 10:00:00', 0, NULL, NULL, NULL, NULL, 'user_1751071509329_mrkw2z95z', 'Katie Long');
INSERT INTO public.project_tasks VALUES (40, 'Create "news banner" for the site', 'News banner on the platform, “looking for leader for volunteer committee”', 'waiting', 'medium', '', '', '2025-06-27 21:56:18.742766', '2025-06-27 21:56:18.742766', 0, 19, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.project_tasks VALUES (41, 'Create Grants section', 'with q&a format from old grants', 'waiting', 'medium', '', '', '2025-06-27 21:56:41.319168', '2025-06-27 21:56:41.319168', 0, 19, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.project_tasks VALUES (43, 'Convert meeting minutes files to pdfs for web display', '', 'completed', 'medium', '', '', '2025-06-27 21:57:52.462292', '2025-06-30 03:57:27.807', 0, 19, '2025-07-06 10:00:00', 0, NULL, NULL, NULL, NULL, 'user_1751071509329_mrkw2z95z', 'Katie Long');
INSERT INTO public.project_tasks VALUES (38, 'Meeting 6/27', '', 'completed', 'medium', '', '2025-06-24', '2025-06-27 20:58:37.615626', '2025-06-30 03:58:29.806', 0, 4, '2025-07-06 10:00:00', 0, NULL, NULL, NULL, NULL, 'user_1751071509329_mrkw2z95z', 'Katie Long');
INSERT INTO public.project_tasks VALUES (42, 'Get recipient agreement and driver agreement hosted on the website', '', 'waiting', 'medium', '', '', '2025-06-27 21:57:29.279335', '2025-06-27 21:57:29.279335', 0, 19, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.project_tasks VALUES (48, 'get back first proofs', '', 'completed', 'medium', NULL, '2025-06-17', '2025-07-06 17:55:58.658736', '2025-07-06 17:55:58.658736', 0, 18, '2025-07-06 10:00:00', 0, NULL, NULL, NULL, NULL, 'user_1751493923615_nbcyq3am7', 'Christine');
INSERT INTO public.project_tasks VALUES (47, 'Christine Test Assignment', 'text describing the project - assigned to myself and will complete', 'completed', 'medium', NULL, '2025-07-07', '2025-07-06 17:51:34.56653', '2025-07-09 14:01:47.123', 0, 25, '2025-07-06 10:00:00', 0, NULL, NULL, '{user_1751493923615_nbcyq3am7}', '{"Christine Cooper Nowicki"}', 'user_1751493923615_nbcyq3am7', 'Christine');
INSERT INTO public.project_tasks VALUES (45, 'Test out direct messaging', 'Send a message to someone else on the platform and have them reply to it', 'waiting', 'medium', '', '2025-06-30T00:00:00.000+00:00', '2025-06-30 22:02:18.138732', '2025-07-09 14:41:54.911', 0, 20, NULL, 0, NULL, NULL, '{user_1751072243271_fc8jaxl6u,user_1751492211973_0pi1jdl3p,user_1751493923615_nbcyq3am7,user_1751071509329_mrkw2z95z,user_1751920534988_2cgbrae86,user_1751975120117_tltz2rc1a}', '{"Marcy Louza","Stephanie Luis","Christine Cooper Nowicki","Katie Long","Vicki Tropauer","Kimberly Ross"}', NULL, NULL);
INSERT INTO public.project_tasks VALUES (46, 'Create a task within our shared assignment project to make sure this works', '', 'pending', 'medium', NULL, '', '2025-07-06 05:02:54.951705', '2025-07-06 17:16:31.639', 0, 25, NULL, 0, NULL, NULL, '{user_1751493923615_nbcyq3am7,user_1751072243271_fc8jaxl6u,user_1751492211973_0pi1jdl3p,user_1751071509329_mrkw2z95z}', '{"Christine Cooper Nowicki","Marcy Louza","Stephanie Luis","Katie Long"}', NULL, NULL);
INSERT INTO public.project_tasks VALUES (51, 'Build work log function', '', 'in_progress', 'medium', NULL, '2025-07-09', '2025-07-09 15:02:34.381664', '2025-07-09 15:02:34.381664', 0, 19, NULL, 0, NULL, NULL, '{user_1751071509329_mrkw2z95z}', '{"Katie Long"}', NULL, NULL);
INSERT INTO public.project_tasks VALUES (49, 'ask for final edits', 'Reach out to Lori one last time and ask for input. Close out circle with Mark.', 'pending', 'medium', NULL, '2025-07-07', '2025-07-06 18:01:14.661767', '2025-07-06 18:01:14.661767', 0, 18, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.project_tasks VALUES (50, 'close out with Mark', 'Christine to ask Mark for final edits and close out the catchafire task.', 'pending', 'medium', NULL, '2025-07-11', '2025-07-06 18:04:16.454239', '2025-07-06 18:04:16.454239', 0, 18, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.project_tasks VALUES (52, 'Build suggestion portal', '', 'pending', 'urgent', NULL, '', '2025-07-09 15:02:58.919743', '2025-07-09 15:02:58.919743', 0, 19, NULL, 0, NULL, NULL, '{user_1751071509329_mrkw2z95z}', '{"Katie Long"}', NULL, NULL);


--
-- Data for Name: recipients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.recipients VALUES (19, 'Boys and Girls Club', '404-516-0938', 'kevin.johnson@uss.salvationarmy.org', 'Downtown (west side)', 'turkey, Weekly Estimate: 100', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (20, 'Community Assistance Center', '954-350-2756', 'gretty.figueroa@ourcac.org', 'Sandy Springs', 'deli only, Weekly Estimate: 200', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (21, 'Cross Cultural Ministries', '404-790-0459', NULL, 'Dunwoody (Karen)', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (22, 'Focus Recovery (Veterans Program)', '404-247-6447', NULL, 'Dunwoody (Karen)', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (23, 'Gateway Center', '404-215-6651', 'dbenton@gatewatctr.org', 'Downtown', 'deli (will take pbj if necessary), Weekly Estimate: 700-1000+', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (24, 'Giving Grace /Remerge', '678-437-2024', NULL, 'Dunwoody (Karen)', 'pb&j, Weekly Estimate: 100', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (25, 'Hope Atlanta', '404-000-0000', 'aolvey@hopeatlanta.org', 'Midtown (Ponce/Boulevard)', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (26, 'Intown Cares', '404-000-0001', 'Laura.DeGroot@intowncares.org', 'Midtown (Ponce/Boulevard)', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (27, 'Lettum Eat', '850-381-5936', 'info@lettumeat.com', 'Snellville', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (28, 'Melody (City of Atlanta/Hope Atlanta)', '470-233-2362', 'rland@hopeatlanta.org', 'Downtown', '60 deli & 60 pbj, Weekly Estimate: 120', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (29, 'Omega Support Center', '770-362-6627', 'omegaservesall@gmail.com', 'Tucker', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (30, 'St. Vincent de Paul (Outreach Program)', '404-000-0002', 'aseeley@svdpgeorgia.org', 'Chamblee', 'deli (will take pbj), Weekly Estimate: 500+', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (31, 'The Elizabeth Foundation', '404-468-6503', 'tracy@elizabethfoundation.org', 'Buckhead', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (32, 'The Shrine of The Immaculate Conception', '404-840-6267', 'tilla@catholicshrineatlanta.org', 'Downtown', 'deli and want pbj weekly, Weekly Estimate: 500 (varies)', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (33, 'The Table on Delk', '407-509-2799', 'thetableondelk@gmail.com', 'Marietta', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (34, 'The Zone (Davis Direction Foundation)', '404-437-8522', 'daniel.spinney@davisdirection.com', 'Marietta', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (35, 'Toco Hills Community Alliance', '404-375-9875', 'lisa@tocohillsalliance.org', 'Toco Hills/Emory', NULL, 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (36, 'Zaban Paradies Center', '770-687-7520', 'rnation@zabanparadiescenter.org', 'Midtown', 'deli, Weekly Estimate: 300', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (37, 'Eye Believe Foundation', '404-000-0003', NULL, NULL, 'any, Weekly Estimate: 1000-3000', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (38, 'True Worship / Angie''s Kitchen', '404-287-8292', 'helen@angieskitchen.org', NULL, 'as requested consistently', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (39, 'City of Atlanta Mayor''s Office Initiative', '404-215-6600', 'chchu@atlantaga.gov', NULL, 'by request consistently', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (40, 'Operation Peace', '404-347-4040', 'opeace@bellsouth.net', NULL, 'as needed consistently', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);
INSERT INTO public.recipients VALUES (41, 'The Goodman Group', '757-338-2668', 'thegoodmangrouporg@gmail.com', NULL, 'as requested (often)', 'active', '2025-06-08 01:52:12.437601', '2025-06-08 01:52:12.437601', NULL, NULL);


--
-- Data for Name: sandwich_collections; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sandwich_collections VALUES (2497, '2024-07-17', 'Alpharetta', 3333, '[]', '2025-06-08 17:05:45.157');
INSERT INTO public.sandwich_collections VALUES (1279, '2021-09-15', 'Alpharetta', 600, '[]', '2025-06-08 17:04:09.158');
INSERT INTO public.sandwich_collections VALUES (1285, '2021-09-22', 'Alpharetta', 790, '[]', '2025-06-08 17:04:09.615');
INSERT INTO public.sandwich_collections VALUES (1283, '2021-09-15', 'East Cobb/Roswell', 160, '[]', '2025-06-08 17:04:09.463');
INSERT INTO public.sandwich_collections VALUES (1282, '2021-09-15', 'East Cobb/Roswell', 1071, '[]', '2025-06-08 17:04:09.387');
INSERT INTO public.sandwich_collections VALUES (1284, '2021-09-15', 'Sandy Springs', 419, '[]', '2025-06-08 17:04:09.539');
INSERT INTO public.sandwich_collections VALUES (2498, '2024-07-17', 'Dunwoody/PTC', 1513, '[]', '2025-06-08 17:05:45.233');
INSERT INTO public.sandwich_collections VALUES (2500, '2024-07-17', 'Decatur', 101, '[]', '2025-06-08 17:05:45.387');
INSERT INTO public.sandwich_collections VALUES (1280, '2021-09-15', 'Oak Grove', 451, '[]', '2025-06-08 17:04:09.234');
INSERT INTO public.sandwich_collections VALUES (1292, '2021-09-29', 'Alpharetta', 594, '[]', '2025-06-08 17:04:10.146');
INSERT INTO public.sandwich_collections VALUES (1299, '2021-10-06', 'Alpharetta', 651, '[]', '2025-06-08 17:04:10.678');
INSERT INTO public.sandwich_collections VALUES (1305, '2021-10-13', 'Alpharetta', 509, '[]', '2025-06-08 17:04:11.194');
INSERT INTO public.sandwich_collections VALUES (1312, '2021-10-20', 'Alpharetta', 1005, '[]', '2025-06-08 17:04:11.727');
INSERT INTO public.sandwich_collections VALUES (1318, '2021-10-27', 'Alpharetta', 1043, '[]', '2025-06-08 17:04:12.187');
INSERT INTO public.sandwich_collections VALUES (1324, '2021-11-03', 'Alpharetta', 1247, '[]', '2025-06-08 17:04:12.642');
INSERT INTO public.sandwich_collections VALUES (1330, '2021-11-10', 'Alpharetta', 851, '[]', '2025-06-08 17:04:13.204');
INSERT INTO public.sandwich_collections VALUES (1336, '2021-11-17', 'Alpharetta', 777, '[]', '2025-06-08 17:04:13.665');
INSERT INTO public.sandwich_collections VALUES (1343, '2021-11-22', 'Alpharetta', 939, '[]', '2025-06-08 17:04:14.194');
INSERT INTO public.sandwich_collections VALUES (1349, '2021-12-01', 'Alpharetta', 540, '[]', '2025-06-08 17:04:14.651');
INSERT INTO public.sandwich_collections VALUES (1355, '2021-12-08', 'Alpharetta', 939, '[]', '2025-06-08 17:04:15.211');
INSERT INTO public.sandwich_collections VALUES (1362, '2021-12-15', 'Alpharetta', 868, '[]', '2025-06-08 17:04:15.743');
INSERT INTO public.sandwich_collections VALUES (1369, '2022-01-03', 'Alpharetta', 818, '[]', '2025-06-08 17:04:16.273');
INSERT INTO public.sandwich_collections VALUES (1372, '2022-01-05', 'Alpharetta', 438, '[]', '2025-06-08 17:04:16.501');
INSERT INTO public.sandwich_collections VALUES (1377, '2022-01-17', 'Alpharetta', 900, '[]', '2025-06-08 17:04:16.88');
INSERT INTO public.sandwich_collections VALUES (1382, '2022-01-19', 'Alpharetta', 649, '[]', '2025-06-08 17:04:17.259');
INSERT INTO public.sandwich_collections VALUES (1389, '2022-01-26', 'Alpharetta', 842, '[]', '2025-06-08 17:04:17.843');
INSERT INTO public.sandwich_collections VALUES (1387, '2022-01-19', 'East Cobb/Roswell', 351, '[]', '2025-06-08 17:04:17.691');
INSERT INTO public.sandwich_collections VALUES (1375, '2022-01-05', 'East Cobb/Roswell', 371, '[]', '2025-06-08 17:04:16.729');
INSERT INTO public.sandwich_collections VALUES (1374, '2022-01-05', 'East Cobb/Roswell', 1292, '[]', '2025-06-08 17:04:16.653');
INSERT INTO public.sandwich_collections VALUES (1367, '2021-12-15', 'East Cobb/Roswell', 558, '[]', '2025-06-08 17:04:16.122');
INSERT INTO public.sandwich_collections VALUES (1365, '2021-12-15', 'East Cobb/Roswell', 2214, '[]', '2025-06-08 17:04:15.97');
INSERT INTO public.sandwich_collections VALUES (1360, '2021-12-08', 'East Cobb/Roswell', 307, '[]', '2025-06-08 17:04:15.59');
INSERT INTO public.sandwich_collections VALUES (1358, '2021-12-08', 'East Cobb/Roswell', 1688, '[]', '2025-06-08 17:04:15.438');
INSERT INTO public.sandwich_collections VALUES (1353, '2021-12-01', 'East Cobb/Roswell', 166, '[]', '2025-06-08 17:04:14.954');
INSERT INTO public.sandwich_collections VALUES (1352, '2021-12-01', 'East Cobb/Roswell', 1585, '[]', '2025-06-08 17:04:14.878');
INSERT INTO public.sandwich_collections VALUES (1347, '2021-11-22', 'East Cobb/Roswell', 470, '[]', '2025-06-08 17:04:14.499');
INSERT INTO public.sandwich_collections VALUES (1345, '2021-11-22', 'East Cobb/Roswell', 2204, '[]', '2025-06-08 17:04:14.346');
INSERT INTO public.sandwich_collections VALUES (1339, '2021-11-17', 'East Cobb/Roswell', 1180, '[]', '2025-06-08 17:04:13.89');
INSERT INTO public.sandwich_collections VALUES (1334, '2021-11-10', 'East Cobb/Roswell', 245, '[]', '2025-06-08 17:04:13.514');
INSERT INTO public.sandwich_collections VALUES (1333, '2021-11-10', 'East Cobb/Roswell', 1231, '[]', '2025-06-08 17:04:13.438');
INSERT INTO public.sandwich_collections VALUES (1328, '2021-11-03', 'East Cobb/Roswell', 184, '[]', '2025-06-08 17:04:12.947');
INSERT INTO public.sandwich_collections VALUES (1327, '2021-11-03', 'East Cobb/Roswell', 2144, '[]', '2025-06-08 17:04:12.87');
INSERT INTO public.sandwich_collections VALUES (1322, '2021-10-27', 'East Cobb/Roswell', 130, '[]', '2025-06-08 17:04:12.491');
INSERT INTO public.sandwich_collections VALUES (1321, '2021-10-27', 'East Cobb/Roswell', 1229, '[]', '2025-06-08 17:04:12.414');
INSERT INTO public.sandwich_collections VALUES (1316, '2021-10-20', 'East Cobb/Roswell', 188, '[]', '2025-06-08 17:04:12.032');
INSERT INTO public.sandwich_collections VALUES (1315, '2021-10-20', 'East Cobb/Roswell', 1218, '[]', '2025-06-08 17:04:11.956');
INSERT INTO public.sandwich_collections VALUES (1308, '2021-10-13', 'East Cobb/Roswell', 1328, '[]', '2025-06-08 17:04:11.422');
INSERT INTO public.sandwich_collections VALUES (1303, '2021-10-06', 'East Cobb/Roswell', 126, '[]', '2025-06-08 17:04:10.982');
INSERT INTO public.sandwich_collections VALUES (1302, '2021-10-06', 'East Cobb/Roswell', 866, '[]', '2025-06-08 17:04:10.906');
INSERT INTO public.sandwich_collections VALUES (1297, '2021-09-29', 'East Cobb/Roswell', 114, '[]', '2025-06-08 17:04:10.525');
INSERT INTO public.sandwich_collections VALUES (1296, '2021-09-29', 'East Cobb/Roswell', 1855, '[]', '2025-06-08 17:04:10.449');
INSERT INTO public.sandwich_collections VALUES (1290, '2021-09-22', 'East Cobb/Roswell', 99, '[]', '2025-06-08 17:04:09.994');
INSERT INTO public.sandwich_collections VALUES (1288, '2021-09-22', 'East Cobb/Roswell', 988, '[]', '2025-06-08 17:04:09.842');
INSERT INTO public.sandwich_collections VALUES (1388, '2022-01-19', 'Sandy Springs', 162, '[]', '2025-06-08 17:04:17.767');
INSERT INTO public.sandwich_collections VALUES (1381, '2022-01-17', 'Sandy Springs', 513, '[]', '2025-06-08 17:04:17.183');
INSERT INTO public.sandwich_collections VALUES (1376, '2022-01-05', 'Sandy Springs', 1013, '[]', '2025-06-08 17:04:16.804');
INSERT INTO public.sandwich_collections VALUES (1368, '2021-12-15', 'Sandy Springs', 575, '[]', '2025-06-08 17:04:16.198');
INSERT INTO public.sandwich_collections VALUES (1361, '2021-12-08', 'Sandy Springs', 850, '[]', '2025-06-08 17:04:15.666');
INSERT INTO public.sandwich_collections VALUES (1354, '2021-12-01', 'Sandy Springs', 386, '[]', '2025-06-08 17:04:15.134');
INSERT INTO public.sandwich_collections VALUES (1342, '2021-11-17', 'Sandy Springs', 390, '[]', '2025-06-08 17:04:14.118');
INSERT INTO public.sandwich_collections VALUES (1335, '2021-11-10', 'Sandy Springs', 373, '[]', '2025-06-08 17:04:13.59');
INSERT INTO public.sandwich_collections VALUES (1329, '2021-11-03', 'Sandy Springs', 500, '[]', '2025-06-08 17:04:13.119');
INSERT INTO public.sandwich_collections VALUES (1323, '2021-10-27', 'Sandy Springs', 285, '[]', '2025-06-08 17:04:12.567');
INSERT INTO public.sandwich_collections VALUES (1317, '2021-10-20', 'Sandy Springs', 598, '[]', '2025-06-08 17:04:12.109');
INSERT INTO public.sandwich_collections VALUES (1311, '2021-10-13', 'Sandy Springs', 210, '[]', '2025-06-08 17:04:11.651');
INSERT INTO public.sandwich_collections VALUES (1304, '2021-10-06', 'Sandy Springs', 660, '[]', '2025-06-08 17:04:11.119');
INSERT INTO public.sandwich_collections VALUES (1298, '2021-09-29', 'Sandy Springs', 127, '[]', '2025-06-08 17:04:10.603');
INSERT INTO public.sandwich_collections VALUES (1291, '2021-09-22', 'Sandy Springs', 425, '[]', '2025-06-08 17:04:10.069');
INSERT INTO public.sandwich_collections VALUES (1390, '2022-01-26', 'Dunwoody/PTC', 3975, '[]', '2025-06-08 17:04:17.919');
INSERT INTO public.sandwich_collections VALUES (1384, '2022-01-19', 'Dunwoody/PTC', 2412, '[]', '2025-06-08 17:04:17.412');
INSERT INTO public.sandwich_collections VALUES (1379, '2022-01-17', 'Dunwoody/PTC', 5033, '[]', '2025-06-08 17:04:17.032');
INSERT INTO public.sandwich_collections VALUES (1373, '2022-01-05', 'Dunwoody/PTC', 3293, '[]', '2025-06-08 17:04:16.577');
INSERT INTO public.sandwich_collections VALUES (1364, '2021-12-15', 'Dunwoody/PTC', 1890, '[]', '2025-06-08 17:04:15.894');
INSERT INTO public.sandwich_collections VALUES (1357, '2021-12-08', 'Dunwoody/PTC', 2553, '[]', '2025-06-08 17:04:15.362');
INSERT INTO public.sandwich_collections VALUES (1351, '2021-12-01', 'Dunwoody/PTC', 2432, '[]', '2025-06-08 17:04:14.803');
INSERT INTO public.sandwich_collections VALUES (1344, '2021-11-22', 'Dunwoody/PTC', 2720, '[]', '2025-06-08 17:04:14.272');
INSERT INTO public.sandwich_collections VALUES (1338, '2021-11-17', 'Dunwoody/PTC', 3517, '[]', '2025-06-08 17:04:13.815');
INSERT INTO public.sandwich_collections VALUES (1326, '2021-11-03', 'Dunwoody/PTC', 2555, '[]', '2025-06-08 17:04:12.795');
INSERT INTO public.sandwich_collections VALUES (1320, '2021-10-27', 'Dunwoody/PTC', 2806, '[]', '2025-06-08 17:04:12.339');
INSERT INTO public.sandwich_collections VALUES (1314, '2021-10-20', 'Dunwoody/PTC', 1874, '[]', '2025-06-08 17:04:11.88');
INSERT INTO public.sandwich_collections VALUES (1307, '2021-10-13', 'Dunwoody/PTC', 1522, '[]', '2025-06-08 17:04:11.347');
INSERT INTO public.sandwich_collections VALUES (1301, '2021-10-06', 'Dunwoody/PTC', 2225, '[]', '2025-06-08 17:04:10.829');
INSERT INTO public.sandwich_collections VALUES (1295, '2021-09-29', 'Dunwoody/PTC', 1865, '[]', '2025-06-08 17:04:10.374');
INSERT INTO public.sandwich_collections VALUES (1287, '2021-09-22', 'Dunwoody/PTC', 2008, '[]', '2025-06-08 17:04:09.766');
INSERT INTO public.sandwich_collections VALUES (1386, '2022-01-19', 'Decatur', 566, '[]', '2025-06-08 17:04:17.614');
INSERT INTO public.sandwich_collections VALUES (1370, '2022-01-03', 'Decatur', 106, '[]', '2025-06-08 17:04:16.349');
INSERT INTO public.sandwich_collections VALUES (1366, '2021-12-15', 'Decatur', 80, '[]', '2025-06-08 17:04:16.046');
INSERT INTO public.sandwich_collections VALUES (1359, '2021-12-08', 'Decatur', 530, '[]', '2025-06-08 17:04:15.513');
INSERT INTO public.sandwich_collections VALUES (1346, '2021-11-22', 'Decatur', 10, '[]', '2025-06-08 17:04:14.422');
INSERT INTO public.sandwich_collections VALUES (1340, '2021-11-17', 'Decatur', 166, '[]', '2025-06-08 17:04:13.966');
INSERT INTO public.sandwich_collections VALUES (1309, '2021-10-13', 'Decatur', 9, '[]', '2025-06-08 17:04:11.498');
INSERT INTO public.sandwich_collections VALUES (1289, '2021-09-22', 'Decatur', 30, '[]', '2025-06-08 17:04:09.918');
INSERT INTO public.sandwich_collections VALUES (1371, '2022-01-03', 'Snellville', 120, '[]', '2025-06-08 17:04:16.425');
INSERT INTO public.sandwich_collections VALUES (1363, '2021-12-15', 'Oak Grove', 103, '[]', '2025-06-08 17:04:15.819');
INSERT INTO public.sandwich_collections VALUES (1356, '2021-12-08', 'Oak Grove', 60, '[]', '2025-06-08 17:04:15.286');
INSERT INTO public.sandwich_collections VALUES (1350, '2021-12-01', 'Oak Grove', 73, '[]', '2025-06-08 17:04:14.727');
INSERT INTO public.sandwich_collections VALUES (1337, '2021-11-17', 'Oak Grove', 82, '[]', '2025-06-08 17:04:13.74');
INSERT INTO public.sandwich_collections VALUES (1331, '2021-11-10', 'Oak Grove', 122, '[]', '2025-06-08 17:04:13.282');
INSERT INTO public.sandwich_collections VALUES (1325, '2021-11-03', 'Oak Grove', 112, '[]', '2025-06-08 17:04:12.719');
INSERT INTO public.sandwich_collections VALUES (1319, '2021-10-27', 'Oak Grove', 308, '[]', '2025-06-08 17:04:12.262');
INSERT INTO public.sandwich_collections VALUES (1313, '2021-10-20', 'Oak Grove', 40, '[]', '2025-06-08 17:04:11.804');
INSERT INTO public.sandwich_collections VALUES (1306, '2021-10-13', 'Oak Grove', 72, '[]', '2025-06-08 17:04:11.27');
INSERT INTO public.sandwich_collections VALUES (1300, '2021-10-06', 'Oak Grove', 120, '[]', '2025-06-08 17:04:10.754');
INSERT INTO public.sandwich_collections VALUES (1294, '2021-09-29', 'Oak Grove', 60, '[]', '2025-06-08 17:04:10.298');
INSERT INTO public.sandwich_collections VALUES (1286, '2021-09-22', 'Oak Grove', 48, '[]', '2025-06-08 17:04:09.69');
INSERT INTO public.sandwich_collections VALUES (1383, '2022-01-19', 'Buckhead', 263, '[]', '2025-06-08 17:04:17.335');
INSERT INTO public.sandwich_collections VALUES (1378, '2022-01-17', 'Buckhead', 225, '[]', '2025-06-08 17:04:16.956');
INSERT INTO public.sandwich_collections VALUES (1293, '2021-09-29', 'Buckhead', 273, '[]', '2025-06-08 17:04:10.222');
INSERT INTO public.sandwich_collections VALUES (1395, '2022-02-02', 'Alpharetta', 974, '[]', '2025-06-08 17:04:18.308');
INSERT INTO public.sandwich_collections VALUES (1404, '2022-02-03', 'Alpharetta', 2236, '[]', '2025-06-08 17:04:18.992');
INSERT INTO public.sandwich_collections VALUES (1413, '2022-02-04', 'Alpharetta', 1801, '[]', '2025-06-08 17:04:19.769');
INSERT INTO public.sandwich_collections VALUES (1421, '2022-02-05', 'Alpharetta', 1190, '[]', '2025-06-08 17:04:20.377');
INSERT INTO public.sandwich_collections VALUES (1429, '2022-02-06', 'Alpharetta', 1569, '[]', '2025-06-08 17:04:20.985');
INSERT INTO public.sandwich_collections VALUES (1438, '2022-02-07', 'Alpharetta', 1054, '[]', '2025-06-08 17:04:21.774');
INSERT INTO public.sandwich_collections VALUES (1447, '2022-02-08', 'Alpharetta', 2291, '[]', '2025-06-08 17:04:22.462');
INSERT INTO public.sandwich_collections VALUES (1458, '2022-02-09', 'Alpharetta', 2291, '[]', '2025-06-08 17:04:23.299');
INSERT INTO public.sandwich_collections VALUES (1469, '2022-02-10', 'Alpharetta', 1699, '[]', '2025-06-08 17:04:24.199');
INSERT INTO public.sandwich_collections VALUES (1482, '2022-02-11', 'Alpharetta', 867, '[]', '2025-06-08 17:04:25.183');
INSERT INTO public.sandwich_collections VALUES (1491, '2022-02-12', 'Alpharetta', 1134, '[]', '2025-06-08 17:04:25.87');
INSERT INTO public.sandwich_collections VALUES (1485, '2022-02-11', 'East Cobb/Roswell', 2156, '[]', '2025-06-08 17:04:25.411');
INSERT INTO public.sandwich_collections VALUES (1475, '2022-02-10', 'East Cobb/Roswell', 432, '[]', '2025-06-08 17:04:24.654');
INSERT INTO public.sandwich_collections VALUES (1473, '2022-02-10', 'East Cobb/Roswell', 1911, '[]', '2025-06-08 17:04:24.502');
INSERT INTO public.sandwich_collections VALUES (1462, '2022-02-09', 'East Cobb/Roswell', 1240, '[]', '2025-06-08 17:04:23.603');
INSERT INTO public.sandwich_collections VALUES (1463, '2022-02-09', 'East Cobb/Roswell', 432, '[]', '2025-06-08 17:04:23.678');
INSERT INTO public.sandwich_collections VALUES (1452, '2022-02-08', 'East Cobb/Roswell', 230, '[]', '2025-06-08 17:04:22.845');
INSERT INTO public.sandwich_collections VALUES (1451, '2022-02-08', 'East Cobb/Roswell', 1330, '[]', '2025-06-08 17:04:22.768');
INSERT INTO public.sandwich_collections VALUES (1443, '2022-02-07', 'East Cobb/Roswell', 773, '[]', '2025-06-08 17:04:22.154');
INSERT INTO public.sandwich_collections VALUES (1442, '2022-02-07', 'East Cobb/Roswell', 1877, '[]', '2025-06-08 17:04:22.078');
INSERT INTO public.sandwich_collections VALUES (1433, '2022-02-06', 'East Cobb/Roswell', 1809, '[]', '2025-06-08 17:04:21.288');
INSERT INTO public.sandwich_collections VALUES (1426, '2022-02-05', 'East Cobb/Roswell', 551, '[]', '2025-06-08 17:04:20.757');
INSERT INTO public.sandwich_collections VALUES (1425, '2022-02-05', 'East Cobb/Roswell', 1803, '[]', '2025-06-08 17:04:20.681');
INSERT INTO public.sandwich_collections VALUES (1418, '2022-02-04', 'East Cobb/Roswell', 462, '[]', '2025-06-08 17:04:20.148');
INSERT INTO public.sandwich_collections VALUES (1416, '2022-02-04', 'East Cobb/Roswell', 2311, '[]', '2025-06-08 17:04:19.997');
INSERT INTO public.sandwich_collections VALUES (1410, '2022-02-03', 'East Cobb/Roswell', 344, '[]', '2025-06-08 17:04:19.449');
INSERT INTO public.sandwich_collections VALUES (1408, '2022-02-03', 'East Cobb/Roswell', 1861, '[]', '2025-06-08 17:04:19.295');
INSERT INTO public.sandwich_collections VALUES (1401, '2022-02-02', 'East Cobb/Roswell', 252, '[]', '2025-06-08 17:04:18.764');
INSERT INTO public.sandwich_collections VALUES (1399, '2022-02-02', 'East Cobb/Roswell', 2011, '[]', '2025-06-08 17:04:18.612');
INSERT INTO public.sandwich_collections VALUES (1393, '2022-01-26', 'East Cobb/Roswell', 282, '[]', '2025-06-08 17:04:18.155');
INSERT INTO public.sandwich_collections VALUES (1487, '2022-02-11', 'Sandy Springs', 259, '[]', '2025-06-08 17:04:25.563');
INSERT INTO public.sandwich_collections VALUES (1476, '2022-02-10', 'Sandy Springs', 529, '[]', '2025-06-08 17:04:24.729');
INSERT INTO public.sandwich_collections VALUES (1464, '2022-02-09', 'Sandy Springs', 253, '[]', '2025-06-08 17:04:23.754');
INSERT INTO public.sandwich_collections VALUES (1453, '2022-02-08', 'Sandy Springs', 330, '[]', '2025-06-08 17:04:22.92');
INSERT INTO public.sandwich_collections VALUES (1444, '2022-02-07', 'Sandy Springs', 443, '[]', '2025-06-08 17:04:22.23');
INSERT INTO public.sandwich_collections VALUES (1436, '2022-02-06', 'Sandy Springs', 364, '[]', '2025-06-08 17:04:21.62');
INSERT INTO public.sandwich_collections VALUES (1427, '2022-02-05', 'Sandy Springs', 442, '[]', '2025-06-08 17:04:20.833');
INSERT INTO public.sandwich_collections VALUES (1419, '2022-02-04', 'Sandy Springs', 486, '[]', '2025-06-08 17:04:20.224');
INSERT INTO public.sandwich_collections VALUES (1411, '2022-02-03', 'Sandy Springs', 401, '[]', '2025-06-08 17:04:19.617');
INSERT INTO public.sandwich_collections VALUES (1402, '2022-02-02', 'Sandy Springs', 120, '[]', '2025-06-08 17:04:18.84');
INSERT INTO public.sandwich_collections VALUES (1394, '2022-01-26', 'Sandy Springs', 755, '[]', '2025-06-08 17:04:18.231');
INSERT INTO public.sandwich_collections VALUES (1488, '2022-02-11', 'Intown/Druid Hills', 275, '[]', '2025-06-08 17:04:25.639');
INSERT INTO public.sandwich_collections VALUES (1477, '2022-02-10', 'Intown/Druid Hills', 237, '[]', '2025-06-08 17:04:24.805');
INSERT INTO public.sandwich_collections VALUES (1465, '2022-02-09', 'Intown/Druid Hills', 90, '[]', '2025-06-08 17:04:23.83');
INSERT INTO public.sandwich_collections VALUES (1454, '2022-02-08', 'Intown/Druid Hills', 235, '[]', '2025-06-08 17:04:22.996');
INSERT INTO public.sandwich_collections VALUES (1445, '2022-02-07', 'Intown/Druid Hills', 102, '[]', '2025-06-08 17:04:22.311');
INSERT INTO public.sandwich_collections VALUES (1437, '2022-02-06', 'Intown/Druid Hills', 368, '[]', '2025-06-08 17:04:21.695');
INSERT INTO public.sandwich_collections VALUES (1420, '2022-02-04', 'Intown/Druid Hills', 224, '[]', '2025-06-08 17:04:20.3');
INSERT INTO public.sandwich_collections VALUES (1412, '2022-02-03', 'Intown/Druid Hills', 130, '[]', '2025-06-08 17:04:19.694');
INSERT INTO public.sandwich_collections VALUES (1403, '2022-02-02', 'Intown/Druid Hills', 185, '[]', '2025-06-08 17:04:18.916');
INSERT INTO public.sandwich_collections VALUES (1493, '2022-02-12', 'Dunwoody/PTC', 2774, '[]', '2025-06-08 17:04:26.022');
INSERT INTO public.sandwich_collections VALUES (1484, '2022-02-11', 'Dunwoody/PTC', 2267, '[]', '2025-06-08 17:04:25.334');
INSERT INTO public.sandwich_collections VALUES (1472, '2022-02-10', 'Dunwoody/PTC', 2068, '[]', '2025-06-08 17:04:24.426');
INSERT INTO public.sandwich_collections VALUES (1461, '2022-02-09', 'Dunwoody/PTC', 3471, '[]', '2025-06-08 17:04:23.527');
INSERT INTO public.sandwich_collections VALUES (1450, '2022-02-08', 'Dunwoody/PTC', 1927, '[]', '2025-06-08 17:04:22.692');
INSERT INTO public.sandwich_collections VALUES (1441, '2022-02-07', 'Dunwoody/PTC', 2844, '[]', '2025-06-08 17:04:22.003');
INSERT INTO public.sandwich_collections VALUES (1432, '2022-02-06', 'Dunwoody/PTC', 3121, '[]', '2025-06-08 17:04:21.213');
INSERT INTO public.sandwich_collections VALUES (1424, '2022-02-05', 'Dunwoody/PTC', 3564, '[]', '2025-06-08 17:04:20.605');
INSERT INTO public.sandwich_collections VALUES (1415, '2022-02-04', 'Dunwoody/PTC', 4550, '[]', '2025-06-08 17:04:19.921');
INSERT INTO public.sandwich_collections VALUES (1407, '2022-02-03', 'Dunwoody/PTC', 2341, '[]', '2025-06-08 17:04:19.22');
INSERT INTO public.sandwich_collections VALUES (1398, '2022-02-02', 'Dunwoody/PTC', 2478, '[]', '2025-06-08 17:04:18.537');
INSERT INTO public.sandwich_collections VALUES (1474, '2022-02-10', 'Decatur', 107, '[]', '2025-06-08 17:04:24.578');
INSERT INTO public.sandwich_collections VALUES (1434, '2022-02-06', 'Decatur', 68, '[]', '2025-06-08 17:04:21.364');
INSERT INTO public.sandwich_collections VALUES (1417, '2022-02-04', 'Decatur', 165, '[]', '2025-06-08 17:04:20.073');
INSERT INTO public.sandwich_collections VALUES (1409, '2022-02-03', 'Decatur', 84, '[]', '2025-06-08 17:04:19.372');
INSERT INTO public.sandwich_collections VALUES (1400, '2022-02-02', 'Decatur', 39, '[]', '2025-06-08 17:04:18.688');
INSERT INTO public.sandwich_collections VALUES (1392, '2022-01-26', 'Decatur', 28, '[]', '2025-06-08 17:04:18.074');
INSERT INTO public.sandwich_collections VALUES (1489, '2022-02-11', 'Snellville', 125, '[]', '2025-06-08 17:04:25.715');
INSERT INTO public.sandwich_collections VALUES (1478, '2022-02-10', 'Snellville', 125, '[]', '2025-06-08 17:04:24.88');
INSERT INTO public.sandwich_collections VALUES (1455, '2022-02-08', 'Snellville', 150, '[]', '2025-06-08 17:04:23.072');
INSERT INTO public.sandwich_collections VALUES (1446, '2022-02-07', 'Snellville', 80, '[]', '2025-06-08 17:04:22.387');
INSERT INTO public.sandwich_collections VALUES (1471, '2022-02-10', 'Oak Grove', 145, '[]', '2025-06-08 17:04:24.35');
INSERT INTO public.sandwich_collections VALUES (1460, '2022-02-09', 'Oak Grove', 61, '[]', '2025-06-08 17:04:23.45');
INSERT INTO public.sandwich_collections VALUES (1449, '2022-02-08', 'Oak Grove', 110, '[]', '2025-06-08 17:04:22.617');
INSERT INTO public.sandwich_collections VALUES (1440, '2022-02-07', 'Oak Grove', 287, '[]', '2025-06-08 17:04:21.927');
INSERT INTO public.sandwich_collections VALUES (1431, '2022-02-06', 'Oak Grove', 391, '[]', '2025-06-08 17:04:21.137');
INSERT INTO public.sandwich_collections VALUES (1423, '2022-02-05', 'Oak Grove', 200, '[]', '2025-06-08 17:04:20.529');
INSERT INTO public.sandwich_collections VALUES (1406, '2022-02-03', 'Oak Grove', 100, '[]', '2025-06-08 17:04:19.144');
INSERT INTO public.sandwich_collections VALUES (1397, '2022-02-02', 'Oak Grove', 239, '[]', '2025-06-08 17:04:18.461');
INSERT INTO public.sandwich_collections VALUES (1492, '2022-02-12', 'Buckhead', 282, '[]', '2025-06-08 17:04:25.946');
INSERT INTO public.sandwich_collections VALUES (1483, '2022-02-11', 'Buckhead', 125, '[]', '2025-06-08 17:04:25.258');
INSERT INTO public.sandwich_collections VALUES (1470, '2022-02-10', 'Buckhead', 616, '[]', '2025-06-08 17:04:24.275');
INSERT INTO public.sandwich_collections VALUES (1459, '2022-02-09', 'Buckhead', 516, '[]', '2025-06-08 17:04:23.374');
INSERT INTO public.sandwich_collections VALUES (1448, '2022-02-08', 'Buckhead', 638, '[]', '2025-06-08 17:04:22.538');
INSERT INTO public.sandwich_collections VALUES (1439, '2022-02-07', 'Buckhead', 486, '[]', '2025-06-08 17:04:21.85');
INSERT INTO public.sandwich_collections VALUES (1430, '2022-02-06', 'Buckhead', 1326, '[]', '2025-06-08 17:04:21.06');
INSERT INTO public.sandwich_collections VALUES (1422, '2022-02-05', 'Buckhead', 422, '[]', '2025-06-08 17:04:20.452');
INSERT INTO public.sandwich_collections VALUES (1414, '2022-02-04', 'Buckhead', 276, '[]', '2025-06-08 17:04:19.845');
INSERT INTO public.sandwich_collections VALUES (1405, '2022-02-03', 'Buckhead', 335, '[]', '2025-06-08 17:04:19.068');
INSERT INTO public.sandwich_collections VALUES (1396, '2022-02-02', 'Buckhead', 530, '[]', '2025-06-08 17:04:18.386');
INSERT INTO public.sandwich_collections VALUES (1490, '2022-02-11', 'Woodstock', 39, '[]', '2025-06-08 17:04:25.791');
INSERT INTO public.sandwich_collections VALUES (1480, '2022-02-10', 'Woodstock', 131, '[]', '2025-06-08 17:04:25.031');
INSERT INTO public.sandwich_collections VALUES (1457, '2022-02-08', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":160}]', '2025-06-08 17:04:23.223');
INSERT INTO public.sandwich_collections VALUES (1468, '2022-02-09', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1837}]', '2025-06-08 17:04:24.123');
INSERT INTO public.sandwich_collections VALUES (1503, '2022-02-13', 'Alpharetta', 2165, '[]', '2025-06-08 17:04:26.782');
INSERT INTO public.sandwich_collections VALUES (1513, '2022-02-14', 'Alpharetta', 1379, '[]', '2025-06-08 17:04:27.648');
INSERT INTO public.sandwich_collections VALUES (1524, '2022-02-15', 'Alpharetta', 1030, '[]', '2025-06-08 17:04:28.478');
INSERT INTO public.sandwich_collections VALUES (1535, '2022-05-11', 'Alpharetta', 1574, '[]', '2025-06-08 17:04:29.317');
INSERT INTO public.sandwich_collections VALUES (1544, '2022-05-18', 'Alpharetta', 1457, '[]', '2025-06-08 17:04:30.119');
INSERT INTO public.sandwich_collections VALUES (1556, '2022-05-15', 'Alpharetta', 1457, '[]', '2025-06-08 17:04:31.03');
INSERT INTO public.sandwich_collections VALUES (1568, '2022-06-01', 'Alpharetta', 634, '[]', '2025-06-08 17:04:31.945');
INSERT INTO public.sandwich_collections VALUES (1575, '2022-06-08', 'Alpharetta', 1471, '[]', '2025-06-08 17:04:32.475');
INSERT INTO public.sandwich_collections VALUES (1587, '2022-06-15', 'Alpharetta', 1232, '[]', '2025-06-08 17:04:33.464');
INSERT INTO public.sandwich_collections VALUES (1596, '2022-06-22', 'Alpharetta', 1147, '[]', '2025-06-08 17:04:34.147');
INSERT INTO public.sandwich_collections VALUES (1591, '2022-06-15', 'East Cobb/Roswell', 557, '[]', '2025-06-08 17:04:33.768');
INSERT INTO public.sandwich_collections VALUES (1580, '2022-06-08', 'East Cobb/Roswell', 453, '[]', '2025-06-08 17:04:32.932');
INSERT INTO public.sandwich_collections VALUES (1578, '2022-06-08', 'East Cobb/Roswell', 2163, '[]', '2025-06-08 17:04:32.782');
INSERT INTO public.sandwich_collections VALUES (1572, '2022-06-01', 'East Cobb/Roswell', 433, '[]', '2025-06-08 17:04:32.248');
INSERT INTO public.sandwich_collections VALUES (1571, '2022-06-01', 'East Cobb/Roswell', 1695, '[]', '2025-06-08 17:04:32.172');
INSERT INTO public.sandwich_collections VALUES (1547, '2022-05-18', 'East Cobb/Roswell', 1842, '[]', '2025-06-08 17:04:30.346');
INSERT INTO public.sandwich_collections VALUES (1549, '2022-05-18', 'East Cobb/Roswell', 165, '[]', '2025-06-08 17:04:30.499');
INSERT INTO public.sandwich_collections VALUES (1559, '2022-05-15', 'East Cobb/Roswell', 1747, '[]', '2025-06-08 17:04:31.258');
INSERT INTO public.sandwich_collections VALUES (1561, '2022-05-15', 'East Cobb/Roswell', 187, '[]', '2025-06-08 17:04:31.41');
INSERT INTO public.sandwich_collections VALUES (1540, '2022-05-11', 'East Cobb/Roswell', 699, '[]', '2025-06-08 17:04:29.696');
INSERT INTO public.sandwich_collections VALUES (1538, '2022-05-11', 'East Cobb/Roswell', 1999, '[]', '2025-06-08 17:04:29.545');
INSERT INTO public.sandwich_collections VALUES (1527, '2022-02-15', 'East Cobb/Roswell', 1570, '[]', '2025-06-08 17:04:28.707');
INSERT INTO public.sandwich_collections VALUES (1518, '2022-02-14', 'East Cobb/Roswell', 503, '[]', '2025-06-08 17:04:28.025');
INSERT INTO public.sandwich_collections VALUES (1516, '2022-02-14', 'East Cobb/Roswell', 2817, '[]', '2025-06-08 17:04:27.875');
INSERT INTO public.sandwich_collections VALUES (1507, '2022-02-13', 'East Cobb/Roswell', 829, '[]', '2025-06-08 17:04:27.193');
INSERT INTO public.sandwich_collections VALUES (1506, '2022-02-13', 'East Cobb/Roswell', 2760, '[]', '2025-06-08 17:04:27.118');
INSERT INTO public.sandwich_collections VALUES (1496, '2022-02-12', 'East Cobb/Roswell', 211, '[]', '2025-06-08 17:04:26.25');
INSERT INTO public.sandwich_collections VALUES (1581, '2022-06-08', 'Sandy Springs', 20, '[]', '2025-06-08 17:04:33.008');
INSERT INTO public.sandwich_collections VALUES (1550, '2022-05-18', 'Sandy Springs', 256, '[]', '2025-06-08 17:04:30.575');
INSERT INTO public.sandwich_collections VALUES (1562, '2022-05-15', 'Sandy Springs', 136, '[]', '2025-06-08 17:04:31.488');
INSERT INTO public.sandwich_collections VALUES (1541, '2022-05-11', 'Sandy Springs', 569, '[]', '2025-06-08 17:04:29.772');
INSERT INTO public.sandwich_collections VALUES (1530, '2022-02-15', 'Sandy Springs', 480, '[]', '2025-06-08 17:04:28.935');
INSERT INTO public.sandwich_collections VALUES (1519, '2022-02-14', 'Sandy Springs', 503, '[]', '2025-06-08 17:04:28.101');
INSERT INTO public.sandwich_collections VALUES (1508, '2022-02-13', 'Sandy Springs', 352, '[]', '2025-06-08 17:04:27.268');
INSERT INTO public.sandwich_collections VALUES (1497, '2022-02-12', 'Sandy Springs', 325, '[]', '2025-06-08 17:04:26.325');
INSERT INTO public.sandwich_collections VALUES (1582, '2022-06-08', 'Intown/Druid Hills', 270, '[]', '2025-06-08 17:04:33.084');
INSERT INTO public.sandwich_collections VALUES (1573, '2022-06-01', 'Intown/Druid Hills', 76, '[]', '2025-06-08 17:04:32.324');
INSERT INTO public.sandwich_collections VALUES (1551, '2022-05-18', 'Intown/Druid Hills', 118, '[]', '2025-06-08 17:04:30.651');
INSERT INTO public.sandwich_collections VALUES (1563, '2022-05-15', 'Intown/Druid Hills', 86, '[]', '2025-06-08 17:04:31.564');
INSERT INTO public.sandwich_collections VALUES (1542, '2022-05-11', 'Intown/Druid Hills', 86, '[]', '2025-06-08 17:04:29.848');
INSERT INTO public.sandwich_collections VALUES (1531, '2022-02-15', 'Intown/Druid Hills', 62, '[]', '2025-06-08 17:04:29.011');
INSERT INTO public.sandwich_collections VALUES (1520, '2022-02-14', 'Intown/Druid Hills', 380, '[]', '2025-06-08 17:04:28.177');
INSERT INTO public.sandwich_collections VALUES (1509, '2022-02-13', 'Intown/Druid Hills', 247, '[]', '2025-06-08 17:04:27.345');
INSERT INTO public.sandwich_collections VALUES (1498, '2022-02-12', 'Intown/Druid Hills', 112, '[]', '2025-06-08 17:04:26.401');
INSERT INTO public.sandwich_collections VALUES (1598, '2022-06-22', 'Dunwoody/PTC', 3174, '[]', '2025-06-08 17:04:34.298');
INSERT INTO public.sandwich_collections VALUES (1589, '2022-06-15', 'Dunwoody/PTC', 2032, '[]', '2025-06-08 17:04:33.616');
INSERT INTO public.sandwich_collections VALUES (1577, '2022-06-08', 'Dunwoody/PTC', 2404, '[]', '2025-06-08 17:04:32.706');
INSERT INTO public.sandwich_collections VALUES (1570, '2022-06-01', 'Dunwoody/PTC', 1855, '[]', '2025-06-08 17:04:32.096');
INSERT INTO public.sandwich_collections VALUES (1546, '2022-05-18', 'Dunwoody/PTC', 2532, '[]', '2025-06-08 17:04:30.27');
INSERT INTO public.sandwich_collections VALUES (1558, '2022-05-15', 'Dunwoody/PTC', 2415, '[]', '2025-06-08 17:04:31.182');
INSERT INTO public.sandwich_collections VALUES (1537, '2022-05-11', 'Dunwoody/PTC', 3729, '[]', '2025-06-08 17:04:29.469');
INSERT INTO public.sandwich_collections VALUES (1526, '2022-02-15', 'Dunwoody/PTC', 2707, '[]', '2025-06-08 17:04:28.631');
INSERT INTO public.sandwich_collections VALUES (1515, '2022-02-14', 'Dunwoody/PTC', 3034, '[]', '2025-06-08 17:04:27.798');
INSERT INTO public.sandwich_collections VALUES (1505, '2022-02-13', 'Dunwoody/PTC', 3490, '[]', '2025-06-08 17:04:26.933');
INSERT INTO public.sandwich_collections VALUES (1579, '2022-06-08', 'Decatur', 120, '[]', '2025-06-08 17:04:32.857');
INSERT INTO public.sandwich_collections VALUES (1548, '2022-05-18', 'Decatur', 77, '[]', '2025-06-08 17:04:30.423');
INSERT INTO public.sandwich_collections VALUES (1560, '2022-05-15', 'Decatur', 112, '[]', '2025-06-08 17:04:31.334');
INSERT INTO public.sandwich_collections VALUES (1528, '2022-02-15', 'Decatur', 195, '[]', '2025-06-08 17:04:28.782');
INSERT INTO public.sandwich_collections VALUES (1517, '2022-02-14', 'Decatur', 85, '[]', '2025-06-08 17:04:27.95');
INSERT INTO public.sandwich_collections VALUES (1495, '2022-02-12', 'Decatur', 21, '[]', '2025-06-08 17:04:26.175');
INSERT INTO public.sandwich_collections VALUES (1593, '2022-06-15', 'Snellville', 160, '[]', '2025-06-08 17:04:33.919');
INSERT INTO public.sandwich_collections VALUES (1583, '2022-06-08', 'Snellville', 170, '[]', '2025-06-08 17:04:33.161');
INSERT INTO public.sandwich_collections VALUES (1574, '2022-06-01', 'Snellville', 128, '[]', '2025-06-08 17:04:32.399');
INSERT INTO public.sandwich_collections VALUES (1552, '2022-05-18', 'Snellville', 121, '[]', '2025-06-08 17:04:30.727');
INSERT INTO public.sandwich_collections VALUES (1564, '2022-05-15', 'Snellville', 110, '[]', '2025-06-08 17:04:31.641');
INSERT INTO public.sandwich_collections VALUES (1543, '2022-05-11', 'Snellville', 115, '[]', '2025-06-08 17:04:29.924');
INSERT INTO public.sandwich_collections VALUES (1532, '2022-02-15', 'Snellville', 140, '[]', '2025-06-08 17:04:29.087');
INSERT INTO public.sandwich_collections VALUES (1521, '2022-02-14', 'Snellville', 116, '[]', '2025-06-08 17:04:28.252');
INSERT INTO public.sandwich_collections VALUES (1510, '2022-02-13', 'Snellville', 128, '[]', '2025-06-08 17:04:27.421');
INSERT INTO public.sandwich_collections VALUES (1499, '2022-02-12', 'Snellville', 105, '[]', '2025-06-08 17:04:26.477');
INSERT INTO public.sandwich_collections VALUES (1585, '2022-06-08', 'Lenox/Brookhaven', 19, '[]', '2025-06-08 17:04:33.312');
INSERT INTO public.sandwich_collections VALUES (1554, '2022-05-18', 'Lenox/Brookhaven', 208, '[]', '2025-06-08 17:04:30.879');
INSERT INTO public.sandwich_collections VALUES (1566, '2022-05-15', 'Lenox/Brookhaven', 155, '[]', '2025-06-08 17:04:31.793');
INSERT INTO public.sandwich_collections VALUES (1597, '2022-06-22', 'Buckhead', 278, '[]', '2025-06-08 17:04:34.222');
INSERT INTO public.sandwich_collections VALUES (1588, '2022-06-15', 'Buckhead', 1170, '[]', '2025-06-08 17:04:33.541');
INSERT INTO public.sandwich_collections VALUES (1576, '2022-06-08', 'Buckhead', 70, '[]', '2025-06-08 17:04:32.63');
INSERT INTO public.sandwich_collections VALUES (1569, '2022-06-01', 'Buckhead', 434, '[]', '2025-06-08 17:04:32.021');
INSERT INTO public.sandwich_collections VALUES (1545, '2022-05-18', 'Buckhead', 500, '[]', '2025-06-08 17:04:30.194');
INSERT INTO public.sandwich_collections VALUES (1557, '2022-05-15', 'Buckhead', 403, '[]', '2025-06-08 17:04:31.106');
INSERT INTO public.sandwich_collections VALUES (1536, '2022-05-11', 'Buckhead', 541, '[]', '2025-06-08 17:04:29.393');
INSERT INTO public.sandwich_collections VALUES (1525, '2022-02-15', 'Buckhead', 515, '[]', '2025-06-08 17:04:28.554');
INSERT INTO public.sandwich_collections VALUES (1514, '2022-02-14', 'Buckhead', 243, '[]', '2025-06-08 17:04:27.723');
INSERT INTO public.sandwich_collections VALUES (1504, '2022-02-13', 'Buckhead', 817, '[]', '2025-06-08 17:04:26.858');
INSERT INTO public.sandwich_collections VALUES (1501, '2022-02-12', 'Woodstock', 50, '[]', '2025-06-08 17:04:26.631');
INSERT INTO public.sandwich_collections VALUES (1502, '2022-02-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1580}]', '2025-06-08 17:04:26.707');
INSERT INTO public.sandwich_collections VALUES (1608, '2022-06-29', 'Alpharetta', 2340, '[]', '2025-06-08 17:04:35.12');
INSERT INTO public.sandwich_collections VALUES (1619, '2022-07-06', 'Alpharetta', 1144, '[]', '2025-06-08 17:04:35.957');
INSERT INTO public.sandwich_collections VALUES (1628, '2022-07-13', 'Alpharetta', 2688, '[]', '2025-06-08 17:04:36.638');
INSERT INTO public.sandwich_collections VALUES (1637, '2022-07-20', 'Alpharetta', 528, '[]', '2025-06-08 17:04:37.323');
INSERT INTO public.sandwich_collections VALUES (1648, '2022-07-27', 'Alpharetta', 1068, '[]', '2025-06-08 17:04:38.228');
INSERT INTO public.sandwich_collections VALUES (1658, '2022-08-03', 'Alpharetta', 760, '[]', '2025-06-08 17:04:38.986');
INSERT INTO public.sandwich_collections VALUES (1667, '2022-08-10', 'Alpharetta', 1697, '[]', '2025-06-08 17:04:39.774');
INSERT INTO public.sandwich_collections VALUES (1679, '2022-08-17', 'Alpharetta', 1339, '[]', '2025-06-08 17:04:40.683');
INSERT INTO public.sandwich_collections VALUES (1691, '2022-08-31', 'Alpharetta', 1310, '[]', '2025-06-08 17:04:41.593');
INSERT INTO public.sandwich_collections VALUES (1703, '2022-09-07', 'Alpharetta', 2611, '[]', '2025-06-08 17:04:42.611');
INSERT INTO public.sandwich_collections VALUES (1693, '2022-08-31', 'East Cobb/Roswell', 1321, '[]', '2025-06-08 17:04:41.744');
INSERT INTO public.sandwich_collections VALUES (1682, '2022-08-17', 'East Cobb/Roswell', 1132, '[]', '2025-06-08 17:04:40.911');
INSERT INTO public.sandwich_collections VALUES (1672, '2022-08-10', 'East Cobb/Roswell', 475, '[]', '2025-06-08 17:04:40.152');
INSERT INTO public.sandwich_collections VALUES (1670, '2022-08-10', 'East Cobb/Roswell', 1637, '[]', '2025-06-08 17:04:40.001');
INSERT INTO public.sandwich_collections VALUES (1663, '2022-08-03', 'East Cobb/Roswell', 401, '[]', '2025-06-08 17:04:39.365');
INSERT INTO public.sandwich_collections VALUES (1661, '2022-08-03', 'East Cobb/Roswell', 1845, '[]', '2025-06-08 17:04:39.214');
INSERT INTO public.sandwich_collections VALUES (1653, '2022-07-27', 'East Cobb/Roswell', 232, '[]', '2025-06-08 17:04:38.606');
INSERT INTO public.sandwich_collections VALUES (1651, '2022-07-27', 'East Cobb/Roswell', 2538, '[]', '2025-06-08 17:04:38.455');
INSERT INTO public.sandwich_collections VALUES (1641, '2022-07-20', 'East Cobb/Roswell', 272, '[]', '2025-06-08 17:04:37.694');
INSERT INTO public.sandwich_collections VALUES (1640, '2022-07-20', 'East Cobb/Roswell', 2533, '[]', '2025-06-08 17:04:37.618');
INSERT INTO public.sandwich_collections VALUES (1631, '2022-07-13', 'East Cobb/Roswell', 2168, '[]', '2025-06-08 17:04:36.865');
INSERT INTO public.sandwich_collections VALUES (1624, '2022-07-06', 'East Cobb/Roswell', 341, '[]', '2025-06-08 17:04:36.335');
INSERT INTO public.sandwich_collections VALUES (1622, '2022-07-06', 'East Cobb/Roswell', 2167, '[]', '2025-06-08 17:04:36.184');
INSERT INTO public.sandwich_collections VALUES (1612, '2022-06-29', 'East Cobb/Roswell', 591, '[]', '2025-06-08 17:04:35.426');
INSERT INTO public.sandwich_collections VALUES (1610, '2022-06-29', 'East Cobb/Roswell', 3182, '[]', '2025-06-08 17:04:35.272');
INSERT INTO public.sandwich_collections VALUES (1601, '2022-06-22', 'East Cobb/Roswell', 703, '[]', '2025-06-08 17:04:34.525');
INSERT INTO public.sandwich_collections VALUES (1696, '2022-08-31', 'Sandy Springs', 32, '[]', '2025-06-08 17:04:41.972');
INSERT INTO public.sandwich_collections VALUES (1685, '2022-08-17', 'Sandy Springs', 265, '[]', '2025-06-08 17:04:41.138');
INSERT INTO public.sandwich_collections VALUES (1673, '2022-08-10', 'Sandy Springs', 84, '[]', '2025-06-08 17:04:40.228');
INSERT INTO public.sandwich_collections VALUES (1664, '2022-08-03', 'Sandy Springs', 18, '[]', '2025-06-08 17:04:39.441');
INSERT INTO public.sandwich_collections VALUES (1642, '2022-07-20', 'Sandy Springs', 104, '[]', '2025-06-08 17:04:37.77');
INSERT INTO public.sandwich_collections VALUES (1634, '2022-07-13', 'Sandy Springs', 67, '[]', '2025-06-08 17:04:37.094');
INSERT INTO public.sandwich_collections VALUES (1625, '2022-07-06', 'Sandy Springs', 170, '[]', '2025-06-08 17:04:36.411');
INSERT INTO public.sandwich_collections VALUES (1613, '2022-06-29', 'Sandy Springs', 80, '[]', '2025-06-08 17:04:35.502');
INSERT INTO public.sandwich_collections VALUES (1602, '2022-06-22', 'Sandy Springs', 44, '[]', '2025-06-08 17:04:34.6');
INSERT INTO public.sandwich_collections VALUES (1674, '2022-08-10', 'Intown/Druid Hills', 175, '[]', '2025-06-08 17:04:40.304');
INSERT INTO public.sandwich_collections VALUES (1665, '2022-08-03', 'Intown/Druid Hills', 42, '[]', '2025-06-08 17:04:39.622');
INSERT INTO public.sandwich_collections VALUES (1654, '2022-07-27', 'Intown/Druid Hills', 90, '[]', '2025-06-08 17:04:38.682');
INSERT INTO public.sandwich_collections VALUES (1643, '2022-07-20', 'Intown/Druid Hills', 268, '[]', '2025-06-08 17:04:37.846');
INSERT INTO public.sandwich_collections VALUES (1626, '2022-07-06', 'Intown/Druid Hills', 210, '[]', '2025-06-08 17:04:36.486');
INSERT INTO public.sandwich_collections VALUES (1614, '2022-06-29', 'Intown/Druid Hills', 185, '[]', '2025-06-08 17:04:35.578');
INSERT INTO public.sandwich_collections VALUES (1603, '2022-06-22', 'Intown/Druid Hills', 235, '[]', '2025-06-08 17:04:34.675');
INSERT INTO public.sandwich_collections VALUES (1692, '2022-08-31', 'Dunwoody/PTC', 1819, '[]', '2025-06-08 17:04:41.669');
INSERT INTO public.sandwich_collections VALUES (1681, '2022-08-17', 'Dunwoody/PTC', 1818, '[]', '2025-06-08 17:04:40.835');
INSERT INTO public.sandwich_collections VALUES (1669, '2022-08-10', 'Dunwoody/PTC', 1616, '[]', '2025-06-08 17:04:39.925');
INSERT INTO public.sandwich_collections VALUES (1660, '2022-08-03', 'Dunwoody/PTC', 1319, '[]', '2025-06-08 17:04:39.138');
INSERT INTO public.sandwich_collections VALUES (1650, '2022-07-27', 'Dunwoody/PTC', 1970, '[]', '2025-06-08 17:04:38.379');
INSERT INTO public.sandwich_collections VALUES (1639, '2022-07-20', 'Dunwoody/PTC', 2046, '[]', '2025-06-08 17:04:37.475');
INSERT INTO public.sandwich_collections VALUES (1630, '2022-07-13', 'Dunwoody/PTC', 1645, '[]', '2025-06-08 17:04:36.789');
INSERT INTO public.sandwich_collections VALUES (1621, '2022-07-06', 'Dunwoody/PTC', 1067, '[]', '2025-06-08 17:04:36.108');
INSERT INTO public.sandwich_collections VALUES (1609, '2022-06-29', 'Dunwoody/PTC', 1837, '[]', '2025-06-08 17:04:35.196');
INSERT INTO public.sandwich_collections VALUES (1694, '2022-08-31', 'Decatur', 147, '[]', '2025-06-08 17:04:41.82');
INSERT INTO public.sandwich_collections VALUES (1683, '2022-08-17', 'Decatur', 79, '[]', '2025-06-08 17:04:40.987');
INSERT INTO public.sandwich_collections VALUES (1671, '2022-08-10', 'Decatur', 72, '[]', '2025-06-08 17:04:40.076');
INSERT INTO public.sandwich_collections VALUES (1662, '2022-08-03', 'Decatur', 366, '[]', '2025-06-08 17:04:39.29');
INSERT INTO public.sandwich_collections VALUES (1652, '2022-07-27', 'Decatur', 104, '[]', '2025-06-08 17:04:38.53');
INSERT INTO public.sandwich_collections VALUES (1632, '2022-07-13', 'Decatur', 66, '[]', '2025-06-08 17:04:36.941');
INSERT INTO public.sandwich_collections VALUES (1611, '2022-06-29', 'Decatur', 54, '[]', '2025-06-08 17:04:35.351');
INSERT INTO public.sandwich_collections VALUES (1600, '2022-06-22', 'Decatur', 114, '[]', '2025-06-08 17:04:34.449');
INSERT INTO public.sandwich_collections VALUES (1698, '2022-08-31', 'Snellville', 220, '[]', '2025-06-08 17:04:42.234');
INSERT INTO public.sandwich_collections VALUES (1686, '2022-08-17', 'Snellville', 175, '[]', '2025-06-08 17:04:41.215');
INSERT INTO public.sandwich_collections VALUES (1675, '2022-08-10', 'Snellville', 135, '[]', '2025-06-08 17:04:40.38');
INSERT INTO public.sandwich_collections VALUES (1666, '2022-08-03', 'Snellville', 102, '[]', '2025-06-08 17:04:39.698');
INSERT INTO public.sandwich_collections VALUES (1655, '2022-07-27', 'Snellville', 142, '[]', '2025-06-08 17:04:38.759');
INSERT INTO public.sandwich_collections VALUES (1644, '2022-07-20', 'Snellville', 172, '[]', '2025-06-08 17:04:37.922');
INSERT INTO public.sandwich_collections VALUES (1635, '2022-07-13', 'Snellville', 99, '[]', '2025-06-08 17:04:37.171');
INSERT INTO public.sandwich_collections VALUES (1627, '2022-07-06', 'Snellville', 187, '[]', '2025-06-08 17:04:36.562');
INSERT INTO public.sandwich_collections VALUES (1615, '2022-06-29', 'Snellville', 82, '[]', '2025-06-08 17:04:35.653');
INSERT INTO public.sandwich_collections VALUES (1604, '2022-06-22', 'Snellville', 104, '[]', '2025-06-08 17:04:34.752');
INSERT INTO public.sandwich_collections VALUES (1700, '2022-08-31', 'Lenox/Brookhaven', 230, '[]', '2025-06-08 17:04:42.385');
INSERT INTO public.sandwich_collections VALUES (1688, '2022-08-17', 'Lenox/Brookhaven', 60, '[]', '2025-06-08 17:04:41.366');
INSERT INTO public.sandwich_collections VALUES (1677, '2022-08-10', 'Lenox/Brookhaven', 74, '[]', '2025-06-08 17:04:40.532');
INSERT INTO public.sandwich_collections VALUES (1646, '2022-07-20', 'Lenox/Brookhaven', 70, '[]', '2025-06-08 17:04:38.075');
INSERT INTO public.sandwich_collections VALUES (1636, '2022-07-13', 'Lenox/Brookhaven', 106, '[]', '2025-06-08 17:04:37.247');
INSERT INTO public.sandwich_collections VALUES (1617, '2022-06-29', 'Lenox/Brookhaven', 197, '[]', '2025-06-08 17:04:35.805');
INSERT INTO public.sandwich_collections VALUES (1606, '2022-06-22', 'Lenox/Brookhaven', 20, '[]', '2025-06-08 17:04:34.903');
INSERT INTO public.sandwich_collections VALUES (1701, '2022-08-31', 'New Chastain', 268, '[]', '2025-06-08 17:04:42.461');
INSERT INTO public.sandwich_collections VALUES (1680, '2022-08-17', 'Buckhead', 222, '[]', '2025-06-08 17:04:40.759');
INSERT INTO public.sandwich_collections VALUES (1668, '2022-08-10', 'Buckhead', 300, '[]', '2025-06-08 17:04:39.85');
INSERT INTO public.sandwich_collections VALUES (1659, '2022-08-03', 'Buckhead', 373, '[]', '2025-06-08 17:04:39.062');
INSERT INTO public.sandwich_collections VALUES (1649, '2022-07-27', 'Buckhead', 305, '[]', '2025-06-08 17:04:38.304');
INSERT INTO public.sandwich_collections VALUES (1638, '2022-07-20', 'Buckhead', 423, '[]', '2025-06-08 17:04:37.399');
INSERT INTO public.sandwich_collections VALUES (1629, '2022-07-13', 'Buckhead', 176, '[]', '2025-06-08 17:04:36.714');
INSERT INTO public.sandwich_collections VALUES (1620, '2022-07-06', 'Buckhead', 107, '[]', '2025-06-08 17:04:36.032');
INSERT INTO public.sandwich_collections VALUES (1607, '2022-06-22', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1750}]', '2025-06-08 17:04:34.979');
INSERT INTO public.sandwich_collections VALUES (1717, '2022-09-14', 'Alpharetta', 1043, '[]', '2025-06-08 17:04:43.675');
INSERT INTO public.sandwich_collections VALUES (1731, '2022-09-21', 'Alpharetta', 2590, '[]', '2025-06-08 17:04:44.814');
INSERT INTO public.sandwich_collections VALUES (1746, '2022-09-28', 'Alpharetta', 1009, '[]', '2025-06-08 17:04:45.951');
INSERT INTO public.sandwich_collections VALUES (1757, '2022-10-05', 'Alpharetta', 1058, '[]', '2025-06-08 17:04:46.853');
INSERT INTO public.sandwich_collections VALUES (1768, '2022-10-12', 'Alpharetta', 1161, '[]', '2025-06-08 17:04:47.689');
INSERT INTO public.sandwich_collections VALUES (1779, '2022-10-19', 'Alpharetta', 1097, '[]', '2025-06-08 17:04:48.522');
INSERT INTO public.sandwich_collections VALUES (1790, '2022-10-26', 'Alpharetta', 963, '[]', '2025-06-08 17:04:49.428');
INSERT INTO public.sandwich_collections VALUES (1801, '2022-11-02', 'Alpharetta', 783, '[]', '2025-06-08 17:04:50.265');
INSERT INTO public.sandwich_collections VALUES (1803, '2022-11-02', 'East Cobb/Roswell', 1149, '[]', '2025-06-08 17:04:50.415');
INSERT INTO public.sandwich_collections VALUES (1794, '2022-10-26', 'East Cobb/Roswell', 257, '[]', '2025-06-08 17:04:49.73');
INSERT INTO public.sandwich_collections VALUES (1792, '2022-10-26', 'East Cobb/Roswell', 852, '[]', '2025-06-08 17:04:49.577');
INSERT INTO public.sandwich_collections VALUES (1783, '2022-10-19', 'East Cobb/Roswell', 468, '[]', '2025-06-08 17:04:48.825');
INSERT INTO public.sandwich_collections VALUES (1781, '2022-10-19', 'East Cobb/Roswell', 1250, '[]', '2025-06-08 17:04:48.673');
INSERT INTO public.sandwich_collections VALUES (1772, '2022-10-12', 'East Cobb/Roswell', 322, '[]', '2025-06-08 17:04:47.991');
INSERT INTO public.sandwich_collections VALUES (1770, '2022-10-12', 'East Cobb/Roswell', 1078, '[]', '2025-06-08 17:04:47.84');
INSERT INTO public.sandwich_collections VALUES (1759, '2022-10-05', 'East Cobb/Roswell', 1215, '[]', '2025-06-08 17:04:47.005');
INSERT INTO public.sandwich_collections VALUES (1750, '2022-09-28', 'East Cobb/Roswell', 374, '[]', '2025-06-08 17:04:46.254');
INSERT INTO public.sandwich_collections VALUES (1748, '2022-09-28', 'East Cobb/Roswell', 1009, '[]', '2025-06-08 17:04:46.102');
INSERT INTO public.sandwich_collections VALUES (1737, '2022-09-21', 'East Cobb/Roswell', 453, '[]', '2025-06-08 17:04:45.268');
INSERT INTO public.sandwich_collections VALUES (1735, '2022-09-21', 'East Cobb/Roswell', 1559, '[]', '2025-06-08 17:04:45.116');
INSERT INTO public.sandwich_collections VALUES (1723, '2022-09-14', 'East Cobb/Roswell', 307, '[]', '2025-06-08 17:04:44.21');
INSERT INTO public.sandwich_collections VALUES (1721, '2022-09-14', 'East Cobb/Roswell', 1235, '[]', '2025-06-08 17:04:43.978');
INSERT INTO public.sandwich_collections VALUES (1708, '2022-09-07', 'East Cobb/Roswell', 226, '[]', '2025-06-08 17:04:42.991');
INSERT INTO public.sandwich_collections VALUES (1706, '2022-09-07', 'East Cobb/Roswell', 1118, '[]', '2025-06-08 17:04:42.839');
INSERT INTO public.sandwich_collections VALUES (1806, '2022-11-02', 'Sandy Springs', 688, '[]', '2025-06-08 17:04:50.642');
INSERT INTO public.sandwich_collections VALUES (1784, '2022-10-19', 'Sandy Springs', 615, '[]', '2025-06-08 17:04:48.903');
INSERT INTO public.sandwich_collections VALUES (1773, '2022-10-12', 'Sandy Springs', 390, '[]', '2025-06-08 17:04:48.066');
INSERT INTO public.sandwich_collections VALUES (1762, '2022-10-05', 'Sandy Springs', 96, '[]', '2025-06-08 17:04:47.233');
INSERT INTO public.sandwich_collections VALUES (1751, '2022-09-28', 'Sandy Springs', 245, '[]', '2025-06-08 17:04:46.331');
INSERT INTO public.sandwich_collections VALUES (1738, '2022-09-21', 'Sandy Springs', 192, '[]', '2025-06-08 17:04:45.343');
INSERT INTO public.sandwich_collections VALUES (1724, '2022-09-14', 'Sandy Springs', 123, '[]', '2025-06-08 17:04:44.286');
INSERT INTO public.sandwich_collections VALUES (1709, '2022-09-07', 'Sandy Springs', 30, '[]', '2025-06-08 17:04:43.067');
INSERT INTO public.sandwich_collections VALUES (1807, '2022-11-02', 'Intown/Druid Hills', 567, '[]', '2025-06-08 17:04:50.718');
INSERT INTO public.sandwich_collections VALUES (1796, '2022-10-26', 'Intown/Druid Hills', 760, '[]', '2025-06-08 17:04:49.884');
INSERT INTO public.sandwich_collections VALUES (1785, '2022-10-19', 'Intown/Druid Hills', 460, '[]', '2025-06-08 17:04:48.978');
INSERT INTO public.sandwich_collections VALUES (1774, '2022-10-12', 'Intown/Druid Hills', 360, '[]', '2025-06-08 17:04:48.142');
INSERT INTO public.sandwich_collections VALUES (1763, '2022-10-05', 'Intown/Druid Hills', 534, '[]', '2025-06-08 17:04:47.309');
INSERT INTO public.sandwich_collections VALUES (1752, '2022-09-28', 'Intown/Druid Hills', 389, '[]', '2025-06-08 17:04:46.408');
INSERT INTO public.sandwich_collections VALUES (1739, '2022-09-21', 'Intown/Druid Hills', 118, '[]', '2025-06-08 17:04:45.419');
INSERT INTO public.sandwich_collections VALUES (1725, '2022-09-14', 'Intown/Druid Hills', 75, '[]', '2025-06-08 17:04:44.361');
INSERT INTO public.sandwich_collections VALUES (1710, '2022-09-07', 'Intown/Druid Hills', 106, '[]', '2025-06-08 17:04:43.143');
INSERT INTO public.sandwich_collections VALUES (1799, '2022-10-26', 'Flowery Branch', 293, '[]', '2025-06-08 17:04:50.113');
INSERT INTO public.sandwich_collections VALUES (1788, '2022-10-19', 'Flowery Branch', 191, '[]', '2025-06-08 17:04:49.277');
INSERT INTO public.sandwich_collections VALUES (1766, '2022-10-05', 'Flowery Branch', 75, '[]', '2025-06-08 17:04:47.536');
INSERT INTO public.sandwich_collections VALUES (1755, '2022-09-28', 'Flowery Branch', 100, '[]', '2025-06-08 17:04:46.701');
INSERT INTO public.sandwich_collections VALUES (1802, '2022-11-02', 'Dunwoody/PTC', 2150, '[]', '2025-06-08 17:04:50.34');
INSERT INTO public.sandwich_collections VALUES (1791, '2022-10-26', 'Dunwoody/PTC', 1414, '[]', '2025-06-08 17:04:49.503');
INSERT INTO public.sandwich_collections VALUES (1780, '2022-10-19', 'Dunwoody/PTC', 1317, '[]', '2025-06-08 17:04:48.598');
INSERT INTO public.sandwich_collections VALUES (1769, '2022-10-12', 'Dunwoody/PTC', 1579, '[]', '2025-06-08 17:04:47.765');
INSERT INTO public.sandwich_collections VALUES (1758, '2022-10-05', 'Dunwoody/PTC', 1417, '[]', '2025-06-08 17:04:46.929');
INSERT INTO public.sandwich_collections VALUES (1747, '2022-09-28', 'Dunwoody/PTC', 1373, '[]', '2025-06-08 17:04:46.026');
INSERT INTO public.sandwich_collections VALUES (1734, '2022-09-21', 'Dunwoody/PTC', 831, '[]', '2025-06-08 17:04:45.041');
INSERT INTO public.sandwich_collections VALUES (1720, '2022-09-14', 'Dunwoody/PTC', 1981, '[]', '2025-06-08 17:04:43.903');
INSERT INTO public.sandwich_collections VALUES (1705, '2022-09-07', 'Dunwoody/PTC', 1458, '[]', '2025-06-08 17:04:42.764');
INSERT INTO public.sandwich_collections VALUES (1804, '2022-11-02', 'Decatur', 267, '[]', '2025-06-08 17:04:50.491');
INSERT INTO public.sandwich_collections VALUES (1793, '2022-10-26', 'Decatur', 353, '[]', '2025-06-08 17:04:49.654');
INSERT INTO public.sandwich_collections VALUES (1782, '2022-10-19', 'Decatur', 194, '[]', '2025-06-08 17:04:48.75');
INSERT INTO public.sandwich_collections VALUES (1771, '2022-10-12', 'Decatur', 136, '[]', '2025-06-08 17:04:47.916');
INSERT INTO public.sandwich_collections VALUES (1760, '2022-10-05', 'Decatur', 394, '[]', '2025-06-08 17:04:47.082');
INSERT INTO public.sandwich_collections VALUES (1749, '2022-09-28', 'Decatur', 334, '[]', '2025-06-08 17:04:46.178');
INSERT INTO public.sandwich_collections VALUES (1736, '2022-09-21', 'Decatur', 30, '[]', '2025-06-08 17:04:45.192');
INSERT INTO public.sandwich_collections VALUES (1722, '2022-09-14', 'Decatur', 54, '[]', '2025-06-08 17:04:44.134');
INSERT INTO public.sandwich_collections VALUES (1707, '2022-09-07', 'Decatur', 190, '[]', '2025-06-08 17:04:42.915');
INSERT INTO public.sandwich_collections VALUES (1797, '2022-10-26', 'Snellville', 158, '[]', '2025-06-08 17:04:49.96');
INSERT INTO public.sandwich_collections VALUES (1786, '2022-10-19', 'Snellville', 162, '[]', '2025-06-08 17:04:49.123');
INSERT INTO public.sandwich_collections VALUES (1775, '2022-10-12', 'Snellville', 158, '[]', '2025-06-08 17:04:48.219');
INSERT INTO public.sandwich_collections VALUES (1764, '2022-10-05', 'Snellville', 201, '[]', '2025-06-08 17:04:47.384');
INSERT INTO public.sandwich_collections VALUES (1753, '2022-09-28', 'Snellville', 140, '[]', '2025-06-08 17:04:46.484');
INSERT INTO public.sandwich_collections VALUES (1740, '2022-09-21', 'Snellville', 160, '[]', '2025-06-08 17:04:45.495');
INSERT INTO public.sandwich_collections VALUES (1726, '2022-09-14', 'Snellville', 190, '[]', '2025-06-08 17:04:44.436');
INSERT INTO public.sandwich_collections VALUES (1711, '2022-09-07', 'Snellville', 150, '[]', '2025-06-08 17:04:43.219');
INSERT INTO public.sandwich_collections VALUES (1742, '2022-09-21', 'Lenox/Brookhaven', 190, '[]', '2025-06-08 17:04:45.646');
INSERT INTO public.sandwich_collections VALUES (1728, '2022-09-14', 'Lenox/Brookhaven', 160, '[]', '2025-06-08 17:04:44.588');
INSERT INTO public.sandwich_collections VALUES (1714, '2022-09-07', 'Lenox/Brookhaven', 248, '[]', '2025-06-08 17:04:43.448');
INSERT INTO public.sandwich_collections VALUES (1743, '2022-09-21', 'New Chastain', 30, '[]', '2025-06-08 17:04:45.722');
INSERT INTO public.sandwich_collections VALUES (1729, '2022-09-14', 'New Chastain', 30, '[]', '2025-06-08 17:04:44.663');
INSERT INTO public.sandwich_collections VALUES (1715, '2022-09-07', 'New Chastain', 146, '[]', '2025-06-08 17:04:43.523');
INSERT INTO public.sandwich_collections VALUES (1744, '2022-09-21', 'Glenwood Park', 178, '[]', '2025-06-08 17:04:45.798');
INSERT INTO public.sandwich_collections VALUES (1733, '2022-09-21', 'Oak Grove', 120, '[]', '2025-06-08 17:04:44.965');
INSERT INTO public.sandwich_collections VALUES (1719, '2022-09-14', 'Oak Grove', 110, '[]', '2025-06-08 17:04:43.827');
INSERT INTO public.sandwich_collections VALUES (1732, '2022-09-21', 'Buckhead', 217, '[]', '2025-06-08 17:04:44.89');
INSERT INTO public.sandwich_collections VALUES (1718, '2022-09-14', 'Buckhead', 125, '[]', '2025-06-08 17:04:43.75');
INSERT INTO public.sandwich_collections VALUES (1704, '2022-09-07', 'Buckhead', 115, '[]', '2025-06-08 17:04:42.688');
INSERT INTO public.sandwich_collections VALUES (1713, '2022-09-07', 'Woodstock', 150, '[]', '2025-06-08 17:04:43.372');
INSERT INTO public.sandwich_collections VALUES (1716, '2022-09-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1700}]', '2025-06-08 17:04:43.599');
INSERT INTO public.sandwich_collections VALUES (1812, '2022-11-09', 'Alpharetta', 1939, '[]', '2025-06-08 17:04:51.098');
INSERT INTO public.sandwich_collections VALUES (1823, '2022-11-16', 'Alpharetta', 2897, '[]', '2025-06-08 17:04:52.007');
INSERT INTO public.sandwich_collections VALUES (1834, '2022-11-30', 'Alpharetta', 1543, '[]', '2025-06-08 17:04:52.841');
INSERT INTO public.sandwich_collections VALUES (1845, '2022-12-07', 'Alpharetta', 1134, '[]', '2025-06-08 17:04:53.726');
INSERT INTO public.sandwich_collections VALUES (1856, '2022-12-14', 'Alpharetta', 1471, '[]', '2025-06-08 17:04:54.558');
INSERT INTO public.sandwich_collections VALUES (1865, '2022-12-21', 'Alpharetta', 493, '[]', '2025-06-08 17:04:55.25');
INSERT INTO public.sandwich_collections VALUES (1874, '2022-12-28', 'Alpharetta', 799, '[]', '2025-06-08 17:04:55.935');
INSERT INTO public.sandwich_collections VALUES (1883, '2023-01-04', 'Alpharetta', 818, '[]', '2025-06-08 17:04:56.693');
INSERT INTO public.sandwich_collections VALUES (1892, '2023-01-11', 'Alpharetta', 888, '[]', '2025-06-08 17:04:57.378');
INSERT INTO public.sandwich_collections VALUES (1901, '2023-01-18', 'Alpharetta', 908, '[]', '2025-06-08 17:04:58.067');
INSERT INTO public.sandwich_collections VALUES (1910, '2023-01-25', 'Alpharetta', 1025, '[]', '2025-06-08 17:04:58.751');
INSERT INTO public.sandwich_collections VALUES (1912, '2023-01-25', 'East Cobb/Roswell', 1465, '[]', '2025-06-08 17:04:58.902');
INSERT INTO public.sandwich_collections VALUES (1903, '2023-01-18', 'East Cobb/Roswell', 1614, '[]', '2025-06-08 17:04:58.217');
INSERT INTO public.sandwich_collections VALUES (1894, '2023-01-11', 'East Cobb/Roswell', 650, '[]', '2025-06-08 17:04:57.533');
INSERT INTO public.sandwich_collections VALUES (1885, '2023-01-04', 'East Cobb/Roswell', 1204, '[]', '2025-06-08 17:04:56.845');
INSERT INTO public.sandwich_collections VALUES (1877, '2022-12-28', 'East Cobb/Roswell', 140, '[]', '2025-06-08 17:04:56.164');
INSERT INTO public.sandwich_collections VALUES (1868, '2022-12-21', 'East Cobb/Roswell', 321, '[]', '2025-06-08 17:04:55.479');
INSERT INTO public.sandwich_collections VALUES (1867, '2022-12-21', 'East Cobb/Roswell', 1856, '[]', '2025-06-08 17:04:55.402');
INSERT INTO public.sandwich_collections VALUES (1860, '2022-12-14', 'East Cobb/Roswell', 530, '[]', '2025-06-08 17:04:54.863');
INSERT INTO public.sandwich_collections VALUES (1858, '2022-12-14', 'East Cobb/Roswell', 1690, '[]', '2025-06-08 17:04:54.712');
INSERT INTO public.sandwich_collections VALUES (1849, '2022-12-07', 'East Cobb/Roswell', 410, '[]', '2025-06-08 17:04:54.029');
INSERT INTO public.sandwich_collections VALUES (1847, '2022-12-07', 'East Cobb/Roswell', 1826, '[]', '2025-06-08 17:04:53.878');
INSERT INTO public.sandwich_collections VALUES (1838, '2022-11-30', 'East Cobb/Roswell', 347, '[]', '2025-06-08 17:04:53.146');
INSERT INTO public.sandwich_collections VALUES (1836, '2022-11-30', 'East Cobb/Roswell', 1497, '[]', '2025-06-08 17:04:52.993');
INSERT INTO public.sandwich_collections VALUES (1827, '2022-11-16', 'East Cobb/Roswell', 324, '[]', '2025-06-08 17:04:52.309');
INSERT INTO public.sandwich_collections VALUES (1825, '2022-11-16', 'East Cobb/Roswell', 2098, '[]', '2025-06-08 17:04:52.158');
INSERT INTO public.sandwich_collections VALUES (1814, '2022-11-09', 'East Cobb/Roswell', 2101, '[]', '2025-06-08 17:04:51.249');
INSERT INTO public.sandwich_collections VALUES (1915, '2023-01-25', 'Sandy Springs', 710, '[]', '2025-06-08 17:04:59.2');
INSERT INTO public.sandwich_collections VALUES (1906, '2023-01-18', 'Sandy Springs', 603, '[]', '2025-06-08 17:04:58.447');
INSERT INTO public.sandwich_collections VALUES (1897, '2023-01-11', 'Sandy Springs', 514, '[]', '2025-06-08 17:04:57.764');
INSERT INTO public.sandwich_collections VALUES (1888, '2023-01-04', 'Sandy Springs', 250, '[]', '2025-06-08 17:04:57.074');
INSERT INTO public.sandwich_collections VALUES (1878, '2022-12-28', 'Sandy Springs', 40, '[]', '2025-06-08 17:04:56.239');
INSERT INTO public.sandwich_collections VALUES (1869, '2022-12-21', 'Sandy Springs', 184, '[]', '2025-06-08 17:04:55.556');
INSERT INTO public.sandwich_collections VALUES (1861, '2022-12-14', 'Sandy Springs', 560, '[]', '2025-06-08 17:04:54.945');
INSERT INTO public.sandwich_collections VALUES (1850, '2022-12-07', 'Sandy Springs', 517, '[]', '2025-06-08 17:04:54.105');
INSERT INTO public.sandwich_collections VALUES (1839, '2022-11-30', 'Sandy Springs', 948, '[]', '2025-06-08 17:04:53.222');
INSERT INTO public.sandwich_collections VALUES (1828, '2022-11-16', 'Sandy Springs', 3594, '[]', '2025-06-08 17:04:52.385');
INSERT INTO public.sandwich_collections VALUES (1817, '2022-11-09', 'Sandy Springs', 644, '[]', '2025-06-08 17:04:51.476');
INSERT INTO public.sandwich_collections VALUES (1907, '2023-01-18', 'Intown/Druid Hills', 627, '[]', '2025-06-08 17:04:58.524');
INSERT INTO public.sandwich_collections VALUES (1898, '2023-01-11', 'Intown/Druid Hills', 152, '[]', '2025-06-08 17:04:57.84');
INSERT INTO public.sandwich_collections VALUES (1889, '2023-01-04', 'Intown/Druid Hills', 206, '[]', '2025-06-08 17:04:57.149');
INSERT INTO public.sandwich_collections VALUES (1879, '2022-12-28', 'Intown/Druid Hills', 40, '[]', '2025-06-08 17:04:56.314');
INSERT INTO public.sandwich_collections VALUES (1862, '2022-12-14', 'Intown/Druid Hills', 235, '[]', '2025-06-08 17:04:55.021');
INSERT INTO public.sandwich_collections VALUES (1851, '2022-12-07', 'Intown/Druid Hills', 487, '[]', '2025-06-08 17:04:54.18');
INSERT INTO public.sandwich_collections VALUES (1840, '2022-11-30', 'Intown/Druid Hills', 363, '[]', '2025-06-08 17:04:53.298');
INSERT INTO public.sandwich_collections VALUES (1829, '2022-11-16', 'Intown/Druid Hills', 950, '[]', '2025-06-08 17:04:52.461');
INSERT INTO public.sandwich_collections VALUES (1818, '2022-11-09', 'Intown/Druid Hills', 816, '[]', '2025-06-08 17:04:51.625');
INSERT INTO public.sandwich_collections VALUES (1909, '2023-01-18', 'Flowery Branch', 490, '[]', '2025-06-08 17:04:58.675');
INSERT INTO public.sandwich_collections VALUES (1900, '2023-01-11', 'Flowery Branch', 291, '[]', '2025-06-08 17:04:57.991');
INSERT INTO public.sandwich_collections VALUES (1891, '2023-01-04', 'Flowery Branch', 412, '[]', '2025-06-08 17:04:57.302');
INSERT INTO public.sandwich_collections VALUES (1881, '2022-12-28', 'Flowery Branch', 247, '[]', '2025-06-08 17:04:56.466');
INSERT INTO public.sandwich_collections VALUES (1864, '2022-12-14', 'Flowery Branch', 301, '[]', '2025-06-08 17:04:55.174');
INSERT INTO public.sandwich_collections VALUES (1854, '2022-12-07', 'Flowery Branch', 247, '[]', '2025-06-08 17:04:54.407');
INSERT INTO public.sandwich_collections VALUES (1843, '2022-11-30', 'Flowery Branch', 431, '[]', '2025-06-08 17:04:53.573');
INSERT INTO public.sandwich_collections VALUES (1832, '2022-11-16', 'Flowery Branch', 393, '[]', '2025-06-08 17:04:52.688');
INSERT INTO public.sandwich_collections VALUES (1821, '2022-11-09', 'Flowery Branch', 324, '[]', '2025-06-08 17:04:51.853');
INSERT INTO public.sandwich_collections VALUES (1810, '2022-11-02', 'Flowery Branch', 387, '[]', '2025-06-08 17:04:50.945');
INSERT INTO public.sandwich_collections VALUES (1911, '2023-01-25', 'Dunwoody/PTC', 2023, '[]', '2025-06-08 17:04:58.826');
INSERT INTO public.sandwich_collections VALUES (1902, '2023-01-18', 'Dunwoody/PTC', 1243, '[]', '2025-06-08 17:04:58.142');
INSERT INTO public.sandwich_collections VALUES (1893, '2023-01-11', 'Dunwoody/PTC', 1422, '[]', '2025-06-08 17:04:57.454');
INSERT INTO public.sandwich_collections VALUES (1884, '2023-01-04', 'Dunwoody/PTC', 1326, '[]', '2025-06-08 17:04:56.769');
INSERT INTO public.sandwich_collections VALUES (1875, '2022-12-28', 'Dunwoody/PTC', 888, '[]', '2025-06-08 17:04:56.013');
INSERT INTO public.sandwich_collections VALUES (1866, '2022-12-21', 'Dunwoody/PTC', 1204, '[]', '2025-06-08 17:04:55.326');
INSERT INTO public.sandwich_collections VALUES (1857, '2022-12-14', 'Dunwoody/PTC', 2186, '[]', '2025-06-08 17:04:54.634');
INSERT INTO public.sandwich_collections VALUES (1835, '2022-11-30', 'Dunwoody/PTC', 1156, '[]', '2025-06-08 17:04:52.917');
INSERT INTO public.sandwich_collections VALUES (1824, '2022-11-16', 'Dunwoody/PTC', 1621, '[]', '2025-06-08 17:04:52.082');
INSERT INTO public.sandwich_collections VALUES (1813, '2022-11-09', 'Dunwoody/PTC', 2705, '[]', '2025-06-08 17:04:51.173');
INSERT INTO public.sandwich_collections VALUES (1913, '2023-01-25', 'Decatur', 345, '[]', '2025-06-08 17:04:58.978');
INSERT INTO public.sandwich_collections VALUES (1904, '2023-01-18', 'Decatur', 465, '[]', '2025-06-08 17:04:58.293');
INSERT INTO public.sandwich_collections VALUES (1895, '2023-01-11', 'Decatur', 622, '[]', '2025-06-08 17:04:57.613');
INSERT INTO public.sandwich_collections VALUES (1886, '2023-01-04', 'Decatur', 161, '[]', '2025-06-08 17:04:56.921');
INSERT INTO public.sandwich_collections VALUES (1859, '2022-12-14', 'Decatur', 233, '[]', '2025-06-08 17:04:54.787');
INSERT INTO public.sandwich_collections VALUES (1848, '2022-12-07', 'Decatur', 150, '[]', '2025-06-08 17:04:53.953');
INSERT INTO public.sandwich_collections VALUES (1837, '2022-11-30', 'Decatur', 248, '[]', '2025-06-08 17:04:53.069');
INSERT INTO public.sandwich_collections VALUES (1826, '2022-11-16', 'Decatur', 625, '[]', '2025-06-08 17:04:52.234');
INSERT INTO public.sandwich_collections VALUES (1815, '2022-11-09', 'Decatur', 154, '[]', '2025-06-08 17:04:51.325');
INSERT INTO public.sandwich_collections VALUES (1908, '2023-01-18', 'Snellville', 148, '[]', '2025-06-08 17:04:58.599');
INSERT INTO public.sandwich_collections VALUES (1899, '2023-01-11', 'Snellville', 151, '[]', '2025-06-08 17:04:57.916');
INSERT INTO public.sandwich_collections VALUES (1890, '2023-01-04', 'Snellville', 106, '[]', '2025-06-08 17:04:57.225');
INSERT INTO public.sandwich_collections VALUES (1871, '2022-12-21', 'Snellville', 210, '[]', '2025-06-08 17:04:55.708');
INSERT INTO public.sandwich_collections VALUES (1863, '2022-12-14', 'Snellville', 136, '[]', '2025-06-08 17:04:55.097');
INSERT INTO public.sandwich_collections VALUES (1852, '2022-12-07', 'Snellville', 100, '[]', '2025-06-08 17:04:54.256');
INSERT INTO public.sandwich_collections VALUES (1830, '2022-11-16', 'Snellville', 142, '[]', '2025-06-08 17:04:52.537');
INSERT INTO public.sandwich_collections VALUES (1819, '2022-11-09', 'Snellville', 105, '[]', '2025-06-08 17:04:51.701');
INSERT INTO public.sandwich_collections VALUES (1811, '2022-11-02', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2437}]', '2025-06-08 17:04:51.021');
INSERT INTO public.sandwich_collections VALUES (1919, '2023-02-01', 'Alpharetta', 1471, '[]', '2025-06-08 17:04:59.507');
INSERT INTO public.sandwich_collections VALUES (1930, '2023-02-08', 'Alpharetta', 1889, '[]', '2025-06-08 17:05:00.35');
INSERT INTO public.sandwich_collections VALUES (1937, '2023-02-15', 'Alpharetta', 2637, '[]', '2025-06-08 17:05:00.879');
INSERT INTO public.sandwich_collections VALUES (1947, '2023-02-22', 'Alpharetta', 2195, '[]', '2025-06-08 17:05:01.639');
INSERT INTO public.sandwich_collections VALUES (1957, '2023-03-01', 'Alpharetta', 1251, '[]', '2025-06-08 17:05:02.496');
INSERT INTO public.sandwich_collections VALUES (1965, '2023-03-08', 'Alpharetta', 1334, '[]', '2025-06-08 17:05:03.103');
INSERT INTO public.sandwich_collections VALUES (1973, '2023-03-22', 'Alpharetta', 3005, '[]', '2025-06-08 17:05:03.708');
INSERT INTO public.sandwich_collections VALUES (1981, '2023-03-29', 'Alpharetta', 702, '[]', '2025-06-08 17:05:04.327');
INSERT INTO public.sandwich_collections VALUES (1990, '2023-04-05', 'Alpharetta', 930, '[]', '2025-06-08 17:05:05.074');
INSERT INTO public.sandwich_collections VALUES (1999, '2023-04-12', 'Alpharetta', 1034, '[]', '2025-06-08 17:05:05.753');
INSERT INTO public.sandwich_collections VALUES (2008, '2023-04-19', 'Alpharetta', 1956, '[]', '2025-06-08 17:05:06.429');
INSERT INTO public.sandwich_collections VALUES (2017, '2023-04-26', 'Alpharetta', 1077, '[]', '2025-06-08 17:05:07.108');
INSERT INTO public.sandwich_collections VALUES (2010, '2023-04-19', 'East Cobb/Roswell', 1968, '[]', '2025-06-08 17:05:06.58');
INSERT INTO public.sandwich_collections VALUES (2001, '2023-04-12', 'East Cobb/Roswell', 1078, '[]', '2025-06-08 17:05:05.902');
INSERT INTO public.sandwich_collections VALUES (1992, '2023-04-05', 'East Cobb/Roswell', 1057, '[]', '2025-06-08 17:05:05.224');
INSERT INTO public.sandwich_collections VALUES (1975, '2023-03-22', 'East Cobb/Roswell', 882, '[]', '2025-06-08 17:05:03.862');
INSERT INTO public.sandwich_collections VALUES (1967, '2023-03-08', 'East Cobb/Roswell', 1075, '[]', '2025-06-08 17:05:03.254');
INSERT INTO public.sandwich_collections VALUES (1959, '2023-03-01', 'East Cobb/Roswell', 885, '[]', '2025-06-08 17:05:02.647');
INSERT INTO public.sandwich_collections VALUES (1949, '2023-02-22', 'East Cobb/Roswell', 1513, '[]', '2025-06-08 17:05:01.796');
INSERT INTO public.sandwich_collections VALUES (1939, '2023-02-15', 'East Cobb/Roswell', 1292, '[]', '2025-06-08 17:05:01.03');
INSERT INTO public.sandwich_collections VALUES (1932, '2023-02-08', 'East Cobb/Roswell', 872, '[]', '2025-06-08 17:05:00.501');
INSERT INTO public.sandwich_collections VALUES (1921, '2023-02-01', 'East Cobb/Roswell', 2096, '[]', '2025-06-08 17:04:59.662');
INSERT INTO public.sandwich_collections VALUES (2021, '2023-04-26', 'Sandy Springs', 1263, '[]', '2025-06-08 17:05:07.409');
INSERT INTO public.sandwich_collections VALUES (2012, '2023-04-19', 'Sandy Springs', 938, '[]', '2025-06-08 17:05:06.731');
INSERT INTO public.sandwich_collections VALUES (2003, '2023-04-12', 'Sandy Springs', 747, '[]', '2025-06-08 17:05:06.053');
INSERT INTO public.sandwich_collections VALUES (1994, '2023-04-05', 'Sandy Springs', 655, '[]', '2025-06-08 17:05:05.375');
INSERT INTO public.sandwich_collections VALUES (1985, '2023-03-29', 'Sandy Springs', 1319, '[]', '2025-06-08 17:05:04.695');
INSERT INTO public.sandwich_collections VALUES (1977, '2023-03-22', 'Sandy Springs', 747, '[]', '2025-06-08 17:05:04.025');
INSERT INTO public.sandwich_collections VALUES (1969, '2023-03-08', 'Sandy Springs', 313, '[]', '2025-06-08 17:05:03.405');
INSERT INTO public.sandwich_collections VALUES (1961, '2023-03-01', 'Sandy Springs', 958, '[]', '2025-06-08 17:05:02.797');
INSERT INTO public.sandwich_collections VALUES (1951, '2023-02-22', 'Sandy Springs', 618, '[]', '2025-06-08 17:05:01.947');
INSERT INTO public.sandwich_collections VALUES (1941, '2023-02-15', 'Sandy Springs', 479, '[]', '2025-06-08 17:05:01.181');
INSERT INTO public.sandwich_collections VALUES (1934, '2023-02-08', 'Sandy Springs', 531, '[]', '2025-06-08 17:05:00.652');
INSERT INTO public.sandwich_collections VALUES (1924, '2023-02-01', 'Sandy Springs', 988, '[]', '2025-06-08 17:04:59.892');
INSERT INTO public.sandwich_collections VALUES (2022, '2023-04-26', 'Intown/Druid Hills', 531, '[]', '2025-06-08 17:05:07.484');
INSERT INTO public.sandwich_collections VALUES (2013, '2023-04-19', 'Intown/Druid Hills', 377, '[]', '2025-06-08 17:05:06.806');
INSERT INTO public.sandwich_collections VALUES (2004, '2023-04-12', 'Intown/Druid Hills', 500, '[]', '2025-06-08 17:05:06.129');
INSERT INTO public.sandwich_collections VALUES (1995, '2023-04-05', 'Intown/Druid Hills', 493, '[]', '2025-06-08 17:05:05.45');
INSERT INTO public.sandwich_collections VALUES (1986, '2023-03-29', 'Intown/Druid Hills', 1328, '[]', '2025-06-08 17:05:04.771');
INSERT INTO public.sandwich_collections VALUES (1970, '2023-03-08', 'Intown/Druid Hills', 326, '[]', '2025-06-08 17:05:03.481');
INSERT INTO public.sandwich_collections VALUES (1962, '2023-03-01', 'Intown/Druid Hills', 350, '[]', '2025-06-08 17:05:02.872');
INSERT INTO public.sandwich_collections VALUES (1952, '2023-02-22', 'Intown/Druid Hills', 792, '[]', '2025-06-08 17:05:02.117');
INSERT INTO public.sandwich_collections VALUES (1942, '2023-02-15', 'Intown/Druid Hills', 855, '[]', '2025-06-08 17:05:01.257');
INSERT INTO public.sandwich_collections VALUES (1935, '2023-02-08', 'Intown/Druid Hills', 1176, '[]', '2025-06-08 17:05:00.728');
INSERT INTO public.sandwich_collections VALUES (1925, '2023-02-01', 'Intown/Druid Hills', 762, '[]', '2025-06-08 17:04:59.968');
INSERT INTO public.sandwich_collections VALUES (1916, '2023-01-25', 'Intown/Druid Hills', 605, '[]', '2025-06-08 17:04:59.276');
INSERT INTO public.sandwich_collections VALUES (2015, '2023-04-19', 'Flowery Branch', 496, '[]', '2025-06-08 17:05:06.957');
INSERT INTO public.sandwich_collections VALUES (2006, '2023-04-12', 'Flowery Branch', 300, '[]', '2025-06-08 17:05:06.279');
INSERT INTO public.sandwich_collections VALUES (1997, '2023-04-05', 'Flowery Branch', 267, '[]', '2025-06-08 17:05:05.601');
INSERT INTO public.sandwich_collections VALUES (1988, '2023-03-29', 'Flowery Branch', 471, '[]', '2025-06-08 17:05:04.922');
INSERT INTO public.sandwich_collections VALUES (1980, '2023-03-22', 'Flowery Branch', 371, '[]', '2025-06-08 17:05:04.251');
INSERT INTO public.sandwich_collections VALUES (1972, '2023-03-08', 'Flowery Branch', 536, '[]', '2025-06-08 17:05:03.632');
INSERT INTO public.sandwich_collections VALUES (1964, '2023-03-01', 'Flowery Branch', 436, '[]', '2025-06-08 17:05:03.028');
INSERT INTO public.sandwich_collections VALUES (1955, '2023-02-22', 'Flowery Branch', 1230, '[]', '2025-06-08 17:05:02.344');
INSERT INTO public.sandwich_collections VALUES (1945, '2023-02-15', 'Flowery Branch', 305, '[]', '2025-06-08 17:05:01.488');
INSERT INTO public.sandwich_collections VALUES (1928, '2023-02-01', 'Flowery Branch', 219, '[]', '2025-06-08 17:05:00.199');
INSERT INTO public.sandwich_collections VALUES (1918, '2023-01-25', 'Flowery Branch', 300, '[]', '2025-06-08 17:04:59.427');
INSERT INTO public.sandwich_collections VALUES (2018, '2023-04-26', 'Dunwoody/PTC', 4789, '[]', '2025-06-08 17:05:07.183');
INSERT INTO public.sandwich_collections VALUES (2009, '2023-04-19', 'Dunwoody/PTC', 2946, '[]', '2025-06-08 17:05:06.505');
INSERT INTO public.sandwich_collections VALUES (2000, '2023-04-12', 'Dunwoody/PTC', 2344, '[]', '2025-06-08 17:05:05.828');
INSERT INTO public.sandwich_collections VALUES (1991, '2023-04-05', 'Dunwoody/PTC', 3763, '[]', '2025-06-08 17:05:05.149');
INSERT INTO public.sandwich_collections VALUES (1974, '2023-03-22', 'Dunwoody/PTC', 2775, '[]', '2025-06-08 17:05:03.786');
INSERT INTO public.sandwich_collections VALUES (1966, '2023-03-08', 'Dunwoody/PTC', 2572, '[]', '2025-06-08 17:05:03.179');
INSERT INTO public.sandwich_collections VALUES (1958, '2023-03-01', 'Dunwoody/PTC', 2243, '[]', '2025-06-08 17:05:02.571');
INSERT INTO public.sandwich_collections VALUES (1948, '2023-02-22', 'Dunwoody/PTC', 2462, '[]', '2025-06-08 17:05:01.721');
INSERT INTO public.sandwich_collections VALUES (1938, '2023-02-15', 'Dunwoody/PTC', 2342, '[]', '2025-06-08 17:05:00.954');
INSERT INTO public.sandwich_collections VALUES (1931, '2023-02-08', 'Dunwoody/PTC', 1488, '[]', '2025-06-08 17:05:00.426');
INSERT INTO public.sandwich_collections VALUES (1920, '2023-02-01', 'Dunwoody/PTC', 1461, '[]', '2025-06-08 17:04:59.587');
INSERT INTO public.sandwich_collections VALUES (2020, '2023-04-26', 'Decatur', 232, '[]', '2025-06-08 17:05:07.334');
INSERT INTO public.sandwich_collections VALUES (1976, '2023-03-22', 'Decatur', 433, '[]', '2025-06-08 17:05:03.946');
INSERT INTO public.sandwich_collections VALUES (1968, '2023-03-08', 'Decatur', 220, '[]', '2025-06-08 17:05:03.33');
INSERT INTO public.sandwich_collections VALUES (1960, '2023-03-01', 'Decatur', 498, '[]', '2025-06-08 17:05:02.722');
INSERT INTO public.sandwich_collections VALUES (1950, '2023-02-22', 'Decatur', 72, '[]', '2025-06-08 17:05:01.872');
INSERT INTO public.sandwich_collections VALUES (1940, '2023-02-15', 'Decatur', 269, '[]', '2025-06-08 17:05:01.106');
INSERT INTO public.sandwich_collections VALUES (1933, '2023-02-08', 'Decatur', 140, '[]', '2025-06-08 17:05:00.576');
INSERT INTO public.sandwich_collections VALUES (1922, '2023-02-01', 'Decatur', 230, '[]', '2025-06-08 17:04:59.74');
INSERT INTO public.sandwich_collections VALUES (2005, '2023-04-12', 'Snellville', 107, '[]', '2025-06-08 17:05:06.204');
INSERT INTO public.sandwich_collections VALUES (1996, '2023-04-05', 'Snellville', 594, '[]', '2025-06-08 17:05:05.525');
INSERT INTO public.sandwich_collections VALUES (1987, '2023-03-29', 'Snellville', 104, '[]', '2025-06-08 17:05:04.846');
INSERT INTO public.sandwich_collections VALUES (1979, '2023-03-22', 'Snellville', 189, '[]', '2025-06-08 17:05:04.176');
INSERT INTO public.sandwich_collections VALUES (1971, '2023-03-08', 'Snellville', 217, '[]', '2025-06-08 17:05:03.557');
INSERT INTO public.sandwich_collections VALUES (1963, '2023-03-01', 'Snellville', 159, '[]', '2025-06-08 17:05:02.95');
INSERT INTO public.sandwich_collections VALUES (1953, '2023-02-22', 'Snellville', 103, '[]', '2025-06-08 17:05:02.193');
INSERT INTO public.sandwich_collections VALUES (1943, '2023-02-15', 'Snellville', 191, '[]', '2025-06-08 17:05:01.333');
INSERT INTO public.sandwich_collections VALUES (1936, '2023-02-08', 'Snellville', 187, '[]', '2025-06-08 17:05:00.803');
INSERT INTO public.sandwich_collections VALUES (1926, '2023-02-01', 'Snellville', 183, '[]', '2025-06-08 17:05:00.043');
INSERT INTO public.sandwich_collections VALUES (1917, '2023-01-25', 'Snellville', 166, '[]', '2025-06-08 17:04:59.351');
INSERT INTO public.sandwich_collections VALUES (2026, '2023-05-03', 'Alpharetta', 1091, '[]', '2025-06-08 17:05:07.852');
INSERT INTO public.sandwich_collections VALUES (2035, '2023-05-10', 'Alpharetta', 1266, '[]', '2025-06-08 17:05:08.533');
INSERT INTO public.sandwich_collections VALUES (2044, '2023-05-17', 'Alpharetta', 622, '[]', '2025-06-08 17:05:09.217');
INSERT INTO public.sandwich_collections VALUES (2053, '2023-05-24', 'Alpharetta', 2481, '[]', '2025-06-08 17:05:09.898');
INSERT INTO public.sandwich_collections VALUES (2061, '2023-05-31', 'Alpharetta', 574, '[]', '2025-06-08 17:05:10.574');
INSERT INTO public.sandwich_collections VALUES (2070, '2023-06-07', 'Alpharetta', 1095, '[]', '2025-06-08 17:05:11.287');
INSERT INTO public.sandwich_collections VALUES (2079, '2023-06-14', 'Alpharetta', 1399, '[]', '2025-06-08 17:05:11.966');
INSERT INTO public.sandwich_collections VALUES (2088, '2023-06-21', 'Alpharetta', 1724, '[]', '2025-06-08 17:05:12.695');
INSERT INTO public.sandwich_collections VALUES (2096, '2023-06-28', 'Alpharetta', 1672, '[]', '2025-06-08 17:05:13.3');
INSERT INTO public.sandwich_collections VALUES (2104, '2023-07-11', 'Alpharetta', 2143, '[]', '2025-06-08 17:05:13.904');
INSERT INTO public.sandwich_collections VALUES (2112, '2023-07-19', 'Alpharetta', 1035, '[]', '2025-06-08 17:05:14.632');
INSERT INTO public.sandwich_collections VALUES (2120, '2023-07-26', 'Alpharetta', 2097, '[]', '2025-06-08 17:05:15.237');
INSERT INTO public.sandwich_collections VALUES (2129, '2023-08-02', 'Alpharetta', 1528, '[]', '2025-06-08 17:05:15.917');
INSERT INTO public.sandwich_collections VALUES (2114, '2023-07-19', 'East Cobb/Roswell', 1448, '[]', '2025-06-08 17:05:14.783');
INSERT INTO public.sandwich_collections VALUES (2098, '2023-06-28', 'East Cobb/Roswell', 1880, '[]', '2025-06-08 17:05:13.451');
INSERT INTO public.sandwich_collections VALUES (2090, '2023-06-21', 'East Cobb/Roswell', 1882, '[]', '2025-06-08 17:05:12.846');
INSERT INTO public.sandwich_collections VALUES (2081, '2023-06-14', 'East Cobb/Roswell', 2231, '[]', '2025-06-08 17:05:12.117');
INSERT INTO public.sandwich_collections VALUES (2072, '2023-06-07', 'East Cobb/Roswell', 2439, '[]', '2025-06-08 17:05:11.438');
INSERT INTO public.sandwich_collections VALUES (2063, '2023-05-31', 'East Cobb/Roswell', 1607, '[]', '2025-06-08 17:05:10.726');
INSERT INTO public.sandwich_collections VALUES (2055, '2023-05-24', 'East Cobb/Roswell', 1235, '[]', '2025-06-08 17:05:10.121');
INSERT INTO public.sandwich_collections VALUES (2037, '2023-05-10', 'East Cobb/Roswell', 1341, '[]', '2025-06-08 17:05:08.685');
INSERT INTO public.sandwich_collections VALUES (2028, '2023-05-03', 'East Cobb/Roswell', 1646, '[]', '2025-06-08 17:05:08.003');
INSERT INTO public.sandwich_collections VALUES (2124, '2023-07-26', 'Sandy Springs', 690, '[]', '2025-06-08 17:05:15.539');
INSERT INTO public.sandwich_collections VALUES (2115, '2023-07-19', 'Sandy Springs', 532, '[]', '2025-06-08 17:05:14.859');
INSERT INTO public.sandwich_collections VALUES (2107, '2023-07-11', 'Sandy Springs', 481, '[]', '2025-06-08 17:05:14.131');
INSERT INTO public.sandwich_collections VALUES (2100, '2023-06-28', 'Sandy Springs', 460, '[]', '2025-06-08 17:05:13.602');
INSERT INTO public.sandwich_collections VALUES (2092, '2023-06-21', 'Sandy Springs', 370, '[]', '2025-06-08 17:05:12.997');
INSERT INTO public.sandwich_collections VALUES (2083, '2023-06-14', 'Sandy Springs', 811, '[]', '2025-06-08 17:05:12.268');
INSERT INTO public.sandwich_collections VALUES (2074, '2023-06-07', 'Sandy Springs', 533, '[]', '2025-06-08 17:05:11.589');
INSERT INTO public.sandwich_collections VALUES (2065, '2023-05-31', 'Sandy Springs', 304, '[]', '2025-06-08 17:05:10.91');
INSERT INTO public.sandwich_collections VALUES (2057, '2023-05-24', 'Sandy Springs', 585, '[]', '2025-06-08 17:05:10.272');
INSERT INTO public.sandwich_collections VALUES (2048, '2023-05-17', 'Sandy Springs', 988, '[]', '2025-06-08 17:05:09.52');
INSERT INTO public.sandwich_collections VALUES (2039, '2023-05-10', 'Sandy Springs', 1165, '[]', '2025-06-08 17:05:08.837');
INSERT INTO public.sandwich_collections VALUES (2030, '2023-05-03', 'Sandy Springs', 720, '[]', '2025-06-08 17:05:08.154');
INSERT INTO public.sandwich_collections VALUES (2116, '2023-07-19', 'Intown/Druid Hills', 629, '[]', '2025-06-08 17:05:14.934');
INSERT INTO public.sandwich_collections VALUES (2108, '2023-07-11', 'Intown/Druid Hills', 656, '[]', '2025-06-08 17:05:14.206');
INSERT INTO public.sandwich_collections VALUES (2101, '2023-06-28', 'Intown/Druid Hills', 179, '[]', '2025-06-08 17:05:13.677');
INSERT INTO public.sandwich_collections VALUES (2093, '2023-06-21', 'Intown/Druid Hills', 196, '[]', '2025-06-08 17:05:13.073');
INSERT INTO public.sandwich_collections VALUES (2084, '2023-06-14', 'Intown/Druid Hills', 570, '[]', '2025-06-08 17:05:12.344');
INSERT INTO public.sandwich_collections VALUES (2075, '2023-06-07', 'Intown/Druid Hills', 560, '[]', '2025-06-08 17:05:11.664');
INSERT INTO public.sandwich_collections VALUES (2066, '2023-05-31', 'Intown/Druid Hills', 198, '[]', '2025-06-08 17:05:10.985');
INSERT INTO public.sandwich_collections VALUES (2058, '2023-05-24', 'Intown/Druid Hills', 468, '[]', '2025-06-08 17:05:10.347');
INSERT INTO public.sandwich_collections VALUES (2049, '2023-05-17', 'Intown/Druid Hills', 233, '[]', '2025-06-08 17:05:09.595');
INSERT INTO public.sandwich_collections VALUES (2040, '2023-05-10', 'Intown/Druid Hills', 218, '[]', '2025-06-08 17:05:08.912');
INSERT INTO public.sandwich_collections VALUES (2031, '2023-05-03', 'Intown/Druid Hills', 450, '[]', '2025-06-08 17:05:08.23');
INSERT INTO public.sandwich_collections VALUES (2127, '2023-07-26', 'Flowery Branch', 349, '[]', '2025-06-08 17:05:15.766');
INSERT INTO public.sandwich_collections VALUES (2118, '2023-07-19', 'Flowery Branch', 366, '[]', '2025-06-08 17:05:15.086');
INSERT INTO public.sandwich_collections VALUES (2110, '2023-07-11', 'Flowery Branch', 283, '[]', '2025-06-08 17:05:14.357');
INSERT INTO public.sandwich_collections VALUES (2094, '2023-06-21', 'Flowery Branch', 304, '[]', '2025-06-08 17:05:13.149');
INSERT INTO public.sandwich_collections VALUES (2086, '2023-06-14', 'Flowery Branch', 391, '[]', '2025-06-08 17:05:12.495');
INSERT INTO public.sandwich_collections VALUES (2077, '2023-06-07', 'Flowery Branch', 255, '[]', '2025-06-08 17:05:11.815');
INSERT INTO public.sandwich_collections VALUES (2068, '2023-05-31', 'Flowery Branch', 284, '[]', '2025-06-08 17:05:11.136');
INSERT INTO public.sandwich_collections VALUES (2059, '2023-05-24', 'Flowery Branch', 184, '[]', '2025-06-08 17:05:10.423');
INSERT INTO public.sandwich_collections VALUES (2051, '2023-05-17', 'Flowery Branch', 538, '[]', '2025-06-08 17:05:09.747');
INSERT INTO public.sandwich_collections VALUES (2042, '2023-05-10', 'Flowery Branch', 221, '[]', '2025-06-08 17:05:09.064');
INSERT INTO public.sandwich_collections VALUES (2033, '2023-05-03', 'Flowery Branch', 447, '[]', '2025-06-08 17:05:08.381');
INSERT INTO public.sandwich_collections VALUES (2121, '2023-07-26', 'Dunwoody/PTC', 1904, '[]', '2025-06-08 17:05:15.313');
INSERT INTO public.sandwich_collections VALUES (2113, '2023-07-19', 'Dunwoody/PTC', 2606, '[]', '2025-06-08 17:05:14.708');
INSERT INTO public.sandwich_collections VALUES (2105, '2023-07-11', 'Dunwoody/PTC', 2350, '[]', '2025-06-08 17:05:13.979');
INSERT INTO public.sandwich_collections VALUES (2097, '2023-06-28', 'Dunwoody/PTC', 1599, '[]', '2025-06-08 17:05:13.375');
INSERT INTO public.sandwich_collections VALUES (2089, '2023-06-21', 'Dunwoody/PTC', 2274, '[]', '2025-06-08 17:05:12.771');
INSERT INTO public.sandwich_collections VALUES (2080, '2023-06-14', 'Dunwoody/PTC', 3516, '[]', '2025-06-08 17:05:12.042');
INSERT INTO public.sandwich_collections VALUES (2071, '2023-06-07', 'Dunwoody/PTC', 2544, '[]', '2025-06-08 17:05:11.363');
INSERT INTO public.sandwich_collections VALUES (2062, '2023-05-31', 'Dunwoody/PTC', 1360, '[]', '2025-06-08 17:05:10.65');
INSERT INTO public.sandwich_collections VALUES (2054, '2023-05-24', 'Dunwoody/PTC', 2035, '[]', '2025-06-08 17:05:09.974');
INSERT INTO public.sandwich_collections VALUES (2045, '2023-05-17', 'Dunwoody/PTC', 1472, '[]', '2025-06-08 17:05:09.292');
INSERT INTO public.sandwich_collections VALUES (2036, '2023-05-10', 'Dunwoody/PTC', 3853, '[]', '2025-06-08 17:05:08.61');
INSERT INTO public.sandwich_collections VALUES (2027, '2023-05-03', 'Dunwoody/PTC', 2875, '[]', '2025-06-08 17:05:07.927');
INSERT INTO public.sandwich_collections VALUES (2123, '2023-07-26', 'Decatur', 85, '[]', '2025-06-08 17:05:15.464');
INSERT INTO public.sandwich_collections VALUES (2099, '2023-06-28', 'Decatur', 126, '[]', '2025-06-08 17:05:13.526');
INSERT INTO public.sandwich_collections VALUES (2091, '2023-06-21', 'Decatur', 100, '[]', '2025-06-08 17:05:12.922');
INSERT INTO public.sandwich_collections VALUES (2082, '2023-06-14', 'Decatur', 102, '[]', '2025-06-08 17:05:12.193');
INSERT INTO public.sandwich_collections VALUES (2073, '2023-06-07', 'Decatur', 100, '[]', '2025-06-08 17:05:11.513');
INSERT INTO public.sandwich_collections VALUES (2064, '2023-05-31', 'Decatur', 172, '[]', '2025-06-08 17:05:10.832');
INSERT INTO public.sandwich_collections VALUES (2056, '2023-05-24', 'Decatur', 321, '[]', '2025-06-08 17:05:10.197');
INSERT INTO public.sandwich_collections VALUES (2047, '2023-05-17', 'Decatur', 125, '[]', '2025-06-08 17:05:09.444');
INSERT INTO public.sandwich_collections VALUES (2029, '2023-05-03', 'Decatur', 222, '[]', '2025-06-08 17:05:08.079');
INSERT INTO public.sandwich_collections VALUES (2126, '2023-07-26', 'Snellville', 127, '[]', '2025-06-08 17:05:15.69');
INSERT INTO public.sandwich_collections VALUES (2117, '2023-07-19', 'Snellville', 94, '[]', '2025-06-08 17:05:15.01');
INSERT INTO public.sandwich_collections VALUES (2109, '2023-07-11', 'Snellville', 242, '[]', '2025-06-08 17:05:14.281');
INSERT INTO public.sandwich_collections VALUES (2102, '2023-06-28', 'Snellville', 96, '[]', '2025-06-08 17:05:13.753');
INSERT INTO public.sandwich_collections VALUES (2085, '2023-06-14', 'Snellville', 39, '[]', '2025-06-08 17:05:12.419');
INSERT INTO public.sandwich_collections VALUES (2076, '2023-06-07', 'Snellville', 138, '[]', '2025-06-08 17:05:11.74');
INSERT INTO public.sandwich_collections VALUES (2067, '2023-05-31', 'Snellville', 87, '[]', '2025-06-08 17:05:11.061');
INSERT INTO public.sandwich_collections VALUES (2050, '2023-05-17', 'Snellville', 230, '[]', '2025-06-08 17:05:09.671');
INSERT INTO public.sandwich_collections VALUES (2041, '2023-05-10', 'Snellville', 94, '[]', '2025-06-08 17:05:08.988');
INSERT INTO public.sandwich_collections VALUES (2032, '2023-05-03', 'Snellville', 84, '[]', '2025-06-08 17:05:08.306');
INSERT INTO public.sandwich_collections VALUES (2023, '2023-04-26', 'Snellville', 190, '[]', '2025-06-08 17:05:07.625');
INSERT INTO public.sandwich_collections VALUES (2137, '2023-08-09', 'Alpharetta', 1962, '[]', '2025-06-08 17:05:16.521');
INSERT INTO public.sandwich_collections VALUES (2145, '2023-08-16', 'Alpharetta', 1292, '[]', '2025-06-08 17:05:17.2');
INSERT INTO public.sandwich_collections VALUES (2154, '2023-08-24', 'Alpharetta', 1276, '[]', '2025-06-08 17:05:17.879');
INSERT INTO public.sandwich_collections VALUES (2163, '2023-08-30', 'Alpharetta', 1090, '[]', '2025-06-08 17:05:18.557');
INSERT INTO public.sandwich_collections VALUES (2172, '2023-09-06', 'Alpharetta', 2262, '[]', '2025-06-08 17:05:19.236');
INSERT INTO public.sandwich_collections VALUES (2181, '2023-09-13', 'Alpharetta', 615, '[]', '2025-06-08 17:05:20');
INSERT INTO public.sandwich_collections VALUES (2190, '2023-09-20', 'Alpharetta', 1842, '[]', '2025-06-08 17:05:20.686');
INSERT INTO public.sandwich_collections VALUES (2198, '2023-09-27', 'Alpharetta', 1922, '[]', '2025-06-08 17:05:21.298');
INSERT INTO public.sandwich_collections VALUES (2207, '2023-10-05', 'Alpharetta', 1022, '[]', '2025-06-08 17:05:21.986');
INSERT INTO public.sandwich_collections VALUES (2216, '2023-10-11', 'Alpharetta', 2187, '[]', '2025-06-08 17:05:22.776');
INSERT INTO public.sandwich_collections VALUES (2225, '2023-10-18', 'Alpharetta', 2107, '[]', '2025-06-08 17:05:23.462');
INSERT INTO public.sandwich_collections VALUES (2234, '2023-10-25', 'Alpharetta', 1339, '[]', '2025-06-08 17:05:24.147');
INSERT INTO public.sandwich_collections VALUES (2227, '2023-10-18', 'East Cobb/Roswell', 722, '[]', '2025-06-08 17:05:23.614');
INSERT INTO public.sandwich_collections VALUES (2209, '2023-10-05', 'East Cobb/Roswell', 1147, '[]', '2025-06-08 17:05:22.139');
INSERT INTO public.sandwich_collections VALUES (2200, '2023-09-27', 'East Cobb/Roswell', 869, '[]', '2025-06-08 17:05:21.451');
INSERT INTO public.sandwich_collections VALUES (2192, '2023-09-20', 'East Cobb/Roswell', 1614, '[]', '2025-06-08 17:05:20.842');
INSERT INTO public.sandwich_collections VALUES (2183, '2023-09-13', 'East Cobb/Roswell', 1605, '[]', '2025-06-08 17:05:20.152');
INSERT INTO public.sandwich_collections VALUES (2174, '2023-09-06', 'East Cobb/Roswell', 1060, '[]', '2025-06-08 17:05:19.388');
INSERT INTO public.sandwich_collections VALUES (2165, '2023-08-30', 'East Cobb/Roswell', 1095, '[]', '2025-06-08 17:05:18.708');
INSERT INTO public.sandwich_collections VALUES (2147, '2023-08-16', 'East Cobb/Roswell', 1570, '[]', '2025-06-08 17:05:17.351');
INSERT INTO public.sandwich_collections VALUES (2139, '2023-08-09', 'East Cobb/Roswell', 1105, '[]', '2025-06-08 17:05:16.672');
INSERT INTO public.sandwich_collections VALUES (2131, '2023-08-02', 'East Cobb/Roswell', 862, '[]', '2025-06-08 17:05:16.068');
INSERT INTO public.sandwich_collections VALUES (2229, '2023-10-18', 'Sandy Springs', 1159, '[]', '2025-06-08 17:05:23.768');
INSERT INTO public.sandwich_collections VALUES (2220, '2023-10-11', 'Sandy Springs', 444, '[]', '2025-06-08 17:05:23.08');
INSERT INTO public.sandwich_collections VALUES (2211, '2023-10-05', 'Sandy Springs', 589, '[]', '2025-06-08 17:05:22.292');
INSERT INTO public.sandwich_collections VALUES (2202, '2023-09-27', 'Sandy Springs', 827, '[]', '2025-06-08 17:05:21.604');
INSERT INTO public.sandwich_collections VALUES (2193, '2023-09-20', 'Sandy Springs', 495, '[]', '2025-06-08 17:05:20.918');
INSERT INTO public.sandwich_collections VALUES (2185, '2023-09-13', 'Sandy Springs', 888, '[]', '2025-06-08 17:05:20.304');
INSERT INTO public.sandwich_collections VALUES (2176, '2023-09-06', 'Sandy Springs', 305, '[]', '2025-06-08 17:05:19.617');
INSERT INTO public.sandwich_collections VALUES (2167, '2023-08-30', 'Sandy Springs', 459, '[]', '2025-06-08 17:05:18.859');
INSERT INTO public.sandwich_collections VALUES (2158, '2023-08-24', 'Sandy Springs', 579, '[]', '2025-06-08 17:05:18.18');
INSERT INTO public.sandwich_collections VALUES (2140, '2023-08-09', 'Sandy Springs', 457, '[]', '2025-06-08 17:05:16.747');
INSERT INTO public.sandwich_collections VALUES (2132, '2023-08-02', 'Sandy Springs', 522, '[]', '2025-06-08 17:05:16.143');
INSERT INTO public.sandwich_collections VALUES (2230, '2023-10-18', 'Intown/Druid Hills', 751, '[]', '2025-06-08 17:05:23.844');
INSERT INTO public.sandwich_collections VALUES (2221, '2023-10-11', 'Intown/Druid Hills', 580, '[]', '2025-06-08 17:05:23.156');
INSERT INTO public.sandwich_collections VALUES (2212, '2023-10-05', 'Intown/Druid Hills', 395, '[]', '2025-06-08 17:05:22.368');
INSERT INTO public.sandwich_collections VALUES (2203, '2023-09-27', 'Intown/Druid Hills', 635, '[]', '2025-06-08 17:05:21.681');
INSERT INTO public.sandwich_collections VALUES (2194, '2023-09-20', 'Intown/Druid Hills', 437, '[]', '2025-06-08 17:05:20.993');
INSERT INTO public.sandwich_collections VALUES (2186, '2023-09-13', 'Intown/Druid Hills', 746, '[]', '2025-06-08 17:05:20.381');
INSERT INTO public.sandwich_collections VALUES (2177, '2023-09-06', 'Intown/Druid Hills', 400, '[]', '2025-06-08 17:05:19.693');
INSERT INTO public.sandwich_collections VALUES (2168, '2023-08-30', 'Intown/Druid Hills', 178, '[]', '2025-06-08 17:05:18.934');
INSERT INTO public.sandwich_collections VALUES (2159, '2023-08-24', 'Intown/Druid Hills', 237, '[]', '2025-06-08 17:05:18.255');
INSERT INTO public.sandwich_collections VALUES (2150, '2023-08-16', 'Intown/Druid Hills', 245, '[]', '2025-06-08 17:05:17.577');
INSERT INTO public.sandwich_collections VALUES (2141, '2023-08-09', 'Intown/Druid Hills', 362, '[]', '2025-06-08 17:05:16.824');
INSERT INTO public.sandwich_collections VALUES (2133, '2023-08-02', 'Intown/Druid Hills', 214, '[]', '2025-06-08 17:05:16.219');
INSERT INTO public.sandwich_collections VALUES (2232, '2023-10-18', 'Flowery Branch', 205, '[]', '2025-06-08 17:05:23.996');
INSERT INTO public.sandwich_collections VALUES (2223, '2023-10-11', 'Flowery Branch', 240, '[]', '2025-06-08 17:05:23.309');
INSERT INTO public.sandwich_collections VALUES (2214, '2023-10-05', 'Flowery Branch', 409, '[]', '2025-06-08 17:05:22.622');
INSERT INTO public.sandwich_collections VALUES (2205, '2023-09-27', 'Flowery Branch', 438, '[]', '2025-06-08 17:05:21.834');
INSERT INTO public.sandwich_collections VALUES (2188, '2023-09-13', 'Flowery Branch', 200, '[]', '2025-06-08 17:05:20.533');
INSERT INTO public.sandwich_collections VALUES (2179, '2023-09-06', 'Flowery Branch', 249, '[]', '2025-06-08 17:05:19.845');
INSERT INTO public.sandwich_collections VALUES (2170, '2023-08-30', 'Flowery Branch', 349, '[]', '2025-06-08 17:05:19.085');
INSERT INTO public.sandwich_collections VALUES (2161, '2023-08-24', 'Flowery Branch', 346, '[]', '2025-06-08 17:05:18.406');
INSERT INTO public.sandwich_collections VALUES (2152, '2023-08-16', 'Flowery Branch', 190, '[]', '2025-06-08 17:05:17.728');
INSERT INTO public.sandwich_collections VALUES (2143, '2023-08-09', 'Flowery Branch', 206, '[]', '2025-06-08 17:05:16.975');
INSERT INTO public.sandwich_collections VALUES (2135, '2023-08-02', 'Flowery Branch', 235, '[]', '2025-06-08 17:05:16.37');
INSERT INTO public.sandwich_collections VALUES (2235, '2023-10-25', 'Dunwoody/PTC', 1349, '[]', '2025-06-08 17:05:24.223');
INSERT INTO public.sandwich_collections VALUES (2226, '2023-10-18', 'Dunwoody/PTC', 1800, '[]', '2025-06-08 17:05:23.537');
INSERT INTO public.sandwich_collections VALUES (2217, '2023-10-11', 'Dunwoody/PTC', 1127, '[]', '2025-06-08 17:05:22.851');
INSERT INTO public.sandwich_collections VALUES (2208, '2023-10-05', 'Dunwoody/PTC', 2880, '[]', '2025-06-08 17:05:22.062');
INSERT INTO public.sandwich_collections VALUES (2199, '2023-09-27', 'Dunwoody/PTC', 1520, '[]', '2025-06-08 17:05:21.375');
INSERT INTO public.sandwich_collections VALUES (2191, '2023-09-20', 'Dunwoody/PTC', 2138, '[]', '2025-06-08 17:05:20.765');
INSERT INTO public.sandwich_collections VALUES (2182, '2023-09-13', 'Dunwoody/PTC', 2090, '[]', '2025-06-08 17:05:20.076');
INSERT INTO public.sandwich_collections VALUES (2173, '2023-09-06', 'Dunwoody/PTC', 1881, '[]', '2025-06-08 17:05:19.311');
INSERT INTO public.sandwich_collections VALUES (2164, '2023-08-30', 'Dunwoody/PTC', 1182, '[]', '2025-06-08 17:05:18.633');
INSERT INTO public.sandwich_collections VALUES (2155, '2023-08-24', 'Dunwoody/PTC', 1650, '[]', '2025-06-08 17:05:17.954');
INSERT INTO public.sandwich_collections VALUES (2146, '2023-08-16', 'Dunwoody/PTC', 2218, '[]', '2025-06-08 17:05:17.276');
INSERT INTO public.sandwich_collections VALUES (2130, '2023-08-02', 'Dunwoody/PTC', 2480, '[]', '2025-06-08 17:05:15.992');
INSERT INTO public.sandwich_collections VALUES (2228, '2023-10-18', 'Decatur', 130, '[]', '2025-06-08 17:05:23.69');
INSERT INTO public.sandwich_collections VALUES (2219, '2023-10-11', 'Decatur', 92, '[]', '2025-06-08 17:05:23.004');
INSERT INTO public.sandwich_collections VALUES (2210, '2023-10-05', 'Decatur', 125, '[]', '2025-06-08 17:05:22.215');
INSERT INTO public.sandwich_collections VALUES (2201, '2023-09-27', 'Decatur', 142, '[]', '2025-06-08 17:05:21.527');
INSERT INTO public.sandwich_collections VALUES (2184, '2023-09-13', 'Decatur', 82, '[]', '2025-06-08 17:05:20.228');
INSERT INTO public.sandwich_collections VALUES (2175, '2023-09-06', 'Decatur', 92, '[]', '2025-06-08 17:05:19.464');
INSERT INTO public.sandwich_collections VALUES (2166, '2023-08-30', 'Decatur', 106, '[]', '2025-06-08 17:05:18.783');
INSERT INTO public.sandwich_collections VALUES (2157, '2023-08-24', 'Decatur', 97, '[]', '2025-06-08 17:05:18.105');
INSERT INTO public.sandwich_collections VALUES (2148, '2023-08-16', 'Decatur', 66, '[]', '2025-06-08 17:05:17.427');
INSERT INTO public.sandwich_collections VALUES (2231, '2023-10-18', 'Snellville', 126, '[]', '2025-06-08 17:05:23.92');
INSERT INTO public.sandwich_collections VALUES (2222, '2023-10-11', 'Snellville', 107, '[]', '2025-06-08 17:05:23.233');
INSERT INTO public.sandwich_collections VALUES (2213, '2023-10-05', 'Snellville', 171, '[]', '2025-06-08 17:05:22.444');
INSERT INTO public.sandwich_collections VALUES (2204, '2023-09-27', 'Snellville', 113, '[]', '2025-06-08 17:05:21.757');
INSERT INTO public.sandwich_collections VALUES (2195, '2023-09-20', 'Snellville', 109, '[]', '2025-06-08 17:05:21.07');
INSERT INTO public.sandwich_collections VALUES (2187, '2023-09-13', 'Snellville', 228, '[]', '2025-06-08 17:05:20.457');
INSERT INTO public.sandwich_collections VALUES (2178, '2023-09-06', 'Snellville', 80, '[]', '2025-06-08 17:05:19.768');
INSERT INTO public.sandwich_collections VALUES (2169, '2023-08-30', 'Snellville', 116, '[]', '2025-06-08 17:05:19.01');
INSERT INTO public.sandwich_collections VALUES (2151, '2023-08-16', 'Snellville', 162, '[]', '2025-06-08 17:05:17.653');
INSERT INTO public.sandwich_collections VALUES (2142, '2023-08-09', 'Snellville', 230, '[]', '2025-06-08 17:05:16.899');
INSERT INTO public.sandwich_collections VALUES (2134, '2023-08-02', 'Snellville', 128, '[]', '2025-06-08 17:05:16.294');
INSERT INTO public.sandwich_collections VALUES (2136, '2023-08-02', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":555}]', '2025-06-08 17:05:16.445');
INSERT INTO public.sandwich_collections VALUES (2243, '2023-11-01', 'Alpharetta', 781, '[]', '2025-06-08 17:05:24.833');
INSERT INTO public.sandwich_collections VALUES (2252, '2023-11-08', 'Alpharetta', 2028, '[]', '2025-06-08 17:05:25.623');
INSERT INTO public.sandwich_collections VALUES (2260, '2023-11-15', 'Alpharetta', 1722, '[]', '2025-06-08 17:05:26.233');
INSERT INTO public.sandwich_collections VALUES (2269, '2023-11-29', 'Alpharetta', 4232, '[]', '2025-06-08 17:05:26.919');
INSERT INTO public.sandwich_collections VALUES (2278, '2023-12-06', 'Alpharetta', 961, '[]', '2025-06-08 17:05:27.609');
INSERT INTO public.sandwich_collections VALUES (2287, '2023-12-13', 'Alpharetta', 1343, '[]', '2025-06-08 17:05:28.296');
INSERT INTO public.sandwich_collections VALUES (2296, '2023-12-20', 'Alpharetta', 2367, '[]', '2025-06-08 17:05:29.086');
INSERT INTO public.sandwich_collections VALUES (2304, '2024-01-03', 'Alpharetta', 609, '[]', '2025-06-08 17:05:29.696');
INSERT INTO public.sandwich_collections VALUES (2311, '2024-01-10', 'Alpharetta', 2000, '[]', '2025-06-08 17:05:30.23');
INSERT INTO public.sandwich_collections VALUES (2319, '2024-01-17', 'Alpharetta', 905, '[]', '2025-06-08 17:05:30.842');
INSERT INTO public.sandwich_collections VALUES (2328, '2024-01-24', 'Alpharetta', 1788, '[]', '2025-06-08 17:05:31.627');
INSERT INTO public.sandwich_collections VALUES (2336, '2024-01-31', 'Alpharetta', 1859, '[]', '2025-06-08 17:05:32.244');
INSERT INTO public.sandwich_collections VALUES (2330, '2024-01-24', 'East Cobb/Roswell', 1278, '[]', '2025-06-08 17:05:31.784');
INSERT INTO public.sandwich_collections VALUES (2313, '2024-01-10', 'East Cobb/Roswell', 1162, '[]', '2025-06-08 17:05:30.383');
INSERT INTO public.sandwich_collections VALUES (2306, '2024-01-03', 'East Cobb/Roswell', 1631, '[]', '2025-06-08 17:05:29.847');
INSERT INTO public.sandwich_collections VALUES (2298, '2023-12-20', 'East Cobb/Roswell', 1787, '[]', '2025-06-08 17:05:29.238');
INSERT INTO public.sandwich_collections VALUES (2289, '2023-12-13', 'East Cobb/Roswell', 1806, '[]', '2025-06-08 17:05:28.449');
INSERT INTO public.sandwich_collections VALUES (2280, '2023-12-06', 'East Cobb/Roswell', 2233, '[]', '2025-06-08 17:05:27.761');
INSERT INTO public.sandwich_collections VALUES (2271, '2023-11-29', 'East Cobb/Roswell', 1537, '[]', '2025-06-08 17:05:27.072');
INSERT INTO public.sandwich_collections VALUES (2254, '2023-11-08', 'East Cobb/Roswell', 1552, '[]', '2025-06-08 17:05:25.776');
INSERT INTO public.sandwich_collections VALUES (2245, '2023-11-01', 'East Cobb/Roswell', 937, '[]', '2025-06-08 17:05:24.988');
INSERT INTO public.sandwich_collections VALUES (2340, '2024-01-31', 'Sandy Springs', 935, '[]', '2025-06-08 17:05:32.56');
INSERT INTO public.sandwich_collections VALUES (2332, '2024-01-24', 'Sandy Springs', 700, '[]', '2025-06-08 17:05:31.937');
INSERT INTO public.sandwich_collections VALUES (2323, '2024-01-17', 'Sandy Springs', 1013, '[]', '2025-06-08 17:05:31.149');
INSERT INTO public.sandwich_collections VALUES (2315, '2024-01-10', 'Sandy Springs', 771, '[]', '2025-06-08 17:05:30.536');
INSERT INTO public.sandwich_collections VALUES (2307, '2024-01-03', 'Sandy Springs', 283, '[]', '2025-06-08 17:05:29.924');
INSERT INTO public.sandwich_collections VALUES (2300, '2023-12-20', 'Sandy Springs', 1052, '[]', '2025-06-08 17:05:29.39');
INSERT INTO public.sandwich_collections VALUES (2291, '2023-12-13', 'Sandy Springs', 630, '[]', '2025-06-08 17:05:28.705');
INSERT INTO public.sandwich_collections VALUES (2282, '2023-12-06', 'Sandy Springs', 944, '[]', '2025-06-08 17:05:27.914');
INSERT INTO public.sandwich_collections VALUES (2273, '2023-11-29', 'Sandy Springs', 718, '[]', '2025-06-08 17:05:27.225');
INSERT INTO public.sandwich_collections VALUES (2264, '2023-11-15', 'Sandy Springs', 996, '[]', '2025-06-08 17:05:26.537');
INSERT INTO public.sandwich_collections VALUES (2255, '2023-11-08', 'Sandy Springs', 928, '[]', '2025-06-08 17:05:25.853');
INSERT INTO public.sandwich_collections VALUES (2247, '2023-11-01', 'Sandy Springs', 296, '[]', '2025-06-08 17:05:25.14');
INSERT INTO public.sandwich_collections VALUES (2238, '2023-10-25', 'Sandy Springs', 669, '[]', '2025-06-08 17:05:24.452');
INSERT INTO public.sandwich_collections VALUES (2333, '2024-01-24', 'Intown/Druid Hills', 823, '[]', '2025-06-08 17:05:32.013');
INSERT INTO public.sandwich_collections VALUES (2324, '2024-01-17', 'Intown/Druid Hills', 1208, '[]', '2025-06-08 17:05:31.226');
INSERT INTO public.sandwich_collections VALUES (2316, '2024-01-10', 'Intown/Druid Hills', 225, '[]', '2025-06-08 17:05:30.613');
INSERT INTO public.sandwich_collections VALUES (2308, '2024-01-03', 'Intown/Druid Hills', 625, '[]', '2025-06-08 17:05:30.001');
INSERT INTO public.sandwich_collections VALUES (2301, '2023-12-20', 'Intown/Druid Hills', 460, '[]', '2025-06-08 17:05:29.467');
INSERT INTO public.sandwich_collections VALUES (2292, '2023-12-13', 'Intown/Druid Hills', 1161, '[]', '2025-06-08 17:05:28.781');
INSERT INTO public.sandwich_collections VALUES (2283, '2023-12-06', 'Intown/Druid Hills', 1387, '[]', '2025-06-08 17:05:27.991');
INSERT INTO public.sandwich_collections VALUES (2274, '2023-11-29', 'Intown/Druid Hills', 1203, '[]', '2025-06-08 17:05:27.302');
INSERT INTO public.sandwich_collections VALUES (2265, '2023-11-15', 'Intown/Druid Hills', 626, '[]', '2025-06-08 17:05:26.613');
INSERT INTO public.sandwich_collections VALUES (2256, '2023-11-08', 'Intown/Druid Hills', 935, '[]', '2025-06-08 17:05:25.929');
INSERT INTO public.sandwich_collections VALUES (2248, '2023-11-01', 'Intown/Druid Hills', 365, '[]', '2025-06-08 17:05:25.217');
INSERT INTO public.sandwich_collections VALUES (2239, '2023-10-25', 'Intown/Druid Hills', 1198, '[]', '2025-06-08 17:05:24.528');
INSERT INTO public.sandwich_collections VALUES (2342, '2024-01-31', 'Flowery Branch', 232, '[]', '2025-06-08 17:05:32.714');
INSERT INTO public.sandwich_collections VALUES (2326, '2024-01-17', 'Flowery Branch', 480, '[]', '2025-06-08 17:05:31.379');
INSERT INTO public.sandwich_collections VALUES (2310, '2024-01-03', 'Flowery Branch', 262, '[]', '2025-06-08 17:05:30.154');
INSERT INTO public.sandwich_collections VALUES (2294, '2023-12-13', 'Flowery Branch', 362, '[]', '2025-06-08 17:05:28.933');
INSERT INTO public.sandwich_collections VALUES (2285, '2023-12-06', 'Flowery Branch', 292, '[]', '2025-06-08 17:05:28.143');
INSERT INTO public.sandwich_collections VALUES (2276, '2023-11-29', 'Flowery Branch', 388, '[]', '2025-06-08 17:05:27.455');
INSERT INTO public.sandwich_collections VALUES (2267, '2023-11-15', 'Flowery Branch', 499, '[]', '2025-06-08 17:05:26.766');
INSERT INTO public.sandwich_collections VALUES (2258, '2023-11-08', 'Flowery Branch', 267, '[]', '2025-06-08 17:05:26.081');
INSERT INTO public.sandwich_collections VALUES (2250, '2023-11-01', 'Flowery Branch', 219, '[]', '2025-06-08 17:05:25.37');
INSERT INTO public.sandwich_collections VALUES (2337, '2024-01-31', 'Dunwoody/PTC', 1437, '[]', '2025-06-08 17:05:32.323');
INSERT INTO public.sandwich_collections VALUES (2329, '2024-01-24', 'Dunwoody/PTC', 1885, '[]', '2025-06-08 17:05:31.706');
INSERT INTO public.sandwich_collections VALUES (2320, '2024-01-17', 'Dunwoody/PTC', 1570, '[]', '2025-06-08 17:05:30.92');
INSERT INTO public.sandwich_collections VALUES (2312, '2024-01-10', 'Dunwoody/PTC', 2160, '[]', '2025-06-08 17:05:30.306');
INSERT INTO public.sandwich_collections VALUES (2305, '2024-01-03', 'Dunwoody/PTC', 1480, '[]', '2025-06-08 17:05:29.771');
INSERT INTO public.sandwich_collections VALUES (2297, '2023-12-20', 'Dunwoody/PTC', 1792, '[]', '2025-06-08 17:05:29.162');
INSERT INTO public.sandwich_collections VALUES (2288, '2023-12-13', 'Dunwoody/PTC', 1381, '[]', '2025-06-08 17:05:28.373');
INSERT INTO public.sandwich_collections VALUES (2279, '2023-12-06', 'Dunwoody/PTC', 1714, '[]', '2025-06-08 17:05:27.684');
INSERT INTO public.sandwich_collections VALUES (2270, '2023-11-29', 'Dunwoody/PTC', 2404, '[]', '2025-06-08 17:05:26.996');
INSERT INTO public.sandwich_collections VALUES (2261, '2023-11-15', 'Dunwoody/PTC', 2611, '[]', '2025-06-08 17:05:26.309');
INSERT INTO public.sandwich_collections VALUES (2253, '2023-11-08', 'Dunwoody/PTC', 1805, '[]', '2025-06-08 17:05:25.7');
INSERT INTO public.sandwich_collections VALUES (2244, '2023-11-01', 'Dunwoody/PTC', 2451, '[]', '2025-06-08 17:05:24.912');
INSERT INTO public.sandwich_collections VALUES (2339, '2024-01-31', 'Decatur', 128, '[]', '2025-06-08 17:05:32.485');
INSERT INTO public.sandwich_collections VALUES (2331, '2024-01-24', 'Decatur', 82, '[]', '2025-06-08 17:05:31.86');
INSERT INTO public.sandwich_collections VALUES (2322, '2024-01-17', 'Decatur', 320, '[]', '2025-06-08 17:05:31.071');
INSERT INTO public.sandwich_collections VALUES (2314, '2024-01-10', 'Decatur', 102, '[]', '2025-06-08 17:05:30.459');
INSERT INTO public.sandwich_collections VALUES (2299, '2023-12-20', 'Decatur', 184, '[]', '2025-06-08 17:05:29.315');
INSERT INTO public.sandwich_collections VALUES (2290, '2023-12-13', 'Decatur', 113, '[]', '2025-06-08 17:05:28.628');
INSERT INTO public.sandwich_collections VALUES (2281, '2023-12-06', 'Decatur', 111, '[]', '2025-06-08 17:05:27.838');
INSERT INTO public.sandwich_collections VALUES (2272, '2023-11-29', 'Decatur', 82, '[]', '2025-06-08 17:05:27.149');
INSERT INTO public.sandwich_collections VALUES (2246, '2023-11-01', 'Decatur', 135, '[]', '2025-06-08 17:05:25.064');
INSERT INTO public.sandwich_collections VALUES (2237, '2023-10-25', 'Decatur', 121, '[]', '2025-06-08 17:05:24.375');
INSERT INTO public.sandwich_collections VALUES (2334, '2024-01-24', 'Snellville', 180, '[]', '2025-06-08 17:05:32.089');
INSERT INTO public.sandwich_collections VALUES (2325, '2024-01-17', 'Snellville', 85, '[]', '2025-06-08 17:05:31.302');
INSERT INTO public.sandwich_collections VALUES (2317, '2024-01-10', 'Snellville', 185, '[]', '2025-06-08 17:05:30.689');
INSERT INTO public.sandwich_collections VALUES (2309, '2024-01-03', 'Snellville', 152, '[]', '2025-06-08 17:05:30.077');
INSERT INTO public.sandwich_collections VALUES (2302, '2023-12-20', 'Snellville', 106, '[]', '2025-06-08 17:05:29.543');
INSERT INTO public.sandwich_collections VALUES (2293, '2023-12-13', 'Snellville', 109, '[]', '2025-06-08 17:05:28.857');
INSERT INTO public.sandwich_collections VALUES (2284, '2023-12-06', 'Snellville', 128, '[]', '2025-06-08 17:05:28.067');
INSERT INTO public.sandwich_collections VALUES (2275, '2023-11-29', 'Snellville', 91, '[]', '2025-06-08 17:05:27.378');
INSERT INTO public.sandwich_collections VALUES (2266, '2023-11-15', 'Snellville', 90, '[]', '2025-06-08 17:05:26.69');
INSERT INTO public.sandwich_collections VALUES (2257, '2023-11-08', 'Snellville', 88, '[]', '2025-06-08 17:05:26.004');
INSERT INTO public.sandwich_collections VALUES (2249, '2023-11-01', 'Snellville', 129, '[]', '2025-06-08 17:05:25.294');
INSERT INTO public.sandwich_collections VALUES (2240, '2023-10-25', 'Snellville', 105, '[]', '2025-06-08 17:05:24.605');
INSERT INTO public.sandwich_collections VALUES (2344, '2024-02-07', 'Alpharetta', 1526, '[]', '2025-06-08 17:05:32.869');
INSERT INTO public.sandwich_collections VALUES (2352, '2024-02-14', 'Alpharetta', 3087, '[]', '2025-06-08 17:05:33.483');
INSERT INTO public.sandwich_collections VALUES (2360, '2024-02-21', 'Alpharetta', 2225, '[]', '2025-06-08 17:05:34.091');
INSERT INTO public.sandwich_collections VALUES (2368, '2024-02-28', 'Alpharetta', 938, '[]', '2025-06-08 17:05:34.855');
INSERT INTO public.sandwich_collections VALUES (2377, '2024-03-06', 'Alpharetta', 1324, '[]', '2025-06-08 17:05:35.545');
INSERT INTO public.sandwich_collections VALUES (2386, '2024-03-13', 'Alpharetta', 1254, '[]', '2025-06-08 17:05:36.242');
INSERT INTO public.sandwich_collections VALUES (2394, '2024-03-20', 'Alpharetta', 795, '[]', '2025-06-08 17:05:36.864');
INSERT INTO public.sandwich_collections VALUES (2402, '2024-04-03', 'Alpharetta', 757, '[]', '2025-06-08 17:05:37.579');
INSERT INTO public.sandwich_collections VALUES (2408, '2024-04-10', 'Alpharetta', 954, '[]', '2025-06-08 17:05:38.038');
INSERT INTO public.sandwich_collections VALUES (2415, '2024-04-17', 'Alpharetta', 1229, '[]', '2025-06-08 17:05:38.589');
INSERT INTO public.sandwich_collections VALUES (2421, '2024-05-01', 'Alpharetta', 1057, '[]', '2025-06-08 17:05:39.124');
INSERT INTO public.sandwich_collections VALUES (2429, '2024-05-08', 'Alpharetta', 1405, '[]', '2025-06-08 17:05:39.741');
INSERT INTO public.sandwich_collections VALUES (2437, '2024-05-15', 'Alpharetta', 1355, '[]', '2025-06-08 17:05:40.357');
INSERT INTO public.sandwich_collections VALUES (2445, '2024-05-22', 'Alpharetta', 848, '[]', '2025-06-08 17:05:40.97');
INSERT INTO public.sandwich_collections VALUES (2431, '2024-05-08', 'East Cobb/Roswell', 916, '[]', '2025-06-08 17:05:39.896');
INSERT INTO public.sandwich_collections VALUES (2423, '2024-05-01', 'East Cobb/Roswell', 1777, '[]', '2025-06-08 17:05:39.277');
INSERT INTO public.sandwich_collections VALUES (2417, '2024-04-17', 'East Cobb/Roswell', 968, '[]', '2025-06-08 17:05:38.746');
INSERT INTO public.sandwich_collections VALUES (2404, '2024-04-03', 'East Cobb/Roswell', 1629, '[]', '2025-06-08 17:05:37.733');
INSERT INTO public.sandwich_collections VALUES (2396, '2024-03-20', 'East Cobb/Roswell', 1845, '[]', '2025-06-08 17:05:37.121');
INSERT INTO public.sandwich_collections VALUES (2388, '2024-03-13', 'East Cobb/Roswell', 1849, '[]', '2025-06-08 17:05:36.405');
INSERT INTO public.sandwich_collections VALUES (2370, '2024-02-28', 'East Cobb/Roswell', 946, '[]', '2025-06-08 17:05:35.008');
INSERT INTO public.sandwich_collections VALUES (2362, '2024-02-21', 'East Cobb/Roswell', 1789, '[]', '2025-06-08 17:05:34.244');
INSERT INTO public.sandwich_collections VALUES (2354, '2024-02-14', 'East Cobb/Roswell', 821, '[]', '2025-06-08 17:05:33.634');
INSERT INTO public.sandwich_collections VALUES (2346, '2024-02-07', 'East Cobb/Roswell', 1048, '[]', '2025-06-08 17:05:33.023');
INSERT INTO public.sandwich_collections VALUES (2448, '2024-05-22', 'Sandy Springs', 644, '[]', '2025-06-08 17:05:41.201');
INSERT INTO public.sandwich_collections VALUES (2441, '2024-05-15', 'Sandy Springs', 581, '[]', '2025-06-08 17:05:40.663');
INSERT INTO public.sandwich_collections VALUES (2433, '2024-05-08', 'Sandy Springs', 1168, '[]', '2025-06-08 17:05:40.05');
INSERT INTO public.sandwich_collections VALUES (2425, '2024-05-01', 'Sandy Springs', 1282, '[]', '2025-06-08 17:05:39.432');
INSERT INTO public.sandwich_collections VALUES (2418, '2024-04-17', 'Sandy Springs', 609, '[]', '2025-06-08 17:05:38.822');
INSERT INTO public.sandwich_collections VALUES (2411, '2024-04-10', 'Sandy Springs', 1038, '[]', '2025-06-08 17:05:38.282');
INSERT INTO public.sandwich_collections VALUES (2405, '2024-04-03', 'Sandy Springs', 179, '[]', '2025-06-08 17:05:37.809');
INSERT INTO public.sandwich_collections VALUES (2390, '2024-03-13', 'Sandy Springs', 788, '[]', '2025-06-08 17:05:36.558');
INSERT INTO public.sandwich_collections VALUES (2381, '2024-03-06', 'Sandy Springs', 367, '[]', '2025-06-08 17:05:35.852');
INSERT INTO public.sandwich_collections VALUES (2372, '2024-02-28', 'Sandy Springs', 451, '[]', '2025-06-08 17:05:35.162');
INSERT INTO public.sandwich_collections VALUES (2364, '2024-02-21', 'Sandy Springs', 822, '[]', '2025-06-08 17:05:34.432');
INSERT INTO public.sandwich_collections VALUES (2355, '2024-02-14', 'Sandy Springs', 508, '[]', '2025-06-08 17:05:33.711');
INSERT INTO public.sandwich_collections VALUES (2348, '2024-02-07', 'Sandy Springs', 605, '[]', '2025-06-08 17:05:33.177');
INSERT INTO public.sandwich_collections VALUES (2449, '2024-05-22', 'Intown/Druid Hills', 533, '[]', '2025-06-08 17:05:41.281');
INSERT INTO public.sandwich_collections VALUES (2442, '2024-05-15', 'Intown/Druid Hills', 673, '[]', '2025-06-08 17:05:40.74');
INSERT INTO public.sandwich_collections VALUES (2434, '2024-05-08', 'Intown/Druid Hills', 507, '[]', '2025-06-08 17:05:40.127');
INSERT INTO public.sandwich_collections VALUES (2426, '2024-05-01', 'Intown/Druid Hills', 968, '[]', '2025-06-08 17:05:39.51');
INSERT INTO public.sandwich_collections VALUES (2419, '2024-04-17', 'Intown/Druid Hills', 2668, '[]', '2025-06-08 17:05:38.898');
INSERT INTO public.sandwich_collections VALUES (2412, '2024-04-10', 'Intown/Druid Hills', 2640, '[]', '2025-06-08 17:05:38.358');
INSERT INTO public.sandwich_collections VALUES (2406, '2024-04-03', 'Intown/Druid Hills', 482, '[]', '2025-06-08 17:05:37.886');
INSERT INTO public.sandwich_collections VALUES (2399, '2024-03-20', 'Intown/Druid Hills', 941, '[]', '2025-06-08 17:05:37.35');
INSERT INTO public.sandwich_collections VALUES (2391, '2024-03-13', 'Intown/Druid Hills', 277, '[]', '2025-06-08 17:05:36.635');
INSERT INTO public.sandwich_collections VALUES (2382, '2024-03-06', 'Intown/Druid Hills', 745, '[]', '2025-06-08 17:05:35.932');
INSERT INTO public.sandwich_collections VALUES (2365, '2024-02-21', 'Intown/Druid Hills', 1351, '[]', '2025-06-08 17:05:34.623');
INSERT INTO public.sandwich_collections VALUES (2356, '2024-02-14', 'Intown/Druid Hills', 930, '[]', '2025-06-08 17:05:33.788');
INSERT INTO public.sandwich_collections VALUES (2349, '2024-02-07', 'Intown/Druid Hills', 214, '[]', '2025-06-08 17:05:33.253');
INSERT INTO public.sandwich_collections VALUES (2450, '2024-05-22', 'Flowery Branch', 278, '[]', '2025-06-08 17:05:41.357');
INSERT INTO public.sandwich_collections VALUES (2443, '2024-05-15', 'Flowery Branch', 484, '[]', '2025-06-08 17:05:40.817');
INSERT INTO public.sandwich_collections VALUES (2435, '2024-05-08', 'Flowery Branch', 244, '[]', '2025-06-08 17:05:40.203');
INSERT INTO public.sandwich_collections VALUES (2427, '2024-05-01', 'Flowery Branch', 274, '[]', '2025-06-08 17:05:39.588');
INSERT INTO public.sandwich_collections VALUES (2413, '2024-04-10', 'Flowery Branch', 250, '[]', '2025-06-08 17:05:38.435');
INSERT INTO public.sandwich_collections VALUES (2400, '2024-03-20', 'Flowery Branch', 473, '[]', '2025-06-08 17:05:37.426');
INSERT INTO public.sandwich_collections VALUES (2384, '2024-03-06', 'Flowery Branch', 264, '[]', '2025-06-08 17:05:36.09');
INSERT INTO public.sandwich_collections VALUES (2375, '2024-02-28', 'Flowery Branch', 353, '[]', '2025-06-08 17:05:35.392');
INSERT INTO public.sandwich_collections VALUES (2358, '2024-02-14', 'Flowery Branch', 287, '[]', '2025-06-08 17:05:33.939');
INSERT INTO public.sandwich_collections VALUES (2446, '2024-05-22', 'Dunwoody/PTC', 2341, '[]', '2025-06-08 17:05:41.046');
INSERT INTO public.sandwich_collections VALUES (2438, '2024-05-15', 'Dunwoody/PTC', 2477, '[]', '2025-06-08 17:05:40.433');
INSERT INTO public.sandwich_collections VALUES (2430, '2024-05-08', 'Dunwoody/PTC', 1944, '[]', '2025-06-08 17:05:39.818');
INSERT INTO public.sandwich_collections VALUES (2422, '2024-05-01', 'Dunwoody/PTC', 2174, '[]', '2025-06-08 17:05:39.201');
INSERT INTO public.sandwich_collections VALUES (2416, '2024-04-17', 'Dunwoody/PTC', 2750, '[]', '2025-06-08 17:05:38.667');
INSERT INTO public.sandwich_collections VALUES (2409, '2024-04-10', 'Dunwoody/PTC', 1588, '[]', '2025-06-08 17:05:38.121');
INSERT INTO public.sandwich_collections VALUES (2403, '2024-04-03', 'Dunwoody/PTC', 2160, '[]', '2025-06-08 17:05:37.656');
INSERT INTO public.sandwich_collections VALUES (2395, '2024-03-20', 'Dunwoody/PTC', 1672, '[]', '2025-06-08 17:05:36.94');
INSERT INTO public.sandwich_collections VALUES (2387, '2024-03-13', 'Dunwoody/PTC', 1878, '[]', '2025-06-08 17:05:36.325');
INSERT INTO public.sandwich_collections VALUES (2378, '2024-03-06', 'Dunwoody/PTC', 1351, '[]', '2025-06-08 17:05:35.621');
INSERT INTO public.sandwich_collections VALUES (2361, '2024-02-21', 'Dunwoody/PTC', 2628, '[]', '2025-06-08 17:05:34.168');
INSERT INTO public.sandwich_collections VALUES (2353, '2024-02-14', 'Dunwoody/PTC', 1594, '[]', '2025-06-08 17:05:33.558');
INSERT INTO public.sandwich_collections VALUES (2345, '2024-02-07', 'Dunwoody/PTC', 1465, '[]', '2025-06-08 17:05:32.946');
INSERT INTO public.sandwich_collections VALUES (2440, '2024-05-15', 'Decatur', 92, '[]', '2025-06-08 17:05:40.587');
INSERT INTO public.sandwich_collections VALUES (2432, '2024-05-08', 'Decatur', 72, '[]', '2025-06-08 17:05:39.973');
INSERT INTO public.sandwich_collections VALUES (2424, '2024-05-01', 'Decatur', 112, '[]', '2025-06-08 17:05:39.355');
INSERT INTO public.sandwich_collections VALUES (2410, '2024-04-10', 'Decatur', 102, '[]', '2025-06-08 17:05:38.206');
INSERT INTO public.sandwich_collections VALUES (2397, '2024-03-20', 'Decatur', 82, '[]', '2025-06-08 17:05:37.197');
INSERT INTO public.sandwich_collections VALUES (2389, '2024-03-13', 'Decatur', 106, '[]', '2025-06-08 17:05:36.482');
INSERT INTO public.sandwich_collections VALUES (2380, '2024-03-06', 'Decatur', 102, '[]', '2025-06-08 17:05:35.775');
INSERT INTO public.sandwich_collections VALUES (2371, '2024-02-28', 'Decatur', 81, '[]', '2025-06-08 17:05:35.084');
INSERT INTO public.sandwich_collections VALUES (2363, '2024-02-21', 'Decatur', 92, '[]', '2025-06-08 17:05:34.356');
INSERT INTO public.sandwich_collections VALUES (2347, '2024-02-07', 'Decatur', 72, '[]', '2025-06-08 17:05:33.1');
INSERT INTO public.sandwich_collections VALUES (2392, '2024-03-13', 'Snellville', 114, '[]', '2025-06-08 17:05:36.712');
INSERT INTO public.sandwich_collections VALUES (2383, '2024-03-06', 'Snellville', 74, '[]', '2025-06-08 17:05:36.014');
INSERT INTO public.sandwich_collections VALUES (2374, '2024-02-28', 'Snellville', 74, '[]', '2025-06-08 17:05:35.315');
INSERT INTO public.sandwich_collections VALUES (2366, '2024-02-21', 'Snellville', 396, '[]', '2025-06-08 17:05:34.7');
INSERT INTO public.sandwich_collections VALUES (2357, '2024-02-14', 'Snellville', 108, '[]', '2025-06-08 17:05:33.864');
INSERT INTO public.sandwich_collections VALUES (2351, '2024-02-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1960}]', '2025-06-08 17:05:33.407');
INSERT INTO public.sandwich_collections VALUES (2452, '2024-05-28', 'Alpharetta', 584, '[]', '2025-06-08 17:05:41.618');
INSERT INTO public.sandwich_collections VALUES (2459, '2024-06-05', 'Alpharetta', 1569, '[]', '2025-06-08 17:05:42.151');
INSERT INTO public.sandwich_collections VALUES (2467, '2024-06-12', 'Alpharetta', 2135, '[]', '2025-06-08 17:05:42.764');
INSERT INTO public.sandwich_collections VALUES (2475, '2024-06-19', 'Alpharetta', 1218, '[]', '2025-06-08 17:05:43.376');
INSERT INTO public.sandwich_collections VALUES (2483, '2024-06-26', 'Alpharetta', 1198, '[]', '2025-06-08 17:05:43.99');
INSERT INTO public.sandwich_collections VALUES (2490, '2024-07-10', 'Alpharetta', 1134, '[]', '2025-06-08 17:05:44.622');
INSERT INTO public.sandwich_collections VALUES (2505, '2024-07-24', 'Alpharetta', 871, '[]', '2025-06-08 17:05:45.774');
INSERT INTO public.sandwich_collections VALUES (2513, '2024-07-31', 'Alpharetta', 2154, '[]', '2025-06-08 17:05:46.384');
INSERT INTO public.sandwich_collections VALUES (2521, '2024-08-07', 'Alpharetta', 1704, '[]', '2025-06-08 17:05:46.995');
INSERT INTO public.sandwich_collections VALUES (2529, '2024-08-14', 'Alpharetta', 1074, '[]', '2025-06-08 17:05:47.703');
INSERT INTO public.sandwich_collections VALUES (2537, '2024-08-21', 'Alpharetta', 1018, '[]', '2025-06-08 17:05:48.313');
INSERT INTO public.sandwich_collections VALUES (2544, '2024-08-28', 'Alpharetta', 1766, '[]', '2025-06-08 17:05:48.846');
INSERT INTO public.sandwich_collections VALUES (2552, '2024-09-04', 'Alpharetta', 1210, '[]', '2025-06-08 17:05:49.46');
INSERT INTO public.sandwich_collections VALUES (2560, '2024-09-11', 'Alpharetta', 875, '[]', '2025-06-08 17:05:50.07');
INSERT INTO public.sandwich_collections VALUES (2546, '2024-08-28', 'East Cobb/Roswell', 1290, '[]', '2025-06-08 17:05:49');
INSERT INTO public.sandwich_collections VALUES (2539, '2024-08-21', 'East Cobb/Roswell', 1327, '[]', '2025-06-08 17:05:48.465');
INSERT INTO public.sandwich_collections VALUES (2531, '2024-08-14', 'East Cobb/Roswell', 1347, '[]', '2025-06-08 17:05:47.855');
INSERT INTO public.sandwich_collections VALUES (2523, '2024-08-07', 'East Cobb/Roswell', 1455, '[]', '2025-06-08 17:05:47.149');
INSERT INTO public.sandwich_collections VALUES (2515, '2024-07-31', 'East Cobb/Roswell', 1499, '[]', '2025-06-08 17:05:46.537');
INSERT INTO public.sandwich_collections VALUES (2507, '2024-07-24', 'East Cobb/Roswell', 1962, '[]', '2025-06-08 17:05:45.926');
INSERT INTO public.sandwich_collections VALUES (2485, '2024-06-26', 'East Cobb/Roswell', 1715, '[]', '2025-06-08 17:05:44.143');
INSERT INTO public.sandwich_collections VALUES (2477, '2024-06-19', 'East Cobb/Roswell', 1695, '[]', '2025-06-08 17:05:43.529');
INSERT INTO public.sandwich_collections VALUES (2469, '2024-06-12', 'East Cobb/Roswell', 2323, '[]', '2025-06-08 17:05:42.917');
INSERT INTO public.sandwich_collections VALUES (2461, '2024-06-05', 'East Cobb/Roswell', 1436, '[]', '2025-06-08 17:05:42.303');
INSERT INTO public.sandwich_collections VALUES (2454, '2024-05-28', 'East Cobb/Roswell', 852, '[]', '2025-06-08 17:05:41.771');
INSERT INTO public.sandwich_collections VALUES (2556, '2024-09-04', 'Sandy Springs', 434, '[]', '2025-06-08 17:05:49.764');
INSERT INTO public.sandwich_collections VALUES (2548, '2024-08-28', 'Sandy Springs', 545, '[]', '2025-06-08 17:05:49.154');
INSERT INTO public.sandwich_collections VALUES (2540, '2024-08-21', 'Sandy Springs', 445, '[]', '2025-06-08 17:05:48.542');
INSERT INTO public.sandwich_collections VALUES (2525, '2024-08-07', 'Sandy Springs', 1074, '[]', '2025-06-08 17:05:47.302');
INSERT INTO public.sandwich_collections VALUES (2517, '2024-07-31', 'Sandy Springs', 890, '[]', '2025-06-08 17:05:46.689');
INSERT INTO public.sandwich_collections VALUES (2509, '2024-07-24', 'Sandy Springs', 889, '[]', '2025-06-08 17:05:46.079');
INSERT INTO public.sandwich_collections VALUES (2501, '2024-07-17', 'Sandy Springs', 632, '[]', '2025-06-08 17:05:45.463');
INSERT INTO public.sandwich_collections VALUES (2493, '2024-07-10', 'Sandy Springs', 583, '[]', '2025-06-08 17:05:44.851');
INSERT INTO public.sandwich_collections VALUES (2486, '2024-06-26', 'Sandy Springs', 789, '[]', '2025-06-08 17:05:44.219');
INSERT INTO public.sandwich_collections VALUES (2479, '2024-06-19', 'Sandy Springs', 1088, '[]', '2025-06-08 17:05:43.684');
INSERT INTO public.sandwich_collections VALUES (2471, '2024-06-12', 'Sandy Springs', 690, '[]', '2025-06-08 17:05:43.07');
INSERT INTO public.sandwich_collections VALUES (2463, '2024-06-05', 'Sandy Springs', 721, '[]', '2025-06-08 17:05:42.457');
INSERT INTO public.sandwich_collections VALUES (2455, '2024-05-28', 'Sandy Springs', 828, '[]', '2025-06-08 17:05:41.846');
INSERT INTO public.sandwich_collections VALUES (2557, '2024-09-04', 'Intown/Druid Hills', 567, '[]', '2025-06-08 17:05:49.841');
INSERT INTO public.sandwich_collections VALUES (2549, '2024-08-28', 'Intown/Druid Hills', 846, '[]', '2025-06-08 17:05:49.23');
INSERT INTO public.sandwich_collections VALUES (2541, '2024-08-21', 'Intown/Druid Hills', 722, '[]', '2025-06-08 17:05:48.618');
INSERT INTO public.sandwich_collections VALUES (2534, '2024-08-14', 'Intown/Druid Hills', 547, '[]', '2025-06-08 17:05:48.084');
INSERT INTO public.sandwich_collections VALUES (2526, '2024-08-07', 'Intown/Druid Hills', 428, '[]', '2025-06-08 17:05:47.379');
INSERT INTO public.sandwich_collections VALUES (2518, '2024-07-31', 'Intown/Druid Hills', 1607, '[]', '2025-06-08 17:05:46.765');
INSERT INTO public.sandwich_collections VALUES (2502, '2024-07-17', 'Intown/Druid Hills', 1425, '[]', '2025-06-08 17:05:45.545');
INSERT INTO public.sandwich_collections VALUES (2494, '2024-07-10', 'Intown/Druid Hills', 784, '[]', '2025-06-08 17:05:44.927');
INSERT INTO public.sandwich_collections VALUES (2487, '2024-06-26', 'Intown/Druid Hills', 766, '[]', '2025-06-08 17:05:44.295');
INSERT INTO public.sandwich_collections VALUES (2480, '2024-06-19', 'Intown/Druid Hills', 586, '[]', '2025-06-08 17:05:43.76');
INSERT INTO public.sandwich_collections VALUES (2472, '2024-06-12', 'Intown/Druid Hills', 751, '[]', '2025-06-08 17:05:43.146');
INSERT INTO public.sandwich_collections VALUES (2464, '2024-06-05', 'Intown/Druid Hills', 707, '[]', '2025-06-08 17:05:42.533');
INSERT INTO public.sandwich_collections VALUES (2456, '2024-05-28', 'Intown/Druid Hills', 511, '[]', '2025-06-08 17:05:41.923');
INSERT INTO public.sandwich_collections VALUES (2558, '2024-09-04', 'Flowery Branch', 214, '[]', '2025-06-08 17:05:49.917');
INSERT INTO public.sandwich_collections VALUES (2550, '2024-08-28', 'Flowery Branch', 250, '[]', '2025-06-08 17:05:49.306');
INSERT INTO public.sandwich_collections VALUES (2542, '2024-08-21', 'Flowery Branch', 175, '[]', '2025-06-08 17:05:48.694');
INSERT INTO public.sandwich_collections VALUES (2535, '2024-08-14', 'Flowery Branch', 150, '[]', '2025-06-08 17:05:48.161');
INSERT INTO public.sandwich_collections VALUES (2527, '2024-08-07', 'Flowery Branch', 226, '[]', '2025-06-08 17:05:47.46');
INSERT INTO public.sandwich_collections VALUES (2519, '2024-07-31', 'Flowery Branch', 132, '[]', '2025-06-08 17:05:46.842');
INSERT INTO public.sandwich_collections VALUES (2511, '2024-07-24', 'Flowery Branch', 191, '[]', '2025-06-08 17:05:46.232');
INSERT INTO public.sandwich_collections VALUES (2503, '2024-07-17', 'Flowery Branch', 226, '[]', '2025-06-08 17:05:45.621');
INSERT INTO public.sandwich_collections VALUES (2495, '2024-07-10', 'Flowery Branch', 426, '[]', '2025-06-08 17:05:45.004');
INSERT INTO public.sandwich_collections VALUES (2488, '2024-06-26', 'Flowery Branch', 275, '[]', '2025-06-08 17:05:44.372');
INSERT INTO public.sandwich_collections VALUES (2481, '2024-06-19', 'Flowery Branch', 454, '[]', '2025-06-08 17:05:43.837');
INSERT INTO public.sandwich_collections VALUES (2473, '2024-06-12', 'Flowery Branch', 125, '[]', '2025-06-08 17:05:43.223');
INSERT INTO public.sandwich_collections VALUES (2465, '2024-06-05', 'Flowery Branch', 735, '[]', '2025-06-08 17:05:42.609');
INSERT INTO public.sandwich_collections VALUES (2457, '2024-05-28', 'Flowery Branch', 250, '[]', '2025-06-08 17:05:41.999');
INSERT INTO public.sandwich_collections VALUES (2553, '2024-09-04', 'Dunwoody/PTC', 1184, '[]', '2025-06-08 17:05:49.536');
INSERT INTO public.sandwich_collections VALUES (2538, '2024-08-21', 'Dunwoody/PTC', 1698, '[]', '2025-06-08 17:05:48.389');
INSERT INTO public.sandwich_collections VALUES (2530, '2024-08-14', 'Dunwoody/PTC', 2154, '[]', '2025-06-08 17:05:47.779');
INSERT INTO public.sandwich_collections VALUES (2522, '2024-08-07', 'Dunwoody/PTC', 1012, '[]', '2025-06-08 17:05:47.072');
INSERT INTO public.sandwich_collections VALUES (2514, '2024-07-31', 'Dunwoody/PTC', 1460, '[]', '2025-06-08 17:05:46.461');
INSERT INTO public.sandwich_collections VALUES (2506, '2024-07-24', 'Dunwoody/PTC', 1989, '[]', '2025-06-08 17:05:45.85');
INSERT INTO public.sandwich_collections VALUES (2491, '2024-07-10', 'Dunwoody/PTC', 1681, '[]', '2025-06-08 17:05:44.699');
INSERT INTO public.sandwich_collections VALUES (2484, '2024-06-26', 'Dunwoody/PTC', 1272, '[]', '2025-06-08 17:05:44.067');
INSERT INTO public.sandwich_collections VALUES (2476, '2024-06-19', 'Dunwoody/PTC', 1980, '[]', '2025-06-08 17:05:43.452');
INSERT INTO public.sandwich_collections VALUES (2468, '2024-06-12', 'Dunwoody/PTC', 2400, '[]', '2025-06-08 17:05:42.841');
INSERT INTO public.sandwich_collections VALUES (2460, '2024-06-05', 'Dunwoody/PTC', 1552, '[]', '2025-06-08 17:05:42.227');
INSERT INTO public.sandwich_collections VALUES (2453, '2024-05-28', 'Dunwoody/PTC', 1740, '[]', '2025-06-08 17:05:41.694');
INSERT INTO public.sandwich_collections VALUES (2624, '2024-11-13', 'Decatur', 54, '[]', '2025-06-08 17:05:55.112');
INSERT INTO public.sandwich_collections VALUES (2547, '2024-08-28', 'Decatur', 54, '[]', '2025-06-08 17:05:49.076');
INSERT INTO public.sandwich_collections VALUES (2532, '2024-08-14', 'Decatur', 54, '[]', '2025-06-08 17:05:47.931');
INSERT INTO public.sandwich_collections VALUES (2524, '2024-08-07', 'Decatur', 54, '[]', '2025-06-08 17:05:47.225');
INSERT INTO public.sandwich_collections VALUES (2516, '2024-07-31', 'Decatur', 162, '[]', '2025-06-08 17:05:46.614');
INSERT INTO public.sandwich_collections VALUES (2508, '2024-07-24', 'Decatur', 54, '[]', '2025-06-08 17:05:46.003');
INSERT INTO public.sandwich_collections VALUES (2478, '2024-06-19', 'Decatur', 74, '[]', '2025-06-08 17:05:43.606');
INSERT INTO public.sandwich_collections VALUES (2470, '2024-06-12', 'Decatur', 72, '[]', '2025-06-08 17:05:42.994');
INSERT INTO public.sandwich_collections VALUES (2462, '2024-06-05', 'Decatur', 159, '[]', '2025-06-08 17:05:42.38');
INSERT INTO public.sandwich_collections VALUES (2568, '2024-09-18', 'Alpharetta', 1640, '[]', '2025-06-08 17:05:50.78');
INSERT INTO public.sandwich_collections VALUES (2576, '2024-09-25', 'Alpharetta', 1946, '[]', '2025-06-08 17:05:51.39');
INSERT INTO public.sandwich_collections VALUES (2584, '2024-10-09', 'Alpharetta', 1493, '[]', '2025-06-08 17:05:52.001');
INSERT INTO public.sandwich_collections VALUES (2592, '2024-10-16', 'Alpharetta', 1032, '[]', '2025-06-08 17:05:52.61');
INSERT INTO public.sandwich_collections VALUES (2600, '2024-10-23', 'Alpharetta', 618, '[]', '2025-06-08 17:05:53.22');
INSERT INTO public.sandwich_collections VALUES (2607, '2024-10-30', 'Alpharetta', 1427, '[]', '2025-06-08 17:05:53.754');
INSERT INTO public.sandwich_collections VALUES (2614, '2024-11-06', 'Alpharetta', 1427, '[]', '2025-06-08 17:05:54.349');
INSERT INTO public.sandwich_collections VALUES (2621, '2024-11-13', 'Alpharetta', 1226, '[]', '2025-06-08 17:05:54.883');
INSERT INTO public.sandwich_collections VALUES (2629, '2024-11-20', 'Alpharetta', 3625, '[]', '2025-06-08 17:05:55.497');
INSERT INTO public.sandwich_collections VALUES (2637, '2024-12-04', 'Alpharetta', 1379, '[]', '2025-06-08 17:05:56.107');
INSERT INTO public.sandwich_collections VALUES (2645, '2024-12-11', 'Alpharetta', 2176, '[]', '2025-06-08 17:05:56.718');
INSERT INTO public.sandwich_collections VALUES (2652, '2024-12-18', 'Alpharetta', 848, '[]', '2025-06-08 17:05:57.26');
INSERT INTO public.sandwich_collections VALUES (2663, '2025-01-08', 'Alpharetta', 1571, '[]', '2025-06-08 17:05:58.159');
INSERT INTO public.sandwich_collections VALUES (2662, '2025-01-01', 'East Cobb/Roswell', 185, '[]', '2025-06-08 17:05:58.083');
INSERT INTO public.sandwich_collections VALUES (2654, '2024-12-18', 'East Cobb/Roswell', 1706, '[]', '2025-06-08 17:05:57.415');
INSERT INTO public.sandwich_collections VALUES (2647, '2024-12-11', 'East Cobb/Roswell', 1203, '[]', '2025-06-08 17:05:56.871');
INSERT INTO public.sandwich_collections VALUES (2639, '2024-12-04', 'East Cobb/Roswell', 1439, '[]', '2025-06-08 17:05:56.26');
INSERT INTO public.sandwich_collections VALUES (2631, '2024-11-20', 'East Cobb/Roswell', 1643, '[]', '2025-06-08 17:05:55.65');
INSERT INTO public.sandwich_collections VALUES (2616, '2024-11-06', 'East Cobb/Roswell', 1017, '[]', '2025-06-08 17:05:54.504');
INSERT INTO public.sandwich_collections VALUES (2609, '2024-10-30', 'East Cobb/Roswell', 1017, '[]', '2025-06-08 17:05:53.906');
INSERT INTO public.sandwich_collections VALUES (2602, '2024-10-23', 'East Cobb/Roswell', 594, '[]', '2025-06-08 17:05:53.373');
INSERT INTO public.sandwich_collections VALUES (2594, '2024-10-16', 'East Cobb/Roswell', 1332, '[]', '2025-06-08 17:05:52.763');
INSERT INTO public.sandwich_collections VALUES (2586, '2024-10-09', 'East Cobb/Roswell', 919, '[]', '2025-06-08 17:05:52.152');
INSERT INTO public.sandwich_collections VALUES (2578, '2024-09-25', 'East Cobb/Roswell', 989, '[]', '2025-06-08 17:05:51.542');
INSERT INTO public.sandwich_collections VALUES (2562, '2024-09-11', 'East Cobb/Roswell', 1133, '[]', '2025-06-08 17:05:50.223');
INSERT INTO public.sandwich_collections VALUES (2666, '2025-01-08', 'Sandy Springs', 301, '[]', '2025-06-08 17:05:58.392');
INSERT INTO public.sandwich_collections VALUES (2655, '2024-12-18', 'Sandy Springs', 485, '[]', '2025-06-08 17:05:57.492');
INSERT INTO public.sandwich_collections VALUES (2648, '2024-12-11', 'Sandy Springs', 667, '[]', '2025-06-08 17:05:56.948');
INSERT INTO public.sandwich_collections VALUES (2641, '2024-12-04', 'Sandy Springs', 442, '[]', '2025-06-08 17:05:56.412');
INSERT INTO public.sandwich_collections VALUES (2633, '2024-11-20', 'Sandy Springs', 1087, '[]', '2025-06-08 17:05:55.802');
INSERT INTO public.sandwich_collections VALUES (2625, '2024-11-13', 'Sandy Springs', 554, '[]', '2025-06-08 17:05:55.187');
INSERT INTO public.sandwich_collections VALUES (2617, '2024-11-06', 'Sandy Springs', 452, '[]', '2025-06-08 17:05:54.579');
INSERT INTO public.sandwich_collections VALUES (2610, '2024-10-30', 'Sandy Springs', 452, '[]', '2025-06-08 17:05:53.982');
INSERT INTO public.sandwich_collections VALUES (2603, '2024-10-23', 'Sandy Springs', 224, '[]', '2025-06-08 17:05:53.449');
INSERT INTO public.sandwich_collections VALUES (2596, '2024-10-16', 'Sandy Springs', 431, '[]', '2025-06-08 17:05:52.915');
INSERT INTO public.sandwich_collections VALUES (2588, '2024-10-09', 'Sandy Springs', 344, '[]', '2025-06-08 17:05:52.304');
INSERT INTO public.sandwich_collections VALUES (2579, '2024-09-25', 'Sandy Springs', 510, '[]', '2025-06-08 17:05:51.618');
INSERT INTO public.sandwich_collections VALUES (2572, '2024-09-18', 'Sandy Springs', 747, '[]', '2025-06-08 17:05:51.085');
INSERT INTO public.sandwich_collections VALUES (2564, '2024-09-11', 'Sandy Springs', 721, '[]', '2025-06-08 17:05:50.375');
INSERT INTO public.sandwich_collections VALUES (2649, '2024-12-11', 'Intown/Druid Hills', 1190, '[]', '2025-06-08 17:05:57.03');
INSERT INTO public.sandwich_collections VALUES (2642, '2024-12-04', 'Intown/Druid Hills', 1280, '[]', '2025-06-08 17:05:56.488');
INSERT INTO public.sandwich_collections VALUES (2634, '2024-11-20', 'Intown/Druid Hills', 861, '[]', '2025-06-08 17:05:55.879');
INSERT INTO public.sandwich_collections VALUES (2626, '2024-11-13', 'Intown/Druid Hills', 437, '[]', '2025-06-08 17:05:55.263');
INSERT INTO public.sandwich_collections VALUES (2618, '2024-11-06', 'Intown/Druid Hills', 1380, '[]', '2025-06-08 17:05:54.654');
INSERT INTO public.sandwich_collections VALUES (2611, '2024-10-30', 'Intown/Druid Hills', 1380, '[]', '2025-06-08 17:05:54.119');
INSERT INTO public.sandwich_collections VALUES (2604, '2024-10-23', 'Intown/Druid Hills', 768, '[]', '2025-06-08 17:05:53.525');
INSERT INTO public.sandwich_collections VALUES (2597, '2024-10-16', 'Intown/Druid Hills', 1296, '[]', '2025-06-08 17:05:52.992');
INSERT INTO public.sandwich_collections VALUES (2589, '2024-10-09', 'Intown/Druid Hills', 555, '[]', '2025-06-08 17:05:52.38');
INSERT INTO public.sandwich_collections VALUES (2580, '2024-09-25', 'Intown/Druid Hills', 791, '[]', '2025-06-08 17:05:51.694');
INSERT INTO public.sandwich_collections VALUES (2573, '2024-09-18', 'Intown/Druid Hills', 406, '[]', '2025-06-08 17:05:51.162');
INSERT INTO public.sandwich_collections VALUES (2565, '2024-09-11', 'Intown/Druid Hills', 1059, '[]', '2025-06-08 17:05:50.452');
INSERT INTO public.sandwich_collections VALUES (2657, '2024-12-18', 'Flowery Branch', 426, '[]', '2025-06-08 17:05:57.698');
INSERT INTO public.sandwich_collections VALUES (2650, '2024-12-11', 'Flowery Branch', 105, '[]', '2025-06-08 17:05:57.107');
INSERT INTO public.sandwich_collections VALUES (2643, '2024-12-04', 'Flowery Branch', 250, '[]', '2025-06-08 17:05:56.565');
INSERT INTO public.sandwich_collections VALUES (2635, '2024-11-20', 'Flowery Branch', 304, '[]', '2025-06-08 17:05:55.955');
INSERT INTO public.sandwich_collections VALUES (2627, '2024-11-13', 'Flowery Branch', 200, '[]', '2025-06-08 17:05:55.34');
INSERT INTO public.sandwich_collections VALUES (2619, '2024-11-06', 'Flowery Branch', 179, '[]', '2025-06-08 17:05:54.73');
INSERT INTO public.sandwich_collections VALUES (2612, '2024-10-30', 'Flowery Branch', 332, '[]', '2025-06-08 17:05:54.195');
INSERT INTO public.sandwich_collections VALUES (2605, '2024-10-23', 'Flowery Branch', 503, '[]', '2025-06-08 17:05:53.601');
INSERT INTO public.sandwich_collections VALUES (2598, '2024-10-16', 'Flowery Branch', 200, '[]', '2025-06-08 17:05:53.068');
INSERT INTO public.sandwich_collections VALUES (2590, '2024-10-09', 'Flowery Branch', 260, '[]', '2025-06-08 17:05:52.457');
INSERT INTO public.sandwich_collections VALUES (2574, '2024-09-18', 'Flowery Branch', 494, '[]', '2025-06-08 17:05:51.238');
INSERT INTO public.sandwich_collections VALUES (2566, '2024-09-11', 'Flowery Branch', 223, '[]', '2025-06-08 17:05:50.626');
INSERT INTO public.sandwich_collections VALUES (2664, '2025-01-08', 'Dunwoody/PTC', 2397, '[]', '2025-06-08 17:05:58.24');
INSERT INTO public.sandwich_collections VALUES (2661, '2025-01-01', 'Dunwoody/PTC', 563, '[]', '2025-06-08 17:05:58.004');
INSERT INTO public.sandwich_collections VALUES (2659, '2024-12-26', 'Dunwoody/PTC', 504, '[]', '2025-06-08 17:05:57.85');
INSERT INTO public.sandwich_collections VALUES (2653, '2024-12-18', 'Dunwoody/PTC', 1342, '[]', '2025-06-08 17:05:57.338');
INSERT INTO public.sandwich_collections VALUES (2646, '2024-12-11', 'Dunwoody/PTC', 2226, '[]', '2025-06-08 17:05:56.794');
INSERT INTO public.sandwich_collections VALUES (2638, '2024-12-04', 'Dunwoody/PTC', 1643, '[]', '2025-06-08 17:05:56.183');
INSERT INTO public.sandwich_collections VALUES (2630, '2024-11-20', 'Dunwoody/PTC', 2378, '[]', '2025-06-08 17:05:55.574');
INSERT INTO public.sandwich_collections VALUES (2622, '2024-11-13', 'Dunwoody/PTC', 1396, '[]', '2025-06-08 17:05:54.959');
INSERT INTO public.sandwich_collections VALUES (2615, '2024-11-06', 'Dunwoody/PTC', 1449, '[]', '2025-06-08 17:05:54.426');
INSERT INTO public.sandwich_collections VALUES (2608, '2024-10-30', 'Dunwoody/PTC', 2035, '[]', '2025-06-08 17:05:53.83');
INSERT INTO public.sandwich_collections VALUES (2601, '2024-10-23', 'Dunwoody/PTC', 1774, '[]', '2025-06-08 17:05:53.297');
INSERT INTO public.sandwich_collections VALUES (2593, '2024-10-16', 'Dunwoody/PTC', 1377, '[]', '2025-06-08 17:05:52.687');
INSERT INTO public.sandwich_collections VALUES (2585, '2024-10-09', 'Dunwoody/PTC', 1284, '[]', '2025-06-08 17:05:52.077');
INSERT INTO public.sandwich_collections VALUES (2577, '2024-09-25', 'Dunwoody/PTC', 1836, '[]', '2025-06-08 17:05:51.466');
INSERT INTO public.sandwich_collections VALUES (2569, '2024-09-18', 'Dunwoody/PTC', 724, '[]', '2025-06-08 17:05:50.856');
INSERT INTO public.sandwich_collections VALUES (2561, '2024-09-11', 'Dunwoody/PTC', 1143, '[]', '2025-06-08 17:05:50.146');
INSERT INTO public.sandwich_collections VALUES (2640, '2024-12-04', 'Decatur', 54, '[]', '2025-06-08 17:05:56.336');
INSERT INTO public.sandwich_collections VALUES (2632, '2024-11-20', 'Decatur', 64, '[]', '2025-06-08 17:05:55.726');
INSERT INTO public.sandwich_collections VALUES (2595, '2024-10-16', 'Decatur', 119, '[]', '2025-06-08 17:05:52.839');
INSERT INTO public.sandwich_collections VALUES (2587, '2024-10-09', 'Decatur', 54, '[]', '2025-06-08 17:05:52.228');
INSERT INTO public.sandwich_collections VALUES (2571, '2024-09-18', 'Decatur', 118, '[]', '2025-06-08 17:05:51.009');
INSERT INTO public.sandwich_collections VALUES (2563, '2024-09-11', 'Decatur', 54, '[]', '2025-06-08 17:05:50.299');
INSERT INTO public.sandwich_collections VALUES (2670, '2025-01-15', 'Alpharetta', 1180, '[]', '2025-06-08 17:05:58.699');
INSERT INTO public.sandwich_collections VALUES (2677, '2025-01-20', 'Alpharetta', 436, '[]', '2025-06-08 17:05:59.233');
INSERT INTO public.sandwich_collections VALUES (2682, '2025-01-22', 'Alpharetta', 864, '[]', '2025-06-08 17:05:59.613');
INSERT INTO public.sandwich_collections VALUES (2699, '2025-02-05', 'Alpharetta', 1252, '[]', '2025-06-08 17:06:00.907');
INSERT INTO public.sandwich_collections VALUES (2705, '2025-02-12', 'Alpharetta', 1852, '[]', '2025-06-08 17:06:01.436');
INSERT INTO public.sandwich_collections VALUES (2712, '2025-02-19', 'Alpharetta', 900, '[]', '2025-06-08 17:06:01.971');
INSERT INTO public.sandwich_collections VALUES (2719, '2025-02-26', 'Alpharetta', 1010, '[]', '2025-06-08 17:06:02.506');
INSERT INTO public.sandwich_collections VALUES (2726, '2025-03-05', 'Alpharetta', 1092, '[]', '2025-06-08 17:06:03.043');
INSERT INTO public.sandwich_collections VALUES (2733, '2025-03-12', 'Alpharetta', 1301, '[]', '2025-06-08 17:06:03.576');
INSERT INTO public.sandwich_collections VALUES (2740, '2025-03-19', 'Alpharetta', 1106, '[]', '2025-06-08 17:06:04.202');
INSERT INTO public.sandwich_collections VALUES (2747, '2025-03-27', 'Alpharetta', 1100, '[]', '2025-06-08 17:06:04.738');
INSERT INTO public.sandwich_collections VALUES (2754, '2025-04-02', 'Alpharetta', 850, '[]', '2025-06-08 17:06:05.273');
INSERT INTO public.sandwich_collections VALUES (2761, '2025-04-09', 'Alpharetta', 628, '[]', '2025-06-08 17:06:05.809');
INSERT INTO public.sandwich_collections VALUES (2768, '2025-04-16', 'Alpharetta', 1556, '[]', '2025-06-08 17:06:06.345');
INSERT INTO public.sandwich_collections VALUES (2770, '2025-04-16', 'East Cobb/Roswell', 993, '[]', '2025-06-08 17:06:06.498');
INSERT INTO public.sandwich_collections VALUES (2763, '2025-04-09', 'East Cobb/Roswell', 950, '[]', '2025-06-08 17:06:05.963');
INSERT INTO public.sandwich_collections VALUES (2756, '2025-04-02', 'East Cobb/Roswell', 878, '[]', '2025-06-08 17:06:05.426');
INSERT INTO public.sandwich_collections VALUES (2749, '2025-03-27', 'East Cobb/Roswell', 907, '[]', '2025-06-08 17:06:04.891');
INSERT INTO public.sandwich_collections VALUES (2742, '2025-03-19', 'East Cobb/Roswell', 1270, '[]', '2025-06-08 17:06:04.354');
INSERT INTO public.sandwich_collections VALUES (2728, '2025-03-05', 'East Cobb/Roswell', 983, '[]', '2025-06-08 17:06:03.195');
INSERT INTO public.sandwich_collections VALUES (2721, '2025-02-26', 'East Cobb/Roswell', 854, '[]', '2025-06-08 17:06:02.659');
INSERT INTO public.sandwich_collections VALUES (2714, '2025-02-19', 'East Cobb/Roswell', 1381, '[]', '2025-06-08 17:06:02.124');
INSERT INTO public.sandwich_collections VALUES (2707, '2025-02-12', 'East Cobb/Roswell', 976, '[]', '2025-06-08 17:06:01.59');
INSERT INTO public.sandwich_collections VALUES (2701, '2025-02-05', 'East Cobb/Roswell', 1265, '[]', '2025-06-08 17:06:01.13');
INSERT INTO public.sandwich_collections VALUES (2694, '2025-01-29', 'East Cobb/Roswell', 1890, '[]', '2025-06-08 17:06:00.527');
INSERT INTO public.sandwich_collections VALUES (2679, '2025-01-20', 'East Cobb/Roswell', 400, '[]', '2025-06-08 17:05:59.385');
INSERT INTO public.sandwich_collections VALUES (2672, '2025-01-15', 'East Cobb/Roswell', 1776, '[]', '2025-06-08 17:05:58.851');
INSERT INTO public.sandwich_collections VALUES (2771, '2025-04-16', 'Sandy Springs', 1123, '[]', '2025-06-08 17:06:06.627');
INSERT INTO public.sandwich_collections VALUES (2764, '2025-04-09', 'Sandy Springs', 418, '[]', '2025-06-08 17:06:06.039');
INSERT INTO public.sandwich_collections VALUES (2757, '2025-04-02', 'Sandy Springs', 839, '[]', '2025-06-08 17:06:05.502');
INSERT INTO public.sandwich_collections VALUES (2750, '2025-03-27', 'Sandy Springs', 649, '[]', '2025-06-08 17:06:04.968');
INSERT INTO public.sandwich_collections VALUES (2743, '2025-03-19', 'Sandy Springs', 601, '[]', '2025-06-08 17:06:04.431');
INSERT INTO public.sandwich_collections VALUES (2736, '2025-03-12', 'Sandy Springs', 485, '[]', '2025-06-08 17:06:03.807');
INSERT INTO public.sandwich_collections VALUES (2729, '2025-03-05', 'Sandy Springs', 117, '[]', '2025-06-08 17:06:03.272');
INSERT INTO public.sandwich_collections VALUES (2722, '2025-02-26', 'Sandy Springs', 650, '[]', '2025-06-08 17:06:02.736');
INSERT INTO public.sandwich_collections VALUES (2715, '2025-02-19', 'Sandy Springs', 677, '[]', '2025-06-08 17:06:02.2');
INSERT INTO public.sandwich_collections VALUES (2702, '2025-02-05', 'Sandy Springs', 549, '[]', '2025-06-08 17:06:01.208');
INSERT INTO public.sandwich_collections VALUES (2695, '2025-01-29', 'Sandy Springs', 706, '[]', '2025-06-08 17:06:00.602');
INSERT INTO public.sandwich_collections VALUES (2685, '2025-01-22', 'Sandy Springs', 545, '[]', '2025-06-08 17:05:59.842');
INSERT INTO public.sandwich_collections VALUES (2680, '2025-01-20', 'Sandy Springs', 328, '[]', '2025-06-08 17:05:59.461');
INSERT INTO public.sandwich_collections VALUES (2673, '2025-01-15', 'Sandy Springs', 664, '[]', '2025-06-08 17:05:58.928');
INSERT INTO public.sandwich_collections VALUES (2765, '2025-04-09', 'Intown/Druid Hills', 514, '[]', '2025-06-08 17:06:06.116');
INSERT INTO public.sandwich_collections VALUES (2758, '2025-04-02', 'Intown/Druid Hills', 1647, '[]', '2025-06-08 17:06:05.579');
INSERT INTO public.sandwich_collections VALUES (2751, '2025-03-27', 'Intown/Druid Hills', 884, '[]', '2025-06-08 17:06:05.044');
INSERT INTO public.sandwich_collections VALUES (2744, '2025-03-19', 'Intown/Druid Hills', 882, '[]', '2025-06-08 17:06:04.51');
INSERT INTO public.sandwich_collections VALUES (2737, '2025-03-12', 'Intown/Druid Hills', 796, '[]', '2025-06-08 17:06:03.884');
INSERT INTO public.sandwich_collections VALUES (2730, '2025-03-05', 'Intown/Druid Hills', 815, '[]', '2025-06-08 17:06:03.348');
INSERT INTO public.sandwich_collections VALUES (2723, '2025-02-26', 'Intown/Druid Hills', 605, '[]', '2025-06-08 17:06:02.812');
INSERT INTO public.sandwich_collections VALUES (2716, '2025-02-19', 'Intown/Druid Hills', 1371, '[]', '2025-06-08 17:06:02.277');
INSERT INTO public.sandwich_collections VALUES (2709, '2025-02-12', 'Intown/Druid Hills', 719, '[]', '2025-06-08 17:06:01.742');
INSERT INTO public.sandwich_collections VALUES (2703, '2025-02-05', 'Intown/Druid Hills', 854, '[]', '2025-06-08 17:06:01.285');
INSERT INTO public.sandwich_collections VALUES (2686, '2025-01-22', 'Intown/Druid Hills', 662, '[]', '2025-06-08 17:05:59.918');
INSERT INTO public.sandwich_collections VALUES (2681, '2025-01-20', 'Intown/Druid Hills', 2120, '[]', '2025-06-08 17:05:59.537');
INSERT INTO public.sandwich_collections VALUES (2674, '2025-01-15', 'Intown/Druid Hills', 727, '[]', '2025-06-08 17:05:59.005');
INSERT INTO public.sandwich_collections VALUES (2667, '2025-01-08', 'Intown/Druid Hills', 1064, '[]', '2025-06-08 17:05:58.469');
INSERT INTO public.sandwich_collections VALUES (2766, '2025-04-09', 'Flowery Branch', 225, '[]', '2025-06-08 17:06:06.192');
INSERT INTO public.sandwich_collections VALUES (2759, '2025-04-02', 'Flowery Branch', 272, '[]', '2025-06-08 17:06:05.657');
INSERT INTO public.sandwich_collections VALUES (2752, '2025-03-27', 'Flowery Branch', 256, '[]', '2025-06-08 17:06:05.12');
INSERT INTO public.sandwich_collections VALUES (2745, '2025-03-19', 'Flowery Branch', 400, '[]', '2025-06-08 17:06:04.586');
INSERT INTO public.sandwich_collections VALUES (2738, '2025-03-12', 'Flowery Branch', 275, '[]', '2025-06-08 17:06:03.96');
INSERT INTO public.sandwich_collections VALUES (2731, '2025-03-05', 'Flowery Branch', 351, '[]', '2025-06-08 17:06:03.424');
INSERT INTO public.sandwich_collections VALUES (2724, '2025-02-26', 'Flowery Branch', 516, '[]', '2025-06-08 17:06:02.889');
INSERT INTO public.sandwich_collections VALUES (2717, '2025-02-19', 'Flowery Branch', 284, '[]', '2025-06-08 17:06:02.353');
INSERT INTO public.sandwich_collections VALUES (2710, '2025-02-12', 'Flowery Branch', 141, '[]', '2025-06-08 17:06:01.818');
INSERT INTO public.sandwich_collections VALUES (2697, '2025-01-29', 'Flowery Branch', 402, '[]', '2025-06-08 17:06:00.755');
INSERT INTO public.sandwich_collections VALUES (2675, '2025-01-15', 'Flowery Branch', 230, '[]', '2025-06-08 17:05:59.081');
INSERT INTO public.sandwich_collections VALUES (2668, '2025-01-08', 'Flowery Branch', 426, '[]', '2025-06-08 17:05:58.545');
INSERT INTO public.sandwich_collections VALUES (2769, '2025-04-16', 'Dunwoody/PTC', 2103, '[]', '2025-06-08 17:06:06.421');
INSERT INTO public.sandwich_collections VALUES (2762, '2025-04-09', 'Dunwoody/PTC', 1226, '[]', '2025-06-08 17:06:05.886');
INSERT INTO public.sandwich_collections VALUES (2755, '2025-04-02', 'Dunwoody/PTC', 2053, '[]', '2025-06-08 17:06:05.349');
INSERT INTO public.sandwich_collections VALUES (2748, '2025-03-27', 'Dunwoody/PTC', 1503, '[]', '2025-06-08 17:06:04.815');
INSERT INTO public.sandwich_collections VALUES (2734, '2025-03-12', 'Dunwoody/PTC', 840, '[]', '2025-06-08 17:06:03.653');
INSERT INTO public.sandwich_collections VALUES (2727, '2025-03-05', 'Dunwoody/PTC', 769, '[]', '2025-06-08 17:06:03.119');
INSERT INTO public.sandwich_collections VALUES (2720, '2025-02-26', 'Dunwoody/PTC', 1153, '[]', '2025-06-08 17:06:02.582');
INSERT INTO public.sandwich_collections VALUES (2713, '2025-02-19', 'Dunwoody/PTC', 2667, '[]', '2025-06-08 17:06:02.047');
INSERT INTO public.sandwich_collections VALUES (2706, '2025-02-12', 'Dunwoody/PTC', 1272, '[]', '2025-06-08 17:06:01.513');
INSERT INTO public.sandwich_collections VALUES (2700, '2025-02-05', 'Dunwoody/PTC', 2173, '[]', '2025-06-08 17:06:00.984');
INSERT INTO public.sandwich_collections VALUES (2683, '2025-01-22', 'Dunwoody/PTC', 986, '[]', '2025-06-08 17:05:59.689');
INSERT INTO public.sandwich_collections VALUES (2678, '2025-01-20', 'Dunwoody/PTC', 792, '[]', '2025-06-08 17:05:59.309');
INSERT INTO public.sandwich_collections VALUES (2671, '2025-01-15', 'Dunwoody/PTC', 2384, '[]', '2025-06-08 17:05:58.775');
INSERT INTO public.sandwich_collections VALUES (2775, '2025-04-23', 'Alpharetta', 2244, '[]', '2025-06-08 17:06:06.933');
INSERT INTO public.sandwich_collections VALUES (2789, '2025-05-07', 'Alpharetta', 2396, '[]', '2025-06-08 17:06:08.004');
INSERT INTO public.sandwich_collections VALUES (2796, '2025-05-14', 'Alpharetta', 2520, '[]', '2025-06-08 17:06:08.537');
INSERT INTO public.sandwich_collections VALUES (2810, '2025-05-28', 'Alpharetta', 1575, '[]', '2025-06-08 17:06:09.667');
INSERT INTO public.sandwich_collections VALUES (2784, '', 'East Cobb/Roswell', 915, '[]', '2025-06-08 17:06:07.62');
INSERT INTO public.sandwich_collections VALUES (2798, '2025-05-14', 'East Cobb/Roswell', 726, '[]', '2025-06-08 17:06:08.691');
INSERT INTO public.sandwich_collections VALUES (2791, '2025-05-07', 'East Cobb/Roswell', 1052, '[]', '2025-06-08 17:06:08.156');
INSERT INTO public.sandwich_collections VALUES (2782, '', 'Alpharetta', 618, '[]', '2025-06-08 17:06:07.468');
INSERT INTO public.sandwich_collections VALUES (2777, '2025-04-23', 'East Cobb/Roswell', 1122, '[]', '2025-06-08 17:06:07.086');
INSERT INTO public.sandwich_collections VALUES (2735, '2025-03-12', 'East Cobb/Roswell', 1597, '[]', '2025-06-08 17:06:03.73');
INSERT INTO public.sandwich_collections VALUES (2684, '2025-01-22', 'East Cobb/Roswell', 1192, '[]', '2025-06-08 17:05:59.765');
INSERT INTO public.sandwich_collections VALUES (2665, '2025-01-08', 'East Cobb/Roswell', 1115, '[]', '2025-06-08 17:05:58.316');
INSERT INTO public.sandwich_collections VALUES (2623, '2024-11-13', 'East Cobb/Roswell', 1389, '[]', '2025-06-08 17:05:55.035');
INSERT INTO public.sandwich_collections VALUES (2570, '2024-09-18', 'East Cobb/Roswell', 1323, '[]', '2025-06-08 17:05:50.932');
INSERT INTO public.sandwich_collections VALUES (2554, '2024-09-04', 'East Cobb/Roswell', 1148, '[]', '2025-06-08 17:05:49.612');
INSERT INTO public.sandwich_collections VALUES (2499, '2024-07-17', 'East Cobb/Roswell', 1820, '[]', '2025-06-08 17:05:45.31');
INSERT INTO public.sandwich_collections VALUES (2492, '2024-07-10', 'East Cobb/Roswell', 2170, '[]', '2025-06-08 17:05:44.776');
INSERT INTO public.sandwich_collections VALUES (2447, '2024-05-22', 'East Cobb/Roswell', 582, '[]', '2025-06-08 17:05:41.124');
INSERT INTO public.sandwich_collections VALUES (2439, '2024-05-15', 'East Cobb/Roswell', 1259, '[]', '2025-06-08 17:05:40.51');
INSERT INTO public.sandwich_collections VALUES (2379, '2024-03-06', 'East Cobb/Roswell', 1160, '[]', '2025-06-08 17:05:35.698');
INSERT INTO public.sandwich_collections VALUES (2338, '2024-01-31', 'East Cobb/Roswell', 1296, '[]', '2025-06-08 17:05:32.405');
INSERT INTO public.sandwich_collections VALUES (2321, '2024-01-17', 'East Cobb/Roswell', 1297, '[]', '2025-06-08 17:05:30.995');
INSERT INTO public.sandwich_collections VALUES (2262, '2023-11-15', 'East Cobb/Roswell', 1501, '[]', '2025-06-08 17:05:26.384');
INSERT INTO public.sandwich_collections VALUES (2236, '2023-10-25', 'East Cobb/Roswell', 1379, '[]', '2025-06-08 17:05:24.3');
INSERT INTO public.sandwich_collections VALUES (2218, '2023-10-11', 'East Cobb/Roswell', 1605, '[]', '2025-06-08 17:05:22.928');
INSERT INTO public.sandwich_collections VALUES (2156, '2023-08-24', 'East Cobb/Roswell', 970, '[]', '2025-06-08 17:05:18.029');
INSERT INTO public.sandwich_collections VALUES (2122, '2023-07-26', 'East Cobb/Roswell', 1864, '[]', '2025-06-08 17:05:15.388');
INSERT INTO public.sandwich_collections VALUES (2106, '2023-07-11', 'East Cobb/Roswell', 1690, '[]', '2025-06-08 17:05:14.055');
INSERT INTO public.sandwich_collections VALUES (2046, '2023-05-17', 'East Cobb/Roswell', 1246, '[]', '2025-06-08 17:05:09.369');
INSERT INTO public.sandwich_collections VALUES (2019, '2023-04-26', 'East Cobb/Roswell', 1034, '[]', '2025-06-08 17:05:07.258');
INSERT INTO public.sandwich_collections VALUES (1983, '2023-03-29', 'East Cobb/Roswell', 1310, '[]', '2025-06-08 17:05:04.478');
INSERT INTO public.sandwich_collections VALUES (1876, '2022-12-28', 'East Cobb/Roswell', 1411, '[]', '2025-06-08 17:04:56.089');
INSERT INTO public.sandwich_collections VALUES (1816, '2022-11-09', 'East Cobb/Roswell', 347, '[]', '2025-06-08 17:04:51.4');
INSERT INTO public.sandwich_collections VALUES (1805, '2022-11-02', 'East Cobb/Roswell', 190, '[]', '2025-06-08 17:04:50.566');
INSERT INTO public.sandwich_collections VALUES (1761, '2022-10-05', 'East Cobb/Roswell', 226, '[]', '2025-06-08 17:04:47.157');
INSERT INTO public.sandwich_collections VALUES (1695, '2022-08-31', 'East Cobb/Roswell', 224, '[]', '2025-06-08 17:04:41.896');
INSERT INTO public.sandwich_collections VALUES (1684, '2022-08-17', 'East Cobb/Roswell', 199, '[]', '2025-06-08 17:04:41.062');
INSERT INTO public.sandwich_collections VALUES (1633, '2022-07-13', 'East Cobb/Roswell', 370, '[]', '2025-06-08 17:04:37.017');
INSERT INTO public.sandwich_collections VALUES (1599, '2022-06-22', 'East Cobb/Roswell', 2897, '[]', '2025-06-08 17:04:34.373');
INSERT INTO public.sandwich_collections VALUES (1590, '2022-06-15', 'East Cobb/Roswell', 2841, '[]', '2025-06-08 17:04:33.692');
INSERT INTO public.sandwich_collections VALUES (1529, '2022-02-15', 'East Cobb/Roswell', 388, '[]', '2025-06-08 17:04:28.858');
INSERT INTO public.sandwich_collections VALUES (1494, '2022-02-12', 'East Cobb/Roswell', 1892, '[]', '2025-06-08 17:04:26.099');
INSERT INTO public.sandwich_collections VALUES (1486, '2022-02-11', 'East Cobb/Roswell', 496, '[]', '2025-06-08 17:04:25.487');
INSERT INTO public.sandwich_collections VALUES (1435, '2022-02-06', 'East Cobb/Roswell', 249, '[]', '2025-06-08 17:04:21.44');
INSERT INTO public.sandwich_collections VALUES (1391, '2022-01-26', 'East Cobb/Roswell', 2210, '[]', '2025-06-08 17:04:17.995');
INSERT INTO public.sandwich_collections VALUES (1385, '2022-01-19', 'East Cobb/Roswell', 4109, '[]', '2025-06-08 17:04:17.489');
INSERT INTO public.sandwich_collections VALUES (1380, '2022-01-17', 'East Cobb/Roswell', 879, '[]', '2025-06-08 17:04:17.108');
INSERT INTO public.sandwich_collections VALUES (1341, '2021-11-17', 'East Cobb/Roswell', 229, '[]', '2025-06-08 17:04:14.042');
INSERT INTO public.sandwich_collections VALUES (1310, '2021-10-13', 'East Cobb/Roswell', 266, '[]', '2025-06-08 17:04:11.575');
INSERT INTO public.sandwich_collections VALUES (2806, '2025-05-21', 'Sandy Springs', 644, '[]', '2025-06-08 17:06:09.359');
INSERT INTO public.sandwich_collections VALUES (2799, '2025-05-14', 'Sandy Springs', 631, '[]', '2025-06-08 17:06:08.767');
INSERT INTO public.sandwich_collections VALUES (2792, '2025-05-07', 'Sandy Springs', 599, '[]', '2025-06-08 17:06:08.233');
INSERT INTO public.sandwich_collections VALUES (2783, '', 'Dunwoody/PTC', 2032, '[]', '2025-06-08 17:06:07.544');
INSERT INTO public.sandwich_collections VALUES (2778, '2025-04-23', 'Sandy Springs', 527, '[]', '2025-06-08 17:06:07.163');
INSERT INTO public.sandwich_collections VALUES (2708, '2025-02-12', 'Sandy Springs', 538, '[]', '2025-06-08 17:06:01.666');
INSERT INTO public.sandwich_collections VALUES (2533, '2024-08-14', 'Sandy Springs', 356, '[]', '2025-06-08 17:05:48.008');
INSERT INTO public.sandwich_collections VALUES (2398, '2024-03-20', 'Sandy Springs', 736, '[]', '2025-06-08 17:05:37.273');
INSERT INTO public.sandwich_collections VALUES (2149, '2023-08-16', 'Sandy Springs', 298, '[]', '2025-06-08 17:05:17.502');
INSERT INTO public.sandwich_collections VALUES (1795, '2022-10-26', 'Sandy Springs', 1106, '[]', '2025-06-08 17:04:49.806');
INSERT INTO public.sandwich_collections VALUES (1348, '2021-11-22', 'Sandy Springs', 350, '[]', '2025-06-08 17:04:14.575');
INSERT INTO public.sandwich_collections VALUES (2811, '2025-05-28', 'Intown/Druid Hills', 832, '[]', '2025-06-08 17:06:09.743');
INSERT INTO public.sandwich_collections VALUES (2807, '2025-05-21', 'Intown/Druid Hills', 516, '[]', '2025-06-08 17:06:09.436');
INSERT INTO public.sandwich_collections VALUES (2800, '2025-05-14', 'Intown/Druid Hills', 921, '[]', '2025-06-08 17:06:08.844');
INSERT INTO public.sandwich_collections VALUES (2793, '2025-05-07', 'Intown/Druid Hills', 853, '[]', '2025-06-08 17:06:08.309');
INSERT INTO public.sandwich_collections VALUES (2787, '', 'Flowery Branch', 398, '[]', '2025-06-08 17:06:07.851');
INSERT INTO public.sandwich_collections VALUES (2779, '2025-04-23', 'Intown/Druid Hills', 1344, '[]', '2025-06-08 17:06:07.239');
INSERT INTO public.sandwich_collections VALUES (2772, '2025-04-16', 'Intown/Druid Hills', 1240, '[]', '2025-06-08 17:06:06.704');
INSERT INTO public.sandwich_collections VALUES (2696, '2025-01-29', 'Intown/Druid Hills', 1992, '[]', '2025-06-08 17:06:00.678');
INSERT INTO public.sandwich_collections VALUES (2656, '2024-12-18', 'Intown/Druid Hills', 922, '[]', '2025-06-08 17:05:57.621');
INSERT INTO public.sandwich_collections VALUES (2510, '2024-07-24', 'Intown/Druid Hills', 932, '[]', '2025-06-08 17:05:46.156');
INSERT INTO public.sandwich_collections VALUES (2373, '2024-02-28', 'Intown/Druid Hills', 749, '[]', '2025-06-08 17:05:35.238');
INSERT INTO public.sandwich_collections VALUES (2341, '2024-01-31', 'Intown/Druid Hills', 723, '[]', '2025-06-08 17:05:32.637');
INSERT INTO public.sandwich_collections VALUES (2125, '2023-07-26', 'Intown/Druid Hills', 923, '[]', '2025-06-08 17:05:15.614');
INSERT INTO public.sandwich_collections VALUES (1978, '2023-03-22', 'Intown/Druid Hills', 279, '[]', '2025-06-08 17:05:04.1');
INSERT INTO public.sandwich_collections VALUES (1870, '2022-12-21', 'Intown/Druid Hills', 300, '[]', '2025-06-08 17:04:55.632');
INSERT INTO public.sandwich_collections VALUES (1697, '2022-08-31', 'Intown/Druid Hills', 106, '[]', '2025-06-08 17:04:42.159');
INSERT INTO public.sandwich_collections VALUES (2808, '2025-05-21', 'Flowery Branch', 285, '[]', '2025-06-08 17:06:09.513');
INSERT INTO public.sandwich_collections VALUES (2801, '2025-05-14', 'Flowery Branch', 298, '[]', '2025-06-08 17:06:08.921');
INSERT INTO public.sandwich_collections VALUES (2794, '2025-05-07', 'Flowery Branch', 262, '[]', '2025-06-08 17:06:08.384');
INSERT INTO public.sandwich_collections VALUES (2785, '', 'Sandy Springs', 744, '[]', '2025-06-08 17:06:07.697');
INSERT INTO public.sandwich_collections VALUES (2780, '2025-04-23', 'Flowery Branch', 350, '[]', '2025-06-08 17:06:07.315');
INSERT INTO public.sandwich_collections VALUES (2773, '2025-04-16', 'Flowery Branch', 175, '[]', '2025-06-08 17:06:06.78');
INSERT INTO public.sandwich_collections VALUES (2804, '2025-05-21', 'Dunwoody/PTC', 1783, '[]', '2025-06-08 17:06:09.204');
INSERT INTO public.sandwich_collections VALUES (2797, '2025-05-14', 'Dunwoody/PTC', 2316, '[]', '2025-06-08 17:06:08.614');
INSERT INTO public.sandwich_collections VALUES (2790, '2025-05-07', 'Dunwoody/PTC', 2607, '[]', '2025-06-08 17:06:08.08');
INSERT INTO public.sandwich_collections VALUES (2776, '2025-04-23', 'Dunwoody/PTC', 2223, '[]', '2025-06-08 17:06:07.009');
INSERT INTO public.sandwich_collections VALUES (2802, '2025-05-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1800}]', '2025-06-08 17:06:08.998');
INSERT INTO public.sandwich_collections VALUES (2795, '2025-05-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":800}]', '2025-06-08 17:06:08.46');
INSERT INTO public.sandwich_collections VALUES (2803, '2025-05-21', 'Alpharetta', 950, '[]', '2025-06-08 17:06:09.125');
INSERT INTO public.sandwich_collections VALUES (2774, '2025-04-16', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1450}]', '2025-06-08 17:06:06.857');
INSERT INTO public.sandwich_collections VALUES (2805, '2025-05-21', 'East Cobb/Roswell', 1403, '[]', '2025-06-08 17:06:09.283');
INSERT INTO public.sandwich_collections VALUES (2786, '', 'Intown/Druid Hills', 1198, '[]', '2025-06-08 17:06:07.774');
INSERT INTO public.sandwich_collections VALUES (1592, '2022-06-15', 'Intown/Druid Hills', 93, '[]', '2025-06-08 17:04:33.844');
INSERT INTO public.sandwich_collections VALUES (1428, '2022-02-05', 'Intown/Druid Hills', 304, '[]', '2025-06-08 17:04:20.909');
INSERT INTO public.sandwich_collections VALUES (2581, '2024-09-25', 'Flowery Branch', 545, '[]', '2025-06-08 17:05:51.77');
INSERT INTO public.sandwich_collections VALUES (2241, '2023-10-25', 'Flowery Branch', 1163, '[]', '2025-06-08 17:05:24.681');
INSERT INTO public.sandwich_collections VALUES (2196, '2023-09-20', 'Flowery Branch', 635, '[]', '2025-06-08 17:05:21.146');
INSERT INTO public.sandwich_collections VALUES (2024, '2023-04-26', 'Flowery Branch', 374, '[]', '2025-06-08 17:05:07.701');
INSERT INTO public.sandwich_collections VALUES (1777, '2022-10-12', 'Flowery Branch', 200, '[]', '2025-06-08 17:04:48.37');
INSERT INTO public.sandwich_collections VALUES (2741, '2025-03-19', 'Dunwoody/PTC', 1097, '[]', '2025-06-08 17:06:04.278');
INSERT INTO public.sandwich_collections VALUES (2545, '2024-08-28', 'Dunwoody/PTC', 1322, '[]', '2025-06-08 17:05:48.923');
INSERT INTO public.sandwich_collections VALUES (2369, '2024-02-28', 'Dunwoody/PTC', 1708, '[]', '2025-06-08 17:05:34.931');
INSERT INTO public.sandwich_collections VALUES (2138, '2023-08-09', 'Dunwoody/PTC', 1777, '[]', '2025-06-08 17:05:16.597');
INSERT INTO public.sandwich_collections VALUES (1982, '2023-03-29', 'Dunwoody/PTC', 4041, '[]', '2025-06-08 17:05:04.402');
INSERT INTO public.sandwich_collections VALUES (1846, '2022-12-07', 'Dunwoody/PTC', 1238, '[]', '2025-06-08 17:04:53.802');
INSERT INTO public.sandwich_collections VALUES (1332, '2021-11-10', 'Dunwoody/PTC', 3728, '[]', '2025-06-08 17:04:13.363');
INSERT INTO public.sandwich_collections VALUES (1281, '2021-09-15', 'Dunwoody/PTC', 1989, '[]', '2025-06-08 17:04:09.31');
INSERT INTO public.sandwich_collections VALUES (2555, '2024-09-04', 'Decatur', 54, '[]', '2025-06-08 17:05:49.688');
INSERT INTO public.sandwich_collections VALUES (2263, '2023-11-15', 'Decatur', 91, '[]', '2025-06-08 17:05:26.461');
INSERT INTO public.sandwich_collections VALUES (2038, '2023-05-10', 'Decatur', 156, '[]', '2025-06-08 17:05:08.761');
INSERT INTO public.sandwich_collections VALUES (1623, '2022-07-06', 'Decatur', 107, '[]', '2025-06-08 17:04:36.26');
INSERT INTO public.sandwich_collections VALUES (1539, '2022-05-11', 'Decatur', 154, '[]', '2025-06-08 17:04:29.621');
INSERT INTO public.sandwich_collections VALUES (2350, '2024-02-07', 'Snellville', 110, '[]', '2025-06-08 17:05:33.33');
INSERT INTO public.sandwich_collections VALUES (2160, '2023-08-24', 'Snellville', 172, '[]', '2025-06-08 17:05:18.33');
INSERT INTO public.sandwich_collections VALUES (2014, '2023-04-19', 'Snellville', 239, '[]', '2025-06-08 17:05:06.882');
INSERT INTO public.sandwich_collections VALUES (1841, '2022-11-30', 'Snellville', 200, '[]', '2025-06-08 17:04:53.419');
INSERT INTO public.sandwich_collections VALUES (1808, '2022-11-02', 'Snellville', 105, '[]', '2025-06-08 17:04:50.793');
INSERT INTO public.sandwich_collections VALUES (1466, '2022-02-09', 'Snellville', 150, '[]', '2025-06-08 17:04:23.906');
INSERT INTO public.sandwich_collections VALUES (2781, '2025-04-23', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3040}]', '2025-06-08 17:06:07.391');
INSERT INTO public.sandwich_collections VALUES (2809, '2025-05-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4810}]', '2025-06-08 17:06:09.59');
INSERT INTO public.sandwich_collections VALUES (1481, '2022-02-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":180}]', '2025-06-08 17:04:25.107');
INSERT INTO public.sandwich_collections VALUES (1512, '2022-02-13', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1005}]', '2025-06-08 17:04:27.572');
INSERT INTO public.sandwich_collections VALUES (1523, '2022-02-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":575}]', '2025-06-08 17:04:28.402');
INSERT INTO public.sandwich_collections VALUES (1534, '2022-02-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":190}]', '2025-06-08 17:04:29.239');
INSERT INTO public.sandwich_collections VALUES (1555, '2022-05-18', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":450}]', '2025-06-08 17:04:30.954');
INSERT INTO public.sandwich_collections VALUES (1567, '2022-05-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":800}]', '2025-06-08 17:04:31.869');
INSERT INTO public.sandwich_collections VALUES (1586, '2022-06-08', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1809}]', '2025-06-08 17:04:33.388');
INSERT INTO public.sandwich_collections VALUES (1595, '2022-06-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":450}]', '2025-06-08 17:04:34.071');
INSERT INTO public.sandwich_collections VALUES (1618, '2022-06-29', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":151}]', '2025-06-08 17:04:35.88');
INSERT INTO public.sandwich_collections VALUES (1647, '2022-07-20', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1740}]', '2025-06-08 17:04:38.152');
INSERT INTO public.sandwich_collections VALUES (1657, '2022-07-27', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":525}]', '2025-06-08 17:04:38.911');
INSERT INTO public.sandwich_collections VALUES (1678, '2022-08-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":375}]', '2025-06-08 17:04:40.608');
INSERT INTO public.sandwich_collections VALUES (1689, '2022-08-17', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1391}]', '2025-06-08 17:04:41.442');
INSERT INTO public.sandwich_collections VALUES (1690, '2022-08-24', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5986}]', '2025-06-08 17:04:41.518');
INSERT INTO public.sandwich_collections VALUES (1702, '2022-08-31', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":350}]', '2025-06-08 17:04:42.536');
INSERT INTO public.sandwich_collections VALUES (1730, '2022-09-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2138}]', '2025-06-08 17:04:44.738');
INSERT INTO public.sandwich_collections VALUES (1745, '2022-09-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1500}]', '2025-06-08 17:04:45.875');
INSERT INTO public.sandwich_collections VALUES (1756, '2022-09-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1320}]', '2025-06-08 17:04:46.777');
INSERT INTO public.sandwich_collections VALUES (1767, '2022-10-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2079}]', '2025-06-08 17:04:47.613');
INSERT INTO public.sandwich_collections VALUES (1778, '2022-10-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":653}]', '2025-06-08 17:04:48.446');
INSERT INTO public.sandwich_collections VALUES (1789, '2022-10-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2363}]', '2025-06-08 17:04:49.353');
INSERT INTO public.sandwich_collections VALUES (1800, '2022-10-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1167}]', '2025-06-08 17:04:50.19');
INSERT INTO public.sandwich_collections VALUES (1822, '2022-11-09', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5030}]', '2025-06-08 17:04:51.931');
INSERT INTO public.sandwich_collections VALUES (1833, '2022-11-16', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":10728}]', '2025-06-08 17:04:52.764');
INSERT INTO public.sandwich_collections VALUES (1844, '2022-11-30', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4652}]', '2025-06-08 17:04:53.65');
INSERT INTO public.sandwich_collections VALUES (1855, '2022-12-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2722}]', '2025-06-08 17:04:54.482');
INSERT INTO public.sandwich_collections VALUES (1873, '2022-12-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4000}]', '2025-06-08 17:04:55.859');
INSERT INTO public.sandwich_collections VALUES (1882, '2022-12-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":100}]', '2025-06-08 17:04:56.617');
INSERT INTO public.sandwich_collections VALUES (1929, '2023-02-01', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2998}]', '2025-06-08 17:05:00.274');
INSERT INTO public.sandwich_collections VALUES (1946, '2023-02-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4485}]', '2025-06-08 17:05:01.564');
INSERT INTO public.sandwich_collections VALUES (1956, '2023-02-22', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":200}]', '2025-06-08 17:05:02.42');
INSERT INTO public.sandwich_collections VALUES (1989, '2023-03-29', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":503}]', '2025-06-08 17:05:04.998');
INSERT INTO public.sandwich_collections VALUES (1998, '2023-04-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1238}]', '2025-06-08 17:05:05.677');
INSERT INTO public.sandwich_collections VALUES (2007, '2023-04-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":500}]', '2025-06-08 17:05:06.354');
INSERT INTO public.sandwich_collections VALUES (2016, '2023-04-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5019}]', '2025-06-08 17:05:07.032');
INSERT INTO public.sandwich_collections VALUES (2025, '2023-04-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1906}]', '2025-06-08 17:05:07.777');
INSERT INTO public.sandwich_collections VALUES (2034, '2023-05-03', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":500}]', '2025-06-08 17:05:08.457');
INSERT INTO public.sandwich_collections VALUES (2043, '2023-05-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":808}]', '2025-06-08 17:05:09.141');
INSERT INTO public.sandwich_collections VALUES (2052, '2023-05-17', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":350}]', '2025-06-08 17:05:09.822');
INSERT INTO public.sandwich_collections VALUES (2060, '2023-05-24', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1900}]', '2025-06-08 17:05:10.499');
INSERT INTO public.sandwich_collections VALUES (2069, '2023-05-31', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":841}]', '2025-06-08 17:05:11.212');
INSERT INTO public.sandwich_collections VALUES (2078, '2023-06-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1508}]', '2025-06-08 17:05:11.891');
INSERT INTO public.sandwich_collections VALUES (2087, '2023-06-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1931}]', '2025-06-08 17:05:12.62');
INSERT INTO public.sandwich_collections VALUES (2095, '2023-06-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1347}]', '2025-06-08 17:05:13.224');
INSERT INTO public.sandwich_collections VALUES (2103, '2023-06-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3098}]', '2025-06-08 17:05:13.828');
INSERT INTO public.sandwich_collections VALUES (2111, '2023-07-11', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1664}]', '2025-06-08 17:05:14.432');
INSERT INTO public.sandwich_collections VALUES (2119, '2023-07-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2113}]', '2025-06-08 17:05:15.161');
INSERT INTO public.sandwich_collections VALUES (2128, '2023-07-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":855}]', '2025-06-08 17:05:15.841');
INSERT INTO public.sandwich_collections VALUES (2144, '2023-08-09', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":432}]', '2025-06-08 17:05:17.124');
INSERT INTO public.sandwich_collections VALUES (2153, '2023-08-16', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":7479}]', '2025-06-08 17:05:17.803');
INSERT INTO public.sandwich_collections VALUES (2162, '2023-08-24', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1235}]', '2025-06-08 17:05:18.481');
INSERT INTO public.sandwich_collections VALUES (2171, '2023-08-30', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1485}]', '2025-06-08 17:05:19.161');
INSERT INTO public.sandwich_collections VALUES (2180, '2023-09-06', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1106}]', '2025-06-08 17:05:19.924');
INSERT INTO public.sandwich_collections VALUES (2189, '2023-09-13', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2045}]', '2025-06-08 17:05:20.61');
INSERT INTO public.sandwich_collections VALUES (2197, '2023-09-20', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1178}]', '2025-06-08 17:05:21.222');
INSERT INTO public.sandwich_collections VALUES (2206, '2023-09-27', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3005}]', '2025-06-08 17:05:21.91');
INSERT INTO public.sandwich_collections VALUES (2215, '2023-10-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1482}]', '2025-06-08 17:05:22.699');
INSERT INTO public.sandwich_collections VALUES (2224, '2023-10-11', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":194}]', '2025-06-08 17:05:23.386');
INSERT INTO public.sandwich_collections VALUES (2233, '2023-10-18', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3635}]', '2025-06-08 17:05:24.072');
INSERT INTO public.sandwich_collections VALUES (2242, '2023-10-25', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2985}]', '2025-06-08 17:05:24.757');
INSERT INTO public.sandwich_collections VALUES (2251, '2023-11-01', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1055}]', '2025-06-08 17:05:25.446');
INSERT INTO public.sandwich_collections VALUES (2259, '2023-11-08', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1761}]', '2025-06-08 17:05:26.156');
INSERT INTO public.sandwich_collections VALUES (2268, '2023-11-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":11278}]', '2025-06-08 17:05:26.843');
INSERT INTO public.sandwich_collections VALUES (2277, '2023-11-29', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":332}]', '2025-06-08 17:05:27.532');
INSERT INTO public.sandwich_collections VALUES (2286, '2023-12-06', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4981}]', '2025-06-08 17:05:28.219');
INSERT INTO public.sandwich_collections VALUES (2295, '2023-12-13', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1844}]', '2025-06-08 17:05:29.01');
INSERT INTO public.sandwich_collections VALUES (2303, '2023-12-20', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":8696}]', '2025-06-08 17:05:29.62');
INSERT INTO public.sandwich_collections VALUES (2318, '2024-01-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":485}]', '2025-06-08 17:05:30.765');
INSERT INTO public.sandwich_collections VALUES (2327, '2024-01-17', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":12252}]', '2025-06-08 17:05:31.456');
INSERT INTO public.sandwich_collections VALUES (2335, '2024-01-24', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1718}]', '2025-06-08 17:05:32.166');
INSERT INTO public.sandwich_collections VALUES (2343, '2024-01-31', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3254}]', '2025-06-08 17:05:32.792');
INSERT INTO public.sandwich_collections VALUES (2359, '2024-02-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3141}]', '2025-06-08 17:05:34.015');
INSERT INTO public.sandwich_collections VALUES (2367, '2024-02-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":7050}]', '2025-06-08 17:05:34.777');
INSERT INTO public.sandwich_collections VALUES (2376, '2024-02-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1000}]', '2025-06-08 17:05:35.468');
INSERT INTO public.sandwich_collections VALUES (2385, '2024-03-06', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4544}]', '2025-06-08 17:05:36.166');
INSERT INTO public.sandwich_collections VALUES (2393, '2024-03-13', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1734}]', '2025-06-08 17:05:36.788');
INSERT INTO public.sandwich_collections VALUES (2401, '2024-03-20', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4771}]', '2025-06-08 17:05:37.503');
INSERT INTO public.sandwich_collections VALUES (2407, '2024-04-03', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":200}]', '2025-06-08 17:05:37.962');
INSERT INTO public.sandwich_collections VALUES (2414, '2024-04-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4287}]', '2025-06-08 17:05:38.513');
INSERT INTO public.sandwich_collections VALUES (2420, '2024-04-17', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2052}]', '2025-06-08 17:05:38.976');
INSERT INTO public.sandwich_collections VALUES (2428, '2024-05-01', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2382}]', '2025-06-08 17:05:39.665');
INSERT INTO public.sandwich_collections VALUES (2436, '2024-05-08', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1559}]', '2025-06-08 17:05:40.281');
INSERT INTO public.sandwich_collections VALUES (2444, '2024-05-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2333}]', '2025-06-08 17:05:40.893');
INSERT INTO public.sandwich_collections VALUES (2451, '2024-05-22', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":402}]', '2025-06-08 17:05:41.434');
INSERT INTO public.sandwich_collections VALUES (2458, '2024-05-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":806}]', '2025-06-08 17:05:42.075');
INSERT INTO public.sandwich_collections VALUES (2466, '2024-06-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":100}]', '2025-06-08 17:05:42.686');
INSERT INTO public.sandwich_collections VALUES (2474, '2024-06-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2084}]', '2025-06-08 17:05:43.299');
INSERT INTO public.sandwich_collections VALUES (2482, '2024-06-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1432}]', '2025-06-08 17:05:43.914');
INSERT INTO public.sandwich_collections VALUES (2489, '2024-06-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2972}]', '2025-06-08 17:05:44.449');
INSERT INTO public.sandwich_collections VALUES (2496, '2024-07-10', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3032}]', '2025-06-08 17:05:45.08');
INSERT INTO public.sandwich_collections VALUES (2504, '2024-07-17', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2476}]', '2025-06-08 17:05:45.697');
INSERT INTO public.sandwich_collections VALUES (2512, '2024-07-24', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2700}]', '2025-06-08 17:05:46.308');
INSERT INTO public.sandwich_collections VALUES (2520, '2024-07-31', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2013}]', '2025-06-08 17:05:46.919');
INSERT INTO public.sandwich_collections VALUES (2528, '2024-08-07', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5000}]', '2025-06-08 17:05:47.627');
INSERT INTO public.sandwich_collections VALUES (2536, '2024-08-14', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":450}]', '2025-06-08 17:05:48.237');
INSERT INTO public.sandwich_collections VALUES (2543, '2024-08-21', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2326}]', '2025-06-08 17:05:48.77');
INSERT INTO public.sandwich_collections VALUES (2551, '2024-08-28', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":200}]', '2025-06-08 17:05:49.383');
INSERT INTO public.sandwich_collections VALUES (2559, '2024-09-04', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1400}]', '2025-06-08 17:05:49.994');
INSERT INTO public.sandwich_collections VALUES (2567, '2024-09-11', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3400}]', '2025-06-08 17:05:50.703');
INSERT INTO public.sandwich_collections VALUES (2575, '2024-09-18', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3015}]', '2025-06-08 17:05:51.314');
INSERT INTO public.sandwich_collections VALUES (2582, '2024-09-25', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5650}]', '2025-06-08 17:05:51.847');
INSERT INTO public.sandwich_collections VALUES (2583, '2024-10-02', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":14023}]', '2025-06-08 17:05:51.924');
INSERT INTO public.sandwich_collections VALUES (2591, '2024-10-09', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1900}]', '2025-06-08 17:05:52.533');
INSERT INTO public.sandwich_collections VALUES (2599, '2024-10-16', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3746}]', '2025-06-08 17:05:53.144');
INSERT INTO public.sandwich_collections VALUES (2606, '2024-10-23', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4279}]', '2025-06-08 17:05:53.677');
INSERT INTO public.sandwich_collections VALUES (2613, '2024-10-30', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1330}]', '2025-06-08 17:05:54.271');
INSERT INTO public.sandwich_collections VALUES (2620, '2024-11-06', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":550}]', '2025-06-08 17:05:54.806');
INSERT INTO public.sandwich_collections VALUES (2628, '2024-11-13', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1780}]', '2025-06-08 17:05:55.416');
INSERT INTO public.sandwich_collections VALUES (2636, '2024-11-20', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":6409}]', '2025-06-08 17:05:56.031');
INSERT INTO public.sandwich_collections VALUES (2644, '2024-12-04', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1500}]', '2025-06-08 17:05:56.642');
INSERT INTO public.sandwich_collections VALUES (2651, '2024-12-11', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":6570}]', '2025-06-08 17:05:57.182');
INSERT INTO public.sandwich_collections VALUES (2658, '2024-12-18', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5100}]', '2025-06-08 17:05:57.774');
INSERT INTO public.sandwich_collections VALUES (2660, '2024-12-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2000}]', '2025-06-08 17:05:57.926');
INSERT INTO public.sandwich_collections VALUES (2669, '2025-01-08', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":900}]', '2025-06-08 17:05:58.622');
INSERT INTO public.sandwich_collections VALUES (2676, '2025-01-15', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1730}]', '2025-06-08 17:05:59.157');
INSERT INTO public.sandwich_collections VALUES (2698, '2025-01-29', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":7140}]', '2025-06-08 17:06:00.831');
INSERT INTO public.sandwich_collections VALUES (2704, '2025-02-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2600}]', '2025-06-08 17:06:01.361');
INSERT INTO public.sandwich_collections VALUES (2711, '2025-02-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4474}]', '2025-06-08 17:06:01.894');
INSERT INTO public.sandwich_collections VALUES (2718, '2025-02-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2650}]', '2025-06-08 17:06:02.429');
INSERT INTO public.sandwich_collections VALUES (2725, '2025-02-26', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":1380}]', '2025-06-08 17:06:02.967');
INSERT INTO public.sandwich_collections VALUES (2732, '2025-03-05', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4795}]', '2025-06-08 17:06:03.5');
INSERT INTO public.sandwich_collections VALUES (2739, '2025-03-12', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":4780}]', '2025-06-08 17:06:04.125');
INSERT INTO public.sandwich_collections VALUES (2746, '2025-03-19', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":2618}]', '2025-06-08 17:06:04.662');
INSERT INTO public.sandwich_collections VALUES (2753, '2025-03-27', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":3278}]', '2025-06-08 17:06:05.196');
INSERT INTO public.sandwich_collections VALUES (2760, '2025-04-02', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":5518}]', '2025-06-08 17:06:05.733');
INSERT INTO public.sandwich_collections VALUES (2767, '2025-04-09', 'Groups - Main', 0, '[{"groupName":"Unnamed Groups","sandwichCount":153}]', '2025-06-08 17:06:06.269');
INSERT INTO public.sandwich_collections VALUES (2815, '2025-06-04', 'Alpharetta', 2767, '', '2025-06-14 03:13:17.621648');
INSERT INTO public.sandwich_collections VALUES (2816, '2025-06-04', 'Dunwoody/PTC', 1188, '', '2025-06-14 03:14:01.844409');
INSERT INTO public.sandwich_collections VALUES (2817, '2025-06-04', 'East Cobb/Roswell', 2059, '', '2025-06-14 03:14:21.017213');
INSERT INTO public.sandwich_collections VALUES (2818, '2025-06-04', 'Sandy Springs', 134, '', '2025-06-14 03:14:41.845669');
INSERT INTO public.sandwich_collections VALUES (2819, '2025-06-04', 'Flowery Branch', 689, '', '2025-06-14 03:15:05.292195');
INSERT INTO public.sandwich_collections VALUES (2820, '2025-06-04', 'Collective Learning', 250, '', '2025-06-14 03:20:04.941773');
INSERT INTO public.sandwich_collections VALUES (2821, '2025-06-11', 'Alpharetta', 2964, '', '2025-06-14 03:20:28.986432');
INSERT INTO public.sandwich_collections VALUES (2822, '2025-06-11', 'Dunwoody/PTC', 1251, '', '2025-06-14 03:20:54.425635');
INSERT INTO public.sandwich_collections VALUES (2823, '2025-06-11', 'East Cobb/Roswell', 1186, '', '2025-06-14 03:21:24.109425');
INSERT INTO public.sandwich_collections VALUES (2824, '2025-06-11', 'Sandy Springs', 203, '', '2025-06-14 03:21:40.684005');
INSERT INTO public.sandwich_collections VALUES (2825, '2025-06-11', 'Flowery Branch', 258, '', '2025-06-14 03:21:57.321829');
INSERT INTO public.sandwich_collections VALUES (2828, '2025-06-11', 'Groups', 4259, '[]', '2025-06-14 03:44:51.552884');
INSERT INTO public.sandwich_collections VALUES (2830, '2025-02-05', 'Collective Learning', 50, '[]', '2025-06-14 04:28:10.844');
INSERT INTO public.sandwich_collections VALUES (2831, '2025-02-12', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.044');
INSERT INTO public.sandwich_collections VALUES (2832, '2025-02-19', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.078');
INSERT INTO public.sandwich_collections VALUES (2833, '2025-02-26', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.111');
INSERT INTO public.sandwich_collections VALUES (2834, '2025-03-05', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.146');
INSERT INTO public.sandwich_collections VALUES (2835, '2025-03-12', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.18');
INSERT INTO public.sandwich_collections VALUES (2836, '2025-03-19', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.213');
INSERT INTO public.sandwich_collections VALUES (2837, '2025-03-27', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.247');
INSERT INTO public.sandwich_collections VALUES (2838, '2025-04-02', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.281');
INSERT INTO public.sandwich_collections VALUES (2839, '2025-04-16', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.315');
INSERT INTO public.sandwich_collections VALUES (2840, '2025-04-23', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.349');
INSERT INTO public.sandwich_collections VALUES (2842, '2025-05-07', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.417');
INSERT INTO public.sandwich_collections VALUES (2843, '2025-05-14', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.45');
INSERT INTO public.sandwich_collections VALUES (2844, '2025-05-21', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.485');
INSERT INTO public.sandwich_collections VALUES (2845, '2025-05-29', 'Collective Learning', 250, '[]', '2025-06-14 04:28:11.52');
INSERT INTO public.sandwich_collections VALUES (2847, '2025-06-11', 'Collective Learning', 300, '[]', '2025-06-14 04:28:11.588');
INSERT INTO public.sandwich_collections VALUES (2891, '2022-08-10', 'Peachtree Corners', 475, '[]', '2025-06-14 04:28:13.121');
INSERT INTO public.sandwich_collections VALUES (2890, '2022-08-03', 'Peachtree Corners', 401, '[]', '2025-06-14 04:28:13.088');
INSERT INTO public.sandwich_collections VALUES (2889, '2022-07-27', 'Peachtree Corners', 232, '[]', '2025-06-14 04:28:13.052');
INSERT INTO public.sandwich_collections VALUES (2888, '2022-07-20', 'Peachtree Corners', 272, '[]', '2025-06-14 04:28:13.017');
INSERT INTO public.sandwich_collections VALUES (2887, '2022-07-13', 'Peachtree Corners', 370, '[]', '2025-06-14 04:28:12.983');
INSERT INTO public.sandwich_collections VALUES (2886, '2022-07-06', 'Peachtree Corners', 341, '[]', '2025-06-14 04:28:12.944');
INSERT INTO public.sandwich_collections VALUES (2885, '2022-06-29', 'Peachtree Corners', 591, '[]', '2025-06-14 04:28:12.91');
INSERT INTO public.sandwich_collections VALUES (2884, '2022-06-22', 'Peachtree Corners', 703, '[]', '2025-06-14 04:28:12.876');
INSERT INTO public.sandwich_collections VALUES (2883, '2022-06-15', 'Peachtree Corners', 557, '[]', '2025-06-14 04:28:12.842');
INSERT INTO public.sandwich_collections VALUES (2882, '2022-06-08', 'Peachtree Corners', 453, '[]', '2025-06-14 04:28:12.808');
INSERT INTO public.sandwich_collections VALUES (2881, '2022-06-01', 'Peachtree Corners', 433, '[]', '2025-06-14 04:28:12.775');
INSERT INTO public.sandwich_collections VALUES (2879, '2022-05-18', 'Peachtree Corners', 165, '[]', '2025-06-14 04:28:12.707');
INSERT INTO public.sandwich_collections VALUES (2880, '2022-05-15', 'Peachtree Corners', 187, '[]', '2025-06-14 04:28:12.741');
INSERT INTO public.sandwich_collections VALUES (2878, '2022-05-11', 'Peachtree Corners', 699, '[]', '2025-06-14 04:28:12.674');
INSERT INTO public.sandwich_collections VALUES (2877, '2022-05-04', 'Peachtree Corners', 388, '[]', '2025-06-14 04:28:12.64');
INSERT INTO public.sandwich_collections VALUES (2876, '2022-04-27', 'Peachtree Corners', 503, '[]', '2025-06-14 04:28:12.606');
INSERT INTO public.sandwich_collections VALUES (2875, '2022-04-20', 'Peachtree Corners', 829, '[]', '2025-06-14 04:28:12.571');
INSERT INTO public.sandwich_collections VALUES (2874, '2022-04-13', 'Peachtree Corners', 211, '[]', '2025-06-14 04:28:12.537');
INSERT INTO public.sandwich_collections VALUES (2873, '2022-04-06', 'Peachtree Corners', 496, '[]', '2025-06-14 04:28:12.503');
INSERT INTO public.sandwich_collections VALUES (2872, '2022-03-30', 'Peachtree Corners', 432, '[]', '2025-06-14 04:28:12.469');
INSERT INTO public.sandwich_collections VALUES (2871, '2022-03-23', 'Peachtree Corners', 432, '[]', '2025-06-14 04:28:12.435');
INSERT INTO public.sandwich_collections VALUES (2870, '2022-03-16', 'Peachtree Corners', 230, '[]', '2025-06-14 04:28:12.4');
INSERT INTO public.sandwich_collections VALUES (2869, '2022-03-09', 'Peachtree Corners', 773, '[]', '2025-06-14 04:28:12.366');
INSERT INTO public.sandwich_collections VALUES (2868, '2022-03-02', 'Peachtree Corners', 249, '[]', '2025-06-14 04:28:12.333');
INSERT INTO public.sandwich_collections VALUES (2867, '2022-02-23', 'Peachtree Corners', 551, '[]', '2025-06-14 04:28:12.299');
INSERT INTO public.sandwich_collections VALUES (2866, '2022-02-16', 'Peachtree Corners', 462, '[]', '2025-06-14 04:28:12.265');
INSERT INTO public.sandwich_collections VALUES (2864, '2022-02-02', 'Peachtree Corners', 252, '[]', '2025-06-14 04:28:12.196');
INSERT INTO public.sandwich_collections VALUES (2863, '2022-01-26', 'Peachtree Corners', 282, '[]', '2025-06-14 04:28:12.162');
INSERT INTO public.sandwich_collections VALUES (2862, '2022-01-05', 'Peachtree Corners', 371, '[]', '2025-06-14 04:28:12.128');
INSERT INTO public.sandwich_collections VALUES (2861, '2021-12-15', 'Peachtree Corners', 558, '[]', '2025-06-14 04:28:12.094');
INSERT INTO public.sandwich_collections VALUES (2860, '2021-12-08', 'Peachtree Corners', 307, '[]', '2025-06-14 04:28:12.06');
INSERT INTO public.sandwich_collections VALUES (2859, '2021-12-01', 'Peachtree Corners', 166, '[]', '2025-06-14 04:28:12.026');
INSERT INTO public.sandwich_collections VALUES (2857, '2021-11-17', 'Peachtree Corners', 229, '[]', '2025-06-14 04:28:11.958');
INSERT INTO public.sandwich_collections VALUES (2856, '2021-11-10', 'Peachtree Corners', 245, '[]', '2025-06-14 04:28:11.926');
INSERT INTO public.sandwich_collections VALUES (2855, '2021-11-03', 'Peachtree Corners', 184, '[]', '2025-06-14 04:28:11.891');
INSERT INTO public.sandwich_collections VALUES (2854, '2021-10-27', 'Peachtree Corners', 130, '[]', '2025-06-14 04:28:11.858');
INSERT INTO public.sandwich_collections VALUES (2853, '2021-10-20', 'Peachtree Corners', 188, '[]', '2025-06-14 04:28:11.824');
INSERT INTO public.sandwich_collections VALUES (2852, '2021-10-13', 'Peachtree Corners', 266, '[]', '2025-06-14 04:28:11.789');
INSERT INTO public.sandwich_collections VALUES (2850, '2021-09-29', 'Peachtree Corners', 114, '[]', '2025-06-14 04:28:11.721');
INSERT INTO public.sandwich_collections VALUES (2849, '2021-09-22', 'Peachtree Corners', 99, '[]', '2025-06-14 04:28:11.686');
INSERT INTO public.sandwich_collections VALUES (2848, '2021-09-15', 'Peachtree Corners', 160, '[]', '2025-06-14 04:28:11.652');
INSERT INTO public.sandwich_collections VALUES (2788, '', 'Groups - Main', 0, '[{"name":"Unnamed Groups","count":2050}]', '2025-06-08 17:06:07.928');
INSERT INTO public.sandwich_collections VALUES (2841, '', 'Collective Learning', 50, '[]', '2025-06-14 04:28:11.383');
INSERT INTO public.sandwich_collections VALUES (2923, '2020-04-22', 'OG Sandwich Project', 317, '[]', '2025-06-14 13:58:25.821322');
INSERT INTO public.sandwich_collections VALUES (2924, '2020-04-29', 'OG Sandwich Project', 530, '[]', '2025-06-14 13:58:25.986478');
INSERT INTO public.sandwich_collections VALUES (2925, '2020-05-06', 'OG Sandwich Project', 290, '[]', '2025-06-14 13:58:26.059325');
INSERT INTO public.sandwich_collections VALUES (2926, '2020-05-13', 'OG Sandwich Project', 430, '[]', '2025-06-14 13:58:26.13446');
INSERT INTO public.sandwich_collections VALUES (2927, '2020-05-20', 'OG Sandwich Project', 581, '[]', '2025-06-14 13:58:26.207356');
INSERT INTO public.sandwich_collections VALUES (2928, '2020-05-27', 'OG Sandwich Project', 432, '[]', '2025-06-14 13:58:26.280642');
INSERT INTO public.sandwich_collections VALUES (2929, '2020-06-03', 'OG Sandwich Project', 780, '[]', '2025-06-14 13:58:26.353385');
INSERT INTO public.sandwich_collections VALUES (2930, '2020-06-10', 'OG Sandwich Project', 939, '[]', '2025-06-14 13:58:26.426194');
INSERT INTO public.sandwich_collections VALUES (2931, '2020-06-17', 'OG Sandwich Project', 995, '[]', '2025-06-14 13:58:26.499363');
INSERT INTO public.sandwich_collections VALUES (2932, '2020-06-24', 'OG Sandwich Project', 1177, '[]', '2025-06-14 13:58:26.572327');
INSERT INTO public.sandwich_collections VALUES (2933, '2020-07-01', 'OG Sandwich Project', 626, '[]', '2025-06-14 13:58:26.644968');
INSERT INTO public.sandwich_collections VALUES (2934, '2020-07-08', 'OG Sandwich Project', 866, '[]', '2025-06-14 13:58:26.718537');
INSERT INTO public.sandwich_collections VALUES (2935, '2020-07-15', 'OG Sandwich Project', 1231, '[]', '2025-06-14 13:58:26.791257');
INSERT INTO public.sandwich_collections VALUES (2936, '2020-07-22', 'OG Sandwich Project', 1195, '[]', '2025-06-14 13:58:26.863834');
INSERT INTO public.sandwich_collections VALUES (2937, '2020-07-29', 'OG Sandwich Project', 991, '[]', '2025-06-14 13:58:26.936663');
INSERT INTO public.sandwich_collections VALUES (2938, '2020-08-05', 'OG Sandwich Project', 953, '[]', '2025-06-14 13:58:27.009322');
INSERT INTO public.sandwich_collections VALUES (2939, '2020-08-12', 'OG Sandwich Project', 752, '[]', '2025-06-14 13:58:27.082184');
INSERT INTO public.sandwich_collections VALUES (2940, '2020-08-19', 'OG Sandwich Project', 1114, '[]', '2025-06-14 13:58:27.155493');
INSERT INTO public.sandwich_collections VALUES (2941, '2020-08-26', 'OG Sandwich Project', 965, '[]', '2025-06-14 13:58:27.228472');
INSERT INTO public.sandwich_collections VALUES (2942, '2020-09-02', 'OG Sandwich Project', 813, '[]', '2025-06-14 13:58:27.301281');
INSERT INTO public.sandwich_collections VALUES (2943, '2020-09-09', 'OG Sandwich Project', 1361, '[]', '2025-06-14 13:58:27.37415');
INSERT INTO public.sandwich_collections VALUES (2944, '2020-09-16', 'OG Sandwich Project', 1269, '[]', '2025-06-14 13:58:27.447058');
INSERT INTO public.sandwich_collections VALUES (2945, '2020-09-23', 'OG Sandwich Project', 1316, '[]', '2025-06-14 13:58:27.520229');
INSERT INTO public.sandwich_collections VALUES (2946, '2020-09-30', 'OG Sandwich Project', 1684, '[]', '2025-06-14 13:58:27.593074');
INSERT INTO public.sandwich_collections VALUES (2947, '2020-10-07', 'OG Sandwich Project', 1414, '[]', '2025-06-14 13:58:27.666312');
INSERT INTO public.sandwich_collections VALUES (2948, '2020-10-14', 'OG Sandwich Project', 943, '[]', '2025-06-14 13:58:27.740048');
INSERT INTO public.sandwich_collections VALUES (2949, '2020-10-21', 'OG Sandwich Project', 1364, '[]', '2025-06-14 13:58:27.812738');
INSERT INTO public.sandwich_collections VALUES (2950, '2020-10-28', 'OG Sandwich Project', 1454, '[]', '2025-06-14 13:58:27.886106');
INSERT INTO public.sandwich_collections VALUES (2951, '2020-11-04', 'OG Sandwich Project', 1474, '[]', '2025-06-14 13:58:27.958759');
INSERT INTO public.sandwich_collections VALUES (2952, '2020-11-11', 'OG Sandwich Project', 2595, '[]', '2025-06-14 13:58:28.031867');
INSERT INTO public.sandwich_collections VALUES (2953, '2020-11-18', 'OG Sandwich Project', 3159, '[]', '2025-06-14 13:58:28.105124');
INSERT INTO public.sandwich_collections VALUES (2954, '2020-11-25', 'OG Sandwich Project', 2518, '[]', '2025-06-14 13:58:28.177881');
INSERT INTO public.sandwich_collections VALUES (2955, '2020-12-02', 'OG Sandwich Project', 1511, '[]', '2025-06-14 13:58:28.250555');
INSERT INTO public.sandwich_collections VALUES (2956, '2020-12-09', 'OG Sandwich Project', 1365, '[]', '2025-06-14 13:58:28.323296');
INSERT INTO public.sandwich_collections VALUES (2957, '2020-12-16', 'OG Sandwich Project', 1762, '[]', '2025-06-14 13:58:28.39631');
INSERT INTO public.sandwich_collections VALUES (2958, '2020-12-23', 'OG Sandwich Project', 1481, '[]', '2025-06-14 13:58:28.469149');
INSERT INTO public.sandwich_collections VALUES (2959, '2020-12-30', 'OG Sandwich Project', 2311, '[]', '2025-06-14 13:58:28.542375');
INSERT INTO public.sandwich_collections VALUES (2960, '2021-01-06', 'OG Sandwich Project', 1841, '[]', '2025-06-14 13:58:28.614949');
INSERT INTO public.sandwich_collections VALUES (2961, '2021-01-13', 'OG Sandwich Project', 1912, '[]', '2025-06-14 13:58:28.687722');
INSERT INTO public.sandwich_collections VALUES (2962, '2021-01-20', 'OG Sandwich Project', 2865, '[]', '2025-06-14 13:58:28.760623');
INSERT INTO public.sandwich_collections VALUES (2963, '2021-01-27', 'OG Sandwich Project', 3109, '[]', '2025-06-14 13:58:28.833363');
INSERT INTO public.sandwich_collections VALUES (2964, '2021-02-03', 'OG Sandwich Project', 4711, '[]', '2025-06-14 13:58:28.908395');
INSERT INTO public.sandwich_collections VALUES (2965, '2021-02-10', 'OG Sandwich Project', 3840, '[]', '2025-06-14 13:58:28.981491');
INSERT INTO public.sandwich_collections VALUES (2966, '2022-02-17', 'OG Sandwich Project', 5418, '[]', '2025-06-14 13:58:29.053994');
INSERT INTO public.sandwich_collections VALUES (2967, '2021-02-24', 'OG Sandwich Project', 6030, '[]', '2025-06-14 13:58:29.127707');
INSERT INTO public.sandwich_collections VALUES (2968, '2021-03-03', 'OG Sandwich Project', 5186, '[]', '2025-06-14 13:58:29.200522');
INSERT INTO public.sandwich_collections VALUES (2969, '2021-03-10', 'OG Sandwich Project', 3989, '[]', '2025-06-14 13:58:29.274315');
INSERT INTO public.sandwich_collections VALUES (2970, '2021-03-17', 'OG Sandwich Project', 4052, '[]', '2025-06-14 13:58:29.347175');
INSERT INTO public.sandwich_collections VALUES (2971, '2021-03-24', 'OG Sandwich Project', 4865, '[]', '2025-06-14 13:58:29.420343');
INSERT INTO public.sandwich_collections VALUES (2972, '2021-03-31', 'OG Sandwich Project', 4225, '[]', '2025-06-14 13:58:29.493291');
INSERT INTO public.sandwich_collections VALUES (2973, '2021-04-07', 'OG Sandwich Project', 5442, '[]', '2025-06-14 13:58:29.569507');
INSERT INTO public.sandwich_collections VALUES (2974, '2021-04-14', 'OG Sandwich Project', 7241, '[]', '2025-06-14 13:58:29.643012');
INSERT INTO public.sandwich_collections VALUES (2975, '2021-04-21', 'OG Sandwich Project', 10085, '[]', '2025-06-14 13:58:29.716025');
INSERT INTO public.sandwich_collections VALUES (2976, '2021-04-28', 'OG Sandwich Project', 9454, '[]', '2025-06-14 13:58:29.788664');
INSERT INTO public.sandwich_collections VALUES (2977, '2021-05-05', 'OG Sandwich Project', 6715, '[]', '2025-06-14 13:58:29.861551');
INSERT INTO public.sandwich_collections VALUES (2978, '2021-05-12', 'OG Sandwich Project', 8579, '[]', '2025-06-14 13:58:29.936008');
INSERT INTO public.sandwich_collections VALUES (2979, '2021-05-19', 'OG Sandwich Project', 5475, '[]', '2025-06-14 13:58:30.008806');
INSERT INTO public.sandwich_collections VALUES (2980, '2021-05-26', 'OG Sandwich Project', 4063, '[]', '2025-06-14 13:58:30.08165');
INSERT INTO public.sandwich_collections VALUES (2981, '2021-06-02', 'OG Sandwich Project', 10085, '[]', '2025-06-14 13:58:30.155315');
INSERT INTO public.sandwich_collections VALUES (2982, '2021-06-09', 'OG Sandwich Project', 9454, '[]', '2025-06-14 13:58:30.228231');
INSERT INTO public.sandwich_collections VALUES (2983, '2021-06-16', 'OG Sandwich Project', 6715, '[]', '2025-06-14 13:58:30.301327');
INSERT INTO public.sandwich_collections VALUES (2984, '2021-06-23', 'OG Sandwich Project', 8579, '[]', '2025-06-14 13:58:30.374238');
INSERT INTO public.sandwich_collections VALUES (2985, '2021-06-30', 'OG Sandwich Project', 5475, '[]', '2025-06-14 13:58:30.446953');
INSERT INTO public.sandwich_collections VALUES (2986, '2021-07-07', 'OG Sandwich Project', 4063, '[]', '2025-06-14 13:58:30.519624');
INSERT INTO public.sandwich_collections VALUES (2987, '2021-07-14', 'OG Sandwich Project', 4198, '[]', '2025-06-14 13:58:30.592881');
INSERT INTO public.sandwich_collections VALUES (2988, '2021-07-21', 'OG Sandwich Project', 5372, '[]', '2025-06-14 13:58:30.667028');
INSERT INTO public.sandwich_collections VALUES (2989, '2021-07-28', 'OG Sandwich Project', 6175, '[]', '2025-06-14 13:58:30.739712');
INSERT INTO public.sandwich_collections VALUES (2990, '2021-08-04', 'OG Sandwich Project', 5764, '[]', '2025-06-14 13:58:30.816511');
INSERT INTO public.sandwich_collections VALUES (2918, '2023-04-19', 'Decatur', 93, '[]', '2025-06-14 04:28:14.163');
INSERT INTO public.sandwich_collections VALUES (2917, '2023-04-12', 'Decatur', 240, '[]', '2025-06-14 04:28:14.129');
INSERT INTO public.sandwich_collections VALUES (2915, '2023-03-29', 'Decatur', 220, '[]', '2025-06-14 04:28:14.062');
INSERT INTO public.sandwich_collections VALUES (2916, '2023-04-05', 'Decatur', 60, '[]', '2025-06-14 04:28:14.095');
INSERT INTO public.sandwich_collections VALUES (2914, '2023-02-01', 'Peachtree Corners', 496, '[]', '2025-06-14 04:28:14.028');
INSERT INTO public.sandwich_collections VALUES (2913, '2023-01-25', 'Peachtree Corners', 514, '[]', '2025-06-14 04:28:13.994');
INSERT INTO public.sandwich_collections VALUES (2912, '2023-01-18', 'Peachtree Corners', 290, '[]', '2025-06-14 04:28:13.959');
INSERT INTO public.sandwich_collections VALUES (2911, '2023-01-11', 'Peachtree Corners', 444, '[]', '2025-06-14 04:28:13.926');
INSERT INTO public.sandwich_collections VALUES (2910, '2023-01-04', 'Peachtree Corners', 263, '[]', '2025-06-14 04:28:13.892');
INSERT INTO public.sandwich_collections VALUES (2909, '2022-12-28', 'Peachtree Corners', 140, '[]', '2025-06-14 04:28:13.858');
INSERT INTO public.sandwich_collections VALUES (2908, '2022-12-21', 'Peachtree Corners', 321, '[]', '2025-06-14 04:28:13.823');
INSERT INTO public.sandwich_collections VALUES (2907, '2022-12-14', 'Peachtree Corners', 530, '[]', '2025-06-14 04:28:13.79');
INSERT INTO public.sandwich_collections VALUES (2906, '2022-12-07', 'Peachtree Corners', 410, '[]', '2025-06-14 04:28:13.756');
INSERT INTO public.sandwich_collections VALUES (2905, '2022-11-30', 'Peachtree Corners', 347, '[]', '2025-06-14 04:28:13.721');
INSERT INTO public.sandwich_collections VALUES (2904, '2022-11-16', 'Peachtree Corners', 324, '[]', '2025-06-14 04:28:13.687');
INSERT INTO public.sandwich_collections VALUES (2903, '2022-11-09', 'Peachtree Corners', 347, '[]', '2025-06-14 04:28:13.653');
INSERT INTO public.sandwich_collections VALUES (2902, '2022-11-02', 'Peachtree Corners', 190, '[]', '2025-06-14 04:28:13.62');
INSERT INTO public.sandwich_collections VALUES (2901, '2022-10-26', 'Peachtree Corners', 257, '[]', '2025-06-14 04:28:13.584');
INSERT INTO public.sandwich_collections VALUES (2900, '2022-10-19', 'Peachtree Corners', 468, '[]', '2025-06-14 04:28:13.55');
INSERT INTO public.sandwich_collections VALUES (2899, '2022-10-12', 'Peachtree Corners', 322, '[]', '2025-06-14 04:28:13.516');
INSERT INTO public.sandwich_collections VALUES (2898, '2022-10-05', 'Peachtree Corners', 226, '[]', '2025-06-14 04:28:13.481');
INSERT INTO public.sandwich_collections VALUES (2897, '2022-09-28', 'Peachtree Corners', 374, '[]', '2025-06-14 04:28:13.447');
INSERT INTO public.sandwich_collections VALUES (2896, '2022-09-21', 'Peachtree Corners', 453, '[]', '2025-06-14 04:28:13.41');
INSERT INTO public.sandwich_collections VALUES (2895, '2022-09-14', 'Peachtree Corners', 307, '[]', '2025-06-14 04:28:13.376');
INSERT INTO public.sandwich_collections VALUES (2894, '2022-09-07', 'Peachtree Corners', 226, '[]', '2025-06-14 04:28:13.34');
INSERT INTO public.sandwich_collections VALUES (2893, '2022-08-31', 'Peachtree Corners', 224, '[]', '2025-06-14 04:28:13.192');
INSERT INTO public.sandwich_collections VALUES (2892, '2022-08-17', 'Peachtree Corners', 199, '[]', '2025-06-14 04:28:13.158');
INSERT INTO public.sandwich_collections VALUES (2991, '2021-08-11', 'OG Sandwich Project', 6847, '[]', '2025-06-14 13:58:30.892708');
INSERT INTO public.sandwich_collections VALUES (2992, '2021-08-18', 'OG Sandwich Project', 5245, '[]', '2025-06-14 13:58:30.967119');
INSERT INTO public.sandwich_collections VALUES (2993, '2021-08-25', 'OG Sandwich Project', 4780, '[]', '2025-06-14 13:58:31.039806');
INSERT INTO public.sandwich_collections VALUES (2994, '2021-09-01', 'OG Sandwich Project', 4568, '[]', '2025-06-14 13:58:31.112796');
INSERT INTO public.sandwich_collections VALUES (2995, '2021-09-08', 'OG Sandwich Project', 3989, '[]', '2025-06-14 13:58:31.185639');
INSERT INTO public.sandwich_collections VALUES (2865, '2022-02-09', 'Peachtree Corners', 344, '[]', '2025-06-14 04:28:12.231');
INSERT INTO public.sandwich_collections VALUES (2858, '2021-11-22', 'Peachtree Corners', 470, '[]', '2025-06-14 04:28:11.992');
INSERT INTO public.sandwich_collections VALUES (2851, '2021-10-06', 'Peachtree Corners', 126, '[]', '2025-06-14 04:28:11.754');
INSERT INTO public.sandwich_collections VALUES (2996, '2025-06-19', 'Alpharetta', 2442, '[]', '2025-06-27 21:00:03.771163');
INSERT INTO public.sandwich_collections VALUES (2997, '2025-06-19', 'Dunwoody/PTC', 1889, '[]', '2025-06-27 21:00:28.518096');
INSERT INTO public.sandwich_collections VALUES (2998, '2025-06-19', 'East Cobb/Roswell', 2774, '[]', '2025-06-27 21:00:44.282973');
INSERT INTO public.sandwich_collections VALUES (2999, '2025-06-19', 'Sandy Springs', 856, '[]', '2025-06-27 21:00:59.136247');
INSERT INTO public.sandwich_collections VALUES (3000, '2025-06-19', 'Intown/Druid Hills', 1312, '[]', '2025-06-27 21:01:33.98');
INSERT INTO public.sandwich_collections VALUES (3001, '2025-06-19', 'Collective Learning', 300, '[]', '2025-06-27 21:02:09.582087');
INSERT INTO public.sandwich_collections VALUES (3002, '2025-06-26', 'Alpharetta', 2466, '[]', '2025-06-27 21:02:30.938719');
INSERT INTO public.sandwich_collections VALUES (3004, '2025-06-26', 'East Cobb/Roswell', 1960, '[]', '2025-06-27 21:03:52.328332');
INSERT INTO public.sandwich_collections VALUES (3005, '2025-06-26', 'Sandy Springs', 667, '[]', '2025-06-27 21:06:51.844333');
INSERT INTO public.sandwich_collections VALUES (3012, '2025-01-08', 'Groups', 900, '[]', '2025-07-02 23:47:56.320768');
INSERT INTO public.sandwich_collections VALUES (3013, '2025-01-15', 'Groups', 1730, '[]', '2025-07-02 23:47:56.471936');
INSERT INTO public.sandwich_collections VALUES (3014, '2025-01-29', 'Groups', 7140, '[]', '2025-07-02 23:47:56.610466');
INSERT INTO public.sandwich_collections VALUES (3015, '2025-02-05', 'Groups', 2600, '[]', '2025-07-02 23:47:56.749801');
INSERT INTO public.sandwich_collections VALUES (3016, '2025-02-12', 'Groups', 4474, '[]', '2025-07-02 23:47:56.889167');
INSERT INTO public.sandwich_collections VALUES (3017, '2025-02-19', 'Groups', 2650, '[]', '2025-07-02 23:47:57.028888');
INSERT INTO public.sandwich_collections VALUES (3018, '2025-03-05', 'Groups', 4795, '[]', '2025-07-02 23:47:57.169251');
INSERT INTO public.sandwich_collections VALUES (3019, '2025-03-12', 'Groups', 4780, '[]', '2025-07-02 23:47:57.309313');
INSERT INTO public.sandwich_collections VALUES (3020, '2025-04-02', 'Groups', 5518, '[]', '2025-07-02 23:47:57.44876');
INSERT INTO public.sandwich_collections VALUES (3021, '2025-04-16', 'Groups', 1450, '[]', '2025-07-02 23:47:57.587959');
INSERT INTO public.sandwich_collections VALUES (3023, '2025-05-07', 'Groups', 800, '[]', '2025-07-02 23:47:57.868109');
INSERT INTO public.sandwich_collections VALUES (3024, '2025-05-14', 'Groups', 1800, '[]', '2025-07-02 23:47:58.007497');
INSERT INTO public.sandwich_collections VALUES (3025, '2025-05-21', 'Groups', 4610, '[]', '2025-07-02 23:47:58.147159');
INSERT INTO public.sandwich_collections VALUES (3026, '2025-05-29', 'Groups', 100, '[]', '2025-07-02 23:47:58.289771');
INSERT INTO public.sandwich_collections VALUES (3027, '2025-06-04', 'Groups', 550, '[]', '2025-07-02 23:47:58.429513');
INSERT INTO public.sandwich_collections VALUES (3030, '2023-02-01', 'Groups', 2998, '[]', '2025-07-03 02:06:21.778948');
INSERT INTO public.sandwich_collections VALUES (3031, '2023-02-15', 'Groups', 4485, '[]', '2025-07-03 02:06:21.778948');
INSERT INTO public.sandwich_collections VALUES (3032, '2023-02-22', 'Groups', 200, '[]', '2025-07-03 02:06:21.778948');
INSERT INTO public.sandwich_collections VALUES (3033, '2023-03-29', 'Groups', 503, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3034, '2023-04-05', 'Groups', 1238, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3035, '2023-04-12', 'Groups', 500, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3036, '2023-04-19', 'Groups', 5019, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3037, '2023-04-26', 'Groups', 1906, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3038, '2023-05-03', 'Groups', 500, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3039, '2023-05-10', 'Groups', 808, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3040, '2023-05-17', 'Groups', 350, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3041, '2023-05-24', 'Groups', 1900, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3042, '2023-05-31', 'Groups', 841, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3043, '2023-06-07', 'Groups', 1508, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3044, '2023-06-14', 'Groups', 1931, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3045, '2023-06-21', 'Groups', 1347, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3046, '2023-06-28', 'Groups', 3098, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3047, '2023-07-11', 'Groups', 1664, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3048, '2023-07-19', 'Groups', 2113, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3049, '2023-07-26', 'Groups', 855, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3050, '2023-08-02', 'Groups', 555, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3051, '2023-08-09', 'Groups', 432, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3052, '2023-08-16', 'Groups', 7479, '[]', '2025-07-03 02:08:08.683208');
INSERT INTO public.sandwich_collections VALUES (3053, '2023-08-24', 'Groups', 1235, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3054, '2023-08-30', 'Groups', 1485, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3055, '2023-09-06', 'Groups', 1106, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3056, '2023-09-13', 'Groups', 2045, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3057, '2023-09-20', 'Groups', 1178, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3058, '2023-09-27', 'Groups', 3005, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3059, '2023-10-05', 'Groups', 1482, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3060, '2023-10-11', 'Groups', 194, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3061, '2023-10-18', 'Groups', 3635, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3062, '2023-10-25', 'Groups', 2985, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3063, '2023-11-01', 'Groups', 1055, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3064, '2023-11-08', 'Groups', 1761, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3065, '2023-11-15', 'Groups', 11278, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3066, '2023-11-29', 'Groups', 332, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3067, '2023-12-06', 'Groups', 4981, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3068, '2023-12-13', 'Groups', 1844, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3069, '2023-12-20', 'Groups', 8696, '[]', '2025-07-03 02:08:23.210047');
INSERT INTO public.sandwich_collections VALUES (3070, '2024-01-10', 'Groups', 485, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3071, '2024-01-17', 'Groups', 12252, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3072, '2024-01-24', 'Groups', 1718, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3073, '2024-01-31', 'Groups', 3254, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3074, '2024-02-07', 'Groups', 1960, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3075, '2024-02-14', 'Groups', 3141, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3076, '2024-02-21', 'Groups', 7050, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3077, '2024-02-28', 'Groups', 1000, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3078, '2024-03-06', 'Groups', 4544, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3079, '2024-03-13', 'Groups', 1734, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3080, '2024-03-20', 'Groups', 4771, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3081, '2024-04-03', 'Groups', 200, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3082, '2024-04-10', 'Groups', 4287, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3083, '2024-04-17', 'Groups', 2052, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3084, '2024-04-23', 'Groups', 3040, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3085, '2024-05-01', 'Groups', 2382, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3086, '2024-05-08', 'Groups', 1559, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3022, '', 'Groups', 2050, '[]', '2025-07-02 23:47:57.728394');
INSERT INTO public.sandwich_collections VALUES (3087, '2024-05-15', 'Groups', 2333, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3088, '2024-05-22', 'Groups', 402, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3089, '2024-05-28', 'Groups', 806, '[]', '2025-07-03 02:08:44.274757');
INSERT INTO public.sandwich_collections VALUES (3090, '2024-06-05', 'Groups', 100, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3091, '2024-06-12', 'Groups', 2084, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3092, '2024-06-19', 'Groups', 1432, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3093, '2024-06-26', 'Groups', 2972, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3094, '2024-07-10', 'Groups', 3032, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3095, '2024-07-17', 'Groups', 2476, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3096, '2024-07-24', 'Groups', 2700, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3097, '2024-07-31', 'Groups', 2013, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3098, '2024-08-07', 'Groups', 5000, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3099, '2024-08-14', 'Groups', 450, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3100, '2024-08-21', 'Groups', 2326, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3101, '2024-08-28', 'Groups', 200, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3102, '2024-09-04', 'Groups', 1400, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3103, '2024-09-11', 'Groups', 3400, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3104, '2024-09-18', 'Groups', 3015, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3105, '2024-09-25', 'Groups', 5650, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3106, '2024-10-02', 'Groups', 14023, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3107, '2024-10-09', 'Groups', 1900, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3108, '2024-10-16', 'Groups', 3746, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3109, '2024-10-23', 'Groups', 4279, '[]', '2025-07-03 02:09:17.897644');
INSERT INTO public.sandwich_collections VALUES (3110, '2024-10-30', 'Groups', 1330, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3111, '2024-11-06', 'Groups', 550, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3112, '2024-11-13', 'Groups', 1780, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3113, '2024-11-20', 'Groups', 6409, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3114, '2024-12-04', 'Groups', 1500, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3115, '2024-12-11', 'Groups', 6570, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3116, '2024-12-18', 'Groups', 5100, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3117, '2024-12-26', 'Groups', 2000, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3118, '2025-02-26', 'Groups', 1380, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3119, '2025-03-19', 'Groups', 2618, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3120, '2025-03-27', 'Groups', 3278, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3121, '2025-04-09', 'Groups', 153, '[]', '2025-07-03 02:09:28.985625');
INSERT INTO public.sandwich_collections VALUES (3122, '2024-04-23', 'Alpharetta', 2244, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3123, '2024-04-23', 'Dunwoody/PTC', 2223, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3124, '2024-04-23', 'East Cobb/Roswell', 1122, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3125, '2024-04-23', 'Sandy Springs', 527, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3126, '2024-04-23', 'Intown/Druid Hills', 1344, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3127, '2024-04-23', 'Flowery Branch', 350, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3128, '2024-04-23', 'Collective Learning', 50, '[]', '2025-07-03 02:12:07.274353');
INSERT INTO public.sandwich_collections VALUES (3129, '2025-01-22', 'Flowery Branch', 258, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3130, '2025-05-29', 'Alpharetta', 768, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3131, '2025-05-29', 'Dunwoody/PTC', 1066, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3132, '2025-05-29', 'East Cobb/Roswell', 901, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3133, '2025-05-29', 'Sandy Springs', 529, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3134, '2025-05-29', 'Intown/Druid Hills', 832, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3135, '2025-05-29', 'Flowery Branch', 275, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3136, '2025-06-04', 'Intown/Druid Hills', 1221, '[]', '2025-07-03 02:12:17.340244');
INSERT INTO public.sandwich_collections VALUES (3137, '2025-06-26', 'Dunwoody/PTC', 2000, '[]', '2025-07-03 02:29:50.329872');
INSERT INTO public.sandwich_collections VALUES (3138, '2025-06-26', 'Intown/Druid Hills', 1000, '[]', '2025-07-03 02:30:56.303765');
INSERT INTO public.sandwich_collections VALUES (3139, '2025-06-26', 'Flowery Branch', 200, '[]', '2025-07-03 02:31:07.839619');
INSERT INTO public.sandwich_collections VALUES (3143, '2025-06-26', 'Groups', 3260, '[{"name":"Groups","count":3260}]', '2025-07-03 02:35:34.261358');
INSERT INTO public.sandwich_collections VALUES (3144, '2025-06-19', 'Groups - Unassigned', 0, '[{"name":"Groups","count":2950}]', '2025-07-03 02:36:33.204585');
INSERT INTO public.sandwich_collections VALUES (3145, '2025-06-19', 'Groups', 2950, '[{"name":"Groups","count":2950}]', '2025-07-03 02:37:14.763517');
INSERT INTO public.sandwich_collections VALUES (3146, '2025-04-30', 'Alpharetta', 618, '[]', '2025-07-03 02:57:30.828112');
INSERT INTO public.sandwich_collections VALUES (3147, '2025-04-30', 'Dunwoody/PTC', 2032, '[]', '2025-07-03 02:57:30.828112');
INSERT INTO public.sandwich_collections VALUES (3148, '2025-04-30', 'East Cobb/Roswell', 915, '[]', '2025-07-03 02:57:30.828112');
INSERT INTO public.sandwich_collections VALUES (3149, '2025-04-30', 'Sandy Springs', 744, '[]', '2025-07-03 02:57:30.828112');
INSERT INTO public.sandwich_collections VALUES (3150, '2025-04-30', 'Intown/Druid Hills', 1198, '[]', '2025-07-03 02:57:30.828112');
INSERT INTO public.sandwich_collections VALUES (3151, '2025-04-30', 'Flowery Branch', 398, '[]', '2025-07-03 03:02:27.896741');
INSERT INTO public.sandwich_collections VALUES (3152, '2025-04-30', 'Groups', 2050, '[]', '2025-07-03 03:02:27.896741');
INSERT INTO public.sandwich_collections VALUES (3153, '2025-04-30', 'Collective Learning', 50, '[]', '2025-07-03 03:02:27.896741');
INSERT INTO public.sandwich_collections VALUES (3154, '2025-07-07', 'Alpharetta', 200, '[]', '2025-07-07 03:30:14.634575');


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.sessions VALUES ('9eR3SP46u0YocqN7Zo4ankpDAOibkVrj', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:25:52.310Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:26:44');
INSERT INTO public.sessions VALUES ('KupzfEkiQSxkg0hAVZ7c3R3BlEV8jbx2', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:26:43.076Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:26:44');
INSERT INTO public.sessions VALUES ('9a3LLHoZjpwqMLh-go2gRUG-4ObAgi09', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T17:28:52.666Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 17:28:53');
INSERT INTO public.sessions VALUES ('3xPKmZtIc2-IoFVdmQUp5Q55lu98n9PX', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-17T01:14:16.351Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-18 17:51:46');
INSERT INTO public.sessions VALUES ('_ccmOh-Qxos7ZDY6nk1BVNnvf1GJZ8GQ', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:40:45.204Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:40:46');
INSERT INTO public.sessions VALUES ('ABaUqIUYNjSTq4mPRYBYOIwkHtl28AbN', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:14.631Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:53:15');
INSERT INTO public.sessions VALUES ('K9mlKP5dcb76PCr_GoHDslYV0di8vf3x', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:28:27.821Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:29:33');
INSERT INTO public.sessions VALUES ('mlg-i8gp3GG7EwWDzK5BPvy--GERslJF', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:18.121Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:53:19');
INSERT INTO public.sessions VALUES ('QwWjtFTYpSTPYNtmhGcKOSIKO6pt4TFu', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:53:26.180Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:53:27');
INSERT INTO public.sessions VALUES ('fqjHBtoq2ZZCfoUCqY3NTt115EHh_tOf', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:58:14.598Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:58:15');
INSERT INTO public.sessions VALUES ('MhcoNcyXu4rDwoXSEufrb-FzLArPPheX', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:20:51.147Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 15:20:52');
INSERT INTO public.sessions VALUES ('A_exAlGK4eZVGcWrdBlkE3mspqqvFiOl', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:30:08.570Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 15:20:41');
INSERT INTO public.sessions VALUES ('hi2bkWSunjCGsE4AH6gpYDA7FAHT4MDY', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:36:19.673Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 15:40:04');
INSERT INTO public.sessions VALUES ('zeZIUSL9yrupY3UToaq-zZiVuyQDKCte', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:21:38.915Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 15:21:39');
INSERT INTO public.sessions VALUES ('163Jcjth05rdA0ChSUzCDnbv1r9FZb36', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T15:33:01.947Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 15:33:21');
INSERT INTO public.sessions VALUES ('5lS3O-wpkcIVdVVHUHh230-88UHkkw0p', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T02:40:07.798Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 02:40:10');
INSERT INTO public.sessions VALUES ('5L9pwpvbNcrb4g4rEvmzx4wIVNUxEzDK', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-16T14:00:41.269Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-16 14:01:48');
INSERT INTO public.sessions VALUES ('EWyWb47u2whiswXFSjHqYa1L7N0tGQb1', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T17:56:51.909Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-18 18:10:42');
INSERT INTO public.sessions VALUES ('iGWYvIQRz-eEboXfdrzO1uqMuqva1TS6', '{"user": {"id": "user_1751071509329_mrkw2z95z", "role": "admin", "email": "katielong2316@gmail.com", "isActive": true, "lastName": "Long", "firstName": "Katie", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "submit_suggestions", "respond_to_suggestions", "view_suggestions", "manage_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-17T01:11:19.458Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-17 01:26:49');
INSERT INTO public.sessions VALUES ('8RMJ7ciBeElHXzU4zg6vz-PKlJNkIpUC', '{"user": {"id": "admin_1751065261945", "role": "super_admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "manage_users", "export_data", "import_data", "moderate_messages"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-15T20:54:16.013Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-15 20:59:58');
INSERT INTO public.sessions VALUES ('q7T8EAJVjxQrs84_OxYkBiIazaic4rtT', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T16:52:34.197Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-18 16:54:57');
INSERT INTO public.sessions VALUES ('udVPid2TqLzVg8RIW5jiPBegAzjV-Id-', '{"user": {"id": "admin_1751065261945", "role": "admin", "email": "admin@sandwich.project", "isActive": true, "lastName": "User", "firstName": "Admin", "permissions": ["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"], "profileImageUrl": null}, "cookie": {"path": "/", "secure": false, "expires": "2025-07-18T16:58:21.909Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}}', '2025-07-18 18:00:30');


--
-- Data for Name: suggestion_responses; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.suggestions VALUES (1, 'Test Suggestion', 'This is a test suggestion to verify the API works', 'improvement', 'medium', 'submitted', 'admin_1751065261945', 'admin@sandwich.project', 'Admin User', false, 0, '{}', NULL, NULL, NULL, NULL, '2025-07-11 17:03:03.562454', '2025-07-11 17:03:03.562454');
INSERT INTO public.suggestions VALUES (2, 'Submit your suggestions here!', 'If you need something to work differently, if something is confusing to you, you have tips on how we could better arrange this whole site, or if you run into a bug, please submit your feedback here so we can get this where it serves your needs the best it possibly can!', 'General', 'High', 'submitted', 'admin_1751065261945', 'admin@sandwich.project', 'Admin User', false, 0, '{}', NULL, NULL, NULL, NULL, '2025-07-11 17:50:35.653229', '2025-07-11 17:50:35.653229');
INSERT INTO public.suggestions VALUES (3, 'Submit your suggestions here!', 'If you need something to work differently, if something is confusing to you, you have tips on how we could better arrange this whole site, or if you run into a bug, please submit your feedback here so we can get this where it serves your needs the best it possibly can!', 'General', 'High', 'submitted', 'admin_1751065261945', 'admin@sandwich.project', 'Admin User', false, 0, '{}', NULL, NULL, NULL, NULL, '2025-07-11 17:51:26.043519', '2025-07-11 17:51:26.043519');


--
-- Data for Name: task_completions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.task_completions VALUES (1, 46, 'user_1751071509329_mrkw2z95z', 'katielong2316@gmail.com', '2025-07-06 05:21:07.323175', '');
INSERT INTO public.task_completions VALUES (15, 45, 'user_1751071509329_mrkw2z95z', 'katielong2316@gmail.com', '2025-07-06 16:21:54.298122', '');
INSERT INTO public.task_completions VALUES (16, 46, 'user_1751493923615_nbcyq3am7', 'christine@thesandwichproject.org', '2025-07-06 17:51:55.58638', 'created task and completing task');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES ('user_1751493923615_nbcyq3am7', 'christine@thesandwichproject.org', 'Christine', 'Cooper Nowicki', NULL, '2025-07-02 22:05:23.700884', '2025-07-10 01:10:56.477', 'admin', '["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "direct_messages", "core_team_chat", "group_messages", "manage_hosts", "manage_drivers", "manage_announcements", "manage_projects", "manage_committees", "manage_collections", "manage_recipients", "edit_meetings", "schedule_reports", "send_messages", "moderate_messages", "view_suggestions", "submit_suggestions", "view_sandwich_data"]', true, '{"password": "sandwich123"}', NULL, NULL, '2025-07-07 18:26:27.568');
INSERT INTO public.users VALUES ('user_1751072243271_fc8jaxl6u', 'mdlouza@gmail.com', 'Marcy', 'Louza', NULL, '2025-06-28 00:57:23.476', '2025-07-10 01:10:43.05', 'admin', '["manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "submit_suggestions", "view_suggestions", "view_sandwich_data"]', true, '{"password": "sandwich123"}', 'Marcy', NULL, '2025-07-05 00:02:46.664');
INSERT INTO public.users VALUES ('user_1751920534988_2cgbrae86', 'vickib@aol.com', 'Vicki', 'Tropauer', NULL, '2025-07-07 20:35:35.07486', '2025-07-10 01:11:00.898', 'admin', '["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "core_team_chat", "group_messages", "direct_messages", "edit_meetings", "schedule_reports", "send_messages", "submit_suggestions", "view_suggestions", "manage_projects", "view_sandwich_data"]', true, '{"password": "TSP@1562"}', NULL, NULL, '2025-07-07 20:35:51.654');
INSERT INTO public.users VALUES ('user_1751975120117_tltz2rc1a', 'ross.kimberly.a@gmail.com', 'Kimberly', 'Ross', NULL, '2025-07-08 11:45:20.204698', '2025-07-10 01:11:08.591', 'admin', '["manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "submit_suggestions", "view_suggestions", "view_sandwich_data"]', true, '{"password": "Ugga0720"}', 'Kim Ross', NULL, '2025-07-08 11:45:30.768');
INSERT INTO public.users VALUES ('user_1751492211973_0pi1jdl3p', 'stephanie@thesandwichproject.org', 'Stephanie', 'Luis', NULL, '2025-07-02 21:36:52.064276', '2025-07-10 01:10:52.421', 'admin', '["view_phone_directory", "edit_data", "delete_data", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_meetings", "view_analytics", "view_role_demo", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "export_data", "import_data", "direct_messages", "core_team_chat", "group_messages", "manage_hosts", "manage_drivers", "manage_announcements", "manage_projects", "manage_committees", "manage_collections", "manage_recipients", "edit_meetings", "schedule_reports", "send_messages", "view_suggestions", "submit_suggestions", "view_sandwich_data"]', true, '{"password": "ChloeMarie24!"}', NULL, NULL, '2025-07-08 18:07:29.481');
INSERT INTO public.users VALUES ('user_1751250351194_sdteqpzz5', 'kenig.ka@gmail.com', 'Katie', 'Long', NULL, '2025-06-30 02:25:51.374', '2025-07-11 18:00:38.052', 'driver', '["view_phone_directory", "general_chat", "driver_chat", "direct_messages", "group_messages", "toolkit_access", "view_collections", "view_reports", "view_projects", "view_sandwich_data", "send_messages"]', true, '{"password": "Carter23!6"}', NULL, NULL, '2025-07-04 04:01:19.677');
INSERT INTO public.users VALUES ('user_1751071509329_mrkw2z95z', 'katielong2316@gmail.com', 'Katie', 'Long', NULL, '2025-06-28 00:45:09.513', '2025-07-11 17:52:34.431', 'admin', '["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "submit_suggestions", "respond_to_suggestions", "view_suggestions", "manage_suggestions", "view_sandwich_data"]', true, '{"password": "Carter23!6"}', NULL, NULL, '2025-07-11 17:52:34.431');
INSERT INTO public.users VALUES ('admin_1751065261945', 'admin@sandwich.project', 'Admin', 'User', NULL, '2025-06-27 23:01:01.987', '2025-07-11 17:56:51.855', 'admin', '["manage_users", "manage_hosts", "manage_recipients", "manage_drivers", "manage_collections", "manage_announcements", "manage_committees", "manage_projects", "view_phone_directory", "view_hosts", "view_recipients", "view_drivers", "view_committee", "view_users", "view_collections", "view_reports", "view_meetings", "view_analytics", "view_projects", "view_role_demo", "edit_data", "edit_meetings", "delete_data", "schedule_reports", "general_chat", "committee_chat", "host_chat", "driver_chat", "recipient_chat", "core_team_chat", "direct_messages", "group_messages", "send_messages", "export_data", "import_data", "toolkit_access", "moderate_messages", "view_suggestions", "submit_suggestions", "manage_suggestions", "respond_to_suggestions", "view_sandwich_data"]', true, '{"password": "sandwich123"}', NULL, NULL, '2025-07-11 17:56:51.855');


--
-- Data for Name: weekly_reports; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: work_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.work_logs VALUES (3, 'user_1751071509329_mrkw2z95z', 'Worked on website functionality', 8, 0, '2025-07-09 18:42:10.326953+00', 'pending', NULL, NULL, 'private', '[]', NULL, NULL);


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
-- PostgreSQL database dump complete
--

