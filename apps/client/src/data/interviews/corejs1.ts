import { InputType, InterviewTemplate } from './types';

export const corejs1Template: InterviewTemplate = {
  name: 'CoreJS',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-basic-coreJS.md',
  descriptionHtml: `
  During the interview, students can score up to 100 points. Each topic has its value in points.<br/>
  Please see the details below.
  <ul>
  <li>Basics - up to 25 points</li>
  <li>Advanced Expressions - up to 10 points</li>
  <li>Function - up to 20 points</li>
  <li>Date & time (optional) - up to 5 points</li>
  <li>Objects Built-in methods - up to 10 points</li>
  <li>Arrays Built-in methods - up to 10 points</li>
  <li>Arrays Iterating, Sorting, Filtering - up to 10 points</li>
  <li>Loops - up to 5 points</li>
  <li>Global object window  up to 10 points</li>
  <li>Events Basics - up to 10 points</li>
  <li>Events Propagation / Preventing - up to 10 points</li>
  <li>Timers - up to 10 points</li>
  <li>Web Storage API & cookies - up to 10 points</li>
  <li>Intermediate knowledge of patterns and best practices - up to 5 points</li>
  </ul>
  <br/>
  `,
  categories: [
    {
      id: 1000,
      name: 'Basics',
      description: '25 points',
      questions: [
        { id: 1001, name: 'Data types', type: InputType.Input },
        { id: 1002, name: 'Number methods' },
        { id: 1003, name: 'String methods' },
        { id: 1004, name: 'let var const - differences', type: InputType.Input },
        { id: 1005, name: 'ternary operator' },
        { id: 1006, name: 'switch case - examples, where it can be useful' },
        { id: 1007, name: 'type conversions', type: InputType.Input },
      ],
    },
    {
      id: 1010,
      name: 'Advanced Expressions',
      description: `10 points`,
      questions: [
        { id: 1011, name: 'Be able to discover cases of implicit data types conversion into boolean, string, number' },
        { id: 1012, name: 'Strict comparison', type: InputType.Input },
        { id: 1013, name: 'Object.is (optional)' },
        { id: 1014, name: 'what is polyfills' },
        { id: 1015, name: 'Hoisting', type: InputType.Input },
        { id: 1016, name: 'String templates' },
      ],
    },
    {
      id: 1020,
      name: 'Function',
      description: `20 points`,
      questions: [{ id: 1021, name: 'arrow func/ func expression/ func declaration' }],
    },
    {
      id: 1030,
      name: 'Date & time (optional)',
      description: `5 points`,
      questions: [
        { id: 1031, name: 'Date object' },
        { id: 1032, name: 'Date methods, props' },
      ],
    },
    {
      id: 1040,
      name: 'Objects Built-in methods',
      description: `10 points`,
      questions: [
        { id: 1041, name: 'Object `keys/values`' },
        { id: 1042, name: 'Know how to use built-in methods' },
      ],
    },
    {
      id: 1050,
      name: 'Arrays Built-in methods',
      description: `10 points`,
      questions: [
        { id: 1051, name: 'Know how to copy array', type: InputType.Input },
        { id: 1052, name: 'Know how to modify array', type: InputType.Input },
        { id: 1053, name: 'Know how to copy a part of array', type: InputType.Input },
        { id: 1054, name: 'Know how to flatten nested array' },
      ],
    },
    {
      id: 1060,
      name: 'Arrays Iterating, Sorting, Filtering',
      description: `10 points`,
      questions: [
        { id: 1061, name: 'Know how to sort Array', type: InputType.Input },
        { id: 1062, name: 'Know several method how to iterate Array elements', type: InputType.Input },
        { id: 1063, name: 'Be able to custom sorting for Array', type: InputType.Input },
        { id: 1064, name: 'Be able to filter Array elements', type: InputType.Input },
      ],
    },
    {
      id: 1070,
      name: 'Loops',
      description: `5 points`,
      questions: [
        { id: 1071, name: 'for loop' },
        { id: 1072, name: 'while loop' },
        { id: 1073, name: 'do while loop' },
      ],
    },
    {
      id: 1080,
      name: 'Global object window',
      description: `10 points`,
      questions: [{ id: 1081, name: 'Document' }],
    },
    {
      id: 1090,
      name: 'Events Basics',
      description: `10 points`,
      questions: [
        { id: 1091, name: 'Event Phases', type: InputType.Input },
        { id: 1092, name: 'Event Listeners', type: InputType.Input },
        { id: 1093, name: 'DOM Events' },
        { id: 1094, name: 'Know basic Event types' },
        { id: 1095, name: 'Mouse / Keyboard Events' },
        { id: 1096, name: 'Form / Input Events' },
      ],
    },
    {
      id: 1100,
      name: 'Events Propagation / Preventing',
      description: `10 points`,
      questions: [
        { id: 1101, name: 'Know Event propagation cycle' },
        { id: 1102, name: 'Know how to stop Event propagation (stopPropagation() / stopImmediatePropagation())' },
        { id: 1103, name: 'Know how to prevent Event default browser behavior (event.preventDefault())' },
        { id: 1104, name: 'Delegating' },
        { id: 1105, name: 'Understand Event delegating benefits and drawbacks' },
      ],
    },
    {
      id: 1120,
      name: 'Timers',
      description: `10 points`,
      questions: [
        { id: 1121, name: 'setTimeout / setInterval', type: InputType.Input },
        { id: 1122, name: 'clearTimeout / clearInterval' },
      ],
    },
    {
      id: 1130,
      name: 'Web Storage API & cookies',
      description: `10 points`,
      questions: [
        { id: 1131, name: 'LocalStorage', type: InputType.Input },
        { id: 1132, name: 'SessionStorage' },
      ],
    },
    {
      id: 1140,
      name: 'Intermediate knowledge of patterns and best practices',
      description: `5 points`,
      questions: [{ id: 1141, name: 'KISS, DRY, YAGNI', type: InputType.Input }],
    },
  ],
};
