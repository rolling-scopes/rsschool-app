export interface EducationRecord {
  organization: string;
  education: string;
  startYear: number;
  finishYear: number;
}

export interface EmploymentRecord {
  organization: string | null;
  position: string;
  startYear: number;
  finishYear: number;
  isCurrent: boolean;
}

export interface CourseData {
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  position: number | null;
}

export interface BadgesData {
  badges: string[];
  total: number;
}

export type EnglishLevel = 'a0' | 'a1' | 'a1+' | 'a2' | 'a2+' | 'b1' | 'b1+' | 'b2' | 'b2+' | 'c1' | 'c1+' | 'c2';
export type MilitaryService = 'served' | 'liable' | 'notLiable' | null;
export type SelfIntroLink = string | null;
export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'location' | 'github' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string;
  desiredPosition: string;
  selfIntroLink: SelfIntroLink;
  englishLevel: EnglishLevel;
  militaryService: MilitaryService;
  notes: string;
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

export interface FieldData {
  name: string[];
  value: any;
  touched: boolean;
  validating: boolean;
  errors: string[];
}
