import { InputType, InterviewTemplate } from './types';

export const stScreeningTemplate: InterviewTemplate = {
  name: 'EPAM ShortTrack Technical Screening',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-basic-coreJS.md',
  descriptionHtml: `
    During the interview, students can score up to 100 points. Each topic has its value in points.<br/>
    Please see the details below.
    <ul>
    <li>Basics of JS - up to 10 points</li>
    <li>Arrays - up to 10 points</li>
    <li>Objects - up to 10 points</li>
    <li>Functions - up to 10 points</li>
    <li>Classes - up to 10 points</li>
    <li>Async - up to 10 points</li>
    <li>Basics of HTML/CSS - up to 10 points</li>
    <li>Client Side - up to 10 points</li>
    <li>DOM manipulation - up to 10 points</li>
    <li>Event Handling - up to 10 points</li>
    </ul>
    <br/>
    `,
  categories: [
    {
      id: 1010,
      name: 'Basics of JS',
      description: `10 points`,
      questions: [
        { id: 1011, name: 'Data types: Primitives vs Objects' },
        { id: 1012, name: 'Variables: var vs let vs const (Hoisting, Temporal Dead Zone)' },
        {
          id: 1013,
          name: 'Ternary, Nullish Coalescing, Optional Chaining, and Logical Operators (few practical tasks)',
          type: InputType.Input,
        },
        { id: 1014, name: 'Loops - for, while, do while, for of, for in' },
        { id: 1015, name: 'Type conversions, == / === (few practical tasks)', type: InputType.Input },
      ],
    },
    {
      id: 1020,
      name: 'Arrays',
      description: `10 points`,
      questions: [
        {
          id: 1021,
          name: 'Most popular methods: map vs forEach, filter vs find, sort, reduce, pop/push, shift/unshift, toSorted (node 20)',
          type: InputType.Input,
        },
        { id: 1022, name: 'Modification: mutating vs non mutating methods' },
        { id: 1023, name: 'Array vs Set' },
      ],
    },
    {
      id: 1030,
      name: 'Objects',
      description: '10 points',
      questions: [
        { id: 1031, name: 'How to get keys/values (Object.keys, values, entries)' },
        {
          id: 1032,
          name: 'How to copy object ({...obj}, Object.assign, JSON.parse/stringify, using loop, Object.create): shallow copy vs deep copy',
          type: InputType.Input,
        },
        {
          id: 1033,
          name: 'Destructuring (few practical tasks)',
          type: InputType.Input,
        },
        { id: 1034, name: 'Getter/setter (optional)' },
        { id: 1035, name: 'Object vs Map' },
      ],
    },
    {
      id: 1040,
      name: 'Functions',
      description: '10 points',
      questions: [
        { id: 1041, name: 'Declaration vs expression vs arrow functions' },
        { id: 1042, name: 'Default params' },
        { id: 1043, name: 'Rest operator' },
        { id: 1044, name: 'this' },
        { id: 1045, name: 'Call vs apply vs bind' },
      ],
    },
    {
      id: 1050,
      name: 'Classes',
      description: '10 points',
      questions: [
        { id: 1051, name: 'Constructor' },
        { id: 1052, name: 'Public vs Private methods' },
        { id: 1053, name: 'Static methods' },
        { id: 1054, name: 'Inheritance' },
      ],
    },
    {
      id: 1060,
      name: 'Async',
      description: '10 points',
      questions: [
        { id: 1061, name: 'Promise and its methods' },
        { id: 1062, name: 'Promises vs async/await' },
        { id: 1063, name: 'Error handling (try / catch / finally)' },
        { id: 1064, name: 'EventLoop (high lvl!)' },
      ],
    },
    {
      id: 1070,
      name: 'Basics of HTML/CSS',
      description: '10 points',
      questions: [
        { id: 1071, name: 'Selector weights' },
        { id: 1072, name: 'Pseudo-classes and pseudo-elements (optional)' },
        { id: 1073, name: 'em vs rem, relative and absolute values (optional)' },
        { id: 1074, name: 'FlexBox vs Grid' },
      ],
    },
    {
      id: 1080,
      name: 'Client Side',
      description: '10 points',
      questions: [
        { id: 1081, name: 'Global object window (document, location, history, cookies)' },
        { id: 1082, name: 'Web Storage (sessionStorage vs localStorage)' },
      ],
    },
    {
      id: 1090,
      name: 'DOM manipulation',
      description: '10 points',
      questions: [
        { id: 1091, name: 'Selection (getElementBy vs querySelector)' },
        { id: 1092, name: 'HTML attributes' },
        { id: 1093, name: 'Traversing (...child, ...sibling, element vs node) (optional)' },
      ],
    },
    {
      id: 1100,
      name: 'Event Handling',
      description: '10 points',
      questions: [
        { id: 1101, name: 'AddEventListener vs on[Event]' },
        { id: 1102, name: 'PreventDefault vs stopPropagation vs stopImmediatePropagation' },
        { id: 1103, name: 'Event delegation (optional)' },
        { id: 1104, name: 'target vs currentTarget' },
      ],
    },
    {
      id: 1110,
      name: 'English Level',
      description: 'Checking by Mentor',
      questions: [
        { id: 1101, name: 'less then B1' },
        { id: 1102, name: 'B1' },
        { id: 1103, name: 'B1+' },
        { id: 1104, name: 'B2' },
        { id: 1105, name: 'B2+' },
        { id: 1106, name: 'C1' },
      ],
    },
    {
      id: 1120,
      name: 'Practical task',
      description: 'additional 20 points',
      questions: [
        {
          id: 1121,
          name: 'Task solved',
          type: InputType.Input,
        },
      ],
    },
  ],
};
