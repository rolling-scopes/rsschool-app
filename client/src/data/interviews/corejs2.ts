import { InterviewTemplate } from './types';

export const corejs2Template: InterviewTemplate = {
  name: 'CoreJS2',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md',
  descriptionHtml: `
  During the interview, students can score up to 100 points. Each topic has its value in points.<br/>
  Please see the details below.
  <ul>
  <li>Objects Built-in methods - up to 5 points</li>
  <li>Objects props - up to 5 points</li>
  <li>Functional Scope - up to 10 points</li>
  <li>Advanced Functions - up to 15 points</li>
  <li>Functional Patterns - up to 10 points</li>
  <li>Closures Advanced - up to 15 points</li>
  <li>Prototypal Inheritance Basics - up to 10 points</li>
  <li>ECMAScript Classes - up to 5 points</li>
  <li>ECMAScript Intermediate - up to 10 points</li>
  <li>ECMAScript Data Types & Expressions - up to 5 points</li>
  <li>ECMAScript Advanced - up to 10 points</li>
  <li>Network requests - up to 10 points</li>
  <li>Page Lifecycle - up to 5 points</li>
  <li>Web Storage API & cookies - up to 5 points</li>
  <li>Typescript - up to 10 points</li>
  </ul>
  <br/>
  `,
  categories: [
    {
      id: 2010,
      name: 'Objects Built-in methods',
      description: '5 points',
      questions: [
        { id: 2011, name: 'Know static Object methods' },
        { id: 2012, name: 'Property flags & descriptors (student is able to set property via Object.defineProperty)' },
      ],
    },
    {
      id: 2020,
      name: 'Objects props',
      description: '5 points',
      questions: [
        { id: 2021, name: 'Object computed props' },
        { id: 2022, name: 'Be able to loop through Object keys' },
      ],
    },
    {
      id: 2030,
      name: 'Functional Scope',
      description: '10 points',
      questions: [
        { id: 2031, name: 'Know global scope and functional scope' },
        { id: 2032, name: 'Know variables visibility areas' },
        { id: 2033, name: 'Understand nested scopes and able work with them' },
      ],
    },
    {
      id: 2040,
      name: 'Advanced Functions',
      description: '15 points',
      questions: [
        { id: 2041, name: 'this scope' },
        { id: 2042, name: 'Reference Type & losing this' },
        { id: 2043, name: 'Be able to replace this scope' },
        { id: 2044, name: 'Be able to use call and apply Function built-in methods' },
      ],
    },
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
      id: 2070,
      name: 'Closures Advanced',
      description: '15 points',
      questions: [
        { id: 2071, name: 'Context (lexical environment)' },
        { id: 2072, name: 'Be able to explain difference between scope and context' },
        { id: 2073, name: 'Understand lexical environment traversing mechanism' },
        { id: 2074, name: 'Inner/outer lexical environment' },
      ],
    },
    {
      id: 2080,
      name: 'Prototypal Inheritance Basics',
      description: '10 points',
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
      description: '5 points',
      questions: [
        { id: 2091, name: 'Class declaration' },
        { id: 2092, name: 'What does super() do and where we have to use it?' },
      ],
    },
    {
      id: 2050,
      name: 'ECMAScript Intermediate',
      description: '10 points',
      questions: [
        { id: 2051, name: 'Function default parameters' },
        { id: 2052, name: 'Know how to use spread operator for Function arguments' },
        { id: 2053, name: 'Spread operator for Array' },
        {
          id: 2054,
          name: 'Understand and able to use spread operator for Array concatenation Destructuring assignment',
        },
        { id: 2055, name: 'Be able to discover destructuring assignment concept' },
        { id: 2056, name: 'String templates' },
      ],
    },
    {
      id: 2100,
      name: 'ECMAScript Data Types & Expressions',
      description: '5 points',
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
      description: '5 points',
      questions: [
        { id: 2131, name: 'Parsing' },
        { id: 2132, name: 'Reflow' },
        { id: 2133, name: 'Repaint' },
      ],
    },
    {
      id: 2140,
      name: 'Web Storage API & cookies',
      description: '5 points',
      questions: [{ id: 2141, name: 'Difference between localStorage, sessionStorage, session and cookies' }],
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
  ],
};
