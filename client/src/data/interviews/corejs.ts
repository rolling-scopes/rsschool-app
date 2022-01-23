import { InterviewTemplate, InputType } from './types';

export const corejsTemplate: InterviewTemplate = {
  name: 'CoreJS',
  examplesUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/interview-corejs.md',
  categories: [
    {
      id: 10,
      name: 'Basics',
      questions: [
        {
          id: 100,
          name: 'Knows "let vs const vs var"',
          type: InputType.Checkbox,
        },
        {
          id: 101,
          name: 'Understands Closure',
          type: InputType.Checkbox,
        },
        {
          id: 102,
          name: 'Understands Scope',
          type: InputType.Checkbox,
        },
        {
          id: 103,
          name: 'Understands Hoisting',
          type: InputType.Checkbox,
        },
        {
          id: 104,
          name: 'Knowledge of this / apply / call / bind',
          type: InputType.Input,
        },
        {
          id: 105,
          name: 'Knowledge of classes / inheritance',
          type: InputType.Input,
        },
      ],
    },
    {
      id: 11,
      name: 'DOM Events',
      questions: [
        {
          id: 110,
          name: 'Capturing',
          type: InputType.Checkbox,
        },
        {
          id: 111,
          name: 'Bubbling',
          type: InputType.Checkbox,
        },
        {
          id: 112,
          name: 'Event Delegation',
          type: InputType.Checkbox,
        },
        {
          id: 113,
          name: 'PreventDefault, stopPropagation, stopImmediatePropagation',
          type: InputType.Checkbox,
        },
        {
          id: 114,
          name: 'addEventListener, removeEventListener',
          type: InputType.Checkbox,
        },
      ],
    },
    {
      id: 12,
      name: 'Event Loop',
      questions: [
        {
          id: 120,
          name: 'Knows what is Event Loop',
          type: InputType.Checkbox,
        },
        {
          id: 121,
          name: 'How setTimeout(()=>alert("hello",0)); works',
          type: InputType.Checkbox,
        },
        {
          id: 122,
          name: 'Promises & Microtasks',
          type: InputType.Checkbox,
        },
      ],
    },
  ],
};
