import React from 'react';
import { mount, shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import ContactsCard from '../ContactsCard';
import { Contacts } from '../../../../../common/models/profile';

describe('ContactsCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const wrapper = mount(<ContactsCard
        data={{
          phone: '1232422',
          email: 'vasya@tut.by',
          skype: 'skype_vasya',
          telegram: 'televasya',
          notes: 'vasya',
        }}
        isEditingModeEnabled={false}
        onPermissionsSettingsChange={() => {}}
        onProfileSettingsChange={() => {}}
      />);
      expect(shallowToJson(wrapper)).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const wrapper = mount(<ContactsCard
        data={{
          phone: '1232422',
          email: 'vasya@tut.by',
          skype: 'skype_vasya',
          telegram: null,
          notes: null,
        }}
        isEditingModeEnabled={true}
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
        <ContactsCard
          data={{} as Contacts}
          isEditingModeEnabled={false}
          permissionsSettings={permissionsSettings}
          onPermissionsSettingsChange={() => {}}
          onProfileSettingsChange={() => {}}
        />);
      const instance = wrapper.instance();
      const result = instance.filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isEmailVisible: { all: true, student: true },
        isTelegramVisible: { all: false, student: false },
        isSkypeVisible: { all: true, student: true },
        isPhoneVisible: { all: false, student: false },
        isContactsNotesVisible: { all: true, student: true },
        isLinkedInVisible: { all: false, mentor: false, student: false },
      });
    });
  });
});
