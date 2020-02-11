import React from 'react';
import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import EducationCard from '../EducationCard';
import { GeneralInfo } from '../../../../../common/models/profile';

describe('EducationCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const wrapper = mount(<EducationCard
        data={{
          educationHistory: [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }],
        } as GeneralInfo}
        isEditingModeEnabled={false}
        onPermissionsSettingsChange={() => {}}
        onProfileSettingsChange={() => {}}
      />);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const wrapper = mount(<EducationCard
        data={{
          educationHistory: [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }],
        } as GeneralInfo}
        isEditingModeEnabled={true}
        onPermissionsSettingsChange={() => {}}
        onProfileSettingsChange={() => {}}
      />);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
    it('if "educationHistory" has element with "null" values', () => {
      const wrapper = mount(<EducationCard
        data={{
          educationHistory: [{ graduationYear: null, faculty: null, university: null }],
        } as GeneralInfo}
        isEditingModeEnabled={true}
        onPermissionsSettingsChange={() => {}}
        onProfileSettingsChange={() => {}}
      />);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
    it('if "educationHistory" is empty', () => {
      const wrapper = shallow(<EducationCard
        data={{
          educationHistory: [],
        } as GeneralInfo}
        isEditingModeEnabled={false}
        onPermissionsSettingsChange={() => {}}
        onProfileSettingsChange={() => {}}
      />);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
  });

  describe('filterPermissions', () => {
    it('should left only contacts in "permissionsSettings" object', () => {
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
        <EducationCard
          data={{
            educationHistory: [{ graduationYear: 2002, faculty: 'POIT', university: 'MIT' }],
          } as GeneralInfo}
          isEditingModeEnabled={false}
          permissionsSettings={permissionsSettings}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />);
      const instance = wrapper.instance();
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isEducationVisible: { all: true, mentor: true, student: true },
      });
    });
  });
});
