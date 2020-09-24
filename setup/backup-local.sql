--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Debian 10.6-1.pgdg90+1)
-- Dumped by pg_dump version 10.13

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
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


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

SET default_with_oids = false;

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
    alias character varying,
    completed boolean DEFAULT false NOT NULL,
    description character varying,
    "descriptionUrl" character varying,
    planned boolean DEFAULT false NOT NULL,
    "startDate" timestamp with time zone,
    "endDate" timestamp with time zone,
    "fullName" character varying,
    "registrationEndDate" timestamp with time zone,
    "inviteOnly" boolean DEFAULT false NOT NULL
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
    "dateTime" timestamp with time zone
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
    "stageId" integer,
    "scoreWeight" double precision DEFAULT 1,
    checker character varying DEFAULT 'mentor'::character varying NOT NULL,
    "taskOwnerId" integer,
    "studentStartDate" timestamp with time zone,
    "studentEndDate" timestamp with time zone,
    "courseId" integer,
    "pairsCount" integer,
    type character varying,
    disabled boolean DEFAULT false NOT NULL
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
    "isSupervisor" boolean DEFAULT false NOT NULL
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
    discipline character varying
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
    "badgeId" character varying,
    "fromUserId" integer,
    "toUserId" integer,
    "courseId" integer,
    comment character varying,
    "heroesUrl" character varying
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
    comment character varying,
    "technicalMentoring" text DEFAULT ''::text NOT NULL,
    "preselectedCourses" text DEFAULT ''::text NOT NULL,
    canceled boolean DEFAULT false NOT NULL
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
    comment character varying,
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
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL
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
    "courseTaskId" integer
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
    rank integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.student OWNER TO rs_master;

--
-- Name: student_feedback; Type: TABLE; Schema: public; Owner: rs_master
--

CREATE TABLE public.student_feedback (
    id integer NOT NULL,
    "createdDate" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedDate" timestamp without time zone DEFAULT now() NOT NULL,
    comment character varying NOT NULL,
    "studentId" integer
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
    discipline character varying,
    attributes json DEFAULT '{}'::json NOT NULL
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
    "juryScores" json DEFAULT '[]'::json NOT NULL
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
    url character varying NOT NULL
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
    anonymous boolean DEFAULT true NOT NULL
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
    metadata json DEFAULT '[]'::json NOT NULL
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
    "selfIntroLink" text,
    "cvLink" text,
    "militaryService" text
);


ALTER TABLE public."user" OWNER TO rs_master;

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
-- Name: event id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);


--
-- Name: feedback id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback ALTER COLUMN id SET DEFAULT nextval('public.feedback_id_seq'::regclass);


--
-- Name: mentor id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor ALTER COLUMN id SET DEFAULT nextval('public.mentor_id_seq'::regclass);


--
-- Name: mentor_registry id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.mentor_registry ALTER COLUMN id SET DEFAULT nextval('public.mentor_registry_id_seq'::regclass);


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
-- Name: user id; Type: DEFAULT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


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

COPY public.course (id, "createdDate", "updatedDate", name, year, "primarySkillId", "primarySkillName", "locationName", alias, completed, description, "descriptionUrl", planned, "startDate", "endDate", "fullName", "registrationEndDate", "inviteOnly") FROM stdin;
11	2019-08-27 07:36:13.565873	2020-03-13 15:39:41.477995	RS 2019 Q3	\N	javascript	JavaScript	\N	rs-2019-q3	t	RS 2019 Q3	\N	f	2019-09-09 07:35:20.981+00	2020-01-31 07:35:20.981+00	Rolling Scopes School 2019 Q3	\N	f
13	2019-10-21 08:05:31.068833	2020-04-06 15:14:44.116961	RS 2020 Q1	\N	javascript	JavaScript	\N	rs-2020-q1	f	Javascript / Frontend Курс.\nВводное занятие - 2 февраля\nОрганизационный вебинар начнется 2 февраля в 12:00 по минскому времени (GMT+3). Мы расскажем о процессе обучения в RS School и выдадим задания для первого этапа обучения.\n\nВебинар будет транслироваться на канале https://www.youtube.com/c/rollingscopesschool.\nРекомендуем подписаться на канал и нажать колокольчик, чтобы не пропустить начало трансляции. \n\nЕсли у вас не будет возможности присоединиться к онлайн-трансляции, не переживайте! \nЗапись вебинара будет размещена на канале в открытом доступе.\n\nОписание тренинга\nОсновной сайт: https://rs.school/js/\n\nПодробная информация о школе:  https://docs.rs.school	\N	f	2020-02-02 09:01:56.398+00	2020-07-31 08:01:56.398+00	Rolling Scopes School 2020 Q1: JavaScript/Front-end	2020-04-15 08:40:46.24+00	f
23	2020-02-25 09:28:08.842897	2020-09-24 18:51:31.001695	TEST COURSE	\N	javascript	JavaScript	\N	test-course	f	TEST COURSE	\N	f	2018-02-24 21:00:00+00	2020-08-06 09:28:01.698+00	TEST COURSE	\N	t
\.


--
-- Data for Name: course_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_event (id, "createdDate", "updatedDate", "eventId", "courseId", "stageId", date, "time", place, coordinator, comment, "organizerId", "detailsUrl", "broadcastUrl", "dateTime") FROM stdin;
2	2019-09-18 13:27:50.246961	2019-09-29 22:36:05.391483	2	11	\N	2019-09-13	20:00:00+03	Youtube Live	Sergey Shalyapin		3961	\N	https://www.youtube.com/watch?v=2iCgf03rx1I	2019-09-13 17:00:00+00
10	2019-09-19 08:06:38.306347	2019-09-29 22:36:37.450973	10	11	\N	2019-09-23	12:00:41+03	Discord >> announcement	Dzianis Sheka	\N	1328	\N	\N	2019-09-23 09:00:41+00
32	2019-10-15 11:39:32.584641	2019-10-15 11:48:54.960496	34	11	\N	2019-11-05	18:00:47+02	Youtube Live	\N	\N	2444	\N	\N	2019-11-05 16:00:47+00
9	2019-09-19 08:01:19.744354	2019-09-29 22:36:52.324181	9	11	\N	2019-09-25	20:00:39+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-25 17:00:39+00
31	2019-10-15 11:34:38.555567	2019-10-15 11:49:16.569959	33	11	\N	2019-11-04	18:00:58+02	Youtube Live	\N	\N	1090	\N	\N	2019-11-04 16:00:58+00
28	2019-10-14 14:01:29.842633	2019-10-15 11:49:46.776533	30	11	\N	2019-10-26	06:00:16+02	Youtube Live	\N	\N	1328	\N	\N	2019-10-26 04:00:16+00
8	2019-09-19 07:56:40.52603	2019-09-29 22:37:40.366214	8	11	\N	2019-09-23	19:00:52+03	Youtube Live	Anton Bely, Pavel Razuvalov	\N	2444	\N	\N	2019-09-23 16:00:52+00
11	2019-09-19 08:15:42.170571	2019-09-29 22:37:44.992841	11	11	\N	2019-09-27	20:00:54+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-27 17:00:54+00
12	2019-09-19 08:25:12.648501	2019-09-29 22:37:58.19294	12	11	\N	2019-09-30	20:00:25+03	Youtube Live	Viktoriya Vorozhun	\N	2693	\N	\N	2019-09-30 17:00:25+00
13	2019-09-19 08:27:16.85243	2019-09-29 22:38:11.029827	13	11	\N	2019-10-01	20:00:32+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-01 17:00:32+00
14	2019-09-19 08:58:14.462505	2019-09-29 22:38:15.108254	14	11	\N	2019-10-02	20:00:20+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-02 17:00:20+00
15	2019-09-19 09:01:29.234793	2019-09-29 22:38:18.967522	15	11	\N	2019-10-04	20:00:18+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-04 17:00:18+00
16	2019-09-19 09:04:00.058482	2019-09-29 22:38:24.161396	16	11	\N	2019-10-07	20:00:52+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-07 17:00:52+00
17	2019-09-19 09:10:34.094844	2019-09-29 22:38:30.112146	17	11	\N	2019-10-09	20:00:19+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-09 17:00:19+00
20	2019-09-19 09:18:06.890022	2019-09-29 22:38:43.832965	20	11	\N	2019-10-11	20:00:11+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-11 17:00:11+00
18	2019-09-19 09:15:26.553437	2019-09-29 22:38:50.345041	18	11	\N	2019-10-10	19:00:17+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-10-10 16:00:17+00
19	2019-09-19 09:16:44.454815	2019-09-29 22:39:00.633497	19	11	\N	2019-10-14	19:00:17+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-10-14 16:00:17+00
21	2019-09-19 09:20:29.557356	2019-09-29 22:39:11.116858	21	11	\N	2019-10-15	20:00:42+03	Youtube Live	Dzianis Sheka	\N	1328	\N	\N	2019-10-15 17:00:42+00
22	2019-09-19 09:27:50.542211	2019-09-29 22:39:18.865932	22	11	\N	2019-10-16	20:00:03+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-10-16 17:00:03+00
23	2019-09-19 09:32:15.883718	2019-09-29 22:39:31.265399	23	11	\N	2019-10-18	21:00:27+03	Youtube Live	Dzmitry Varabei	\N	2084	\N	\N	2019-10-18 18:00:27+00
25	2019-10-14 13:38:33.036547	2019-10-14 13:42:06.839216	27	11	\N	2019-10-23	\N	Self-Studying	\N		\N	\N	https://www.youtube.com/watch?v=CAvqa6Lj_Rg&list=PLe--kalBDwjj81fKdWlvpLsizajSAK-lh&index=18	2019-10-23 06:00:00+00
26	2019-10-14 13:51:28.629935	2019-10-14 13:51:28.629935	28	11	\N	2019-10-25	18:00:11+02	Youtube Live	\N	\N	6776	\N	\N	2019-10-25 16:00:11+00
27	2019-10-14 13:52:21.215211	2019-10-14 13:53:05.258274	29	11	\N	2019-10-25	19:00:11+02	Youtube Live	\N	\N	6776	\N	\N	2019-10-25 17:00:11+00
29	2019-10-14 14:10:56.691953	2019-10-14 14:10:56.691953	31	11	\N	2019-10-28	\N	Self-Studying	\N	\N	\N	\N	https://www.youtube.com/watch?v=H0XScE08hy8	2019-10-28 06:00:00+00
40	2019-10-15 12:03:50.220574	2019-10-15 12:03:50.220574	41	11	\N	2019-11-25	18:00:11+02	Youtube Live	\N	\N	2612	\N	\N	2019-11-25 16:00:11+00
41	2019-10-15 12:05:11.008733	2019-10-15 12:05:11.008733	42	11	\N	2019-11-27	\N	Self-Studying	\N	\N	\N	\N	\N	2019-11-27 06:00:00+00
7	2019-09-19 07:53:46.050222	2019-09-29 13:41:51.301574	7	11	\N	2019-09-21	19:00:19+03	Twich	Viktor Kovalev	\N	4749	\N	\N	2019-09-21 16:00:19+00
6	2019-09-18 13:38:43.043751	2019-09-29 13:39:46.636834	6	11	\N	2019-09-20	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-20 17:00:00+00
5	2019-09-18 13:36:41.630053	2019-09-29 13:39:56.720457	5	11	\N	2019-09-18	19:00:00+03	Youtube Live	Anton Bely	\N	2444	\N	\N	2019-09-18 16:00:00+00
3	2019-09-18 13:29:31.396492	2019-09-29 13:39:36.356333	3	11	\N	2019-09-14	19:00:00+03	Twich	Viktor Kovalev	\N	4749	\N	\N	2019-09-14 16:00:00+00
1	2019-09-18 13:25:10.446065	2019-09-29 13:39:03.156556	1	11	\N	2019-09-11	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-11 17:00:00+00
24	2019-09-20 08:13:05.071726	2019-09-29 22:35:36.7697	24	11	\N	2019-09-09	19:00:20+03	Youtube Live	Dzmitry Varabei	\N	2084	\N	\N	2019-09-09 16:00:20+00
30	2019-10-14 14:14:48.89067	2019-10-29 11:02:52.806588	32	11	\N	2019-10-30	17:00:34+01	Youtube Live	\N	\N	2549	\N		2019-10-30 16:00:34+00
56	2019-11-13 07:58:22.70613	2019-11-20 10:30:55.29591	37	11	\N	2019-11-14	17:00:09+01	Youtube Live	\N	Part 2	4476	\N	\N	2019-11-14 16:00:09+00
34	2019-10-15 11:47:37.525411	2019-10-15 11:48:07.708192	36	11	\N	2019-11-11	\N	Self-Studying	\N	\N	\N	\N	\N	2019-11-11 06:00:00+00
52	2019-10-15 13:48:04.643143	2019-10-15 13:48:04.643143	49	11	\N	2019-12-18	21:00:24+02	Youtube Live	\N	\N	1328	\N	\N	2019-12-18 19:00:24+00
54	2019-10-16 09:35:26.303099	2019-10-16 09:38:41.390559	51	11	\N	2020-01-10	21:00:30+02	Youtube Live	\N	"Monday Mentor"	1328	\N	\N	2020-01-10 19:00:30+00
53	2019-10-16 08:55:38.580672	2019-10-16 09:38:47.92149	50	11	\N	2019-12-30	21:00:18+02	Youtube Live	\N	"Monday Mentor"	1328	\N	\N	2019-12-30 19:00:18+00
43	2019-10-15 13:19:27.167531	2019-10-16 09:39:12.634215	44	11	\N	2019-12-09	18:00:39+02	Youtube Live	\N	"Monday Mentor"	2612	\N	\N	2019-12-09 16:00:39+00
55	2019-10-17 08:39:24.313773	2019-10-17 08:59:37.788018	52	11	\N	2019-10-22	07:00:49+02	Discord >> announcement	\N	\N	1328	\N	\N	2019-10-22 05:00:49+00
33	2019-10-15 11:41:49.437101	2019-11-04 08:05:30.353745	35	11	\N	2019-11-06	\N		\N	\N	\N	\N	\N	2019-11-06 06:00:00+00
57	2019-11-13 10:00:57.263816	2019-11-13 10:00:57.263816	38	11	\N	2019-11-15	17:00:13+01	\N	\N	\N	\N	\N	\N	2019-11-15 16:00:13+00
45	2019-10-15 13:22:46.522679	2019-11-19 10:24:53.907876	45	11	\N	2019-12-10	18:00:23+01	Youtube Live	\N	Andre Gloukhmantchouk	\N	\N	\N	2019-12-10 17:00:23+00
37	2019-10-15 11:57:45.893502	2019-11-13 10:16:05.257876	39	11	\N	2019-11-19	20:00:59+01	Youtube Live	\N	\N	1328	\N	\N	2019-11-19 19:00:59+00
58	2019-11-13 10:41:26.703281	2019-11-13 10:41:26.703281	40	11	\N	2019-11-19	17:00:35+01	\N	\N	\N	\N	\N	\N	2019-11-19 16:00:35+00
59	2019-11-13 10:45:10.752653	2019-11-13 10:45:10.752653	53	11	\N	2019-11-20	17:00:59+01	Imaguru	\N	\N	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-11-20 16:00:59+00
61	2019-11-13 15:03:10.873277	2019-11-13 15:03:10.873277	55	11	\N	2019-11-21	19:00:58+01	Discord >> announcement	\N	Optional test without score and deadline	1328	\N	\N	2019-11-21 18:00:58+00
51	2019-10-15 13:46:51.156727	2019-11-14 08:04:43.997755	46	11	\N	2019-12-20	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-5	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-20 16:00:03+00
50	2019-10-15 13:46:25.188954	2019-11-14 08:05:21.714914	46	11	\N	2019-12-19	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-4	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-19 16:00:03+00
49	2019-10-15 13:45:26.160284	2019-11-14 08:05:57.063452	46	11	\N	2019-12-17	17:00:03+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-3	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-17 16:00:03+00
46	2019-10-15 13:38:17.289871	2019-11-14 08:06:34.523225	46	11	\N	2019-12-12	17:00:08+01		\N	https://community-z.com/events/rss2019q3-presentations-2	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-12 16:00:08+00
62	2019-11-14 08:08:21.712392	2019-11-14 08:08:40.889422	46	11	\N	2019-12-11	17:00:18+01	Imaguru + Youtube Live	\N	https://community-z.com/events/rss2019q3-presentations-1	\N	\N	https://www.youtube.com/user/ImaguruHub/videos	2019-12-11 16:00:18+00
47	2019-10-15 13:40:23.348495	2019-11-19 10:25:27.58625	47	11	\N	2019-12-13	18:00:40+01	Youtube Live	\N	Andre Gloukhmantchouk	\N	\N	\N	2019-12-13 17:00:40+00
60	2019-11-13 14:32:00.780799	2019-11-19 08:46:13.282679	54	11	\N	2019-11-21	06:00:43+01	Discord >> announcement	\N	Optional test without score and deadline	1328	\N	\N	2019-11-21 05:00:43+00
63	2019-11-19 13:03:55.859842	2019-11-19 13:03:55.859842	56	11	\N	2019-12-23	18:00:20+01	Youtube Live	\N	\N	1328	\N	https://www.youtube.com/c/RollingScopesSchool	2019-12-23 17:00:20+00
35	2019-10-15 11:52:24.439929	2019-11-20 10:30:47.532359	37	11	\N	2019-11-13	17:00:37+01	Youtube Live	\N	Part 1	4476	\N	\N	2019-11-13 16:00:37+00
4	2019-09-18 13:32:30.103621	2019-09-29 22:36:22.6367	4	11	\N	2019-09-16	20:00:00+03	Youtube Live	Sergey Shalyapin	\N	3961	\N	\N	2019-09-16 17:00:00+00
64	2019-11-20 10:31:56.663441	2019-11-20 10:31:56.663441	37	11	\N	2019-11-26	17:00:32+01	Youtube Live	\N	Part 3	4476	\N	\N	2019-11-26 16:00:32+00
65	2019-11-20 10:46:52.962706	2019-11-20 10:46:52.962706	57	11	\N	2019-12-16	17:00:37+01	Youtube Live	\N	\N	1328	\N	\N	2019-12-16 16:00:37+00
66	2019-11-20 11:06:19.515961	2019-11-20 11:06:19.515961	59	11	\N	2020-01-31	07:00:31+01	\N	\N	\N	\N	\N	\N	2020-01-31 06:00:31+00
\.


--
-- Data for Name: course_manager; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_manager (id, "createdDate", "updatedDate", "courseId", "userId") FROM stdin;
\.


--
-- Data for Name: course_task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_task (id, "createdDate", "updatedDate", "mentorStartDate", "mentorEndDate", "maxScore", "taskId", "stageId", "scoreWeight", checker, "taskOwnerId", "studentStartDate", "studentEndDate", "courseId", "pairsCount", type, disabled) FROM stdin;
387	2020-02-24 06:42:44.772736	2020-02-25 10:28:14.611904	\N	\N	54	434	\N	0.100000000000000006	taskOwner	587	2020-02-22 15:00:00+00	2020-02-23 15:00:00+00	13	\N	test	f
426	2020-03-31 11:04:53.472383	2020-03-31 11:04:53.472383	\N	\N	100	129	\N	0.0100000000000000002	auto-test	\N	2020-03-30 20:59:00+00	2020-04-25 20:59:00+00	13	\N	codewars:stage2	f
410	2020-03-16 12:51:21.596135	2020-03-31 11:05:14.454307	\N	\N	100	485	\N	0.0100000000000000002	crossCheck	3961	2020-03-10 16:00:00+00	2020-03-30 20:59:00+00	13	4	htmltask	f
399	2020-03-02 13:25:46.327431	2020-03-17 08:04:28.635812	\N	\N	100	421	\N	0.200000000000000011	mentor	2103	2020-03-02 13:25:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f
383	2020-02-19 15:19:31.540441	2020-03-22 19:02:59.763044	\N	\N	100	472	\N	0.200000000000000011	mentor	2103	2020-02-19 15:19:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f
321	2019-10-15 12:42:42.1037	2019-10-15 12:43:35.36623	\N	\N	100	435	\N	0.5	taskOwner	3961	2019-10-06 00:00:00+00	2019-10-08 00:00:00+00	11	\N	\N	f
337	2019-11-13 08:21:59.44239	2019-11-19 08:47:29.701909	\N	\N	100	446	\N	1	mentor	1328	2019-11-14 17:00:00+00	2019-11-18 20:49:00+00	11	\N	\N	f
348	2019-11-19 10:52:33.333176	2019-11-19 10:52:33.333176	\N	\N	100	350	\N	1	mentor	1328	2019-12-23 17:00:00+00	2020-01-02 20:59:00+00	11	\N	\N	f
350	2019-11-20 10:40:56.936083	2020-01-20 20:56:08.618894	\N	\N	280	448	\N	0.699999999999999956	mentor	1328	2019-11-03 08:00:00+00	2019-12-18 20:59:00+00	11	\N	\N	f
346	2019-11-19 09:32:03.882014	2020-01-20 21:16:18.023264	\N	\N	100	349	\N	5	assigned	\N	2020-01-08 15:00:00+00	2020-01-20 15:00:00+00	11	\N	\N	f
342	2019-11-18 07:49:09.892108	2020-01-29 10:07:18.716975	\N	\N	100	447	\N	1	mentor	\N	2020-01-28 10:07:00+00	2020-02-20 10:07:00+00	11	\N	\N	f
302	2019-09-19 10:04:08.320328	2019-11-20 21:51:46.684981	\N	\N	100	423	\N	0.0200000000000000004	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
306	2019-09-20 09:59:01.071936	2019-11-20 21:52:10.896805	\N	\N	100	428	\N	0.0100000000000000002	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
309	2019-09-22 09:57:59.933548	2019-11-20 21:52:27.065892	\N	\N	100	429	\N	0.0400000000000000008	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
315	2019-09-30 08:20:14.840054	2019-11-20 21:54:03.067127	\N	\N	100	434	\N	0.0100000000000000002	taskOwner	2032	2019-09-28 00:00:00+00	2019-09-28 00:00:00+00	11	\N	\N	f
318	2019-10-06 11:21:27.376684	2019-11-20 21:54:20.53693	\N	\N	100	437	\N	0.0100000000000000002	mentor	\N	2019-09-16 00:00:00+00	2019-09-22 00:00:00+00	11	\N	\N	f
388	2020-02-24 06:43:57.26983	2020-02-25 10:28:23.927547	\N	\N	50	432	\N	0.100000000000000006	taskOwner	2480	2020-02-22 15:00:00+00	2020-02-23 15:00:00+00	13	\N	test	f
374	2020-02-15 14:44:37.656023	2020-03-12 07:20:40.425622	\N	\N	100	467	\N	0.200000000000000011	mentor	5481	2020-02-15 14:00:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f
380	2020-02-19 15:16:59.219399	2020-03-22 19:08:34.853331	\N	\N	100	475	\N	0.200000000000000011	mentor	2103	2020-02-19 15:15:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f
408	2020-03-15 23:12:19.237073	2020-03-30 07:23:21.073835	\N	\N	100	484	\N	1	taskOwner	2084	2020-03-22 21:00:00+00	2020-04-11 20:59:00+00	13	\N	stage-interview	f
430	2020-04-04 18:29:20.218081	2020-04-04 19:44:07.634629	\N	\N	100	435	\N	0.100000000000000006	auto-test	3961	2020-04-02 19:00:00+00	2020-04-05 20:59:00+00	13	\N	test	f
303	2019-09-19 10:04:35.673232	2019-11-20 21:51:53.750426	\N	\N	100	422	\N	0.0299999999999999989	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
343	2019-11-19 08:57:16.511397	2019-11-26 06:57:02.144395	\N	\N	100	246	\N	1	taskOwner	2612	2019-11-23 09:00:00+00	2019-11-23 13:00:00+00	11	\N	\N	f
401	2020-03-09 08:21:51.143582	2020-03-10 08:46:07.22067	\N	\N	100	433	\N	0.100000000000000006	taskOwner	3961	2020-03-08 19:00:00+00	2020-03-08 19:00:00+00	13	\N	test	f
417	2020-03-21 19:19:58.863021	2020-03-21 19:19:58.863021	\N	\N	100	484	\N	1	mentor	\N	2019-09-30 21:00:00+00	2019-11-30 21:00:00+00	11	\N	stage-interview	f
381	2020-02-19 15:17:32.07091	2020-03-22 19:09:12.677292	\N	\N	100	474	\N	0.200000000000000011	mentor	2103	2020-02-19 15:17:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f
397	2020-03-02 13:24:09.075432	2020-03-22 19:12:20.05552	\N	\N	100	426	\N	0.200000000000000011	mentor	2103	2020-03-20 13:20:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f
423	2020-03-31 10:19:16.141261	2020-04-06 07:07:06.10971	\N	\N	110	444	\N	0.699999999999999956	mentor	1090	2020-03-23 21:00:00+00	2020-04-07 20:59:00+00	13	\N	jstask	f
300	2019-09-17 08:15:35.715649	2020-04-06 10:49:35.519015	\N	\N	100	417	\N	0.0100000000000000002	mentor	\N	2019-09-09 00:00:00+00	2019-09-19 00:00:00+00	11	\N	htmlcssacademy	f
344	2019-11-19 09:04:18.469854	2019-11-28 17:17:02.674641	\N	\N	128	129	\N	1	mentor	\N	2019-09-09 08:00:00+00	2019-11-24 20:59:00+00	11	\N	\N	f
327	2019-10-28 07:42:02.903354	2019-11-15 12:34:30.259197	\N	\N	100	418	\N	1	mentor	\N	2019-09-20 17:00:00+00	2019-09-29 20:59:00+00	11	\N	\N	f
331	2019-11-04 08:15:10.985127	2019-11-15 12:37:57.067586	\N	\N	110	444	\N	1	mentor	\N	2019-11-01 16:00:00+00	2019-11-06 20:39:00+00	11	\N	\N	f
353	2019-12-03 16:51:35.631349	2019-12-03 16:51:35.631349	\N	\N	100	450	\N	1	crossCheck	\N	2019-09-30 21:00:00+00	2019-12-01 20:59:00+00	11	\N	\N	f
354	2019-12-07 14:35:20.567268	2019-12-11 16:33:41.983256	\N	\N	60	96	\N	1	jury	2084	2019-12-07 12:31:00+00	2019-12-28 20:59:00+00	11	\N	\N	f
424	2020-03-31 10:21:55.660987	2020-03-31 10:21:55.660987	\N	\N	75	493	\N	0.299999999999999989	crossCheck	1090	2020-03-24 20:59:00+00	2020-04-07 20:59:00+00	13	4	jstask	f
356	2019-12-16 09:41:27.698435	2019-12-24 10:13:38.728977	\N	\N	210	452	\N	0.299999999999999989	crossCheck	606	2019-12-03 07:39:00+00	2019-12-22 21:00:00+00	11	\N	\N	f
313	2019-09-30 08:17:27.15297	2019-11-20 21:53:55.352852	\N	\N	100	432	\N	0.0100000000000000002	taskOwner	2480	2019-09-22 00:00:00+00	2019-09-22 00:00:00+00	11	\N	\N	f
316	2019-09-30 08:22:03.026072	2019-11-20 21:54:11.847779	\N	\N	100	433	\N	0.0500000000000000028	taskOwner	2032	2019-09-26 00:00:00+00	2019-09-26 00:00:00+00	11	\N	\N	f
319	2019-10-13 13:51:52.830672	2019-11-20 21:55:14.344517	\N	\N	100	439	\N	0.299999999999999989	mentor	1328	2019-10-13 00:00:00+00	2019-10-20 00:00:00+00	11	\N	\N	f
310	2019-09-22 09:58:21.070871	2019-11-20 21:52:32.957984	\N	\N	100	430	\N	0.0400000000000000008	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
325	2019-10-27 12:09:53.130143	2019-11-15 12:31:01.943109	\N	\N	50	442	\N	1	mentor	\N	2019-10-24 17:00:00+00	2019-10-27 20:59:00+00	11	\N	\N	f
307	2019-09-20 09:59:22.00868	2019-11-20 21:52:16.13903	\N	\N	100	427	\N	0.0400000000000000008	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
369	2020-02-02 03:55:35.429745	2020-03-12 07:11:39.495304	\N	\N	100	437	\N	0.100000000000000006	mentor	\N	2020-02-02 01:54:00+00	2020-02-16 20:59:00+00	13	\N	cv:markdown	f
373	2020-02-09 18:18:59.381025	2020-03-12 07:13:13.223671	\N	\N	60	465	\N	0.200000000000000011	mentor	\N	2020-02-01 21:00:00+00	2020-03-15 20:59:00+00	13	\N	codewars:stage1	f
368	2020-02-01 20:13:13.966515	2020-03-12 07:10:32.0252	\N	\N	100	417	\N	0.100000000000000006	mentor	2032	2020-02-02 09:00:00+00	2020-02-23 20:59:00+00	13	\N	htmlcssacademy	f
336	2019-11-13 07:47:34.232721	2019-11-15 12:40:11.757945	\N	\N	120	445	\N	1	mentor	1328	2019-11-08 05:00:00+00	2019-11-11 20:59:00+00	11	\N	\N	f
328	2019-10-28 07:48:01.625307	2019-11-15 12:42:26.150687	\N	\N	100	443	\N	1	mentor	\N	2019-10-01 17:00:00+00	2019-12-01 20:59:00+00	11	\N	\N	f
345	2019-11-19 09:23:27.67568	2019-12-23 21:01:53.560053	\N	\N	100	83	\N	1	mentor	2032	2019-11-30 17:00:00+00	2019-12-24 20:59:00+00	11	\N	\N	f
320	2019-10-13 13:52:22.151208	2019-11-16 13:10:56.094496	\N	\N	100	438	\N	0.299999999999999989	mentor	1328	2019-10-13 00:00:00+00	2019-10-20 00:00:00+00	11	\N	\N	f
349	2019-11-19 11:04:25.743014	2020-01-14 08:52:31.860422	\N	\N	450	352	\N	1	assigned	1328	2019-12-18 19:00:00+00	2020-01-08 20:59:00+00	11	\N	\N	f
347	2019-11-19 10:18:28.401575	2019-11-19 10:18:28.401575	\N	\N	100	351	\N	1	taskOwner	2612	2019-12-07 09:00:00+00	2019-12-07 13:00:00+00	11	\N	\N	f
332	2019-11-05 11:51:40.950343	2019-11-19 10:21:01.444201	\N	\N	120	89	\N	1	mentor	\N	2019-11-03 21:00:00+00	2019-12-08 20:59:00+00	11	\N	\N	f
351	2019-11-20 11:37:02.922582	2019-11-20 11:37:02.922582	\N	\N	100	407	\N	1	mentor	\N	2020-01-01 08:00:00+00	2020-01-17 20:59:00+00	11	\N	\N	f
367	2020-01-19 16:51:46.691809	2020-01-19 16:51:46.691809	\N	\N	100	88	\N	1	taskOwner	1328	2020-01-18 21:00:00+00	2020-01-19 21:00:00+00	11	\N	\N	f
301	2019-09-17 13:42:41.220995	2019-11-20 21:51:18.507183	\N	\N	100	421	\N	0.0200000000000000004	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
304	2019-09-20 09:45:08.623688	2019-11-20 21:51:58.821689	\N	\N	100	424	\N	0.0500000000000000028	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
305	2019-09-20 09:45:31.423306	2019-11-20 21:52:03.967525	\N	\N	100	425	\N	0.0299999999999999989	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
308	2019-09-20 09:59:54.237603	2019-11-20 21:52:21.418289	\N	\N	100	426	\N	0.0200000000000000004	mentor	\N	2019-09-23 00:00:00+00	2019-10-19 00:00:00+00	11	\N	\N	f
425	2020-03-31 10:25:14.33142	2020-03-31 10:25:14.33142	\N	\N	100	494	\N	0.100000000000000006	crossCheck	1090	2020-03-26 20:59:00+00	2020-04-07 20:59:00+00	13	4	jstask	f
382	2020-02-19 15:18:06.945157	2020-03-22 19:03:14.201634	\N	\N	100	473	\N	0.200000000000000011	mentor	2103	2020-02-19 15:17:00+00	2020-03-23 20:59:00+00	13	\N	jstask	f
370	2020-02-02 04:03:10.255065	2020-03-12 07:11:48.755187	\N	\N	100	84	\N	0.100000000000000006	autoTest	\N	2020-02-02 02:02:00+00	2020-02-18 20:59:00+00	13	\N	cv:html	f
398	2020-03-02 13:24:43.551181	2020-03-17 08:05:11.649945	\N	\N	100	424	\N	0.5	mentor	2103	2020-03-02 13:24:00+00	2020-03-22 20:59:00+00	13	\N	jstask	f
386	2020-02-21 10:26:08.19839	2020-09-24 18:52:15.030419	\N	\N	100	476	\N	1	crossCheck	677	2020-02-11 16:00:00+00	2020-03-11 20:59:00+00	13	1	htmltask	f
\.


--
-- Data for Name: course_user; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.course_user (id, "createdDate", "updatedDate", "courseId", "userId", "isManager", "isJuryActivist", "isSupervisor") FROM stdin;
\.


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.event (id, "createdDate", "updatedDate", name, "descriptionUrl", description, type, discipline) FROM stdin;
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
4	2019-09-12 09:04:58.808458	2020-03-23 10:47:18.744158	HTML&CSS Basics	\N	\N	lecture	javascript
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
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.feedback (id, "createdDate", "updatedDate", "badgeId", "fromUserId", "toUserId", "courseId", comment, "heroesUrl") FROM stdin;
\.


--
-- Data for Name: mentor; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.mentor (id, "createdDate", "updatedDate", "maxStudentsLimit", "courseId", "userId", "studentsPreference", "isExpelled") FROM stdin;
1266	2020-04-06 15:39:35.609875	2020-04-06 15:39:35.609875	\N	13	2595	\N	f
1267	2020-04-06 15:39:40.768722	2020-04-06 15:39:40.768722	\N	13	2612	\N	f
1268	2020-04-06 15:39:46.991811	2020-04-06 15:39:46.991811	\N	13	2084	\N	f
1269	2020-04-06 15:39:51.547456	2020-04-06 15:39:51.547456	\N	13	2032	\N	f
\.


--
-- Data for Name: mentor_registry; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.mentor_registry (id, "userId", "preferedCourses", "maxStudentsLimit", "englishMentoring", "preferedStudentsLocation", "createdDate", "updatedDate", comment, "technicalMentoring", "preselectedCourses", canceled) FROM stdin;
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

COPY public.registry (id, type, status, comment, "createdDate", "updatedDate", "userId", "courseId", attributes) FROM stdin;
8953	student	approved	\N	2020-04-06 15:15:02.782811	2020-04-06 15:15:02.782811	11563	13	{}
8954	student	approved	\N	2020-04-06 15:30:27.1162	2020-04-06 15:30:27.1162	677	13	{}
8955	student	approved	\N	2020-04-06 15:31:44.431228	2020-04-06 15:31:44.431228	1090	13	{}
\.


--
-- Data for Name: repository_event; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.repository_event (id, "repositoryUrl", action, "githubId", "createdDate", "updatedDate") FROM stdin;
\.


--
-- Data for Name: stage; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage (id, "createdDate", "updatedDate", name, "courseId", status, "startDate", "endDate") FROM stdin;
\.


--
-- Data for Name: stage_interview; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.stage_interview (id, "createdDate", "updatedDate", "studentId", "mentorId", "stageId", "isCompleted", decision, "isGoodCandidate", "courseId", "courseTaskId") FROM stdin;
10687	2020-04-07 20:27:20.124459	2020-04-07 20:27:20.124459	14327	1266	\N	f	\N	\N	13	408
10688	2020-04-07 20:27:41.249823	2020-04-07 20:27:41.249823	14329	1266	\N	f	\N	\N	13	408
10689	2020-04-07 20:28:00.755084	2020-04-07 21:07:08.374015	14329	1266	\N	t	noButGoodCandidate	t	13	408
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

COPY public.student (id, "createdDate", "updatedDate", "isExpelled", "expellingReason", "courseCompleted", "isTopPerformer", "preferedMentorGithubId", "readyFullTime", "courseId", "userId", "mentorId", "cvUrl", "hiredById", "hiredByName", "isFailed", "totalScore", "startDate", "endDate", repository, "totalScoreChangeDate", "repositoryLastActivityDate", rank) FROM stdin;
14329	2020-04-06 15:31:44.421341	2020-04-06 15:31:44.421341	f	\N	f	f	\N	\N	13	1090	\N	\N	\N	\N	f	0	2020-04-06 15:31:44.388+00	\N	\N	\N	\N	0
14331	2020-04-06 15:33:59.694437	2020-04-06 15:33:59.694437	f	\N	f	f	\N	\N	13	2098	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14333	2020-04-06 15:34:09.064514	2020-04-06 15:34:09.064514	f	\N	f	f	\N	\N	13	2115	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14334	2020-04-06 15:34:17.983101	2020-04-06 15:34:17.983101	f	\N	f	f	\N	\N	13	2277	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14335	2020-04-06 15:34:19.221853	2020-04-06 15:34:19.221853	f	\N	f	f	\N	\N	13	2480	\N	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14327	2020-04-06 15:15:02.77565	2020-04-07 13:45:33.875491	f	\N	f	f	\N	\N	13	11563	1266	\N	\N	\N	f	0	2020-04-06 15:15:02.757+00	\N	\N	\N	\N	0
14336	2020-04-06 15:39:07.779618	2020-04-07 13:47:34.610412	f	\N	f	f	\N	\N	13	2549	1266	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14332	2020-04-06 15:34:04.8008	2020-04-07 14:10:31.669064	f	\N	f	f	\N	\N	13	2103	1267	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
14328	2020-04-06 15:30:27.104695	2020-04-07 22:23:34.842319	t	test	f	f	\N	\N	13	677	1268	\N	\N	\N	f	0	2020-04-06 15:30:27.091+00	2020-04-07 13:34:01.397+00	\N	\N	\N	0
14330	2020-04-06 15:33:53.058912	2020-04-08 19:32:57.119702	f	\N	f	f	\N	\N	13	2089	1266	\N	\N	\N	f	0	1970-01-01 00:00:00+00	\N	\N	\N	\N	0
\.


--
-- Data for Name: student_feedback; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.student_feedback (id, "createdDate", "updatedDate", comment, "studentId") FROM stdin;
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task (id, "createdDate", "updatedDate", name, "descriptionUrl", description, verification, "githubPrRequired", "useJury", "allowStudentArtefacts", "githubRepoName", "sourceGithubRepoUrl", type, tags, discipline, attributes) FROM stdin;
441	2019-10-16 15:05:31.176646	2019-10-16 15:05:31.176646	Technical screening 2	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md	\N	manual	f	f	f	\N	\N	\N		\N	{}
413	2019-08-29 10:57:34.732592	2019-11-11 18:19:01.013044	ST JS Test	http://learn.javascript.ru/	\N	manual	f	f	f	\N	\N	test		\N	{}
448	2019-11-20 10:39:10.274681	2019-11-20 10:39:10.274681	Fancy Weather	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md	\N	manual	t	f	f	\N	\N	jstask		\N	{}
445	2019-11-13 07:46:32.194939	2019-12-03 14:41:40.672641	Code Jam "Palette"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-palette/codejam-palette_en.md	\N	manual	t	f	f	\N	\N	codejam	codejam,canvas,dom	\N	{}
451	2019-12-11 17:17:25.352869	2019-12-11 17:17:25.352869	Async-extra	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	\N	{}
454	2019-12-16 10:37:14.018926	2019-12-16 10:37:14.018926	Typical Arrays Problems	https://github.com/Shastel/typical-arrays-problems	\N	auto	f	f	f	typical-arrays-problems	https://github.com/Shastel/typical-arrays-problems	jstask	epam	\N	{}
457	2019-12-16 10:38:57.10798	2019-12-16 10:38:57.10798	Human Readable Number	https://github.com/Shastel/human-readable-number	\N	auto	f	f	f	human-readable-number	https://github.com/Shastel/human-readable-number	jstask	epam	\N	{}
460	2019-12-20 08:53:52.921362	2019-12-20 08:53:52.921362	re:bind	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	\N	{}
417	2019-09-17 07:09:54.066212	2020-02-02 09:07:48.746248	HTML/CSS Self Education	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/HTML-CSS-self-ru.md	\N	auto	f	f	f	\N	\N	htmlcssacademy	stage1	\N	{}
462	2020-02-07 08:05:04.999374	2020-02-07 08:05:04.999374	Songbird	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
466	2020-02-11 08:49:28.691804	2020-02-11 08:49:28.691804	ios Test	https://test.com	\N	manual	f	f	f	\N	\N	jstask		\N	{}
468	2020-02-17 08:27:20.358749	2020-02-17 08:28:49.855244	Angular. Intro	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/intro.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
471	2020-02-17 09:19:10.05115	2020-02-17 09:19:10.05115	Angular. RxJS & Observables. HTTP	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/rxjs-observables-http.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
475	2020-02-19 15:14:40.900394	2020-02-19 15:22:20.919668	Typical Arrays Problems	https://github.com/rolling-scopes-school/typical-arrays-problems/blob/master/README.md	\N	auto	f	f	f	typical-arrays-problems	https://github.com/rolling-scopes-school/typical-arrays-problems	jstask	stage1,algorithms	\N	{}
473	2020-02-19 15:13:21.398993	2020-02-19 15:22:34.391055	Human Readable Number	https://github.com/rolling-scopes-school/human-readable-number/blob/master/README.md	\N	auto	f	f	f	human-readable-number	https://github.com/rolling-scopes-school/human-readable-number	jstask	stage1,algorithms	\N	{}
478	2020-02-26 06:55:13.604626	2020-02-26 06:55:24.65169	FAKE TEST IOS	http://example.com	\N	auto	f	f	f	test-solution	https://github.com/apalchys/test-solution	objctask	fake	\N	{}
480	2020-03-02 06:32:37.242366	2020-03-02 06:32:49.611475	React Culture Portal	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-culture-portal.md	\N	manual	f	f	f	\N	\N	jstask	portal,react	\N	{}
477	2020-02-25 23:21:08.16798	2020-03-12 17:34:18.306073	FAKE TEST KOTLIN	http://example.com	\N	auto	f	f	f	nadzeya	https://github.com/ziginsider/rs_task1	kotlintask	fake	\N	{}
483	2020-03-15 15:29:20.69008	2020-03-15 15:29:20.69008	Angular test	https://github.com/rolling-scopes-school/tasks/tree/master/tasks	\N	auto	f	f	f	\N	\N	test	angular,Angular	\N	{}
485	2020-03-16 12:49:18.137702	2020-03-16 12:49:18.137702	Singolo. DOM & Responsive 	https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo	\N	manual	f	f	f	\N	\N	htmltask	stage1	javascript	{}
487	2020-03-19 15:00:38.575898	2020-03-19 15:04:07.496857	[iOS] Quiz1	https://docs.google.com/forms/d/e/1FAIpQLSf4NwQRa2WbcjlcsDJI0kv62qJx0F0ltgapz0WczFrdBBSXug/viewform	\N	manual	f	f	f	\N	\N	test	stage1	ios-obj-c	{}
416	2019-09-10 08:14:33.753801	2019-09-10 08:14:33.753801	UZ Custom lodash tests	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/10.-Custom-lodash-tests	\N	manual	f	f	f	\N	\N	\N		\N	{}
95	2019-04-26 14:55:46.480357	2019-08-14 10:45:30.750037	CJ "CSS QD"	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
442	2019-10-27 12:08:46.726741	2019-10-28 06:59:34.373416	Code Jam "Canvas"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-canvas/codejam-canvas.md	\N	manual	f	f	f	\N	\N	\N	stage2 ,canvas,codejam	\N	{}
443	2019-10-28 07:46:31.518101	2019-11-01 14:30:13.900706	Repair Design Project. Difficulty Level 3	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level-3/repair-design-project/repair-design-project-en.md	\N	manual	f	f	f	\N	\N	\N	stage1	\N	{}
486	2020-03-18 12:10:57.111813	2020-03-20 09:12:43.838469	Algorithms Part 1	https://github.com/rolling-scopes-school/rs.android-stage1-task1	\N	auto	f	f	f	rs.android-stage1-task1	https://github.com/rolling-scopes-school/rs.android-stage1-task1	kotlintask	Android,Kotlin	android-kotlin	{}
446	2019-11-13 08:16:07.288782	2019-11-24 15:47:56.206248	Code Jam "Image API"	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-2/codejam-image-api/codejam-image-api_ru.md	\N	manual	t	f	f	\N	\N	codejam	codejam,stage2 	\N	{}
449	2019-11-27 15:58:51.613495	2019-11-27 15:58:51.613495	ST Checkpoint 1	https://app.rs.school/	\N	manual	f	f	f	\N	\N	interview		\N	{}
402	2019-08-14 10:35:12.012641	2019-12-03 14:49:35.649926	Code Jam "Culture Portal"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-culture-portal.md	\N	manual	f	f	f	\N	\N	codejam	codejam	\N	{}
452	2019-12-16 09:39:38.046401	2019-12-16 09:39:38.046401	Fancy-weather Cross-Check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md	\N	manual	f	f	f	\N	\N	jstask		\N	{}
455	2019-12-16 10:37:47.551919	2019-12-16 10:37:47.551919	Reverse Int	https://github.com/Shastel/reverse-int	\N	auto	f	f	f	reverse-int	https://github.com/Shastel/reverse-int	jstask	epam	\N	{}
458	2019-12-16 15:59:10.804471	2019-12-16 15:59:10.804471	ST React App	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Things-APP	\N	manual	f	f	f	\N	\N	jstask	st	\N	{}
461	2020-01-10 20:07:46.237318	2020-01-10 20:07:46.237318	Angular Workshop	https://angular.io/	\N	manual	f	f	f	\N	\N	jstask		\N	{}
463	2020-02-07 08:05:15.718038	2020-02-07 08:05:15.718038	Songbird	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/songbird.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
464	2020-02-07 08:05:57.730605	2020-02-07 08:05:57.730605	Calculator	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/calculator.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
467	2020-02-15 14:41:17.390262	2020-02-16 08:44:46.403205	Basic JS	https://github.com/AlreadyBored/basic-js	\N	auto	f	f	f	basic-js	https://github.com/AlreadyBored/basic-js	jstask	stage1,algorithms	\N	{}
469	2020-02-17 08:28:38.434548	2020-02-17 08:28:54.065591	Angular. Components. Directives & Pipes	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/components-directives-pipes.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
474	2020-02-19 15:13:59.744793	2020-02-19 15:22:27.177884	Reverse Int	https://github.com/rolling-scopes-school/reverse-int/blob/master/README.md	\N	auto	f	f	f	reverse-int	https://github.com/rolling-scopes-school/reverse-int	jstask	stage1,algorithms	\N	{}
472	2020-02-19 15:12:35.267242	2020-02-19 15:22:41.830318	Towel Sort	https://github.com/rolling-scopes-school/towel-sort/blob/master/README.md	\N	auto	f	f	f	towel-sort	https://github.com/rolling-scopes-school/towel-sort	jstask	stage1,algorithms	\N	{}
476	2020-02-21 10:24:38.588117	2020-02-21 10:24:38.588117	Singolo	https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/singolo	\N	manual	f	f	f	\N	\N	htmltask	stage1,html	\N	{}
479	2020-03-02 06:25:15.661263	2020-03-02 06:25:15.661263	Angular Culture Portal	https://github.com/rolling-scopes-school/tasks/blob/angular-2020Q1/tasks/angular/culture-portal.md	\N	manual	f	f	f	\N	\N	jstask	angular,portal	\N	{}
481	2020-03-02 11:56:29.196388	2020-03-02 11:56:29.196388	Data grid	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/datagrid.md	\N	manual	f	f	f	\N	\N	jstask	react	\N	{}
396	2019-08-06 09:43:51.676522	2019-08-06 09:43:51.676522	Match Match Game	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/match-match-game.md	\N	manual	\N	f	f	\N	\N	\N		\N	{}
400	2019-08-06 09:55:49.176631	2019-08-06 09:55:49.176631	React Redux	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/react-match-match-game.md	\N	manual	\N	f	f	\N	\N	\N		\N	{}
86	2019-04-26 14:55:46.436642	2019-08-14 10:45:50.369308	CJ "DOM, DOM Events"	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
398	2019-08-06 09:52:41.754622	2019-08-14 10:46:07.362506	CJ "Lodash Quick Draw"	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
82	2019-04-26 14:55:46.414479	2019-04-26 14:55:46.414479	HTML/CSS Test	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
85	2019-04-26 14:55:46.431913	2019-04-26 14:55:46.431913	Markup #1	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
88	2019-04-26 14:55:46.446081	2019-04-26 14:55:46.446081	RS Activist	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
91	2019-04-26 14:55:46.460834	2019-04-26 14:55:46.460834	Mentor Dashboard	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
92	2019-04-26 14:55:46.465569	2019-04-26 14:55:46.465569	CoreJS/Arrays Test	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
94	2019-04-26 14:55:46.475554	2019-04-26 14:55:46.475554	Game	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
97	2019-04-26 14:55:46.49026	2019-04-26 14:55:46.49026	DreamTeam	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
90	2019-04-26 14:55:46.455449	2019-04-26 14:55:46.45545	Code Jam "Scoreboard"	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
117	2019-04-30 13:51:17.676745	2019-05-14 10:55:17.676745	Hexal	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup_d1_Hexal.md	\N	manual	f	f	f	\N	\N	\N		\N	{}
221	2019-05-17 13:01:38.633934	2019-05-17 13:01:38.633934	htmlCssBasics	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
224	2019-05-17 13:01:38.650481	2019-05-17 13:01:38.650481	layouts	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
222	2019-05-17 13:01:38.639424	2019-05-17 13:01:38.639424	floatExercise	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
223	2019-05-17 13:01:38.644267	2019-05-17 13:01:38.644267	positioning	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
225	2019-05-17 13:01:38.655673	2019-05-17 13:01:38.655673	workshop	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
226	2019-05-17 13:01:38.660659	2019-05-17 13:01:38.660659	responsive	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
227	2019-05-17 13:01:38.666042	2019-05-17 13:01:38.666042	formsWidgets	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
228	2019-05-17 13:01:38.671159	2019-05-17 13:01:38.671159	finalTask	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
231	2019-05-17 13:01:38.686221	2019-05-17 13:01:38.686221	doublyLinkedList	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
232	2019-05-17 13:01:38.695428	2019-05-17 13:01:38.695428	customJQuery	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
234	2019-05-17 13:01:38.705612	2019-05-17 13:01:38.705612	realJquery	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
235	2019-05-17 13:01:38.71084	2019-05-17 13:01:38.71084	wsc	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
236	2019-05-17 13:01:38.715941	2019-05-17 13:01:38.715941	noNameOne	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
237	2019-05-17 13:01:38.720957	2019-05-17 13:01:38.720957	noNameTwo	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
238	2019-05-17 13:02:30.13361	2019-05-17 13:02:30.13361	workHonor	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
240	2019-05-17 13:02:30.15818	2019-05-17 13:02:30.15818	cssQDTime	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
241	2019-05-17 13:02:30.163081	2019-05-17 13:02:30.163081	uiLab	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
242	2019-05-17 13:02:30.168177	2019-05-17 13:02:30.168177	flexbox	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
243	2019-05-17 13:02:30.173271	2019-05-17 13:02:30.173271	adaptive	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
244	2019-05-17 13:02:30.184497	2019-05-17 13:02:30.184497	cssTotal	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
245	2019-05-17 13:02:30.190762	2019-05-17 13:02:30.190762	workOnLessons	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
247	2019-05-17 13:02:30.201713	2019-05-17 13:02:30.201713	functionMake	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
248	2019-05-17 13:02:30.207184	2019-05-17 13:02:30.207184	wsc	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
249	2019-05-17 13:02:30.212126	2019-05-17 13:02:30.212126	gulp	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
250	2019-05-17 13:02:30.217988	2019-05-17 13:02:30.217988	honoiTower	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
251	2019-05-17 13:02:30.223044	2019-05-17 13:02:30.223044	animation	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
252	2019-05-17 13:02:30.2279	2019-05-17 13:02:30.2279	customJQuery	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
253	2019-05-17 13:02:30.233767	2019-05-17 13:02:30.233767	tdd	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
89	2019-04-26 14:55:46.450715	2019-05-27 08:35:37.359351	Presentation	\N	\N	manual	\N	f	t	\N	\N	\N		\N	{}
96	2019-04-26 14:55:46.485433	2019-05-27 08:39:44.221825	Offline Presentation	\N	\N	manual	\N	t	f	\N	\N	\N		\N	{}
351	2019-06-05 11:51:12.229807	2019-06-05 11:51:12.229807	Stage#2 Final Test	\N	\N	auto	\N	f	f	\N	\N	\N		\N	{}
369	2019-06-26 13:24:39.790098	2019-06-26 13:24:39.790098	youTube	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
387	2019-07-08 13:30:12.12725	2019-07-08 13:30:12.12725	Padawans	\N	\N	auto	\N	f	f	\N	\N	\N		\N	{}
388	2019-07-08 13:31:46.251832	2019-07-08 13:31:46.251832	UZ CV	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
389	2019-07-08 13:32:18.083335	2019-07-08 13:32:18.083335	UZ Read me	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
390	2019-07-10 12:56:29.975418	2019-07-10 12:56:29.975418	UZ Layout	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/2.-Layout	Create web page, strictly according to:\n\nLambda restaurant layout\n\nBrowser support: Google Chrome, Mozilla Firefox, Microsoft Edge.	manual	\N	f	f	\N	\N	\N		\N	{}
410	2019-08-29 09:41:00.400898	2019-08-29 10:08:08.993969	ST Chat	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/6.-Chat	\N	manual	t	f	f	\N	\N	\N		\N	{}
407	2019-08-29 09:32:17.606001	2019-08-29 10:08:44.864627	ST Custom Lodash	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-Custom-Lodash	\N	manual	t	f	f	\N	\N	\N		\N	{}
230	2019-05-17 13:01:38.681206	2019-08-29 10:10:10.985834	ST JS Assignments	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/7.-JS-assignments	\N	manual	t	f	f	\N	\N	\N		\N	{}
435	2019-09-30 08:14:14.847165	2019-10-15 12:40:10.75085	HTML/CSS Test Advanced	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md	\N	auto	f	f	f	\N	\N	test	stage1	\N	{}
408	2019-08-29 09:34:32.473242	2019-08-29 10:08:34.054101	ST Cyclic menu	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Cyclic-menu	\N	manual	t	f	f	\N	\N	\N		\N	{}
405	2019-08-29 09:16:23.185166	2019-08-29 10:09:04.204396	ST Auto Complete	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/1.-Auto-Complete	\N	manual	t	f	f	\N	\N	\N		\N	{}
411	2019-08-29 10:11:56.69667	2019-08-29 10:11:56.69667	ST Catalogue. P.1 React Client	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.1-React-Client	\N	manual	t	f	f	\N	\N	\N		\N	{}
414	2019-08-29 10:57:50.108237	2019-08-29 10:57:50.108237	ST JS Test 2	http://learn.javascript.ru/	\N	manual	f	f	f	\N	\N	\N		\N	{}
397	2019-08-06 09:46:51.573349	2019-08-06 09:46:51.573349	CSS Recipes & Layouts	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/css-recipes-and-layouts.md	\N	manual	\N	f	f	\N	\N	\N		\N	{}
401	2019-08-06 09:56:50.593508	2019-08-06 09:56:50.593508	Game Refactoring	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/game-refactoring.md	\N	auto	\N	f	f	\N	\N	\N		\N	{}
229	2019-05-17 13:01:38.676219	2019-08-06 09:59:19.619433	JS Test	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
122	2019-04-30 14:11:11.94101	2019-05-14 10:14:11.94101	Neutron Mail	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/markup-d2-NeutronMail-en.md	\N	manual	t	f	f	\N	\N	\N		\N	{}
87	2019-04-26 14:55:46.441332	2019-05-14 10:56:46.441332	YouTube	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/youtube.md	\N	manual	t	f	f	\N	\N	\N		\N	{}
404	2019-08-29 08:12:24.073776	2019-10-28 10:40:19.063008	ST Read me	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/0.-Readme	\N	manual	t	f	f	\N	\N	\N		\N	{}
422	2019-09-19 10:02:05.134479	2019-11-01 14:31:29.943288	JS: Multiply	https://github.com/Shastel/multiply	\N	auto	f	f	f	multiply	https://github.com/Shastel/multiply	jstask	stage1	\N	{}
484	2020-03-15 23:11:23.55455	2020-03-25 09:27:46.940288	Technical Screening	https://docs.rs.school/#/technical-screening	\N	manual	f	f	f	\N	\N	stage-interview	interview	\N	{}
428	2019-09-20 09:56:26.502967	2019-11-08 11:44:12.440623	JS: JS-edu	https://github.com/davojta/js-edu	\N	auto	f	f	f	js-edu	https://github.com/davojta/js-edu	jstask	stage1	\N	{}
431	2019-09-24 08:20:14.453176	2019-11-08 11:44:50.366453	JS: Unique 	https://github.com/Shastel/unique	\N	auto	f	f	f	unique	https://github.com/Shastel/unique	jstask	stage1	\N	{}
349	2019-05-28 15:21:16.311993	2019-11-19 09:35:38.995602	CoreJS Interview 	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/interview-corejs.md	\N	manual	f	f	f	\N	\N	interview		\N	{}
93	2019-04-26 14:55:46.470595	2019-11-19 09:53:57.574635	WebSocket Challenge	https://github.com/rolling-scopes-school/lectures/blob/master/lectures/websocket-challenge.md	\N	manual	f	f	f	\N	\N	codejam		\N	{}
350	2019-06-03 06:50:19.575782	2019-11-19 10:53:20.712051	CodeJam "Animation Player"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-animation-player.md	\N	manual	f	f	f	\N	\N	codejam		\N	{}
352	2019-06-21 07:22:11.052584	2019-11-19 13:06:31.954741	Piskel-clone	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/piskel-clone.md	\N	manual	f	f	f	\N	\N	jstask		\N	{}
129	2019-05-13 11:45:12.64168	2020-03-09 11:46:32.445946	Codewars stage 2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars.md	\N	auto	f	f	f	\N	\N	codewars:stage2	codewars	\N	{}
220	2019-05-17 13:01:38.627128	2019-05-17 13:01:38.627128	workHonor	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
391	2019-07-15 12:39:31.48174	2019-07-15 12:39:31.48174	UZ Autocomplete	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/3.-Autocomplete	The task is to implement a custom createAutocomplete function	manual	\N	f	f	\N	\N	\N		\N	{}
392	2019-07-17 14:41:10.098861	2019-07-17 14:41:10.098861	UZ Codewars	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/4.-Codewars	\N	manual	\N	f	f	\N	\N	\N		\N	{}
394	2019-07-30 09:47:10.177586	2019-07-30 09:47:10.177586	UZ Javascript Classes & Inheritance	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/5.-Javascript-Classes-&-Inheritance	\N	manual	\N	f	f	\N	\N	\N		\N	{}
395	2019-07-31 12:59:19.767726	2019-07-31 12:59:19.767726	UZ Custom Lodash	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/8.-Custom-Lodash	\N	manual	\N	f	f	\N	\N	\N		\N	{}
246	2019-05-17 13:02:30.196693	2019-08-06 09:59:24.394646	JS Test	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
233	2019-05-17 13:01:38.700498	2019-08-06 11:08:43.462233	CSS QD	\N	\N	manual	\N	f	f	\N	\N	\N		\N	{}
403	2019-08-22 09:35:28.567592	2019-08-22 09:35:28.567592	UZ Cyclic menu	https://github.com/rolling-scopes-school/RS-Uzbekistan/wiki/9.-Cyclic-menu	\N	manual	\N	f	f	\N	\N	\N		\N	{}
406	2019-08-29 09:21:54.045655	2019-08-29 10:08:53.337095	ST Javascript Classes & Inheritance	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/2.-Javascript-Classes-&-Inheritance	\N	manual	t	f	f	\N	\N	\N		\N	{}
412	2019-08-29 10:12:27.740479	2019-08-29 10:12:27.740479	ST Catalogue. P.2 Angular Admin Client	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/FINAL:-Catalogue.-P.2-Angular-Admin-Client	\N	manual	t	f	f	\N	\N	\N		\N	{}
415	2019-08-29 11:07:41.484385	2019-08-29 11:07:41.484385	ST Bonus	https://github.com/rolling-scopes-school/docs/blob/master/rs-activist.md	\N	manual	f	f	f	\N	\N	\N		\N	{}
434	2019-09-30 08:09:29.61975	2019-10-08 14:24:55.849506	RS School Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/rs-school-test.md	\N	auto	f	f	f	\N	\N	test	stage1	\N	{}
436	2019-09-30 08:14:56.284783	2019-10-08 07:05:43.425884	Git Test #2	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md\t	\N	manual	f	f	f	\N	\N	\N	stage1	\N	{}
433	2019-09-30 08:05:43.034506	2019-10-08 14:25:09.658362	HTML/CSS Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/html-css-test.md	\N	auto	f	f	f	\N	\N	test	stage1	\N	{}
465	2020-02-09 18:17:26.12848	2020-02-09 18:17:26.12848	Codewars stage 1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars-stage-1.md	\N	auto	f	f	f	\N	\N	codewars:stage1	codewars	\N	{}
432	2019-09-30 08:03:38.411822	2019-10-28 06:59:48.722431	Git Test	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-test.md	\N	auto	f	f	f	\N	\N	test	stage1	\N	{}
418	2019-09-17 07:20:20.07102	2019-10-28 07:40:32.105112	Theyalow. Difficulty Level 1	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markups/level%201/theyalow/theyalow-en.md	\N	manual	f	f	f	\N	\N	\N	stage1	\N	{}
439	2019-10-13 13:50:38.385396	2019-11-01 14:29:45.50486	Priority Queue	https://github.com/rolling-scopes-school/priority-queue	\N	auto	f	f	f	priority-queue	https://github.com/rolling-scopes-school/priority-queue	jstask	stage1,algorithms	\N	{}
424	2019-09-20 09:40:16.65468	2019-11-01 14:31:12.362038	JS: Expression Calculator	https://github.com/romacher/expression-calculator	\N	auto	f	f	f	expression-calculator	https://github.com/romacher/expression-calculator	jstask	stage1	\N	{}
421	2019-09-17 13:40:31.235798	2019-11-01 14:31:18.390464	JS: Brackets	https://github.com/Shastel/brackets	\N	auto	f	f	f	brackets	https://github.com/Shastel/brackets	jstask	stage1	\N	{}
423	2019-09-19 10:02:37.126233	2019-11-01 14:31:37.02801	JS: Zeros	https://github.com/Shastel/zeros	\N	auto	f	f	f	zeros	https://github.com/Shastel/zeros	jstask	stage1	\N	{}
393	2019-07-26 13:14:49.106312	2019-11-07 09:21:44.562843	ST JS assignments	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/3.-JS-assignments	\N	manual	f	f	f	\N	\N	jstask	st	\N	{}
425	2019-09-20 09:42:22.766447	2019-11-08 11:43:53.046921	JS: Guessing-game	https://github.com/rolling-scopes-school/guessing-game	\N	auto	f	f	f	guessing-game	https://github.com/rolling-scopes-school/guessing-game	jstask	stage1	\N	{}
426	2019-09-20 09:54:01.865495	2019-11-08 11:44:00.705846	JS: Morse-decoder	https://github.com/romacher/morse-decoder	\N	auto	f	f	f	morse-decoder	https://github.com/romacher/morse-decoder	jstask	stage1	\N	{}
427	2019-09-20 09:54:43.876086	2019-11-08 11:44:06.756286	JS: Finite-state-machine	https://github.com/rolling-scopes-school/finite-state-machine	\N	auto	f	f	f	finite-state-machine	https://github.com/rolling-scopes-school/finite-state-machine	jstask	stage1	\N	{}
429	2019-09-22 09:55:22.942777	2019-11-08 11:44:20.763439	JS: Tic Tac Toe	https://github.com/rolling-scopes-school/tic-tac-toe	\N	auto	f	f	f	tic-tac-toe	https://github.com/rolling-scopes-school/tic-tac-toe	jstask	stage1	\N	{}
430	2019-09-22 09:56:18.079947	2019-11-08 11:45:10.648593	JS: Doubly Linked List	https://github.com/rolling-scopes-school/doubly-linked-list	\N	auto	f	f	f	doubly-linked-list	https://github.com/rolling-scopes-school/doubly-linked-list	jstask	stage1	\N	{}
409	2019-08-29 09:37:01.324698	2019-11-11 18:15:52.011347	ST Autocomplete UI	https://github.com/rolling-scopes-school/RS-Short-Track/wiki/4.-Autocomplete-UI	\N	manual	t	f	f	\N	\N	jstask		\N	{}
447	2019-11-18 07:47:39.508556	2019-11-18 07:47:39.508556	test-task	https://github.com/mikhama/test-task	\N	auto	f	f	f	test-task	https://github.com/mikhama/test-task	jstask		\N	{}
399	2019-08-06 09:54:06.658655	2019-12-03 14:49:49.549586	Code Jam "Hacktrain"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q1/tasks/codejam-train.md	\N	manual	f	f	f	\N	\N	codejam		\N	{}
440	2019-10-15 07:50:32.749775	2019-11-19 09:34:34.605432	Technical screening	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/technical-screening.md	\N	manual	f	f	f	\N	\N	interview	stage2 	\N	{}
450	2019-12-03 14:52:19.396399	2019-12-03 14:52:19.396399	Portfolio	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/stage-1/portfolio/portfolio-ru.md	\N	manual	f	f	f	\N	\N	htmltask	stage2 ,html	\N	{}
83	2019-04-26 14:55:46.421933	2019-11-30 18:36:50.662322	CoreJS	https://github.com/mikhama/core-js-101	\N	auto	t	f	f	core-js-101	https://github.com/mikhama/core-js-101	jstask		\N	{}
128	2019-05-02 09:41:43.371377	2019-12-03 14:42:15.453094	Code Jam "Palette"	https://github.com/rolling-scopes-school/tasks/blob/2018-Q3/tasks/codejam-pallete.md	\N	manual	t	f	f	\N	\N	codejam	deprecated	\N	{}
444	2019-11-04 08:12:31.634176	2020-03-31 10:17:18.546617	Virtual Keyboard	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-virtual-keyboard.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,js	javascript	{}
453	2019-12-16 10:34:47.548986	2019-12-16 10:34:47.548986	Temperature Converter	https://github.com/Shastel/temperature-converter	\N	auto	f	f	f	temperature-converter	https://github.com/Shastel/temperature-converter	jstask	epam	\N	{}
456	2019-12-16 10:38:26.769964	2019-12-16 10:38:26.769964	Towel Sort	https://github.com/Shastel/towel-sort	\N	auto	f	f	f	towel-sort	https://github.com/Shastel/towel-sort	jstask	epam	\N	{}
459	2019-12-18 14:22:47.842869	2019-12-18 14:22:47.842869	ST TDD	https://example.com	\N	manual	f	f	f	\N	\N	jstask	st	\N	{}
84	2019-04-26 14:55:46.426978	2020-02-10 18:45:57.803066	HTML, CSS & Git Basics	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-cv.md	\N	auto	f	f	f	\N	\N	cv:html	stage1	\N	{}
437	2019-10-06 11:20:27.617946	2020-02-10 06:18:24.928919	Markdown & Git	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/git-markdown.md	\N	auto	f	f	f	\N	\N	cv:markdown	stage1	\N	{}
470	2020-02-17 08:29:28.43587	2020-02-17 08:29:28.43587	Angular. Modules & Services. Routing	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/angular/modules-services-routing.md	\N	manual	f	f	f	\N	\N	jstask	Angular	\N	{}
438	2019-10-13 13:34:49.201156	2020-03-23 10:57:07.262729	Sudoku	https://github.com/rolling-scopes-school/sudoku	\N	auto	f	f	f	sudoku	https://github.com/rolling-scopes-school/sudoku	jstask	stage1,algorithms	\N	{}
488	2020-03-19 16:22:02.703098	2020-03-24 16:19:06.071144	rs.ios.task2	https://github.com/rolling-scopes-school/rs.ios-stage1-task2/blob/master/readme.md	\N	auto	f	f	f	rs.ios-stage1-task2	https://github.com/rolling-scopes-school/rs.ios-stage1-task2/	objctask	stage1	ios-obj-c	{"targets":{"project":{"folder":"RSSchool_T2","xcodeproj":"RSSchool_T2.xcodeproj"},"tests":{"folder":"RSSchool_T2Tests","classes":["AbbreviationTests.m","BlocksTest.m","DatesTest.m","FibonacciNumbersTests.m","StringTransform.m","TimeInWordsTests.m"]}},"folder":"RSSchool_T2","details":"","descriptions":""}
482	2020-03-10 20:39:15.488061	2020-03-24 16:20:39.287898	rs.ios.task1	https://github.com/rolling-scopes-school/rs.ios-stage1-task1/	\N	auto	f	f	f	rs.ios-stage1-task1	https://github.com/rolling-scopes-school/rs.ios-stage1-task1/	objctask	stage1	\N	{"targets":{"project":{"folder":"RSSchool_T1","xcodeproj":"RSSchool_T1.xcodeproj"},"tests":{"folder":"RSSchool_T1Tests","classes":["BillCounterTests.m","HighestPalindromeTests.m","MiniMaxSumTests.m","StringParseTests.m","T1ArrayTests.m"]}},"folder":"RSSchool_T1","details":"","descriptions":""}
489	2020-03-26 10:35:21.765085	2020-03-26 10:35:21.765085	Caesar cipher CLI tool	https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md	\N	manual	f	f	f	\N	\N	jstask	nodejs	javascript	{}
490	2020-03-26 14:29:07.41166	2020-03-26 14:29:07.41166	HTML/Css(basic)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/css-recipes.md	\N	manual	f	f	f	\N	\N	htmltask	Poland	javascript	{}
492	2020-03-31 09:33:53.140629	2020-03-31 09:33:53.140629	Express REST service	https://github.com/rolling-scopes-school/nodejs-course-template/blob/master/TASKS.md#task-2-express-rest-service	\N	manual	f	f	f	\N	\N	jstask	nodejs	nodejs	{}
493	2020-03-31 10:20:39.859981	2020-03-31 10:20:39.859981	Virtual Keyboard Cross-Check	https://rolling-scopes-school.github.io/checklist/	\N	manual	f	f	f	\N	\N	jstask	stage2 ,js,cross-check	javascript	{}
494	2020-03-31 10:23:52.389221	2020-03-31 10:23:52.389221	Gem Puzzle Cross-check	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codejam-the-gem-puzzle.md	\N	manual	f	f	f	\N	\N	jstask	stage2 ,cross-check,js	javascript	{}
495	2020-04-01 08:43:01.126352	2020-04-01 08:43:01.126352	[Android] Quiz 1	https://docs.google.com/forms/d/e/1FAIpQLSdFHiOBHHDZpwztLq3rGYf7EzEQPw56I0HeYlqfg8BpB6leYg/viewform?usp=sf_link	\N	manual	f	f	f	\N	\N	test		android-kotlin	{}
491	2020-03-30 09:57:08.558596	2020-04-01 20:44:38.183195	rs.ios.task3.test	https://github.com/rolling-scopes-school/rs.ios-stage1-task3/blob/master/readme.md	\N	auto	f	f	f	rs.ios-stage1-task3	https://github.com/rolling-scopes-school/rs.ios-stage1-task3	objctask	stage1	ios-obj-c	{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["ArrayPrintTests.m","FullBinaryTreesTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["DateMachineTests.m"]}},"testReplacement":{"link":"git@github.com:rolling-scopes-school/rs.ios-stage1-private-tests.git","folder":"stage1-task3","replacement":[{"folder":"RSSchool_T3Tests","test":"ArrayPrintTests.m"},{"folder":"RSSchool_T3UITests","test":"DateMachineTests.m"}],"verify":[{"folder":"RSSchool_T3Tests","test":"FullBinaryTreesTests.m"}]},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}
496	2020-04-02 17:01:12.759119	2020-04-02 17:01:12.759119	Layout(Restaurant)	https://github.com/rolling-scopes-school/tasks/blob/master/tasks/markup-1.md	\N	manual	f	f	f	\N	\N	htmltask	Poland	javascript	{}
497	2020-04-02 18:49:24.244235	2020-04-03 13:05:37.170103	rs.ios.task3	https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1/blob/master/README.md	\N	auto	f	f	f	rs.ios-stage1-task3.1	https://github.com/rolling-scopes-school/rs.ios-stage1-task3.1	objctask	stage1	ios-obj-c	{"targets":{"project":{"folder":"RSSchool_T3","xcodeproj":"RSSchool_T3.xcodeproj"},"tests":{"folder":"RSSchool_T3Tests","classes":["T3_PolynomialTests.m","T3_CombinatorTests.m"]},"uiTests":{"folder":"RSSchool_T3UITests","classes":["RS_Task3_UICheckerUITests.m"]}},"folder":"RSSchool_T3","details":"Task3","descriptions":"Description task3"}
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

COPY public.task_result (id, "createdDate", "updatedDate", "githubPrUrl", "githubRepoUrl", score, comment, "studentId", "courseTaskId", "historicalScores", "juryScores") FROM stdin;
\.


--
-- Data for Name: task_solution; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_solution (id, "createdDate", "updatedDate", "courseTaskId", "studentId", url) FROM stdin;
3330	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14327	https://example.com
3331	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14328	https://example.com
3332	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14329	https://example.com
3333	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14330	https://example.com
3334	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14331	https://example.com
3335	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14332	https://example.com
3336	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14333	https://example.com
3337	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14334	https://example.com
3338	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14335	https://example.com
3339	2020-09-24 18:55:43.0769	2020-09-24 18:55:43.0769	386	14336	https://example.com
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

COPY public.task_solution_result (id, "createdDate", "updatedDate", "courseTaskId", "studentId", "checkerId", score, "historicalScores", comment, anonymous) FROM stdin;
10812	2020-09-24 18:57:05.786416	2020-09-24 18:57:05.786416	386	14334	14327	50	[{"score":50,"comment":"50 points.\\n\\n+10 - blah-blah-blah\\n+20 - blah-blah-blah\\n+30 - blah-blah-blah","anonymous":false,"authorId":11563,"dateTime":1600973825778}]	50 points.\n\n+10 - blah-blah-blah\n+20 - blah-blah-blah\n+30 - blah-blah-blah	f
\.


--
-- Data for Name: task_verification; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public.task_verification (id, "createdDate", "updatedDate", "studentId", "courseTaskId", details, status, score, metadata) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: rs_master
--

COPY public."user" (id, "githubId", "firstName", "lastName", "createdDate", "updatedDate", "firstNameNative", "lastNameNative", "tshirtSize", "tshirtFashion", "dateOfBirth", "locationName", "locationId", "educationHistory", "employmentHistory", "contactsEpamEmail", "contactsPhone", "contactsEmail", "externalAccounts", "epamApplicantId", activist, "englishLevel", "lastActivityTime", "isActive", "primaryEmail", "contactsTelegram", "contactsSkype", "contactsNotes", "aboutMyself", "contactsLinkedIn", "profilePermissionsId", "countryName", "cityName", "opportunitiesConsent", "selfIntroLink", "cvLink", "militaryService") FROM stdin;
11563	apalchys			2020-04-06 15:12:34.19737	2020-04-06 15:15:02.729722	\N	\N	\N	\N	\N	\N	\N	[]	[]	\N	\N	\N	[]	\N	f	\N	1586185954173	t	test@example.com	\N	\N	\N	\N	\N	\N	Belarus	Minsk	f	\N	\N	\N
2693	viktoriyavorozhun	\N	\N	2019-04-24 13:42:45.500139	2019-10-18 08:07:58.858658	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2098	yauhenkavalchuk	\N	\N	2019-04-17 11:41:21.396686	2019-11-12 11:22:33.350237	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567594678450	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2103	shastel	\N	\N	2019-04-17 11:41:21.396686	2020-03-28 19:57:33.715031	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1566996696787	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
5481	alreadybored	\N	\N	2019-09-09 17:27:41.909149	2020-03-22 14:10:37.252351	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568050061907	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2115	rootthelure	\N	\N	2019-04-17 11:41:21.396686	2019-06-10 14:20:21.551616	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2480	pavelrazuvalau	\N	\N	2019-04-17 11:41:21.396686	2019-11-05 16:52:28.602784	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567072599465	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2612	dmitryromaniuk	\N	\N	2019-04-24 13:42:44.206396	2019-12-26 08:27:30.060107	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
10031	artem-bagritsevich	\N	\N	2020-02-11 08:38:35.202688	2020-03-05 11:50:05.118784	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1581410315197	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2032	mikhama	\N	\N	2019-04-17 11:41:21.396686	2020-02-24 09:36:43.272628	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567578141812	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
1328	davojta	\N	\N	2019-04-17 11:41:21.396686	2019-09-07 04:28:42.419938	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567830522415	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
3961	sergeyshalyapin	\N	\N	2019-05-15 14:49:46.402468	2020-02-12 08:17:55.231843	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
4476	abramenal	\N	\N	2019-09-02 12:28:32.979516	2020-03-01 21:13:30.351302	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1567427312977	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
10130	sixtyxi	\N	\N	2020-02-13 11:35:19.12045	2020-02-13 11:35:19.12045	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1581593719117	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
7485	rootical	\N	\N	2019-12-19 12:07:57.161662	2020-03-05 18:51:41.896803	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1576757277159	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
606	irinainina	\N	\N	2019-04-17 11:41:21.396686	2019-08-28 17:19:48.460791	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567012788456	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2595	anik188	\N	\N	2019-04-24 13:42:43.967659	2020-03-06 15:43:33.384469	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	t	a1	1567423260809	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
6776	ksenia-mahilnaya	\N	\N	2019-09-17 11:16:55.976071	2019-09-17 12:19:51.740451	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568719015974	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
1090	pulya10c	\N	\N	2019-04-17 11:41:21.396686	2019-09-13 10:21:35.108464	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567492440483	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
4428	egngron	\N	\N	2019-08-06 12:06:24.920343	2019-08-06 12:06:24.920343	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
4749	studentluffi	\N	\N	2019-09-09 10:09:09.275849	2019-09-09 10:09:28.91177	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	f	a1	1568023749273	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
587	sijioth	\N	\N	2019-04-17 11:41:21.396686	2019-06-10 14:20:03.059291	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2084	dzmitry-varabei	\N	\N	2019-04-17 11:41:21.396686	2019-09-05 10:13:27.273815	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567678407268	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2444	toshabely	\N	\N	2019-04-17 11:41:21.396686	2019-08-22 11:56:20.531337	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2277	anv21	\N	\N	2019-04-17 11:41:21.396686	2020-01-18 11:47:48.686227	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1567683807154	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
3493	humanamburu	\N	\N	2019-04-25 06:42:53.208093	2019-09-24 11:22:04.181665	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	0	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2549	kvtofan	\N	\N	2019-04-17 11:41:21.396686	2019-09-24 14:56:49.229102	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1563521151921	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
2089	yuliahope	\N	\N	2019-04-17 11:41:21.396686	2019-08-29 11:15:32.412097	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1566418583423	t	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
677	amoebiusss	Test 1	Last Name	2019-04-17 11:41:21.396686	2020-04-06 15:30:27.059612	\N	\N	m	\N	\N	Minsk	12158	[]	[]	hello@epam.com	+375297777777	hello@example.com	[]	\N	\N	a1	1568012639853	f	primary@example.com	pavel_durov	\N	do not call me	i am a bad guy	\N	\N	Belarus	Minsk	f	\N	\N	\N
\.


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

SELECT pg_catalog.setval('public.course_task_id_seq', 430, true);


--
-- Name: course_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.course_user_id_seq', 120, true);


--
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.event_id_seq', 125, true);


--
-- Name: feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.feedback_id_seq', 615, true);


--
-- Name: mentor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_id_seq', 1271, true);


--
-- Name: mentor_registry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.mentor_registry_id_seq', 289, true);


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

SELECT pg_catalog.setval('public.student_id_seq', 14336, true);


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

SELECT pg_catalog.setval('public.task_id_seq', 497, true);


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

SELECT pg_catalog.setval('public.task_result_id_seq', 78641, true);


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
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rs_master
--

SELECT pg_catalog.setval('public.user_id_seq', 11563, true);


--
-- Name: stage_interview PK_06a48c907e0091d4082cfb003aa; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "PK_06a48c907e0091d4082cfb003aa" PRIMARY KEY (id);


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
-- Name: student PK_3d8016e1cb58429474a3c041904; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "PK_3d8016e1cb58429474a3c041904" PRIMARY KEY (id);


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
-- Name: task_verification PK_5080be855b9d24b3d8e93ff425b; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_verification
    ADD CONSTRAINT "PK_5080be855b9d24b3d8e93ff425b" PRIMARY KEY (id);


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
-- Name: task_solution_result PK_676aad5c32840e4c5d04a61300e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "PK_676aad5c32840e4c5d04a61300e" PRIMARY KEY (id);


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
-- Name: course_task PK_aba6301a06559588941ae21b70c; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "PK_aba6301a06559588941ae21b70c" PRIMARY KEY (id);


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
-- Name: task_interview_student PK_e01dbf882c881571c02d3e59bf2; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "PK_e01dbf882c881571c02d3e59bf2" PRIMARY KEY (id);


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
-- Name: task_interview_student UQ_9b70aaee77ce73e847688838e7e; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_student
    ADD CONSTRAINT "UQ_9b70aaee77ce73e847688838e7e" UNIQUE ("studentId", "courseId", "courseTaskId");


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
-- Name: task_solution_result UQ_cd11c253afeee499efe93f3e184; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_solution_result
    ADD CONSTRAINT "UQ_cd11c253afeee499efe93f3e184" UNIQUE ("courseTaskId", "studentId", "checkerId");


--
-- Name: course UQ_fc5c908f913cd7188a018775f5f; Type: CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course
    ADD CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f" UNIQUE (name, alias);


--
-- Name: IDX_062e03d78da22a7bd9becbfaaa; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_062e03d78da22a7bd9becbfaaa" ON public.course_user USING btree ("userId");


--
-- Name: IDX_076f71901ba479a51b2deaacd5; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_076f71901ba479a51b2deaacd5" ON public.repository_event USING btree ("repositoryUrl");


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
-- Name: IDX_33927c9b6369c34ee32f708421; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33927c9b6369c34ee32f708421" ON public.course_task USING btree ("stageId");


--
-- Name: IDX_33cc2ea503287d1e19e696c028; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_33cc2ea503287d1e19e696c028" ON public.task_interview_result USING btree ("courseTaskId");


--
-- Name: IDX_3cf45a981cf54c2b3e10f677c9; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_3cf45a981cf54c2b3e10f677c9" ON public.course_task USING btree ("taskId");


--
-- Name: IDX_4f512b65d2481c2fd737680f79; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_4f512b65d2481c2fd737680f79" ON public.task_interview_result USING btree ("mentorId");


--
-- Name: IDX_5565a1f41896ecd29591b239ef; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_5565a1f41896ecd29591b239ef" ON public.task_result USING btree ("studentId");


--
-- Name: IDX_70824fef35e6038e459e58e035; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_70824fef35e6038e459e58e035" ON public.course_user USING btree ("courseId");


--
-- Name: IDX_85a40b3dcc11dcfdfb836b7ff3; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_85a40b3dcc11dcfdfb836b7ff3" ON public.task_solution_checker USING btree ("checkerId");


--
-- Name: IDX_87736b09d69bacdc6bc272e023; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_87736b09d69bacdc6bc272e023" ON public.course_task USING btree ("taskOwnerId");


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
-- Name: IDX_de17ec9312951a05365d5d4d25; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_de17ec9312951a05365d5d4d25" ON public.course_task USING btree (checker);


--
-- Name: IDX_e0c522b2cdf095ad5c5f51c0ae; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e0c522b2cdf095ad5c5f51c0ae" ON public.task_result USING btree ("courseTaskId");


--
-- Name: IDX_e8aaf4d079a719ade8ebc1397e; Type: INDEX; Schema: public; Owner: rs_master
--

CREATE INDEX "IDX_e8aaf4d079a719ade8ebc1397e" ON public.task_solution_result USING btree ("checkerId");


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
-- Name: student FK_0d29e2a35a0c87dc9377411f432; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student
    ADD CONSTRAINT "FK_0d29e2a35a0c87dc9377411f432" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


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
-- Name: registry FK_2449b2493e4b436fda3c21ba5df; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.registry
    ADD CONSTRAINT "FK_2449b2493e4b436fda3c21ba5df" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: feedback FK_2b4d98c492a3965505cf57e2e8a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT "FK_2b4d98c492a3965505cf57e2e8a" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: stage_interview FK_2e4ed1c8264a48ffe7f85474018; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_2e4ed1c8264a48ffe7f85474018" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: course_task FK_33927c9b6369c34ee32f7084215; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_33927c9b6369c34ee32f7084215" FOREIGN KEY ("stageId") REFERENCES public.stage(id);


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
-- Name: stage_interview FK_47cb62b5215db20cd02ce51305c; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview
    ADD CONSTRAINT "FK_47cb62b5215db20cd02ce51305c" FOREIGN KEY ("stageId") REFERENCES public.stage(id);


--
-- Name: task_interview_result FK_4f512b65d2481c2fd737680f791; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_4f512b65d2481c2fd737680f791" FOREIGN KEY ("mentorId") REFERENCES public.mentor(id);


--
-- Name: course_event FK_50d7cfb1d0d26c574bb64ffb869; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_event
    ADD CONSTRAINT "FK_50d7cfb1d0d26c574bb64ffb869" FOREIGN KEY ("stageId") REFERENCES public.stage(id);


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
-- Name: course_user FK_70824fef35e6038e459e58e0358; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_user
    ADD CONSTRAINT "FK_70824fef35e6038e459e58e0358" FOREIGN KEY ("courseId") REFERENCES public.course(id);


--
-- Name: stage_interview_feedback FK_7b7d891769e42df16686873c3c6; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.stage_interview_feedback
    ADD CONSTRAINT "FK_7b7d891769e42df16686873c3c6" FOREIGN KEY ("stageInterviewId") REFERENCES public.stage_interview(id);


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
-- Name: course_task FK_87736b09d69bacdc6bc272e0239; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.course_task
    ADD CONSTRAINT "FK_87736b09d69bacdc6bc272e0239" FOREIGN KEY ("taskOwnerId") REFERENCES public."user"(id);


--
-- Name: student_feedback FK_8d1bc199ec06383ae933039bf2d; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.student_feedback
    ADD CONSTRAINT "FK_8d1bc199ec06383ae933039bf2d" FOREIGN KEY ("studentId") REFERENCES public.student(id);


--
-- Name: task_interview_result FK_9d0edea65b297ba0d7d8064d05a; Type: FK CONSTRAINT; Schema: public; Owner: rs_master
--

ALTER TABLE ONLY public.task_interview_result
    ADD CONSTRAINT "FK_9d0edea65b297ba0d7d8064d05a" FOREIGN KEY ("studentId") REFERENCES public.student(id);


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
-- Name: datahub; Type: PUBLICATION; Schema: -; Owner: rs_master
--

CREATE PUBLICATION datahub FOR ALL TABLES WITH (publish = 'insert, update, delete');


ALTER PUBLICATION datahub OWNER TO rs_master;

--
-- PostgreSQL database dump complete
--

