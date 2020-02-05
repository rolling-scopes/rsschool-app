import { EnglishLevel } from './';


export interface PublicVisibilitySettings {
  all: boolean;
}

export interface PartialStudentVisibilitySettings extends PublicVisibilitySettings {
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
  isEmailVisible?: PartialStudentVisibilitySettings;
  isTelegramVisible?: PartialStudentVisibilitySettings;
  isSkypeVisible?: PartialStudentVisibilitySettings;
  isPhoneVisible?: PartialStudentVisibilitySettings;
  isContactsNotesVisible?: PartialStudentVisibilitySettings;
  isLinkedInVisible?: VisibilitySettings;
  isPublicFeedbackVisible?: VisibilitySettings;
  isMentorStatsVisible?: VisibilitySettings;
  isStudentStatsVisible?: PartialStudentVisibilitySettings;
}

export interface GeneralInfo {
  name: string;
  githubId: string;
  aboutMyself?: string | null;
  locationName: string;
  locationId: string;
  educationHistory?: any | null;
  englishLevel?: EnglishLevel | null;
}

export interface Contacts {
  phone: string | null;
  email: string | null;
  skype: string | null;
  telegram: string | null;
  notes: string | null;
}

export interface MentorStats {
  courseName: string;
  locationName: string;
  courseFullName: string;
  students?: {
    githubId: string;
    name: string;
    isExpelled: boolean;
    totalScore: number;
  }[]
}

export interface StudentStats {
  courseId: number;
  courseName: string;
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  expellingReason: string;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
  mentor: {
    githubId: string;
    name: string;
  };
  tasks: {
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
  }[];
};

export interface PublicFeedback {
  feedbackDate: string;
  badgeId: string;
  comment: string;
  heroesUri: string;
  fromUser: {
    name: string;
    githubId: string;
  };
};

export interface StageInterviewDetailedFeedback {
  decision: string;
  isGoodCandidate: boolean;
  courseName: string;
  courseFullName: string;
  rating: number;
  comment: string;
  english: EnglishLevel;
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
};

export interface UserInfo {
  generalInfo: GeneralInfo;
  contacts?: Contacts;
};

export interface ProfileInfo {
  permissionsSettings?: ConfigurableProfilePermissions;
  generalInfo?: GeneralInfo;
  contacts?: Contacts;
  mentorStats?: MentorStats[];
  studentStats?: StudentStats[];
  publicFeedback?: PublicFeedback[];
  stageInterviewFeedback?: StageInterviewDetailedFeedback[];
};

export interface SaveProfileInfo {
  permissionsSettings: ConfigurableProfilePermissions;
  generalInfo: GeneralInfo;
  contacts: Contacts;
  isPermissionsSettingsChanged: boolean,
  isProfileSettingsChanged: boolean,
}
