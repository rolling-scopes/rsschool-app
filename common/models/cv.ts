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
