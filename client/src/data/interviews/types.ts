export enum InputType {
  Input = 'input',
  Checkbox = 'checkbox',
}

export type Question = {
  id: number;
  name: string;
  type?: InputType;
};

export type QuestionCategory = {
  id: number;
  name: string;
  description?: string;
  questions: Question[];
};

export type InterviewTemplate = {
  name: string;
  categories: QuestionCategory[];
  examplesUrl: string;
  descriptionHtml?: string;
};
