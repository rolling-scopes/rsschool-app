import { EnglishLevel } from './';

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
}

export interface Contacts {
  phone: string | null;
  email: string | null;
  skype: string | null;
  telegram: string | null;
  notes: string | null;
  linkedIn: string | null;
}

export interface Consent {
  id?: number;
  createdDate?: number;
  updatedDate?: number;
  channelValue: string;
  channelType: string;
  optIn: boolean;
  username?: string;
}

export interface MentorStats {
  courseLocationName: string;
  courseName: string;
  students?: {
    githubId: string;
    name: string;
    isExpelled: boolean;
    totalScore: number;
    repoUrl?: string;
  }[];
}

export interface StudentStats {
  courseId: number;
  courseName: string;
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  expellingReason: string;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
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
  taskGithubPrUris: string;
  score: number;
  comment: string;
  interviewer?: {
    name: string;
    githubId: string;
  };
  interviewFormAnswers?: {
    questionText: string;
    answer: string;
  }[];
}

export interface PublicFeedback {
  feedbackDate: string;
  badgeId: string;
  comment: string;
  heroesUri: string;
  fromUser: {
    name: string;
    githubId: string;
  };
}

export interface StageInterviewDetailedFeedback {
  decision: string;
  isGoodCandidate: boolean;
  courseName: string;
  courseFullName: string;
  rating: number;
  comment: string;
  english: EnglishLevel | number;
  date: string;
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
  interviewer: {
    name: string;
    githubId: string;
  };
}

export interface UserInfo {
  generalInfo: GeneralInfo;
  contacts?: Contacts;
}

export interface ProfileInfo {
  permissionsSettings?: ConfigurableProfilePermissions;
  generalInfo?: GeneralInfo;
  contacts?: Contacts;
  consents?: Consent[];
  mentorStats?: MentorStats[];
  studentStats?: StudentStats[];
  publicFeedback?: PublicFeedback[];
  stageInterviewFeedback?: StageInterviewDetailedFeedback[];
}

export interface SaveProfileInfo {
  permissionsSettings: ConfigurableProfilePermissions;
  generalInfo: GeneralInfo;
  contacts: Contacts;
  consents: Consent[];
  isPermissionsSettingsChanged: boolean;
  isProfileSettingsChanged: boolean;
}
