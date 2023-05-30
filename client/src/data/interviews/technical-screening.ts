import { InputType, StepId } from './types';

export type Step = {
  id: StepId;
  title: string;
  description: string;
  stepDescription: string;
  questions: Question[];
};

export type Question =
  | RadioQuestion
  | TextQuestion
  | InputQuestion
  | CheckboxQuestion
  | RadioButtonQuestion
  | TheoryQuestionSection;

interface Field {
  id: string;
  title: string;
  required?: boolean;
}

export interface RadioQuestion extends Field {
  type: InputType.Radio;
  options: RadioOption[];
}

export interface RadioButtonQuestion extends Field {
  type: InputType.RadioButton;
  options: RadioOption[];
  description?: string;
}

interface InputQuestion extends Field {
  type: InputType.Input;
  placeholder?: string;
  description?: string;
  inputType: 'number' | 'text';
}

interface TextQuestion extends Field {
  type: InputType.TextArea;
  description?: string;
  placeholder: string;
}

interface CheckboxQuestion extends Field {
  type: InputType.Checkbox;
  questions: CheckboxOption[];
}

interface TheoryQuestionSection extends Field {
  type: InputType.Rating;
  questions: TheoryQuestion[];
}

type TheoryQuestion = {
  topic?: string;
  title: string;
};

type CheckboxOption = {
  id: string;
  title: string;
};

export type RadioOption = {
  id: string;
  title: string;
  options?: RadioOption[];
};

export const introduction: Step = {
  id: StepId.Introduction,
  title: 'Introduction',
  stepDescription: 'Interview confirmation',
  description: `
    The interviewer checks a student's camera, sound and video. <br/>
    Then the mentor tells about himself in some words and becomes ready to listen to student's brief intro. Face to face interviewing helps both parties to interact and form a connection.<br/>
    Make a mark, if the interview can't be managed. 
  `,
  questions: [
    {
      id: '1',
      type: InputType.Radio,
      title: 'Did the student show up for the interview?',
      required: true,
      options: [
        { id: '1-1', title: "Yes, it's ok." },
        {
          id: '1-2',
          title: 'No, interview is failed.',
          options: [
            { id: '1-2-1', title: 'Student has a significant reason.' },
            { id: '1-2-2', title: 'Student ignores mentor.' },
            { id: '1-2-3', title: 'Student continues separate studying.' },
          ],
        },
      ],
    },
    {
      id: '2',
      type: InputType.TextArea,
      title: 'Your comment',
      placeholder: "Comment about student's skills",
    },
  ],
};

const theory: Step = {
  id: StepId.Theory,
  title: 'Theory',
  stepDescription: 'Talk about theory, how things work',
  description:
    'Ask student some questions from the self-study course. You can use the list of recommended questions or add your own.',
  questions: [
    {
      id: '0',
      type: InputType.Rating,
      title: 'What questions did the student have to answer?',
      questions: [
        {
          title: 'Sorting and search algorithms (Binary search, Bubble sort, Quick sort, etc.)',
          topic: 'Computer Science',
        },
        {
          title: 'Big O notation',
          topic: 'Computer Science',
        },
        {
          title: 'OOP (Encapsulation, Polymorphism, and Inheritance)',
          topic: 'Computer Science',
        },
        {
          title:
            "Representation in computer memory. Operations' complexity. Difference between list and array, or between stack and queue",
          topic: 'Data structures',
        },
        {
          title:
            "Position and display attributes' values, tags, weight of selectors, pseudo-classes and elements, box model, relative and absolute values, em vs rem, semantic, semantic tags, etc.",
          topic: 'HTML/CSS',
        },
      ],
    },
  ],
};

const practice: Step = {
  id: StepId.Practice,
  title: 'Practice',
  stepDescription: 'Propose technical tasks to solve',
  description:
    'Ask the student to solve the coding problem. See the list of examples of coding tasks or  suggest  another problem of the same level.',
  questions: [
    // TODO think of dynamic ids, how to store custom tasks
    {
      id: '0',
      type: InputType.TextArea,
      title: 'What task did the student have to solve?',
      placeholder: 'Task description',
    },
    {
      id: '1',
      type: InputType.Radio,
      title: 'Has the student solved the task(s)?',
      required: true,
      options: [
        { id: '1-1', title: 'Yes, he/she has.' },
        { id: '1-2', title: 'Yes, he/she has, but with tips' },
        { id: '1-3', title: 'Yes, he/she has.' },
        { id: '1-4', title: "No, he/she hasn't" },
        { id: '1-5', title: "No, he/she hasn't. Student has excellent theoretical knowledge." },
      ],
    },
  ],
};

const english: Step = {
  id: StepId.English,
  title: 'English-language proficiency',
  stepDescription: 'Level _ _',
  description: 'Ask the student to tell about themselves (2—3 min), hobby, favorite book, film etc.',
  questions: [
    {
      id: '1',
      type: InputType.RadioButton,
      required: true,
      title: 'Certified level of English',
      description: 'Make a mark, if the student has a certificate, proving his English level',
      options: [
        { id: '1-1', title: 'No certificate' },
        { id: '1-2', title: 'A1' },
        { id: '1-3', title: 'B1' },
        { id: '1-4', title: 'B1' },
        { id: '1-5', title: 'C1' },
        { id: '1-6', title: 'C2' },
      ],
    },
    {
      id: '2',
      type: InputType.RadioButton,
      title: 'English level by interviewers opinion',
      required: true,
      description:
        "Make a mark showing your own opinion of student's English level. It doesn't influence on the final score of the interview.",
      options: [
        { id: '1-1', title: 'A1' },
        { id: '1-2', title: 'B1' },
        { id: '1-3', title: 'B1' },
        { id: '1-4', title: 'C1' },
        { id: '1-5', title: 'C2' },
      ],
    },
    {
      id: '3',
      type: InputType.TextArea,
      title: 'Where did the student learn English? Your comment ',
      placeholder: "Comment about student's skills",
    },
  ],
};

const mentorDecision: Step = {
  id: StepId.Decision,
  title: 'Mentor decision',
  stepDescription: 'Student admission to the mentoring program',
  description: 'Make a decision to accept a student into a mentoring program.',
  questions: [
    {
      id: '1',
      type: InputType.Input,
      title: 'Final Score',
      description: 'We calculated average based on your marks, but you can adjust the final score',
      inputType: 'number',
      required: true,
    },
    {
      id: '3',
      type: InputType.Radio,
      title: 'Do you want to mentor this student and take them in your group?',
      required: true,
      options: [
        { id: '3-1', title: 'Yes, I will mentor this student.' },
        { id: '3-2', title: "No, I won't." },
        { id: '3-3', title: "I didn't decide yet. I'll submit the feedback later." },
        { id: '3-4', title: "No, I won't. Student continues separate studying. " },
      ],
    },
    {
      id: '4',
      type: InputType.TextArea,
      title: 'You can say something to the student (optional)',
      description: 'The student will see this comment in interview results',
      placeholder: "Comment about student's skills",
    },
  ],
};

export const feedbackSteps: Step[] = [introduction, theory, practice, english, mentorDecision];
