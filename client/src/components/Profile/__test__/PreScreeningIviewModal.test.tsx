import React from 'react';
import { render } from '@testing-library/react';
import PreScreeningIviewModal from '../PreScreeningIviewModal';
import { StageInterviewDetailedFeedback } from 'common/models/profile';

describe('PreScreeningIviewModal', () => {
  it('Should render correctly', () => {
    const feedback = {
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
    } as StageInterviewDetailedFeedback;

    const { container } = render(<PreScreeningIviewModal feedback={feedback} isVisible={true} onHide={jest.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
