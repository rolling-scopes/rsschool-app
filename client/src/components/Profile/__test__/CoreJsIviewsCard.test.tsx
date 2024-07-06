import React from 'react';
import { act, render, screen } from '@testing-library/react';
import CoreJsIviewsCard, { CoreJsInterviewsData } from '../CoreJsIviewsCard';

describe('CoreJSIviewsCard', () => {
  const data = [
    {
      courseFullName: 'rs-2019',
      courseName: 'rs-2019',
      locationName: 'minsk',
      interviews: [
        {
          answers: [
            {
              answer: true,
              questionText: 'test',
              questionId: 'test1',
            },
            {
              answer: false,
              questionText: 'test',
              questionId: 'test2',
            },
          ],
          interviewer: {
            name: 'Dzmitry Petrov',
            githubId: 'dima',
          },
          comment: 'test',
          score: 4,
          name: 'CoreJS Interview',
        },
      ],
    },
  ] as CoreJsInterviewsData[];

  it('should render correctly', () => {
    const { container } = render(<CoreJsIviewsCard data={data} />);
    expect(container).toMatchSnapshot();
  });

  it('should show modal', async () => {
    render(<CoreJsIviewsCard data={data} />);

    const btn = await screen.findByTestId('profile-corejs-iview-button');

    act(() => {
      btn.click();
    });

    const modal = await screen.findByTestId('profile-corejs-iviews-modal-table');
    expect(modal).toBeInTheDocument();
  });
});
