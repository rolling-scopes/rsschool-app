import { EnglishLevel } from './';

export interface GeneralInfo {
  name: string;
  githubId: string;
  aboutMyself?: string;
  locationName: string;
  educationHistory?: any;
  englishLevel?: EnglishLevel;
}

export interface Contacts {
  phone?: string;
  email?: string;
  skype?: string;
  telegram?: string;
  notes?: string;
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
  generalInfo?: GeneralInfo;
  contacts?: Contacts;
  mentorStats?: MentorStats[];
  studentStats?: StudentStats[];
  publicFeedback?: PublicFeedback[];
  stageInterviewFeedback: StageInterviewDetailedFeedback[];
};
