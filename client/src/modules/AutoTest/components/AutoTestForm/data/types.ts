export interface AnswerFormData {
  text: string;
  correct?: boolean;
}

export interface QuestionFormData {
  question: string;
  questionImage: string;
  answersType: 'text' | 'image';
  multiple: boolean;
  answers: AnswerFormData[];
  correctIndex?: number;
}

export interface EditAutoTestFormData {
  maxAttemptsNumber: number;
  numberOfQuestions: number;
  tresholdPercentage: number;
  strictAttemptsMode: boolean;
  questions: QuestionFormData[];
}
