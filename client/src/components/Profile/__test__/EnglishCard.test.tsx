import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import EnglishCard from '../EnglishCard';
import { GeneralInfo } from 'common/models/profile';

describe('EnglishCard', () => {
  describe('Should render correctly', () => {
    it('if "englishLevel" is present', () => {
      const output = shallow(
        <EnglishCard
          data={
            {
              englishLevel: 'a2',
            } as GeneralInfo
          }
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
    it('if "aboutMyself" is not present', () => {
      const output = shallow(
        <EnglishCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(shallowToJson(output)).toMatchSnapshot();
    });
  });
  describe('filterPermissions', () => {
    it('should left only "isAboutVisible" in "permissionsSettings" object', () => {
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
      const wrapper = shallow(
        <EnglishCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          permissionsSettings={permissionsSettings}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      const instance: any = wrapper.instance();
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isEnglishVisible: { all: false, student: false },
      });
    });
  });
});
