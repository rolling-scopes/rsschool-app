export enum InterviewStatus {
  NotCompleted,
  Completed,
  Canceled,
}

export interface InterviewDetails {
  id: number;
  name: string;
  completed: boolean;
  status: InterviewStatus;
  result: string | null;
  descriptionUrl: string;
  startDate: string;
  endDate: string;
  interviewer: { name: string; githubId: string };
  student: { name: string; githubId: string };
}
