import React from 'react';
import { render } from '@testing-library/react';
import StudentStatsCard from '../StudentStatsCard';
import { StudentStats } from 'common/models/profile';

describe('', () => {
  const githubId = 'test';
  const data = [
    {
      courseId: 1,
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      isExpelled: false,
      expellingReason: '',
      isCourseCompleted: true,
      totalScore: 1201,
      rank: 32,
      mentor: {
        githubId: 'andrew123',
        name: 'Andrey Andreev',
      },
      tasks: [
        {
          maxScore: 130,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 120,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 110,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 90,
          comment: 'test',
        },
      ],
    },
    {
      courseId: 1,
      courseName: 'rs-2019-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2019 Q1',
      isExpelled: true,
      expellingReason: 'test',
      isCourseCompleted: false,
      totalScore: 101,
      rank: 32,
      mentor: {
        githubId: 'dimon12',
        name: 'Dima Testovich',
      },
      tasks: [
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 1',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 20,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 2',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: null,
          comment: null,
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 3',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: 10,
          comment: 'test',
        },
        {
          maxScore: 100,
          scoreWeight: 1,
          name: 'Task 4',
          descriptionUri: 'https://description.com',
          taskGithubPrUris: 'https://description.com',
          score: null,
          comment: null,
        },
      ],
    },
  ] as StudentStats[];

  it('should render correctly', () => {
    const output = render(<StudentStatsCard isProfileOwner={false} data={data} username={githubId} />);
    expect(output.container).toMatchSnapshot();
  });
});
