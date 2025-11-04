import { EnglishLevel } from './';
import { InterviewFeedbackValues } from 'client/src/data/interviews/technical-screening';

export interface Location {
  cityName: string;
  countryName: string;
}

export interface PublicVisibilitySettings {
  all: boolean;
}

export interface PartialStudentVisibilitySettings extends PublicVisibilitySettings {
  student: boolean;
}

export interface ContactsVisibilitySettings extends PublicVisibilitySettings {
  student: boolean;
}

export interface VisibilitySettings extends PublicVisibilitySettings {
  mentor: boolean;
  student: boolean;
}

export interface ConfigurableProfilePermissions {
  isProfileVisible?: PublicVisibilitySettings;
  isAboutVisible?: VisibilitySettings;
  isEducationVisible?: VisibilitySettings;
  isEnglishVisible?: PartialStudentVisibilitySettings;
  isEmailVisible?: ContactsVisibilitySettings;
  isTelegramVisible?: ContactsVisibilitySettings;
  isSkypeVisible?: ContactsVisibilitySettings;
  isPhoneVisible?: ContactsVisibilitySettings;
  isContactsNotesVisible?: ContactsVisibilitySettings;
  isLinkedInVisible?: VisibilitySettings;
  isPublicFeedbackVisible?: VisibilitySettings;
  isMentorStatsVisible?: VisibilitySettings;
  isStudentStatsVisible?: PartialStudentVisibilitySettings;
}

export interface GeneralInfo {
  name: string;
  githubId: string;
  aboutMyself?: string | null;
  location: Location;
  educationHistory?: any | null;
  englishLevel?: EnglishLevel | null;
  languages: string[];
}

export interface Contacts {
  phone: string | null;
  email: string | null;
  epamEmail: string | null;
  skype: string | null;
  telegram: string | null;
  notes: string | null;
  linkedIn: string | null;
  whatsApp: string | null;
}

export interface Discord {
  id: string;
  username: string;
  discriminator: string;
}

export interface Student {
  githubId: string;
  name: string;
  isExpelled: boolean;
  totalScore: number;
  repoUrl?: string;
}

export interface MentorStats {
  courseLocationName: string;
  courseName: string;
  students?: Student[];
}

export interface StudentStats {
  courseId: number;
  courseName: string;
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  isSelfExpelled: boolean;
  expellingReason?: string;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  rank: number | null;
  mentor: {
    githubId: string;
    name: string;
  };
  tasks: StudentTasksDetail[];
}

export interface StudentTasksDetail {
  maxScore: number;
  scoreWeight: number;
  name: string;
  descriptionUri: string;
  githubPrUri: string;
  score: number;
  comment: string;
  interviewDate?: string;
  interviewer?: {
    name: string;
    githubId: string;
  };
  interviewFormAnswers?: {
    questionId: string;
    questionText: string;
    answer?: boolean;
  }[];
}

export interface PublicFeedback {
  feedbackDate: string;
  badgeId: string;
  comment: string;
  fromUser: {
    name: string;
    githubId: string;
  };
}

export interface CoreJsInterviewFeedback {
  courseFullName: string;
  courseName: string;
  locationName: string | null;
  interviews: {
    answers: {
      answer?: boolean;
      questionText: string;
      questionId: string;
    }[];
    interviewer: {
      name: string;
      githubId: string;
    };
    comment: string;
    score: number;
    name: string;
    interviewDate?: string;
  }[];
}

export interface StageInterviewDetailedFeedback {
  decision: string;
  isGoodCandidate: boolean;
  courseName: string;
  courseFullName: string;
  score: number;
  maxScore: number;
  date: string;
  version: number;
  interviewer: {
    name: string;
    githubId: string;
  };
  // This type have to updated to refer to `InterviewFeedbackStepData`, when profile is migrated to nestjs
  feedback:
    | LegacyFeedback
    | {
        steps: Record<
          string,
          {
            isCompleted: boolean;
            values?: InterviewFeedbackValues;
          }
        >;
      };
}

export interface UserInfo {
  generalInfo: GeneralInfo;
  contacts?: Contacts;
  discord: Discord | null;
}

export type LegacyFeedback = {
  english?: EnglishLevel;
  comment: string;
  programmingTask: {
    task: string;
    codeWritingLevel: number;
    resolved: number;
    comment: string;
  };
  skills: {
    htmlCss: number;
    common: number;
    dataStructures: number;
  };
};
