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
export type MilitaryServiceStatus = 'served' | 'liable' | 'notLiable';

export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'locations' | 'github' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string | null;
  desiredPosition: string | null;
  selfIntroLink: string | null;
  englishLevel: EnglishLevel | null;
  militaryService: MilitaryServiceStatus | null;
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
  locations: string | null;
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

export interface AllUserCVData extends UserData, Omit<Contacts, 'github'> {
  githubUsername: string | null;
}

export interface EditCVData extends AllUserCVData {
  expires: number | null;
}

export interface GetFullCVData extends EditCVData {
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
  locations: string | null;
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
