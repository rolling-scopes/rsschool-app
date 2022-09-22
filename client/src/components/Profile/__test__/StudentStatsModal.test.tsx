import React from 'react';
import { render } from '@testing-library/react';
import StudentStatsModal from '../StudentStatsModal';
import { StudentStats } from 'common/models/profile';

describe('StudentStatsModal', () => {
  it('Should render correctly', () => {
    const stats: StudentStats = {
      courseId: 1,
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      isExpelled: false,
      isSelfExpelled: false,
      expellingReason: '',
      isCourseCompleted: true,
      totalScore: 1201,
      certificateId: 'asd',
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
    };

    const { container } = render(<StudentStatsModal stats={stats} isVisible={true} onHide={jest.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
