export interface DetailedExpelledStat {
  id: string;
  course: {
    id: number;
    name: string;
    fullName: string;
    alias: string;
    description: string;
    logo: string;
  };
  user: {
    id: number;
    githubId: string;
  };
  reasonForLeaving: string[];
  otherComment: string;
  submittedAt: Date;
}
