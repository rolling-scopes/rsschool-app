import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { Select } from 'antd';

import { CourseTaskSelect } from '..';
import { CourseTask } from 'services/course';

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
    taskId: 593,
    name: 'CV. Cross-Check',
    maxScore: 100,
    scoreWeight: 0.2,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md',
    studentStartDate: '2021-02-28T10:00:00.000Z',
    studentEndDate: '2021-03-08T23:59:00.000Z',
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 2084,
    githubRepoName: 'cv',
    sourceGithubRepoUrl: 'src',
    type: 'htmltask',
    special: '',
  },
] as CourseTask[];

const onlyExpired = [
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
    taskId: 593,
    name: 'CV. Cross-Check',
    maxScore: 100,
    scoreWeight: 0.2,
    githubPrRequired: false,
    descriptionUrl: 'https://github.com/rolling-scopes-school/tasks/blob/master/tasks/cv/html-css.md',
    studentStartDate: '2021-02-28T10:00:00.000Z',
    studentEndDate: '2021-03-08T23:59:00.000Z',
    useJury: false,
    checker: 'crossCheck',
    taskOwnerId: 2084,
    githubRepoName: 'cv',
    sourceGithubRepoUrl: 'src',
    type: 'htmltask',
    special: '',
  },
] as CourseTask[];

describe('CourseTaskSelect', () => {
  const outputFull = shallow(<CourseTaskSelect data={fullData} groupBy="deadline"></CourseTaskSelect>);
  const outputOnlyExpired = shallow(<CourseTaskSelect data={onlyExpired} groupBy="deadline"></CourseTaskSelect>);
  const outputEmpty = shallow(<CourseTaskSelect data={[]} groupBy="deadline"></CourseTaskSelect>);

  it('should render with both groups', () => {
    expect(shallowToJson(outputFull)).toMatchSnapshot();
  });
  it('should render with one group', () => {
    expect(shallowToJson(outputOnlyExpired)).toMatchSnapshot();
  });

  it('should render empty', () => {
    expect(shallowToJson(outputEmpty)).toMatchSnapshot();
  });

  it('outputFull contains active option', () => {
    expect(
      outputFull.containsMatchingElement(
        <Select.Option key={fullData[0].id} value={fullData[0].id}>
          {fullData[0].name}
        </Select.Option>,
      ),
    ).toBe(true);
  });

  it('outputFull contains expired option', () => {
    expect(
      outputFull.containsMatchingElement(
        <Select.Option key={fullData[2].id} value={fullData[2].id}>
          {fullData[2].name}
        </Select.Option>,
      ),
    ).toBe(true);
  });

  it('outputOnlyExpired dont contain active option', () => {
    expect(
      outputOnlyExpired.containsMatchingElement(
        <Select.Option key={fullData[0].id} value={fullData[0].id}>
          {fullData[0].name}
        </Select.Option>,
      ),
    ).toBe(false);
  });

  it('outputOnlyExpired contains expired option', () => {
    expect(
      outputOnlyExpired.containsMatchingElement(
        <Select.Option key={fullData[2].id} value={fullData[2].id}>
          {fullData[2].name}
        </Select.Option>,
      ),
    ).toBe(true);
  });
});
