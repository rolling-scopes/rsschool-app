import React from 'react';
import { render } from '@testing-library/react';
import { MentorStatsCard } from '../MentorStatsCard';
import * as reactUse from 'react-use';

describe('MentorStatsCard', () => {
  const mentorStats = [
    {
      courseName: 'rs-2020-q1',
      courseLocationName: 'Minsk',
    },
    {
      courseName: 'rs-2018-q1',
      courseLocationName: 'Minsk',
      students: [
        {
          githubId: 'alex',
          name: 'Alex Petrov',
          isExpelled: false,
          totalScore: 3453,
          repoUrl: 'https://github.com/rolling-scopes-school/alex-RS2018Q1',
        },
        {
          githubId: 'vasya',
          name: 'Vasiliy Alexandrov',
          isExpelled: true,
          totalScore: 120,
          repoUrl: 'https://github.com/rolling-scopes-school/vasya-RS2018Q1',
        },
      ],
    },
  ];

  it('should render correctly', () => {
    jest.spyOn(reactUse, 'useAsync').mockReturnValue({ value: null, loading: false });

    const { container } = render(<MentorStatsCard githubId="test" data={mentorStats} />);
    expect(container).toMatchSnapshot();
  });
});
