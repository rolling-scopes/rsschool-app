import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import PublicFeedbackCard from '../PublicFeedbackCard';

jest.mock('moment', () => (value: any) => ({
  format() {
    return value;
  },
  fromNow() {
    return 'fromNow';
  },
}));

describe('PublicFeedbackCard', () => {
  const data = [
    {
      feedbackDate: '2018-12-01T12:12:01.000Z',
      badgeId: 'Congratulations',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Petrov',
        githubId: 'apetr',
      },
    },
    {
      feedbackDate: '2018-11-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-09-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-10-01T11:12:01.000Z',
      badgeId: 'Great_speaker',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Artem Petrov',
        githubId: 'temap',
      },
    },
    {
      feedbackDate: '2018-11-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Anton Vasilyev',
        githubId: 'vasssa',
      },
    },
    {
      feedbackDate: '2019-12-01T12:12:01.000Z',
      badgeId: 'Thank_you',
      comment: 'Test',
      heroesUri: 'https://heroes.by/',
      fromUser: {
        name: 'Dima Alexandrov',
        githubId: 'demaa',
      },
    },
  ];

  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = shallow(
        <PublicFeedbackCard data={data} isEditingModeEnabled={false} onPermissionsSettingsChange={jest.fn()} />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = shallow(
        <PublicFeedbackCard data={data} isEditingModeEnabled={true} onPermissionsSettingsChange={jest.fn()} />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });

  const wrapper = shallow(
    <PublicFeedbackCard data={data} isEditingModeEnabled={true} onPermissionsSettingsChange={jest.fn()} />,
  );
  const instance: any = wrapper.instance();
  describe('showPublicFeedbackModal', () => {
    it('should set "state.isPublicFeedbackModalVisible" as "true"', () => {
      expect(instance.state.isPublicFeedbackModalVisible).toBe(false);
      instance.showPublicFeedbackModal();
      expect(instance.state.isPublicFeedbackModalVisible).toBe(true);
    });
  });
  describe('hidePublicFeedbackModal', () => {
    it('should set "state.isVisibilitySettingsVisible" as "false"', () => {
      instance.state.isPublicFeedbackModalVisible = true;
      expect(instance.state.isPublicFeedbackModalVisible).toBe(true);
      instance.hidePublicFeedbackModal();
      expect(instance.state.isPublicFeedbackModalVisible).toBe(false);
    });
  });
  describe('filterPermissions', () => {
    it('should left only "isProfileVisible" in "permissionsSettings" object', () => {
      const permissionsSettings = {
        isProfileVisible: { all: true },
        isAboutVisible: { all: true, mentor: true, student: true },
        isEducationVisible: { all: true, mentor: true, student: true },
        isEnglishVisible: { all: false, student: false },
        isEmailVisible: { all: true, student: true },
        isTelegramVisible: { all: false, student: false },
        isSkypeVisible: { all: true, student: true },
        isPhoneVisible: { all: false, student: false },
        isContactsNotesVisible: { all: true, student: true },
        isLinkedInVisible: { all: false, mentor: false, student: false },
        isPublicFeedbackVisible: { all: true, mentor: true, student: true },
        isMentorStatsVisible: { all: true, mentor: true, student: true },
        isStudentStatsVisible: { all: true, student: true },
      };
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isPublicFeedbackVisible: { all: true, mentor: true, student: true },
      });
    });
  });
  describe('countBadges', () => {
    it('should return object with number of badges for each type', () => {
      const result = instance.countBadges();

      expect(result).toEqual({
        Congratulations: 1,
        Great_speaker: 3,
        Thank_you: 2,
      });
    });
  });
});
