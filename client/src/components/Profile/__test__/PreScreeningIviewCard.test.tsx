import React from 'react';
import { render } from '@testing-library/react';
import PreScreeningIviewCard from '../PreScreeningIviewCard';
import { StageInterviewDetailedFeedback } from 'common/models/profile';

describe('PreScreeningIviewCard', () => {
  const data = [
    {
      decision: 'yes',
      isGoodCandidate: true,
      courseName: 'rs-2018-q1',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      rating: 3.43,
      comment: 'Not bad',
      english: 'a2',
      date: '2018-12-01',
      programmingTask: {
        task: 'aaa === 3a',
        codeWritingLevel: 3,
        resolved: 2,
        comment: 'Not bad coder',
      },
      skills: {
        htmlCss: 3,
        common: 2,
        dataStructures: 4,
      },
      interviewer: {
        name: 'Dima Vasilyev',
        githubId: 'dva',
      },
    },
    {
      decision: 'yes',
      isGoodCandidate: true,
      courseName: 'rs-2019-q1',
      courseFullName: 'Rolling Scopes School 2019 Q1',
      rating: 4.23,
      comment: 'Not bad',
      english: 'a2+',
      date: '2019-12-01',
      programmingTask: {
        task: 'aaa === 3a',
        codeWritingLevel: 4,
        resolved: 1,
        comment: 'Not bad coder',
      },
      skills: {
        htmlCss: 3,
        common: 4,
        dataStructures: 3,
      },
      interviewer: {
        name: 'Alex Smirnov',
        githubId: 'alexs',
      },
    },
  ] as StageInterviewDetailedFeedback[];

  it('Should render correctly', () => {
    const output = render(<PreScreeningIviewCard data={data} />);
    expect(output.container).toMatchSnapshot();
  });
});
