import { render, screen } from '@testing-library/react';
import { CourseInfo, Session } from 'components/withSession';
import { SessionContext } from 'modules/Course/contexts';
import { INSTRUCTIONS_TEXT } from '../Instructions';
import MentorDashboard from './MentorDashboard';
import { useMentorDashboard } from 'modules/Mentor/hooks/useMentorDashboard';

jest.mock('modules/Mentor/hooks/useMentorDashboard');

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({ asPath: '/course/mentor/' })),
}));

describe('MentorDashboard', () => {
  it('should render instructions when mentor has no students for this course', async () => {
    jest.mocked(useMentorDashboard).mockReturnValue([[], false, jest.fn()]);

    render(
      <SessionContext.Provider
        value={
          {
            id: 1,
            isActivist: false,
            isAdmin: true,
            isHirer: false,
            githubId: 'github-id',
            courses: {
              '400': {
                mentorId: 1,
                roles: ['mentor'],
              } as CourseInfo,
            },
          } as Session
        }
      >
        <MentorDashboard />
      </SessionContext.Provider>,
    );

    const instructionsTitle = await screen.findByText(INSTRUCTIONS_TEXT.title);

    expect(instructionsTitle).toBeInTheDocument();
  });

  it('should render table when mentor has students for this course', async () => {
    const mockData = [
      {
        courseTaskId: 1,
        endDate: new Date('2025-01-01').toISOString(),
        maxScore: 100,
        studentName: 'John Doe',
        taskName: 'Task 1',
        studentGithubId: '',
        taskDescriptionUrl: '',
        resultScore: null,
        solutionUrl: '',
        status: 'in-review',
      } as const,
    ];

    jest.mocked(useMentorDashboard).mockReturnValue([mockData, false, jest.fn()]);

    render(
      <SessionContext.Provider
        value={
          {
            id: 1,
            isActivist: false,
            isAdmin: true,
            isHirer: false,
            githubId: 'github-id',
            courses: {
              '400': {
                mentorId: 1,
                roles: ['mentor'],
              } as CourseInfo,
            },
          } as Session
        }
      >
        <MentorDashboard />
      </SessionContext.Provider>,
    );

    const emptyTable = await screen.findByText(/John Doe/i);

    expect(emptyTable).toBeInTheDocument();
  });
});
