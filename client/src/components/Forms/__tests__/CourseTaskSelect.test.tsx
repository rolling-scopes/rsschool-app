/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { Form } from 'antd';
import { fireEvent, render } from '@testing-library/react';

import { CourseTaskSelect } from '..';
import { CourseTaskDto } from 'api';

const tomorrowDate = new Date();
const dayAfterTomorrowDate = new Date();
const afterDayAfterTomorrowDate = new Date();

tomorrowDate.setDate(tomorrowDate.getDate() + 1);
dayAfterTomorrowDate.setDate(dayAfterTomorrowDate.getDate() + 2);
afterDayAfterTomorrowDate.setDate(afterDayAfterTomorrowDate.getDate() + 3);

const ActiveCodewarsData: CourseTaskDto[] = [
  {
    id: 451,
    taskId: 704,
    type: 'codewars',
    name: 'Codewars Algorithms-2',
    studentStartDate: '2022-09-12T23:59:00.000Z',
    studentEndDate: tomorrowDate.toISOString(),
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/codewars/algorithms-2.md',
    checker: 'auto-test',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: null,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
  {
    id: 764,
    taskId: 592,
    type: 'codewars',
    name: 'Codewars #0',
    studentStartDate: '2022-09-14T23:59:00.000Z',
    studentEndDate: tomorrowDate.toISOString(),
    maxScore: 15,
    scoreWeight: 1,
    descriptionUrl: 'https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/codewars',
    checker: 'auto-test',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: null,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
];

const ActiveTestData: CourseTaskDto[] = [
  {
    id: 440,
    taskId: 720,
    type: 'selfeducation',
    name: 'React. Testing',
    studentStartDate: '2022-09-12T23:59:00.000Z',
    studentEndDate: tomorrowDate.toISOString(),
    maxScore: 100,
    scoreWeight: 0.1,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/react/react-testing.md',
    checker: 'auto-test',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: null,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
  {
    id: 442,
    taskId: 727,
    type: 'selfeducation',
    name: 'Test Algorithms & Data structures',
    studentStartDate: '2022-09-15T23:59:00.000Z',
    studentEndDate: tomorrowDate.toISOString(),
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://www.youtube.com/playlist?list=PLP-a1IHLCS7PqDf08LFIYCiTYY1CtoAkt',
    checker: 'auto-test',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: null,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
];

const UnknownTaskData: CourseTaskDto[] = [
  {
    id: 846,
    taskId: 625,
    type: 'jstask',
    name: 'Virtual-piano',
    studentStartDate: '2021-03-16T04:32:00.000Z',
    studentEndDate: '2021-03-23T01:59:00.000Z',
    maxScore: 50,
    scoreWeight: 1,
    descriptionUrl: 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/js-projects/virtual-piano',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: 4,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
  {
    id: 853,
    taskId: 630,
    type: 'htmltask',
    name: 'Clean-code-s1e1',
    studentStartDate: '2021-03-23T01:59:00.000Z',
    studentEndDate: '2021-04-06T23:59:00.000Z',
    maxScore: 45,
    scoreWeight: 1,
    descriptionUrl: 'https://rolling-scopes-school.github.io/stage0/#/stage1/tasks/clean-code/clean-code-s1e1',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: null,
    pairsCount: 4,
    submitText: null,
    taskOwner: null,
    validations: null,
  },
];

const FutureTaskData: CourseTaskDto[] = [
  {
    id: 438,
    taskId: 576,
    type: 'jstask',
    name: 'Shelter Cross-check',
    studentStartDate: tomorrowDate.toISOString(),
    studentEndDate: dayAfterTomorrowDate.toISOString(),
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/tree/master/tasks/markups/level-2/shelter',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: afterDayAfterTomorrowDate.toISOString(),
    pairsCount: null,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
  {
    id: 441,
    taskId: 493,
    type: 'jstask',
    name: 'Virtual Keyboard Cross-Check',
    studentStartDate: tomorrowDate.toISOString(),
    studentEndDate: dayAfterTomorrowDate.toISOString(),
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://rolling-scopes-school.github.io/checklist/',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: afterDayAfterTomorrowDate.toISOString(),
    pairsCount: 4,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
] as unknown as CourseTaskDto[];

const ReviewTaskData: CourseTaskDto[] = [
  {
    id: 434,
    taskId: 680,
    type: 'jstask',
    name: 'Async Race',
    studentStartDate: '2022-09-05T23:59:00.000Z',
    studentEndDate: '2022-09-12T23:59:00.000Z',
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/async-race.md',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: tomorrowDate.toISOString(),
    pairsCount: 2,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
  {
    id: 450,
    taskId: 452,
    type: 'htmltask',
    name: 'Fancy-weather Cross-Check',
    studentStartDate: '2022-09-14T16:48:00.000Z',
    studentEndDate: '2022-09-16T16:48:00.000Z',
    maxScore: 100,
    scoreWeight: 1,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/fancy-weather.md',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: dayAfterTomorrowDate.toISOString(),
    pairsCount: 2,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
];

const expiredTaskData: CourseTaskDto[] = [
  {
    id: 821,
    taskId: 593,
    type: 'htmltask',
    name: 'CV. Cross-Check',
    studentStartDate: '2021-02-28T23:59:00.000Z',
    studentEndDate: '2021-03-08T23:59:00.000Z',
    maxScore: 100,
    scoreWeight: 0.2,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: '2021-03-11T23:59:00.000Z',
    pairsCount: 4,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
  {
    id: 841,
    taskId: 594,
    type: 'htmltask',
    name: 'Wildlife',
    studentStartDate: '2021-02-28T23:59:00.000Z',
    studentEndDate: '2021-03-15T23:59:00.000Z',
    maxScore: 50,
    scoreWeight: 0.5,
    descriptionUrl: 'https://rolling-scopes-school.github.io/stage0/#/stage0/tasks/wildlife',
    checker: 'crossCheck',
    crossCheckStatus: 'initial',
    crossCheckEndDate: '2021-05-06T23:59:00.000Z',
    pairsCount: 4,
    submitText: null,
    taskOwner: null,
    validations: {},
  },
];

describe('CourseTaskSelect', () => {
  describe('Should render correctly', () => {
    it('if groupBy is default', () => {
      const { container, baseElement } = render(
        <Form>
          <CourseTaskSelect
            data={[...UnknownTaskData, ...FutureTaskData, ...ReviewTaskData, ...expiredTaskData]}
            groupBy="default"
          ></CourseTaskSelect>
        </Form>,
      );

      const select = container.querySelector('.ant-select-selector');

      if (select) {
        fireEvent.mouseDown(select);
      }

      expect(baseElement).toMatchSnapshot();
    });

    it('if groupBy is deadline', () => {
      const { container, baseElement } = render(
        <Form>
          <CourseTaskSelect data={[...ActiveCodewarsData, ...ActiveTestData]} groupBy="deadline"></CourseTaskSelect>,
        </Form>,
      );

      const select = container.querySelector('.ant-select-selector');

      if (select) {
        fireEvent.mouseDown(select);
      }

      expect(baseElement).toMatchSnapshot();
    });

    it('if groupBy is cross-check deadline', () => {
      const { container, baseElement } = render(
        <Form>
          <CourseTaskSelect
            data={[...UnknownTaskData, ...FutureTaskData, ...ReviewTaskData, ...expiredTaskData]}
            groupBy="crossCheckDeadline"
          ></CourseTaskSelect>
        </Form>,
      );

      const select = container.querySelector('.ant-select-selector');

      if (select) {
        fireEvent.mouseDown(select);
      }

      expect(baseElement).toMatchSnapshot();
    });
  });
});
