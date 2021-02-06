import { StudentStats, PublicFeedback } from './profile';
export interface CourseData {
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
}

export type EnglishLevel = 'a0' | 'a1' | 'a1+' | 'a2' | 'a2+' | 'b1' | 'b1+' | 'b2' | 'b2+' | 'c1' | 'c1+' | 'c2';
export type MilitaryService = 'served' | 'liable' | 'notLiable' | null;

export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'location' | 'github' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string;
  desiredPosition: string;
  selfIntroLink: string | null;
  englishLevel: EnglishLevel;
  militaryService: MilitaryService;
  notes: string | null;
  startFrom: string | null;
  fullTime: boolean
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

export interface CVUserData {
  selfIntroLink: string | null;
  militaryService: MilitaryService;
  avatarLink: string | null;
  desiredPosition: string;
  englishLevel: EnglishLevel;
  cvName: string | null;
  cvNotes: string | null;
  cvPhone: string | null;
  cvEmail: string | null;
  cvSkype: string | null;
  cvTelegram: string | null;
  cvLinkedin: string | null;
  cvLocation: string | null;
  cvGithub: string | null;
  cvWebsite: string | null;
  startFrom: string | null;
  fullTime: boolean;
}

export interface JobSeekerData {
  cvName: string | null;
  desiredPosition: string | null;
  githubId: string;
  englishLevel: EnglishLevel;
  fullTime: boolean;
  cvLocation: string | null;
  startFrom: string | null;
  courses: StudentStats;
  publicFeedback: PublicFeedback[]
}



