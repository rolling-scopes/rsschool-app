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
  cityName?: string;
  countryName?: string;
  mentor: MentorBasic | { id: number } | null;
  discord: string;
  totalScore: number;
}
