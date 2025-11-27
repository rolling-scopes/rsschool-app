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

export interface InterviewPair {
  id: number;
  status: InterviewStatus;
  result: string | null;
  interviewer: { name: string; githubId: string };
  student: { name: string; githubId: string };
}

/**
 * Question to the student, which represents either theory or practice part
 */
export type InterviewQuestion = {
  id: string;
  /**
   * @optional - describes the topic, to which question relates to(ex. `Data structures`)
   */
  topic?: string;
  /**
   * Actual question title to the student
   */
  title: string;

  /**
   * Stores the answer from the student
   */
  value?: number;
};

export type InterviewFeedbackValues = Record<string, string[] | string | number | InterviewQuestion[]>;

/**
 * The structure is stored on db level. i.e we store only step id,
 * whether it is completed or not; and the pairs of questionId/answerId and
 * since the questions are dynamic(user can add/remove) we also store the submitted questions(the section of theory & practice are stored in db to persist the selected questions by the interviewer)
 */
export type InterviewFeedbackStepData = {
  isCompleted: boolean;
  values?: InterviewFeedbackValues;
};
