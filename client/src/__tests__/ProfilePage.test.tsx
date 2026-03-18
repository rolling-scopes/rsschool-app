import { Session } from '@client/components/withSession';
import ProfilePage from '@client/pages/profile';
import { render } from '@testing-library/react';
import { SessionApi } from '@client/api';
import { NextRouter, useRouter } from 'next/router';

vi.mock('next/config', () => () => ({}));
vi.mock('next/router', async () => ({
  ...(await vi.importActual('next/router')),
  useRouter: vi.fn(),
}));

vi.mock('@client/api', async () => ({
  ...(await vi.importActual('@client/api')),
  ProfileApi: vi.fn(),
  UsersNotificationsApi: vi.fn(),
  NotificationsApi: vi.fn(),
  CoursesApi: vi.fn(),
  CoursesTasksApi: vi.fn(),
  StudentsScoreApi: vi.fn(),
  UpdateUserDtoLanguagesEnum: {},
}));

const session = {
  id: 2020,
  githubId: 'mikhama',
  isAdmin: true,
  isHirer: false,
  isActivist: false,
  courses: {
    13: {
      roles: ['manager'],
    },
    1: {
      roles: ['mentor'],
    },
    2: {
      roles: ['student'],
    },
  },
} as Session;

SessionApi.prototype.getSession = vi.fn().mockResolvedValue({ data: session });

const router = {
  query: {
    githubId: 'petrov',
  },
} as unknown as NextRouter;

describe('ProfilePage', () => {
  describe('Should render correctly', () => {
    it('if full profile info is in the state', () => {
      vi.mocked(useRouter).mockReturnValue(router);
      const { container } = render(<ProfilePage />);
      expect(container).toMatchSnapshot();
    });
  });
});
