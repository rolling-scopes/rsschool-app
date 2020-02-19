import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import MentorStatsCard from '../MentorStatsCard';

describe('MentorStatsCard', () => {
  const mentorStats = [
    {
      courseName: 'rs-2020-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2020-Q1',
    },
    {
      courseName: 'rs-2018-q1',
      locationName: 'Minsk',
      courseFullName: 'Rolling Scopes School 2018-Q1',
      students: [
        {
          githubId: 'alex',
          name: 'Alex Petrov',
          isExpelled: false,
          totalScore: 3453,
        },
        {
          githubId: 'vasya',
          name: 'Vasiliy Alexandrov',
          isExpelled: true,
          totalScore: 120,
        },
      ],
    },
  ];
  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = shallow(
        <MentorStatsCard data={mentorStats} isEditingModeEnabled={false} onPermissionsSettingsChange={jest.fn()} />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = shallow(
        <MentorStatsCard data={mentorStats} isEditingModeEnabled={true} onPermissionsSettingsChange={jest.fn()} />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });

  const wrapper = shallow(
    <MentorStatsCard data={mentorStats} isEditingModeEnabled={false} onPermissionsSettingsChange={jest.fn()} />,
  );
  const instance: any = wrapper.instance();
  describe('showMentorStatsModal', () => {
    it('should set "state.isMentorStatsModalVisible" as "true", "state.courseIndex" as index was passed', () => {
      expect(instance.state.isMentorStatsModalVisible).toBe(false);
      expect(instance.state.courseIndex).toBe(0);
      instance.showMentorStatsModal(1);
      expect(instance.state.isMentorStatsModalVisible).toBe(true);
      expect(instance.state.courseIndex).toBe(1);
    });
  });
  describe('hideMentortStatsModal', () => {
    it('should set "state.isMentorStatsModalVisible" as "false"', () => {
      instance.state.isMentorStatsModalVisible = true;
      expect(instance.state.isMentorStatsModalVisible).toBe(true);
      instance.hideMentortStatsModal();
      expect(instance.state.isMentorStatsModalVisible).toBe(false);
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
      const instance: any = wrapper.instance();
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isMentorStatsVisible: { all: true, mentor: true, student: true },
      });
    });
  });
});
