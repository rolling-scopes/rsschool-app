import { InputType, StepId } from './types';

export type Step = {
  id: StepId;
  title: string;
  description: string;
  stepperDescription: string;
  items: StepFormItem[];
};

export type StepFormItem = RadioItem | TextItem | InputItem | CheckboxItem | RadioButtonItem | QuestionItem;

interface Field {
  id: string;
  title: string;
  required?: boolean;
}

export interface RadioItem extends Field {
  type: InputType.Radio;
  options: RadioOption[];
}

export interface RadioButtonItem extends Field {
  type: InputType.RadioButton;
  options: RadioOption[];
  description?: string;
}

interface InputItem extends Field {
  type: InputType.Input;
  placeholder?: string;
  description?: string;
  inputType: 'number' | 'text';
}

interface TextItem extends Field {
  type: InputType.TextArea;
  description?: string;
  placeholder: string;
}

interface CheckboxItem extends Field {
  type: InputType.Checkbox;
  options: CheckboxOption[];
}

export interface QuestionItem {
  id: string;
  title: string;
  required?: boolean;
  type: InputType.Rating;
  questions: Question[];
  examples?: Question[];
}

export type Question = {
  id: string;
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
  stepperDescription: 'Interview confirmation',
  description: `
    The interviewer checks a student's camera, sound and video. <br/>
    Then the mentor tells about himself in some words and becomes ready to listen to student's brief intro. Face to face interviewing helps both parties to interact and form a connection.<br/>
    Make a mark, if the interview can't be managed. 
  `,
  items: [
    {
      id: 'interviewResult',
      type: InputType.Radio,
      title: 'Did the student show up for the interview?',
      required: true,
      options: [
        { id: 'done', title: "Yes, it's ok." },
        {
          id: 'missed',
          title: 'No, interview is failed.',
          options: [
            { id: 'hasReason', title: 'Student has a significant reason.' },
            { id: 'ignore', title: 'Student ignores mentor.' },
            { id: 'separateStudy', title: 'Student continues separate studying.' },
          ],
        },
      ],
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Your comment',
      placeholder: "Comment about student's skills",
    },
  ],
};

const theory: Step = {
  id: StepId.Theory,
  title: 'Theory',
  stepperDescription: 'Talk about theory, how things work',
  description:
    'Ask student some questions from the self-study course. You can use the list of recommended questions or add your own.',
  items: [
    {
      type: InputType.Rating,
      id: 'questions',
      title: 'What questions did the student have to answer?',
      required: true,
      questions: [
        {
          id: '1',
          title: 'Sorting and search algorithms (Binary search, Bubble sort, Quick sort, etc.)',
          topic: 'Computer Science',
        },
        {
          id: '2',
          title: 'Big O notation',
          topic: 'Computer Science',
        },
        {
          id: '3',
          title: 'OOP (Encapsulation, Polymorphism, and Inheritance)',
          topic: 'Computer Science',
        },
        {
          id: '4',
          title:
            "Representation in computer memory. Operations' complexity. Difference between list and array, or between stack and queue",
          topic: 'Data structures',
        },
        {
          id: '5',
          title:
            "Position and display attributes' values, tags, weight of selectors, pseudo-classes and elements, box model, relative and absolute values, em vs rem, semantic, semantic tags, etc.",
          topic: 'HTML/CSS',
        },
      ],
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Your comment',
      placeholder: "Comment about student's skills",
    },
  ],
};

const practice: Step = {
  id: StepId.Practice,
  title: 'Practice',
  stepperDescription: 'Propose technical tasks to solve',
  description:
    'Ask the student to solve the coding problem. See the list of examples of coding tasks or  suggest  another problem of the same level.',
  items: [
    {
      id: 'questions',
      type: InputType.Rating,
      title: 'What task did the student have to solve?',
      required: true,
      questions: [
        {
          id: '1',
          title: `Given an integer array arr and a filtering function fn, return a new array with a fewer or equal number of elements. 
        The returned array should only contain elements where fn(arr[i], i) evaluated to a truthy value.`,
        },
      ],
      examples: [
        {
          id: '2',
          title: `Implement a function that takes two arrays of numbers and returns an array of numbers that are common between the two input arrays.`,
        },
      ],
    },
    {
      id: '2',
      type: InputType.Radio,
      title: 'Has the student solved the task(s)? (do we really need this question?)',
      required: true,
      options: [
        { id: '1-1', title: 'Yes, he/she has.' },
        { id: '1-2', title: 'Yes, he/she has, but with tips' },
        { id: '1-3', title: "No, he/she hasn't" },
        { id: '1-4', title: "No, he/she hasn't. Student has excellent theoretical knowledge." },
      ],
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Your comment',
      required: true,
      placeholder: "Comment about student's skills",
    },
  ],
};

const english: Step = {
  id: StepId.English,
  title: 'English-language proficiency',
  stepperDescription: 'Check English level',
  description: 'Ask the student to tell about themselves (2—3 min), hobby, favorite book, film etc.',
  items: [
    {
      id: 'englishCertificate',
      type: InputType.RadioButton,
      required: true,
      title: 'Certified level of English',
      description: 'Make a mark, if the student has a certificate, proving his English level',
      options: [
        { id: '1', title: 'No certificate' },
        { id: '2', title: 'A1' },
        { id: '3', title: 'B1' },
        { id: '4', title: 'B2' },
        { id: '5', title: 'C1' },
        { id: '6', title: 'C2' },
      ],
    },
    {
      id: 'selfAssessment',
      type: InputType.RadioButton,
      title: 'English level by interviewers opinion',
      required: true,
      description:
        "Make a mark showing your own opinion of student's English level. It doesn't influence on the final score of the interview.",
      options: [
        { id: '1', title: 'A1' },
        { id: '2', title: 'B1' },
        { id: '3', title: 'B2' },
        { id: '4', title: 'C1' },
        { id: '5', title: 'C2' },
      ],
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Where did the student learn English? Your comment ',
      placeholder: "Comment about student's skills",
    },
  ],
};

const mentorDecision: Step = {
  id: StepId.Decision,
  title: 'Mentor decision',
  stepperDescription: 'Student admission to the mentoring program',
  description: 'Make a decision to accept a student into a mentoring program.',
  items: [
    {
      id: 'finalScore',
      type: InputType.Input,
      title: 'Final Score',
      description: 'We calculated average based on your marks, but you can adjust the final score',
      inputType: 'number',
      required: true,
    },
    {
      id: 'goodCandidate',
      type: InputType.Checkbox,
      required: true,
      title:
        'In your opinion, is this student a good candidate for mentoring with active interest  and motivation? Make a mark',
      options: [{ id: '2-1', title: 'The student is a good candidate for mentoring.' }],
    },
    {
      id: 'decision',
      type: InputType.Radio,
      title: 'Do you want to mentor this student and take them in your group?',
      required: true,
      options: [
        { id: 'yes', title: 'Yes, I will mentor this student.' },
        { id: 'no', title: "No, I won't." },
        { id: 'notSure', title: "I haven't decided yet. I'll submit the feedback later." },
        { id: 'separateStudy', title: "No, I won't. Student continues separate studying." },
      ],
    },
    {
      id: 'redFlags',
      type: InputType.TextArea,
      title: 'Red flags',
      placeholder: "Specify any red flags you've noticed during the interview",
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'You can say something to the student (optional)',
      description: 'The student will see this comment in interview results',
      placeholder: "Comment about student's skills",
    },
  ],
};

const steps: Step[] = [introduction, theory, practice, english, mentorDecision];

export const feedbackTemplate = {
  version: 1,
  steps,
};
