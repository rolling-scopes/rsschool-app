import { StudentStats, PublicFeedback } from './profile';
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
  }
}

export type EnglishLevel = 'a0' | 'a1' | 'a1+' | 'a2' | 'a2+' | 'b1' | 'b1+' | 'b2' | 'b2+' | 'c1' | 'c1+' | 'c2';
export type MilitaryService = 'served' | 'liable' | 'notLiable' | null;

export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'location' | 'github' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string | null;
  desiredPosition: string | null;
  selfIntroLink: string | null;
  englishLevel: EnglishLevel | null; 
  militaryService: MilitaryService;
  notes: string | null;
  startFrom: string | null;
  fullTime: boolean | null;
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
  github: string | null;
  website: string | null;
  startFrom: string | null;
  fullTime: boolean | null;
}

export interface ServerData {
  cvSelfIntroLink: string | null;
  cvMilitaryService: MilitaryService;
  cvAvatarLink: string | null;
  cvDesiredPosition: string | null;
  cvEnglishLevel: EnglishLevel;
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
  cvStartFrom: string | null;
  cvFullTime: boolean | null;
  cvExpires: string | null;
}

export interface GetCVData extends SaveCVData {
  expires: string | null;
  courses: StudentStats[];
  publicFeedback: PublicFeedback[];
}

export interface JobSeekerData {
  cvname: string | null;
  desiredposition: string | null;
  githubid: string;
  englishlevel: EnglishLevel;
  fullTime: boolean;
  cvlocation: string | null;
  startfrom: string | null;
  courses: StudentStats[];
  publicfeedback: PublicFeedback[]
}



