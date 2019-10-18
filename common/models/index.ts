export interface UserBasic {
  id: number;
  githubId: string;
  firstName: string;
  lastName: string;
}

export interface MentorBasic extends UserBasic {
  id: number;
  courseId: number;
  userId: number;

  students: StudentBasic[] | ({ id: number })[];
}

export interface StudentBasic extends UserBasic {
  id: number;
  courseId: number;
  userId: number;

  totalScore: number;
  isActive: boolean;

  mentor: MentorBasic | { id: number } | null;
}
