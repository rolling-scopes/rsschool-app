import React from 'react';
import { render } from '@testing-library/react';
import PreScreeningIviewCard from '../PreScreeningIviewCard';
import { StageInterviewDetailedFeedback } from '@common/models/profile';

describe('PreScreeningIviewCard', () => {
  const data = [
    {
      decision: 'yes',
      isGoodCandidate: true,
      courseName: 'rs-2018-q1',
      courseFullName: 'Rolling Scopes School 2018 Q1',
      score: 34,
      maxScore: 50,
      feedback: {
        comment: 'Not bad',
        english: 'a2',
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
      },
      date: '2018-12-01',
      version: 0,
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
      comment: 'Not bad',
      english: 'a2+',
      date: '2019-12-01',
      score: 34,
      maxScore: 50,
      version: 0,
      feedback: {
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
      },
      interviewer: {
        name: 'Alex Smirnov',
        githubId: 'alexs',
      },
    },
  ] as StageInterviewDetailedFeedback[];

  it('Should render correctly', () => {
    const { container } = render(<PreScreeningIviewCard data={data} />);
    expect(container).toMatchSnapshot();
  });
});
