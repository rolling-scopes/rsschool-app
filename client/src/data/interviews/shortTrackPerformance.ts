import { InterviewTemplate } from './types';

export const shortTrackPerformanceTemplate: InterviewTemplate = {
  name: 'EPAM ShortTrack TS mentors interview #2',
  examplesUrl: 'https://rolling-scopes-school.github.io/epam-short-track/core-js-ts/interviews/mentors-checkpoint-2',
  descriptionHtml: `
    During the interview, students can score up to 10 points. Each question is rated 0.5 points.<br/>
    `,
  categories: [
    {
      id: 1100,
      name: 'Node.js Basics',
      description: `2.5 points`,
      questions: [
        {
          id: 1101,
          name: 'What is Node.js, and how does it differ from browser-based JavaScript?',
        },
        {
          id: 1102,
          name: 'What is the purpose of the package.json file, and how does it differ from package-lock.json?',
        },
        {
          id: 1103,
          name: 'How do CommonJS (require) and ES Modules (import) differ in Node.js?',
        },
        {
          id: 1104,
          name: 'Briefly explain what streams are in Node.js and describe their types.',
        },
        {
          id: 1105,
          name: 'How do environment variables work in Node.js, and how are they used in applications?',
        },
      ],
    },
    {
      id: 1200,
      name: 'Networking',
      description: '2 points',
      questions: [
        {
          id: 1201,
          name: 'What is HTTP, and how does the HTTP request-response cycle work?',
        },
        {
          id: 1202,
          name: 'Compare and contrast HTTP/1, HTTP/2, and HTTP/3.',
        },
        {
          id: 1203,
          name: 'What is REST, and what are its key principles?',
        },
        {
          id: 1204,
          name: 'What are HTTP status codes? Provide examples of success, client error, and server error status codes.',
        },
      ],
    },
    {
      id: 1300,
      name: 'Security',
      description: '2 points',
      questions: [
        {
          id: 1301,
          name: 'What is XSS (Cross-Site Scripting), and how can it be prevented?',
        },
        {
          id: 1302,
          name: 'What is CSRF (Cross-Site Request Forgery), and how does it differ from XSS?',
        },
        {
          id: 1303,
          name: 'Explain how you would secure sensitive environment variables in a Node.js application.',
        },
        {
          id: 1304,
          name: 'What is CORS, and how does it relate to the Same-Origin Policy?',
        },
      ],
    },
    {
      id: 1400,
      name: 'Testing',
      description: '2 points',
      questions: [
        {
          id: 1401,
          name: 'What is the Arrange-Act-Assert (AAA) pattern, and why is it important in writing unit tests?',
        },
        {
          id: 1402,
          name: 'What is mocking, and how does it help isolate dependencies in tests?',
        },
        {
          id: 1403,
          name: 'Explain the principles of the FIRST (Fast, Independent, Repeatable, Self-validating, Timely) acronym in testing.',
        },
        {
          id: 1404,
          name: 'What are flaky tests, and how can they be addressed to improve CI/CD pipelines?',
        },
      ],
    },
    {
      id: 1500,
      name: 'Critical Rendering Path (CRP)',
      description: '1 point',
      questions: [
        {
          id: 1501,
          name: 'What are the main stages of the Critical Rendering Path (CRP)?',
        },
        {
          id: 1502,
          name: 'For moving an element during animation, is it better to use transition: translate or modify properties like left, top, etc.? Why?',
        },
      ],
    },
    {
      id: 1600,
      name: 'Debugging Tools',
      description: '0.5 point',
      questions: [
        {
          id: 1601,
          name: 'What debugging tools do you use for Node.js or web development, such as Chrome DevTools? Share an example of how you’ve identified or resolved an issue using these tools.',
        },
      ],
    },
  ],
};
