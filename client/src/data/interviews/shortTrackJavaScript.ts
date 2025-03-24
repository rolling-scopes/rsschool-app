import { InputType, InterviewTemplate } from './types';

export const shortTrackJavaScriptTemplate: InterviewTemplate = {
  name: 'EPAM ShortTrack Core JS mentors interview #1',
  examplesUrl: 'https://rolling-scopes-school.github.io/epam-short-track/core-js-ts/interviews/mentors-checkpoint-2',
  descriptionHtml: `
    During the interview, students can score up to 10 points. Each question is rated 0.5 points.<br/>
    `,
  categories: [
    {
      id: 1100,
      name: 'Core JS mentors interview #1',
      description: `10 points`,
      questions: [
        { id: 1101, name: 'What is the difference between Git and GitHub?' },
        { id: 1102, name: 'Describe the Git flow branching model.' },
        {
          id: 1103,
          name: 'What is the difference between git pull and git fetch, git reset and git revert, git merge and git rebase?',
        },
        {
          id: 1104,
          name: 'What are the key differences between primitive data types and Object data types in JavaScript?',
        },
        {
          id: 1105,
          name: "How does the 'typeof' operator work in JavaScript, and when would you use it?",
          type: InputType.Input,
        },
        {
          id: 1106,
          name: 'What are the differences between var, let, and const in JavaScript? Can you explain what hoisting and TDZ are?',
        },
        { id: 1107, name: 'How do you use conditional statements in JavaScript to make decisions in your code?' },
        {
          id: 1108,
          name: 'How does destructuring work in JavaScript, and give examples of its use with arrays and objects?',
          type: InputType.Input,
        },
        {
          id: 1109,
          name: 'What are some ways to create arrays in JavaScript? What array methods that modify the original array in JavaScript?',
        },
        {
          id: 1110,
          name: 'Explain how you would use array operations such as sort, filter, find, map, and reduce in JavaScript.',
        },
        { id: 1111, name: 'What are static methods in JavaScript? Provide an example.' },
        {
          id: 1112,
          name: 'Can you explain automatic data type conversion in JavaScript?',
          type: InputType.Input,
        },
        { id: 1113, name: "What is the difference between 'Object.create()' and new keyword for creating objects?" },
        {
          id: 1114,
          name: 'What are property descriptors in JavaScript objects and how can you manipulate them? How do getter and setter methods work in JavaScript objects?',
        },
        {
          id: 1115,
          name: 'How can you clone an object in JavaScript? How can you prevent modifications to an object in JavaScript?',
        },
        {
          id: 1116,
          name: 'Explain the difference between function declarations, function expressions, and arrow functions.',
        },
        {
          id: 1117,
          name: "How do default parameters work in JavaScript functions and why are they useful? What is a rest operator and how can it be used in functions? Rest operator vs 'arguments'.",
        },
        {
          id: 1118,
          name: "How does the 'this' keyword work in different types of functions? What are the 'call', 'apply', and 'bind' methods? Provide examples of how and when you would use each.",
        },
        { id: 1119, name: "How does 'use strict' mode affect 'this' behavior in functions?" },
        {
          id: 1120,
          name: 'Explain the concept of closure in JavaScript. Explain functional patterns in JavaScript: IIFE (Immediately Invoked Function Expressions), callback, memoization, currying, chaining, higher-order function, recursion.',
        },
      ],
    },
  ],
};
