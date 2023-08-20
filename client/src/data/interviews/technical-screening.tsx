import { ReactNode } from 'react';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import { InputType } from './types';

/**
 * define steps for interview feedback, required to be filled
 */
export enum FeedbackStepId {
  Introduction = 'intro',
  Theory = 'theory',
  Practice = 'practice',
  English = 'english',
  Decision = 'decision',
}

export type Step = {
  id: FeedbackStepId;
  title: string;
  /** description of the step shown as a content */
  description: ReactNode;
  /** description of the step shown on the stepper description section */
  stepperDescription: string;
  items: StepFormItem[];
};

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
  id: FeedbackStepId;
  isCompleted: boolean;
  values?: InterviewFeedbackValues;
};

export type FeedbackStep = Step & InterviewFeedbackStepData;

export type Feedback = {
  /**
   * version of the feedback template. Currently supported only 1.
   */
  version: number;

  /** the steps of the feedback template */
  steps: FeedbackStep[];
  /**
   * defines whether interview is completed
   */
  isCompleted: boolean;
};

/**
 * The mentor decision about the student
 */
export enum Decision {
  Yes = 'yes',
  No = 'no',
  Draft = 'draft',
  SeparateStudy = 'separateStudy',
  MissedWithReason = 'missedWithReason',
  MissedIgnoresMentor = 'missedIgnoresMentor',
}

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
  defaultValue?: string | number;
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
  /**
   * The default list of questions for the interview
   */
  questions: InterviewQuestion[];
  /**
   * The pool of the questions available for consideration. Once the some of the `questions` are removed they are automatically added to the pool on the client
   */
  examples?: InterviewQuestion[];
  /**
   * The explanation of the rating values
   */
  tooltips?: string[];
}

export const SKILLS_LEVELS = [
  `Doesn't know`,
  `Poor knowledge (almost doesn't know)`,
  'Knows something (with tips)',
  'Good knowledge (makes not critical mistakes)',
  'Great knowledge',
];

export const CODING_LEVELS = [
  `Isn't able to coding`,
  `Poor coding ability (almost isn't able to)`,
  'Can code with tips',
  'Good coding ability (makes not critical mistakes)',
  'Great coding ability',
];

type CheckboxOption = {
  id: string;
  title: string;
};

export type RadioOption = {
  id: string;
  title: string;
  options?: RadioOption[];
};

//#region Steps definition
export const introduction: Step = {
  id: FeedbackStepId.Introduction,
  title: 'Introduction',
  stepperDescription: 'Interview confirmation',
  description: (
    <>
      <div>The interviewer checks a student's camera, sound and video.</div>
      <div>
        Then the mentor tells about himself in some words and becomes ready to listen to student's brief intro. Face to
        face interviewing helps both parties to interact and form a connection.
      </div>
      <div>Make a mark, if the interview can't be managed.</div>
      <div>
        <ClockCircleOutlined />
        &nbsp; 3 min
      </div>
    </>
  ),
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
            { id: Decision.MissedWithReason, title: 'Student has a significant reason.' },
            { id: Decision.MissedIgnoresMentor, title: 'Student ignores mentor.' },
            { id: Decision.SeparateStudy, title: 'Student continues separate studying.' },
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

const theoryQuestions = [
  {
    id: 'sorting',
    title: 'Sorting and search algorithms (Binary search, Bubble sort, Quick sort, etc.)',
    topic: 'Computer Science',
  },
  {
    id: 'bigO',
    title: 'Big O notation',
    topic: 'Computer Science',
  },
  {
    id: 'binaryNumbers',
    title: 'Binary number',
    topic: 'Computer Science',
  },
  {
    id: 'oop',
    title: 'OOP (Encapsulation, Polymorphism, and Inheritance)',
    topic: 'Computer Science',
  },
  {
    id: 'html',
    title:
      "Position and display attributes' values, tags, weight of selectors, pseudo-classes and elements, box model, relative and absolute values, em vs rem, semantic, semantic tags, etc.",
    topic: 'HTML/CSS',
  },
  {
    id: 'array',
    title: 'Array. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'list',
    title: 'List. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'stack',
    title: 'Stack. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'queue',
    title: 'Queue. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'tree',
    title: 'Tree. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'hashTable',
    title: 'Hash table. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'heap',
    title: 'Heap. Operations complexity.',
    topic: 'Data structures',
  },
  {
    id: 'structuresOverview',
    title: 'Difference between list and array, or between stack and queue.',
    topic: 'Data structures',
  },
];

const theory: Step = {
  id: FeedbackStepId.Theory,
  title: 'Theory',
  stepperDescription: 'Talk about theory, how things work',
  description: (
    <>
      <div>
        Ask student some questions from the self-study course. You can use the list of recommended questions or add your
        own.
      </div>
      <div>
        <ClockCircleOutlined />
        &nbsp; 15-30 min
      </div>
    </>
  ),
  items: [
    {
      type: InputType.Rating,
      id: 'questions',
      title: 'What questions did the student have to answer?',
      required: true,
      tooltips: SKILLS_LEVELS,
      questions: theoryQuestions,
      examples: theoryQuestions,
    },
    {
      id: 'comment',
      type: InputType.TextArea,
      title: 'Your comment',
      placeholder: "Comment about student's skills",
    },
  ],
};
const practiceQuestions = [
  {
    id: '1',
    title: `Given an integer array arr and a filtering function fn, return a new array with a fewer or equal number of elements. 
  The returned array should only contain elements where fn(arr[i], i) evaluated to a truthy value.`,
  },
  {
    id: '2',
    title: `Implement a function that takes two arrays of numbers and returns an array of numbers that are common between the two input arrays.`,
  },
];
const practice: Step = {
  id: FeedbackStepId.Practice,
  title: 'Practice',
  stepperDescription: 'Propose technical tasks to solve',
  description: (
    <>
      Ask the student to solve the coding problem. See the list of examples of coding tasks or suggest another problem
      of the same level.
      <div>
        <ClockCircleOutlined />
        &nbsp; 10-30 min
      </div>
    </>
  ),
  items: [
    {
      id: 'questions',
      type: InputType.Rating,
      title: 'What task did the student have to solve?',
      required: true,
      tooltips: CODING_LEVELS,
      questions: practiceQuestions,
      examples: practiceQuestions,
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
  id: FeedbackStepId.English,
  title: 'English-language proficiency',
  stepperDescription: 'Check English level',
  description: (
    <>
      Ask the student to tell about themselves (2—3 min), hobby, favorite book, film etc.
      <div>
        <ClockCircleOutlined />
        &nbsp; 3-5 min
      </div>
    </>
  ),
  items: [
    {
      id: 'englishCertificate',
      type: InputType.RadioButton,
      required: true,
      title: 'Certified level of English',
      description: 'Make a mark, if the student has a certificate, proving his English level',
      options: [
        { id: 'none', title: 'No certificate' },
        { id: 'A1', title: 'A1' },
        { id: 'A2', title: 'A2' },
        { id: 'B1', title: 'B1' },
        { id: 'B2', title: 'B2' },
        { id: 'C1', title: 'C1' },
        { id: 'C2', title: 'C2' },
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
        { id: 'A1', title: 'A1' },
        { id: 'A2', title: 'A2' },
        { id: 'B1', title: 'B1' },
        { id: 'B2', title: 'B2' },
        { id: 'C1', title: 'C1' },
        { id: 'C2', title: 'C2' },
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
  id: FeedbackStepId.Decision,
  title: 'Mentor decision',
  stepperDescription: 'Student admission to the mentoring program',
  description: (
    <>
      Make a decision to accept a student into a mentoring program.
      <div>
        <ClockCircleOutlined />
        &nbsp; 5 min
      </div>
    </>
  ),
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
      id: 'isGoodCandidate',
      type: InputType.Checkbox,
      title:
        'In your opinion, is this student a good candidate for mentoring with active interest  and motivation? Make a mark',
      options: [{ id: 'true', title: 'The student is a good candidate for mentoring.' }],
    },
    {
      id: 'decision',
      type: InputType.Radio,
      title: 'Do you want to mentor this student and take them in your group?',
      required: true,
      options: [
        { id: Decision.Yes, title: 'Yes, I will mentor this student.' },
        { id: Decision.No, title: "No, I won't." },
        { id: Decision.Draft, title: "I haven't decided yet. I'll submit the feedback later." },
        { id: Decision.SeparateStudy, title: "No, I won't. Student continues separate studying." },
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

//#endregion

/**
 * define the order of the steps in the interview feedback template
 */
const steps: Step[] = [introduction, theory, practice, english, mentorDecision];

export const feedbackTemplate = {
  version: 1,
  steps,
};
