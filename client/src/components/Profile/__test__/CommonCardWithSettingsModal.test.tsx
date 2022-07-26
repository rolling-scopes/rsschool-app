import React from 'react';
import { render } from '@testing-library/react';
import CommonCardWithSettingsModal from '../CommonCardWithSettingsModal';

describe('CommonCardWithSettingsModal', () => {
  describe('Should render correctly', () => {
    it('if just basic props is present', () => {
      const output = render(
        <CommonCardWithSettingsModal
          title="Test"
          icon={<i>Icon</i>}
          content={<p>Card body</p>}
          profileSettingsContent={<div>Settings content</div>}
          isEditingModeEnabled={true}
          saveProfile={jest.fn()}
          cancelChanges={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
    it('if is null content passed and editing mode is disabled', () => {
      const output = render(
        <CommonCardWithSettingsModal
          title="Test"
          icon={<i>Icon</i>}
          content={null}
          profileSettingsContent={<div>Settings content</div>}
          isEditingModeEnabled={false}
          saveProfile={jest.fn()}
          cancelChanges={jest.fn()}
        />,
      );
      expect(output.container).toMatchSnapshot();
    });
  });
});
