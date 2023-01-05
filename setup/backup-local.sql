--
-- PostgreSQL database dump
--

-- Dumped from database version 12.8 (Debian 12.8-1.pgdg110+1)
-- Dumped by pg_dump version 13.3

-- Started on 2023-01-05 10:44:30

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: rs_master
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO rs_master;

--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: rs_master
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 968 (class 1247 OID 17561)
-- Name: course_task_crosscheckstatus_enum; Type: TYPE; Schema: public; Owner: rs_master
--

CREATE TYPE public.course_task_crosscheckstatus_enum AS ENUM (
    'initial',
    'distributed',
    'completed'
);


ALTER TYPE public.course_task_crosscheckstatus_enum OWNER TO rs_master;

--
-- TOC entry 645 (class 1247 OID 16397)
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
-- TOC entry 203 (class 1259 OID 16409)
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
-- TOC entry 204 (class 1259 OID 16419)
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
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 204
-- Name: alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.alert_id_seq OWNED BY public.alert.id;


--
-- TOC entry 205 (class 1259 OID 16421)
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
-- TOC entry 206 (class 1259 OID 16430)
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
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 206
-- Name: certificate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.certificate_id_seq OWNED BY public.certificate.id;


--
-- TOC entry 207 (class 1259 OID 16432)
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
-- TOC entry 208 (class 1259 OID 16440)
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
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 208
-- Name: consent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.consent_id_seq OWNED BY public.consent.id;


--
-- TOC entry 209 (class 1259 OID 16442)
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
    alias character varying,
    completed boolean DEFAULT false NOT NULL,
    description character varying,
    "descriptionUrl" character varying,
    planned boolean DEFAULT false NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "fullName" character varying,
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
-- TOC entry 210 (class 1259 OID 16455)
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
-- TOC entry 211 (class 1259 OID 16464)
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
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 211
-- Name: course_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_event_id_seq OWNED BY public.course_event.id;


--
-- TOC entry 212 (class 1259 OID 16466)
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
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 212
-- Name: course_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_id_seq OWNED BY public.course.id;


--
-- TOC entry 213 (class 1259 OID 16468)
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
-- TOC entry 214 (class 1259 OID 16473)
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
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 214
-- Name: course_manager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_manager_id_seq OWNED BY public.course_manager.id;


--
-- TOC entry 215 (class 1259 OID 16475)
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
-- TOC entry 216 (class 1259 OID 16487)
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
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 216
-- Name: course_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_task_id_seq OWNED BY public.course_task.id;


--
-- TOC entry 217 (class 1259 OID 16489)
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
    "isSupervisor" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.course_user OWNER TO rs_master;

--
-- TOC entry 218 (class 1259 OID 16497)
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
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 218
-- Name: course_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.course_user_id_seq OWNED BY public.course_user.id;


--
-- TOC entry 219 (class 1259 OID 16499)
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
-- TOC entry 220 (class 1259 OID 16505)
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
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 220
-- Name: cv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.cv_id_seq OWNED BY public.cv.id;


--
-- TOC entry 294 (class 1259 OID 17529)
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
-- TOC entry 293 (class 1259 OID 17527)
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
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 293
-- Name: discipline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.discipline_id_seq OWNED BY public.discipline.id;


--
-- TOC entry 221 (class 1259 OID 16507)
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
-- TOC entry 222 (class 1259 OID 16515)
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
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 222
-- Name: discord_server_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.discord_server_id_seq OWNED BY public.discord_server.id;


--
-- TOC entry 223 (class 1259 OID 16517)
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
-- TOC entry 224 (class 1259 OID 16526)
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
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 224
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;


--
-- TOC entry 225 (class 1259 OID 16528)
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
-- TOC entry 226 (class 1259 OID 16537)
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
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 226
-- Name: feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.feedback_id_seq OWNED BY public.feedback.id;


--
-- TOC entry 292 (class 1259 OID 17504)
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
-- TOC entry 291 (class 1259 OID 17502)
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
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 291
-- Name: history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.history_id_seq OWNED BY public.history.id;


--
-- TOC entry 227 (class 1259 OID 16539)
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
-- TOC entry 228 (class 1259 OID 16547)
-- Name: interview_question_categories_interview_question_category; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.interview_question_categories_interview_question_category (
    "interviewQuestionId" integer NOT NULL,
    "interviewQuestionCategoryId" integer NOT NULL
);


ALTER TABLE public.interview_question_categories_interview_question_category OWNER TO rs_master;

--
-- TOC entry 229 (class 1259 OID 16550)
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
-- TOC entry 230 (class 1259 OID 16558)
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
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 230
-- Name: interview_question_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.interview_question_category_id_seq OWNED BY public.interview_question_category.id;


--
-- TOC entry 231 (class 1259 OID 16560)
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
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 231
-- Name: interview_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.interview_question_id_seq OWNED BY public.interview_question.id;


--
-- TOC entry 232 (class 1259 OID 16562)
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
-- TOC entry 233 (class 1259 OID 16569)
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
-- TOC entry 234 (class 1259 OID 16578)
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
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 234
-- Name: mentor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.mentor_id_seq OWNED BY public.mentor.id;


--
-- TOC entry 235 (class 1259 OID 16580)
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
-- TOC entry 236 (class 1259 OID 16593)
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
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 236
-- Name: mentor_registry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.mentor_registry_id_seq OWNED BY public.mentor_registry.id;


--
-- TOC entry 237 (class 1259 OID 16595)
-- Name: migrations; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO rs_master;

--
-- TOC entry 238 (class 1259 OID 16601)
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
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 238
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 239 (class 1259 OID 16603)
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
-- TOC entry 240 (class 1259 OID 16613)
-- Name: notification_channel; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.notification_channel (
    id character varying NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_channel OWNER TO rs_master;

--
-- TOC entry 241 (class 1259 OID 16621)
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
-- TOC entry 242 (class 1259 OID 16629)
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
-- TOC entry 243 (class 1259 OID 16638)
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
-- TOC entry 244 (class 1259 OID 16646)
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
-- TOC entry 245 (class 1259 OID 16654)
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
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 245
-- Name: private_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.private_feedback_id_seq OWNED BY public.private_feedback.id;


--
-- TOC entry 246 (class 1259 OID 16656)
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
-- TOC entry 247 (class 1259 OID 16677)
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
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 247
-- Name: profile_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.profile_permissions_id_seq OWNED BY public.profile_permissions.id;


--
-- TOC entry 248 (class 1259 OID 16679)
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
-- TOC entry 249 (class 1259 OID 16689)
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
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 249
-- Name: registry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.registry_id_seq OWNED BY public.registry.id;


--
-- TOC entry 250 (class 1259 OID 16691)
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
-- TOC entry 251 (class 1259 OID 16699)
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
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 251
-- Name: repository_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.repository_event_id_seq OWNED BY public.repository_event.id;


--
-- TOC entry 252 (class 1259 OID 16701)
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
    "userId" integer,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resume OWNER TO rs_master;

--
-- TOC entry 253 (class 1259 OID 16711)
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
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 253
-- Name: resume_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.resume_id_seq OWNED BY public.resume.id;


--
-- TOC entry 254 (class 1259 OID 16713)
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
-- TOC entry 255 (class 1259 OID 16722)
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
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 255
-- Name: stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_id_seq OWNED BY public.stage.id;


--
-- TOC entry 256 (class 1259 OID 16724)
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
-- TOC entry 257 (class 1259 OID 16734)
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
-- TOC entry 258 (class 1259 OID 16742)
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
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 258
-- Name: stage_interview_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_feedback_id_seq OWNED BY public.stage_interview_feedback.id;


--
-- TOC entry 259 (class 1259 OID 16744)
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
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 259
-- Name: stage_interview_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_id_seq OWNED BY public.stage_interview.id;


--
-- TOC entry 260 (class 1259 OID 16746)
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
-- TOC entry 261 (class 1259 OID 16751)
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
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 261
-- Name: stage_interview_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.stage_interview_student_id_seq OWNED BY public.stage_interview_student.id;


--
-- TOC entry 262 (class 1259 OID 16753)
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
-- TOC entry 263 (class 1259 OID 16770)
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
-- TOC entry 264 (class 1259 OID 16778)
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
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 264
-- Name: student_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.student_feedback_id_seq OWNED BY public.student_feedback.id;


--
-- TOC entry 265 (class 1259 OID 16780)
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
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 265
-- Name: student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.student_id_seq OWNED BY public.student.id;


--
-- TOC entry 300 (class 1259 OID 17617)
-- Name: student_team_distribution_team_distribution; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_team_distribution_team_distribution (
    "studentId" integer NOT NULL,
    "teamDistributionId" integer NOT NULL
);


ALTER TABLE public.student_team_distribution_team_distribution OWNER TO rs_master;

--
-- TOC entry 301 (class 1259 OID 17624)
-- Name: student_teams_team; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_teams_team (
    "studentId" integer NOT NULL,
    "teamId" integer NOT NULL
);


ALTER TABLE public.student_teams_team OWNER TO rs_master;

--
-- TOC entry 266 (class 1259 OID 16782)
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
-- TOC entry 267 (class 1259 OID 16795)
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
-- TOC entry 268 (class 1259 OID 16803)
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
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 268
-- Name: task_artefact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_artefact_id_seq OWNED BY public.task_artefact.id;


--
-- TOC entry 269 (class 1259 OID 16805)
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
-- TOC entry 270 (class 1259 OID 16810)
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
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 270
-- Name: task_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_checker_id_seq OWNED BY public.task_checker.id;


--
-- TOC entry 295 (class 1259 OID 17568)
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
-- TOC entry 271 (class 1259 OID 16812)
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
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 271
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_id_seq OWNED BY public.task.id;


--
-- TOC entry 272 (class 1259 OID 16814)
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
-- TOC entry 273 (class 1259 OID 16823)
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
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 273
-- Name: task_interview_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_interview_result_id_seq OWNED BY public.task_interview_result.id;


--
-- TOC entry 274 (class 1259 OID 16825)
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
-- TOC entry 275 (class 1259 OID 16830)
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
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 275
-- Name: task_interview_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_interview_student_id_seq OWNED BY public.task_interview_student.id;


--
-- TOC entry 276 (class 1259 OID 16832)
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
-- TOC entry 277 (class 1259 OID 16842)
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
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 277
-- Name: task_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_result_id_seq OWNED BY public.task_result.id;


--
-- TOC entry 278 (class 1259 OID 16844)
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
-- TOC entry 279 (class 1259 OID 16854)
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
-- TOC entry 280 (class 1259 OID 16859)
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
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 280
-- Name: task_solution_checker_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_checker_id_seq OWNED BY public.task_solution_checker.id;


--
-- TOC entry 281 (class 1259 OID 16861)
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
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 281
-- Name: task_solution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_id_seq OWNED BY public.task_solution.id;


--
-- TOC entry 282 (class 1259 OID 16863)
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
-- TOC entry 283 (class 1259 OID 16874)
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
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 283
-- Name: task_solution_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_solution_result_id_seq OWNED BY public.task_solution_result.id;


--
-- TOC entry 284 (class 1259 OID 16876)
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
    metadata json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.task_verification OWNER TO rs_master;

--
-- TOC entry 285 (class 1259 OID 16886)
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
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 285
-- Name: task_verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.task_verification_id_seq OWNED BY public.task_verification.id;


--
-- TOC entry 297 (class 1259 OID 17589)
-- Name: team; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.team (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "chatLink" character varying NOT NULL,
    password character varying NOT NULL,
    "teamDistributionId" integer
);


ALTER TABLE public.team OWNER TO rs_master;

--
-- TOC entry 299 (class 1259 OID 17600)
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
    "minStudents" integer DEFAULT 2 NOT NULL,
    "maxStudents" integer DEFAULT 4 NOT NULL,
    "studentsCount" integer DEFAULT 3 NOT NULL,
    "strictStudentsCount" boolean DEFAULT true NOT NULL,
    "minTotalScore" integer DEFAULT 0 NOT NULL,
    "descriptionUrl" character varying DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.team_distribution OWNER TO rs_master;

--
-- TOC entry 298 (class 1259 OID 17598)
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
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 298
-- Name: team_distribution_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.team_distribution_id_seq OWNED BY public.team_distribution.id;


--
-- TOC entry 296 (class 1259 OID 17587)
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
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 296
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
-- TOC entry 286 (class 1259 OID 16888)
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
-- TOC entry 287 (class 1259 OID 16894)
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
    provider character varying(32)
);


ALTER TABLE public."user" OWNER TO rs_master;

--
-- TOC entry 288 (class 1259 OID 16908)
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
-- TOC entry 289 (class 1259 OID 16916)
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
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 289
-- Name: user_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.user_group_id_seq OWNED BY public.user_group.id;


--
-- TOC entry 290 (class 1259 OID 16918)
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
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 290
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rs_master
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 3196 (class 2604 OID 16920)
-- Name: alert id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.alert ALTER COLUMN id SET DEFAULT nextval('public.alert_id_seq'::regclass);


--
-- TOC entry 3200 (class 2604 OID 16921)
-- Name: certificate id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate ALTER COLUMN id SET DEFAULT nextval('public.certificate_id_seq'::regclass);


--
-- TOC entry 3203 (class 2604 OID 16922)
-- Name: consent id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent ALTER COLUMN id SET DEFAULT nextval('public.consent_id_seq'::regclass);


--
-- TOC entry 3211 (class 2604 OID 16923)
-- Name: course id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course ALTER COLUMN id SET DEFAULT nextval('public.course_id_seq'::regclass);


--
-- TOC entry 3215 (class 2604 OID 16924)
-- Name: course_event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event ALTER COLUMN id SET DEFAULT nextval('public.course_event_id_seq'::regclass);


--
-- TOC entry 3218 (class 2604 OID 16925)
-- Name: course_manager id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager ALTER COLUMN id SET DEFAULT nextval('public.course_manager_id_seq'::regclass);


--
-- TOC entry 3224 (class 2604 OID 16926)
-- Name: course_task id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task ALTER COLUMN id SET DEFAULT nextval('public.course_task_id_seq'::regclass);


--
-- TOC entry 3231 (class 2604 OID 16927)
-- Name: course_user id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user ALTER COLUMN id SET DEFAULT nextval('public.course_user_id_seq'::regclass);


--
-- TOC entry 3232 (class 2604 OID 16928)
-- Name: cv id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv ALTER COLUMN id SET DEFAULT nextval('public.cv_id_seq'::regclass);


--
-- TOC entry 3401 (class 2604 OID 17532)
-- Name: discipline id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discipline ALTER COLUMN id SET DEFAULT nextval('public.discipline_id_seq'::regclass);


--
-- TOC entry 3235 (class 2604 OID 16929)
-- Name: discord_server id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discord_server ALTER COLUMN id SET DEFAULT nextval('public.discord_server_id_seq'::regclass);


--
-- TOC entry 3239 (class 2604 OID 16930)
-- Name: event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- TOC entry 3243 (class 2604 OID 16931)
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- TOC entry 3398 (class 2604 OID 17507)
-- Name: history id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.history ALTER COLUMN id SET DEFAULT nextval('public.history_id_seq'::regclass);


--
-- TOC entry 3246 (class 2604 OID 16932)
-- Name: interview_question id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question ALTER COLUMN id SET DEFAULT nextval('public.interview_question_id_seq'::regclass);


--
-- TOC entry 3249 (class 2604 OID 16933)
-- Name: interview_question_category id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category ALTER COLUMN id SET DEFAULT nextval('public.interview_question_category_id_seq'::regclass);


--
-- TOC entry 3254 (class 2604 OID 16934)
-- Name: mentor id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor ALTER COLUMN id SET DEFAULT nextval('public.mentor_id_seq'::regclass);


--
-- TOC entry 3262 (class 2604 OID 16935)
-- Name: mentor_registry id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry ALTER COLUMN id SET DEFAULT nextval('public.mentor_registry_id_seq'::regclass);


--
-- TOC entry 3263 (class 2604 OID 16936)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 3279 (class 2604 OID 16937)
-- Name: private_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback ALTER COLUMN id SET DEFAULT nextval('public.private_feedback_id_seq'::regclass);


--
-- TOC entry 3295 (class 2604 OID 16938)
-- Name: profile_permissions id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions ALTER COLUMN id SET DEFAULT nextval('public.profile_permissions_id_seq'::regclass);


--
-- TOC entry 3300 (class 2604 OID 16939)
-- Name: registry id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry ALTER COLUMN id SET DEFAULT nextval('public.registry_id_seq'::regclass);


--
-- TOC entry 3303 (class 2604 OID 16940)
-- Name: repository_event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.repository_event ALTER COLUMN id SET DEFAULT nextval('public.repository_event_id_seq'::regclass);


--
-- TOC entry 3308 (class 2604 OID 16941)
-- Name: resume id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume ALTER COLUMN id SET DEFAULT nextval('public.resume_id_seq'::regclass);


--
-- TOC entry 3313 (class 2604 OID 16942)
-- Name: stage id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage ALTER COLUMN id SET DEFAULT nextval('public.stage_id_seq'::regclass);


--
-- TOC entry 3318 (class 2604 OID 16943)
-- Name: stage_interview id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_id_seq'::regclass);


--
-- TOC entry 3321 (class 2604 OID 16944)
-- Name: stage_interview_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_feedback_id_seq'::regclass);


--
-- TOC entry 3324 (class 2604 OID 16945)
-- Name: stage_interview_student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student ALTER COLUMN id SET DEFAULT nextval('public.stage_interview_student_id_seq'::regclass);


--
-- TOC entry 3336 (class 2604 OID 16946)
-- Name: student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student ALTER COLUMN id SET DEFAULT nextval('public.student_id_seq'::regclass);


--
-- TOC entry 3339 (class 2604 OID 16947)
-- Name: student_feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback ALTER COLUMN id SET DEFAULT nextval('public.student_feedback_id_seq'::regclass);


--
-- TOC entry 3347 (class 2604 OID 16948)
-- Name: task id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task ALTER COLUMN id SET DEFAULT nextval('public.task_id_seq'::regclass);


--
-- TOC entry 3350 (class 2604 OID 16949)
-- Name: task_artefact id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact ALTER COLUMN id SET DEFAULT nextval('public.task_artefact_id_seq'::regclass);


--
-- TOC entry 3353 (class 2604 OID 16950)
-- Name: task_checker id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker ALTER COLUMN id SET DEFAULT nextval('public.task_checker_id_seq'::regclass);


--
-- TOC entry 3357 (class 2604 OID 16951)
-- Name: task_interview_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result ALTER COLUMN id SET DEFAULT nextval('public.task_interview_result_id_seq'::regclass);


--
-- TOC entry 3360 (class 2604 OID 16952)
-- Name: task_interview_student id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student ALTER COLUMN id SET DEFAULT nextval('public.task_interview_student_id_seq'::regclass);


--
-- TOC entry 3365 (class 2604 OID 16953)
-- Name: task_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result ALTER COLUMN id SET DEFAULT nextval('public.task_result_id_seq'::regclass);


--
-- TOC entry 3370 (class 2604 OID 16954)
-- Name: task_solution id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution ALTER COLUMN id SET DEFAULT nextval('public.task_solution_id_seq'::regclass);


--
-- TOC entry 3373 (class 2604 OID 16955)
-- Name: task_solution_checker id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker ALTER COLUMN id SET DEFAULT nextval('public.task_solution_checker_id_seq'::regclass);


--
-- TOC entry 3379 (class 2604 OID 16956)
-- Name: task_solution_result id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result ALTER COLUMN id SET DEFAULT nextval('public.task_solution_result_id_seq'::regclass);


--
-- TOC entry 3385 (class 2604 OID 16957)
-- Name: task_verification id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification ALTER COLUMN id SET DEFAULT nextval('public.task_verification_id_seq'::regclass);


--
-- TOC entry 3407 (class 2604 OID 17592)
-- Name: team id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- TOC entry 3408 (class 2604 OID 17603)
-- Name: team_distribution id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution ALTER COLUMN id SET DEFAULT nextval('public.team_distribution_id_seq'::regclass);


--
-- TOC entry 3394 (class 2604 OID 16958)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3397 (class 2604 OID 16959)
-- Name: user_group id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.user_group ALTER COLUMN id SET DEFAULT nextval('public.user_group_id_seq'::regclass);


--
-- TOC entry 3831 (class 0 OID 16409)
-- Dependencies: 203
-- Data for Name: alert; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3833 (class 0 OID 16421)
-- Dependencies: 205
-- Data for Name: certificate; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3835 (class 0 OID 16432)
-- Dependencies: 207
-- Data for Name: consent; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3837 (class 0 OID 16442)
-- Dependencies: 209
-- Data for Name: course; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.course VALUES (11, '2019-08-27 07:36:13.565873', '2020-03-13 15:39:41.477995', 'RS 2019 Q3', NULL, 'javascript', 'JavaScript', NULL, 'rs-2019-q3', true, 'RS 2019 Q3', NULL, false, '2019-09-09 07:35:20.981+00', '2020-01-31 07:35:20.981+00', 'Rolling Scopes School 2019 Q3', NULL, false, NULL, NULL, true, true, NULL, NULL);
INSERT INTO public.course VALUES (13, '2019-10-21 08:05:31.068833', '2020-04-06 15:14:44.116961', 'RS 2020 Q1', NULL, 'javascript', 'JavaScript', NULL, 'rs-2020-q1', false, 'Javascript / Frontend Курс.
Вводное занятие - 2 февраля
Организационный вебинар начнется 2 февраля в 12:00 по минскому времени (GMT+3). Мы расскажем о процессе обучения в RS School и выдадим задания для первого этапа обучения.

Вебинар будет транслироваться на канале https://www.youtube.com/c/rollingscopesschool.
Рекомендуем подписаться на канал и нажать колокольчик, чтобы не пропустить начало трансляции. 

Если у вас не будет возможности присоединиться к онлайн-трансляции, не переживайте! 
Запись вебинара будет размещена на канале в открытом доступе.

Описание тренинга
Основной сайт: https://rs.school/js/

Подробная информация о школе:  https://docs.rs.school', NULL, false, '2020-02-02 09:01:56.398+00', '2020-07-31 08:01:56.398+00', 'Rolling Scopes School 2020 Q1: JavaScript/Front-end', '2020-04-15 08:40:46.24+00', false, NULL, NULL, true, true, NULL, NULL);
INSERT INTO public.course VALUES (23, '2020-02-25 09:28:08.842897', '2023-01-02 07:51:09.233678', 'TEST COURSE', NULL, 'javascript', 'JavaScript', NULL, 'test-course', false, 'TEST COURSE', NULL, false, '2021-05-31 00:00:00+00', '2023-06-30 00:00:00+00', 'TEST COURSE', '2024-01-31 07:50:49.213+00', false, 2, NULL, true, true, NULL, 1);


--
-- TOC entry 3838 (class 0 OID 16455)
-- Dependencies: 210
-- Data for Name: course_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.course_event VALUES (2, '2019-09-18 13:27:50.246961', '2019-09-29 22:36:05.391483', 2, 11, NULL, '2019-09-13', '20:00:00+03', 'Youtube Live', 'Sergey Shalyapin', '', 3961, NULL, 'https://www.youtube.com/watch?v=2iCgf03rx1I', '2019-09-13 17:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (10, '2019-09-19 08:06:38.306347', '2019-09-29 22:36:37.450973', 10, 11, NULL, '2019-09-23', '12:00:41+03', 'Discord >> announcement', 'Dzianis Sheka', NULL, 1328, NULL, NULL, '2019-09-23 09:00:41+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (32, '2019-10-15 11:39:32.584641', '2019-10-15 11:48:54.960496', 34, 11, NULL, '2019-11-05', '18:00:47+02', 'Youtube Live', NULL, NULL, 2444, NULL, NULL, '2019-11-05 16:00:47+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (9, '2019-09-19 08:01:19.744354', '2019-09-29 22:36:52.324181', 9, 11, NULL, '2019-09-25', '20:00:39+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-09-25 17:00:39+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (31, '2019-10-15 11:34:38.555567', '2019-10-15 11:49:16.569959', 33, 11, NULL, '2019-11-04', '18:00:58+02', 'Youtube Live', NULL, NULL, 1090, NULL, NULL, '2019-11-04 16:00:58+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (28, '2019-10-14 14:01:29.842633', '2019-10-15 11:49:46.776533', 30, 11, NULL, '2019-10-26', '06:00:16+02', 'Youtube Live', NULL, NULL, 1328, NULL, NULL, '2019-10-26 04:00:16+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (8, '2019-09-19 07:56:40.52603', '2019-09-29 22:37:40.366214', 8, 11, NULL, '2019-09-23', '19:00:52+03', 'Youtube Live', 'Anton Bely, Pavel Razuvalov', NULL, 2444, NULL, NULL, '2019-09-23 16:00:52+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (11, '2019-09-19 08:15:42.170571', '2019-09-29 22:37:44.992841', 11, 11, NULL, '2019-09-27', '20:00:54+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-09-27 17:00:54+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (12, '2019-09-19 08:25:12.648501', '2019-09-29 22:37:58.19294', 12, 11, NULL, '2019-09-30', '20:00:25+03', 'Youtube Live', 'Viktoriya Vorozhun', NULL, 2693, NULL, NULL, '2019-09-30 17:00:25+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (13, '2019-09-19 08:27:16.85243', '2019-09-29 22:38:11.029827', 13, 11, NULL, '2019-10-01', '20:00:32+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-01 17:00:32+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (14, '2019-09-19 08:58:14.462505', '2019-09-29 22:38:15.108254', 14, 11, NULL, '2019-10-02', '20:00:20+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-02 17:00:20+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (15, '2019-09-19 09:01:29.234793', '2019-09-29 22:38:18.967522', 15, 11, NULL, '2019-10-04', '20:00:18+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-04 17:00:18+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (16, '2019-09-19 09:04:00.058482', '2019-09-29 22:38:24.161396', 16, 11, NULL, '2019-10-07', '20:00:52+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-07 17:00:52+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (17, '2019-09-19 09:10:34.094844', '2019-09-29 22:38:30.112146', 17, 11, NULL, '2019-10-09', '20:00:19+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-09 17:00:19+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (20, '2019-09-19 09:18:06.890022', '2019-09-29 22:38:43.832965', 20, 11, NULL, '2019-10-11', '20:00:11+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-11 17:00:11+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (18, '2019-09-19 09:15:26.553437', '2019-09-29 22:38:50.345041', 18, 11, NULL, '2019-10-10', '19:00:17+03', 'Youtube Live', 'Anton Bely', NULL, 2444, NULL, NULL, '2019-10-10 16:00:17+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (19, '2019-09-19 09:16:44.454815', '2019-09-29 22:39:00.633497', 19, 11, NULL, '2019-10-14', '19:00:17+03', 'Youtube Live', 'Anton Bely', NULL, 2444, NULL, NULL, '2019-10-14 16:00:17+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (21, '2019-09-19 09:20:29.557356', '2019-09-29 22:39:11.116858', 21, 11, NULL, '2019-10-15', '20:00:42+03', 'Youtube Live', 'Dzianis Sheka', NULL, 1328, NULL, NULL, '2019-10-15 17:00:42+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (22, '2019-09-19 09:27:50.542211', '2019-09-29 22:39:18.865932', 22, 11, NULL, '2019-10-16', '20:00:03+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-10-16 17:00:03+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (23, '2019-09-19 09:32:15.883718', '2019-09-29 22:39:31.265399', 23, 11, NULL, '2019-10-18', '21:00:27+03', 'Youtube Live', 'Dzmitry Varabei', NULL, 2084, NULL, NULL, '2019-10-18 18:00:27+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (25, '2019-10-14 13:38:33.036547', '2019-10-14 13:42:06.839216', 27, 11, NULL, '2019-10-23', NULL, 'Self-Studying', NULL, '', NULL, NULL, 'https://www.youtube.com/watch?v=CAvqa6Lj_Rg&list=PLe--kalBDwjj81fKdWlvpLsizajSAK-lh&index=18', '2019-10-23 06:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (26, '2019-10-14 13:51:28.629935', '2019-10-14 13:51:28.629935', 28, 11, NULL, '2019-10-25', '18:00:11+02', 'Youtube Live', NULL, NULL, 6776, NULL, NULL, '2019-10-25 16:00:11+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (27, '2019-10-14 13:52:21.215211', '2019-10-14 13:53:05.258274', 29, 11, NULL, '2019-10-25', '19:00:11+02', 'Youtube Live', NULL, NULL, 6776, NULL, NULL, '2019-10-25 17:00:11+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (29, '2019-10-14 14:10:56.691953', '2019-10-14 14:10:56.691953', 31, 11, NULL, '2019-10-28', NULL, 'Self-Studying', NULL, NULL, NULL, NULL, 'https://www.youtube.com/watch?v=H0XScE08hy8', '2019-10-28 06:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (40, '2019-10-15 12:03:50.220574', '2019-10-15 12:03:50.220574', 41, 11, NULL, '2019-11-25', '18:00:11+02', 'Youtube Live', NULL, NULL, 2612, NULL, NULL, '2019-11-25 16:00:11+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (41, '2019-10-15 12:05:11.008733', '2019-10-15 12:05:11.008733', 42, 11, NULL, '2019-11-27', NULL, 'Self-Studying', NULL, NULL, NULL, NULL, NULL, '2019-11-27 06:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (7, '2019-09-19 07:53:46.050222', '2019-09-29 13:41:51.301574', 7, 11, NULL, '2019-09-21', '19:00:19+03', 'Twich', 'Viktor Kovalev', NULL, 4749, NULL, NULL, '2019-09-21 16:00:19+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (6, '2019-09-18 13:38:43.043751', '2019-09-29 13:39:46.636834', 6, 11, NULL, '2019-09-20', '20:00:00+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-09-20 17:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (5, '2019-09-18 13:36:41.630053', '2019-09-29 13:39:56.720457', 5, 11, NULL, '2019-09-18', '19:00:00+03', 'Youtube Live', 'Anton Bely', NULL, 2444, NULL, NULL, '2019-09-18 16:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (3, '2019-09-18 13:29:31.396492', '2019-09-29 13:39:36.356333', 3, 11, NULL, '2019-09-14', '19:00:00+03', 'Twich', 'Viktor Kovalev', NULL, 4749, NULL, NULL, '2019-09-14 16:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (1, '2019-09-18 13:25:10.446065', '2019-09-29 13:39:03.156556', 1, 11, NULL, '2019-09-11', '20:00:00+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-09-11 17:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (24, '2019-09-20 08:13:05.071726', '2019-09-29 22:35:36.7697', 24, 11, NULL, '2019-09-09', '19:00:20+03', 'Youtube Live', 'Dzmitry Varabei', NULL, 2084, NULL, NULL, '2019-09-09 16:00:20+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (30, '2019-10-14 14:14:48.89067', '2019-10-29 11:02:52.806588', 32, 11, NULL, '2019-10-30', '17:00:34+01', 'Youtube Live', NULL, NULL, 2549, NULL, '', '2019-10-30 16:00:34+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (56, '2019-11-13 07:58:22.70613', '2019-11-20 10:30:55.29591', 37, 11, NULL, '2019-11-14', '17:00:09+01', 'Youtube Live', NULL, 'Part 2', 4476, NULL, NULL, '2019-11-14 16:00:09+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (34, '2019-10-15 11:47:37.525411', '2019-10-15 11:48:07.708192', 36, 11, NULL, '2019-11-11', NULL, 'Self-Studying', NULL, NULL, NULL, NULL, NULL, '2019-11-11 06:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (52, '2019-10-15 13:48:04.643143', '2019-10-15 13:48:04.643143', 49, 11, NULL, '2019-12-18', '21:00:24+02', 'Youtube Live', NULL, NULL, 1328, NULL, NULL, '2019-12-18 19:00:24+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (54, '2019-10-16 09:35:26.303099', '2019-10-16 09:38:41.390559', 51, 11, NULL, '2020-01-10', '21:00:30+02', 'Youtube Live', NULL, '"Monday Mentor"', 1328, NULL, NULL, '2020-01-10 19:00:30+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (53, '2019-10-16 08:55:38.580672', '2019-10-16 09:38:47.92149', 50, 11, NULL, '2019-12-30', '21:00:18+02', 'Youtube Live', NULL, '"Monday Mentor"', 1328, NULL, NULL, '2019-12-30 19:00:18+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (43, '2019-10-15 13:19:27.167531', '2019-10-16 09:39:12.634215', 44, 11, NULL, '2019-12-09', '18:00:39+02', 'Youtube Live', NULL, '"Monday Mentor"', 2612, NULL, NULL, '2019-12-09 16:00:39+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (55, '2019-10-17 08:39:24.313773', '2019-10-17 08:59:37.788018', 52, 11, NULL, '2019-10-22', '07:00:49+02', 'Discord >> announcement', NULL, NULL, 1328, NULL, NULL, '2019-10-22 05:00:49+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (33, '2019-10-15 11:41:49.437101', '2019-11-04 08:05:30.353745', 35, 11, NULL, '2019-11-06', NULL, '', NULL, NULL, NULL, NULL, NULL, '2019-11-06 06:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (57, '2019-11-13 10:00:57.263816', '2019-11-13 10:00:57.263816', 38, 11, NULL, '2019-11-15', '17:00:13+01', NULL, NULL, NULL, NULL, NULL, NULL, '2019-11-15 16:00:13+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (45, '2019-10-15 13:22:46.522679', '2019-11-19 10:24:53.907876', 45, 11, NULL, '2019-12-10', '18:00:23+01', 'Youtube Live', NULL, 'Andre Gloukhmantchouk', NULL, NULL, NULL, '2019-12-10 17:00:23+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (37, '2019-10-15 11:57:45.893502', '2019-11-13 10:16:05.257876', 39, 11, NULL, '2019-11-19', '20:00:59+01', 'Youtube Live', NULL, NULL, 1328, NULL, NULL, '2019-11-19 19:00:59+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (58, '2019-11-13 10:41:26.703281', '2019-11-13 10:41:26.703281', 40, 11, NULL, '2019-11-19', '17:00:35+01', NULL, NULL, NULL, NULL, NULL, NULL, '2019-11-19 16:00:35+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (59, '2019-11-13 10:45:10.752653', '2019-11-13 10:45:10.752653', 53, 11, NULL, '2019-11-20', '17:00:59+01', 'Imaguru', NULL, NULL, NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-11-20 16:00:59+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (61, '2019-11-13 15:03:10.873277', '2019-11-13 15:03:10.873277', 55, 11, NULL, '2019-11-21', '19:00:58+01', 'Discord >> announcement', NULL, 'Optional test without score and deadline', 1328, NULL, NULL, '2019-11-21 18:00:58+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (51, '2019-10-15 13:46:51.156727', '2019-11-14 08:04:43.997755', 46, 11, NULL, '2019-12-20', '17:00:03+01', 'Imaguru + Youtube Live', NULL, 'https://community-z.com/events/rss2019q3-presentations-5', NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-12-20 16:00:03+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (50, '2019-10-15 13:46:25.188954', '2019-11-14 08:05:21.714914', 46, 11, NULL, '2019-12-19', '17:00:03+01', 'Imaguru + Youtube Live', NULL, 'https://community-z.com/events/rss2019q3-presentations-4', NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-12-19 16:00:03+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (49, '2019-10-15 13:45:26.160284', '2019-11-14 08:05:57.063452', 46, 11, NULL, '2019-12-17', '17:00:03+01', 'Imaguru + Youtube Live', NULL, 'https://community-z.com/events/rss2019q3-presentations-3', NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-12-17 16:00:03+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (46, '2019-10-15 13:38:17.289871', '2019-11-14 08:06:34.523225', 46, 11, NULL, '2019-12-12', '17:00:08+01', '', NULL, 'https://community-z.com/events/rss2019q3-presentations-2', NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-12-12 16:00:08+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (62, '2019-11-14 08:08:21.712392', '2019-11-14 08:08:40.889422', 46, 11, NULL, '2019-12-11', '17:00:18+01', 'Imaguru + Youtube Live', NULL, 'https://community-z.com/events/rss2019q3-presentations-1', NULL, NULL, 'https://www.youtube.com/user/ImaguruHub/videos', '2019-12-11 16:00:18+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (47, '2019-10-15 13:40:23.348495', '2019-11-19 10:25:27.58625', 47, 11, NULL, '2019-12-13', '18:00:40+01', 'Youtube Live', NULL, 'Andre Gloukhmantchouk', NULL, NULL, NULL, '2019-12-13 17:00:40+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (60, '2019-11-13 14:32:00.780799', '2019-11-19 08:46:13.282679', 54, 11, NULL, '2019-11-21', '06:00:43+01', 'Discord >> announcement', NULL, 'Optional test without score and deadline', 1328, NULL, NULL, '2019-11-21 05:00:43+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (63, '2019-11-19 13:03:55.859842', '2019-11-19 13:03:55.859842', 56, 11, NULL, '2019-12-23', '18:00:20+01', 'Youtube Live', NULL, NULL, 1328, NULL, 'https://www.youtube.com/c/RollingScopesSchool', '2019-12-23 17:00:20+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (35, '2019-10-15 11:52:24.439929', '2019-11-20 10:30:47.532359', 37, 11, NULL, '2019-11-13', '17:00:37+01', 'Youtube Live', NULL, 'Part 1', 4476, NULL, NULL, '2019-11-13 16:00:37+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (4, '2019-09-18 13:32:30.103621', '2019-09-29 22:36:22.6367', 4, 11, NULL, '2019-09-16', '20:00:00+03', 'Youtube Live', 'Sergey Shalyapin', NULL, 3961, NULL, NULL, '2019-09-16 17:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (64, '2019-11-20 10:31:56.663441', '2019-11-20 10:31:56.663441', 37, 11, NULL, '2019-11-26', '17:00:32+01', 'Youtube Live', NULL, 'Part 3', 4476, NULL, NULL, '2019-11-26 16:00:32+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (65, '2019-11-20 10:46:52.962706', '2019-11-20 10:46:52.962706', 57, 11, NULL, '2019-12-16', '17:00:37+01', 'Youtube Live', NULL, NULL, 1328, NULL, NULL, '2019-12-16 16:00:37+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (66, '2019-11-20 11:06:19.515961', '2019-11-20 11:06:19.515961', 59, 11, NULL, '2020-01-31', '07:00:31+01', NULL, NULL, NULL, NULL, NULL, NULL, '2020-01-31 06:00:31+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (365, '2021-05-24 07:20:56.788715', '2021-05-24 07:20:56.788715', 184, 23, NULL, NULL, NULL, 'YouTube', NULL, NULL, 2084, NULL, NULL, '2021-05-27 14:00:52.55+00', '', 2, NULL);
INSERT INTO public.course_event VALUES (366, '2021-06-22 11:42:36.951384', '2021-06-22 11:42:36.951384', 185, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-06-24 14:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (367, '2021-06-22 14:07:40.909358', '2021-06-22 14:07:40.909358', 186, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-07-25 21:59:15.201+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (372, '2021-06-25 11:17:49.097994', '2021-07-02 14:10:23.571015', 189, 23, NULL, NULL, NULL, 'YouTube', NULL, NULL, 2084, NULL, NULL, '2021-07-06 15:30:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (375, '2021-06-30 12:43:57.602426', '2021-07-01 07:32:06.927318', 192, 23, NULL, NULL, NULL, 'youtube', NULL, NULL, 2084, NULL, NULL, '2021-07-01 16:30:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (398, '2021-07-05 20:58:39.710814', '2021-07-07 15:21:56.684306', 201, 23, NULL, NULL, NULL, 'youtube', NULL, NULL, 2084, NULL, NULL, '2021-07-08 15:00:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (399, '2021-07-06 09:39:48.224795', '2021-07-08 06:13:01.681283', 202, 23, NULL, NULL, NULL, NULL, NULL, NULL, 2084, NULL, NULL, '2021-07-12 23:59:04.648+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (409, '2021-07-16 11:12:11.214905', '2021-07-22 05:33:46.72208', 212, 23, NULL, NULL, NULL, NULL, NULL, NULL, 2084, NULL, NULL, '2021-07-24 23:59:00+00', '', NULL, NULL);
INSERT INTO public.course_event VALUES (410, '2021-07-20 13:47:53.823319', '2021-07-20 13:49:26.410219', 213, 23, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2021-07-24 23:59:00+00', '', NULL, NULL);


--
-- TOC entry 3841 (class 0 OID 16468)
-- Dependencies: 213
-- Data for Name: course_manager; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3843 (class 0 OID 16475)
-- Dependencies: 215
-- Data for Name: course_task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.course_task VALUES (387, '2020-02-24 06:42:44.772736', '2020-02-25 10:28:14.611904', NULL, NULL, 54, 434, 0.1, 'taskOwner', 587, '2020-02-22 15:00:00+00', '2020-02-23 15:00:00+00', 13, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (426, '2020-03-31 11:04:53.472383', '2020-03-31 11:04:53.472383', NULL, NULL, 100, 129, 0.01, 'auto-test', NULL, '2020-03-30 20:59:00+00', '2020-04-25 20:59:00+00', 13, NULL, 'codewars:stage2', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (399, '2020-03-02 13:25:46.327431', '2020-03-17 08:04:28.635812', NULL, NULL, 100, 421, 0.2, 'mentor', 2103, '2020-03-02 13:25:00+00', '2020-03-22 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (383, '2020-02-19 15:19:31.540441', '2020-03-22 19:02:59.763044', NULL, NULL, 100, 472, 0.2, 'mentor', 2103, '2020-02-19 15:19:00+00', '2020-03-23 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (321, '2019-10-15 12:42:42.1037', '2019-10-15 12:43:35.36623', NULL, NULL, 100, 435, 0.5, 'taskOwner', 3961, '2019-10-06 00:00:00+00', '2019-10-08 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (337, '2019-11-13 08:21:59.44239', '2019-11-19 08:47:29.701909', NULL, NULL, 100, 446, 1, 'mentor', 1328, '2019-11-14 17:00:00+00', '2019-11-18 20:49:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (348, '2019-11-19 10:52:33.333176', '2019-11-19 10:52:33.333176', NULL, NULL, 100, 350, 1, 'mentor', 1328, '2019-12-23 17:00:00+00', '2020-01-02 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (350, '2019-11-20 10:40:56.936083', '2020-01-20 20:56:08.618894', NULL, NULL, 280, 448, 0.7, 'mentor', 1328, '2019-11-03 08:00:00+00', '2019-12-18 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (346, '2019-11-19 09:32:03.882014', '2020-01-20 21:16:18.023264', NULL, NULL, 100, 349, 5, 'assigned', NULL, '2020-01-08 15:00:00+00', '2020-01-20 15:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (342, '2019-11-18 07:49:09.892108', '2020-01-29 10:07:18.716975', NULL, NULL, 100, 447, 1, 'mentor', NULL, '2020-01-28 10:07:00+00', '2020-02-20 10:07:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (302, '2019-09-19 10:04:08.320328', '2019-11-20 21:51:46.684981', NULL, NULL, 100, 423, 0.02, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (306, '2019-09-20 09:59:01.071936', '2019-11-20 21:52:10.896805', NULL, NULL, 100, 428, 0.01, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (309, '2019-09-22 09:57:59.933548', '2019-11-20 21:52:27.065892', NULL, NULL, 100, 429, 0.04, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (315, '2019-09-30 08:20:14.840054', '2019-11-20 21:54:03.067127', NULL, NULL, 100, 434, 0.01, 'taskOwner', 2032, '2019-09-28 00:00:00+00', '2019-09-28 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (318, '2019-10-06 11:21:27.376684', '2019-11-20 21:54:20.53693', NULL, NULL, 100, 437, 0.01, 'mentor', NULL, '2019-09-16 00:00:00+00', '2019-09-22 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (388, '2020-02-24 06:43:57.26983', '2020-02-25 10:28:23.927547', NULL, NULL, 50, 432, 0.1, 'taskOwner', 2480, '2020-02-22 15:00:00+00', '2020-02-23 15:00:00+00', 13, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (374, '2020-02-15 14:44:37.656023', '2020-03-12 07:20:40.425622', NULL, NULL, 100, 467, 0.2, 'mentor', 5481, '2020-02-15 14:00:00+00', '2020-03-22 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (380, '2020-02-19 15:16:59.219399', '2020-03-22 19:08:34.853331', NULL, NULL, 100, 475, 0.2, 'mentor', 2103, '2020-02-19 15:15:00+00', '2020-03-23 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (408, '2020-03-15 23:12:19.237073', '2020-03-30 07:23:21.073835', NULL, NULL, 100, 484, 1, 'taskOwner', 2084, '2020-03-22 21:00:00+00', '2020-04-11 20:59:00+00', 13, NULL, 'stage-interview', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (430, '2020-04-04 18:29:20.218081', '2020-04-04 19:44:07.634629', NULL, NULL, 100, 435, 0.1, 'auto-test', 3961, '2020-04-02 19:00:00+00', '2020-04-05 20:59:00+00', 13, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (303, '2019-09-19 10:04:35.673232', '2019-11-20 21:51:53.750426', NULL, NULL, 100, 422, 0.03, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (343, '2019-11-19 08:57:16.511397', '2019-11-26 06:57:02.144395', NULL, NULL, 100, 246, 1, 'taskOwner', 2612, '2019-11-23 09:00:00+00', '2019-11-23 13:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (401, '2020-03-09 08:21:51.143582', '2020-03-10 08:46:07.22067', NULL, NULL, 100, 433, 0.1, 'taskOwner', 3961, '2020-03-08 19:00:00+00', '2020-03-08 19:00:00+00', 13, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (417, '2020-03-21 19:19:58.863021', '2020-03-21 19:19:58.863021', NULL, NULL, 100, 484, 1, 'mentor', NULL, '2019-09-30 21:00:00+00', '2019-11-30 21:00:00+00', 11, NULL, 'stage-interview', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (381, '2020-02-19 15:17:32.07091', '2020-03-22 19:09:12.677292', NULL, NULL, 100, 474, 0.2, 'mentor', 2103, '2020-02-19 15:17:00+00', '2020-03-23 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (397, '2020-03-02 13:24:09.075432', '2020-03-22 19:12:20.05552', NULL, NULL, 100, 426, 0.2, 'mentor', 2103, '2020-03-20 13:20:00+00', '2020-03-22 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (423, '2020-03-31 10:19:16.141261', '2020-04-06 07:07:06.10971', NULL, NULL, 110, 444, 0.7, 'mentor', 1090, '2020-03-23 21:00:00+00', '2020-04-07 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (300, '2019-09-17 08:15:35.715649', '2020-04-06 10:49:35.519015', NULL, NULL, 100, 417, 0.01, 'mentor', NULL, '2019-09-09 00:00:00+00', '2019-09-19 00:00:00+00', 11, NULL, 'htmlcssacademy', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (344, '2019-11-19 09:04:18.469854', '2019-11-28 17:17:02.674641', NULL, NULL, 128, 129, 1, 'mentor', NULL, '2019-09-09 08:00:00+00', '2019-11-24 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (327, '2019-10-28 07:42:02.903354', '2019-11-15 12:34:30.259197', NULL, NULL, 100, 418, 1, 'mentor', NULL, '2019-09-20 17:00:00+00', '2019-09-29 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (331, '2019-11-04 08:15:10.985127', '2019-11-15 12:37:57.067586', NULL, NULL, 110, 444, 1, 'mentor', NULL, '2019-11-01 16:00:00+00', '2019-11-06 20:39:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (354, '2019-12-07 14:35:20.567268', '2019-12-11 16:33:41.983256', NULL, NULL, 60, 96, 1, 'jury', 2084, '2019-12-07 12:31:00+00', '2019-12-28 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (313, '2019-09-30 08:17:27.15297', '2019-11-20 21:53:55.352852', NULL, NULL, 100, 432, 0.01, 'taskOwner', 2480, '2019-09-22 00:00:00+00', '2019-09-22 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (316, '2019-09-30 08:22:03.026072', '2019-11-20 21:54:11.847779', NULL, NULL, 100, 433, 0.05, 'taskOwner', 2032, '2019-09-26 00:00:00+00', '2019-09-26 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (319, '2019-10-13 13:51:52.830672', '2019-11-20 21:55:14.344517', NULL, NULL, 100, 439, 0.3, 'mentor', 1328, '2019-10-13 00:00:00+00', '2019-10-20 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (310, '2019-09-22 09:58:21.070871', '2019-11-20 21:52:32.957984', NULL, NULL, 100, 430, 0.04, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (325, '2019-10-27 12:09:53.130143', '2019-11-15 12:31:01.943109', NULL, NULL, 50, 442, 1, 'mentor', NULL, '2019-10-24 17:00:00+00', '2019-10-27 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (307, '2019-09-20 09:59:22.00868', '2019-11-20 21:52:16.13903', NULL, NULL, 100, 427, 0.04, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (369, '2020-02-02 03:55:35.429745', '2020-03-12 07:11:39.495304', NULL, NULL, 100, 437, 0.1, 'mentor', NULL, '2020-02-02 01:54:00+00', '2020-02-16 20:59:00+00', 13, NULL, 'cv:markdown', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (373, '2020-02-09 18:18:59.381025', '2020-03-12 07:13:13.223671', NULL, NULL, 60, 465, 0.2, 'mentor', NULL, '2020-02-01 21:00:00+00', '2020-03-15 20:59:00+00', 13, NULL, 'codewars:stage1', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (368, '2020-02-01 20:13:13.966515', '2020-03-12 07:10:32.0252', NULL, NULL, 100, 417, 0.1, 'mentor', 2032, '2020-02-02 09:00:00+00', '2020-02-23 20:59:00+00', 13, NULL, 'htmlcssacademy', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (336, '2019-11-13 07:47:34.232721', '2019-11-15 12:40:11.757945', NULL, NULL, 120, 445, 1, 'mentor', 1328, '2019-11-08 05:00:00+00', '2019-11-11 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (328, '2019-10-28 07:48:01.625307', '2019-11-15 12:42:26.150687', NULL, NULL, 100, 443, 1, 'mentor', NULL, '2019-10-01 17:00:00+00', '2019-12-01 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (345, '2019-11-19 09:23:27.67568', '2019-12-23 21:01:53.560053', NULL, NULL, 100, 83, 1, 'mentor', 2032, '2019-11-30 17:00:00+00', '2019-12-24 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (320, '2019-10-13 13:52:22.151208', '2019-11-16 13:10:56.094496', NULL, NULL, 100, 438, 0.3, 'mentor', 1328, '2019-10-13 00:00:00+00', '2019-10-20 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (349, '2019-11-19 11:04:25.743014', '2020-01-14 08:52:31.860422', NULL, NULL, 450, 352, 1, 'assigned', 1328, '2019-12-18 19:00:00+00', '2020-01-08 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (347, '2019-11-19 10:18:28.401575', '2019-11-19 10:18:28.401575', NULL, NULL, 100, 351, 1, 'taskOwner', 2612, '2019-12-07 09:00:00+00', '2019-12-07 13:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (332, '2019-11-05 11:51:40.950343', '2019-11-19 10:21:01.444201', NULL, NULL, 120, 89, 1, 'mentor', NULL, '2019-11-03 21:00:00+00', '2019-12-08 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (351, '2019-11-20 11:37:02.922582', '2019-11-20 11:37:02.922582', NULL, NULL, 100, 407, 1, 'mentor', NULL, '2020-01-01 08:00:00+00', '2020-01-17 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (367, '2020-01-19 16:51:46.691809', '2020-01-19 16:51:46.691809', NULL, NULL, 100, 88, 1, 'taskOwner', 1328, '2020-01-18 21:00:00+00', '2020-01-19 21:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (301, '2019-09-17 13:42:41.220995', '2019-11-20 21:51:18.507183', NULL, NULL, 100, 421, 0.02, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (304, '2019-09-20 09:45:08.623688', '2019-11-20 21:51:58.821689', NULL, NULL, 100, 424, 0.05, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (305, '2019-09-20 09:45:31.423306', '2019-11-20 21:52:03.967525', NULL, NULL, 100, 425, 0.03, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (308, '2019-09-20 09:59:54.237603', '2019-11-20 21:52:21.418289', NULL, NULL, 100, 426, 0.02, 'mentor', NULL, '2019-09-23 00:00:00+00', '2019-10-19 00:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (382, '2020-02-19 15:18:06.945157', '2020-03-22 19:03:14.201634', NULL, NULL, 100, 473, 0.2, 'mentor', 2103, '2020-02-19 15:17:00+00', '2020-03-23 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (370, '2020-02-02 04:03:10.255065', '2020-03-12 07:11:48.755187', NULL, NULL, 100, 84, 0.1, 'autoTest', NULL, '2020-02-02 02:02:00+00', '2020-02-18 20:59:00+00', 13, NULL, 'cv:html', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (398, '2020-03-02 13:24:43.551181', '2020-03-17 08:05:11.649945', NULL, NULL, 100, 424, 0.5, 'mentor', 2103, '2020-03-02 13:24:00+00', '2020-03-22 20:59:00+00', 13, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (718, '2020-02-24 06:43:57.27', '2020-12-19 07:08:38.178221', NULL, NULL, 50, 432, 0.2, 'taskOwner', 2084, '2021-03-19 15:00:00+00', '2021-03-20 15:00:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (719, '2020-03-15 23:12:19.237', '2021-05-17 17:21:40.075257', NULL, NULL, 50, 484, 1, 'taskOwner', 2084, '2021-05-04 00:00:00+00', '2021-05-18 23:59:00+00', 23, NULL, 'stage-interview', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (720, '2020-02-19 15:16:59.219', '2021-03-06 09:11:06.762852', NULL, NULL, 100, 475, 0.05, 'auto-test', 2084, '2021-02-28 21:59:00+00', '2021-03-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (721, '2020-03-02 13:25:46.327', '2021-03-06 09:11:43.622874', NULL, NULL, 100, 421, 0.05, 'mentor', 2084, '2021-02-28 21:59:00+00', '2021-03-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (722, '2020-02-19 15:19:31.54', '2021-03-06 09:12:16.168284', NULL, NULL, 100, 472, 0.05, 'mentor', 2084, '2021-02-28 21:59:00+00', '2021-03-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (723, '2020-03-02 13:24:09.075', '2020-12-27 07:57:56.442267', NULL, NULL, 100, 426, 0.1, 'mentor', 2084, '2021-04-06 13:20:00+00', '2021-04-18 21:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (724, '2020-02-19 15:17:32.071', '2021-03-06 09:28:28.111453', NULL, NULL, 100, 474, 0.05, 'mentor', 2084, '2021-02-28 23:59:00+00', '2021-03-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (725, '2020-02-19 15:18:06.945', '2021-03-06 09:28:56.637451', NULL, NULL, 100, 473, 0.05, 'mentor', 2084, '2021-02-28 23:59:00+00', '2021-03-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (726, '2020-02-02 04:03:10.255', '2021-03-06 09:05:38.409628', NULL, NULL, 100, 84, 0.1, 'autoTest', NULL, '2021-02-27 03:02:00+00', '2021-03-08 23:59:00+00', 23, NULL, 'cv:html', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (727, '2020-03-09 08:21:51.144', '2020-12-19 07:08:30.734975', NULL, NULL, 100, 433, 0.2, 'taskOwner', 2084, '2021-04-03 19:00:00+00', '2021-04-03 19:00:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (728, '2020-09-09 16:31:08.778', '2020-12-27 07:05:14.675656', NULL, NULL, 100, 568, 0.1, 'auto-test', 2084, '2021-03-02 20:59:00+00', '2021-04-25 20:59:00+00', 23, NULL, 'selfeducation', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (729, '2020-09-09 16:32:20.373', '2020-12-27 07:05:25.568066', NULL, NULL, 100, 567, 0.1, 'auto-test', 2084, '2021-03-02 20:00:00+00', '2021-04-25 20:59:00+00', 23, NULL, 'selfeducation', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (730, '2020-09-09 16:33:07.413', '2020-12-27 07:05:31.951659', NULL, NULL, 100, 569, 0.1, 'auto-test', 2084, '2021-03-02 20:59:00+00', '2021-04-25 20:59:00+00', 23, NULL, 'selfeducation', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (731, '2020-02-15 14:44:37.656', '2021-03-30 05:41:33.668199', NULL, NULL, 100, 467, 0.5, 'mentor', 2084, '2021-01-20 16:00:00+00', '2021-03-30 22:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (732, '2020-02-09 18:18:59.381', '2020-12-19 07:08:19.25978', NULL, NULL, 60, 465, 1, 'mentor', NULL, '2021-02-26 19:00:00+00', '2021-04-04 20:59:00+00', 23, NULL, 'codewars:stage1', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (733, '2020-02-02 03:55:35.43', '2021-03-06 09:04:46.985011', NULL, NULL, 100, 437, 0.1, 'auto-test', NULL, '2021-02-27 02:54:00+00', '2021-03-08 23:59:00+00', 23, NULL, 'cv:markdown', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (734, '2020-02-24 06:42:44.773', '2020-12-19 07:06:44.394231', NULL, NULL, 100, 434, 0.2, 'taskOwner', 2084, '2021-03-13 15:00:00+00', '2021-03-14 15:00:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (736, '2020-09-28 15:59:54.118', '2020-12-14 11:25:09.139521', NULL, NULL, 210, 577, 0.2, 'mentor', NULL, '2021-04-26 01:59:00+00', '2021-05-10 23:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (740, '2020-11-20 07:16:10.732', '2020-12-14 11:24:43.632522', NULL, NULL, 210, 500, 0.2, 'mentor', NULL, '2021-05-10 06:15:00+00', '2021-05-31 23:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (743, '2020-11-03 15:25:45.804', '2020-12-19 07:07:17.139765', NULL, NULL, 128, 129, 0.2, 'auto-test', NULL, '2021-04-27 23:59:00+00', '2021-05-17 23:59:00+00', 23, NULL, 'codewars', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (745, '2020-11-20 07:22:07.672', '2020-12-14 11:24:35.798531', NULL, NULL, 210, 584, 0.2, 'mentor', NULL, '2021-05-10 06:21:00+00', '2021-05-31 23:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (747, '2020-11-30 08:13:18.401', '2020-12-14 11:24:26.882041', NULL, NULL, 100, 83, 0.5, 'auto-test', 2084, '2021-05-24 08:12:00+00', '2021-06-07 22:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (748, '2020-11-29 19:28:52.429', '2020-12-14 11:24:54.693418', NULL, NULL, 100, 229, 0.1, 'taskOwner', 2084, '2021-05-22 15:00:00+00', '2021-05-23 15:00:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (749, '2020-12-01 14:39:15.604', '2020-12-14 11:24:51.175695', NULL, NULL, 120, 89, 1, 'mentor', NULL, '2021-04-23 23:59:00+00', '2021-05-25 23:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (750, '2020-12-04 09:25:44.758', '2020-12-14 11:24:47.561727', NULL, NULL, 76, 531, 0.149999999999999, 'taskOwner', 2084, '2021-05-28 18:00:00+00', '2021-05-30 18:00:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (751, '2020-12-09 12:07:23.808', '2020-12-14 11:24:13.461012', NULL, NULL, 10, 349, 10, 'mentor', 2084, '2021-06-07 00:00:00+00', '2021-06-21 23:59:00+00', 23, NULL, 'interview', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (752, '2020-12-11 12:22:20.579', '2020-12-14 11:24:23.203131', NULL, NULL, 280, 589, 0.2, 'mentor', NULL, '2021-06-01 12:21:00+00', '2021-06-17 00:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (764, '2020-12-19 13:05:37.532114', '2021-03-16 04:44:14.87901', NULL, NULL, 15, 592, 1, 'auto-test', 2084, '2021-02-28 13:04:00+00', '2021-03-09 00:59:00+00', 23, NULL, 'codewars', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (766, '2020-12-26 18:38:03.97028', '2021-03-06 09:02:07.383585', NULL, NULL, 100, 595, 0.1, 'auto-test', 2084, '2020-12-25 21:59:00+00', '2021-03-08 23:59:00+00', 23, NULL, 'selfeducation', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (767, '2020-12-26 18:38:48.344647', '2021-03-06 09:02:35.081732', NULL, NULL, 100, 596, 0.1, 'auto-test', 2084, '2020-12-25 21:59:00+00', '2021-03-08 23:59:00+00', 23, NULL, 'selfeducation', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (768, '2020-12-26 18:39:33.065223', '2021-03-06 09:03:26.018831', NULL, NULL, 100, 597, 0.1, 'auto-test', 2084, '2020-12-25 21:59:00+00', '2021-03-08 23:59:00+00', 23, NULL, 'selfeducation', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (833, '2021-03-02 11:27:43.699601', '2021-03-08 09:16:47.157628', NULL, NULL, 100, 615, 0, 'mentor', 2084, '2021-03-01 22:59:00+00', '2021-03-14 22:59:00+00', 23, NULL, 'test', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (845, '2021-03-16 04:27:15.526178', '2021-03-30 05:41:07.113384', NULL, NULL, 65, 465, 0.5, 'auto-test', 2084, '2021-03-16 05:22:00+00', '2021-03-30 22:59:00+00', 23, NULL, 'codewars', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (864, '2021-04-02 16:07:20.055716', '2021-04-02 16:07:20.055716', NULL, NULL, 100, 432, 0.1, 'taskOwner', 2084, '2021-04-02 16:00:00+00', '2021-04-04 16:00:00+00', 23, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (866, '2021-04-05 15:41:10.480048', '2021-04-07 11:36:23.008047', NULL, NULL, 100, 639, 0.149999999999999, 'auto-test', NULL, '2021-04-06 00:00:00+00', '2021-04-12 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (871, '2021-04-11 09:24:28.636388', '2021-04-11 09:24:28.636388', NULL, NULL, 100, 433, 0.1, 'auto-test', 2084, '2021-04-10 09:10:00+00', '2021-04-11 09:10:00+00', 23, NULL, 'test', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (888, '2021-04-19 15:25:43.189874', '2021-04-29 07:10:23.047691', NULL, NULL, 50, 484, 1, 'taskOwner', 2084, '2021-05-04 23:59:00+00', '2021-05-18 23:59:00+00', 23, NULL, 'stage-interview', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (891, '2021-04-20 07:59:31.355572', '2021-04-20 08:00:02.758902', NULL, NULL, 100, 641, 0.1, 'auto-test', 2084, '2021-04-20 08:00:00+00', '2021-04-26 23:59:00+00', 23, NULL, 'selfeducation', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (913, '2021-05-04 13:42:38.3986', '2021-05-07 11:39:02.702583', NULL, NULL, 128, 129, 0.5, 'auto-test', 2084, '2021-05-04 15:42:00+00', '2021-05-31 23:59:00+00', 23, NULL, 'codewars', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (916, '2021-05-07 11:44:06.354446', '2021-05-07 11:44:06.354446', NULL, NULL, 81, 671, 0.5, 'auto-test', 2084, '2021-05-07 14:00:00+00', '2021-05-31 23:59:00+00', 23, NULL, 'codewars', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (924, '2021-05-20 12:03:27.067163', '2021-05-20 12:03:27.067163', NULL, NULL, 200, 677, 1, 'auto-test', 2084, '2021-03-23 20:00:00+00', '2021-04-23 23:59:00+00', 23, NULL, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (928, '2021-05-26 14:04:17.496156', '2021-05-26 14:05:56.930802', NULL, NULL, 160, 679, 1, 'mentor', 2084, '2021-05-11 00:01:00+00', '2021-05-31 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (929, '2021-05-26 14:30:24.6811', '2021-06-13 13:50:58.160679', NULL, NULL, 150, 680, 1, 'mentor', 2084, '2021-06-01 23:59:00+00', '2021-06-16 23:59:00+00', 23, NULL, 'JS task', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (945, '2021-06-01 07:37:00.990005', '2021-06-01 07:37:00.990005', NULL, NULL, 120, 89, 1, 'mentor', 2084, '2021-05-21 10:36:00+00', '2021-06-21 23:59:00+00', 23, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (946, '2021-06-01 07:41:10.17798', '2021-06-01 07:41:10.17798', NULL, NULL, 50, 96, 1, 'jury', 2084, '2021-06-22 10:39:00+00', '2021-06-28 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (959, '2021-06-05 07:43:45.453015', '2021-07-20 16:03:20.793296', NULL, NULL, 10, 349, 10, 'mentor', 2084, '2021-06-17 23:59:00+00', '2021-07-26 23:59:00+00', 23, NULL, 'interview', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (976, '2021-06-22 14:41:23.614155', '2021-06-29 13:01:39.053409', NULL, NULL, 360, 693, 1, 'mentor', 2084, '2021-06-17 00:00:00+00', '2021-07-19 23:59:00+00', 23, NULL, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (977, '2021-06-22 14:42:01.434232', '2021-06-27 14:55:32.785863', NULL, NULL, 360, 692, 1, 'mentor', 2084, '2021-06-17 00:00:00+00', '2021-07-07 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (979, '2021-06-23 09:54:07.833539', '2021-07-26 21:01:38.322408', NULL, NULL, 715, 697, 1, 'taskOwner', 2084, '2021-06-30 00:00:00+00', '2021-07-19 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (981, '2021-06-23 09:57:51.078547', '2021-07-17 12:45:15.908329', NULL, NULL, 355, 696, 1, 'mentor', 2084, '2021-07-08 00:00:00+00', '2021-07-15 23:59:00+00', 23, NULL, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (431, '2022-03-27 11:50:14.908491', '2022-03-27 11:50:14.908491', NULL, NULL, 100, 498, 1, 'mentor', NULL, '2022-03-27 11:50:00+00', '2022-03-31 11:50:00+00', 23, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (410, '2020-03-16 12:51:21.596135', '2020-03-31 11:05:14.454307', NULL, NULL, 100, 485, 0.01, 'crossCheck', 3961, '2020-03-10 16:00:00+00', '2020-03-30 20:59:00+00', 13, 4, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (353, '2019-12-03 16:51:35.631349', '2019-12-03 16:51:35.631349', NULL, NULL, 100, 450, 1, 'crossCheck', NULL, '2019-09-30 21:00:00+00', '2019-12-01 20:59:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (424, '2020-03-31 10:21:55.660987', '2020-03-31 10:21:55.660987', NULL, NULL, 75, 493, 0.3, 'crossCheck', 1090, '2020-03-24 20:59:00+00', '2020-04-07 20:59:00+00', 13, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (356, '2019-12-16 09:41:27.698435', '2019-12-24 10:13:38.728977', NULL, NULL, 210, 452, 0.3, 'crossCheck', 606, '2019-12-03 07:39:00+00', '2019-12-22 21:00:00+00', 11, NULL, NULL, false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (425, '2020-03-31 10:25:14.33142', '2020-03-31 10:25:14.33142', NULL, NULL, 100, 494, 0.1, 'crossCheck', 1090, '2020-03-26 20:59:00+00', '2020-04-07 20:59:00+00', 13, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (386, '2020-02-21 10:26:08.19839', '2020-09-24 18:52:15.030419', NULL, NULL, 100, 476, 1, 'crossCheck', 677, '2020-02-11 16:00:00+00', '2020-03-11 20:59:00+00', 13, 1, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (735, '2020-09-28 15:55:30.264', '2020-12-14 11:25:14.054069', NULL, NULL, 60, 573, 1, 'crossCheck', 2084, '2021-04-19 23:59:00+00', '2021-04-26 23:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (737, '2020-09-28 16:02:42.88', '2020-12-14 11:25:04.586605', NULL, NULL, 170, 494, 0.8, 'crossCheck', NULL, '2021-04-26 00:59:00+00', '2021-05-10 23:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (738, '2020-10-15 15:45:25.182', '2020-12-19 07:07:37.406537', NULL, NULL, 50, 572, 1, 'crossCheck', NULL, '2021-04-12 14:00:00+00', '2021-04-21 20:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (739, '2020-09-19 08:04:36.752', '2020-12-19 07:07:06.937443', NULL, NULL, 100, 570, 0.5, 'crossCheck', 2084, '2021-03-08 19:59:00+00', '2021-03-17 20:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (741, '2020-09-28 15:44:17.135', '2020-12-19 07:07:46.233906', NULL, NULL, 100, 576, 1, 'crossCheck', 2084, '2021-03-22 20:59:00+00', '2021-04-19 18:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (742, '2020-09-21 11:23:02.753', '2020-12-19 07:08:07.900162', NULL, NULL, 40, 571, 1, 'crossCheck', 2084, '2021-03-15 10:22:00+00', '2021-04-08 21:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (746, '2020-11-20 07:27:41.543', '2020-12-14 11:24:32.174007', NULL, NULL, 170, 585, 0.8, 'crossCheck', NULL, '2021-05-10 06:27:00+00', '2021-05-31 23:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (753, '2020-12-11 12:23:16.641', '2020-12-14 11:24:19.601754', NULL, NULL, 240, 590, 0.8, 'crossCheck', NULL, '2021-06-01 12:22:00+00', '2021-06-17 00:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (763, '2020-12-19 13:03:24.071742', '2020-12-20 17:50:47.299196', NULL, NULL, 100, 593, 0.2, 'crossCheck', NULL, '2021-02-28 12:00:00+00', '2021-03-14 20:59:00+00', 23, 4, 'cv:html', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (765, '2020-12-19 13:07:08.321506', '2020-12-20 17:50:54.307731', NULL, NULL, 50, 594, 0.5, 'crossCheck', NULL, '2021-02-28 12:06:00+00', '2021-03-14 20:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (821, '2021-02-28 09:07:38.664142', '2021-03-06 09:06:02.437103', NULL, NULL, 100, 593, 0.2, 'crossCheck', 2084, '2021-02-28 10:00:00+00', '2021-03-08 23:59:00+00', 23, 4, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (841, '2021-03-07 16:23:23.776238', '2021-03-07 16:23:23.776238', NULL, NULL, 50, 594, 0.5, 'crossCheck', 2084, '2021-02-28 16:22:00+00', '2021-03-15 23:59:00+00', 23, 4, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (846, '2021-03-16 04:33:39.267072', '2021-03-22 19:29:25.192617', NULL, NULL, 50, 625, 1, 'crossCheck', 2084, '2021-03-16 04:32:00+00', '2021-03-23 01:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (853, '2021-03-29 09:21:34.603711', '2021-04-06 07:55:48.280397', NULL, NULL, 45, 630, 1, 'crossCheck', 2084, '2021-03-23 01:59:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (854, '2021-03-29 20:04:59.336453', '2021-05-20 12:08:18.903322', NULL, NULL, 80, 631, 1, 'crossCheck', 2084, '2021-03-23 19:00:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (855, '2021-03-29 20:05:01.298383', '2021-05-20 12:08:24.067047', NULL, NULL, 80, 632, 1, 'crossCheck', 2084, '2021-03-24 00:00:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (856, '2021-03-29 20:05:04.039062', '2021-05-20 12:08:28.287282', NULL, NULL, 80, 633, 1, 'crossCheck', 2084, '2021-03-23 19:00:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (857, '2021-03-29 20:05:05.992341', '2021-05-20 12:08:32.894051', NULL, NULL, 80, 634, 1, 'crossCheck', 2084, '2021-03-24 00:59:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (858, '2021-03-29 20:05:08.056901', '2021-05-20 12:08:38.903202', NULL, NULL, 80, 635, 1, 'crossCheck', 2084, '2021-03-23 19:00:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (859, '2021-03-29 20:05:09.938253', '2021-05-20 12:08:43.683559', NULL, NULL, 80, 636, 1, 'crossCheck', 2084, '2021-03-23 19:00:00+00', '2021-04-06 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (872, '2021-04-12 08:19:58.924614', '2021-04-19 18:00:57.980059', NULL, NULL, 100, 642, 1, 'crossCheck', 2084, '2021-04-09 15:00:00+00', '2021-04-19 23:59:00+00', 23, 4, 'htmltask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (882, '2021-04-18 16:15:04.361321', '2021-05-20 12:08:50.387079', NULL, NULL, 40, 645, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (883, '2021-04-18 16:15:41.93413', '2021-05-20 12:08:55.719784', NULL, NULL, 40, 646, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (884, '2021-04-18 16:16:24.075893', '2021-05-20 12:09:00.206885', NULL, NULL, 40, 647, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (885, '2021-04-18 16:17:18.716694', '2021-05-20 12:09:04.763147', NULL, NULL, 40, 648, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (886, '2021-04-18 16:18:01.426812', '2021-05-20 12:09:08.62373', NULL, NULL, 40, 649, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (887, '2021-04-18 16:18:36.220548', '2021-05-20 12:09:12.541483', NULL, NULL, 40, 650, 1, 'crossCheck', 2084, '2021-04-18 19:15:00+00', '2021-04-20 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (890, '2021-04-20 07:25:12.840047', '2021-04-20 07:25:12.840047', NULL, NULL, 60, 652, 1, 'crossCheck', 2084, '2021-04-20 10:23:00+00', '2021-04-26 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (907, '2021-05-04 12:48:38.401297', '2021-05-20 12:09:16.982884', NULL, NULL, 80, 664, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (908, '2021-05-04 12:48:40.48278', '2021-05-20 12:09:21.390411', NULL, NULL, 80, 665, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (909, '2021-05-04 12:48:42.458949', '2021-05-20 12:09:25.327968', NULL, NULL, 80, 666, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (910, '2021-05-04 12:48:44.805426', '2021-05-20 12:09:29.619037', NULL, NULL, 80, 667, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (911, '2021-05-04 12:48:47.087144', '2021-05-20 12:09:35.059152', NULL, NULL, 80, 668, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (912, '2021-05-04 12:48:50.871115', '2021-05-20 12:09:40.298413', NULL, NULL, 80, 669, 1, 'crossCheck', 2084, '2021-04-20 20:20:00+00', '2021-05-09 23:59:00+00', 23, 4, 'htmltask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (927, '2021-05-24 07:28:24.474899', '2021-06-01 17:05:25.323429', NULL, NULL, 110, 396, 1, 'crossCheck', 2084, '2021-05-11 00:00:00+00', '2021-06-01 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (967, '2021-06-11 08:06:12.698836', '2021-06-13 13:51:19.609064', NULL, NULL, 190, 688, 1, 'crossCheck', 2084, '2021-06-01 23:59:00+00', '2021-06-16 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (972, '2021-06-20 16:42:18.069437', '2021-06-27 14:54:54.598599', NULL, NULL, 275, 690, 1, 'crossCheck', 2084, '2021-06-16 23:59:00+00', '2021-07-07 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (973, '2021-06-20 16:44:52.184361', '2021-06-28 23:15:32.104315', NULL, NULL, 275, 691, 1, 'crossCheck', 2084, '2021-06-16 23:59:00+00', '2021-07-19 23:59:00+00', 23, 4, 'jstask', true, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (978, '2021-06-22 14:47:29.005674', '2021-07-28 09:44:54.70492', NULL, NULL, 480, 695, 1, 'crossCheck', 2084, '2021-06-30 00:00:00+00', '2021-07-19 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (980, '2021-06-23 09:56:42.176771', '2021-07-09 06:19:59.834533', NULL, NULL, 205, 698, 1, 'crossCheck', 2084, '2021-07-08 00:00:00+00', '2021-07-15 23:59:00+00', 23, 4, 'jstask', false, NULL, NULL, NULL, 'initial', NULL);
INSERT INTO public.course_task VALUES (432, '2023-01-05 09:26:24.846169', '2023-01-05 09:33:56.458716', NULL, NULL, 100, 736, 1, 'crossCheck', NULL, '2023-01-04 00:00:00+00', '2023-01-05 23:59:00+00', 23, 2, 'jstask', false, '2024-01-31 23:59:00+00', NULL, '{}', 'initial', NULL);


--
-- TOC entry 3845 (class 0 OID 16489)
-- Dependencies: 217
-- Data for Name: course_user; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3847 (class 0 OID 16499)
-- Dependencies: 219
-- Data for Name: cv; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3922 (class 0 OID 17529)
-- Dependencies: 294
-- Data for Name: discipline; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.discipline VALUES (1, '2023-01-02 07:50:20.85756', '2023-01-02 07:50:20.85756', NULL, 'JavaScript');


--
-- TOC entry 3849 (class 0 OID 16507)
-- Dependencies: 221
-- Data for Name: discord_server; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.discord_server VALUES (2, '2021-07-28 20:43:54.177877', '2021-07-28 20:43:54.177877', 'CoreJS', 'https://example.com', 'https://t.me');


--
-- TOC entry 3851 (class 0 OID 16517)
-- Dependencies: 223
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.event VALUES (1, '2019-09-12 09:03:02.219291', '2019-09-12 09:03:02.219291', 'Browsers and IDEs + FAQ', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/html-css-basics.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (5, '2019-09-12 09:05:27.226044', '2019-09-12 09:05:27.226044', 'Git Basics', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/git.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (6, '2019-09-12 09:08:12.602314', '2019-09-12 09:08:12.602314', 'Photoshop and Figma for Web Developers', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/photoshop-basics.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (3, '2019-09-12 09:04:42.695298', '2019-09-12 09:09:17.59549', 'RSSchool для гуманитария. Выпуск №1', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rsschool_for_humanities.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (7, '2019-09-12 09:09:38.948815', '2019-09-12 09:09:38.948815', 'RSSchool для гуманитария. Выпуск №2', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rsschool_for_humanities.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (8, '2019-09-12 09:23:12.401849', '2019-09-12 09:23:12.401849', 'Разбор теста и таска по Git. FAQ ', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-cv.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (9, '2019-09-19 07:59:24.096881', '2019-09-19 07:59:24.096881', 'HTML&CSS. Responsive', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (10, '2019-09-19 08:05:36.969405', '2019-09-19 08:05:36.969405', 'Выдача алгоритмических заданий Stage#1', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (11, '2019-09-19 08:14:45.141279', '2019-09-19 08:14:45.141279', 'HTML&CSS. Best Practices.', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (2, '2019-09-12 09:03:32.223067', '2019-09-19 08:18:20.690872', 'HTML&CSS. Basics + FAQ', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/html-css-basics.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (12, '2019-09-19 08:23:21.884826', '2019-09-19 08:23:21.884826', 'Preprocessors. Sass', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (13, '2019-09-19 08:26:27.077797', '2019-09-19 08:26:27.077797', 'Разбор теста по HTML&CSS', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (14, '2019-09-19 08:31:20.979391', '2019-09-19 08:31:20.979391', 'Advanced HTML&CSS. BEM', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (16, '2019-09-19 09:02:38.77527', '2019-09-19 09:02:38.77527', 'JS Intro', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-intro.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (17, '2019-09-19 09:07:16.559406', '2019-09-19 09:07:16.559406', 'JS Data Types', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-data-types.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (18, '2019-09-19 09:11:18.941673', '2019-09-19 09:11:18.941673', 'JS Arrays', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (20, '2019-09-19 09:12:16.974124', '2019-09-19 09:12:16.974124', 'JavaScript DOM', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (21, '2019-09-19 09:19:37.484274', '2019-09-19 09:19:37.484274', 'Разбор алгоритмических заданий Stage#1', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (22, '2019-09-19 09:26:59.759546', '2019-09-19 09:26:59.759546', 'JS Events', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (23, '2019-09-19 09:30:16.440205', '2019-09-19 09:30:16.440205', 'Результаты первого этапа. Ответы на вопросы. Планы на второй этап', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (24, '2019-09-20 08:11:06.308753', '2019-09-20 08:11:06.308753', 'Course overview', 'https://docs.rs.school/#/', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (15, '2019-09-19 09:00:03.042423', '2019-09-20 08:25:06.472219', 'Advanced HTML&CSS. Animations', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (19, '2019-09-19 09:11:47.471902', '2019-09-20 13:18:49.343646', 'Data Structures in JavaScript', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (27, '2019-10-14 13:35:10.786219', '2019-10-14 13:38:25.576464', 'NPM & Node.js Basics', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/rs-online-development.md', '', 'lecture', NULL);
INSERT INTO public.event VALUES (28, '2019-10-14 13:48:15.522269', '2019-10-14 13:48:59.712154', 'JS Scope', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-scope.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (30, '2019-10-14 13:59:15.547123', '2019-10-14 13:59:15.547123', 'CodeJam Canvas. Q&A', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (31, '2019-10-14 14:09:36.422681', '2019-10-14 14:09:36.422681', 'Chrome DevTools', 'https://developers.google.com/web/tools/chrome-devtools/javascript/', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (32, '2019-10-14 14:13:18.279154', '2019-10-14 14:13:18.279154', 'JS Functions. Part 2', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-functions-part-two.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (29, '2019-10-14 13:48:50.052181', '2019-10-14 14:13:26.039738', 'JS Functions. Part 1', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-functions.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (36, '2019-10-15 11:46:57.892947', '2019-10-15 11:46:57.892947', 'Inheritance in JavaScript. ES6 Classes.', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/inheritance-in-js-and-es6-classes.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (42, '2019-10-15 12:04:38.891898', '2019-10-15 12:04:38.891898', 'Webpack. Assets management. Project Structure.', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/webpack.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (43, '2019-10-15 12:05:48.213974', '2019-10-15 12:05:48.213974', 'YouTube Bootstrap', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (41, '2019-10-15 12:03:06.56827', '2019-10-15 13:02:52.918044', 'JS Test Retro', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (39, '2019-10-15 11:56:46.945285', '2019-10-15 13:03:02.676299', ' Code Jam "DRAW API" Retro. FAQ Promises & http', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (38, '2019-10-15 11:53:52.332397', '2019-11-13 09:57:07.382732', 'Event Loop. Animation', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/event-loop-and-animations.md', NULL, 'lecture_self_study', NULL);
INSERT INTO public.event VALUES (44, '2019-10-15 13:18:35.530519', '2019-10-15 13:18:35.530519', 'Interview Q&A / Stage#2 Lectures Test. Retro', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (45, '2019-10-15 13:20:19.465082', '2019-10-15 13:39:15.779199', 'TDD, Unit Tests, Quality control. Part 1', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (47, '2019-10-15 13:39:23.817166', '2019-10-15 13:39:23.817166', 'TDD, Unit Tests, Quality control. Part 2', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (48, '2019-10-15 13:42:59.192228', '2019-10-15 13:42:59.192228', 'Task "YouTube" Retro', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (49, '2019-10-15 13:47:21.601106', '2019-10-15 13:47:21.601106', 'Piskel bootstrap', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (50, '2019-10-16 08:52:16.041267', '2019-10-16 08:52:16.041267', 'Code refactoring in the context of ''Piskel clone'' task', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/refactoring.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (51, '2019-10-16 09:34:30.248464', '2019-10-16 09:34:30.248464', 'Unit tests', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (35, '2019-10-15 11:41:04.360314', '2019-11-04 08:03:24.3041', 'JS Callbacks & Promises & async/await', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/promises-game-dev.md', NULL, 'lecture_self_study', NULL);
INSERT INTO public.event VALUES (33, '2019-10-15 11:32:41.327741', '2019-11-04 08:25:48.618847', 'Code Jam "Virtual Keyboard" Retro. DOM FAQ', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (34, '2019-10-15 11:38:40.662901', '2019-11-04 08:40:42.114517', 'ES6 Variables features. ESLint. Airbnb JavaScript Style Guide', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/es6.md', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (40, '2019-10-15 11:59:11.696371', '2019-11-13 10:39:39.24538', 'Modules in JS', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/js-modules.md', NULL, 'lecture_self_study', NULL);
INSERT INTO public.event VALUES (46, '2019-10-15 13:36:34.293902', '2019-11-04 08:47:16.223906', 'Presentation. Grand Final', NULL, '', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (53, '2019-11-13 10:43:47.792601', '2019-11-13 10:43:47.792601', 'RS School Meetup', 'https://community-z.com/events/rss2019q3-meetup1', NULL, 'meetup', NULL);
INSERT INTO public.event VALUES (52, '2019-10-17 08:38:23.683982', '2019-11-13 14:29:26.085033', 'Test: DOM, DOM Events', NULL, 'This test is without score and deadline.', 'warmup', NULL);
INSERT INTO public.event VALUES (37, '2019-10-15 11:51:25.290004', '2019-11-20 10:17:12.401905', 'Network communication', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/http.md', NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (54, '2019-11-13 14:27:35.085726', '2019-11-13 14:32:36.477144', 'Test: http, https2, ajax', '', '', 'warmup', NULL);
INSERT INTO public.event VALUES (55, '2019-11-13 14:59:57.236829', '2019-11-13 14:59:57.236829', 'Test: JS basics', NULL, NULL, 'warmup', NULL);
INSERT INTO public.event VALUES (56, '2019-11-19 13:01:09.061065', '2019-11-19 13:01:09.061065', 'CodeJam "Animation Player". Intro', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (57, '2019-11-20 10:45:11.804413', '2019-11-20 10:48:32.730569', 'Task "Fancy Weather". Retro', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (59, '2019-11-20 11:05:11.612965', '2019-11-20 11:05:11.612965', 'Feedback on Mentors', 'https://app.rs.school/gratitude?course=rs-2019-q3', NULL, 'info', NULL);
INSERT INTO public.event VALUES (63, '2020-02-17 08:36:47.634937', '2020-02-17 08:36:47.634937', 'Angular course intro. TypeScript & Angular basics', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (64, '2020-02-17 08:37:21.305157', '2020-02-17 08:37:21.305157', 'Angular. Components', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (65, '2020-02-17 08:37:43.212378', '2020-02-17 08:37:43.212378', 'Angular. Directives & Pipes', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (66, '2020-02-17 08:38:23.367356', '2020-02-17 08:38:23.367356', 'Angular. Task #1 review', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (4, '2019-09-12 09:04:58.808458', '2020-03-23 10:47:18.744158', 'HTML&CSS Basics', NULL, NULL, 'lecture', NULL);
INSERT INTO public.event VALUES (67, '2020-02-17 08:39:33.33246', '2020-02-17 08:39:33.33246', 'Angular. Modules & Services', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (68, '2020-02-17 08:39:41.807016', '2020-02-17 08:39:41.807016', 'Angular. Routing', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (69, '2020-02-17 08:39:56.469453', '2020-02-17 08:39:56.469453', 'Angular. Task #2 review', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (70, '2020-02-17 08:40:12.090089', '2020-02-17 08:40:12.090089', 'Angular. RxJS & Observables', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (72, '2020-02-17 08:40:24.125896', '2020-02-17 08:40:24.125896', 'Angular. HTTP', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (73, '2020-02-17 08:40:37.099773', '2020-02-17 08:40:37.099773', 'Angular. Task #3 review', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (74, '2020-02-17 08:40:51.31546', '2020-02-17 08:40:51.31546', 'Angular. Redux & NgRx', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (75, '2020-02-17 08:42:30.658576', '2020-02-17 08:42:30.658576', 'Angular. CodeJam "Culture Portal". Intro', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (76, '2020-02-17 08:42:41.662791', '2020-02-17 08:42:41.662791', 'Angular. Unit testing', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (78, '2020-02-17 12:36:52.791254', '2020-02-17 12:36:52.791254', 'Git for Android developers', 'https://www.youtube.com/watch?v=J1tDWhbf-Gs', NULL, 'lecture_self_study', NULL);
INSERT INTO public.event VALUES (79, '2020-02-17 12:39:28.042076', '2020-02-26 11:02:46.29792', 'Java for Android developers', 'https://www.youtube.com/watch?v=XsbCDeCA9p0', 'Java (syntax, base data types, Object class and methods, GC)', 'lecture_online', NULL);
INSERT INTO public.event VALUES (124, '2020-02-27 20:45:01.821927', '2020-02-27 20:45:01.821927', 'Angular. Task #4 review', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (80, '2020-02-17 12:40:54.525405', '2020-03-11 11:45:16.464869', 'Kotlin for Android developers', 'https://www.youtube.com/watch?v=mbA8EQZSjTk', 'Kotlin (syntax, base data types, differencies form Java)', 'lecture_online', NULL);
INSERT INTO public.event VALUES (81, '2020-02-17 12:42:37.911916', '2020-03-11 11:50:46.082372', 'Collections for Android developers', 'https://www.youtube.com/watch?v=6HHLqP0_spk', 'Collections(Array, Lists, Queue, Set, HashMap, TreeMap, ArrayMap, SparceArray, boxing, mutable and immutable)', 'lecture_online', NULL);
INSERT INTO public.event VALUES (82, '2020-02-17 12:44:59.94523', '2020-03-11 11:55:59.980381', 'Advanced Java and Kotlin for Android developers', 'https://www.youtube.com/watch?v=mh6LV9aBypo', 'Generics. Static and Dynamic binding. Generics in Kotlin. (SOLID, Clean Code).', 'lecture_online', NULL);
INSERT INTO public.event VALUES (83, '2020-02-17 12:49:12.081105', '2020-03-11 12:03:58.296963', 'Base Android Components Overview', 'https://www.youtube.com/watch?v=KINkdbIfwdU', 'App Manifest (Data Backup, Permissions, App Components overview)', 'lecture_online', NULL);
INSERT INTO public.event VALUES (125, '2020-03-19 09:18:54.244884', '2020-03-19 09:18:54.244884', '[iOS] Quiz', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (126, '2020-06-08 16:27:06.413013', '2020-06-08 16:29:35.410611', '[iOS] Multithreading basics, NSOperation/GCD overview full functionality (part 1)', NULL, 'Multithreading', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (127, '2020-06-08 16:30:18.594107', '2020-06-08 16:30:18.594107', '[iOS] Multithreading basics, NSOperation/GCD overview full functionality (part 2)', NULL, 'Multithreading', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (128, '2020-06-08 16:35:16.780715', '2020-06-08 16:35:16.780715', '[iOS] App Sandbox and Bundle, NSUserDefaults, read/writing to file', NULL, 'App Sandbox and Bundle, NSUserDefaults, read/writing to file', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (129, '2020-06-08 16:35:53.342328', '2020-06-08 16:35:53.342328', '[iOS] Networking (CRUD, JSON, XML), NSURLSession', NULL, 'Networking (CRUD, JSON, XML), NSURLSession', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (130, '2020-06-08 16:36:22.196423', '2020-06-08 16:36:22.196423', '[iOS] Animations (UIView animation, CALayer animation ...)', NULL, 'Animations (UIView animation, CALayer animation ...)', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (131, '2020-06-08 16:36:47.014748', '2020-06-08 16:36:47.014748', '[iOS] Unit Tests (OCMock, XCTest)', NULL, 'Unit Tests (OCMock, XCTest)', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (132, '2020-06-08 16:37:12.751094', '2020-06-08 16:37:12.751094', '[iOS] SQLLite', NULL, 'SQLLite', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (133, '2020-06-08 16:37:35.982116', '2020-06-08 16:37:35.982116', '[iOS] Core Data', NULL, 'Core Data', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (134, '2020-06-08 16:38:01.843965', '2020-06-08 16:38:01.843965', '[iOS] CocoaPods', NULL, 'CocoaPods', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (136, '2020-06-08 16:40:17.139789', '2020-07-24 07:20:19.886061', '[iOS, Android] Patterns part2, (Adaptor, Bridge, Decorator, Facade, Proxy, MVP)', 'https://youtu.be/Dh1ktKpq9Fc', 'Adaptor, Bridge, Decorator, Facade, Proxy, MVP', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (137, '2020-06-08 16:41:04.611035', '2021-04-17 22:16:20.70863', '[iOS, Android] Patterns part1, (Factory Method, Abstact Factory,  Bulder, Singleton,  MVC)', 'https://www.youtube.com/watch?v=oMjzSNIbkg8', 'Factory Method, Abstact Factory,  Bulder, Singleton,  MVC', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (138, '2020-06-08 16:41:38.872838', '2020-08-04 19:40:39.79378', '[iOS, Android] Patterns part3, (Observer, Strategy, Command, State, MVVM)', 'https://youtu.be/dbdqeZ17E-4', 'Observer, Strategy, Command, State, MVVM', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (139, '2020-06-08 16:42:23.750115', '2020-07-30 14:20:12.261478', '[iOS, Android] Patterns part4, Inversion of Control (dependency injection, Service Locator), GRASP', 'https://www.youtube.com/watch?v=lKX_jw052Yk&feature=youtu.be', 'dependency injection, Service Locator, GRASP', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (140, '2020-06-08 18:45:58.708297', '2020-06-09 10:20:02.88197', '[Android] Storage Part 1 (FileStorage, FileProvider, External and Internal Storage, SharedPreferencies, PreferenceFragment)', 'https://www.youtube.com/watch?v=y9pRcpRb9aE', NULL, 'lecture_self_study', NULL);
INSERT INTO public.event VALUES (141, '2020-06-08 18:46:10.614889', '2020-06-08 18:46:10.614889', '[iOS] Swift, part 1 (Initialization, property, types, class)', NULL, 'Swift, part 1', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (142, '2020-06-08 18:46:25.265151', '2020-06-11 11:57:49.773017', '[Android] Storage Part 2(SQLite, pain of Cursor)', 'https://www.youtube.com/watch?v=latY2xfh2OY', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (143, '2020-06-08 18:46:50.319888', '2020-06-08 18:46:50.319888', '[iOS] Swift, part 2 (Enums, Protocols, Extensions)', NULL, 'Swift, part 2', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (144, '2020-06-08 18:47:48.716992', '2020-06-08 18:47:48.716992', '[iOS] Swift, part 3 (Collections, Closures)', NULL, 'Swift, part 3', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (145, '2020-06-08 18:48:42.307624', '2020-06-08 18:48:42.307624', '[iOS] Swift,  part 4 (Generics)', NULL, 'Swift,  part 4', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (146, '2020-06-08 18:48:59.453278', '2020-06-16 11:02:49.978649', '[Android] Storage Part 3(ORM: ORMLite, GreenDao)', 'https://www.youtube.com/watch?v=fcJvn5MpBoY&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (147, '2020-06-08 18:49:18.177322', '2020-06-08 18:49:18.177322', '[iOS] Swift, part 5 (Error handling, ARC, Access levels)', NULL, 'Swift, part 5', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (148, '2020-06-08 18:50:11.211062', '2020-06-08 18:50:11.211062', '[iOS] Swift, part 6 (UnitTests, UITests)', NULL, 'Swift, part 6', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (149, '2020-06-08 18:51:07.115575', '2020-07-07 14:31:49.785689', '[Android] Demo: Creating settings screen with PreferenceFragment', 'https://www.youtube.com/watch?v=lcPO4sPUmQ0&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (150, '2020-06-08 18:53:19.739061', '2020-06-23 14:43:24.657466', '[Android] Storage Part 4 (Realm, NoSQL, Firebase database, Firestore)', 'https://www.youtube.com/watch?v=RiQ0Fq9drpQ&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (151, '2020-06-08 18:54:32.119471', '2020-06-25 14:43:07.646511', '[Android] Storage Part 5 (Room and LiveData overview)', 'https://www.youtube.com/watch?v=rSt4vlCr06k&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (152, '2020-06-08 18:56:38.906763', '2020-06-30 14:01:23.917011', '[Android] Demo: Firestore', 'https://www.youtube.com/watch?v=Zu_GLyYD_Zk&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (153, '2020-06-08 18:58:27.500847', '2020-07-02 09:17:56.488663', '[Android] Networking (CRUD, JSON, XML), HttpUrlConnection, OkHttp', 'https://www.youtube.com/watch?v=8MvM47n3inw&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (154, '2020-06-08 18:59:56.539253', '2020-07-07 14:27:16.387969', '[Android] REST, Retrofit, Gson, Moshi, GraphQL overview', 'https://www.youtube.com/watch?v=7qI-W6qI8T4&feature=youtu.be', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (155, '2020-06-08 19:01:19.319504', '2020-07-09 10:55:59.44469', '[Android] Quality Assurance (Detekt, ktlint, AndroidLint, SonarQube, CI basics)', 'https://youtu.be/csWGsOK2xYk', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (156, '2020-06-08 19:04:43.156329', '2020-07-14 14:58:47.045131', '[Android] Demo: Working on the real project', 'https://www.youtube.com/watch?v=TTm_z64fWlk', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (157, '2020-06-08 19:12:19.91916', '2020-07-16 17:00:25.594532', '[Android] Build Configuration (Gradle, groovy vs kotlin, settings, BuildType, BuildFlavor, Plugins, buildSrc)', 'https://youtu.be/B4qoxeGSPOs', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (158, '2020-06-08 19:19:32.3009', '2020-08-04 20:20:43.827678', '[Android] DI (Dagger2, Koin)', 'https://youtu.be/aMwpHwLrxpE', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (159, '2020-06-08 19:20:29.24446', '2020-08-23 13:33:39.790374', '[Android] Clean Architecture, ViewModel and LiveData(MVVM by Google)', 'https://www.youtube.com/watch?v=v6xPnjZAL2U', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (160, '2020-06-08 19:21:44.853351', '2020-08-23 13:34:39.408732', '[Android] ReactiveX, RxJava, RxKotlin, Reaktive', 'https://www.youtube.com/watch?v=Q3e5R6KN1EM', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (161, '2020-06-08 19:23:04.841744', '2020-08-23 13:35:11.981109', '[Android] Kotlin Coroutines and Flow', 'https://www.youtube.com/watch?v=SLW2sm4YA_4', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (162, '2020-06-08 19:25:45.83293', '2020-09-22 08:18:37.263457', '[Android] Android Architecture Components(Lifecycle, Navigation, WorkManager, PagingLibrary, Preference)', 'https://www.youtube.com/watch?v=kShzWyBMjf4&feature=youtu.be&ab_channel=RollingScopesSchool', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (163, '2020-06-08 19:26:46.002742', '2020-09-22 08:51:58.883544', '[Android] Tests (Junit, Mockito, Mockk, Spek2, Espresso)', 'https://youtu.be/4LIgv91S8G8', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (164, '2020-07-21 16:55:08.461138', '2020-07-21 16:55:55.005421', '[iOS, Android] Working on the real project', NULL, 'CD/CI, Scrum, TDD....', 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (165, '2020-07-27 10:31:38.167381', '2021-07-10 22:05:56.133842', 'Angular. HTTP', NULL, NULL, 'workshop', NULL);
INSERT INTO public.event VALUES (166, '2020-08-05 09:25:59.634529', '2020-08-05 09:25:59.634529', 'Angular. Task #5 review', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (167, '2021-01-18 20:30:53.435008', '2021-01-18 20:30:53.435008', 'Angular. Final task "RS Lang". Intro', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (168, '2021-04-17 21:16:46.854068', '2021-07-27 21:10:20.762053', '[iOS] Swift: Fundamentals, part1 (Classes, Structs, Init, Deinit)', 'https://youtu.be/bbDZ3vBjq-s', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (169, '2021-04-17 21:18:00.021065', '2021-07-27 21:10:33.318624', '[iOS] Swift: Fundamentals, part2 (Protocols, Extensions, Access control)', 'https://youtu.be/Zem7azTDTfA', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (170, '2021-04-17 21:19:09.995838', '2021-07-27 21:10:48.661699', '[iOS] Swift: Enum, Optionals, Properties', 'https://youtu.be/ecBhz5YITG4', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (171, '2021-04-17 21:20:01.309681', '2021-07-27 21:10:59.643765', '[iOS] Swift: Collections', 'https://youtu.be/N0HDxnj8zuo', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (172, '2021-04-17 21:21:04.644787', '2021-07-27 21:11:52.391729', '[iOS] Swift: Type casting, Nesting types, Opaque type', 'https://youtu.be/skD3iO-l6Lw', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (173, '2021-04-17 21:21:32.675193', '2021-07-27 21:11:34.326737', '[iOS] Swift: Closures', 'https://youtu.be/DqqrkbU6Csc', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (174, '2021-04-17 21:21:57.787204', '2021-07-27 21:12:05.272894', '[iOS] Swift: Generics', 'https://youtu.be/OkvvfNuhRrM', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (175, '2021-04-17 21:22:21.683772', '2021-07-27 21:12:16.2674', '[iOS] Swift: ARC, Error handling', 'https://youtu.be/I520sje9g7M', NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (176, '2021-04-17 21:32:33.51823', '2021-07-27 21:18:02.98113', '[iOS] Stage 1', 'https://youtu.be/NjE4LVIcpQI', NULL, 'info', NULL);
INSERT INTO public.event VALUES (177, '2021-04-17 21:32:52.407919', '2021-04-17 21:32:52.407919', '[iOS] Stage 2', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (178, '2021-04-17 21:33:08.809654', '2021-04-17 21:33:08.809654', '[iOS] Stage 3', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (179, '2021-04-17 22:07:11.429289', '2021-04-17 22:07:11.429289', '[iOS] Unit Tests (ObjC: OCMock, XCTest, Swift: Quick, Nimble)', NULL, NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (180, '2021-04-17 22:11:36.745265', '2021-04-17 22:11:36.745265', '[iOS] CocoaPods, Swift Package Manager (SPM)', NULL, NULL, 'lecture_mixed', NULL);
INSERT INTO public.event VALUES (181, '2021-04-17 22:19:11.535059', '2021-04-17 22:19:11.535059', '[iOS] Assessment period', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (182, '2021-04-18 17:22:05.305628', '2021-04-18 17:22:05.305628', '[iOS] Final Task - Assessment', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (183, '2021-04-18 17:24:53.506302', '2021-04-18 17:24:53.506302', '[iOS] Result (Summarize)', NULL, NULL, 'info', NULL);
INSERT INTO public.event VALUES (184, '2021-05-24 07:20:56.730632', '2021-05-24 07:20:56.730632', 'Software design principles. SOLID', 'https://www.youtube.com/rollingscopesschool', 'a.        Single Responsibility Principle 
b.        Open-Closed Principle
c.        Liskov Substitution Principle 
d.        Interface Segregation Principle 
e.        Dependency Inversion Principle', 'Online Lecture', NULL);
INSERT INTO public.event VALUES (185, '2021-06-22 11:41:18.759195', '2021-06-22 11:41:18.759195', 'Q&A: Шахматы + English for kids', 'https://youtube.com', 'Ответы на вопросы по новому заданию', 'lecture_online', NULL);
INSERT INTO public.event VALUES (186, '2021-06-22 14:07:40.862461', '2021-06-22 14:07:40.862461', 'Выдача сертификатов stage#2', 'https://docs.rs.school/#/rs-school-certificate', NULL, 'Info', NULL);
INSERT INTO public.event VALUES (187, '2021-06-25 08:57:13.764023', '2021-07-23 10:09:43.479324', 'Знакомство с RS School и профессией "JS/Front-end разработчик"', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0/modules/js-fe-developer', NULL, 'Online Lecture', NULL);
INSERT INTO public.event VALUES (188, '2021-06-25 11:09:37.325536', '2021-07-13 17:03:02.123734', 'Q&A Stage#0', 'https://docs.google.com/spreadsheets/d/1QXlD5uknJLDjYmPcRhSqaKAw8VACwypvGOuXy-MFaYs/edit#gid=0', NULL, 'Online Lecture', NULL);
INSERT INTO public.event VALUES (189, '2021-06-25 11:17:15.225806', '2021-06-25 11:17:15.225806', 'NodeJS. Live Coding', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (190, '2021-06-29 07:21:48.844085', '2021-06-29 07:22:21.456235', 'Chrome Dev Tools и VS Code', 'https://github.com/rolling-scopes-school/tasks/tree/roadmap/stage0/modules/basic-tools', NULL, 'Online Lecture', NULL);
INSERT INTO public.event VALUES (191, '2021-06-30 12:27:36.94908', '2021-06-30 12:27:36.94908', 'Stage#0. Неделя #1', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-1', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (192, '2021-06-30 12:43:17.150567', '2021-06-30 12:43:17.150567', 'Refactoring Lecture', NULL, NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (193, '2021-07-01 14:03:58.0844', '2021-07-01 14:03:58.0844', 'Stage#0. Неделя #2', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-2', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (194, '2021-07-01 14:04:43.442034', '2021-07-01 14:04:43.442034', 'Stage#0. Неделя #3', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-3', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (195, '2021-07-01 14:05:29.684334', '2021-07-01 14:05:29.684334', 'Stage#0. Неделя #4', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-4', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (196, '2021-07-01 14:06:12.526154', '2021-07-01 14:06:12.526154', 'Stage#0. Неделя #5', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-5', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (197, '2021-07-01 14:08:08.564507', '2021-07-01 14:08:08.564507', 'Stage#0. Неделя #6', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-6', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (198, '2021-07-01 14:08:56.268658', '2021-07-01 14:08:56.268658', 'Stage#0. Неделя #7', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-7', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (199, '2021-07-01 14:10:04.277781', '2021-07-01 14:10:04.277781', 'Stage#0. Неделя #8', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-8', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (200, '2021-07-01 14:11:13.939302', '2021-07-01 14:13:55.089393', 'Stage#0. Неделя #9', 'https://github.com/rolling-scopes-school/tasks/tree/master/stage0#%D0%BD%D0%B5%D0%B4%D0%B5%D0%BB%D1%8F-9', NULL, 'Self-studying', NULL);
INSERT INTO public.event VALUES (201, '2021-07-05 20:57:07.500082', '2021-07-07 15:21:56.6395', 'Node.js Basic', 'https://youtube.com', NULL, 'lecture_online', NULL);
INSERT INTO public.event VALUES (202, '2021-07-06 09:38:49.342292', '2021-07-08 06:13:01.627643', 'Cross-Check deadline: English for kids S1E1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md', NULL, 'Cross-Check deadline', NULL);
INSERT INTO public.event VALUES (204, '2021-07-13 02:28:26.44619', '2021-07-27 02:50:11.112532', 'React Stream. Components', 'https://docs.google.com/document/d/1WLWjBiVMjsVADf5FWFYfPObQOrLD1624h5etyafCfr8/edit?usp=sharing', 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1qSfNHkOLqK6XXliXJDbY5QL7c9reWYrsxNaTPZjgQ4o/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (205, '2021-07-13 02:29:41.009407', '2021-07-27 03:37:03.415482', 'React Stream. Forms', 'https://docs.google.com/document/d/1C490mF-CzPkr2552nDcj3W3NJmrzXJKFBSs4C_Vg_cM/edit?usp=sharing', 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1wvdN5bmMcnXM_sc4l5NmOvrgM428fCf17PcwwH996Dg/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (206, '2021-07-13 02:30:59.860857', '2021-07-13 02:30:59.860857', 'React Stream. API', NULL, 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/10WdCIZj6u2dLJm1Nn7UYt5rznLds42mxsjjJLJpYxvk/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (207, '2021-07-13 02:32:06.692641', '2021-07-27 03:48:48.693306', 'React Stream. Redux', 'https://docs.google.com/document/d/11SOrFH5RSSmSaJia5XbeD02hJVwY5fsc1PJwEbOXg_A/edit?usp=sharing', 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1uxAgIrKso99fhi3svvIeWMTlyrLRByJhOTC0ttAMxeM/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (208, '2021-07-13 02:33:12.930287', '2021-07-27 03:46:43.586183', 'React Stream. Routing', 'https://docs.google.com/document/d/1SrT0rl-YG0cMheXgHsI3H2u8hCKCImEYiFvQsnOw9Q8/edit?usp=sharing', 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/14czN-v9qQMKfRGfwHHiFki0pA8kgRUKw3dd_7ZW8jyA/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (209, '2021-07-13 02:34:19.795533', '2021-07-13 02:34:19.795533', 'React Stream. Testing', NULL, 'Spreadsheet for questions: https://docs.google.com/spreadsheets/d/1z5_B3-UA3R4-GtTm2hnqMEPBSDmkcZbd6sVsKLVzI5w/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (210, '2021-07-13 02:42:32.368104', '2021-07-13 02:42:32.368104', 'React Streaming. SSR', NULL, 'Questions: https://docs.google.com/spreadsheets/d/1z4B3WLStS0UME0ok-Prm2KUPc_fFVS34Q7dJALI3E64/edit?usp=sharing', 'lecture_online', NULL);
INSERT INTO public.event VALUES (211, '2021-07-13 18:54:42.565201', '2021-07-16 13:18:08.778557', 'Git for beginners', NULL, 'Introduction to Git', 'Online Lecture', NULL);
INSERT INTO public.event VALUES (212, '2021-07-16 11:12:11.167369', '2021-07-16 11:12:44.404702', 'Cross-Check deadline: English for kids S1E2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md', NULL, 'Cross-Check deadline', NULL);
INSERT INTO public.event VALUES (213, '2021-07-20 13:47:14.868153', '2021-07-20 13:49:26.368869', 'Cross-check deadline: Chess S1E2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md', NULL, 'Cross-Check deadline', NULL);
INSERT INTO public.event VALUES (135, '2022-03-27 12:11:38.539172', '2022-03-27 12:11:38.539172', '11', 'https://hello.com', NULL, 'Offline Lecture', NULL);
INSERT INTO public.event VALUES (203, '2022-03-27 12:12:46.314579', '2022-03-27 12:12:46.314579', '11', 'https://hello.com', NULL, 'Offline Lecture', NULL);


--
-- TOC entry 3853 (class 0 OID 16528)
-- Dependencies: 225
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3920 (class 0 OID 17504)
-- Dependencies: 292
-- Data for Name: history; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.history VALUES (1, '2023-01-05 09:26:24.86279', '2023-01-05 09:26:24.86279', 'course_task', 432, 'insert', '{"studentStartDate":"2023-01-04 00:00+00:00","studentEndDate":"2023-01-05 23:59+00:00","crossCheckEndDate":"2023-01-21 23:59+00:00","taskId":736,"checker":"crossCheck","scoreWeight":1,"maxScore":100,"type":"jstask","pairsCount":2,"validations":{},"courseId":23,"id":432,"createdDate":"2023-01-05T09:26:24.846Z","updatedDate":"2023-01-05T09:26:24.846Z","disabled":false,"crossCheckStatus":"initial"}', NULL);
INSERT INTO public.history VALUES (2, '2023-01-05 09:33:56.442521', '2023-01-05 09:33:56.442521', 'course_task', 432, 'update', '{"studentStartDate":"2023-01-04 00:00+00:00","studentEndDate":"2023-01-05 23:59+00:00","crossCheckEndDate":"2024-01-31 23:59+00:00","taskId":736,"checker":"crossCheck","scoreWeight":1,"maxScore":100,"type":"jstask","pairsCount":2,"submitText":null,"validations":{},"courseId":23,"id":432}', '{"id":432,"createdDate":"2023-01-05T09:26:24.846Z","updatedDate":"2023-01-05T09:26:24.846Z","taskId":736,"courseId":23,"studentStartDate":"2023-01-04T00:00:00.000Z","studentEndDate":"2023-01-05T23:59:00.000Z","crossCheckEndDate":"2023-01-21T23:59:00.000Z","mentorStartDate":null,"mentorEndDate":null,"maxScore":100,"scoreWeight":1,"checker":"crossCheck","taskOwnerId":null,"pairsCount":2,"type":"jstask","disabled":false,"crossCheckStatus":"initial","submitText":null,"validations":{}}');


--
-- TOC entry 3855 (class 0 OID 16539)
-- Dependencies: 227
-- Data for Name: interview_question; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3856 (class 0 OID 16547)
-- Dependencies: 228
-- Data for Name: interview_question_categories_interview_question_category; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3857 (class 0 OID 16550)
-- Dependencies: 229
-- Data for Name: interview_question_category; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3860 (class 0 OID 16562)
-- Dependencies: 232
-- Data for Name: login_state; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3861 (class 0 OID 16569)
-- Dependencies: 233
-- Data for Name: mentor; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.mentor VALUES (1266, '2020-04-06 15:39:35.609875', '2020-04-06 15:39:35.609875', NULL, 13, 2595, NULL, false);
INSERT INTO public.mentor VALUES (1267, '2020-04-06 15:39:40.768722', '2020-04-06 15:39:40.768722', NULL, 13, 2612, NULL, false);
INSERT INTO public.mentor VALUES (1268, '2020-04-06 15:39:46.991811', '2020-04-06 15:39:46.991811', NULL, 13, 2084, NULL, false);
INSERT INTO public.mentor VALUES (1269, '2020-04-06 15:39:51.547456', '2020-04-06 15:39:51.547456', NULL, 13, 2032, NULL, false);
INSERT INTO public.mentor VALUES (1272, '2020-04-06 15:39:35.609875', '2020-04-06 15:39:35.609875', NULL, 23, 2595, NULL, false);
INSERT INTO public.mentor VALUES (1273, '2020-04-06 15:39:40.768722', '2020-04-06 15:39:40.768722', NULL, 23, 2612, NULL, false);
INSERT INTO public.mentor VALUES (1274, '2020-04-06 15:39:46.991811', '2020-04-06 15:39:46.991811', NULL, 23, 2084, NULL, false);
INSERT INTO public.mentor VALUES (1275, '2020-04-06 15:39:51.547456', '2020-04-06 15:39:51.547456', NULL, 23, 2032, NULL, false);


--
-- TOC entry 3863 (class 0 OID 16580)
-- Dependencies: 235
-- Data for Name: mentor_registry; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3865 (class 0 OID 16595)
-- Dependencies: 237
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.migrations VALUES (1, 1630340371992, 'UserMigration1630340371992');
INSERT INTO public.migrations VALUES (2, 1630341383942, 'TaskResult1630341383942');
INSERT INTO public.migrations VALUES (3, 1630342025950, 'StudentMigration1630342025950');
INSERT INTO public.migrations VALUES (4, 1630342266002, 'UserMigration1630342266002');
INSERT INTO public.migrations VALUES (5, 1630347897950, 'StudentMigration1630347897950');
INSERT INTO public.migrations VALUES (6, 1632333725126, 'ResumeMigration1632333725126');
INSERT INTO public.migrations VALUES (7, 1635365797478, 'User1635365797478');
INSERT INTO public.migrations VALUES (8, 1637591194886, 'StageInterview1637591194886');
INSERT INTO public.migrations VALUES (9, 1639418471577, 'Indicies1639418471577');
INSERT INTO public.migrations VALUES (10, 1638302439645, 'CourseMigration1638302439645');
INSERT INTO public.migrations VALUES (11, 1639427578702, 'Update1639427578702');
INSERT INTO public.migrations VALUES (12, 1639502600339, 'Student1639502600339');
INSERT INTO public.migrations VALUES (13, 1642884123347, 'ResumeSelectCourses1642884123347');
INSERT INTO public.migrations VALUES (14, 1643481312933, 'Task1643481312933');
INSERT INTO public.migrations VALUES (15, 1643550350939, 'LoginState1643550350939');
INSERT INTO public.migrations VALUES (16, 1643926895264, 'Notifications1643926895264');
INSERT INTO public.migrations VALUES (17, 1644695410918, 'NotificationConnection1644695410918');
INSERT INTO public.migrations VALUES (18, 1645364514538, 'RepositoryEvent1645364514538');
INSERT INTO public.migrations VALUES (19, 1645654601903, 'Opportunitites1645654601903');
INSERT INTO public.migrations VALUES (20, 1647175301446, 'TaskSolutionConstraint1647175301446');
INSERT INTO public.migrations VALUES (21, 1647550751147, 'NotificationType1647550751147');
INSERT INTO public.migrations VALUES (22, 1647885219936, 'LoginStateUserId1647885219936');
INSERT INTO public.migrations VALUES (23, 1647103154082, 'CrossCheckScheduling1647103154082');
INSERT INTO public.migrations VALUES (24, 1649505252996, 'CourseLogo1649505252996');
INSERT INTO public.migrations VALUES (25, 1649868994688, 'CourseLogo1649868994688');
INSERT INTO public.migrations VALUES (26, 1650652882300, 'DiscordChannel1650652882300');
INSERT INTO public.migrations VALUES (27, 1652870756742, 'Resume1652870756742');
INSERT INTO public.migrations VALUES (28, 1656326258991, 'History1656326258991');
INSERT INTO public.migrations VALUES (29, 1661034658479, 'Feedback1661034658479');
INSERT INTO public.migrations VALUES (30, 1661087975938, 'Discipline1661087975938');
INSERT INTO public.migrations VALUES (31, 1661106736439, 'Disciplines1661106736439');
INSERT INTO public.migrations VALUES (32, 1661107174477, 'Disciplines1661107174477');
INSERT INTO public.migrations VALUES (33, 1661616212488, 'NotificationCategory1661616212488');
INSERT INTO public.migrations VALUES (34, 1662275601017, 'CourseTask1662275601017');
INSERT INTO public.migrations VALUES (35, 1664183799115, 'CourseEvent1664183799115');
INSERT INTO public.migrations VALUES (36, 1666348642811, 'TaskCriteria1666348642811');
INSERT INTO public.migrations VALUES (37, 1666621080327, 'TaskSolutionResult1666621080327');
INSERT INTO public.migrations VALUES (38, 1672142743107, 'TeamDistribution1672142743107');
INSERT INTO public.migrations VALUES (39, 1672386450861, 'TeamDistribution1672386450861');
INSERT INTO public.migrations VALUES (40, 1671475396333, 'Tasks1671475396333');


--
-- TOC entry 3867 (class 0 OID 16603)
-- Dependencies: 239
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.notification VALUES ('mentorRegistrationApproval', 'Mentor registration approval', '2022-02-18 21:19:53.292291', '2022-02-18 21:19:53.292291', 'mentor', false, NULL);
INSERT INTO public.notification VALUES ('taskGrade', 'Task grade received', '2022-02-18 21:19:53.292291', '2022-02-18 21:19:53.292291', 'student', false, NULL);


--
-- TOC entry 3868 (class 0 OID 16613)
-- Dependencies: 240
-- Data for Name: notification_channel; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.notification_channel VALUES ('email', '2022-02-18 21:19:53.292291', '2022-02-18 21:19:53.292291');
INSERT INTO public.notification_channel VALUES ('telegram', '2022-02-18 21:19:53.292291', '2022-02-18 21:19:53.292291');
INSERT INTO public.notification_channel VALUES ('discord', '2022-12-30 07:46:56.690709', '2022-12-30 07:46:56.690709');


--
-- TOC entry 3869 (class 0 OID 16621)
-- Dependencies: 241
-- Data for Name: notification_channel_settings; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3870 (class 0 OID 16629)
-- Dependencies: 242
-- Data for Name: notification_user_connection; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3871 (class 0 OID 16638)
-- Dependencies: 243
-- Data for Name: notification_user_settings; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3872 (class 0 OID 16646)
-- Dependencies: 244
-- Data for Name: private_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3874 (class 0 OID 16656)
-- Dependencies: 246
-- Data for Name: profile_permissions; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3876 (class 0 OID 16679)
-- Dependencies: 248
-- Data for Name: registry; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.registry VALUES (8953, 'student', 'approved', '2020-04-06 15:15:02.782811', '2020-04-06 15:15:02.782811', 11563, 13, '{}');
INSERT INTO public.registry VALUES (8954, 'student', 'approved', '2020-04-06 15:30:27.1162', '2020-04-06 15:30:27.1162', 677, 13, '{}');
INSERT INTO public.registry VALUES (8955, 'student', 'approved', '2020-04-06 15:31:44.431228', '2020-04-06 15:31:44.431228', 1090, 13, '{}');
INSERT INTO public.registry VALUES (8956, 'student', 'approved', '2023-01-02 07:51:17.217188', '2023-01-02 07:51:17.217188', 2595, 23, '{}');


--
-- TOC entry 3878 (class 0 OID 16691)
-- Dependencies: 250
-- Data for Name: repository_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3880 (class 0 OID 16701)
-- Dependencies: 252
-- Data for Name: resume; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3882 (class 0 OID 16713)
-- Dependencies: 254
-- Data for Name: stage; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3884 (class 0 OID 16724)
-- Dependencies: 256
-- Data for Name: stage_interview; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.stage_interview VALUES (10687, '2020-04-07 20:27:20.124459', '2020-04-07 20:27:20.124459', 14327, 1266, NULL, false, NULL, NULL, 13, 408, false);
INSERT INTO public.stage_interview VALUES (10688, '2020-04-07 20:27:41.249823', '2020-04-07 20:27:41.249823', 14329, 1266, NULL, false, NULL, NULL, 13, 408, false);
INSERT INTO public.stage_interview VALUES (10689, '2020-04-07 20:28:00.755084', '2020-04-07 21:07:08.374015', 14329, 1266, NULL, true, 'noButGoodCandidate', true, 13, 408, false);


--
-- TOC entry 3885 (class 0 OID 16734)
-- Dependencies: 257
-- Data for Name: stage_interview_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.stage_interview_feedback VALUES (1234, '2020-04-07 21:07:08.363918', '2020-04-07 21:07:08.363918', 10689, '{"skills":{"htmlCss":{"level":3},"dataStructures":{"array":3,"stack":4},"common":{"binaryNumber":4,"sortingAndSearchAlgorithms":3}},"programmingTask":{"resolved":1,"codeWritingLevel":3},"english":{"levelStudentOpinion":9,"levelMentorOpinion":8},"resume":{"verdict":"noButGoodCandidate","comment":"test"}}');


--
-- TOC entry 3888 (class 0 OID 16746)
-- Dependencies: 260
-- Data for Name: stage_interview_student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.stage_interview_student VALUES (1091, '2020-04-07 21:16:20.362338', '2020-04-07 21:16:20.362338', 14329, 13);
INSERT INTO public.stage_interview_student VALUES (1092, '2023-01-04 08:06:59.152621', '2023-01-04 08:06:59.152621', 14347, 23);


--
-- TOC entry 3890 (class 0 OID 16753)
-- Dependencies: 262
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.student VALUES (14329, '2020-04-06 15:31:44.421341', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 1090, NULL, NULL, NULL, NULL, false, 32, '2020-04-06 15:31:44.388+00', NULL, NULL, '2021-07-28 21:28:00.058+00', NULL, 1, 0, NULL, true);
INSERT INTO public.student VALUES (14327, '2020-04-06 15:15:02.77565', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 11563, 1266, NULL, NULL, NULL, false, 0, '2020-04-06 15:15:02.757+00', NULL, NULL, NULL, NULL, 2, 0, NULL, true);
INSERT INTO public.student VALUES (14331, '2020-04-06 15:33:59.694437', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2098, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 3, 0, NULL, true);
INSERT INTO public.student VALUES (14332, '2020-04-06 15:34:04.8008', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2103, 1267, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 4, 0, NULL, true);
INSERT INTO public.student VALUES (14333, '2020-04-06 15:34:09.064514', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2115, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 5, 0, NULL, true);
INSERT INTO public.student VALUES (14335, '2020-04-06 15:34:19.221853', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2480, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 6, 0, NULL, true);
INSERT INTO public.student VALUES (14334, '2020-04-06 15:34:17.983101', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2277, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 7, 0, NULL, true);
INSERT INTO public.student VALUES (14336, '2020-04-06 15:39:07.779618', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2549, 1266, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 8, 0, NULL, true);
INSERT INTO public.student VALUES (14330, '2020-04-06 15:33:53.058912', '2021-07-28 21:28:00.086033', false, NULL, false, false, NULL, NULL, 13, 2089, 1266, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 9, 0, NULL, true);
INSERT INTO public.student VALUES (14328, '2020-04-06 15:30:27.104695', '2021-07-28 21:28:00.086033', true, 'test', false, false, NULL, NULL, 13, 677, 1268, NULL, NULL, NULL, false, 0, '2020-04-06 15:30:27.091+00', '2020-04-07 13:34:01.397+00', NULL, NULL, NULL, 10, 0, NULL, true);
INSERT INTO public.student VALUES (14340, '2020-04-06 15:33:53.058912', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2089, 1266, NULL, NULL, NULL, false, 1585, '1970-01-01 00:00:00+00', NULL, NULL, '2021-07-28 21:28:00.124+00', NULL, 1, 0, NULL, true);
INSERT INTO public.student VALUES (14337, '2020-04-06 15:15:02.77565', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 11563, 1266, NULL, NULL, NULL, false, 620, '2020-04-06 15:15:02.757+00', NULL, NULL, '2021-07-28 21:28:00.123+00', NULL, 2, 0, NULL, true);
INSERT INTO public.student VALUES (14346, '2020-04-06 15:39:07.779618', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2549, 1266, NULL, NULL, NULL, false, 560, '1970-01-01 00:00:00+00', NULL, NULL, '2021-07-28 21:28:00.124+00', NULL, 3, 0, NULL, true);
INSERT INTO public.student VALUES (14341, '2020-04-06 15:33:59.694437', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2098, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 4, 0, NULL, true);
INSERT INTO public.student VALUES (14342, '2020-04-06 15:34:04.8008', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2103, 1267, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 5, 0, NULL, true);
INSERT INTO public.student VALUES (14343, '2020-04-06 15:34:09.064514', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2115, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 6, 0, NULL, true);
INSERT INTO public.student VALUES (14345, '2020-04-06 15:34:19.221853', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2480, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 7, 0, NULL, true);
INSERT INTO public.student VALUES (14339, '2020-04-06 15:31:44.421341', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 1090, NULL, NULL, NULL, NULL, false, 0, '2020-04-06 15:31:44.388+00', NULL, NULL, NULL, NULL, 8, 0, NULL, true);
INSERT INTO public.student VALUES (14344, '2020-04-06 15:34:17.983101', '2021-07-28 21:28:00.146524', false, NULL, false, false, NULL, NULL, 23, 2277, NULL, NULL, NULL, NULL, false, 0, '1970-01-01 00:00:00+00', NULL, NULL, NULL, NULL, 9, 0, NULL, true);
INSERT INTO public.student VALUES (14338, '2020-04-06 15:30:27.104695', '2021-07-28 21:28:00.146524', true, 'test', false, false, NULL, NULL, 23, 677, 1268, NULL, NULL, NULL, false, 0, '2020-04-06 15:30:27.091+00', '2020-04-07 13:34:01.397+00', NULL, NULL, NULL, 10, 0, NULL, true);
INSERT INTO public.student VALUES (14347, '2023-01-02 07:51:17.183759', '2023-01-04 13:01:11.090963', false, 'Re-joined course', false, false, NULL, NULL, 23, 2595, NULL, NULL, NULL, NULL, false, 0, '2023-01-02 07:51:17.18+00', NULL, NULL, NULL, NULL, 999999, 0, NULL, true);


--
-- TOC entry 3891 (class 0 OID 16770)
-- Dependencies: 263
-- Data for Name: student_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3928 (class 0 OID 17617)
-- Dependencies: 300
-- Data for Name: student_team_distribution_team_distribution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.student_team_distribution_team_distribution VALUES (14347, 13);


--
-- TOC entry 3929 (class 0 OID 17624)
-- Dependencies: 301
-- Data for Name: student_teams_team; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3894 (class 0 OID 16782)
-- Dependencies: 266
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.task VALUES (441, '2019-10-16 15:05:31.176646', '2019-10-16 15:05:31.176646', 'Technical screening 2', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (413, '2019-08-29 10:57:34.732592', '2019-11-11 18:19:01.013044', 'ST JS Test', 'http://learn.javascript.ru/', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (448, '2019-11-20 10:39:10.274681', '2019-11-20 10:39:10.274681', 'Fancy Weather', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md', NULL, 'manual', true, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (445, '2019-11-13 07:46:32.194939', '2019-12-03 14:41:40.672641', 'Code Jam "Palette"', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-palette/codejam-palette_en.md', NULL, 'manual', true, false, false, NULL, NULL, 'codejam', 'codejam,canvas,dom', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (451, '2019-12-11 17:17:25.352869', '2019-12-11 17:17:25.352869', 'Async-extra', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (454, '2019-12-16 10:37:14.018926', '2019-12-16 10:37:14.018926', 'Typical Arrays Problems', 'https://github.com/Shastel/typical-arrays-problems', NULL, 'auto', false, false, false, 'typical-arrays-problems', 'https://github.com/Shastel/typical-arrays-problems', 'jstask', 'epam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (457, '2019-12-16 10:38:57.10798', '2019-12-16 10:38:57.10798', 'Human Readable Number', 'https://github.com/Shastel/human-readable-number', NULL, 'auto', false, false, false, 'human-readable-number', 'https://github.com/Shastel/human-readable-number', 'jstask', 'epam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (460, '2019-12-20 08:53:52.921362', '2019-12-20 08:53:52.921362', 're:bind', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (417, '2019-09-17 07:09:54.066212', '2020-02-02 09:07:48.746248', 'HTML/CSS Self Education', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/HTML-CSS-self-ru.md', NULL, 'auto', false, false, false, NULL, NULL, 'htmlcssacademy', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (462, '2020-02-07 08:05:04.999374', '2020-02-07 08:05:04.999374', 'Songbird', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (466, '2020-02-11 08:49:28.691804', '2020-02-11 08:49:28.691804', 'ios Test', 'https://test.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (468, '2020-02-17 08:27:20.358749', '2020-02-17 08:28:49.855244', 'Angular. Intro', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/intro.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (471, '2020-02-17 09:19:10.05115', '2020-02-17 09:19:10.05115', 'Angular. RxJS & Observables. HTTP', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/rxjs-observables-http.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (475, '2020-02-19 15:14:40.900394', '2020-02-19 15:22:20.919668', 'Typical Arrays Problems', 'https://github.com/rolling-scopes-school/typical-arrays-problems/blob/master/README.md', NULL, 'auto', false, false, false, 'typical-arrays-problems', 'https://github.com/rolling-scopes-school/typical-arrays-problems', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (473, '2020-02-19 15:13:21.398993', '2020-02-19 15:22:34.391055', 'Human Readable Number', 'https://github.com/rolling-scopes-school/human-readable-number/blob/master/README.md', NULL, 'auto', false, false, false, 'human-readable-number', 'https://github.com/rolling-scopes-school/human-readable-number', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (478, '2020-02-26 06:55:13.604626', '2020-02-26 06:55:24.65169', 'FAKE TEST IOS', 'http://example.com', NULL, 'auto', false, false, false, 'test-solution', 'https://github.com/apalchys/test-solution', 'objctask', 'fake', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (480, '2020-03-02 06:32:37.242366', '2020-03-02 06:32:49.611475', 'React Culture Portal', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-culture-portal.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'portal,react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (477, '2020-02-25 23:21:08.16798', '2020-03-12 17:34:18.306073', 'FAKE TEST KOTLIN', 'http://example.com', NULL, 'auto', false, false, false, 'nadzeya', 'https://github.com/ziginsider/rs_task1', 'kotlintask', 'fake', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (483, '2020-03-15 15:29:20.69008', '2020-03-15 15:29:20.69008', 'Angular test', 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks', NULL, 'auto', false, false, false, NULL, NULL, 'test', 'angular,Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (485, '2020-03-16 12:49:18.137702', '2020-03-16 12:49:18.137702', 'Singolo. DOM & Responsive ', 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (487, '2020-03-19 15:00:38.575898', '2020-03-19 15:04:07.496857', '[iOS] Quiz1', 'https://docs.google.com/forms/d/e/1FAIpQLSf4NwQRa2WbcjlcsDJI0kv62qJx0F0ltgapz0WczFrdBBSXug/viewform', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (416, '2019-09-10 08:14:33.753801', '2019-09-10 08:14:33.753801', 'UZ Custom lodash tests', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/10.-Custom-lodash-tests', NULL, 'manual', false, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (95, '2019-04-26 14:55:46.480357', '2019-08-14 10:45:30.750037', 'CJ "CSS QD"', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (442, '2019-10-27 12:08:46.726741', '2019-10-28 06:59:34.373416', 'Code Jam "Canvas"', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-canvas/codejam-canvas.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, 'stage2 ,canvas,codejam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (443, '2019-10-28 07:46:31.518101', '2019-11-01 14:30:13.900706', 'Repair Design Project. Difficulty Level 3', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level-3/repair-design-project/repair-design-project-en.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (486, '2020-03-18 12:10:57.111813', '2020-03-20 09:12:43.838469', 'Algorithms Part 1', 'https://github.com/rolling-scopes-school/rs.android-stage1-task1', NULL, 'auto', false, false, false, 'rs.android-stage1-task1', 'https://github.com/rolling-scopes-school/rs.android-stage1-task1', 'kotlintask', 'Android,Kotlin', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (446, '2019-11-13 08:16:07.288782', '2019-11-24 15:47:56.206248', 'Code Jam "Image API"', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-image-api/codejam-image-api_ru.md', NULL, 'manual', true, false, false, NULL, NULL, 'codejam', 'codejam,stage2 ', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (449, '2019-11-27 15:58:51.613495', '2019-11-27 15:58:51.613495', 'ST Checkpoint 1', 'https://app.rs.school/', NULL, 'manual', false, false, false, NULL, NULL, 'interview', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (402, '2019-08-14 10:35:12.012641', '2019-12-03 14:49:35.649926', 'Code Jam "Culture Portal"', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-culture-portal.md', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', 'codejam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (452, '2019-12-16 09:39:38.046401', '2019-12-16 09:39:38.046401', 'Fancy-weather Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (455, '2019-12-16 10:37:47.551919', '2019-12-16 10:37:47.551919', 'Reverse Int', 'https://github.com/Shastel/reverse-int', NULL, 'auto', false, false, false, 'reverse-int', 'https://github.com/Shastel/reverse-int', 'jstask', 'epam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (458, '2019-12-16 15:59:10.804471', '2019-12-16 15:59:10.804471', 'ST React App', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Things-APP', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (461, '2020-01-10 20:07:46.237318', '2020-01-10 20:07:46.237318', 'Angular Workshop', 'https://angular.io/', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (463, '2020-02-07 08:05:15.718038', '2020-02-07 08:05:15.718038', 'Songbird', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (464, '2020-02-07 08:05:57.730605', '2020-02-07 08:05:57.730605', 'Calculator', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (467, '2020-02-15 14:41:17.390262', '2020-02-16 08:44:46.403205', 'Basic JS', 'https://github.com/AlreadyBored/basic-js', NULL, 'auto', false, false, false, 'basic-js', 'https://github.com/AlreadyBored/basic-js', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (469, '2020-02-17 08:28:38.434548', '2020-02-17 08:28:54.065591', 'Angular. Components. Directives & Pipes', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/components-directives-pipes.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (474, '2020-02-19 15:13:59.744793', '2020-02-19 15:22:27.177884', 'Reverse Int', 'https://github.com/rolling-scopes-school/reverse-int/blob/master/README.md', NULL, 'auto', false, false, false, 'reverse-int', 'https://github.com/rolling-scopes-school/reverse-int', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (472, '2020-02-19 15:12:35.267242', '2020-02-19 15:22:41.830318', 'Towel Sort', 'https://github.com/rolling-scopes-school/towel-sort/blob/master/README.md', NULL, 'auto', false, false, false, 'towel-sort', 'https://github.com/rolling-scopes-school/towel-sort', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (476, '2020-02-21 10:24:38.588117', '2020-02-21 10:24:38.588117', 'Singolo', 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (479, '2020-03-02 06:25:15.661263', '2020-03-02 06:25:15.661263', 'Angular Culture Portal', 'https://github.com/rolling-scopes-school/tasks/blob/angular-2020Q1/tasks/angular/culture-portal.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'angular,portal', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (481, '2020-03-02 11:56:29.196388', '2020-03-02 11:56:29.196388', 'Data grid', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/datagrid.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (396, '2019-08-06 09:43:51.676522', '2019-08-06 09:43:51.676522', 'Match Match Game', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/match-match-game.md', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (400, '2019-08-06 09:55:49.176631', '2019-08-06 09:55:49.176631', 'React Redux', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/react-match-match-game.md', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (86, '2019-04-26 14:55:46.436642', '2019-08-14 10:45:50.369308', 'CJ "DOM, DOM Events"', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (398, '2019-08-06 09:52:41.754622', '2019-08-14 10:46:07.362506', 'CJ "Lodash Quick Draw"', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (82, '2019-04-26 14:55:46.414479', '2019-04-26 14:55:46.414479', 'HTML/CSS Test', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (85, '2019-04-26 14:55:46.431913', '2019-04-26 14:55:46.431913', 'Markup #1', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (88, '2019-04-26 14:55:46.446081', '2019-04-26 14:55:46.446081', 'RS Activist', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (91, '2019-04-26 14:55:46.460834', '2019-04-26 14:55:46.460834', 'Mentor Dashboard', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (92, '2019-04-26 14:55:46.465569', '2019-04-26 14:55:46.465569', 'CoreJS/Arrays Test', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (94, '2019-04-26 14:55:46.475554', '2019-04-26 14:55:46.475554', 'Game', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (97, '2019-04-26 14:55:46.49026', '2019-04-26 14:55:46.49026', 'DreamTeam', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (90, '2019-04-26 14:55:46.455449', '2019-04-26 14:55:46.45545', 'Code Jam "Scoreboard"', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (117, '2019-04-30 13:51:17.676745', '2019-05-14 10:55:17.676745', 'Hexal', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup_d1_Hexal.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (221, '2019-05-17 13:01:38.633934', '2019-05-17 13:01:38.633934', 'htmlCssBasics', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (224, '2019-05-17 13:01:38.650481', '2019-05-17 13:01:38.650481', 'layouts', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (222, '2019-05-17 13:01:38.639424', '2019-05-17 13:01:38.639424', 'floatExercise', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (223, '2019-05-17 13:01:38.644267', '2019-05-17 13:01:38.644267', 'positioning', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (225, '2019-05-17 13:01:38.655673', '2019-05-17 13:01:38.655673', 'workshop', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (226, '2019-05-17 13:01:38.660659', '2019-05-17 13:01:38.660659', 'responsive', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (227, '2019-05-17 13:01:38.666042', '2019-05-17 13:01:38.666042', 'formsWidgets', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (228, '2019-05-17 13:01:38.671159', '2019-05-17 13:01:38.671159', 'finalTask', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (231, '2019-05-17 13:01:38.686221', '2019-05-17 13:01:38.686221', 'doublyLinkedList', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (232, '2019-05-17 13:01:38.695428', '2019-05-17 13:01:38.695428', 'customJQuery', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (234, '2019-05-17 13:01:38.705612', '2019-05-17 13:01:38.705612', 'realJquery', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (235, '2019-05-17 13:01:38.71084', '2019-05-17 13:01:38.71084', 'wsc', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (236, '2019-05-17 13:01:38.715941', '2019-05-17 13:01:38.715941', 'noNameOne', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (237, '2019-05-17 13:01:38.720957', '2019-05-17 13:01:38.720957', 'noNameTwo', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (238, '2019-05-17 13:02:30.13361', '2019-05-17 13:02:30.13361', 'workHonor', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (240, '2019-05-17 13:02:30.15818', '2019-05-17 13:02:30.15818', 'cssQDTime', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (241, '2019-05-17 13:02:30.163081', '2019-05-17 13:02:30.163081', 'uiLab', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (242, '2019-05-17 13:02:30.168177', '2019-05-17 13:02:30.168177', 'flexbox', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (243, '2019-05-17 13:02:30.173271', '2019-05-17 13:02:30.173271', 'adaptive', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (244, '2019-05-17 13:02:30.184497', '2019-05-17 13:02:30.184497', 'cssTotal', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (245, '2019-05-17 13:02:30.190762', '2019-05-17 13:02:30.190762', 'workOnLessons', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (247, '2019-05-17 13:02:30.201713', '2019-05-17 13:02:30.201713', 'functionMake', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (248, '2019-05-17 13:02:30.207184', '2019-05-17 13:02:30.207184', 'wsc', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (249, '2019-05-17 13:02:30.212126', '2019-05-17 13:02:30.212126', 'gulp', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (250, '2019-05-17 13:02:30.217988', '2019-05-17 13:02:30.217988', 'honoiTower', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (251, '2019-05-17 13:02:30.223044', '2019-05-17 13:02:30.223044', 'animation', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (252, '2019-05-17 13:02:30.2279', '2019-05-17 13:02:30.2279', 'customJQuery', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (253, '2019-05-17 13:02:30.233767', '2019-05-17 13:02:30.233767', 'tdd', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (89, '2019-04-26 14:55:46.450715', '2019-05-27 08:35:37.359351', 'Presentation', NULL, NULL, 'manual', NULL, false, true, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (96, '2019-04-26 14:55:46.485433', '2019-05-27 08:39:44.221825', 'Offline Presentation', NULL, NULL, 'manual', NULL, true, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (351, '2019-06-05 11:51:12.229807', '2019-06-05 11:51:12.229807', 'Stage#2 Final Test', NULL, NULL, 'auto', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (369, '2019-06-26 13:24:39.790098', '2019-06-26 13:24:39.790098', 'youTube', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (387, '2019-07-08 13:30:12.12725', '2019-07-08 13:30:12.12725', 'Padawans', NULL, NULL, 'auto', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (388, '2019-07-08 13:31:46.251832', '2019-07-08 13:31:46.251832', 'UZ CV', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (389, '2019-07-08 13:32:18.083335', '2019-07-08 13:32:18.083335', 'UZ Read me', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (390, '2019-07-10 12:56:29.975418', '2019-07-10 12:56:29.975418', 'UZ Layout', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/2.-Layout', 'Create web page, strictly according to:

Lambda restaurant layout

Browser support: Google Chrome, Mozilla Firefox, Microsoft Edge.', 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (410, '2019-08-29 09:41:00.400898', '2019-08-29 10:08:08.993969', 'ST Chat', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Chat', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (407, '2019-08-29 09:32:17.606001', '2019-08-29 10:08:44.864627', 'ST Custom Lodash', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-Custom-Lodash', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (230, '2019-05-17 13:01:38.681206', '2019-08-29 10:10:10.985834', 'ST JS Assignments', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/7.-JS-assignments', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (435, '2019-09-30 08:14:14.847165', '2019-10-15 12:40:10.75085', 'HTML/CSS Test Advanced', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (408, '2019-08-29 09:34:32.473242', '2019-08-29 10:08:34.054101', 'ST Cyclic menu', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Cyclic-menu', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (405, '2019-08-29 09:16:23.185166', '2019-08-29 10:09:04.204396', 'ST Auto Complete', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/1.-Auto-Complete', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (411, '2019-08-29 10:11:56.69667', '2019-08-29 10:11:56.69667', 'ST Catalogue. P.1 React Client', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.1-React-Client', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (414, '2019-08-29 10:57:50.108237', '2019-08-29 10:57:50.108237', 'ST JS Test 2', 'http://learn.javascript.ru/', NULL, 'manual', false, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (397, '2019-08-06 09:46:51.573349', '2019-08-06 09:46:51.573349', 'CSS Recipes & Layouts', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/css-recipes-and-layouts.md', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (401, '2019-08-06 09:56:50.593508', '2019-08-06 09:56:50.593508', 'Game Refactoring', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/game-refactoring.md', NULL, 'auto', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (229, '2019-05-17 13:01:38.676219', '2019-08-06 09:59:19.619433', 'JS Test', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (122, '2019-04-30 14:11:11.94101', '2019-05-14 10:14:11.94101', 'Neutron Mail', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup-d2-NeutronMail-en.md', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (87, '2019-04-26 14:55:46.441332', '2019-05-14 10:56:46.441332', 'YouTube', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/youtube.md', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (404, '2019-08-29 08:12:24.073776', '2019-10-28 10:40:19.063008', 'ST Read me', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/0.-Readme', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (422, '2019-09-19 10:02:05.134479', '2019-11-01 14:31:29.943288', 'JS: Multiply', 'https://github.com/Shastel/multiply', NULL, 'auto', false, false, false, 'multiply', 'https://github.com/Shastel/multiply', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (484, '2020-03-15 23:11:23.55455', '2020-03-25 09:27:46.940288', 'Technical Screening', 'https://docs.rs.school/#/technical-screening', NULL, 'manual', false, false, false, NULL, NULL, 'stage-interview', 'interview', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (428, '2019-09-20 09:56:26.502967', '2019-11-08 11:44:12.440623', 'JS: JS-edu', 'https://github.com/davojta/js-edu', NULL, 'auto', false, false, false, 'js-edu', 'https://github.com/davojta/js-edu', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (431, '2019-09-24 08:20:14.453176', '2019-11-08 11:44:50.366453', 'JS: Unique ', 'https://github.com/Shastel/unique', NULL, 'auto', false, false, false, 'unique', 'https://github.com/Shastel/unique', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (349, '2019-05-28 15:21:16.311993', '2019-11-19 09:35:38.995602', 'CoreJS Interview ', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/interview-corejs.md', NULL, 'manual', false, false, false, NULL, NULL, 'interview', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (93, '2019-04-26 14:55:46.470595', '2019-11-19 09:53:57.574635', 'WebSocket Challenge', 'https://github.com/rolling-scopes-school/lectures/blob/master/lectures/websocket-challenge.md', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (350, '2019-06-03 06:50:19.575782', '2019-11-19 10:53:20.712051', 'CodeJam "Animation Player"', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-animation-player.md', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (352, '2019-06-21 07:22:11.052584', '2019-11-19 13:06:31.954741', 'Piskel-clone', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-clone.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (129, '2019-05-13 11:45:12.64168', '2020-03-09 11:46:32.445946', 'Codewars stage 2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars:stage2', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (220, '2019-05-17 13:01:38.627128', '2019-05-17 13:01:38.627128', 'workHonor', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (391, '2019-07-15 12:39:31.48174', '2019-07-15 12:39:31.48174', 'UZ Autocomplete', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/3.-Autocomplete', 'The task is to implement a custom createAutocomplete function', 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (392, '2019-07-17 14:41:10.098861', '2019-07-17 14:41:10.098861', 'UZ Codewars', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/4.-Codewars', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (394, '2019-07-30 09:47:10.177586', '2019-07-30 09:47:10.177586', 'UZ Javascript Classes & Inheritance', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/5.-Javascript-Classes-&-Inheritance', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (395, '2019-07-31 12:59:19.767726', '2019-07-31 12:59:19.767726', 'UZ Custom Lodash', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/8.-Custom-Lodash', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (246, '2019-05-17 13:02:30.196693', '2019-08-06 09:59:24.394646', 'JS Test', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (233, '2019-05-17 13:01:38.700498', '2019-08-06 11:08:43.462233', 'CSS QD', NULL, NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (403, '2019-08-22 09:35:28.567592', '2019-08-22 09:35:28.567592', 'UZ Cyclic menu', 'https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/9.-Cyclic-menu', NULL, 'manual', NULL, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (406, '2019-08-29 09:21:54.045655', '2019-08-29 10:08:53.337095', 'ST Javascript Classes & Inheritance', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/2.-Javascript-Classes-&-Inheritance', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (412, '2019-08-29 10:12:27.740479', '2019-08-29 10:12:27.740479', 'ST Catalogue. P.2 Angular Admin Client', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.2-Angular-Admin-Client', NULL, 'manual', true, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (415, '2019-08-29 11:07:41.484385', '2019-08-29 11:07:41.484385', 'ST Bonus', 'https://github.com/rolling-scopes-school/docs/blob/master/rs-activist.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (434, '2019-09-30 08:09:29.61975', '2019-10-08 14:24:55.849506', 'RS School Test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-school-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (436, '2019-09-30 08:14:56.284783', '2019-10-08 07:05:43.425884', 'Git Test #2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md	', NULL, 'manual', false, false, false, NULL, NULL, NULL, 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (433, '2019-09-30 08:05:43.034506', '2019-10-08 14:25:09.658362', 'HTML/CSS Test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (465, '2020-02-09 18:17:26.12848', '2020-02-09 18:17:26.12848', 'Codewars stage 1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars-stage-1.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars:stage1', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (432, '2019-09-30 08:03:38.411822', '2019-10-28 06:59:48.722431', 'Git Test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (418, '2019-09-17 07:20:20.07102', '2019-10-28 07:40:32.105112', 'Theyalow. Difficulty Level 1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level%201/theyalow/theyalow-en.md', NULL, 'manual', false, false, false, NULL, NULL, NULL, 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (439, '2019-10-13 13:50:38.385396', '2019-11-01 14:29:45.50486', 'Priority Queue', 'https://github.com/rolling-scopes-school/priority-queue', NULL, 'auto', false, false, false, 'priority-queue', 'https://github.com/rolling-scopes-school/priority-queue', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (424, '2019-09-20 09:40:16.65468', '2019-11-01 14:31:12.362038', 'JS: Expression Calculator', 'https://github.com/romacher/expression-calculator', NULL, 'auto', false, false, false, 'expression-calculator', 'https://github.com/romacher/expression-calculator', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (421, '2019-09-17 13:40:31.235798', '2019-11-01 14:31:18.390464', 'JS: Brackets', 'https://github.com/Shastel/brackets', NULL, 'auto', false, false, false, 'brackets', 'https://github.com/Shastel/brackets', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (423, '2019-09-19 10:02:37.126233', '2019-11-01 14:31:37.02801', 'JS: Zeros', 'https://github.com/Shastel/zeros', NULL, 'auto', false, false, false, 'zeros', 'https://github.com/Shastel/zeros', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (393, '2019-07-26 13:14:49.106312', '2019-11-07 09:21:44.562843', 'ST JS assignments', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-JS-assignments', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (425, '2019-09-20 09:42:22.766447', '2019-11-08 11:43:53.046921', 'JS: Guessing-game', 'https://github.com/rolling-scopes-school/guessing-game', NULL, 'auto', false, false, false, 'guessing-game', 'https://github.com/rolling-scopes-school/guessing-game', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (426, '2019-09-20 09:54:01.865495', '2019-11-08 11:44:00.705846', 'JS: Morse-decoder', 'https://github.com/romacher/morse-decoder', NULL, 'auto', false, false, false, 'morse-decoder', 'https://github.com/romacher/morse-decoder', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (427, '2019-09-20 09:54:43.876086', '2019-11-08 11:44:06.756286', 'JS: Finite-state-machine', 'https://github.com/rolling-scopes-school/finite-state-machine', NULL, 'auto', false, false, false, 'finite-state-machine', 'https://github.com/rolling-scopes-school/finite-state-machine', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (429, '2019-09-22 09:55:22.942777', '2019-11-08 11:44:20.763439', 'JS: Tic Tac Toe', 'https://github.com/rolling-scopes-school/tic-tac-toe', NULL, 'auto', false, false, false, 'tic-tac-toe', 'https://github.com/rolling-scopes-school/tic-tac-toe', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (430, '2019-09-22 09:56:18.079947', '2019-11-08 11:45:10.648593', 'JS: Doubly Linked List', 'https://github.com/rolling-scopes-school/doubly-linked-list', NULL, 'auto', false, false, false, 'doubly-linked-list', 'https://github.com/rolling-scopes-school/doubly-linked-list', 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (409, '2019-08-29 09:37:01.324698', '2019-11-11 18:15:52.011347', 'ST Autocomplete UI', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Autocomplete-UI', NULL, 'manual', true, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (447, '2019-11-18 07:47:39.508556', '2019-11-18 07:47:39.508556', 'test-task', 'https://github.com/mikhama/test-task', NULL, 'auto', false, false, false, 'test-task', 'https://github.com/mikhama/test-task', 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (399, '2019-08-06 09:54:06.658655', '2019-12-03 14:49:49.549586', 'Code Jam "Hacktrain"', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/codejam-train.md', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (440, '2019-10-15 07:50:32.749775', '2019-11-19 09:34:34.605432', 'Technical screening', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md', NULL, 'manual', false, false, false, NULL, NULL, 'interview', 'stage2 ', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (450, '2019-12-03 14:52:19.396399', '2019-12-03 14:52:19.396399', 'Portfolio', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/portfolio/portfolio-ru.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage2 ,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (83, '2019-04-26 14:55:46.421933', '2019-11-30 18:36:50.662322', 'CoreJS', 'https://github.com/mikhama/core-js-101', NULL, 'auto', true, false, false, 'core-js-101', 'https://github.com/mikhama/core-js-101', 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (128, '2019-05-02 09:41:43.371377', '2019-12-03 14:42:15.453094', 'Code Jam "Palette"', 'https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-pallete.md', NULL, 'manual', true, false, false, NULL, NULL, 'codejam', 'deprecated', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (444, '2019-11-04 08:12:31.634176', '2020-03-31 10:17:18.546617', 'Virtual Keyboard', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-virtual-keyboard.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (453, '2019-12-16 10:34:47.548986', '2019-12-16 10:34:47.548986', 'Temperature Converter', 'https://github.com/Shastel/temperature-converter', NULL, 'auto', false, false, false, 'temperature-converter', 'https://github.com/Shastel/temperature-converter', 'jstask', 'epam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (456, '2019-12-16 10:38:26.769964', '2019-12-16 10:38:26.769964', 'Towel Sort', 'https://github.com/Shastel/towel-sort', NULL, 'auto', false, false, false, 'towel-sort', 'https://github.com/Shastel/towel-sort', 'jstask', 'epam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (459, '2019-12-18 14:22:47.842869', '2019-12-18 14:22:47.842869', 'ST TDD', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (84, '2019-04-26 14:55:46.426978', '2020-02-10 18:45:57.803066', 'HTML, CSS & Git Basics', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-cv.md', NULL, 'auto', false, false, false, NULL, NULL, 'cv:html', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (437, '2019-10-06 11:20:27.617946', '2020-02-10 06:18:24.928919', 'Markdown & Git', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-markdown.md', NULL, 'auto', false, false, false, NULL, NULL, 'cv:markdown', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (470, '2020-02-17 08:29:28.43587', '2020-02-17 08:29:28.43587', 'Angular. Modules & Services. Routing', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/modules-services-routing.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (438, '2019-10-13 13:34:49.201156', '2020-03-23 10:57:07.262729', 'Sudoku', 'https://github.com/rolling-scopes-school/sudoku', NULL, 'auto', false, false, false, 'sudoku', 'https://github.com/rolling-scopes-school/sudoku', 'jstask', 'stage1,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (488, '2020-03-19 16:22:02.703098', '2020-03-24 16:19:06.071144', 'rs.ios.task2', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task2/blob/master/readme.md', NULL, 'auto', false, false, false, 'rs.ios-stage1-task2', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task2/', 'objctask', 'stage1', '{"targets":{"project":{"folder":"RSSchool_T2","xcodeproj":"RSSchool_T2.xcodeproj"},"tests":{"folder":"RSSchool_T2Tests","classes":["AbbreviationTests.m","BlocksTest.m","DatesTest.m","FibonacciNumbersTests.m","StringTransform.m","TimeInWordsTests.m"]}},"folder":"RSSchool_T2","details":"","descriptions":""}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (482, '2020-03-10 20:39:15.488061', '2020-03-24 16:20:39.287898', 'rs.ios.task1', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task1/', NULL, 'auto', false, false, false, 'rs.ios-stage1-task1', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task1/', 'objctask', 'stage1', '{"targets":{"project":{"folder":"RSSchool_T1","xcodeproj":"RSSchool_T1.xcodeproj"},"tests":{"folder":"RSSchool_T1Tests","classes":["BillCounterTests.m","HighestPalindromeTests.m","MiniMaxSumTests.m","StringParseTests.m","T1ArrayTests.m"]}},"folder":"RSSchool_T1","details":"","descriptions":""}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (489, '2020-03-26 10:35:21.765085', '2020-03-26 10:35:21.765085', 'Caesar cipher CLI tool', 'https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (490, '2020-03-26 14:29:07.41166', '2020-03-26 14:29:07.41166', 'HTML/Css(basic)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/css-recipes.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (492, '2020-03-31 09:33:53.140629', '2020-03-31 09:33:53.140629', 'Express REST service', 'https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md#task-2-express-rest-service', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (493, '2020-03-31 10:20:39.859981', '2020-03-31 10:20:39.859981', 'Virtual Keyboard Cross-Check', 'https://rolling-scopes-school.github.io/checklist/', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,js,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (494, '2020-03-31 10:23:52.389221', '2020-03-31 10:23:52.389221', 'Gem Puzzle Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-the-gem-puzzle.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,cross-check,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (495, '2020-04-01 08:43:01.126352', '2020-04-01 08:43:01.126352', '[Android] Quiz 1', 'https://docs.google.com/forms/d/e/1FAIpQLSdFHiOBHHDZpwztLq3rGYf7EzEQPw56I0HeYlqfg8BpB6leYg/viewform?usp=sf_link', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (491, '2020-03-30 09:57:08.558596', '2020-04-01 20:44:38.183195', 'rs.ios.task3.test', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task3/blob/master/readme.md', NULL, 'auto', false, false, false, 'rs.ios-stage1-task3', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task3', 'objctask', 'stage1', '{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["ArrayPrintTests.m","FullBinaryTreesTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["DateMachineTests.m"]}},"testReplacement":{"link":"git@github.com:rolling-scopes-school/rs.ios-stage1-private-tests.git","folder":"stage1-task3","replacement":[{"folder":"RSSchool_T3Tests","test":"ArrayPrintTests.m"},{"folder":"RSSchool_T3UITests","test":"DateMachineTests.m"}],"verify":[{"folder":"RSSchool_T3Tests","test":"FullBinaryTreesTests.m"}]},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (496, '2020-04-02 17:01:12.759119', '2020-04-02 17:01:12.759119', 'Layout(Restaurant)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markup-1.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (497, '2020-04-02 18:49:24.244235', '2020-04-03 13:05:37.170103', 'rs.ios.task3', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1/blob/master/README.md', NULL, 'auto', false, false, false, 'rs.ios-stage1-task3.1', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1', 'objctask', 'stage1', '{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["T3_PolynomialTests.m","T3_CombinatorTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["RS_Task3_UICheckerUITests.m"]}},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (500, '2020-04-09 10:03:10.874771', '2020-04-09 10:03:10.874771', 'English for kids', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (501, '2020-04-09 16:00:08.930182', '2021-06-22 09:18:19.384375', '[iOS] Quiz2', 'https://docs.google.com/forms/d/e/1FAIpQLSdLvcnvAofsQ1ETqDnwSjH3U2WQJgVvlG8pxVPV_ZfhBWDV9w/closedform', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (502, '2020-04-09 17:57:52.400972', '2020-04-09 17:57:52.400972', 'rs.ios.task4', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task4/blob/master/README.md', NULL, 'auto', false, false, false, 'rs.ios-stage1-task4', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task4', 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (503, '2020-04-10 18:12:45.707666', '2021-06-06 20:26:13.523668', 'Logging & Error Handling', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-5-logging--error-handling', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (504, '2020-04-14 05:44:38.302281', '2020-04-14 05:44:38.302281', 'Database MongoDB', 'https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md#task-4-database-mongodb', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (505, '2020-04-20 17:36:43.155586', '2021-06-27 20:09:25.924071', 'Authentication and JWT', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-8-authentification--jwt', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (506, '2020-04-20 19:44:07.04595', '2021-06-25 16:57:29.2666', '[Android] Quiz 2', 'https://forms.gle/KLLFbKsKneosrwpV9', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (507, '2020-04-24 09:12:59.277372', '2020-06-02 11:36:07.441843', 'SpeakIt', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/speakit.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (508, '2020-04-27 06:51:46.900545', '2020-04-27 06:51:46.900545', 'MovieSearch', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/movie-search.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (509, '2020-04-27 06:52:41.255486', '2020-04-27 06:52:41.255486', 'MovieSearch: Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/movie-search.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (510, '2020-04-29 06:04:23.576262', '2021-06-02 06:56:53.49812', 'Javascript Classes & Inheritance', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/javascript-classes-inheritance.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,Poland,rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (511, '2020-04-30 16:13:15.587124', '2020-04-30 16:13:15.587124', 'rs.ios.task5', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task5/blob/master/README.md', NULL, 'auto', false, false, false, 'rs.ios-stage1-task5', 'https://github.com/rolling-scopes-school/rs.ios-stage1-task5', 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (512, '2020-05-01 14:40:17.99012', '2021-07-02 09:12:24.068724', 'Algorithms Task 3', 'https://github.com/rolling-scopes-school/rs.android-2021-stage1-task3', NULL, 'auto', false, false, false, 'rs.android-2021-stage1-task3', 'https://github.com/rolling-scopes-school/rs.android-2021-stage1-task3', 'kotlintask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (513, '2020-05-03 19:35:27.599732', '2020-05-03 19:35:27.599732', 'ICanCodeJS', 'https://github.com/codenjoyme', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', 'stage2 ,codejam', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (514, '2020-05-05 17:07:38.151867', '2020-05-05 17:07:38.151867', 'JS-assignments', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js-assignments.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (515, '2020-05-11 14:15:10.391901', '2020-05-11 14:15:10.391901', '[iOS] Quiz 3', 'https://docs.google.com/forms/d/e/1FAIpQLSeb_To1WpYUWG_kfocuK5WfLLhL4MfXUn6AU0OVSEPt3ztXhw/viewform', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (516, '2020-05-13 13:39:03.279745', '2021-07-16 17:02:48.091094', '[Android] Quiz 3 Final', 'https://forms.gle/TTcLK8kLEWveR7BF9', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (517, '2020-05-14 18:49:07.427589', '2020-05-14 18:49:07.427589', 'Cyclic menu', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cyclic-menu.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (518, '2020-05-19 12:57:16.890419', '2020-05-19 12:57:16.890419', 'Virtual keyboard', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/virtual-keyboard/virtual-keyboard-en.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (519, '2020-05-28 20:05:20.202628', '2020-05-28 20:05:20.202628', 'Fancy-weather(en)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather(en).md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (520, '2020-06-02 11:28:16.858003', '2020-06-02 11:29:43.695887', 'English puzzle', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-puzzle.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (521, '2020-06-02 11:29:37.951145', '2020-06-02 11:29:52.45171', 'English puzzle: Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-puzzle.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,cross-check,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (522, '2020-06-07 17:14:36.355963', '2020-06-07 17:14:36.355963', 'CV', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-cv.md', NULL, 'manual', false, false, false, NULL, NULL, 'cv:html', 'Georgia', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (523, '2020-06-08 19:30:29.31376', '2020-06-08 19:30:29.31376', 'rs.ios.task6', 'https://github.com/rolling-scopes-school/rs.ios-stage2-task6/blob/master/README.md', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (524, '2020-06-08 19:31:03.111251', '2020-06-08 19:31:03.111251', 'rs.ios.task7', 'https://github.com/rolling-scopes-school/rs.ios-stage2-task7/blob/master/README.md', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (525, '2020-06-08 19:31:30.353779', '2020-06-08 19:31:30.353779', 'rs.ios.task8', 'https://github.com/rolling-scopes-school/rs.ios-stage2-task8/blob/master/README.md', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (526, '2020-06-08 19:55:04.118004', '2020-06-08 19:55:04.118004', '[iOS] Quiz 4', 'https://docs.google.com/forms/d/e/1FAIpQLSdc0z7shPfpCbcOlCyYggHqJqd01fiDYZCaif_kk7Azyt3ZxQ/viewform', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (527, '2020-06-08 19:56:23.355047', '2020-06-08 19:56:23.355047', '[iOS] Quiz 5', 'https://docs.google.com/forms/d/e/1FAIpQLScIUpMl0RSKJmve_4AID8owWgSUzAGWVZxPchfpvTRo-e1TZQ/viewform', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (528, '2020-06-09 12:05:43.593182', '2021-07-07 06:11:53.697552', 'Custom lodash(unit tests)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/custom-lodash(unit%20%20tests).md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland,rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (529, '2020-06-14 18:51:48.51346', '2020-06-14 18:51:48.51346', 'RS Lang. Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/rslang.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,cross-check,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (530, '2020-06-14 18:52:12.642677', '2020-06-14 18:52:12.642677', 'RS Lang. Presentation', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/rslang.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (531, '2020-06-15 18:55:01.118769', '2020-06-15 18:55:01.118769', 'Final JS Test', 'https://google.com', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (532, '2020-06-18 11:57:24.090653', '2020-06-18 11:57:24.090653', '[Android] Task 4 Storage', 'https://github.com/rolling-scopes-school/rs.android.task.4', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (533, '2020-07-02 17:22:29.052038', '2020-07-02 17:22:29.052038', 'Chat (React)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chat.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Poland,react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (534, '2020-07-17 08:55:25.910527', '2020-07-17 08:55:25.910527', '[Android] Task 5', 'https://github.com/rolling-scopes-school/Android-2020-Task-5', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (535, '2020-07-20 07:47:20.402571', '2020-07-20 07:47:48.182376', 'Angular YouTube client: Cross-Check', 'https://rolling-scopes-school.github.io/checklist/', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular,angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (536, '2020-07-22 08:08:14.64887', '2020-07-22 08:08:14.64887', 'RS CloneWars', 'https://github.com/rolling-scopes-school/tasks', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (537, '2020-07-25 09:04:32.443128', '2020-07-25 09:16:46.759794', '[Android] Task 6 MVP', 'https://github.com/rolling-scopes-school/rs.android.task.6', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (538, '2020-07-28 05:44:35.694818', '2020-07-28 06:09:53.982099', 'Codewars Test', 'https://github.com/rolling-scopes/rsschool-app', NULL, 'manual', false, false, false, NULL, NULL, 'codewars', 'react,codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (539, '2020-08-02 20:57:21.752305', '2020-08-05 10:27:49.213083', 'Codewars React', 'https://github.com/rolling-scopes-school/tasks/blob/f504966947a9f3e85a27f6401e7a6870f870f392/tasks/codewars-react.md', NULL, 'manual', false, false, false, NULL, NULL, 'codewars', 'react,codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (540, '2020-08-03 14:31:53.354433', '2020-08-03 14:31:53.354433', 'Interview(React)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-react.md', NULL, 'manual', false, false, false, NULL, NULL, 'interview', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (541, '2020-08-05 09:10:58.734646', '2020-08-05 09:10:58.734646', 'Angular. NgRX', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/NgRX.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular,angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (542, '2020-08-15 20:40:21.595491', '2020-08-15 20:41:37.149481', 'Schedule', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/schedule.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (543, '2020-08-15 20:42:00.436081', '2020-08-15 20:42:00.436081', 'X Check App', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/xcheck/xcheck.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (544, '2020-08-23 13:40:57.097441', '2020-08-23 13:40:57.097441', 'Mobile Hackathon', 'https://medium.com/mobilepeople/rolling-scopes-mobile-hackathon-results-9c96b4fb4211', NULL, 'manual', false, false, false, NULL, NULL, 'codejam', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (545, '2020-08-27 04:13:37.333538', '2020-08-27 04:13:37.333538', 'Task 1. Calculator', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-1-calculator-40', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (546, '2020-08-27 04:30:07.971139', '2020-10-06 14:37:51.758728', 'Codewars Basic', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (547, '2020-08-27 04:35:39.114632', '2020-08-27 04:35:39.114632', 'Simple Singolo', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/simple-singolo.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (548, '2020-08-27 14:34:07.755403', '2020-08-27 14:34:07.755403', 'HTML-basics', 'https://ru.code-basics.com/languages/html', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (549, '2020-08-27 14:34:39.873265', '2020-08-27 14:34:39.873265', 'CSS-basics', 'https://ru.code-basics.com/languages/css', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (550, '2020-08-27 14:35:10.167076', '2020-08-27 14:35:10.167076', 'JS-basics', 'https://ru.code-basics.com/languages/javascript', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (551, '2020-08-27 16:10:52.287849', '2020-08-27 16:10:52.287849', 'Task 2. Dynamic Landing Page', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-2-dynamic-landing-page-30', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (552, '2020-08-27 16:11:28.541996', '2020-08-27 16:11:28.541996', 'Task 3. Meditation App', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-3-meditation-app-20', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (553, '2020-08-27 16:11:57.491788', '2020-08-27 16:11:57.491788', 'Task 4. Drum Kit', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-4-drum-kit-20', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (554, '2020-08-27 16:12:27.5845', '2020-08-27 16:12:27.5845', 'Task 5. CSS Variables and JS', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-5-css-variables-and-js-20', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (593, '2020-12-19 12:47:59.940867', '2021-06-28 13:37:07.392607', 'CV. Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage0,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (555, '2020-08-27 16:12:54.861753', '2020-08-27 16:12:54.861753', 'Task 6. Flex Panel Gallery', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-6-flex-panel-gallery-10', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (556, '2020-08-27 16:13:19.737287', '2020-08-27 16:13:19.737287', 'Task 7. Fun with HTML5 Canvas', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-7-fun-with-html5-canvas-40', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (557, '2020-08-27 16:13:49.956984', '2020-08-27 16:13:49.956984', 'Task 8. Custom Video Player', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-8-custom-video-player-20', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (558, '2020-08-27 16:14:13.433263', '2020-08-27 16:14:13.433263', 'Task 9. Video Speed Controller', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-9-video-speed-controller-10', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (559, '2020-08-27 16:14:37.523502', '2020-08-27 16:14:37.523502', 'Task 10. Whack-A-Mole', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-10-whack-a-mole-40', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (560, '2020-08-27 16:15:04.873511', '2020-08-27 16:15:04.873511', 'Task 11. Virtual Keyboard', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-11-virtual-keyboard-40', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (561, '2020-08-27 16:15:27.500667', '2020-08-27 16:15:27.500667', 'Task 12. Chat on socket.io', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/projects.md#task-12-chat-on-socketio-20', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (562, '2020-08-27 16:16:25.117143', '2020-10-05 17:32:25.450477', 'Codewars Basic-1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic-1.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (563, '2020-08-27 16:17:05.5464', '2020-10-05 17:24:40.436098', 'Codewars Basic-2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/codewars-basic-2.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (564, '2020-08-27 16:17:46.058557', '2020-08-27 16:17:46.058557', 'raindrops', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/raindrops.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (565, '2020-08-27 16:18:08.763424', '2020-08-27 16:18:08.763424', 'fancy-weather', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-0/fancy-weather.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (566, '2020-08-27 16:35:27.649926', '2020-08-27 16:35:27.649926', 'Portfolio', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/Portfolio.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (567, '2020-09-05 12:46:35.283775', '2020-10-19 10:11:31.643018', 'Self HTML Basics', 'https://ru.code-basics.com/languages/html', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (568, '2020-09-07 19:16:43.975374', '2020-10-19 10:11:24.138441', 'Self CSS Basics', 'https://ru.code-basics.com/languages/css', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'css', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (569, '2020-09-07 20:23:16.53491', '2020-10-19 10:11:13.239832', 'Self JS Basics', 'https://ru.code-basics.com/languages/javascript', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (570, '2020-09-19 08:01:33.992409', '2020-09-19 08:01:33.992409', 'webdev', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level-1/webdev/webdev-ru.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (571, '2020-09-21 11:21:05.630909', '2020-09-21 11:21:05.630909', 'Calculator', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/calculator.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage1,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (572, '2020-09-21 16:03:35.625542', '2020-09-21 16:03:35.625542', 'Momentum', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/momentum.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage1,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (573, '2020-09-21 16:04:10.12875', '2020-09-21 16:04:10.12875', 'Virtual Keyboard', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/ready-projects/virtual-keyboard.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage1,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (574, '2020-09-22 08:55:51.123185', '2021-07-16 17:01:41.593901', 'Android Final Quiz', 'https://forms.gle/TTcLK8kLEWveR7BF9', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage2 ,Android,Kotlin', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (575, '2020-09-26 12:58:24.834196', '2021-07-13 02:18:54.829974', 'React Team Task Presentation', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/schedule.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react,presentation', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (576, '2020-09-28 15:41:37.15626', '2020-09-28 15:45:51.670373', 'Shelter Cross-check', 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/shelter', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (577, '2020-09-28 15:57:47.386043', '2020-09-28 15:57:47.386043', 'Gem Puzzle', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/gem-pazzle/codejam-the-gem-puzzle.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (578, '2020-10-13 05:44:26.854548', '2020-10-13 05:44:26.854548', 'AWS_task1', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task1-cloud-introduction/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (579, '2020-10-19 08:18:56.59736', '2020-10-19 08:18:56.59736', 'AWS_task2', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task2-serve-spa-aws/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (580, '2020-10-26 11:34:32.421958', '2020-10-26 11:34:32.421958', 'AWS-task3', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task3-product-api/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (581, '2020-11-02 14:50:19.794867', '2020-11-02 14:50:19.794867', 'AWS-task4', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task4-rds/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check,nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (582, '2020-11-12 16:52:45.903122', '2020-11-12 16:52:45.903122', 'AWS_task5', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task5-import-to-s3/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (583, '2020-11-16 12:01:36.081559', '2020-11-16 12:01:36.081559', 'AWS-task6', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/tree/main/task6-sqs-sns', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check,js,nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (584, '2020-11-20 07:21:08.683763', '2020-11-20 07:21:08.683763', 'RS Селекторы', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-css.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (585, '2020-11-20 07:26:46.82712', '2020-11-20 07:26:46.82712', 'RS Селекторы:Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-css.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (586, '2020-11-24 09:22:01.197268', '2020-11-24 09:22:01.197268', 'AWs_task7', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task7-lambda%2Bcognito-authorization/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,js,cross-check,nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (587, '2020-12-01 12:57:37.039959', '2020-12-01 12:57:37.039959', 'AWS_task8', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task8-docker-elastic-beanstalk/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check,nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (588, '2020-12-08 20:21:00.816025', '2020-12-08 20:21:00.816025', 'AWS_task9', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/task9-bff/task.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'aws ,cross-check,nodejs', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (589, '2020-12-11 12:19:08.377006', '2020-12-18 19:53:01.805815', 'COVID-19 Dashboard', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/covid-dashboard.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (590, '2020-12-11 12:20:12.955324', '2020-12-18 19:53:15.107973', 'COVID-19 Dashboard:Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/covid-dashboard.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (591, '2020-12-16 11:22:13.348836', '2020-12-16 11:22:13.348836', 'AWS_feedback_build_plan', 'https://github.com/rolling-scopes-school/nodejs-aws-tasks/blob/main/feedback_and_possible_plan.me', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'js,nodejs,aws', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (592, '2020-12-19 12:43:52.804419', '2021-05-19 02:54:47.307367', 'Codewars #0', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/codewars', NULL, 'auto', false, false, false, NULL, NULL, 'jstask', 'js,codewars,stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (594, '2020-12-19 12:49:31.14823', '2021-03-07 16:21:45.593427', 'Wildlife', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/wildlife', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage0,html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (595, '2020-12-26 18:31:32.147857', '2021-03-06 10:31:15.424715', 'HTML/CSS Test #0', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (596, '2020-12-26 18:32:46.338943', '2021-03-06 10:31:21.886056', 'JS Test #0', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (597, '2020-12-26 18:33:44.873478', '2021-06-30 16:38:02.096425', 'RSS Test', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (598, '2021-01-14 16:07:51.521813', '2021-01-14 16:07:51.521813', 'ST Extra curry', 'https://observablehq.com/@shastel/functions-and-arguments', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (599, '2021-01-16 07:15:35.629304', '2021-01-16 07:15:35.629304', 'RS Clone', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rsclone/rsclone.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (600, '2021-01-18 20:37:27.531064', '2021-01-18 20:37:27.531064', 'Angular. RS Lang', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular-new/angular-rslang.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (601, '2021-01-18 20:44:09.805032', '2021-04-07 09:35:44.904556', 'Angular. RS Lang: Cross-Check', 'https://rs-lang-cross-check.netlify.app/', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (602, '2021-01-21 12:47:14.940104', '2021-01-21 12:47:14.940104', 'Test', 'https://github.com/yuliaHope/rsschool-api/tree/feature/S-9-implement-adding-task/client/src/components/Forms', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (603, '2021-01-21 17:00:47.237938', '2021-01-21 17:00:47.237938', '[EXTRA] Custom addEventListener', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/5.-%5BEXTRA%5D-Custom-addEventListener', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'ST', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (604, '2021-01-22 13:36:10.256772', '2021-01-24 12:53:00.085111', 'Pandas data manipulations', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/1_data_manipulations/Pandas_data_manipulations.ipynb', NULL, 'auto', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (605, '2021-02-01 14:35:31.761066', '2021-02-01 14:35:31.761066', '2 - Linear Regression and Visualization', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/2_linear_regression/seminar_and_homework.ipynb', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (606, '2021-02-01 16:45:01.840662', '2021-02-01 16:45:01.840662', 'ST Load', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Load', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'ST', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (607, '2021-02-03 16:51:09.09653', '2021-02-03 16:51:09.09653', 'Things 1', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/7.-Things-BE-v1', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'ST', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (608, '2021-02-11 08:44:07.456369', '2021-02-11 08:44:07.456369', '3 - Overfitting and Regularization', 'https://github.com/rolling-scopes-school/ml-intro/tree/2021/3_overfitting_regularization', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (609, '2021-02-13 18:01:57.191651', '2021-02-13 18:01:57.191651', 'RS Clone Presentation', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rsclone/rsclone.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (610, '2021-02-15 10:58:06.20701', '2021-02-15 10:58:06.20701', '3- Quiz Overfitting and Regularization', 'https://docs.google.com/forms/d/e/1FAIpQLSe_QHNj_mHGQ3afxBLny2o3CeiE7kZbo41-Aco_gjbLq_J8_Q/viewform?usp=sf_link', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (611, '2021-02-15 17:32:15.694641', '2021-02-15 17:32:15.694641', '4 - Feature Engineering and Selection', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/4_feature_engineering_selection/feature_engineering_selection.ipynb', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (612, '2021-02-17 10:39:01.421981', '2021-02-17 10:39:01.421981', 'React Game', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-game.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (613, '2021-02-28 06:57:22.138546', '2021-02-28 11:51:23.17022', '5 - Classification Linear KNN (Part 1)', 'https://github.com/rolling-scopes-school/ml-intro/tree/2021/5_classification_linear_knn', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (614, '2021-03-01 10:33:03.991004', '2021-03-01 10:33:03.991004', '5 - Quiz Classification Linear KNN', 'https://docs.google.com/forms/d/e/1FAIpQLScJ3iEMm756uQq7JcNia9WMaUe6Dm1XkMjEHqKHrxgS6TLjpg/closedform', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (615, '2021-03-02 11:26:52.273548', '2021-03-02 11:26:52.273548', 'Номер макета Online Zoo', 'https://rolling-scopes-school.github.io/roadmap/#/stage1/tasks/online-zoo', NULL, 'manual', false, false, false, NULL, NULL, 'test', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (616, '2021-03-04 14:36:26.155447', '2021-03-04 14:36:26.155447', 'Travel App', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/travel-app.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (617, '2021-03-05 11:09:19.040392', '2021-03-05 11:09:19.040392', '5 - Classification Linear KNN (Part 2)', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/5_classification_linear_knn/seminar.ipynb', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (618, '2021-03-05 11:17:02.022234', '2021-03-05 11:17:02.022234', '6 - Trees and Ensembles', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/6_trees%20and%20ensembles/rf_classifier.ipynb', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Python,Pandas', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (619, '2021-03-05 11:18:59.536474', '2021-03-05 11:18:59.536474', '6 - Quiz Trees and Ensembles', 'https://forms.gle/QppfozwckCZMoPhC8', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (620, '2021-03-05 16:59:00.627541', '2021-03-05 16:59:00.627541', 'ST Last checkpoint', 'https://docs.google.com/spreadsheets/d/19G_U4gPsuC6L2NjGoanGRGU2-cc6y6b1y8iZcDMF2fI/edit?usp=sharing', NULL, 'manual', false, false, false, NULL, NULL, 'stage-interview', 'ST', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (621, '2021-03-06 16:09:14.287858', '2021-03-06 16:09:40.434646', '7 - Clustering and Dimensionality Reduction', 'https://github.com/rolling-scopes-school/ml-intro/blob/2021/7_clustering/clustering.ipynb', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Python,Pandas', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (622, '2021-03-06 16:13:05.067733', '2021-03-06 16:13:23.274674', '7 - Quiz Clustering and Dimensionality Reduction', 'https://forms.gle/bzBPEtnyuA347dJD7', NULL, 'manual', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (623, '2021-03-11 11:04:08.681819', '2021-03-11 11:04:08.681819', '[Test] Virtual Piano', 'https://github.com/rolling-scopes-school/stage1/blob/main/tasks/virtual-piano.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'test', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (624, '2021-03-12 18:25:36.803679', '2021-03-12 18:25:36.803679', 'Markdown & Git (EN)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-markdown.md', NULL, 'manual', false, false, false, NULL, NULL, 'cv:markdown', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (625, '2021-03-16 04:32:02.049634', '2021-03-22 08:10:06.849863', 'Virtual-piano', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/js-projects/virtual-piano', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (626, '2021-03-16 10:32:32.861577', '2021-03-16 11:47:39.420121', 'Git test (EN)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/test-git', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt,stage0,test', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (627, '2021-03-19 15:38:13.638778', '2021-03-19 15:38:13.638778', 'React. RS Lang', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-rslang.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (628, '2021-03-19 15:39:27.503723', '2021-07-13 02:18:41.256448', 'React. Team Task', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/tba.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (629, '2021-03-25 06:58:19.94643', '2021-03-25 06:58:19.94643', '8 - Quiz model evaluation and selection', 'https://forms.gle/zTMLDLiFCMXijrJC9', NULL, 'auto', false, false, false, NULL, NULL, 'test', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (630, '2021-03-29 09:18:15.128409', '2021-03-29 09:18:15.128409', 'Clean-code-s1e1', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/clean-code/clean-code-s1e1', NULL, 'manual', true, false, false, 'clean-code-s1e1', NULL, 'htmltask', 'stage1,html,clean-code', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (631, '2021-03-29 19:46:38.437531', '2021-04-18 16:08:11.754724', 'online-zoo-w-12-v-1', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (632, '2021-03-29 19:47:22.348097', '2021-04-18 16:08:03.65834', 'online-zoo-w-12-v-2', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (633, '2021-03-29 19:49:52.753381', '2021-04-18 16:07:55.984858', 'online-zoo-w-12-v-3', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (634, '2021-03-29 19:51:44.40457', '2021-04-18 16:07:43.996559', 'online-zoo-w-12-v-4', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (635, '2021-03-29 19:52:09.987412', '2021-04-18 16:07:33.660824', 'online-zoo-w-12-v-5', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (636, '2021-03-29 19:53:19.216383', '2021-04-18 16:07:24.592728', 'online-zoo-w-12-v-6', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (637, '2021-03-30 18:22:15.783273', '2021-07-13 07:27:31.217997', 'webdev (EN)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/webdev-en.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,rs-lt,rs-ge', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (638, '2021-04-01 13:43:15.969162', '2021-04-01 13:43:15.969162', 'Final competition', 'https://www.kaggle.com/c/rss-top-performers-prediction', NULL, 'manual', false, false, false, NULL, NULL, 'ipynb', 'Pandas,Python', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (639, '2021-04-01 14:29:52.270971', '2021-04-01 14:37:09.388365', 'ST 2021', 'https://github.com/rkhaslarov/rs-school-short-track-2021', NULL, 'auto', false, false, false, 'rs-school-short-track-2021', 'https://github.com/rkhaslarov/rs-school-short-track-2021', 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (640, '2021-04-03 10:32:13.92427', '2021-07-13 07:34:45.184634', 'Html/Css test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt,rs-ge', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (641, '2021-04-07 20:42:10.851958', '2021-04-22 12:21:36.749143', 'Clean-code: Test for generic principles', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tests/clean-code-generic-principles-test', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'clean-code,test,stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (642, '2021-04-12 06:51:48.539525', '2021-04-12 07:43:02.439332', 'Self-Introduction', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/self-introduction/self-introduction', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'cross-check,self-presentation,stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (643, '2021-04-13 08:16:49.145559', '2021-04-14 05:52:03.673776', 'Semantic. CSS3 test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (644, '2021-04-13 08:36:33.949389', '2021-07-21 07:16:52.562083', 'Flex / Grid test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt,rs-ge', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (645, '2021-04-18 16:09:38.619468', '2021-04-18 16:09:38.619468', 'online-zoo-w-34-v-1', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (646, '2021-04-18 16:10:17.054588', '2021-04-18 16:10:17.054588', 'online-zoo-w-34-v-2', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (647, '2021-04-18 16:10:46.756453', '2021-04-18 16:10:46.756453', 'online-zoo-w-34-v-3', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (648, '2021-04-18 16:11:15.864407', '2021-04-18 16:11:15.864407', 'online-zoo-w-34-v-4', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (649, '2021-04-18 16:11:48.247653', '2021-04-18 16:11:48.247653', 'online-zoo-w-34-v-5', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (650, '2021-04-18 16:12:18.705378', '2021-04-18 16:12:18.705378', 'online-zoo-w-34-v-6', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (651, '2021-04-19 17:07:46.148707', '2021-07-22 08:30:46.745826', 'theyalow (LT)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/theyalow-en(LT).md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'rs-lt,rs-ge', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (652, '2021-04-20 07:22:34.80059', '2021-04-20 07:22:34.80059', 'photo-filter', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/js-projects/photo-filter', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (653, '2021-04-27 17:54:11.564999', '2021-05-04 07:36:17.722256', 'JS Basics test', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (654, '2021-05-02 14:17:32.626997', '2021-05-02 14:53:39.585606', 'Debug in Node.js', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (655, '2021-05-02 14:18:45.971414', '2021-05-28 15:42:33.722491', 'Typescript basics', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-4-typescript-basics', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs,typescript,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (656, '2021-05-02 14:19:28.225416', '2021-06-06 20:25:53.6616', 'Docker Basics', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-6-docker-basics', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs,docker,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (657, '2021-05-02 14:20:16.880508', '2021-06-20 19:16:52.578078', 'PostgreSQL + Typeorm', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-7-postgresql--typeorm', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (658, '2021-05-02 14:20:42.825012', '2021-06-27 20:09:12.145094', 'Nest.js', 'https://github.com/rolling-scopes-school/basic-nodejs-2021Q2#task-9-nestjs', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'nodejs,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (659, '2021-05-03 13:53:09.236679', '2021-05-06 15:57:35.606074', 'rs.ios.objc.task1', 'https://github.com/rolling-scopes-school/rs.ios.stage-task1/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task1', 'https://github.com/rolling-scopes-school/rs.ios.stage-task1', 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (660, '2021-05-03 13:54:27.780527', '2021-05-13 16:58:24.194514', 'rs.ios.objc.task2', 'https://github.com/rolling-scopes-school/rs.ios.stage-task2/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task2', 'https://github.com/rolling-scopes-school/rs.ios.stage-task2', 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (661, '2021-05-03 13:55:39.123913', '2021-05-20 14:39:27.068753', 'rs.ios.objc.task3', 'https://github.com/rolling-scopes-school/rs.ios.stage-task3/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task3', 'https://github.com/rolling-scopes-school/rs.ios.stage-task3', 'objctask', 'stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (662, '2021-05-03 16:10:49.681267', '2021-05-03 16:10:49.681267', 'test', 'http://www.google.com', NULL, 'manual', false, false, false, NULL, NULL, 'stage-interview', 'test', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (663, '2021-05-04 08:37:07.553302', '2021-05-07 14:34:18.073106', 'JS Functions test', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (664, '2021-05-04 12:37:05.984112', '2021-05-04 12:38:54.504325', 'online-zoo-w-56-v-1', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-1', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (665, '2021-05-04 12:37:39.756077', '2021-05-04 12:39:05.223097', 'online-zoo-w-56-v-2', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-2', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (666, '2021-05-04 12:38:10.637801', '2021-05-04 12:39:17.704872', 'online-zoo-w-56-v-3', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-3', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (667, '2021-05-04 12:38:38.846279', '2021-05-04 12:39:32.750323', 'online-zoo-w-56-v-4', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-4', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (668, '2021-05-04 12:39:52.288354', '2021-05-04 12:39:52.288354', 'online-zoo-w-56-v-5', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-5', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (669, '2021-05-04 12:41:25.656806', '2021-05-04 12:41:25.656806', 'online-zoo-w-56-v-6', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/variant-6', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (670, '2021-05-06 10:30:29.740685', '2021-05-06 10:30:29.740685', 'JS Functions test part 2', 'https://example.com', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (671, '2021-05-07 11:31:44.518467', '2021-05-07 11:31:44.518467', 'Codewars #2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars2.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (672, '2021-05-13 08:22:31.158757', '2021-05-13 08:22:31.158757', 'Calculator(LT)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator(LT).md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (673, '2021-05-16 13:31:42.307849', '2021-05-16 13:31:42.307849', 'ST Deep Copy', 'https://github.com/rolling-scopes-school/RS-Short-Track/wiki/2.-Deep-copy', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'ST', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (674, '2021-05-19 06:11:22.765584', '2021-05-19 06:11:22.765584', 'Interview(LT)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage1-interview(LT).md', NULL, 'manual', false, false, false, NULL, NULL, 'interview', 'rs-lt,stage1,interview', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (675, '2021-05-19 16:14:25.053477', '2021-05-19 16:14:25.053477', 'ST Checkpoint 1', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (676, '2021-05-20 05:51:02.732991', '2021-05-20 05:51:02.732991', 'DOM API', 'https://example.com', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (677, '2021-05-20 12:01:17.704883', '2021-05-20 12:01:17.704883', 'online-zoo', 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/online-zoo/online-zoo', NULL, 'auto', false, false, false, NULL, NULL, 'htmltask', 'stage1,online zoo,html,css,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (678, '2021-05-21 13:36:43.887646', '2021-05-21 13:36:43.887646', 'Android 2021 - Practice 1 - Randomizer', 'https://github.com/rolling-scopes-school/rsschool2021-Android-task-randomizer', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'Android,Kotlin,stage1', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (679, '2021-05-26 14:01:27.071863', '2021-05-26 14:01:27.071863', 'Match-Match Game', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/match-match-game.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,TypeScript', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (680, '2021-05-26 14:30:24.634918', '2021-05-26 14:30:24.634918', 'Async Race', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/async-race.md', NULL, 'manual', NULL, false, false, NULL, NULL, 'JS task', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (681, '2021-06-03 15:43:16.636933', '2021-06-10 17:00:13.376693', 'rs.ios.swift.task4', 'https://github.com/rolling-scopes-school/rs.ios.stage-task4/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task4', 'https://github.com/rolling-scopes-school/rs.ios.stage-task4', 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (682, '2021-06-03 17:00:30.151954', '2021-06-11 08:11:45.792399', 'Inheritance Test (LT)', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (683, '2021-06-08 15:08:20.85744', '2021-06-08 15:08:20.85744', 'ST Checkpoint 2', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (684, '2021-06-09 13:27:53.269173', '2021-06-09 13:27:53.269173', 'Android 2021 - Practice 2 - Quiz', 'https://github.com/rolling-scopes-school/rsschool2021-Android-task-quiz', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'stage1,Android,Kotlin,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (685, '2021-06-10 08:08:46.270232', '2021-06-10 08:09:09.092384', 'ST CRP course', 'https://www.udacity.com/course/website-performance-optimization--ud884', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'st', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (686, '2021-06-10 16:51:59.094555', '2021-06-10 17:05:58.337933', 'rs.ios.swift.task5', 'https://github.com/rolling-scopes-school/rs.ios.stage-task5/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task5', 'https://github.com/rolling-scopes-school/rs.ios.stage-task5', 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (687, '2021-06-10 18:57:54.547085', '2021-06-10 18:57:54.547085', 'Async test', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'rs-lt', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (688, '2021-06-11 08:03:40.16882', '2021-06-11 08:03:40.16882', 'Async Race. Cross-Check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/async-race.md#cross-check', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (689, '2021-06-17 16:48:43.28106', '2021-06-17 16:48:43.28106', 'rs.ios.swift.task6', 'https://github.com/rolling-scopes-school/rs.ios.stage-task6/blob/main/README.md', NULL, 'auto', false, false, false, 'rs.ios.stage-task6', 'https://github.com/rolling-scopes-school/rs.ios.stage-task6', 'objctask', 'stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (690, '2021-06-20 16:40:22.899085', '2021-06-22 14:18:21.578778', 'English for kids S1E1. Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,cross-check,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (691, '2021-06-20 16:43:38.061004', '2021-06-22 14:17:41.169677', 'Chess S1E1. Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-one.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,cross-check,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (692, '2021-06-21 13:42:46.349301', '2021-06-22 14:15:10.391564', 'English for kids S1E1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (693, '2021-06-21 13:43:09.688432', '2021-06-22 14:17:13.581254', 'Chess S1E1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-one.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (694, '2021-06-22 14:19:43.29645', '2021-06-22 14:19:43.29645', 'English for kids S1E2. Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage2 ,TypeScript,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (695, '2021-06-22 14:20:29.274537', '2021-06-24 18:43:34.398904', 'Chess S1E2. Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2 ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (696, '2021-06-22 14:22:03.421406', '2021-06-22 14:22:03.421406', 'English for kids S1E2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (697, '2021-06-23 09:50:14.00401', '2021-07-25 05:31:50.361822', 'Chess S1E2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (698, '2021-06-23 09:51:49.128203', '2021-06-23 09:51:49.128203', 'English for kids S1E2. Cross-check', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-admin-panel.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'TypeScript,stage2 ,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (699, '2021-06-29 14:04:45.230899', '2021-06-29 14:04:45.230899', 'rs.ios.crosscheck.task7', 'https://github.com/rolling-scopes-school/rs.ios.stage-task7', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage3', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (700, '2021-07-02 16:38:03.731078', '2021-07-02 16:38:03.731078', 'Codewars Data Types', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/data-types.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (701, '2021-07-02 16:47:46.456174', '2021-07-02 16:47:46.456174', 'Codewars Functions', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/functions.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (702, '2021-07-02 16:52:48.911494', '2021-07-02 16:52:48.911494', 'Codewars Objects & Arrays', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/objects-arrays.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (703, '2021-07-02 16:58:40.753701', '2021-07-02 16:58:40.753701', 'Codewars Algorithms-1', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/algorithms-1.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (704, '2021-07-02 17:04:13.971816', '2021-07-03 12:37:16.362491', 'Codewars Algorithms-2', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/algorithms-2.md', NULL, 'auto', false, false, false, NULL, NULL, 'codewars', 'codewars', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (705, '2021-07-04 19:19:47.54283', '2021-07-04 19:19:47.54283', 'Android 2021 - Practice 3 - Pomodoro', 'https://github.com/rolling-scopes-school/RSShool2021-Android-task-Pomodoro', NULL, 'manual', false, false, false, NULL, NULL, 'kotlintask', 'Android,Kotlin,stage1,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (706, '2021-07-05 08:13:38.447765', '2021-07-05 08:13:38.447765', '[ST] Checkpoint 3', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (707, '2021-07-05 12:36:27.332959', '2021-07-06 07:12:39.982334', 'Test HTML Basics [RU]', 'https://ru.code-basics.com/languages/html', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (708, '2021-07-06 21:03:43.537339', '2021-07-06 21:03:43.537339', 'HTML Quiz', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'html', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (709, '2021-07-06 21:04:36.087632', '2021-07-06 21:04:36.087632', 'CSS Quiz', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'css', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (710, '2021-07-06 21:05:14.935484', '2021-07-06 21:05:14.935484', 'JS Quiz', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (711, '2021-07-06 21:05:58.610129', '2021-07-06 21:06:08.839616', 'ReactJs Quiz', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (712, '2021-07-09 09:50:48.828546', '2021-07-09 09:50:48.828546', 'Angular Shop', 'https://github.com/rolling-scopes-school/tasks', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (713, '2021-07-09 09:53:06.989516', '2021-07-09 09:53:06.989516', 'Angular Shop. Cross-check', 'https://rs-lang-cross-check.netlify.app/', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'Angular', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (714, '2021-07-12 16:39:31.049741', '2021-07-12 16:39:31.049741', '[ST] Final checkpoint', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (715, '2021-07-13 01:56:27.706355', '2021-07-21 02:05:29.234568', 'React. Components', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-components.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (716, '2021-07-13 01:59:06.630799', '2021-07-13 01:59:06.630799', 'React. Forms', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-forms.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (717, '2021-07-13 01:59:57.193405', '2021-07-13 01:59:57.193405', 'React. Redux', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-redux.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (718, '2021-07-13 02:00:40.399879', '2021-07-13 02:00:40.399879', 'React. Routing', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-routing.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (719, '2021-07-13 02:01:22.630194', '2021-07-13 02:01:22.630194', 'React. API', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-api.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (720, '2021-07-13 02:02:18.901305', '2021-07-13 02:02:18.901305', 'React. Testing', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-testing.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (721, '2021-07-13 02:03:39.899612', '2021-07-13 02:03:39.899612', 'React. SSR*', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-ssr.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'react', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (722, '2021-07-13 11:51:08.864691', '2021-07-13 11:51:08.864691', 'Git Quiz', 'https://rolling-scopes-school.github.io/stage0/#/stage0/tests/index', NULL, 'auto', false, false, false, NULL, NULL, 'selfeducation', 'git', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (723, '2021-07-15 07:00:13.193068', '2021-07-15 07:00:13.193068', 'English for kids( EN)', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rslang/english-for-kids-translated.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'rs-lt,rs-ge,stage2', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (724, '2021-07-15 07:18:55.566964', '2021-07-15 13:08:12.925631', 'Test CSS Basics [RU]', 'https://ru.code-basics.com/languages/css', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (725, '2021-07-15 16:07:15.120253', '2021-07-15 16:07:15.120253', 'rs.ios.crosscheck.task8', 'https://github.com/rolling-scopes-school/rs.ios.stage-task8', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage3', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (726, '2021-07-20 03:39:54.174636', '2021-07-20 03:39:54.174636', 'Museum', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/museum/museum.md', NULL, 'manual', false, false, false, NULL, NULL, 'htmltask', 'stage0,cross-check', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (727, '2021-07-20 07:20:25.761953', '2021-07-20 17:18:06.275459', 'Test Algorithms & Data structures', 'https://www.youtube.com/playlist?list=PLP-a1IHLCS7PqDf08LFIYCiTYY1CtoAkt', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'stage0,algorithms', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (728, '2021-07-22 07:59:30.138616', '2021-07-22 07:59:30.138616', '[UZ] RS-lang Backend', 'https://example.com', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', '', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (729, '2021-07-22 17:07:21.458164', '2021-07-22 17:39:29.902012', 'Drum Kit', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-1.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (730, '2021-07-22 17:08:05.196206', '2021-07-22 17:08:05.196206', 'JS Clock', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-2.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (731, '2021-07-22 17:08:44.272934', '2021-07-22 17:08:44.272934', 'Vertical Slider', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-3.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (732, '2021-07-22 17:09:31.573179', '2021-07-22 17:35:00.094133', 'Video Speed Controller', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-4.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (733, '2021-07-22 17:10:07.813794', '2021-07-22 17:10:07.813794', 'Photofilter', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-5.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (734, '2021-07-22 17:10:39.403863', '2021-07-22 17:41:32.343542', 'Whack-A-Mole', 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-6.md', NULL, 'manual', false, false, false, NULL, NULL, 'jstask', 'stage0,js', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (735, '2021-07-26 04:57:34.397304', '2021-07-27 07:39:38.807563', 'Test JS Basics [RU]', 'https://ru.code-basics.com/languages/javascript', NULL, 'manual', false, false, false, NULL, NULL, 'selfeducation', 'stage0', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (736, '2021-07-27 20:49:41.263593', '2021-07-27 20:49:41.263593', 'rs.ios.crosscheck.task9', 'https://github.com/rolling-scopes-school/rs.ios.stage-task9', NULL, 'manual', false, false, false, NULL, NULL, 'objctask', 'stage3', '{}', '', NULL, NULL, NULL);
INSERT INTO public.task VALUES (498, '2022-03-27 11:50:14.892444', '2022-03-27 11:50:14.892444', 'test', 'https://example.com', '', NULL, NULL, false, false, NULL, NULL, 'Kotlin task', '', '{}', '', NULL, NULL, NULL);


--
-- TOC entry 3895 (class 0 OID 16795)
-- Dependencies: 267
-- Data for Name: task_artefact; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3897 (class 0 OID 16805)
-- Dependencies: 269
-- Data for Name: task_checker; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3923 (class 0 OID 17568)
-- Dependencies: 295
-- Data for Name: task_criteria; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3900 (class 0 OID 16814)
-- Dependencies: 272
-- Data for Name: task_interview_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3902 (class 0 OID 16825)
-- Dependencies: 274
-- Data for Name: task_interview_student; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3904 (class 0 OID 16832)
-- Dependencies: 276
-- Data for Name: task_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.task_result VALUES (78642, '2021-07-28 21:18:25.107083', '2021-07-28 21:18:25.107083', NULL, NULL, 500, 'Very good task solution! I like it!', 14337, 979, '[{"authorId":2595,"score":500,"dateTime":1627507105089,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78643, '2021-07-28 21:18:35.624298', '2021-07-28 21:18:35.624298', NULL, NULL, 700, 'Very good task solution! I like it!', 14340, 979, '[{"authorId":2595,"score":700,"dateTime":1627507115622,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78644, '2021-07-28 21:18:45.007131', '2021-07-28 21:18:45.007131', NULL, NULL, 45, 'Very good task solution! I like it!', 14346, 929, '[{"authorId":2595,"score":45,"dateTime":1627507124998,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78645, '2021-07-28 21:18:57.747085', '2021-07-28 21:18:57.747085', NULL, NULL, 120, 'Very good task solution! I like it!', 14337, 945, '[{"authorId":2595,"score":120,"dateTime":1627507137729,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78646, '2021-07-28 21:19:25.513612', '2021-07-28 21:19:25.513612', NULL, NULL, 355, 'Very good task solution! I like it!', 14340, 981, '[{"authorId":2595,"score":355,"dateTime":1627507165497,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78647, '2021-07-28 21:19:35.132131', '2021-07-28 21:19:35.132131', NULL, NULL, 360, 'Very good task solution! I like it!', 14340, 977, '[{"authorId":2595,"score":360,"dateTime":1627507175130,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78648, '2021-07-28 21:19:42.924362', '2021-07-28 21:19:42.924362', NULL, NULL, 160, 'Very good task solution! I like it!', 14340, 928, '[{"authorId":2595,"score":160,"dateTime":1627507182916,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78649, '2021-07-28 21:19:58.344963', '2021-07-28 21:19:58.344963', NULL, NULL, 160, 'Very good task solution! I like it!', 14346, 928, '[{"authorId":2595,"score":160,"dateTime":1627507198326,"comment":"Very good task solution! I like it!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78650, '2021-07-28 21:21:53.845892', '2021-07-28 21:21:53.845892', NULL, NULL, 100, 'Very good task. I like it! Keep going!', 14340, 864, '[{"authorId":2595,"score":100,"dateTime":1627507313823,"comment":"Very good task. I like it! Keep going!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78651, '2021-07-28 21:22:01.000726', '2021-07-28 21:22:01.000726', NULL, NULL, 355, 'Very good task. I like it! Keep going!', 14346, 981, '[{"authorId":2595,"score":355,"dateTime":1627507320974,"comment":"Very good task. I like it! Keep going!"}]', '[]', 2595);
INSERT INTO public.task_result VALUES (78652, '2023-01-04 11:51:51.531729', '2023-01-04 11:51:51.531729', NULL, NULL, 12, '', 14347, 979, '[{"authorId":2595,"score":12,"dateTime":1672833111524,"comment":""}]', '[]', 2595);


--
-- TOC entry 3906 (class 0 OID 16844)
-- Dependencies: 278
-- Data for Name: task_solution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.task_solution VALUES (3330, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14327, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3331, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14328, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3332, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14329, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3333, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14330, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3334, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14331, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3335, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14332, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3336, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14333, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3337, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14334, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3338, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14335, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3339, '2020-09-24 18:55:43.0769', '2020-09-24 18:55:43.0769', 386, 14336, 'https://example.com', '[]', '[]');
INSERT INTO public.task_solution VALUES (3340, '2023-01-05 09:26:39.828087', '2023-01-05 09:26:39.828087', 432, 14347, 'http://localhost:3000/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3341, '2023-01-05 09:28:10.601338', '2023-01-05 09:28:10.601338', 432, 14340, 'https://app.rs.school/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3342, '2023-01-05 09:29:27.74967', '2023-01-05 09:29:27.74967', 432, 14337, 'http://localhost:3000/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3343, '2023-01-05 09:30:54.059754', '2023-01-05 09:30:54.059754', 432, 14346, 'https://app.rs.school/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3344, '2023-01-05 09:32:14.558403', '2023-01-05 09:32:14.558403', 432, 14341, 'http://localhost:3000/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3345, '2023-01-05 09:33:35.674968', '2023-01-05 09:33:35.674968', 432, 14342, 'https://app.rs.school/', '[]', '[]');
INSERT INTO public.task_solution VALUES (3346, '2023-01-05 09:35:24.393744', '2023-01-05 09:35:24.393744', 432, 14343, 'http://localhost:3000/', '[]', '[]');


--
-- TOC entry 3907 (class 0 OID 16854)
-- Dependencies: 279
-- Data for Name: task_solution_checker; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.task_solution_checker VALUES (11568, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3336, 14333, 14332);
INSERT INTO public.task_solution_checker VALUES (11569, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3337, 14334, 14327);
INSERT INTO public.task_solution_checker VALUES (11570, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3338, 14335, 14334);
INSERT INTO public.task_solution_checker VALUES (11571, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3332, 14329, 14335);
INSERT INTO public.task_solution_checker VALUES (11572, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3335, 14332, 14336);
INSERT INTO public.task_solution_checker VALUES (11573, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3334, 14331, 14330);
INSERT INTO public.task_solution_checker VALUES (11574, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3339, 14336, 14329);
INSERT INTO public.task_solution_checker VALUES (11575, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3331, 14328, 14331);
INSERT INTO public.task_solution_checker VALUES (11576, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3333, 14330, 14333);
INSERT INTO public.task_solution_checker VALUES (11577, '2020-09-24 18:55:51.350257', '2020-09-24 18:55:51.350257', 386, 3330, 14327, 14328);


--
-- TOC entry 3910 (class 0 OID 16863)
-- Dependencies: 282
-- Data for Name: task_solution_result; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.task_solution_result VALUES (10812, '2020-09-24 18:57:05.786416', '2020-09-24 18:57:05.786416', 386, 14334, 14327, 50, '[{"score":50,"comment":"50 points.\n\n+10 - blah-blah-blah\n+20 - blah-blah-blah\n+30 - blah-blah-blah","anonymous":false,"authorId":11563,"dateTime":1600973825778}]', '50 points.

+10 - blah-blah-blah
+20 - blah-blah-blah
+30 - blah-blah-blah', false, '[]', '[]');


--
-- TOC entry 3912 (class 0 OID 16876)
-- Dependencies: 284
-- Data for Name: task_verification; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3925 (class 0 OID 17589)
-- Dependencies: 297
-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3927 (class 0 OID 17600)
-- Dependencies: 299
-- Data for Name: team_distribution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public.team_distribution VALUES (12, '2023-01-04 13:32:55.453244', '2023-01-04 13:32:55.453244', 23, '2023-01-03 00:00:00+00', '2023-01-19 23:59:00+00', 'Shelter', '', 2, 4, 3, true, 0, '');
INSERT INTO public.team_distribution VALUES (13, '2023-01-04 13:34:12.989779', '2023-01-04 13:34:12.989779', 23, '2023-01-03 00:00:00+00', '2023-01-31 23:59:00+00', 'test12', 'd sdfcvsdfv fccbfcgbdgfbjfdgbjd rtl;g erg df
g fdsg
dsf g
dsf g
 dsf
g
sd fg
 dfg
sd', 2, 4, 3, true, 0, '');
INSERT INTO public.team_distribution VALUES (11, '2023-01-04 12:58:47.605922', '2023-01-05 08:05:59.137539', 23, '2023-01-06 00:00:00+00', '2023-01-07 23:59:00+00', 'Valery', '', 2, 4, 3, true, 0, '');


--
-- TOC entry 3914 (class 0 OID 16888)
-- Dependencies: 286
-- Data for Name: typeorm_metadata; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3915 (class 0 OID 16894)
-- Dependencies: 287
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: rs_master
--

INSERT INTO public."user" VALUES (11564, 'dyexplode', '', '', '2022-02-18 22:02:49.245928', '2022-02-18 22:02:49.245928', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, '[]', NULL, NULL, NULL, 1645221769228, true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, '', '');
INSERT INTO public."user" VALUES (11563, 'apalchys', '', '', '2020-04-06 15:12:34.19737', '2020-04-06 15:15:02.729722', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, '[]', NULL, false, NULL, 1586185954173, true, 'test@example.com', NULL, NULL, NULL, NULL, NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '11563', 'github');
INSERT INTO public."user" VALUES (2693, 'viktoriyavorozhun', NULL, NULL, '2019-04-24 13:42:45.500139', '2019-10-18 08:07:58.858658', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2693', 'github');
INSERT INTO public."user" VALUES (2098, 'yauhenkavalchuk', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-11-12 11:22:33.350237', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567594678450, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2098', 'github');
INSERT INTO public."user" VALUES (2103, 'shastel', NULL, NULL, '2019-04-17 11:41:21.396686', '2020-03-28 19:57:33.715031', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1566996696787, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2103', 'github');
INSERT INTO public."user" VALUES (5481, 'alreadybored', NULL, NULL, '2019-09-09 17:27:41.909149', '2020-03-22 14:10:37.252351', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1568050061907, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '5481', 'github');
INSERT INTO public."user" VALUES (2115, 'rootthelure', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-06-10 14:20:21.551616', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2115', 'github');
INSERT INTO public."user" VALUES (2480, 'pavelrazuvalau', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-11-05 16:52:28.602784', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567072599465, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2480', 'github');
INSERT INTO public."user" VALUES (2612, 'dmitryromaniuk', NULL, NULL, '2019-04-24 13:42:44.206396', '2019-12-26 08:27:30.060107', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2612', 'github');
INSERT INTO public."user" VALUES (10031, 'artem-bagritsevich', NULL, NULL, '2020-02-11 08:38:35.202688', '2020-03-05 11:50:05.118784', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1581410315197, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '10031', 'github');
INSERT INTO public."user" VALUES (2032, 'mikhama', NULL, NULL, '2019-04-17 11:41:21.396686', '2020-02-24 09:36:43.272628', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567578141812, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2032', 'github');
INSERT INTO public."user" VALUES (1328, 'davojta', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-09-07 04:28:42.419938', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567830522415, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '1328', 'github');
INSERT INTO public."user" VALUES (3961, 'sergeyshalyapin', NULL, NULL, '2019-05-15 14:49:46.402468', '2020-02-12 08:17:55.231843', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '3961', 'github');
INSERT INTO public."user" VALUES (4476, 'abramenal', NULL, NULL, '2019-09-02 12:28:32.979516', '2020-03-01 21:13:30.351302', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1567427312977, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '4476', 'github');
INSERT INTO public."user" VALUES (10130, 'sixtyxi', NULL, NULL, '2020-02-13 11:35:19.12045', '2020-02-13 11:35:19.12045', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1581593719117, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '10130', 'github');
INSERT INTO public."user" VALUES (7485, 'rootical', NULL, NULL, '2019-12-19 12:07:57.161662', '2020-03-05 18:51:41.896803', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1576757277159, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '7485', 'github');
INSERT INTO public."user" VALUES (606, 'irinainina', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-08-28 17:19:48.460791', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567012788456, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '606', 'github');
INSERT INTO public."user" VALUES (6776, 'ksenia-mahilnaya', NULL, NULL, '2019-09-17 11:16:55.976071', '2019-09-17 12:19:51.740451', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1568719015974, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '6776', 'github');
INSERT INTO public."user" VALUES (1090, 'pulya10c', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-09-13 10:21:35.108464', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567492440483, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '1090', 'github');
INSERT INTO public."user" VALUES (4428, 'egngron', NULL, NULL, '2019-08-06 12:06:24.920343', '2019-08-06 12:06:24.920343', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '4428', 'github');
INSERT INTO public."user" VALUES (4749, 'studentluffi', NULL, NULL, '2019-09-09 10:09:09.275849', '2019-09-09 10:09:28.91177', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, false, 'a1', 1568023749273, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '4749', 'github');
INSERT INTO public."user" VALUES (587, 'sijioth', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-06-10 14:20:03.059291', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '587', 'github');
INSERT INTO public."user" VALUES (2084, 'dzmitry-varabei', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-09-05 10:13:27.273815', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567678407268, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2084', 'github');
INSERT INTO public."user" VALUES (2444, 'toshabely', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-08-22 11:56:20.531337', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2444', 'github');
INSERT INTO public."user" VALUES (2277, 'anv21', NULL, NULL, '2019-04-17 11:41:21.396686', '2020-01-18 11:47:48.686227', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1567683807154, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2277', 'github');
INSERT INTO public."user" VALUES (3493, 'humanamburu', NULL, NULL, '2019-04-25 06:42:53.208093', '2019-09-24 11:22:04.181665', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 0, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '3493', 'github');
INSERT INTO public."user" VALUES (2549, 'kvtofan', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-09-24 14:56:49.229102', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1563521151921, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2549', 'github');
INSERT INTO public."user" VALUES (2089, 'yuliahope', NULL, NULL, '2019-04-17 11:41:21.396686', '2019-08-29 11:15:32.412097', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1566418583423, true, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2089', 'github');
INSERT INTO public."user" VALUES (677, 'amoebiusss', 'Test 1', 'Last Name', '2019-04-17 11:41:21.396686', '2020-04-06 15:30:27.059612', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, NULL, 'a1', 1568012639853, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '677', 'github');
INSERT INTO public."user" VALUES (2595, 'anik188', NULL, NULL, '2019-04-24 13:42:43.967659', '2023-01-02 07:51:17.108113', NULL, NULL, 'm', NULL, NULL, 'Minsk', '12158', '[]', '[]', 'hello@epam.com', '+375297777777', 'hello@example.com', '[]', NULL, true, 'a1', 1567423260809, false, 'primary@example.com', 'pavel_durov', NULL, 'do not call me', 'i am a bad guy', NULL, NULL, 'Belarus', 'Minsk', false, NULL, NULL, NULL, '2595', 'github');


--
-- TOC entry 3916 (class 0 OID 16908)
-- Dependencies: 288
-- Data for Name: user_group; Type: TABLE DATA; Schema: public; Owner: rs_master
--



--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 204
-- Name: alert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.alert_id_seq', 1, false);


--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 206
-- Name: certificate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.certificate_id_seq', 590, true);


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 208
-- Name: consent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.consent_id_seq', 1, false);


--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 211
-- Name: course_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_event_id_seq', 133, true);


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 212
-- Name: course_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_id_seq', 25, true);


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 214
-- Name: course_manager_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_manager_id_seq', 30, true);


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 216
-- Name: course_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_task_id_seq', 432, true);


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 218
-- Name: course_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_user_id_seq', 120, true);


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 220
-- Name: cv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.cv_id_seq', 1, false);


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 293
-- Name: discipline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.discipline_id_seq', 1, true);


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 222
-- Name: discord_server_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.discord_server_id_seq', 2, true);


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 224
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.event_id_seq', 224, true);


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 226
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.feedback_id_seq', 615, true);


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 291
-- Name: history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.history_id_seq', 2, true);


--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 230
-- Name: interview_question_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.interview_question_category_id_seq', 1, false);


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 231
-- Name: interview_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.interview_question_id_seq', 1, false);


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 234
-- Name: mentor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_id_seq', 1275, true);


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 236
-- Name: mentor_registry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_registry_id_seq', 289, true);


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 238
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.migrations_id_seq', 40, true);


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 245
-- Name: private_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.private_feedback_id_seq', 65, true);


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 247
-- Name: profile_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.profile_permissions_id_seq', 115, true);


--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 249
-- Name: registry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.registry_id_seq', 8956, true);


--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 251
-- Name: repository_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.repository_event_id_seq', 1, false);


--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 253
-- Name: resume_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.resume_id_seq', 1, false);


--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 255
-- Name: stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_id_seq', 30, true);


--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 258
-- Name: stage_interview_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_feedback_id_seq', 1234, true);


--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 259
-- Name: stage_interview_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_id_seq', 10689, true);


--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 261
-- Name: stage_interview_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.stage_interview_student_id_seq', 1092, true);


--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 264
-- Name: student_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.student_feedback_id_seq', 136, true);


--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 265
-- Name: student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.student_id_seq', 14347, true);


--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 268
-- Name: task_artefact_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_artefact_id_seq', 226, true);


--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 270
-- Name: task_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_checker_id_seq', 4148, true);


--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 271
-- Name: task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_id_seq', 498, true);


--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 273
-- Name: task_interview_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_interview_result_id_seq', 627, true);


--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 275
-- Name: task_interview_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_interview_student_id_seq', 1, false);


--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 277
-- Name: task_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_result_id_seq', 78652, true);


--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 280
-- Name: task_solution_checker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_checker_id_seq', 11577, true);


--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 281
-- Name: task_solution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_id_seq', 3346, true);


--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 283
-- Name: task_solution_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_solution_result_id_seq', 10812, true);


--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 285
-- Name: task_verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.task_verification_id_seq', 55459, true);


--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 298
-- Name: team_distribution_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.team_distribution_id_seq', 13, true);


--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 296
-- Name: team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.team_id_seq', 1, false);


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 289
-- Name: user_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.user_group_id_seq', 1, false);


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 290
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.user_id_seq', 11566, true);


--
-- TOC entry 3465 (class 2606 OID 16961)
-- Name: interview_question_category PK_023f8ae4bea4330f21df438399c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category
    ADD CONSTRAINT "PK_023f8ae4bea4330f21df438399c" PRIMARY KEY (id);


--
-- TOC entry 3463 (class 2606 OID 16963)
-- Name: interview_question_categories_interview_question_category PK_0557624b272acc8d39463763be1; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "PK_0557624b272acc8d39463763be1" PRIMARY KEY ("interviewQuestionId", "interviewQuestionCategoryId");


--
-- TOC entry 3524 (class 2606 OID 16965)
-- Name: stage_interview PK_06a48c907e0091d4082cfb003aa; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "PK_06a48c907e0091d4082cfb003aa" PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 17539)
-- Name: discipline PK_139512aefbb11a5b2fa92696828; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discipline
    ADD CONSTRAINT "PK_139512aefbb11a5b2fa92696828" PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 16967)
-- Name: private_feedback PK_14f0f39ae69058ce456dbd0d77f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "PK_14f0f39ae69058ce456dbd0d77f" PRIMARY KEY (id);


--
-- TOC entry 3510 (class 2606 OID 16969)
-- Name: registry PK_2eca29d55a9556d854416df8ce5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "PK_2eca29d55a9556d854416df8ce5" PRIMARY KEY (id);


--
-- TOC entry 3455 (class 2606 OID 16971)
-- Name: event PK_30c2f3bbaf6d34a55f8ae6e4614; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY (id);


--
-- TOC entry 3479 (class 2606 OID 16973)
-- Name: mentor_registry PK_3673050147cd9bc5c73d27512e3; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "PK_3673050147cd9bc5c73d27512e3" PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 16975)
-- Name: user_group PK_3c29fba6fe013ec8724378ce7c9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.user_group
    ADD CONSTRAINT "PK_3c29fba6fe013ec8724378ce7c9" PRIMARY KEY (id);


--
-- TOC entry 3537 (class 2606 OID 16977)
-- Name: student PK_3d8016e1cb58429474a3c041904; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY (id);


--
-- TOC entry 3612 (class 2606 OID 17615)
-- Name: team_distribution PK_432a4b1c8bfacae59140f6fcaf8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution
    ADD CONSTRAINT "PK_432a4b1c8bfacae59140f6fcaf8" PRIMARY KEY (id);


--
-- TOC entry 3528 (class 2606 OID 16979)
-- Name: stage_interview_student PK_43beb2b1cc5778fd367897b92e8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "PK_43beb2b1cc5778fd367897b92e8" PRIMARY KEY (id);


--
-- TOC entry 3549 (class 2606 OID 16981)
-- Name: task_artefact PK_43bf3d6d2510e22aac59085f0e0; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "PK_43bf3d6d2510e22aac59085f0e0" PRIMARY KEY (id);


--
-- TOC entry 3449 (class 2606 OID 16983)
-- Name: cv PK_4ddf7891daf83c3506efa503bb8; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT "PK_4ddf7891daf83c3506efa503bb8" PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 16985)
-- Name: task_verification PK_5080be855b9d24b3d8e93ff425b; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "PK_5080be855b9d24b3d8e93ff425b" PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 16987)
-- Name: notification_channel PK_50b36f3daa5dd86f7e707740b23; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel
    ADD CONSTRAINT "PK_50b36f3daa5dd86f7e707740b23" PRIMARY KEY (id);


--
-- TOC entry 3556 (class 2606 OID 16989)
-- Name: task_interview_result PK_549c326d1e4b1c5b42eb915fa2f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "PK_549c326d1e4b1c5b42eb915fa2f" PRIMARY KEY (id);


--
-- TOC entry 3434 (class 2606 OID 16991)
-- Name: course_event PK_55e3af1e9fa10f21fc27fdc0852; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "PK_55e3af1e9fa10f21fc27fdc0852" PRIMARY KEY (id);


--
-- TOC entry 3620 (class 2606 OID 17628)
-- Name: student_teams_team PK_61c7be2163ef7fd885c6d6c8afc; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "PK_61c7be2163ef7fd885c6d6c8afc" PRIMARY KEY ("studentId", "teamId");


--
-- TOC entry 3564 (class 2606 OID 16993)
-- Name: task_result PK_623dd43986d67c74bad752b37a5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "PK_623dd43986d67c74bad752b37a5" PRIMARY KEY (id);


--
-- TOC entry 3543 (class 2606 OID 16995)
-- Name: student_feedback PK_62d4a9be66752e38bd228a78223; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "PK_62d4a9be66752e38bd228a78223" PRIMARY KEY (id);


--
-- TOC entry 3506 (class 2606 OID 16997)
-- Name: profile_permissions PK_63cefd76c1a42679af47a57eeba; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT "PK_63cefd76c1a42679af47a57eeba" PRIMARY KEY (id);


--
-- TOC entry 3494 (class 2606 OID 16999)
-- Name: notification_channel_settings PK_6464daee0ff1cf581129618bc8c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "PK_6464daee0ff1cf581129618bc8c" PRIMARY KEY ("notificationId", "channelId");


--
-- TOC entry 3580 (class 2606 OID 17001)
-- Name: task_solution_result PK_676aad5c32840e4c5d04a61300e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "PK_676aad5c32840e4c5d04a61300e" PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 17003)
-- Name: notification_user_settings PK_679cad5ff478ef93af7221fd98f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "PK_679cad5ff478ef93af7221fd98f" PRIMARY KEY ("notificationId", "userId", "channelId");


--
-- TOC entry 3607 (class 2606 OID 17578)
-- Name: task_criteria PK_6de018b8a8dbe8845ffe811ad20; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_criteria
    ADD CONSTRAINT "PK_6de018b8a8dbe8845ffe811ad20" PRIMARY KEY ("taskId");


--
-- TOC entry 3488 (class 2606 OID 17005)
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- TOC entry 3472 (class 2606 OID 17007)
-- Name: login_state PK_73bea2737e9230e18dc8dc1e7f2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.login_state
    ADD CONSTRAINT "PK_73bea2737e9230e18dc8dc1e7f2" PRIMARY KEY (id);


--
-- TOC entry 3568 (class 2606 OID 17009)
-- Name: task_solution PK_77bdef09a7686521e5bbc8247a9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "PK_77bdef09a7686521e5bbc8247a9" PRIMARY KEY (id);


--
-- TOC entry 3526 (class 2606 OID 17011)
-- Name: stage_interview_feedback PK_7cafd89ce6a6a3789de3912df21; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback
    ADD CONSTRAINT "PK_7cafd89ce6a6a3789de3912df21" PRIMARY KEY (id);


--
-- TOC entry 3518 (class 2606 OID 17013)
-- Name: resume PK_7ff05ea7599e13fac01ac812e48; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume
    ADD CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY (id);


--
-- TOC entry 3457 (class 2606 OID 17015)
-- Name: feedback PK_8389f9e087a57689cd5be8b2b13; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY (id);


--
-- TOC entry 3514 (class 2606 OID 17017)
-- Name: repository_event PK_861ff064ff09ee2e5bbae703649; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.repository_event
    ADD CONSTRAINT "PK_861ff064ff09ee2e5bbae703649" PRIMARY KEY (id);


--
-- TOC entry 3459 (class 2606 OID 17019)
-- Name: interview_question PK_87eb879ef299ec607aa30e9bd39; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question
    ADD CONSTRAINT "PK_87eb879ef299ec607aa30e9bd39" PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 17021)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 3421 (class 2606 OID 17023)
-- Name: certificate PK_8daddfc65f59e341c2bbc9c9e43; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "PK_8daddfc65f59e341c2bbc9c9e43" PRIMARY KEY (id);


--
-- TOC entry 3425 (class 2606 OID 17025)
-- Name: consent PK_9115e8d6b082d4fc46d56134d29; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent
    ADD CONSTRAINT "PK_9115e8d6b082d4fc46d56134d29" PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 17514)
-- Name: history PK_9384942edf4804b38ca0ee51416; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.history
    ADD CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY (id);


--
-- TOC entry 3551 (class 2606 OID 17027)
-- Name: task_checker PK_999186887e14614c7cdf73b176e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "PK_999186887e14614c7cdf73b176e" PRIMARY KEY (id);


--
-- TOC entry 3475 (class 2606 OID 17029)
-- Name: mentor PK_9fcebd0a40237e9b6defcbd9d74; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "PK_9fcebd0a40237e9b6defcbd9d74" PRIMARY KEY (id);


--
-- TOC entry 3453 (class 2606 OID 17031)
-- Name: discord_server PK_a4db655f3e40126e5eed1769c90; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.discord_server
    ADD CONSTRAINT "PK_a4db655f3e40126e5eed1769c90" PRIMARY KEY (id);


--
-- TOC entry 3443 (class 2606 OID 17033)
-- Name: course_task PK_aba6301a06559588941ae21b70c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "PK_aba6301a06559588941ae21b70c" PRIMARY KEY (id);


--
-- TOC entry 3419 (class 2606 OID 17035)
-- Name: alert PK_ad91cad659a3536465d564a4b2f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.alert
    ADD CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY (id);


--
-- TOC entry 3436 (class 2606 OID 17037)
-- Name: course_manager PK_b344e2b90017167035afd591a76; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "PK_b344e2b90017167035afd591a76" PRIMARY KEY (id);


--
-- TOC entry 3447 (class 2606 OID 17039)
-- Name: course_user PK_bb2c8374d6f04bf9301895d1b33; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "PK_bb2c8374d6f04bf9301895d1b33" PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 17041)
-- Name: task_solution_checker PK_bc32b5c4e5fb9602786de86594f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "PK_bc32b5c4e5fb9602786de86594f" PRIMARY KEY (id);


--
-- TOC entry 3430 (class 2606 OID 17043)
-- Name: course PK_bf95180dd756fd204fb01ce4916; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "PK_bf95180dd756fd204fb01ce4916" PRIMARY KEY (id);


--
-- TOC entry 3520 (class 2606 OID 17045)
-- Name: stage PK_c54d11b3c24a188262844af1612; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT "PK_c54d11b3c24a188262844af1612" PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 17047)
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 17621)
-- Name: student_team_distribution_team_distribution PK_cd9ddb2e8a915b54f5ab2612bc2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "PK_cd9ddb2e8a915b54f5ab2612bc2" PRIMARY KEY ("studentId", "teamDistributionId");


--
-- TOC entry 3558 (class 2606 OID 17049)
-- Name: task_interview_student PK_e01dbf882c881571c02d3e59bf2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "PK_e01dbf882c881571c02d3e59bf2" PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 17051)
-- Name: notification_user_connection PK_e7ab7a5154b15417e5ee0e31a3b; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "PK_e7ab7a5154b15417e5ee0e31a3b" PRIMARY KEY ("userId", "channelId");


--
-- TOC entry 3609 (class 2606 OID 17597)
-- Name: team PK_f57d8293406df4af348402e4b74; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY (id);


--
-- TOC entry 3545 (class 2606 OID 17053)
-- Name: task PK_fb213f79ee45060ba925ecd576e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY (id);


--
-- TOC entry 3570 (class 2606 OID 17055)
-- Name: task_solution UQ_098e2d5fb54138c4a090b2de0e5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "UQ_098e2d5fb54138c4a090b2de0e5" UNIQUE ("courseTaskId", "studentId");


--
-- TOC entry 3593 (class 2606 OID 17057)
-- Name: user UQ_0d84cc6a830f0e4ebbfcd6381dd; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_0d84cc6a830f0e4ebbfcd6381dd" UNIQUE ("githubId");


--
-- TOC entry 3530 (class 2606 OID 17059)
-- Name: stage_interview_student UQ_16e069fec7420cb8c9bce692360; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "UQ_16e069fec7420cb8c9bce692360" UNIQUE ("studentId", "courseId");


--
-- TOC entry 3508 (class 2606 OID 17061)
-- Name: profile_permissions UQ_28231d1cb8ceafd42ae9ed45db9; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT "UQ_28231d1cb8ceafd42ae9ed45db9" UNIQUE ("userId");


--
-- TOC entry 3467 (class 2606 OID 17063)
-- Name: interview_question_category UQ_40c79f8d86c0b762b849c8c0781; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_category
    ADD CONSTRAINT "UQ_40c79f8d86c0b762b849c8c0781" UNIQUE (name);


--
-- TOC entry 3481 (class 2606 OID 17065)
-- Name: mentor_registry UQ_469871166ea5d53d181d63bba4d; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "UQ_469871166ea5d53d181d63bba4d" UNIQUE ("userId");


--
-- TOC entry 3539 (class 2606 OID 17067)
-- Name: student UQ_5b59e5fa1772006c44bacf10d4e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "UQ_5b59e5fa1772006c44bacf10d4e" UNIQUE ("courseId", "userId");


--
-- TOC entry 3566 (class 2606 OID 17069)
-- Name: task_result UQ_7d9b9262cf5403990b21b6b5cd7; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "UQ_7d9b9262cf5403990b21b6b5cd7" UNIQUE ("courseTaskId", "studentId");


--
-- TOC entry 3477 (class 2606 OID 17071)
-- Name: mentor UQ_86a8c9674f84523385ff741bfc2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "UQ_86a8c9674f84523385ff741bfc2" UNIQUE ("courseId", "userId");


--
-- TOC entry 3547 (class 2606 OID 17580)
-- Name: task UQ_91f8c79680ddb1486f56128a9d6; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6" UNIQUE ("criteriaId");


--
-- TOC entry 3560 (class 2606 OID 17073)
-- Name: task_interview_student UQ_9b70aaee77ce73e847688838e7e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "UQ_9b70aaee77ce73e847688838e7e" UNIQUE ("studentId", "courseId", "courseTaskId");


--
-- TOC entry 3423 (class 2606 OID 17075)
-- Name: certificate UQ_a5b1acee8501273d8c777df4bc1; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "UQ_a5b1acee8501273d8c777df4bc1" UNIQUE ("studentId");


--
-- TOC entry 3427 (class 2606 OID 17077)
-- Name: consent UQ_a85c68db612327cf60a0d0e7b4a; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.consent
    ADD CONSTRAINT "UQ_a85c68db612327cf60a0d0e7b4a" UNIQUE ("channelValue");


--
-- TOC entry 3595 (class 2606 OID 17079)
-- Name: user UQ_afa885683cae0bb53ae1c81bce5; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_afa885683cae0bb53ae1c81bce5" UNIQUE ("profilePermissionsId");


--
-- TOC entry 3597 (class 2606 OID 17081)
-- Name: user UQ_bbaf6a936b2124dc6448ba3448f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_bbaf6a936b2124dc6448ba3448f" UNIQUE ("providerUserId", provider);


--
-- TOC entry 3498 (class 2606 OID 17083)
-- Name: notification_user_connection UQ_c1665f13b0eb372fcb8d48ccf6a; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "UQ_c1665f13b0eb372fcb8d48ccf6a" UNIQUE ("userId", "channelId", "externalId");


--
-- TOC entry 3582 (class 2606 OID 17085)
-- Name: task_solution_result UQ_cd11c253afeee499efe93f3e184; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "UQ_cd11c253afeee499efe93f3e184" UNIQUE ("courseTaskId", "studentId", "checkerId");


--
-- TOC entry 3451 (class 2606 OID 17087)
-- Name: cv UQ_f21b478fe949f06e4e64d728318; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.cv
    ADD CONSTRAINT "UQ_f21b478fe949f06e4e64d728318" UNIQUE ("githubId");


--
-- TOC entry 3432 (class 2606 OID 17089)
-- Name: course UQ_fc5c908f913cd7188a018775f5f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f" UNIQUE (name, alias);


--
-- TOC entry 3444 (class 1259 OID 17090)
-- Name: IDX_062e03d78da22a7bd9becbfaaa; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_062e03d78da22a7bd9becbfaaa" ON public.course_user USING btree ("userId");


--
-- TOC entry 3468 (class 1259 OID 17091)
-- Name: IDX_06facda60b88268da22c37ddec; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_06facda60b88268da22c37ddec" ON public.login_state USING btree ("createdDate");


--
-- TOC entry 3511 (class 1259 OID 17092)
-- Name: IDX_076f71901ba479a51b2deaacd5; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_076f71901ba479a51b2deaacd5" ON public.repository_event USING btree ("repositoryUrl");


--
-- TOC entry 3484 (class 1259 OID 17093)
-- Name: IDX_07a7e2f79cde1c82b5be2f4716; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_07a7e2f79cde1c82b5be2f4716" ON public.notification USING btree (enabled);


--
-- TOC entry 3460 (class 1259 OID 17094)
-- Name: IDX_0b3c9d5127523db43a8c4997f5; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_0b3c9d5127523db43a8c4997f5" ON public.interview_question_categories_interview_question_category USING btree ("interviewQuestionId");


--
-- TOC entry 3531 (class 1259 OID 17095)
-- Name: IDX_0d29e2a35a0c87dc9377411f43; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_0d29e2a35a0c87dc9377411f43" ON public.student USING btree ("mentorId");


--
-- TOC entry 3588 (class 1259 OID 17096)
-- Name: IDX_0d84cc6a830f0e4ebbfcd6381d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE UNIQUE INDEX "IDX_0d84cc6a830f0e4ebbfcd6381d" ON public."user" USING btree ("githubId");


--
-- TOC entry 3571 (class 1259 OID 17097)
-- Name: IDX_115efaf0e1569ebe8a201f000e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_115efaf0e1569ebe8a201f000e" ON public.task_solution_checker USING btree ("taskSolutionId");


--
-- TOC entry 3572 (class 1259 OID 17098)
-- Name: IDX_12380a77f5769e0b608b4c5ece; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_12380a77f5769e0b608b4c5ece" ON public.task_solution_checker USING btree ("courseTaskId");


--
-- TOC entry 3437 (class 1259 OID 17099)
-- Name: IDX_1a6e36b16de159653a4fd2f432; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_1a6e36b16de159653a4fd2f432" ON public.course_task USING btree ("courseId");


--
-- TOC entry 3428 (class 1259 OID 17100)
-- Name: IDX_1c6a31a1098e0c472c4196f85d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_1c6a31a1098e0c472c4196f85d" ON public.course USING btree ("discordServerId");


--
-- TOC entry 3461 (class 1259 OID 17101)
-- Name: IDX_277a1b8395fd2896391b01b761; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_277a1b8395fd2896391b01b761" ON public.interview_question_categories_interview_question_category USING btree ("interviewQuestionCategoryId");


--
-- TOC entry 3491 (class 1259 OID 17102)
-- Name: IDX_2e2c071fde8ee3f26724de7e67; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_2e2c071fde8ee3f26724de7e67" ON public.notification_channel_settings USING btree ("channelId");


--
-- TOC entry 3521 (class 1259 OID 17103)
-- Name: IDX_2e4ed1c8264a48ffe7f8547401; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_2e4ed1c8264a48ffe7f8547401" ON public.stage_interview USING btree ("studentId");


--
-- TOC entry 3552 (class 1259 OID 17104)
-- Name: IDX_33cc2ea503287d1e19e696c028; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33cc2ea503287d1e19e696c028" ON public.task_interview_result USING btree ("courseTaskId");


--
-- TOC entry 3485 (class 1259 OID 17105)
-- Name: IDX_33f33cc8ef29d805a97ff4628b; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33f33cc8ef29d805a97ff4628b" ON public.notification USING btree (type);


--
-- TOC entry 3438 (class 1259 OID 17106)
-- Name: IDX_3cf45a981cf54c2b3e10f677c9; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_3cf45a981cf54c2b3e10f677c9" ON public.course_task USING btree ("taskId");


--
-- TOC entry 3617 (class 1259 OID 17630)
-- Name: IDX_46ecfda37a00bdb0eb9853805e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_46ecfda37a00bdb0eb9853805e" ON public.student_teams_team USING btree ("teamId");


--
-- TOC entry 3553 (class 1259 OID 17107)
-- Name: IDX_4f512b65d2481c2fd737680f79; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_4f512b65d2481c2fd737680f79" ON public.task_interview_result USING btree ("mentorId");


--
-- TOC entry 3486 (class 1259 OID 17108)
-- Name: IDX_50802da9f1d09f275d964dd491; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_50802da9f1d09f275d964dd491" ON public.notification USING btree (name);


--
-- TOC entry 3561 (class 1259 OID 17109)
-- Name: IDX_5565a1f41896ecd29591b239ef; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5565a1f41896ecd29591b239ef" ON public.task_result USING btree ("studentId");


--
-- TOC entry 3613 (class 1259 OID 17622)
-- Name: IDX_5d15876da767ed2eef032144ca; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5d15876da767ed2eef032144ca" ON public.student_team_distribution_team_distribution USING btree ("studentId");


--
-- TOC entry 3618 (class 1259 OID 17629)
-- Name: IDX_5fbd9182fe89b2417f288c61f9; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5fbd9182fe89b2417f288c61f9" ON public.student_teams_team USING btree ("studentId");


--
-- TOC entry 3540 (class 1259 OID 17110)
-- Name: IDX_600ad506d38c98395590e76ea1; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_600ad506d38c98395590e76ea1" ON public.student_feedback USING btree (student_id);


--
-- TOC entry 3515 (class 1259 OID 17111)
-- Name: IDX_6543e24d4d8714017acd1a1b39; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_6543e24d4d8714017acd1a1b39" ON public.resume USING btree ("userId");


--
-- TOC entry 3445 (class 1259 OID 17112)
-- Name: IDX_70824fef35e6038e459e58e035; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_70824fef35e6038e459e58e035" ON public.course_user USING btree ("courseId");


--
-- TOC entry 3492 (class 1259 OID 17113)
-- Name: IDX_773a8c01eb6d281590cdbcaabd; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_773a8c01eb6d281590cdbcaabd" ON public.notification_channel_settings USING btree ("notificationId");


--
-- TOC entry 3469 (class 1259 OID 17114)
-- Name: IDX_79b102f1b191c731920e2ea486; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_79b102f1b191c731920e2ea486" ON public.login_state USING btree ("userId");


--
-- TOC entry 3600 (class 1259 OID 17516)
-- Name: IDX_80735bc019562abb4e7099340e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_80735bc019562abb4e7099340e" ON public.history USING btree (event);


--
-- TOC entry 3573 (class 1259 OID 17115)
-- Name: IDX_85a40b3dcc11dcfdfb836b7ff3; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_85a40b3dcc11dcfdfb836b7ff3" ON public.task_solution_checker USING btree ("checkerId");


--
-- TOC entry 3439 (class 1259 OID 17116)
-- Name: IDX_87736b09d69bacdc6bc272e023; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_87736b09d69bacdc6bc272e023" ON public.course_task USING btree ("taskOwnerId");


--
-- TOC entry 3440 (class 1259 OID 17117)
-- Name: IDX_87c5a426accd8659ac76e8d3fb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_87c5a426accd8659ac76e8d3fb" ON public.course_task USING btree (disabled);


--
-- TOC entry 3610 (class 1259 OID 17616)
-- Name: IDX_951e2b89c3a2b4554516409cfb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_951e2b89c3a2b4554516409cfb" ON public.team_distribution USING btree ("courseId");


--
-- TOC entry 3512 (class 1259 OID 17118)
-- Name: IDX_955719ac67b6cb47bf005b200e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_955719ac67b6cb47bf005b200e" ON public.repository_event USING btree ("githubId");


--
-- TOC entry 3554 (class 1259 OID 17119)
-- Name: IDX_9d0edea65b297ba0d7d8064d05; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_9d0edea65b297ba0d7d8064d05" ON public.task_interview_result USING btree ("studentId");


--
-- TOC entry 3532 (class 1259 OID 17120)
-- Name: IDX_a29d066e554ba135f0d9408c1b; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a29d066e554ba135f0d9408c1b" ON public.student USING btree ("courseId");


--
-- TOC entry 3601 (class 1259 OID 17515)
-- Name: IDX_a619e6e10deb16bf6519d204cf; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a619e6e10deb16bf6519d204cf" ON public.history USING btree ("updatedDate");


--
-- TOC entry 3499 (class 1259 OID 17121)
-- Name: IDX_a745cd57c268bf3728acbcfccb; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a745cd57c268bf3728acbcfccb" ON public.notification_user_settings USING btree ("channelId");


--
-- TOC entry 3614 (class 1259 OID 17623)
-- Name: IDX_a939c4402f9eb96a7c2b9b5663; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_a939c4402f9eb96a7c2b9b5663" ON public.student_team_distribution_team_distribution USING btree ("teamDistributionId");


--
-- TOC entry 3541 (class 1259 OID 17122)
-- Name: IDX_adba43a9054da3ee83e6531d7d; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_adba43a9054da3ee83e6531d7d" ON public.student_feedback USING btree (mentor_id);


--
-- TOC entry 3533 (class 1259 OID 17123)
-- Name: IDX_b35463776b4a11a3df3c30d920; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_b35463776b4a11a3df3c30d920" ON public.student USING btree ("userId");


--
-- TOC entry 3576 (class 1259 OID 17124)
-- Name: IDX_b74f71762142b09ea10a288166; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_b74f71762142b09ea10a288166" ON public.task_solution_result USING btree ("studentId");


--
-- TOC entry 3577 (class 1259 OID 17125)
-- Name: IDX_bdb2f3421163e324b337395909; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_bdb2f3421163e324b337395909" ON public.task_solution_result USING btree ("courseTaskId");


--
-- TOC entry 3583 (class 1259 OID 17126)
-- Name: IDX_d0a655e0bd36811dc5e74a1b64; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d0a655e0bd36811dc5e74a1b64" ON public.task_verification USING btree ("updatedDate");


--
-- TOC entry 3500 (class 1259 OID 17127)
-- Name: IDX_d0b6bedfc9eb1243b01facefe1; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d0b6bedfc9eb1243b01facefe1" ON public.notification_user_settings USING btree ("notificationId", "userId");


--
-- TOC entry 3470 (class 1259 OID 17128)
-- Name: IDX_d2236f176c9281802d3ff00d3f; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d2236f176c9281802d3ff00d3f" ON public.login_state USING btree (expires);


--
-- TOC entry 3589 (class 1259 OID 17129)
-- Name: IDX_d223b6ab8859d668ab080c3628; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d223b6ab8859d668ab080c3628" ON public."user" USING btree ("providerUserId");


--
-- TOC entry 3584 (class 1259 OID 17130)
-- Name: IDX_d8959fe22a43ff7773b3640992; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_d8959fe22a43ff7773b3640992" ON public.task_verification USING btree ("studentId");


--
-- TOC entry 3585 (class 1259 OID 17131)
-- Name: IDX_dae85baef040e0c3eaf1794ff6; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_dae85baef040e0c3eaf1794ff6" ON public.task_verification USING btree ("courseTaskId");


--
-- TOC entry 3522 (class 1259 OID 17132)
-- Name: IDX_db66372bf51271337293b341bf; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_db66372bf51271337293b341bf" ON public.stage_interview USING btree ("mentorId");


--
-- TOC entry 3441 (class 1259 OID 17133)
-- Name: IDX_de17ec9312951a05365d5d4d25; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_de17ec9312951a05365d5d4d25" ON public.course_task USING btree (checker);


--
-- TOC entry 3562 (class 1259 OID 17134)
-- Name: IDX_e0c522b2cdf095ad5c5f51c0ae; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e0c522b2cdf095ad5c5f51c0ae" ON public.task_result USING btree ("courseTaskId");


--
-- TOC entry 3534 (class 1259 OID 17135)
-- Name: IDX_e848fe0c47f23605364a5f163f; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e848fe0c47f23605364a5f163f" ON public.student USING btree ("isFailed");


--
-- TOC entry 3578 (class 1259 OID 17136)
-- Name: IDX_e8aaf4d079a719ade8ebc1397e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e8aaf4d079a719ade8ebc1397e" ON public.task_solution_result USING btree ("checkerId");


--
-- TOC entry 3516 (class 1259 OID 17137)
-- Name: IDX_ee6434baa5d6a66edf5c8fa122; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_ee6434baa5d6a66edf5c8fa122" ON public.resume USING btree ("githubId");


--
-- TOC entry 3535 (class 1259 OID 17138)
-- Name: IDX_f277c5f942b6421c4e02e4b959; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_f277c5f942b6421c4e02e4b959" ON public.student USING btree ("isExpelled");


--
-- TOC entry 3473 (class 1259 OID 17139)
-- Name: IDX_f3dfd194e3463dc94600921378; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_f3dfd194e3463dc94600921378" ON public.mentor USING btree ("courseId");


--
-- TOC entry 3688 (class 2606 OID 17140)
-- Name: task_solution FK_04a0e8cec45008def71698916ae; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "FK_04a0e8cec45008def71698916ae" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3633 (class 2606 OID 17145)
-- Name: course_user FK_062e03d78da22a7bd9becbfaaac; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "FK_062e03d78da22a7bd9becbfaaac" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3639 (class 2606 OID 17150)
-- Name: interview_question_categories_interview_question_category FK_0b3c9d5127523db43a8c4997f59; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59" FOREIGN KEY ("interviewQuestionId") REFERENCES public.interview_question(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3666 (class 2606 OID 17155)
-- Name: student FK_0d29e2a35a0c87dc9377411f432; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_0d29e2a35a0c87dc9377411f432" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- TOC entry 3685 (class 2606 OID 17160)
-- Name: task_result FK_0d531a05b39c159334a1724e1b0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_0d531a05b39c159334a1724e1b0" FOREIGN KEY ("lastCheckerId") REFERENCES public."user"(id);


--
-- TOC entry 3690 (class 2606 OID 17165)
-- Name: task_solution_checker FK_115efaf0e1569ebe8a201f000e2; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_115efaf0e1569ebe8a201f000e2" FOREIGN KEY ("taskSolutionId") REFERENCES public.task_solution(id);


--
-- TOC entry 3652 (class 2606 OID 17170)
-- Name: private_feedback FK_1448716050d6c839a198a199ddb; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_1448716050d6c839a198a199ddb" FOREIGN KEY ("fromUserId") REFERENCES public."user"(id);


--
-- TOC entry 3658 (class 2606 OID 17175)
-- Name: stage FK_16bd843ee63aeb303b35e288960; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage
    ADD CONSTRAINT "FK_16bd843ee63aeb303b35e288960" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3624 (class 2606 OID 17180)
-- Name: course_event FK_18edb72a122ff56bddcaec6055c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_18edb72a122ff56bddcaec6055c" FOREIGN KEY ("organizerId") REFERENCES public."user"(id);


--
-- TOC entry 3629 (class 2606 OID 17185)
-- Name: course_task FK_1a6e36b16de159653a4fd2f4323; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_1a6e36b16de159653a4fd2f4323" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3622 (class 2606 OID 17190)
-- Name: course FK_1c6a31a1098e0c472c4196f85d8; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "FK_1c6a31a1098e0c472c4196f85d8" FOREIGN KEY ("discordServerId") REFERENCES public.discord_server(id);


--
-- TOC entry 3655 (class 2606 OID 17195)
-- Name: registry FK_2449b2493e4b436fda3c21ba5df; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "FK_2449b2493e4b436fda3c21ba5df" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3640 (class 2606 OID 17200)
-- Name: interview_question_categories_interview_question_category FK_277a1b8395fd2896391b01b7612; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.interview_question_categories_interview_question_category
    ADD CONSTRAINT "FK_277a1b8395fd2896391b01b7612" FOREIGN KEY ("interviewQuestionCategoryId") REFERENCES public.interview_question_category(id);


--
-- TOC entry 3636 (class 2606 OID 17205)
-- Name: feedback FK_2b4d98c492a3965505cf57e2e8a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_2b4d98c492a3965505cf57e2e8a" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3645 (class 2606 OID 17210)
-- Name: notification_channel_settings FK_2e2c071fde8ee3f26724de7e678; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "FK_2e2c071fde8ee3f26724de7e678" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3659 (class 2606 OID 17215)
-- Name: stage_interview FK_2e4ed1c8264a48ffe7f85474018; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_2e4ed1c8264a48ffe7f85474018" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3679 (class 2606 OID 17220)
-- Name: task_interview_result FK_33cc2ea503287d1e19e696c0280; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_33cc2ea503287d1e19e696c0280" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3630 (class 2606 OID 17225)
-- Name: course_task FK_3cf45a981cf54c2b3e10f677c95; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_3cf45a981cf54c2b3e10f677c95" FOREIGN KEY ("taskId") REFERENCES public.task(id);


--
-- TOC entry 3653 (class 2606 OID 17230)
-- Name: private_feedback FK_43900d7df69f46dd5c7a44d0c80; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_43900d7df69f46dd5c7a44d0c80" FOREIGN KEY ("toUserId") REFERENCES public."user"(id);


--
-- TOC entry 3643 (class 2606 OID 17235)
-- Name: mentor_registry FK_469871166ea5d53d181d63bba4d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry
    ADD CONSTRAINT "FK_469871166ea5d53d181d63bba4d" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3704 (class 2606 OID 17661)
-- Name: student_teams_team FK_46ecfda37a00bdb0eb9853805e3; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3" FOREIGN KEY ("teamId") REFERENCES public.team(id);


--
-- TOC entry 3680 (class 2606 OID 17240)
-- Name: task_interview_result FK_4f512b65d2481c2fd737680f791; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_4f512b65d2481c2fd737680f791" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- TOC entry 3627 (class 2606 OID 17245)
-- Name: course_manager FK_51727e0e86522ee68c1d7ab556f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "FK_51727e0e86522ee68c1d7ab556f" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3676 (class 2606 OID 17250)
-- Name: task_checker FK_520bd8f9d4ae3b18430899c4490; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_520bd8f9d4ae3b18430899c4490" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3686 (class 2606 OID 17255)
-- Name: task_result FK_5565a1f41896ecd29591b239ef5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_5565a1f41896ecd29591b239ef5" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3677 (class 2606 OID 17260)
-- Name: task_checker FK_5a95946eb2c610d54379689312d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_5a95946eb2c610d54379689312d" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3625 (class 2606 OID 17265)
-- Name: course_event FK_5aa0fd2863ab6cc52828525649c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_5aa0fd2863ab6cc52828525649c" FOREIGN KEY ("eventId") REFERENCES public.event(id);


--
-- TOC entry 3701 (class 2606 OID 17646)
-- Name: student_team_distribution_team_distribution FK_5d15876da767ed2eef032144caf; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "FK_5d15876da767ed2eef032144caf" FOREIGN KEY ("studentId") REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3703 (class 2606 OID 17656)
-- Name: student_teams_team FK_5fbd9182fe89b2417f288c61f9c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_teams_team
    ADD CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c" FOREIGN KEY ("studentId") REFERENCES public.student(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3669 (class 2606 OID 17270)
-- Name: student_feedback FK_600ad506d38c98395590e76ea1f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_600ad506d38c98395590e76ea1f" FOREIGN KEY (student_id) REFERENCES public.student(id);


--
-- TOC entry 3660 (class 2606 OID 17275)
-- Name: stage_interview FK_61a1f43cc337dcfd0a267e6f3bc; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_61a1f43cc337dcfd0a267e6f3bc" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3664 (class 2606 OID 17280)
-- Name: stage_interview_student FK_61d2e056326504ec484b8ed59e7; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "FK_61d2e056326504ec484b8ed59e7" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3657 (class 2606 OID 17285)
-- Name: resume FK_6543e24d4d8714017acd1a1b392; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.resume
    ADD CONSTRAINT "FK_6543e24d4d8714017acd1a1b392" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3647 (class 2606 OID 17290)
-- Name: notification_user_connection FK_686acb0bbf9634ef2497e87582f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "FK_686acb0bbf9634ef2497e87582f" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3634 (class 2606 OID 17295)
-- Name: course_user FK_70824fef35e6038e459e58e0358; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "FK_70824fef35e6038e459e58e0358" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3646 (class 2606 OID 17300)
-- Name: notification_channel_settings FK_773a8c01eb6d281590cdbcaabdf; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_channel_settings
    ADD CONSTRAINT "FK_773a8c01eb6d281590cdbcaabdf" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3699 (class 2606 OID 17631)
-- Name: team FK_79279baf9c5c6e3fb9baabbb5bd; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- TOC entry 3663 (class 2606 OID 17305)
-- Name: stage_interview_feedback FK_7b7d891769e42df16686873c3c6; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback
    ADD CONSTRAINT "FK_7b7d891769e42df16686873c3c6" FOREIGN KEY ("stageInterviewId") REFERENCES public.stage_interview(id);


--
-- TOC entry 3623 (class 2606 OID 17550)
-- Name: course FK_7dc67e5ff23f9a74b7cb129a088; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- TOC entry 3654 (class 2606 OID 17310)
-- Name: private_feedback FK_7f6ab332685af8fa4239d8e04e5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.private_feedback
    ADD CONSTRAINT "FK_7f6ab332685af8fa4239d8e04e5" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3691 (class 2606 OID 17315)
-- Name: task_solution_checker FK_85a40b3dcc11dcfdfb836b7ff3e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_85a40b3dcc11dcfdfb836b7ff3e" FOREIGN KEY ("checkerId") REFERENCES public.student(id);


--
-- TOC entry 3635 (class 2606 OID 17545)
-- Name: event FK_868c8f954dd31217a7e0981b1d2; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- TOC entry 3649 (class 2606 OID 17320)
-- Name: notification_user_settings FK_8704ffbe765e552c633f5c96588; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_8704ffbe765e552c633f5c96588" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3631 (class 2606 OID 17325)
-- Name: course_task FK_87736b09d69bacdc6bc272e0239; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_87736b09d69bacdc6bc272e0239" FOREIGN KEY ("taskOwnerId") REFERENCES public."user"(id);


--
-- TOC entry 3648 (class 2606 OID 17330)
-- Name: notification_user_connection FK_8cefc11aa24ba4e51162685196d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_connection
    ADD CONSTRAINT "FK_8cefc11aa24ba4e51162685196d" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE;


--
-- TOC entry 3673 (class 2606 OID 17581)
-- Name: task FK_91f8c79680ddb1486f56128a9d6; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6" FOREIGN KEY ("criteriaId") REFERENCES public.task_criteria("taskId") ON DELETE CASCADE;


--
-- TOC entry 3700 (class 2606 OID 17636)
-- Name: team_distribution FK_951e2b89c3a2b4554516409cfbd; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.team_distribution
    ADD CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3681 (class 2606 OID 17335)
-- Name: task_interview_result FK_9d0edea65b297ba0d7d8064d05a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_9d0edea65b297ba0d7d8064d05a" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3672 (class 2606 OID 17540)
-- Name: task FK_9e32af93bbf4f4dcf66387b3073; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073" FOREIGN KEY ("disciplineId") REFERENCES public.discipline(id) ON DELETE SET NULL;


--
-- TOC entry 3656 (class 2606 OID 17340)
-- Name: registry FK_a19cc98b348420faa739dfd4240; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "FK_a19cc98b348420faa739dfd4240" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3667 (class 2606 OID 17345)
-- Name: student FK_a29d066e554ba135f0d9408c1b3; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_a29d066e554ba135f0d9408c1b3" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3621 (class 2606 OID 17350)
-- Name: certificate FK_a5b1acee8501273d8c777df4bc1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.certificate
    ADD CONSTRAINT "FK_a5b1acee8501273d8c777df4bc1" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3650 (class 2606 OID 17355)
-- Name: notification_user_settings FK_a745cd57c268bf3728acbcfccb1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_a745cd57c268bf3728acbcfccb1" FOREIGN KEY ("channelId") REFERENCES public.notification_channel(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3702 (class 2606 OID 17651)
-- Name: student_team_distribution_team_distribution FK_a939c4402f9eb96a7c2b9b56634; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_team_distribution_team_distribution
    ADD CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- TOC entry 3670 (class 2606 OID 17360)
-- Name: student_feedback FK_adba43a9054da3ee83e6531d7da; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY (mentor_id) REFERENCES public.mentor(id);


--
-- TOC entry 3698 (class 2606 OID 17365)
-- Name: user FK_afa885683cae0bb53ae1c81bce5; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_afa885683cae0bb53ae1c81bce5" FOREIGN KEY ("profilePermissionsId") REFERENCES public.profile_permissions(id);


--
-- TOC entry 3668 (class 2606 OID 17370)
-- Name: student FK_b35463776b4a11a3df3c30d920a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_b35463776b4a11a3df3c30d920a" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3644 (class 2606 OID 17555)
-- Name: notification FK_b7386b61afc53e6b82251e41b5c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c" FOREIGN KEY ("parentId") REFERENCES public.notification(id);


--
-- TOC entry 3693 (class 2606 OID 17375)
-- Name: task_solution_result FK_b74f71762142b09ea10a2881669; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_b74f71762142b09ea10a2881669" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3694 (class 2606 OID 17380)
-- Name: task_solution_result FK_bdb2f3421163e324b337395909e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_bdb2f3421163e324b337395909e" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3637 (class 2606 OID 17517)
-- Name: feedback FK_bfea5673b7379b1adfa2036da3f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES public."user"(id);


--
-- TOC entry 3678 (class 2606 OID 17390)
-- Name: task_checker FK_c8594a64515d69f4dae0da90006; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_checker
    ADD CONSTRAINT "FK_c8594a64515d69f4dae0da90006" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- TOC entry 3651 (class 2606 OID 17395)
-- Name: notification_user_settings FK_d58ed9fef5ec0b2875892cda12f; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.notification_user_settings
    ADD CONSTRAINT "FK_d58ed9fef5ec0b2875892cda12f" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3674 (class 2606 OID 17400)
-- Name: task_artefact FK_d79f770bf46cd7659b6e5dda1c1; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "FK_d79f770bf46cd7659b6e5dda1c1" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3696 (class 2606 OID 17405)
-- Name: task_verification FK_d8959fe22a43ff7773b36409924; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "FK_d8959fe22a43ff7773b36409924" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3628 (class 2606 OID 17410)
-- Name: course_manager FK_d937cb10a6bf6cc8574046bb716; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_manager
    ADD CONSTRAINT "FK_d937cb10a6bf6cc8574046bb716" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3682 (class 2606 OID 17415)
-- Name: task_interview_student FK_da5613e78890f0093805a441c92; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_da5613e78890f0093805a441c92" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3697 (class 2606 OID 17420)
-- Name: task_verification FK_dae85baef040e0c3eaf1794ff6d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "FK_dae85baef040e0c3eaf1794ff6d" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3661 (class 2606 OID 17425)
-- Name: stage_interview FK_db66372bf51271337293b341bf4; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_db66372bf51271337293b341bf4" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- TOC entry 3683 (class 2606 OID 17430)
-- Name: task_interview_student FK_dc9248f22e6b30f63e7afa4f218; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_dc9248f22e6b30f63e7afa4f218" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3641 (class 2606 OID 17435)
-- Name: mentor FK_df4bfe54f243bd089ea8fb66ed0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "FK_df4bfe54f243bd089ea8fb66ed0" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- TOC entry 3687 (class 2606 OID 17440)
-- Name: task_result FK_e0c522b2cdf095ad5c5f51c0ae0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_result
    ADD CONSTRAINT "FK_e0c522b2cdf095ad5c5f51c0ae0" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3689 (class 2606 OID 17445)
-- Name: task_solution FK_e2487265adac81bea6f085d2fa0; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution
    ADD CONSTRAINT "FK_e2487265adac81bea6f085d2fa0" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3665 (class 2606 OID 17450)
-- Name: stage_interview_student FK_e59f3cbfd1cf52fddf905fc8dea; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_student
    ADD CONSTRAINT "FK_e59f3cbfd1cf52fddf905fc8dea" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3675 (class 2606 OID 17455)
-- Name: task_artefact FK_e683ee274bcf6363c043a29f535; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_artefact
    ADD CONSTRAINT "FK_e683ee274bcf6363c043a29f535" FOREIGN KEY ("courseTaskId") REFERENCES public.course_task(id);


--
-- TOC entry 3695 (class 2606 OID 17460)
-- Name: task_solution_result FK_e8aaf4d079a719ade8ebc1397ef; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "FK_e8aaf4d079a719ade8ebc1397ef" FOREIGN KEY ("checkerId") REFERENCES public.student(id);


--
-- TOC entry 3692 (class 2606 OID 17465)
-- Name: task_solution_checker FK_ee4c145a114a9ada3ec1be0f936; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_checker
    ADD CONSTRAINT "FK_ee4c145a114a9ada3ec1be0f936" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3662 (class 2606 OID 17470)
-- Name: stage_interview FK_f08ecdf6dd22870ac34cbacff51; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_f08ecdf6dd22870ac34cbacff51" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3671 (class 2606 OID 17475)
-- Name: student_feedback FK_f133ab9aba2bb7c28da9a93351d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d" FOREIGN KEY (author_id) REFERENCES public."user"(id);


--
-- TOC entry 3684 (class 2606 OID 17480)
-- Name: task_interview_student FK_f348c327bf727d9de3acd7b4b49; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "FK_f348c327bf727d9de3acd7b4b49" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- TOC entry 3642 (class 2606 OID 17485)
-- Name: mentor FK_f3dfd194e3463dc946009213782; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor
    ADD CONSTRAINT "FK_f3dfd194e3463dc946009213782" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3632 (class 2606 OID 17641)
-- Name: course_task FK_f45fe9bce062ecb8f59edf079e8; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8" FOREIGN KEY ("teamDistributionId") REFERENCES public.team_distribution(id);


--
-- TOC entry 3626 (class 2606 OID 17490)
-- Name: course_event FK_f736d0c55020fc4e5eb28634316; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_f736d0c55020fc4e5eb28634316" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- TOC entry 3638 (class 2606 OID 17522)
-- Name: feedback FK_fefc350f416e262e904dcf6b35e; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES public."user"(id);


-- Completed on 2023-01-05 10:44:30

--
-- PostgreSQL database dump complete
--

