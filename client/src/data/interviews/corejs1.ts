import { InputType, InterviewTemplate } from './types';

export const corejs1Template: InterviewTemplate = {
  name: 'CoreJS',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-basic-coreJS.md',
  descriptionHtml: `
    During the interview, students can score up to 100 points. Each topic has its value in points.<br/>
    Please see the details below.
    <ul>
    <li>Advanced Expressions - up to 10 points</li>
    <li>Function - up to 5 points</li>
    <li>Functional Scope - up to 10 points</li>
    <li>Functions Parameters / Arguments - up to 5 points</li>
    <li>Closures Advanced - up to 15 points</li>
    <li>Advanced Functions - up to 15 points</li>
    <li>ECMAScript Intermediate - up to 10 points</li>
    <li>Objects Built-in Methods - up to 10 points</li>
    <li>Arrays Built-in Methods - up to 5 points</li>
    <li>Arrays Iterating, Sorting, Filtering - up to 5 points</li>
    <li>Events Basics - up to 5 points</li>
    <li>Events Propagation / Preventing - up to 5 points</li>
    <li>Timers - up to 5 points</li>
    <li>Web Storage API & Cookies - up to 5 points</li>
    <li>Date & Time - up to 5 points</li>
    <li>Software Development Best Practices - up to 5 points</li>
    </ul>
    <br/>
    `,
  categories: [
    {
      id: 1010,
      name: 'Advanced Expressions',
      description: `10 points`,
      questions: [
        { id: 1011, name: 'Object.is (optional)' },
        { id: 1012, name: 'Differences between let, var, and const' },
        { id: 1013, name: 'Exploring the Temporal Dead Zone', type: InputType.Input },
        { id: 1015, name: 'Hoisting', type: InputType.Input },
      ],
    },
    {
      id: 1020,
      name: 'Function',
      description: `5 points`,
      questions: [
        {
          id: 1021,
          name: 'Differences and uses of arrow functions, function expressions, and function declarations',
          type: InputType.Input,
        },
      ],
    },
    {
      id: 1030,
      name: 'Functional Scope',
      description: '10 points',
      questions: [
        { id: 1031, name: 'Global scope vs. Functional scope' },
        { id: 1032, name: 'Variable visibility areas' },
        { id: 1033, name: 'Working with nested scopes' },
      ],
    },
    {
      id: 1040,
      name: 'Functions Parameters / Arguments',
      description: '5 points',
      questions: [
        {
          id: 1041,
          name: 'Defining function parameters',
        },
        {
          id: 1042,
          name: 'Differences in parameters passing by value and by reference',
        },
        {
          id: 1043,
          name: 'Handling a dynamic amount of function parameters',
        },
      ],
    },
    {
      id: 1050,
      name: 'Closures Advanced',
      description: '15 points',
      questions: [
        {
          id: 1051,
          name: 'Understanding context and lexical environments',
          type: InputType.Input,
        },
        {
          id: 1052,
          name: 'Differences between scope and context',
          type: InputType.Input,
        },
        {
          id: 1053,
          name: 'The mechanism of lexical environment traversal',
        },
        {
          id: 1054,
          name: 'Connection between function and its lexical environment',
          type: InputType.Input,
        },
      ],
    },
    {
      id: 1060,
      name: 'Advanced Functions',
      description: '15 points',
      questions: [
        {
          id: 1061,
          name: '`this` in functions',
          type: InputType.Input,
        },
        {
          id: 1062,
          name: 'Reference Type & losing `this`',
        },
        {
          id: 1063,
          name: 'Understand difference between function and method',
        },
        {
          id: 1064,
          name: 'Understand how `this` works, realize `this` possible issues',
          type: InputType.Input,
        },
        {
          id: 1065,
          name: 'Manage `this`',
          type: InputType.Input,
        },
        {
          id: 1067,
          name: 'Be able to use `call` and `apply` Function built-in methods',
        },
        {
          id: 1068,
          name: 'Know how to bind `this` scope to function',
        },
        {
          id: 1069,
          name: 'Binding, binding one function twice',
        },
      ],
    },
    {
      id: 1070,
      name: 'ECMAScript Intermediate',
      description: '10 points',
      questions: [
        {
          id: 1071,
          name: 'Function default parameters',
        },
        {
          id: 1072,
          name: 'Using spread operator for function arguments',
        },
        {
          id: 1073,
          name: 'Comparing `arguments` and `rest parameters`',
        },
        {
          id: 1074,
          name: 'Array concatenation with spread operator',
        },
        {
          id: 1075,
          name: 'Destructuring assignments for variables and function arguments',
        },
      ],
    },
    {
      id: 1080,
      name: 'Objects Built-in Methods',
      description: '10 points',
      questions: [
        {
          id: 1081,
          name: 'Utilizing `Object.keys` and `Object.values`',
        },
        {
          id: 1082,
          name: 'Working with static Object methods',
        },
        {
          id: 1083,
          name: 'Property flags and descriptors',
        },
        {
          id: 1084,
          name: 'Creating iterable objects and using `Symbol.iterator` (optional)',
        },
      ],
    },
    {
      id: 1100,
      name: 'Arrays Built-in Methods',
      description: '5 points',
      questions: [
        {
          id: 1101,
          name: 'Copying and modifying arrays',
        },
        {
          id: 1102,
          name: 'Flattening nested arrays',
        },
      ],
    },
    {
      id: 1110,
      name: 'Arrays Iterating, Sorting, Filtering',
      description: '5 points',
      questions: [
        {
          id: 1111,
          name: 'Sorting and custom sorting arrays',
        },
        {
          id: 1112,
          name: 'Filtering array elements',
        },
      ],
    },
    {
      id: 1130,
      name: 'Events Basics',
      description: '5 points',
      questions: [
        {
          id: 1131,
          name: 'Types of DOM Events',
        },
        {
          id: 1132,
          name: 'Working with Mouse and Keyboard Events',
        },
        {
          id: 1133,
          name: 'Handling Form and Input Events',
        },
        {
          id: 1134,
          name: 'Event Listeners',
        },
        {
          id: 1135,
          name: 'Event Phases and their differences',
        },
        {
          id: 1136,
          name: 'Custom events (optional)',
        },
      ],
    },
    {
      id: 1140,
      name: 'Events Propagation / Preventing',
      description: '5 points',
      questions: [
        {
          id: 1141,
          name: 'Event propagation cycle',
        },
        {
          id: 1142,
          name: 'Stopping event propagation',
        },
        {
          id: 1143,
          name: 'Preventing default browser behavior',
        },
        {
          id: 1144,
          name: 'Event delegation and its pros/cons',
        },
      ],
    },
    {
      id: 1150,
      name: 'Timers',
      description: '5 points',
      questions: [
        {
          id: 1151,
          name: 'Usage of `setTimeout` / `setInterval`',
        },
        {
          id: 1152,
          name: 'Clearing timers with `clearTimeout` / `clearInterval`',
        },
      ],
    },
    {
      id: 1160,
      name: 'Web Storage API & Cookies',
      description: '5 points',
      questions: [
        {
          id: 1161,
          name: 'Differences between LocalStorage, SessionStorage, and Cookies',
        },
      ],
    },
    {
      id: 1170,
      name: 'Date & Time',
      description: '5 points',
      questions: [
        {
          id: 1171,
          name: 'Working with the Date object',
        },
        {
          id: 1172,
          name: 'Timezones and Internationalization in JavaScript (Intl)',
        },
      ],
    },
    {
      id: 1180,
      name: 'Software Development Best Practices',
      description: '5 points',
      questions: [
        {
          id: 1181,
          name: 'Understanding and applying KISS, DRY, and YAGNI principles',
        },
      ],
    },
  ],
};
