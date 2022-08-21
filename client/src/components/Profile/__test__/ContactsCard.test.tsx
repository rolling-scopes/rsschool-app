import React from 'react';
import { render } from '@testing-library/react';
import ContactsCard, { filterPermissions } from '../ContactsCard';

describe('ContactsCard', () => {
  describe('Should render correctly', () => {
    it('if editing mode is disabled', () => {
      const wrapper = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: 'televasya',
            notes: 'vasya',
            linkedIn: 'http://linkedin_test.com/vasya',
          }}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          isDataPendingSave={false}
        />,
      );
      expect(wrapper.container).toMatchSnapshot();
    });
    it('if editing mode is enabled', () => {
      const wrapper = render(
        <ContactsCard
          data={{
            epamEmail: 'vasya@epam.com',
            phone: '1232422',
            email: 'vasya@tut.by',
            skype: 'skype_vasya',
            telegram: null,
            notes: null,
            linkedIn: null,
          }}
          isEditingModeEnabled={true}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
          sendConfirmationEmail={jest.fn()}
          connections={{}}
          isDataPendingSave={false}
        />,
      );
      expect(wrapper.container).toMatchSnapshot();
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
      const result = filterPermissions(permissionsSettings);
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
