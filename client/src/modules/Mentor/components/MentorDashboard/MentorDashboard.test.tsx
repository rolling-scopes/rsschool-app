import { render, screen } from '@testing-library/react';
import { CourseInfo, Session } from '@client/components/withSession';
import { SessionContext } from '@client/modules/Course/contexts';
import { INSTRUCTIONS_TEXT } from '../Instructions';
import MentorDashboard from './MentorDashboard';
import { useMentorDashboard } from '@client/modules/Mentor/hooks/useMentorDashboard';

vi.mock('@client/modules/Mentor/hooks/useMentorDashboard');

vi.mock('next/router', () => ({
  useRouter: vi.fn().mockImplementation(() => ({ asPath: '/course/mentor/' })),
}));

describe('MentorDashboard', () => {
  it('renders instructions without students and the table with students', async () => {
    vi.mocked(useMentorDashboard).mockReturnValue([[], false, vi.fn()]);

    const dashboard = () => (
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
      </SessionContext.Provider>
    );
    const { rerender } = render(dashboard());

    const instructionsTitle = await screen.findByText(INSTRUCTIONS_TEXT.title);

    expect(instructionsTitle).toBeInTheDocument();
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

    vi.mocked(useMentorDashboard).mockReturnValue([mockData, false, vi.fn()]);

    rerender(dashboard());

    const emptyTable = await screen.findByText(/John Doe/i);

    expect(emptyTable).toBeInTheDocument();
  });
});
