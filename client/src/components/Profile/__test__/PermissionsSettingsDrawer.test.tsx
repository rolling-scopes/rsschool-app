import React from 'react';
import { render } from '@testing-library/react';
import PermissionsSettingsDrawer from '../PermissionsSettingsDrawer';

describe('PermissionsSettingsDrawer', () => {
  it('Should render correctly', () => {
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
    const output = render(
      <PermissionsSettingsDrawer
        isSettingsVisible={true}
        hideSettings={jest.fn()}
        permissionsSettings={permissionsSettings}
        onPermissionsSettingsChange={jest.fn()}
      />,
    );
    expect(output.container).toMatchSnapshot();
  });
});
