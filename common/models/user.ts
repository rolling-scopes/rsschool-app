export interface UserBasic {
  id: number;
  githubId: string;
  name: string;
}

export interface MentorBasic extends UserBasic {
  isActive: boolean;
  students: (StudentBasic | { id: number })[];
}

export interface StudentBasic extends UserBasic {
  isActive: boolean;
  totalScore: number;
  mentor: MentorBasic | { id: number } | null;
}
