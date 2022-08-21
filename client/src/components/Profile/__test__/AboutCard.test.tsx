import React from 'react';
import { render } from '@testing-library/react';
import AboutCard, { filterPermissions } from '../AboutCard';
import { GeneralInfo } from 'common/models/profile';

describe('AboutCard', () => {
  describe('Should render correctly', () => {
    it('if "aboutMyself" is present', () => {
      const output = render(
        <AboutCard
          data={
            {
              aboutMyself: 'Top contributor of Rolling Scopes',
            } as GeneralInfo
          }
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
    it('if "aboutMyself" is not present', () => {
      const output = render(
        <AboutCard
          data={{} as GeneralInfo}
          isEditingModeEnabled={false}
          onPermissionsSettingsChange={jest.fn()}
          onProfileSettingsChange={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
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
      const result = filterPermissions(permissionsSettings);
      expect(result).toEqual({
        isAboutVisible: {
          all: true,
          mentor: true,
          student: true,
        },
      });
    });
  });
});
