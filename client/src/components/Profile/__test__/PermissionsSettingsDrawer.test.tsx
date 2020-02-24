import React from 'react';
import { mount } from 'enzyme';
import { mountToJson } from 'enzyme-to-json';
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
    const output = mount(
      <PermissionsSettingsDrawer
        isSettingsVisible={true}
        hideSettings={jest.fn()}
        permissionsSettings={permissionsSettings}
        onPermissionsSettingsChange={jest.fn()}
      />,
    );
    expect(mountToJson(output)).toMatchSnapshot();
  });
});
