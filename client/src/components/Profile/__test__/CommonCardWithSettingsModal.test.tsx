import React from 'react';
import { render } from '@testing-library/react';
import CommonCardWithSettingsModal from '../CommonCardWithSettingsModal';

describe('CommonCardWithSettingsModal', () => {
  describe('Should render correctly', () => {
    it('if just basic props are present', () => {
      const { container } = render(
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
      expect(container).toMatchSnapshot();
    });
    it('if null content is passed and editing mode is disabled', () => {
      const { container } = render(
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
      expect(container).toMatchSnapshot();
    });
  });
});
