import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import MainCard from '../MainCard';

// TODO: Known Issue: https://stackoverflow.com/questions/59942808/how-can-i-use-jest-coverage-in-next-js-styled-jsx

describe('MainCard', () => {
  describe('Should render correctly', () => {
    it('if is editing mode disabled', () => {
      const output = shallow(
        <MainCard
          data={{
            name: 'Petr Pervyi',
            githubId: 'piter',
            locationName: 'SPB',
            locationId: '1',
          }}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if is editing mode enabled', () => {
      const output = shallow(
        <MainCard
          data={{
            name: 'Petr Pervyi',
            githubId: 'piter',
            locationName: 'SPB',
            locationId: '1',
          }}
          isEditingModeEnabled={true}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });

  const wrapper = shallow(
    <MainCard
      data={{
        name: 'Petr Pervyi',
        githubId: 'piter',
        locationName: 'SPB',
        locationId: '1',
      }}
      isEditingModeEnabled={false}
      onPermissionsSettingsChange={() => {}}
      onProfileSettingsChange={() => {}}
    />);
  const instance = wrapper.instance();
  describe('showVisibilitySettings', () => {
    it('should set "state.isVisibilitySettingsVisible" as "true"', () => {
      expect(instance.state.isVisibilitySettingsVisible).toBe(false);
      instance.showVisibilitySettings();
      expect(instance.state.isVisibilitySettingsVisible).toBe(true);
    });
  });
  describe('hideVisibilitySettings', () => {
    it('should set "state.isVisibilitySettingsVisible" as "false"', () => {
      instance.state.isVisibilitySettingsVisible = true;
      expect(instance.state.isVisibilitySettingsVisible).toBe(true);
      instance.hideVisibilitySettings();
      expect(instance.state.isVisibilitySettingsVisible).toBe(false);
    });
  });
  describe('showProfileSettings', () => {
    it('should set "state.isProfileSettingsVisible" as "true"', () => {
      expect(instance.state.isProfileSettingsVisible).toBe(false);
      instance.showProfileSettings();
      expect(instance.state.isProfileSettingsVisible).toBe(true);
    });
  });
  describe('hideProfileSettings', () => {
    it('should set "state.isProfileSettingsVisible" as "false"', () => {
      instance.state.isProfileSettingsVisible = true;
      expect(instance.state.isProfileSettingsVisible).toBe(true);
      instance.hideProfileSettings();
      expect(instance.state.isProfileSettingsVisible).toBe(false);
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
      const instance = wrapper.instance();
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isProfileVisible: { all: true },
      });
    });
  });
});
