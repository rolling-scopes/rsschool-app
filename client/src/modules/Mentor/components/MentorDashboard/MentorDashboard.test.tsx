import { render, screen } from '@testing-library/react';
import MentorDashboard from './MentorDashboard';
import { Course } from 'services/models';
import { CourseInfo, Session } from 'components/withSession';
import { INSTRUCTIONS_TEXT } from '../Instructions';
import { MentorDashboardProps } from 'pages/course/mentor/dashboard';
import { SessionContext } from 'modules/Course/contexts';

jest.mock('modules/Mentor/hooks/useMentorDashboard', () => ({
  useMentorDashboard: jest.fn().mockReturnValue([[], false]),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({ asPath: '/course/mentor/' })),
}));

const PROPS_MOCK: MentorDashboardProps = {
  course: {
    id: 400,
  } as Course,
  params: {},
  mentorId: 1000,
  studentsCount: 3,
};

describe('MentorDashboard', () => {
  it('should render instructions when mentor has no students for this course', async () => {
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
        <MentorDashboard {...PROPS_MOCK} studentsCount={0} />
      </SessionContext.Provider>,
    );

    const instructionsTitle = await screen.findByText(INSTRUCTIONS_TEXT.title);

    expect(instructionsTitle).toBeInTheDocument();
  });

  it('should render empty table when mentor has students for this course', async () => {
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
        <MentorDashboard {...PROPS_MOCK} />
      </SessionContext.Provider>,
    );

    const emptyTable = await screen.findByText(/No Data/i);

    expect(emptyTable).toBeInTheDocument();
  });
});
