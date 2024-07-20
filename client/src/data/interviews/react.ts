import { InterviewTemplate } from './types';

export const reactTemplate: InterviewTemplate = {
  name: 'React interview',
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
      name: 'Styled-components',
      questions: [{ id: 1011, name: 'Using styled-components' }],
    },
    {
      id: 1020,
      name: 'Components',
      questions: [
        { id: 1021, name: 'Component Definition (Class-based, Functional)' },
        { id: 1022, name: 'Components Composition' },
      ],
    },
    {
      id: 1030,
      name: 'React DOM',
      questions: [
        { id: 1031, name: 'What is the virtual DOM? How does react use the virtual DOM to render the UI?' },
        { id: 1032, name: 'Is the virtual DOM the same as the shadow DOM?' },
        { id: 1033, name: 'What is the difference between the virtual DOM and the real DOM?' },
      ],
    },
    {
      id: 1040,
      name: 'Render',
      questions: [
        { id: 1041, name: 'When is a component rendered?' },
        { id: 1042, name: 'How not to render on props change?' },
        { id: 1043, name: 'Is it OK to use arrow functions in render methods?' },
        { id: 1044, name: 'Components rendering system' },
      ],
    },
    {
      id: 1050,
      name: 'Interaction between components',
      questions: [
        { id: 1051, name: 'How do you pass a value from parent to child?' },
        { id: 1052, name: 'How do you pass a value from child to parent?' },
        { id: 1053, name: 'What is prop drilling?' },
        { id: 1054, name: 'Can a child component modify its own props?' },
        { id: 1055, name: 'How do you pass a value from sibling to sibling?' },
      ],
    },
    {
      id: 1060,
      name: 'Lifecycle and State',
      questions: [
        { id: 1061, name: 'What is the difference between props and state?' },
        { id: 1062, name: 'How does state in a class component differ from state in a functional component?' },
        { id: 1063, name: 'What is the component lifecycle?' },
        { id: 1064, name: 'How do you update lifecycle in function components?' },
        { id: 1065, name: 'Controlled/uncontrolled components' },
        { id: 1066, name: 'Stateful vs stateless components' },
      ],
    },
    {
      id: 1070,
      name: 'Ref',
      questions: [
        { id: 1071, name: 'What is the difference between refs and state variables?' },
        { id: 1072, name: 'When is the best time to use refs?' },
        { id: 1073, name: 'What is the proper way to update a ref in a function component?' },
      ],
    },
    {
      id: 1080,
      name: 'Context',
      questions: [
        { id: 1081, name: 'What is the difference between the context API and prop drilling?' },
        { id: 1082, name: "When shouldn't you use the context API?" },
      ],
    },
    {
      id: 1090,
      name: 'Redux',
      questions: [
        { id: 1091, name: 'Enumerate base principles' },
        { id: 1092, name: 'What is the typical flow of data in a React + Redux app?' },
        { id: 1093, name: 'Benefits of Redux?' },
        { id: 1094, name: 'Async Redux flow' },
      ],
    },
    {
      id: 1100,
      name: 'State Management by managers',
      questions: [
        { id: 1101, name: 'Mobx' },
        { id: 1102, name: 'Reflux' },
      ],
    },
    {
      id: 1110,
      name: 'Routing',
      questions: [
        { id: 1111, name: 'React Router' },
        { id: 1112, name: 'History' },
      ],
    },
    {
      id: 1120,
      name: 'Other',
      questions: [
        { id: 1121, name: 'Is it a good idea to use Math.random for keys?' },
        { id: 1122, name: 'What are the limitations of React?' },
        { id: 1123, name: 'What is a higher order component?' },
        { id: 1124, name: 'What are uncontrolled and controlled components?' },
        { id: 1125, name: 'React optimizations' },
      ],
    },
    {
      id: 1130,
      name: 'Coding task',
      questions: [{ id: 1131, name: 'Small react app: form, button, results list' }],
    },
    {
      id: 1140,
      name: 'Next.js',
      questions: [
        { id: 1141, name: 'What is Next.js, and how does it differ from traditional React applications?' },
        { id: 1142, name: 'Explain the concept of server-side rendering (SSR) in Next.js' },
        { id: 1143, name: 'How does Next.js handle client-side routing?' },
        { id: 1144, name: 'What are the benefits of using Next.js for building React applications?' },
        {
          id: 1145,
          name: 'What is the purpose of the getInitialProps function in Next.js? How is it different from using getStaticProps or getServerSideProps?',
        },
        { id: 1146, name: 'How does Next.js handle automatic code splitting, and why is it important?' },
        {
          id: 1147,
          name: 'What is the purpose of the Link component in Next.js, and how does it differ from traditional anchor (<a>) tags?',
        },
        { id: 1148, name: 'How can you configure routing in a Next.js application?' },
      ],
    },
    {
      id: 1150,
      name: 'Data Fetching',
      questions: [
        {
          id: 1151,
          name: 'Compare and contrast getStaticProps and getServerSideProps in terms of use cases and performance considerations',
        },
        {
          id: 1152,
          name: 'When would you choose to use getStaticPaths in Next.js, and how does it relate to dynamic routes?',
        },
      ],
    },
    {
      id: 1160,
      name: 'Advanced Topics',
      questions: [
        { id: 1161, name: 'Describe the purpose and use cases of API routes in Next.js' },
        { id: 1162, name: 'Explain the concept of middleware in Next.js and its role in the application lifecycle' },
        { id: 1163, name: 'How does Next.js handle authentication in applications?' },
      ],
    },
  ],
};
