import { InputType, InterviewTemplate } from './types';

export const corejs2Template: InterviewTemplate = {
  name: 'CoreJS2',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md',
  descriptionHtml: `
  During the interview, students can score up to 100 points. Each topic has its value in points.<br/>
  Please see the details below.
  <ul>
  <li>Functional Patterns - up to 10 points</li>
  <li>Prototypal Inheritance Basics - up to 15 points</li>
  <li>ECMAScript Classes - up to 10 points</li>
  <li>ECMAScript Data Types & Expressions - up to 10 points</li>
  <li>ECMAScript Advanced - up to 10 points</li>
  <li>Network requests - up to 10 points</li>
  <li>Page Lifecycle - up to 10 points</li>
  <li>Typescript - up to 10 points</li>
  <li>Testing (optional) - up to 10 points</li>
  </ul>
  <br/>
  `,
  categories: [
    {
      id: 2060,
      name: 'Functional Patterns',
      description: '10 points',
      questions: [
        { id: 2061, name: 'Immediately invoked functional expression (IIFE)' },
        { id: 2062, name: 'Callback (Function as argument)' },
        { id: 2063, name: 'Binding, binding one function twice' },
        { id: 2064, name: 'Know how to bind this scope to function' },
      ],
    },
    {
      id: 2080,
      name: 'Prototypal Inheritance Basics',
      description: '15 points',
      questions: [
        { id: 2081, name: '__proto__ property' },
        { id: 2082, name: 'Able to use [Object.create] and define __proto__ explicitly' },
        { id: 2083, name: 'prototype property' },
        { id: 2084, name: 'Understand dependency between function constructor prototype and instance __proto__' },
      ],
    },
    {
      id: 2090,
      name: 'ECMAScript Classes',
      description: '10 points',
      questions: [
        { id: 2091, name: 'Class declaration' },
        { id: 2092, name: 'What does super() do and where we have to use it?' },
      ],
    },
    {
      id: 2100,
      name: 'ECMAScript Data Types & Expressions',
      description: '10 points',
      questions: [
        { id: 2101, name: 'Set/Map data types' },
        { id: 2102, name: 'WeakSet/WeakMap data types' },
      ],
    },
    {
      id: 2110,
      name: 'ECMAScript Advanced',
      description: '10 points',
      questions: [
        { id: 2115, name: 'event loop' },
        { id: 2111, name: 'Promises' },
        { id: 2112, name: 'Promise Chaining' },
        { id: 2113, name: 'Promise static methods' },
        { id: 2114, name: 'Be able to handle errors in promises' },
        { id: 2116, name: 'async/await' },
      ],
    },
    {
      id: 2120,
      name: 'Network requests',
      description: '5 points',
      questions: [
        { id: 2121, name: 'Fetch' },
        { id: 2122, name: 'XMLHTTPRequest (concept) (optional)' },
      ],
    },
    {
      id: 2130,
      name: 'Page Lifecycle',
      description: '10 points',
      questions: [
        { id: 2131, name: 'Parsing' },
        { id: 2132, name: 'Reflow' },
        { id: 2133, name: 'Repaint' },
      ],
    },
    {
      id: 2150,
      name: 'Typescript',
      description: '10 points',
      questions: [
        { id: 2151, name: 'basic types' },
        { id: 2152, name: 'enums' },
        { id: 2153, name: 'type / interface, differences between them' },
        { id: 2154, name: 'function types' },
        { id: 2155, name: 'generic types (concept)' },
        { id: 2156, name: 'utitily types (optional)' },
        { id: 2157, name: 'typeguards (optional)' },
      ],
    },
    {
      id: 2160,
      name: 'Testing (optional)',
      description: '10 points',
      questions: [
        { id: 2161, name: 'Testing Types' },
        { id: 2162, name: 'Test Pyramid' },
      ],
    },
    {
      id: 2170,
      name: 'Software Development Methodologies',
      description: '10 points',
      questions: [
        { id: 2171, name: 'Agile' },
        { id: 2172, name: 'Scrum / Kanban / Waterfall' },
      ],
    },
    {
      id: 2180,
      name: 'Coding Task',
      description: '20 points',
      questions: [{ id: 2181, name: 'Coding Task', type: InputType.Input }],
    },
  ],
};
