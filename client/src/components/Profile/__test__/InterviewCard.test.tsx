import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InterviewCard from '../InterviewCard';
import { CoreJsInterviewFeedback, StageInterviewDetailedFeedback } from '@common/models/profile';
import { getStudentCoreJSInterviews } from '@client/utils/profilePageUtils';

describe('InterviewCard', () => {
  it('renders Empty when no data is provided', () => {
    render(<InterviewCard />);
    expect(screen.getByText(/No Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Interviews/i)).toBeInTheDocument();
  });

  it('renders Empty when review lists are empty', () => {
    render(<InterviewCard prescreeningInterview={[]} coreJsInterview={getStudentCoreJSInterviews([])} />);
    expect(screen.getByText(/No Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Interviews/i)).toBeInTheDocument();
  });

  it('renders Pre-Screening interviews and opens modal on expand', async () => {
    const data: StageInterviewDetailedFeedback[] = [
      {
        decision: 'yes',
        isGoodCandidate: true,
        courseName: 'rs-2020-q1',
        courseFullName: 'Rolling Scopes School 2020 Q1',
        score: 34,
        maxScore: 50,
        date: '2020-05-17',
        version: 0,
        interviewer: { name: 'Inter Viewer', githubId: 'interviewer' },
        feedback: {
          comment: 'Legacy feedback',
          english: 'b1',
          programmingTask: { task: 'FizzBuzz', codeWritingLevel: 3, resolved: 1, comment: 'ok' },
          skills: { htmlCss: 3, common: 3, dataStructures: 3 },
        },
      },
    ];

    render(<InterviewCard prescreeningInterview={data} />);

    expect(screen.getByText('rs-2020-q1')).toBeInTheDocument();
    expect(screen.getByText('Pre-Screening Interview')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('3.40')).toBeInTheDocument();
    expect(screen.getByText('Date: 2020-05-17')).toBeInTheDocument();

    const expandButton = screen.getByTestId('expand-button');
    expect(expandButton).toBeInTheDocument();
    await userEvent.click(expandButton);

    expect(
      await screen.findByText(/Rolling Scopes School 2020 Q1 Pre-Screening Interview Feedback/),
    ).toBeInTheDocument();
  });

  it('renders CoreJS interviews and opens modal on expand', async () => {
    const coreJsData: CoreJsInterviewFeedback[] = [
      {
        courseName: 'JS Course',
        courseFullName: 'JS Course 2021',
        locationName: 'EU',
        interviews: [
          {
            name: 'CoreJS Interview A',
            score: 42,
            comment: 'Great student',
            answers: [
              { questionId: 'q1', questionText: 'Q1', answer: true },
              { questionId: 'q2', questionText: 'Q2', answer: false },
            ],
            interviewer: { name: 'Alice', githubId: 'alice' },
            interviewDate: '2021-06-01',
          },
        ],
      },
    ];

    render(<InterviewCard coreJsInterview={coreJsData} />);

    expect(screen.getByText(/JS Course/i)).toBeInTheDocument();
    expect(screen.getByText('CoreJS Interview A')).toBeInTheDocument();
    expect(screen.getByText(/Score:/i)).toBeInTheDocument();
    expect(screen.getByText('Date: 2021-06-01')).toBeInTheDocument();

    const expandButton = screen.getByTestId('expand-button');
    expect(expandButton).toBeInTheDocument();
    await userEvent.click(expandButton);

    expect(await screen.findByText(/JS Course 2021 CoreJS Interview Feedback/)).toBeInTheDocument();
  });
});
