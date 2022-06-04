import React from 'react';
import { render } from '@testing-library/react';
import MentorStatsModal from '../MentorStatsModal';

describe('MentorStatsModal', () => {
  it('Should render correctly', () => {
    const output = render(
      <MentorStatsModal
        stats={{
          courseLocationName: 'Minsk',
          courseName: 'RS 2018 Q1',
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
            },
          ],
        }}
        isVisible={true}
        onHide={jest.fn()}
      />,
    );
    expect(output.container).toMatchSnapshot();
  });
});
