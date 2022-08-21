import React from 'react';
import { render } from '@testing-library/react';
import { NextRouter } from 'next/router';
import { Session } from 'components/withSession';
import { ProfilePage } from '../pages/profile';

jest.mock('next/config', () => () => ({}));
jest.mock('api', () => ({
  ProfileApi: jest.fn(),
  UsersNotificationsApi: jest.fn(),
  NotificationsApi: jest.fn(),
  CoursesApi: jest.fn(),
  CoursesTasksApi: jest.fn(),
  StudentsScoreApi: jest.fn(),
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
const router = {
  query: {
    githubId: 'petrov',
  },
  asPath: '/#edit/',
} as unknown as NextRouter;

describe('ProfilePage', () => {
  describe('Should render correctly', () => {
    it('if full profile info is in the state', () => {
      const wrapper = render(<ProfilePage session={session} router={router} />);
      expect(wrapper.container).toMatchSnapshot();
    });
  });
});
