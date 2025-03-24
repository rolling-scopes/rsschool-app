import { InputType, InterviewTemplate } from './types';

export const shortTrackTypeScriptTemplate: InterviewTemplate = {
  name: 'EPAM ShortTrack TS mentors interview #2',
  examplesUrl: 'https://rolling-scopes-school.github.io/epam-short-track/core-js-ts/interviews/mentors-checkpoint-2',
  descriptionHtml: `
    During the interview, students can score up to 10 points. Each question is rated 0.5 points.<br/>
    `,
  categories: [
    {
      id: 1100,
      name: 'TypeScript',
      description: `5 points`,
      questions: [
        {
          id: 1101,
          name: 'What is the difference between TypeScript and JavaScript, and why would you choose TypeScript for a project?',
        },
        { id: 1102, name: 'Explain what structural typing is in TypeScript and how it differs from nominal typing.' },
        {
          id: 1103,
          name: 'What are the primitive types in TypeScript, and how are they different from JavaScript’s types?',
        },
        {
          id: 1104,
          name: 'How do Partial&lt;T&gt; and Required&lt;T&gt; utility types differ, and why would you use them in your code?',
        },
        {
          id: 1105,
          name: 'What is the difference between never and void in TypeScript, and when would you use each?',
        },
        {
          id: 1106,
          name: 'What are generics in TypeScript, and how can they make functions or classes more reusable? Provide examples.',
        },
        {
          id: 1107,
          name: 'How does the Pick&lt;T, K&gt; utility type differ from Omit&lt;T, K&gt;, and when would you use each of them?',
        },
        {
          id: 1108,
          name: 'Describe the difference between any and unknown in TypeScript and discuss scenarios where one should be preferred over the other.',
        },
        {
          id: 1109,
          name: 'How does the use of interface differ from type in TypeScript, and when would you choose one over the other?',
        },
        {
          id: 1110,
          name: 'What is the purpose of the readonly modifier in TypeScript, and how does it differ from a const variable?',
        },
      ],
    },
    {
      id: 1200,
      name: 'Object-Oriented Programming (OOP)',
      description: '2.5 points',
      questions: [
        {
          id: 1201,
          name: 'What is the difference between public, private, and static members in a TypeScript/JavaScript class, and what are their use cases?',
        },
        {
          id: 1202,
          name: 'Discuss SOLID principles and how they apply to Object-Oriented Programming in JavaScript or TypeScript.',
        },
        {
          id: 1203,
          name: 'What is the instanceof operator in JavaScript, and how does it work when checking if an object belongs to a specific class?',
        },
        {
          id: 1204,
          name: 'How do ES2015 classes simplify creating objects compared to traditional functions and prototypal inheritance in JavaScript?',
        },
        {
          id: 1205,
          name: 'Explain how you can achieve multiple inheritance in TypeScript and how it differs from extending classes in traditional OOP.',
        },
      ],
    },
    {
      id: 1300,
      name: 'Async JavaScript',
      description: '1.5 points',
      questions: [
        {
          id: 1301,
          name: 'What is the difference between setTimeout and setInterval in JavaScript, and how can you stop them from running?',
        },
        {
          id: 1302,
          name: 'What are Promise.all() and Promise.race(), and how do they differ in their behavior when resolving multiple promises?',
        },
        {
          id: 1303,
          name: 'How does async/await syntax enhances the readability and maintainability of asynchronous JavaScript code compared to traditional promise chains?',
          type: InputType.Input,
        },
      ],
    },
    {
      id: 1400,
      name: 'Errors and Debugging',
      description: '1 point',
      questions: [
        {
          id: 1401,
          name: 'What is the role of the finally block in error handling, and how does it interact with try and catch blocks in JavaScript?',
        },
        {
          id: 1402,
          name: 'How can you create and throw a custom error in JavaScript, and why would you do so? Provide a practical example.',
          type: InputType.Input,
        },
      ],
    },
  ],
};
