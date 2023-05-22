import { ResumeDtoEnglishLevelEnum, ResumeDtoMilitaryServiceEnum } from 'api';
import { Dayjs } from 'dayjs';

export interface CourseData {
  locationName: string;
  courseFullName: string;
  isExpelled: boolean;
  certificateId: string | null;
  isCourseCompleted: boolean;
  totalScore: number;
  rank: number | null;
  mentor: {
    githubId: string;
    name: string;
  };
}

export type VisibleCourses = number[];

export interface CourseDataShortened {
  courseId: number;
  courseFullName: string;
}

export interface VisibleCoursesFormData {
  [id: string]: boolean;
}

export type ContactType = 'phone' | 'email' | 'skype' | 'telegram' | 'linkedin' | 'githubUsername' | 'website';

export interface UserData {
  avatarLink: string | null;
  name: string | null;
  desiredPosition: string | null;
  selfIntroLink: string | null;
  englishLevel: ResumeDtoEnglishLevelEnum | null;
  militaryService: ResumeDtoMilitaryServiceEnum | null;
  notes: string | null;
  startFrom: string | null;
  fullTime: boolean;
  locations: string | null;
}

export type Contacts = {
  [key in ContactType]: string | null;
};

export interface FieldData {
  name: string[];
  value: any;
  touched: boolean;
  validating: boolean;
  errors: string[];
}

export interface AllUserCVData extends Omit<UserData, 'uuid'>, Contacts {
  visibleCourses: VisibleCourses;
}

export interface UserDataToSubmit extends Omit<UserData, 'startFrom'> {
  startFrom: Dayjs;
  visibleCourses: VisibleCourses;
}

export interface AllDataToSubmit extends UserDataToSubmit, Contacts {}

export interface EditCVData extends AllUserCVData {
  expires: number | null;
  courses: CourseDataShortened[];
  visibleCourses: VisibleCourses;
}

export interface GetFullCVData extends AllUserCVData {
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
  rank: number | null;
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
  englishLevel: ResumeDtoEnglishLevelEnum | null;
  fullTime: boolean;
  locations: string | null;
  startFrom: string | null;
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
