import { InterviewTemplate } from './types';

export const reactTemplate: InterviewTemplate = {
  name: 'React interview',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/react/questions.md',
  descriptionHtml: `
    During the interview, students can score up to 10 points. Each block of questions is rated 0.5 points.<br/>
    `,
  categories: [
    {
      id: 1000,
      name: 'Core Concepts & JSX',
      questions: [
        { id: 1001, name: 'JSX syntax and how it compiles' },
        { id: 1002, name: 'React.createElement and virtual DOM basics' },
        { id: 1003, name: 'Differences between className and class' },
        { id: 1004, name: 'Embedding expressions' },
        { id: 1005, name: 'Conditional rendering (&&, ternary)' },
      ],
    },
    {
      id: 1010,
      name: 'Components',
      questions: [
        { id: 1011, name: 'Functional vs class components' },
        { id: 1012, name: 'Props and defaultProps' },
        { id: 1013, name: "Prop 'children'" },
        { id: 1014, name: 'Component composition' },
        { id: 1015, name: 'Component state' },
        { id: 1016, name: 'Manipulating DOM directly using Refs' },
      ],
    },
    {
      id: 1020,
      name: 'Hooks',
      questions: [
        { id: 1021, name: 'useState' },
        { id: 1022, name: 'useRef' },
        { id: 1023, name: 'useMemo' },
        { id: 1024, name: 'useCallback' },
        { id: 1025, name: 'useEffect basics' },
        { id: 1026, name: 'Rule of hooks' },
      ],
    },
    {
      id: 1030,
      name: 'Lifecycle Methods & Effects',
      questions: [
        { id: 1031, name: 'Lifecycle in class vs functional components' },
        { id: 1032, name: 'Cleanup functions in useEffect' },
        { id: 1033, name: 'Dependency array pitfalls' },
      ],
    },
    {
      id: 1040,
      name: 'Event Handling and Forms',
      questions: [
        { id: 1041, name: 'Event binding in class components [legacy]' },
        { id: 1042, name: 'Controlled vs uncontrolled components' },
        { id: 1043, name: 'Preventing default and handling submission' },
        { id: 1044, name: 'useActionState' },
      ],
    },
    {
      id: 1050,
      name: 'Lifting State, Data Flow',
      questions: [
        { id: 1051, name: 'Lifting state up, Props drilling' },
        { id: 1052, name: 'Passing values' },
      ],
    },
    {
      id: 1060,
      name: 'Lists, Keys, and Reconciliation',
      questions: [
        { id: 1061, name: 'Rendering lists with .map, the role and rules of key, avoiding unstable keys' },
        { id: 1062, name: 'Reconciliation algorithm (VDOM diffing)' },
      ],
    },
    {
      id: 1070,
      name: 'Styling in React',
      questions: [
        { id: 1071, name: 'Inline styles, CSS modules' },
        { id: 1072, name: 'Styled Components' },
      ],
    },
    {
      id: 1080,
      name: 'Testing in React',
      questions: [
        { id: 1081, name: 'Testing component logic with RTL' },
        { id: 1082, name: 'Queries in RTL' },
        { id: 1083, name: 'Firing events' },
        { id: 1084, name: 'Testing Frameworks' },
      ],
    },
    {
      id: 1090,
      name: 'Advanced Hooks & Patterns',
      questions: [
        { id: 1091, name: 'useReducer for complex state' },
        { id: 1092, name: 'Lazy initialization in hooks' },
        { id: 1093, name: 'Writing custom hooks' },
        { id: 1094, name: 'Dependency memoization (useCallback, useMemo)' },
        { id: 1095, name: 'useLayoutEffect' },
        { id: 1096, name: 'use' },
      ],
    },
    {
      id: 1100,
      name: 'Advanced Rendering Patterns',
      questions: [{ id: 1101, name: 'React Portal' }],
    },
    {
      id: 1110,
      name: 'Context API',
      questions: [
        { id: 1111, name: 'Creating and consuming contexts' },
        { id: 1112, name: 'Providing default values' },
        { id: 1113, name: 'Avoiding unnecessary re-renders' },
        { id: 1114, name: 'Usecases' },
      ],
    },
    {
      id: 1120,
      name: 'Performance Optimization',
      questions: [
        { id: 1121, name: 'State collocation' },
        { id: 1122, name: 'Memoization (React.memo, useMemo, useCallback)' },
        { id: 1123, name: 'React.lazy' },
        { id: 1124, name: 'Avoiding prop drilling' },
        { id: 1125, name: 'Profiling with React DevTools' },
        { id: 1126, name: 'Avoiding unnecessary re-renders in large trees' },
        { id: 1127, name: 'Deoptimization using flushSync' },
      ],
    },
    {
      id: 1130,
      name: 'React Router (v7+)',
      questions: [
        { id: 1131, name: 'Declarative mode. Routing' },
        { id: 1132, name: 'Data mode. Routing using createBrowserRouter' },
        { id: 1133, name: 'Nested routes' },
        { id: 1134, name: 'Dynamic params' },
        { id: 1135, name: 'Redirects and navigation' },
        { id: 1136, name: 'Programmatic navigation (useNavigate)' },
        { id: 1137, name: 'Outlet' },
      ],
    },
    {
      id: 1140,
      name: 'Error Handling',
      questions: [
        { id: 1141, name: 'Error boundaries (class component pattern)' },
        { id: 1142, name: 'Async errors in useEffect' },
        { id: 1143, name: 'Fallback UI handling with Suspense and boundaries' },
      ],
    },
    {
      id: 1150,
      name: 'State Management Libraries',
      questions: [
        { id: 1151, name: 'Redux (store, reducers, actions)' },
        { id: 1152, name: 'Redux Middleware' },
        { id: 1153, name: 'Redux Toolkit' },
        { id: 1154, name: 'Zustand / Jotai / MobX' },
        { id: 1155, name: 'React Query (server-state)' },
        { id: 1156, name: 'Redux Toolkt Query' },
      ],
    },
    {
      id: 1160,
      name: 'SSR & Meta Frameworks',
      questions: [
        { id: 1161, name: 'Server-side rendering and Server-side generation' },
        { id: 1162, name: 'Next.JS. Pages router, getStaticProps, getStaticPaths, getServerSideProps' },
        { id: 1163, name: 'Next.JS. App router. Route Handlers and Middleware in App router' },
        { id: 1164, name: 'Next.JS. Fetching data' },
        { id: 1165, name: 'Next.JS. Client/server separation in React Server Components' },
        { id: 1166, name: 'React Router Framework. Routing' },
        { id: 1167, name: 'React Router Framework. Client, Server and Static Data Loading' },
        { id: 1168, name: 'TanStack Start' },
        { id: 1169, name: 'Waku' },
      ],
    },
    {
      id: 1170,
      name: 'Concurrent Features & Suspense',
      questions: [
        { id: 1171, name: 'Suspense for lazy-loading' },
        { id: 1172, name: 'Concurrent rendering in React 18' },
        { id: 1173, name: 'useTransition, startTransition' },
        { id: 1174, name: 'useDeferredValue' },
      ],
    },
    {
      id: 1180,
      name: 'Build Process / CI/CD / Tooling',
      questions: [
        { id: 1181, name: 'CRA vs Vite vs custom Webpack' },
        { id: 1182, name: 'Linting, formatting, pre-commit hooks' },
        { id: 1183, name: 'Dockerizing React apps, CI/CD pipelines' },
      ],
    },
    {
      id: 1190,
      name: 'Coding task',
      questions: [{ id: 1191, name: 'Small react app: form, button, results list' }],
    },
  ],
};
