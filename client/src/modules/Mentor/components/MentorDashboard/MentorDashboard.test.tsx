import { render, screen } from '@testing-library/react';
import MentorDashboard from './MentorDashboard';
import { Course, CoursePageProps } from 'services/models';
import { CourseInfo, Session } from 'components/withSession';
import { useMentorStudentsCount } from 'modules/Mentor/hooks/useMentorStudentsCount';
import { INSTRUCTIONS_TEXT } from '../Instructions';

jest.mock('modules/Mentor/hooks/useMentorStudentsCount');
jest.mock('modules/Mentor/hooks/useMentorDashboard', () => ({
  useMentorDashboard: jest.fn().mockReturnValue([[], false]),
}));
jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(() => ({ asPath: '/course/mentor/' })),
}));

const PROPS_MOCK: CoursePageProps = {
  session: {
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
  } as Session,
  course: {
    id: 400,
  } as Course,
  params: {},
};

describe('MentorDashboard', () => {
  const useMentorStudentsCountMock = useMentorStudentsCount as jest.MockedFunction<typeof useMentorStudentsCount>;

  it('should render instructions when mentor has not students for this course', () => {
    useMentorStudentsCountMock.mockReturnValueOnce([undefined, false]);
    render(<MentorDashboard {...PROPS_MOCK} />);

    const instructionsTitle = screen.getByText(INSTRUCTIONS_TEXT.title);

    expect(instructionsTitle).toBeInTheDocument();
  });

  it('should render empty table when mentor has students for this course', () => {
    useMentorStudentsCountMock.mockReturnValueOnce([3, false]);
    render(<MentorDashboard {...PROPS_MOCK} />);

    const emptyTable = screen.getByText(/No Data/i);

    expect(emptyTable).toBeInTheDocument();
  });
});
