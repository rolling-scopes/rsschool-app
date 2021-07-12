import { ENGLISH_LEVELS } from '../../client/src/services/reference-data/english';

export interface CourseData {
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
  mentor: {
    githubId: string;
    name: string;
  };
}

export type EnglishLevel = typeof ENGLISH_LEVELS[number];
export type MilitaryService = 'served' | 'liable' | 'notLiable';

export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'location' | 'github' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string | null;
  desiredPosition: string | null;
  selfIntroLink: string | null;
  englishLevel: EnglishLevel | null;
  militaryService: MilitaryService | null;
  notes: string | null;
  startFrom: string | null;
  fullTime: boolean;
}

export type Contacts = {
  [key in ContactType]: string | null;
};

export interface ContactsFromProfile {
  phone: string | null;
  email: string | null;
  skype: string | null;
  telegram: string | null;
  linkedin: string | null;
  location: string | null;
}

export interface CVDataFromProfile extends ContactsFromProfile {
  name: string;
  notes: string | null;
}

export interface FieldData {
  name: string[];
  value: any;
  touched: boolean;
  validating: boolean;
  errors: string[];
}

export interface SaveCVData {
  selfIntroLink: string | null;
  militaryService: MilitaryService | null;
  avatarLink: string | null;
  desiredPosition: string | null;
  englishLevel: EnglishLevel | null;
  name: string | null;
  notes: string | null;
  phone: string | null;
  email: string | null;
  skype: string | null;
  telegram: string | null;
  linkedin: string | null;
  location: string | null;
  githubUsername: string | null;
  website: string | null;
  startFrom: string | null;
  fullTime: boolean;
}

export interface GetCVData extends SaveCVData {
  expires: number | null;
  courses: CVStudentStats[];
  feedback: CVFeedback[];
}

export interface CVStudentStats {
  locationName: string;
  courseFullName: string;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
  mentor: {
    githubId: string;
    name: string;
  };
}

export interface JobSeekerStudentStats extends CVStudentStats {
  courseName: string;
}

export interface JobSeekerData {
  name: string | null;
  desiredPosition: string | null;
  githubId: string;
  englishlevel: EnglishLevel | null;
  fullTime: boolean;
  location: string | null;
  startFrom: string | null;
  englishLevel: EnglishLevel;
  courses: JobSeekerStudentStats[];
  feedback: JobSeekerFeedback[];
  expires: number;
  isHidden: boolean;
}

export interface CVFeedback {
  comment: string;
  feedbackDate: string;
}

export interface JobSeekerFeedback {
  badgeId: string;
}
