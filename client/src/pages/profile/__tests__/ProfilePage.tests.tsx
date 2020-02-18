import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { NextRouter } from 'next/router';
import { Session } from 'components/withSession';
import { ProfilePage } from '../index';
// import { GeneralInfo } from '../../../../../common/models/profile';

jest.mock('next/config', () => () => ({}));
jest.mock('services/user', () => ({
    UserService: class UserService {
      getProfileInfo() {
        return jest.fn();
      }
    },
  }),
);

describe('ProfilePage', () => {
  const profile = {
    generalInfo: {
      name: 'Dzmitry Petrov',
      githubId: 'petrov',
      aboutMyself: 'Test',
      locationName: 'Minsk',
      locationId: '1',
      educationHistory: null,
      englishLevel: 'a2+',
    },
    permissionsSettings: {
      isProfileVisible: { all: true },
      isAboutVisible: { mentor: true, student: false, all: false },
      isEducationVisible: { mentor: true, student: false, all: false },
      isEnglishVisible: { student: false, all: false },
      isEmailVisible: { student: false, all: false },
      isTelegramVisible: { student: false, all: false },
      isSkypeVisible: { student: false, all: false },
      isPhoneVisible: { student: false, all: false },
      isContactsNotesVisible: { student: true, all: false },
      isLinkedInVisible: { mentor: true, student: false, all: false },
      isPublicFeedbackVisible: { mentor: true, student: true, all: false },
      isMentorStatsVisible: { mentor: true, student: true, all: false },
      isStudentStatsVisible: { student: false, all: false },
    },
    contacts: {
      phone: '+375292123456',
      email: 'petro@gmail.com',
      skype: 'petro:live',
      telegram: 'petro',
      notes: 'discord: @petro, instagram: @petro12',
    },
    isPermissionsSettingsChanged: true,
    isProfileSettingsChanged: true,
  };
  const session = {
    id: 2020,
    githubId: 'mikhama',
    isAdmin: true,
    isHirer: false,
    isActivist: false,
    roles: {
      1: 'mentor',
      2: 'student',
      11: 'mentor',
    },
    coursesRoles: {
      13: [
        'manager',
      ],
    },
  } as Session;
  const router = {
    query: {
      githubId: 'petrov',
    },
    asPath: '/#edit/',
  } as unknown as NextRouter;

  describe('Should render correctly', () => {
    it('if full info about profile is in the state', () => {
      const wrapper = shallow(
        <ProfilePage
          session={session}
          router={router}
        />,
      );
      wrapper.setState({ profile });
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });
});
