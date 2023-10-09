--
-- PostgreSQL database dump
--

-- Dumped from database version 12.8 (Debian 12.8-1.pgdg110+1)
-- Dumped by pg_dump version 13.9

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: course_task_crosscheckstatus_enum; Type: TYPE; Schema: public; Owner: rs_master
--

CREATE TYPE public.course_task_crosscheckstatus_enum AS ENUM (
    'initial',
    'distributed',
    'completed'
);


ALTER TYPE public.course_task_crosscheckstatus_enum OWNER TO rs_master;

--
-- Name: user_english_level_enum; Type: TYPE; Schema: public; Owner: rs_master
--

CREATE TYPE public.user_english_level_enum AS ENUM (
    'a1',
    'a2',
    'b1',
    'b2',
    'c1',
    'c2'
);


ALTER TYPE public.user_english_level_enum OWNER TO rs_master;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alert; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.alert (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    text character varying NOT NULL,
    "courseId" integer,
    enabled boolean DEFAULT false NOT NULL,
    type character varying DEFAULT 'info'::character varying NOT NULL
);


ALTER TABLE public.alert OWNER TO rs_master;

--
-- Name: alert_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alert_id_seq OWNER TO rs_master;

--
-- Name: alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.alert_id_seq OWNED BY public.alert.id;


--
-- Name: certificate; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.certificate (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "publicId" character varying NOT NULL,
    "studentId" integer NOT NULL,
    "s3Bucket" character varying DEFAULT 'rsschool-certificates'::character varying NOT NULL,
    "s3Key" character varying NOT NULL,
    "issueDate" timestamp with time zone NOT NULL
);


ALTER TABLE public.certificate OWNER TO rs_master;

--
-- Name: certificate_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.certificate_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certificate_id_seq OWNER TO rs_master;

--
-- Name: certificate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.certificate_id_seq OWNED BY public.certificate.id;


--
-- Name: consent; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.consent (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "channelValue" character varying NOT NULL,
    "channelType" character varying NOT NULL,
    "optIn" boolean NOT NULL,
    username character varying
);


ALTER TABLE public.consent OWNER TO rs_master;

--
-- Name: consent_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.consent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.consent_id_seq OWNER TO rs_master;

--
-- Name: consent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.consent_id_seq OWNED BY public.consent.id;


--
-- Name: course; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.course (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    year integer,
    "primarySkillId" character varying,
    "primarySkillName" character varying,
    "locationName" character varying,
    alias character varying NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    description character varying,
    "descriptionUrl" character varying,
    planned boolean DEFAULT false NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "fullName" character varying NOT NULL,
    "registrationEndDate" timestamp with time zone,
    "inviteOnly" boolean DEFAULT false NOT NULL,
    "discordServerId" integer,
    "certificateIssuer" character varying,
    "usePrivateRepositories" boolean DEFAULT true NOT NULL,
    "personalMentoring" boolean DEFAULT true NOT NULL,
    logo character varying,
    "disciplineId" integer
);


ALTER TABLE public.course OWNER TO rs_master;

--
-- Name: course_event; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.course_event (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "eventId" integer NOT NULL,
    "courseId" integer NOT NULL,
    "stageId" integer,
    date date,
    "time" time with time zone,
    place character varying,
    coordinator character varying,
    comment character varying,
    "organizerId" integer,
    "detailsUrl" character varying,
    "broadcastUrl" character varying,
    "dateTime" timestamp with time zone,
    special character varying DEFAULT ''::character varying NOT NULL,
    duration integer,
    "endTime" timestamp with time zone
);


ALTER TABLE public.course_event OWNER TO rs_master;

--
-- Name: course_event_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.course_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_event_id_seq OWNER TO rs_master;

--
-- Name: course_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_event_id_seq OWNED BY public.course_event.id;


--
-- Name: course_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.course_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_id_seq OWNER TO rs_master;

--
-- Name: course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_id_seq OWNED BY public.course.id;


--
-- Name: course_manager; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.course_manager (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseId" integer,
    "userId" integer
);


ALTER TABLE public.course_manager OWNER TO rs_master;

--
-- Name: course_manager_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.course_manager_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_manager_id_seq OWNER TO rs_master;

--
-- Name: course_manager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_manager_id_seq OWNED BY public.course_manager.id;


--
-- Name: course_task; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.course_task (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "mentorStartDate" timestamp without time zone,
    "mentorEndDate" timestamp without time zone,
    "maxScore" integer,
    "taskId" integer NOT NULL,
    "scoreWeight" double precision DEFAULT 1,
    checker character varying DEFAULT 'mentor'::character varying NOT NULL,
    "taskOwnerId" integer,
    "studentStartDate" timestamp with time zone,
    "studentEndDate" timestamp with time zone,
    "courseId" integer,
    "pairsCount" integer,
    type character varying,
    disabled boolean DEFAULT false NOT NULL,
    "crossCheckEndDate" timestamp with time zone,
    "submitText" character varying(1024),
    validations text,
    "crossCheckStatus" public.course_task_crosscheckstatus_enum DEFAULT 'initial'::public.course_task_crosscheckstatus_enum NOT NULL,
    "teamDistributionId" integer
);


ALTER TABLE public.course_task OWNER TO rs_master;

--
-- Name: course_task_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.course_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_task_id_seq OWNER TO rs_master;

--
-- Name: course_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_task_id_seq OWNED BY public.course_task.id;


--
-- Name: course_user; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.course_user (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseId" integer NOT NULL,
    "userId" integer NOT NULL,
    "isManager" boolean DEFAULT false NOT NULL,
    "isJuryActivist" boolean DEFAULT false NOT NULL,
    "isSupervisor" boolean DEFAULT false NOT NULL,
    "isDementor" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.course_user OWNER TO rs_master;

--
-- Name: course_user_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.course_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.course_user_id_seq OWNER TO rs_master;

--
-- Name: course_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_user_id_seq OWNED BY public.course_user.id;


--
-- Name: cv; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.cv (
    id integer NOT NULL,
    "githubId" text NOT NULL,
    name text,
    "selfIntroLink" text,
    "startFrom" text,
    "fullTime" boolean,
    expires numeric,
    "militaryService" text,
    "englishLevel" text,
    "avatarLink" text,
    "desiredPosition" text,
    notes text,
    phone text,
    email text,
    skype text,
    telegram text,
    linkedin text,
    location text,
    "githubUsername" text,
    website text
);


ALTER TABLE public.cv OWNER TO rs_master;

--
-- Name: cv_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.cv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cv_id_seq OWNER TO rs_master;

--
-- Name: cv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.cv_id_seq OWNED BY public.cv.id;


--
-- Name: discipline; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.discipline (
    id integer NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    updated_date timestamp without time zone DEFAULT now() NOT NULL,
    deleted_date timestamp without time zone,
    name character varying NOT NULL
);


ALTER TABLE public.discipline OWNER TO rs_master;

--
-- Name: discipline_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.discipline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.discipline_id_seq OWNER TO rs_master;

--
-- Name: discipline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.discipline_id_seq OWNED BY public.discipline.id;


--
-- Name: discord_server; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.discord_server (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    "gratitudeUrl" character varying NOT NULL,
    "mentorsChatUrl" text
);


ALTER TABLE public.discord_server OWNER TO rs_master;

--
-- Name: discord_server_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.discord_server_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.discord_server_id_seq OWNER TO rs_master;

--
-- Name: discord_server_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.discord_server_id_seq OWNED BY public.discord_server.id;


--
-- Name: event; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.event (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    "descriptionUrl" character varying,
    description character varying,
    type character varying DEFAULT 'regular'::character varying NOT NULL,
    "disciplineId" integer
);


ALTER TABLE public.event OWNER TO rs_master;

--
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_id_seq OWNER TO rs_master;

--
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;


--
-- Name: feedback; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.feedback (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "badgeId" character varying DEFAULT 'Thank_you'::character varying,
    "fromUserId" integer NOT NULL,
    "toUserId" integer NOT NULL,
    "courseId" integer,
    comment character varying
);


ALTER TABLE public.feedback OWNER TO rs_master;

--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.feedback_id_seq OWNER TO rs_master;

--
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- Name: history; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.history (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    event character varying NOT NULL,
    "entityId" integer,
    operation character varying NOT NULL,
    update json,
    previous json
);


ALTER TABLE public.history OWNER TO rs_master;

--
-- Name: history_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.history_id_seq OWNER TO rs_master;

--
-- Name: history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.history_id_seq OWNED BY public.history.id;


--
-- Name: interview_question; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.interview_question (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    title character varying NOT NULL,
    question character varying NOT NULL
);


ALTER TABLE public.interview_question OWNER TO rs_master;

--
-- Name: interview_question_categories_interview_question_category; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.interview_question_categories_interview_question_category (
    "interviewQuestionId" integer NOT NULL,
    "interviewQuestionCategoryId" integer NOT NULL
);


ALTER TABLE public.interview_question_categories_interview_question_category OWNER TO rs_master;

--
-- Name: interview_question_category; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.interview_question_category (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.interview_question_category OWNER TO rs_master;

--
-- Name: interview_question_category_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.interview_question_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interview_question_category_id_seq OWNER TO rs_master;

--
-- Name: interview_question_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.interview_question_category_id_seq OWNED BY public.interview_question_category.id;


--
-- Name: interview_question_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.interview_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interview_question_id_seq OWNER TO rs_master;

--
-- Name: interview_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.interview_question_id_seq OWNED BY public.interview_question.id;


--
-- Name: login_state; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.login_state (
    id character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    data text NOT NULL,
    "userId" integer,
    expires timestamp without time zone
);


ALTER TABLE public.login_state OWNER TO rs_master;

--
-- Name: mentor; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.mentor (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "maxStudentsLimit" integer,
    "courseId" integer,
    "userId" integer NOT NULL,
    "studentsPreference" character varying,
    "isExpelled" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.mentor OWNER TO rs_master;

--
-- Name: mentor_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.mentor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mentor_id_seq OWNER TO rs_master;

--
-- Name: mentor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.mentor_id_seq OWNED BY public.mentor.id;


--
-- Name: mentor_registry; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.mentor_registry (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "preferedCourses" text DEFAULT ''::text NOT NULL,
    "maxStudentsLimit" integer NOT NULL,
    "englishMentoring" boolean NOT NULL,
    "preferedStudentsLocation" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "technicalMentoring" text DEFAULT ''::text NOT NULL,
    "preselectedCourses" text DEFAULT ''::text NOT NULL,
    canceled boolean DEFAULT false NOT NULL,
    "languagesMentoring" text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.mentor_registry OWNER TO rs_master;

--
-- Name: mentor_registry_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.mentor_registry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mentor_registry_id_seq OWNER TO rs_master;

--
-- Name: mentor_registry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.mentor_registry_id_seq OWNED BY public.mentor_registry.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO rs_master;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO rs_master;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification (
    id character varying NOT NULL,
    name character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    type character varying DEFAULT 'event'::character varying NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    "parentId" character varying
);


ALTER TABLE public.notification OWNER TO rs_master;

--
-- Name: notification_channel; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification_channel (
    id character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_channel OWNER TO rs_master;

--
-- Name: notification_channel_settings; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification_channel_settings (
    "notificationId" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "channelId" character varying NOT NULL,
    template text
);


ALTER TABLE public.notification_channel_settings OWNER TO rs_master;

--
-- Name: notification_user_connection; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification_user_connection (
    "userId" integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "channelId" character varying NOT NULL,
    "externalId" character varying NOT NULL,
    enabled boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notification_user_connection OWNER TO rs_master;

--
-- Name: notification_user_settings; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification_user_settings (
    "notificationId" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    enabled boolean NOT NULL,
    "userId" integer NOT NULL,
    "channelId" character varying NOT NULL
);


ALTER TABLE public.notification_user_settings OWNER TO rs_master;

--
-- Name: private_feedback; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.private_feedback (
    id integer NOT NULL,
    comment character varying,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseId" integer,
    "fromUserId" integer,
    "toUserId" integer
);


ALTER TABLE public.private_feedback OWNER TO rs_master;

--
-- Name: private_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.private_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.private_feedback_id_seq OWNER TO rs_master;

--
-- Name: private_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.private_feedback_id_seq OWNED BY public.private_feedback.id;


--
-- Name: profile_permissions; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.profile_permissions (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer NOT NULL,
    "isProfileVisible" json DEFAULT '{"all":false}'::json NOT NULL,
    "isAboutVisible" json DEFAULT '{"mentor":false,"student":false,"all":false}'::json NOT NULL,
    "isEducationVisible" json DEFAULT '{"mentor":false,"student":false,"all":false}'::json NOT NULL,
    "isEnglishVisible" json DEFAULT '{"student":false,"all":false}'::json NOT NULL,
    "isEmailVisible" json DEFAULT '{"student":true,"all":false}'::json NOT NULL,
    "isTelegramVisible" json DEFAULT '{"student":true,"all":false}'::json NOT NULL,
    "isSkypeVisible" json DEFAULT '{"student":true,"all":false}'::json NOT NULL,
    "isPhoneVisible" json DEFAULT '{"student":true,"all":false}'::json NOT NULL,
    "isContactsNotesVisible" json DEFAULT '{"student":true,"all":false}'::json NOT NULL,
    "isLinkedInVisible" json DEFAULT '{"mentor":false,"student":false,"all":false}'::json NOT NULL,
    "isPublicFeedbackVisible" json DEFAULT '{"mentor":false,"student":false,"all":false}'::json NOT NULL,
    "isMentorStatsVisible" json DEFAULT '{"mentor":false,"student":false,"all":false}'::json NOT NULL,
    "isStudentStatsVisible" json DEFAULT '{"student":false,"all":false}'::json NOT NULL
);


ALTER TABLE public.profile_permissions OWNER TO rs_master;

--
-- Name: profile_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.profile_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.profile_permissions_id_seq OWNER TO rs_master;

--
-- Name: profile_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.profile_permissions_id_seq OWNED BY public.profile_permissions.id;


--
-- Name: registry; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.registry (
    id integer NOT NULL,
    type character varying NOT NULL,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer NOT NULL,
    "courseId" integer NOT NULL,
    attributes json DEFAULT '{}'::json NOT NULL
);


ALTER TABLE public.registry OWNER TO rs_master;

--
-- Name: registry_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.registry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registry_id_seq OWNER TO rs_master;

--
-- Name: registry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.registry_id_seq OWNED BY public.registry.id;


--
-- Name: repository_event; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.repository_event (
    id integer NOT NULL,
    "repositoryUrl" character varying NOT NULL,
    action character varying NOT NULL,
    "githubId" character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer
);


ALTER TABLE public.repository_event OWNER TO rs_master;

--
-- Name: repository_event_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.repository_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.repository_event_id_seq OWNER TO rs_master;

--
-- Name: repository_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.repository_event_id_seq OWNED BY public.repository_event.id;


--
-- Name: resume; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.resume (
    id integer NOT NULL,
    "githubId" character varying(256) NOT NULL,
    name character varying(256),
    "selfIntroLink" character varying(256),
    "startFrom" character varying(32),
    "fullTime" boolean DEFAULT false NOT NULL,
    expires numeric,
    "militaryService" character varying(32),
    "englishLevel" character varying(8),
    "avatarLink" character varying(512),
    "desiredPosition" character varying(256),
    notes text,
    phone character varying(32),
    email character varying(256),
    skype character varying(128),
    telegram character varying(128),
    linkedin character varying(512),
    locations character varying(512),
    "githubUsername" character varying(256),
    website character varying(512),
    "isHidden" boolean DEFAULT false NOT NULL,
    "visibleCourses" integer[] DEFAULT '{}'::integer[] NOT NULL,
    uuid uuid DEFAULT public.uuid_generate_v4(),
    "userId" integer NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resume OWNER TO rs_master;

--
-- Name: resume_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.resume_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resume_id_seq OWNER TO rs_master;

--
-- Name: resume_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.resume_id_seq OWNED BY public.resume.id;


--
-- Name: stage; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.stage (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    "courseId" integer NOT NULL,
    status character varying DEFAULT 'OPEN'::character varying NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone
);


ALTER TABLE public.stage OWNER TO rs_master;

--
-- Name: stage_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stage_id_seq OWNER TO rs_master;

--
-- Name: stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_id_seq OWNED BY public.stage.id;


--
-- Name: stage_interview; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.stage_interview (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "studentId" integer NOT NULL,
    "mentorId" integer NOT NULL,
    "stageId" integer,
    "isCompleted" boolean DEFAULT false NOT NULL,
    decision character varying,
    "isGoodCandidate" boolean,
    "courseId" integer,
    "courseTaskId" integer,
    "isCanceled" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.stage_interview OWNER TO rs_master;

--
-- Name: stage_interview_feedback; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.stage_interview_feedback (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "stageInterviewId" integer NOT NULL,
    json character varying NOT NULL
);


ALTER TABLE public.stage_interview_feedback OWNER TO rs_master;

--
-- Name: stage_interview_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.stage_interview_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stage_interview_feedback_id_seq OWNER TO rs_master;

--
-- Name: stage_interview_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_feedback_id_seq OWNED BY public.stage_interview_feedback.id;


--
-- Name: stage_interview_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.stage_interview_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stage_interview_id_seq OWNER TO rs_master;

--
-- Name: stage_interview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_id_seq OWNED BY public.stage_interview.id;


--
-- Name: stage_interview_student; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.stage_interview_student (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "studentId" integer NOT NULL,
    "courseId" integer
);


ALTER TABLE public.stage_interview_student OWNER TO rs_master;

--
-- Name: stage_interview_student_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.stage_interview_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stage_interview_student_id_seq OWNER TO rs_master;

--
-- Name: stage_interview_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_student_id_seq OWNED BY public.stage_interview_student.id;


--
-- Name: student; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "isExpelled" boolean DEFAULT false NOT NULL,
    "expellingReason" character varying,
    "courseCompleted" boolean DEFAULT false NOT NULL,
    "isTopPerformer" boolean DEFAULT false NOT NULL,
    "preferedMentorGithubId" character varying,
    "readyFullTime" boolean,
    "courseId" integer,
    "userId" integer NOT NULL,
    "mentorId" integer,
    "cvUrl" character varying,
    "hiredById" character varying,
    "hiredByName" character varying,
    "isFailed" boolean DEFAULT false NOT NULL,
    "totalScore" double precision DEFAULT 0 NOT NULL,
    "startDate" timestamp with time zone DEFAULT '1970-01-01 00:00:00+00'::timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone,
    repository character varying,
    "totalScoreChangeDate" timestamp with time zone,
    "repositoryLastActivityDate" timestamp with time zone,
    rank integer DEFAULT 999999 NOT NULL,
    "crossCheckScore" double precision DEFAULT '0'::double precision NOT NULL,
    "unassigningComment" text,
    mentoring boolean DEFAULT true
);


ALTER TABLE public.student OWNER TO rs_master;

--
-- Name: student_feedback; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_feedback (
    id integer NOT NULL,
    created_date timestamp without time zone DEFAULT now() NOT NULL,
    updated_date timestamp without time zone DEFAULT now() NOT NULL,
    deleted_date timestamp without time zone,
    student_id integer NOT NULL,
    mentor_id integer,
    content json NOT NULL,
    recommendation character varying(64) NOT NULL,
    english_level character varying(8),
    author_id integer NOT NULL
);


ALTER TABLE public.student_feedback OWNER TO rs_master;

--
-- Name: student_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.student_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_feedback_id_seq OWNER TO rs_master;

--
-- Name: student_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.student_feedback_id_seq OWNED BY public.student_feedback.id;


--
-- Name: student_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.student_id_seq OWNER TO rs_master;

--
-- Name: student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.student_id_seq OWNED BY public.student.id;


--
-- Name: student_team_distribution_team_distribution; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_team_distribution_team_distribution (
    "studentId" integer NOT NULL,
    "teamDistributionId" integer NOT NULL
);


ALTER TABLE public.student_team_distribution_team_distribution OWNER TO rs_master;

--
-- Name: student_teams_team; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_teams_team (
    "studentId" integer NOT NULL,
    "teamId" integer NOT NULL
);


ALTER TABLE public.student_teams_team OWNER TO rs_master;

--
-- Name: task; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    "descriptionUrl" character varying,
    description character varying,
    verification character varying,
    "githubPrRequired" boolean,
    "useJury" boolean DEFAULT false NOT NULL,
    "allowStudentArtefacts" boolean DEFAULT false NOT NULL,
    "githubRepoName" character varying,
    "sourceGithubRepoUrl" character varying,
    type character varying,
    tags text DEFAULT ''::text NOT NULL,
    attributes json DEFAULT '{}'::json NOT NULL,
    skills text DEFAULT ''::text NOT NULL,
    "disciplineId" integer,
    "criteriaId" integer,
    "deletedDate" timestamp without time zone
);


ALTER TABLE public.task OWNER TO rs_master;

--
-- Name: task_artefact; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_artefact (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "videoUrl" character varying,
    "presentationUrl" character varying,
    comment character varying
);


ALTER TABLE public.task_artefact OWNER TO rs_master;

--
-- Name: task_artefact_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_artefact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_artefact_id_seq OWNER TO rs_master;

--
-- Name: task_artefact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_artefact_id_seq OWNED BY public.task_artefact.id;


--
-- Name: task_checker; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_checker (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "mentorId" integer NOT NULL
);


ALTER TABLE public.task_checker OWNER TO rs_master;

--
-- Name: task_checker_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_checker_id_seq OWNER TO rs_master;

--
-- Name: task_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_checker_id_seq OWNED BY public.task_checker.id;


--
-- Name: task_criteria; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_criteria (
    "taskId" integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    criteria jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public.task_criteria OWNER TO rs_master;

--
-- Name: task_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_id_seq OWNER TO rs_master;

--
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_id_seq OWNED BY public.task.id;


--
-- Name: task_interview_result; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_interview_result (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "mentorId" integer NOT NULL,
    "formAnswers" json DEFAULT '[]'::json NOT NULL,
    score integer,
    comment character varying
);


ALTER TABLE public.task_interview_result OWNER TO rs_master;

--
-- Name: task_interview_result_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_interview_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_interview_result_id_seq OWNER TO rs_master;

--
-- Name: task_interview_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_interview_result_id_seq OWNED BY public.task_interview_result.id;


--
-- Name: task_interview_student; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_interview_student (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "studentId" integer NOT NULL,
    "courseId" integer,
    "courseTaskId" integer NOT NULL
);


ALTER TABLE public.task_interview_student OWNER TO rs_master;

--
-- Name: task_interview_student_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_interview_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_interview_student_id_seq OWNER TO rs_master;

--
-- Name: task_interview_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_interview_student_id_seq OWNED BY public.task_interview_student.id;


--
-- Name: task_result; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_result (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "githubPrUrl" character varying,
    "githubRepoUrl" character varying,
    score integer NOT NULL,
    comment character varying,
    "studentId" integer NOT NULL,
    "courseTaskId" integer NOT NULL,
    "historicalScores" json DEFAULT '[]'::json NOT NULL,
    "juryScores" json DEFAULT '[]'::json NOT NULL,
    "lastCheckerId" integer
);


ALTER TABLE public.task_result OWNER TO rs_master;

--
-- Name: task_result_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_result_id_seq OWNER TO rs_master;

--
-- Name: task_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_result_id_seq OWNED BY public.task_result.id;


--
-- Name: task_solution; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_solution (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    url character varying NOT NULL,
    review json DEFAULT '[]'::json NOT NULL,
    comments json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.task_solution OWNER TO rs_master;

--
-- Name: task_solution_checker; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_solution_checker (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "taskSolutionId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "checkerId" integer NOT NULL
);


ALTER TABLE public.task_solution_checker OWNER TO rs_master;

--
-- Name: task_solution_checker_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_solution_checker_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_solution_checker_id_seq OWNER TO rs_master;

--
-- Name: task_solution_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_checker_id_seq OWNED BY public.task_solution_checker.id;


--
-- Name: task_solution_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_solution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_solution_id_seq OWNER TO rs_master;

--
-- Name: task_solution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_id_seq OWNED BY public.task_solution.id;


--
-- Name: task_solution_result; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_solution_result (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseTaskId" integer NOT NULL,
    "studentId" integer NOT NULL,
    "checkerId" integer NOT NULL,
    score integer NOT NULL,
    "historicalScores" json DEFAULT '[]'::json NOT NULL,
    comment character varying,
    anonymous boolean DEFAULT true NOT NULL,
    review json DEFAULT '[]'::json NOT NULL,
    messages json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.task_solution_result OWNER TO rs_master;

--
-- Name: task_solution_result_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_solution_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_solution_result_id_seq OWNER TO rs_master;

--
-- Name: task_solution_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_result_id_seq OWNED BY public.task_solution_result.id;


--
-- Name: task_verification; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.task_verification (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "studentId" integer NOT NULL,
    "courseTaskId" integer NOT NULL,
    details character varying,
    status character varying DEFAULT 'pending'::character varying NOT NULL,
    score integer NOT NULL,
    metadata json DEFAULT '[]'::json NOT NULL,
    answers json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.task_verification OWNER TO rs_master;

--
-- Name: task_verification_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.task_verification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.task_verification_id_seq OWNER TO rs_master;

--
-- Name: task_verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_verification_id_seq OWNED BY public.task_verification.id;


--
-- Name: team; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.team (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying NOT NULL,
    "chatLink" character varying,
    password character varying NOT NULL,
    "teamDistributionId" integer NOT NULL,
    "teamLeadId" integer
);


ALTER TABLE public.team OWNER TO rs_master;

--
-- Name: team_distribution; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.team_distribution (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "courseId" integer,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    name character varying NOT NULL,
    description character varying DEFAULT ''::character varying NOT NULL,
    "minTotalScore" integer DEFAULT 0 NOT NULL,
    "descriptionUrl" character varying DEFAULT ''::character varying NOT NULL,
    "minTeamSize" integer DEFAULT 2 NOT NULL,
    "maxTeamSize" integer DEFAULT 4 NOT NULL,
    "strictTeamSize" integer DEFAULT 3 NOT NULL,
    "strictTeamSizeMode" boolean DEFAULT true NOT NULL
);


ALTER TABLE public.team_distribution OWNER TO rs_master;

--
-- Name: team_distribution_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.team_distribution_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_distribution_id_seq OWNER TO rs_master;

--
-- Name: team_distribution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.team_distribution_id_seq OWNED BY public.team_distribution.id;


--
-- Name: team_distribution_student; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.team_distribution_student (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "studentId" integer NOT NULL,
    "courseId" integer,
    "teamDistributionId" integer NOT NULL,
    distributed boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.team_distribution_student OWNER TO rs_master;

--
-- Name: team_distribution_student_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.team_distribution_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_distribution_student_id_seq OWNER TO rs_master;

--
-- Name: team_distribution_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.team_distribution_student_id_seq OWNED BY public.team_distribution_student.id;


--
-- Name: team_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_id_seq OWNER TO rs_master;

--
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
-- Name: typeorm_metadata; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);


ALTER TABLE public.typeorm_metadata OWNER TO rs_master;

--
-- Name: user; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    "githubId" character varying NOT NULL,
    "firstName" character varying,
    "lastName" character varying,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    "firstNameNative" character varying,
    "lastNameNative" character varying,
    "tshirtSize" character varying,
    "tshirtFashion" character varying,
    "dateOfBirth" date,
    "locationName" character varying,
    "locationId" character varying,
    "educationHistory" json DEFAULT '[]'::json NOT NULL,
    "employmentHistory" json DEFAULT '[]'::json NOT NULL,
    "contactsEpamEmail" character varying,
    "contactsPhone" character varying,
    "contactsEmail" character varying,
    "externalAccounts" json DEFAULT '[]'::json NOT NULL,
    "epamApplicantId" character varying,
    activist boolean,
    "englishLevel" character varying,
    "lastActivityTime" bigint DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "primaryEmail" character varying,
    "contactsTelegram" character varying,
    "contactsSkype" character varying,
    "contactsNotes" character varying,
    "aboutMyself" character varying,
    "contactsLinkedIn" character varying,
    "profilePermissionsId" integer,
    "countryName" character varying,
    "cityName" character varying,
    "opportunitiesConsent" boolean DEFAULT false NOT NULL,
    "cvLink" text,
    "militaryService" text,
    discord json,
    "providerUserId" character varying(64),
    provider character varying(32),
    "contactsWhatsApp" character varying
);


ALTER TABLE public."user" OWNER TO rs_master;

--
-- Name: user_group; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.user_group (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    users integer[] NOT NULL,
    roles text[] NOT NULL
);


ALTER TABLE public.user_group OWNER TO rs_master;

--
-- Name: user_group_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.user_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_group_id_seq OWNER TO rs_master;

--
-- Name: user_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.user_group_id_seq OWNED BY public.user_group.id;


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: rs_master
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO rs_master;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: alert id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.alert ALTER COLUMN id SET DEFAULT nextval('public.alert_id_seq'::regclass);


--
-- Name: certificate id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate ALTER COLUMN id SET DEFAULT nextval('public.certificate_id_seq'::regclass);


--
-- Name: consent id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent ALTER COLUMN id SET DEFAULT nextval('public.consent_id_seq'::regclass);


--
-- Name: course id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course ALTER COLUMN id SET DEFAULT nextval('public.course_id_seq'::regclass);


--
-- Name: course_event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event ALTER COLUMN id SET DEFAULT nextval('public.course_event_id_seq'::regclass);


--
-- Name: course_manager id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager ALTER COLUMN id SET DEFAULT nextval('public.course_manager_id_seq'::regclass);


--
-- Name: course_task id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task ALTER COLUMN id SET DEFAULT nextval('public.course_task_id_seq'::regclass);


--
-- Name: course_user id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user ALTER COLUMN id SET DEFAULT nextval('public.course_user_id_seq'::regclass);


--
-- Name: cv id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv ALTER COLUMN id SET DEFAULT nextval('public.cv_id_seq'::regclass);


--
-- Name: discipline id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discipline ALTER COLUMN id SET DEFAULT nextval('public.discipline_id_seq'::regclass);


--
-- Name: discord_server id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discord_server ALTER COLUMN id SET DEFAULT nextval('public.discord_server_id_seq'::regclass);


--
-- Name: event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: history id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.history ALTER COLUMN id SET DEFAULT nextval('public.history_id_seq'::regclass);


--
-- Name: interview_question id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question ALTER COLUMN id SET DEFAULT nextval('public.interview_question_id_seq'::regclass);


--
-- Name: interview_question_category id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category ALTER COLUMN id SET DEFAULT nextval('public.interview_question_category_id_seq'::regclass);


--
-- Name: mentor id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor ALTER COLUMN id SET DEFAULT nextval('public.mentor_id_seq'::regclass);


--
-- Name: mentor_registry id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry ALTER COLUMN id SET DEFAULT nextval('public.mentor_registry_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: private_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback ALTER COLUMN id SET DEFAULT nextval('public.private_feedback_id_seq'::regclass);


--
-- Name: profile_permissions id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions ALTER COLUMN id SET DEFAULT nextval('public.profile_permissions_id_seq'::regclass);


--
-- Name: registry id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry ALTER COLUMN id SET DEFAULT nextval('public.registry_id_seq'::regclass);


--
-- Name: repository_event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.repository_event ALTER COLUMN id SET DEFAULT nextval('public.repository_event_id_seq'::regclass);


--
-- Name: resume id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume ALTER COLUMN id SET DEFAULT nextval('public.resume_id_seq'::regclass);


--
-- Name: stage id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage ALTER COLUMN id SET DEFAULT nextval('public.stage_id_seq'::regclass);


--
-- Name: stage_interview id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_id_seq'::regclass);


--
-- Name: stage_interview_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_feedback_id_seq'::regclass);


--
-- Name: stage_interview_student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_student_id_seq'::regclass);


--
-- Name: student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student ALTER COLUMN id SET DEFAULT nextval('public.student_id_seq'::regclass);


--
-- Name: student_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback ALTER COLUMN id SET DEFAULT nextval('public.student_feedback_id_seq'::regclass);


--
-- Name: task id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task ALTER COLUMN id SET DEFAULT nextval('public.task_id_seq'::regclass);


--
-- Name: task_artefact id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact ALTER COLUMN id SET DEFAULT nextval('public.task_artefact_id_seq'::regclass);


--
-- Name: task_checker id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker ALTER COLUMN id SET DEFAULT nextval('public.task_checker_id_seq'::regclass);


--
-- Name: task_interview_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result ALTER COLUMN id SET DEFAULT nextval('public.task_interview_result_id_seq'::regclass);


--
-- Name: task_interview_student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student ALTER COLUMN id SET DEFAULT nextval('public.task_interview_student_id_seq'::regclass);


--
-- Name: task_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result ALTER COLUMN id SET DEFAULT nextval('public.task_result_id_seq'::regclass);


--
-- Name: task_solution id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution ALTER COLUMN id SET DEFAULT nextval('public.task_solution_id_seq'::regclass);


--
-- Name: task_solution_checker id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker ALTER COLUMN id SET DEFAULT nextval('public.task_solution_checker_id_seq'::regclass);


--
-- Name: task_solution_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result ALTER COLUMN id SET DEFAULT nextval('public.task_solution_result_id_seq'::regclass);


--
-- Name: task_verification id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification ALTER COLUMN id SET DEFAULT nextval('public.task_verification_id_seq'::regclass);


--
-- Name: team id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- Name: team_distribution id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution ALTER COLUMN id SET DEFAULT nextval('public.team_distribution_id_seq'::regclass);


--
-- Name: team_distribution_student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student ALTER COLUMN id SET DEFAULT nextval('public.team_distribution_student_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_group id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.user_group ALTER COLUMN id SET DEFAULT nextval('public.user_group_id_seq'::regclass);


--
-- Data for Name: alert; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.alert (id, "createdDate", "updatedDate", text, "courseId", enabled, type) FROM stdin;
\.


--
-- Data for Name: certificate; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.certificate (id, "createdDate", "updatedDate", "publicId", "studentId", "s3Bucket", "s3Key", "issueDate") FROM stdin;
\.


--
-- Data for Name: consent; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.consent (id, "createdDate", "updatedDate", "channelValue", "channelType", "optIn", username) FROM stdin;
\.


--
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course (id, "createdDate", "updatedDate", name, year, "primarySkillId", "primarySkillName", "locationName", alias, completed, description, "descriptionUrl", planned, "startDate", "endDate", "fullName", "registrationEndDate", "inviteOnly", "discordServerId", "certificateIssuer", "usePrivateRepositories", "personalMentoring", logo, "disciplineId") FROM stdin;
11	2019-08-27 07:36:13.565873	2020-03-13 15:39:41.477995	RS 2019 Q3	\N	javascript	JavaScript	\N	rs-2019-q3	t	RS 2019 Q3	\N	f	2019-09-09 07:35:20.981+00	2020-01-31 07:35:20.981+00	Rolling Scopes School 2019 Q3	\N	f	\N	\N	t	t	\N	\N
13	2019-10-21 08:05:31.068833	2020-04-06 15:14:44.116961	RS 2020 Q1	\N	javascript	JavaScript	\N	rs-2020-q1	f	Javascript / Frontend Курс.\nВводное занятие - 2 февраля\nОрганизационный вебинар начнется 2 февраля в 12:00 по минскому времени (GMT+3). Мы расскажем о процессе обучения в RS School и выдадим задания для первого этапа обучения.\n\nВебинар будет транслироваться на канале https://www.youtube.com/c/rollingscopesschool.\nРекомендуем подписаться на канал и нажать колокольчик, чтобы не пропустить начало трансляции. \n\nЕсли у вас не будет возможности присоединиться к онлайн-трансляции, не переживайте! \nЗапись вебинара будет размещена на канале в открытом доступе.\n\nОписание тренинга\nОсновной сайт: https://rs.school/js/\n\nПодробная информация о школе:  https://docs.rs.school	\N	f	2020-02-02 09:01:56.398+00	2020-07-31 08:01:56.398+00	Rolling Scopes School 2020 Q1: JavaScript/Front-end	2020-04-15 08:40:46.24+00	f	\N	\N	t	t	\N	\N
23	2020-02-25 09:28:08.842897	2021-07-28 20:44:30.259905	TEST COURSE	\N	javascript	JavaScript	\N	test-course	f	TEST COURSE	\N	f	2021-05-31 21:00:00+00	2023-06-30 21:00:00+00	TEST COURSE	\N	t	2	\N	t	t	\N	\N
\.


--
-- Data for Name: course_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_event (id, "createdDate", "updatedDate", "eventId", "courseId", "stageId", date, "time", place, coordinator, comment, "organizerId", "detailsUrl", "broadcastUrl", "dateTime", special, duration, "endTime") FROM stdin;
2	2019-09-18 13:27:50.246961	2019-09-29 22:36:05.391483	2	11	\N	2019-09-13	20:00:00+03	Youtube Live	Sergey Shalyapin		3961	\N	https://www.youtube.com/watch?v=2iCgf03rx1I	2019-09-13 17:00:00+00		\N	\N
10	2019-09-19 08:06:38.306347	2019-09-29 22:36:37.450973	10	11	\N	2019-09-23	12:00:41+03	Discord >> announcement	Dzianis Sheka	\N	1328	\N	\N	2019-09-23 09:00:41+00		\N	\N
32	2019-10-15 11:39:32.584641	2019-10-15 11:48:54.960496	34	11	\N	2019-11-05	18:00:47+02	Youtube Live	\N	\N	2444	\N	\N	2019-11-05 16:00:47+00		\N	\N
9	2019-09-19 08:01:19.744354	2019-09-29 22:36:52.324181	9	11	\N	2019-09-25	20:00:39+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-25 17:00:39+00		\N	\N
31	2019-10-15 11:34:38.555567	2019-10-15 11:49:16.569959	33	11	\N	2019-11-04	18:00:58+02	Youtube Live	\N	\N	1090	\N	\N	2019-11-04 16:00:58+00		\N	\N
28	2019-10-14 14:01:29.842633	2019-10-15 11:49:46.776533	30	11	\N	2019-10-26	06:00:16+02	Youtube Live	\N	\N	1328	\N	\N	2019-10-26 04:00:16+00		\N	\N
8	2019-09-19 07:56:40.52603	2019-09-29 22:37:40.366214	8	11	\N	2019-09-23	19:00:52+03	Youtube Live	Anton Bely, Pavel Razuvalov	\N	2444	\N	\N	2019-09-23 16:00:52+00		\N	\N
11	2019-09-19 08:15:42.170571	2019-09-29 22:37:44.992841	11	11	\N	2019-09-27	20:00:54+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-27 17:00:54+00		\N	\N
12	2019-09-19 08:25:12.648501	2019-09-29 22:37:58.19294	12	11	\N	2019-09-30	20:00:25+03	Youtube Live	Viktoriya Vorozhun	\N	2693	\N	\N	2019-09-30 17:00:25+00		\N	\N
13	2019-09-19 08:27:16.85243	2019-09-29 22:38:11.029827	13	11	\N	2019-10-01	20:00:32+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-01 17:00:32+00		\N	\N
14	2019-09-19 08:58:14.462505	2019-09-29 22:38:15.108254	14	11	\N	2019-10-02	20:00:20+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-02 17:00:20+00		\N	\N
15	2019-09-19 09:01:29.234793	2019-09-29 22:38:18.967522	15	11	\N	2019-10-04	20:00:18+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-04 17:00:18+00		\N	\N
16	2019-09-19 09:04:00.058482	2019-09-29 22:38:24.161396	16	11	\N	2019-10-07	20:00:52+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-07 17:00:52+00		\N	\N
17	2019-09-19 09:10:34.094844	2019-09-29 22:38:30.112146	17	11	\N	2019-10-09	20:00:19+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-09 17:00:19+00		\N	\N
20	2019-09-19 09:18:06.890022	2019-09-29 22:38:43.832965	20	11	\N	2019-10-11	20:00:11+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-11 17:00:11+00		\N	\N
18	2019-09-19 09:15:26.553437	2019-09-29 22:38:50.345041	18	11	\N	2019-10-10	19:00:17+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-10-10 16:00:17+00		\N	\N
19	2019-09-19 09:16:44.454815	2019-09-29 22:39:00.633497	19	11	\N	2019-10-14	19:00:17+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-10-14 16:00:17+00		\N	\N
21	2019-09-19 09:20:29.557356	2019-09-29 22:39:11.116858	21	11	\N	2019-10-15	20:00:42+03	Youtube Live	Dzianis Sheka	\N	1328	\N	\N	2019-10-15 17:00:42+00		\N	\N
22	2019-09-19 09:27:50.542211	2019-09-29 22:39:18.865932	22	11	\N	2019-10-16	20:00:03+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-16 17:00:03+00		\N	\N
23	2019-09-19 09:32:15.883718	2019-09-29 22:39:31.265399	23	11	\N	2019-10-18	21:00:27+03	Youtube Live	Dzmitry Varabei	\N	2084	\N	\N	2019-10-18 18:00:27+00		\N	\N
25	2019-10-14 13:38:33.036547	2019-10-14 13:42:06.839216	27	11	\N	2019-10-23	\N	Self-Studying	\N		\N	\N	https://www.youtube.com/watch?v=CAvqa6Lj_Rg&list=PLe--kalBDwjj81fKdWlvpLsizajSAK-lh&index=18	2019-10-23 06:00:00+00		\N	\N
26	2019-10-14 13:51:28.629935	2019-10-14 13:51:28.629935	28	11	\N	2019-10-25	18:00:11+02	Youtube Live	\N	\N	6776	\N	\N	2019-10-25 16:00:11+00		\N	\N
27	2019-10-14 13:52:21.215211	2019-10-14 13:53:05.258274	29	11	\N	2019-10-25	19:00:11+02	Youtube Live	\N	\N	6776	\N	\N	2019-10-25 17:00:11+00		\N	\N
29	2019-10-14 14:10:56.691953	2019-10-14 14:10:56.691953	31	11	\N	2019-10-28	\N	Self-Studying	\N	\N	\N	\N	https://www.youtube.com/watch?v=H0XScE08hy8	2019-10-28 06:00:00+00		\N	\N
40	2019-10-15 12:03:50.220574	2019-10-15 12:03:50.220574	41	11	\N	2019-11-25	18:00:11+02	Youtube Live	\N	\N	2612	\N	\N	2019-11-25 16:00:11+00		\N	\N
41	2019-10-15 12:05:11.008733	2019-10-15 12:05:11.008733	42	11	\N	2019-11-27	\N	Self-Studying	\N	\N	\N	\N	\N	2019-11-27 06:00:00+00		\N	\N
7	2019-09-19 07:53:46.050222	2019-09-29 13:41:51.301574	7	11	\N	2019-09-21	19:00:19+03	Twich	Viktor Kovalev	\N	4749	\N	\N	2019-09-21 16:00:19+00		\N	\N
6	2019-09-18 13:38:43.043751	2019-09-29 13:39:46.636834	6	11	\N	2019-09-20	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-20 17:00:00+00		\N	\N
5	2019-09-18 13:36:41.630053	2019-09-29 13:39:56.720457	5	11	\N	2019-09-18	19:00:00+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-09-18 16:00:00+00		\N	\N
3	2019-09-18 13:29:31.396492	2019-09-29 13:39:36.356333	3	11	\N	2019-09-14	19:00:00+03	Twich	Viktor Kovalev	\N	4749	\N	\N	2019-09-14 16:00:00+00		\N	\N
1	2019-09-18 13:25:10.446065	2019-09-29 13:39:03.156556	1	11	\N	2019-09-11	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-11 17:00:00+00		\N	\N
24	2019-09-20 08:13:05.071726	2019-09-29 22:35:36.7697	24	11	\N	2019-09-09	19:00:20+03	Youtube Live	Dzmitry Varabei	\N	2084	\N	\N	2019-09-09 16:00:20+00		\N	\N
30	2019-10-14 14:14:48.89067	2019-10-29 11:02:52.806588	32	11	\N	2019-10-30	17:00:34+01	Youtube Live	\N	\N	2549	\N		2019-10-30 16:00:34+00		\N	\N
56	2019-11-13 07:58:22.70613	2019-11-20 10:30:55.29591	37	11	\N	2019-11-14	17:00:09+01	Youtube Live	\N	Part 2	4476	\N	\N	2019-11-14 16:00:09+00		\N	\N
34	2019-10-15 11:47:37.525411	2019-10-15 11:48:07.708192	36	11	\N	2019-11-11	\N	Self-Studying	\N	\N	\N	\N	\N	2019-11-11 06:00:00+00		\N	\N
52	2019-10-15 13:48:04.643143	2019-10-15 13:48:04.643143	49	11	\N	2019-12-18	21:00:24+02	Youtube Live	\N	\N	1328	\N	\N	2019-12-18 19:00:24+00		\N	\N
54	2019-10-16 09:35:26.303099	2019-10-16 09:38:41.390559	51	11	\N	2020-01-10	21:00:30+02	Youtube Live	\N	"Monday Mentor"	1328	\N	\N	2020-01-10 19:00:30+00		\N	\N
53	2019-10-16 08:55:38.580672	2019-10-16 09:38:47.92149	50	11	\N	2019-12-30	21:00:18+02	Youtube Live	\N	"Monday Mentor"	1328	\N	\N	2019-12-30 19:00:18+00		\N	\N
43	2019-10-15 13:19:27.167531	2019-10-16 09:39:12.634215	44	11	\N	2019-12-09	18:00:39+02	Youtube Live	\N	"Monday Mentor"	2612	\N	\N	2019-12-09 16:00:39+00		\N	\N
55	2019-10-17 08:39:24.313773	2019-10-17 08:59:37.788018	52	11	\N	2019-10-22	07:00:49+02	Discord >> announcement	\N	\N	1328	\N	\N	2019-10-22 05:00:49+00		\N	\N
33	2019-10-15 11:41:49.437101	2019-11-04 08:05:30.353745	35	11	\N	2019-11-06	\N		\N	\N	\N	\N	\N	2019-11-06 06:00:00+00		\N	\N
57	2019-11-13 10:00:57.263816	2019-11-13 10:00:57.263816	38	11	\N	2019-11-15	17:00:13+01	\N	\N	\N	\N	\N	\N	2019-11-15 16:00:13+00		\N	\N
45	2019-10-15 13:22:46.522679	2019-11-19 10:24:53.907876	45	11	\N	2019-12-10	18:00:23+01	Youtube Live	\N	Andre Gloukhmantchouk	\N	\N	\N	2019-12-10 17:00:23+00		\N	\N
37	2019-10-15 11:57:45.893502	2019-11-13 10:16:05.257876	39	11	\N	2019-11-19	20:00:59+01	Youtube Live	\N	\N	1328	\N	\N	2019-11-19 19:00:59+00		\N	\N
58	2019-11-13 10:41:26.703281	2019-11-13 10:41:26.703281	40	11	\N	2019-11-19	17:00:35+01	\N	\N	\N	\N	\N	\N	2019-11-19 16:00:35+00		\N	\N
59	2019-11-13 10:45:10.752653	2019-11-13 10:45:10.752653	53	11	\N	2019-11-20	17:00:59+01	Imaguru	\N	\N	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-11-20 16:00:59+00		\N	\N
61	2019-11-13 15:03:10.873277	2019-11-13 15:03:10.873277	55	11	\N	2019-11-21	19:00:58+01	Discord >> announcement	\N	Optional test without score and deadline	1328	\N	\N	2019-11-21 18:00:58+00		\N	\N
51	2019-10-15 13:46:51.156727	2019-11-14 08:04:43.997755	46	11	\N	2019-12-20	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-5	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-20 16:00:03+00		\N	\N
50	2019-10-15 13:46:25.188954	2019-11-14 08:05:21.714914	46	11	\N	2019-12-19	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-4	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-19 16:00:03+00		\N	\N
49	2019-10-15 13:45:26.160284	2019-11-14 08:05:57.063452	46	11	\N	2019-12-17	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-3	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-17 16:00:03+00		\N	\N
46	2019-10-15 13:38:17.289871	2019-11-14 08:06:34.523225	46	11	\N	2019-12-12	17:00:08+01		\N	https://community-z.com/events/rss2019q3-presentations-2	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-12 16:00:08+00		\N	\N
62	2019-11-14 08:08:21.712392	2019-11-14 08:08:40.889422	46	11	\N	2019-12-11	17:00:18+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-1	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-11 16:00:18+00		\N	\N
47	2019-10-15 13:40:23.348495	2019-11-19 10:25:27.58625	47	11	\N	2019-12-13	18:00:40+01	Youtube Live	\N	Andre Gloukhmantchouk	\N	\N	\N	2019-12-13 17:00:40+00		\N	\N
60	2019-11-13 14:32:00.780799	2019-11-19 08:46:13.282679	54	11	\N	2019-11-21	06:00:43+01	Discord >> announcement	\N	Optional test without score and deadline	1328	\N	\N	2019-11-21 05:00:43+00		\N	\N
63	2019-11-19 13:03:55.859842	2019-11-19 13:03:55.859842	56	11	\N	2019-12-23	18:00:20+01	Youtube Live	\N	\N	1328	\N	https://www.youtube.com/c/RollingScopesSchool	2019-12-23 17:00:20+00		\N	\N
35	2019-10-15 11:52:24.439929	2019-11-20 10:30:47.532359	37	11	\N	2019-11-13	17:00:37+01	Youtube Live	\N	Part 1	4476	\N	\N	2019-11-13 16:00:37+00		\N	\N
4	2019-09-18 13:32:30.103621	2019-09-29 22:36:22.6367	4	11	\N	2019-09-16	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-16 17:00:00+00		\N	\N
64	2019-11-20 10:31:56.663441	2019-11-20 10:31:56.663441	37	11	\N	2019-11-26	17:00:32+01	Youtube Live	\N	Part 3	4476	\N	\N	2019-11-26 16:00:32+00		\N	\N
65	2019-11-20 10:46:52.962706	2019-11-20 10:46:52.962706	57	11	\N	2019-12-16	17:00:37+01	Youtube Live	\N	\N	1328	\N	\N	2019-12-16 16:00:37+00		\N	\N
66	2019-11-20 11:06:19.515961	2019-11-20 11:06:19.515961	59	11	\N	2020-01-31	07:00:31+01	\N	\N	\N	\N	\N	\N	2020-01-31 06:00:31+00		\N	\N
365	2021-05-24 07:20:56.788715	2021-05-24 07:20:56.788715	184	23	\N	\N	\N	YouTube	\N	\N	2084	\N	\N	2021-05-27 14:00:52.55+00		2	\N
366	2021-06-22 11:42:36.951384	2021-06-22 11:42:36.951384	185	23	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-06-24 14:00:00+00		\N	\N
367	2021-06-22 14:07:40.909358	2021-06-22 14:07:40.909358	186	23	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-07-25 21:59:15.201+00		\N	\N
372	2021-06-25 11:17:49.097994	2021-07-02 14:10:23.571015	189	23	\N	\N	\N	YouTube	\N	\N	2084	\N	\N	2021-07-06 15:30:00+00		\N	\N
375	2021-06-30 12:43:57.602426	2021-07-01 07:32:06.927318	192	23	\N	\N	\N	youtube	\N	\N	2084	\N	\N	2021-07-01 16:30:00+00		\N	\N
398	2021-07-05 20:58:39.710814	2021-07-07 15:21:56.684306	201	23	\N	\N	\N	youtube	\N	\N	2084	\N	\N	2021-07-08 15:00:00+00		\N	\N
399	2021-07-06 09:39:48.224795	2021-07-08 06:13:01.681283	202	23	\N	\N	\N	\N	\N	\N	2084	\N	\N	2021-07-12 23:59:04.648+00		\N	\N
409	2021-07-16 11:12:11.214905	2021-07-22 05:33:46.72208	212	23	\N	\N	\N	\N	\N	\N	2084	\N	\N	2021-07-24 23:59:00+00		\N	\N
410	2021-07-20 13:47:53.823319	2021-07-20 13:49:26.410219	213	23	\N	\N	\N	\N	\N	\N	\N	\N	\N	2021-07-24 23:59:00+00		\N	\N
\.


--
-- Data for Name: course_manager; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_manager (id, "createdDate", "updatedDate", "courseId", "userId") FROM stdin;
\.


--
-- Data for Name: course_task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_task (id, "createdDate", "updatedDate", "mentorStartDate", "mentorEndDate", "maxScore", "taskId", "scoreWeight", checker, "taskOwnerId", "studentStartDate", "studentEndDate", "courseId", "pairsCount", type, disabled, "crossCheckEndDate", "submitText", validations, "crossCheckStatus", "teamDistributionId") FROM stdin;
387	2020-02-24 06:42:44.772736	2020-02-25 10:28:14.611904	\N	\N	54	434	0.1	taskOwner	587	2020-02-22 15:00:00+00	2020-02-23 15:00:00+00	13	\N	test	f	\N	\N	\N	initial	\N
426	2020-03-31 11:04:53.472383	2020-03-31 11:04:53.472383	\N	\N	100	129	0.01	auto-test	\N	2020-03-30 20:59:00+00	2020-04-25 20:59:00+00	13	\N	codewars:stage2	f	\N	\N	\N	initial	\N
399	2020-03-02 13:25:46.327431	2020-03-17 08:04:28.635812	\N	\N	100	421	0.2	mentor	2103	2020-03-02 13:25:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
383	2020-02-19 15:19:31.540441	2020-03-22 19:02:59.763044	\N	\N	100	472	0.2	mentor	2103	2020-02-19 15:19:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
321	2019-10-15 12:42:42.1037	2019-10-15 12:43:35.36623	\N	\N	100	435	0.5	taskOwner	3961	2019-10-06 00:00:00+00	2019-10-08 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
337	2019-11-13 08:21:59.44239	2019-11-19 08:47:29.701909	\N	\N	100	446	1	mentor	1328	2019-11-14 17:00:00+00	2019-11-18 20:49:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
348	2019-11-19 10:52:33.333176	2019-11-19 10:52:33.333176	\N	\N	100	350	1	mentor	1328	2019-12-23 17:00:00+00	2020-01-02 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
350	2019-11-20 10:40:56.936083	2020-01-20 20:56:08.618894	\N	\N	280	448	0.7	mentor	1328	2019-11-03 08:00:00+00	2019-12-18 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
346	2019-11-19 09:32:03.882014	2020-01-20 21:16:18.023264	\N	\N	100	349	5	assigned	\N	2020-01-08 15:00:00+00	2020-01-20 15:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
342	2019-11-18 07:49:09.892108	2020-01-29 10:07:18.716975	\N	\N	100	447	1	mentor	\N	2020-01-28 10:07:00+00	2020-02-20 10:07:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
302	2019-09-19 10:04:08.320328	2019-11-20 21:51:46.684981	\N	\N	100	423	0.02	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
306	2019-09-20 09:59:01.071936	2019-11-20 21:52:10.896805	\N	\N	100	428	0.01	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
309	2019-09-22 09:57:59.933548	2019-11-20 21:52:27.065892	\N	\N	100	429	0.04	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
315	2019-09-30 08:20:14.840054	2019-11-20 21:54:03.067127	\N	\N	100	434	0.01	taskOwner	2032	2019-09-28 00:00:00+00	2019-09-28 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
318	2019-10-06 11:21:27.376684	2019-11-20 21:54:20.53693	\N	\N	100	437	0.01	mentor	\N	2019-09-16 00:00:00+00	2019-09-22 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
388	2020-02-24 06:43:57.26983	2020-02-25 10:28:23.927547	\N	\N	50	432	0.1	taskOwner	2480	2020-02-22 15:00:00+00	2020-02-23 15:00:00+00	13	\N	test	f	\N	\N	\N	initial	\N
374	2020-02-15 14:44:37.656023	2020-03-12 07:20:40.425622	\N	\N	100	467	0.2	mentor	5481	2020-02-15 14:00:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
380	2020-02-19 15:16:59.219399	2020-03-22 19:08:34.853331	\N	\N	100	475	0.2	mentor	2103	2020-02-19 15:15:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
408	2020-03-15 23:12:19.237073	2020-03-30 07:23:21.073835	\N	\N	100	484	1	taskOwner	2084	2020-03-22 21:00:00+00	2020-04-11 20:59:00+00	13	\N	stage-interview	f	\N	\N	\N	initial	\N
430	2020-04-04 18:29:20.218081	2020-04-04 19:44:07.634629	\N	\N	100	435	0.1	auto-test	3961	2020-04-02 19:00:00+00	2020-04-05 20:59:00+00	13	\N	test	f	\N	\N	\N	initial	\N
303	2019-09-19 10:04:35.673232	2019-11-20 21:51:53.750426	\N	\N	100	422	0.03	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
343	2019-11-19 08:57:16.511397	2019-11-26 06:57:02.144395	\N	\N	100	246	1	taskOwner	2612	2019-11-23 09:00:00+00	2019-11-23 13:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
401	2020-03-09 08:21:51.143582	2020-03-10 08:46:07.22067	\N	\N	100	433	0.1	taskOwner	3961	2020-03-08 19:00:00+00	2020-03-08 19:00:00+00	13	\N	test	f	\N	\N	\N	initial	\N
417	2020-03-21 19:19:58.863021	2020-03-21 19:19:58.863021	\N	\N	100	484	1	mentor	\N	2019-09-30 21:00:00+00	2019-11-30 21:00:00+00	11	\N	stage-interview	f	\N	\N	\N	initial	\N
381	2020-02-19 15:17:32.07091	2020-03-22 19:09:12.677292	\N	\N	100	474	0.2	mentor	2103	2020-02-19 15:17:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
397	2020-03-02 13:24:09.075432	2020-03-22 19:12:20.05552	\N	\N	100	426	0.2	mentor	2103	2020-03-20 13:20:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
423	2020-03-31 10:19:16.141261	2020-04-06 07:07:06.10971	\N	\N	110	444	0.7	mentor	1090	2020-03-23 21:00:00+00	2020-04-07 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
300	2019-09-17 08:15:35.715649	2020-04-06 10:49:35.519015	\N	\N	100	417	0.01	mentor	\N	2019-09-09 00:00:00+00	2019-09-19 00:00:00+00	11	\N	htmlcssacademy	f	\N	\N	\N	initial	\N
344	2019-11-19 09:04:18.469854	2019-11-28 17:17:02.674641	\N	\N	128	129	1	mentor	\N	2019-09-09 08:00:00+00	2019-11-24 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
327	2019-10-28 07:42:02.903354	2019-11-15 12:34:30.259197	\N	\N	100	418	1	mentor	\N	2019-09-20 17:00:00+00	2019-09-29 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
331	2019-11-04 08:15:10.985127	2019-11-15 12:37:57.067586	\N	\N	110	444	1	mentor	\N	2019-11-01 16:00:00+00	2019-11-06 20:39:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
354	2019-12-07 14:35:20.567268	2019-12-11 16:33:41.983256	\N	\N	60	96	1	jury	2084	2019-12-07 12:31:00+00	2019-12-28 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
313	2019-09-30 08:17:27.15297	2019-11-20 21:53:55.352852	\N	\N	100	432	0.01	taskOwner	2480	2019-09-22 00:00:00+00	2019-09-22 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
316	2019-09-30 08:22:03.026072	2019-11-20 21:54:11.847779	\N	\N	100	433	0.05	taskOwner	2032	2019-09-26 00:00:00+00	2019-09-26 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
319	2019-10-13 13:51:52.830672	2019-11-20 21:55:14.344517	\N	\N	100	439	0.3	mentor	1328	2019-10-13 00:00:00+00	2019-10-20 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
310	2019-09-22 09:58:21.070871	2019-11-20 21:52:32.957984	\N	\N	100	430	0.04	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
325	2019-10-27 12:09:53.130143	2019-11-15 12:31:01.943109	\N	\N	50	442	1	mentor	\N	2019-10-24 17:00:00+00	2019-10-27 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
307	2019-09-20 09:59:22.00868	2019-11-20 21:52:16.13903	\N	\N	100	427	0.04	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
369	2020-02-02 03:55:35.429745	2020-03-12 07:11:39.495304	\N	\N	100	437	0.1	mentor	\N	2020-02-02 01:54:00+00	2020-02-16 20:59:00+00	13	\N	cv:markdown	f	\N	\N	\N	initial	\N
373	2020-02-09 18:18:59.381025	2020-03-12 07:13:13.223671	\N	\N	60	465	0.2	mentor	\N	2020-02-01 21:00:00+00	2020-03-15 20:59:00+00	13	\N	codewars:stage1	f	\N	\N	\N	initial	\N
368	2020-02-01 20:13:13.966515	2020-03-12 07:10:32.0252	\N	\N	100	417	0.1	mentor	2032	2020-02-02 09:00:00+00	2020-02-23 20:59:00+00	13	\N	htmlcssacademy	f	\N	\N	\N	initial	\N
336	2019-11-13 07:47:34.232721	2019-11-15 12:40:11.757945	\N	\N	120	445	1	mentor	1328	2019-11-08 05:00:00+00	2019-11-11 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
328	2019-10-28 07:48:01.625307	2019-11-15 12:42:26.150687	\N	\N	100	443	1	mentor	\N	2019-10-01 17:00:00+00	2019-12-01 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
345	2019-11-19 09:23:27.67568	2019-12-23 21:01:53.560053	\N	\N	100	83	1	mentor	2032	2019-11-30 17:00:00+00	2019-12-24 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
320	2019-10-13 13:52:22.151208	2019-11-16 13:10:56.094496	\N	\N	100	438	0.3	mentor	1328	2019-10-13 00:00:00+00	2019-10-20 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
349	2019-11-19 11:04:25.743014	2020-01-14 08:52:31.860422	\N	\N	450	352	1	assigned	1328	2019-12-18 19:00:00+00	2020-01-08 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
347	2019-11-19 10:18:28.401575	2019-11-19 10:18:28.401575	\N	\N	100	351	1	taskOwner	2612	2019-12-07 09:00:00+00	2019-12-07 13:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
332	2019-11-05 11:51:40.950343	2019-11-19 10:21:01.444201	\N	\N	120	89	1	mentor	\N	2019-11-03 21:00:00+00	2019-12-08 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
351	2019-11-20 11:37:02.922582	2019-11-20 11:37:02.922582	\N	\N	100	407	1	mentor	\N	2020-01-01 08:00:00+00	2020-01-17 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
367	2020-01-19 16:51:46.691809	2020-01-19 16:51:46.691809	\N	\N	100	88	1	taskOwner	1328	2020-01-18 21:00:00+00	2020-01-19 21:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
301	2019-09-17 13:42:41.220995	2019-11-20 21:51:18.507183	\N	\N	100	421	0.02	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
304	2019-09-20 09:45:08.623688	2019-11-20 21:51:58.821689	\N	\N	100	424	0.05	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
305	2019-09-20 09:45:31.423306	2019-11-20 21:52:03.967525	\N	\N	100	425	0.03	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
308	2019-09-20 09:59:54.237603	2019-11-20 21:52:21.418289	\N	\N	100	426	0.02	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
382	2020-02-19 15:18:06.945157	2020-03-22 19:03:14.201634	\N	\N	100	473	0.2	mentor	2103	2020-02-19 15:17:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
370	2020-02-02 04:03:10.255065	2020-03-12 07:11:48.755187	\N	\N	100	84	0.1	autoTest	\N	2020-02-02 02:02:00+00	2020-02-18 20:59:00+00	13	\N	cv:html	f	\N	\N	\N	initial	\N
398	2020-03-02 13:24:43.551181	2020-03-17 08:05:11.649945	\N	\N	100	424	0.5	mentor	2103	2020-03-02 13:24:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f	\N	\N	\N	initial	\N
718	2020-02-24 06:43:57.27	2020-12-19 07:08:38.178221	\N	\N	50	432	0.2	taskOwner	2084	2021-03-19 15:00:00+00	2021-03-20 15:00:00+00	23	\N	test	t	\N	\N	\N	initial	\N
719	2020-03-15 23:12:19.237	2021-05-17 17:21:40.075257	\N	\N	50	484	1	taskOwner	2084	2021-05-04 00:00:00+00	2021-05-18 23:59:00+00	23	\N	stage-interview	f	\N	\N	\N	initial	\N
720	2020-02-19 15:16:59.219	2021-03-06 09:11:06.762852	\N	\N	100	475	0.05	auto-test	2084	2021-02-28 21:59:00+00	2021-03-15 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
721	2020-03-02 13:25:46.327	2021-03-06 09:11:43.622874	\N	\N	100	421	0.05	mentor	2084	2021-02-28 21:59:00+00	2021-03-15 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
722	2020-02-19 15:19:31.54	2021-03-06 09:12:16.168284	\N	\N	100	472	0.05	mentor	2084	2021-02-28 21:59:00+00	2021-03-15 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
723	2020-03-02 13:24:09.075	2020-12-27 07:57:56.442267	\N	\N	100	426	0.1	mentor	2084	2021-04-06 13:20:00+00	2021-04-18 21:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
724	2020-02-19 15:17:32.071	2021-03-06 09:28:28.111453	\N	\N	100	474	0.05	mentor	2084	2021-02-28 23:59:00+00	2021-03-15 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
726	2020-02-02 04:03:10.255	2021-03-06 09:05:38.409628	\N	\N	100	84	0.1	autoTest	\N	2021-02-27 03:02:00+00	2021-03-08 23:59:00+00	23	\N	cv:html	f	\N	\N	\N	initial	\N
727	2020-03-09 08:21:51.144	2020-12-19 07:08:30.734975	\N	\N	100	433	0.2	taskOwner	2084	2021-04-03 19:00:00+00	2021-04-03 19:00:00+00	23	\N	test	t	\N	\N	\N	initial	\N
728	2020-09-09 16:31:08.778	2020-12-27 07:05:14.675656	\N	\N	100	568	0.1	auto-test	2084	2021-03-02 20:59:00+00	2021-04-25 20:59:00+00	23	\N	selfeducation	t	\N	\N	\N	initial	\N
729	2020-09-09 16:32:20.373	2020-12-27 07:05:25.568066	\N	\N	100	567	0.1	auto-test	2084	2021-03-02 20:00:00+00	2021-04-25 20:59:00+00	23	\N	selfeducation	t	\N	\N	\N	initial	\N
730	2020-09-09 16:33:07.413	2020-12-27 07:05:31.951659	\N	\N	100	569	0.1	auto-test	2084	2021-03-02 20:59:00+00	2021-04-25 20:59:00+00	23	\N	selfeducation	t	\N	\N	\N	initial	\N
731	2020-02-15 14:44:37.656	2021-03-30 05:41:33.668199	\N	\N	100	467	0.5	mentor	2084	2021-01-20 16:00:00+00	2021-03-30 22:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
732	2020-02-09 18:18:59.381	2020-12-19 07:08:19.25978	\N	\N	60	465	1	mentor	\N	2021-02-26 19:00:00+00	2021-04-04 20:59:00+00	23	\N	codewars:stage1	t	\N	\N	\N	initial	\N
733	2020-02-02 03:55:35.43	2021-03-06 09:04:46.985011	\N	\N	100	437	0.1	auto-test	\N	2021-02-27 02:54:00+00	2021-03-08 23:59:00+00	23	\N	cv:markdown	f	\N	\N	\N	initial	\N
734	2020-02-24 06:42:44.773	2020-12-19 07:06:44.394231	\N	\N	100	434	0.2	taskOwner	2084	2021-03-13 15:00:00+00	2021-03-14 15:00:00+00	23	\N	test	t	\N	\N	\N	initial	\N
736	2020-09-28 15:59:54.118	2020-12-14 11:25:09.139521	\N	\N	210	577	0.2	mentor	\N	2021-04-26 01:59:00+00	2021-05-10 23:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
740	2020-11-20 07:16:10.732	2020-12-14 11:24:43.632522	\N	\N	210	500	0.2	mentor	\N	2021-05-10 06:15:00+00	2021-05-31 23:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
743	2020-11-03 15:25:45.804	2020-12-19 07:07:17.139765	\N	\N	128	129	0.2	auto-test	\N	2021-04-27 23:59:00+00	2021-05-17 23:59:00+00	23	\N	codewars	t	\N	\N	\N	initial	\N
745	2020-11-20 07:22:07.672	2020-12-14 11:24:35.798531	\N	\N	210	584	0.2	mentor	\N	2021-05-10 06:21:00+00	2021-05-31 23:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
747	2020-11-30 08:13:18.401	2020-12-14 11:24:26.882041	\N	\N	100	83	0.5	auto-test	2084	2021-05-24 08:12:00+00	2021-06-07 22:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
748	2020-11-29 19:28:52.429	2020-12-14 11:24:54.693418	\N	\N	100	229	0.1	taskOwner	2084	2021-05-22 15:00:00+00	2021-05-23 15:00:00+00	23	\N	test	t	\N	\N	\N	initial	\N
749	2020-12-01 14:39:15.604	2020-12-14 11:24:51.175695	\N	\N	120	89	1	mentor	\N	2021-04-23 23:59:00+00	2021-05-25 23:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
750	2020-12-04 09:25:44.758	2020-12-14 11:24:47.561727	\N	\N	76	531	0.149999999999999	taskOwner	2084	2021-05-28 18:00:00+00	2021-05-30 18:00:00+00	23	\N	test	t	\N	\N	\N	initial	\N
751	2020-12-09 12:07:23.808	2020-12-14 11:24:13.461012	\N	\N	10	349	10	mentor	2084	2021-06-07 00:00:00+00	2021-06-21 23:59:00+00	23	\N	interview	t	\N	\N	\N	initial	\N
752	2020-12-11 12:22:20.579	2020-12-14 11:24:23.203131	\N	\N	280	589	0.2	mentor	\N	2021-06-01 12:21:00+00	2021-06-17 00:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
764	2020-12-19 13:05:37.532114	2021-03-16 04:44:14.87901	\N	\N	15	592	1	auto-test	2084	2021-02-28 13:04:00+00	2021-03-09 00:59:00+00	23	\N	codewars	f	\N	\N	\N	initial	\N
767	2020-12-26 18:38:48.344647	2021-03-06 09:02:35.081732	\N	\N	100	596	0.1	auto-test	2084	2020-12-25 21:59:00+00	2021-03-08 23:59:00+00	23	\N	selfeducation	f	\N	\N	\N	initial	\N
768	2020-12-26 18:39:33.065223	2021-03-06 09:03:26.018831	\N	\N	100	597	0.1	auto-test	2084	2020-12-25 21:59:00+00	2021-03-08 23:59:00+00	23	\N	selfeducation	f	\N	\N	\N	initial	\N
833	2021-03-02 11:27:43.699601	2021-03-08 09:16:47.157628	\N	\N	100	615	0	mentor	2084	2021-03-01 22:59:00+00	2021-03-14 22:59:00+00	23	\N	test	t	\N	\N	\N	initial	\N
845	2021-03-16 04:27:15.526178	2021-03-30 05:41:07.113384	\N	\N	65	465	0.5	auto-test	2084	2021-03-16 05:22:00+00	2021-03-30 22:59:00+00	23	\N	codewars	f	\N	\N	\N	initial	\N
864	2021-04-02 16:07:20.055716	2021-04-02 16:07:20.055716	\N	\N	100	432	0.1	taskOwner	2084	2021-04-02 16:00:00+00	2021-04-04 16:00:00+00	23	\N	test	f	\N	\N	\N	initial	\N
866	2021-04-05 15:41:10.480048	2021-04-07 11:36:23.008047	\N	\N	100	639	0.149999999999999	auto-test	\N	2021-04-06 00:00:00+00	2021-04-12 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
871	2021-04-11 09:24:28.636388	2021-04-11 09:24:28.636388	\N	\N	100	433	0.1	auto-test	2084	2021-04-10 09:10:00+00	2021-04-11 09:10:00+00	23	\N	test	f	\N	\N	\N	initial	\N
888	2021-04-19 15:25:43.189874	2021-04-29 07:10:23.047691	\N	\N	50	484	1	taskOwner	2084	2021-05-04 23:59:00+00	2021-05-18 23:59:00+00	23	\N	stage-interview	t	\N	\N	\N	initial	\N
891	2021-04-20 07:59:31.355572	2021-04-20 08:00:02.758902	\N	\N	100	641	0.1	auto-test	2084	2021-04-20 08:00:00+00	2021-04-26 23:59:00+00	23	\N	selfeducation	f	\N	\N	\N	initial	\N
913	2021-05-04 13:42:38.3986	2021-05-07 11:39:02.702583	\N	\N	128	129	0.5	auto-test	2084	2021-05-04 15:42:00+00	2021-05-31 23:59:00+00	23	\N	codewars	t	\N	\N	\N	initial	\N
916	2021-05-07 11:44:06.354446	2021-05-07 11:44:06.354446	\N	\N	81	671	0.5	auto-test	2084	2021-05-07 14:00:00+00	2021-05-31 23:59:00+00	23	\N	codewars	f	\N	\N	\N	initial	\N
924	2021-05-20 12:03:27.067163	2021-05-20 12:03:27.067163	\N	\N	200	677	1	auto-test	2084	2021-03-23 20:00:00+00	2021-04-23 23:59:00+00	23	\N	htmltask	f	\N	\N	\N	initial	\N
928	2021-05-26 14:04:17.496156	2021-05-26 14:05:56.930802	\N	\N	160	679	1	mentor	2084	2021-05-11 00:01:00+00	2021-05-31 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
929	2021-05-26 14:30:24.6811	2021-06-13 13:50:58.160679	\N	\N	150	680	1	mentor	2084	2021-06-01 23:59:00+00	2021-06-16 23:59:00+00	23	\N	JS task	f	\N	\N	\N	initial	\N
945	2021-06-01 07:37:00.990005	2021-06-01 07:37:00.990005	\N	\N	120	89	1	mentor	2084	2021-05-21 10:36:00+00	2021-06-21 23:59:00+00	23	\N	\N	f	\N	\N	\N	initial	\N
946	2021-06-01 07:41:10.17798	2021-06-01 07:41:10.17798	\N	\N	50	96	1	jury	2084	2021-06-22 10:39:00+00	2021-06-28 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
959	2021-06-05 07:43:45.453015	2021-07-20 16:03:20.793296	\N	\N	10	349	10	mentor	2084	2021-06-17 23:59:00+00	2021-07-26 23:59:00+00	23	\N	interview	f	\N	\N	\N	initial	\N
976	2021-06-22 14:41:23.614155	2021-06-29 13:01:39.053409	\N	\N	360	693	1	mentor	2084	2021-06-17 00:00:00+00	2021-07-19 23:59:00+00	23	\N	jstask	t	\N	\N	\N	initial	\N
977	2021-06-22 14:42:01.434232	2021-06-27 14:55:32.785863	\N	\N	360	692	1	mentor	2084	2021-06-17 00:00:00+00	2021-07-07 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
979	2021-06-23 09:54:07.833539	2021-07-26 21:01:38.322408	\N	\N	715	697	1	taskOwner	2084	2021-06-30 00:00:00+00	2021-07-19 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
981	2021-06-23 09:57:51.078547	2021-07-17 12:45:15.908329	\N	\N	355	696	1	mentor	2084	2021-07-08 00:00:00+00	2021-07-15 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
431	2022-03-27 11:50:14.908491	2022-03-27 11:50:14.908491	\N	\N	100	498	1	mentor	\N	2022-03-27 11:50:00+00	2022-03-31 11:50:00+00	23	\N	\N	f	\N	\N	\N	initial	\N
410	2020-03-16 12:51:21.596135	2020-03-31 11:05:14.454307	\N	\N	100	485	0.01	crossCheck	3961	2020-03-10 16:00:00+00	2020-03-30 20:59:00+00	13	4	htmltask	f	\N	\N	\N	initial	\N
353	2019-12-03 16:51:35.631349	2019-12-03 16:51:35.631349	\N	\N	100	450	1	crossCheck	\N	2019-09-30 21:00:00+00	2019-12-01 20:59:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
424	2020-03-31 10:21:55.660987	2020-03-31 10:21:55.660987	\N	\N	75	493	0.3	crossCheck	1090	2020-03-24 20:59:00+00	2020-04-07 20:59:00+00	13	4	jstask	f	\N	\N	\N	initial	\N
356	2019-12-16 09:41:27.698435	2019-12-24 10:13:38.728977	\N	\N	210	452	0.3	crossCheck	606	2019-12-03 07:39:00+00	2019-12-22 21:00:00+00	11	\N	\N	f	\N	\N	\N	initial	\N
425	2020-03-31 10:25:14.33142	2020-03-31 10:25:14.33142	\N	\N	100	494	0.1	crossCheck	1090	2020-03-26 20:59:00+00	2020-04-07 20:59:00+00	13	4	jstask	f	\N	\N	\N	initial	\N
386	2020-02-21 10:26:08.19839	2020-09-24 18:52:15.030419	\N	\N	100	476	1	crossCheck	677	2020-02-11 16:00:00+00	2020-03-11 20:59:00+00	13	1	htmltask	f	\N	\N	\N	initial	\N
735	2020-09-28 15:55:30.264	2020-12-14 11:25:14.054069	\N	\N	60	573	1	crossCheck	2084	2021-04-19 23:59:00+00	2021-04-26 23:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
737	2020-09-28 16:02:42.88	2020-12-14 11:25:04.586605	\N	\N	170	494	0.8	crossCheck	\N	2021-04-26 00:59:00+00	2021-05-10 23:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
738	2020-10-15 15:45:25.182	2020-12-19 07:07:37.406537	\N	\N	50	572	1	crossCheck	\N	2021-04-12 14:00:00+00	2021-04-21 20:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
739	2020-09-19 08:04:36.752	2020-12-19 07:07:06.937443	\N	\N	100	570	0.5	crossCheck	2084	2021-03-08 19:59:00+00	2021-03-17 20:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
741	2020-09-28 15:44:17.135	2020-12-19 07:07:46.233906	\N	\N	100	576	1	crossCheck	2084	2021-03-22 20:59:00+00	2021-04-19 18:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
742	2020-09-21 11:23:02.753	2020-12-19 07:08:07.900162	\N	\N	40	571	1	crossCheck	2084	2021-03-15 10:22:00+00	2021-04-08 21:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
746	2020-11-20 07:27:41.543	2020-12-14 11:24:32.174007	\N	\N	170	585	0.8	crossCheck	\N	2021-05-10 06:27:00+00	2021-05-31 23:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
753	2020-12-11 12:23:16.641	2020-12-14 11:24:19.601754	\N	\N	240	590	0.8	crossCheck	\N	2021-06-01 12:22:00+00	2021-06-17 00:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
763	2020-12-19 13:03:24.071742	2020-12-20 17:50:47.299196	\N	\N	100	593	0.2	crossCheck	\N	2021-02-28 12:00:00+00	2021-03-14 20:59:00+00	23	4	cv:html	t	\N	\N	\N	initial	\N
765	2020-12-19 13:07:08.321506	2020-12-20 17:50:54.307731	\N	\N	50	594	0.5	crossCheck	\N	2021-02-28 12:06:00+00	2021-03-14 20:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
841	2021-03-07 16:23:23.776238	2021-03-07 16:23:23.776238	\N	\N	50	594	0.5	crossCheck	2084	2021-02-28 16:22:00+00	2021-03-15 23:59:00+00	23	4	htmltask	f	\N	\N	\N	initial	\N
853	2021-03-29 09:21:34.603711	2021-04-06 07:55:48.280397	\N	\N	45	630	1	crossCheck	2084	2021-03-23 01:59:00+00	2021-04-06 23:59:00+00	23	4	htmltask	f	\N	\N	\N	initial	\N
854	2021-03-29 20:04:59.336453	2021-05-20 12:08:18.903322	\N	\N	80	631	1	crossCheck	2084	2021-03-23 19:00:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
846	2021-03-16 04:33:39.267072	2023-01-31 20:08:42.176458	\N	\N	100	473	0.05	mentor	2084	2021-02-28 23:59:00+00	2021-03-19 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
766	2020-12-26 18:38:03.97028	2023-01-31 20:09:55.304166	\N	\N	100	595	0.1	auto-test	2084	2020-12-25 21:59:00+00	2021-03-10 23:59:00+00	23	\N	selfeducation	f	\N	\N	\N	initial	\N
855	2021-03-29 20:05:01.298383	2021-05-20 12:08:24.067047	\N	\N	80	632	1	crossCheck	2084	2021-03-24 00:00:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
856	2021-03-29 20:05:04.039062	2021-05-20 12:08:28.287282	\N	\N	80	633	1	crossCheck	2084	2021-03-23 19:00:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
857	2021-03-29 20:05:05.992341	2021-05-20 12:08:32.894051	\N	\N	80	634	1	crossCheck	2084	2021-03-24 00:59:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
858	2021-03-29 20:05:08.056901	2021-05-20 12:08:38.903202	\N	\N	80	635	1	crossCheck	2084	2021-03-23 19:00:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
859	2021-03-29 20:05:09.938253	2021-05-20 12:08:43.683559	\N	\N	80	636	1	crossCheck	2084	2021-03-23 19:00:00+00	2021-04-06 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
872	2021-04-12 08:19:58.924614	2021-04-19 18:00:57.980059	\N	\N	100	642	1	crossCheck	2084	2021-04-09 15:00:00+00	2021-04-19 23:59:00+00	23	4	htmltask	f	\N	\N	\N	initial	\N
882	2021-04-18 16:15:04.361321	2021-05-20 12:08:50.387079	\N	\N	40	645	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
883	2021-04-18 16:15:41.93413	2021-05-20 12:08:55.719784	\N	\N	40	646	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
884	2021-04-18 16:16:24.075893	2021-05-20 12:09:00.206885	\N	\N	40	647	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
885	2021-04-18 16:17:18.716694	2021-05-20 12:09:04.763147	\N	\N	40	648	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
886	2021-04-18 16:18:01.426812	2021-05-20 12:09:08.62373	\N	\N	40	649	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
887	2021-04-18 16:18:36.220548	2021-05-20 12:09:12.541483	\N	\N	40	650	1	crossCheck	2084	2021-04-18 19:15:00+00	2021-04-20 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
890	2021-04-20 07:25:12.840047	2021-04-20 07:25:12.840047	\N	\N	60	652	1	crossCheck	2084	2021-04-20 10:23:00+00	2021-04-26 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
907	2021-05-04 12:48:38.401297	2021-05-20 12:09:16.982884	\N	\N	80	664	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
908	2021-05-04 12:48:40.48278	2021-05-20 12:09:21.390411	\N	\N	80	665	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
909	2021-05-04 12:48:42.458949	2021-05-20 12:09:25.327968	\N	\N	80	666	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
910	2021-05-04 12:48:44.805426	2021-05-20 12:09:29.619037	\N	\N	80	667	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
911	2021-05-04 12:48:47.087144	2021-05-20 12:09:35.059152	\N	\N	80	668	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
912	2021-05-04 12:48:50.871115	2021-05-20 12:09:40.298413	\N	\N	80	669	1	crossCheck	2084	2021-04-20 20:20:00+00	2021-05-09 23:59:00+00	23	4	htmltask	t	\N	\N	\N	initial	\N
927	2021-05-24 07:28:24.474899	2021-06-01 17:05:25.323429	\N	\N	110	396	1	crossCheck	2084	2021-05-11 00:00:00+00	2021-06-01 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
967	2021-06-11 08:06:12.698836	2021-06-13 13:51:19.609064	\N	\N	190	688	1	crossCheck	2084	2021-06-01 23:59:00+00	2021-06-16 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
972	2021-06-20 16:42:18.069437	2021-06-27 14:54:54.598599	\N	\N	275	690	1	crossCheck	2084	2021-06-16 23:59:00+00	2021-07-07 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
973	2021-06-20 16:44:52.184361	2021-06-28 23:15:32.104315	\N	\N	275	691	1	crossCheck	2084	2021-06-16 23:59:00+00	2021-07-19 23:59:00+00	23	4	jstask	t	\N	\N	\N	initial	\N
978	2021-06-22 14:47:29.005674	2021-07-28 09:44:54.70492	\N	\N	480	695	1	crossCheck	2084	2021-06-30 00:00:00+00	2021-07-19 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
980	2021-06-23 09:56:42.176771	2021-07-09 06:19:59.834533	\N	\N	205	698	1	crossCheck	2084	2021-07-08 00:00:00+00	2021-07-15 23:59:00+00	23	4	jstask	f	\N	\N	\N	initial	\N
725	2020-02-19 15:18:06.945	2023-01-31 20:06:50.347384	\N	\N	100	473	0.05	mentor	2084	2021-02-28 23:59:00+00	2021-03-17 23:59:00+00	23	\N	jstask	f	\N	\N	\N	initial	\N
821	2021-02-28 09:07:38.664142	2023-01-31 20:16:09.773572	\N	\N	100	593	0.2	crossCheck	2084	2021-02-28 10:00:00+00	2021-03-09 23:59:00+00	23	4	htmltask	f	2023-01-18 23:59:00+00	\N	{}	initial	\N
\.


--
-- Data for Name: course_user; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_user (id, "createdDate", "updatedDate", "courseId", "userId", "isManager", "isJuryActivist", "isSupervisor", "isDementor") FROM stdin;
121	2023-02-02 14:54:28.484043	2023-02-02 14:54:28.484043	23	2098	f	f	f	t
122	2023-02-02 14:54:28.484043	2023-02-02 14:54:28.484043	23	2103	f	f	f	t
123	2023-02-02 14:54:28.484043	2023-02-02 14:54:28.484043	23	5481	f	f	f	t
125	2023-02-03 07:46:43.309521	2023-02-03 08:05:32.461954	13	2098	f	f	f	t
124	2023-02-03 07:46:36.33884	2023-02-03 08:36:06.162812	13	11569	f	f	f	t
\.


--
-- Data for Name: cv; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.cv (id, "githubId", name, "selfIntroLink", "startFrom", "fullTime", expires, "militaryService", "englishLevel", "avatarLink", "desiredPosition", notes, phone, email, skype, telegram, linkedin, location, "githubUsername", website) FROM stdin;
\.


--
-- Data for Name: discipline; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.discipline (id, created_date, updated_date, deleted_date, name) FROM stdin;
1	2023-02-02 14:54:47.349888	2023-02-02 14:54:47.349888	\N	JavaScript
2	2023-02-02 14:54:58.640241	2023-02-02 14:54:58.640241	\N	React
3	2023-02-02 14:55:05.070751	2023-02-02 14:55:05.070751	\N	Angular
4	2023-02-02 14:55:14.334551	2023-02-02 14:55:14.334551	\N	NodeJs
\.


--
-- Data for Name: discord_server; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.discord_server (id, "createdDate", "updatedDate", name, "gratitudeUrl", "mentorsChatUrl") FROM stdin;
2	2021-07-28 20:43:54.177877	2021-07-28 20:43:54.177877	CoreJS	https://example.com	https://t.me
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.event (id, "createdDate", "updatedDate", name, "descriptionUrl", description, type, "disciplineId") FROM stdin;
1	2019-09-12 09:03:02.219291	2019-09-12 09:03:02.219291	Browsers and IDEs + FAQ	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/html-css-basics.md	\N	lecture	\N
5	2019-09-12 09:05:27.226044	2019-09-12 09:05:27.226044	Git Basics	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/git.md	\N	lecture	\N
6	2019-09-12 09:08:12.602314	2019-09-12 09:08:12.602314	Photoshop and Figma for Web Developers	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/photoshop-basics.md	\N	lecture	\N
3	2019-09-12 09:04:42.695298	2019-09-12 09:09:17.59549	RSSchool для гуманитария. Выпуск №1	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rsschool_for_humanities.md	\N	lecture	\N
7	2019-09-12 09:09:38.948815	2019-09-12 09:09:38.948815	RSSchool для гуманитария. Выпуск №2	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rsschool_for_humanities.md	\N	lecture	\N
8	2019-09-12 09:23:12.401849	2019-09-12 09:23:12.401849	Разбор теста и таска по Git. FAQ 	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-cv.md	\N	lecture	\N
9	2019-09-19 07:59:24.096881	2019-09-19 07:59:24.096881	HTML&CSS. Responsive	\N	\N	lecture	\N
10	2019-09-19 08:05:36.969405	2019-09-19 08:05:36.969405	Выдача алгоритмических заданий Stage#1	\N	\N	lecture	\N
11	2019-09-19 08:14:45.141279	2019-09-19 08:14:45.141279	HTML&CSS. Best Practices.	\N	\N	lecture	\N
2	2019-09-12 09:03:32.223067	2019-09-19 08:18:20.690872	HTML&CSS. Basics + FAQ	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/html-css-basics.md	\N	lecture	\N
12	2019-09-19 08:23:21.884826	2019-09-19 08:23:21.884826	Preprocessors. Sass	\N	\N	lecture	\N
13	2019-09-19 08:26:27.077797	2019-09-19 08:26:27.077797	Разбор теста по HTML&CSS	\N	\N	lecture	\N
14	2019-09-19 08:31:20.979391	2019-09-19 08:31:20.979391	Advanced HTML&CSS. BEM	\N	\N	lecture	\N
16	2019-09-19 09:02:38.77527	2019-09-19 09:02:38.77527	JS Intro	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-intro.md	\N	lecture	\N
17	2019-09-19 09:07:16.559406	2019-09-19 09:07:16.559406	JS Data Types	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-data-types.md	\N	lecture	\N
18	2019-09-19 09:11:18.941673	2019-09-19 09:11:18.941673	JS Arrays	\N	\N	lecture	\N
20	2019-09-19 09:12:16.974124	2019-09-19 09:12:16.974124	JavaScript DOM	\N	\N	lecture	\N
21	2019-09-19 09:19:37.484274	2019-09-19 09:19:37.484274	Разбор алгоритмических заданий Stage#1	\N	\N	lecture	\N
22	2019-09-19 09:26:59.759546	2019-09-19 09:26:59.759546	JS Events	\N	\N	lecture	\N
23	2019-09-19 09:30:16.440205	2019-09-19 09:30:16.440205	Результаты первого этапа. Ответы на вопросы. Планы на второй этап	\N	\N	lecture	\N
24	2019-09-20 08:11:06.308753	2019-09-20 08:11:06.308753	Course overview	https://docs.rs.school/#/	\N	lecture	\N
15	2019-09-19 09:00:03.042423	2019-09-20 08:25:06.472219	Advanced HTML&CSS. Animations	\N	\N	lecture	\N
19	2019-09-19 09:11:47.471902	2019-09-20 13:18:49.343646	Data Structures in JavaScript	\N	\N	lecture	\N
27	2019-10-14 13:35:10.786219	2019-10-14 13:38:25.576464	NPM & Node.js Basics	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rs-online-development.md		lecture	\N
28	2019-10-14 13:48:15.522269	2019-10-14 13:48:59.712154	JS Scope	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-scope.md	\N	lecture	\N
30	2019-10-14 13:59:15.547123	2019-10-14 13:59:15.547123	CodeJam Canvas. Q&A	\N	\N	lecture	\N
31	2019-10-14 14:09:36.422681	2019-10-14 14:09:36.422681	Chrome DevTools	https://developers.google.com/web/tools/chrome-devtools/javascript/	\N	lecture	\N
32	2019-10-14 14:13:18.279154	2019-10-14 14:13:18.279154	JS Functions. Part 2	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-functions-part-two.md	\N	lecture	\N
29	2019-10-14 13:48:50.052181	2019-10-14 14:13:26.039738	JS Functions. Part 1	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-functions.md	\N	lecture	\N
36	2019-10-15 11:46:57.892947	2019-10-15 11:46:57.892947	Inheritance in JavaScript. ES6 Classes.	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/inheritance-in-js-and-es6-classes.md	\N	lecture	\N
42	2019-10-15 12:04:38.891898	2019-10-15 12:04:38.891898	Webpack. Assets management. Project Structure.	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/webpack.md	\N	lecture	\N
43	2019-10-15 12:05:48.213974	2019-10-15 12:05:48.213974	YouTube Bootstrap	\N	\N	lecture	\N
41	2019-10-15 12:03:06.56827	2019-10-15 13:02:52.918044	JS Test Retro	\N	\N	lecture	\N
39	2019-10-15 11:56:46.945285	2019-10-15 13:03:02.676299	 Code Jam "DRAW API" Retro. FAQ Promises & http	\N	\N	lecture	\N
38	2019-10-15 11:53:52.332397	2019-11-13 09:57:07.382732	Event Loop. Animation	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/event-loop-and-animations.md	\N	lecture_self_study	\N
44	2019-10-15 13:18:35.530519	2019-10-15 13:18:35.530519	Interview Q&A / Stage#2 Lectures Test. Retro	\N	\N	lecture	\N
45	2019-10-15 13:20:19.465082	2019-10-15 13:39:15.779199	TDD, Unit Tests, Quality control. Part 1	\N	\N	lecture	\N
47	2019-10-15 13:39:23.817166	2019-10-15 13:39:23.817166	TDD, Unit Tests, Quality control. Part 2	\N	\N	lecture	\N
48	2019-10-15 13:42:59.192228	2019-10-15 13:42:59.192228	Task "YouTube" Retro	\N	\N	lecture	\N
49	2019-10-15 13:47:21.601106	2019-10-15 13:47:21.601106	Piskel bootstrap	\N	\N	lecture	\N
50	2019-10-16 08:52:16.041267	2019-10-16 08:52:16.041267	Code refactoring in the context of 'Piskel clone' task	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/refactoring.md	\N	lecture	\N
51	2019-10-16 09:34:30.248464	2019-10-16 09:34:30.248464	Unit tests	\N	\N	lecture	\N
35	2019-10-15 11:41:04.360314	2019-11-04 08:03:24.3041	JS Callbacks & Promises & async/await	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/promises-game-dev.md	\N	lecture_self_study	\N
33	2019-10-15 11:32:41.327741	2019-11-04 08:25:48.618847	Code Jam "Virtual Keyboard" Retro. DOM FAQ	\N	\N	lecture	\N
34	2019-10-15 11:38:40.662901	2019-11-04 08:40:42.114517	ES6 Variables features. ESLint. Airbnb JavaScript Style Guide	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/es6.md	\N	lecture_online	\N
40	2019-10-15 11:59:11.696371	2019-11-13 10:39:39.24538	Modules in JS	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-modules.md	\N	lecture_self_study	\N
46	2019-10-15 13:36:34.293902	2019-11-04 08:47:16.223906	Presentation. Grand Final	\N		lecture_mixed	\N
53	2019-11-13 10:43:47.792601	2019-11-13 10:43:47.792601	RS School Meetup	https://community-z.com/events/rss2019q3-meetup1	\N	meetup	\N
52	2019-10-17 08:38:23.683982	2019-11-13 14:29:26.085033	Test: DOM, DOM Events	\N	This test is without score and deadline.	warmup	\N
37	2019-10-15 11:51:25.290004	2019-11-20 10:17:12.401905	Network communication	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/http.md	\N	lecture	\N
54	2019-11-13 14:27:35.085726	2019-11-13 14:32:36.477144	Test: http, https2, ajax			warmup	\N
55	2019-11-13 14:59:57.236829	2019-11-13 14:59:57.236829	Test: JS basics	\N	\N	warmup	\N
56	2019-11-19 13:01:09.061065	2019-11-19 13:01:09.061065	CodeJam "Animation Player". Intro	\N	\N	lecture_online	\N
57	2019-11-20 10:45:11.804413	2019-11-20 10:48:32.730569	Task "Fancy Weather". Retro	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md	\N	lecture_online	\N
59	2019-11-20 11:05:11.612965	2019-11-20 11:05:11.612965	Feedback on Mentors	https://app.rs.school/gratitude?course=rs-2019-q3	\N	info	\N
63	2020-02-17 08:36:47.634937	2020-02-17 08:36:47.634937	Angular course intro. TypeScript & Angular basics	\N	\N	lecture_online	\N
64	2020-02-17 08:37:21.305157	2020-02-17 08:37:21.305157	Angular. Components	\N	\N	lecture_online	\N
65	2020-02-17 08:37:43.212378	2020-02-17 08:37:43.212378	Angular. Directives & Pipes	\N	\N	lecture_online	\N
66	2020-02-17 08:38:23.367356	2020-02-17 08:38:23.367356	Angular. Task #1 review	\N	\N	lecture_online	\N
4	2019-09-12 09:04:58.808458	2020-03-23 10:47:18.744158	HTML&CSS Basics	\N	\N	lecture	\N
67	2020-02-17 08:39:33.33246	2020-02-17 08:39:33.33246	Angular. Modules & Services	\N	\N	lecture_online	\N
68	2020-02-17 08:39:41.807016	2020-02-17 08:39:41.807016	Angular. Routing	\N	\N	lecture_online	\N
69	2020-02-17 08:39:56.469453	2020-02-17 08:39:56.469453	Angular. Task #2 review	\N	\N	lecture_online	\N
70	2020-02-17 08:40:12.090089	2020-02-17 08:40:12.090089	Angular. RxJS & Observables	\N	\N	lecture_online	\N
72	2020-02-17 08:40:24.125896	2020-02-17 08:40:24.125896	Angular. HTTP	\N	\N	lecture_online	\N
73	2020-02-17 08:40:37.099773	2020-02-17 08:40:37.099773	Angular. Task #3 review	\N	\N	lecture_online	\N
74	2020-02-17 08:40:51.31546	2020-02-17 08:40:51.31546	Angular. Redux & NgRx	\N	\N	lecture_online	\N
75	2020-02-17 08:42:30.658576	2020-02-17 08:42:30.658576	Angular. CodeJam "Culture Portal". Intro	\N	\N	lecture_online	\N
76	2020-02-17 08:42:41.662791	2020-02-17 08:42:41.662791	Angular. Unit testing	\N	\N	lecture_online	\N
78	2020-02-17 12:36:52.791254	2020-02-17 12:36:52.791254	Git for Android developers	https://www.youtube.com/watch?v=J1tDWhbf-Gs	\N	lecture_self_study	\N
79	2020-02-17 12:39:28.042076	2020-02-26 11:02:46.29792	Java for Android developers	https://www.youtube.com/watch?v=XsbCDeCA9p0	Java (syntax, base data types, Object class and methods, GC)	lecture_online	\N
124	2020-02-27 20:45:01.821927	2020-02-27 20:45:01.821927	Angular. Task #4 review	\N	\N	lecture_online	\N
80	2020-02-17 12:40:54.525405	2020-03-11 11:45:16.464869	Kotlin for Android developers	https://www.youtube.com/watch?v=mbA8EQZSjTk	Kotlin (syntax, base data types, differencies form Java)	lecture_online	\N
81	2020-02-17 12:42:37.911916	2020-03-11 11:50:46.082372	Collections for Android developers	https://www.youtube.com/watch?v=6HHLqP0_spk	Collections(Array, Lists, Queue, Set, HashMap, TreeMap, ArrayMap, SparceArray, boxing, mutable and immutable)	lecture_online	\N
82	2020-02-17 12:44:59.94523	2020-03-11 11:55:59.980381	Advanced Java and Kotlin for Android developers	https://www.youtube.com/watch?v=mh6LV9aBypo	Generics. Static and Dynamic binding. Generics in Kotlin. (SOLID, Clean Code).	lecture_online	\N
83	2020-02-17 12:49:12.081105	2020-03-11 12:03:58.296963	Base Android Components Overview	https://www.youtube.com/watch?v=KINkdbIfwdU	App Manifest (Data Backup, Permissions, App Components overview)	lecture_online	\N
125	2020-03-19 09:18:54.244884	2020-03-19 09:18:54.244884	[iOS] Quiz	\N	\N	info	\N
126	2020-06-08 16:27:06.413013	2020-06-08 16:29:35.410611	[iOS] Multithreading basics, NSOperation/GCD overview full functionality (part 1)	\N	Multithreading	lecture_mixed	\N
127	2020-06-08 16:30:18.594107	2020-06-08 16:30:18.594107	[iOS] Multithreading basics, NSOperation/GCD overview full functionality (part 2)	\N	Multithreading	lecture_mixed	\N
128	2020-06-08 16:35:16.780715	2020-06-08 16:35:16.780715	[iOS] App Sandbox and Bundle, NSUserDefaults, read/writing to file	\N	App Sandbox and Bundle, NSUserDefaults, read/writing to file	lecture_mixed	\N
129	2020-06-08 16:35:53.342328	2020-06-08 16:35:53.342328	[iOS] Networking (CRUD, JSON, XML), NSURLSession	\N	Networking (CRUD, JSON, XML), NSURLSession	lecture_mixed	\N
130	2020-06-08 16:36:22.196423	2020-06-08 16:36:22.196423	[iOS] Animations (UIView animation, CALayer animation ...)	\N	Animations (UIView animation, CALayer animation ...)	lecture_mixed	\N
131	2020-06-08 16:36:47.014748	2020-06-08 16:36:47.014748	[iOS] Unit Tests (OCMock, XCTest)	\N	Unit Tests (OCMock, XCTest)	lecture_mixed	\N
132	2020-06-08 16:37:12.751094	2020-06-08 16:37:12.751094	[iOS] SQLLite	\N	SQLLite	lecture_mixed	\N
133	2020-06-08 16:37:35.982116	2020-06-08 16:37:35.982116	[iOS] Core Data	\N	Core Data	lecture_mixed	\N
134	2020-06-08 16:38:01.843965	2020-06-08 16:38:01.843965	[iOS] CocoaPods	\N	CocoaPods	lecture_mixed	\N
136	2020-06-08 16:40:17.139789	2020-07-24 07:20:19.886061	[iOS, Android] Patterns part2, (Adaptor, Bridge, Decorator, Facade, Proxy, MVP)	https://youtu.be/Dh1ktKpq9Fc	Adaptor, Bridge, Decorator, Facade, Proxy, MVP	lecture_mixed	\N
137	2020-06-08 16:41:04.611035	2021-04-17 22:16:20.70863	[iOS, Android] Patterns part1, (Factory Method, Abstact Factory,  Bulder, Singleton,  MVC)	https://www.youtube.com/watch?v=oMjzSNIbkg8	Factory Method, Abstact Factory,  Bulder, Singleton,  MVC	lecture_mixed	\N
138	2020-06-08 16:41:38.872838	2020-08-04 19:40:39.79378	[iOS, Android] Patterns part3, (Observer, Strategy, Command, State, MVVM)	https://youtu.be/dbdqeZ17E-4	Observer, Strategy, Command, State, MVVM	lecture_mixed	\N
139	2020-06-08 16:42:23.750115	2020-07-30 14:20:12.261478	[iOS, Android] Patterns part4, Inversion of Control (dependency injection, Service Locator), GRASP	https://www.youtube.com/watch?v=lKX_jw052Yk&feature=youtu.be	dependency injection, Service Locator, GRASP	lecture_mixed	\N
140	2020-06-08 18:45:58.708297	2020-06-09 10:20:02.88197	[Android] Storage Part 1 (FileStorage, FileProvider, External and Internal Storage, SharedPreferencies, PreferenceFragment)	https://www.youtube.com/watch?v=y9pRcpRb9aE	\N	lecture_self_study	\N
141	2020-06-08 18:46:10.614889	2020-06-08 18:46:10.614889	[iOS] Swift, part 1 (Initialization, property, types, class)	\N	Swift, part 1	lecture_mixed	\N
142	2020-06-08 18:46:25.265151	2020-06-11 11:57:49.773017	[Android] Storage Part 2(SQLite, pain of Cursor)	https://www.youtube.com/watch?v=latY2xfh2OY	\N	lecture_online	\N
143	2020-06-08 18:46:50.319888	2020-06-08 18:46:50.319888	[iOS] Swift, part 2 (Enums, Protocols, Extensions)	\N	Swift, part 2	lecture_mixed	\N
144	2020-06-08 18:47:48.716992	2020-06-08 18:47:48.716992	[iOS] Swift, part 3 (Collections, Closures)	\N	Swift, part 3	lecture_mixed	\N
145	2020-06-08 18:48:42.307624	2020-06-08 18:48:42.307624	[iOS] Swift,  part 4 (Generics)	\N	Swift,  part 4	lecture_mixed	\N
146	2020-06-08 18:48:59.453278	2020-06-16 11:02:49.978649	[Android] Storage Part 3(ORM: ORMLite, GreenDao)	https://www.youtube.com/watch?v=fcJvn5MpBoY&feature=youtu.be	\N	lecture_online	\N
147	2020-06-08 18:49:18.177322	2020-06-08 18:49:18.177322	[iOS] Swift, part 5 (Error handling, ARC, Access levels)	\N	Swift, part 5	lecture_mixed	\N
148	2020-06-08 18:50:11.211062	2020-06-08 18:50:11.211062	[iOS] Swift, part 6 (UnitTests, UITests)	\N	Swift, part 6	lecture_mixed	\N
149	2020-06-08 18:51:07.115575	2020-07-07 14:31:49.785689	[Android] Demo: Creating settings screen with PreferenceFragment	https://www.youtube.com/watch?v=lcPO4sPUmQ0&feature=youtu.be	\N	lecture_online	\N
150	2020-06-08 18:53:19.739061	2020-06-23 14:43:24.657466	[Android] Storage Part 4 (Realm, NoSQL, Firebase database, Firestore)	https://www.youtube.com/watch?v=RiQ0Fq9drpQ&feature=youtu.be	\N	lecture_online	\N
151	2020-06-08 18:54:32.119471	2020-06-25 14:43:07.646511	[Android] Storage Part 5 (Room and LiveData overview)	https://www.youtube.com/watch?v=rSt4vlCr06k&feature=youtu.be	\N	lecture_online	\N
152	2020-06-08 18:56:38.906763	2020-06-30 14:01:23.917011	[Android] Demo: Firestore	https://www.youtube.com/watch?v=Zu_GLyYD_Zk&feature=youtu.be	\N	lecture_online	\N
153	2020-06-08 18:58:27.500847	2020-07-02 09:17:56.488663	[Android] Networking (CRUD, JSON, XML), HttpUrlConnection, OkHttp	https://www.youtube.com/watch?v=8MvM47n3inw&feature=youtu.be	\N	lecture_online	\N
154	2020-06-08 18:59:56.539253	2020-07-07 14:27:16.387969	[Android] REST, Retrofit, Gson, Moshi, GraphQL overview	https://www.youtube.com/watch?v=7qI-W6qI8T4&feature=youtu.be	\N	lecture_online	\N
155	2020-06-08 19:01:19.319504	2020-07-09 10:55:59.44469	[Android] Quality Assurance (Detekt, ktlint, AndroidLint, SonarQube, CI basics)	https://youtu.be/csWGsOK2xYk	\N	lecture_online	\N
156	2020-06-08 19:04:43.156329	2020-07-14 14:58:47.045131	[Android] Demo: Working on the real project	https://www.youtube.com/watch?v=TTm_z64fWlk	\N	lecture_online	\N
157	2020-06-08 19:12:19.91916	2020-07-16 17:00:25.594532	[Android] Build Configuration (Gradle, groovy vs kotlin, settings, BuildType, BuildFlavor, Plugins, buildSrc)	https://youtu.be/B4qoxeGSPOs	\N	lecture_online	\N
158	2020-06-08 19:19:32.3009	2020-08-04 20:20:43.827678	[Android] DI (Dagger2, Koin)	https://youtu.be/aMwpHwLrxpE	\N	lecture_online	\N
159	2020-06-08 19:20:29.24446	2020-08-23 13:33:39.790374	[Android] Clean Architecture, ViewModel and LiveData(MVVM by Google)	https://www.youtube.com/watch?v=v6xPnjZAL2U	\N	lecture_online	\N
160	2020-06-08 19:21:44.853351	2020-08-23 13:34:39.408732	[Android] ReactiveX, RxJava, RxKotlin, Reaktive	https://www.youtube.com/watch?v=Q3e5R6KN1EM	\N	lecture_online	\N
161	2020-06-08 19:23:04.841744	2020-08-23 13:35:11.981109	[Android] Kotlin Coroutines and Flow	https://www.youtube.com/watch?v=SLW2sm4YA_4	\N	lecture_online	\N
162	2020-06-08 19:25:45.83293	2020-09-22 08:18:37.263457	[Android] Android Architecture Components(Lifecycle, Navigation, WorkManager, PagingLibrary, Preference)	https://www.youtube.com/watch?v=kShzWyBMjf4&feature=youtu.be&ab_channel=RollingScopesSchool	\N	lecture_online	\N
163	2020-06-08 19:26:46.002742	2020-09-22 08:51:58.883544	[Android] Tests (Junit, Mockito, Mockk, Spek2, Espresso)	https://youtu.be/4LIgv91S8G8	\N	lecture_online	\N
164	2020-07-21 16:55:08.461138	2020-07-21 16:55:55.005421	[iOS, Android] Working on the real project	\N	CD/CI, Scrum, TDD....	lecture_mixed	\N
165	2020-07-27 10:31:38.167381	2021-07-10 22:05:56.133842	Angular. HTTP	\N	\N	workshop	\N
166	2020-08-05 09:25:59.634529	2020-08-05 09:25:59.634529	Angular. Task #5 review	\N	\N	lecture_online	\N
167	2021-01-18 20:30:53.435008	2021-01-18 20:30:53.435008	Angular. Final task "RS Lang". Intro	\N	\N	lecture_online	\N
168	2021-04-17 21:16:46.854068	2021-07-27 21:10:20.762053	[iOS] Swift: Fundamentals, part1 (Classes, Structs, Init, Deinit)	https://youtu.be/bbDZ3vBjq-s	\N	lecture_mixed	\N
169	2021-04-17 21:18:00.021065	2021-07-27 21:10:33.318624	[iOS] Swift: Fundamentals, part2 (Protocols, Extensions, Access control)	https://youtu.be/Zem7azTDTfA	\N	lecture_mixed	\N
170	2021-04-17 21:19:09.995838	2021-07-27 21:10:48.661699	[iOS] Swift: Enum, Optionals, Properties	https://youtu.be/ecBhz5YITG4	\N	lecture_mixed	\N
171	2021-04-17 21:20:01.309681	2021-07-27 21:10:59.643765	[iOS] Swift: Collections	https://youtu.be/N0HDxnj8zuo	\N	lecture_mixed	\N
172	2021-04-17 21:21:04.644787	2021-07-27 21:11:52.391729	[iOS] Swift: Type casting, Nesting types, Opaque type	https://youtu.be/skD3iO-l6Lw	\N	lecture_mixed	\N
173	2021-04-17 21:21:32.675193	2021-07-27 21:11:34.326737	[iOS] Swift: Closures	https://youtu.be/DqqrkbU6Csc	\N	lecture_mixed	\N
174	2021-04-17 21:21:57.787204	2021-07-27 21:12:05.272894	[iOS] Swift: Generics	https://youtu.be/OkvvfNuhRrM	\N	lecture_mixed	\N
175	2021-04-17 21:22:21.683772	2021-07-27 21:12:16.2674	[iOS] Swift: ARC, Error handling	https://youtu.be/I520sje9g7M	\N	lecture_mixed	\N
176	2021-04-17 21:32:33.51823	2021-07-27 21:18:02.98113	[iOS] Stage 1	https://youtu.be/NjE4LVIcpQI	\N	info	\N
177	2021-04-17 21:32:52.407919	2021-04-17 21:32:52.407919	[iOS] Stage 2	\N	\N	info	\N
178	2021-04-17 21:33:08.809654	2021-04-17 21:33:08.809654	[iOS] Stage 3	\N	\N	info	\N
179	2021-04-17 22:07:11.429289	2021-04-17 22:07:11.429289	[iOS] Unit Tests (ObjC: OCMock, XCTest, Swift: Quick, Nimble)	\N	\N	lecture_mixed	\N
180	2021-04-17 22:11:36.745265	2021-04-17 22:11:36.745265	[iOS] CocoaPods, Swift Package Manager (SPM)	\N	\N	lecture_mixed	\N
181	2021-04-17 22:19:11.535059	2021-04-17 22:19:11.535059	[iOS] Assessment period	\N	\N	info	\N
182	2021-04-18 17:22:05.305628	2021-04-18 17:22:05.305628	[iOS] Final Task - Assessment	\N	\N	info	\N
183	2021-04-18 17:24:53.506302	2021-04-18 17:24:53.506302	[iOS] Result (Summarize)	\N	\N	info	\N
184	2021-05-24 07:20:56.730632	2021-05-24 07:20:56.730632	Software design principles. SOLID	https://www.youtube.com/rollingscopesschool	a.        Single Responsibility Principle \nb.        Open-Closed Principle\nc.        Liskov Substitution Principle \nd.        Interface Segregation Principle \ne.        Dependency Inversion Principle	Online Lecture	\N
185	2021-06-22 11:41:18.759195	2021-06-22 11:41:18.759195	Q&A: Шахматы + English for kids	https://youtube.com	Ответы на вопросы по новому заданию	lecture_online	\N
186	2021-06-22 14:07:40.862461	2021-06-22 14:07:40.862461	Выдача сертификатов stage#2	https://docs.rs.school/#/rs-school-certificate	\N	Info	\N
187	2021-06-25 08:57:13.764023	2021-07-23 10:09:43.479324	Знакомство с RS School и профессией "JS/Front-end разработчик"	https://github.com/rolling-scopes-school/tasks/tree/master/stage0/modules/js-fe-developer	\N	Online Lecture	\N
188	2021-06-25 11:09:37.325536	2021-07-13 17:03:02.123734	Q&A Stage#0	https://docs.google.com/spreadsheets/d/1QXlD5uknJLDjYmPcRhSqaKAw8VACwypvGOuXy-MFaYs/edit#gid=0	\N	Online Lecture	\N
189	2021-06-25 11:17:15.225806	2021-06-25 11:17:15.225806	NodeJS. Live Coding	\N	\N	lecture_online	\N
190	2021-06-29 07:21:48.844085	2021-06-29 07:22:21.456235	Chrome Dev Tools и VS Code	https://github.com/rolling-scopes-school/tasks/tree/roadmap/stage0/modules/basic-tools	\N	Online Lecture	\N
191	2021-06-30 12:27:36.94908	2021-06-30 12:27:36.94908	Stage#0. Неделя #1	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-1	\N	Self-studying	\N
192	2021-06-30 12:43:17.150567	2021-06-30 12:43:17.150567	Refactoring Lecture	\N	\N	lecture_online	\N
193	2021-07-01 14:03:58.0844	2021-07-01 14:03:58.0844	Stage#0. Неделя #2	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-2	\N	Self-studying	\N
194	2021-07-01 14:04:43.442034	2021-07-01 14:04:43.442034	Stage#0. Неделя #3	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-3	\N	Self-studying	\N
195	2021-07-01 14:05:29.684334	2021-07-01 14:05:29.684334	Stage#0. Неделя #4	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-4	\N	Self-studying	\N
196	2021-07-01 14:06:12.526154	2021-07-01 14:06:12.526154	Stage#0. Неделя #5	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-5	\N	Self-studying	\N
197	2021-07-01 14:08:08.564507	2021-07-01 14:08:08.564507	Stage#0. Неделя #6	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-6	\N	Self-studying	\N
198	2021-07-01 14:08:56.268658	2021-07-01 14:08:56.268658	Stage#0. Неделя #7	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-7	\N	Self-studying	\N
199	2021-07-01 14:10:04.277781	2021-07-01 14:10:04.277781	Stage#0. Неделя #8	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-8	\N	Self-studying	\N
200	2021-07-01 14:11:13.939302	2021-07-01 14:13:55.089393	Stage#0. Неделя #9	https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-9	\N	Self-studying	\N
201	2021-07-05 20:57:07.500082	2021-07-07 15:21:56.6395	Node.js Basic	https://youtube.com	\N	lecture_online	\N
202	2021-07-06 09:38:49.342292	2021-07-08 06:13:01.627643	Cross-Check deadline: English for kids S1E1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md	\N	Cross-Check deadline	\N
204	2021-07-13 02:28:26.44619	2021-07-27 02:50:11.112532	React Stream. Components	https://docs.google.com/document/d/1WLWjBiVMjsVADf5FWFYfPObQOrLD1624h5etyafCfr8/edit?usp=sharing	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1qSfNHkOLqK6XXliXJDbY5QL7c9reWYrsxNaTPZjgQ4o/edit?usp=sharing	lecture_online	\N
205	2021-07-13 02:29:41.009407	2021-07-27 03:37:03.415482	React Stream. Forms	https://docs.google.com/document/d/1C490mF-CzPkr2552nDcj3W3NJmrzXJKFBSs4C_Vg_cM/edit?usp=sharing	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1wvdN5bmMcnXM_sc4l5NmOvrgM428fCf17PcwwH996Dg/edit?usp=sharing	lecture_online	\N
206	2021-07-13 02:30:59.860857	2021-07-13 02:30:59.860857	React Stream. API	\N	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/10WdCIZj6u2dLJm1Nn7UYt5rznLds42mxsjjJLJpYxvk/edit?usp=sharing	lecture_online	\N
207	2021-07-13 02:32:06.692641	2021-07-27 03:48:48.693306	React Stream. Redux	https://docs.google.com/document/d/11SOrFH5RSSmSaJia5XbeD02hJVwY5fsc1PJwEbOXg_A/edit?usp=sharing	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1uxAgIrKso99fhi3svvIeWMTlyrLRByJhOTC0ttAMxeM/edit?usp=sharing	lecture_online	\N
208	2021-07-13 02:33:12.930287	2021-07-27 03:46:43.586183	React Stream. Routing	https://docs.google.com/document/d/1SrT0rl-YG0cMheXgHsI3H2u8hCKCImEYiFvQsnOw9Q8/edit?usp=sharing	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/14czN-v9qQMKfRGfwHHiFki0pA8kgRUKw3dd_7ZW8jyA/edit?usp=sharing	lecture_online	\N
209	2021-07-13 02:34:19.795533	2021-07-13 02:34:19.795533	React Stream. Testing	\N	Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1z5_B3-UA3R4-GtTm2hnqMEPBSDmkcZbd6sVsKLVzI5w/edit?usp=sharing	lecture_online	\N
210	2021-07-13 02:42:32.368104	2021-07-13 02:42:32.368104	React Streaming. SSR	\N	Questions: https://docs.google.com/spreadsheets/d/1z4B3WLStS0UME0ok-Prm2KUPc_fFVS34Q7dJALI3E64/edit?usp=sharing	lecture_online	\N
211	2021-07-13 18:54:42.565201	2021-07-16 13:18:08.778557	Git for beginners	\N	Introduction to Git	Online Lecture	\N
212	2021-07-16 11:12:11.167369	2021-07-16 11:12:44.404702	Cross-Check deadline: English for kids S1E2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md	\N	Cross-Check deadline	\N
213	2021-07-20 13:47:14.868153	2021-07-20 13:49:26.368869	Cross-check deadline: Chess S1E2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md	\N	Cross-Check deadline	\N
135	2022-03-27 12:11:38.539172	2022-03-27 12:11:38.539172	11	https://hello.com	\N	Offline Lecture	\N
203	2022-03-27 12:12:46.314579	2022-03-27 12:12:46.314579	11	https://hello.com	\N	Offline Lecture	\N
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.feedback (id, "createdDate", "updatedDate", "badgeId", "fromUserId", "toUserId", "courseId", comment) FROM stdin;
616	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	3493	677	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
617	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	677	587	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
618	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2444	2595	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
619	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	4428	10130	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
620	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	606	677	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
621	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	2595	10130	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
622	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2693	11563	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
623	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	2480	6776	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
624	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	606	4428	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
625	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	1090	4428	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
626	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	4428	2480	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
627	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	2103	587	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
628	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	1090	2098	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
629	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	677	10130	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
630	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	3961	2098	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
631	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Expert_help	2480	2480	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
632	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	606	2612	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
633	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	2084	587	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
634	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	1328	677	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
635	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2084	4476	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
636	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	2549	2595	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
637	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Hero	587	2089	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
638	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	677	11569	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
639	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	4428	2098	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
640	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	2480	7485	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
641	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	587	2595	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
642	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	1090	10031	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
643	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	6776	677	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
644	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	7485	10031	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
645	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	7485	2444	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
646	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Hero	2595	2084	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
647	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	10130	2693	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
648	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Hero	11569	11569	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
649	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Hero	2103	10130	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
650	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Expert_help	3961	2084	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
651	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	5481	1090	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
652	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	3961	677	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
653	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	5481	2115	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
654	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	2089	2693	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
655	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	2595	1090	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
656	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2612	4428	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
657	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	2595	11569	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
658	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	3961	2693	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
659	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Good_job	11569	677	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
660	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	4749	2693	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
661	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	2115	2115	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
662	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	2444	11563	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
663	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2089	2103	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
664	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	2084	11569	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
665	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	587	606	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
666	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2480	677	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
667	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	587	2032	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
668	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	10031	2084	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
669	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	606	2612	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
670	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	11569	2549	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
671	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	4749	2098	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
672	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2549	11563	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
673	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	1090	2480	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
674	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	7485	677	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
675	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	7485	2277	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
676	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	3961	1090	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
677	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	7485	1090	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
678	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	2480	5481	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
679	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	3961	10130	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
680	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	2595	5481	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
681	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Expert_help	2277	2612	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
682	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	11569	2032	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
683	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	4749	677	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
684	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	RS_activist	1328	2480	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
685	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	4428	2612	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
686	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Hero	4749	4476	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
687	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2480	10130	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
688	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2115	4428	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
689	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Good_job	4749	2103	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
690	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	2089	2693	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
691	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Great_speaker	2693	5481	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
692	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	4749	677	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
693	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2549	606	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
694	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Expert_help	4476	1090	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
695	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2103	11569	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
696	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	5481	1090	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
697	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	4476	2612	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
698	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Good_job	4749	2595	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
699	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	2115	11563	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
700	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	2693	677	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
701	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	11569	2084	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
702	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Jury_Team	2444	1090	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
703	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Good_job	1328	606	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
704	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Top_performer	4749	2549	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
705	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	10031	3961	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
706	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	2693	2098	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
707	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	2084	2549	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
708	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Congratulations	1328	4428	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
709	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	4428	10130	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
710	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	2089	4428	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
711	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Job_Offer	4476	4428	13	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
712	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Helping_hand	587	7485	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
713	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Thank_you	2103	606	11	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
714	2023-08-26 14:16:06.484519	2023-08-26 14:16:06.484519	Outstanding_work	2693	3961	23	Pariatur culpa exercitation occaecat consectetur nulla nulla Lorem pariatur ut esse.
\.


--
-- Data for Name: history; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.history (id, "createdDate", "updatedDate", event, "entityId", operation, update, previous) FROM stdin;
1	2023-01-31 20:05:46.630426	2023-01-31 20:05:46.630426	course_task	821	update	{"studentStartDate":"2021-02-28 10:00+00:00","studentEndDate":"2021-03-09 23:59+00:00","crossCheckEndDate":"2023-01-17 22:05+00:00","taskId":593,"taskOwnerId":2084,"checker":"crossCheck","scoreWeight":0.2,"maxScore":100,"type":"htmltask","pairsCount":4,"submitText":null,"validations":{},"courseId":23,"id":821}	{"id":821,"createdDate":"2021-02-28T09:07:38.664Z","updatedDate":"2021-03-06T09:06:02.437Z","taskId":593,"courseId":23,"studentStartDate":"2021-02-28T10:00:00.000Z","studentEndDate":"2021-03-08T23:59:00.000Z","crossCheckEndDate":null,"mentorStartDate":null,"mentorEndDate":null,"maxScore":100,"scoreWeight":0.2,"checker":"crossCheck","taskOwnerId":2084,"pairsCount":4,"type":"htmltask","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":null}
2	2023-01-31 20:06:50.33724	2023-01-31 20:06:50.33724	course_task	725	update	{"studentStartDate":"2021-02-28 23:59+00:00","studentEndDate":"2021-03-17 23:59+00:00","taskId":473,"taskOwnerId":2084,"checker":"mentor","scoreWeight":0.05,"maxScore":100,"type":"jstask","courseId":23,"id":725}	{"id":725,"createdDate":"2020-02-19T15:18:06.945Z","updatedDate":"2021-03-06T09:28:56.637Z","taskId":473,"courseId":23,"studentStartDate":"2021-02-28T23:59:00.000Z","studentEndDate":"2021-03-15T23:59:00.000Z","crossCheckEndDate":null,"mentorStartDate":null,"mentorEndDate":null,"maxScore":100,"scoreWeight":0.05,"checker":"mentor","taskOwnerId":2084,"pairsCount":null,"type":"jstask","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":null}
3	2023-01-31 20:08:42.169821	2023-01-31 20:08:42.169821	course_task	846	update	{"studentStartDate":"2021-02-28 23:59+00:00","studentEndDate":"2021-03-19 23:59+00:00","taskId":473,"taskOwnerId":2084,"checker":"mentor","scoreWeight":0.05,"maxScore":100,"type":"jstask","courseId":23,"id":846}	{"id":846,"createdDate":"2021-03-16T04:33:39.267Z","updatedDate":"2021-03-22T19:29:25.192Z","taskId":625,"courseId":23,"studentStartDate":"2021-03-16T04:32:00.000Z","studentEndDate":"2021-03-23T01:59:00.000Z","crossCheckEndDate":null,"mentorStartDate":null,"mentorEndDate":null,"maxScore":50,"scoreWeight":1,"checker":"crossCheck","taskOwnerId":2084,"pairsCount":4,"type":"jstask","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":null}
4	2023-01-31 20:09:55.297027	2023-01-31 20:09:55.297027	course_task	766	update	{"studentStartDate":"2020-12-25 21:59+00:00","studentEndDate":"2021-03-10 23:59+00:00","taskId":595,"taskOwnerId":2084,"checker":"auto-test","scoreWeight":0.1,"maxScore":100,"type":"selfeducation","courseId":23,"id":766}	{"id":766,"createdDate":"2020-12-26T18:38:03.970Z","updatedDate":"2021-03-06T09:02:07.383Z","taskId":595,"courseId":23,"studentStartDate":"2020-12-25T21:59:00.000Z","studentEndDate":"2021-03-08T23:59:00.000Z","crossCheckEndDate":null,"mentorStartDate":null,"mentorEndDate":null,"maxScore":100,"scoreWeight":0.1,"checker":"auto-test","taskOwnerId":2084,"pairsCount":null,"type":"selfeducation","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":null}
5	2023-01-31 20:16:09.766741	2023-01-31 20:16:09.766741	course_task	821	update	{"studentStartDate":"2021-02-28T10:00:00Z","studentEndDate":"2021-03-09T23:59:00Z","crossCheckEndDate":"2023-01-18T23:59:00Z","taskId":593,"taskOwnerId":2084,"checker":"crossCheck","scoreWeight":0.2,"maxScore":100,"type":"htmltask","pairsCount":4,"submitText":null,"validations":{},"courseId":23,"id":821}	{"id":821,"createdDate":"2021-02-28T09:07:38.664Z","updatedDate":"2023-01-31T20:05:46.644Z","taskId":593,"courseId":23,"studentStartDate":"2021-02-28T10:00:00.000Z","studentEndDate":"2021-03-09T23:59:00.000Z","crossCheckEndDate":"2023-01-17T22:05:00.000Z","mentorStartDate":null,"mentorEndDate":null,"maxScore":100,"scoreWeight":0.2,"checker":"crossCheck","taskOwnerId":2084,"pairsCount":4,"type":"htmltask","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":{}}
\.


--
-- Data for Name: interview_question; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.interview_question (id, "createdDate", "updatedDate", title, question) FROM stdin;
\.


--
-- Data for Name: interview_question_categories_interview_question_category; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.interview_question_categories_interview_question_category ("interviewQuestionId", "interviewQuestionCategoryId") FROM stdin;
\.


--
-- Data for Name: interview_question_category; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.interview_question_category (id, "createdDate", "updatedDate", name) FROM stdin;
\.


--
-- Data for Name: login_state; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.login_state (id, "createdDate", data, "userId", expires) FROM stdin;
\.


--
-- Data for Name: mentor; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.mentor (id, "createdDate", "updatedDate", "maxStudentsLimit", "courseId", "userId", "studentsPreference", "isExpelled") FROM stdin;
1266	2020-04-06 15:39:35.609875	2020-04-06 15:39:35.609875	\N	13	2595	\N	f
1267	2020-04-06 15:39:40.768722	2020-04-06 15:39:40.768722	\N	13	2612	\N	f
1268	2020-04-06 15:39:46.991811	2020-04-06 15:39:46.991811	\N	13	2084	\N	f
1269	2020-04-06 15:39:51.547456	2020-04-06 15:39:51.547456	\N	13	2032	\N	f
1272	2020-04-06 15:39:35.609875	2020-04-06 15:39:35.609875	\N	23	2595	\N	f
1273	2020-04-06 15:39:40.768722	2020-04-06 15:39:40.768722	\N	23	2612	\N	f
1274	2020-04-06 15:39:46.991811	2020-04-06 15:39:46.991811	\N	23	2084	\N	f
1275	2020-04-06 15:39:51.547456	2020-04-06 15:39:51.547456	\N	23	2032	\N	f
\.


--
-- Data for Name: mentor_registry; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.mentor_registry (id, "userId", "preferedCourses", "maxStudentsLimit", "englishMentoring", "preferedStudentsLocation", "createdDate", "updatedDate", "technicalMentoring", "preselectedCourses", canceled, "languagesMentoring") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1630340371992	UserMigration1630340371992
2	1630341383942	TaskResult1630341383942
3	1630342025950	StudentMigration1630342025950
4	1630342266002	UserMigration1630342266002
5	1630347897950	StudentMigration1630347897950
6	1632333725126	ResumeMigration1632333725126
7	1635365797478	User1635365797478
8	1637591194886	StageInterview1637591194886
9	1639418471577	Indicies1639418471577
10	1638302439645	CourseMigration1638302439645
11	1639427578702	Update1639427578702
12	1639502600339	Student1639502600339
13	1642884123347	ResumeSelectCourses1642884123347
14	1643481312933	Task1643481312933
15	1643550350939	LoginState1643550350939
16	1643926895264	Notifications1643926895264
17	1644695410918	NotificationConnection1644695410918
18	1645364514538	RepositoryEvent1645364514538
19	1645654601903	Opportunitites1645654601903
20	1647175301446	TaskSolutionConstraint1647175301446
21	1647550751147	NotificationType1647550751147
22	1647885219936	LoginStateUserId1647885219936
23	1647103154082	CrossCheckScheduling1647103154082
24	1649505252996	CourseLogo1649505252996
25	1649868994688	CourseLogo1649868994688
26	1650652882300	DiscordChannel1650652882300
27	1652870756742	Resume1652870756742
28	1656326258991	History1656326258991
29	1661034658479	Feedback1661034658479
30	1661087975938	Discipline1661087975938
31	1661106736439	Disciplines1661106736439
32	1661107174477	Disciplines1661107174477
33	1661616212488	NotificationCategory1661616212488
34	1662275601017	CourseTask1662275601017
35	1664183799115	CourseEvent1664183799115
36	1666348642811	TaskCriteria1666348642811
37	1666621080327	TaskSolutionResult1666621080327
38	1671475396333	Tasks1671475396333
39	1672142743107	TeamDistribution1672142743107
40	1672386450861	TeamDistribution1672386450861
41	1673090827105	TaskVerification1673090827105
42	1673692838338	User1673692838338
43	1674128274839	Team1674128274839
44	1674755854609	Resume1674755854609
45	1674377676805	TeamDistributionStudent1674377676805
46	1675245424426	UserGroup1675245424426
47	1675345245770	Course1675345245770
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.notification (id, name, "createdDate", "updatedDate", type, enabled, "parentId") FROM stdin;
mentorRegistrationApproval	Mentor registration approval	2022-02-18 21:19:53.292291	2022-02-18 21:19:53.292291	mentor	f	\N
taskGrade	Task grade received	2022-02-18 21:19:53.292291	2022-02-18 21:19:53.292291	student	f	\N
\.


--
-- Data for Name: notification_channel; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.notification_channel (id, "createdDate", "updatedDate") FROM stdin;
email	2022-02-18 21:19:53.292291	2022-02-18 21:19:53.292291
telegram	2022-02-18 21:19:53.292291	2022-02-18 21:19:53.292291
discord	2023-01-26 18:24:37.509357	2023-01-26 18:24:37.509357
\.


--
-- Data for Name: notification_channel_settings; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.notification_channel_settings ("notificationId", "createdDate", "updatedDate", "channelId", template) FROM stdin;
\.


--
-- Data for Name: notification_user_connection; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.notification_user_connection ("userId", "createdDate", "updatedDate", "channelId", "externalId", enabled) FROM stdin;
\.


--
-- Data for Name: notification_user_settings; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.notification_user_settings ("notificationId", "createdDate", "updatedDate", enabled, "userId", "channelId") FROM stdin;
\.


--
-- Data for Name: private_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.private_feedback (id, comment, "createdDate", "updatedDate", "courseId", "fromUserId", "toUserId") FROM stdin;
\.


--
-- Data for Name: profile_permissions; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.profile_permissions (id, "createdDate", "updatedDate", "userId", "isProfileVisible", "isAboutVisible", "isEducationVisible", "isEnglishVisible", "isEmailVisible", "isTelegramVisible", "isSkypeVisible", "isPhoneVisible", "isContactsNotesVisible", "isLinkedInVisible", "isPublicFeedbackVisible", "isMentorStatsVisible", "isStudentStatsVisible") FROM stdin;
\.


--
-- Data for Name: registry; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.registry (id, type, status, "createdDate", "updatedDate", "userId", "courseId", attributes) FROM stdin;
8953	student	approved	2020-04-06 15:15:02.782811	2020-04-06 15:15:02.782811	11563	13	{}
8954	student	approved	2020-04-06 15:30:27.1162	2020-04-06 15:30:27.1162	677	13	{}
8955	student	approved	2020-04-06 15:31:44.431228	2020-04-06 15:31:44.431228	1090	13	{}
\.


--
-- Data for Name: repository_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.repository_event (id, "repositoryUrl", action, "githubId", "createdDate", "updatedDate", "userId") FROM stdin;
\.


--
-- Data for Name: resume; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.resume (id, "githubId", name, "selfIntroLink", "startFrom", "fullTime", expires, "militaryService", "englishLevel", "avatarLink", "desiredPosition", notes, phone, email, skype, telegram, linkedin, locations, "githubUsername", website, "isHidden", "visibleCourses", uuid, "userId", "updatedDate") FROM stdin;
1	valerydluski	v	\N	2023-02-22	f	1678005529649	served	A0	\N	as	\N	\N	\N	\N	\N	\N	v	\N	\N	f	{}	4ca1a1ca-e98a-4ef2-81c2-f90e38605e8c	11569	2023-02-03 08:38:59.072447
\.


--
-- Data for Name: stage; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage (id, "createdDate", "updatedDate", name, "courseId", status, "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: stage_interview; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage_interview (id, "createdDate", "updatedDate", "studentId", "mentorId", "stageId", "isCompleted", decision, "isGoodCandidate", "courseId", "courseTaskId", "isCanceled") FROM stdin;
10687	2020-04-07 20:27:20.124459	2020-04-07 20:27:20.124459	14327	1266	\N	f	\N	\N	13	408	f
10689	2020-04-07 20:28:00.755084	2020-04-07 21:07:08.374015	14329	1266	\N	t	noButGoodCandidate	t	13	408	f
10688	2020-04-07 20:27:41.249823	2023-02-03 07:48:18.719106	14329	1266	\N	f	\N	\N	13	408	t
\.


--
-- Data for Name: stage_interview_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage_interview_feedback (id, "createdDate", "updatedDate", "stageInterviewId", json) FROM stdin;
1234	2020-04-07 21:07:08.363918	2020-04-07 21:07:08.363918	10689	{"skills":{"htmlCss":{"level":3},"dataStructures":{"array":3,"stack":4},"common":{"binaryNumber":4,"sortingAndSearchAlgorithms":3}},"programmingTask":{"resolved":1,"codeWritingLevel":3},"english":{"levelStudentOpinion":9,"levelMentorOpinion":8},"resume":{"verdict":"noButGoodCandidate","comment":"test"}}
\.


--
-- Data for Name: stage_interview_student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage_interview_student (id, "createdDate", "updatedDate", "studentId", "courseId") FROM stdin;
1091	2020-04-07 21:16:20.362338	2020-04-07 21:16:20.362338	14329	13
\.


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.student (id, "createdDate", "updatedDate", "isExpelled", "expellingReason", "courseCompleted", "isTopPerformer", "preferedMentorGithubId", "readyFullTime", "courseId", "userId", "mentorId", "cvUrl", "hiredById", "hiredByName", "isFailed", "totalScore", "startDate", "endDate", repository, "totalScoreChangeDate", "repositoryLastActivityDate", rank, "crossCheckScore", "unassigningComment", mentoring) FROM stdin;
14327	2020-04-06 15:15:02.77565	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	11563	1266	\N	\N	\N	f	0	2020-04-06 15:15:02.757+00	\N	\N	\N	\N	2	0	\N	t
14331	2020-04-06 15:33:59.694437	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2098	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	3	0	\N	t
14332	2020-04-06 15:34:04.8008	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2103	1267	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	4	0	\N	t
14333	2020-04-06 15:34:09.064514	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2115	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	5	0	\N	t
14335	2020-04-06 15:34:19.221853	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2480	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	6	0	\N	t
14334	2020-04-06 15:34:17.983101	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2277	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	7	0	\N	t
14336	2020-04-06 15:39:07.779618	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2549	1266	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	8	0	\N	t
14330	2020-04-06 15:33:53.058912	2021-07-28 21:28:00.086033	f	\N	f	f	\N	\N	13	2089	1266	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	9	0	\N	t
14328	2020-04-06 15:30:27.104695	2021-07-28 21:28:00.086033	t	test	f	f	\N	\N	13	677	1268	\N	\N	\N	f	0	2020-04-06 15:30:27.091+00	2020-04-07 13:34:01.397+00	\N	\N	\N	10	0	\N	t
14340	2020-04-06 15:33:53.058912	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2089	1266	\N	\N	\N	f	1585	1970-01-01 00:00:00+00	\N	\N	2021-07-28 21:28:00.124+00	\N	1	0	\N	t
14337	2020-04-06 15:15:02.77565	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	11563	1266	\N	\N	\N	f	620	2020-04-06 15:15:02.757+00	\N	\N	2021-07-28 21:28:00.123+00	\N	2	0	\N	t
14346	2020-04-06 15:39:07.779618	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2549	1266	\N	\N	\N	f	560	1970-01-01 00:00:00+00	\N	\N	2021-07-28 21:28:00.124+00	\N	3	0	\N	t
14341	2020-04-06 15:33:59.694437	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2098	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	4	0	\N	t
14342	2020-04-06 15:34:04.8008	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2103	1267	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	5	0	\N	t
14343	2020-04-06 15:34:09.064514	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2115	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	6	0	\N	t
14339	2020-04-06 15:31:44.421341	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	1090	\N	\N	\N	\N	f	0	2020-04-06 15:31:44.388+00	\N	\N	\N	\N	8	0	\N	t
14344	2020-04-06 15:34:17.983101	2021-07-28 21:28:00.146524	f	\N	f	f	\N	\N	23	2277	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	9	0	\N	t
14338	2020-04-06 15:30:27.104695	2023-02-02 15:37:56.504153	f		f	f	\N	\N	23	677	1268	\N	\N	\N	f	0	2020-04-06 15:30:27.091+00	\N	\N	\N	\N	10	0	\N	t
14345	2020-04-06 15:34:19.221853	2023-02-02 15:38:36.638022	f		f	f	\N	\N	23	2480	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	7	0	\N	t
14329	2020-04-06 15:31:44.421341	2023-02-03 07:48:22.122732	f		f	f	\N	\N	13	1090	\N	\N	\N	\N	f	32	2020-04-06 15:31:44.388+00	\N	\N	2021-07-28 21:28:00.058+00	\N	1	0	\N	t
\.


--
-- Data for Name: student_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.student_feedback (id, created_date, updated_date, deleted_date, student_id, mentor_id, content, recommendation, english_level, author_id) FROM stdin;
\.


--
-- Data for Name: student_team_distribution_team_distribution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.student_team_distribution_team_distribution ("studentId", "teamDistributionId") FROM stdin;
\.


--
-- Data for Name: student_teams_team; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.student_teams_team ("studentId", "teamId") FROM stdin;
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task (id, "createdDate", "updatedDate", name, "descriptionUrl", description, verification, "githubPrRequired", "useJury", "allowStudentArtefacts", "githubRepoName", "sourceGithubRepoUrl", type, tags, attributes, skills, "disciplineId", "criteriaId", "deletedDate") FROM stdin;
441	2019-10-16 15:05:31.176646	2019-10-16 15:05:31.176646	Technical screening 2	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md	\N	manual	f	f	f	\N	\N	\N		{}		\N	\N	\N
413	2019-08-29 10:57:34.732592	2019-11-11 18:19:01.013044	ST JS Test	http://learn.javascript.ru/	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
448	2019-11-20 10:39:10.274681	2019-11-20 10:39:10.274681	Fancy Weather	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md	\N	manual	t	f	f	\N	\N	jstask		{}		\N	\N	\N
445	2019-11-13 07:46:32.194939	2019-12-03 14:41:40.672641	Code Jam "Palette"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-palette/codejam-palette_en.md	\N	manual	t	f	f	\N	\N	codejam	codejam,canvas,dom	{}		\N	\N	\N
451	2019-12-11 17:17:25.352869	2019-12-11 17:17:25.352869	Async-extra	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
454	2019-12-16 10:37:14.018926	2019-12-16 10:37:14.018926	Typical Arrays Problems	https://github.com/Shastel/typical-arrays-problems	\N	auto	f	f	f	typical-arrays-problems	https://github.com/Shastel/typical-arrays-problems	jstask	epam	{}		\N	\N	\N
457	2019-12-16 10:38:57.10798	2019-12-16 10:38:57.10798	Human Readable Number	https://github.com/Shastel/human-readable-number	\N	auto	f	f	f	human-readable-number	https://github.com/Shastel/human-readable-number	jstask	epam	{}		\N	\N	\N
460	2019-12-20 08:53:52.921362	2019-12-20 08:53:52.921362	re:bind	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
417	2019-09-17 07:09:54.066212	2020-02-02 09:07:48.746248	HTML/CSS Self Education	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/HTML-CSS-self-ru.md	\N	auto	f	f	f	\N	\N	htmlcssacademy	stage1	{}		\N	\N	\N
462	2020-02-07 08:05:04.999374	2020-02-07 08:05:04.999374	Songbird	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
466	2020-02-11 08:49:28.691804	2020-02-11 08:49:28.691804	ios Test	https://test.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
468	2020-02-17 08:27:20.358749	2020-02-17 08:28:49.855244	Angular. Intro	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/intro.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
471	2020-02-17 09:19:10.05115	2020-02-17 09:19:10.05115	Angular. RxJS & Observables. HTTP	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/rxjs-observables-http.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
475	2020-02-19 15:14:40.900394	2020-02-19 15:22:20.919668	Typical Arrays Problems	https://github.com/rolling-scopes-school/typical-arrays-problems/blob/master/README.md	\N	auto	f	f	f	typical-arrays-problems	https://github.com/rolling-scopes-school/typical-arrays-problems	jstask	stage1,algorithms	{}		\N	\N	\N
473	2020-02-19 15:13:21.398993	2020-02-19 15:22:34.391055	Human Readable Number	https://github.com/rolling-scopes-school/human-readable-number/blob/master/README.md	\N	auto	f	f	f	human-readable-number	https://github.com/rolling-scopes-school/human-readable-number	jstask	stage1,algorithms	{}		\N	\N	\N
478	2020-02-26 06:55:13.604626	2020-02-26 06:55:24.65169	FAKE TEST IOS	http://example.com	\N	auto	f	f	f	test-solution	https://github.com/apalchys/test-solution	objctask	fake	{}		\N	\N	\N
480	2020-03-02 06:32:37.242366	2020-03-02 06:32:49.611475	React Culture Portal	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-culture-portal.md	\N	manual	f	f	f	\N	\N	jstask	portal,react	{}		\N	\N	\N
477	2020-02-25 23:21:08.16798	2020-03-12 17:34:18.306073	FAKE TEST KOTLIN	http://example.com	\N	auto	f	f	f	nadzeya	https://github.com/ziginsider/rs_task1	kotlintask	fake	{}		\N	\N	\N
483	2020-03-15 15:29:20.69008	2020-03-15 15:29:20.69008	Angular test	https://github.com/rolling-scopes-school/tasks/tree/master/tasks	\N	auto	f	f	f	\N	\N	test	angular,Angular	{}		\N	\N	\N
485	2020-03-16 12:49:18.137702	2020-03-16 12:49:18.137702	Singolo. DOM & Responsive 	https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo	\N	manual	f	f	f	\N	\N	htmltask	stage1	{}		\N	\N	\N
487	2020-03-19 15:00:38.575898	2020-03-19 15:04:07.496857	[iOS] Quiz1	https://docs.google.com/forms/d/e/1FAIpQLSf4NwQRa2WbcjlcsDJI0kv62qJx0F0ltgapz0WczFrdBBSXug/viewform	\N	manual	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
416	2019-09-10 08:14:33.753801	2019-09-10 08:14:33.753801	UZ Custom lodash tests	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/10.-Custom-lodash-tests	\N	manual	f	f	f	\N	\N	\N		{}		\N	\N	\N
95	2019-04-26 14:55:46.480357	2019-08-14 10:45:30.750037	CJ "CSS QD"	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
442	2019-10-27 12:08:46.726741	2019-10-28 06:59:34.373416	Code Jam "Canvas"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-canvas/codejam-canvas.md	\N	manual	f	f	f	\N	\N	\N	stage2 ,canvas,codejam	{}		\N	\N	\N
443	2019-10-28 07:46:31.518101	2019-11-01 14:30:13.900706	Repair Design Project. Difficulty Level 3	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level-3/repair-design-project/repair-design-project-en.md	\N	manual	f	f	f	\N	\N	\N	stage1	{}		\N	\N	\N
486	2020-03-18 12:10:57.111813	2020-03-20 09:12:43.838469	Algorithms Part 1	https://github.com/rolling-scopes-school/rs.android-stage1-task1	\N	auto	f	f	f	rs.android-stage1-task1	https://github.com/rolling-scopes-school/rs.android-stage1-task1	kotlintask	Android,Kotlin	{}		\N	\N	\N
446	2019-11-13 08:16:07.288782	2019-11-24 15:47:56.206248	Code Jam "Image API"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-image-api/codejam-image-api_ru.md	\N	manual	t	f	f	\N	\N	codejam	codejam,stage2 	{}		\N	\N	\N
449	2019-11-27 15:58:51.613495	2019-11-27 15:58:51.613495	ST Checkpoint 1	https://app.rs.school/	\N	manual	f	f	f	\N	\N	interview		{}		\N	\N	\N
402	2019-08-14 10:35:12.012641	2019-12-03 14:49:35.649926	Code Jam "Culture Portal"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-culture-portal.md	\N	manual	f	f	f	\N	\N	codejam	codejam	{}		\N	\N	\N
452	2019-12-16 09:39:38.046401	2019-12-16 09:39:38.046401	Fancy-weather Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
455	2019-12-16 10:37:47.551919	2019-12-16 10:37:47.551919	Reverse Int	https://github.com/Shastel/reverse-int	\N	auto	f	f	f	reverse-int	https://github.com/Shastel/reverse-int	jstask	epam	{}		\N	\N	\N
458	2019-12-16 15:59:10.804471	2019-12-16 15:59:10.804471	ST React App	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Things-APP	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
461	2020-01-10 20:07:46.237318	2020-01-10 20:07:46.237318	Angular Workshop	https://angular.io/	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
463	2020-02-07 08:05:15.718038	2020-02-07 08:05:15.718038	Songbird	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
464	2020-02-07 08:05:57.730605	2020-02-07 08:05:57.730605	Calculator	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
467	2020-02-15 14:41:17.390262	2020-02-16 08:44:46.403205	Basic JS	https://github.com/AlreadyBored/basic-js	\N	auto	f	f	f	basic-js	https://github.com/AlreadyBored/basic-js	jstask	stage1,algorithms	{}		\N	\N	\N
469	2020-02-17 08:28:38.434548	2020-02-17 08:28:54.065591	Angular. Components. Directives & Pipes	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/components-directives-pipes.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
474	2020-02-19 15:13:59.744793	2020-02-19 15:22:27.177884	Reverse Int	https://github.com/rolling-scopes-school/reverse-int/blob/master/README.md	\N	auto	f	f	f	reverse-int	https://github.com/rolling-scopes-school/reverse-int	jstask	stage1,algorithms	{}		\N	\N	\N
472	2020-02-19 15:12:35.267242	2020-02-19 15:22:41.830318	Towel Sort	https://github.com/rolling-scopes-school/towel-sort/blob/master/README.md	\N	auto	f	f	f	towel-sort	https://github.com/rolling-scopes-school/towel-sort	jstask	stage1,algorithms	{}		\N	\N	\N
476	2020-02-21 10:24:38.588117	2020-02-21 10:24:38.588117	Singolo	https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo	\N	manual	f	f	f	\N	\N	htmltask	stage1,html	{}		\N	\N	\N
479	2020-03-02 06:25:15.661263	2020-03-02 06:25:15.661263	Angular Culture Portal	https://github.com/rolling-scopes-school/tasks/blob/angular-2020Q1/tasks/angular/culture-portal.md	\N	manual	f	f	f	\N	\N	jstask	angular,portal	{}		\N	\N	\N
481	2020-03-02 11:56:29.196388	2020-03-02 11:56:29.196388	Data grid	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/datagrid.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
396	2019-08-06 09:43:51.676522	2019-08-06 09:43:51.676522	Match Match Game	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/match-match-game.md	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
400	2019-08-06 09:55:49.176631	2019-08-06 09:55:49.176631	React Redux	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/react-match-match-game.md	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
86	2019-04-26 14:55:46.436642	2019-08-14 10:45:50.369308	CJ "DOM, DOM Events"	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
398	2019-08-06 09:52:41.754622	2019-08-14 10:46:07.362506	CJ "Lodash Quick Draw"	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
82	2019-04-26 14:55:46.414479	2019-04-26 14:55:46.414479	HTML/CSS Test	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
85	2019-04-26 14:55:46.431913	2019-04-26 14:55:46.431913	Markup #1	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
88	2019-04-26 14:55:46.446081	2019-04-26 14:55:46.446081	RS Activist	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
91	2019-04-26 14:55:46.460834	2019-04-26 14:55:46.460834	Mentor Dashboard	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
92	2019-04-26 14:55:46.465569	2019-04-26 14:55:46.465569	CoreJS/Arrays Test	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
94	2019-04-26 14:55:46.475554	2019-04-26 14:55:46.475554	Game	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
97	2019-04-26 14:55:46.49026	2019-04-26 14:55:46.49026	DreamTeam	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
90	2019-04-26 14:55:46.455449	2019-04-26 14:55:46.45545	Code Jam "Scoreboard"	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
117	2019-04-30 13:51:17.676745	2019-05-14 10:55:17.676745	Hexal	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup_d1_Hexal.md	\N	manual	f	f	f	\N	\N	\N		{}		\N	\N	\N
221	2019-05-17 13:01:38.633934	2019-05-17 13:01:38.633934	htmlCssBasics	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
224	2019-05-17 13:01:38.650481	2019-05-17 13:01:38.650481	layouts	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
222	2019-05-17 13:01:38.639424	2019-05-17 13:01:38.639424	floatExercise	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
223	2019-05-17 13:01:38.644267	2019-05-17 13:01:38.644267	positioning	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
225	2019-05-17 13:01:38.655673	2019-05-17 13:01:38.655673	workshop	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
226	2019-05-17 13:01:38.660659	2019-05-17 13:01:38.660659	responsive	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
227	2019-05-17 13:01:38.666042	2019-05-17 13:01:38.666042	formsWidgets	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
228	2019-05-17 13:01:38.671159	2019-05-17 13:01:38.671159	finalTask	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
231	2019-05-17 13:01:38.686221	2019-05-17 13:01:38.686221	doublyLinkedList	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
232	2019-05-17 13:01:38.695428	2019-05-17 13:01:38.695428	customJQuery	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
234	2019-05-17 13:01:38.705612	2019-05-17 13:01:38.705612	realJquery	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
235	2019-05-17 13:01:38.71084	2019-05-17 13:01:38.71084	wsc	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
236	2019-05-17 13:01:38.715941	2019-05-17 13:01:38.715941	noNameOne	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
237	2019-05-17 13:01:38.720957	2019-05-17 13:01:38.720957	noNameTwo	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
238	2019-05-17 13:02:30.13361	2019-05-17 13:02:30.13361	workHonor	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
240	2019-05-17 13:02:30.15818	2019-05-17 13:02:30.15818	cssQDTime	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
241	2019-05-17 13:02:30.163081	2019-05-17 13:02:30.163081	uiLab	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
242	2019-05-17 13:02:30.168177	2019-05-17 13:02:30.168177	flexbox	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
243	2019-05-17 13:02:30.173271	2019-05-17 13:02:30.173271	adaptive	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
244	2019-05-17 13:02:30.184497	2019-05-17 13:02:30.184497	cssTotal	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
245	2019-05-17 13:02:30.190762	2019-05-17 13:02:30.190762	workOnLessons	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
247	2019-05-17 13:02:30.201713	2019-05-17 13:02:30.201713	functionMake	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
248	2019-05-17 13:02:30.207184	2019-05-17 13:02:30.207184	wsc	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
249	2019-05-17 13:02:30.212126	2019-05-17 13:02:30.212126	gulp	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
250	2019-05-17 13:02:30.217988	2019-05-17 13:02:30.217988	honoiTower	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
251	2019-05-17 13:02:30.223044	2019-05-17 13:02:30.223044	animation	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
252	2019-05-17 13:02:30.2279	2019-05-17 13:02:30.2279	customJQuery	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
253	2019-05-17 13:02:30.233767	2019-05-17 13:02:30.233767	tdd	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
89	2019-04-26 14:55:46.450715	2019-05-27 08:35:37.359351	Presentation	\N	\N	manual	\N	f	t	\N	\N	\N		{}		\N	\N	\N
96	2019-04-26 14:55:46.485433	2019-05-27 08:39:44.221825	Offline Presentation	\N	\N	manual	\N	t	f	\N	\N	\N		{}		\N	\N	\N
351	2019-06-05 11:51:12.229807	2019-06-05 11:51:12.229807	Stage#2 Final Test	\N	\N	auto	\N	f	f	\N	\N	\N		{}		\N	\N	\N
369	2019-06-26 13:24:39.790098	2019-06-26 13:24:39.790098	youTube	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
387	2019-07-08 13:30:12.12725	2019-07-08 13:30:12.12725	Padawans	\N	\N	auto	\N	f	f	\N	\N	\N		{}		\N	\N	\N
388	2019-07-08 13:31:46.251832	2019-07-08 13:31:46.251832	UZ CV	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
389	2019-07-08 13:32:18.083335	2019-07-08 13:32:18.083335	UZ Read me	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
390	2019-07-10 12:56:29.975418	2019-07-10 12:56:29.975418	UZ Layout	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/2.-Layout	Create web page, strictly according to:\n\nLambda restaurant layout\n\nBrowser support: Google Chrome, Mozilla Firefox, Microsoft Edge.	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
410	2019-08-29 09:41:00.400898	2019-08-29 10:08:08.993969	ST Chat	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Chat	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
407	2019-08-29 09:32:17.606001	2019-08-29 10:08:44.864627	ST Custom Lodash	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-Custom-Lodash	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
230	2019-05-17 13:01:38.681206	2019-08-29 10:10:10.985834	ST JS Assignments	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/7.-JS-assignments	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
435	2019-09-30 08:14:14.847165	2019-10-15 12:40:10.75085	HTML/CSS Test Advanced	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md	\N	auto	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
408	2019-08-29 09:34:32.473242	2019-08-29 10:08:34.054101	ST Cyclic menu	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Cyclic-menu	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
405	2019-08-29 09:16:23.185166	2019-08-29 10:09:04.204396	ST Auto Complete	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/1.-Auto-Complete	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
411	2019-08-29 10:11:56.69667	2019-08-29 10:11:56.69667	ST Catalogue. P.1 React Client	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.1-React-Client	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
414	2019-08-29 10:57:50.108237	2019-08-29 10:57:50.108237	ST JS Test 2	http://learn.javascript.ru/	\N	manual	f	f	f	\N	\N	\N		{}		\N	\N	\N
397	2019-08-06 09:46:51.573349	2019-08-06 09:46:51.573349	CSS Recipes & Layouts	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/css-recipes-and-layouts.md	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
401	2019-08-06 09:56:50.593508	2019-08-06 09:56:50.593508	Game Refactoring	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/game-refactoring.md	\N	auto	\N	f	f	\N	\N	\N		{}		\N	\N	\N
229	2019-05-17 13:01:38.676219	2019-08-06 09:59:19.619433	JS Test	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
122	2019-04-30 14:11:11.94101	2019-05-14 10:14:11.94101	Neutron Mail	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup-d2-NeutronMail-en.md	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
87	2019-04-26 14:55:46.441332	2019-05-14 10:56:46.441332	YouTube	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/youtube.md	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
404	2019-08-29 08:12:24.073776	2019-10-28 10:40:19.063008	ST Read me	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/0.-Readme	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
422	2019-09-19 10:02:05.134479	2019-11-01 14:31:29.943288	JS: Multiply	https://github.com/Shastel/multiply	\N	auto	f	f	f	multiply	https://github.com/Shastel/multiply	jstask	stage1	{}		\N	\N	\N
484	2020-03-15 23:11:23.55455	2020-03-25 09:27:46.940288	Technical Screening	https://docs.rs.school/#/technical-screening	\N	manual	f	f	f	\N	\N	stage-interview	interview	{}		\N	\N	\N
428	2019-09-20 09:56:26.502967	2019-11-08 11:44:12.440623	JS: JS-edu	https://github.com/davojta/js-edu	\N	auto	f	f	f	js-edu	https://github.com/davojta/js-edu	jstask	stage1	{}		\N	\N	\N
431	2019-09-24 08:20:14.453176	2019-11-08 11:44:50.366453	JS: Unique 	https://github.com/Shastel/unique	\N	auto	f	f	f	unique	https://github.com/Shastel/unique	jstask	stage1	{}		\N	\N	\N
349	2019-05-28 15:21:16.311993	2019-11-19 09:35:38.995602	CoreJS Interview 	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/interview-corejs.md	\N	manual	f	f	f	\N	\N	interview		{}		\N	\N	\N
93	2019-04-26 14:55:46.470595	2019-11-19 09:53:57.574635	WebSocket Challenge	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/websocket-challenge.md	\N	manual	f	f	f	\N	\N	codejam		{}		\N	\N	\N
350	2019-06-03 06:50:19.575782	2019-11-19 10:53:20.712051	CodeJam "Animation Player"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-animation-player.md	\N	manual	f	f	f	\N	\N	codejam		{}		\N	\N	\N
352	2019-06-21 07:22:11.052584	2019-11-19 13:06:31.954741	Piskel-clone	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-clone.md	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
129	2019-05-13 11:45:12.64168	2020-03-09 11:46:32.445946	Codewars stage 2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars.md	\N	auto	f	f	f	\N	\N	codewars:stage2	codewars	{}		\N	\N	\N
220	2019-05-17 13:01:38.627128	2019-05-17 13:01:38.627128	workHonor	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
391	2019-07-15 12:39:31.48174	2019-07-15 12:39:31.48174	UZ Autocomplete	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/3.-Autocomplete	The task is to implement a custom createAutocomplete function	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
392	2019-07-17 14:41:10.098861	2019-07-17 14:41:10.098861	UZ Codewars	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/4.-Codewars	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
394	2019-07-30 09:47:10.177586	2019-07-30 09:47:10.177586	UZ Javascript Classes & Inheritance	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/5.-Javascript-Classes-&-Inheritance	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
395	2019-07-31 12:59:19.767726	2019-07-31 12:59:19.767726	UZ Custom Lodash	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/8.-Custom-Lodash	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
246	2019-05-17 13:02:30.196693	2019-08-06 09:59:24.394646	JS Test	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
233	2019-05-17 13:01:38.700498	2019-08-06 11:08:43.462233	CSS QD	\N	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
403	2019-08-22 09:35:28.567592	2019-08-22 09:35:28.567592	UZ Cyclic menu	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/9.-Cyclic-menu	\N	manual	\N	f	f	\N	\N	\N		{}		\N	\N	\N
406	2019-08-29 09:21:54.045655	2019-08-29 10:08:53.337095	ST Javascript Classes & Inheritance	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/2.-Javascript-Classes-&-Inheritance	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
412	2019-08-29 10:12:27.740479	2019-08-29 10:12:27.740479	ST Catalogue. P.2 Angular Admin Client	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.2-Angular-Admin-Client	\N	manual	t	f	f	\N	\N	\N		{}		\N	\N	\N
415	2019-08-29 11:07:41.484385	2019-08-29 11:07:41.484385	ST Bonus	https://github.com/rolling-scopes-school/docs/blob/master/rs-activist.md	\N	manual	f	f	f	\N	\N	\N		{}		\N	\N	\N
434	2019-09-30 08:09:29.61975	2019-10-08 14:24:55.849506	RS School Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-school-test.md	\N	auto	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
436	2019-09-30 08:14:56.284783	2019-10-08 07:05:43.425884	Git Test #2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md\t	\N	manual	f	f	f	\N	\N	\N	stage1	{}		\N	\N	\N
433	2019-09-30 08:05:43.034506	2019-10-08 14:25:09.658362	HTML/CSS Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md	\N	auto	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
465	2020-02-09 18:17:26.12848	2020-02-09 18:17:26.12848	Codewars stage 1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars-stage-1.md	\N	auto	f	f	f	\N	\N	codewars:stage1	codewars	{}		\N	\N	\N
432	2019-09-30 08:03:38.411822	2019-10-28 06:59:48.722431	Git Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md	\N	auto	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
418	2019-09-17 07:20:20.07102	2019-10-28 07:40:32.105112	Theyalow. Difficulty Level 1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level%201/theyalow/theyalow-en.md	\N	manual	f	f	f	\N	\N	\N	stage1	{}		\N	\N	\N
439	2019-10-13 13:50:38.385396	2019-11-01 14:29:45.50486	Priority Queue	https://github.com/rolling-scopes-school/priority-queue	\N	auto	f	f	f	priority-queue	https://github.com/rolling-scopes-school/priority-queue	jstask	stage1,algorithms	{}		\N	\N	\N
424	2019-09-20 09:40:16.65468	2019-11-01 14:31:12.362038	JS: Expression Calculator	https://github.com/romacher/expression-calculator	\N	auto	f	f	f	expression-calculator	https://github.com/romacher/expression-calculator	jstask	stage1	{}		\N	\N	\N
421	2019-09-17 13:40:31.235798	2019-11-01 14:31:18.390464	JS: Brackets	https://github.com/Shastel/brackets	\N	auto	f	f	f	brackets	https://github.com/Shastel/brackets	jstask	stage1	{}		\N	\N	\N
423	2019-09-19 10:02:37.126233	2019-11-01 14:31:37.02801	JS: Zeros	https://github.com/Shastel/zeros	\N	auto	f	f	f	zeros	https://github.com/Shastel/zeros	jstask	stage1	{}		\N	\N	\N
393	2019-07-26 13:14:49.106312	2019-11-07 09:21:44.562843	ST JS assignments	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-JS-assignments	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
425	2019-09-20 09:42:22.766447	2019-11-08 11:43:53.046921	JS: Guessing-game	https://github.com/rolling-scopes-school/guessing-game	\N	auto	f	f	f	guessing-game	https://github.com/rolling-scopes-school/guessing-game	jstask	stage1	{}		\N	\N	\N
426	2019-09-20 09:54:01.865495	2019-11-08 11:44:00.705846	JS: Morse-decoder	https://github.com/romacher/morse-decoder	\N	auto	f	f	f	morse-decoder	https://github.com/romacher/morse-decoder	jstask	stage1	{}		\N	\N	\N
427	2019-09-20 09:54:43.876086	2019-11-08 11:44:06.756286	JS: Finite-state-machine	https://github.com/rolling-scopes-school/finite-state-machine	\N	auto	f	f	f	finite-state-machine	https://github.com/rolling-scopes-school/finite-state-machine	jstask	stage1	{}		\N	\N	\N
429	2019-09-22 09:55:22.942777	2019-11-08 11:44:20.763439	JS: Tic Tac Toe	https://github.com/rolling-scopes-school/tic-tac-toe	\N	auto	f	f	f	tic-tac-toe	https://github.com/rolling-scopes-school/tic-tac-toe	jstask	stage1	{}		\N	\N	\N
430	2019-09-22 09:56:18.079947	2019-11-08 11:45:10.648593	JS: Doubly Linked List	https://github.com/rolling-scopes-school/doubly-linked-list	\N	auto	f	f	f	doubly-linked-list	https://github.com/rolling-scopes-school/doubly-linked-list	jstask	stage1	{}		\N	\N	\N
409	2019-08-29 09:37:01.324698	2019-11-11 18:15:52.011347	ST Autocomplete UI	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Autocomplete-UI	\N	manual	t	f	f	\N	\N	jstask		{}		\N	\N	\N
447	2019-11-18 07:47:39.508556	2019-11-18 07:47:39.508556	test-task	https://github.com/mikhama/test-task	\N	auto	f	f	f	test-task	https://github.com/mikhama/test-task	jstask		{}		\N	\N	\N
399	2019-08-06 09:54:06.658655	2019-12-03 14:49:49.549586	Code Jam "Hacktrain"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/codejam-train.md	\N	manual	f	f	f	\N	\N	codejam		{}		\N	\N	\N
440	2019-10-15 07:50:32.749775	2019-11-19 09:34:34.605432	Technical screening	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md	\N	manual	f	f	f	\N	\N	interview	stage2 	{}		\N	\N	\N
450	2019-12-03 14:52:19.396399	2019-12-03 14:52:19.396399	Portfolio	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/portfolio/portfolio-ru.md	\N	manual	f	f	f	\N	\N	htmltask	stage2 ,html	{}		\N	\N	\N
83	2019-04-26 14:55:46.421933	2019-11-30 18:36:50.662322	CoreJS	https://github.com/mikhama/core-js-101	\N	auto	t	f	f	core-js-101	https://github.com/mikhama/core-js-101	jstask		{}		\N	\N	\N
128	2019-05-02 09:41:43.371377	2019-12-03 14:42:15.453094	Code Jam "Palette"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-pallete.md	\N	manual	t	f	f	\N	\N	codejam	deprecated	{}		\N	\N	\N
444	2019-11-04 08:12:31.634176	2020-03-31 10:17:18.546617	Virtual Keyboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-virtual-keyboard.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,js	{}		\N	\N	\N
453	2019-12-16 10:34:47.548986	2019-12-16 10:34:47.548986	Temperature Converter	https://github.com/Shastel/temperature-converter	\N	auto	f	f	f	temperature-converter	https://github.com/Shastel/temperature-converter	jstask	epam	{}		\N	\N	\N
456	2019-12-16 10:38:26.769964	2019-12-16 10:38:26.769964	Towel Sort	https://github.com/Shastel/towel-sort	\N	auto	f	f	f	towel-sort	https://github.com/Shastel/towel-sort	jstask	epam	{}		\N	\N	\N
459	2019-12-18 14:22:47.842869	2019-12-18 14:22:47.842869	ST TDD	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
84	2019-04-26 14:55:46.426978	2020-02-10 18:45:57.803066	HTML, CSS & Git Basics	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-cv.md	\N	auto	f	f	f	\N	\N	cv:html	stage1	{}		\N	\N	\N
437	2019-10-06 11:20:27.617946	2020-02-10 06:18:24.928919	Markdown & Git	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-markdown.md	\N	auto	f	f	f	\N	\N	cv:markdown	stage1	{}		\N	\N	\N
470	2020-02-17 08:29:28.43587	2020-02-17 08:29:28.43587	Angular. Modules & Services. Routing	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/modules-services-routing.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
438	2019-10-13 13:34:49.201156	2020-03-23 10:57:07.262729	Sudoku	https://github.com/rolling-scopes-school/sudoku	\N	auto	f	f	f	sudoku	https://github.com/rolling-scopes-school/sudoku	jstask	stage1,algorithms	{}		\N	\N	\N
488	2020-03-19 16:22:02.703098	2020-03-24 16:19:06.071144	rs.ios.task2	https://github.com/rolling-scopes-school/rs.ios-stage1-task2/blob/master/readme.md	\N	auto	f	f	f	rs.ios-stage1-task2	https://github.com/rolling-scopes-school/rs.ios-stage1-task2/	objctask	stage1	{"targets":{"project":{"folder":"RSSchool_T2","xcodeproj":"RSSchool_T2.xcodeproj"},"tests":{"folder":"RSSchool_T2Tests","classes":["AbbreviationTests.m","BlocksTest.m","DatesTest.m","FibonacciNumbersTests.m","StringTransform.m","TimeInWordsTests.m"]}},"folder":"RSSchool_T2","details":"","descriptions":""}		\N	\N	\N
482	2020-03-10 20:39:15.488061	2020-03-24 16:20:39.287898	rs.ios.task1	https://github.com/rolling-scopes-school/rs.ios-stage1-task1/	\N	auto	f	f	f	rs.ios-stage1-task1	https://github.com/rolling-scopes-school/rs.ios-stage1-task1/	objctask	stage1	{"targets":{"project":{"folder":"RSSchool_T1","xcodeproj":"RSSchool_T1.xcodeproj"},"tests":{"folder":"RSSchool_T1Tests","classes":["BillCounterTests.m","HighestPalindromeTests.m","MiniMaxSumTests.m","StringParseTests.m","T1ArrayTests.m"]}},"folder":"RSSchool_T1","details":"","descriptions":""}		\N	\N	\N
489	2020-03-26 10:35:21.765085	2020-03-26 10:35:21.765085	Caesar cipher CLI tool	https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md	\N	manual	f	f	f	\N	\N	jstask	nodejs	{}		\N	\N	\N
490	2020-03-26 14:29:07.41166	2020-03-26 14:29:07.41166	HTML/Css(basic)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/css-recipes.md	\N	manual	f	f	f	\N	\N	htmltask	Poland	{}		\N	\N	\N
492	2020-03-31 09:33:53.140629	2020-03-31 09:33:53.140629	Express REST service	https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md#task-2-express-rest-service	\N	manual	f	f	f	\N	\N	jstask	nodejs	{}		\N	\N	\N
493	2020-03-31 10:20:39.859981	2020-03-31 10:20:39.859981	Virtual Keyboard Cross-Check	https://rolling-scopes-school.github.io/checklist/	\N	manual	f	f	f	\N	\N	jstask	stage2 ,js,cross-check	{}		\N	\N	\N
494	2020-03-31 10:23:52.389221	2020-03-31 10:23:52.389221	Gem Puzzle Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-the-gem-puzzle.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check,js	{}		\N	\N	\N
495	2020-04-01 08:43:01.126352	2020-04-01 08:43:01.126352	[Android] Quiz 1	https://docs.google.com/forms/d/e/1FAIpQLSdFHiOBHHDZpwztLq3rGYf7EzEQPw56I0HeYlqfg8BpB6leYg/viewform?usp=sf_link	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
491	2020-03-30 09:57:08.558596	2020-04-01 20:44:38.183195	rs.ios.task3.test	https://github.com/rolling-scopes-school/rs.ios-stage1-task3/blob/master/readme.md	\N	auto	f	f	f	rs.ios-stage1-task3	https://github.com/rolling-scopes-school/rs.ios-stage1-task3	objctask	stage1	{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["ArrayPrintTests.m","FullBinaryTreesTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["DateMachineTests.m"]}},"testReplacement":{"link":"git@github.com:rolling-scopes-school/rs.ios-stage1-private-tests.git","folder":"stage1-task3","replacement":[{"folder":"RSSchool_T3Tests","test":"ArrayPrintTests.m"},{"folder":"RSSchool_T3UITests","test":"DateMachineTests.m"}],"verify":[{"folder":"RSSchool_T3Tests","test":"FullBinaryTreesTests.m"}]},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}		\N	\N	\N
496	2020-04-02 17:01:12.759119	2020-04-02 17:01:12.759119	Layout(Restaurant)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markup-1.md	\N	manual	f	f	f	\N	\N	htmltask	Poland	{}		\N	\N	\N
497	2020-04-02 18:49:24.244235	2020-04-03 13:05:37.170103	rs.ios.task3	https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1/blob/master/README.md	\N	auto	f	f	f	rs.ios-stage1-task3.1	https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1	objctask	stage1	{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["T3_PolynomialTests.m","T3_CombinatorTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["RS_Task3_UICheckerUITests.m"]}},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}		\N	\N	\N
500	2020-04-09 10:03:10.874771	2020-04-09 10:03:10.874771	English for kids	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md	\N	manual	f	f	f	\N	\N	jstask	stage2	{}		\N	\N	\N
501	2020-04-09 16:00:08.930182	2021-06-22 09:18:19.384375	[iOS] Quiz2	https://docs.google.com/forms/d/e/1FAIpQLSdLvcnvAofsQ1ETqDnwSjH3U2WQJgVvlG8pxVPV_ZfhBWDV9w/closedform	\N	manual	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
502	2020-04-09 17:57:52.400972	2020-04-09 17:57:52.400972	rs.ios.task4	https://github.com/rolling-scopes-school/rs.ios-stage1-task4/blob/master/README.md	\N	auto	f	f	f	rs.ios-stage1-task4	https://github.com/rolling-scopes-school/rs.ios-stage1-task4	objctask	stage1	{}		\N	\N	\N
503	2020-04-10 18:12:45.707666	2021-06-06 20:26:13.523668	Logging & Error Handling	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-5-logging--error-handling	\N	manual	f	f	f	\N	\N	jstask	nodejs	{}		\N	\N	\N
504	2020-04-14 05:44:38.302281	2020-04-14 05:44:38.302281	Database MongoDB	https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md#task-4-database-mongodb	\N	manual	f	f	f	\N	\N	jstask	nodejs	{}		\N	\N	\N
505	2020-04-20 17:36:43.155586	2021-06-27 20:09:25.924071	Authentication and JWT	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-8-authentification--jwt	\N	manual	f	f	f	\N	\N	jstask	nodejs	{}		\N	\N	\N
506	2020-04-20 19:44:07.04595	2021-06-25 16:57:29.2666	[Android] Quiz 2	https://forms.gle/KLLFbKsKneosrwpV9	\N	manual	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
507	2020-04-24 09:12:59.277372	2020-06-02 11:36:07.441843	SpeakIt	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/speakit.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check	{}		\N	\N	\N
508	2020-04-27 06:51:46.900545	2020-04-27 06:51:46.900545	MovieSearch	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/movie-search.md	\N	manual	f	f	f	\N	\N	jstask	stage2	{}		\N	\N	\N
509	2020-04-27 06:52:41.255486	2020-04-27 06:52:41.255486	MovieSearch: Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/movie-search.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check	{}		\N	\N	\N
510	2020-04-29 06:04:23.576262	2021-06-02 06:56:53.49812	Javascript Classes & Inheritance	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/javascript-classes-inheritance.md	\N	manual	f	f	f	\N	\N	jstask	js,Poland,rs-lt	{}		\N	\N	\N
511	2020-04-30 16:13:15.587124	2020-04-30 16:13:15.587124	rs.ios.task5	https://github.com/rolling-scopes-school/rs.ios-stage1-task5/blob/master/README.md	\N	auto	f	f	f	rs.ios-stage1-task5	https://github.com/rolling-scopes-school/rs.ios-stage1-task5	objctask	stage1	{}		\N	\N	\N
512	2020-05-01 14:40:17.99012	2021-07-02 09:12:24.068724	Algorithms Task 3	https://github.com/rolling-scopes-school/rs.android-2021-stage1-task3	\N	auto	f	f	f	rs.android-2021-stage1-task3	https://github.com/rolling-scopes-school/rs.android-2021-stage1-task3	kotlintask	stage1	{}		\N	\N	\N
513	2020-05-03 19:35:27.599732	2020-05-03 19:35:27.599732	ICanCodeJS	https://github.com/codenjoyme	\N	manual	f	f	f	\N	\N	codejam	stage2 ,codejam	{}		\N	\N	\N
514	2020-05-05 17:07:38.151867	2020-05-05 17:07:38.151867	JS-assignments	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js-assignments.md	\N	manual	f	f	f	\N	\N	jstask	Poland	{}		\N	\N	\N
515	2020-05-11 14:15:10.391901	2020-05-11 14:15:10.391901	[iOS] Quiz 3	https://docs.google.com/forms/d/e/1FAIpQLSeb_To1WpYUWG_kfocuK5WfLLhL4MfXUn6AU0OVSEPt3ztXhw/viewform	\N	manual	f	f	f	\N	\N	objctask	stage1	{}		\N	\N	\N
516	2020-05-13 13:39:03.279745	2021-07-16 17:02:48.091094	[Android] Quiz 3 Final	https://forms.gle/TTcLK8kLEWveR7BF9	\N	manual	f	f	f	\N	\N	test	stage1	{}		\N	\N	\N
517	2020-05-14 18:49:07.427589	2020-05-14 18:49:07.427589	Cyclic menu	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cyclic-menu.md	\N	manual	f	f	f	\N	\N	jstask	Poland	{}		\N	\N	\N
518	2020-05-19 12:57:16.890419	2020-05-19 12:57:16.890419	Virtual keyboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/virtual-keyboard/virtual-keyboard-en.md	\N	manual	f	f	f	\N	\N	jstask	Poland	{}		\N	\N	\N
519	2020-05-28 20:05:20.202628	2020-05-28 20:05:20.202628	Fancy-weather(en)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather(en).md	\N	manual	f	f	f	\N	\N	jstask	Poland	{}		\N	\N	\N
520	2020-06-02 11:28:16.858003	2020-06-02 11:29:43.695887	English puzzle	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-puzzle.md	\N	manual	f	f	f	\N	\N	jstask	js,stage2	{}		\N	\N	\N
521	2020-06-02 11:29:37.951145	2020-06-02 11:29:52.45171	English puzzle: Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-puzzle.md	\N	manual	f	f	f	\N	\N	jstask	js,cross-check,stage2	{}		\N	\N	\N
522	2020-06-07 17:14:36.355963	2020-06-07 17:14:36.355963	CV	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-cv.md	\N	manual	f	f	f	\N	\N	cv:html	Georgia	{}		\N	\N	\N
523	2020-06-08 19:30:29.31376	2020-06-08 19:30:29.31376	rs.ios.task6	https://github.com/rolling-scopes-school/rs.ios-stage2-task6/blob/master/README.md	\N	manual	f	f	f	\N	\N	objctask	stage2	{}		\N	\N	\N
524	2020-06-08 19:31:03.111251	2020-06-08 19:31:03.111251	rs.ios.task7	https://github.com/rolling-scopes-school/rs.ios-stage2-task7/blob/master/README.md	\N	manual	f	f	f	\N	\N	objctask	stage2	{}		\N	\N	\N
525	2020-06-08 19:31:30.353779	2020-06-08 19:31:30.353779	rs.ios.task8	https://github.com/rolling-scopes-school/rs.ios-stage2-task8/blob/master/README.md	\N	manual	f	f	f	\N	\N	objctask	stage2	{}		\N	\N	\N
526	2020-06-08 19:55:04.118004	2020-06-08 19:55:04.118004	[iOS] Quiz 4	https://docs.google.com/forms/d/e/1FAIpQLSdc0z7shPfpCbcOlCyYggHqJqd01fiDYZCaif_kk7Azyt3ZxQ/viewform	\N	manual	f	f	f	\N	\N	test	stage2	{}		\N	\N	\N
527	2020-06-08 19:56:23.355047	2020-06-08 19:56:23.355047	[iOS] Quiz 5	https://docs.google.com/forms/d/e/1FAIpQLScIUpMl0RSKJmve_4AID8owWgSUzAGWVZxPchfpvTRo-e1TZQ/viewform	\N	manual	f	f	f	\N	\N	test	stage2	{}		\N	\N	\N
528	2020-06-09 12:05:43.593182	2021-07-07 06:11:53.697552	Custom lodash(unit tests)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/custom-lodash(unit%20%20tests).md	\N	manual	f	f	f	\N	\N	jstask	Poland,rs-lt	{}		\N	\N	\N
529	2020-06-14 18:51:48.51346	2020-06-14 18:51:48.51346	RS Lang. Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/rslang.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check,js	{}		\N	\N	\N
530	2020-06-14 18:52:12.642677	2020-06-14 18:52:12.642677	RS Lang. Presentation	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/rslang.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,js	{}		\N	\N	\N
531	2020-06-15 18:55:01.118769	2020-06-15 18:55:01.118769	Final JS Test	https://google.com	\N	manual	f	f	f	\N	\N	test	stage2	{}		\N	\N	\N
532	2020-06-18 11:57:24.090653	2020-06-18 11:57:24.090653	[Android] Task 4 Storage	https://github.com/rolling-scopes-school/rs.android.task.4	\N	manual	f	f	f	\N	\N	kotlintask	stage2	{}		\N	\N	\N
533	2020-07-02 17:22:29.052038	2020-07-02 17:22:29.052038	Chat (React)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chat.md	\N	manual	f	f	f	\N	\N	jstask	Poland,react	{}		\N	\N	\N
534	2020-07-17 08:55:25.910527	2020-07-17 08:55:25.910527	[Android] Task 5	https://github.com/rolling-scopes-school/Android-2020-Task-5	\N	manual	f	f	f	\N	\N	kotlintask	stage2	{}		\N	\N	\N
535	2020-07-20 07:47:20.402571	2020-07-20 07:47:48.182376	Angular YouTube client: Cross-Check	https://rolling-scopes-school.github.io/checklist/	\N	manual	f	f	f	\N	\N	jstask	Angular,angular	{}		\N	\N	\N
536	2020-07-22 08:08:14.64887	2020-07-22 08:08:14.64887	RS CloneWars	https://github.com/rolling-scopes-school/tasks	\N	manual	f	f	f	\N	\N	test	stage2	{}		\N	\N	\N
537	2020-07-25 09:04:32.443128	2020-07-25 09:16:46.759794	[Android] Task 6 MVP	https://github.com/rolling-scopes-school/rs.android.task.6	\N	manual	f	f	f	\N	\N	kotlintask	stage2	{}		\N	\N	\N
538	2020-07-28 05:44:35.694818	2020-07-28 06:09:53.982099	Codewars Test	https://github.com/rolling-scopes/rsschool-app	\N	manual	f	f	f	\N	\N	codewars	react,codewars	{}		\N	\N	\N
539	2020-08-02 20:57:21.752305	2020-08-05 10:27:49.213083	Codewars React	https://github.com/rolling-scopes-school/tasks/blob/f504966947a9f3e85a27f6401e7a6870f870f392/tasks/codewars-react.md	\N	manual	f	f	f	\N	\N	codewars	react,codewars	{}		\N	\N	\N
540	2020-08-03 14:31:53.354433	2020-08-03 14:31:53.354433	Interview(React)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-react.md	\N	manual	f	f	f	\N	\N	interview		{}		\N	\N	\N
541	2020-08-05 09:10:58.734646	2020-08-05 09:10:58.734646	Angular. NgRX	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/NgRX.md	\N	manual	f	f	f	\N	\N	jstask	Angular,angular	{}		\N	\N	\N
542	2020-08-15 20:40:21.595491	2020-08-15 20:41:37.149481	Schedule	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/schedule.md	\N	manual	f	f	f	\N	\N	jstask	react,js	{}		\N	\N	\N
543	2020-08-15 20:42:00.436081	2020-08-15 20:42:00.436081	X Check App	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/xcheck/xcheck.md	\N	manual	f	f	f	\N	\N	jstask	react,js	{}		\N	\N	\N
544	2020-08-23 13:40:57.097441	2020-08-23 13:40:57.097441	Mobile Hackathon	https://medium.com/mobilepeople/rolling-scopes-mobile-hackathon-results-9c96b4fb4211	\N	manual	f	f	f	\N	\N	codejam		{}		\N	\N	\N
545	2020-08-27 04:13:37.333538	2020-08-27 04:13:37.333538	Task 1. Calculator	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-1-calculator-40	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
546	2020-08-27 04:30:07.971139	2020-10-06 14:37:51.758728	Codewars Basic	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
547	2020-08-27 04:35:39.114632	2020-08-27 04:35:39.114632	Simple Singolo	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/simple-singolo.md	\N	manual	f	f	f	\N	\N	htmltask	html	{}		\N	\N	\N
548	2020-08-27 14:34:07.755403	2020-08-27 14:34:07.755403	HTML-basics	https://ru.code-basics.com/languages/html	\N	manual	f	f	f	\N	\N	htmltask	html	{}		\N	\N	\N
549	2020-08-27 14:34:39.873265	2020-08-27 14:34:39.873265	CSS-basics	https://ru.code-basics.com/languages/css	\N	manual	f	f	f	\N	\N	htmltask	html	{}		\N	\N	\N
550	2020-08-27 14:35:10.167076	2020-08-27 14:35:10.167076	JS-basics	https://ru.code-basics.com/languages/javascript	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
551	2020-08-27 16:10:52.287849	2020-08-27 16:10:52.287849	Task 2. Dynamic Landing Page	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-2-dynamic-landing-page-30	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
552	2020-08-27 16:11:28.541996	2020-08-27 16:11:28.541996	Task 3. Meditation App	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-3-meditation-app-20	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
553	2020-08-27 16:11:57.491788	2020-08-27 16:11:57.491788	Task 4. Drum Kit	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-4-drum-kit-20	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
554	2020-08-27 16:12:27.5845	2020-08-27 16:12:27.5845	Task 5. CSS Variables and JS	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-5-css-variables-and-js-20	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
593	2020-12-19 12:47:59.940867	2021-06-28 13:37:07.392607	CV. Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md	\N	manual	f	f	f	\N	\N	htmltask	stage0,html	{}		\N	\N	\N
596	2020-12-26 18:32:46.338943	2021-03-06 10:31:21.886056	JS Test #0	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	stage0	{}		\N	\N	\N
555	2020-08-27 16:12:54.861753	2020-08-27 16:12:54.861753	Task 6. Flex Panel Gallery	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-6-flex-panel-gallery-10	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
556	2020-08-27 16:13:19.737287	2020-08-27 16:13:19.737287	Task 7. Fun with HTML5 Canvas	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-7-fun-with-html5-canvas-40	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
557	2020-08-27 16:13:49.956984	2020-08-27 16:13:49.956984	Task 8. Custom Video Player	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-8-custom-video-player-20	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
558	2020-08-27 16:14:13.433263	2020-08-27 16:14:13.433263	Task 9. Video Speed Controller	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-9-video-speed-controller-10	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
559	2020-08-27 16:14:37.523502	2020-08-27 16:14:37.523502	Task 10. Whack-A-Mole	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-10-whack-a-mole-40	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
560	2020-08-27 16:15:04.873511	2020-08-27 16:15:04.873511	Task 11. Virtual Keyboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-11-virtual-keyboard-40	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
561	2020-08-27 16:15:27.500667	2020-08-27 16:15:27.500667	Task 12. Chat on socket.io	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-12-chat-on-socketio-20	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
562	2020-08-27 16:16:25.117143	2020-10-05 17:32:25.450477	Codewars Basic-1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic-1.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
563	2020-08-27 16:17:05.5464	2020-10-05 17:24:40.436098	Codewars Basic-2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic-2.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
564	2020-08-27 16:17:46.058557	2020-08-27 16:17:46.058557	raindrops	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/raindrops.md	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
565	2020-08-27 16:18:08.763424	2020-08-27 16:18:08.763424	fancy-weather	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/fancy-weather.md	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
566	2020-08-27 16:35:27.649926	2020-08-27 16:35:27.649926	Portfolio	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/Portfolio.md	\N	manual	f	f	f	\N	\N	jstask	js	{}		\N	\N	\N
567	2020-09-05 12:46:35.283775	2020-10-19 10:11:31.643018	Self HTML Basics	https://ru.code-basics.com/languages/html	\N	auto	f	f	f	\N	\N	selfeducation	html	{}		\N	\N	\N
568	2020-09-07 19:16:43.975374	2020-10-19 10:11:24.138441	Self CSS Basics	https://ru.code-basics.com/languages/css	\N	auto	f	f	f	\N	\N	selfeducation	css	{}		\N	\N	\N
569	2020-09-07 20:23:16.53491	2020-10-19 10:11:13.239832	Self JS Basics	https://ru.code-basics.com/languages/javascript	\N	auto	f	f	f	\N	\N	selfeducation	js	{}		\N	\N	\N
570	2020-09-19 08:01:33.992409	2020-09-19 08:01:33.992409	webdev	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level-1/webdev/webdev-ru.md	\N	manual	f	f	f	\N	\N	htmltask	stage1,html	{}		\N	\N	\N
571	2020-09-21 11:21:05.630909	2020-09-21 11:21:05.630909	Calculator	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/calculator.md	\N	manual	f	f	f	\N	\N	jstask	stage1,js	{}		\N	\N	\N
572	2020-09-21 16:03:35.625542	2020-09-21 16:03:35.625542	Momentum	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/momentum.md	\N	manual	f	f	f	\N	\N	jstask	stage1,js	{}		\N	\N	\N
573	2020-09-21 16:04:10.12875	2020-09-21 16:04:10.12875	Virtual Keyboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/virtual-keyboard.md	\N	manual	f	f	f	\N	\N	jstask	stage1,js	{}		\N	\N	\N
574	2020-09-22 08:55:51.123185	2021-07-16 17:01:41.593901	Android Final Quiz	https://forms.gle/TTcLK8kLEWveR7BF9	\N	manual	f	f	f	\N	\N	test	stage2 ,Android,Kotlin	{}		\N	\N	\N
575	2020-09-26 12:58:24.834196	2021-07-13 02:18:54.829974	React Team Task Presentation	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/schedule.md	\N	manual	f	f	f	\N	\N	jstask	react,presentation	{}		\N	\N	\N
576	2020-09-28 15:41:37.15626	2020-09-28 15:45:51.670373	Shelter Cross-check	https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/shelter	\N	manual	f	f	f	\N	\N	htmltask	stage1,html	{}		\N	\N	\N
577	2020-09-28 15:57:47.386043	2020-09-28 15:57:47.386043	Gem Puzzle	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/gem-pazzle/codejam-the-gem-puzzle.md	\N	manual	f	f	f	\N	\N	jstask	stage2	{}		\N	\N	\N
578	2020-10-13 05:44:26.854548	2020-10-13 05:44:26.854548	AWS_task1	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task1-cloud-introduction/task.md	\N	manual	f	f	f	\N	\N	jstask	aws	{}		\N	\N	\N
579	2020-10-19 08:18:56.59736	2020-10-19 08:18:56.59736	AWS_task2	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task2-serve-spa-aws/task.md	\N	manual	f	f	f	\N	\N	jstask	aws	{}		\N	\N	\N
580	2020-10-26 11:34:32.421958	2020-10-26 11:34:32.421958	AWS-task3	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task3-product-api/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check	{}		\N	\N	\N
581	2020-11-02 14:50:19.794867	2020-11-02 14:50:19.794867	AWS-task4	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task4-rds/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check,nodejs	{}		\N	\N	\N
582	2020-11-12 16:52:45.903122	2020-11-12 16:52:45.903122	AWS_task5	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task5-import-to-s3/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check,js	{}		\N	\N	\N
583	2020-11-16 12:01:36.081559	2020-11-16 12:01:36.081559	AWS-task6	https://github.com/rolling-scopes-school/nodejs-aws-tasks/tree/main/task6-sqs-sns	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check,js,nodejs	{}		\N	\N	\N
584	2020-11-20 07:21:08.683763	2020-11-20 07:21:08.683763	RS Селекторы	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-css.md	\N	manual	f	f	f	\N	\N	jstask	js,stage2	{}		\N	\N	\N
585	2020-11-20 07:26:46.82712	2020-11-20 07:26:46.82712	RS Селекторы:Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-css.md	\N	manual	f	f	f	\N	\N	jstask	js,stage2	{}		\N	\N	\N
586	2020-11-24 09:22:01.197268	2020-11-24 09:22:01.197268	AWs_task7	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task7-lambda%2Bcognito-authorization/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,js,cross-check,nodejs	{}		\N	\N	\N
587	2020-12-01 12:57:37.039959	2020-12-01 12:57:37.039959	AWS_task8	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task8-docker-elastic-beanstalk/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check,nodejs	{}		\N	\N	\N
588	2020-12-08 20:21:00.816025	2020-12-08 20:21:00.816025	AWS_task9	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task9-bff/task.md	\N	manual	f	f	f	\N	\N	jstask	aws ,cross-check,nodejs	{}		\N	\N	\N
589	2020-12-11 12:19:08.377006	2020-12-18 19:53:01.805815	COVID-19 Dashboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/covid-dashboard.md	\N	manual	f	f	f	\N	\N	jstask	js,stage2	{}		\N	\N	\N
590	2020-12-11 12:20:12.955324	2020-12-18 19:53:15.107973	COVID-19 Dashboard:Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/covid-dashboard.md	\N	manual	f	f	f	\N	\N	jstask	js,stage2	{}		\N	\N	\N
591	2020-12-16 11:22:13.348836	2020-12-16 11:22:13.348836	AWS_feedback_build_plan	https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/feedback_and_possible_plan.me	\N	manual	f	f	f	\N	\N	jstask	js,nodejs,aws	{}		\N	\N	\N
592	2020-12-19 12:43:52.804419	2021-05-19 02:54:47.307367	Codewars #0	https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/codewars	\N	auto	f	f	f	\N	\N	jstask	js,codewars,stage0	{}		\N	\N	\N
594	2020-12-19 12:49:31.14823	2021-03-07 16:21:45.593427	Wildlife	https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/wildlife	\N	manual	f	f	f	\N	\N	htmltask	stage0,html	{}		\N	\N	\N
595	2020-12-26 18:31:32.147857	2021-03-06 10:31:15.424715	HTML/CSS Test #0	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	stage0	{}		\N	\N	\N
597	2020-12-26 18:33:44.873478	2021-06-30 16:38:02.096425	RSS Test	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	stage0	{}		\N	\N	\N
598	2021-01-14 16:07:51.521813	2021-01-14 16:07:51.521813	ST Extra curry	https://observablehq.com/@shastel/functions-and-arguments	\N	manual	f	f	f	\N	\N	jstask	st	{}		\N	\N	\N
599	2021-01-16 07:15:35.629304	2021-01-16 07:15:35.629304	RS Clone	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rsclone/rsclone.md	\N	manual	f	f	f	\N	\N	jstask	stage2	{}		\N	\N	\N
600	2021-01-18 20:37:27.531064	2021-01-18 20:37:27.531064	Angular. RS Lang	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular-new/angular-rslang.md	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
601	2021-01-18 20:44:09.805032	2021-04-07 09:35:44.904556	Angular. RS Lang: Cross-Check	https://rs-lang-cross-check.netlify.app/	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
602	2021-01-21 12:47:14.940104	2021-01-21 12:47:14.940104	Test	https://github.com/yuliaHope/rsschool-api/tree/feature/S-9-implement-adding-task/client/src/components/Forms	\N	manual	f	f	f	\N	\N	kotlintask		{}		\N	\N	\N
603	2021-01-21 17:00:47.237938	2021-01-21 17:00:47.237938	[EXTRA] Custom addEventListener	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/5.-%5BEXTRA%5D-Custom-addEventListener	\N	manual	f	f	f	\N	\N	jstask	ST	{}		\N	\N	\N
604	2021-01-22 13:36:10.256772	2021-01-24 12:53:00.085111	Pandas data manipulations	https://github.com/rolling-scopes-school/ml-intro/blob/2021/1_data_manipulations/Pandas_data_manipulations.ipynb	\N	auto	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
605	2021-02-01 14:35:31.761066	2021-02-01 14:35:31.761066	2 - Linear Regression and Visualization	https://github.com/rolling-scopes-school/ml-intro/blob/2021/2_linear_regression/seminar_and_homework.ipynb	\N	manual	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
606	2021-02-01 16:45:01.840662	2021-02-01 16:45:01.840662	ST Load	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Load	\N	manual	f	f	f	\N	\N	jstask	ST	{}		\N	\N	\N
607	2021-02-03 16:51:09.09653	2021-02-03 16:51:09.09653	Things 1	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/7.-Things-BE-v1	\N	manual	f	f	f	\N	\N	jstask	ST	{}		\N	\N	\N
608	2021-02-11 08:44:07.456369	2021-02-11 08:44:07.456369	3 - Overfitting and Regularization	https://github.com/rolling-scopes-school/ml-intro/tree/2021/3_overfitting_regularization	\N	manual	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
609	2021-02-13 18:01:57.191651	2021-02-13 18:01:57.191651	RS Clone Presentation	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rsclone/rsclone.md	\N	manual	f	f	f	\N	\N	jstask	stage2	{}		\N	\N	\N
610	2021-02-15 10:58:06.20701	2021-02-15 10:58:06.20701	3- Quiz Overfitting and Regularization	https://docs.google.com/forms/d/e/1FAIpQLSe_QHNj_mHGQ3afxBLny2o3CeiE7kZbo41-Aco_gjbLq_J8_Q/viewform?usp=sf_link	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
611	2021-02-15 17:32:15.694641	2021-02-15 17:32:15.694641	4 - Feature Engineering and Selection	https://github.com/rolling-scopes-school/ml-intro/blob/2021/4_feature_engineering_selection/feature_engineering_selection.ipynb	\N	manual	f	f	f	\N	\N	ipynb		{}		\N	\N	\N
612	2021-02-17 10:39:01.421981	2021-02-17 10:39:01.421981	React Game	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-game.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
613	2021-02-28 06:57:22.138546	2021-02-28 11:51:23.17022	5 - Classification Linear KNN (Part 1)	https://github.com/rolling-scopes-school/ml-intro/tree/2021/5_classification_linear_knn	\N	manual	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
614	2021-03-01 10:33:03.991004	2021-03-01 10:33:03.991004	5 - Quiz Classification Linear KNN	https://docs.google.com/forms/d/e/1FAIpQLScJ3iEMm756uQq7JcNia9WMaUe6Dm1XkMjEHqKHrxgS6TLjpg/closedform	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
615	2021-03-02 11:26:52.273548	2021-03-02 11:26:52.273548	Номер макета Online Zoo	https://rolling-scopes-school.github.io/roadmap/#/stage1/tasks/online-zoo	\N	manual	f	f	f	\N	\N	test	stage1,online zoo	{}		\N	\N	\N
616	2021-03-04 14:36:26.155447	2021-03-04 14:36:26.155447	Travel App	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/travel-app.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
617	2021-03-05 11:09:19.040392	2021-03-05 11:09:19.040392	5 - Classification Linear KNN (Part 2)	https://github.com/rolling-scopes-school/ml-intro/blob/2021/5_classification_linear_knn/seminar.ipynb	\N	manual	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
618	2021-03-05 11:17:02.022234	2021-03-05 11:17:02.022234	6 - Trees and Ensembles	https://github.com/rolling-scopes-school/ml-intro/blob/2021/6_trees%20and%20ensembles/rf_classifier.ipynb	\N	manual	f	f	f	\N	\N	ipynb	Python,Pandas	{}		\N	\N	\N
619	2021-03-05 11:18:59.536474	2021-03-05 11:18:59.536474	6 - Quiz Trees and Ensembles	https://forms.gle/QppfozwckCZMoPhC8	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
620	2021-03-05 16:59:00.627541	2021-03-05 16:59:00.627541	ST Last checkpoint	https://docs.google.com/spreadsheets/d/19G_U4gPsuC6L2NjGoanGRGU2-cc6y6b1y8iZcDMF2fI/edit?usp=sharing	\N	manual	f	f	f	\N	\N	stage-interview	ST	{}		\N	\N	\N
621	2021-03-06 16:09:14.287858	2021-03-06 16:09:40.434646	7 - Clustering and Dimensionality Reduction	https://github.com/rolling-scopes-school/ml-intro/blob/2021/7_clustering/clustering.ipynb	\N	manual	f	f	f	\N	\N	ipynb	Python,Pandas	{}		\N	\N	\N
622	2021-03-06 16:13:05.067733	2021-03-06 16:13:23.274674	7 - Quiz Clustering and Dimensionality Reduction	https://forms.gle/bzBPEtnyuA347dJD7	\N	manual	f	f	f	\N	\N	test		{}		\N	\N	\N
623	2021-03-11 11:04:08.681819	2021-03-11 11:04:08.681819	[Test] Virtual Piano	https://github.com/rolling-scopes-school/stage1/blob/main/tasks/virtual-piano.md	\N	manual	f	f	f	\N	\N	jstask	test	{}		\N	\N	\N
624	2021-03-12 18:25:36.803679	2021-03-12 18:25:36.803679	Markdown & Git (EN)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-markdown.md	\N	manual	f	f	f	\N	\N	cv:markdown	stage0	{}		\N	\N	\N
625	2021-03-16 04:32:02.049634	2021-03-22 08:10:06.849863	Virtual-piano	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/js-projects/virtual-piano	\N	manual	f	f	f	\N	\N	jstask	stage1	{}		\N	\N	\N
626	2021-03-16 10:32:32.861577	2021-03-16 11:47:39.420121	Git test (EN)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/test-git	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt,stage0,test	{}		\N	\N	\N
627	2021-03-19 15:38:13.638778	2021-03-19 15:38:13.638778	React. RS Lang	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-rslang.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
628	2021-03-19 15:39:27.503723	2021-07-13 02:18:41.256448	React. Team Task	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/tba.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
629	2021-03-25 06:58:19.94643	2021-03-25 06:58:19.94643	8 - Quiz model evaluation and selection	https://forms.gle/zTMLDLiFCMXijrJC9	\N	auto	f	f	f	\N	\N	test		{}		\N	\N	\N
630	2021-03-29 09:18:15.128409	2021-03-29 09:18:15.128409	Clean-code-s1e1	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/clean-code/clean-code-s1e1	\N	manual	t	f	f	clean-code-s1e1	\N	htmltask	stage1,html,clean-code	{}		\N	\N	\N
631	2021-03-29 19:46:38.437531	2021-04-18 16:08:11.754724	online-zoo-w-12-v-1	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
632	2021-03-29 19:47:22.348097	2021-04-18 16:08:03.65834	online-zoo-w-12-v-2	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
633	2021-03-29 19:49:52.753381	2021-04-18 16:07:55.984858	online-zoo-w-12-v-3	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
634	2021-03-29 19:51:44.40457	2021-04-18 16:07:43.996559	online-zoo-w-12-v-4	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
635	2021-03-29 19:52:09.987412	2021-04-18 16:07:33.660824	online-zoo-w-12-v-5	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
636	2021-03-29 19:53:19.216383	2021-04-18 16:07:24.592728	online-zoo-w-12-v-6	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
637	2021-03-30 18:22:15.783273	2021-07-13 07:27:31.217997	webdev (EN)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/webdev-en.md	\N	manual	f	f	f	\N	\N	htmltask	stage1,rs-lt,rs-ge	{}		\N	\N	\N
638	2021-04-01 13:43:15.969162	2021-04-01 13:43:15.969162	Final competition	https://www.kaggle.com/c/rss-top-performers-prediction	\N	manual	f	f	f	\N	\N	ipynb	Pandas,Python	{}		\N	\N	\N
639	2021-04-01 14:29:52.270971	2021-04-01 14:37:09.388365	ST 2021	https://github.com/rkhaslarov/rs-school-short-track-2021	\N	auto	f	f	f	rs-school-short-track-2021	https://github.com/rkhaslarov/rs-school-short-track-2021	jstask		{}		\N	\N	\N
640	2021-04-03 10:32:13.92427	2021-07-13 07:34:45.184634	Html/Css test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt,rs-ge	{}		\N	\N	\N
641	2021-04-07 20:42:10.851958	2021-04-22 12:21:36.749143	Clean-code: Test for generic principles	https://rolling-scopes-school.github.io/stage0/#/stage1/tests/clean-code-generic-principles-test	\N	auto	f	f	f	\N	\N	selfeducation	clean-code,test,stage1	{}		\N	\N	\N
642	2021-04-12 06:51:48.539525	2021-04-12 07:43:02.439332	Self-Introduction	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/self-introduction/self-introduction	\N	manual	f	f	f	\N	\N	htmltask	cross-check,self-presentation,stage1	{}		\N	\N	\N
643	2021-04-13 08:16:49.145559	2021-04-14 05:52:03.673776	Semantic. CSS3 test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
644	2021-04-13 08:36:33.949389	2021-07-21 07:16:52.562083	Flex / Grid test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt,rs-ge	{}		\N	\N	\N
645	2021-04-18 16:09:38.619468	2021-04-18 16:09:38.619468	online-zoo-w-34-v-1	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
646	2021-04-18 16:10:17.054588	2021-04-18 16:10:17.054588	online-zoo-w-34-v-2	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
647	2021-04-18 16:10:46.756453	2021-04-18 16:10:46.756453	online-zoo-w-34-v-3	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
648	2021-04-18 16:11:15.864407	2021-04-18 16:11:15.864407	online-zoo-w-34-v-4	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
649	2021-04-18 16:11:48.247653	2021-04-18 16:11:48.247653	online-zoo-w-34-v-5	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
650	2021-04-18 16:12:18.705378	2021-04-18 16:12:18.705378	online-zoo-w-34-v-6	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
651	2021-04-19 17:07:46.148707	2021-07-22 08:30:46.745826	theyalow (LT)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/theyalow-en(LT).md	\N	manual	f	f	f	\N	\N	htmltask	rs-lt,rs-ge	{}		\N	\N	\N
652	2021-04-20 07:22:34.80059	2021-04-20 07:22:34.80059	photo-filter	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/js-projects/photo-filter	\N	manual	f	f	f	\N	\N	jstask	stage1	{}		\N	\N	\N
653	2021-04-27 17:54:11.564999	2021-05-04 07:36:17.722256	JS Basics test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
654	2021-05-02 14:17:32.626997	2021-05-02 14:53:39.585606	Debug in Node.js	https://example.com	\N	manual	f	f	f	\N	\N	jstask	nodejs,cross-check	{}		\N	\N	\N
655	2021-05-02 14:18:45.971414	2021-05-28 15:42:33.722491	Typescript basics	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-4-typescript-basics	\N	manual	f	f	f	\N	\N	jstask	nodejs,typescript,cross-check	{}		\N	\N	\N
656	2021-05-02 14:19:28.225416	2021-06-06 20:25:53.6616	Docker Basics	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-6-docker-basics	\N	manual	f	f	f	\N	\N	jstask	nodejs,docker,cross-check	{}		\N	\N	\N
657	2021-05-02 14:20:16.880508	2021-06-20 19:16:52.578078	PostgreSQL + Typeorm	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-7-postgresql--typeorm	\N	manual	f	f	f	\N	\N	jstask	nodejs,cross-check	{}		\N	\N	\N
658	2021-05-02 14:20:42.825012	2021-06-27 20:09:12.145094	Nest.js	https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-9-nestjs	\N	manual	f	f	f	\N	\N	jstask	nodejs,cross-check	{}		\N	\N	\N
659	2021-05-03 13:53:09.236679	2021-05-06 15:57:35.606074	rs.ios.objc.task1	https://github.com/rolling-scopes-school/rs.ios.stage-task1/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task1	https://github.com/rolling-scopes-school/rs.ios.stage-task1	objctask	stage1	{}		\N	\N	\N
660	2021-05-03 13:54:27.780527	2021-05-13 16:58:24.194514	rs.ios.objc.task2	https://github.com/rolling-scopes-school/rs.ios.stage-task2/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task2	https://github.com/rolling-scopes-school/rs.ios.stage-task2	objctask	stage1	{}		\N	\N	\N
661	2021-05-03 13:55:39.123913	2021-05-20 14:39:27.068753	rs.ios.objc.task3	https://github.com/rolling-scopes-school/rs.ios.stage-task3/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task3	https://github.com/rolling-scopes-school/rs.ios.stage-task3	objctask	stage1	{}		\N	\N	\N
662	2021-05-03 16:10:49.681267	2021-05-03 16:10:49.681267	test	http://www.google.com	\N	manual	f	f	f	\N	\N	stage-interview	test	{}		\N	\N	\N
663	2021-05-04 08:37:07.553302	2021-05-07 14:34:18.073106	JS Functions test	https://example.com	\N	manual	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
664	2021-05-04 12:37:05.984112	2021-05-04 12:38:54.504325	online-zoo-w-56-v-1	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
665	2021-05-04 12:37:39.756077	2021-05-04 12:39:05.223097	online-zoo-w-56-v-2	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
666	2021-05-04 12:38:10.637801	2021-05-04 12:39:17.704872	online-zoo-w-56-v-3	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
667	2021-05-04 12:38:38.846279	2021-05-04 12:39:32.750323	online-zoo-w-56-v-4	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
668	2021-05-04 12:39:52.288354	2021-05-04 12:39:52.288354	online-zoo-w-56-v-5	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
669	2021-05-04 12:41:25.656806	2021-05-04 12:41:25.656806	online-zoo-w-56-v-6	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6	\N	manual	f	f	f	\N	\N	htmltask	stage1,online zoo	{}		\N	\N	\N
670	2021-05-06 10:30:29.740685	2021-05-06 10:30:29.740685	JS Functions test part 2	https://example.com	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
671	2021-05-07 11:31:44.518467	2021-05-07 11:31:44.518467	Codewars #2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars2.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
672	2021-05-13 08:22:31.158757	2021-05-13 08:22:31.158757	Calculator(LT)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator(LT).md	\N	manual	f	f	f	\N	\N	jstask	rs-lt	{}		\N	\N	\N
673	2021-05-16 13:31:42.307849	2021-05-16 13:31:42.307849	ST Deep Copy	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/2.-Deep-copy	\N	manual	f	f	f	\N	\N	jstask	ST	{}		\N	\N	\N
674	2021-05-19 06:11:22.765584	2021-05-19 06:11:22.765584	Interview(LT)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage1-interview(LT).md	\N	manual	f	f	f	\N	\N	interview	rs-lt,stage1,interview	{}		\N	\N	\N
675	2021-05-19 16:14:25.053477	2021-05-19 16:14:25.053477	ST Checkpoint 1	https://example.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
676	2021-05-20 05:51:02.732991	2021-05-20 05:51:02.732991	DOM API	https://example.com	\N	auto	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
677	2021-05-20 12:01:17.704883	2021-05-20 12:01:17.704883	online-zoo	https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/online-zoo	\N	auto	f	f	f	\N	\N	htmltask	stage1,online zoo,html,css,js	{}		\N	\N	\N
678	2021-05-21 13:36:43.887646	2021-05-21 13:36:43.887646	Android 2021 - Practice 1 - Randomizer	https://github.com/rolling-scopes-school/rsschool2021-Android-task-randomizer	\N	manual	f	f	f	\N	\N	kotlintask	Android,Kotlin,stage1	{}		\N	\N	\N
679	2021-05-26 14:01:27.071863	2021-05-26 14:01:27.071863	Match-Match Game	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/match-match-game.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,TypeScript	{}		\N	\N	\N
680	2021-05-26 14:30:24.634918	2021-05-26 14:30:24.634918	Async Race	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/async-race.md	\N	manual	\N	f	f	\N	\N	JS task		{}		\N	\N	\N
681	2021-06-03 15:43:16.636933	2021-06-10 17:00:13.376693	rs.ios.swift.task4	https://github.com/rolling-scopes-school/rs.ios.stage-task4/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task4	https://github.com/rolling-scopes-school/rs.ios.stage-task4	objctask	stage2	{}		\N	\N	\N
682	2021-06-03 17:00:30.151954	2021-06-11 08:11:45.792399	Inheritance Test (LT)	https://example.com	\N	manual	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
683	2021-06-08 15:08:20.85744	2021-06-08 15:08:20.85744	ST Checkpoint 2	https://example.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
684	2021-06-09 13:27:53.269173	2021-06-09 13:27:53.269173	Android 2021 - Practice 2 - Quiz	https://github.com/rolling-scopes-school/rsschool2021-Android-task-quiz	\N	manual	f	f	f	\N	\N	kotlintask	stage1,Android,Kotlin,cross-check	{}		\N	\N	\N
685	2021-06-10 08:08:46.270232	2021-06-10 08:09:09.092384	ST CRP course	https://www.udacity.com/course/website-performance-optimization--ud884	\N	manual	f	f	f	\N	\N	htmltask	st	{}		\N	\N	\N
686	2021-06-10 16:51:59.094555	2021-06-10 17:05:58.337933	rs.ios.swift.task5	https://github.com/rolling-scopes-school/rs.ios.stage-task5/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task5	https://github.com/rolling-scopes-school/rs.ios.stage-task5	objctask	stage2	{}		\N	\N	\N
687	2021-06-10 18:57:54.547085	2021-06-10 18:57:54.547085	Async test	https://example.com	\N	manual	f	f	f	\N	\N	selfeducation	rs-lt	{}		\N	\N	\N
688	2021-06-11 08:03:40.16882	2021-06-11 08:03:40.16882	Async Race. Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/async-race.md#cross-check	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check	{}		\N	\N	\N
689	2021-06-17 16:48:43.28106	2021-06-17 16:48:43.28106	rs.ios.swift.task6	https://github.com/rolling-scopes-school/rs.ios.stage-task6/blob/main/README.md	\N	auto	f	f	f	rs.ios.stage-task6	https://github.com/rolling-scopes-school/rs.ios.stage-task6	objctask	stage2	{}		\N	\N	\N
690	2021-06-20 16:40:22.899085	2021-06-22 14:18:21.578778	English for kids S1E1. Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,cross-check,stage2	{}		\N	\N	\N
691	2021-06-20 16:43:38.061004	2021-06-22 14:17:41.169677	Chess S1E1. Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-one.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,cross-check,stage2	{}		\N	\N	\N
692	2021-06-21 13:42:46.349301	2021-06-22 14:15:10.391564	English for kids S1E1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2	{}		\N	\N	\N
693	2021-06-21 13:43:09.688432	2021-06-22 14:17:13.581254	Chess S1E1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-one.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2	{}		\N	\N	\N
694	2021-06-22 14:19:43.29645	2021-06-22 14:19:43.29645	English for kids S1E2. Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,TypeScript,cross-check	{}		\N	\N	\N
695	2021-06-22 14:20:29.274537	2021-06-24 18:43:34.398904	Chess S1E2. Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2 ,cross-check	{}		\N	\N	\N
696	2021-06-22 14:22:03.421406	2021-06-22 14:22:03.421406	English for kids S1E2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2	{}		\N	\N	\N
697	2021-06-23 09:50:14.00401	2021-07-25 05:31:50.361822	Chess S1E2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2	{}		\N	\N	\N
698	2021-06-23 09:51:49.128203	2021-06-23 09:51:49.128203	English for kids S1E2. Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md	\N	manual	f	f	f	\N	\N	jstask	TypeScript,stage2 ,cross-check	{}		\N	\N	\N
699	2021-06-29 14:04:45.230899	2021-06-29 14:04:45.230899	rs.ios.crosscheck.task7	https://github.com/rolling-scopes-school/rs.ios.stage-task7	\N	manual	f	f	f	\N	\N	objctask	stage3	{}		\N	\N	\N
700	2021-07-02 16:38:03.731078	2021-07-02 16:38:03.731078	Codewars Data Types	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/data-types.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
701	2021-07-02 16:47:46.456174	2021-07-02 16:47:46.456174	Codewars Functions	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/functions.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
702	2021-07-02 16:52:48.911494	2021-07-02 16:52:48.911494	Codewars Objects & Arrays	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/objects-arrays.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
703	2021-07-02 16:58:40.753701	2021-07-02 16:58:40.753701	Codewars Algorithms-1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/algorithms-1.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
704	2021-07-02 17:04:13.971816	2021-07-03 12:37:16.362491	Codewars Algorithms-2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/algorithms-2.md	\N	auto	f	f	f	\N	\N	codewars	codewars	{}		\N	\N	\N
705	2021-07-04 19:19:47.54283	2021-07-04 19:19:47.54283	Android 2021 - Practice 3 - Pomodoro	https://github.com/rolling-scopes-school/RSShool2021-Android-task-Pomodoro	\N	manual	f	f	f	\N	\N	kotlintask	Android,Kotlin,stage1,cross-check	{}		\N	\N	\N
706	2021-07-05 08:13:38.447765	2021-07-05 08:13:38.447765	[ST] Checkpoint 3	https://example.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
707	2021-07-05 12:36:27.332959	2021-07-06 07:12:39.982334	Test HTML Basics [RU]	https://ru.code-basics.com/languages/html	\N	auto	f	f	f	\N	\N	selfeducation	html	{}		\N	\N	\N
708	2021-07-06 21:03:43.537339	2021-07-06 21:03:43.537339	HTML Quiz	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	html	{}		\N	\N	\N
709	2021-07-06 21:04:36.087632	2021-07-06 21:04:36.087632	CSS Quiz	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	css	{}		\N	\N	\N
710	2021-07-06 21:05:14.935484	2021-07-06 21:05:14.935484	JS Quiz	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	js	{}		\N	\N	\N
711	2021-07-06 21:05:58.610129	2021-07-06 21:06:08.839616	ReactJs Quiz	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	react	{}		\N	\N	\N
712	2021-07-09 09:50:48.828546	2021-07-09 09:50:48.828546	Angular Shop	https://github.com/rolling-scopes-school/tasks	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
713	2021-07-09 09:53:06.989516	2021-07-09 09:53:06.989516	Angular Shop. Cross-check	https://rs-lang-cross-check.netlify.app/	\N	manual	f	f	f	\N	\N	jstask	Angular	{}		\N	\N	\N
714	2021-07-12 16:39:31.049741	2021-07-12 16:39:31.049741	[ST] Final checkpoint	https://example.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
715	2021-07-13 01:56:27.706355	2021-07-21 02:05:29.234568	React. Components	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-components.md	\N	manual	f	f	f	\N	\N	jstask	react,js	{}		\N	\N	\N
716	2021-07-13 01:59:06.630799	2021-07-13 01:59:06.630799	React. Forms	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-forms.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
717	2021-07-13 01:59:57.193405	2021-07-13 01:59:57.193405	React. Redux	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-redux.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
718	2021-07-13 02:00:40.399879	2021-07-13 02:00:40.399879	React. Routing	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-routing.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
719	2021-07-13 02:01:22.630194	2021-07-13 02:01:22.630194	React. API	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-api.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
720	2021-07-13 02:02:18.901305	2021-07-13 02:02:18.901305	React. Testing	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-testing.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
721	2021-07-13 02:03:39.899612	2021-07-13 02:03:39.899612	React. SSR*	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-ssr.md	\N	manual	f	f	f	\N	\N	jstask	react	{}		\N	\N	\N
722	2021-07-13 11:51:08.864691	2021-07-13 11:51:08.864691	Git Quiz	https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index	\N	auto	f	f	f	\N	\N	selfeducation	git	{}		\N	\N	\N
723	2021-07-15 07:00:13.193068	2021-07-15 07:00:13.193068	English for kids( EN)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-translated.md	\N	manual	f	f	f	\N	\N	jstask	rs-lt,rs-ge,stage2	{}		\N	\N	\N
724	2021-07-15 07:18:55.566964	2021-07-15 13:08:12.925631	Test CSS Basics [RU]	https://ru.code-basics.com/languages/css	\N	manual	f	f	f	\N	\N	selfeducation	stage0	{}		\N	\N	\N
725	2021-07-15 16:07:15.120253	2021-07-15 16:07:15.120253	rs.ios.crosscheck.task8	https://github.com/rolling-scopes-school/rs.ios.stage-task8	\N	manual	f	f	f	\N	\N	objctask	stage3	{}		\N	\N	\N
726	2021-07-20 03:39:54.174636	2021-07-20 03:39:54.174636	Museum	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/museum/museum.md	\N	manual	f	f	f	\N	\N	htmltask	stage0,cross-check	{}		\N	\N	\N
727	2021-07-20 07:20:25.761953	2021-07-20 17:18:06.275459	Test Algorithms & Data structures	https://www.youtube.com/playlist?list=PLP-a1IHLCS7PqDf08LFIYCiTYY1CtoAkt	\N	manual	f	f	f	\N	\N	selfeducation	stage0,algorithms	{}		\N	\N	\N
728	2021-07-22 07:59:30.138616	2021-07-22 07:59:30.138616	[UZ] RS-lang Backend	https://example.com	\N	manual	f	f	f	\N	\N	jstask		{}		\N	\N	\N
729	2021-07-22 17:07:21.458164	2021-07-22 17:39:29.902012	Drum Kit	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-1.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
730	2021-07-22 17:08:05.196206	2021-07-22 17:08:05.196206	JS Clock	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-2.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
731	2021-07-22 17:08:44.272934	2021-07-22 17:08:44.272934	Vertical Slider	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-3.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
732	2021-07-22 17:09:31.573179	2021-07-22 17:35:00.094133	Video Speed Controller	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-4.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
733	2021-07-22 17:10:07.813794	2021-07-22 17:10:07.813794	Photofilter	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-5.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
734	2021-07-22 17:10:39.403863	2021-07-22 17:41:32.343542	Whack-A-Mole	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-6.md	\N	manual	f	f	f	\N	\N	jstask	stage0,js	{}		\N	\N	\N
735	2021-07-26 04:57:34.397304	2021-07-27 07:39:38.807563	Test JS Basics [RU]	https://ru.code-basics.com/languages/javascript	\N	manual	f	f	f	\N	\N	selfeducation	stage0	{}		\N	\N	\N
736	2021-07-27 20:49:41.263593	2021-07-27 20:49:41.263593	rs.ios.crosscheck.task9	https://github.com/rolling-scopes-school/rs.ios.stage-task9	\N	manual	f	f	f	\N	\N	objctask	stage3	{}		\N	\N	\N
498	2022-03-27 11:50:14.892444	2022-03-27 11:50:14.892444	test	https://example.com		\N	\N	f	f	\N	\N	Kotlin task		{}		\N	\N	\N
\.


--
-- Data for Name: task_artefact; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_artefact (id, "createdDate", "updatedDate", "courseTaskId", "studentId", "videoUrl", "presentationUrl", comment) FROM stdin;
\.


--
-- Data for Name: task_checker; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_checker (id, "createdDate", "updatedDate", "courseTaskId", "studentId", "mentorId") FROM stdin;
\.


--
-- Data for Name: task_criteria; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_criteria ("taskId", "createdDate", "updatedDate", criteria) FROM stdin;
\.


--
-- Data for Name: task_interview_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_interview_result (id, "createdDate", "updatedDate", "courseTaskId", "studentId", "mentorId", "formAnswers", score, comment) FROM stdin;
\.


--
-- Data for Name: task_interview_student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_interview_student (id, "createdDate", "updatedDate", "studentId", "courseId", "courseTaskId") FROM stdin;
\.


--
-- Data for Name: task_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_result (id, "createdDate", "updatedDate", "githubPrUrl", "githubRepoUrl", score, comment, "studentId", "courseTaskId", "historicalScores", "juryScores", "lastCheckerId") FROM stdin;
78642	2021-07-28 21:18:25.107083	2021-07-28 21:18:25.107083	\N	\N	500	Very good task solution! I like it!	14337	979	[{"authorId":2595,"score":500,"dateTime":1627507105089,"comment":"Very good task solution! I like it!"}]	[]	2595
78643	2021-07-28 21:18:35.624298	2021-07-28 21:18:35.624298	\N	\N	700	Very good task solution! I like it!	14340	979	[{"authorId":2595,"score":700,"dateTime":1627507115622,"comment":"Very good task solution! I like it!"}]	[]	2595
78644	2021-07-28 21:18:45.007131	2021-07-28 21:18:45.007131	\N	\N	45	Very good task solution! I like it!	14346	929	[{"authorId":2595,"score":45,"dateTime":1627507124998,"comment":"Very good task solution! I like it!"}]	[]	2595
78645	2021-07-28 21:18:57.747085	2021-07-28 21:18:57.747085	\N	\N	120	Very good task solution! I like it!	14337	945	[{"authorId":2595,"score":120,"dateTime":1627507137729,"comment":"Very good task solution! I like it!"}]	[]	2595
78646	2021-07-28 21:19:25.513612	2021-07-28 21:19:25.513612	\N	\N	355	Very good task solution! I like it!	14340	981	[{"authorId":2595,"score":355,"dateTime":1627507165497,"comment":"Very good task solution! I like it!"}]	[]	2595
78647	2021-07-28 21:19:35.132131	2021-07-28 21:19:35.132131	\N	\N	360	Very good task solution! I like it!	14340	977	[{"authorId":2595,"score":360,"dateTime":1627507175130,"comment":"Very good task solution! I like it!"}]	[]	2595
78648	2021-07-28 21:19:42.924362	2021-07-28 21:19:42.924362	\N	\N	160	Very good task solution! I like it!	14340	928	[{"authorId":2595,"score":160,"dateTime":1627507182916,"comment":"Very good task solution! I like it!"}]	[]	2595
78649	2021-07-28 21:19:58.344963	2021-07-28 21:19:58.344963	\N	\N	160	Very good task solution! I like it!	14346	928	[{"authorId":2595,"score":160,"dateTime":1627507198326,"comment":"Very good task solution! I like it!"}]	[]	2595
78650	2021-07-28 21:21:53.845892	2021-07-28 21:21:53.845892	\N	\N	100	Very good task. I like it! Keep going!	14340	864	[{"authorId":2595,"score":100,"dateTime":1627507313823,"comment":"Very good task. I like it! Keep going!"}]	[]	2595
78651	2021-07-28 21:22:01.000726	2021-07-28 21:22:01.000726	\N	\N	355	Very good task. I like it! Keep going!	14346	981	[{"authorId":2595,"score":355,"dateTime":1627507320974,"comment":"Very good task. I like it! Keep going!"}]	[]	2595
\.


--
-- Data for Name: task_solution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_solution (id, "createdDate", "updatedDate", "courseTaskId", "studentId", url, review, comments) FROM stdin;
3330	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14327	https://example.com	[]	[]
3331	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14328	https://example.com	[]	[]
3332	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14329	https://example.com	[]	[]
3333	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14330	https://example.com	[]	[]
3334	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14331	https://example.com	[]	[]
3335	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14332	https://example.com	[]	[]
3336	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14333	https://example.com	[]	[]
3337	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14334	https://example.com	[]	[]
3338	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14335	https://example.com	[]	[]
3339	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14336	https://example.com	[]	[]
\.


--
-- Data for Name: task_solution_checker; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_solution_checker (id, "createdDate", "updatedDate", "courseTaskId", "taskSolutionId", "studentId", "checkerId") FROM stdin;
11568	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3336	14333	14332
11569	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3337	14334	14327
11570	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3338	14335	14334
11571	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3332	14329	14335
11572	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3335	14332	14336
11573	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3334	14331	14330
11574	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3339	14336	14329
11575	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3331	14328	14331
11576	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3333	14330	14333
11577	2020-09-24 18:55:51.350257	2020-09-24 18:55:51.350257	386	3330	14327	14328
\.


--
-- Data for Name: task_solution_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_solution_result (id, "createdDate", "updatedDate", "courseTaskId", "studentId", "checkerId", score, "historicalScores", comment, anonymous, review, messages) FROM stdin;
10812	2020-09-24 18:57:05.786416	2020-09-24 18:57:05.786416	386	14334	14327	50	[{"score":50,"comment":"50 points.\\n\\n+10 - blah-blah-blah\\n+20 - blah-blah-blah\\n+30 - blah-blah-blah","anonymous":false,"authorId":11563,"dateTime":1600973825778}]	50 points.\n\n+10 - blah-blah-blah\n+20 - blah-blah-blah\n+30 - blah-blah-blah	f	[]	[]
\.


--
-- Data for Name: task_verification; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_verification (id, "createdDate", "updatedDate", "studentId", "courseTaskId", details, status, score, metadata, answers) FROM stdin;
\.


--
-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.team (id, name, description, "chatLink", password, "teamDistributionId", "teamLeadId") FROM stdin;
\.


--
-- Data for Name: team_distribution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.team_distribution (id, "createdDate", "updatedDate", "courseId", "startDate", "endDate", name, description, "minTotalScore", "descriptionUrl", "minTeamSize", "maxTeamSize", "strictTeamSize", "strictTeamSizeMode") FROM stdin;
\.


--
-- Data for Name: team_distribution_student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.team_distribution_student (id, "createdDate", "updatedDate", "studentId", "courseId", "teamDistributionId", distributed, active) FROM stdin;
\.


--
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.typeorm_metadata (type, database, schema, "table", name, value) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public."user" (id, "githubId", "firstName", "lastName", "createdDate", "updatedDate", "firstNameNative", "lastNameNative", "tshirtSize", "tshirtFashion", "dateOfBirth", "locationName", "locationId", "educationHistory", "employmentHistory", "contactsEpamEmail", "contactsPhone", "contactsEmail", "externalAccounts", "epamApplicantId", activist, "englishLevel", "lastActivityTime", "isActive", "primaryEmail", "contactsTelegram", "contactsSkype", "contactsNotes", "aboutMyself", "contactsLinkedIn", "profilePermissionsId", "countryName", "cityName", "opportunitiesConsent", "cvLink", "militaryService", discord, "providerUserId", provider, "contactsWhatsApp") FROM stdin;
11563	apalchys			2020-04-06 15:12:34.19737	2020-04-06 15:15:02.729722	\N	\N	\N	\N	\N	\N	\N	[]	[]	\N	\N	\N	[]	\N	f	\N	1586185954173	t	test@example.com	\N	\N	\N	\N	\N	\N	Belarus	Minsk	f	\N	\N	\N	11563	github	\N
2693	viktoriyavorozhun	\N	\N	2019-04-24 13:42:45.500139	2019-10-18 08:07:58.858658	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2693	github	\N
2098	yauhenkavalchuk	\N	\N	2019-04-17 11:41:21.396686	2019-11-12 11:22:33.350237	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567594678450	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2098	github	\N
2103	shastel	\N	\N	2019-04-17 11:41:21.396686	2020-03-28 19:57:33.715031	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1566996696787	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2103	github	\N
5481	alreadybored	\N	\N	2019-09-09 17:27:41.909149	2020-03-22 14:10:37.252351	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568050061907	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	5481	github	\N
2115	rootthelure	\N	\N	2019-04-17 11:41:21.396686	2019-06-10 14:20:21.551616	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2115	github	\N
2480	pavelrazuvalau	\N	\N	2019-04-17 11:41:21.396686	2019-11-05 16:52:28.602784	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567072599465	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2480	github	\N
2612	dmitryromaniuk	\N	\N	2019-04-24 13:42:44.206396	2019-12-26 08:27:30.060107	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2612	github	\N
10031	artem-bagritsevich	\N	\N	2020-02-11 08:38:35.202688	2020-03-05 11:50:05.118784	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1581410315197	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	10031	github	\N
2032	mikhama	\N	\N	2019-04-17 11:41:21.396686	2020-02-24 09:36:43.272628	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567578141812	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2032	github	\N
1328	davojta	\N	\N	2019-04-17 11:41:21.396686	2019-09-07 04:28:42.419938	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567830522415	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	1328	github	\N
3961	sergeyshalyapin	\N	\N	2019-05-15 14:49:46.402468	2020-02-12 08:17:55.231843	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	3961	github	\N
4476	abramenal	\N	\N	2019-09-02 12:28:32.979516	2020-03-01 21:13:30.351302	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1567427312977	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	4476	github	\N
10130	sixtyxi	\N	\N	2020-02-13 11:35:19.12045	2020-02-13 11:35:19.12045	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1581593719117	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	10130	github	\N
7485	rootical	\N	\N	2019-12-19 12:07:57.161662	2020-03-05 18:51:41.896803	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1576757277159	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	7485	github	\N
606	irinainina	\N	\N	2019-04-17 11:41:21.396686	2019-08-28 17:19:48.460791	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567012788456	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	606	github	\N
2595	anik188	\N	\N	2019-04-24 13:42:43.967659	2020-03-06 15:43:33.384469	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	t	a1	1567423260809	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2595	github	\N
6776	ksenia-mahilnaya	\N	\N	2019-09-17 11:16:55.976071	2019-09-17 12:19:51.740451	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568719015974	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	6776	github	\N
1090	pulya10c	\N	\N	2019-04-17 11:41:21.396686	2019-09-13 10:21:35.108464	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567492440483	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	1090	github	\N
4428	egngron	\N	\N	2019-08-06 12:06:24.920343	2019-08-06 12:06:24.920343	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	4428	github	\N
4749	studentluffi	\N	\N	2019-09-09 10:09:09.275849	2019-09-09 10:09:28.91177	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568023749273	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	4749	github	\N
587	sijioth	\N	\N	2019-04-17 11:41:21.396686	2019-06-10 14:20:03.059291	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	587	github	\N
2084	dzmitry-varabei	\N	\N	2019-04-17 11:41:21.396686	2019-09-05 10:13:27.273815	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567678407268	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2084	github	\N
2444	toshabely	\N	\N	2019-04-17 11:41:21.396686	2019-08-22 11:56:20.531337	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2444	github	\N
2277	anv21	\N	\N	2019-04-17 11:41:21.396686	2020-01-18 11:47:48.686227	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567683807154	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2277	github	\N
3493	humanamburu	\N	\N	2019-04-25 06:42:53.208093	2019-09-24 11:22:04.181665	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	3493	github	\N
2549	kvtofan	\N	\N	2019-04-17 11:41:21.396686	2019-09-24 14:56:49.229102	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1563521151921	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2549	github	\N
2089	yuliahope	\N	\N	2019-04-17 11:41:21.396686	2019-08-29 11:15:32.412097	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1566418583423	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	2089	github	\N
677	amoebiusss	Test 1	Last Name	2019-04-17 11:41:21.396686	2020-04-06 15:30:27.059612	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1568012639853	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N	677	github	\N
11569	valerydluski	name	last name	2020-04-06 15:12:34.19737	2023-02-03 08:38:45.621748	\N	\N	\N	\N	\N	Minsk	12158	[]	[]	example_mail@epam.com	+325155534711	hello@example.com	[]	\N	f	b2	1586185954173	t	test@example.com	\N	\N	\N	\N	\N	\N	Belarus	Minsk	t	\N	\N	\N	12341	github	\N
\.


--
-- Data for Name: user_group; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.user_group (id, "createdDate", "updatedDate", name, users, roles) FROM stdin;
1	2023-02-02 14:53:58.798684	2023-02-02 14:53:58.798684	dementors	{2098,2103,5481}	{dementor}
\.


--
-- Name: alert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.alert_id_seq', 1, false);


--
-- Name: certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.certificate_id_seq', 590, true);


--
-- Name: consent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.consent_id_seq', 1, false);


--
-- Name: course_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_event_id_seq', 133, true);


--
-- Name: course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_id_seq', 25, true);


--
-- Name: course_manager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_manager_id_seq', 30, true);


--
-- Name: course_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_task_id_seq', 431, true);


--
-- Name: course_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_user_id_seq', 125, true);


--
-- Name: cv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.cv_id_seq', 1, false);


--
-- Name: discipline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.discipline_id_seq', 4, true);


--
-- Name: discord_server_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.discord_server_id_seq', 2, true);


--
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.event_id_seq', 224, true);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.feedback_id_seq', 615, true);


--
-- Name: history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.history_id_seq', 5, true);


--
-- Name: interview_question_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.interview_question_category_id_seq', 1, false);


--
-- Name: interview_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.interview_question_id_seq', 1, false);


--
-- Name: mentor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_id_seq', 1275, true);


--
-- Name: mentor_registry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_registry_id_seq', 289, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.migrations_id_seq', 47, true);


--
-- Name: private_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.private_feedback_id_seq', 65, true);


--
-- Name: profile_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.profile_permissions_id_seq', 115, true);


--
-- Name: registry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.registry_id_seq', 8955, true);


--
-- Name: repository_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.repository_event_id_seq', 1, false);


--
-- Name: resume_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.resume_id_seq', 1, true);


--
-- Name: stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_id_seq', 30, true);


--
-- Name: stage_interview_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_feedback_id_seq', 1234, true);


--
-- Name: stage_interview_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_id_seq', 10689, true);


--
-- Name: stage_interview_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_student_id_seq', 1091, true);


--
-- Name: student_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.student_feedback_id_seq', 136, true);


--
-- Name: student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.student_id_seq', 14346, true);


--
-- Name: task_artefact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_artefact_id_seq', 226, true);


--
-- Name: task_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_checker_id_seq', 4148, true);


--
-- Name: task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_id_seq', 498, true);


--
-- Name: task_interview_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_interview_result_id_seq', 627, true);


--
-- Name: task_interview_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_interview_student_id_seq', 1, false);


--
-- Name: task_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_result_id_seq', 78651, true);


--
-- Name: task_solution_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_checker_id_seq', 11577, true);


--
-- Name: task_solution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_id_seq', 3339, true);


--
-- Name: task_solution_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_result_id_seq', 10812, true);


--
-- Name: task_verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_verification_id_seq', 55459, true);


--
-- Name: team_distribution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.team_distribution_id_seq', 1, false);


--
-- Name: team_distribution_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.team_distribution_student_id_seq', 1, false);


--
-- Name: team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.team_id_seq', 1, false);


--
-- Name: user_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.user_group_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.user_id_seq', 11569, true);


--
-- Name: interview_question_category PK_023f8ae4bea4330f21df438399c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category
    ADD CONSTRAINT "PK_023f8ae4bea4330f21df438399c" PRIMARY KEY (id);


--
-- Name: interview_question_categories_interview_question_category PK_0557624b272acc8d39463763be1; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "PK_0557624b272acc8d39463763be1" PRIMARY KEY ("interviewQuestionId", "interviewQuestionCategoryId");


--
-- Name: stage_interview PK_06a48c907e0091d4082cfb003aa; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "PK_06a48c907e0091d4082cfb003aa" PRIMARY KEY (id);


--
-- Name: discipline PK_139512aefbb11a5b2fa92696828; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discipline
    ADD CONSTRAINT "PK_139512aefbb11a5b2fa92696828" PRIMARY KEY (id);


--
-- Name: private_feedback PK_14f0f39ae69058ce456dbd0d77f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "PK_14f0f39ae69058ce456dbd0d77f" PRIMARY KEY (id);


--
-- Name: registry PK_2eca29d55a9556d854416df8ce5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "PK_2eca29d55a9556d854416df8ce5" PRIMARY KEY (id);


--
-- Name: event PK_30c2f3bbaf6d34a55f8ae6e4614; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY (id);


--
-- Name: mentor_registry PK_3673050147cd9bc5c73d27512e3; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "PK_3673050147cd9bc5c73d27512e3" PRIMARY KEY (id);


--
-- Name: user_group PK_3c29fba6fe013ec8724378ce7c9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.user_group
    ADD CONSTRAINT "PK_3c29fba6fe013ec8724378ce7c9" PRIMARY KEY (id);


--
-- Name: student PK_3d8016e1cb58429474a3c041904; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY (id);


--
-- Name: team_distribution PK_432a4b1c8bfacae59140f6fcaf8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution
    ADD CONSTRAINT "PK_432a4b1c8bfacae59140f6fcaf8" PRIMARY KEY (id);


--
-- Name: stage_interview_student PK_43beb2b1cc5778fd367897b92e8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "PK_43beb2b1cc5778fd367897b92e8" PRIMARY KEY (id);


--
-- Name: task_artefact PK_43bf3d6d2510e22aac59085f0e0; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "PK_43bf3d6d2510e22aac59085f0e0" PRIMARY KEY (id);


--
-- Name: cv PK_4ddf7891daf83c3506efa503bb8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT "PK_4ddf7891daf83c3506efa503bb8" PRIMARY KEY (id);


--
-- Name: task_verification PK_5080be855b9d24b3d8e93ff425b; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "PK_5080be855b9d24b3d8e93ff425b" PRIMARY KEY (id);


--
-- Name: notification_channel PK_50b36f3daa5dd86f7e707740b23; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel
    ADD CONSTRAINT "PK_50b36f3daa5dd86f7e707740b23" PRIMARY KEY (id);


--
-- Name: task_interview_result PK_549c326d1e4b1c5b42eb915fa2f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "PK_549c326d1e4b1c5b42eb915fa2f" PRIMARY KEY (id);


--
-- Name: course_event PK_55e3af1e9fa10f21fc27fdc0852; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "PK_55e3af1e9fa10f21fc27fdc0852" PRIMARY KEY (id);


--
-- Name: student_teams_team PK_61c7be2163ef7fd885c6d6c8afc; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "PK_61c7be2163ef7fd885c6d6c8afc" PRIMARY KEY ("studentId", "teamId");


--
-- Name: task_result PK_623dd43986d67c74bad752b37a5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "PK_623dd43986d67c74bad752b37a5" PRIMARY KEY (id);


--
-- Name: student_feedback PK_62d4a9be66752e38bd228a78223; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "PK_62d4a9be66752e38bd228a78223" PRIMARY KEY (id);


--
-- Name: profile_permissions PK_63cefd76c1a42679af47a57eeba; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT "PK_63cefd76c1a42679af47a57eeba" PRIMARY KEY (id);


--
-- Name: notification_channel_settings PK_6464daee0ff1cf581129618bc8c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "PK_6464daee0ff1cf581129618bc8c" PRIMARY KEY ("notificationId", "channelId");


--
-- Name: task_solution_result PK_676aad5c32840e4c5d04a61300e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "PK_676aad5c32840e4c5d04a61300e" PRIMARY KEY (id);


--
-- Name: notification_user_settings PK_679cad5ff478ef93af7221fd98f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "PK_679cad5ff478ef93af7221fd98f" PRIMARY KEY ("notificationId", "userId", "channelId");


--
-- Name: task_criteria PK_6de018b8a8dbe8845ffe811ad20; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_criteria
    ADD CONSTRAINT "PK_6de018b8a8dbe8845ffe811ad20" PRIMARY KEY ("taskId");


--
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- Name: login_state PK_73bea2737e9230e18dc8dc1e7f2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.login_state
    ADD CONSTRAINT "PK_73bea2737e9230e18dc8dc1e7f2" PRIMARY KEY (id);


--
-- Name: task_solution PK_77bdef09a7686521e5bbc8247a9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "PK_77bdef09a7686521e5bbc8247a9" PRIMARY KEY (id);


--
-- Name: stage_interview_feedback PK_7cafd89ce6a6a3789de3912df21; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback
    ADD CONSTRAINT "PK_7cafd89ce6a6a3789de3912df21" PRIMARY KEY (id);


--
-- Name: resume PK_7ff05ea7599e13fac01ac812e48; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume
    ADD CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY (id);


--
-- Name: feedback PK_8389f9e087a57689cd5be8b2b13; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY (id);


--
-- Name: repository_event PK_861ff064ff09ee2e5bbae703649; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.repository_event
    ADD CONSTRAINT "PK_861ff064ff09ee2e5bbae703649" PRIMARY KEY (id);


--
-- Name: interview_question PK_87eb879ef299ec607aa30e9bd39; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question
    ADD CONSTRAINT "PK_87eb879ef299ec607aa30e9bd39" PRIMARY KEY (id);


--
-- Name: team_distribution_student PK_8a75ed7468b867aef47a7320188; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student
    ADD CONSTRAINT "PK_8a75ed7468b867aef47a7320188" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: certificate PK_8daddfc65f59e341c2bbc9c9e43; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY (id);


--
-- Name: consent PK_9115e8d6b082d4fc46d56134d29; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent
    ADD CONSTRAINT "PK_9115e8d6b082d4fc46d56134d29" PRIMARY KEY (id);


--
-- Name: history PK_9384942edf4804b38ca0ee51416; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.history
    ADD CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY (id);


--
-- Name: task_checker PK_999186887e14614c7cdf73b176e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "PK_999186887e14614c7cdf73b176e" PRIMARY KEY (id);


--
-- Name: mentor PK_9fcebd0a40237e9b6defcbd9d74; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "PK_9fcebd0a40237e9b6defcbd9d74" PRIMARY KEY (id);


--
-- Name: discord_server PK_a4db655f3e40126e5eed1769c90; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discord_server
    ADD CONSTRAINT "PK_a4db655f3e40126e5eed1769c90" PRIMARY KEY (id);


--
-- Name: course_task PK_aba6301a06559588941ae21b70c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "PK_aba6301a06559588941ae21b70c" PRIMARY KEY (id);


--
-- Name: alert PK_ad91cad659a3536465d564a4b2f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.alert
    ADD CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY (id);


--
-- Name: course_manager PK_b344e2b90017167035afd591a76; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "PK_b344e2b90017167035afd591a76" PRIMARY KEY (id);


--
-- Name: course_user PK_bb2c8374d6f04bf9301895d1b33; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "PK_bb2c8374d6f04bf9301895d1b33" PRIMARY KEY (id);


--
-- Name: task_solution_checker PK_bc32b5c4e5fb9602786de86594f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "PK_bc32b5c4e5fb9602786de86594f" PRIMARY KEY (id);


--
-- Name: course PK_bf95180dd756fd204fb01ce4916; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY (id);


--
-- Name: stage PK_c54d11b3c24a188262844af1612; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT "PK_c54d11b3c24a188262844af1612" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: student_team_distribution_team_distribution PK_cd9ddb2e8a915b54f5ab2612bc2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "PK_cd9ddb2e8a915b54f5ab2612bc2" PRIMARY KEY ("studentId", "teamDistributionId");


--
-- Name: task_interview_student PK_e01dbf882c881571c02d3e59bf2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "PK_e01dbf882c881571c02d3e59bf2" PRIMARY KEY (id);


--
-- Name: notification_user_connection PK_e7ab7a5154b15417e5ee0e31a3b; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "PK_e7ab7a5154b15417e5ee0e31a3b" PRIMARY KEY ("userId", "channelId");


--
-- Name: team PK_f57d8293406df4af348402e4b74; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY (id);


--
-- Name: task PK_fb213f79ee45060ba925ecd576e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY (id);


--
-- Name: task_solution UQ_098e2d5fb54138c4a090b2de0e5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "UQ_098e2d5fb54138c4a090b2de0e5" UNIQUE ("courseTaskId", "studentId");


--
-- Name: user UQ_0d84cc6a830f0e4ebbfcd6381dd; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_0d84cc6a830f0e4ebbfcd6381dd" UNIQUE ("githubId");


--
-- Name: stage_interview_student UQ_16e069fec7420cb8c9bce692360; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "UQ_16e069fec7420cb8c9bce692360" UNIQUE ("studentId", "courseId");


--
-- Name: profile_permissions UQ_28231d1cb8ceafd42ae9ed45db9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT "UQ_28231d1cb8ceafd42ae9ed45db9" UNIQUE ("userId");


--
-- Name: course UQ_30d559218724a6d6e0cc4f26b0e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "UQ_30d559218724a6d6e0cc4f26b0e" UNIQUE (name);


--
-- Name: interview_question_category UQ_40c79f8d86c0b762b849c8c0781; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category
    ADD CONSTRAINT "UQ_40c79f8d86c0b762b849c8c0781" UNIQUE (name);


--
-- Name: mentor_registry UQ_469871166ea5d53d181d63bba4d; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "UQ_469871166ea5d53d181d63bba4d" UNIQUE ("userId");


--
-- Name: student UQ_5b59e5fa1772006c44bacf10d4e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "UQ_5b59e5fa1772006c44bacf10d4e" UNIQUE ("courseId", "userId");


--
-- Name: task_result UQ_7d9b9262cf5403990b21b6b5cd7; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "UQ_7d9b9262cf5403990b21b6b5cd7" UNIQUE ("courseTaskId", "studentId");


--
-- Name: mentor UQ_86a8c9674f84523385ff741bfc2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "UQ_86a8c9674f84523385ff741bfc2" UNIQUE ("courseId", "userId");


--
-- Name: course UQ_8a167196d86062fa6abf6f0d546; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "UQ_8a167196d86062fa6abf6f0d546" UNIQUE (alias);


--
-- Name: task UQ_91f8c79680ddb1486f56128a9d6; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6" UNIQUE ("criteriaId");


--
-- Name: task_interview_student UQ_9b70aaee77ce73e847688838e7e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "UQ_9b70aaee77ce73e847688838e7e" UNIQUE ("studentId", "courseId", "courseTaskId");


--
-- Name: team_distribution_student UQ_a1c39af9e449474f6495b634cd5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student
    ADD CONSTRAINT "UQ_a1c39af9e449474f6495b634cd5" UNIQUE ("studentId", "courseId", "teamDistributionId");


--
-- Name: certificate UQ_a5b1acee8501273d8c777df4bc1; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "UQ_a5b1acee8501273d8c777df4bc1" UNIQUE ("studentId");


--
-- Name: consent UQ_a85c68db612327cf60a0d0e7b4a; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent
    ADD CONSTRAINT "UQ_a85c68db612327cf60a0d0e7b4a" UNIQUE ("channelValue");


--
-- Name: user UQ_afa885683cae0bb53ae1c81bce5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_afa885683cae0bb53ae1c81bce5" UNIQUE ("profilePermissionsId");


--
-- Name: user UQ_bbaf6a936b2124dc6448ba3448f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_bbaf6a936b2124dc6448ba3448f" UNIQUE ("providerUserId", provider);


--
-- Name: notification_user_connection UQ_c1665f13b0eb372fcb8d48ccf6a; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "UQ_c1665f13b0eb372fcb8d48ccf6a" UNIQUE ("userId", "channelId", "externalId");


--
-- Name: task_solution_result UQ_cd11c253afeee499efe93f3e184; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "UQ_cd11c253afeee499efe93f3e184" UNIQUE ("courseTaskId", "studentId", "checkerId");


--
-- Name: cv UQ_f21b478fe949f06e4e64d728318; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT "UQ_f21b478fe949f06e4e64d728318" UNIQUE ("githubId");


--
-- Name: IDX_062e03d78da22a7bd9becbfaaa; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_062e03d78da22a7bd9becbfaaa" ON public.course_user USING btree ("userId");


--
-- Name: IDX_06facda60b88268da22c37ddec; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_06facda60b88268da22c37ddec" ON public.login_state USING btree ("createdDate");


--
-- Name: IDX_076f71901ba479a51b2deaacd5; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_076f71901ba479a51b2deaacd5" ON public.repository_event USING btree ("repositoryUrl");


--
-- Name: IDX_07a7e2f79cde1c82b5be2f4716; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_07a7e2f79cde1c82b5be2f4716" ON public.notification USING btree (enabled);


--
-- Name: IDX_0b3c9d5127523db43a8c4997f5; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_0b3c9d5127523db43a8c4997f5" ON public.interview_question_categories_interview_question_category USING btree ("interviewQuestionId");


--
-- Name: IDX_0d29e2a35a0c87dc9377411f43; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_0d29e2a35a0c87dc9377411f43" ON public.student USING btree ("mentorId");


--
-- Name: IDX_0d84cc6a830f0e4ebbfcd6381d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE UNIQUE INDEX "IDX_0d84cc6a830f0e4ebbfcd6381d" ON public."user" USING btree ("githubId");


--
-- Name: IDX_115efaf0e1569ebe8a201f000e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_115efaf0e1569ebe8a201f000e" ON public.task_solution_checker USING btree ("taskSolutionId");


--
-- Name: IDX_12380a77f5769e0b608b4c5ece; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_12380a77f5769e0b608b4c5ece" ON public.task_solution_checker USING btree ("courseTaskId");


--
-- Name: IDX_1a6e36b16de159653a4fd2f432; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_1a6e36b16de159653a4fd2f432" ON public.course_task USING btree ("courseId");


--
-- Name: IDX_1c6a31a1098e0c472c4196f85d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_1c6a31a1098e0c472c4196f85d" ON public.course USING btree ("discordServerId");


--
-- Name: IDX_277a1b8395fd2896391b01b761; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_277a1b8395fd2896391b01b761" ON public.interview_question_categories_interview_question_category USING btree ("interviewQuestionCategoryId");


--
-- Name: IDX_2e2c071fde8ee3f26724de7e67; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_2e2c071fde8ee3f26724de7e67" ON public.notification_channel_settings USING btree ("channelId");


--
-- Name: IDX_2e4ed1c8264a48ffe7f8547401; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_2e4ed1c8264a48ffe7f8547401" ON public.stage_interview USING btree ("studentId");


--
-- Name: IDX_33cc2ea503287d1e19e696c028; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33cc2ea503287d1e19e696c028" ON public.task_interview_result USING btree ("courseTaskId");


--
-- Name: IDX_33f33cc8ef29d805a97ff4628b; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33f33cc8ef29d805a97ff4628b" ON public.notification USING btree (type);


--
-- Name: IDX_3cf45a981cf54c2b3e10f677c9; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_3cf45a981cf54c2b3e10f677c9" ON public.course_task USING btree ("taskId");


--
-- Name: IDX_46ecfda37a00bdb0eb9853805e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_46ecfda37a00bdb0eb9853805e" ON public.student_teams_team USING btree ("teamId");


--
-- Name: IDX_4f512b65d2481c2fd737680f79; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_4f512b65d2481c2fd737680f79" ON public.task_interview_result USING btree ("mentorId");


--
-- Name: IDX_50802da9f1d09f275d964dd491; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_50802da9f1d09f275d964dd491" ON public.notification USING btree (name);


--
-- Name: IDX_5565a1f41896ecd29591b239ef; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5565a1f41896ecd29591b239ef" ON public.task_result USING btree ("studentId");


--
-- Name: IDX_5d15876da767ed2eef032144ca; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5d15876da767ed2eef032144ca" ON public.student_team_distribution_team_distribution USING btree ("studentId");


--
-- Name: IDX_5fbd9182fe89b2417f288c61f9; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5fbd9182fe89b2417f288c61f9" ON public.student_teams_team USING btree ("studentId");


--
-- Name: IDX_600ad506d38c98395590e76ea1; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_600ad506d38c98395590e76ea1" ON public.student_feedback USING btree (student_id);


--
-- Name: IDX_6543e24d4d8714017acd1a1b39; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_6543e24d4d8714017acd1a1b39" ON public.resume USING btree ("userId");


--
-- Name: IDX_70824fef35e6038e459e58e035; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_70824fef35e6038e459e58e035" ON public.course_user USING btree ("courseId");


--
-- Name: IDX_773a8c01eb6d281590cdbcaabd; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_773a8c01eb6d281590cdbcaabd" ON public.notification_channel_settings USING btree ("notificationId");


--
-- Name: IDX_79279baf9c5c6e3fb9baabbb5b; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_79279baf9c5c6e3fb9baabbb5b" ON public.team USING btree ("teamDistributionId");


--
-- Name: IDX_79b102f1b191c731920e2ea486; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_79b102f1b191c731920e2ea486" ON public.login_state USING btree ("userId");


--
-- Name: IDX_80735bc019562abb4e7099340e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_80735bc019562abb4e7099340e" ON public.history USING btree (event);


--
-- Name: IDX_85a40b3dcc11dcfdfb836b7ff3; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_85a40b3dcc11dcfdfb836b7ff3" ON public.task_solution_checker USING btree ("checkerId");


--
-- Name: IDX_87736b09d69bacdc6bc272e023; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_87736b09d69bacdc6bc272e023" ON public.course_task USING btree ("taskOwnerId");


--
-- Name: IDX_87c5a426accd8659ac76e8d3fb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_87c5a426accd8659ac76e8d3fb" ON public.course_task USING btree (disabled);


--
-- Name: IDX_8a167196d86062fa6abf6f0d54; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_8a167196d86062fa6abf6f0d54" ON public.course USING btree (alias);


--
-- Name: IDX_951e2b89c3a2b4554516409cfb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_951e2b89c3a2b4554516409cfb" ON public.team_distribution USING btree ("courseId");


--
-- Name: IDX_955719ac67b6cb47bf005b200e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_955719ac67b6cb47bf005b200e" ON public.repository_event USING btree ("githubId");


--
-- Name: IDX_9d0edea65b297ba0d7d8064d05; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_9d0edea65b297ba0d7d8064d05" ON public.task_interview_result USING btree ("studentId");


--
-- Name: IDX_a29d066e554ba135f0d9408c1b; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a29d066e554ba135f0d9408c1b" ON public.student USING btree ("courseId");


--
-- Name: IDX_a619e6e10deb16bf6519d204cf; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a619e6e10deb16bf6519d204cf" ON public.history USING btree ("updatedDate");


--
-- Name: IDX_a745cd57c268bf3728acbcfccb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a745cd57c268bf3728acbcfccb" ON public.notification_user_settings USING btree ("channelId");


--
-- Name: IDX_a939c4402f9eb96a7c2b9b5663; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a939c4402f9eb96a7c2b9b5663" ON public.student_team_distribution_team_distribution USING btree ("teamDistributionId");


--
-- Name: IDX_adba43a9054da3ee83e6531d7d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_adba43a9054da3ee83e6531d7d" ON public.student_feedback USING btree (mentor_id);


--
-- Name: IDX_b35463776b4a11a3df3c30d920; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_b35463776b4a11a3df3c30d920" ON public.student USING btree ("userId");


--
-- Name: IDX_b74f71762142b09ea10a288166; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_b74f71762142b09ea10a288166" ON public.task_solution_result USING btree ("studentId");


--
-- Name: IDX_bdb2f3421163e324b337395909; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_bdb2f3421163e324b337395909" ON public.task_solution_result USING btree ("courseTaskId");


--
-- Name: IDX_d0a655e0bd36811dc5e74a1b64; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d0a655e0bd36811dc5e74a1b64" ON public.task_verification USING btree ("updatedDate");


--
-- Name: IDX_d0b6bedfc9eb1243b01facefe1; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d0b6bedfc9eb1243b01facefe1" ON public.notification_user_settings USING btree ("notificationId", "userId");


--
-- Name: IDX_d2236f176c9281802d3ff00d3f; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d2236f176c9281802d3ff00d3f" ON public.login_state USING btree (expires);


--
-- Name: IDX_d223b6ab8859d668ab080c3628; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d223b6ab8859d668ab080c3628" ON public."user" USING btree ("providerUserId");


--
-- Name: IDX_d8959fe22a43ff7773b3640992; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d8959fe22a43ff7773b3640992" ON public.task_verification USING btree ("studentId");


--
-- Name: IDX_dae85baef040e0c3eaf1794ff6; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_dae85baef040e0c3eaf1794ff6" ON public.task_verification USING btree ("courseTaskId");


--
-- Name: IDX_db66372bf51271337293b341bf; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_db66372bf51271337293b341bf" ON public.stage_interview USING btree ("mentorId");


--
-- Name: IDX_de17ec9312951a05365d5d4d25; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_de17ec9312951a05365d5d4d25" ON public.course_task USING btree (checker);


--
-- Name: IDX_e0c522b2cdf095ad5c5f51c0ae; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e0c522b2cdf095ad5c5f51c0ae" ON public.task_result USING btree ("courseTaskId");


--
-- Name: IDX_e848fe0c47f23605364a5f163f; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e848fe0c47f23605364a5f163f" ON public.student USING btree ("isFailed");


--
-- Name: IDX_e8aaf4d079a719ade8ebc1397e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e8aaf4d079a719ade8ebc1397e" ON public.task_solution_result USING btree ("checkerId");


--
-- Name: IDX_ee6434baa5d6a66edf5c8fa122; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_ee6434baa5d6a66edf5c8fa122" ON public.resume USING btree ("githubId");


--
-- Name: IDX_f277c5f942b6421c4e02e4b959; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_f277c5f942b6421c4e02e4b959" ON public.student USING btree ("isExpelled");


--
-- Name: IDX_f3dfd194e3463dc94600921378; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_f3dfd194e3463dc94600921378" ON public.mentor USING btree ("courseId");


--
-- Name: task_solution FK_04a0e8cec45008def71698916ae; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "FK_04a0e8cec45008def71698916ae" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: course_user FK_062e03d78da22a7bd9becbfaaac; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "FK_062e03d78da22a7bd9becbfaaac" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: interview_question_categories_interview_question_category FK_0b3c9d5127523db43a8c4997f59; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59" FOREIGN KEY ("interviewQuestionId") REFERENCES public.interview_question(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student FK_0d29e2a35a0c87dc9377411f432; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_0d29e2a35a0c87dc9377411f432" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- Name: task_result FK_0d531a05b39c159334a1724e1b0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_0d531a05b39c159334a1724e1b0" FOREIGN KEY ("lastCheckerId") REFERENCES public."user"(id);


--
-- Name: task_solution_checker FK_115efaf0e1569ebe8a201f000e2; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_115efaf0e1569ebe8a201f000e2" FOREIGN KEY ("taskSolutionId") REFERENCES public.task_solution(id);


--
-- Name: private_feedback FK_1448716050d6c839a198a199ddb; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_1448716050d6c839a198a199ddb" FOREIGN KEY ("fromUserId") REFERENCES public."user"(id);


--
-- Name: stage FK_16bd843ee63aeb303b35e288960; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT "FK_16bd843ee63aeb303b35e288960" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: course_event FK_18edb72a122ff56bddcaec6055c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_18edb72a122ff56bddcaec6055c" FOREIGN KEY ("organizerId") REFERENCES public."user"(id);


--
-- Name: course_task FK_1a6e36b16de159653a4fd2f4323; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_1a6e36b16de159653a4fd2f4323" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: course FK_1c6a31a1098e0c472c4196f85d8; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "FK_1c6a31a1098e0c472c4196f85d8" FOREIGN KEY ("discordServerId") REFERENCES public.discord_server(id);


--
-- Name: registry FK_2449b2493e4b436fda3c21ba5df; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "FK_2449b2493e4b436fda3c21ba5df" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: interview_question_categories_interview_question_category FK_277a1b8395fd2896391b01b7612; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "FK_277a1b8395fd2896391b01b7612" FOREIGN KEY ("interviewQuestionCategoryId") REFERENCES public.interview_question_category(id);


--
-- Name: feedback FK_2b4d98c492a3965505cf57e2e8a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_2b4d98c492a3965505cf57e2e8a" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: notification_channel_settings FK_2e2c071fde8ee3f26724de7e678; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "FK_2e2c071fde8ee3f26724de7e678" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stage_interview FK_2e4ed1c8264a48ffe7f85474018; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_2e4ed1c8264a48ffe7f85474018" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_interview_result FK_33cc2ea503287d1e19e696c0280; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_33cc2ea503287d1e19e696c0280" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: course_task FK_3cf45a981cf54c2b3e10f677c95; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_3cf45a981cf54c2b3e10f677c95" FOREIGN KEY ("taskId") REFERENCES public.task(id);


--
-- Name: private_feedback FK_43900d7df69f46dd5c7a44d0c80; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_43900d7df69f46dd5c7a44d0c80" FOREIGN KEY ("toUserId") REFERENCES public."user"(id);


--
-- Name: mentor_registry FK_469871166ea5d53d181d63bba4d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "FK_469871166ea5d53d181d63bba4d" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: student_teams_team FK_46ecfda37a00bdb0eb9853805e3; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3" FOREIGN KEY ("teamId") REFERENCES public.team(id);


--
-- Name: task_interview_result FK_4f512b65d2481c2fd737680f791; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_4f512b65d2481c2fd737680f791" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- Name: course_manager FK_51727e0e86522ee68c1d7ab556f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "FK_51727e0e86522ee68c1d7ab556f" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: task_checker FK_520bd8f9d4ae3b18430899c4490; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_520bd8f9d4ae3b18430899c4490" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: team_distribution_student FK_552eb86c51b2449e2665ad7be0f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student
    ADD CONSTRAINT "FK_552eb86c51b2449e2665ad7be0f" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_result FK_5565a1f41896ecd29591b239ef5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_5565a1f41896ecd29591b239ef5" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_checker FK_5a95946eb2c610d54379689312d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_5a95946eb2c610d54379689312d" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: course_event FK_5aa0fd2863ab6cc52828525649c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_5aa0fd2863ab6cc52828525649c" FOREIGN KEY ("eventId") REFERENCES public.event(id);


--
-- Name: team_distribution_student FK_5b0eb057a06b5fafb89edefd358; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student
    ADD CONSTRAINT "FK_5b0eb057a06b5fafb89edefd358" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: student_team_distribution_team_distribution FK_5d15876da767ed2eef032144caf; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "FK_5d15876da767ed2eef032144caf" FOREIGN KEY ("studentId") REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_teams_team FK_5fbd9182fe89b2417f288c61f9c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c" FOREIGN KEY ("studentId") REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_feedback FK_600ad506d38c98395590e76ea1f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_600ad506d38c98395590e76ea1f" FOREIGN KEY (student_id) REFERENCES public.student(id);


--
-- Name: stage_interview FK_61a1f43cc337dcfd0a267e6f3bc; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_61a1f43cc337dcfd0a267e6f3bc" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: stage_interview_student FK_61d2e056326504ec484b8ed59e7; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "FK_61d2e056326504ec484b8ed59e7" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: resume FK_6543e24d4d8714017acd1a1b392; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume
    ADD CONSTRAINT "FK_6543e24d4d8714017acd1a1b392" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: notification_user_connection FK_686acb0bbf9634ef2497e87582f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "FK_686acb0bbf9634ef2497e87582f" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: course_user FK_70824fef35e6038e459e58e0358; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "FK_70824fef35e6038e459e58e0358" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: notification_channel_settings FK_773a8c01eb6d281590cdbcaabdf; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "FK_773a8c01eb6d281590cdbcaabdf" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team FK_79279baf9c5c6e3fb9baabbb5bd; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- Name: stage_interview_feedback FK_7b7d891769e42df16686873c3c6; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback
    ADD CONSTRAINT "FK_7b7d891769e42df16686873c3c6" FOREIGN KEY ("stageInterviewId") REFERENCES public.stage_interview(id);


--
-- Name: course FK_7dc67e5ff23f9a74b7cb129a088; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- Name: private_feedback FK_7f6ab332685af8fa4239d8e04e5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_7f6ab332685af8fa4239d8e04e5" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: task_solution_checker FK_85a40b3dcc11dcfdfb836b7ff3e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_85a40b3dcc11dcfdfb836b7ff3e" FOREIGN KEY ("checkerId") REFERENCES public.student(id);


--
-- Name: event FK_868c8f954dd31217a7e0981b1d2; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- Name: notification_user_settings FK_8704ffbe765e552c633f5c96588; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_8704ffbe765e552c633f5c96588" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: course_task FK_87736b09d69bacdc6bc272e0239; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_87736b09d69bacdc6bc272e0239" FOREIGN KEY ("taskOwnerId") REFERENCES public."user"(id);


--
-- Name: notification_user_connection FK_8cefc11aa24ba4e51162685196d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "FK_8cefc11aa24ba4e51162685196d" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE;


--
-- Name: task FK_91f8c79680ddb1486f56128a9d6; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6" FOREIGN KEY ("criteriaId") REFERENCES public.task_criteria("taskId") ON DELETE CASCADE;


--
-- Name: team_distribution_student FK_92af6f1f2345cb39398cea4748a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution_student
    ADD CONSTRAINT "FK_92af6f1f2345cb39398cea4748a" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- Name: team_distribution FK_951e2b89c3a2b4554516409cfbd; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution
    ADD CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: task_interview_result FK_9d0edea65b297ba0d7d8064d05a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_9d0edea65b297ba0d7d8064d05a" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task FK_9e32af93bbf4f4dcf66387b3073; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- Name: registry FK_a19cc98b348420faa739dfd4240; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "FK_a19cc98b348420faa739dfd4240" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: student FK_a29d066e554ba135f0d9408c1b3; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_a29d066e554ba135f0d9408c1b3" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: certificate FK_a5b1acee8501273d8c777df4bc1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_a5b1acee8501273d8c777df4bc1" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: notification_user_settings FK_a745cd57c268bf3728acbcfccb1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_a745cd57c268bf3728acbcfccb1" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_team_distribution_team_distribution FK_a939c4402f9eb96a7c2b9b56634; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- Name: student_feedback FK_adba43a9054da3ee83e6531d7da; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY (mentor_id) REFERENCES public.mentor(id);


--
-- Name: user FK_afa885683cae0bb53ae1c81bce5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_afa885683cae0bb53ae1c81bce5" FOREIGN KEY ("profilePermissionsId") REFERENCES public.profile_permissions(id);


--
-- Name: student FK_b35463776b4a11a3df3c30d920a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_b35463776b4a11a3df3c30d920a" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: notification FK_b7386b61afc53e6b82251e41b5c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c" FOREIGN KEY ("parentId") REFERENCES public.notification(id);


--
-- Name: task_solution_result FK_b74f71762142b09ea10a2881669; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_b74f71762142b09ea10a2881669" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_solution_result FK_bdb2f3421163e324b337395909e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_bdb2f3421163e324b337395909e" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: feedback FK_bfea5673b7379b1adfa2036da3f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES public."user"(id);


--
-- Name: task_checker FK_c8594a64515d69f4dae0da90006; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_c8594a64515d69f4dae0da90006" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- Name: notification_user_settings FK_d58ed9fef5ec0b2875892cda12f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_d58ed9fef5ec0b2875892cda12f" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: task_artefact FK_d79f770bf46cd7659b6e5dda1c1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "FK_d79f770bf46cd7659b6e5dda1c1" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_verification FK_d8959fe22a43ff7773b36409924; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "FK_d8959fe22a43ff7773b36409924" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: course_manager FK_d937cb10a6bf6cc8574046bb716; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "FK_d937cb10a6bf6cc8574046bb716" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: task_interview_student FK_da5613e78890f0093805a441c92; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_da5613e78890f0093805a441c92" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: task_verification FK_dae85baef040e0c3eaf1794ff6d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "FK_dae85baef040e0c3eaf1794ff6d" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: stage_interview FK_db66372bf51271337293b341bf4; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_db66372bf51271337293b341bf4" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- Name: task_interview_student FK_dc9248f22e6b30f63e7afa4f218; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_dc9248f22e6b30f63e7afa4f218" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: mentor FK_df4bfe54f243bd089ea8fb66ed0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "FK_df4bfe54f243bd089ea8fb66ed0" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: task_result FK_e0c522b2cdf095ad5c5f51c0ae0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_e0c522b2cdf095ad5c5f51c0ae0" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: task_solution FK_e2487265adac81bea6f085d2fa0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "FK_e2487265adac81bea6f085d2fa0" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: stage_interview_student FK_e59f3cbfd1cf52fddf905fc8dea; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "FK_e59f3cbfd1cf52fddf905fc8dea" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: task_artefact FK_e683ee274bcf6363c043a29f535; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "FK_e683ee274bcf6363c043a29f535" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- Name: task_solution_result FK_e8aaf4d079a719ade8ebc1397ef; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_e8aaf4d079a719ade8ebc1397ef" FOREIGN KEY ("checkerId") REFERENCES public.student(id);


--
-- Name: task_solution_checker FK_ee4c145a114a9ada3ec1be0f936; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_ee4c145a114a9ada3ec1be0f936" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: stage_interview FK_f08ecdf6dd22870ac34cbacff51; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_f08ecdf6dd22870ac34cbacff51" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: student_feedback FK_f133ab9aba2bb7c28da9a93351d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d" FOREIGN KEY (author_id) REFERENCES public."user"(id);


--
-- Name: task_interview_student FK_f348c327bf727d9de3acd7b4b49; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_f348c327bf727d9de3acd7b4b49" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: mentor FK_f3dfd194e3463dc946009213782; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "FK_f3dfd194e3463dc946009213782" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: course_task FK_f45fe9bce062ecb8f59edf079e8; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- Name: course_event FK_f736d0c55020fc4e5eb28634316; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_f736d0c55020fc4e5eb28634316" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: feedback FK_fefc350f416e262e904dcf6b35e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES public."user"(id);


--
-- PostgreSQL database dump complete
--

