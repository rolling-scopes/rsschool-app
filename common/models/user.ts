import { Discord } from './profile';

export interface UserBasic {
  id: number;
  githubId: string;
  name: string;
}

export interface MentorBasic extends UserBasic {
  isActive: boolean;
  cityName: string;
  countryName: string;
  students: (StudentBasic | { id: number })[];
}

export interface StudentBasic extends UserBasic {
  isActive: boolean;
  cityName?: string | null;
  countryName?: string | null;
  mentor:
    | MentorBasic
    | { id: number }
    | {
        id: number;
        githubId: string;
        name: string;
      }
    | null;
  discord: Discord | null;
  totalScore: number;
  rank?: number;
}

export interface InterviewStatistics {
  completed?: number;
  total?: number;
}

export interface MentorDetails extends MentorBasic {
  cityName: string;
  countryName: string;
  maxStudentsLimit: number;
  studentsPreference: 'any' | 'city' | 'country';
  interviews?: InterviewStatistics;
  screenings?: InterviewStatistics;
  studentsCount?: number;
  taskResultsStats?: {
    lastUpdatedDate?: Date | string | null;
    total: number;
    checked: number;
  };
}
