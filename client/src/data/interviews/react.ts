import { InterviewTemplate } from './types';

export const reactTemplate: InterviewTemplate = {
  name: 'React interview ',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/react/questions.md',
  categories: [
    {
      id: 1000,
      name: 'JSX',
      questions: [
        { id: 1001, name: 'What is JSX?' },
        { id: 1002, name: 'Is it possible to use React without JSX?' },
      ],
    },
    {
      id: 1010,
      name: 'React DOM',
      questions: [
        { id: 1011, name: 'What is the virtual DOM? How does react use the virtual DOM to render the UI?' },
        { id: 1012, name: 'Is the virtual DOM the same as the shadow DOM?' },
        { id: 1013, name: 'What is the difference between the virtual DOM and the real DOM?' },
      ],
    },
    {
      id: 1020,
      name: 'Render',
      questions: [
        { id: 1021, name: 'When is a component rendered?' },
        { id: 1022, name: 'How not to render on props change?' },
        { id: 1023, name: 'Is it OK to use arrow functions in render methods?' },
      ],
    },
    {
      id: 1030,
      name: 'Interaction between components',
      questions: [
        { id: 1031, name: 'How do you pass a value from parent to child?' },
        { id: 1032, name: 'How do you pass a value from child to parent?' },
        { id: 1033, name: 'What is prop drilling?' },
        { id: 1034, name: 'Can a child component modify its own props?' },
        { id: 1035, name: 'How do you pass a value from sibling to sibling?' },
      ],
    },
    {
      id: 1040,
      name: 'Lifecycle and State',
      questions: [
        { id: 1041, name: 'What is the difference between props and state?' },
        { id: 1042, name: 'How does state in a class component differ from state in a functional component?' },
        { id: 1043, name: 'What is the component lifecycle?' },
        { id: 1044, name: 'How do you update lifecycle in function components?' },
      ],
    },
    {
      id: 1050,
      name: 'Ref',
      questions: [
        { id: 1051, name: 'What is the difference between refs and state variables?' },
        { id: 1052, name: 'When is the best time to use refs?' },
        { id: 1053, name: 'What is the proper way to update a ref in a function component?' },
      ],
    },
    {
      id: 1060,
      name: 'Context',
      questions: [
        { id: 1061, name: 'What is the difference between the context API and prop drilling?' },
        { id: 1062, name: "When shouldn't you use the context API?" },
      ],
    },
    {
      id: 1070,
      name: 'Redux',
      questions: [
        { id: 1071, name: 'Enumerate base principles' },
        { id: 1072, name: 'What is the typical flow of data in a React + Redux app?' },
        { id: 1073, name: 'Benefits of Redux?' },
      ],
    },
    {
      id: 1080,
      name: 'Other',
      questions: [
        { id: 1081, name: 'Is it a good idea to use Math.random for keys?' },
        { id: 1082, name: 'What are the limitations of React?' },
        { id: 1083, name: 'What is a higher order component?' },
        { id: 1084, name: 'What are uncontrolled and controlled components?' },
        { id: 1085, name: 'React optimizations' },
      ],
    },
    {
      id: 1100,
      name: 'Coding task',
      questions: [{ id: 1101, name: 'Small react app: form, button, results list' }],
    },
  ],
};
