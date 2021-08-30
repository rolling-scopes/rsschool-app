export interface InterviewQuestion {
  id: number;
  title: string;
  question: string;
  categories: InterviewQuestionCategory[];
}

export interface InterviewQuestionCategory {
  id: number;
  name: string;
  questions: InterviewQuestion[];
}
