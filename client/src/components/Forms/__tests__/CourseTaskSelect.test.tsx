import React from 'react';
import { render } from '@testing-library/react';

import { CourseTaskSelect } from '..';
import { CourseTaskDto } from 'api';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 1);

const fullData = [
  {
    id: 432,
    taskId: 644,
    name: 'Flex / Grid test',
    maxScore: 100,
    scoreWeight: 1,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/self-test.md',
    studentStartDate: '2022-02-06T13:44:00.000Z',
    studentEndDate: futureDate.toISOString(),
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 606,
    githubRepoName: 'clean-code-s1e1',
    sourceGithubRepoUrl: 'src',
    type: 'jstask',
    special: '',
  },
  {
    id: 431,
    taskId: 729,
    name: 'Drum Kit',
    maxScore: 100,
    scoreWeight: 1,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/js30/js30-1.md',
    studentStartDate: '2022-02-06T11:37:00.000Z',
    studentEndDate: futureDate.toISOString(),
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 606,
    githubRepoName: 'clean',
    sourceGithubRepoUrl: 'src',
    type: 'jstask',
    special: '',
  },
  {
    id: 978,
    taskId: 695,
    name: 'Chess S1E2. Cross-check',
    maxScore: 480,
    scoreWeight: 1,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md',
    studentStartDate: '2021-06-30T00:00:00.000Z',
    studentEndDate: '2021-07-19T23:59:00.000Z',
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 2084,
    githubRepoName: 'js',
    sourceGithubRepoUrl: 'src',
    type: 'jstask',
    special: '',
  },
  {
    id: 821,
    name: 'CV. Cross-Check',
    maxScore: 100,
    scoreWeight: 0.2,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md',
    studentStartDate: '2021-02-28T10:00:00.000Z',
    studentEndDate: '2021-03-08T23:59:00.000Z',
    checker: 'crossCheck',
    taskOwnerId: 2084,
    type: 'htmltask',
  },
] as CourseTaskDto[];

const onlyExpired = [
  {
    id: 978,
    name: 'Chess S1E2. Cross-check',
    maxScore: 480,
    scoreWeight: 1,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/chess/codejam-chess-part-two.md',
    studentStartDate: '2021-06-30T00:00:00.000Z',
    studentEndDate: '2021-07-19T23:59:00.000Z',
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 2084,
    githubRepoName: 'js',
    sourceGithubRepoUrl: 'src',
    type: 'jstask',
    special: '',
  },
  {
    id: 821,
    name: 'CV. Cross-Check',
    maxScore: 100,
    scoreWeight: 0.2,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md',
    studentStartDate: '2021-02-28T10:00:00.000Z',
    studentEndDate: '2021-03-08T23:59:00.000Z',
    checker: 'crossCheck',
    taskOwnerId: 2084,
    type: 'htmltask',
  },
] as CourseTaskDto[];

describe('CourseTaskSelect', () => {
  const { container: fullDataContainer } = render(
    <CourseTaskSelect data={fullData} groupBy="deadline"></CourseTaskSelect>,
  );
  const { container: expiredContainer } = render(
    <CourseTaskSelect data={onlyExpired} groupBy="deadline"></CourseTaskSelect>,
  );
  const { container: emptyContainer } = render(<CourseTaskSelect data={[]} groupBy="deadline"></CourseTaskSelect>);

  it('should render with both groups', () => {
    expect(fullDataContainer).toMatchSnapshot();
  });
  it('should render with one group', () => {
    expect(expiredContainer).toMatchSnapshot();
  });

  it('should render empty', () => {
    expect(emptyContainer).toMatchSnapshot();
  });
});
