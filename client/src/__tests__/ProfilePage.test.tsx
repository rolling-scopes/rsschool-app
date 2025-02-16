import { render } from '@testing-library/react';
import { SessionApi } from 'api';
import { Session } from 'components/withSession';
import { NextRouter, useRouter } from 'next/router';
import ProfilePage from '../pages/profile';

jest.mock('next/config', () => () => ({}));
jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: jest.fn(),
}));

jest.mock('api', () => ({
  ...jest.requireActual('api'),
  ProfileApi: jest.fn(),
  UsersNotificationsApi: jest.fn(),
  NotificationsApi: jest.fn(),
  CoursesApi: jest.fn(),
  CoursesTasksApi: jest.fn(),
  StudentsScoreApi: jest.fn(),
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

SessionApi.prototype.getSession = jest.fn().mockResolvedValue({ data: session });

const router = {
  query: {
    githubId: 'petrov',
  },
} as unknown as NextRouter;

describe('ProfilePage', () => {
  describe('Should render correctly', () => {
    it('if full profile info is in the state', () => {
      jest.mocked(useRouter).mockReturnValue(router);
      const { container } = render(<ProfilePage />);
      expect(container).toMatchSnapshot();
    });
  });
});
