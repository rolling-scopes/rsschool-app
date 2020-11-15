export interface Contact {
  contactType: string;
  contactText: string;
  transformable: boolean;
}

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
