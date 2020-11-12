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
