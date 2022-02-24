import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import { NextRouter } from 'next/router';
import { Session } from 'components/withSession';
import { ProfilePage } from '../pages/profile';

jest.mock('next/config', () => () => ({}));
jest.mock('api', () => ({
  ProfileApi: jest.fn(),
  CoursesApi: jest.fn(),
}));

const profile = {
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
  generalInfo: {
    aboutMyself: 'Test',
    educationHistory: [
      {
        graduationYear: '2019',
        faculty: 'TT',
        university: 'Test',
      },
    ],
    englishLevel: 'a2+',
    location: {
      countryName: 'Belarus',
      cityName: 'Minsk',
    },
  },
  contacts: {},
  mentorStats: [{}],
  studentStats: [
    {
      courseFullName: 'test',
      courseName: 'test',
      locationName: 'Minsk',
      tasks: [
        {
          interviewFormAnswers: {},
        },
      ],
    },
  ],
  publicFeedback: [{}],
  stageInterviewFeedback: [{}],
};
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
const state = {
  profile,
  isInitialPermissionsSettingsChanged: false,
  isInitialProfileSettingsChanged: false,
};

describe('ProfilePage', () => {
  describe('Should render correctly', () => {
    it('if full profile info is in the state', () => {
      const wrapper = shallow(<ProfilePage session={session} router={router} />);
      wrapper.setState(state);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  const wrapper = shallow(<ProfilePage session={session} router={router} />);
  const instance: any = wrapper.instance();
  describe('onPermissionsSettingsChange', () => {
    describe('Should set state correctly', () => {
      it('if permissions for student role were changed', async () => {
        const event = {
          target: {
            checked: true,
          },
        };
        const changedPermissionsSettings = {
          permissionName: 'isEmailVisible',
          role: 'student',
        };
        wrapper.setState(state);
        await instance.onPermissionsSettingsChange(event, changedPermissionsSettings);
        expect((wrapper.state() as any).profile.permissionsSettings.isEmailVisible).toEqual({
          student: true,
          all: false,
        });
        expect((wrapper.state() as any).isInitialPermissionsSettingsChanged).toBe(true);
      });
      it('if permissions for mentor role were changed', async () => {
        const event = {
          target: {
            checked: false,
          },
        };
        const changedPermissionsSettings = {
          permissionName: 'isLinkedInVisible',
          role: 'mentor',
        };
        wrapper.setState(state);
        await instance.onPermissionsSettingsChange(event, changedPermissionsSettings);
        expect((wrapper.state() as any).profile.permissionsSettings.isLinkedInVisible).toEqual({
          mentor: false,
          student: false,
          all: false,
        });
        expect((wrapper.state() as any).isInitialPermissionsSettingsChanged).toBe(true);
      });
      it('if permissions for all roles were changed', async () => {
        const event = {
          target: {
            checked: true,
          },
        };
        const changedPermissionsSettings = {
          permissionName: 'isEducationVisible',
          role: 'all',
        };
        wrapper.setState(state);
        await instance.onPermissionsSettingsChange(event, changedPermissionsSettings);
        expect((wrapper.state() as any).profile.permissionsSettings.isEducationVisible).toEqual({
          mentor: true,
          student: true,
          all: true,
        });
        expect((wrapper.state() as any).isInitialPermissionsSettingsChanged).toBe(true);
      });
    });
  });
  describe('onProfileSettingsChange', () => {
    describe('Should set state correctly', () => {
      it('if "profile.generalInfo.location" was changed', async () => {
        const event = {
          countryName: 'USA',
          cityName: '51 zone',
        };
        const path = 'generalInfo.location';
        wrapper.setState(state);
        await instance.onProfileSettingsChange(event, path);
        expect((wrapper.state() as any).profile.generalInfo.location.countryName).toBe('USA');
        expect((wrapper.state() as any).profile.generalInfo.location.cityName).toBe('51 zone');
        expect((wrapper.state() as any).isInitialProfileSettingsChanged).toBe(true);
      });
      it('if "profile.generalInfo.englishLevel" was changed', async () => {
        const event = 'b2+';
        const path = 'generalInfo.englishLevel';
        wrapper.setState(state);
        await instance.onProfileSettingsChange(event, path);
        expect((wrapper.state() as any).profile.generalInfo.englishLevel).toBe('b2+');
      });
      it('if field added to "profile.generalInfo.educationHistory"', async () => {
        const event = {
          type: 'add',
        };
        const path = 'generalInfo.educationHistory';
        wrapper.setState(state);
        await instance.onProfileSettingsChange(event, path);
        expect((wrapper.state() as any).profile.generalInfo.educationHistory).toEqual([
          {
            graduationYear: '2019',
            faculty: 'TT',
            university: 'Test',
          },
          {
            graduationYear: null,
            faculty: null,
            university: null,
          },
        ]);
        expect((wrapper.state() as any).isInitialProfileSettingsChanged).toBe(true);
      });
      it('if field deleted from "profile.generalInfo.educationHistory"', async () => {
        const event = {
          type: 'delete',
          index: 0,
        };
        const path = 'generalInfo.educationHistory';
        wrapper.setState(state);
        await instance.onProfileSettingsChange(event, path);
        expect((wrapper.state() as any).profile.generalInfo.educationHistory).toEqual([]);
      });
      it('if some other field was changed', async () => {
        const event = {
          target: {
            value: 'Hello everyone, my name is Mike.',
          },
        };
        const path = 'generalInfo.aboutMyself';
        wrapper.setState(state);
        await instance.onProfileSettingsChange(event, path);
        expect((wrapper.state() as any).profile.generalInfo.aboutMyself).toEqual('Hello everyone, my name is Mike.');
        expect((wrapper.state() as any).isInitialProfileSettingsChanged).toBe(true);
      });
    });
  });
  describe('changeProfilePageMode', () => {
    describe('Should set state correctly', () => {
      it('if mode = "edit" was passed', async () => {
        const mode = 'edit';
        wrapper.setState({ ...state, isEditingModeEnabled: false });
        expect((wrapper.state() as any).isEditingModeEnabled).toBe(false);
        await instance.changeProfilePageMode(mode);
        expect((wrapper.state() as any).isEditingModeEnabled).toBe(true);
      });
      it('if mode = "view" was passed', async () => {
        const mode = 'view';
        wrapper.setState({ ...state, isEditingModeEnabled: true });
        expect((wrapper.state() as any).isEditingModeEnabled).toBe(true);
        await instance.changeProfilePageMode(mode);
        expect((wrapper.state() as any).isEditingModeEnabled).toBe(false);
      });
    });
  });
  describe('saveProfile', () => {
    it('Should set state correctly', async () => {
      const saveProfileMock = jest
        .spyOn(instance['userService'], 'saveProfileInfo')
        .mockImplementation(() => Promise.resolve());

      const profile = {
        generalInfo: {
          aboutMyself: 'Hello',
          educationHistory: [
            {
              graduationYear: '2019',
              faculty: 'TT',
              university: 'Test',
            },
          ],
          englishLevel: 'c1',
          locationId: 778,
          locationName: 'Hrodna',
        },
        contacts: {
          telegram: 'test',
        },
        permissionsSettings: {
          isProfileVisible: { all: true },
          isAboutVisible: { mentor: true, student: false, all: false },
          isEducationVisible: { mentor: true, student: false, all: false },
          isEnglishVisible: { student: true, all: true },
          isEmailVisible: { student: true, all: true },
          isTelegramVisible: { student: true, all: true },
          isSkypeVisible: { student: true, all: false },
          isPhoneVisible: { student: true, all: false },
          isContactsNotesVisible: { student: true, all: false },
          isLinkedInVisible: { mentor: true, student: false, all: false },
          isPublicFeedbackVisible: { mentor: true, student: true, all: false },
          isMentorStatsVisible: { mentor: true, student: true, all: false },
          isStudentStatsVisible: { student: false, all: false },
        },
      };
      wrapper.setState({
        ...state,
        profile,
        isInitialPermissionsSettingsChanged: true,
        isInitialProfileSettingsChanged: true,
      });

      await instance.saveProfile();
      expect((wrapper.state() as any).isSaving).toBe(false);
      expect((wrapper.state() as any).isInitialPermissionsSettingsChanged).toBe(false);
      expect((wrapper.state() as any).isInitialProfileSettingsChanged).toBe(false);
      expect((wrapper.state() as any).initialPermissionsSettings).toEqual(profile.permissionsSettings);
      expect((wrapper.state() as any).initialProfileSettings).toEqual(profile);
      saveProfileMock.mockReset();
    });
  });
  describe('hadStudentCoreJSInterview', () => {
    describe('Should return', () => {
      it('"true" if student has an "interviewFormAnswers" in one of the task', () => {
        const studentStats = [
          {
            courseFullName: 'test',
            courseName: 'test',
            locationName: 'Minsk',
            tasks: [
              {},
              {
                interviewFormAnswers: {},
              },
              {},
              {},
            ],
          },
        ];
        const result = instance.hadStudentCoreJSInterview(studentStats);
        expect(result).toBe(true);
      });
      it('"false" if student has not an "interviewFormAnswers" in one of the task', () => {
        const studentStats = [
          {
            courseFullName: 'test',
            courseName: 'test',
            locationName: 'Minsk',
            tasks: [{}, {}, {}],
          },
        ];
        const result = instance.hadStudentCoreJSInterview(studentStats);
        expect(result).toBe(false);
      });
    });
  });
  describe('getStudentCoreJSInterviews', () => {
    it('Should return info about CoreJS interviews', () => {
      const studentStats = [
        {
          courseFullName: 'test',
          courseName: 'test',
          locationName: 'Minsk',
          tasks: [
            {},
            {},
            {
              interviewer: {
                name: 'Dima Petrov',
                githubId: 'dip',
              },
              comment: 'Test',
              score: 9,
              interviewFormAnswers: {},
            },
            {},
          ],
        },
      ];
      const result = instance.getStudentCoreJSInterviews(studentStats);
      expect(result).toEqual([
        {
          courseFullName: 'test',
          courseName: 'test',
          interviews: [{
            answers: {},
            interviewer: {
              name: 'Dima Petrov',
              githubId: 'dip',
            },
            comment: 'Test',
            score: 9,
          }],
          locationName: 'Minsk',
        },
      ]);
    });
  });
});
